import { Link } from 'react-router-dom'
import { LogIn, MapPin, Search, ShoppingCart, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'

const useCategories = () => {
  const [cats, setCats] = useState([])
  useEffect(() => {
    fetch('/api/products/categories')
      .then(r => r.json())
      .then(d => setCats(d?.categories || []))
      .catch(() => {})
  }, [])
  return cats
}
import { useCart } from '../context/CartContext'
import { logout } from '../services/auth'
import { trackSearch } from '../services/behavior'

export default function Header({ search, onSearchChange, onCategorySelect }) {
  const { count, setIsOpen } = useCart()
  const categories = useCategories()
  const [category, setCategory] = useState('All')

  const submitSearch = () => {
    trackSearch(search, {
      source: 'storefront-header',
      category: category === 'All' ? '' : category,
    })
  }

  return (
    <header className="amazon-header">
      <div className="amazon-topbar">
        <a href="#top" className="amazon-brand" aria-label="ShopSmart home">
          <span className="amazon-brand-mark">
            <ShoppingBag size={22} />
          </span>
          <span>ShopSmart</span>
        </a>

        <div className="amazon-location">
          <MapPin size={18} />
          <span>
            <small>Deliver to</small>
            India
          </span>
        </div>

        <div className="amazon-search">
          <select aria-label="Search category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All</option>
            {categories.filter((c) => c !== 'All').map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch()
            }}
            placeholder="Search ShopSmart"
          />
          <button type="button" aria-label="Search" onClick={submitSearch}>
            <Search size={22} />
          </button>
        </div>

        <Link to="/login" className="amazon-account" onClick={logout}>
          <LogIn size={18} />
          <span>
            <small>Hello, sign in</small>
            Account
          </span>
        </Link>

        <button type="button" className="amazon-cart" onClick={() => setIsOpen(true)}>
          <span className="amazon-cart-icon">
            <ShoppingCart size={31} />
            {count > 0 && <strong>{count}</strong>}
          </span>
          <span>Cart</span>
        </button>
      </div>

      <nav className="amazon-category-nav" aria-label="Product categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </nav>
    </header>
  )
}
