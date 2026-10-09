import "./LoyaltyCard.css";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { clearInvalidSession, getAuthHeaders, getCurrentUser, hasRemoteAuth, isAuthenticated } from "../../services/auth";

function LoyaltyCard() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) return;

    let cancelled = false;
    const localPoints = Number(getCurrentUser()?.loyaltyPoints);
    if (Number.isFinite(localPoints)) {
      setPoints(localPoints);
    }

    if (!hasRemoteAuth()) return () => {
      cancelled = true;
    };

    fetch("/api/loyalty/me", { headers: getAuthHeaders() })
      .then((response) => {
        clearInvalidSession(response);
        if (!response.ok) throw new Error("Unable to load loyalty points");
        return response.json();
      })
      .then((data) => {
        const remotePoints = Number(data?.points ?? data?.loyalty?.points);
        if (!cancelled && Number.isFinite(remotePoints)) {
          setPoints(remotePoints);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dm-card" id="loyalty" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none", color: "#fff" }}>
      <div className="dm-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, padding: "28px 24px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={24} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8, fontWeight: 600 }}>ClusterMind Rewards</p>
          <p style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{points.toLocaleString("en-IN")}</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>Available Points</p>
        </div>
        <button className="dm-btn" style={{ background: "#fff", color: "#2563EB", fontWeight: 800, width: "100%" }}>
          Redeem Now
        </button>
      </div>
    </div>
  );
}

export default LoyaltyCard;
