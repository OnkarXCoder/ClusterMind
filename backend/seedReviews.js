// Creates a real Review collection and recomputes Product.rating / Product.reviews
// from those documents, so every rating the AI quotes is derived from stored data
// rather than a static seed number.
//
//   node seedReviews.js          # non-destructive: skips products that already have reviews
//   node seedReviews.js --reset   # wipes all reviews first and regenerates
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './db.js'
import Product from './models/Product.js'
import Review from './models/Review.js'

const RESET = process.argv.includes('--reset')

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Rohan', 'Kabir', 'Neel', 'Yash',
  'Ananya', 'Diya', 'Ira', 'Myra', 'Saanvi', 'Kavya', 'Nisha', 'Pooja', 'Ritu', 'Sneha',
  'Farhan', 'Zoya', 'Imran', 'Meera', 'Rahul', 'Priya', 'Amit', 'Neha', 'Ravi', 'Divya',
]
const LAST_NAMES = [
  'Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Joshi', 'Verma', 'Mehta', 'Kapoor', 'Singh',
  'Gupta', 'Rao', 'Das', 'Banerjee', 'Chopra', 'Malhotra', 'Desai', 'Kulkarni', 'Pillai', 'Ghosh',
]

const TITLES = {
  5: ['Exactly what I wanted', 'Excellent for the price', 'Would buy again', 'Superb quality', 'Exceeded expectations'],
  4: ['Very happy with this', 'Good value overall', 'Does the job well', 'Solid purchase', 'Recommended'],
  3: ['Does what it says', 'Decent, with some tradeoffs', 'Fine for the price', 'Good but not great', 'Average experience'],
  2: ['Not quite what I expected', 'Acceptable but disappointing', 'Could be better', 'Mixed feelings', 'Some issues'],
  1: ['Not worth the money', 'Had to return it', 'Disappointed', 'Did not meet expectations', 'Would not recommend'],
}

const COMMENTS = {
  Electronics: [
    'Setup took a few minutes and it has worked reliably since. Battery life is close to what was promised.',
    'Build quality feels solid and the performance is consistent day to day. No complaints so far.',
    'Sound and display are genuinely good for this price. Connectivity has been stable.',
    'Works as described. The only reason it is not five stars is the charger quality.',
    'Packed well and arrived on time. Using it daily for a couple of weeks without issues.',
    'Good specs on paper and in real use. Slightly bulkier than I expected but performance makes up for it.',
  ],
  Fashion: [
    'Fabric quality is better than I expected at this price. Fit is true to size.',
    'Colour matches the photos. Comfortable to wear through the day.',
    'Stitching is neat and it washed well without shrinking. Would order again.',
    'Looks premium in person. Runs a little large, so consider sizing down.',
    'Good value for the price. Material is slightly thin but breathable.',
    'Received a lot of compliments. Delivery was quick and packaging was fine.',
  ],
  Beauty: [
    'Gentle on skin and did not cause any irritation. Scent is subtle and pleasant.',
    'Texture absorbs quickly and leaves skin feeling soft. A little goes a long way.',
    'Packaging was sealed and the product felt authentic. Visible difference after two weeks.',
    'Good formulation for the price. Works well as part of my daily routine.',
    'Not sticky and easy to apply. Ideal for everyday use.',
    'Pleasantly surprised by the results. Will repurchase once this runs out.',
  ],
  Sports: [
    'Grip and material quality are excellent. Held up well through daily workouts.',
    'Comfortable to use and sturdy build. No signs of wear after a month.',
    'Good support and easy to adjust. Worth the price for regular training.',
    'Lightweight but feels durable. Made my sessions noticeably easier.',
    'Arrived in good condition and works exactly as expected.',
    'Solid for the price point. Does not feel cheap at all.',
  ],
  Books: [
    'Pages are good quality and the print is clear. Content is well structured.',
    'Packed in a protective sleeve with no damage. A genuinely useful read.',
    'Chapters are organised logically and the examples are practical.',
    'Worth every rupee for the depth of content. Good for beginners too.',
    'Delivery was on time and the book was in perfect condition.',
    'Helpful and well written. I have already recommended it to a colleague.',
  ],
  Home: [
    'Fits well in my kitchen and the finish is smooth. Easy to clean.',
    'Sturdy construction and the colour looks close to the photos.',
    'Good quality for the price. Used it daily with no problems.',
    'Assembly was straightforward and the result is stable.',
    'Does the job neatly and saves a lot of counter space.',
    'Arrived safely and felt premium the moment I opened the box.',
  ],
  'Home & Kitchen': [
    'Fits well in my kitchen and the finish is smooth. Easy to clean.',
    'Sturdy construction and the colour looks close to the photos.',
    'Good quality for the price. Used it daily with no problems.',
    'Assembly was straightforward and the result is stable.',
    'Does the job neatly and saves a lot of counter space.',
    'Arrived safely and felt premium the moment I opened the box.',
  ],
  Toys: [
    'My child has not put it down since it arrived. Well made and safe.',
    'Good quality material with no sharp edges. Great value.',
    'Packaging was sturdy and the pieces fit together nicely.',
    'Keeps the kids engaged for hours. Worth the money.',
    'Exactly as pictured and finished nicely. Delivered quickly.',
    'Pleasantly surprised by how durable it is after weeks of play.',
  ],
  'Toys & Games': [
    'My child has not put it down since it arrived. Well made and safe.',
    'Good quality material with no sharp edges. Great value.',
    'Packaging was sturdy and the pieces fit together nicely.',
    'Keeps the kids engaged for hours. Worth the money.',
    'Exactly as pictured and finished nicely. Delivered quickly.',
    'Pleasantly surprised by how durable it is after weeks of play.',
  ],
  Grocery: [
    'Fresh and well within the date. Packaging was sealed properly.',
    'Quality consistent with what I usually buy offline, at a better price.',
    'Arrived on time and in good condition. Will reorder.',
    'Good portion size for the cost. Taste was fine.',
    'Sealed pack, no leakage, and delivered carefully.',
    'Value for money and easy to store.',
  ],
  'Office Supplies': [
    'Smooth and does not smudge. Good grip for long writing sessions.',
    'Quality paper and binding. Ideal for daily notes.',
    'Does exactly what I need for desk work. Sturdy build.',
    'Good quality at this price and the packaging was neat.',
    'Helpful for organisation and easy to use.',
    'Durable and arrived quickly. No issues so far.',
  ],
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}

