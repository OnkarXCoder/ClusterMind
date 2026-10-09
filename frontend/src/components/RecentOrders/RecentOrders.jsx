import "./RecentOrders.css";
import { useState, useEffect } from "react";
import { isAuthenticated } from "../../services/auth";

const statusClass = { Delivered: "active", Shipped: "info", Processing: "info", Pending: "pending", Cancelled: "blocked" };

function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem("clustermind_token");
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;

    fetch("/api/orders", { headers: h })
      .then(r => r.json())
      .then(data => {
        const list = data?.orders || data || [];
        setOrders(Array.isArray(list) ? list.slice(0, 5) : []);
      })
      .catch(() => {});
  }, []);

  if (orders.length === 0) {
    return (
      <div className="dm-card">
        <div className="dm-card-head">
          <h3>Recent Orders</h3>
          <p className="dm-hero-sub">Your latest purchases</p>
        </div>
        <div className="dm-card-body" style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
          <p>No orders yet. Start shopping to see your orders here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-card">
      <div className="dm-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Recent Orders</h3>
          <p className="dm-hero-sub">Your latest purchases</p>
        </div>
        <button className="dm-btn dm-btn-outline dm-btn-sm">View All</button>
      </div>
      <div className="dm-card-body" style={{ padding: 0 }}>
        <div className="dm-table-wrap" style={{ borderRadius: 0, border: 'none' }}>
          <table className="dm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, index) => (
                <tr key={item._id || index}>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>#{item.orderId || item._id?.slice(-6) || `ORD${index + 1}`}</td>
                  <td>{item.productName || item.items?.[0]?.name || 'Product'}</td>
                  <td style={{ fontWeight: 700 }}>₹{(item.total || item.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td><span className={`dm-badge ${statusClass[item.status] || 'info'}`}>{item.status || 'Processing'}</span></td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RecentOrders;
