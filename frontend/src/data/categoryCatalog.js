export const CATEGORY_CATALOG = [
  { name: 'All Products', aliases: ['All'], subcategories: [] },
  { name: 'Beauty & Personal Care', aliases: ['Beauty'], subcategories: ['Makeup', 'Skincare', 'Haircare', 'Perfumes', 'Beauty Tools'] },
  { name: "Women's Fashion", aliases: ['Fashion'], subcategories: ['Kurtas', 'Sarees', 'Tops', 'Dresses', 'Ethnic Wear', 'Western Wear'] },
  { name: "Men's Fashion", aliases: ['Fashion'], subcategories: ['Shirts', 'T-Shirts', 'Jeans', 'Formal Wear', 'Ethnic Wear', 'Winter Wear'] },
  { name: "Kids' Fashion & Baby Products", aliases: ['Fashion', 'Toys & Games'], subcategories: ['Baby Clothing', 'Kids Clothing', 'School Essentials', 'Baby Care', 'Kids Shoes'] },
  { name: 'Electronics', aliases: ['Electronics'], subcategories: ['Headphones', 'Speakers', 'Smart Watches', 'Cameras', 'Tablets'] },
  { name: 'Mobiles & Accessories', aliases: ['Electronics'], subcategories: ['Smartphones', 'Cases & Covers', 'Chargers', 'Power Banks', 'Earbuds'] },
  { name: 'Computers & Laptops', aliases: ['Electronics', 'Laptop'], subcategories: ['Laptops', 'Keyboards', 'Mouse', 'Monitors', 'Storage'] },
  { name: 'Books & Stationery', aliases: ['Books'], subcategories: ['Fiction', 'Self Help', 'Academic Books', 'Notebooks', 'Pens'] },
  { name: 'Home & Kitchen', aliases: ['Home & Kitchen'], subcategories: ['Kitchen Appliances', 'Cookware', 'Storage', 'Cleaning', 'Dining'] },
  { name: 'Furniture & Home Decor', aliases: ['Home & Kitchen'], subcategories: ['Sofas', 'Beds', 'Wall Decor', 'Lighting', 'Organizers'] },
  { name: 'Grocery & Daily Essentials', aliases: ['Grocery'], subcategories: ['Staples', 'Snacks', 'Beverages', 'Personal Care', 'Household Supplies'] },
  { name: 'Health & Wellness', aliases: ['Beauty', 'Grocery'], subcategories: ['Supplements', 'Fitness Care', 'Health Devices', 'Ayurveda', 'Hygiene'] },
  { name: 'Jewellery & Accessories', aliases: ['Fashion'], subcategories: ['Necklaces', 'Earrings', 'Watches', 'Sunglasses', 'Belts'] },
  { name: 'Footwear', aliases: ['Shoes', 'Fashion'], subcategories: ['Sneakers', 'Formal Shoes', 'Sandals', 'Sports Shoes', 'Flip Flops'] },
  { name: 'Bags & Luggage', aliases: ['Fashion'], subcategories: ['Backpacks', 'Handbags', 'Trolley Bags', 'Wallets', 'Laptop Bags'] },
  { name: 'Sports & Fitness', aliases: ['Sports'], subcategories: ['Gym Equipment', 'Yoga', 'Cricket', 'Football', 'Badminton'] },
  { name: 'Toys & Games', aliases: ['Toys & Games'], subcategories: ['Soft Toys', 'Board Games', 'Puzzles', 'Remote Control Toys', 'Learning Toys'] },
  { name: 'Office Supplies', aliases: ['Books', 'Electronics'], subcategories: ['Stationery', 'Printers', 'Desk Organizers', 'Office Chairs', 'Files'] },
  { name: 'Automotive Accessories', aliases: ['Automotive'], subcategories: ['Car Care', 'Phone Holders', 'Seat Covers', 'Air Fresheners', 'Tyre Inflators'] },
  { name: 'Pet Supplies', aliases: ['Grocery'], subcategories: ['Pet Food', 'Grooming', 'Toys', 'Beds', 'Bowls'] },
  { name: 'Gifts & Gift Cards', aliases: ['Beauty', 'Fashion', 'Electronics', 'Books', 'Toys & Games'], subcategories: ['Gift Sets', 'Gift Cards', 'Personalized Gifts', 'Festive Gifts', 'Premium Gifts'] },
]

export const MAIN_CATEGORY_NAMES = CATEGORY_CATALOG.map((category) => category.name)

export function getCategoryAliases(categoryName) {
  const category = CATEGORY_CATALOG.find((item) => item.name === categoryName)
  return category ? [category.name, ...category.aliases] : [categoryName]
}

export function categoryMatches(productCategory, selectedCategory) {
  if (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'All Products') return true
  const aliases = getCategoryAliases(selectedCategory).map((item) => item.toLowerCase())
  return aliases.includes(String(productCategory || '').toLowerCase())
}
