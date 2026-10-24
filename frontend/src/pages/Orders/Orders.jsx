import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, RotateCcw, X, Loader2, CheckCircle2 } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { getOrders as fetchOrders, getReturnRequests, createReturnRequest, cancelReturnRequest } from "../../api";
import { getOrders as readLocalOrders } from "../../services/orders";
import "./Orders.css";

const RETURN_REASONS = [
  "Damaged on arrival",
  "Defective product",
  "Wrong item delivered",
  "Item not as described",
  "Changed my mind",
  "Arrived too late",
];

const STATUS_TONE = {
  Processing: "blue",
  Shipped: "purple",
  Delivered: "green",
  Cancelled: "red",
  Refunded: "amber",
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* Backend orders and localStorage orders have different shapes, so normalise
   both into one shape and remember which source each came from. */
function normalise(order, source) {
  const id = order._id || order.id;
  const items = (order.items || []).map((i) => ({
    id: i.productId,
    name: i.name,
    image: i.image,
    quantity: i.quantity,
    price: i.price,
  }));
  const totals = order.totals || {
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    shipping: order.shippingPrice || 0,
    discount: 0,
    total: order.totals?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0) + (order.shippingPrice || 0),
  };
  return {
    id,
    displayId: order.orderId || order.id || id,
    source,
    items,
    totals,
    status: order.status || "Processing",
    placedAt: order.createdAt || order.placedAt,
    // Only server orders can actually be returned against
    canReturn: source === "api" && !["Cancelled", "Refunded"].includes(order.status),
  };
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOrder, setActiveOrder] = useState(null);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const loadReturns = useCallback(async () => {
    try {
      const res = await getReturnRequests();
      setReturns(res.requests || res || []);
    } catch {
      setReturns([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      let loaded = [];
      try {
        const res = await fetchOrders();
        const list = res.orders || res || [];
        loaded = list.map((o) => normalise(o, "api"));
      } catch {
        // Not signed in, or backend unavailable — fall back to local orders
        try {
          loaded = readLocalOrders().map((o) => normalise(o, "local"));
        } catch {
          loaded = [];
        }
        if (!cancelled) {
          setError("Showing orders saved on this device. Sign in to sync them across devices.");
        }
      }
      if (!cancelled) {
        setOrders(loaded);
        setLoading(false);
        loadReturns();
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [loadReturns]);

  async function submitReturn(e) {
    e.preventDefault();
    if (!activeOrder) return;
    setSubmitting(true);
    try {
      await createReturnRequest({ orderId: activeOrder.id, reason, type: "Refund" });
      setNotice("Return request submitted. We'll confirm within 24 hours.");
      setActiveOrder(null);
      loadReturns();
    } catch (err) {
      setError(err.message || "Could not submit the return request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelReturn(id) {
    try {
      await cancelReturnRequest(id);
      setNotice("Return request cancelled.");
      loadReturns();
    } catch (err) {
      setError(err.message || "Could not cancel the request.");
    }
  }

  const returnIdForOrder = (orderId) => returns.find((r) => String(r.order) === String(orderId));

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "260px" }}>
        <Navbar />
        <div className="orders-page">
          <h1>My Orders</h1>

          {notice && (
            <div className="orders-notice">
              <CheckCircle2 size={16} /> {notice}
              <button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button>
            </div>
          )}
          {error && <div className="orders-warning">{error}</div>}

          {loading ? (
            <div className="orders-placeholder">
              <Loader2 size={40} className="spin" />
              <h2>Loading your orders</h2>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-placeholder">
              <Package size={48} color="#9CA3AF" />
              <h2>No orders yet</h2>
              <p>When you place an order it will show up here.</p>
              <Link to="/products" className="orders-cta">Start shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const existing = returnIdForOrder(order.id);
                return (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-head">
                      <div>
                        <span className="order-id">{String(order.displayId).slice(-14).toUpperCase()}</span>
                        <span className="order-date">{formatDate(order.placedAt)}</span>
                      </div>
                      <span className={`order-status ${STATUS_TONE[order.status] || "blue"}`}>{order.status}</span>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, i) => (
                        <div className="order-item" key={`${item.id}-${i}`}>
                          {item.image ? <img src={item.image} alt={item.name} /> : <div className="order-item-img-empty" />}
                          <div className="order-item-meta">
                            <p className="order-item-name">{item.name}</p>
                            <p className="order-item-qty">Qty {item.quantity} × {inr(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-foot">
                      <div className="order-total">
                        <span>Total</span>
                        <strong>{inr(order.totals.total)}</strong>
                      </div>
                      {existing ? (
                        <span className="order-return-state">
                          Return {existing.status.toLowerCase()}
                          {existing.status === "Pending" && (
                            <button onClick={() => cancelReturn(existing._id)}>Cancel</button>
                          )}
                        </span>
                      ) : order.canReturn ? (
                        <button className="order-return-btn" onClick={() => { setActiveOrder(order); setReason(RETURN_REASONS[0]); }}>
                          <RotateCcw size={14} /> Request return
                        </button>
                      ) : (
                        <span className="order-return-hint">Sign in to request a return</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeOrder && (
            <div className="orders-modal-backdrop" onClick={() => setActiveOrder(null)}>
              <form className="orders-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitReturn}>
                <h3>Request a return</h3>
                <p className="orders-modal-sub">
                  {activeOrder.items.length} item{activeOrder.items.length > 1 ? "s" : ""} · {inr(activeOrder.totals.total)}
                </p>

                <label htmlFor="return-reason">Why are you returning this?</label>
                <select id="return-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <ul className="orders-modal-items">
                  {activeOrder.items.map((item, i) => (
                    <li key={`${item.id}-${i}`}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>

                <div className="orders-modal-actions">
                  <button type="button" className="orders-btn-ghost" onClick={() => setActiveOrder(null)}>Cancel</button>
                  <button type="submit" className="orders-btn-primary" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit request"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
