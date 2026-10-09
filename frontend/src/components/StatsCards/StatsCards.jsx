import "./StatsCards.css";
import { Package, Heart, Gift, BadgePercent } from "lucide-react";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders, hasRemoteAuth, isAuthenticated } from "../../services/auth";

function StatsCards() {
  const [stats, setStats] = useState([
    { title: "My Orders", value: "0", sub: "Placed orders", icon: <Package size={22} />, color: "linear-gradient(135deg, #4F46E5, #6366F1)" },
    { title: "Wishlist", value: "0", sub: "Saved items", icon: <Heart size={22} />, color: "linear-gradient(135deg, #EF4444, #F43F5E)" },
    { title: "Loyalty Points", value: "0", sub: "Reward balance", icon: <Gift size={22} />, color: "linear-gradient(135deg, #16A34A, #22C55E)" },
    { title: "Coupons", value: "0", sub: "Active offers", icon: <BadgePercent size={22} />, color: "linear-gradient(135deg, #F59E0B, #F97316)" },
  ]);

  useEffect(() => {
    if (!isAuthenticated() || !hasRemoteAuth()) return;
    async function load() {
      const updates = [...stats];
      try {
        const headers = getAuthHeaders();
        const [ordersRes, wishlistRes, loyaltyRes, couponsRes] = await Promise.allSettled([
          fetch("/api/orders", { headers }),
          fetch("/api/wishlist", { headers }),
          fetch("/api/loyalty/me", { headers }),
          fetch("/api/coupons/available", { headers }),
        ]);

        [ordersRes, wishlistRes, loyaltyRes, couponsRes].forEach((result) => {
          if (result.status === "fulfilled") clearInvalidSession(result.value);
        });

        if (ordersRes.status === "fulfilled") {
          const data = await ordersRes.value.json().catch(() => ({}));
          const count = ordersRes.value.ok
            ? data?.count ?? data?.orders?.length ?? 0
            : 0;
          updates[0] = { ...updates[0], value: String(count) };
        }
        if (wishlistRes.status === "fulfilled") {
          const data = await wishlistRes.value.json().catch(() => ({}));
          const count = wishlistRes.value.ok
            ? data?.count ?? data?.items?.length ?? 0
            : 0;
          updates[1] = { ...updates[1], value: String(count) };
        }
        if (loyaltyRes.status === "fulfilled") {
          const data = await loyaltyRes.value.json().catch(() => ({}));
          const pts = loyaltyRes.value.ok
            ? data?.points ?? data?.loyalty?.points ?? 0
            : 0;
          updates[2] = { ...updates[2], value: Number(pts).toLocaleString("en-IN") };
        }
        if (couponsRes.status === "fulfilled") {
          const data = await couponsRes.value.json().catch(() => ({}));
          const count = couponsRes.value.ok
            ? data?.count ?? data?.coupons?.length ?? 0
            : 0;
          updates[3] = { ...updates[3], value: String(count) };
        }
      } catch {
        // Fallback gracefully
      }
      setStats(updates);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dm-stat-grid">
      {stats.map((item, index) => (
        <div className="dm-stat-card" key={index}>
          <div className="dm-stat-card-top">
            <div>
              <p className="dm-stat-card-label">{item.title}</p>
              <p className="dm-stat-card-value">{item.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{item.sub}</p>
            </div>
            <div className="dm-stat-card-icon" style={{ background: item.color }}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
