import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import AddressCard from "../../components/AddressCard/AddressCard";
import ShippingMethod from "../../components/ShippingMethod/ShippingMethod";
import PaymentMethod from "../../components/PaymentMethod/PaymentMethod";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import PlaceOrderButton from "../../components/PlaceOrderButton/PlaceOrderButton";
import CouponBox from "../../components/CouponBox/CouponBox";
import {
  subscribeCart,
  getCartItems,
  getAppliedCoupon,
  clearCoupon,
} from "../../services/cart";
import { clearCart } from "../../services/cart";
import { getProductById } from "../../services/products";
import { getCurrentUser } from "../../services/auth";
import { openRazorpayCheckout } from "../../services/razorpay";
import { trackProductBehavior } from "../../services/behavior";
import { getPaymentConfig, createOrder, createPaymentOrder, verifyPayment } from "../../api";
import {
  getSavedAddress,
  saveAddress,
  SHIPPING_METHODS,
  PAYMENT_METHODS,
  placeOrder,
} from "../../services/orders";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCartItems());
  const [items, setItems] = useState([]);
  const [, force] = useState(0);
  const [address, setAddress] = useState(getSavedAddress());
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [gift, setGift] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState("");
  const [gateway, setGateway] = useState(null);

  useEffect(() => subscribeCart(() => {
    setCart(getCartItems());
    force((n) => n + 1);
  }), []);

  // Ask the server whether Razorpay is usable, so a missing secret key
  // degrades to "pay on delivery" instead of failing at the last step
  useEffect(() => {
    let cancelled = false;
    getPaymentConfig()
      .then((cfg) => { if (!cancelled) setGateway(cfg); })
      .catch(() => { if (!cancelled) setGateway({ configured: false, keyId: null }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      cart.map(async (item) => ({
        ...item,
        product: await getProductById(item.productId),
      }))
    ).then((resolved) => {
      if (!cancelled) setItems(resolved.filter((item) => item.product));
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  const coupon = getAppliedCoupon();
  const discount = coupon?.discount || 0;
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shipping);
  const delivery = shippingMethod?.price || 0;
  const gst = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + delivery + gst);

  const handleAddressSave = (addr) => {
    setAddress(addr);
    saveAddress(addr);
  };

  const buildOrderPayload = () => ({
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      image: i.product.image,
      quantity: i.quantity,
      price: i.product.price,
    })),
    address,
    shipping: { label: shippingMethod.label, eta: shippingMethod.eta, price: delivery },
    payment: { label: PAYMENT_METHODS.find((p) => p.id === payment)?.label || "Cash on Delivery" },
    totals: { subtotal, shipping: delivery, discount, gst, total },
  });

  const saveLocalDisplayOrder = (serverOrder = null) =>
    placeOrder({
      id: serverOrder?.orderId || serverOrder?._id,
      items,
      address,
      shipping: shippingMethod,
      payment: PAYMENT_METHODS.find((p) => p.id === payment),
      totals: { subtotal, discount, delivery, gst, total },
      placedAt: serverOrder?.createdAt,
    });

  const trackPurchaseHistory = () => {
    items.forEach((item) => {
      trackProductBehavior("purchase", item.product, {
        source: "checkout",
        metadata: {
          quantity: item.quantity,
          orderTotal: total,
          payment,
        },
      });
    });
  };

  const handlePlaceOrder = async () => {
    if (!address?.fullName || !address?.phone || !address?.addressLine || !address?.city || !address?.state || !address?.pincode) {
      setPayError("Please add a complete delivery address before placing the order.");
      return;
    }

    if (payment === "cod" || !gateway?.configured) {
      setPayError("");
      setPlacing(true);
      try {
        const created = await createOrder(buildOrderPayload());
        const order = saveLocalDisplayOrder(created.order);
        trackPurchaseHistory();
        clearCart();
        navigate(`/order-success/${order.id}`);
      } catch (err) {
        // Do NOT invent a local order here: if the server rejected the order
        // (or was unreachable) the customer must see an error, not a fake
        // success screen for an order that does not exist.
        setPayError(
          err?.message || "We couldn't place your order. Please try again."
        );
      } finally {
        setPlacing(false);
      }
      return;
    }
    payWithRazorpay();
  };

  const payWithRazorpay = async () => {
    setPayError("");
    setPlacing(true);
    let dbOrder = null;

    try {
      // 1. Persist the order server-side first — the gateway amount and the
      //    final payment record both hang off this document.
      const created = await createOrder(buildOrderPayload());
      dbOrder = created.order;

      // 2. Ask the backend for a Razorpay order (amount comes from the DB)
      const gatewayOrder = await createPaymentOrder(dbOrder._id);

      // 3. Open the modal
      const checkoutResult = await openRazorpayCheckout({
        order: {
          gatewayOrderId: gatewayOrder.gatewayOrderId,
          amount: gatewayOrder.amount,
          currency: gatewayOrder.currency,
          orderId: dbOrder._id,
        },
        config: { keyId: gatewayOrder.keyId || gateway?.keyId },
        user: getCurrentUser(),
      });

      // 4. The browser callback is not proof of payment — the server verifies
      //    Razorpay's HMAC signature before the order is marked paid.
      await verifyPayment({
        orderId: dbOrder._id,
        gatewayOrderId: checkoutResult.gatewayOrderId,
        paymentId: checkoutResult.paymentId,
        signature: checkoutResult.signature,
      });

      // 5. Only now navigate — the payment has been verified by the server
      const order = saveLocalDisplayOrder(dbOrder);
      trackPurchaseHistory();
      clearCart();
      navigate(`/order-success/${order.id}?paid=1`);
    } catch (err) {
      if (err?.code === "PAYMENT_DISMISSED" || err?.message === "PAYMENT_DISMISSED") {
        setPayError("Payment cancelled. Your items are still in the cart.");
      } else if (err?.code === "PAYMENT_FAILED") {
        setPayError(err.message);
      } else if (!gateway?.configured) {
        setPayError("Online payments aren't available right now.");
      } else {
        setPayError(err?.message || "Something went wrong starting the payment.");
      }
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Sidebar />
        <div style={{ marginLeft: "260px" }}>
          <Navbar />
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add products to your cart before checking out.</p>
            <Link to="/products" className="empty-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="checkout-page">

          <div className="checkout-head">
            <h1>Checkout</h1>
            <div className="checkout-steps">
              <span className="done">Cart</span>
              <ChevronRight size={14} />
              <span className="active">Address & Payment</span>
              <ChevronRight size={14} />
              <span>Order Success</span>
            </div>
          </div>

          <div className="checkout-layout">
            <div className="checkout-left">
              <AddressCard address={address} onSave={handleAddressSave} />

              <ShippingMethod selected={shipping} onChange={setShipping} />

              <PaymentMethod selected={payment} onChange={setPayment} />

              <div className="checkout-card gift-row">
                <label>
                  <input
                    type="checkbox"
                    checked={gift}
                    onChange={(e) => setGift(e.target.checked)}
                  />
                  <Gift size={18} />
                  This order is a gift
                </label>
              </div>

              <CouponBox
                applied={coupon}
                onCouponChange={() => force((n) => n + 1)}
              />
            </div>

            <div className="checkout-right">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                delivery={delivery}
                gst={gst}
                total={total}
                coupon={coupon?.code}
                onClearCoupon={() => {
                  clearCoupon();
                  force((n) => n + 1);
                }}
                deliveryLabel="Shipping"
                totalLabel="Grand Total"
                showButton={false}
              />

              <PlaceOrderButton
                total={total}
                placing={placing}
                onPlaceOrder={handlePlaceOrder}
              />

              {payError && (
                <p className="checkout-pay-error" role="alert">{payError}</p>
              )}

              {!gateway?.configured && gateway !== null && payment !== "cod" && (
                <p className="checkout-pay-note">
                  Online payment isn&apos;t configured yet, so this order will be placed as
                  Cash on Delivery.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
