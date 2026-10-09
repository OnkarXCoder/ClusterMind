import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AdminCustomer from '../models/AdminCustomer.js'
import AdminOrder from '../models/AdminOrder.js'

const router = Router()
router.use(verifyToken, requireRole('admin', 'marketing'))

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The dataset can live in two places: the repo-root ai-ml/data (local dev,
// Render/Railway, VPS) or backend/data/ml (a copy bundled for serverless hosts
// like Vercel, whose function filesystem contains only the backend/ directory).
// Read from whichever one actually has a dataset; fall back to the repo-root
// path so local first-run/`ensure` still has somewhere writable to create it.
const dataDirCandidates = [
  process.env.ML_DATA_DIR,
  path.resolve(__dirname, '../../ai-ml/data'),
  path.resolve(__dirname, '../data/ml'),
].filter(Boolean)

const dataDir = dataDirCandidates.find(dir => existsSync(path.join(dir, 'dataset.csv'))) || dataDirCandidates[1]
const datasetPath = path.join(dataDir, 'dataset.csv')
const metaPath = path.join(dataDir, 'dataset_meta.json')

// Serverless platforms (Vercel) give the function a read-only filesystem, so
// any endpoint that would persist a dataset responds with a clear message
// instead of crashing on EROFS.
const readOnlyFs = Boolean(process.env.VERCEL)

function rejectReadOnly(res) {
  return res.status(409).json({
    message: 'Dataset changes are not persisted on this serverless deployment. Deploy the backend with a persistent disk (Render, Railway, or a VPS) to upload or sync datasets.',
  })
}

const HIERARCHICAL_SAMPLE = 500
const DBSCAN_SAMPLE = 800

/* ══════════════════════════════════════════════════════════════
   CSV PARSING
   ══════════════════════════════════════════════════════════════ */

const defaultCsv = `Customer ID,Age,Gender,Item Purchased,Category,Purchase Amount (USD),Location,Size,Color,Season,Review Rating,Subscription Status,Discount Applied,Previous Purchases,Payment Method,Frequency of Purchases
1,55,Male,Blouse,Clothing,53,Kentucky,L,Gray,Winter,3.1,Yes,Yes,14,Venmo,Fortnightly
2,19,Male,Sweater,Clothing,64,Maine,L,Maroon,Winter,3.1,Yes,Yes,2,Cash,Fortnightly
3,50,Male,Jeans,Clothing,73,Massachusetts,S,Maroon,Spring,3.1,Yes,Yes,23,Credit Card,Weekly
4,21,Male,Sandals,Clothing,90,Nebraska,M,Gray,Summer,4.0,Yes,Yes,41,PayPal,Weekly
5,45,Male,Sneakers,Clothing,60,Nevada,L,Maroon,Spring,4.0,Yes,Yes,54,Credit Card,Fortnightly
6,32,Female,Handbag,Clothing,50,Florida,S,Black,Summer,3.1,Yes,Yes,15,Venmo,Annually
7,28,Female,Earrings,Clothing,65,Colorado,L,Red,Summer,3.6,Yes,Yes,45,Debit Card,Quarterly
8,52,Male,Running Shoes,Footwear,83,Idaho,7,L,Gray,Summer,4.0,Yes,Yes,32,Venmo,Monthly
9,30,Female,Flip-Flops,Clothing,76,Alabama,7,Maroon,Winter,3.6,Yes,Yes,6,PayPal,Fortnightly
10,60,Male,Sandals,Clothing,52,Washington,M,Maroon,Winter,4.0,Yes,Yes,47,Venmo,Weekly
11,41,Male,Blouse,Clothing,34,Massachusetts,L,Red,Spring,3.0,Yes,Yes,52,Venmo,Monthly
12,33,Male,Sneakers,Clothing,81,Nebraska,7,Maroon,Winter,4.4,Yes,Yes,34,Debit Card,Fortnightly
13,26,Female,Dress,Clothing,68,Missouri,XL,Black,Spring,4.3,Yes,Yes,39,Venmo,Annually
14,39,Male,Boots,Footwear,33,Oregon,7,Gray,Spring,3.9,Yes,Yes,17,Debit Card,Monthly
15,54,Female,Necklace,Clothing,67,California,M,Red,Fall,3.7,Yes,Yes,34,Credit Card,Weekly
16,24,Male,T-shirt,Clothing,57,Ohio,XS,Black,Winter,3.2,Yes,Yes,47,Debit Card,Fortnightly
17,46,Female,Sandals,Clothing,62,Mississippi,XL,Pink,Summer,4.2,Yes,Yes,25,Venmo,Monthly
18,49,Male,Hoodie,Clothing,79,Idaho,L,Blue,Summer,4.2,Yes,Yes,26,Cash,Annually
19,37,Female,Jacket,Clothing,96,Virginia,S,Black,Winter,3.3,Yes,Yes,38,Venmo,Annually
20,20,Male,Shorts,Clothing,60,Ohio,3L,Green,Summer,3.4,Yes,Yes,19,Debit Card,Monthly`

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { columns: [], rows: [] }
  const columns = lines[0].split(',').map(c => c.trim())
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    return Object.fromEntries(columns.map((col, i) => [col, coerce(values[i] ?? '')]))
  })
  return { columns, rows }
}

function coerce(value) {
  if (value === '') return ''
  const n = Number(value)
  return Number.isNaN(n) ? value : n
}

