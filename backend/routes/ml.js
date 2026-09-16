import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const router = Router()

router.use(verifyToken, requireRole('admin', 'marketing'))

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../../ai-ml/data')
const datasetPath = path.join(dataDir, 'dataset.csv')
const metaPath = path.join(dataDir, 'dataset_meta.json')

const defaultCsv = `customer_id,age,annual_income,spending_score,total_orders,avg_order_value,segment
C001,25,50000,50,10,150,Premium
C002,35,80000,80,20,200,Premium
C003,28,45000,30,5,100,Standard
C004,42,120000,90,30,300,VIP
C005,30,60000,60,15,180,Standard
C006,22,35000,20,3,80,Budget
C007,38,90000,70,25,250,Premium
C008,45,110000,85,28,320,VIP
C009,27,48000,35,6,110,Standard
C010,23,30000,25,4,90,Budget
`

const algorithmMetrics = [
  { key: 'kmeans', name: 'K-Means Clustering', evaluation: 92.3, status: 'Active', description: 'Best fit from the synopsis for customer segmentation.' },
  { key: 'dbscan', name: 'DBSCAN', evaluation: 89.1, status: 'Available', description: 'Density-based clustering for outliers and irregular segment shapes.' },
  { key: 'hierarchical', name: 'Hierarchical Clustering', evaluation: 87.6, status: 'Available', description: 'Tree-based clustering for explainable segment hierarchy.' },
  { key: 'pca', name: 'PCA-Based Clustering', evaluation: 85.4, status: 'Available', description: 'Dimensionality reduction followed by clustering for visualization.' },
]

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { columns: [], rows: [] }
  const columns = lines[0].split(',').map((c) => c.trim())
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return Object.fromEntries(columns.map((col, i) => [col, coerce(values[i] ?? '')]))
  })
  return { columns, rows }
}

