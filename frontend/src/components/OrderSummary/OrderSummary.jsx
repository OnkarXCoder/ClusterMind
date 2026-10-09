import { Lock } from "lucide-react";
import "./OrderSummary.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function OrderSummary({
  subtotal,
  discount,
  delivery,
  gst,
  total,
  coupon,
  onClearCoupon,
  deliveryLabel = "Delivery",
  buttonLabel = "Proceed to Checkout",
  showButton = true,
  onClick,
  totalLabel = "Total",
}) {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>

      <div className="summary-row">
        <span>Subtotal</span>
        <span>₹{fmt(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className="summary-row discount">
          <span>
            Discount ({coupon})
            <button className="remove-coupon" onClick={onClearCoupon}>
              Remove
            </button>
          </span>
          <span>-₹{fmt(discount)}</span>
        </div>
      )}

      <div className="summary-row">
        <span>{deliveryLabel}</span>
        <span>{delivery === 0 ? "Free" : `₹${fmt(delivery)}`}</span>
      </div>

      <div className="summary-row">
        <span>GST (5%)</span>
        <span>₹{fmt(gst)}</span>
      </div>

      <div className="summary-total">
        <span>{totalLabel}</span>
        <span>₹{fmt(total)}</span>
      </div>

      {showButton && (
        <button className="checkout-btn" onClick={onClick}>
          <Lock size={16} />
          {buttonLabel}
        </button>
      )}

      <p className="secure-note">100% Secure Payments · Easy Returns</p>
    </div>
  );
}
