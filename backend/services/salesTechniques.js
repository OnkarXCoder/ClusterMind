/* ══════════════════════════════════════════════════════════════
   SALES TECHNIQUES — evidence, reframes and closing patterns
   Used by aiSalesService.js to turn replies into sales moves.

   Design rule: every claim is derived from real product data
   (rating, reviews, discount, stock, delivery). No invented
   scarcity, no invented policy promises.
   ══════════════════════════════════════════════════════════════ */

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`

/* Product names in this catalog often start with an article
   ("The Art of AI Marketing"). Prefixing another "the" produces
   "the The Art of AI Marketing", so strip it before use. */
export function bareName(name = '') {
  return String(name).replace(/^(the|a|an)\s+/i, '')
}

export function the(name = '') {
  return `the ${bareName(name)}`
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

/* ══════════════════════════════════════════════════════════════
   EVIDENCE BANK
   Turns a product row into persuasive, factual proof points.
   ══════════════════════════════════════════════════════════════ */

export function buildEvidence(product) {
  if (!product) return null

  const price = Number(product.price) || 0
  const oldPrice = Number(product.oldPrice) || 0
  const discountPct = Number(product.discount) || 0
  const rating = Number(product.rating) || 0
  const reviews = Number(product.reviews) || 0
  const stock = Number(product.stock) || 0

  const savings = oldPrice > price ? oldPrice - price : 0
  const savingsPct = savings > 0 ? Math.round((savings / oldPrice) * 100) : discountPct

  return {
    product,
    name: product.name,
    price,
    priceText: inr(price),
    oldPrice,
    oldPriceText: inr(oldPrice),
    rating,
    reviews,
    brand: product.brand,
    category: product.category,
    stock,
    // Only true when the stored flag says so — never assume free delivery
    freeDelivery: product.freeDelivery === true,

    hasDiscount: savings > 0,
    savings,
    savingsText: savings > 0 ? `${inr(savings)} (${savingsPct}% off)` : null,

    isTopRated: rating >= 4.5,
    isPopular: reviews >= 500,
    isLowStock: stock > 0 && stock <= 10,
    isCriticalStock: stock > 0 && stock <= 3,
    outOfStock: stock === 0,
  }
}

export function socialProof(e) {
  if (!e) return ''
  const stars = e.rating > 0 ? `${e.rating}★` : null
  if (stars && e.reviews > 0) return `${stars} from ${e.reviews.toLocaleString('en-IN')} reviews`
  if (e.reviews > 0) return `${e.reviews.toLocaleString('en-IN')} people have rated this`
  return 'New listing with no reviews yet — tell me what matters most to you'
}

export function authorityLine(e) {
  if (!e) return ''
  if (e.isTopRated && e.isPopular) return `A ${e.rating}★ average across ${e.reviews.toLocaleString('en-IN')} reviews`
  if (e.isTopRated) return `Customers rate it ${e.rating}★`
  if (e.isPopular) return `${e.reviews.toLocaleString('en-IN')} people have rated it ${e.rating}★`
  return `${e.rating}★ from ${e.reviews.toLocaleString('en-IN')} reviews`
}

export function urgencyLine(e) {
  if (!e) return ''
  if (e.outOfStock) return 'Currently out of stock, but I can tell you when it is back.'
  if (e.isCriticalStock) return `Heads up — only ${e.stock} left in stock.`
  if (e.isLowStock) return `Stock is down to ${e.stock} units.`
  return ''
}

export function valueLine(e) {
  if (!e) return ''
  const parts = []
  if (e.hasDiscount) parts.push(`you're keeping ${e.savingsText}`)
  if (e.freeDelivery) parts.push('delivery is free')
  parts.push(`${e.rating}★ from ${e.reviews.toLocaleString('en-IN')} reviews`)
  return `At ${e.priceText} ${parts.join(', ')}.`
}

/* ══════════════════════════════════════════════════════════════
   CLOSING TECHNIQUES
   ══════════════════════════════════════════════════════════════ */