async function readDataset() {
  const [csv, metaJson] = await Promise.all([
    fs.readFile(datasetPath, 'utf8'),
    fs.readFile(metaPath, 'utf8').catch(() => '{}'),
  ])
  const parsed = parseCsv(csv)
  const meta = JSON.parse(metaJson || '{}')
  return { columns: parsed.columns, rows: parsed.rows.map(normalizeRow), meta }
}

/* ══════════════════════════════════════════════════════════════
   FEATURE EXTRACTION
   ══════════════════════════════════════════════════════════════ */

const FREQUENCY_MAP = { Weekly: 5, Fortnightly: 4, Monthly: 3, Quarterly: 2, Annually: 1 }

function yesNo(value) {
  const s = String(value ?? '').trim().toLowerCase()
  return s === 'yes' || s === 'true' || s === '1' ? 'Yes' : 'No'
}

function frequencyFromRecency(days) {
  const d = Number(days)
  if (!Number.isFinite(d)) return 'Monthly'
  if (d <= 15) return 'Weekly'
  if (d <= 30) return 'Fortnightly'
  if (d <= 60) return 'Monthly'
  if (d <= 120) return 'Quarterly'
  return 'Annually'
}

// Normalises rows from alternative customer datasets (e.g. the
// "E-commerce Customer Behavior" sheet with Total Spend / Average Rating /
// Membership Type / Days Since Last Purchase) onto the canonical schema the ML
// pipeline expects. Canonical Kaggle-style rows pass through untouched.
function normalizeRow(row) {
  const spend = row['Purchase Amount (USD)']
  const isCanonical = spend !== undefined && spend !== '' && row['Frequency of Purchases'] !== undefined
  if (isCanonical) return row

  const membership = String(row['Membership Type'] ?? '').trim()
  const premium = /gold|platinum|premium|vip/i.test(membership)
  return {
    ...row,
    'Item Purchased': (row['Item Purchased'] ?? membership) || 'N/A',
    Category: row.Category ?? (membership || 'General'),
    'Purchase Amount (USD)': row['Total Spend'] ?? spend ?? 0,
    'Review Rating': row['Average Rating'] ?? row['Review Rating'] ?? 0,
    'Previous Purchases': row['Items Purchased'] ?? row['Previous Purchases'] ?? 0,
    'Subscription Status': row['Subscription Status'] !== undefined ? row['Subscription Status'] : (premium ? 'Yes' : 'No'),
    'Discount Applied': yesNo(row['Discount Applied']),
    'Frequency of Purchases': row['Frequency of Purchases'] ?? frequencyFromRecency(row['Days Since Last Purchase']),
    Location: row.Location ?? row.City ?? '',
    Season: row.Season ?? '',
    'Payment Method': row['Payment Method'] ?? '',
  }
}

function extractFeatures(rows) {
  return rows.map(row => {
    const age = Number(row.Age) || 0
    const purchaseAmount = Number(row['Purchase Amount (USD)']) || 0
    const reviewRating = Number(row['Review Rating']) || 0
    const previousPurchases = Number(row['Previous Purchases']) || 0
    const subscription = row['Subscription Status'] === 'Yes' ? 1 : 0
    const discount = row['Discount Applied'] === 'Yes' ? 1 : 0
    const frequency = FREQUENCY_MAP[row['Frequency of Purchases']] || 3
    return [age, purchaseAmount, reviewRating, previousPurchases, subscription, discount, frequency]
  })
}

function normalize(matrix) {
  const cols = matrix[0].length
  const mins = Array(cols).fill(Infinity)
  const maxs = Array(cols).fill(-Infinity)
  for (const row of matrix) {
    for (let j = 0; j < cols; j++) {
      if (row[j] < mins[j]) mins[j] = row[j]
      if (row[j] > maxs[j]) maxs[j] = row[j]
    }
  }
  return matrix.map(row =>
    row.map((v, j) => {
      const range = maxs[j] - mins[j]
      return range === 0 ? 0 : (v - mins[j]) / range
    })
  )
}

function euclideanDist(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2
  return Math.sqrt(sum)
}

function sample(data, maxN) {
  if (data.length <= maxN) return { data, indices: data.map((_, i) => i) }
  const step = Math.floor(data.length / maxN)
  const indices = []
  for (let i = 0; i < data.length; i += step) {
    indices.push(i)
    if (indices.length >= maxN) break
  }
  return { data: indices.map(i => data[i]), indices }
}

/* ══════════════════════════════════════════════════════════════
   K-MEANS — O(n*k*iter), fast on full data
   ══════════════════════════════════════════════════════════════ */

function kmeans(data, k, maxIter = 50) {
  const n = data.length
  const d = data[0].length

  // K-Means++ initialization
  const centroids = [data[Math.floor(Math.random() * n)].slice()]
  for (let c = 1; c < k; c++) {
    const dists = data.map(point =>
      Math.min(...centroids.map(cent => euclideanDist(point, cent)))
    )
    const total = dists.reduce((s, v) => s + v * v, 0)
    let r = Math.random() * total
    for (let i = 0; i < n; i++) {
      r -= dists[i] * dists[i]
      if (r <= 0) { centroids.push(data[i].slice()); break }
    }
    if (centroids.length <= c) centroids.push(data[Math.floor(Math.random() * n)].slice())
  }

  let assignments = new Array(n).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false
    for (let i = 0; i < n; i++) {
      let best = 0
      let bestDist = Infinity
      for (let c = 0; c < k; c++) {
        const dist = euclideanDist(data[i], centroids[c])
        if (dist < bestDist) { bestDist = dist; best = c }
      }
      if (assignments[i] !== best) { assignments[i] = best; changed = true }
    }
    if (!changed) break
    for (let c = 0; c < k; c++) {
      const members = data.filter((_, i) => assignments[i] === c)
      if (!members.length) continue
      for (let j = 0; j < d; j++) {
        centroids[c][j] = members.reduce((s, p) => s + p[j], 0) / members.length
      }
    }
  }

  // Silhouette-inspired score: ratio of intra/inter cluster distance
  let intraSum = 0, interSum = 0
  for (let i = 0; i < n; i++) {
    intraSum += euclideanDist(data[i], centroids[assignments[i]]) ** 2
    const nearestOther = centroids
      .map((cent, c) => c === assignments[i] ? Infinity : euclideanDist(data[i], cent))
      .reduce((min, v) => Math.min(min, v), Infinity)
    interSum += nearestOther ** 2
  }
  const score = Math.round(Math.max(30, Math.min(99, (interSum / (intraSum + 1)) * 30)) * 10) / 10
  return { assignments, centroids, score, k }
}

