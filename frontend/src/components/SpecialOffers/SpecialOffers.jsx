import "./SpecialOffers.css";
import { BadgePercent, Truck, Gift, CreditCard, Sparkles, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders } from "../../services/auth";

const iconMap = { percent: BadgePercent, truck: Truck, gift: Gift, credit: CreditCard, tag: Tag };
const colorMap = {
  blue: { color: "#2563EB", bg: "#DBEAFE", light: "#EFF6FF" },
  green: { color: "#16A34A", bg: "#DCFCE7", light: "#F0FDF4" },
  yellow: { color: "#D97706", bg: "#FEF3C7", light: "#FFFBEB" },
  pink: { color: "#EC4899", bg: "#FCE7F3", light: "#FDF2F8" },
};

function SpecialOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const headers = getAuthHeaders();

    fetch("/api/coupons/available", { headers })
      .then((response) => {
        clearInvalidSession(response);
        if (!response.ok) throw new Error("Unable to load offers");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const list = data?.coupons || data || [];
        if (Array.isArray(list) && list.length > 0) {
          const colors = ["blue", "green", "yellow", "pink"];
          const icons = ["percent", "truck", "gift", "credit"];
          setOffers(
            list.slice(0, 4).map((c, i) => {
              const discountDisplay =
                c.discount > 100
                  ? `₹${Number(c.discount).toLocaleString("en-IN")} OFF`
                  : `${c.discount}% OFF`;
              return {
                title: discountDisplay,
                subtitle: c.description || (c.minPurchase ? `Min purchase ₹${c.minPurchase}` : `Use code ${c.code} at checkout`),
                code: c.code,
                iconKey: icons[i % icons.length],
                colorKey: colors[i % colors.length],
              };
            })
          );
        } else {
          setOffers([]);
        }
      })
      .catch(() => {
        if (active) setOffers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loading && offers.length === 0) return null;

  return (
    <div className="dm-card" id="offers">
      <div className="dm-card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3>Personalized Offers &amp; Coupons</h3>
          <p className="dm-hero-sub">Live savings and coupons active on your account</p>
        </div>
        <span className="dm-badge active">
          <Sparkles size={12} style={{ marginRight: 4 }} />
          Verified Active
        </span>
      </div>
      <div className="dm-card-body">
        <div className="offers-grid">
          {offers.map((offer, index) => {
            const Icon = iconMap[offer.iconKey] || BadgePercent;
            const colors = colorMap[offer.colorKey] || colorMap.blue;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 18,
                  borderRadius: 14,
                  background: colors.light,
                  border: `1px solid ${colors.bg}`,
                  transition: "all 0.25s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: colors.bg,
                    color: colors.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: colors.color }}>{offer.title}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>{offer.subtitle}</p>
                </div>
                {offer.code && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "#FFFFFF",
                      border: `1px solid ${colors.bg}`,
                      color: colors.color,
                      fontSize: 12,
                      fontWeight: 800,
                      alignSelf: "flex-start",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Tag size={12} />
                    {offer.code}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpecialOffers;
