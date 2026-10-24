import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Sparkles, Truck, Zap, PackageX } from "lucide-react";
import { addToCart } from "../../services/cart";
import { addToWishlist, removeFromWishlist } from "../../services/wishlist";
import { resolveProductImage } from "../../utils/productImages";
import { trackProductBehavior } from "../../services/behavior";
import "./ProductCard.css";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const safeProduct = {
    id: product?.id || product?._id || "",
    name: product?.name || "Unnamed Product",
    category: product?.category || "General",
    image: resolveProductImage(product),
    price: Number(product?.price || 0),
    oldPrice: Number(product?.oldPrice ?? product?.price ?? 0),
    discount: Number(product?.discount || 0),
    rating: Number(product?.rating || 0),
    reviews: Number(product?.reviews || 0),
    aiRecommended: Boolean(product?.aiRecommended),
    freeDelivery: product?.freeDelivery ?? true,
    inStock: product?.inStock ?? Number(product?.stock || 0) > 0,
  };

  const handleAdd = () => {
    if (!safeProduct.inStock) return;
    addToCart({ ...product, ...safeProduct });
    trackProductBehavior("add_to_cart", { ...product, ...safeProduct }, { source: "product-card" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!safeProduct.inStock) return;
    addToCart({ ...product, ...safeProduct }, 1);
    trackProductBehavior("add_to_cart", { ...product, ...safeProduct }, { source: "product-card-buy-now" });
    navigate("/checkout");
  };

  const toggleWishlist = () => {
    if (liked) {
      removeFromWishlist(safeProduct.id);
      setLiked(false);
    } else {
      addToWishlist({ ...product, ...safeProduct });
      setLiked(true);
    }
  };

  return (
    <div className="product-card">

      {safeProduct.aiRecommended && (
        <div className="ai-badge">
          <Sparkles size={13} />
          AI Recommended
        </div>
      )}

      <button
        className="wishlist-button"
        onClick={toggleWishlist}
        aria-label="Add to wishlist"
      >
        <Heart
          size={18}
          fill={liked ? "#EF4444" : "none"}
          color={liked ? "#EF4444" : "#475569"}
        />
      </button>

      <div className="product-image-container">
        {imgError ? (
          <div className="product-image-fallback">
            <PackageX size={44} color="#94A3B8" />
            <span>{safeProduct.category}</span>
          </div>
        ) : (
          <Link
            to={`/products/${safeProduct.id}`}
            aria-label={safeProduct.name}
            onClick={() => trackProductBehavior("click", { ...product, ...safeProduct }, { source: "product-card" })}
          >
            <img
              src={safeProduct.image}
              alt={safeProduct.name}
              loading="lazy"
              className="product-image"
              onError={() => setImgError(true)}
            />
          </Link>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">{safeProduct.category}</span>

        <Link
          to={`/products/${safeProduct.id}`}
          className="product-title-link"
          onClick={() => trackProductBehavior("click", { ...product, ...safeProduct }, { source: "product-card" })}
        >
          <h3>{safeProduct.name}</h3>
        </Link>

        <div className="product-rating">
          <span className="rating-box">
            <Star size={13} fill="currentColor" />
            {safeProduct.rating}
          </span>
          <span className="review-count">({safeProduct.reviews})</span>
        </div>

        <div className="product-price">
          <strong>₹{formatNumber(safeProduct.price)}</strong>
          {safeProduct.oldPrice > safeProduct.price && <span>₹{formatNumber(safeProduct.oldPrice)}</span>}
          {safeProduct.discount > 0 && <b>{safeProduct.discount}% OFF</b>}
        </div>

        {safeProduct.freeDelivery && (
          <div className="free-delivery">
            <Truck size={15} />
            Free Delivery
          </div>
        )}

        {!safeProduct.inStock && (
          <p className="out-of-stock">Out of Stock</p>
        )}

        <div className="product-buttons">
          <button
            className="add-cart-button"
            onClick={handleAdd}
            disabled={!safeProduct.inStock}
          >
            <ShoppingCart size={16} />
            {added ? "Added" : "Add to Cart"}
          </button>

          <button
            className="buy-now-button"
            onClick={handleBuyNow}
            disabled={!safeProduct.inStock}
          >
            <Zap size={16} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
