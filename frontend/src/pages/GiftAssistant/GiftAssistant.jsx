import { Gift, HeartHandshake } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import CustomerGiftAssistant from "../../components/CustomerGiftAssistant/CustomerGiftAssistant";
import "./GiftAssistant.css";

export default function GiftAssistant() {
  return (
    <>
      <Sidebar />
      <div className="standalone-page-shell">
        <Navbar />
        <main className="standalone-page gift-assistant-page">
          <div className="standalone-page-heading">
            <div className="standalone-page-icon gift-assistant-page-icon">
              <Gift size={25} />
            </div>
            <div>
              <h1>Gift Assistant</h1>
              <p>Find thoughtful gifts matched to your recipient, budget, and interests.</p>
            </div>
          </div>
          <div className="gift-assistant-intro">
            <HeartHandshake size={20} />
            <span>Tell us who you are shopping for and we will help you find the right gift.</span>
          </div>
          <CustomerGiftAssistant />
        </main>
      </div>
    </>
  );
}
