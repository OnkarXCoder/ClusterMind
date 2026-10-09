import Product from '../models/Product.js'
import { generateResponse as synthsellGenerate, isAvailable as synthsellAvailable } from './synthsellBridge.js'
import { buildGiftFilter, getGiftRecipients, resolveGiftRecipient } from '../data/giftRecipients.js'
import {
  buildLeadBrief,
  CLOSE_TEMPLATES,
  detectBuyingSignal,
  detectStall,
  extractQualification,
  nextQualificationQuestion,
  pickCloseTechnique,
  shouldAskQualification,
  shouldAttemptClose,
  STALL_REFAMES,
} from './salesAdvanced.js'
import {
  addLabel,
  advanceStage,
  authorityLine,
  bareName,
  buildEvidence,
  pick,
  pickCloser,
  reframeObjection,
  socialProof,
  stageForContext,
  the,
  urgencyLine,
  valueLine,
} from './salesTechniques.js'

const GIFT_RECIPIENT_LABELS = Object.fromEntries(
  getGiftRecipients().map((item) => [item.key, item.label.toLowerCase()])
)

const sessions = new Map()

/* ══════════════════════════════════════════════════════════════
   CONVERSATIONAL AI SALESPERSON — Priya
   Tracks what's been asked, searches ASAP, varied responses
   ══════════════════════════════════════════════════════════════ */

const CATEGORY_KEYWORDS = {
  Electronics: ['laptop', 'notebook', 'macbook', 'computer', 'pc', 'phone', 'mobile', 'smartphone', 'android', 'iphone', 'tablet', 'ipad', 'tab', 'headphone', 'earphone', 'earbuds', 'airpods', 'headset', 'smartwatch', 'watch', 'camera', 'dslr', 'monitor', 'display', 'screen', 'keyboard', 'mouse', 'speaker', 'bluetooth speaker', 'soundbar', 'console', 'playstation', 'xbox', 'nintendo', 'tv', 'television', 'ssd', 'router', 'wifi', 'gadget', 'tech', 'electronic'],
  Fashion: ['shirt', 'tshirt', 't-shirt', 'jeans', 'pants', 'dress', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'bag', 'backpack', 'hat', 'cap', 'sunglasses', 'jewelry', 'clothing', 'outfit', 'wear', 'fashion', 'clothes'],
  Beauty: ['skincare', 'makeup', 'cosmetic', 'perfume', 'fragrance', 'lotion', 'cream', 'serum', 'shampoo', 'hair dryer', 'beauty', 'moisturizer', 'sunscreen'],
  'Home & Kitchen': ['kitchen', 'home', 'furniture', 'chair', 'table', 'lamp', 'desk', 'bed', 'sofa', 'cookware', 'appliance', 'coffee maker', 'blender', 'vacuum', 'home decor', 'home'],
  Sports: ['sports', 'gym', 'fitness', 'yoga', 'dumbbell', 'treadmill', 'running', 'cycling', 'football', 'cricket', 'basketball', 'tennis', 'sport'],
  Books: ['book', 'novel', 'textbook', 'magazine', 'comic', 'reading'],
  'Toys & Games': ['toy', 'game', 'puzzle', 'board game', 'lego', 'doll', 'action figure'],
  Automotive: ['car', 'bike', 'motorcycle', 'automotive', 'vehicle', 'helmet'],
  Grocery: ['grocery', 'food', 'snack', 'beverage'],
}

const BUDGET_PATTERNS = [
  /under\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /below\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /less\s*than\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /budget\s*(?:of|is|:)?\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /around\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /max(?:imum)?\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
  /(\d[\d,]*)\s*(?:budget|range)/i,
  /between\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)/i,
]

const BUYING_KEYWORDS = ['buy', 'purchase', 'order', 'add to cart', 'checkout', 'pay', 'get this', 'want to buy', 'ready to buy', 'grab', 'place order', 'lets do it', "let's do it", 'sign me up', 'i will take it', "i'll take it", 'i want it', 'give me']
const COMPARISON_KEYWORDS = ['compare', 'difference', 'vs', 'versus', 'better', 'which is better', 'which one']
const HANDOFF_KEYWORDS = ['human', 'agent', 'representative', 'talk to someone', 'real person', 'customer service', 'support', 'manager']
const OBJECTION_KEYWORDS = {
  expensive: ['expensive', 'too costly', 'pricey', 'overpriced', 'out of budget', 'afford', 'costs too much', 'too much', 'spend that much', 'bit pricey', 'not cheap', 'costs a lot', 'too pricey', 'cant afford', "can't afford", 'broke', 'budget is tight'],
  think: ['think about', 'think it over', 'consider', 'later', 'not sure', 'undecided', 'ponder', 'need time', 'come back', 'not now', 'maybe', 'not decided', 'still deciding', 'leave it'],
  quality: ['quality', 'durable', 'durable enough', 'lasts', 'build quality', 'material'],
  competitor: ['cheaper', 'competitor', 'better price', 'elsewhere', 'other store', 'found it cheaper', 'less expensive', 'amazon', 'flipkart', 'another site', 'other website'],
  trust: ['trust', 'legit', 'scam', 'fake', 'authentic', 'is this real', 'reliable', 'genuine', 'original'],
  need: ['do i need', 'is it useful', 'actually need', 'is this necessary', 'do i really'],
  commitment: ['should i', 'shall i', 'worth it', 'worth buying', 'confident', 'not convinced', 'sell me'],
}
const GIFT_KEYWORDS = ['gift', 'present', 'for someone', 'for my', 'birthday', 'anniversary', 'surprise']
const TRENDING_KEYWORDS = ['trending', 'popular', 'best seller', 'top rated', 'hot', 'trending now', 'bestselling']
const DEAL_KEYWORDS = ['deal', 'discount', 'discounted', 'sale', 'cheap', 'cheapest', 'best deal', 'offers today', 'coupon', 'offering']
const NEW_KEYWORDS = ['new arrival', 'latest', 'just launched', 'new in', 'brand new']
const SHIPPING_KEYWORDS = ['free delivery', 'free shipping', 'delivery', 'shipping', 'deliver it', 'how long does it take', 'when will it arrive', 'arrives', 'shipping cost', 'delivery charge', 'will it reach']

