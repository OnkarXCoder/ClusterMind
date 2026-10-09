import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import WishlistCard from "../../components/WishlistCard/WishlistCard";
import SuggestedProducts from "../../components/SuggestedProducts/SuggestedProducts";
import { getWishlist, subscribeWishlist } from "../../services/wishlist";
import { getCartItems } from "../../services/cart";
import { getProductById } from "../../services/products";
import "./Wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState(getWishlist());
  const [products, setProducts] = useState([]);

  useEffect(
    () =>
      subscribeWishlist(() => {
        setItems(getWishlist());
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    Promise.all(items.map((w) => getProductById(w.productId))).then((resolved) => {
      if (!cancelled) {
        setProducts(resolved.filter(Boolean));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const excludeIds = useMemo(
    () => [...new Set([...items.map((w) => w.productId), ...getCartItems().map((c) => c.productId)])],
    [items]
  );

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="wishlist-page">
          <div className="wishlist-head">
            <h1>
              <Heart size={26} fill="#EF4444" color="#EF4444" />
              My Wishlist
              <span className="wishlist-count">{products.length}</span>
            </h1>
            {products.length > 0 && (
              <p>Tap on a product to view details or move it to your cart.</p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="wishlist-empty">
              <Heart size={52} color="#D1D5DB" />
              <h2>Your wishlist is empty</h2>
              <p>Save your favourite products and find them here.</p>
              <Link to="/products">
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="wishlist-grid">
                {products.map((p) => (
                  <WishlistCard key={p.id} product={p} />
                ))}
              </div>

              <div className="wishlist-ai">
                <SuggestedProducts excludeIds={excludeIds} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