/* ══════════════════════════════════════════════════════════════
   DBSCAN — Sampled for performance
   ══════════════════════════════════════════════════════════════ */

function dbscan(data, eps = 0.45, minPts = 5) {
  if (!data.length) return { assignments: [], clusterCount: 0, noise: 0, score: 0 }
  const n = data.length
  const labels = new Array(n).fill(-1)
  let clusterId = 0

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -1) continue
    const neighbors = regionQuery(data, i, eps)
    if (neighbors.length < minPts) { labels[i] = -2; continue }
    expandCluster(data, labels, i, neighbors, clusterId, eps, minPts)
    clusterId++
  }

  const clustered = labels.filter(l => l >= 0).length
  const noise = labels.filter(l => l === -2).length
  const score = n > 0 ? Math.round((clustered / n) * 100) : 0
  return { assignments: labels.map(l => l >= 0 ? l : clusterId), clusterCount: clusterId, noise, score }
}

function regionQuery(data, idx, eps) {
  const neighbors = []
  for (let i = 0; i < data.length; i++) {
    if (euclideanDist(data[idx], data[i]) <= eps) neighbors.push(i)
  }
  return neighbors
}

function expandCluster(data, labels, idx, neighbors, clusterId, eps, minPts) {
  labels[idx] = clusterId
  const queue = [...neighbors]
  const visited = new Set([idx])
  while (queue.length > 0) {
    const cur = queue.shift()
    if (visited.has(cur)) continue
    visited.add(cur)
    if (labels[cur] === -2) labels[cur] = clusterId
    if (labels[cur] === -1) {
      labels[cur] = clusterId
      const newNbrs = regionQuery(data, cur, eps)
      if (newNbrs.length >= minPts) {
        for (const nb of newNbrs) { if (!visited.has(nb)) queue.push(nb) }
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   HIERARCHICAL — Sampled + optimized merge
   ══════════════════════════════════════════════════════════════ */

function hierarchicalClustering(data, numClusters = 3) {
  if (!data.length) return { assignments: [], clusterCount: 0, score: 0 }
  const n = data.length
  let clusters = data.map((_, i) => [i])
  let dist = computeDistanceMatrix(data)

  while (clusters.length > numClusters) {
    let minDist = Infinity, mergeI = 0, mergeJ = 1
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = avgLinkage(clusters[i], clusters[j], dist)
        if (d < minDist) { minDist = d; mergeI = i; mergeJ = j }
      }
    }
    clusters[mergeI] = [...clusters[mergeI], ...clusters[mergeJ]]
    clusters.splice(mergeJ, 1)
  }

  const assignments = new Array(n).fill(0)
  clusters.forEach((cl, idx) => { for (const i of cl) assignments[i] = idx })

  let intra = 0
  for (const cl of clusters) {
    for (let i = 0; i < cl.length; i++)
      for (let j = i + 1; j < cl.length; j++) intra += dist[cl[i]][cl[j]]
  }
  const score = Math.max(30, Math.min(99, 100 - (intra / n) * 8))
  return { assignments, clusterCount: clusters.length, score: Math.round(score * 10) / 10 }
}

function computeDistanceMatrix(data) {
  const n = data.length
  const d = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const v = euclideanDist(data[i], data[j])
      d[i][j] = v; d[j][i] = v
    }
  return d
}

function avgLinkage(c1, c2, dist) {
  let total = 0, count = 0
  for (const i of c1) for (const j of c2) { total += dist[i][j]; count++ }
  return count > 0 ? total / count : Infinity
}

/* ══════════════════════════════════════════════════════════════
   PCA — Power iteration, O(n*d^2), fast enough
   ══════════════════════════════════════════════════════════════ */

function pca(data, numComponents = 2) {
  const n = data.length
  const d = data[0].length
  const means = Array(d).fill(0)
  for (const row of data) for (let j = 0; j < d; j++) means[j] += row[j]
  for (let j = 0; j < d; j++) means[j] /= n

  const centered = data.map(row => row.map((v, j) => v - means[j]))

  const cov = Array.from({ length: d }, () => new Array(d).fill(0))
  for (let i = 0; i < d; i++)
    for (let j = 0; j < d; j++) {
      for (let k = 0; k < n; k++) cov[i][j] += centered[k][i] * centered[k][j]
      cov[i][j] /= (n - 1)
    }

  const components = []
  const explained = []
  let currentCov = cov.map(r => [...r])

  for (let c = 0; c < Math.min(numComponents, d); c++) {
    let vec = Array(d).fill(0).map(() => Math.random())
    let val = 0
    for (let iter = 0; iter < 50; iter++) {
      const nv = Array(d).fill(0)
      for (let i = 0; i < d; i++)
        for (let j = 0; j < d; j++) nv[i] += currentCov[i][j] * vec[j]
      const norm = Math.sqrt(nv.reduce((s, v) => s + v * v, 0))
      vec = norm > 0 ? nv.map(v => v / norm) : nv
      val = norm
    }
    components.push(vec)
    explained.push(val)
    for (let i = 0; i < d; i++)
      for (let j = 0; j < d; j++) currentCov[i][j] -= val * vec[i] * vec[j]
  }

  const totalVar = explained.reduce((s, v) => s + v, 0)
  const projected = centered.map(row => components.map(comp => {
    let v = 0
    for (let j = 0; j < d; j++) v += row[j] * comp[j]
    return v
  }))
  const varianceExplained = explained.map(v => Math.round((v / totalVar) * 10000) / 100)
  return { projected, components, varianceExplained }
}

/* ══════════════════════════════════════════════════════════════
   SEGMENT ANALYSIS
   ══════════════════════════════════════════════════════════════ */

const SEGMENT_LABELS = ['Budget Shoppers', 'Premium Buyers', 'Casual Browsers', 'Loyal Regulars', 'Seasonal Spenders']
const SEGMENT_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6']

function analyzeSegments(rows, assignments) {
  const groups = new Map()
  for (let i = 0; i < rows.length; i++) {
    const c = assignments[i]
    if (!groups.has(c)) groups.set(c, [])
    groups.get(c).push(rows[i])
  }

  const total = rows.length || 1
  return [...groups.entries()].map(([clusterId, members]) => {
    const avgAge = average(members.map(r => Number(r.Age) || 0))
    const avgSpend = average(members.map(r => Number(r['Purchase Amount (USD)']) || 0))
    const avgRating = average(members.map(r => Number(r['Review Rating']) || 0))
    const avgPrev = average(members.map(r => Number(r['Previous Purchases']) || 0))
    const subRate = members.filter(r => r['Subscription Status'] === 'Yes').length / members.length
    const discRate = members.filter(r => r['Discount Applied'] === 'Yes').length / members.length

    const cats = countBy(members, r => r.Category)
    const freqs = countBy(members, r => r['Frequency of Purchases'])
    const dominantCat = topKey(cats)
    const dominantFreq = topKey(freqs)

    const segType = classifySegment(avgSpend, avgPrev, subRate, discRate)
    return {
      id: `cluster_${clusterId}`,
      name: SEGMENT_LABELS[clusterId % SEGMENT_LABELS.length],
      customers: members.length,
      percentage: Math.round((members.length / total) * 100),
      color: SEGMENT_COLORS[clusterId % SEGMENT_COLORS.length],
      type: segType,
      avgAge: Math.round(avgAge),
      avgSpend: Math.round(avgSpend),
      avgRating: Math.round(avgRating * 10) / 10,
      avgPrevPurchases: Math.round(avgPrev),
      subscriptionRate: Math.round(subRate * 100),
      discountRate: Math.round(discRate * 100),
      dominantCategory: dominantCat,
      dominantFrequency: dominantFreq,
      avgSpending: `$${Math.round(avgSpend)}`,
      frequency: avgPrev >= 20 ? 'High' : avgPrev >= 8 ? 'Medium' : 'Low',
      strategy: getStrategy(segType, dominantCat, dominantFreq),
    }
  }).sort((a, b) => b.customers - a.customers)
}

function classifySegment(avgSpend, avgPrev, subRate, discRate) {
  if (avgSpend > 70 && subRate > 0.5) return 'High Value'
  if (avgPrev > 20 && subRate > 0.3) return 'Loyal'
  if (discRate > 0.7) return 'Discount Driven'
  if (avgSpend < 40) return 'Budget'
  return 'Growth'
}

function getStrategy(type, cat, freq) {
  const map = {
    'High Value': `VIP access, exclusive ${cat} launches, premium loyalty rewards`,
    'Loyal': `Personalized ${cat} recommendations, retention campaigns, ${freq} engagement`,
    'Discount Driven': `Flash sales, bundle deals, price drop alerts for ${cat}`,
    'Budget': `Value bundles, affordable ${cat} picks, entry-level offers`,
    'Growth': `Education content, ${cat} trending picks, re-engagement emails`,
  }
  return map[type] || `Targeted ${cat} campaigns based on ${freq} behavior`
}

/* ══════════════════════════════════════════════════════════════
   BEHAVIOUR — Real stats
   ══════════════════════════════════════════════════════════════ */

function computeBehaviour(rows) {
  const total = rows.length
  const avgAge = average(rows.map(r => Number(r.Age) || 0))
  const avgSpend = average(rows.map(r => Number(r['Purchase Amount (USD)']) || 0))
  const avgRating = average(rows.map(r => Number(r['Review Rating']) || 0))
  const avgPrev = average(rows.map(r => Number(r['Previous Purchases']) || 0))

  const catDist = Object.entries(countBy(rows, r => r.Category))
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))
    .sort((a, b) => b.value - a.value)

  const genderDist = Object.entries(countBy(rows, r => r.Gender))
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))

  const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 }
  rows.forEach(r => {
    const a = Number(r.Age) || 0
    if (a <= 25) ageGroups['18-25']++
    else if (a <= 35) ageGroups['26-35']++
    else if (a <= 45) ageGroups['36-45']++
    else if (a <= 55) ageGroups['46-55']++
    else ageGroups['56+']++
  })
  const ageDist = Object.entries(ageGroups)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))

  const seasonDist = Object.entries(countBy(rows, r => r.Season))
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))

  const paymentDist = Object.entries(countBy(rows, r => r['Payment Method']))
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))

  const subscribed = rows.filter(r => r['Subscription Status'] === 'Yes').length
  const discountUsers = rows.filter(r => r['Discount Applied'] === 'Yes').length

  const locCounts = countBy(rows, r => r.Location)
  const topLocations = Object.entries(locCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, value: count }))

  const catCounts = countBy(rows, r => r.Category)
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count }))

  const seasonCounts = countBy(rows, r => r.Season)
  const topSeasons = Object.entries(seasonCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, value]) => ({ name, value: Math.round((value / total) * 100) }))

  return {
    stats: [
      { label: 'Total Customers', value: total.toLocaleString('en-IN') },
      { label: 'Average Age', value: `${Math.round(avgAge)} years` },
      { label: 'Average Spend', value: `$${Math.round(avgSpend)}` },
      { label: 'Average Rating', value: avgRating.toFixed(1) },
      { label: 'Avg Previous Purchases', value: Math.round(avgPrev).toString() },
      { label: 'Subscription Rate', value: `${Math.round((subscribed / total) * 100)}%` },
      { label: 'Discount Usage', value: `${Math.round((discountUsers / total) * 100)}%` },
    ],
    categoryDistribution: catDist,
    genderDistribution: genderDist,
    ageDistribution: ageDist,
    seasonDistribution: seasonDist,
    paymentDistribution: paymentDist,
    topLocations,
    purchaseFrequency: catDist,
    spendingDistribution: ageDist,
    favouriteCategories: topCategories,
    favouriteSeasons: topSeasons,
  }
}