const CLOSERS = {
  // Assumptive — presumes the decision was made
  assumptive: (e) =>
    `Let's lock it in: ${e ? the(e.name) : 'this one'}. Say the word and it's in your cart.`,

  // Alternative — two choices, no open-ended question
  alternative: (e) =>
    e
      ? `Would you like ${the(e.name)}, or should I line up the next best option in this range?`
      : 'Would you like the top pick, or shall I line up the next best option?',

  // Summary — recap the agreed value
  summary: (e) =>
    e
      ? `So to recap: ${e.name}, ${valueLine(e)} Shall I add it to your cart?`
      : 'To recap — the top rated option in your range. Shall I add it?',

  // Trial — low commitment next step
  trial: (e) => (e ? `Want me to add ${the(e.name)} to your cart so you can see the total?` : 'Want me to add the top pick to your cart?'),

  // Scarcity close — only when stock genuinely supports it
  scarcity: (e) =>
    e && e.isLowStock
      ? `With only ${e.stock} left, I'd grab it now. Shall I add it to your cart?`
      : null,

  // Benefit close — future outcome, grounded in the rating
  benefit: (e) =>
    e
      ? `Think about using it knowing it's rated ${e.rating}★ by ${e.reviews.toLocaleString('en-IN')} people. Ready to make it yours?`
      : null,
}

export function closeWith(technique, evidence) {
  const line = CLOSERS[technique]?.(evidence)
  if (!line) return null
  return line
}

export function pickCloser(evidence, stage) {
  const order =
    stage === 'objection'
      ? ['trial', 'assumptive', 'summary']
      : stage === 'recommending'
        ? ['trial', 'alternative', 'benefit']
        : ['assumptive', 'summary', 'alternative']
  for (const technique of order) {
    const line = closeWith(technique, evidence)
    if (line) return line
  }
  return closeWith('trial', evidence)
}

/* Action label for a product, e.g. "Add Organic Skincare Kit to cart" */
export function addLabel(name) {
  return `Add ${bareName(name)} to cart`
}

/* ══════════════════════════════════════════════════════════════
   OBJECTION REFRAMES
   Structure per objection type:
     1. ACKNOWLEDGE  — agree, never argue
     2. REFRAME      — introduce the evidence
     3. ADVANCE      — trial close
   ══════════════════════════════════════════════════════════════ */

