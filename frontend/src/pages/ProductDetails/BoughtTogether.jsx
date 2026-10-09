import { useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { getBoughtTogether } from "../../services/products";
import "./ProductDetails.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function BoughtTogether({ product }) {
  const [bundle, setBundle] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getBoughtTogether(product).then((items) => {
      if (!cancelled) setBundle(Array.isArray(items) ? items : []);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const total = bundle.reduce((sum, p) => sum + Number(p.price || 0), 0);

  const handleAddAll = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bundle-section">
      <h2>🔥 Frequently Bought Together</h2>

      <div className="bundle-row">
        {bundle.map((item, index) => (
          <div className="bundle-item" key={item.id}>
            {index > 0 && <Plus size={20} className="plus" />}
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
            <span>₹{fmt(item.price)}</span>
          </div>
        ))}
      </div>

      <div className="bundle-footer">
        <p>
          Total Price: <strong>₹{fmt(total)}</strong>
        </p>
        <button onClick={handleAddAll}>
          {added ? (
            "✓ Added All to Cart"
          ) : (
            <>
              <ShoppingCart size={18} />
              Add All to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
