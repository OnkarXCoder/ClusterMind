const ORDERS_KEY = "clustermind_orders";
const ADDRESS_KEY = "clustermind_address";

const readOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeOrders = (orders) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const defaultAddress = {
  fullName: "Rahul Sharma",
  phone: "9876543210",
  addressLine: "Flat 102, Green Residency",
  city: "Solapur",
  state: "Maharashtra",
  pincode: "413001",
};

export const getSavedAddress = () => {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null") || defaultAddress;
  } catch {
    return defaultAddress;
  }
};

export const saveAddress = (address) => {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
};

export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", eta: "2-3 Days", price: 0 },
  { id: "express", label: "Express Delivery", eta: "Tomorrow", price: 99 },
  { id: "same-day", label: "Same Day Delivery", eta: "Today", price: 199 },
];

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", color: "#7C3AED" },
  { id: "credit", label: "Credit Card", color: "#2563EB" },
  { id: "debit", label: "Debit Card", color: "#16A34A" },
  { id: "wallet", label: "Wallet", color: "#F59E0B" },
  { id: "cod", label: "Cash on Delivery", color: "#92400E" },
];

export const placeOrder = ({ id, items, address, shipping, payment, totals, placedAt }) => {
  const orders = readOrders();
  const order = {
    id: id || "ORD" + Date.now(),
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      image: i.product.image,
      quantity: i.quantity,
      price: i.product.price,
    })),
    address,
    shipping: shipping.label,
    shippingEta: shipping.eta,
    shippingPrice: shipping.price,
    payment: payment.label,
    totals,
    status: "Processing",
    placedAt: placedAt || new Date().toISOString(),
  };
  orders.unshift(order);
  writeOrders(orders);
  return order;
};

export const getOrders = () => readOrders();

export const getOrderById = (id) => readOrders().find((o) => o.id === id);