/* ── NEGATION GUARDS ──
   Prevents "I'm NOT ready to buy" being read as buying intent, and
   "the price is fine, I just want to compare" being read as a price
   objection. Each guard is a phrase that cancels its intent.        */
const NEGATION_GUARDS = {
  buying: [
    /not\s+ready/,
    /don'?t\s+want\s+to\s+buy/,
    /do\s*n[o']t\s+want/,
    /not\s+buying/,
    /just\s+looking/,
    /only\s+(?:browsing|asking|comparing)/,
    /not\s+now/,
    /no\s+thanks/,
    /wouldn'?t\s+buy/,
  ],
  handoff: [/no\s+need/, /never\s*mind/, /forget\s+it/],
  objection: [
    /price\s+is\s+(?:fine|ok|okay|good|no\s+problem)/,
    /it'?s\s+not\s+(?:the\s+)?price/,
    /not\s+about\s+(?:the\s+)?price/,
    /(?:it'?s\s+)?(?:just\s+)?not\s+ready/,
    /no\s+objection/,
  ],
}

const isNegated = (lower, intent) =>
  (NEGATION_GUARDS[intent] || []).some((pattern) => pattern.test(lower))

/* ── OBJECTION SCORING ──
   Matches every objection, scores by keyword specificity, then resolves
   the highest-scoring type. Compound messages ("too expensive and I
   don't trust the brand") surface the dominant concern.             */
function scoreObjections(lower) {
  if (isNegated(lower, 'objection')) return []
  const scores = []
  for (const [type, keywords] of Object.entries(OBJECTION_KEYWORDS)) {
    let score = 0
    const hits = []
    for (const keyword of keywords) {
      if (!lower.includes(keyword)) continue
      // Longer keyword = more specific = higher confidence
      score += keyword.includes(' ') ? 3 : 1
      hits.push(keyword)
    }
    if (score > 0) scores.push({ type, score, hits })
  }
  return scores.sort((a, b) => b.score - a.score)
}

function extractBudget(message) {
  for (const pattern of BUDGET_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      const num1 = parseInt(match[1].replace(/,/g, ''), 10)
      if (match[2]) {
        const num2 = parseInt(match[2].replace(/,/g, ''), 10)
        return { min: Math.min(num1, num2), max: Math.max(num1, num2) }
      }
      return { min: 0, max: num1 }
    }
  }
  return null
}

function detectCategories(message) {
  const lower = message.toLowerCase()
  const found = []
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) found.push(category)
  }
  return found
}

function isBudgetAnswer(message) {
  const lower = message.toLowerCase().trim()
  if (extractBudget(message)) return true
  if (/under\s*\d/i.test(lower)) return true
  if (/\d[\d,]*\s*(?:k|lakh)/i.test(lower)) return true
  if (/no\s*budget|any\s*price|any\s*budget|doesn.t\s*matter|whatever/i.test(lower)) return true
  return false
}

function formatProduct(p) {
  return {
    id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice,
    discount: p.discount, rating: p.rating, reviews: p.reviews,
    image: p.image, category: p.category, brand: p.brand,
    stock: p.stock, freeDelivery: p.freeDelivery, description: p.description, badge: p.badge,
  }
}

/* ══════════════════════════════════════════════════════════════
   RECOMMENDATION COMPOSER
   Leads with the single best pick + why, then closes. Never opens
   with "here are your results" — a salesperson recommends, not lists.
   ══════════════════════════════════════════════════════════════ */
function recommendReply(products, { lead = 'Here are the best', stage = 'recommending', prefix = '' } = {}) {
  if (!products || products.length === 0) return null
  const e = buildEvidence(products[0])
  const others = products.length - 1

  const opener = prefix || (e.isTopRated && e.isPopular
    ? `Straight to it: ${the(e.name)}. ${authorityLine(e)}.`
    : e.isTopRated
      ? `My pick is ${the(e.name)} — ${authorityLine(e)}.`
      : `I'd start with ${the(e.name)}.`)

  const proof = valueLine(e) || `${socialProof(e)}.`
  const urgency = urgencyLine(e)
  const closer = pickCloser(e, stage)
  const tail = others > 0
    ? ` ${others === 1 ? 'The other option' : `The other ${others} options`} ${others === 1 ? 'is' : 'are'} still on screen if you want to weigh up.`
    : ''

  return {
    message: `${opener} ${proof}${urgency ? ' ' + urgency : ''} ${closer}${tail}`,
    products: products.map(formatProduct),
    quickReplies: [addLabel(e.name), 'Show me cheaper options', 'Compare these', 'Show more'],
    action: null,
    stage,
  }
}

function buildComparisonTable(products) {
  if (!products || products.length < 2) return null
  return {
    headers: ['Feature', ...products.map(p => p.name)],
    rows: [
      ['Price', ...products.map(p => `₹${p.price.toLocaleString()}`)],
      ['Brand', ...products.map(p => p.brand || 'N/A')],
      ['Rating', ...products.map(p => `${p.rating} (${p.reviews} reviews)`)],
      ['Discount', ...products.map(p => p.discount ? `${p.discount}% off` : 'N/A')],
      ['Stock', ...products.map(p => p.stock > 0 ? 'In Stock' : 'Out of Stock')],
    ],
  }
}

