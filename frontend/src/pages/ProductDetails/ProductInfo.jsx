import { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  Star,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { addToCart } from "../../services/cart";
import { trackProductBehavior } from "../../services/behavior";
import "./ProductDetails.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function ProductInfo({ product }) {
  const [color, setColor] = useState("Black");
  const [storage, setStorage] = useState("256GB");
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const colors = ["Black", "Blue", "White"];
  const storages = ["128GB", "256GB", "512GB"];
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || price);
  const saved = Math.max(0, oldPrice - price);

  const handleAdd = () => {
    addToCart(product, qty);
    trackProductBehavior("add_to_cart", product, { source: "product-details", metadata: { quantity: qty } });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-info">

      <div className="info-category">
        {product.brand} · {product.category}
      </div>

      <h1>{product.name}</h1>

      <div className="rating">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              fill={s <= Math.round(product.rating) ? "#F59E0B" : "#E2E8F0"}
              color={s <= Math.round(product.rating) ? "#F59E0B" : "#E2E8F0"}
            />
          ))}
        </div>
        <span>{product.rating}</span>
        <span className="reviews">({product.reviews} Ratings)</span>
      </div>

      <div className="price-block">
        <span className="price">₹{fmt(price)}</span>
        {oldPrice > price && <span className="old-price">₹{fmt(oldPrice)}</span>}
        <span className="save">(Save ₹{fmt(saved)})</span>
      </div>

      <p className={product.inStock ? "instock" : "outofstock"}>
        <CheckCircle2 size={15} />
        {product.inStock ? "In Stock" : "Out of Stock"}
      </p>

      <p className="delivery-line">
        <Truck size={15} />
        Free Delivery by Tomorrow
      </p>

      <div className="option-group">
        <h4>Color</h4>
        <div className="options">
          {colors.map((c) => (
            <button
              key={c}
              className={`option ${color === c ? "active" : ""}`}
              onClick={() => setColor(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <h4>Storage</h4>
        <div className="options">
          {storages.map((s) => (
            <button
              key={s}
              className={`option ${storage === s ? "active" : ""}`}
              onClick={() => setStorage(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <h4>Quantity</h4>
        <div className="qty">
          <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
            <Minus size={16} />
          </button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className={`wish-btn ${liked ? "liked" : ""}`}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={18} fill={liked ? "#EF4444" : "none"} />
          {liked ? "Wishlisted" : "Wishlist"}
        </button>

        <button className="add-btn" onClick={handleAdd}>
          {added ? (
            "✓ Added"
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>

        <button className="buy-btn">
          <Zap size={18} />
          Buy Now
        </button>
      </div>

    </div>
  );
}
