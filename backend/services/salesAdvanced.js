export const STALL_TYPES = {
  authority: {
    keywords: [
      'ask my wife', 'ask my husband', 'ask my partner', 'ask my parents',
      'check with my wife', 'check with my husband', 'check with my boss',
      'ask my boss', 'ask the wife', 'ask my son', 'ask my daughter',
      'talk to my family', 'get approval', 'need permission', 'let me discuss',
      'my wife decides', 'my husband decides', 'let me ask her', 'let me ask him',
    ],
  },
  timing: {
    keywords: [
      'not right now', 'buy later', 'buy it later', 'after payday', 'next month',
      'next week', 'when the sale starts', 'when the sale is', 'wait for the sale',
      'come back later', 'buy next year', 'after my salary', 'right time',
      'when i need it', 'come back when', 'too early', 'not yet',
    ],
  },
  comparisonStall: {
    keywords: [
      'let me compare', 'compare with other', 'check other sites', 'check another shop',
      'see other options first', 'think and get back',
    ],
  },
}

export function detectStall(lower = '') {
  for (const [type, def] of Object.entries(STALL_TYPES)) {
    if (def.keywords.some((k) => lower.includes(k))) return type
  }
  return null
}

export const STALL_REFAMES = {
  authority:
    `Totally fair — that is a purchase worth agreeing on together. Here is what makes that conversation easy: I'll lay out the exact price, the delivery date and what you can return if it isn't right, so there are no surprises for anyone. Would it help if I put that in one short summary you can show them?`,
  timing:
    `Makes sense. I'll be honest about one thing so you can time it properly: this is a set price, not a countdown, so waiting does not cost you anything. When you do come back, I'll still have your size and colour preference saved. What's the date you're actually thinking?`,
  comparisonStall:
    `You should compare — I'd want you to. Two things worth checking on any other listing: whether the rating is backed by real reviews, and whether delivery is actually free at checkout. Bring me the price you find and I'll tell you honestly whether I can match it.`,
}

export const INITIAL_QUALIFICATION = { need: null, budget: null, timing: null, authority: null, notes: [] }

const AUTHORITY_WORDS = /my wife|my husband|my partner|my parents|my boss|my kids|she decides|he decides/i

export function extractQualification(ctx, lower = '', budget = null) {
  if (!ctx.qualification) ctx.qualification = { ...INITIAL_QUALIFICATION }
  const q = ctx.qualification

  // extractBudget() returns {min,max}; never store the object itself or
  // the brief renders "₹NaN".
  const budgetMax = budget == null ? null : Number(budget.max ?? budget) || null
  if (budgetMax && !q.budget) q.budget = budgetMax
  if (budgetMax) q.budget = budgetMax

  if (!q.need) {
    const m = lower.match(/(?:use it for|used for|need it for|want it for|looking for|mainly for)\s+(.{3,60})/)
    if (m) q.need = m[1].trim().replace(/[.!?]$/, '')
  }

  if (!q.timing) {
    const m = lower.match(/(?:by when|need it by|by [a-z]+|this week|next week|in a (?:month|week)|for my \w+|on \d)/)
    if (m) q.timing = m[0].trim()
  }

  if (!q.authority && AUTHORITY_WORDS.test(lower)) {
    const m = lower.match(/my (wife|husband|partner|parents|boss|kids)/)
    if (m) q.authority = `the customer checks with their ${m[1]}`
  }

  if (budgetMax && !q.notes.includes(`budget: ${budgetMax}`)) q.notes.push(`budget: ${budgetMax}`)
  return q
}

export function qualificationCoverage(q = INITIAL_QUALIFICATION) {
  const fields = ['need', 'budget', 'timing', 'authority']
  const answered = fields.filter((f) => q && q[f])
  return { answered, missing: fields.filter((f) => !q || !q[f]), score: answered.length / fields.length }
}

export function nextQualificationQuestion(ctx) {
  const q = ctx.qualification || INITIAL_QUALIFICATION
  const { missing } = qualificationCoverage(q)
  if (missing.includes('need')) {
    return `Before I narrow this down — what will you actually use it for? That decides everything else I show you.`
  }
  if (missing.includes('budget')) {
    return `Got it. So I don't waste your time with options outside it — what's the ceiling you're comfortable with?`
  }
  if (missing.includes('timing')) {
    return `One more and I'll stop asking — is there a date you need this by? That changes what I'd recommend for delivery.`
  }
  if (missing.includes('authority')) {
    return `Last thing: is this a decision you're making solo, or are you checking with someone first? I'd rather build in the details they'll ask about.`
  }
  return null
}

export function shouldAskQualification(ctx, lower, intentFlags = {}) {
  if (ctx.qualificationAsked >= 3) return false
  if (intentFlags.isGift || intentFlags.isComparison || intentFlags.isHandoff) return false
  if (intentFlags.isTrending || intentFlags.isDeals || intentFlags.isNew) return false
  if (intentFlags.isShipping) return false
  if (ctx.hasSearched && ctx.products?.length && ctx.qualification?.need && ctx.qualification?.budget) return false
  if (intentFlags.isBuying) return false
  return true
}

const STRONG_SIGNALS = [
  "i'll take it", 'i will take it', 'add it to my cart', 'add to cart', 'put it in my cart',
  'do it', 'go ahead', 'order it', 'place the order', 'book it', 'checkout', 'i want to buy this',
  'i will buy this', 'sounds good, i', 'wrap it up', 'just like that', 'ill take it', 'add that to cart',
]