/* ══════════════════════════════════════════════════════════════
   SESSION MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

export function createSession(customerId = null, existingSessionId = null) {
  const sessionId = existingSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const session = {
    id: sessionId,
    customerId,
    stage: 'awareness',
    context: {
      categories: [],
      budget: null,
      useCase: null,
      products: [],
      lastAskedCategory: false,
      lastAskedBudget: false,
      lastAskedUseCase: false,
      hasSearched: false,
      turnCount: 0,
      mentionedProductIds: [],
      giftIntent: false,
      giftRecipient: null,
      objectionActive: false,
      objectionTypes: [],
      objectionsRaised: 0,
      closeAttempts: 0,
      lastCloseAttemptTurn: 0,
      recommendedIds: [],
    },
    messages: [],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  }
  sessions.set(sessionId, session)
  return session
}

export function getSession(id) { return sessions.get(id) || null }
export function getAllSessions() { return Array.from(sessions.values()) }

export function getWelcomeMessage() {
  return {
    message: `Hey there! I'm Priya, your shopping assistant. I can help you find the perfect product, compare options, or score the best deals. What brings you here today?`,
    quickReplies: ['Find a product', 'Show trending', 'Best deals today', 'Help me choose'],
  }
}

/* ══════════════════════════════════════════════════════════════
   MAIN MESSAGE PROCESSOR — Conversational Flow
   ══════════════════════════════════════════════════════════════ */

