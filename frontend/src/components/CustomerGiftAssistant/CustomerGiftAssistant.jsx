import { useEffect, useMemo, useState } from "react";
import { Gift, HeartHandshake, Lightbulb, Search, ShoppingCart } from "lucide-react";
import { addToCart } from "../../services/cart";
import { getProducts } from "../../services/products";
import {
  giftRecipients,
  matchesGiftRecipient,
  resolveRecipientKey,
  scoreGiftMatch,
} from "../giftRules";
import "./CustomerGiftAssistant.css";

const REQUEST_KEY = "clustermind_customer_product_requests";

const budgets = [
  { label: "Any Budget", value: "" },
  { label: "Under Rs. 500", value: "under500" },
  { label: "Rs. 500 - Rs. 5,000", value: "500-5000" },
  { label: "Rs. 5,000 - Rs. 20,000", value: "5000-20000" },
  { label: "Above Rs. 20,000", value: "above20000" },
];

const interests = [
  "Any",
  "Electronics",
  "Fashion",
  "Beauty",
  "Sports",
  "Books",
  "Home & Kitchen",
  "Toys & Games",
  "Grocery",
];

const saveRequest = (request) => {
  const existing = JSON.parse(localStorage.getItem(REQUEST_KEY) || "[]");
  const next = [{ ...request, id: Date.now(), date: new Date().toLocaleDateString("en-IN") }, ...existing].slice(0, 10);
  localStorage.setItem(REQUEST_KEY, JSON.stringify(next));
  return next;
};

export default function CustomerGiftAssistant() {
  const [recipient, setRecipient] = useState("girlfriend");
  const [budget, setBudget] = useState("");
  const [interest, setInterest] = useState("Any");
  const [requestName, setRequestName] = useState("");
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    getProducts({ price: budget }).then((list) => {
      if (active) setProducts(Array.isArray(list) ? list : []);
    });
    return () => {
      active = false;
    };
  }, [budget]);

  const suggestions = useMemo(() => {
    const activeKey = resolveRecipientKey(recipient);
    const list =
      interest === "Any" ? products : products.filter((product) => product.category === interest);
    return list
      .filter((product) => matchesGiftRecipient(product, activeKey))
      .sort((a, b) => scoreGiftMatch(b, activeKey) - scoreGiftMatch(a, activeKey))
      .slice(0, 6);
  }, [products, interest, recipient]);

  const selectedRecipient = giftRecipients.find((item) => item.key === resolveRecipientKey(recipient));

  const handleAdd = (product) => {
    addToCart(product);
    setAdded((state) => ({ ...state, [product.id]: true }));
    setTimeout(() => setAdded((state) => ({ ...state, [product.id]: false })), 1400);
  };

  const handleRequest = () => {
    if (!requestName.trim()) return;
    saveRequest({
      product: requestName.trim(),
      recipient: selectedRecipient?.label || recipient,
      budget: budgets.find((item) => item.value === budget)?.label || "Any Budget",
      interest,
      status: "Requested",
    });
    setRequestName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="customer-gift-assistant" id="gift-assistant">
      <div className="gift-assistant-head">
        <div>
          <span className="gift-kicker">
            <Gift size={16} />
            Smart Gift Assistant
          </span>
          <h2>Find gifts by relationship</h2>
          <p>Select who you want to gift and get product suggestions matched by category, budget and interest.</p>
        </div>
        <div className="gift-summary">
          <HeartHandshake size={20} />
          <span>{suggestions.length} matches for {selectedRecipient?.label}</span>
        </div>
      </div>

      <div className="gift-controls">
        <div>
          <label>Gift for</label>
          <div className="recipient-pills">
            {giftRecipients.map((item) => (
              <button
                key={item.key}
                type="button"
                className={recipient === item.key ? "active" : ""}
                onClick={() => setRecipient(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gift-select-row">
          <label>
            Budget
            <select value={budget} onChange={(event) => setBudget(event.target.value)}>
              {budgets.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Interest
            <select value={interest} onChange={(event) => setInterest(event.target.value)}>
              {interests.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="gift-products">
        {suggestions.map((product) => (
          <article key={product.id} className="gift-product-card">
            <img src={product.image} alt={product.name} />
            <div>
              <small>{product.category}</small>
              <h3>{product.name}</h3>
              <p>Rs. {product.price.toLocaleString("en-IN")}</p>
              <button type="button" onClick={() => handleAdd(product)}>
                <ShoppingCart size={15} />
                {added[product.id] ? "Added" : "Add"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="product-request-box">
        <div>
          <Lightbulb size={18} />
          <span>Did not find the right product?</span>
        </div>
        <div className="request-input-row">
          <input
            value={requestName}
            onChange={(event) => setRequestName(event.target.value)}
            placeholder="Request a product, e.g. personalized photo frame"
          />
          <button type="button" onClick={handleRequest}>
            <Search size={15} />
            {saved ? "Saved" : "Request"}
          </button>
        </div>
      </div>
    </section>
  );
}
