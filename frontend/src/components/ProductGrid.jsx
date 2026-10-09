import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

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

export default function ProductGrid({
  heading,
  products,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}) {
  const categories = useCategories()

  return (
    <section id="products" className="amazon-products-shell">
      <div className="amazon-section-head">
        <div>
          <p>Personalized marketplace</p>
          <h2>{heading}</h2>
        </div>
        <label className="amazon-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
      </div>

      <div className="amazon-filter-row">
        <button
          type="button"
          onClick={() => onCategoryChange('All')}
          className={category === 'All' ? 'active' : ''}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={category === c ? 'active' : ''}
          >
            {c}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="amazon-empty-state">
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="amazon-product-grid">
          {products.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
