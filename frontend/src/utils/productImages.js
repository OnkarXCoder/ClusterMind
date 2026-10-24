const CATEGORY_IMAGES = {
  Electronics: '/products/samsung-s24.jpg',
  Fashion: '/products/fashion/jacket.svg',
  'Home & Kitchen': '/products/sofa.jpg',
  Beauty: '/products/beauty/skincare-combo.svg',
  Sports: '/products/sports/cricket-bat.svg',
  Books: '/products/books/clean-code.svg',
  Grocery: '/products/grocery.jpg',
  Automotive: '/products/automotive.jpg',
  'Toys & Games': '/products/toys-games/board-game.svg',
  'All Products': '/products/electronics/galaxy-tab.svg',
  "Women's Fashion": '/products/fashion/fashion-watch.svg',
  "Men's Fashion": '/products/fashion/cotton-shirt.svg',
  "Kids' Fashion & Baby Products": '/products/toys-games/teddy-bear.svg',
  'Beauty & Personal Care': '/products/beauty/skincare-combo.svg',
  'Mobiles & Accessories': '/products/iphone15.jpg',
  'Computers & Laptops': '/products/macbook.jpg',
  'Books & Stationery': '/products/books/clean-code.svg',
  'Furniture & Home Decor': '/products/sofa.jpg',
  'Grocery & Daily Essentials': '/products/grocery.jpg',
  'Health & Wellness': '/products/beauty/beauty-combo.svg',
  'Jewellery & Accessories': '/products/fashion/fashion-watch.svg',
  Footwear: '/products/nike-shoes.jpg',
  'Bags & Luggage': '/products/fashion/handbag.svg',
  'Sports & Fitness': '/products/sports/dumbbells.svg',
  'Office Supplies': '/products/books/clean-code.svg',
  'Automotive Accessories': '/products/automotive.jpg',
  'Pet Supplies': '/products/grocery.jpg',
  'Gifts & Gift Cards': '/products/beauty/beauty-combo.svg',
}

const PRODUCT_IMAGES = {
  'wireless noise-cancelling headphones': '/products/sony-headphone.jpg',
  'smart watch series 5 with gps': '/products/samsung-watch.jpg',
  'bluetooth earbuds pro': '/products/electronics/oneplus-earbuds.svg',
  '4k ultra hd smart tv 55 inch': '/products/electronics/galaxy-tab.svg',
  'classic denim jacket': '/products/fashion/jacket.svg',
  'running sneakers - comfort plus': '/products/sports/running-shoes.svg',
  'leather travel backpack': '/products/fashion/handbag.svg',
  'cotton casual t-shirt (pack of 3)': '/products/fashion/cotton-shirt.svg',
  'smart coffee maker': '/products/home-kitchen/coffee-maker.svg',
  'modern led desk lamp': '/products/home-kitchen/kettle.svg',
  'hepa air purifier': '/products/home-kitchen/water-purifier.svg',
  'organic skincare kit': '/products/beauty/skincare-combo.svg',
  'pro ionic hair dryer': '/products/beauty/hair-dryer.svg',
  'premium yoga mat pro': '/products/sports/yoga-mat.svg',
  'adjustable dumbbell set': '/products/sports/dumbbells.svg',
  'the art of ai marketing (hardcover)': '/products/books/clean-code.svg',
  'elegant gift hamper box': '/products/beauty/beauty-combo.svg',
  'personalized photo frame': '/products/sofa.jpg',
  'stainless steel cookware set': '/products/home-kitchen/cookware.svg',
  'classic leather wallet': '/products/fashion/fashion-watch.svg',
  'educational building blocks set': '/products/toys-games/puzzle.svg',
  'travel board game - strategy': '/products/toys-games/board-game.svg',
  'aroma diffuser with essential oils': '/products/beauty/perfume.svg',
  'insulated water bottle 1 litre': '/products/sports/sports-bag.svg',
  'wireless mouse with usb receiver': '/products/electronics/jbl-speaker.svg',
  'executive leather notebook set': '/products/books/clean-code.svg',
}

const NAME_IMAGES = [
  [/headphone|earbud|airpod/i, '/products/sony-headphone.jpg'],
  [/watch|smart watch/i, '/products/samsung-watch.jpg'],
  [/phone|iphone|smartphone|mobile/i, '/products/iphone15.jpg'],
  [/tv|tablet/i, '/products/electronics/galaxy-tab.svg'],
  [/mouse|speaker/i, '/products/electronics/jbl-speaker.svg'],
  [/laptop|macbook|computer/i, '/products/macbook.jpg'],
  [/camera/i, '/products/canon-camera.jpg'],
  [/shoe|sneaker|footwear/i, '/products/nike-shoes.jpg'],
  [/jacket|denim/i, '/products/fashion/jacket.svg'],
  [/shirt|t-?shirt/i, '/products/fashion/cotton-shirt.svg'],
  [/wallet/i, '/products/fashion/fashion-watch.svg'],
  [/backpack|bag|luggage/i, '/products/fashion/handbag.svg'],
  [/coffee/i, '/products/home-kitchen/coffee-maker.svg'],
  [/cookware|kadai|pan|casserole/i, '/products/home-kitchen/cookware.svg'],
  [/lamp|kettle/i, '/products/home-kitchen/kettle.svg'],
  [/decor|frame/i, '/products/sofa.jpg'],
  [/purifier/i, '/products/home-kitchen/water-purifier.svg'],
  [/skin|beauty|makeup/i, '/products/beauty/skincare-combo.svg'],
  [/dryer|hair/i, '/products/beauty/hair-dryer.svg'],
  [/diffuser|essential oil|perfume/i, '/products/beauty/perfume.svg'],
  [/yoga|mat/i, '/products/sports/yoga-mat.svg'],
  [/dumbbell|fitness/i, '/products/sports/dumbbells.svg'],
  [/bottle/i, '/products/sports/sports-bag.svg'],
  [/book|marketing|notebook|stationery|alchemist|code/i, '/products/books/clean-code.svg'],
  [/hamper|gift/i, '/products/beauty/beauty-combo.svg'],
  [/block|puzzle/i, '/products/toys-games/puzzle.svg'],
  [/toy|game/i, '/products/toys-games/board-game.svg'],
  [/car|auto|tyre/i, '/products/automotive/car-care-kit.svg'],
]

const PLACEHOLDER_IMAGE_PATTERN = /picsum\.photos|images\.unsplash\.com|source\.unsplash\.com|images\.pexels\.com|placehold\.co|placeholder|\/products\/default\.jpg/i

export function resolveProductImage(product = {}) {
  const source = product.image || product.thumbnail || ''
  const name = String(product.name || product.productName || '').trim().toLowerCase()
  if (name && PRODUCT_IMAGES[name]) return PRODUCT_IMAGES[name]
  if (source && !PLACEHOLDER_IMAGE_PATTERN.test(source)) return source
  const text = `${product.name || ''} ${product.productName || ''} ${product.category || ''}`
  const named = NAME_IMAGES.find(([pattern]) => pattern.test(text))
  if (named) return named[1]
  return CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES['All Products']
}

export function resolveCategoryImage(category) {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES['All Products']
}
