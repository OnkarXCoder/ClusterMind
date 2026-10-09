// Non-destructive product reseed: replaces ONLY the Product collection and
// preserves users, orders, refunds, campaigns, coupons, segments and every
// other collection. Run with:  node seedProductsOnly.mjs
import 'dotenv/config'
import mongoose from 'mongoose'
import Product from './models/Product.js'
import { products } from './data/products.js'

const { resolveGiftRecipient } = await import('./data/giftRecipients.js')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected.')

  const before = await Product.countDocuments()
  const taggedBefore = await Product.countDocuments({ giftTags: { $nin: [[], null] } })
  console.log(`Before: ${before} products, ${taggedBefore} gift-tagged`)

  // Validate seed before touching anything.
  const badRelation = []
  for (const p of products) {
    if (!p.name || p.price == null || !p.image) throw new Error(`Seed product missing required field: ${JSON.stringify(p).slice(0, 120)}`)
    for (const t of p.giftTags || []) {
      if (!resolveGiftRecipient(t)) badRelation.push(`${p.name} -> "${t}"`)
    }
  }
  if (badRelation.length) {
    console.log('\nWARNING - unknown giftTags (AI gift matching will skip these):')
    badRelation.forEach((b) => console.log('  ' + b))
  }

  await Product.deleteMany({})
  const docs = await Product.insertMany(products)
  const tagged = docs.filter((p) => (p.giftTags || []).length > 0).length
  const rels = [...new Set(docs.flatMap((p) => p.giftTags || []))].length

  const after = await Product.countDocuments()
  console.log(`\nAfter : ${after} products, ${tagged} gift-tagged, ${rels} distinct relations`)
  console.log(`Seed file had ${products.length} products -> ${after === products.length ? 'MATCH' : 'MISMATCH'}`)

  await mongoose.disconnect()
  console.log('Done. Other collections untouched.')
}

run().catch((e) => { console.error('FAILED (nothing partially changed unless insertMany ran):', e.message); process.exit(1) })