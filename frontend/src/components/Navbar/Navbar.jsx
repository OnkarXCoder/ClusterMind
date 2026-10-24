import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";
import { subscribeCart, getCartCount } from "../../services/cart";
import { subscribeWishlist, getWishlistCount } from "../../services/wishlist";
import { getCurrentUser, logout } from "../../services/auth";
import { trackSearch } from "../../services/behavior";
import defaultProfile from "../../assets/users/profile.jpg";
import "./Navbar.css";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(getCartCount());
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount());
  const [query, setQuery] = useState("");

  useEffect(
    () =>
      subscribeCart((cart) =>
        setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0))
      ),
    []
  );

  useEffect(
    () =>
      subscribeWishlist((list) => {
        setWishlistCount(list.length);
      }),
    []
  );

  const user = getCurrentUser();
  const firstName = user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "Account";
  const profileImage = user?.profileImage;

  const doSearch = () => {
    if (query.trim()) {
      trackSearch(query, { source: "customer-navbar" });
      navigate("/products?q=" + encodeURIComponent(query.trim()));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <button
        className="hamburger"
        onClick={onToggleSidebar}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={18} className="search-icon" />

        <input
          type="text"
          placeholder="Search for products, brands and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
        />

        <button onClick={doSearch}>
          Search
        </button>
      </div>

      <div className="nav-right">

        <Link to="/notifications" className="icon" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge">3</span>
        </Link>

        <Link to="/wishlist" className="icon">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
        </Link>

        <Link to="/cart" className="icon">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>

        <Link to="/profile" className="profile" aria-label="Open profile">
          <img src={profileImage || defaultProfile} alt="profile" />
          <span>{firstName}</span>
          <ChevronDown size={18} />
        </Link>

        <button className="nav-logout" type="button" onClick={handleLogout}>
          <LogOut size={17} />
          <span>Logout</span>
        </button>

      </div>

    </nav>
  );
}