export async function processMessage(sessionId, userMessage, context = {}) {
  let session = sessions.get(sessionId)
  if (!session) session = createSession(context.customerId || null, sessionId)

  session.messages.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() })
  session.lastActivity = new Date().toISOString()
  session.context.turnCount++

  const lower = userMessage.toLowerCase().trim()
  const ctx = session.context

  /* ── Stall / buying-signal detection must run before intent flags,
     because "I will buy it next month" is a timing stall, not buying intent. */
  const budget = extractBudget(userMessage)
  const stall = detectStall(lower)
  const buyingSignal = detectBuyingSignal(lower)
  extractQualification(ctx, lower, budget)

  /* ── Detect intents ──
     Negation-guarded so "I'm not ready to buy" is not treated as
     buying intent, and "price is fine, just comparing" is not
     treated as a price objection.                                   */
  const categories = detectCategories(userMessage)
  const isBudget = isBudgetAnswer(userMessage)
  const isHandoff = HANDOFF_KEYWORDS.some(kw => lower.includes(kw)) && !isNegated(lower, 'handoff')
  const isComparison = COMPARISON_KEYWORDS.some(kw => lower.includes(kw))
  const isBuying = BUYING_KEYWORDS.some(kw => lower.includes(kw)) && !isNegated(lower, 'buying') && !stall
  const isGift = GIFT_KEYWORDS.some(kw => lower.includes(kw))
  const isTrending = TRENDING_KEYWORDS.some(kw => lower.includes(kw))
  const isDeals = DEAL_KEYWORDS.some(kw => lower.includes(kw))
  const isShipping = SHIPPING_KEYWORDS.some(kw => lower.includes(kw))
  const isNew = NEW_KEYWORDS.some(kw => lower.includes(kw))
  const objectionScores = scoreObjections(lower)
  const topObjection = objectionScores[0] || null

  // Add detected categories to context
  if (categories.length > 0) {
    for (const c of categories) { if (!ctx.categories.includes(c)) ctx.categories.push(c) }
  }
  // Extract product type keyword for text search.
  // Matches plural/inflected forms too ("headphones" -> "headphone"),
  // otherwise the search falls back to the whole category and the
  // customer gets unrelated products as "cheaper alternatives".
  const categoryNames = Object.values(CATEGORY_KEYWORDS).flat()
  const words = lower.split(/\s+/).filter((w) => /^[a-z-]+$/.test(w))
  const stemMatch = (w) =>
    categoryNames.find((name) => name === w || (w.length > 3 && (name.startsWith(w) || w.startsWith(name))))
  const productType = words.find(
    (w) => w.length > 2 && stemMatch(w) && !categories.some((c) => c.toLowerCase() === w)
  )
  if (productType && !ctx.productType) ctx.productType = stemMatch(productType)
  if (isGift) ctx.giftIntent = true

  // Resolve which relation the gift is for ("gift for my father" -> "dad")
  const giftKey = resolveGiftRecipient(userMessage)
  if (giftKey) {
    ctx.giftRecipient = giftKey
    ctx.giftIntent = true
  }

  // Clear the objection flag unless this turn actually raised one
  ctx.objectionActive = !!topObjection
  if (topObjection) {
    ctx.objectionsRaised++
    if (!ctx.objectionTypes.includes(topObjection.type)) ctx.objectionTypes.push(topObjection.type)
  }

  const leadEvidence = buildEvidence(ctx.products[0])

  /* ══════════════════════════════════════════════════════════════
     ORDER MATTERS: an explicit buy request must beat the objection
     pass, otherwise "I'm ready to buy" is treated as reluctance.
     ══════════════════════════════════════════════════════════════ */
  /* ── BUYING SIGNAL → CLOSE ──
     Runs before the generic buy branch so an explicit "I'll take it"
     carries an add_to_cart action instead of falling into a search
     that only asks a question. */
  if (buyingSignal === 'strong' && shouldAttemptClose(ctx)) {
    let closeProducts = ctx.products
    if (!closeProducts?.length) {
      closeProducts = await searchProducts({
        categories: ctx.categories.length > 0 ? ctx.categories : undefined,
        budget: ctx.budget || undefined,
        text: ctx.productType || undefined,
        giftRecipient: ctx.giftRecipient || undefined,
        limit: 4,
      })
      if (closeProducts.length) {
        ctx.products = closeProducts
        ctx.hasSearched = true
        ctx.recommendedIds = closeProducts.map((p) => p.id)
      }
    }
    const closeTarget = closeProducts?.length ? buildEvidence(closeProducts[0]) : null
    if (closeTarget) {
      const technique = pickCloseTechnique(ctx)
      const template = CLOSE_TEMPLATES[technique] || CLOSE_TEMPLATES.assumptive
      const q = ctx.qualification || {}
      const line = template
        .replace('{timing}', q.timing || 'your timeline')
        .replace('{name}', the(closeTarget.name))
        .replace('{price}', closeTarget.priceText)
      return respond(session, {
        message: line,
        quickReplies: ['Yes, add it to cart', 'Show me one more option', 'What is the total?'],
        action: { type: 'add_to_cart', product: closeTarget.product },
        products: [closeProducts[0]],
        stage: 'closing',
      })
    }
  }

  if (isBuying) {
    if (ctx.products.length === 0) {
      const products = await searchProducts({
        categories: ctx.categories.length > 0 ? ctx.categories : undefined,
        budget: ctx.budget || undefined,
        text: ctx.productType || undefined,
        giftRecipient: ctx.giftRecipient || undefined,
        limit: 4,
      })
      if (products.length > 0) {
        ctx.products = products
        ctx.hasSearched = true
        ctx.recommendedIds = products.map((p) => p.id)
        const e = buildEvidence(products[0])
        session.stage = advanceStage(session.stage, 'closing')
        return respond(session, {
          message: `Perfect timing — here's the one I'd put my name to: ${e.name}. ${valueLine(e)} ${urgencyLine(e)} Shall I add it to your cart?`,
          products: [products[0]],
          quickReplies: ['Add to cart', 'Show alternatives', 'Compare these'],
          stage: 'closing',
        })
      }
    }

    if (ctx.products.length === 1) {
      const e = leadEvidence
      session.stage = advanceStage(session.stage, 'won')
      return respond(session, {
        message: `Great choice. ${e.name} at ${e.priceText}${e.hasDiscount ? ` — you keep ${e.savingsText}` : ''}. ${socialProof(e)}. Adding it now.`,
        products: [e.product],
        quickReplies: ['Go to checkout', 'Keep shopping', 'Add gift wrap'],
        action: { type: 'add_to_cart', product: e.product },
        stage: 'won',
      })
    }

    if (ctx.products.length > 1) {
      const recommended = ctx.products[0]
      const e = buildEvidence(recommended)
      // An explicit "I want to buy" IS the yes — don't ask again
      session.stage = advanceStage(session.stage, 'won')
      return respond(session, {
        message: `Done — I've added ${the(e.name)}. ${valueLine(e)} ${pick([
          'Checkout whenever you\'re ready.',
          'Take your time looking it over before checkout.',
        ])}${e.isLowStock ? ` Worth noting: only ${e.stock} left.` : ''}`,
        products: [e.product],
        quickReplies: ['Go to checkout', 'Keep shopping', 'Show alternatives'],
        action: { type: 'add_to_cart', product: e.product },
        stage: 'won',
      })
    }

    return respond(session, {
      message: "I'd love to help you buy. Tell me what you're after and I'll find the best option, then add it in one go.",
      quickReplies: ['Electronics', 'Fashion', 'Home & Kitchen', 'Show trending'],
      stage: 'discovery',
    })
  }

  /* ══════════════════════════════════════════════════════════════
     OBJECTIONS — Acknowledge → Reframe with evidence → Trial close
     Highest-confidence objection wins. Evidence is always grounded
     in the actual product the customer is looking at.
     ══════════════════════════════════════════════════════════════ */
  if (topObjection) {
    const type = topObjection.type

    // Try SynthSell model first if available
    if (synthsellAvailable()) {
      try {
        const productCtx = leadEvidence
          ? `${leadEvidence.name} - ₹${leadEvidence.price} (${leadEvidence.category}), ${leadEvidence.rating}★ from ${leadEvidence.reviews} reviews`
          : ''
        const aiResponse = await synthsellGenerate(userMessage, productCtx, ctx.conversationHistory || [])
        if (aiResponse) {
          return respond(session, {
            message: aiResponse,
            quickReplies: ['Add to cart', 'Show more options', 'Compare', 'Talk to human'],
            stage: 'objection',
          })
        }
      } catch (err) {
        // Fall through to rules-based engine
      }
    }

    const reframe = reframeObjection(type, leadEvidence, { budgetMax: ctx.budget?.max })

    if (reframe) {
      // Persist through normal objections, but stop grinding once the
      // customer has raised five — offer a person instead of more pitch.
      if (ctx.objectionsRaised >= 5 && !reframe.action && !ctx.handoffOffered) {
        ctx.handoffOffered = true
        return respond(session, {
          message: `I can tell I'm not landing this one, and I'd rather you get a straight answer than another pitch. ${leadEvidence ? `For ${the(leadEvidence.name)} at ${leadEvidence.priceText}, ${socialProof(leadEvidence)} is the honest summary.` : ''} Would you like me to put you through to someone who can talk through the specifics with you?`,
          quickReplies: ['Yes, connect me to someone', 'No, keep going', 'Just tell me the price'],
          action: { type: 'human_handoff', reason: 'Customer raised 5+ unresolved objections' },
          stage: 'objection',
        })
      }

      // Price objection with alternatives that still fit the budget
      if (type === 'expensive' && leadEvidence) {
        const cheaper = await searchProducts({
          categories: ctx.categories.length > 0 ? ctx.categories : undefined,
          budget: { min: 0, max: Math.max(Math.round(leadEvidence.price * 0.75), ctx.budget?.min || 0) },
          text: ctx.productType || undefined,
          giftRecipient: ctx.giftRecipient || undefined,
          strictRelevance: true,
          limit: 3,
        })
        if (cheaper.length > 0) {
          const best = buildEvidence(cheaper[0])
          // Replace rather than append — appending duplicated rows and
          // inflated the "N other options" count in the closer
          const seen = new Set(cheaper.map((p) => p.id))
          ctx.products = [...cheaper, ...ctx.products.filter((p) => !seen.has(p.id))]
          return respond(session, {
            message: `Totally fair. Rather than talk you into the ${leadEvidence.priceText} one, here's what else does the job: ${the(best.name)} at ${best.priceText}${best.hasDiscount ? `, and you keep ${best.savingsText}` : ''}. ${socialProof(best)}. That's ${leadEvidence.price - best.price > 0 ? `${Math.round(leadEvidence.price - best.price).toLocaleString('en-IN')} rupees less` : 'about the same'} and still a strong review score. Which direction do you want to go?`,
            products: cheaper.map(formatProduct),
            quickReplies: [addLabel(best.name), 'Show me the expensive one', 'Something cheaper still'],
            stage: 'objection',
          })
        }
      }

      return respond(session, {
        message: reframe.message,
        products: leadEvidence ? [leadEvidence.product] : [],
        quickReplies: reframe.quickReplies,
        action: reframe.action || null,
        stage: 'objection',
      })
    }
  }


  /* ── STALL / DELAY OBJECTIONS ──
     These are handled before buying signals and before the generic
     objection reframe, because "I need to ask my wife" is not a price
     objection and must not be answered with a price argument.          */
  if (stall) {
    const brief = buildLeadBrief(session, ctx, `Stall recorded: ${stall}`)
    ctx.objectionsRaised++
    ctx.objectionActive = true
    ctx.objectionTypes = [...(ctx.objectionTypes || []), stall]
    const askForSummary = stall === 'authority'
    return respond(session, {
      message: STALL_REFAMES[stall] || STALL_REFAMES.timing,
      quickReplies: askForSummary
        ? ['Yes, write me the summary', 'No, I will ask them', 'Just tell me the price']
        : ['What is your price?', 'Show me cheaper options', 'Compare it'],
      action: stall === 'authority' ? { type: 'lead_brief', reason: 'Needs approval from another person', leadBrief: brief } : null,
      stage: 'objection',
    })
  }

  /* ── HUMAN HANDOFF ── */
  if (isHandoff) {
    const brief = buildLeadBrief(session, ctx, 'Customer requested a human agent')
    return respond(session, {
      message: `Of course — putting you through to a person now.\n\nBefore I do, I've written up a brief so you don't have to repeat yourself: everything you've told me, your budget, and what we've already ruled out.\n\n${brief}\n\nIs there anything you'd like me to add to that before I hand you over?`,
      quickReplies: ['Just connect me', 'Add one thing first', 'Never mind'],
      action: { type: 'human_handoff', reason: 'Customer requested human agent', leadBrief: brief },
      stage: 'objection',
    })
  }

  /* ── COMPARISON ── */
  if (isComparison) {
    if (ctx.products.length >= 2) {
      const toCompare = ctx.products.slice(0, 3)
      const ev = toCompare.map((p) => buildEvidence(p))
      const cheapest = ev.reduce((a, b) => (a.price <= b.price ? a : b))
      const bestRated = ev.reduce((a, b) => (a.rating >= b.rating ? a : b))
      const mostReviewed = ev.reduce((a, b) => (a.reviews >= b.reviews ? a : b))
      const cheapestName = bareName(cheapest.name)
      const ratedName = bareName(bestRated.name)

      // Say what actually differs instead of making them read the table
      let verdict
      if (bestRated.name === cheapest.name) {
        verdict = `${the(bestRated.name)} wins on both counts — it's ${bestRated.rating}★ and also the cheapest of the three at ${bestRated.priceText}, so there's no trade-off to make.`
      } else if (cheapest.name === mostReviewed.name) {
        verdict = `If reviews decide it, ${the(cheapest.name)} — ${cheapest.reviews.toLocaleString('en-IN')} reviews at the lowest price. If you want the highest rating instead, that's ${the(bestRated.name)} at ${bestRated.rating}★ for ${bestRated.priceText}.`
      } else {
        verdict = `Two different wins here: ${the(cheapest.name)} at ${cheapest.priceText} is the cheaper option, and ${the(bestRated.name)} has the better rating at ${bestRated.rating}★. Tell me which matters more and I'll narrow it to one.`
      }

      return respond(session, {
        message: `${pick([
          'Here they are side by side:',
          'Straight comparison:',
          'Let me lay them out:',
        ])} ${verdict}`,
        products: toCompare.map(formatProduct),
        comparison: buildComparisonTable(toCompare),
        quickReplies: [...new Set([
          `Add ${cheapestName} to cart`,
          ...(ratedName === cheapestName ? [] : [`Add ${ratedName} to cart`]),
          'Show more options',
          'Talk to a human',
        ])],
      })
    }
    return respond(session, {
      message: pick([
        "I'll need at least 2 products to compare. Let me find some options for you first — what type of product are you looking for?",
        "Sure! But first let me find some options. What kind of product interests you?",
      ]),
      quickReplies: ['Laptop', 'Phone', 'Headphones', 'Something else'],
    })
  }

  /* ── TRENDING / POPULAR ── */
  if (isTrending) {
    const products = await searchProducts({ sortBy: 'rating', limit: 5 })
    ctx.products = products
    ctx.hasSearched = true
    ctx.recommendedIds = products.map((p) => p.id)
    if (products.length > 0) {
      return respond(session, recommendReply(products, {
        stage: 'recommending',
        prefix: 'Here are the highest rated in stock right now.',
      }))
    }
  }

  /* ── SHIPPING / DELIVERY ── */
  // Checked before DEALS because questions like "do you offer free delivery?"
  // contain deal-ish words and used to fall through to the deals branch.
  if (isShipping && !isNegated(lower, 'shipping')) {
    const lead = ctx.products?.length ? buildEvidence(ctx.products[0]) : null
    const deliveryAnswer = lead
      ? lead.freeDelivery
        ? `Yes — ${the(lead.name)} includes free delivery, so the price you see at checkout is the final price.`
        : `For ${the(lead.name)} at ${lead.priceText}, delivery is charged separately based on your pin code. You will see the exact amount on the checkout screen before you pay, so there is no surprise at the end.`
      : `Delivery depends on the product and your pin code. Add an item and I can tell you whether that specific one ships free — the checkout screen always shows the full total including any shipping before you pay.`
    return respond(session, {
      message: deliveryAnswer,
      quickReplies: ['Show me free-delivery items', 'What is my total?', 'Best deals right now'],
      stage: ctx.stage || 'discovery',
    })
  }

  /* ── DEALS ── */
  if (isDeals) {
    const products = await searchProducts({ sortBy: 'discount', limit: 5 })
    ctx.products = products
    ctx.hasSearched = true
    ctx.recommendedIds = products.map((p) => p.id)
    if (products.length > 0) {
      const best = buildEvidence(products[0])
      return respond(session, recommendReply(products, {
        stage: 'recommending',
        prefix: best.hasDiscount
          ? `Biggest saving right now: ${the(best.name)}, and you keep ${best.savingsText}.`
          : `Best value in the sale: ${the(best.name)}.`,
      }))
    }
  }

  /* ── NEW ARRIVALS ── */
  if (isNew) {
    const products = await searchProducts({ sortBy: 'createdAt', limit: 5 })
    ctx.products = products
    ctx.hasSearched = true
    ctx.recommendedIds = products.map((p) => p.id)
    if (products.length > 0) {
      return respond(session, recommendReply(products, {
        stage: 'recommending',
        prefix: 'Just landed, and the reviews are already moving:',
      }))
    }
  }

  /* ── GIFT INTENT ──
     Re-enters on a follow-up budget/ceiling once the recipient is known,
     otherwise "under 1500" after a gift request discards the gift context. */
  if (isGift || (ctx.giftIntent && ctx.giftRecipient && isBudget)) {
    ctx.giftIntent = true
    if (budget) ctx.budget = budget
    const known = ctx.giftRecipient
    const products = await searchProducts({
      sortBy: 'rating',
      giftRecipient: known,
      budget: ctx.budget || undefined,
      limit: 4,
    })
    ctx.products = products
    ctx.hasSearched = true

    // No relation known yet — qualify before recommending
    if (!known) {
      return respond(session, {
        message: pick([
          "Love it, gifting is the fun part. Who's the gift for? I'll match it to their interests rather than just showing you our best sellers.",
          "Great choice. Tell me who it's for and I'll narrow it down properly — the same product can be perfect for one person and wrong for another.",
        ]),
        quickReplies: ['For my father', 'For my best friend', 'For my wife', 'For my mother'],
        stage: 'qualifying',
      })
    }

    if (products.length === 0) {
      return respond(session, {
        message: `I don't have a strong match for a ${GIFT_RECIPIENT_LABELS[known]} in that range yet. Give me a budget and I'll find the closest fit, or I can put in a request for something specific.`,
        quickReplies: ['Increase my budget', 'Show anything', 'Request a product'],
        stage: 'qualifying',
      })
    }

    const reply = recommendReply(products, {
      stage: 'recommending',
      prefix: `For your ${GIFT_RECIPIENT_LABELS[known]}, the strongest pick is ${the(buildEvidence(products[0]).name)}.`,
    })
    return respond(session, {
      ...reply,
      quickReplies: ['Add it to cart', 'Show something cheaper', 'Under ₹1,000', 'Show more'],
    })
  }

  /* ── CATEGORY + BUDGET DETECTED — SEARCH IMMEDIATELY ── */
  if (categories.length > 0 && budget) {
    ctx.categories = [...new Set([...ctx.categories, ...categories])]
    ctx.budget = budget
    ctx.hasSearched = true
    const searchText = ctx.productType || null
    const products = await searchProducts({ categories: ctx.categories, budget: ctx.budget, text: searchText, limit: 5 })
    ctx.products = products
    if (products.length > 0) {
      const catLabel = ctx.productType || categories[0]
      const intro = searchText
        ? pick([
            `I couldn't find exact "${ctx.productType}" matches, but here are the best ${categories[0]} options in your budget:`,
            `No exact "${ctx.productType}" in stock, but check out these great ${categories[0]} picks:`,
          ])
        : pick([
            `Here are the best ${categories[0]} options within ₹${budget.max.toLocaleString()}:`,
            `Found some great picks for you! Take a look:`,
            `I think you'll love these — top ${categories[0]} picks in your budget:`,
          ])
      const stockMsg = products[0].stock <= 5 ? ` Only ${products[0].stock} left in stock —` : ''
      return respond(session, recommendReply(products, {
        stage: 'recommending',
        prefix: searchText
          ? `No exact "${ctx.productType}" in stock, so here's the closest ${categories[0]} option that fits your budget.`
          : null,
      }))
    }
    return respond(session, {
      message: `Hmm, no ${categories[0]} in that range right now. Want me to try a different budget or category?`,
      quickReplies: ['Increase budget', 'Try different category', 'Show all options'],
    })
  }

  /* ── BUDGET ANSWER (category already known) — SEARCH NOW ── */
  if (isBudget && ctx.categories.length > 0 && !ctx.hasSearched) {
    ctx.budget = budget || { min: 0, max: 999999 }
    ctx.hasSearched = true
    const searchText = ctx.productType || null
    const products = await searchProducts({ categories: ctx.categories, budget: ctx.budget, text: searchText, limit: 5 })
    ctx.products = products
    if (products.length > 0) {
      return respond(session, recommendReply(products, {
        stage: 'recommending',
        prefix: `Good — ₹${ctx.budget.max.toLocaleString('en-IN')} ceiling noted.`,
      }))
    }
    return respond(session, {
      message: `Nothing in ${ctx.categories[0]} fits that ceiling right now. Rather than guess, tell me the one thing you'd sacrifice — price, rating, or features — and I'll work with what's left.`,
      quickReplies: ['Push my budget a little', 'Show me the cheapest', 'Try a different category'],
      stage: 'qualifying',
    })
  }

  /* ── CATEGORY DETECTED — ask budget if not yet ── */
  if (categories.length > 0 && !ctx.budget) {
    ctx.lastAskedCategory = true
    const catName = categories.length === 1 ? categories[0] : categories.join(' or ')
    return respond(session, {
      message: pick([
        `Nice choice! ${catName} it is. What's your budget? I'll find the best options for you.`,
        `Great taste in ${catName}! What price range are you comfortable with?`,
        `Perfect, I know the ${catName} market well. What's your budget looking like?`,
      ]),
      quickReplies: ['Under ₹10,000', 'Under ₹25,000', 'Under ₹50,000', 'No budget limit'],
    })
  }

  /* ── BUDGET DETECTED (without category) — ask category ── */
  if (budget && ctx.categories.length === 0) {
    ctx.budget = budget
    return respond(session, {
      message: pick([
        `Got it, ₹${budget.max.toLocaleString()} it is! What type of product are you looking for?`,
        `Budget noted! Now what kind of product can I help you find?`,
        `Sure thing! ₹${budget.max.toLocaleString()} — what are you shopping for?`,
      ]),
      quickReplies: ['Electronics', 'Fashion', 'Home & Kitchen', 'Something else'],
    })
  }

  /* ── CATEGORY + BUDGET already set but not yet searched ── */
  if (ctx.categories.length > 0 && ctx.budget && !ctx.hasSearched) {
    ctx.hasSearched = true
    const searchText = ctx.productType || null
    const products = await searchProducts({ categories: ctx.categories, budget: ctx.budget, text: searchText, limit: 5 })
    ctx.products = products
    if (products.length > 0) {
      return respond(session, recommendReply(products, { stage: 'recommending' }))
    }
    return respond(session, {
      message: `Nothing matched that exactly. Want me to widen the search or shift the budget a little?`,
      quickReplies: ['Show all options', 'Try different category', 'Adjust budget'],
      stage: 'qualifying',
    })
  }

  /* ── AFTER SEARCH — user says "show more" ── */
  if (/show\s*more|more\s*options|see\s*more|next|load\s*more/i.test(lower) && ctx.hasSearched) {
    const moreProducts = await searchProducts({
      categories: ctx.categories.length > 0 ? ctx.categories : undefined,
      budget: ctx.budget || undefined,
      text: ctx.productType || undefined,
      limit: 5,
      offset: ctx.products.length,
    })
    if (moreProducts.length > 0) {
      ctx.products = [...ctx.products, ...moreProducts]
      return respond(session, recommendReply(moreProducts, {
        stage: 'recommending',
        prefix: "Here are more, so you can widen the shortlist:",
      }))
    }
    return respond(session, {
      message: "That's all I have for now. Want me to try different filters?",
      quickReplies: ['Change category', 'Change budget', 'Show trending'],
    })
  }

  /* ── AFTER SEARCH — explicit "start over" ──
     Was /change|different|filter|new|reset/i, which matched the word
     "new" in almost any sentence and wiped the search context.
     Now only an explicit reset request clears it. */
  if (/\b(?:start\s*over|start\s*again|reset|clear\s*(?:my\s*)?(?:search|filters?)|change\s*(?:my\s*)?(?:filters?|category|budget)|different\s*category|try\s*something\s*else)\b/i.test(lower) && ctx.hasSearched) {
    ctx.categories = []
    ctx.budget = null
    ctx.hasSearched = false
    ctx.products = []
    ctx.lastAskedCategory = false
    ctx.lastAskedBudget = false
    ctx.objectionActive = false
    session.stage = advanceStage(session.stage, 'discovery')
    return respond(session, {
      message: pick([
        "No problem, let's start fresh. What are you looking for this time?",
        "Sure thing, cleared. Tell me what you need and I'll find the best options.",
      ]),
      quickReplies: ['Electronics', 'Fashion', 'Home & Kitchen', 'Show trending'],
      stage: 'discovery',
    })
  }

  /* ── AFTER SEARCH — "something different" → refine, don't reset ── */
  if (/\b(?:something\s*else|something\s*different|other\s*options|more\s*variety|different\s*options)\b/i.test(lower) && ctx.hasSearched) {
    const refined = await searchProducts({
      categories: ctx.categories.length > 0 ? ctx.categories : undefined,
      budget: ctx.budget || undefined,
      text: ctx.productType || undefined,
      giftRecipient: ctx.giftRecipient || undefined,
      sortBy: 'createdAt',
      limit: 4,
      offset: ctx.products.length,
    })
    if (refined.length > 0) {
      ctx.products = [...ctx.products, ...refined]
      return respond(session, {
        message: `Let me widen the net. These are different from what I've already shown you:${refined[0].stock <= 5 ? ` and only ${refined[0].stock} left on the first one` : ''}. Any of these closer to what you had in mind?`,
        products: refined.map(formatProduct),
        quickReplies: ['Add to cart', 'Show more', 'Compare these', 'Change filters'],
        stage: 'recommending',
      })
    }
  }

  /* ── AFTER SEARCH — "add to cart" general ── */
  if (/add.*cart|buy.*this|get.*this/i.test(lower) && ctx.products.length > 0) {
    const p = ctx.products[0]
    return respond(session, {
      message: `I've added ${the(p.name)} to your cart! Want to keep shopping or head to checkout?`,
      products: [formatProduct(p)],
      quickReplies: ['Continue shopping', 'Go to checkout', 'View cart'],
      action: { type: 'add_to_cart', product: formatProduct(p) },
    })
  }

  /* ── CONVERSATIONAL FALLBACK — progressive discovery ── */
  // If nothing matched, figure out what to ask next
  if (!ctx.lastAskedCategory) {
    ctx.lastAskedCategory = true
    return respond(session, {
      message: pick([
        "What are you shopping for today? I'm here to help!",
        "Tell me what you're looking for and I'll find the best options.",
        "What can I help you find? I know our catalog inside and out!",
      ]),
      quickReplies: ['Electronics', 'Fashion', 'Home & Kitchen', 'Something else'],
    })
  }

  if (!ctx.lastAskedBudget) {
    ctx.lastAskedBudget = true
    return respond(session, {
      message: pick([
        "What's your budget looking like? I'll find the best value for you.",
        "How much are you looking to spend? I've got options at every price point.",
        "Any budget in mind? This helps me narrow down the perfect picks.",
      ]),
      quickReplies: ['Under ₹10,000', 'Under ₹25,000', 'Under ₹50,000', 'No limit'],
    })
  }

  /* ── PROGRESSIVE QUALIFICATION — one question, not an interrogation ── */
  const qualificationQuestion = nextQualificationQuestion(ctx)
  if (
    qualificationQuestion &&
    shouldAskQualification(ctx, lower, {
      isGift, isComparison, isHandoff, isTrending, isDeals, isNew, isShipping, isBuying,
    })
  ) {
    ctx.qualificationAsked = (ctx.qualificationAsked || 0) + 1
    return respond(session, {
      message: qualificationQuestion,
      quickReplies: ['Just show me options', 'No date, take your time', 'It is my own choice', 'Skip this'],
      stage: 'discovery',
    })
  }

  // If we have everything but haven't searched
  if (ctx.categories.length > 0 && ctx.budget && ctx.hasSearched) {
    return respond(session, {
      message: pick([
        "Anything else I can help with? I can show more products, compare options, or help you decide.",
        "What would you like to do next? I'm here to help you find the perfect product!",
        "Need anything else? I can find more options or help you make a decision.",
      ]),
      quickReplies: ['Show more', 'Compare', 'Show trending', 'Start fresh'],
    })
  }

  // Last resort — search with whatever we have
  if (ctx.categories.length > 0) {
    const products = await searchProducts({
      categories: ctx.categories,
      budget: ctx.budget || undefined,
      text: ctx.productType || undefined,
      limit: 5,
    })
    ctx.products = products
    ctx.hasSearched = true
    if (products.length > 0) {
      return respond(session, recommendReply(products, { stage: 'recommending' }))
    }
  }

  // General fallback
  return respond(session, {
    message: pick([
      "I didn't quite catch that, and I'd rather ask than guess. What are you shopping for — and is it for yourself or a gift?",
      "Help me help you: what's the occasion, and roughly what budget are you working with?",
    ]),
    quickReplies: ['Something for me', 'A gift for my father', 'Best deals today', 'Show trending'],
    stage: 'discovery',
  })
}

