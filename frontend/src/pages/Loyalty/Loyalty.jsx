import { Gift, Sparkles } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import LoyaltyCard from "../../components/LoyaltyCard/LoyaltyCard";
import "./Loyalty.css";

export default function Loyalty() {
  return (
    <>
      <Sidebar />
      <div className="standalone-page-shell">
        <Navbar />
        <main className="standalone-page">
          <div className="standalone-page-heading">
            <div className="standalone-page-icon loyalty-page-icon">
              <Gift size={25} />
            </div>
            <div>
              <h1>Loyalty Points</h1>
              <p>View your available points and rewards.</p>
            </div>
          </div>
          <div className="loyalty-page-grid">
            <LoyaltyCard />
            <section className="loyalty-info-card">
              <div className="loyalty-info-icon"><Sparkles size={22} /></div>
              <h2>How loyalty points work</h2>
              <p>Earn points when you shop and receive rewards as you continue shopping with ClusterMind.</p>
              <div className="loyalty-rule"><strong>Available points</strong><span>Use your points on eligible rewards.</span></div>
              <div className="loyalty-rule"><strong>Reward activity</strong><span>New points and redemptions will be reflected here.</span></div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