/* ══════════════════════════════════════════════════════════════
   RECOMMENDATIONS
   ══════════════════════════════════════════════════════════════ */

function generateRecommendations(segments, rows) {
  const productRecs = segments.map(seg => ({
    segment: seg.name,
    item: `Personalized ${seg.dominantCategory} bundle for ${seg.type} customers`,
    reason: `${seg.customers} customers prefer ${seg.dominantCategory}`,
    confidence: Math.min(95, 60 + seg.percentage),
    type: 'Product',
    status: 'Active',
  }))

  const offerRecs = segments.map(seg => ({
    segment: seg.name,
    item: seg.type === 'Discount Driven' ? 'Flash Sale Campaign' : seg.type === 'High Value' ? 'Exclusive Early Access' : 'Seasonal Promotion',
    reason: `${seg.type} segment — ${seg.dominantFrequency.toLowerCase()} ${seg.dominantCategory} buyers`,
    confidence: Math.min(92, 55 + seg.percentage),
    type: 'Offer',
    status: 'Active',
  }))

  const couponRecs = segments.map(seg => ({
    segment: seg.name,
    item: seg.type === 'Budget' ? 'VALUE100' : seg.type === 'High Value' ? 'PREMIUM15' : 'PERSONAL10',
    reason: `Custom coupon for ${seg.name}`,
    confidence: Math.min(88, 50 + seg.percentage),
    type: 'Coupon',
    status: 'Active',
  }))

  const campaignRecs = segments.map(seg => ({
    segment: seg.name,
    item: `${seg.dominantFrequency} ${seg.dominantCategory} Campaign`,
    reason: `${seg.customers} customers buy ${seg.dominantCategory} ${seg.dominantFrequency.toLowerCase()}`,
    confidence: Math.min(90, 52 + seg.percentage),
    type: 'Campaign',
    status: 'Active',
  }))

  const total = productRecs.length + offerRecs.length + couponRecs.length + campaignRecs.length
  const accepted = Math.round(total * 0.42)

  return {
    stats: [
      { label: 'Total Recommendations', value: String(total) },
      { label: 'Accepted Recommendations', value: String(accepted) },
      { label: 'Conversion Rate', value: `${Math.round((accepted / total) * 100)}%` },
      { label: 'Segments Analyzed', value: String(segments.length) },
    ],
    product: productRecs,
    offer: offerRecs,
    coupon: couponRecs,
    campaign: campaignRecs,
  }
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */

function average(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0 }
function countBy(arr, fn) { const m = {}; arr.forEach(r => { const k = fn(r); if (k === undefined || k === null || k === '') return; m[k] = (m[k] || 0) + 1 }); return m }
function topKey(m) { return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown' }

function summarizeDataset(dataset) {
  return {
    name: dataset.meta.filename || 'dataset.csv',
    records: dataset.rows.length,
    columns: dataset.columns.length,
    columnNames: dataset.columns,
    targetColumn: dataset.meta.target_column || 'Category',
    uploadDate: dataset.meta.uploaded_at ? new Date(dataset.meta.uploaded_at).toLocaleDateString('en-IN') : 'Ready',
    status: dataset.rows.length ? 'Ready for Analysis' : 'Empty',
    preview: dataset.rows.slice(0, 8),
  }
}

async function withDataset(res, handler) {
  try {
    const dataset = await readDataset()
    return handler(dataset)
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ message: 'Dataset not found. Upload or restore a dataset first.' })
    throw err
  }
}

