import { useState } from "react";
import {
  CircleHelp,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  MessageSquare,
  Truck,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Package,
} from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./Help.css";

const faqs = [
  {
    icon: <Truck size={18} />,
    q: "How do I track my order?",
    a: "Go to Orders from the sidebar. Every order shows its current status — Delivered, Shipped, Pending or Cancelled — along with the expected date.",
  },
  {
    icon: <RefreshCw size={18} />,
    q: "What is the return policy?",
    a: "You can return most items within 7 days of delivery for a full refund. The product must be unused and in its original packaging.",
  },
  {
    icon: <CreditCard size={18} />,
    q: "Which payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking and Cash on Delivery for eligible pincodes.",
  },
  {
    icon: <ShieldCheck size={18} />,
    q: "How do my loyalty points work?",
    a: "You earn points on every purchase. Points can be redeemed for discounts and exclusive offers from your Profile page.",
  },
  {
    icon: <Package size={18} />,
    q: "How do I cancel an order?",
    a: "Orders can be cancelled from the Orders page before they are shipped. The refund is processed within 5–7 business days.",
  },
];

export default function Help() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);

  const filtered = faqs.filter((f) =>
    (f.q + f.a).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="help-page-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="help-page">
          <div className="help-title">
            <h1>Help & Support</h1>
            <p>We&apos;re here to help you 24/7</p>
          </div>

          <div className="help-search">
            <CircleHelp size={20} />
            <input
              type="text"
              placeholder="Search for help topics, e.g. returns, payment, tracking..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="help-grid">
            <div className="help-card help-faq">
              <h2>Frequently Asked Questions</h2>

              <div className="faq-list">
                {filtered.length ? (
                  filtered.map((faq, index) => (
                    <div
                      className={`faq-item ${openIndex === index ? "open" : ""}`}
                      key={index}
                    >
                      <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                        <span className="faq-icon">{faq.icon}</span>
                        <span>{faq.q}</span>
                        <ChevronDown size={18} className="faq-arrow" />
                      </button>
                      {openIndex === index && <p>{faq.a}</p>}
                    </div>
                  ))
                ) : (
                  <p className="faq-empty">No results found for &quot;{query}&quot;</p>
                )}
              </div>
            </div>

            <div className="help-side">
              <div className="help-card">
                <h2>Contact Support</h2>

                <a className="contact-row" href="mailto:support@clustermind.com">
                  <span className="c-icon"><Mail size={18} /></span>
                  <div>
                    <small>Email</small>
                    <strong>support@clustermind.com</strong>
                  </div>
                </a>

                <a className="contact-row" href="tel:1800123456">
                  <span className="c-icon"><Phone size={18} /></span>
                  <div>
                    <small>Toll Free</small>
                    <strong>1800-123-456</strong>
                  </div>
                </a>

                <a className="contact-row" href="mailto:support@clustermind.com">
                  <span className="c-icon"><MessageCircle size={18} /></span>
                  <div>
                    <small>Live Chat</small>
                    <strong>Mon–Sat, 9am–9pm</strong>
                  </div>
                </a>
              </div>

              <div className="help-card help-ticket">
                <h2>Submit a Ticket</h2>
                <p>Having an issue? Raise a ticket and our team will respond within 24 hours.</p>
                {sent ? (
                  <p className="ticket-sent">
                    ✅ Ticket submitted! We&apos;ll email you shortly.
                  </p>
                ) : (
                  <button onClick={() => setSent(true)}>
                    <MessageSquare size={18} />
                    Raise a Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
