const GIFT_RECIPIENTS = {
  girlfriend: {
    label: 'Girlfriend',
    aliases: ['girl friend', 'gf', 'partner', 'wife', 'lady', 'crush'],
    categories: ['Fashion', 'Beauty', 'Electronics', 'Jewellery', 'Watches'],
  },
  boyfriend: {
    label: 'Boyfriend',
    aliases: ['boy friend', 'bf', 'partner', 'husband', 'man', 'guy'],
    categories: ['Electronics', 'Fashion', 'Sports', 'Watches', 'Automotive'],
  },
  husband: {
    label: 'Husband',
    aliases: ['spouse', 'partner', 'man', 'guy', 'boyfriend'],
    categories: ['Electronics', 'Fashion', 'Sports', 'Watches', 'Automotive', 'Home & Kitchen'],
  },
  wife: {
    label: 'Wife',
    aliases: ['spouse', 'partner', 'lady', 'woman', 'girlfriend'],
    categories: ['Fashion', 'Beauty', 'Electronics', 'Jewellery', 'Watches', 'Home & Kitchen'],
  },
  mom: {
    label: 'Mom',
    aliases: ['mother', 'mum', 'mummy', 'mama', 'maa', 'parent', 'parents'],
    categories: ['Home & Kitchen', 'Beauty', 'Books', 'Fashion', 'Grocery', 'Electronics'],
  },
  dad: {
    label: 'Dad',
    aliases: ['father', 'papa', 'baba', 'daddy', 'appa', 'parent', 'parents'],
    categories: ['Electronics', 'Automotive', 'Books', 'Sports', 'Home & Kitchen', 'Tools'],
  },
  brother: {
    label: 'Brother',
    aliases: ['bro', 'bhai', 'sibling'],
    categories: ['Electronics', 'Sports', 'Fashion', 'Toys & Games', 'Books', 'Grocery'],
  },
  sister: {
    label: 'Sister',
    aliases: ['sis', 'didi', 'bhabhi', 'sibling'],
    categories: ['Fashion', 'Beauty', 'Books', 'Electronics', 'Home & Kitchen', 'Jewellery'],
  },
  friend: {
    label: 'Best Friend',
    aliases: ['bestfriend', 'best friend', 'buddy', 'pal', 'close friend', 'roommate', 'bff'],
    categories: ['Electronics', 'Books', 'Sports', 'Fashion', 'Toys & Games', 'Grocery'],
  },
  kids: {
    label: 'Kids',
    aliases: ['child', 'children', 'son', 'daughter', 'baby', 'toddler'],
    categories: ['Toys & Games', 'Books', 'Sports', 'Electronics', 'Grocery', 'Fashion'],
  },
  grandparents: {
    label: 'Grandparents',
    aliases: ['grandparent', 'grandmother', 'grandfather', 'grandma', 'grandpa', 'nana', 'nani'],
    categories: ['Home & Kitchen', 'Health', 'Grocery', 'Electronics', 'Books', 'Fashion'],
  },
  boss: {
    label: 'Boss / Colleague',
    aliases: ['colleague', 'manager', 'teacher', 'guide', 'mentor', 'senior', 'office', 'professor'],
    categories: ['Electronics', 'Books', 'Grocery', 'Home & Kitchen', 'Fashion', 'Office Supplies'],
  },
  self: {
    label: 'For Myself',
    aliases: ['myself', 'me', 'own', 'self gift', 'treat myself', 'personal'],
    categories: ['Beauty', 'Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Grocery'],
  },
  wedding: {
    label: 'Wedding',
    aliases: ['marriage', 'bridal', 'bride', 'groom', 'wedding gift', 'anniversary', 'engagement'],
    categories: ['Home & Kitchen', 'Electronics', 'Jewellery', 'Beauty', 'Fashion', 'Grocery'],
  },
  corporate: {
    label: 'Corporate / Bulk',
    aliases: ['bulk', 'corporate', 'company', 'office gift', 'employee', 'team', 'client', 'business'],
    categories: ['Grocery', 'Electronics', 'Home & Kitchen', 'Office Supplies', 'Books'],
  },
}

const ALIAS_INDEX = Object.entries(GIFT_RECIPIENTS).reduce((acc, [key, value]) => {
  acc[key] = key
  acc[value.label.toLowerCase()] = key
  value.aliases.forEach((alias) => {
    acc[alias] = key
  })
  return acc
}, {})

export function resolveGiftRecipient(value) {
  if (!value) return null
  const normalised = String(value).trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ')
  if (!normalised) return null
  if (ALIAS_INDEX[normalised]) return ALIAS_INDEX[normalised]
  const collapsed = normalised.replace(/[^a-z]/g, '')
  if (ALIAS_INDEX[collapsed]) return ALIAS_INDEX[collapsed]
  for (const [key, value2] of Object.entries(GIFT_RECIPIENTS)) {
    if (normalised.includes(key)) return key
    if (value2.aliases.some((alias) => normalised.includes(alias))) return key
  }
  return null
}

export function getGiftRecipients() {
  return Object.entries(GIFT_RECIPIENTS).map(([key, value]) => ({ key, ...value }))
}

/**
 * Mongo filter matching products for a gift recipient.
 * Prefers explicit giftTags, falls back to category membership.
 */
export function buildGiftFilter(value, { tagsOnly = false } = {}) {
  const key = resolveGiftRecipient(value)
  if (!key) return null
  const recipient = GIFT_RECIPIENTS[key]
  if (tagsOnly) return { giftTags: key }
  return {
    $or: [{ giftTags: key }, { category: { $in: recipient.categories } }],
  }
}

export default GIFT_RECIPIENTS