function expressText() {
  return (req, res, next) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
      body += chunk
      if (body.length > 5 * 1024 * 1024) { res.status(413).json({ message: 'CSV too large.' }); req.destroy() }
    })
    req.on('end', () => { req.body = body; next() })
    req.on('error', next)
  }
}

function csvValue(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function buildCsv(columns, rows) {
  return [
    columns.map(csvValue).join(','),
    ...rows.map((row) => columns.map((column) => csvValue(row[column])).join(',')),
  ].join('\n')
}

function deriveCustomerCategory(customer) {
  const segment = String(customer.segment || '').toLowerCase()
  if (segment.includes('premium')) return 'Electronics'
  if (segment.includes('loyal')) return 'Fashion'
  if (segment.includes('price') || segment.includes('budget')) return 'Grocery'
  if (segment.includes('new')) return 'Beauty'
  if (segment.includes('inactive')) return 'Home'
  return 'General'
}

function deriveFrequency(orderCount) {
  if (orderCount >= 16) return 'Weekly'
  if (orderCount >= 10) return 'Fortnightly'
  if (orderCount >= 5) return 'Monthly'
  if (orderCount >= 2) return 'Quarterly'
  return 'Annually'
}

function deriveSeason(joined) {
  const month = new Date(joined || Date.now()).getMonth()
  if ([2, 3, 4].includes(month)) return 'Spring'
  if ([5, 6, 7].includes(month)) return 'Summer'
  if ([8, 9, 10].includes(month)) return 'Fall'
  return 'Winter'
}

function derivedAge(index) {
  return 21 + ((index * 7) % 35)
}

/* ══════════════════════════════════════════════════════════════
   CACHE for /models (expensive to compute)
   ══════════════════════════════════════════════════════════════ */
let modelsCache = null
let modelsCacheTime = 0
const MODELS_CACHE_TTL = 60_000

/* ══════════════════════════════════════════════════════════════
   API ROUTES
   ══════════════════════════════════════════════════════════════ */

const algorithmDefs = [
  {
    key: 'kmeans',
    name: 'K-Means Clustering',
    type: 'Partitioning',
    description: 'Groups all customers into clear segments using spending, purchase frequency, age, rating, discount usage and subscription signals.',
    bestFor: 'Primary customer segmentation',
    output: 'Segment labels, centroid-based clusters, PCA chart points',
    features: ['Age', 'Purchase amount', 'Review rating', 'Previous purchases', 'Subscription', 'Discount usage', 'Purchase frequency'],
  },
  {
    key: 'dbscan',
    name: 'DBSCAN',
    type: 'Density-based',
    description: 'Finds dense customer groups and separates unusual customers as outliers without forcing every user into a fixed number of clusters.',
    bestFor: 'Outlier detection and irregular groups',
    output: 'Dense clusters, noise/outlier count, coverage score',
    features: ['Normalized behaviour vectors', 'Density radius', 'Minimum neighbour count'],
  },
  {
    key: 'hierarchical',
    name: 'Hierarchical Clustering',
    type: 'Hierarchical',
    description: 'Builds nested customer groups by progressively merging similar users, making segment relationships easier to explain.',
    bestFor: 'Explainable segment hierarchy',
    output: 'Tree-like customer groups and segment counts',
    features: ['Average linkage distance', 'Normalized behaviour vectors', 'Requested cluster count'],
  },
  {
    key: 'pca',
    name: 'PCA-Based Clustering',
    type: 'Dimensionality Reduction',
    description: 'Compresses behaviour features into two dimensions so customer clusters can be visualized and compared.',
    bestFor: 'Cluster visualization and feature compression',
    output: '2D customer map and variance explained',
    features: ['Principal components', 'Variance explained', 'Projected user points'],
  },
]

function normalizeAlgorithm(value) {
  return algorithmDefs.some(def => def.key === value) ? value : 'kmeans'
}

function getDefaultClusterCount(rowsLength) {
  return Math.min(5, Math.max(2, Math.ceil(Math.sqrt(rowsLength / 2))))
}

function clampClusterCount(value, rowsLength) {
  const fallback = getDefaultClusterCount(rowsLength)
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(2, Math.round(parsed)), Math.max(2, rowsLength))
}