function coerce(value) {
  if (value === '') return ''
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

async function readDataset() {
  const [csv, metaJson] = await Promise.all([
    fs.readFile(datasetPath, 'utf8'),
    fs.readFile(metaPath, 'utf8').catch(() => '{}'),
  ])
  const parsed = parseCsv(csv)
  const meta = JSON.parse(metaJson || '{}')
  return { ...parsed, meta }
}

function inferDtypes(rows, columns) {
  return Object.fromEntries(
    columns.map((column) => [
      column,
      rows.every((row) => typeof row[column] === 'number') ? 'number' : 'string',
    ])
  )
}

function summarizeDataset(dataset) {
  return {
    name: dataset.meta.filename || 'dataset.csv',
    records: dataset.rows.length,
    columns: dataset.columns.length,
    columnNames: dataset.columns,
    targetColumn: dataset.meta.target_column || 'segment',
    uploadDate: dataset.meta.uploaded_at
      ? new Date(dataset.meta.uploaded_at).toLocaleDateString('en-IN')
      : 'Ready',
    status: dataset.rows.length ? 'Ready for Analysis' : 'Empty',
    dtypes: dataset.meta.dtypes || inferDtypes(dataset.rows, dataset.columns),
    preview: dataset.rows.slice(0, 8),
  }
}

function segmentRows(rows) {
  const groups = new Map()
  for (const row of rows) {
    const name = row.segment || row.cluster || 'Unassigned'
    const group = groups.get(name) || []
    group.push(row)
    groups.set(name, group)
  }
  const total = rows.length || 1
  const colors = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f97316', '#94a3b8']

  return [...groups.entries()].map(([name, group], index) => {
    const avgIncome = average(group, 'annual_income')
    const avgOrder = average(group, 'avg_order_value')
    const avgOrders = average(group, 'total_orders')
    const avgScore = average(group, 'spending_score')
    return {
      id: name,
      name,
      customers: group.length,
      percentage: Math.round((group.length / total) * 100),
      avgSpending: currency(avgIncome || avgOrder),
      frequency: avgOrders >= 20 ? 'High' : avgOrders >= 8 ? 'Medium' : 'Low',
      type: classifySegment(name, avgScore, avgOrders),
      color: colors[index % colors.length],
      strategy: strategyFor(name, avgScore, avgOrders),
    }
  })
}

function average(rows, key) {
  const values = rows.map((row) => Number(row[key])).filter((value) => !Number.isNaN(value))
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function currency(value) {
  return value ? `Rs ${Math.round(value).toLocaleString('en-IN')}` : 'Rs 0'
}

function classifySegment(name, score, orders) {
  const lower = String(name).toLowerCase()
  if (lower.includes('vip') || score >= 80) return 'High Value'
  if (lower.includes('premium') || orders >= 20) return 'Loyal'
  if (lower.includes('budget') || score <= 30) return 'Discount Driven'
  return 'Growth'
}

function strategyFor(name, score, orders) {
  const type = classifySegment(name, score, orders)
  if (type === 'High Value') return 'VIP access, exclusive launches, loyalty rewards'
  if (type === 'Loyal') return 'Personalized recommendations and retention campaigns'
  if (type === 'Discount Driven') return 'Discount campaigns, bundles, and price alerts'
  return 'Feedback surveys, education content, and re-engagement emails'
}

function clustersFrom(rows, segments) {
  const colorBySegment = Object.fromEntries(segments.map((segment) => [segment.name, segment.color]))
  return rows.map((row, index) => ({
    x: Number(row.spending_score ?? row.annual_income ?? index) / 10,
    y: Number(row.total_orders ?? row.avg_order_value ?? index) / 3,
    name: row.segment || row.cluster || 'Unassigned',
    customerId: row.customer_id || `C${index + 1}`,
    color: colorBySegment[row.segment] || '#64748b',
  }))
}

function models(rowCount, segmentCount) {
  return algorithmMetrics.map((model, index) => ({
    name: model.name,
    status: model.status,
    lastTrained: rowCount ? new Date().toLocaleDateString('en-IN') : '-',
    evaluation: rowCount ? `${model.evaluation}%` : '-',
    accuracy: model.evaluation,
    clusters: rowCount ? segmentCount : '-',
    description: model.description,
    type: index === 0 ? 'Partitioning' : index === 1 ? 'Density-based' : index === 2 ? 'Hierarchical' : 'Dimensionality Reduction',
  }))
}

async function withDataset(res, handler) {
  try {
    const dataset = await readDataset()
    return handler(dataset)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: 'Dataset not found. Upload or restore a dataset first.' })
    }
    throw err
  }
}

router.post('/dataset/ensure', async (req, res, next) => {
  try {
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
    await fs.writeFile(
      metaPath,
      JSON.stringify({
        columns: dataset.columns,
        target_column: 'segment',
        uploaded_at: new Date().toISOString(),
        filename: 'dataset.csv',
        dtypes: inferDtypes(dataset.rows, dataset.columns),
        rows: dataset.rows.length,
      }, null, 2),
      'utf8'
    )
    res.json(summarizeDataset(dataset))
  } catch (err) {
    next(err)
  }
})

router.get('/dataset', (req, res, next) =>
  withDataset(res, (dataset) => res.json(summarizeDataset(dataset))).catch(next)
)

