import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "../ProductCard/ProductCard";
import { getProducts } from "../../services/products";
import "./RecommendedProducts.css";

export default function RecommendedProducts() {
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    let active = true;

    getProducts().then((products) => {
      if (!active) return;
      setRecommendedProducts(
        products
          .filter((product) => product.aiRecommended)
          .slice(0, 4)
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="recommended-section">

      <div className="recommended-header">

        <div>
          <div className="recommended-title">
            <Sparkles size={20} />
            <h2>Recommended For You</h2>
          </div>
          <p>Products selected based on your shopping behavior</p>
        </div>

        <button
          className="view-all-button"
          onClick={() => navigate("/products")}
        >
          View All
          <ArrowRight size={16} />
        </button>

      </div>

      <div className="recommended-grid">

        {recommendedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </section>
  );
}