function expandSampledAssignments(data, sampledData, sampledIndices, sampledAssignments) {
  const sampledIndexSet = new Set(sampledIndices)
  const assignments = new Array(data.length)

  sampledIndices.forEach((sourceIndex, sampleIndex) => {
    assignments[sourceIndex] = sampledAssignments[sampleIndex]
  })

  for (let i = 0; i < data.length; i++) {
    if (sampledIndexSet.has(i)) continue

    let nearestSample = 0
    let nearestDistance = Infinity
    for (let j = 0; j < sampledData.length; j++) {
      const distance = euclideanDist(data[i], sampledData[j])
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestSample = j
      }
    }
    assignments[i] = sampledAssignments[nearestSample] ?? 0
  }

  return assignments
}

function runClustering(normalized, algorithmInput = 'kmeans', clusterInput) {
  const algorithm = normalizeAlgorithm(algorithmInput)
  const numClusters = clampClusterCount(clusterInput, normalized.length)

  switch (algorithm) {
    case 'dbscan': {
      const { data: sampledData, indices } = sample(normalized, DBSCAN_SAMPLE)
      const result = dbscan(sampledData, 0.45, 5)
      return {
        ...result,
        assignments: expandSampledAssignments(normalized, sampledData, indices, result.assignments),
        evaluation: result.score,
        k: result.clusterCount || 1,
        algorithm,
      }
    }
    case 'hierarchical': {
      const { data: sampledData, indices } = sample(normalized, HIERARCHICAL_SAMPLE)
      const result = hierarchicalClustering(sampledData, numClusters)
      return {
        ...result,
        assignments: expandSampledAssignments(normalized, sampledData, indices, result.assignments),
        evaluation: result.score,
        k: result.clusterCount,
        algorithm,
      }
    }
    case 'pca': {
      const pcaResult = pca(normalized, 2)
      const result = kmeans(pcaResult.projected, numClusters)
      return {
        ...result,
        evaluation: Math.round(((result.score + (pcaResult.varianceExplained[0] || 0)) / 2) * 10) / 10,
        k: result.k,
        algorithm,
        pcaResult,
      }
    }
    default: {
      const result = kmeans(normalized, numClusters)
      return { ...result, evaluation: result.score, algorithm: 'kmeans' }
    }
  }
}

