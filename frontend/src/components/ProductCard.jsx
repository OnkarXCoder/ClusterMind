import { Link } from 'react-router-dom'
import { Sparkles, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const filled = Math.round(product.rating)

  return (
    <article className="amazon-product-card">
      <Link to={`/products/${product.id}`} className="amazon-product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.aiRecommended && (
          <span className="amazon-ai-badge">
            <Sparkles size={13} />
            AI pick
          </span>
        )}
      </Link>

      <div className="amazon-product-body">
        <p className="amazon-brand-name">{product.brand}</p>
        <Link to={`/products/${product.id}`} className="amazon-product-title">
          {product.name}
        </Link>

        <div className="amazon-rating" aria-label={`${product.rating} out of 5 stars`}>
          <span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < filled ? 'filled' : ''}
              />
            ))}
          </span>
          <strong>{product.rating}</strong>
          <em>{product.reviews.toLocaleString()}</em>
        </div>

        <div className="amazon-price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.oldPrice && <span>{formatPrice(product.oldPrice)}</span>}
        </div>

        <div className="amazon-offer-row">
          {product.discount > 0 && <span>{product.discount}% off</span>}
          <p>FREE delivery</p>
        </div>

        <button type="button" onClick={() => addToCart(product)}>
          <ShoppingCart size={17} />
          Add to Cart
        </button>
      </div>
    </article>
  )
}
