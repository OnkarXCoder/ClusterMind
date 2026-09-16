import { useMemo, useState } from 'react'
import Header from '../components/Header'
import HeroCarousel from '../components/HeroCarousel'
import StorefrontHighlights from '../components/StorefrontHighlights'
import GiftFinder from '../components/GiftFinder'
import { giftRecipients, matchesGiftRecipient } from '../components/giftRules'
import CategoryGrid from '../components/CategoryGrid'
import ProductGrid from '../components/ProductGrid'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { products } from '../data/products'
import './HomePage.css'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [giftRecipient, setGiftRecipient] = useState('')

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCategorySelect = (cat) => {
    setCategory(cat)
    scrollToProducts()
  }

  const handleShop = (cat) => {
    setCategory(cat)
    scrollToProducts()
  }

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        matchesGiftRecipient(p, giftRecipient) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    )
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return list
  }, [category, giftRecipient, search, sort])

  const recipientLabel = giftRecipients.find((item) => item.key === giftRecipient)?.label
  const heading =
    giftRecipient
      ? `Gift Ideas for ${recipientLabel}`
      : search || category !== 'All'
      ? 'Search Results'
      : 'Recommended for You'

  return (
    <div id="top" className="storefront min-h-screen text-slate-900">
      <Header search={search} onSearchChange={setSearch} onCategorySelect={handleCategorySelect} />
      <main>
        <HeroCarousel onShop={handleShop} />
        <StorefrontHighlights />
        <GiftFinder products={products} selected={giftRecipient} onSelect={setGiftRecipient} />
        <CategoryGrid onSelect={handleCategorySelect} />
        <ProductGrid
          heading={heading}
          products={filtered}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
