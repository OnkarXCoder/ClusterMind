import { Link, useParams } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { getProductById } from "../../services/products";
import { trackProductBehavior } from "../../services/behavior";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import DeliveryChecker from "./DeliveryChecker";
import ProductSpecification from "./ProductSpecification";
import ProductReviews from "./ProductReviews";
import SimilarProducts from "./SimilarProducts";
import BoughtTogether from "./BoughtTogether";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProduct(null);

    getProductById(id).then((resolvedProduct) => {
      if (!cancelled) {
        setProduct(resolvedProduct);
        setLoading(false);
        if (resolvedProduct) {
          trackProductBehavior("view", resolvedProduct, { source: "product-details" });
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="not-found">
        <Loader2 className="spin" size={32} />
        <h2>Loading product</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Product not found</h2>
        <Link to="/products" className="back-link">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="details-page">

          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products">{product.category}</Link>
            <ChevronRight size={14} />
            <Link to="/products">{product.brand}</Link>
            <ChevronRight size={14} />
            <span>{product.name}</span>
          </nav>

          <div className="details-top">
            <ImageGallery product={product} />
            <div className="details-right">
              <ProductInfo product={product} />
              <DeliveryChecker product={product} />
            </div>
          </div>

          <div className="details-bottom">
            <ProductSpecification product={product} />
            <div className="desc-card">
              <h2>📋 Product Description</h2>
              <p>{product.description}</p>
              <p>
                This product has been carefully chosen for you by our AI
                recommendation engine based on your shopping history and
                preferences. Buy with confidence and enjoy free delivery,
                easy returns and cash on delivery options.
              </p>
            </div>
          </div>

          <ProductReviews product={product} />

          <BoughtTogether product={product} />

          <SimilarProducts product={product} />

        </div>
      </div>
    </>
  );
}