// Deterministic-ish PRNG so re-seeding produces stable data.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function main() {
  await connectDB()
  if (RESET) {
    const deleted = await Review.deleteMany({})
    console.log(`reset: wiped ${deleted.deletedCount} existing reviews`)
  }

  const products = await Product.find().lean()
  console.log(`found ${products.length} products`)

  let created = 0
  for (const p of products) {
    const existing = await Review.countDocuments({ product: p._id })
    if (existing > 0) {
      console.log(`  skip "${p.name}" (already has ${existing} reviews)`)
      continue
    }

    const rng = mulberry32(String(p._id).split('').reduce((a, c) => a + c.charCodeAt(0), 0))
    const targetRating = p.rating || 4
    const count = 6 + Math.floor(rng() * 7) // 6-12 reviews

    // Centre the generated ratings on the product's target rating.
    const weights = []
    for (let i = 0; i < count; i++) {
      const drift = rng() * 2 - 1 // -1..1
      let r = Math.round(targetRating + drift * 1.4)
      weights.push(Math.min(5, Math.max(1, r)))
    }

    const pool = COMMENTS[p.category] || COMMENTS.Electronics
    const docs = []
    for (let i = 0; i < count; i++) {
      const rating = weights[i]
      const daysAgo = 3 + Math.floor(rng() * 300)
      docs.push({
        product: p._id,
        customerName: `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`,
        rating,
        title: pick(TITLES[rating], rng),
        comment: pick(pool, rng),
        verifiedPurchase: rng() > 0.15,
        helpful: Math.floor(rng() * 40),
        status: 'Published',
        createdAt: new Date(Date.now() - daysAgo * 86400000),
        updatedAt: new Date(Date.now() - daysAgo * 86400000),
      })
    }

    docs.sort((a, b) => a.createdAt - b.createdAt)
    await Review.insertMany(docs, { ordered: false })
    created += docs.length

    const avg = Math.round((weights.reduce((a, b) => a + b, 0) / count) * 10) / 10
    await Product.findByIdAndUpdate(p._id, { rating: avg, reviews: count })
    console.log(`  "${p.name}": ${count} reviews, avg ${avg}`)
  }

  console.log(`\ndone: created ${created} reviews`)
  console.log('Product.rating / Product.reviews now reflect stored review documents.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('seedReviews failed:', err)
  process.exit(1)
})
