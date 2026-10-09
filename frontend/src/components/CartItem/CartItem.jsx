import { Link } from "react-router-dom";
import { Minus, Plus, Heart, Trash2 } from "lucide-react";
import "./CartItem.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function CartItem({ item, onUpdateQty, onRemove, onSaveLater }) {
  const { product, quantity } = item;

  return (
    <div className="cart-item">

      <Link to={`/products/${product.id}`} className="cart-item-img">
        <img src={product.image} alt={product.name} />
      </Link>

      <div className="cart-item-details">
        <Link to={`/products/${product.id}`} className="cart-item-name">
          {product.name}
        </Link>
        <p className="cart-item-brand">{product.brand}</p>

        <div className="cart-item-price">
          ₹{fmt(product.price)}
          <span className="old-price">₹{fmt(product.oldPrice)}</span>
        </div>

        <div className="cart-item-actions">
          <div className="qty">
            <button
              onClick={() => onUpdateQty(product.id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={15} />
            </button>
            <span>{quantity}</span>
            <button onClick={() => onUpdateQty(product.id, quantity + 1)}>
              <Plus size={15} />
            </button>
          </div>

          <button className="save-btn" onClick={() => onSaveLater(item)}>
            <Heart size={15} />
            Save for Later
          </button>

          <button className="remove-btn" onClick={() => onRemove(product.id)}>
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      </div>

    </div>
  );
}
