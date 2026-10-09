import "./NotificationPanel.css";
import { Bell, Package, BadgePercent, Sparkles, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders, hasRemoteAuth, isAuthenticated } from "../../services/auth";
import { getOrders } from "../../services/orders";

const iconForType = {
  order: { icon: Package, color: "#2563EB", bg: "#DBEAFE" },
  offer: { icon: BadgePercent, color: "#16A34A", bg: "#DCFCE7" },
  recommendation: { icon: Sparkles, color: "#7C3AED", bg: "#EDE9FE" },
  loyalty: { icon: Gift, color: "#F59E0B", bg: "#FEF3C7" },
  default: { icon: Bell, color: "#64748B", bg: "#F1F5F9" },
};

const toNotifications = (orders) =>
  orders.slice(0, 4).map((order) => {
    const type = order.status?.toLowerCase() === "delivered" ? "loyalty" : "order";
    const config = iconForType[type] || iconForType.default;
    const Icon = config.icon;
    const firstItem = order.items?.[0];
    const orderReference = order.orderId || order.id || order._id || "your order";

    return {
      title: type === "loyalty" ? "Loyalty Rewards" : "Order Updates",
      desc: type === "loyalty"
        ? `You earned points for order #${orderReference}`
        : `${order.productName || firstItem?.name || "Product"} — ${order.status || "Processing"}`,
      icon: <Icon size={16} />,
      color: config.color,
      bg: config.bg,
    };
  });

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    if (!hasRemoteAuth()) {
      setNotifications(toNotifications(getOrders()));
      return;
    }

    let cancelled = false;
    fetch("/api/orders", { headers: getAuthHeaders() })
      .then((response) => {
        clearInvalidSession(response);
        if (!response.ok) throw new Error("Unable to load notifications");
        return response.json();
      })
      .then((data) => {
        const remoteOrders = data?.orders || data || [];
        const orders = Array.isArray(remoteOrders) && remoteOrders.length > 0
          ? remoteOrders
          : getOrders();

        if (!cancelled && Array.isArray(orders)) {
          setNotifications(toNotifications(orders));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications(toNotifications(getOrders()));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="dm-card" id="notifications">
      <div className="dm-card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={18} style={{ color: "#2563EB" }} />
          <h3 style={{ margin: 0 }}>Notifications</h3>
        </div>
        <span className="dm-badge info">{notifications.length} New</span>
      </div>
      <div className="dm-card-body" style={{ padding: "8px 20px" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {notifications.map((notification, index) => (
            <li key={index} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderRadius: 12, transition: "background 0.15s" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: notification.bg, color: notification.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {notification.icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1E293B" }}>{notification.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{notification.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NotificationPanel;
