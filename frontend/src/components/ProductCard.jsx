import { Link } from 'react-router-dom'
import { Sparkles, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { resolveProductImage } from '../utils/productImages'
import { trackProductBehavior } from '../services/behavior'

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value || 0))

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const safeProduct = {
    id: product?.id || product?._id || '',
    name: product?.name || 'Unnamed Product',
    brand: product?.brand || 'Generic',
    image: resolveProductImage(product),
    price: Number(product?.price || 0),
    oldPrice: Number(product?.oldPrice || 0),
    discount: Number(product?.discount || 0),
    rating: Number(product?.rating || 0),
    reviews: Number(product?.reviews || 0),
    aiRecommended: Boolean(product?.aiRecommended),
  }
  const filled = Math.round(safeProduct.rating)

  return (
    <article className="amazon-product-card">
      <Link
        to={`/products/${safeProduct.id}`}
        className="amazon-product-image"
        onClick={() => trackProductBehavior('click', { ...product, ...safeProduct }, { source: 'storefront-card' })}
      >
        <img src={safeProduct.image} alt={safeProduct.name} loading="lazy" />
        {safeProduct.aiRecommended && (
          <span className="amazon-ai-badge">
            <Sparkles size={13} />
            AI pick
          </span>
        )}
      </Link>

      <div className="amazon-product-body">
        <p className="amazon-brand-name">{safeProduct.brand}</p>
        <Link
          to={`/products/${safeProduct.id}`}
          className="amazon-product-title"
          onClick={() => trackProductBehavior('click', { ...product, ...safeProduct }, { source: 'storefront-card' })}
        >
          {safeProduct.name}
        </Link>

        <div className="amazon-rating" aria-label={`${safeProduct.rating} out of 5 stars`}>
          <span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < filled ? 'filled' : ''}
              />
            ))}
          </span>
          <strong>{safeProduct.rating}</strong>
          <em>{formatNumber(safeProduct.reviews)}</em>
        </div>

        <div className="amazon-price-row">
          <strong>{formatPrice(safeProduct.price)}</strong>
          {safeProduct.oldPrice > safeProduct.price && <span>{formatPrice(safeProduct.oldPrice)}</span>}
        </div>

        <div className="amazon-offer-row">
          {safeProduct.discount > 0 && <span>{safeProduct.discount}% off</span>}
          <p>FREE delivery</p>
        </div>

        <button type="button" onClick={() => {
          const item = { ...product, ...safeProduct }
          addToCart(item)
          trackProductBehavior('add_to_cart', item, { source: 'storefront-card' })
        }}>
          <ShoppingCart size={17} />
          Add to Cart
        </button>
      </div>
    </article>
  )
}
