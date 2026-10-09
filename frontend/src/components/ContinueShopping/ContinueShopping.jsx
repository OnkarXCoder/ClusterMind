import { useEffect, useState } from "react";
import "./ContinueShopping.css";
import RecentCard from "../RecentCard/RecentCard";
import { getProducts } from "../../services/products";

export default function ContinueShopping() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    getProducts().then((list) => {
      if (!active) return;
      setProducts(list.filter((p) => [1, 4, 6, 8].includes(p.id)));
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="continue">

      <div className="heading">
        <h2>🕒 Continue Shopping</h2>
        <button>View All</button>
      </div>

      <div className="scroll-products">
        {products.map((item) => (
          <RecentCard
            key={item.id}
            product={item}
          />
        ))}
      </div>

    </div>
  );
}
