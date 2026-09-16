export const giftRecipients = [
  {
    key: 'girlfriend',
    label: 'Girlfriend',
    categories: ['Fashion', 'Beauty', 'Electronics'],
    keywords: ['dress', 'handbag', 'watch', 'perfume', 'lipstick', 'airpods', 'serum'],
  },
  {
    key: 'mom',
    label: 'Mom',
    categories: ['Home & Kitchen', 'Beauty', 'Books'],
    keywords: ['coffee', 'kettle', 'cookware', 'serum', 'skincare', 'book', 'purifier'],
  },
  {
    key: 'dad',
    label: 'Dad',
    categories: ['Electronics', 'Automotive', 'Books'],
    keywords: ['watch', 'speaker', 'camera', 'car', 'clean code', 'history'],
  },
  {
    key: 'brother',
    label: 'Brother',
    categories: ['Electronics', 'Sports', 'Fashion', 'Toys & Games'],
    keywords: ['phone', 'speaker', 'shoes', 'football', 'bat', 'robot', 'headphone'],
  },
  {
    key: 'sister',
    label: 'Sister',
    categories: ['Fashion', 'Beauty', 'Books', 'Electronics'],
    keywords: ['dress', 'handbag', 'makeup', 'perfume', 'sunglasses', 'airpods'],
  },
  {
    key: 'friend',
    label: 'Friend',
    categories: ['Electronics', 'Books', 'Sports', 'Fashion'],
    keywords: ['speaker', 'earbuds', 'book', 'shoes', 'bag', 'puzzle'],
  },
  {
    key: 'kids',
    label: 'Kids',
    categories: ['Toys & Games', 'Books', 'Sports'],
    keywords: ['toy', 'kids', 'puzzle', 'blocks', 'teddy', 'stories', 'robot'],
  },
]

export const matchesGiftRecipient = (product, recipientKey) => {
  if (!recipientKey) return true
  const recipient = giftRecipients.find((item) => item.key === recipientKey)
  if (!recipient) return true
  const haystack = `${product.name} ${product.category} ${product.brand || ''} ${(product.giftTags || []).join(' ')}`.toLowerCase()
  return (
    recipient.categories.includes(product.category) ||
    recipient.keywords.some((word) => haystack.includes(word)) ||
    product.giftTags?.includes(recipient.key)
  )
}
