import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import CartItem from "../../components/CartItem/CartItem";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import CouponBox from "../../components/CouponBox/CouponBox";
import SuggestedProducts from "../../components/SuggestedProducts/SuggestedProducts";
import {
  subscribeCart,
  getCartItems,
  updateQuantity,
  removeFromCart,
  getAppliedCoupon,
} from "../../services/cart";
import { addToWishlist } from "../../services/wishlist";
import { getProductById } from "../../services/products";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCartItems());
  const [items, setItems] = useState([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => subscribeCart(() => {
    setCart(getCartItems());
    forceUpdate((n) => n + 1);
  }), []);

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
  const delivery = subtotal === 0 || subtotal - discount > 999 ? 0 : 49;
  const gst = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + delivery + gst);

  const handleUpdate = (productId, qty) => updateQuantity(productId, qty);
  const handleRemove = (productId) => removeFromCart(productId);
  const handleSaveLater = (item) => {
    addToWishlist(item.product);
    removeFromCart(item.productId);
  };

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="cart-page">

          <div className="cart-head">
            <h1>
              <ShoppingCart size={26} />
              Shopping Cart
            </h1>
            <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
          </div>

          {items.length === 0 ? (
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Browse products and add your favourites to the cart.</p>
              <Link to="/products" className="empty-btn">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-left">
                <div className="cart-items-list">
                  {items.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onUpdateQty={handleUpdate}
                      onRemove={handleRemove}
                      onSaveLater={handleSaveLater}
                    />
                  ))}
                </div>

                <CouponBox
                  applied={coupon}
                  onCouponChange={() => forceUpdate((n) => n + 1)}
                />
              </div>

              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                delivery={delivery}
                gst={gst}
                total={total}
                coupon={coupon?.code}
                onClearCoupon={() => forceUpdate((n) => n + 1)}
                onClick={() => navigate("/checkout")}
              />
            </div>
          )}

          {items.length > 0 && (
            <SuggestedProducts excludeIds={items.map((i) => i.productId)} />
          )}

        </div>
      </div>
    </>
  );
}
