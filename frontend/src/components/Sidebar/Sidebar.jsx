import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../services/auth";
import {
  House,
  Grid2X2,
  Search,
  Heart,
  ShoppingCart,
  Package,
  Sparkles,
  BadgePercent,
  Gift,
  Bell,
  User,
  MessageSquare,
  CircleHelp,
  X,
  LogOut,
  ImagePlus,
} from "lucide-react";
import "./Sidebar.css";

const menu = [
  { name: "Home", icon: <House size={18} />, path: "/" },
  { name: "Categories", icon: <Grid2X2 size={18} />, path: "/products" },
  { name: "Search", icon: <Search size={18} />, path: "/products" },
  { name: "Wishlist", icon: <Heart size={18} />, path: "/wishlist" },
  { name: "Cart", icon: <ShoppingCart size={18} />, path: "/cart" },
  { name: "Orders", icon: <Package size={18} />, path: "/orders" },
  { name: "Gift Assistant", icon: <Gift size={18} />, path: "/gift-assistant" },
  { name: "AI Recommendations", icon: <Sparkles size={18} />, path: "/recommendations" },
  { name: "Offers & Coupons", icon: <BadgePercent size={18} />, path: "/offers" },
  { name: "Loyalty Points", icon: <Gift size={18} />, path: "/loyalty" },
  { name: "Notifications", icon: <Bell size={18} />, path: "/notifications" },
  { name: "Profile", icon: <User size={18} />, path: "/profile" },
  { name: "Feedback", icon: <MessageSquare size={18} />, path: "/feedback" },
  { name: "Help & Support", icon: <CircleHelp size={18} />, path: "/help" },
  { name: "Product Images", icon: <ImagePlus size={18} />, path: "/product-images" },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClick = (item) => {
    if (item.path) {
      if (item.path.includes("#")) {
        const [path, id] = item.path.split("#");
        if (location.pathname !== path) {
          navigate(path, { state: { scrollTo: id } });
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(item.path);
      }
    }
    onClose?.();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${open ? "open" : ""}`}>

        <div className="logo">
          <div className="logo-icon">C</div>
          <div>
            <h2>ClusterMind</h2>
            <span>AI Powered Shopping</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="dashboard-tag">
          <Sparkles size={14} />
          Customer Dashboard
        </div>

        <ul className="menu">
          {menu.map((item, index) => {
            const isActive = item.path
              ? location.pathname === item.path ||
                (item.path === "/" && location.pathname === "/")
              : false;
            return (
              <li
                key={index}
                className={isActive ? "active" : ""}
                onClick={() => handleClick(item)}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            );
          })}
        </ul>

        <button className="logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>

      </aside>
    </>
  );
}
