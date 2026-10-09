import "./CustomerProfile.css";
import { Crown, Layers, CalendarDays, IndianRupee, Gift, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders, hasRemoteAuth, isAuthenticated, getCurrentUser } from "../../services/auth";

function CustomerProfile() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated() || !hasRemoteAuth()) return;
    const user = getCurrentUser();

    Promise.allSettled([
      fetch("/api/loyalty/me", { headers: getAuthHeaders() }),
      fetch("/api/orders", { headers: getAuthHeaders() }),
    ]).then(([loyaltyRes, ordersRes]) => {
      if (loyaltyRes.status === "fulfilled") clearInvalidSession(loyaltyRes.value);
      if (ordersRes.status === "fulfilled") clearInvalidSession(ordersRes.value);
      const loyaltyData = loyaltyRes.status === "fulfilled"
        ? loyaltyRes.value.json().catch(() => ({}))
        : Promise.resolve({});
      const ordersData = ordersRes.status === "fulfilled"
        ? ordersRes.value.json().catch(() => ({}))
        : Promise.resolve({});

      return Promise.all([loyaltyData, ordersData]);
    }).then(([loyaltyData, ordersData]) => {
      const pts = loyaltyData?.points ?? loyaltyData?.loyalty?.points ?? 0;
      const orders = ordersData?.orders || ordersData || [];
      const orderCount = Array.isArray(orders) ? orders.length : 0;
      const totalSpent = Array.isArray(orders) ? orders.reduce((s, o) => s + (o.total || o.totalAmount || 0), 0) : 0;
      const avgOrder = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

      setItems([
        { icon: <Crown size={16} />, label: "Customer Type", value: pts > 1000 ? "Premium Customer" : "Regular Customer", color: "#F59E0B" },
        { icon: <Layers size={16} />, label: "Total Orders", value: `${orderCount} orders`, color: "#2563EB" },
        { icon: <CalendarDays size={16} />, label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'New Member', color: "#16A34A" },
        { icon: <IndianRupee size={16} />, label: "Average Order Value", value: `₹${avgOrder.toLocaleString('en-IN')}`, color: "#7C3AED" },
        { icon: <Gift size={16} />, label: "Loyalty Points", value: `${pts.toLocaleString()} pts`, color: "#EC4899" },
      ]);
    }).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="dm-card" id="shopping-profile">
      <div className="dm-card-head" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkles size={18} style={{ color: '#7C3AED' }} />
        <h3 style={{ margin: 0 }}>Your Shopping Profile</h3>
      </div>
      <div className="dm-card-body" style={{ padding: '8px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 11, background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.04)' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
