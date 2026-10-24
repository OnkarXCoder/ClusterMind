import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { isAuthenticated } from "./services/auth";

import { ToastProvider } from "./components/marketing/Toast";
import { CartProvider } from "./context/CartContext";
import marketingRoutes from "./routes/marketingRoutes";
import adminRoutes from "./routes/adminRoutes";

import HomePage from "./pages/HomePage";
import CustomerDashboard from "./pages/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/Wishlist/Wishlist";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import Orders from "./pages/Orders/Orders";
import Profile from "./pages/Profile/Profile";
import Feedback from "./pages/Feedback/Feedback";
import Help from "./pages/Help/Help";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ProductImages from "./pages/ProductImages/ProductImages";
import CategoryProducts from "./pages/CategoryProducts/CategoryProducts";
import Notifications from "./pages/Notifications/Notifications";
import Loyalty from "./pages/Loyalty/Loyalty";
import Offers from "./pages/Offers/Offers";
import Recommendations from "./pages/Recommendations/Recommendations";
import GiftAssistant from "./pages/GiftAssistant/GiftAssistant";
import AISalesperson from "./components/AISalesperson/AISalesperson";

function FloatingAssistant() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <AISalesperson />;
}

function App() {
  const loggedIn = isAuthenticated();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <ToastProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={loggedIn ? <CustomerDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/category/:category" element={<CategoryProducts />} />
          <Route path="/product-images" element={<ProductImages />} />
          <Route path="/cart" element={loggedIn ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="/wishlist" element={loggedIn ? <Wishlist /> : <Navigate to="/login" replace />} />
          <Route path="/checkout" element={loggedIn ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="/order-success/:orderId" element={loggedIn ? <OrderSuccess /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={loggedIn ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path="/notifications" element={loggedIn ? <Notifications /> : <Navigate to="/login" replace />} />
          <Route path="/loyalty" element={loggedIn ? <Loyalty /> : <Navigate to="/login" replace />} />
          <Route path="/offers" element={loggedIn ? <Offers /> : <Navigate to="/login" replace />} />
          <Route path="/recommendations" element={loggedIn ? <Recommendations /> : <Navigate to="/login" replace />} />
          <Route path="/gift-assistant" element={loggedIn ? <GiftAssistant /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={loggedIn ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/feedback" element={loggedIn ? <Feedback /> : <Navigate to="/login" replace />} />
          <Route path="/help" element={loggedIn ? <Help /> : <Navigate to="/login" replace />} />
          <Route path="/aiml/*" element={<Navigate to="/marketing" replace />} />
          <Route path="/ai-ml/*" element={<Navigate to="/marketing" replace />} />
          {marketingRoutes()}
          {adminRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingAssistant />
        </ToastProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