function respond(session, data) {
  const ctx = session.context

  // Track how many times we've asked for the order — stop nagging after 3
  if (data.stage === 'closing') {
    ctx.closeAttempts++
    ctx.lastCloseAttemptTurn = ctx.turnCount
  }
  session.stage = advanceStage(session.stage, data.stage || stageForContext(ctx))

  const response = {
    message: data.message,
    quickReplies: data.quickReplies || [],
    products: data.products || [],
    comparison: data.comparison || null,
    action: data.action || null,
    buyingStage: session.stage,
    stage: session.stage,
    closeAttempts: ctx.closeAttempts,
    // Surfaced so the admin analytics view can score objection handling
    lastObjection: ctx.objectionActive
      ? ctx.objectionTypes[ctx.objectionTypes.length - 1] || null
      : null,
  }
  session.messages.push({ role: 'assistant', content: data.message, timestamp: new Date().toISOString() })
  return response
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT SEARCH
   ══════════════════════════════════════════════════════════════ */

export async function searchProducts(criteria = {}) {
  const filter = {}

  if (criteria.categories && criteria.categories.length > 0) {
    filter.category = { $in: criteria.categories }
  }

  if (criteria.budget) {
    filter.price = {}
    if (criteria.budget.max && criteria.budget.max < 999999) filter.price.$lte = criteria.budget.max
    if (criteria.budget.min > 0) filter.price.$gte = criteria.budget.min
  }

  const or = []
  const giftKey = criteria.giftRecipient ? resolveGiftRecipient(criteria.giftRecipient) : null

  // Prefer explicit giftTags so curated matches are never diluted by loose
  // category membership. Fall back to category only when nothing is tagged.
  if (giftKey) {
    const taggedFilter = { ...filter, giftTags: giftKey }
    const taggedCount = await Product.countDocuments({ ...taggedFilter, stock: { $gt: 0 } })
    if (taggedCount > 0) {
      filter.giftTags = giftKey
    } else {
      const giftFilter = buildGiftFilter(giftKey)
      if (giftFilter) or.push(...giftFilter.$or)
    }
  }

  if (criteria.text) {
    or.push(
      { name: { $regex: criteria.text, $options: 'i' } },
      { description: { $regex: criteria.text, $options: 'i' } },
      { category: { $regex: criteria.text, $options: 'i' } }
    )
  }

  if (or.length) filter.$or = or

  filter.stock = { $gt: 0 }

  let sort = { rating: -1, reviews: -1 }
  if (criteria.sortBy === 'discount') sort = { discount: -1, rating: -1 }
  if (criteria.sortBy === 'price') sort = { price: 1 }
  if (criteria.sortBy === 'createdAt') sort = { createdAt: -1 }

  let query = Product.find(filter).sort(sort)
  if (criteria.offset) query = query.skip(criteria.offset)
  if (criteria.limit) query = query.limit(criteria.limit)

  let products = await query.lean()

  // Fallback: if the text search found nothing, retry on category only.
  // Skipped when criteria.strictRelevance is set — otherwise a search for
  // "cheaper headphones" silently returns a Smart Watch, which is worse
  // than admitting there is no cheaper matching product.
  if (products.length === 0 && criteria.text && !criteria.strictRelevance) {
    const fallbackFilter = { ...filter }
    delete fallbackFilter.$or
    if (criteria.categories && criteria.categories.length > 0) {
      fallbackFilter.category = { $in: criteria.categories }
    }
    if (criteria.budget) {
      fallbackFilter.price = {}
      if (criteria.budget.max && criteria.budget.max < 999999) fallbackFilter.price.$lte = criteria.budget.max
      if (criteria.budget.min > 0) fallbackFilter.price.$gte = criteria.budget.min
    }
    if (criteria.giftRecipient) {
      const giftKey = resolveGiftRecipient(criteria.giftRecipient)
      if (giftKey) {
        const giftClauses = buildGiftFilter(giftKey).$or
        if (giftClauses.length) fallbackFilter.$or = giftClauses
      }
    }
    fallbackFilter.stock = { $gt: 0 }
    let fallbackQuery = Product.find(fallbackFilter).sort(sort)
    if (criteria.offset) fallbackQuery = fallbackQuery.skip(criteria.offset)
    if (criteria.limit) fallbackQuery = fallbackQuery.limit(criteria.limit)
    products = await fallbackQuery.lean()
  }

  return products.map(p => ({
    id: p._id, name: p.name, price: p.price, oldPrice: p.oldPrice,
    discount: p.discount, rating: p.rating, reviews: p.reviews,
    image: p.image, category: p.category, brand: p.brand,
    stock: p.stock, freeDelivery: p.freeDelivery, description: p.description, badge: p.badge,
    giftTags: p.giftTags || [],
  }))
}
