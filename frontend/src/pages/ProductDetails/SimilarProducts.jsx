import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getSimilarProducts } from "../../services/products";
import "./ProductDetails.css";

export default function SimilarProducts({ product }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getSimilarProducts(product).then((items) => {
      if (!cancelled) setSimilar(Array.isArray(items) ? items : []);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  return (
    <div className="similar-section">
      <div className="similar-head">
        <h2>
          <Sparkles size={22} />
          Similar Products
        </h2>
        <span>Recommended by AI based on your shopping behaviour</span>
      </div>

      <div className="similar-grid">
        {similar.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
