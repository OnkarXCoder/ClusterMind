const CART_KEY = "clustermind_cart";
const COUPON_KEY = "clustermind_coupon";

const listeners = new Set();

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

const write = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  listeners.forEach((fn) => fn(cart));
};

export const subscribeCart = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getCartItems = () => read();

export const getCartCount = () => read().reduce((sum, i) => sum + i.quantity, 0);

export const addToCart = (product, quantity = 1) => {
  const cart = read();
  const productId = product.id || product._id || product.productId;
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, addedAt: Date.now() });
  }
  write(cart);
  return cart;
};

export const updateQuantity = (productId, quantity) => {
  const cart = read().map((i) =>
    i.productId === productId
      ? { ...i, quantity: Math.max(1, quantity) }
      : i
  );
  write(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = read().filter((i) => i.productId !== productId);
  write(cart);
  return cart;
};

export const clearCart = () => {
  write([]);
  return [];
};

export const COUPON_LIST = ["AI20OFF", "WELCOME50", "FIRSTORDER", "FESTIVE100"];

const COUPONS = {
  AI20OFF: { discount: 5000 },
  WELCOME50: { discount: 500 },
  FIRSTORDER: { discount: 1000 },
  FESTIVE100: { discount: 10000 },
};

export const applyCoupon = (code) => {
  const coupon = COUPONS[(code || "").trim().toUpperCase()];
  if (!coupon) {
    return { ok: false, message: "Invalid coupon code" };
  }
  localStorage.setItem(COUPON_KEY, code.trim().toUpperCase());
  return { ok: true, discount: coupon.discount };
};

export const getAppliedCoupon = () => {
  const code = localStorage.getItem(COUPON_KEY);
  const coupon = COUPONS[code];
  return coupon ? { code, discount: coupon.discount } : null;
};

export const clearCoupon = () => {
  localStorage.removeItem(COUPON_KEY);
};
