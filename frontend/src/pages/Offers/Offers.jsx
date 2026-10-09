import { useState } from "react";
import { BadgePercent, Ticket } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import SpecialOffers from "../../components/SpecialOffers/SpecialOffers";
import CouponBox from "../../components/CouponBox/CouponBox";
import { getAppliedCoupon } from "../../services/cart";
import "./Offers.css";

export default function Offers() {
  const [applied, setApplied] = useState(getAppliedCoupon());

  const refreshCoupon = () => {
    setApplied(getAppliedCoupon());
  };

  return (
    <>
      <Sidebar />
      <div className="standalone-page-shell">
        <Navbar />
        <main className="standalone-page offers-page">
          <div className="standalone-page-heading">
            <div className="standalone-page-icon offers-page-icon">
              <BadgePercent size={25} />
            </div>
            <div>
              <h1>Offers &amp; Coupons</h1>
              <p>Find available offers and apply a coupon to your cart.</p>
            </div>
          </div>

          <SpecialOffers />

          <section className="offers-coupon-section">
            <div className="offers-section-heading">
              <div className="offers-section-icon"><Ticket size={20} /></div>
              <div>
                <h2>Apply a Coupon</h2>
                <p>Choose a code below or enter one from an offer.</p>
              </div>
            </div>
            <CouponBox applied={applied} onCouponChange={refreshCoupon} />
          </section>
        </main>
      </div>
    </>
  );
}
