import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Truck, Package, Calendar } from "lucide-react";
import { getOrderById } from "../../services/orders";
import "./OrderSuccess.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function OrderSuccess() {
  const { orderId } = useParams();
  const order = getOrderById(orderId);

  return (
    <div className="success-page">

      <div className="success-icon">
        <CheckCircle2 size={70} color="#22C55E" />
      </div>

      <h1>Order Placed Successfully</h1>
      <p>Thank you for shopping with us. Your order has been confirmed.</p>

      {order && (
        <div className="order-details">
          <div className="detail-row">
            <Package size={16} />
            <span>Order ID</span>
            <strong>{order.id}</strong>
          </div>
          <div className="detail-row">
            <Calendar size={16} />
            <span>Placed On</span>
            <strong>
              {new Date(order.placedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
          <div className="detail-row">
            <Truck size={16} />
            <span>Estimated Delivery</span>
            <strong>{order.shippingEta}</strong>
          </div>
          <div className="detail-row">
            <Package size={16} />
            <span>Items</span>
            <strong>{order.items.reduce((s, i) => s + i.quantity, 0)}</strong>
          </div>
          <div className="detail-row total">
            <span>Total Paid</span>
            <strong>₹{fmt(order.totals.total)}</strong>
          </div>
        </div>
      )}

      <div className="success-buttons">
        <Link to="/orders" className="track-btn">
          <Truck size={18} />
          Track Order
        </Link>
        <Link to="/products" className="continue-btn">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}