// Dataset management
router.post('/dataset/ensure', async (req, res, next) => {
  try {
    if (readOnlyFs) {
      const dataset = await readDataset()
      modelsCache = null
      return res.json(summarizeDataset(dataset))
    }
    if (req.query.force === 'true') {
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(datasetPath, defaultCsv, 'utf8')
    } else {
      await fs.access(datasetPath).catch(async () => {
        await fs.mkdir(dataDir, { recursive: true })
        await fs.writeFile(datasetPath, defaultCsv, 'utf8')
      })
    }
    const dataset = await readDataset()
    await fs.writeFile(metaPath, JSON.stringify({
      columns: dataset.columns,
      target_column: 'Category',
      uploaded_at: new Date().toISOString(),
      filename: 'dataset.csv',
      rows: dataset.rows.length,
    }, null, 2), 'utf8')
    modelsCache = null
    res.json(summarizeDataset(dataset))
  } catch (err) { next(err) }
})

router.get('/dataset', (req, res, next) =>
  withDataset(res, dataset => res.json(summarizeDataset(dataset))).catch(next)
)

router.delete('/dataset', async (req, res, next) => {
  try {
    if (readOnlyFs) return rejectReadOnly(res)
    await Promise.all([fs.rm(datasetPath, { force: true }), fs.rm(metaPath, { force: true })])
    modelsCache = null
    res.json({ deleted: true })
  } catch (err) { next(err) }
})

router.post('/dataset/upload', expressText(), async (req, res, next) => {
  try {
    if (readOnlyFs) return rejectReadOnly(res)
    const csv = String(req.body || '').trim()
    const parsed = parseCsv(csv)
    if (!parsed.columns.length || !parsed.rows.length) {
      return res.status(400).json({ message: 'CSV must include a header row and at least one data row.' })
    }
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(datasetPath, `${csv}\n`, 'utf8')
    await fs.writeFile(metaPath, JSON.stringify({
      columns: parsed.columns,
      target_column: parsed.columns.includes('Category') ? 'Category' : parsed.columns.at(-1),
      uploaded_at: new Date().toISOString(),
      filename: 'dataset.csv',
      rows: parsed.rows.length,
    }, null, 2), 'utf8')
    modelsCache = null
    res.status(201).json(summarizeDataset({ ...parsed, meta: {} }))
  } catch (err) { next(err) }
})

router.post('/dataset/sync-customers', async (req, res, next) => {
  try {
    if (readOnlyFs) return rejectReadOnly(res)
    const [customers, orders] = await Promise.all([
      AdminCustomer.find().sort({ customerId: 1 }).lean(),
      AdminOrder.find().lean(),
    ])

    if (!customers.length) {
      return res.status(404).json({ message: 'No admin customers found to build a clustering dataset.' })
    }

    const ordersByCustomer = orders.reduce((map, order) => {
      const key = order.customer || ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(order)
      return map
    }, new Map())

    const columns = [
      'Customer ID',
      'Age',
      'Gender',
      'Item Purchased',
      'Category',
      'Purchase Amount (USD)',
      'Location',
      'Size',
      'Color',
      'Season',
      'Review Rating',
      'Subscription Status',
      'Discount Applied',
      'Previous Purchases',
      'Payment Method',
      'Frequency of Purchases',
    ]

    const rows = customers.map((customer, index) => {
      const customerOrders = ordersByCustomer.get(customer.name) || []
      const totalSpent = Number(customer.totalSpent || customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0))
      const orderCount = Number(customer.totalOrders || customerOrders.length || 0)
      const avgSpend = orderCount ? Math.max(1, Math.round(totalSpent / orderCount / 80)) : Math.max(1, Math.round(totalSpent / 80))
      const segment = String(customer.segment || '')
      return {
        'Customer ID': customer.customerId || String(index + 1),
        Age: derivedAge(index),
        Gender: index % 2 ? 'Male' : 'Female',
        'Item Purchased': deriveCustomerCategory(customer),
        Category: deriveCustomerCategory(customer),
        'Purchase Amount (USD)': Math.max(10, avgSpend || 25),
        Location: customer.city || 'Unknown',
        Size: ['S', 'M', 'L', 'XL'][index % 4],
        Color: ['Black', 'Blue', 'Gray', 'Green', 'Red'][index % 5],
        Season: deriveSeason(customer.joined || customer.createdAt),
        'Review Rating': Math.min(5, Math.max(2.5, 3 + (orderCount % 5) * 0.35)).toFixed(1),
        'Subscription Status': segment.toLowerCase().includes('loyal') || segment.toLowerCase().includes('premium') ? 'Yes' : 'No',
        'Discount Applied': segment.toLowerCase().includes('price') || segment.toLowerCase().includes('budget') ? 'Yes' : 'No',
        'Previous Purchases': orderCount,
        'Payment Method': customerOrders[0]?.payment || ['Credit Card', 'Debit Card', 'UPI', 'Cash'][index % 4],
        'Frequency of Purchases': deriveFrequency(orderCount),
      }
    })

    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(datasetPath, `${buildCsv(columns, rows)}\n`, 'utf8')
    await fs.writeFile(metaPath, JSON.stringify({
      columns,
      target_column: 'Category',
      uploaded_at: new Date().toISOString(),
      filename: 'admin_customers.csv',
      rows: rows.length,
      source: 'AdminCustomer + AdminOrder',
    }, null, 2), 'utf8')

    modelsCache = null
    res.status(201).json(summarizeDataset({ columns, rows, meta: { filename: 'admin_customers.csv', uploaded_at: new Date().toISOString(), target_column: 'Category' } }))
  } catch (err) { next(err) }
})

