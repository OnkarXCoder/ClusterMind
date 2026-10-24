import "./AIRecommendations.css";
import { Sparkles, Star, ShoppingCart, BrainCircuit } from "lucide-react";
import { addToCart } from "../../services/cart";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders, hasRemoteAuth, isAuthenticated } from "../../services/auth";
import { resolveProductImage } from "../../utils/productImages";

const fmt = (n) => n?.toLocaleString("en-IN") || "0";

function AIRecommendations({ showEmptyState = false }) {
  const [items, setItems] = useState([]);
  const [added, setAdded] = useState({});

  useEffect(() => {
    if (!isAuthenticated() || !hasRemoteAuth()) return;
    fetch("/api/recommendations", { headers: getAuthHeaders() })
      .then((response) => {
        clearInvalidSession(response);
        if (!response.ok) throw new Error("Unable to load recommendations");
        return response.json();
      })
      .then(data => {
        const list = data?.recommendations || data?.products || data || [];
        if (Array.isArray(list) && list.length > 0) {
          setItems(list.slice(0, 4).map(r => {
            const product = r.product || {};
            const normalized = {
              id: product.id || product._id || r.productId || r._id || r.id,
              name: product.name || r.name || r.productName || "Recommended Product",
              price: product.price ?? r.price ?? 0,
              rating: product.rating ?? r.rating ?? 4.5,
              image: product.image || r.image || product.thumbnail || r.thumbnail || "",
              reason: r.reason || r.explanation || "Recommended for you",
              category: product.category || r.category || "",
            };
            return {
              ...normalized,
              image: resolveProductImage(normalized),
            };
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleAdd = (item) => {
    addToCart(item);
    setAdded((s) => ({ ...s, [item.id]: true }));
    setTimeout(() => setAdded((s) => ({ ...s, [item.id]: false })), 1500);
  };

  if (items.length === 0 && !showEmptyState) return null;

  return (
    <div className="dm-card" id="ai-recommendations">
      <div className="dm-card-head" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <BrainCircuit size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0 }}>AI Recommendations For You</h3>
          <p className="dm-hero-sub">Personalized products selected based on your behavior</p>
        </div>
      </div>
      <div className="dm-card-body">
        {items.length === 0 ? (
          <div className="ai-recs-empty">
            <BrainCircuit size={42} />
            <h4>No recommendations available yet</h4>
            <p>Continue browsing and shopping to receive personalized product suggestions.</p>
          </div>
        ) : (
          <div className="ai-recs-grid">
            {items.map((item) => (
            <div key={item.id} className="dm-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#EDE9FE', color: '#7C3AED', fontSize: 11, fontWeight: 700 }}>
                    🤖 AI Pick
                  </span>
                </div>
                <div style={{ width: '100%', height: 140, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} /> : <BrainCircuit size={40} color="#CBD5E1" />}
                </div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={12} style={{ color: '#F59E0B' }} />
                  {item.reason}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                    <Star size={13} fill="#F59E0B" />{item.rating}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#1E293B' }}>₹{fmt(item.price)}</span>
                </div>
                <button className={`dm-btn ${added[item.id] ? 'dm-btn-success' : 'dm-btn-primary'}`} style={{ width: '100%', fontSize: 12, padding: '8px 12px' }} onClick={() => handleAdd(item)}>
                  {added[item.id] ? '✓ Added' : <><ShoppingCart size={14} /> Add to Cart</>}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIRecommendations;
