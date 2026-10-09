import { Bell } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import NotificationPanel from "../../components/NotificationPanel/NotificationPanel";
import "./Notifications.css";

export default function Notifications() {
  return (
    <>
      <Sidebar />
      <div className="standalone-page-shell">
        <Navbar />
        <main className="standalone-page">
          <div className="standalone-page-heading">
            <div className="standalone-page-icon notification-page-icon">
              <Bell size={25} />
            </div>
            <div>
              <h1>Notifications</h1>
              <p>Stay updated with your orders and loyalty rewards.</p>
            </div>
          </div>
          <div className="standalone-notification-content">
            <NotificationPanel />
            <div className="standalone-empty-note">
              <Bell size={42} />
              <h2>No notifications yet</h2>
              <p>Order updates and loyalty activity will appear here.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
