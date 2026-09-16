import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import HeroBanner from "../components/HeroBanner/HeroBanner";
import StatsCards from "../components/StatsCards/StatsCards";
import CustomerGiftAssistant from "../components/CustomerGiftAssistant/CustomerGiftAssistant";
import RecommendedProducts from "../components/RecommendedProducts/RecommendedProducts";
import CustomerProfile from "../components/CustomerProfile/CustomerProfile";
import TrendingCategories from "../components/TrendingCategories/TrendingCategories";
import SpecialOffers from "../components/SpecialOffers/SpecialOffers";
import AIRecommendations from "../components/AIRecommendations/AIRecommendations";
import RecentOrders from "../components/RecentOrders/RecentOrders";
import NotificationPanel from "../components/NotificationPanel/NotificationPanel";
import LoyaltyCard from "../components/LoyaltyCard/LoyaltyCard";
import AnalyticsChart from "../components/AnalyticsChart/AnalyticsChart";
import "./Home.css";

export default function Home() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const scrollToId = location.state?.scrollTo;
    if (scrollToId) {
      const id = setTimeout(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(id);
    }
  }, [location.state]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="home-content">
          <HeroBanner />
          <StatsCards />
          <CustomerGiftAssistant />

          <div className="recs-row">
            <RecommendedProducts />
            <CustomerProfile />
          </div>

          <TrendingCategories />
          <SpecialOffers />
          <AIRecommendations />
          <RecentOrders />

          <div className="bottom-grid">
            <div className="bottom-left">
              <NotificationPanel />
              <LoyaltyCard />
            </div>

            <AnalyticsChart />
          </div>
        </div>
      </div>
    </>
  );
}