const SOFT_SIGNALS = [
  'is it available', 'is it in stock', 'how do i pay', 'what payment', 'delivery time',
  'looks good', 'sounds good', 'i like this one', 'this one', 'the blue one', 'does it come in',
  'can i get it', 'how fast', 'warranty', 'return policy', 'i am ready', 'im ready',
]

export function detectBuyingSignal(lower = '') {
  if (STRONG_SIGNALS.some((s) => lower.includes(s))) return 'strong'
  if (SOFT_SIGNALS.some((s) => lower.includes(s))) return 'soft'
  return null
}

export function authorityLadder(e) {
  if (!e) return []
  const discountNow = Number(e.discount) || 0
  const hasOldPrice = Number(e.oldPrice) > Number(e.price)
  const steps = []
  steps.push({
    rung: 1,
    label: 'Hold value',
    text: `I'm not going to talk you into paying something I don't believe is fair — ${e.priceText} is what this sells for everywhere, and ${socialProofSafe(e)}.`,
  })
  if (hasOldPrice || discountNow > 0) {
    steps.push({
      rung: 2,
      label: 'Point to real existing discount',
      text: `The one thing I can point to honestly: it's already down from ${e.oldPriceText}, so you're saving ${e.priceText} today without asking me for a favour.`,
    })
  }
  if (e.freeDelivery) {
    steps.push({
      rung: 3,
      label: 'Add real free delivery',
      text: `What I can do is throw in free delivery, so there's no charge added at checkout — that's a real number, not a promise.`,
    })
  }
  steps.push({
    rung: 4,
    label: 'Concede and hand over control',
    text: `Beyond that I'd be inventing a discount, and I'd rather not. Here's the honest version: ${e.priceText} is the floor. If that works, I'll set it up; if it doesn't, tell me the number that does and I'll tell you straight whether it's possible.`,
  })
  return steps
}

function socialProofSafe(e) {
  if (!e) return ''
  if (e.reviews > 0) return `${e.rating}★ across ${e.reviews.toLocaleString('en-IN')} reviews`
  return `it's a new listing with no reviews yet`
}

export function buildLeadBrief(session, ctx, reason = 'Customer requested a person') {
  const q = ctx.qualification || INITIAL_QUALIFICATION
  const { missing } = qualificationCoverage(q)
  const objections = ctx.objectionTypes || []
  const counts = objections.reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {})
  const top = ctx.products?.[0] || ctx.recommendedIds?.[0] || null

  const lines = []
  lines.push(`Reason: ${reason}`)
  lines.push(`Turns in conversation: ${ctx.turnCount || 0}`)
  lines.push(`Stage: ${session.stage || 'discovery'}`)
  lines.push('')
  lines.push('WHAT I KNOW')
  lines.push(`- Needs: ${q.need || 'not established'}`)
  lines.push(`- Budget: ${q.budget ? `₹${Number(q.budget).toLocaleString('en-IN')}` : 'not established'}`)
  lines.push(`- Timing: ${q.timing || 'not established'}`)
  lines.push(`- Decision maker: ${q.authority || 'not established'}`)
  lines.push('')
  lines.push('WHAT IS STILL UNKNOWN')
  lines.push(missing.length ? missing.map((m) => `- ${m}`).join('\n') : '- Nothing, qualification is complete')
  lines.push('')
  lines.push('OBJECTIONS RAISED')
  lines.push(
    Object.keys(counts).length
      ? Object.entries(counts).map(([t, n]) => `- ${t}: ${n}x`).join('\n')
      : '- None recorded'
  )
  lines.push('')
  lines.push(`Close attempts made: ${ctx.closeAttempts || 0}`)
  lines.push(`Top product on screen: ${top ? top.name || top : 'none'}`)
  lines.push('')
  lines.push('HANDOFF NOTE')
  lines.push(
    `Customer was escalated after ${objections.length || 0} recorded objection(s). Do not re-pitch the same angle — ${counts.expensive ? 'price has been discussed several times, so lead with total cost and delivery rather than features.' : 'address the objection they actually repeated.'}`
  )

  return lines.join('\n')
}

export function shouldAttemptClose(ctx) {
  if (ctx.closeAttempts >= 3) return false
  if (ctx.turnCount < 2) return false
  // Deliberately does not require products to already be present: the
  // caller searches first, so "I'll take it" still closes rather than
  // being sent back to a question.
  return true
}

export function pickCloseTechnique(ctx) {
  const q = ctx.qualification || INITIAL_QUALIFICATION
  const { score } = qualificationCoverage(q)
  if (q.timing) return 'deadline'
  if (score >= 0.75) return 'assumptive'
  if (ctx.closeAttempts >= 2) return 'choice'
  return 'assumptive'
}

export const CLOSE_TEMPLATES = {
  deadline: `You've told me you need this by ${'{timing}'}, so let's get it moving — I'll set up {name} at {price} and free delivery gets it to you in time.`,
  assumptive: `Based on what you've told me, {name} is the right one for you. Shall I add it to your cart?`,
  choice: `Two ways forward: I can set up {name} now, or you can tell me the one thing that's holding you back and we'll solve it properly. Which is it?`,
}