export function reframeObjection(type, evidence, context = {}) {
  const e = evidence
  const price = e?.priceText || 'that price'
  const name = e?.name || 'this one'
  const budgetMax = context.budgetMax || null

  switch (type) {
    case 'expensive': {
      const delivery = e?.freeDelivery ? ' Delivery is on us, so the total at checkout is exactly the price you see.' : ''
      // valueLine already states the rating/review count, so only add the
      // authority line when there's no value line to carry the proof.
      // Never render "0 from 0 reviews" - for an unrated product say so honestly.
      const ratingClause =
        e && e.reviews > 0
          ? `${e.rating || 0}★ from ${e.reviews.toLocaleString('en-IN')} reviews at ${price}`
          : `an unrated new listing at ${price}`
      const proof = e && e.reviews > 0 && !valueLine(e) ? ` ${authorityLine(e)}.` : ''
      const respectBudget = budgetMax
        ? ` If ₹${budgetMax.toLocaleString('en-IN')} is a hard ceiling, say so and everything I show from here will fit it.`
        : ' If you tell me your actual ceiling, everything I show from here will fit it.'
      return {
        message:
          `That's fair — price is the part that has to work. Here's what you're actually getting: ${valueLine(e) || ratingClause}${proof}${delivery}${respectBudget}`,
        quickReplies: ['Show me cheaper options', 'What do I get for it?', "What's my hard ceiling?", 'Compare these'],
        advance: true,
      }
    }

    case 'think': {
      return {
        message: pick([
          `Of course — a considered decision beats a rushed one. The one thing I don't want you to skip is ${e ? `${name}, at ${price} with ${socialProof(e)}` : 'what you actually need'}. Anything specific you want to check before deciding?`,
          `No problem at all. Let me make it easy — what's the one thing that would make this an easy yes for you? If it's price, features or trust, I can answer it right now.`,
          `Take the time you need. The only thing I'd flag is this: ${e ? `stock is at ${e.stock} units` : 'stock moves on popular items'}. If there's a hard deadline for when you need it, let's sort that first.`,
        ]),
        quickReplies: ["It's the price", 'Tell me the specs', 'Is it worth it?', 'What if I still say no?'],
        advance: true,
      }
    }

    case 'quality': {
      return {
        message: pick([
          `Right question to ask. I won't just tell you it's great — ${e ? `${name} carries ${socialProof(e)}` : 'look at the review counts'}. ${e?.isTopRated ? 'A 4.5+ average is hard to sustain at that review volume.' : ''} Ask me for the specs and I'll give you the details, not adjectives.`,
          `Good instinct. Quality is the thing you can't return easily, so let's check it properly. ${e ? `${authorityLine(e)} — ${socialProof(e)}.` : ''} Want me to pull the full specification?`,
        ]),
        quickReplies: ['Show the specs', 'Show top rated', 'Compare quality', 'What if it breaks?'],
        advance: true,
      }
    }

    case 'competitor': {
      return {
        message: pick([
          `Good — you should compare. Two things decide this: what you actually pay at checkout, and what you know going in. ${e ? `${name} is ${socialProof(e)}${e.freeDelivery ? ', and delivery is free so the listed price is the final price' : ''}.` : "Send me the link and I'll tell you honestly whether they're a better deal."}`,
          `Comparing is exactly right. Tell me the other price and I'll tell you straight whether they win — I'd rather you buy the right thing than buy from me.`,
        ]),
        quickReplies: ['Send me their price', 'Show me both side by side', 'What support do I get?', 'Price match?'],
        advance: true,
      }
    }

    case 'trust': {
      return {
        message: pick([
          `Appreciate you saying that. Here's the part that matters: ${e ? `${name} has ${socialProof(e)}` : 'every product here carries customer reviews'}. I also only recommend what's in stock right now, so nothing I suggest will fail at checkout.`,
          `That's healthy scepticism. Two things you can verify: the rating, and the stock. ${e ? `${name} shows ${e.rating}★ from ${e.reviews} reviews and ${e.stock} units in stock` : 'stock is live'}. If anything in my recommendation doesn't match what you see on the product page, tell me and I'll correct it.`,
        ]),
        quickReplies: ['Show reviews', 'Is this the real price?', 'Let me check with someone', 'Add to cart'],
        advance: true,
      }
    }

    case 'need': {
      return {
        message: pick([
          `Tell me what you actually need to do with it, and I'll tell you honestly whether this fits. If it doesn't, I'll say so — a wrong fit costs you more than a delay.`,
          `Let's make sure it's the right one. What's the main job you need it to do? I'll match you to that rather than just to the highest rating.`,
        ]),
        quickReplies: ['Everyday use', 'For work', 'As a gift', 'Just show me the best'],
        advance: true,
      }
    }

    case 'commitment': {
      return {
        message: `Good — then let's make it easy. ${e ? `${name} at ${e.priceText}, ${socialProof(e)}.` : ''} I'll add it to your cart, and if it's not right you can simply not check out. Want me to do that now?`,
        quickReplies: ['Yes, add it to cart', 'Show me cheaper options', 'Not yet'],
        action: e ? { type: 'add_to_cart', product: e.product } : null,
        advance: true,
      }
    }

    default:
      return null
  }
}

/* ══════════════════════════════════════════════════════════════
   STAGE MACHINE
   ══════════════════════════════════════════════════════════════ */

export const STAGES = ['awareness', 'discovery', 'qualifying', 'recommending', 'objection', 'closing', 'won', 'lost']

export function advanceStage(current, next) {
  if (!STAGES.includes(next)) return current
  return next
}

export function stageForContext(ctx) {
  if (ctx.stage === 'won' || ctx.stage === 'lost') return ctx.stage
  if (ctx.objectionActive) return 'objection'
  if (ctx.products.length > 0) return 'recommending'
  if (ctx.budget) return 'qualifying'
  if (ctx.categories.length > 0) return 'discovery'
  return 'awareness'
}

export const STAGE_COPY = {
  awareness: 'Getting attention',
  discovery: 'Understanding the need',
  qualifying: 'Narrowing the budget',
  recommending: 'Presenting options',
  objection: 'Handling a concern',
  closing: 'Asking for the order',
  won: 'Order placed',
  lost: 'Walked away',
}