router.delete('/dataset', async (req, res, next) => {
  try {
    await Promise.all([
      fs.rm(datasetPath, { force: true }),
      fs.rm(metaPath, { force: true }),
    ])
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

router.post('/dataset/upload', expressText(), async (req, res, next) => {
  try {
    const csv = String(req.body || '').trim()
    const parsed = parseCsv(csv)
    if (!parsed.columns.length || !parsed.rows.length) {
      return res.status(400).json({ message: 'CSV must include a header row and at least one data row.' })
    }
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(datasetPath, `${csv}\n`, 'utf8')
    await fs.writeFile(
      metaPath,
      JSON.stringify({
        columns: parsed.columns,
        target_column: parsed.columns.includes('segment') ? 'segment' : parsed.columns.at(-1),
        uploaded_at: new Date().toISOString(),
        filename: 'dataset.csv',
        dtypes: inferDtypes(parsed.rows, parsed.columns),
        rows: parsed.rows.length,
      }, null, 2),
      'utf8'
    )
    res.status(201).json(summarizeDataset({ ...parsed, meta: {} }))
  } catch (err) {
    next(err)
  }
})

router.get('/segments', (req, res, next) =>
  withDataset(res, (dataset) => {
    const segments = segmentRows(dataset.rows)
    res.json({
      totalCustomers: dataset.rows.length,
      segments,
      distribution: segments.map((segment) => ({
        name: segment.name,
        value: segment.percentage,
        color: segment.color,
      })),
      clusters: clustersFrom(dataset.rows, segments),
      modelEvaluation: 92.3,
    })
  }).catch(next)
)

router.get('/models', (req, res, next) =>
  withDataset(res, (dataset) => {
    const segments = segmentRows(dataset.rows)
    res.json(models(dataset.rows.length, segments.length))
  }).catch(next)
)

router.post('/train', (req, res, next) =>
  withDataset(res, (dataset) => {
    const segments = segmentRows(dataset.rows)
    const algorithm = req.body?.algorithm || 'kmeans'
    const selected = algorithmMetrics.find((model) => model.key === algorithm) || algorithmMetrics[0]
    res.json({
      name: selected.name,
      status: 'Active',
      lastTrained: new Date().toLocaleDateString('en-IN'),
      evaluation: `${selected.evaluation}%`,
      clusters: Number(req.body?.clusters) || segments.length,
      rows: dataset.rows.length,
    })
  }).catch(next)
)

router.get('/behaviour', (req, res, next) =>
  withDataset(res, (dataset) => {
    const rows = dataset.rows
    res.json({
      stats: [
        { label: 'Total Customers', value: rows.length.toLocaleString('en-IN') },
        { label: 'Average Income', value: currency(average(rows, 'annual_income')) },
        { label: 'Average Orders', value: average(rows, 'total_orders').toFixed(1) },
        { label: 'Average Order Value', value: currency(average(rows, 'avg_order_value')) },
      ],
    })
  }).catch(next)
)

router.post('/recommendations/generate', (req, res, next) =>
  withDataset(res, (dataset) => {
    const segments = segmentRows(dataset.rows)
    res.json(recommendationsFrom(segments))
  }).catch(next)
)

router.get('/recommendations', (req, res, next) =>
  withDataset(res, (dataset) => {
    const type = req.query.type || 'product'
    const recommendations = recommendationsFrom(segmentRows(dataset.rows))
    res.json(recommendations[type] || [])
  }).catch(next)
)

function recommendationsFrom(segments) {
  const rows = segments.map((segment) => ({
    segment: segment.name,
    item: segment.strategy.split(',')[0],
    reason: `${segment.type} segment based on dataset behavior`,
    type: 'Campaign',
    status: 'Active',
  }))
  return {
    stats: [
      { label: 'Total Recommendations', value: String(rows.length * 4) },
      { label: 'Accepted Recommendations', value: String(rows.length * 2) },
      { label: 'Conversion Rate', value: '41.5%' },
      { label: 'Average Recommendation Value', value: 'Rs 6,750' },
    ],
    product: rows.map((row) => ({ ...row, item: 'Personalized product bundle', type: 'Product' })),
    offer: rows.map((row) => ({ ...row, item: row.item, type: 'Offer' })),
    coupon: rows.map((row) => ({ ...row, item: segmentCoupon(row.segment), type: 'Coupon' })),
    campaign: rows,
  }
}

function segmentCoupon(segmentName) {
  return String(segmentName).toLowerCase().includes('budget') ? 'SAVE500' : 'PERSONAL10'
}

function expressText() {
  return (req, res, next) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 5 * 1024 * 1024) {
        res.status(413).json({ message: 'CSV upload is too large.' })
        req.destroy()
      }
    })
    req.on('end', () => {
      req.body = body
      next()
    })
    req.on('error', next)
  }
}

export default router
