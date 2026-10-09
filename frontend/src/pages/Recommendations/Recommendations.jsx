import { BrainCircuit } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import AIRecommendations from "../../components/AIRecommendations/AIRecommendations";
import "./Recommendations.css";

export default function Recommendations() {
  return (
    <>
      <Sidebar />
      <div className="standalone-page-shell">
        <Navbar />
        <main className="standalone-page recommendations-page">
          <div className="standalone-page-heading">
            <div className="standalone-page-icon recommendations-page-icon">
              <BrainCircuit size={25} />
            </div>
            <div>
              <h1>AI Recommendations</h1>
              <p>Personalized products selected based on your shopping activity.</p>
            </div>
          </div>
          <AIRecommendations showEmptyState />
        </main>
      </div>
    </>
  );
}
