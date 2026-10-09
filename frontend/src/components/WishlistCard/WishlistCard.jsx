import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Share2,
  Check,
  Star,
} from "lucide-react";
import {
  removeFromWishlist,
  subscribeWishlist,
  isInWishlist,
} from "../../services/wishlist";
import { addToCart } from "../../services/cart";
import "./WishlistCard.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function WishlistCard({ product }) {
  const [inList, setInList] = useState(isInWishlist(product.id));
  const [moved, setMoved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(
    () => subscribeWishlist(() => setInList(isInWishlist(product.id))),
    [product.id]
  );

  const handleMoveToCart = () => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setMoved(true);
  };

  const handleDelete = () => {
    removeFromWishlist(product.id);
  };

  const handleShare = async () => {
    const url = window.location.origin + "/products/" + product.id;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled share */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="wcard">
      <Link to={"/products/" + product.id} className="wcard-img">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.aiPick && <span className="ai-chip">AI PICK</span>}
      </Link>

      <div className="wcard-body">
        <div className="wcard-brand">{product.brand}</div>

        <Link to={"/products/" + product.id} className="wcard-name">
          {product.name}
        </Link>

        <div className="wcard-rating">
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span>{product.rating}</span>
          <small>({product.reviews} reviews)</small>
        </div>

        <div className="wcard-price">
          <strong>₹{fmt(product.price)}</strong>
          {product.mrp > product.price && (
            <span className="wcard-mrp">₹{fmt(product.mrp)}</span>
          )}
          {product.discount && (
            <span className="wcard-off">{product.discount}% off</span>
          )}
        </div>

        {moved && (
          <div className="wcard-moved">
            <Check size={15} /> Moved to cart
          </div>
        )}

        <div className="wcard-actions">
          <button className="move-btn" onClick={handleMoveToCart}>
            <ShoppingCart size={16} />
            Move to Cart
          </button>

          <button
            className={"share-btn" + (copied ? " copied" : "")}
            onClick={handleShare}
            title="Share"
          >
            <Share2 size={16} />
            {copied ? "Copied" : "Share"}
          </button>

          <button
            className="del-btn"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!inList && (
        <div className="wcard-removed">
          <Check size={16} /> Removed from wishlist
        </div>
      )}
    </div>
  );
}
