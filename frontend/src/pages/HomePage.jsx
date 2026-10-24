import { useMemo, useState, useEffect } from 'react'
import Header from '../components/Header'
import HeroCarousel from '../components/HeroCarousel'
import StorefrontHighlights from '../components/StorefrontHighlights'
import GiftFinder from '../components/GiftFinder'
import { giftRecipients, rankGiftsForRecipient, resolveRecipientKey } from '../components/giftRules'
import CategoryGrid from '../components/CategoryGrid'
import ProductGrid from '../components/ProductGrid'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { getProducts } from '../services/products'
import { trackSearch } from '../services/behavior'
import './HomePage.css'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [giftRecipient, setGiftRecipient] = useState('')
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts({ category, search })
      .then((list) => {
        setProducts(list)
      })
      .catch(() => setProducts([]))
  }, [category, search, sort])

  useEffect(() => {
    const term = search.trim()
    if (!term) return undefined
    const timeout = setTimeout(() => {
      trackSearch(term, { source: 'storefront-live-search', category: category === 'All' ? '' : category })
    }, 900)
    return () => clearTimeout(timeout)
  }, [search, category])

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
    const list = giftRecipient
      ? rankGiftsForRecipient(products, giftRecipient, products.length)
      : products
    return [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  }, [products, giftRecipient])

  const recipientLabel = giftRecipients.find((item) => item.key === resolveRecipientKey(giftRecipient))?.label
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