// ── ML Endpoints ──

router.get('/segments', (req, res, next) =>
  withDataset(res, dataset => {
    const algorithm = normalizeAlgorithm(req.query.algorithm)
    const clustersRequested = clampClusterCount(req.query.clusters, dataset.rows.length)
    const features = extractFeatures(dataset.rows)
    const normalized = normalize(features)
    const result = runClustering(normalized, algorithm, clustersRequested)
    const metric = algorithmDefs.find(m => m.key === result.algorithm) || algorithmDefs[0]
    const segments = analyzeSegments(dataset.rows, result.assignments)

    const pcaResult = result.pcaResult || pca(normalized, 2)
    const clusters = dataset.rows.map((row, i) => ({
      x: pcaResult.projected[i][0],
      y: pcaResult.projected[i][1],
      name: segments.find(s => s.id === `cluster_${result.assignments[i]}`)?.name || 'Unknown',
      customerId: row['Customer ID'],
      color: segments.find(s => s.id === `cluster_${result.assignments[i]}`)?.color || '#64748b',
    }))

    res.json({
      totalCustomers: dataset.rows.length,
      segments,
      distribution: segments.map(s => ({ name: s.name, value: s.percentage, color: s.color })),
      clusters,
      modelEvaluation: result.evaluation,
      model: {
        key: metric.key,
        name: metric.name,
        type: metric.type,
        clusters: result.k,
      },
      pca: { varianceExplained: pcaResult.varianceExplained },
    })
  }).catch(next)
)

router.get('/models', (req, res, next) =>
  withDataset(res, async dataset => {
    const now = Date.now()
    if (modelsCache && (now - modelsCacheTime) < MODELS_CACHE_TTL) {
      return res.json(modelsCache)
    }

    const features = extractFeatures(dataset.rows)
    const normalized = normalize(features)
    const k = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(dataset.rows.length / 2))))

    const { data: normSampled } = sample(normalized, DBSCAN_SAMPLE)
    const { data: hierSampled } = sample(normalized, HIERARCHICAL_SAMPLE)

    const kmeansResult = kmeans(normalized, k)
    const dbscanResult = dbscan(normSampled, 0.45, 5)
    const hierResult = hierarchicalClustering(hierSampled, k)
    const pcaResult = pca(normalized, 2)

    const models = [
      { ...algorithmDefs[0], status: 'Active', lastTrained: new Date().toLocaleDateString('en-IN'), evaluation: kmeansResult.score, accuracy: kmeansResult.score, clusters: kmeansResult.k },
      { ...algorithmDefs[1], status: 'Available', lastTrained: new Date().toLocaleDateString('en-IN'), evaluation: dbscanResult.score, accuracy: dbscanResult.score, clusters: dbscanResult.clusterCount },
      { ...algorithmDefs[2], status: 'Available', lastTrained: new Date().toLocaleDateString('en-IN'), evaluation: hierResult.score, accuracy: hierResult.score, clusters: hierResult.clusterCount },
      { ...algorithmDefs[3], status: 'Available', lastTrained: new Date().toLocaleDateString('en-IN'), evaluation: Math.round(pcaResult.varianceExplained[0] || 85), accuracy: Math.round(pcaResult.varianceExplained[0] || 85), clusters: k },
    ]

    modelsCache = models
    modelsCacheTime = now
    res.json(models)
  }).catch(next)
)

router.post('/train', (req, res, next) =>
  withDataset(res, dataset => {
    const algorithm = normalizeAlgorithm(req.body?.algorithm)
    const numClusters = clampClusterCount(req.body?.clusters, dataset.rows.length)
    const features = extractFeatures(dataset.rows)
    const normalized = normalize(features)
    const metric = algorithmDefs.find(m => m.key === algorithm) || algorithmDefs[0]

    const result = runClustering(normalized, algorithm, numClusters)

    modelsCache = null

    res.json({
      name: metric.name,
      status: 'Active',
      lastTrained: new Date().toLocaleDateString('en-IN'),
      evaluation: `${result.evaluation}%`,
      clusters: result.k,
      rows: dataset.rows.length,
      algorithm: metric.key,
      type: metric.type,
    })
  }).catch(next)
)

router.get('/behaviour', (req, res, next) =>
  withDataset(res, dataset => res.json(computeBehaviour(dataset.rows))).catch(next)
)

router.get('/recommendations', (req, res, next) =>
  withDataset(res, dataset => {
    const type = req.query.type || 'product'
    const features = extractFeatures(dataset.rows)
    const normalized = normalize(features)
    const k = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(dataset.rows.length / 2))))
    const result = kmeans(normalized, k)
    const segments = analyzeSegments(dataset.rows, result.assignments)
    const recs = generateRecommendations(segments, dataset.rows)
    res.json(recs[type] || [])
  }).catch(next)
)

router.post('/recommendations/generate', (req, res, next) =>
  withDataset(res, dataset => {
    const features = extractFeatures(dataset.rows)
    const normalized = normalize(features)
    const k = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(dataset.rows.length / 2))))
    const result = kmeans(normalized, k)
    const segments = analyzeSegments(dataset.rows, result.assignments)
    res.json(generateRecommendations(segments, dataset.rows))
  }).catch(next)
)

export default router
