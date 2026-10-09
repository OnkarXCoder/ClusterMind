/* Auto-generated single-file frontend. Generated from src/ - all components, styles and assets inlined. */

// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// src/services/auth.js
var TOKEN_KEY = "clustermind_token";
var USER_KEY = "clustermind_user";
var USERS_KEY = "clustermind_users";
var sleep = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));
var isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);
var getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};
var logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
var DEFAULT_USERS = [
  {
    id: "user_demo",
    fullName: "Rahul Sharma",
    email: "demo@clustermind.com",
    phone: "9876543210",
    password: "demo123",
    profileImage: "",
    address: [],
    role: "customer",
    loyaltyPoints: 250,
    createdAt: (/* @__PURE__ */ new Date("2026-01-01")).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date("2026-01-01")).toISOString()
  }
];
var getUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    for (const demo of DEFAULT_USERS) {
      if (!users.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
        users.push(demo);
      }
    }
    return users;
  } catch {
    return DEFAULT_USERS;
  }
};
var saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
var fakeLogin = ({ email, password }) => new Promise((resolve, reject) => {
  sleep().then(() => {
    const user = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      reject({ email: "Invalid email or password" });
      return;
    }
    const token = "fake-jwt-" + Date.now();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    resolve(user);
  });
});
var fakeRegister = (data) => new Promise((resolve, reject) => {
  sleep().then(() => {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      reject({ email: "Email already registered" });
      return;
    }
    const user = {
      id: "user_" + Date.now(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      profileImage: "",
      address: [],
      role: "customer",
      loyaltyPoints: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    users.push(user);
    saveUsers(users);
    resolve(user);
  });
});
var fakeSendOtp = (email) => new Promise((resolve, reject) => {
  sleep().then(() => {
    if (!getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      reject({ email: "No account found with this email" });
      return;
    }
    resolve("123456");
  });
});
var fakeVerifyOtp = (otp) => new Promise((resolve, reject) => {
  sleep().then(() => {
    if (otp === "123456") resolve(true);
    else reject({ otp: "Invalid OTP" });
  });
});
var fakeResetPassword = (email, password) => new Promise((resolve) => {
  sleep().then(() => {
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.password = password;
      user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      saveUsers(users);
    }
    resolve(true);
  });
});

// src/pages/Home.jsx
import { useEffect as useEffect2, useState as useState4 } from "react";
import { useLocation as useLocation2 } from "react-router-dom";

// src/components/Sidebar/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";
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
  ImagePlus
} from "lucide-react";

// css-inject:virtual:css-inject
var cssOrder = [];
function collectCSS(css, rel) {
  cssOrder.push({ css, rel, i: cssOrder.length });
}

// css:C:\CustomerDashbord\src\components\Sidebar\Sidebar.css
collectCSS(`.sidebar{
width:260px;
height:100vh;
background:var(--sidebar);
display:flex;
flex-direction:column;
padding:24px 18px;
position:fixed;
left:0;
top:0;
z-index:60;
transition:transform .3s ease;
}

.logo{
display:flex;
align-items:center;
gap:12px;
margin-bottom:24px;
}

.logo-icon{
width:44px;
height:44px;
border-radius:14px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
font-family:Poppins;
font-size:22px;
font-weight:700;
display:flex;
align-items:center;
justify-content:center;
box-shadow:0 8px 20px rgba(79,70,229,.4);
}

.logo h2{
font-size:20px;
font-family:Poppins;
color:#fff;
letter-spacing:.3px;
}

.logo span{
font-size:11px;
color:#94A3B8;
}

.close-btn{
display:none;
margin-left:auto;
background:transparent;
border:none;
color:#94A3B8;
cursor:pointer;
}

.dashboard-tag{
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:white;
padding:10px 12px;
border-radius:10px;
font-size:12px;
font-weight:600;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
margin-bottom:22px;
letter-spacing:.4px;
}

.menu{
list-style:none;
display:flex;
flex-direction:column;
gap:4px;
flex:1;
overflow-y:auto;
}

.menu li{
display:flex;
align-items:center;
gap:12px;
padding:11px 14px;
border-radius:10px;
cursor:pointer;
transition:.25s;
font-size:14.5px;
color:#C7D2E0;
}

.menu li:hover{
background:var(--sidebar-hover);
color:#fff;
}

.menu li.active{
background:var(--sidebar-active);
color:white;
box-shadow:0 6px 16px rgba(79,70,229,.35);
}

.menu li.active svg{
color:#fff;
}

.menu li svg{
color:#7C8BA3;
}

.logout{
margin-top:14px;
display:flex;
align-items:center;
justify-content:center;
gap:10px;
padding:12px;
border:none;
background:#EF4444;
color:white;
border-radius:12px;
cursor:pointer;
font-size:15px;
font-weight:600;
transition:.25s;
}

.logout:hover{
background:#DC2626;
}

.sidebar-overlay{
display:none;
}

@media(max-width:1024px){
.sidebar{
transform:translateX(-100%);
box-shadow:0 0 60px rgba(15,23,42,.4);
}

.sidebar.open{
transform:translateX(0);
}

.close-btn{
display:flex;
align-items:center;
}

.sidebar-overlay{
display:block;
position:fixed;
inset:0;
background:rgba(15,23,42,.55);
z-index:55;
opacity:0;
pointer-events:none;
transition:.3s;
}

.sidebar-overlay.show{
opacity:1;
pointer-events:auto;
}
}
`, "components/Sidebar/Sidebar.css");

// src/components/Sidebar/Sidebar.jsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var menu = [
  { name: "Home", icon: /* @__PURE__ */ jsx(House, { size: 18 }), path: "/" },
  { name: "Categories", icon: /* @__PURE__ */ jsx(Grid2X2, { size: 18 }), path: "/products" },
  { name: "Search", icon: /* @__PURE__ */ jsx(Search, { size: 18 }), path: "/products" },
  { name: "Wishlist", icon: /* @__PURE__ */ jsx(Heart, { size: 18 }), path: "/wishlist" },
  { name: "Cart", icon: /* @__PURE__ */ jsx(ShoppingCart, { size: 18 }), path: "/cart" },
  { name: "Orders", icon: /* @__PURE__ */ jsx(Package, { size: 18 }), path: "/orders" },
  { name: "AI Recommendations", icon: /* @__PURE__ */ jsx(Sparkles, { size: 18 }), path: "/#ai-recommendations" },
  { name: "Offers & Coupons", icon: /* @__PURE__ */ jsx(BadgePercent, { size: 18 }), path: "/#offers" },
  { name: "Loyalty Points", icon: /* @__PURE__ */ jsx(Gift, { size: 18 }), path: "/#loyalty" },
  { name: "Notifications", icon: /* @__PURE__ */ jsx(Bell, { size: 18 }), path: "/#notifications" },
  { name: "Profile", icon: /* @__PURE__ */ jsx(User, { size: 18 }), path: "/profile" },
  { name: "Feedback", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 18 }), path: "/feedback" },
  { name: "Help & Support", icon: /* @__PURE__ */ jsx(CircleHelp, { size: 18 }), path: "/help" },
  { name: "Product Images", icon: /* @__PURE__ */ jsx(ImagePlus, { size: 18 }), path: "/product-images" }
];
function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleClick = (item) => {
    if (item.path) {
      if (item.path.startsWith("/#")) {
        const id = item.path.slice(2);
        if (location.pathname !== "/") {
          navigate("/", { state: { scrollTo: id } });
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(item.path);
      }
    }
    onClose?.();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `sidebar-overlay ${open ? "show" : ""}`,
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: `sidebar ${open ? "open" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "logo", children: [
        /* @__PURE__ */ jsx("div", { className: "logo-icon", children: "C" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { children: "ClusterMind" }),
          /* @__PURE__ */ jsx("span", { children: "AI Powered Shopping" })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, "aria-label": "Close menu", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dashboard-tag", children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
        "Customer Dashboard"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "menu", children: menu.map((item, index) => {
        const isActive = item.path ? location.pathname === item.path || item.path === "/" && location.pathname === "/" : false;
        return /* @__PURE__ */ jsxs(
          "li",
          {
            className: isActive ? "active" : "",
            onClick: () => handleClick(item),
            children: [
              item.icon,
              /* @__PURE__ */ jsx("span", { children: item.name })
            ]
          },
          index
        );
      }) }),
      /* @__PURE__ */ jsxs("button", { className: "logout", onClick: handleLogout, children: [
        /* @__PURE__ */ jsx(LogOut, { size: 18 }),
        "Logout"
      ] })
    ] })
  ] });
}

// src/components/Navbar/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate as useNavigate2 } from "react-router-dom";
import {
  Search as Search2,
  Bell as Bell2,
  Heart as Heart2,
  ShoppingCart as ShoppingCart2,
  ChevronDown,
  Menu
} from "lucide-react";

// src/services/cart.js
var CART_KEY = "clustermind_cart";
var COUPON_KEY = "clustermind_coupon";
var listeners = /* @__PURE__ */ new Set();
var read = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};
var write = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  listeners.forEach((fn) => fn(cart));
};
var subscribeCart = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
var getCartItems = () => read();
var getCartCount = () => read().reduce((sum, i) => sum + i.quantity, 0);
var addToCart = (product, quantity = 1) => {
  const cart = read();
  const existing = cart.find((i) => i.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId: product.id, quantity, addedAt: Date.now() });
  }
  write(cart);
  return cart;
};
var updateQuantity = (productId, quantity) => {
  const cart = read().map(
    (i) => i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  write(cart);
  return cart;
};
var removeFromCart = (productId) => {
  const cart = read().filter((i) => i.productId !== productId);
  write(cart);
  return cart;
};
var clearCart = () => {
  write([]);
  return [];
};
var COUPON_LIST = ["AI20OFF", "WELCOME50", "FIRSTORDER", "FESTIVE100"];
var COUPONS = {
  AI20OFF: { discount: 5e3 },
  WELCOME50: { discount: 500 },
  FIRSTORDER: { discount: 1e3 },
  FESTIVE100: { discount: 1e4 }
};
var applyCoupon = (code) => {
  const coupon = COUPONS[(code || "").trim().toUpperCase()];
  if (!coupon) {
    return { ok: false, message: "Invalid coupon code" };
  }
  localStorage.setItem(COUPON_KEY, code.trim().toUpperCase());
  return { ok: true, discount: coupon.discount };
};
var getAppliedCoupon = () => {
  const code = localStorage.getItem(COUPON_KEY);
  const coupon = COUPONS[code];
  return coupon ? { code, discount: coupon.discount } : null;
};
var clearCoupon = () => {
  localStorage.removeItem(COUPON_KEY);
};

// src/services/wishlist.js
var WISHLIST_KEY = "clustermind_wishlist";
var listeners2 = /* @__PURE__ */ new Set();
var read2 = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};
var write2 = (list) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  listeners2.forEach((fn) => fn(list));
};
var subscribeWishlist = (fn) => {
  listeners2.add(fn);
  return () => listeners2.delete(fn);
};
var getWishlist = () => read2();
var getWishlistCount = () => read2().length;
var isInWishlist = (productId) => read2().some((p) => p.productId === productId);
var addToWishlist = (product) => {
  const list = read2();
  if (!list.some((p) => p.productId === product.id)) {
    list.push({ productId: product.id, addedAt: Date.now() });
  }
  write2(list);
  return list;
};
var removeFromWishlist = (productId) => {
  const list = read2().filter((p) => p.productId !== productId);
  write2(list);
  return list;
};

// src/assets/users/profile.jpg
var profile_default = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCADIAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKACiiigAooqS3t5by4iggieeeVgkcUalmdicAADkkntTSbdkBHUlvby3lxFBBE888rBI4o1LM7E4AAHJJPavZvh5+zbf65GLzxLJNo9qcFLSML9okUrnJJyI8EjggtwwIXgn6D8M+D9F8HWjW2jadDYRt98xgl35JG5zlmxuOMk4BwOK/RMo4Jx+YRVXEv2UH3V5P/t3S3za72Z6FLBTqay0R8v+EP2e/FPiZEnuok0O0LqC1+GWYruIYrEBnIx0fbnIwcHI9O0L9lvQrLY+q6peanIkofZCFt4nQY+Rh8zc85IYcHjBGa9qor9RwPBmUYOK56ftJLrJ/orL8GenDB0obq5xWl/BfwTo9w00Hh62kdlKEXTPcLjIPCyMwB464z19TWxbeA/DVncRTweHdKgniYPHLHZRKyMDkEELkEHvW7RX1VPLsFRVqVGMV5RS/Q6VTgtkgrG1DwZ4f1a7kur7QtNvLqTG+e4s43dsAAZYjJ4AH4Vs0V11KVOsuWpFNeauW0nucdq3we8F615X2jw7Zx+Xnb9kU22c4znyyu7p3zjnHU1x2v8A7MPhvUfPk0y7vNImfb5abhPDHjGflb5znB6vwT6cV7FRXj4nIsrxaarYeLv1SSfbdWf4mMqFKe8UfK/iT9mbxPpcjNpUttrcG4KoVxBLjbksyudoAPHDk8g4648q1DTrvSbuS1vrWazuo8b4LiMxuuQCMqeRkEH8a+/az9d8Pab4n097HVbKG+tWyfLmXO04I3KeqtgnDDBGeDXwuY+H+ErJywFR032fvR9O69fe9DiqYCD1g7HwVRX0F46/Zh/1134Vu/7z/wBnXjf7x2xyf98qA/uS9eC6hp13pN3Ja31rNZ3UeN8FxGUdcgEZU8jgg/jX5FmmS47J58mLhZPZrVP0f6b+R5NWjOk7TRXooorwzEKKKKACiiigAooooAKKK6j4efDzUviNrYsbEeVbx4a6vHXKQIe59WODhe+OwBI6MPh6uLqxoUI80paJL+v+GKjFzfLHcr+DPAWtePtQe10e187y9pmndgkUKk4BZj+JwMsQDgHBr6s+Hnwf0L4exCWCP7fqhwWv7pFLqdu0iPj5FOW4GT82CTgV0HhLwlpvgnRIdL0uHyrePlnbl5XPV3Pdjj9ABgAAbNf0Vw9wnhsojGvXXPW79I/4f89+1j6DD4WNL3pasKKKK++O4KKKKACiiigAooooAKKKKACiiigArnvGfgPRfHunraava+d5e4wzoxWSFmGCVYfgcHKkgZBwK6GisK1CliabpVoqUXunqhNKSs0fFXxD+FutfDq8P22Lz9NeUx2+oR42S8ZGRklGx/Cf7rYLAZrj6++dY0ay8QaZcadqNsl3ZXC7JIpOhH8wQcEEcggEcivlT4r/AARvfh5GNRs5n1LRGcq0pTElsS3yrJjggjA3jAJ4IXK5/AeJeEamWXxWCTlR3a6x/wA157rr3fg4nCOn70NvyPMaKKK/NDzgooooAKKKkt7eW8uIoIInnnlYJHFGpZnYnAAA5JJ7U0m3ZAbngLwZd+PvE9ro9q/k+Zl5bgoWWGMDLMQPwAzgFioyM5r7M8JeEtN8E6JDpelw+Vbx8s7cvK56u57scfoAAAABz/wf+HifD3wnHBKM6nd7bi8ZlXcrlR+6BXOVTkDk8liMbsV3Nf0jwnw9HKMMq9eP76a1/ur+X/Pz06H0WFw6pR5pbsKKKK++O4KKKKACiiigAooooAKKKKACiiigAooooAKKKKACqesaPZeINMudO1G3S7srhNkkUnQj+YIOCCOQQCORVyipnCNSLhNXT0afUTV9GfGfxZ+GFx8NNbjiEv2nS7vc9nOxG8hcbkcD+Jdy8gYOQRjkDhq+6PGvhGy8ceHLvSb1EIlQmGZ13GCXB2yLyDkE9MjIyDwTXxP4h0K78Ma3e6VfJsurSVonwCA2OjLkAlSMEHHIINfzdxZw/wD2NiVVoL9zPb+6+sf1Xlp0ufPYqh7GV47Mz6KKK+COEK9u/Zo8Axaxql14jvoEmtrBhFaLIAR9o4Yv16oNuMgjLgg5WvFba2lvLiKCCJ555WCRxRqWZ2JwAAOSSe1fdHg7wzb+DfDGnaNbNvjtIgpkwR5jk5d8EnG5ixxnjOBxX6NwRlKx+PeJqq8KWvrJ/D92r9Uu56GCpc8+Z7I2aKKK/oo+gCiiigAooooAKKKVEaR1RFLOxwFUZJPpQAlFfSvwl/ZAu9bgt9V8ZTS6baOA6aXDxcMO3mMfuf7oBPP8Jr6X8LfC3wl4KQDRdAsbJwMecIt8p+sjZY/nX5PnXiPlWWVHQwydaa35XaPpza3+Sa8y1Fs/NpLG5kh85beVosE+YEJXA681BX6q1heJPAnh3xhCYta0Wy1IH+KeFS6+4bqD7g18rR8Wqbnatg2o91O7+5xV/vQ+Q/MeivrL4p/scQSxz6h4InMMgBb+yLpyyt7RyHkH2bP+8K+VdR0660i+nsr23ltLuByksEylXRh1BB6V+u5JxFl3EFJ1MDO7W8XpJeq/VXXmQ00V6KKK+lEFFFFABRRRQAV4T+0z4Bin0uHxVZwIlzbusV8ygAyRthUdueSpwvAJIcZOFFe7VX1HT7fVtPurG6j821uYmhljyRuRgQwyORwT0rxs4y2nm2CqYSfVaPtJbP79/K66mNamqsHBnwFRWx4w8M3Hg7xNqOjXLb5LSUoJMAeYhGUfAJxuUqcZ4zg8iiv5Nq0p0KkqVRWlFtNdmtGfLNOLszuf2dPDH9vfEKK8li32ulxNcsXh3oZD8sak9FbJLg9f3fHTI+tK8V/Zb0L7H4U1TVXSZJL66ES7xhHjjXhl45+Z5ATkj5ccEGvaq/pLgzBLCZPTlb3ql5P56L8Ej6LBw5KS89Qooor7k7QooooAKKKKACvrz9lL4GxadYW3jbXIBJe3C79Nt5F4hj7THP8AE38PoDnqePnP4ReDR4/+I+haJIpa2nnDXG3j9ygLvz2yqkfUiv0iggjtoY4YUWKKNQiIgwFUDAAHYV+HeJnENTA0IZVhpWlUV5P+7sl/28738lbqXFdR9FFFfzGahRRRQAV4v+0b8DIPiXoT6tpcKR+JrGMtGVGDdxgZMTep/un146HI9oor1MrzPE5Ri4YzCStOL+TXVPun1E1c/KsgqSCMEdQaSvXf2ovA0Xgr4q3j2sQhsdUjF/Eqj5VZiRIB/wADBOOwYV5FX9z5bj6eaYKljaXw1Ip+l+nyehi9Aooor0hBRRRQAUUUUAfNn7Unhj7Jrml69DHiO7iNtOyQ4AkTlWZx1ZlbAB5xF3A4K9S+PPh/+3/hlqmyDz7iy23sXz7dmw/O3UA4jMnBz7DOKK/m3jbA/U82lUivdqJS+ez/ABV/mfO42HJVb7mh8HtJ/sX4ZeHbfzfO32oud23bjzSZduMnpvxnvjPHSuxrK8KaVLofhfR9NnZHns7OG3kaMkqWRApIyAcZHpWrX9CYGj9XwlKja3LGKt2skj34LlikFFFFdxYUUUUAFFFFAH0H+xVp4uPiVqt2ygi30twpPZmljGfyDfnX2zZW/wBru4Yc7RI4Un0r4i/Yu1NbT4oahaO4UXemSBFP8TrJG2P++dx/CvtiORopFdDtdSGBHY1/I/iTzLiGTntywt6f8Pc0V3F23PQI9Hso4fKFtGVxjlQSfxri9asV0/UZYU/1fDLnsD2rZTxniH57bMuP4Wwprnry7kvrl55Tl3OTjoPavgsbWw9SnFUt/Q83B0q9ObdTb1Iansrf7Xdww52iRwpPpUFOjkaKRXQ7XUhgR2NeRGyavserK7TtuegR6PZRw+ULaMrjHKgk/jXF61Yrp+oywp/q+GXPYHtWynjPEPz22ZcfwthTXPXl3JfXLzynLucnHQe1evja2HqU4qlv6HlYOlXpzbqbep8r/tx6eG0/wlfAAMktzCT3O4Rkf+gn86+TK+r/ANuPU1Fv4S09XBctczunoAI1U/jlvyNfKFf1f4eqa4bw3N/ft6c8j0JbhRRRX6MSFFFFABRRRQBT1rS4tc0e/wBNnZ1gvIJLeRoyAwV1KkgkEZwfQ0VcoryMblOBzGSni6Sm1ormU6UKms1cKKp6NqsWuaPY6lbq6QXkEdxGsgAYK6hgCASM4PqauV6kJRnFTi7pmqd9UFFFFWAUUUUAFFFFAHTfDPxg3gLx5omvAM0dncBpVTq0R+WQD3KlhX6UWF9b6pY295aSrPa3EazRSp0dGGVI+oIr8sa+of2V/j1DpscPgvxFcpDbZxpt5M2AhJ/1LH0JOVJ+npX4t4kcN1cyw8Mywsb1KStJLdw3uv8AC7v0b7FxdtD60ooor+WzUKKKKACiivn39pr4+Q+D9Mn8L6DcrJr10hjuZozn7HGRyM9pGHQdQOeDivZyfKcVneMhgsJG8pbvol1b8l/wFqxN2Pnv9o7x9D8QPilqFzaS+dp1iosbZwch1Qncw9i5cg+mK8woor+5MvwVLLcJSwdH4YJJfLr6vdmL1CiiivQEFFFFABRRRQAUUUUAcl8JtUh1j4a+HJ4FdUSzS3IkAB3RDy2PBPG5Dj2x06V1teO/sw6//aHgm70ySfzJtOujsi2Y8uGQbl5xzlxKepP4Yr2KvDyLErGZZh6ye8Vf1Ss/xTMKEuenF+QUUUV7huFFFFABRRRQAUUhYKMk4HvUL3ar90bjQYVa9Oir1JWPffhL+1brnga3t9L1yFte0aIBEcti5hX0Vjw4HYN7DIFfS3hb9or4f+LEHk+IbfT5iOYNTP2Zh7ZfCk/Qmvzma6c9ML9KYZnPVj+dfmec+H2T5vUdeKdKo93C1m+7i9Put5nnSzelHSKbP1MTxp4ekh85de0xosE+YLyMrgdec1zfiT47+AvC0Je78T2EzjpDYyfaZCfTbHnH44Ffmtvb+8fzpRK46Mfzr5Wj4T4KM71sVKUeyST+/X8iP7Zh/Iz6j+KP7YmoazHPp3g62fSrVwUbUbjBuGH+woyE+uSfoa+bpZXnleWV2kkdizO5yWJ6knuaoLdSL3z9RUqXgP3hj3FfrGUZHl+R0fY4Cmop7vdv1e7/ACXRHRTzKhVdm7epYopFYOMggilr3j0k1JXQUUUUDCiiigAooooAr6jqFvpOn3N9dyeVa20TTSybS21FBLHAyTgA9KK474267/YHwy1uRXhE1zELNEmON/mEIwUZGWCF2GP7ucEA0V+Y8U8U4nJMVDD4WMXeN3zJvq0tpLsebicVKjJRieIfszeJG0rx1LpTM/kapAyhFVSPNjBdWYnkAL5g47sMjuPqivgbRdVl0LWLHUoFR57OeO4jWQEqWRgwBwQcZHqK+6PD2u2nifQ7LVbJ99rdxCVMkErnqrYJAYHIIzwQRXP4f5iquEqYGT96Duv8L/yd/vJwFS8HB9DRooor9WPUCiiigAqKa4EXA5b0pLibyxgfeP6VT60HiY7H+xfsqXxd+wryNIcsc02iig+XlJzfNJ3YUUUUEhRRRQAUUUUAOVyhyDg1ahuQ/DcH19ap0UHZh8VUwz916djToqvbT7vkY89jVig+xoVo4iCnAKKKKDoCiio7m5is7eWeeVIIIlLySyMFVFAySSeAAO9JtJXYHgH7U/in/kE+G0j/AOohLIy/78aBTn/rpnI/u4PWivHfiB4p/wCE08ZarrIj8qO5l/dIVwRGoCJuGT821Vzg4znHFFfyhn+Yf2pmVbEp+63aP+FaL79/mfL16ntajkc/X0F+zD46x9r8K3k3rdWO9v8Av5GMt9HCqP8AnoTXz7VzR9YvfD+p2+o6dcvaXtu2+OaM8g/yIIyCDwQSDwazyTM55RjqeLjqlo13i91+q80hUajpTUj75ornvAXjO18e+GLXWLVfJ83KS25cO0MgOGU4/AjOCVKnAzXQ1/VtCtTxNKNak7xkk0+6Z9RFqSutgpCdoJPQUtRXJxC35VuZ1Z+zhKfZFN3LuWPem0UUHwEpOTcnuwooooEFFFFABRRRQAUUUUAFFFFACgkEEdRWhG/mIG9azquWZzGR6Gg9vKqjjVdPo1+RPRRRQfVBXkP7RvjyHQPCraDCz/2jqq4JilCmGEMNxYDkh8FAOhG/njB9S1jWLLw/plxqOo3KWllbrvkmk6KP5kk4AA5JIA5NfEXjXxfe+OPEd3q17I5MrEQwu+4QRZJWNeAMAH0GTknkmvzvjTOll2CeFpP95VTXpHq/nsvm1scGMrezhyrdmHRRRX85nzwUUUUAdr8KPiRN8NvEZu2je5065QQ3durEErnIdRnBdecZ7Fhkbsj7E0fWLLxBpltqOnXCXdlcJvjlj6EfzBByCDyCCDyK+Bq9S+CXxf8A+Ff3b6ZqS7tBu5fMeREy9vIQF8wY5ZcBQV5PGV5yG/TOEOJv7NqLA4uX7mT0f8rf6Pr2evc9LCYn2b5J7H1nUVyMwn2pmn6jaataR3VjdQ3lrJnZPbyCRGwSDhgcHBBH4VOyhlIPQ1/QUZKSUou6Z7FWHtacoLqjNopWUqxB6ikqj4Fpp2YUUUUCCiiigAooooAKKKKACiiigAq3Zj5CfeqlaESeXGo796D2cqpuVZz6JD6KK+bPjh8cDrBuPDvh24/4l/Md5fRN/wAfHYxoR/yz7Fv4ug+X73hZznOGyXDOvXev2Y9ZP/Lu+nrZP6WtWjRjzSOe+Nnxf/4WDdppmnLs0G0l8xHdMPcSAFfMOeVXBIC9ecnnAXy6iiv5cx+Pr5liJYrEu8pfcuyXkv61PmqlSVSTlLcKKKK88zCiiigAooooA7n4YfFnUvhpeTCKP7fpc+TLYPJsBfGA6tg7W6A8HI4PRSPq/wAI+NdI8caZHe6TdpOCitJAWHnQE5G2Rc5U5VvY4yCRzXwvWhoXiDUvDOoJfaVezWN0uP3kLY3DIO1h0ZcgZU5BxyK+94f4sxOTWoVlz0e3WP8Ahf6PTtbU7sPipUfdeqPu25h3Deo5HWqleP8Agn9p6wvttv4ntP7Nm5/0y0VnhP3jynLrwFHG7JJPyivY7W4tNYtEvNPuoby2kztmt5A8b4JBww46gj8K/e8uzfA5tDnwlRS7rZr1T1+e3ZmeLw0cReth9X1QyilIKnBGDSV7B4DTWjCiiigAooooAKKKKACilAzUjiK0t5Lm7kSC3iUyO8jBVRQMksTwABzSbSV2dFGhUry5YIktYckOenam6xrFl4f0u51HUbhLSyt03yzP0UfzJJwABySQBya8t8d/tG6HoFu0GgFNc1Hc8ZI3JBCQMBi2P3gzjAQ4IB+YcZ+dPF/jXV/HGqSXurXbzEuzRwBiIYAcfLGuflGFX3OMkk81+eZ1xpgsuTp4VqrU8n7q9X19F6No+khUpYKn7Onqztfi/wDGy4+IO3TtMSax0FdrPHLgS3D9cvgkBQeignkbjzgL5dRRX4Hj8fiMyryxOKlzSf4Lsl0X9bnmVKkqkuaT1CiiivPMwooooAKKKKACiiigAooooAK2PDPjDWvB121zo2ozWEjffVCCknBA3Icq2NxxkHGcjmiitaVWpQmqlKTjJbNOzXo0NNxd0eueE/2n7uJ0g8Tacl5AEC/arAbJshTlmQnaxY7ehQDng8CvRtD+NvgzX/IRdW/s64l3fuNRjMWzGfvScxjIGR83cDrxRRX6BlXGWbUqlOhUkqibS95XerXVNP77/kaNqs0qiv59f69Tr9N1Sy1q3a4068t9QgVzGZbSVZUDAAlcqSM4IOPcVZoor9/wdaWIw8Ks92jgxFGNJ2iFFFFdhyEN9e2+l2kl1e3EVnax43z3DiNFycDLHAGSQPxrlNa+MXg3Qd6za5DdSiIyrFYA3G/rhQy5QMSOjMOozgHNFFfA8T59ismj/s8Yu6W6b3bXRrsetHD04wU2rnnviX9qJI/LTw1pHPBefVR9cqERv907t3qNvevIPFPxA8Q+NfLGs6rNeRx4Kw4EcQIzhtigLu+YjdjODjOKKK/Dcwz/ADLNLrE1nyv7K0j9y3+dzR1JNcq0XZaI5+iiivnzIKKKKACiiigAooooA//Z";

// css:C:\CustomerDashbord\src\components\Navbar\Navbar.css
collectCSS(`.navbar{
height:80px;
background:#fff;
display:flex;
justify-content:space-between;
align-items:center;
padding:0 30px;
border-bottom:1px solid var(--border);
position:sticky;
top:0;
z-index:50;
}

.hamburger{
display:none;
background:none;
border:none;
color:var(--text);
padding:6px;
cursor:pointer;
}

.search-box{
width:600px;
display:flex;
align-items:center;
background:#F8FAFC;
border:1px solid var(--border);
border-radius:12px;
overflow:hidden;
}

.search-icon{
margin-left:15px;
color:#6B7280;
}

.search-box input{
flex:1;
padding:14px;
border:none;
outline:none;
background:none;
font-size:15px;
}

.search-box button{
background:#4F46E5;
color:#fff;
border:none;
padding:14px 25px;
cursor:pointer;
font-weight:600;
transition:.25s;
}

.search-box button:hover{
background:#4338CA;
}

.nav-right{
display:flex;
align-items:center;
gap:25px;
}

.icon{
position:relative;
cursor:pointer;
display:flex;
align-items:center;
color:#4B5563;
}

.icon:hover{
color:#4F46E5;
}

.badge{
position:absolute;
top:-8px;
right:-10px;
width:18px;
height:18px;
background:#EF4444;
color:#fff;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
}

.profile{
display:flex;
align-items:center;
gap:10px;
cursor:pointer;
}

.profile span{
font-weight:500;
font-size:15px;
}

.profile img{
width:40px;
height:40px;
border-radius:50%;
object-fit:cover;
border:2px solid #E0E7FF;
}

@media(max-width:1200px){
.search-box{
width:420px;
}
}

@media(max-width:900px){
.navbar{
padding:0 16px;
}

.hamburger{
display:flex;
align-items:center;
}

.search-box{
width:100%;
max-width:340px;
}

.profile span{
display:none;
}

.nav-right{
gap:16px;
}
}

@media(max-width:600px){
.search-box{
max-width:200px;
}

.search-box button{
padding:14px 14px;
font-size:13px;
}

.nav-right{
gap:14px;
}

.profile img{
width:34px;
height:34px;
}
}
`, "components/Navbar/Navbar.css");

// src/components/Navbar/Navbar.jsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate2();
  const [cartCount, setCartCount] = useState(getCartCount());
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount());
  const [query, setQuery] = useState("");
  useEffect(
    () => subscribeCart(
      (cart) => setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0))
    ),
    []
  );
  useEffect(
    () => subscribeWishlist((list) => {
      setWishlistCount(list.length);
    }),
    []
  );
  const user = getCurrentUser();
  const firstName = user?.fullName?.split(" ")[0] || "Rahul";
  const profileImage = user?.profileImage;
  const doSearch = () => {
    if (query.trim()) {
      navigate("/products?q=" + encodeURIComponent(query.trim()));
    }
  };
  return /* @__PURE__ */ jsxs2("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsx2(
      "button",
      {
        className: "hamburger",
        onClick: onToggleSidebar,
        "aria-label": "Open menu",
        children: /* @__PURE__ */ jsx2(Menu, { size: 22 })
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: "search-box", children: [
      /* @__PURE__ */ jsx2(Search2, { size: 18, className: "search-icon" }),
      /* @__PURE__ */ jsx2(
        "input",
        {
          type: "text",
          placeholder: "Search for products, brands and more...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") doSearch();
          }
        }
      ),
      /* @__PURE__ */ jsx2("button", { onClick: doSearch, children: "Search" })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "nav-right", children: [
      /* @__PURE__ */ jsxs2("div", { className: "icon", children: [
        /* @__PURE__ */ jsx2(Bell2, { size: 20 }),
        /* @__PURE__ */ jsx2("span", { className: "badge", children: "3" })
      ] }),
      /* @__PURE__ */ jsxs2(Link, { to: "/wishlist", className: "icon", children: [
        /* @__PURE__ */ jsx2(Heart2, { size: 20 }),
        wishlistCount > 0 && /* @__PURE__ */ jsx2("span", { className: "badge", children: wishlistCount })
      ] }),
      /* @__PURE__ */ jsxs2(Link, { to: "/cart", className: "icon", children: [
        /* @__PURE__ */ jsx2(ShoppingCart2, { size: 20 }),
        cartCount > 0 && /* @__PURE__ */ jsx2("span", { className: "badge", children: cartCount })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "profile", children: [
        /* @__PURE__ */ jsx2("img", { src: profileImage || profile_default, alt: "profile" }),
        /* @__PURE__ */ jsx2("span", { children: firstName }),
        /* @__PURE__ */ jsx2(ChevronDown, { size: 18 })
      ] })
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\components\HeroBanner\HeroBanner.css
collectCSS(`.hero-banner{
display:flex;
justify-content:space-between;
align-items:center;
padding:48px 50px;
border-radius:20px;
background:#0F172A;
color:white;
margin-top:24px;
overflow:hidden;
position:relative;
}

.hero-banner::before{
content:"";
position:absolute;
inset:0;
background:linear-gradient(120deg,rgba(79,70,229,.45),rgba(124,58,237,.35) 55%,transparent 80%);
pointer-events:none;
}

.hero-glow{
position:absolute;
border-radius:50%;
filter:blur(70px);
opacity:.55;
pointer-events:none;
}

.hero-glow.one{
width:320px;
height:320px;
background:#4F46E5;
top:-120px;
left:20%;
}

.hero-glow.two{
width:280px;
height:280px;
background:#7C3AED;
bottom:-120px;
right:10%;
}

.hero-circuit{
position:absolute;
inset:0;
opacity:.12;
pointer-events:none;
background-image:
radial-gradient(circle at 1px 1px,#fff 1px,transparent 0);
background-size:28px 28px;
mask-image:radial-gradient(circle at 70% 50%,black,transparent 60%);
}

.hero-left{
width:55%;
position:relative;
z-index:2;
}

.tag{
display:inline-flex;
align-items:center;
gap:8px;
background:rgba(255,255,255,.12);
border:1px solid rgba(255,255,255,.18);
padding:8px 16px;
border-radius:50px;
margin-bottom:20px;
font-size:14px;
backdrop-filter:blur(4px);
}

.hero-left h1{
font-size:40px;
font-family:Poppins;
margin-bottom:16px;
line-height:1.2;
font-weight:800;
}

.hero-left p{
font-size:16px;
line-height:1.7;
opacity:.85;
margin-bottom:30px;
max-width:480px;
}

.hero-buttons{
display:flex;
gap:15px;
}

.primary-btn{
display:flex;
align-items:center;
gap:10px;
background:white;
color:#4F46E5;
border:none;
padding:14px 26px;
border-radius:12px;
font-weight:700;
cursor:pointer;
font-size:15px;
transition:.3s;
box-shadow:0 12px 30px rgba(79,70,229,.35);
}

.primary-btn:hover{
transform:translateY(-2px);
}

.secondary-btn{
background:transparent;
color:white;
border:2px solid rgba(255,255,255,.5);
padding:13px 24px;
border-radius:12px;
cursor:pointer;
font-size:15px;
font-weight:600;
transition:.3s;
}

.secondary-btn:hover{
background:rgba(255,255,255,.1);
}

.hero-right{
position:relative;
width:40%;
height:260px;
display:flex;
justify-content:center;
align-items:center;
z-index:2;
}

.circle{
position:absolute;
border-radius:50%;
background:rgba(255,255,255,.08);
border:1px solid rgba(255,255,255,.12);
}

.big{
width:230px;
height:230px;
}

.small{
width:150px;
height:150px;
}

.ai-brain{
position:relative;
width:150px;
height:150px;
border-radius:50%;
background:linear-gradient(135deg,rgba(79,70,229,.9),rgba(124,58,237,.9));
display:flex;
align-items:center;
justify-content:center;
box-shadow:0 0 60px rgba(124,58,237,.55),0 0 120px rgba(79,70,229,.35);
border:1px solid rgba(255,255,255,.25);
color:#fff;
}

.ai-card{
position:absolute;
top:-18px;
right:-42px;
background:white;
color:#4F46E5;
padding:14px 16px;
border-radius:14px;
font-size:13px;
font-weight:600;
box-shadow:0 20px 50px rgba(0,0,0,.25);
display:flex;
align-items:center;
gap:8px;
white-space:nowrap;
}

.ai-card strong{
font-size:18px;
}

@media(max-width:900px){
.hero-banner{
padding:36px 28px;
}

.hero-left{
width:100%;
}

.hero-right{
display:none;
}

.hero-left h1{
font-size:30px;
}
}

@media(max-width:600px){
.hero-left h1{
font-size:24px;
}

.hero-buttons{
flex-direction:column;
}

.primary-btn,.secondary-btn{
justify-content:center;
width:100%;
}
}
`, "components/HeroBanner/HeroBanner.css");

// src/components/HeroBanner/HeroBanner.jsx
import { Sparkles as Sparkles2, ArrowRight, BrainCircuit, ShoppingCart as ShoppingCart3 } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function HeroBanner() {
  return /* @__PURE__ */ jsxs3("div", { className: "hero-banner", children: [
    /* @__PURE__ */ jsx3("div", { className: "hero-glow one" }),
    /* @__PURE__ */ jsx3("div", { className: "hero-glow two" }),
    /* @__PURE__ */ jsx3("div", { className: "hero-circuit" }),
    /* @__PURE__ */ jsxs3("div", { className: "hero-left", children: [
      /* @__PURE__ */ jsxs3("div", { className: "tag", children: [
        /* @__PURE__ */ jsx3(Sparkles2, { size: 18 }),
        "AI Personalized Marketing"
      ] }),
      /* @__PURE__ */ jsxs3("h1", { children: [
        "AI Powered Just For You! ",
        /* @__PURE__ */ jsx3("span", { children: "\u2728" })
      ] }),
      /* @__PURE__ */ jsx3("p", { children: "Discover products recommended based on your shopping behavior, preferences and latest trends." }),
      /* @__PURE__ */ jsxs3("div", { className: "hero-buttons", children: [
        /* @__PURE__ */ jsxs3("button", { className: "primary-btn", onClick: () => document.getElementById("ai-recommendations")?.scrollIntoView({ behavior: "smooth" }), children: [
          "Explore Now",
          /* @__PURE__ */ jsx3(ArrowRight, { size: 18 })
        ] }),
        /* @__PURE__ */ jsx3("button", { className: "secondary-btn", onClick: () => document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" }), children: "View Offers" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "hero-right", children: [
      /* @__PURE__ */ jsx3("div", { className: "circle big" }),
      /* @__PURE__ */ jsx3("div", { className: "circle small" }),
      /* @__PURE__ */ jsxs3("div", { className: "ai-brain", children: [
        /* @__PURE__ */ jsx3(BrainCircuit, { size: 34 }),
        /* @__PURE__ */ jsxs3("div", { className: "ai-card", children: [
          /* @__PURE__ */ jsx3(ShoppingCart3, { size: 18 }),
          "AI Match",
          /* @__PURE__ */ jsx3("strong", { children: "95%" })
        ] })
      ] })
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\components\StatsCards\StatsCards.css
collectCSS(`.stats-container{

display:grid;

grid-template-columns:repeat(4,1fr);

gap:20px;

margin-top:30px;

}

.stat-card{

background:#fff;

padding:22px;

border-radius:18px;

display:flex;

align-items:center;

gap:18px;

box-shadow:0 10px 25px rgba(0,0,0,.05);

transition:.3s;

cursor:pointer;

}

.stat-card:hover{

transform:translateY(-5px);

}

.icon-box{

width:60px;

height:60px;

border-radius:16px;

display:flex;

align-items:center;

justify-content:center;

color:white;

}

.details h4{

font-size:15px;

color:#6B7280;

margin-bottom:8px;

}

.details h2{

font-size:28px;

font-family:Poppins;

}
`, "components/StatsCards/StatsCards.css");

// src/components/StatsCards/StatsCards.jsx
import {
  Package as Package2,
  Heart as Heart3,
  Gift as Gift2,
  BadgePercent as BadgePercent2
} from "lucide-react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var stats = [
  {
    title: "My Orders",
    value: "18",
    icon: /* @__PURE__ */ jsx4(Package2, { size: 28 }),
    color: "#4F46E5"
  },
  {
    title: "Wishlist",
    value: "12",
    icon: /* @__PURE__ */ jsx4(Heart3, { size: 28 }),
    color: "#EF4444"
  },
  {
    title: "Loyalty Points",
    value: "2450",
    icon: /* @__PURE__ */ jsx4(Gift2, { size: 28 }),
    color: "#22C55E"
  },
  {
    title: "Coupons",
    value: "05",
    icon: /* @__PURE__ */ jsx4(BadgePercent2, { size: 28 }),
    color: "#F59E0B"
  }
];
function StatsCards() {
  return /* @__PURE__ */ jsx4("div", { className: "stats-container", children: stats.map((item, index) => /* @__PURE__ */ jsxs4("div", { className: "stat-card", children: [
    /* @__PURE__ */ jsx4(
      "div",
      {
        className: "icon-box",
        style: { background: item.color },
        children: item.icon
      }
    ),
    /* @__PURE__ */ jsxs4("div", { className: "details", children: [
      /* @__PURE__ */ jsx4("h4", { children: item.title }),
      /* @__PURE__ */ jsx4("h2", { children: item.value })
    ] })
  ] }, index)) });
}

// src/components/RecommendedProducts/RecommendedProducts.jsx
import { useNavigate as useNavigate4 } from "react-router-dom";
import { ArrowRight as ArrowRight2, Sparkles as Sparkles4 } from "lucide-react";

// src/components/ProductCard/ProductCard.jsx
import { useState as useState2 } from "react";
import { Link as Link2, useNavigate as useNavigate3 } from "react-router-dom";
import { Heart as Heart4, ShoppingCart as ShoppingCart4, Star, Sparkles as Sparkles3, Truck, Zap, PackageX } from "lucide-react";

// css:C:\CustomerDashbord\src\components\ProductCard\ProductCard.css
collectCSS(`.product-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
}

/* AI Badge */

.ai-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 5px;

  background: #7c3aed;
  color: #ffffff;

  padding: 6px 9px;

  border-radius: 20px;

  font-size: 10px;
  font-weight: 600;
}

/* Wishlist */

.wishlist-button {
  position: absolute;

  right: 12px;
  top: 12px;

  z-index: 2;

  width: 36px;
  height: 36px;

  border: none;

  border-radius: 50%;

  background: #ffffff;

  color: #475569;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.wishlist-button:hover {
  color: #ef4444;
}

/* Image */

.product-image-container {
  height: 210px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: #ffffff;
}

.product-image-container a {
  height: 100%;
  display: flex;
}

.product-image {
  width: 100%;
  height: 100%;

  object-fit: contain;

  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.06);
}

/* Information */

.product-info {
  padding: 18px;
}

.product-category {
  font-size: 12px;
  color: #6b7280;
}

.product-title-link {
  text-decoration: none;
}

.product-info h3 {
  font-family: Poppins, sans-serif;

  font-size: 16px;

  margin: 6px 0;

  color: #111827;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-info h3:hover {
  color: #4f46e5;
}

/* Rating */

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;

  margin: 8px 0;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 3px;

  background: #fef3c7;

  color: #b45309;

  padding: 4px 7px;

  border-radius: 6px;

  font-size: 12px;
  font-weight: 600;
}

.review-count {
  font-size: 12px;
  color: #9ca3af;
}

/* Price */

.product-price {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;

  margin-top: 10px;
}

.product-price strong {
  font-size: 19px;
  color: #111827;
}

.product-price span {
  font-size: 12px;

  color: #9ca3af;

  text-decoration: line-through;
}

.product-price b {
  font-size: 11px;
  color: #16a34a;
}

/* Delivery */

.free-delivery {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-top: 10px;

  color: #16a34a;

  font-size: 12px;
}

.out-of-stock {
  margin-top: 10px;

  color: #ef4444;

  font-size: 12px;
  font-weight: 600;
}

/* Image fallback */

.product-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-radius: 12px;
}

.product-image-fallback span {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
}

/* Buttons */

.product-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
}

.product-buttons button {
  height: 42px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  font-weight: 600;

  font-size: 13px;

  cursor: pointer;

  transition: 0.2s;
}

.add-cart-button {
  border: 1px solid #4f46e5;

  background: #4f46e5;

  color: white;
}

.add-cart-button:hover {
  background: #4338ca;
  border-color: #4338ca;
}

.add-cart-button:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

.buy-now-button {
  border: 1px solid #2563eb;

  background: #2563eb;

  color: white;
}

.buy-now-button:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.buy-now-button:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

/* Mobile */

@media (max-width: 600px) {
  .product-image-container {
    height: 180px;
  }

  .product-info {
    padding: 14px;
  }
}
`, "components/ProductCard/ProductCard.css");

// src/components/ProductCard/ProductCard.jsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function ProductCard({ product }) {
  const navigate = useNavigate3();
  const [liked, setLiked] = useState2(false);
  const [added, setAdded] = useState2(false);
  const [imgError, setImgError] = useState2(false);
  const handleAdd = () => {
    if (!product.inStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const handleBuyNow = () => {
    if (!product.inStock) return;
    addToCart(product, 1);
    navigate("/checkout");
  };
  const toggleWishlist = () => {
    if (liked) {
      removeFromWishlist(product.id);
      setLiked(false);
    } else {
      addToWishlist(product);
      setLiked(true);
    }
  };
  return /* @__PURE__ */ jsxs5("div", { className: "product-card", children: [
    product.aiRecommended && /* @__PURE__ */ jsxs5("div", { className: "ai-badge", children: [
      /* @__PURE__ */ jsx5(Sparkles3, { size: 13 }),
      "AI Recommended"
    ] }),
    /* @__PURE__ */ jsx5(
      "button",
      {
        className: "wishlist-button",
        onClick: toggleWishlist,
        "aria-label": "Add to wishlist",
        children: /* @__PURE__ */ jsx5(
          Heart4,
          {
            size: 18,
            fill: liked ? "#EF4444" : "none",
            color: liked ? "#EF4444" : "#475569"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx5("div", { className: "product-image-container", children: imgError ? /* @__PURE__ */ jsxs5("div", { className: "product-image-fallback", children: [
      /* @__PURE__ */ jsx5(PackageX, { size: 44, color: "#94A3B8" }),
      /* @__PURE__ */ jsx5("span", { children: product.category })
    ] }) : /* @__PURE__ */ jsx5(Link2, { to: `/products/${product.id}`, "aria-label": product.name, children: /* @__PURE__ */ jsx5(
      "img",
      {
        src: product.image,
        alt: product.name,
        loading: "lazy",
        className: "product-image",
        onError: () => setImgError(true)
      }
    ) }) }),
    /* @__PURE__ */ jsxs5("div", { className: "product-info", children: [
      /* @__PURE__ */ jsx5("span", { className: "product-category", children: product.category }),
      /* @__PURE__ */ jsx5(Link2, { to: `/products/${product.id}`, className: "product-title-link", children: /* @__PURE__ */ jsx5("h3", { children: product.name }) }),
      /* @__PURE__ */ jsxs5("div", { className: "product-rating", children: [
        /* @__PURE__ */ jsxs5("span", { className: "rating-box", children: [
          /* @__PURE__ */ jsx5(Star, { size: 13, fill: "currentColor" }),
          product.rating
        ] }),
        /* @__PURE__ */ jsxs5("span", { className: "review-count", children: [
          "(",
          product.reviews,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: "product-price", children: [
        /* @__PURE__ */ jsxs5("strong", { children: [
          "\u20B9",
          product.price.toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsxs5("span", { children: [
          "\u20B9",
          product.oldPrice.toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsxs5("b", { children: [
          product.discount,
          "% OFF"
        ] })
      ] }),
      product.freeDelivery && /* @__PURE__ */ jsxs5("div", { className: "free-delivery", children: [
        /* @__PURE__ */ jsx5(Truck, { size: 15 }),
        "Free Delivery"
      ] }),
      !product.inStock && /* @__PURE__ */ jsx5("p", { className: "out-of-stock", children: "Out of Stock" }),
      /* @__PURE__ */ jsxs5("div", { className: "product-buttons", children: [
        /* @__PURE__ */ jsxs5(
          "button",
          {
            className: "add-cart-button",
            onClick: handleAdd,
            disabled: !product.inStock,
            children: [
              /* @__PURE__ */ jsx5(ShoppingCart4, { size: 16 }),
              added ? "Added" : "Add to Cart"
            ]
          }
        ),
        /* @__PURE__ */ jsxs5(
          "button",
          {
            className: "buy-now-button",
            onClick: handleBuyNow,
            disabled: !product.inStock,
            children: [
              /* @__PURE__ */ jsx5(Zap, { size: 16 }),
              "Buy Now"
            ]
          }
        )
      ] })
    ] })
  ] });
}

// src/data/products.js
var products = [
  {
    id: 1,
    name: "Apple MacBook Air M2",
    description: "Ultra-thin laptop with the blazing fast M2 chip and all-day battery.",
    category: "Electronics",
    brand: "Apple",
    price: 109900,
    oldPrice: 119900,
    discount: 8,
    rating: 4.7,
    reviews: 245,
    image: "/products/macbook.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 12,
    inStock: true
  },
  {
    id: 2,
    name: "HP Pavilion Laptop",
    description: "Everyday performance with a 15.6 inch display and latest Intel processor.",
    category: "Electronics",
    brand: "HP",
    price: 67990,
    oldPrice: 74990,
    discount: 9,
    rating: 4.5,
    reviews: 182,
    image: "/products/laptop-hp.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 18,
    inStock: true
  },
  {
    id: 3,
    name: "Dell Inspiron 15",
    description: "Reliable everyday laptop with crisp display and all-day battery life.",
    category: "Electronics",
    brand: "Dell",
    price: 58990,
    oldPrice: 65990,
    discount: 11,
    rating: 4.4,
    reviews: 154,
    image: "/products/dell-laptop.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 15,
    inStock: true
  },
  {
    id: 4,
    name: "Apple iPhone 15",
    description: "A16 Bionic chip, dynamic island and a pro-grade 48MP camera system.",
    category: "Electronics",
    brand: "Apple",
    price: 79900,
    oldPrice: 84900,
    discount: 6,
    rating: 4.8,
    reviews: 521,
    image: "/products/iphone15.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 20,
    inStock: true
  },
  {
    id: 5,
    name: "Samsung Galaxy S24",
    description: "Galaxy AI with a powerful 50MP camera and vivid AMOLED display.",
    category: "Electronics",
    brand: "Samsung",
    price: 69999,
    oldPrice: 79999,
    discount: 13,
    rating: 4.7,
    reviews: 398,
    image: "/products/samsung-s24.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 16,
    inStock: true
  },
  {
    id: 6,
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation with crystal clear audio.",
    category: "Electronics",
    brand: "Sony",
    price: 24990,
    oldPrice: 29990,
    discount: 17,
    rating: 4.6,
    reviews: 315,
    image: "/products/sony-headphone.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 30,
    inStock: true
  },
  {
    id: 7,
    name: "Apple AirPods Pro",
    description: "Wireless earbuds with active noise cancellation and adaptive audio.",
    category: "Electronics",
    brand: "Apple",
    price: 22999,
    oldPrice: 26999,
    discount: 15,
    rating: 4.8,
    reviews: 421,
    image: "/products/airpods.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 25,
    inStock: true
  },
  {
    id: 8,
    name: "Samsung Galaxy Watch",
    description: "Fitness tracking, GPS and long battery life in a sleek smartwatch.",
    category: "Electronics",
    brand: "Samsung",
    price: 18999,
    oldPrice: 21999,
    discount: 14,
    rating: 4.5,
    reviews: 210,
    image: "/products/samsung-watch.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 22,
    inStock: true
  },
  {
    id: 9,
    name: "Canon EOS R50 Camera",
    description: "Compact mirrorless camera with 24.2MP sensor and 4K video.",
    category: "Electronics",
    brand: "Canon",
    price: 74999,
    oldPrice: 82999,
    discount: 10,
    rating: 4.8,
    reviews: 127,
    image: "/products/canon-camera.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 10,
    inStock: true
  },
  {
    id: 10,
    name: "Nike Air Max Shoes",
    description: "Iconic Nike Air cushioning with bold style for all-day comfort.",
    category: "Fashion",
    brand: "Nike",
    price: 5999,
    oldPrice: 7999,
    discount: 25,
    rating: 4.6,
    reviews: 326,
    image: "/products/nike-shoes.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 40,
    inStock: true
  },
  {
    id: 11,
    name: "Adidas Running Shoes",
    description: "Responsive boost midsole for maximum energy return.",
    category: "Fashion",
    brand: "Adidas",
    price: 4499,
    oldPrice: 5999,
    discount: 25,
    rating: 4.5,
    reviews: 218,
    image: "/products/adidas-shoes.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 35,
    inStock: true
  },
  {
    id: 12,
    name: "Premium Cotton T-Shirt",
    description: "Soft 100% cotton tee that keeps you comfortable all day.",
    category: "Fashion",
    brand: "Puma",
    price: 899,
    oldPrice: 1499,
    discount: 40,
    rating: 4.3,
    reviews: 184,
    image: "/products/tshirt.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 60,
    inStock: true
  },
  {
    id: 13,
    name: "Women's Casual Dress",
    description: "Lightweight casual dress perfect for everyday style.",
    category: "Fashion",
    brand: "Roadster",
    price: 1499,
    oldPrice: 2499,
    discount: 40,
    rating: 4.4,
    reviews: 163,
    image: "/products/fashion-dress.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 28,
    inStock: true
  },
  {
    id: 14,
    name: "Premium Grocery Combo",
    description: "Weekly supply of fresh and premium grocery essentials.",
    category: "Grocery",
    brand: "FreshMart",
    price: 1299,
    oldPrice: 1599,
    discount: 19,
    rating: 4.5,
    reviews: 92,
    image: "/products/grocery.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 50,
    inStock: true
  },
  {
    id: 15,
    name: "Vitamin C Face Serum",
    description: "Brightening serum for glowing, even-toned skin.",
    category: "Beauty",
    brand: "Minimalist",
    price: 599,
    oldPrice: 699,
    discount: 14,
    rating: 4.6,
    reviews: 412,
    image: "/products/beauty.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 55,
    inStock: true
  },
  {
    id: 16,
    name: "Modern Living Room Sofa",
    description: "Comfortable 3-seater sofa with premium fabric and sturdy frame.",
    category: "Home & Kitchen",
    brand: "Urban Living",
    price: 24999,
    oldPrice: 32999,
    discount: 24,
    rating: 4.4,
    reviews: 74,
    image: "/products/sofa.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 8,
    inStock: true
  },
  {
    id: 17,
    name: "Kitchen Mixer Grinder",
    description: "Powerful motor and 3 jars for effortless grinding and blending.",
    category: "Home & Kitchen",
    brand: "Philips",
    price: 3299,
    oldPrice: 4299,
    discount: 23,
    rating: 4.5,
    reviews: 251,
    image: "/products/mixer.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 45,
    inStock: true
  },
  {
    id: 18,
    name: "Professional Football",
    description: "Match-quality football with excellent grip and durability.",
    category: "Sports",
    brand: "Nivia",
    price: 999,
    oldPrice: 1399,
    discount: 29,
    rating: 4.4,
    reviews: 89,
    image: "/products/football.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 70,
    inStock: true
  },
  {
    id: 19,
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed and happiness.",
    category: "Books",
    brand: "Jaico",
    price: 299,
    oldPrice: 499,
    discount: 40,
    rating: 4.8,
    reviews: 1280,
    image: "/products/books.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 100,
    inStock: true
  },
  {
    id: 20,
    name: "Educational Building Blocks",
    description: "Creative STEM blocks that make learning fun for kids.",
    category: "Toys & Games",
    brand: "Funskool",
    price: 799,
    oldPrice: 1199,
    discount: 33,
    rating: 4.6,
    reviews: 156,
    image: "/products/toys.jpg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 65,
    inStock: true
  },
  {
    id: 21,
    name: "boAt Wave Sigma 3",
    description: "Feature-packed smartwatch with AMOLED display and Bluetooth calling.",
    category: "Electronics",
    brand: "boAt",
    price: 2199,
    oldPrice: 2999,
    discount: 27,
    rating: 4.4,
    reviews: 96,
    image: "/products/boat-watch.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 38,
    inStock: true
  },
  {
    id: 22,
    name: "Car Vacuum Cleaner",
    description: "Powerful handheld vacuum for keeping your car spotless on the go.",
    category: "Automotive",
    brand: "AutoTech",
    price: 1899,
    oldPrice: 2499,
    discount: 24,
    rating: 4.3,
    reviews: 118,
    image: "/products/automotive.jpg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 42,
    inStock: true
  },
  {
    id: 23,
    name: "Samsung Galaxy Tab S9",
    description: "Immersive 11 inch AMOLED display with S Pen support and long battery.",
    category: "Electronics",
    brand: "Samsung",
    price: 72999,
    oldPrice: 81999,
    discount: 11,
    rating: 4.7,
    reviews: 142,
    image: "/products/electronics/galaxy-tab.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 14,
    inStock: true
  },
  {
    id: 24,
    name: "JBL Flip 6 Bluetooth Speaker",
    description: "Bold sound, deep bass and IP67 waterproof design for any adventure.",
    category: "Electronics",
    brand: "JBL",
    price: 8999,
    oldPrice: 12999,
    discount: 31,
    rating: 4.6,
    reviews: 372,
    image: "/products/electronics/jbl-speaker.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 34,
    inStock: true
  },
  {
    id: 25,
    name: "OnePlus Buds Pro 2",
    description: "Wireless earbuds with spatial audio, ANC and up to 39 hours playback.",
    category: "Electronics",
    brand: "OnePlus",
    price: 9999,
    oldPrice: 13999,
    discount: 29,
    rating: 4.6,
    reviews: 289,
    image: "/products/electronics/oneplus-earbuds.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 31,
    inStock: true
  },
  {
    id: 26,
    name: "Premium Cotton Shirt",
    description: "Breathable premium cotton shirt with a sharp formal fit.",
    category: "Fashion",
    brand: "Arrow",
    price: 1799,
    oldPrice: 2499,
    discount: 28,
    rating: 4.4,
    reviews: 132,
    image: "/products/fashion/cotton-shirt.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 48,
    inStock: true
  },
  {
    id: 27,
    name: "Premium Handbag",
    description: "Stylish and spacious handbag crafted from premium vegan leather.",
    category: "Fashion",
    brand: "Lavie",
    price: 2499,
    oldPrice: 3999,
    discount: 38,
    rating: 4.5,
    reviews: 176,
    image: "/products/fashion/handbag.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 36,
    inStock: true
  },
  {
    id: 28,
    name: "Casual Jacket",
    description: "Lightweight windproof jacket for all-weather casual style.",
    category: "Fashion",
    brand: "Wrogn",
    price: 1999,
    oldPrice: 2999,
    discount: 33,
    rating: 4.3,
    reviews: 98,
    image: "/products/fashion/jacket.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 41,
    inStock: true
  },
  {
    id: 29,
    name: "Slim Fit Jeans",
    description: "Classic slim fit denim with stretch comfort and premium finish.",
    category: "Fashion",
    brand: "Levi's",
    price: 2299,
    oldPrice: 3299,
    discount: 30,
    rating: 4.5,
    reviews: 214,
    image: "/products/fashion/jeans.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 52,
    inStock: true
  },
  {
    id: 30,
    name: "UV Protection Sunglasses",
    description: "Polarised lenses with 100% UV protection in a sleek frame.",
    category: "Fashion",
    brand: "Ray-Ban",
    price: 5999,
    oldPrice: 8499,
    discount: 29,
    rating: 4.4,
    reviews: 121,
    image: "/products/fashion/sunglasses.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 33,
    inStock: true
  },
  {
    id: 31,
    name: "Classic Fashion Watch",
    description: "Elegant analog watch with a leather strap for everyday wear.",
    category: "Fashion",
    brand: "Fossil",
    price: 8999,
    oldPrice: 11999,
    discount: 25,
    rating: 4.6,
    reviews: 189,
    image: "/products/fashion/fashion-watch.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 27,
    inStock: true
  },
  {
    id: 32,
    name: "Philips Digital Air Fryer",
    description: "Healthier fried food with 90% less oil using rapid air technology.",
    category: "Home & Kitchen",
    brand: "Philips",
    price: 8499,
    oldPrice: 12999,
    discount: 35,
    rating: 4.6,
    reviews: 342,
    image: "/products/home-kitchen/air-fryer.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 26,
    inStock: true
  },
  {
    id: 33,
    name: "Automatic Coffee Maker",
    description: "Brew rich coffee in minutes with an easy programmable timer.",
    category: "Home & Kitchen",
    brand: "Morphy Richards",
    price: 4999,
    oldPrice: 7499,
    discount: 33,
    rating: 4.4,
    reviews: 165,
    image: "/products/home-kitchen/coffee-maker.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 24,
    inStock: true
  },
  {
    id: 34,
    name: "Non-Stick Cookware Set",
    description: "Complete 5-piece non-stick cookware set with even heat distribution.",
    category: "Home & Kitchen",
    brand: "Prestige",
    price: 3999,
    oldPrice: 5999,
    discount: 33,
    rating: 4.5,
    reviews: 288,
    image: "/products/home-kitchen/cookware.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 44,
    inStock: true
  },
  {
    id: 35,
    name: "Convection Microwave Oven",
    description: "Crisp, grill and bake with a 28 litre convection microwave oven.",
    category: "Home & Kitchen",
    brand: "LG",
    price: 11999,
    oldPrice: 15999,
    discount: 25,
    rating: 4.6,
    reviews: 231,
    image: "/products/home-kitchen/microwave.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 21,
    inStock: true
  },
  {
    id: 36,
    name: "1.5L Electric Kettle",
    description: "Fast boiling stainless steel kettle with auto shut-off safety.",
    category: "Home & Kitchen",
    brand: "Bajaj",
    price: 1499,
    oldPrice: 2199,
    discount: 32,
    rating: 4.5,
    reviews: 512,
    image: "/products/home-kitchen/kettle.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 68,
    inStock: true
  },
  {
    id: 37,
    name: "2-Slice Pop-up Toaster",
    description: "Brushed steel toaster with 6 browning settings and crumb tray.",
    category: "Home & Kitchen",
    brand: "Bajaj",
    price: 1499,
    oldPrice: 2299,
    discount: 35,
    rating: 4.3,
    reviews: 145,
    image: "/products/home-kitchen/toaster.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 58,
    inStock: true
  },
  {
    id: 38,
    name: "RO Water Purifier",
    description: "7-stage RO + UV purification with mineral booster for healthy water.",
    category: "Home & Kitchen",
    brand: "Kent",
    price: 10999,
    oldPrice: 15999,
    discount: 31,
    rating: 4.6,
    reviews: 198,
    image: "/products/home-kitchen/water-purifier.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 19,
    inStock: true
  },
  {
    id: 39,
    name: "Daily Skin Care Combo",
    description: "Complete daily routine kit for clean, hydrated and glowing skin.",
    category: "Beauty",
    brand: "CeraVe",
    price: 1799,
    oldPrice: 2499,
    discount: 28,
    rating: 4.5,
    reviews: 226,
    image: "/products/beauty/skincare-combo.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 46,
    inStock: true
  },
  {
    id: 40,
    name: "Complete Makeup Kit",
    description: "All-in-one professional makeup kit with essentials for every look.",
    category: "Beauty",
    brand: "Maybelline",
    price: 2499,
    oldPrice: 3999,
    discount: 38,
    rating: 4.4,
    reviews: 173,
    image: "/products/beauty/makeup-kit.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 37,
    inStock: true
  },
  {
    id: 41,
    name: "Premium Eau De Parfum",
    description: "Long-lasting luxury fragrance with a fresh, elegant scent trail.",
    category: "Beauty",
    brand: "Armani",
    price: 4999,
    oldPrice: 6999,
    discount: 29,
    rating: 4.7,
    reviews: 254,
    image: "/products/beauty/perfume.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 29,
    inStock: true
  },
  {
    id: 42,
    name: "Professional Hair Dryer",
    description: "1600W ionic hair dryer for fast drying with reduced frizz.",
    category: "Beauty",
    brand: "Philips",
    price: 2499,
    oldPrice: 3499,
    discount: 29,
    rating: 4.5,
    reviews: 187,
    image: "/products/beauty/hair-dryer.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 39,
    inStock: true
  },
  {
    id: 43,
    name: "Matte Lipstick Set",
    description: "Six long-wear matte shades for every mood and occasion.",
    category: "Beauty",
    brand: "Nykaa",
    price: 1499,
    oldPrice: 2499,
    discount: 40,
    rating: 4.6,
    reviews: 301,
    image: "/products/beauty/lipstick-set.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 57,
    inStock: true
  },
  {
    id: 44,
    name: "Hair Care Shampoo",
    description: "Nourishing shampoo for healthy, shiny and frizz-free hair.",
    category: "Beauty",
    brand: "L'Or\xE9al",
    price: 649,
    oldPrice: 999,
    discount: 35,
    rating: 4.5,
    reviews: 468,
    image: "/products/beauty/shampoo.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 74,
    inStock: true
  },
  {
    id: 45,
    name: "Beauty Essentials Combo",
    description: "Everyday beauty starter kit with skin, hair and makeup care.",
    category: "Beauty",
    brand: "Lakm\xE9",
    price: 1999,
    oldPrice: 2999,
    discount: 33,
    rating: 4.4,
    reviews: 143,
    image: "/products/beauty/beauty-combo.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 43,
    inStock: true
  },
  {
    id: 46,
    name: "English Willow Cricket Bat",
    description: "Grade-A English willow bat with a powerful sweet spot.",
    category: "Sports",
    brand: "MRF",
    price: 6499,
    oldPrice: 8999,
    discount: 28,
    rating: 4.6,
    reviews: 87,
    image: "/products/sports/cricket-bat.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 17,
    inStock: true
  },
  {
    id: 47,
    name: "Running Shoes",
    description: "Lightweight cushioned running shoes built for long distances.",
    category: "Sports",
    brand: "Nike",
    price: 5499,
    oldPrice: 7999,
    discount: 31,
    rating: 4.6,
    reviews: 244,
    image: "/products/sports/running-shoes.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 49,
    inStock: true
  },
  {
    id: 48,
    name: "Badminton Racket",
    description: "Ultra-light graphite racket with precision control and power.",
    category: "Sports",
    brand: "Yonex",
    price: 2999,
    oldPrice: 4499,
    discount: 33,
    rating: 4.5,
    reviews: 167,
    image: "/products/sports/badminton-racket.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 32,
    inStock: true
  },
  {
    id: 49,
    name: "Premium Yoga Mat",
    description: "Non-slip 6mm yoga mat with great cushioning for daily practice.",
    category: "Sports",
    brand: "Puma",
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.5,
    reviews: 312,
    image: "/products/sports/yoga-mat.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 62,
    inStock: true
  },
  {
    id: 50,
    name: "Adjustable Dumbbells",
    description: "Space-saving adjustable dumbbells for a complete home workout.",
    category: "Sports",
    brand: "Lifelong",
    price: 3499,
    oldPrice: 4999,
    discount: 30,
    rating: 4.4,
    reviews: 156,
    image: "/products/sports/dumbbells.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 23,
    inStock: true
  },
  {
    id: 51,
    name: "Official Basketball",
    description: "Durable composite basketball with superior grip and bounce.",
    category: "Sports",
    brand: "Spalding",
    price: 1499,
    oldPrice: 2199,
    discount: 32,
    rating: 4.5,
    reviews: 138,
    image: "/products/sports/basketball.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 55,
    inStock: true
  },
  {
    id: 52,
    name: "Sports Travel Bag",
    description: "Spacious multi-compartment bag for gear, shoes and everyday carry.",
    category: "Sports",
    brand: "Wildcraft",
    price: 1799,
    oldPrice: 2599,
    discount: 31,
    rating: 4.4,
    reviews: 112,
    image: "/products/sports/sports-bag.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 47,
    inStock: true
  },
  {
    id: 53,
    name: "The Alchemist",
    description: "A journey of self-discovery following your personal legend.",
    category: "Books",
    brand: "HarperCollins",
    price: 549,
    oldPrice: 699,
    discount: 21,
    rating: 4.7,
    reviews: 1980,
    image: "/products/books/alchemist.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 120,
    inStock: true
  },
  {
    id: 54,
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship and clean practices.",
    category: "Books",
    brand: "Pearson",
    price: 999,
    oldPrice: 1299,
    discount: 23,
    rating: 4.8,
    reviews: 1450,
    image: "/products/books/clean-code.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 95,
    inStock: true
  },
  {
    id: 55,
    name: "Rich Dad Poor Dad",
    description: "What the rich teach their kids about money that the poor don't.",
    category: "Books",
    brand: "Plata",
    price: 299,
    oldPrice: 499,
    discount: 40,
    rating: 4.7,
    reviews: 2310,
    image: "/products/books/rich-dad.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 150,
    inStock: true
  },
  {
    id: 56,
    name: "Atomic Habits",
    description: "Proven strategies to build good habits and break bad ones.",
    category: "Books",
    brand: "Random House",
    price: 499,
    oldPrice: 799,
    discount: 38,
    rating: 4.8,
    reviews: 2750,
    image: "/products/books/atomic-habits.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 140,
    inStock: true
  },
  {
    id: 57,
    name: "A Brief History of Time",
    description: "Hawking's landmark journey from the Big Bang to black holes.",
    category: "Books",
    brand: "Bantam",
    price: 399,
    oldPrice: 599,
    discount: 33,
    rating: 4.6,
    reviews: 890,
    image: "/products/books/brief-history.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 88,
    inStock: true
  },
  {
    id: 58,
    name: "Kids Story Collection",
    description: "A delightful collection of bedtime stories with beautiful art.",
    category: "Books",
    brand: "Penguin",
    price: 349,
    oldPrice: 549,
    discount: 36,
    rating: 4.7,
    reviews: 640,
    image: "/products/books/kids-stories.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 110,
    inStock: true
  },
  {
    id: 59,
    name: "Indian History Guide",
    description: "From ancient civilisations to modern India \u2014 one clear guide.",
    category: "Books",
    brand: "Penguin",
    price: 449,
    oldPrice: 699,
    discount: 36,
    rating: 4.5,
    reviews: 520,
    image: "/products/books/indian-history.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 90,
    inStock: true
  },
  {
    id: 60,
    name: "Remote Control Car",
    description: "High-speed 4WD RC car with long-range remote and rugged build.",
    category: "Toys & Games",
    brand: "Hot Wheels",
    price: 1999,
    oldPrice: 2999,
    discount: 33,
    rating: 4.5,
    reviews: 224,
    image: "/products/toys-games/rc-car.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 51,
    inStock: true
  },
  {
    id: 61,
    name: "1000 Piece Puzzle",
    description: "Challenging 1000-piece puzzle that brings the whole family together.",
    category: "Toys & Games",
    brand: "Ravensburger",
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.6,
    reviews: 178,
    image: "/products/toys-games/puzzle.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 60,
    inStock: true
  },
  {
    id: 62,
    name: "Fashion Doll Set",
    description: "Complete doll set with stylish outfits and fun accessories.",
    category: "Toys & Games",
    brand: "Barbie",
    price: 1499,
    oldPrice: 2299,
    discount: 35,
    rating: 4.6,
    reviews: 205,
    image: "/products/toys-games/doll-set.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 46,
    inStock: true
  },
  {
    id: 63,
    name: "Family Board Game",
    description: "Classic strategy board game for hours of family fun.",
    category: "Toys & Games",
    brand: "Hasbro",
    price: 899,
    oldPrice: 1399,
    discount: 36,
    rating: 4.5,
    reviews: 312,
    image: "/products/toys-games/board-game.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 72,
    inStock: true
  },
  {
    id: 64,
    name: "Smart Robot Toy",
    description: "Interactive robot that talks, dances and follows commands.",
    category: "Toys & Games",
    brand: "WowWee",
    price: 3499,
    oldPrice: 4999,
    discount: 30,
    rating: 4.4,
    reviews: 142,
    image: "/products/toys-games/robot-toy.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 30,
    inStock: true
  },
  {
    id: 65,
    name: "Soft Teddy Bear",
    description: "Ultra-soft plush teddy bear that kids will love to cuddle.",
    category: "Toys & Games",
    brand: "TeddyCraft",
    price: 699,
    oldPrice: 1099,
    discount: 36,
    rating: 4.7,
    reviews: 421,
    image: "/products/toys-games/teddy-bear.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 84,
    inStock: true
  },
  {
    id: 66,
    name: "Kids Kitchen Set",
    description: "Imaginative play kitchen set with pots, pans and pretend food.",
    category: "Toys & Games",
    brand: "Melissa & Doug",
    price: 2499,
    oldPrice: 3499,
    discount: 29,
    rating: 4.6,
    reviews: 167,
    image: "/products/toys-games/kids-kitchen.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 25,
    inStock: true
  },
  {
    id: 67,
    name: "Premium Car Care Kit",
    description: "Complete wax, polish and cleaning kit to keep your car showroom fresh.",
    category: "Automotive",
    brand: "3M",
    price: 1799,
    oldPrice: 2599,
    discount: 31,
    rating: 4.5,
    reviews: 214,
    image: "/products/automotive/car-care-kit.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 38,
    inStock: true
  },
  {
    id: 68,
    name: "Waterproof Car Cover",
    description: "Weatherproof 4-layer car cover protecting against sun, rain and dust.",
    category: "Automotive",
    brand: "AutoTech",
    price: 1499,
    oldPrice: 2199,
    discount: 32,
    rating: 4.3,
    reviews: 128,
    image: "/products/automotive/car-cover.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 36,
    inStock: true
  },
  {
    id: 69,
    name: "Dashboard Utility Kit",
    description: "Anti-slip dashboard organizer with compartments for daily essentials.",
    category: "Automotive",
    brand: "Godrej",
    price: 699,
    oldPrice: 1099,
    discount: 36,
    rating: 4.3,
    reviews: 156,
    image: "/products/automotive/dashboard-kit.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 54,
    inStock: true
  },
  {
    id: 70,
    name: "Magnetic Phone Holder",
    description: "Strong magnetic grip phone mount for easy hands-free driving.",
    category: "Automotive",
    brand: "Spigen",
    price: 599,
    oldPrice: 999,
    discount: 40,
    rating: 4.5,
    reviews: 342,
    image: "/products/automotive/phone-holder.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 78,
    inStock: true
  },
  {
    id: 71,
    name: "Digital Tyre Inflator",
    description: "Digital air compressor with auto shut-off for precise tyre pressure.",
    category: "Automotive",
    brand: "Michelin",
    price: 2499,
    oldPrice: 3499,
    discount: 29,
    rating: 4.5,
    reviews: 187,
    image: "/products/automotive/tyre-inflator.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 33,
    inStock: true
  },
  {
    id: 72,
    name: "Car Air Freshener",
    description: "Long-lasting fresh scent that keeps your car cabin smelling great.",
    category: "Automotive",
    brand: "Ambi Pur",
    price: 299,
    oldPrice: 499,
    discount: 40,
    rating: 4.3,
    reviews: 276,
    image: "/products/automotive/air-freshener.svg",
    aiRecommended: false,
    freeDelivery: true,
    stock: 96,
    inStock: true
  },
  {
    id: 73,
    name: "Premium Seat Cushion",
    description: "Ergonomic memory foam cushion for long comfortable drives.",
    category: "Automotive",
    brand: "AutoTech",
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.4,
    reviews: 145,
    image: "/products/automotive/seat-cushion.svg",
    aiRecommended: true,
    freeDelivery: true,
    stock: 41,
    inStock: true
  }
];
var products_default = products;

// src/services/products.js
var catalog = [...products_default];
var IMAGE_KEY = "clustermind_product_images";
var readImageOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_KEY) || "{}");
  } catch {
    return {};
  }
};
var saveImageOverrides = (map) => {
  localStorage.setItem(IMAGE_KEY, JSON.stringify(map));
};
var getUploadedImage = (id) => readImageOverrides()[String(id)] || "";
var setProductImage = (id, dataUrl) => {
  const map = readImageOverrides();
  map[String(id)] = dataUrl;
  saveImageOverrides(map);
};
var resetProductImage = (id) => {
  const map = readImageOverrides();
  delete map[String(id)];
  saveImageOverrides(map);
};
var withOverride = (p) => {
  if (!p) return p;
  const uploaded = getUploadedImage(p.id);
  return uploaded ? { ...p, image: uploaded } : p;
};
var getCategories = () => [
  ...new Set(catalog.map((p) => p.category))
];
var getBrands = () => [
  ...new Set(catalog.map((p) => p.brand))
];
var getProducts = ({
  search = "",
  category = "All",
  brands = [],
  price = "",
  ratings = [],
  availability = ""
} = {}) => {
  let list = [...catalog];
  if (category && category !== "All") {
    list = list.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }
  if (brands.length) {
    list = list.filter((p) => brands.includes(p.brand));
  }
  if (price) {
    if (price === "under500") list = list.filter((p) => p.price < 500);
    else if (price === "500-5000") list = list.filter((p) => p.price >= 500 && p.price <= 5e3);
    else if (price === "5000-20000") list = list.filter((p) => p.price > 5e3 && p.price <= 2e4);
    else if (price === "above20000") list = list.filter((p) => p.price > 2e4);
  }
  if (ratings.length) {
    list = list.filter((p) => p.rating >= Math.max(...ratings));
  }
  if (availability) {
    list = list.filter((p) => availability === "instock" ? p.inStock : !p.inStock);
  }
  return list.map(withOverride);
};
var getProductById = (id) => withOverride(catalog.find((p) => p.id === Number(id)));
var getGallery = (product) => [
  product.image,
  product.image,
  product.image
];
var getSpecifications = (product) => [
  ["Brand", product.brand],
  ["Model", product.name],
  ["Category", product.category],
  ["Color", "Black / Blue / White"],
  ["In The Box", "1 Product, Charging Cable, Documentation"],
  ["Warranty", "1 Year Manufacturer Warranty"],
  ["Country of Origin", "India"],
  ["Item Weight", "280 g"]
];
var getProductReviews = () => [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    date: "12 Jul 2026",
    title: "Excellent product",
    comment: "Amazing build quality and performance. Battery easily lasts a full day.",
    helpful: 124,
    verified: true
  },
  {
    id: 2,
    name: "Priya Patil",
    rating: 4,
    date: "28 Jun 2026",
    title: "Very good",
    comment: "Battery backup is amazing. Slightly heavy but worth the price.",
    helpful: 87,
    verified: true
  },
  {
    id: 3,
    name: "Amit Verma",
    rating: 5,
    date: "15 Jun 2026",
    title: "Worth every rupee",
    comment: "Smooth performance, great display and the camera is brilliant.",
    helpful: 56,
    verified: false
  }
];
var getSimilarProducts = (product) => {
  const similar = catalog.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand)
  );
  if (similar.length >= 4) return similar.slice(0, 4).map(withOverride);
  const rest = catalog.filter(
    (p) => p.id !== product.id && !similar.includes(p)
  );
  return [...similar, ...rest].slice(0, 4).map(withOverride);
};
var getBoughtTogether = (product) => {
  const bundleIds = product.category === "Electronics" ? [4, 6, 7] : [4, 6, 7];
  const bundle = bundleIds.map((id) => catalog.find((p) => p.id === id)).filter(Boolean);
  return [product, ...bundle].map(withOverride);
};

// css:C:\CustomerDashbord\src\components\RecommendedProducts\RecommendedProducts.css
collectCSS(`.recommended-section {
  margin-top: 35px;
}

.recommended-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;
}

.recommended-title {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #7c3aed;
}

.recommended-title h2 {
  font-family: Poppins, sans-serif;

  font-size: 21px;

  color: #111827;
}

.recommended-header p {
  color: #6b7280;

  font-size: 13px;

  margin-top: 5px;
}

.view-all-button {
  display: flex;
  align-items: center;
  gap: 6px;

  border: none;

  background: transparent;

  color: #4f46e5;

  font-weight: 600;

  cursor: pointer;
}

.recommended-grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 18px;
}

/* Laptop */

@media (max-width: 1200px) {
  .recommended-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet */

@media (max-width: 900px) {
  .recommended-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */

@media (max-width: 600px) {
  .recommended-header {
    align-items: flex-start;
  }

  .recommended-title h2 {
    font-size: 18px;
  }

  .recommended-grid {
    grid-template-columns: 1fr;
  }
}
`, "components/RecommendedProducts/RecommendedProducts.css");

// src/components/RecommendedProducts/RecommendedProducts.jsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function RecommendedProducts() {
  const navigate = useNavigate4();
  const recommendedProducts = getProducts().filter((product) => product.aiRecommended).slice(0, 4);
  return /* @__PURE__ */ jsxs6("section", { className: "recommended-section", children: [
    /* @__PURE__ */ jsxs6("div", { className: "recommended-header", children: [
      /* @__PURE__ */ jsxs6("div", { children: [
        /* @__PURE__ */ jsxs6("div", { className: "recommended-title", children: [
          /* @__PURE__ */ jsx6(Sparkles4, { size: 20 }),
          /* @__PURE__ */ jsx6("h2", { children: "Recommended For You" })
        ] }),
        /* @__PURE__ */ jsx6("p", { children: "Products selected based on your shopping behavior" })
      ] }),
      /* @__PURE__ */ jsxs6(
        "button",
        {
          className: "view-all-button",
          onClick: () => navigate("/products"),
          children: [
            "View All",
            /* @__PURE__ */ jsx6(ArrowRight2, { size: 16 })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "recommended-grid", children: recommendedProducts.map((product) => /* @__PURE__ */ jsx6(
      ProductCard,
      {
        product
      },
      product.id
    )) })
  ] });
}

// css:C:\CustomerDashbord\src\components\CustomerProfile\CustomerProfile.css
collectCSS(`.shopping-profile{
background:var(--card);
border:1px solid var(--border);
border-radius:18px;
padding:24px;
box-shadow:var(--shadow);
}

.sp-header{
display:flex;
align-items:center;
gap:10px;
margin-bottom:18px;
color:#7C3AED;
}

.sp-header h3{
font-family:Poppins;
font-size:18px;
font-weight:700;
color:var(--text);
}

.sp-list{
display:flex;
flex-direction:column;
gap:12px;
}

.sp-item{
display:flex;
align-items:center;
gap:14px;
background:#F8FAFC;
border-radius:12px;
padding:14px 16px;
transition:.25s;
}

.sp-item:hover{
background:#F5F3FF;
}

.sp-icon{
width:38px;
height:38px;
border-radius:11px;
background:#EDE9FE;
color:#7C3AED;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.sp-item small{
display:block;
font-size:12px;
color:var(--secondary);
margin-bottom:2px;
}

.sp-item strong{
font-size:14.5px;
font-weight:600;
}
`, "components/CustomerProfile/CustomerProfile.css");

// src/components/CustomerProfile/CustomerProfile.jsx
import {
  Crown,
  Layers,
  CalendarDays,
  IndianRupee,
  Gift as Gift3,
  Sparkles as Sparkles5
} from "lucide-react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var items = [
  { icon: /* @__PURE__ */ jsx7(Crown, { size: 18 }), label: "Customer Type", value: "Premium Customer" },
  { icon: /* @__PURE__ */ jsx7(Layers, { size: 18 }), label: "Favorite Category", value: "Electronics" },
  { icon: /* @__PURE__ */ jsx7(CalendarDays, { size: 18 }), label: "Shopping Frequency", value: "2x per week" },
  { icon: /* @__PURE__ */ jsx7(IndianRupee, { size: 18 }), label: "Average Order Value", value: "\u20B94,850" },
  { icon: /* @__PURE__ */ jsx7(Gift3, { size: 18 }), label: "Loyalty Points", value: "2,450 pts" }
];
function CustomerProfile() {
  return /* @__PURE__ */ jsxs7("div", { className: "shopping-profile", children: [
    /* @__PURE__ */ jsxs7("div", { className: "sp-header", children: [
      /* @__PURE__ */ jsx7(Sparkles5, { size: 18 }),
      /* @__PURE__ */ jsx7("h3", { children: "Your Shopping Profile" })
    ] }),
    /* @__PURE__ */ jsx7("div", { className: "sp-list", children: items.map((item, index) => /* @__PURE__ */ jsxs7("div", { className: "sp-item", children: [
      /* @__PURE__ */ jsx7("span", { className: "sp-icon", children: item.icon }),
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx7("small", { children: item.label }),
        /* @__PURE__ */ jsx7("strong", { children: item.value })
      ] })
    ] }, index)) })
  ] });
}

// css:C:\CustomerDashbord\src\components\TrendingCategories\TrendingCategories.css
collectCSS(`.trending{
margin-top:44px;
}

.title{
display:flex;
justify-content:space-between;
align-items:flex-end;
margin-bottom:24px;
}

.title h2{
font-size:22px;
font-family:Poppins;
font-weight:700;
}

.title p{
font-size:13px;
color:var(--secondary);
margin-top:4px;
}

.title button{
padding:10px 18px;
background:#fff;
color:#4F46E5;
border:1px solid var(--border);
border-radius:10px;
cursor:pointer;
font-weight:600;
transition:.25s;
}

.title button:hover{
background:#EEF2FF;
border-color:#4F46E5;
}

.category-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:22px;
}

@media(max-width:1200px){
.category-grid{
grid-template-columns:repeat(3,1fr);
}
}

@media(max-width:700px){
.category-grid{
grid-template-columns:repeat(2,1fr);
}
}
`, "components/TrendingCategories/TrendingCategories.css");

// src/components/CategoryCard/CategoryCard.jsx
import { useNavigate as useNavigate5 } from "react-router-dom";

// css:C:\CustomerDashbord\src\components\CategoryCard\CategoryCard.css
collectCSS(`.category-card{

background:#fff;

border-radius:18px;

padding:20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.08);

transition:.3s;

cursor:pointer;

}

.category-card:hover{

transform:translateY(-8px);

}

.category-image{

width:100px;

height:100px;

margin:auto;

border-radius:50%;

display:flex;

align-items:center;

justify-content:center;

margin-bottom:18px;

}

.category-image img{

width:65px;

height:65px;

object-fit:contain;

}

.category-card h3{

font-family:Poppins;

font-size:18px;

margin-bottom:6px;

}

.category-card p{

color:#6B7280;

font-size:14px;

}
`, "components/CategoryCard/CategoryCard.css");

// src/components/CategoryCard/CategoryCard.jsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function CategoryCard({ category }) {
  const navigate = useNavigate5();
  const handleClick = () => {
    navigate(`/category/${category.id}`);
  };
  return /* @__PURE__ */ jsxs8("div", { className: "category-card", onClick: handleClick, children: [
    /* @__PURE__ */ jsx8(
      "div",
      {
        className: "category-image",
        style: { background: category.color },
        children: category.image ? /* @__PURE__ */ jsx8("img", { src: category.image, alt: category.name }) : category.icon
      }
    ),
    /* @__PURE__ */ jsx8("h3", { children: category.name }),
    /* @__PURE__ */ jsxs8("p", { children: [
      category.items,
      " Products"
    ] })
  ] });
}

// src/components/TrendingCategories/TrendingCategories.jsx
import { BookOpen, Puzzle, Car } from "lucide-react";

// src/assets/categories/electronics.svg
var electronics_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">%0A  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23DBEAFE"/><stop offset="1" stop-color="%23BFDBFE"/></linearGradient></defs>%0A  <rect width="300" height="220" fill="url(%23g)"/>%0A  <circle cx="150" cy="98" r="58" fill="%23FFFFFF" opacity="0.8"/>%0A  <text x="150" y="130" font-size="60" text-anchor="middle">\u{1F50C}</text>%0A  <text x="150" y="188" font-size="19" font-family="Poppins, Arial" font-weight="600" fill="%232563EB" text-anchor="middle">Electronics</text>%0A</svg>%0A';

// src/assets/categories/fashion.svg
var fashion_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">%0A  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23FCE7F3"/><stop offset="1" stop-color="%23FBCFE8"/></linearGradient></defs>%0A  <rect width="300" height="220" fill="url(%23g)"/>%0A  <circle cx="150" cy="98" r="58" fill="%23FFFFFF" opacity="0.8"/>%0A  <text x="150" y="130" font-size="60" text-anchor="middle">\u{1F455}</text>%0A  <text x="150" y="188" font-size="19" font-family="Poppins, Arial" font-weight="600" fill="%23DB2777" text-anchor="middle">Fashion</text>%0A</svg>%0A';

// src/assets/categories/home.svg
var home_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">%0A  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23DCFCE7"/><stop offset="1" stop-color="%23BBF7D0"/></linearGradient></defs>%0A  <rect width="300" height="220" fill="url(%23g)"/>%0A  <circle cx="150" cy="98" r="58" fill="%23FFFFFF" opacity="0.8"/>%0A  <text x="150" y="130" font-size="60" text-anchor="middle">\u{1F3E0}</text>%0A  <text x="150" y="188" font-size="19" font-family="Poppins, Arial" font-weight="600" fill="%2316A34A" text-anchor="middle">Home</text>%0A</svg>%0A';

// src/assets/categories/beauty.svg
var beauty_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">%0A  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23FCE7F3"/><stop offset="1" stop-color="%23FBCFE8"/></linearGradient></defs>%0A  <rect width="300" height="220" fill="url(%23g)"/>%0A  <circle cx="150" cy="98" r="58" fill="%23FFFFFF" opacity="0.8"/>%0A  <text x="150" y="130" font-size="60" text-anchor="middle">\u{1F484}</text>%0A  <text x="150" y="188" font-size="19" font-family="Poppins, Arial" font-weight="600" fill="%23DB2777" text-anchor="middle">Beauty</text>%0A</svg>%0A';

// src/assets/categories/sports.svg
var sports_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220">%0A  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23FEF3C7"/><stop offset="1" stop-color="%23FDE68A"/></linearGradient></defs>%0A  <rect width="300" height="220" fill="url(%23g)"/>%0A  <circle cx="150" cy="98" r="58" fill="%23FFFFFF" opacity="0.8"/>%0A  <text x="150" y="130" font-size="60" text-anchor="middle">\u26BD</text>%0A  <text x="150" y="188" font-size="19" font-family="Poppins, Arial" font-weight="600" fill="%23D97706" text-anchor="middle">Sports</text>%0A</svg>%0A';

// src/components/TrendingCategories/TrendingCategories.jsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var categories = [
  {
    id: "electronics",
    name: "Electronics",
    items: 250,
    image: electronics_default,
    color: "#DBEAFE"
  },
  {
    id: "fashion",
    name: "Fashion",
    items: 180,
    image: fashion_default,
    color: "#FCE7F3"
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    items: 210,
    image: home_default,
    color: "#DCFCE7"
  },
  {
    id: "beauty",
    name: "Beauty",
    items: 95,
    image: beauty_default,
    color: "#FCE7F3"
  },
  {
    id: "sports",
    name: "Sports",
    items: 140,
    image: sports_default,
    color: "#FEF3C7"
  },
  {
    id: "books",
    name: "Books",
    items: 320,
    icon: /* @__PURE__ */ jsx9(BookOpen, { size: 34, color: "#7C3AED" }),
    color: "#EDE9FE"
  },
  {
    id: "toys-games",
    name: "Toys & Games",
    items: 110,
    icon: /* @__PURE__ */ jsx9(Puzzle, { size: 34, color: "#0F766E" }),
    color: "#CCFBF1"
  },
  {
    id: "automotive",
    name: "Automotive",
    items: 76,
    icon: /* @__PURE__ */ jsx9(Car, { size: 34, color: "#2563EB" }),
    color: "#E0F2FE"
  }
];
function TrendingCategories() {
  return /* @__PURE__ */ jsxs9("div", { className: "trending", children: [
    /* @__PURE__ */ jsxs9("div", { className: "title", children: [
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx9("h2", { children: "Trending Categories" }),
        /* @__PURE__ */ jsx9("p", { children: "Explore what's popular right now" })
      ] }),
      /* @__PURE__ */ jsx9("button", { children: "View All" })
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "category-grid", children: categories.map((item, index) => /* @__PURE__ */ jsx9(CategoryCard, { category: item }, index)) })
  ] });
}

// css:C:\CustomerDashbord\src\components\SpecialOffers\SpecialOffers.css
collectCSS(`.offers-section{
margin-top:44px;
scroll-margin-top:90px;
}

.section-title{
display:flex;
justify-content:space-between;
align-items:flex-end;
margin-bottom:22px;
}

.section-title h2{
font-size:22px;
font-family:Poppins;
font-weight:700;
}

.section-title p{
font-size:13px;
color:var(--secondary);
margin-top:4px;
}

.offers-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:18px;
}

.offer-card{
display:flex;
align-items:center;
gap:14px;
border:1px solid;
border-radius:18px;
padding:18px;
box-shadow:var(--shadow);
position:relative;
overflow:hidden;
transition:.3s;
cursor:pointer;
}

.offer-card:hover{
transform:translateY(-4px);
}

.offer-icon{
width:46px;
height:46px;
border-radius:13px;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.offer-body h3{
font-size:17px;
font-weight:700;
font-family:Poppins;
}

.offer-body p{
font-size:12.5px;
color:var(--secondary);
margin-top:2px;
}

.offer-code{
position:absolute;
top:12px;
right:12px;
font-size:10.5px;
font-weight:700;
letter-spacing:.6px;
background:rgba(255,255,255,.75);
color:var(--text);
border:1px dashed #94A3B8;
padding:3px 8px;
border-radius:6px;
display:flex;
align-items:center;
gap:4px;
}

@media(max-width:1200px){
.offers-grid{
grid-template-columns:repeat(2,1fr);
}
}

@media(max-width:600px){
.offers-grid{
grid-template-columns:1fr;
}
}
`, "components/SpecialOffers/SpecialOffers.css");

// src/components/SpecialOffers/SpecialOffers.jsx
import {
  BadgePercent as BadgePercent3,
  Truck as Truck2,
  Gift as Gift4,
  CreditCard,
  Sparkles as Sparkles6
} from "lucide-react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var offers = [
  {
    title: "20% OFF",
    subtitle: "On All Accessories",
    code: "ACCESS20",
    icon: /* @__PURE__ */ jsx10(BadgePercent3, { size: 22 }),
    color: "#2563EB",
    bg: "#DBEAFE",
    light: "#EFF6FF"
  },
  {
    title: "Free Shipping",
    subtitle: "On Orders Above \u20B9999",
    icon: /* @__PURE__ */ jsx10(Truck2, { size: 22 }),
    color: "#16A34A",
    bg: "#DCFCE7",
    light: "#F0FDF4"
  },
  {
    title: "Loyalty Bonus",
    subtitle: "Earn 500 Extra Points",
    icon: /* @__PURE__ */ jsx10(Gift4, { size: 22 }),
    color: "#F59E0B",
    bg: "#FEF3C7",
    light: "#FFFBEB"
  },
  {
    title: "Bank Offer",
    subtitle: "10% Instant Discount",
    icon: /* @__PURE__ */ jsx10(CreditCard, { size: 22 }),
    color: "#EC4899",
    bg: "#FCE7F3",
    light: "#FDF2F8"
  }
];
function SpecialOffers() {
  return /* @__PURE__ */ jsxs10("div", { className: "offers-section", id: "offers", children: [
    /* @__PURE__ */ jsx10("div", { className: "section-title", children: /* @__PURE__ */ jsxs10("div", { children: [
      /* @__PURE__ */ jsx10("h2", { children: "Personalized Offers" }),
      /* @__PURE__ */ jsx10("p", { children: "Exclusive deals tailored just for you" })
    ] }) }),
    /* @__PURE__ */ jsx10("div", { className: "offers-grid", children: offers.map((offer, index) => /* @__PURE__ */ jsxs10(
      "div",
      {
        className: "offer-card",
        style: { background: offer.light, borderColor: offer.bg },
        children: [
          /* @__PURE__ */ jsx10("div", { className: "offer-icon", style: { background: offer.bg, color: offer.color }, children: offer.icon }),
          /* @__PURE__ */ jsxs10("div", { className: "offer-body", children: [
            /* @__PURE__ */ jsx10("h3", { style: { color: offer.color }, children: offer.title }),
            /* @__PURE__ */ jsx10("p", { children: offer.subtitle })
          ] }),
          offer.code && /* @__PURE__ */ jsxs10("span", { className: "offer-code", children: [
            /* @__PURE__ */ jsx10(Sparkles6, { size: 12 }),
            offer.code
          ] })
        ]
      },
      index
    )) })
  ] });
}

// css:C:\CustomerDashbord\src\components\AIRecommendations\AIRecommendations.css
collectCSS(`.ai-recs{
margin-top:44px;
scroll-margin-top:90px;
}

.ai-recs-header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:22px;
}

.ai-title{
display:flex;
align-items:center;
gap:12px;
}

.ai-badge-ic{
width:46px;
height:46px;
border-radius:13px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
display:flex;
align-items:center;
justify-content:center;
box-shadow:0 8px 20px rgba(124,58,237,.35);
}

.ai-title h2{
font-size:22px;
font-family:Poppins;
font-weight:700;
}

.ai-title p{
font-size:13px;
color:var(--secondary);
margin-top:3px;
}

.ai-recs-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:20px;
}

.ai-recs-card{
background:#fff;
border:1px solid #E9D5FF;
border-radius:18px;
padding:18px;
box-shadow:var(--shadow);
position:relative;
transition:.3s;
}

.ai-recs-card:hover{
transform:translateY(-6px);
box-shadow:0 18px 40px rgba(124,58,237,.14);
}

.ai-pick{
position:absolute;
top:14px;
left:14px;
background:#7C3AED;
color:#fff;
padding:5px 10px;
border-radius:20px;
font-size:11px;
font-weight:700;
z-index:2;
box-shadow:0 6px 14px rgba(124,58,237,.4);
}

.ai-recs-img{
background:radial-gradient(circle at 30% 30%,#F5F3FF,#EEF2FF);
border-radius:12px;
display:flex;
align-items:center;
justify-content:center;
height:170px;
overflow:hidden;
}

.ai-recs-img img{
height:150px;
object-fit:contain;
transition:.4s;
}

.ai-recs-card:hover .ai-recs-img img{
transform:scale(1.07);
}

.ai-recs-card h3{
font-size:16px;
font-family:Poppins;
margin-top:14px;
margin-bottom:8px;
}

.ai-reason{
display:flex;
align-items:flex-start;
gap:6px;
font-size:12.5px;
color:#7C3AED;
background:#F5F3FF;
border-radius:10px;
padding:8px 10px;
line-height:1.5;
min-height:52px;
}

.ai-recs-meta{
display:flex;
justify-content:space-between;
align-items:center;
margin:12px 0;
}

.ai-rating{
display:flex;
align-items:center;
gap:5px;
font-weight:600;
font-size:13px;
}

.ai-price{
font-size:19px;
font-weight:700;
color:#7C3AED;
font-family:Poppins;
}

.ai-recs-card button{
width:100%;
padding:11px;
border:none;
border-radius:12px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
font-size:14px;
font-weight:600;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
cursor:pointer;
transition:.3s;
}

.ai-recs-card button:hover{
opacity:.9;
transform:translateY(-2px);
}

@media(max-width:1200px){
.ai-recs-grid{
grid-template-columns:repeat(2,1fr);
}
}

@media(max-width:600px){
.ai-recs-grid{
grid-template-columns:1fr;
}
}
`, "components/AIRecommendations/AIRecommendations.css");

// src/components/AIRecommendations/AIRecommendations.jsx
import { Sparkles as Sparkles7, Star as Star2, ShoppingCart as ShoppingCart5, BrainCircuit as BrainCircuit2 } from "lucide-react";
import { useState as useState3 } from "react";
import { Fragment as Fragment2, jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var fmt = (n) => n.toLocaleString("en-IN");
var picks = [
  { id: 4, reason: "Because you browsed laptops 5 times this week" },
  { id: 3, reason: "Matches items in your headphone wishlist" },
  { id: 1, reason: "You viewed iPhones recently" },
  { id: 15, reason: "Popular among Premium customers" }
];
var items2 = picks.map((pick) => {
  const product = getProductById(pick.id);
  return product ? { ...product, reason: pick.reason } : null;
}).filter(Boolean);
function AIRecommendations() {
  const [added, setAdded] = useState3({});
  const handleAdd = (item) => {
    addToCart(item);
    setAdded((s) => ({ ...s, [item.id]: true }));
    setTimeout(() => setAdded((s) => ({ ...s, [item.id]: false })), 1500);
  };
  return /* @__PURE__ */ jsxs11("div", { className: "ai-recs", id: "ai-recommendations", children: [
    /* @__PURE__ */ jsx11("div", { className: "ai-recs-header", children: /* @__PURE__ */ jsxs11("div", { className: "ai-title", children: [
      /* @__PURE__ */ jsx11("span", { className: "ai-badge-ic", children: /* @__PURE__ */ jsx11(BrainCircuit2, { size: 20 }) }),
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx11("h2", { children: "AI Recommendations For You" }),
        /* @__PURE__ */ jsx11("p", { children: "Personalized products selected based on your behavior." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx11("div", { className: "ai-recs-grid", children: items2.map((item) => /* @__PURE__ */ jsxs11("div", { className: "ai-recs-card", children: [
      /* @__PURE__ */ jsx11("span", { className: "ai-pick", children: "\u{1F916} AI Pick" }),
      /* @__PURE__ */ jsx11("div", { className: "ai-recs-img", children: /* @__PURE__ */ jsx11("img", { src: item.image, alt: item.name }) }),
      /* @__PURE__ */ jsx11("h3", { children: item.name }),
      /* @__PURE__ */ jsxs11("p", { className: "ai-reason", children: [
        /* @__PURE__ */ jsx11(Sparkles7, { size: 14 }),
        item.reason
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "ai-recs-meta", children: [
        /* @__PURE__ */ jsxs11("span", { className: "ai-rating", children: [
          /* @__PURE__ */ jsx11(Star2, { size: 14, fill: "#F59E0B", color: "#F59E0B" }),
          item.rating
        ] }),
        /* @__PURE__ */ jsxs11("span", { className: "ai-price", children: [
          "\u20B9",
          fmt(item.price)
        ] })
      ] }),
      /* @__PURE__ */ jsx11("button", { onClick: () => handleAdd(item), children: added[item.id] ? "\u2713 Added" : /* @__PURE__ */ jsxs11(Fragment2, { children: [
        /* @__PURE__ */ jsx11(ShoppingCart5, { size: 16 }),
        "Add to Cart"
      ] }) })
    ] }, item.id)) })
  ] });
}

// css:C:\CustomerDashbord\src\components\RecentOrders\RecentOrders.css
collectCSS(`.orders-card{
margin-top:44px;
background:white;
padding:24px;
border-radius:18px;
border:1px solid var(--border);
box-shadow:var(--shadow);
}

.orders-head{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:18px;
}

.orders-head h2{
font-family:Poppins;
font-size:20px;
font-weight:700;
}

.orders-head button{
padding:9px 16px;
border:1px solid var(--border);
background:#fff;
color:#4F46E5;
border-radius:10px;
cursor:pointer;
font-weight:600;
font-size:13.5px;
transition:.25s;
}

.orders-head button:hover{
background:#EEF2FF;
border-color:#4F46E5;
}

.orders-table-wrap{
overflow-x:auto;
}

table{
width:100%;
border-collapse:collapse;
}

th{
text-align:left;
padding:13px 15px;
background:#F8FAFC;
font-size:13px;
font-weight:600;
color:var(--secondary);
text-transform:uppercase;
letter-spacing:.4px;
}

td{
padding:14px 15px;
border-bottom:1px solid var(--border);
font-size:14.5px;
}

tr:last-child td{
border-bottom:none;
}

.order-id{
font-weight:600;
color:#4F46E5;
}

.amount{
font-weight:600;
}

.badge{
display:inline-block;
padding:5px 12px;
border-radius:20px;
font-size:12.5px;
font-weight:600;
}

.badge.delivered{
background:#DCFCE7;
color:#16A34A;
}

.badge.shipped{
background:#DBEAFE;
color:#2563EB;
}

.badge.pending{
background:#FEF3C7;
color:#F59E0B;
}

.badge.cancelled{
background:#FEE2E2;
color:#EF4444;
}
`, "components/RecentOrders/RecentOrders.css");

// src/components/RecentOrders/RecentOrders.jsx
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var orders = [
  {
    id: "#ORD1201",
    product: "Apple iPhone 15",
    amount: "\u20B969,999",
    status: "Delivered",
    date: "02 Aug 2026"
  },
  {
    id: "#ORD1202",
    product: "Sony WH-1000XM5",
    amount: "\u20B929,999",
    status: "Shipped",
    date: "04 Aug 2026"
  },
  {
    id: "#ORD1203",
    product: "Nike Air Max 270",
    amount: "\u20B95,999",
    status: "Pending",
    date: "06 Aug 2026"
  },
  {
    id: "#ORD1204",
    product: "boAt Wave Sigma 3",
    amount: "\u20B91,299",
    status: "Cancelled",
    date: "28 Jul 2026"
  }
];
function RecentOrders() {
  return /* @__PURE__ */ jsxs12("div", { className: "orders-card", children: [
    /* @__PURE__ */ jsxs12("div", { className: "orders-head", children: [
      /* @__PURE__ */ jsx12("h2", { children: "Recent Orders" }),
      /* @__PURE__ */ jsx12("button", { children: "View All Orders" })
    ] }),
    /* @__PURE__ */ jsx12("div", { className: "orders-table-wrap", children: /* @__PURE__ */ jsxs12("table", { children: [
      /* @__PURE__ */ jsx12("thead", { children: /* @__PURE__ */ jsxs12("tr", { children: [
        /* @__PURE__ */ jsx12("th", { children: "Order ID" }),
        /* @__PURE__ */ jsx12("th", { children: "Product" }),
        /* @__PURE__ */ jsx12("th", { children: "Amount" }),
        /* @__PURE__ */ jsx12("th", { children: "Status" }),
        /* @__PURE__ */ jsx12("th", { children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsx12("tbody", { children: orders.map((item, index) => /* @__PURE__ */ jsxs12("tr", { children: [
        /* @__PURE__ */ jsx12("td", { className: "order-id", children: item.id }),
        /* @__PURE__ */ jsx12("td", { children: item.product }),
        /* @__PURE__ */ jsx12("td", { className: "amount", children: item.amount }),
        /* @__PURE__ */ jsx12("td", { children: /* @__PURE__ */ jsx12("span", { className: `badge ${item.status.toLowerCase()}`, children: item.status }) }),
        /* @__PURE__ */ jsx12("td", { children: item.date })
      ] }, index)) })
    ] }) })
  ] });
}

// css:C:\CustomerDashbord\src\components\NotificationPanel\NotificationPanel.css
collectCSS(`.notification-card{
background:white;
padding:24px;
border-radius:18px;
border:1px solid var(--border);
box-shadow:var(--shadow);
scroll-margin-top:90px;
}

.notif-head{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:16px;
}

.notif-head h2{
display:flex;
align-items:center;
gap:10px;
font-family:Poppins;
font-size:18px;
font-weight:700;
color:#4F46E5;
}

.notif-badge{
background:#EF4444;
color:#fff;
font-size:11px;
font-weight:700;
padding:4px 10px;
border-radius:20px;
}

.notification-card ul{
list-style:none;
display:flex;
flex-direction:column;
gap:12px;
}

.notification-card li{
display:flex;
align-items:flex-start;
gap:12px;
padding:12px;
border-radius:12px;
background:#F8FAFC;
transition:.25s;
}

.notification-card li:hover{
background:#F5F3FF;
transform:translateX(3px);
}

.notif-icon{
width:38px;
height:38px;
border-radius:11px;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.notification-card li strong{
font-size:14px;
display:block;
}

.notification-card li p{
font-size:12.5px;
color:var(--secondary);
margin-top:2px;
line-height:1.4;
}
`, "components/NotificationPanel/NotificationPanel.css");

// src/components/NotificationPanel/NotificationPanel.jsx
import { Bell as Bell3, Package as Package3, BadgePercent as BadgePercent4, Sparkles as Sparkles8, Gift as Gift5 } from "lucide-react";
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
var notifications = [
  {
    title: "Order Updates",
    desc: "Your iPhone 15 has been shipped",
    icon: /* @__PURE__ */ jsx13(Package3, { size: 18 }),
    color: "#2563EB",
    bg: "#DBEAFE"
  },
  {
    title: "Personalized Offers",
    desc: "20% OFF on accessories \u2014 code ACCESS20",
    icon: /* @__PURE__ */ jsx13(BadgePercent4, { size: 18 }),
    color: "#16A34A",
    bg: "#DCFCE7"
  },
  {
    title: "AI Recommendations",
    desc: "3 new products matched for you",
    icon: /* @__PURE__ */ jsx13(Sparkles8, { size: 18 }),
    color: "#7C3AED",
    bg: "#EDE9FE"
  },
  {
    title: "Loyalty Rewards",
    desc: "You earned 500 bonus points",
    icon: /* @__PURE__ */ jsx13(Gift5, { size: 18 }),
    color: "#F59E0B",
    bg: "#FEF3C7"
  }
];
function NotificationPanel() {
  return /* @__PURE__ */ jsxs13("div", { className: "notification-card", id: "notifications", children: [
    /* @__PURE__ */ jsxs13("div", { className: "notif-head", children: [
      /* @__PURE__ */ jsxs13("h2", { children: [
        /* @__PURE__ */ jsx13(Bell3, { size: 20 }),
        "Notifications"
      ] }),
      /* @__PURE__ */ jsx13("span", { className: "notif-badge", children: "4 New" })
    ] }),
    /* @__PURE__ */ jsx13("ul", { children: notifications.map((n, index) => /* @__PURE__ */ jsxs13("li", { children: [
      /* @__PURE__ */ jsx13("span", { className: "notif-icon", style: { background: n.bg, color: n.color }, children: n.icon }),
      /* @__PURE__ */ jsxs13("div", { children: [
        /* @__PURE__ */ jsx13("strong", { children: n.title }),
        /* @__PURE__ */ jsx13("p", { children: n.desc })
      ] })
    ] }, index)) })
  ] });
}

// css:C:\CustomerDashbord\src\components\LoyaltyCard\LoyaltyCard.css
collectCSS(`.loyalty-card{
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:white;
padding:26px;
border-radius:18px;
box-shadow:0 14px 35px rgba(79,70,229,.35);
position:relative;
overflow:hidden;
scroll-margin-top:90px;
}

.loyalty-card::after{
content:"";
position:absolute;
width:180px;
height:180px;
border-radius:50%;
background:rgba(255,255,255,.12);
top:-70px;
right:-50px;
}

.loyalty-card::before{
content:"";
position:absolute;
width:130px;
height:130px;
border-radius:50%;
background:rgba(255,255,255,.09);
bottom:-55px;
left:-30px;
}

.lc-top{
display:flex;
align-items:center;
gap:8px;
font-size:13px;
font-weight:600;
opacity:.95;
position:relative;
z-index:1;
}

.lc-points{
display:flex;
flex-direction:column;
align-items:center;
margin:18px 0;
position:relative;
z-index:1;
}

.lc-star{
font-size:30px;
margin-bottom:6px;
}

.lc-points strong{
font-size:44px;
font-family:Poppins;
font-weight:800;
line-height:1;
}

.lc-points > span:last-child{
font-size:13px;
opacity:.9;
margin-top:6px;
}

.loyalty-card button{
margin-top:6px;
padding:12px;
width:100%;
border:none;
border-radius:12px;
background:white;
color:#4F46E5;
font-weight:700;
font-size:15px;
cursor:pointer;
transition:.3s;
position:relative;
z-index:1;
}

.loyalty-card button:hover{
transform:translateY(-2px);
box-shadow:0 10px 25px rgba(0,0,0,.2);
}
`, "components/LoyaltyCard/LoyaltyCard.css");

// src/components/LoyaltyCard/LoyaltyCard.jsx
import { Sparkles as Sparkles9 } from "lucide-react";
import { jsx as jsx14, jsxs as jsxs14 } from "react/jsx-runtime";
function LoyaltyCard() {
  return /* @__PURE__ */ jsxs14("div", { className: "loyalty-card", id: "loyalty", children: [
    /* @__PURE__ */ jsxs14("div", { className: "lc-top", children: [
      /* @__PURE__ */ jsx14(Sparkles9, { size: 20 }),
      /* @__PURE__ */ jsx14("span", { children: "ClusterMind Rewards" })
    ] }),
    /* @__PURE__ */ jsxs14("div", { className: "lc-points", children: [
      /* @__PURE__ */ jsx14("span", { className: "lc-star", children: "\u2B50" }),
      /* @__PURE__ */ jsx14("strong", { children: "2,450" }),
      /* @__PURE__ */ jsx14("span", { children: "Available Points" })
    ] }),
    /* @__PURE__ */ jsx14("button", { children: "Redeem Now" })
  ] });
}

// css:C:\CustomerDashbord\src\components\AnalyticsChart\AnalyticsChart.css
collectCSS(`.analytics-card{
background:white;
padding:24px;
border-radius:18px;
border:1px solid var(--border);
box-shadow:var(--shadow);
}

.analytics-card h2{
font-family:Poppins;
font-size:20px;
font-weight:700;
}

.analytics-card > p{
font-size:13px;
color:var(--secondary);
margin-top:4px;
margin-bottom:18px;
}

.chart-block{
margin-top:18px;
padding:18px;
border:1px solid var(--border);
border-radius:14px;
background:#FCFCFD;
}

.chart-block h3{
font-size:15px;
font-family:Poppins;
font-weight:600;
margin-bottom:14px;
color:#374151;
}

.chart-block + .chart-block{
margin-top:16px;
}
`, "components/AnalyticsChart/AnalyticsChart.css");

// src/components/AnalyticsChart/AnalyticsChart.jsx
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { jsx as jsx15, jsxs as jsxs15 } from "react/jsx-runtime";
var spending = [
  { month: "Jan", spending: 12e3, orders: 2 },
  { month: "Feb", spending: 18e3, orders: 3 },
  { month: "Mar", spending: 15e3, orders: 2 },
  { month: "Apr", spending: 25e3, orders: 4 },
  { month: "May", spending: 3e4, orders: 5 },
  { month: "Jun", spending: 42e3, orders: 6 }
];
var engagement = [
  { week: "W1", wishlist: 4, aiClicks: 8 },
  { week: "W2", wishlist: 6, aiClicks: 14 },
  { week: "W3", wishlist: 5, aiClicks: 20 },
  { week: "W4", wishlist: 9, aiClicks: 26 }
];
function AnalyticsChart() {
  return /* @__PURE__ */ jsxs15("div", { className: "analytics-card", children: [
    /* @__PURE__ */ jsx15("h2", { children: "Shopping Analytics" }),
    /* @__PURE__ */ jsx15("p", { children: "Your activity over the last 6 months" }),
    /* @__PURE__ */ jsxs15("div", { className: "chart-block", children: [
      /* @__PURE__ */ jsx15("h3", { children: "Monthly Spending" }),
      /* @__PURE__ */ jsx15(ResponsiveContainer, { width: "100%", height: 230, children: /* @__PURE__ */ jsxs15(AreaChart, { data: spending, children: [
        /* @__PURE__ */ jsx15("defs", { children: /* @__PURE__ */ jsxs15("linearGradient", { id: "spendGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx15("stop", { offset: "0%", stopColor: "#4F46E5", stopOpacity: 0.35 }),
          /* @__PURE__ */ jsx15("stop", { offset: "100%", stopColor: "#4F46E5", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx15(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
        /* @__PURE__ */ jsx15(XAxis, { dataKey: "month", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx15(YAxis, { tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx15(Tooltip, {}),
        /* @__PURE__ */ jsx15(
          Area,
          {
            type: "monotone",
            dataKey: "spending",
            name: "Spending (\u20B9)",
            stroke: "#4F46E5",
            strokeWidth: 3,
            fill: "url(#spendGrad)"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "chart-block", children: [
      /* @__PURE__ */ jsx15("h3", { children: "Orders" }),
      /* @__PURE__ */ jsx15(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxs15(LineChart, { data: spending, children: [
        /* @__PURE__ */ jsx15(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
        /* @__PURE__ */ jsx15(XAxis, { dataKey: "month", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx15(YAxis, { tick: { fontSize: 12 }, allowDecimals: false }),
        /* @__PURE__ */ jsx15(Tooltip, {}),
        /* @__PURE__ */ jsx15(
          Line,
          {
            type: "monotone",
            dataKey: "orders",
            name: "Orders",
            stroke: "#22C55E",
            strokeWidth: 3,
            dot: { r: 4 }
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "chart-block", children: [
      /* @__PURE__ */ jsx15("h3", { children: "Wishlist & AI Engagement" }),
      /* @__PURE__ */ jsx15(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxs15(BarChart, { data: engagement, children: [
        /* @__PURE__ */ jsx15(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
        /* @__PURE__ */ jsx15(XAxis, { dataKey: "week", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx15(YAxis, { tick: { fontSize: 12 }, allowDecimals: false }),
        /* @__PURE__ */ jsx15(Tooltip, {}),
        /* @__PURE__ */ jsx15(Legend, {}),
        /* @__PURE__ */ jsx15(Bar, { dataKey: "wishlist", name: "Wishlist Activity", fill: "#F59E0B", radius: [6, 6, 0, 0] }),
        /* @__PURE__ */ jsx15(Bar, { dataKey: "aiClicks", name: "AI Recommendation", fill: "#7C3AED", radius: [6, 6, 0, 0] })
      ] }) })
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\pages\Home.css
collectCSS(`.home-main{
margin-left:260px;
min-height:100vh;
}

.home-content{
padding:24px 30px 40px;
max-width:1280px;
margin:0 auto;
}

.recs-row{
display:grid;
grid-template-columns:1fr 320px;
gap:24px;
margin-top:8px;
}

.recs-row .recommended-section{
margin-top:32px;
}

.recs-row .shopping-profile{
margin-top:32px;
}

.bottom-grid{
display:grid;
grid-template-columns:340px 1fr;
gap:24px;
margin-top:44px;
}

.bottom-left{
display:flex;
flex-direction:column;
gap:24px;
}

@media(max-width:1200px){
.recs-row{
grid-template-columns:1fr;
}

.bottom-grid{
grid-template-columns:1fr;
}
}

@media(max-width:1024px){
.home-main{
margin-left:0;
}
}

@media(max-width:600px){
.home-content{
padding:16px;
}
}
`, "pages/Home.css");

// src/pages/Home.jsx
import { Fragment as Fragment3, jsx as jsx16, jsxs as jsxs16 } from "react/jsx-runtime";
function Home() {
  const location = useLocation2();
  const [sidebarOpen, setSidebarOpen] = useState4(false);
  useEffect2(() => {
    const scrollToId = location.state?.scrollTo;
    if (scrollToId) {
      const id = setTimeout(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(id);
    }
  }, [location.state]);
  useEffect2(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);
  return /* @__PURE__ */ jsxs16(Fragment3, { children: [
    /* @__PURE__ */ jsx16(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs16("div", { className: "home-main", children: [
      /* @__PURE__ */ jsx16(Navbar, { onToggleSidebar: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsxs16("div", { className: "home-content", children: [
        /* @__PURE__ */ jsx16(HeroBanner, {}),
        /* @__PURE__ */ jsx16(StatsCards, {}),
        /* @__PURE__ */ jsxs16("div", { className: "recs-row", children: [
          /* @__PURE__ */ jsx16(RecommendedProducts, {}),
          /* @__PURE__ */ jsx16(CustomerProfile, {})
        ] }),
        /* @__PURE__ */ jsx16(TrendingCategories, {}),
        /* @__PURE__ */ jsx16(SpecialOffers, {}),
        /* @__PURE__ */ jsx16(AIRecommendations, {}),
        /* @__PURE__ */ jsx16(RecentOrders, {}),
        /* @__PURE__ */ jsxs16("div", { className: "bottom-grid", children: [
          /* @__PURE__ */ jsxs16("div", { className: "bottom-left", children: [
            /* @__PURE__ */ jsx16(NotificationPanel, {}),
            /* @__PURE__ */ jsx16(LoyaltyCard, {})
          ] }),
          /* @__PURE__ */ jsx16(AnalyticsChart, {})
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Products/Products.jsx
import { useMemo, useState as useState6 } from "react";
import { SlidersHorizontal, X as X2 } from "lucide-react";

// css:C:\CustomerDashbord\src\components\CategoryList\CategoryList.css
collectCSS(`.category-list{

display:flex;

gap:12px;

flex-wrap:wrap;

margin-bottom:25px;

}

.category-chip{

display:flex;

align-items:center;

gap:8px;

padding:10px 18px;

background:#fff;

border:1px solid #E2E8F0;

border-radius:50px;

font-size:14px;

font-weight:600;

cursor:pointer;

transition:.3s;

}

.category-chip:hover{

border-color:#4F46E5;

color:#4F46E5;

}

.category-chip.active{

background:#4F46E5;

border-color:#4F46E5;

color:white;

}
`, "components/CategoryList/CategoryList.css");

// src/components/CategoryList/CategoryList.jsx
import { jsx as jsx17, jsxs as jsxs17 } from "react/jsx-runtime";
var categoryIcons = {
  Electronics: "\u26A1",
  Fashion: "\u{1F455}",
  Grocery: "\u{1F6D2}",
  Beauty: "\u{1F484}",
  Shoes: "\u{1F45F}",
  Laptop: "\u{1F4BB}"
};
function CategoryList({ categories: categories2, selected, onSelect }) {
  return /* @__PURE__ */ jsxs17("div", { className: "category-list", children: [
    /* @__PURE__ */ jsx17(
      "button",
      {
        className: `category-chip ${selected === "All" ? "active" : ""}`,
        onClick: () => onSelect("All"),
        children: "\u{1F3F7}\uFE0F All"
      }
    ),
    categories2.map((category) => /* @__PURE__ */ jsxs17(
      "button",
      {
        className: `category-chip ${selected === category ? "active" : ""}`,
        onClick: () => onSelect(category),
        children: [
          categoryIcons[category] || "\u{1F6CD}\uFE0F",
          " ",
          category
        ]
      },
      category
    ))
  ] });
}

// src/components/ProductSearch/ProductSearch.jsx
import { useState as useState5 } from "react";
import { Search as Search3 } from "lucide-react";

// css:C:\CustomerDashbord\src\components\ProductSearch\ProductSearch.css
collectCSS(`.product-search{

margin-bottom:25px;

}

.product-search .search-box{

display:flex;

align-items:center;

background:#fff;

border:1px solid #E2E8F0;

border-radius:12px;

padding:0 15px;

box-shadow:0 4px 12px rgba(0,0,0,.04);

}

.product-search .search-icon{

color:#6B7280;

}

.product-search input{

flex:1;

padding:14px 12px;

border:none;

outline:none;

background:none;

font-size:15px;

}

.clear-btn{

border:none;

background:#E2E8F0;

color:#6B7280;

width:28px;

height:28px;

border-radius:50%;

cursor:pointer;

font-size:13px;

}

.clear-btn:hover{

background:#4F46E5;

color:white;

}
`, "components/ProductSearch/ProductSearch.css");

// src/components/ProductSearch/ProductSearch.jsx
import { jsx as jsx18, jsxs as jsxs18 } from "react/jsx-runtime";
function ProductSearch({ value, onChange, onClear }) {
  const [query, setQuery] = useState5("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(query);
  };
  const handleReset = () => {
    setQuery("");
    onClear();
  };
  return /* @__PURE__ */ jsx18("form", { className: "product-search", onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs18("div", { className: "search-box", children: [
    /* @__PURE__ */ jsx18(Search3, { size: 18, className: "search-icon" }),
    /* @__PURE__ */ jsx18(
      "input",
      {
        type: "text",
        placeholder: "Search products, brands and more...",
        value: query,
        onChange: (e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }
      }
    ),
    (query || value) && /* @__PURE__ */ jsx18("button", { type: "button", className: "clear-btn", onClick: handleReset, children: "\u2715" })
  ] }) });
}

// css:C:\CustomerDashbord\src\components\ProductFilter\ProductFilter.css
collectCSS(`.filter-panel{

background:#fff;

padding:20px;

border-radius:18px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

position:sticky;

top:20px;

}

.filter-header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:15px;

}

.filter-header h3{

font-family:Poppins;

font-size:20px;

}

.clear-filters{

border:none;

background:none;

color:#4F46E5;

font-size:13px;

font-weight:600;

cursor:pointer;

}

.filter-group{

margin-bottom:20px;

}

.filter-group h4{

font-size:15px;

margin-bottom:10px;

color:#111827;

}

.filter-option{

display:flex;

align-items:center;

gap:10px;

padding:7px 0;

font-size:14px;

cursor:pointer;

color:#374151;

}

.filter-option input{

accent-color:#4F46E5;

width:15px;

height:15px;

cursor:pointer;

}

.filter-option .stars{

color:#F59E0B;

letter-spacing:2px;

font-size:13px;
}
`, "components/ProductFilter/ProductFilter.css");

// src/components/ProductFilter/ProductFilter.jsx
import { jsx as jsx19, jsxs as jsxs19 } from "react/jsx-runtime";
var priceRanges = [
  { value: "under500", label: "Under \u20B9500" },
  { value: "500-5000", label: "\u20B9500 - \u20B95,000" },
  { value: "5000-20000", label: "\u20B95,000 - \u20B920,000" },
  { value: "above20000", label: "Above \u20B920,000" }
];
function ProductFilter({ brands, filters, onFilterChange, onClear }) {
  const toggleBrand = (brand) => {
    const brandsList = filters.brands.includes(brand) ? filters.brands.filter((b) => b !== brand) : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: brandsList });
  };
  const toggleRating = (rating) => {
    const ratings = filters.ratings.includes(rating) ? filters.ratings.filter((r) => r !== rating) : [...filters.ratings, rating];
    onFilterChange({ ...filters, ratings });
  };
  return /* @__PURE__ */ jsxs19("div", { className: "filter-panel", children: [
    /* @__PURE__ */ jsxs19("div", { className: "filter-header", children: [
      /* @__PURE__ */ jsx19("h3", { children: "Filters" }),
      /* @__PURE__ */ jsx19("button", { className: "clear-filters", onClick: onClear, children: "Clear All" })
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx19("h4", { children: "Brand" }),
      brands.map((brand) => /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "checkbox",
            checked: filters.brands.includes(brand),
            onChange: () => toggleBrand(brand)
          }
        ),
        brand
      ] }, brand))
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx19("h4", { children: "Price" }),
      priceRanges.map((range) => /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "radio",
            name: "price",
            checked: filters.price === range.value,
            onChange: () => onFilterChange({ ...filters, price: range.value })
          }
        ),
        range.label
      ] }, range.value))
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx19("h4", { children: "Rating" }),
      /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "checkbox",
            checked: filters.ratings.includes(4),
            onChange: () => toggleRating(4)
          }
        ),
        /* @__PURE__ */ jsx19("span", { className: "stars", children: "\u2605\u2605\u2605\u2605\u2605" }),
        " 4+"
      ] }),
      /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "checkbox",
            checked: filters.ratings.includes(3),
            onChange: () => toggleRating(3)
          }
        ),
        /* @__PURE__ */ jsx19("span", { className: "stars", children: "\u2605\u2605\u2605\u2606\u2606" }),
        " 3+"
      ] })
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "filter-group", children: [
      /* @__PURE__ */ jsx19("h4", { children: "Availability" }),
      /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "radio",
            name: "availability",
            checked: filters.availability === "instock",
            onChange: () => onFilterChange({ ...filters, availability: "instock" })
          }
        ),
        "In Stock"
      ] }),
      /* @__PURE__ */ jsxs19("label", { className: "filter-option", children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            type: "radio",
            name: "availability",
            checked: filters.availability === "outofstock",
            onChange: () => onFilterChange({ ...filters, availability: "outofstock" })
          }
        ),
        "Out of Stock"
      ] })
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\components\ProductGrid\ProductGrid.css
collectCSS(`.products-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

}

@media(max-width:1200px){

.products-grid{

grid-template-columns:repeat(2,1fr);

}

}

@media(max-width:600px){

.products-grid{

grid-template-columns:1fr;

}

}

.empty-state{

background:#fff;

border-radius:18px;

padding:60px 20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.06);

}

.empty-state h3{

font-family:Poppins;

margin-bottom:8px;

}

.empty-state p{

color:#6B7280;
}
`, "components/ProductGrid/ProductGrid.css");

// src/components/ProductGrid/ProductGrid.jsx
import { jsx as jsx20, jsxs as jsxs20 } from "react/jsx-runtime";
function ProductGrid({ products: products2 }) {
  if (!products2.length) {
    return /* @__PURE__ */ jsxs20("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx20("h3", { children: "No products found" }),
      /* @__PURE__ */ jsx20("p", { children: "Try changing the filters or search query." })
    ] });
  }
  return /* @__PURE__ */ jsx20("div", { className: "products-grid", children: products2.map((product) => /* @__PURE__ */ jsx20(ProductCard, { product }, product.id)) });
}

// src/pages/Products/Products.jsx
import { Fragment as Fragment4, jsx as jsx21, jsxs as jsxs21 } from "react/jsx-runtime";
var emptyFilters = {
  brands: [],
  price: "",
  ratings: [],
  availability: ""
};
function Products() {
  const categories2 = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);
  const [category, setCategory] = useState6("All");
  const [query, setQuery] = useState6("");
  const [filters, setFilters] = useState6(emptyFilters);
  const [showFilter, setShowFilter] = useState6(false);
  const products2 = useMemo(
    () => getProducts({
      search: query,
      category,
      ...filters
    }),
    [query, category, filters]
  );
  const clearAll = () => {
    setFilters(emptyFilters);
    setQuery("");
    setCategory("All");
  };
  return /* @__PURE__ */ jsxs21(Fragment4, { children: [
    /* @__PURE__ */ jsx21(Sidebar, {}),
    /* @__PURE__ */ jsxs21("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx21(Navbar, {}),
      /* @__PURE__ */ jsxs21("div", { className: "products-page", children: [
        /* @__PURE__ */ jsxs21("div", { className: "products-head", children: [
          /* @__PURE__ */ jsx21("h1", { children: "Products" }),
          /* @__PURE__ */ jsxs21("span", { children: [
            products2.length,
            " products found"
          ] })
        ] }),
        /* @__PURE__ */ jsx21(
          CategoryList,
          {
            categories: categories2,
            selected: category,
            onSelect: setCategory
          }
        ),
        /* @__PURE__ */ jsxs21("div", { className: "products-toolbar", children: [
          /* @__PURE__ */ jsx21(
            ProductSearch,
            {
              value: query,
              onChange: setQuery,
              onClear: () => setQuery("")
            }
          ),
          /* @__PURE__ */ jsxs21(
            "button",
            {
              className: "filter-toggle",
              onClick: () => setShowFilter(!showFilter),
              children: [
                /* @__PURE__ */ jsx21(SlidersHorizontal, { size: 18 }),
                "Filters",
                showFilter && /* @__PURE__ */ jsx21(X2, { size: 16 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs21("div", { className: "products-layout", children: [
          /* @__PURE__ */ jsx21("div", { className: showFilter ? "filter-col visible" : "filter-col", children: /* @__PURE__ */ jsx21(
            ProductFilter,
            {
              brands,
              filters,
              onFilterChange: setFilters,
              onClear: clearAll
            }
          ) }),
          /* @__PURE__ */ jsx21(ProductGrid, { products: products2 })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/ProductDetails/ProductDetails.jsx
import { Link as Link3, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// src/pages/ProductDetails/ImageGallery.jsx
import { useState as useState7 } from "react";

// css:C:\CustomerDashbord\src\pages\ProductDetails\ProductDetails.css
collectCSS(`.details-page{

padding:30px;

}

.breadcrumb{

display:flex;

align-items:center;

gap:8px;

color:#6B7280;

font-size:14px;

margin-bottom:25px;

flex-wrap:wrap;

}

.breadcrumb a{

color:#4F46E5;

}

.breadcrumb a:hover{

text-decoration:underline;

}

.details-top{

display:grid;

grid-template-columns:400px 1fr;

gap:35px;

background:#fff;

padding:30px;

border-radius:20px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

}

.gallery{

display:flex;

flex-direction:column;

gap:15px;

}

.main-image{

background:#F8FAFC;

border-radius:16px;

height:400px;

overflow:hidden;

display:flex;

align-items:center;

justify-content:center;

cursor:zoom-in;

}

.main-image img{

width:100%;

height:100%;

object-fit:contain;

transition:transform .4s;

}

.main-image.zoomed img{

transform:scale(1.6);

cursor:zoom-out;

}

.thumbs{

display:flex;

gap:10px;

}

.thumb{

width:70px;

height:70px;

border:2px solid #E2E8F0;

border-radius:12px;

background:#F8FAFC;

cursor:pointer;

padding:4px;

overflow:hidden;

}

.thumb img{

width:100%;

height:100%;

object-fit:contain;

}

.thumb.active{

border-color:#4F46E5;

}

.details-right{

display:flex;

flex-direction:column;

gap:20px;

}

.product-info .info-category{

color:#6B7280;

font-size:14px;

margin-bottom:8px;

}

.product-info h1{

font-family:Poppins;

font-size:28px;

margin-bottom:12px;

}

.rating{

display:flex;

align-items:center;

gap:8px;

margin-bottom:12px;

}

.rating .stars{

display:flex;

gap:2px;

}

.rating span{

font-weight:600;

}

.rating .reviews{

color:#6B7280;

font-weight:400;

font-size:14px;

}

.price-block{

display:flex;

align-items:center;

gap:12px;

margin-bottom:12px;

flex-wrap:wrap;

}

.price-block .price{

font-size:30px;

font-weight:700;

color:#4F46E5;

}

.price-block .old-price{

text-decoration:line-through;

color:#9CA3AF;

font-size:16px;

}

.price-block .save{

color:#15803D;

font-size:14px;

font-weight:600;

}

.instock{

display:flex;

align-items:center;

gap:6px;

color:#15803D;

font-weight:600;

margin-bottom:8px;

}

.outofstock{

display:flex;

align-items:center;

gap:6px;

color:#EF4444;

font-weight:600;

margin-bottom:8px;

}

.delivery-line{

display:flex;

align-items:center;

gap:6px;

color:#6B7280;

font-size:14px;

margin-bottom:20px;

}

.option-group{

margin-bottom:18px;

}

.option-group h4{

font-size:14px;

margin-bottom:10px;

color:#374151;

}

.options{

display:flex;

gap:10px;

flex-wrap:wrap;

}

.option{

padding:10px 18px;

border:1.5px solid #E2E8F0;

border-radius:10px;

background:#fff;

cursor:pointer;

font-size:14px;

transition:.3s;

}

.option:hover{

border-color:#4F46E5;

}

.option.active{

border-color:#4F46E5;

background:#EEF2FF;

color:#4F46E5;

font-weight:600;

}

.qty{

display:inline-flex;

align-items:center;

border:1.5px solid #E2E8F0;

border-radius:10px;

overflow:hidden;

}

.qty button{

width:40px;

height:40px;

border:none;

background:#F8FAFC;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

}

.qty button:hover:not(:disabled){

background:#EEF2FF;

color:#4F46E5;

}

.qty span{

width:44px;

text-align:center;

font-weight:600;

}

.action-buttons{

display:flex;

gap:12px;

flex-wrap:wrap;

}

.action-buttons button{

flex:1;

min-width:140px;

padding:14px;

border-radius:12px;

font-size:15px;

font-weight:600;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

gap:8px;

transition:.3s;

}

.wish-btn{

background:#fff;

border:1.5px solid #E2E8F0;

color:#374151;

}

.wish-btn:hover{

border-color:#EF4444;

color:#EF4444;

}

.wish-btn.liked{

border-color:#EF4444;

background:#FEF2F2;

color:#EF4444;

}

.add-btn{

background:#4F46E5;

border:none;

color:white;

}

.add-btn:hover{

background:#4338CA;

}

.buy-btn{

background:linear-gradient(135deg,#4F46E5,#7C3AED);

border:none;

color:white;

}

.buy-btn:hover{

opacity:.9;

}

.delivery-checker{

background:#F8FAFC;

border:1px dashed #C7D2FE;

border-radius:16px;

padding:20px;

}

.delivery-checker h3{

font-family:Poppins;

font-size:18px;

margin-bottom:15px;

}

.pin-form{

display:flex;

align-items:center;

gap:10px;

background:#fff;

border:1.5px solid #E2E8F0;

border-radius:12px;

padding:0 12px;

}

.pin-form svg{

color:#6B7280;

}

.pin-form input{

flex:1;

padding:13px 8px;

border:none;

outline:none;

background:none;

font-size:15px;

}

.pin-form button{

background:#4F46E5;

color:white;

border:none;

padding:13px 18px;

border-radius:0 10px 10px 0;

cursor:pointer;

font-weight:600;

}

.pin-error{

color:#EF4444;

font-size:13px;

margin-top:10px;

}

.pin-result{

margin-top:15px;

display:flex;

flex-direction:column;

gap:10px;

}

.pin-result p{

display:flex;

align-items:center;

gap:8px;

color:#15803D;

font-size:14px;

font-weight:500;

}

.details-bottom{

display:grid;

grid-template-columns:1fr 1fr;

gap:30px;

margin-top:30px;

}

.spec-section,

.desc-card{

background:#fff;

border-radius:18px;

padding:25px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

}

.spec-section h2,

.desc-card h2{

font-family:Poppins;

font-size:22px;

margin-bottom:20px;

}

.spec-table{

width:100%;

border-collapse:collapse;

}

.spec-table td{

padding:13px 15px;

border-bottom:1px solid #E2E8F0;

font-size:14px;

}

.spec-table td:first-child{

color:#6B7280;

width:40%;

}

.spec-table tr:nth-child(even) td{

background:#F8FAFC;

}

.desc-card p{

color:#374151;

line-height:1.8;

margin-bottom:15px;

font-size:15px;

}

.reviews-section{

background:#fff;

border-radius:18px;

padding:25px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

margin-top:30px;

}

.reviews-head{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:25px;

}

.reviews-head h2{

font-family:Poppins;

font-size:22px;

}

.write-review{

display:flex;

align-items:center;

gap:8px;

padding:11px 18px;

background:#4F46E5;

color:white;

border:none;

border-radius:10px;

cursor:pointer;

font-weight:600;

}

.reviews-list{

display:flex;

flex-direction:column;

gap:20px;

}

.review-card{

border:1px solid #E2E8F0;

border-radius:14px;

padding:20px;

}

.review-top{

display:flex;

gap:12px;

align-items:center;

margin-bottom:12px;

}

.avatar{

width:42px;

height:42px;

border-radius:50%;

background:linear-gradient(135deg,#4F46E5,#7C3AED);

color:white;

display:flex;

align-items:center;

justify-content:center;

font-weight:600;

}

.review-top h4{

display:flex;

align-items:center;

gap:10px;

font-size:15px;

}

.verified{

display:inline-flex;

align-items:center;

gap:4px;

background:#DCFCE7;

color:#15803D;

font-size:12px;

padding:3px 8px;

border-radius:20px;

font-weight:500;

}

.review-meta{

display:flex;

align-items:center;

gap:10px;

margin-top:4px;

}

.review-meta .stars{

display:flex;

gap:2px;

}

.review-meta .date{

color:#6B7280;

font-size:13px;

}

.review-card h5{

font-size:15px;

margin-bottom:8px;

}

.review-card p{

color:#374151;

font-size:14px;

line-height:1.7;

margin-bottom:12px;

}

.helpful-btn{

display:flex;

align-items:center;

gap:6px;

padding:8px 14px;

border:1px solid #E2E8F0;

border-radius:20px;

background:#fff;

cursor:pointer;

font-size:13px;

color:#6B7280;

transition:.3s;

}

.helpful-btn:hover{

border-color:#4F46E5;

color:#4F46E5;

}

.helpful-btn.active{

background:#EEF2FF;

border-color:#4F46E5;

color:#4F46E5;
}

.bundle-section{

background:#fff;

border-radius:18px;

padding:25px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

margin-top:30px;

}

.bundle-section h2{

font-family:Poppins;

font-size:22px;

margin-bottom:25px;

}

.bundle-row{

display:flex;

align-items:center;

gap:10px;

flex-wrap:wrap;

}

.bundle-item{

text-align:center;

width:150px;

}

.bundle-item .plus{

color:#4F46E5;

margin:0 auto 5px;

}

.bundle-item img{

width:100px;

height:100px;

object-fit:contain;

margin:0 auto 10px;

background:#F8FAFC;

border-radius:12px;

padding:8px;

}

.bundle-item p{

font-size:13px;

margin-bottom:5px;

}

.bundle-item span{

color:#4F46E5;

font-weight:700;
}

.bundle-footer{

display:flex;

justify-content:space-between;

align-items:center;

margin-top:25px;

flex-wrap:wrap;

gap:15px;

}

.bundle-footer p{

font-size:16px;

}

.bundle-footer button{

display:flex;

align-items:center;

gap:8px;

padding:14px 24px;

background:#4F46E5;

color:white;

border:none;

border-radius:12px;

font-weight:600;

cursor:pointer;
}

.similar-section{

margin-top:40px;

}

.similar-head{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

flex-wrap:wrap;

gap:10px;

}

.similar-head h2{

display:flex;

align-items:center;

gap:10px;

font-family:Poppins;

font-size:24px;

}

.similar-head span{

color:#6B7280;

font-size:14px;

}

.similar-grid{

display:grid;

grid-template-columns:repeat(4,1fr);

gap:20px;

}

.not-found{

margin-left:260px;

padding:80px 30px;

text-align:center;

}

.not-found h2{

font-family:Poppins;

margin-bottom:15px;

}

.back-link{

color:#4F46E5;

font-weight:600;
}

@media(max-width:1200px){

.details-top{

grid-template-columns:1fr;

}

.main-image{

height:320px;
}

.details-bottom{

grid-template-columns:1fr;
}

.similar-grid{

grid-template-columns:repeat(2,1fr);
}
}

@media(max-width:600px){

.details-page{

padding:15px;
}

.similar-grid{

grid-template-columns:1fr;
}

.action-buttons button{

min-width:100%;
}
}
`, "pages/ProductDetails/ProductDetails.css");

// src/pages/ProductDetails/ImageGallery.jsx
import { jsx as jsx22, jsxs as jsxs22 } from "react/jsx-runtime";
function ImageGallery({ product }) {
  const gallery = getGallery(product);
  const [active, setActive] = useState7(0);
  const [zoomed, setZoomed] = useState7(false);
  return /* @__PURE__ */ jsxs22("div", { className: "gallery", children: [
    /* @__PURE__ */ jsx22(
      "div",
      {
        className: `main-image ${zoomed ? "zoomed" : ""}`,
        onMouseEnter: () => setZoomed(true),
        onMouseLeave: () => setZoomed(false),
        children: /* @__PURE__ */ jsx22("img", { src: gallery[active], alt: product.name })
      }
    ),
    /* @__PURE__ */ jsx22("div", { className: "thumbs", children: gallery.map((img, i) => /* @__PURE__ */ jsx22(
      "button",
      {
        className: `thumb ${i === active ? "active" : ""}`,
        onClick: () => setActive(i),
        children: /* @__PURE__ */ jsx22("img", { src: img, alt: `${product.name} view ${i + 1}` })
      },
      i
    )) })
  ] });
}

// src/pages/ProductDetails/ProductInfo.jsx
import { useState as useState8 } from "react";
import {
  Heart as Heart5,
  ShoppingCart as ShoppingCart6,
  Zap as Zap2,
  Truck as Truck3,
  Star as Star3,
  Minus,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Fragment as Fragment5, jsx as jsx23, jsxs as jsxs23 } from "react/jsx-runtime";
var fmt2 = (n) => n.toLocaleString("en-IN");
function ProductInfo({ product }) {
  const [color, setColor] = useState8("Black");
  const [storage, setStorage] = useState8("256GB");
  const [qty, setQty] = useState8(1);
  const [liked, setLiked] = useState8(false);
  const [added, setAdded] = useState8(false);
  const colors = ["Black", "Blue", "White"];
  const storages = ["128GB", "256GB", "512GB"];
  const saved = product.oldPrice - product.price;
  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return /* @__PURE__ */ jsxs23("div", { className: "product-info", children: [
    /* @__PURE__ */ jsxs23("div", { className: "info-category", children: [
      product.brand,
      " \xB7 ",
      product.category
    ] }),
    /* @__PURE__ */ jsx23("h1", { children: product.name }),
    /* @__PURE__ */ jsxs23("div", { className: "rating", children: [
      /* @__PURE__ */ jsx23("div", { className: "stars", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx23(
        Star3,
        {
          size: 16,
          fill: s <= Math.round(product.rating) ? "#F59E0B" : "#E2E8F0",
          color: s <= Math.round(product.rating) ? "#F59E0B" : "#E2E8F0"
        },
        s
      )) }),
      /* @__PURE__ */ jsx23("span", { children: product.rating }),
      /* @__PURE__ */ jsxs23("span", { className: "reviews", children: [
        "(",
        product.reviews,
        " Ratings)"
      ] })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "price-block", children: [
      /* @__PURE__ */ jsxs23("span", { className: "price", children: [
        "\u20B9",
        fmt2(product.price)
      ] }),
      /* @__PURE__ */ jsxs23("span", { className: "old-price", children: [
        "\u20B9",
        fmt2(product.oldPrice)
      ] }),
      /* @__PURE__ */ jsxs23("span", { className: "save", children: [
        "(Save \u20B9",
        fmt2(saved),
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs23("p", { className: product.inStock ? "instock" : "outofstock", children: [
      /* @__PURE__ */ jsx23(CheckCircle2, { size: 15 }),
      product.inStock ? "In Stock" : "Out of Stock"
    ] }),
    /* @__PURE__ */ jsxs23("p", { className: "delivery-line", children: [
      /* @__PURE__ */ jsx23(Truck3, { size: 15 }),
      "Free Delivery by Tomorrow"
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "option-group", children: [
      /* @__PURE__ */ jsx23("h4", { children: "Color" }),
      /* @__PURE__ */ jsx23("div", { className: "options", children: colors.map((c) => /* @__PURE__ */ jsx23(
        "button",
        {
          className: `option ${color === c ? "active" : ""}`,
          onClick: () => setColor(c),
          children: c
        },
        c
      )) })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "option-group", children: [
      /* @__PURE__ */ jsx23("h4", { children: "Storage" }),
      /* @__PURE__ */ jsx23("div", { className: "options", children: storages.map((s) => /* @__PURE__ */ jsx23(
        "button",
        {
          className: `option ${storage === s ? "active" : ""}`,
          onClick: () => setStorage(s),
          children: s
        },
        s
      )) })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "option-group", children: [
      /* @__PURE__ */ jsx23("h4", { children: "Quantity" }),
      /* @__PURE__ */ jsxs23("div", { className: "qty", children: [
        /* @__PURE__ */ jsx23("button", { onClick: () => setQty(Math.max(1, qty - 1)), disabled: qty <= 1, children: /* @__PURE__ */ jsx23(Minus, { size: 16 }) }),
        /* @__PURE__ */ jsx23("span", { children: qty }),
        /* @__PURE__ */ jsx23("button", { onClick: () => setQty(qty + 1), children: /* @__PURE__ */ jsx23(Plus, { size: 16 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "action-buttons", children: [
      /* @__PURE__ */ jsxs23(
        "button",
        {
          className: `wish-btn ${liked ? "liked" : ""}`,
          onClick: () => setLiked(!liked),
          children: [
            /* @__PURE__ */ jsx23(Heart5, { size: 18, fill: liked ? "#EF4444" : "none" }),
            liked ? "Wishlisted" : "Wishlist"
          ]
        }
      ),
      /* @__PURE__ */ jsx23("button", { className: "add-btn", onClick: handleAdd, children: added ? "\u2713 Added" : /* @__PURE__ */ jsxs23(Fragment5, { children: [
        /* @__PURE__ */ jsx23(ShoppingCart6, { size: 18 }),
        "Add to Cart"
      ] }) }),
      /* @__PURE__ */ jsxs23("button", { className: "buy-btn", children: [
        /* @__PURE__ */ jsx23(Zap2, { size: 18 }),
        "Buy Now"
      ] })
    ] })
  ] });
}

// src/pages/ProductDetails/DeliveryChecker.jsx
import { useState as useState9 } from "react";
import { MapPin, Truck as Truck4, CheckCircle2 as CheckCircle22, Banknote } from "lucide-react";
import { jsx as jsx24, jsxs as jsxs24 } from "react/jsx-runtime";
function DeliveryChecker() {
  const [pincode, setPincode] = useState9("");
  const [checked, setChecked] = useState9(false);
  const [error, setError] = useState9("");
  const handleCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode");
      setChecked(false);
      return;
    }
    setError("");
    setChecked(true);
  };
  return /* @__PURE__ */ jsxs24("div", { className: "delivery-checker", children: [
    /* @__PURE__ */ jsx24("h3", { children: "Check Delivery" }),
    /* @__PURE__ */ jsxs24("form", { className: "pin-form", onSubmit: handleCheck, children: [
      /* @__PURE__ */ jsx24(MapPin, { size: 18 }),
      /* @__PURE__ */ jsx24(
        "input",
        {
          type: "text",
          placeholder: "Enter pincode (e.g. 411001)",
          maxLength: "6",
          value: pincode,
          onChange: (e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            setChecked(false);
          }
        }
      ),
      /* @__PURE__ */ jsx24("button", { type: "submit", children: "Check" })
    ] }),
    error && /* @__PURE__ */ jsx24("p", { className: "pin-error", children: error }),
    checked && /* @__PURE__ */ jsxs24("div", { className: "pin-result", children: [
      /* @__PURE__ */ jsxs24("p", { children: [
        /* @__PURE__ */ jsx24(Truck4, { size: 16 }),
        "Delivery by Tomorrow"
      ] }),
      /* @__PURE__ */ jsxs24("p", { children: [
        /* @__PURE__ */ jsx24(CheckCircle22, { size: 16 }),
        "Free Delivery"
      ] }),
      /* @__PURE__ */ jsxs24("p", { children: [
        /* @__PURE__ */ jsx24(Banknote, { size: 16 }),
        "Cash on Delivery Available"
      ] })
    ] })
  ] });
}

// src/pages/ProductDetails/ProductSpecification.jsx
import { jsx as jsx25, jsxs as jsxs25 } from "react/jsx-runtime";
function ProductSpecification({ product }) {
  const specs = getSpecifications(product);
  return /* @__PURE__ */ jsxs25("div", { className: "spec-section", children: [
    /* @__PURE__ */ jsx25("h2", { children: "\u{1F4E6} Specifications" }),
    /* @__PURE__ */ jsx25("table", { className: "spec-table", children: /* @__PURE__ */ jsx25("tbody", { children: specs.map(([key, value]) => /* @__PURE__ */ jsxs25("tr", { children: [
      /* @__PURE__ */ jsx25("td", { children: key }),
      /* @__PURE__ */ jsx25("td", { children: value })
    ] }, key)) }) })
  ] });
}

// src/pages/ProductDetails/ProductReviews.jsx
import { useState as useState10 } from "react";
import { Star as Star4, ThumbsUp, BadgeCheck, PenLine } from "lucide-react";
import { jsx as jsx26, jsxs as jsxs26 } from "react/jsx-runtime";
function ProductReviews({ product }) {
  const reviews = getProductReviews(product);
  const [helpful, setHelpful] = useState10({});
  return /* @__PURE__ */ jsxs26("div", { className: "reviews-section", children: [
    /* @__PURE__ */ jsxs26("div", { className: "reviews-head", children: [
      /* @__PURE__ */ jsx26("h2", { children: "\u2B50 Customer Reviews" }),
      /* @__PURE__ */ jsxs26("button", { className: "write-review", children: [
        /* @__PURE__ */ jsx26(PenLine, { size: 16 }),
        "Write Review"
      ] })
    ] }),
    /* @__PURE__ */ jsx26("div", { className: "reviews-list", children: reviews.map((review) => /* @__PURE__ */ jsxs26("div", { className: "review-card", children: [
      /* @__PURE__ */ jsxs26("div", { className: "review-top", children: [
        /* @__PURE__ */ jsx26("div", { className: "avatar", children: review.name[0] }),
        /* @__PURE__ */ jsxs26("div", { children: [
          /* @__PURE__ */ jsxs26("h4", { children: [
            review.name,
            review.verified && /* @__PURE__ */ jsxs26("span", { className: "verified", children: [
              /* @__PURE__ */ jsx26(BadgeCheck, { size: 14 }),
              " Verified Purchase"
            ] })
          ] }),
          /* @__PURE__ */ jsxs26("div", { className: "review-meta", children: [
            /* @__PURE__ */ jsx26("span", { className: "stars", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx26(
              Star4,
              {
                size: 14,
                fill: s <= review.rating ? "#F59E0B" : "#E2E8F0",
                color: s <= review.rating ? "#F59E0B" : "#E2E8F0"
              },
              s
            )) }),
            /* @__PURE__ */ jsx26("span", { className: "date", children: review.date })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx26("h5", { children: review.title }),
      /* @__PURE__ */ jsx26("p", { children: review.comment }),
      /* @__PURE__ */ jsxs26(
        "button",
        {
          className: `helpful-btn ${helpful[review.id] ? "active" : ""}`,
          onClick: () => setHelpful((prev) => ({
            ...prev,
            [review.id]: !prev[review.id]
          })),
          children: [
            /* @__PURE__ */ jsx26(ThumbsUp, { size: 15 }),
            "Helpful (",
            review.helpful + (helpful[review.id] ? 1 : 0),
            ")"
          ]
        }
      )
    ] }, review.id)) })
  ] });
}

// src/pages/ProductDetails/SimilarProducts.jsx
import { Sparkles as Sparkles10 } from "lucide-react";
import { jsx as jsx27, jsxs as jsxs27 } from "react/jsx-runtime";
function SimilarProducts({ product }) {
  const similar = getSimilarProducts(product);
  return /* @__PURE__ */ jsxs27("div", { className: "similar-section", children: [
    /* @__PURE__ */ jsxs27("div", { className: "similar-head", children: [
      /* @__PURE__ */ jsxs27("h2", { children: [
        /* @__PURE__ */ jsx27(Sparkles10, { size: 22 }),
        "Similar Products"
      ] }),
      /* @__PURE__ */ jsx27("span", { children: "Recommended by AI based on your shopping behaviour" })
    ] }),
    /* @__PURE__ */ jsx27("div", { className: "similar-grid", children: similar.map((item) => /* @__PURE__ */ jsx27(ProductCard, { product: item }, item.id)) })
  ] });
}

// src/pages/ProductDetails/BoughtTogether.jsx
import { useState as useState11 } from "react";
import { Plus as Plus2, ShoppingCart as ShoppingCart7 } from "lucide-react";
import { Fragment as Fragment6, jsx as jsx28, jsxs as jsxs28 } from "react/jsx-runtime";
var fmt3 = (n) => n.toLocaleString("en-IN");
function BoughtTogether({ product }) {
  const bundle = getBoughtTogether(product);
  const [added, setAdded] = useState11(false);
  const total = bundle.reduce((sum, p) => sum + p.price, 0);
  const handleAddAll = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return /* @__PURE__ */ jsxs28("div", { className: "bundle-section", children: [
    /* @__PURE__ */ jsx28("h2", { children: "\u{1F525} Frequently Bought Together" }),
    /* @__PURE__ */ jsx28("div", { className: "bundle-row", children: bundle.map((item, index) => /* @__PURE__ */ jsxs28("div", { className: "bundle-item", children: [
      index > 0 && /* @__PURE__ */ jsx28(Plus2, { size: 20, className: "plus" }),
      /* @__PURE__ */ jsx28("img", { src: item.image, alt: item.name }),
      /* @__PURE__ */ jsx28("p", { children: item.name }),
      /* @__PURE__ */ jsxs28("span", { children: [
        "\u20B9",
        fmt3(item.price)
      ] })
    ] }, item.id)) }),
    /* @__PURE__ */ jsxs28("div", { className: "bundle-footer", children: [
      /* @__PURE__ */ jsxs28("p", { children: [
        "Total Price: ",
        /* @__PURE__ */ jsxs28("strong", { children: [
          "\u20B9",
          fmt3(total)
        ] })
      ] }),
      /* @__PURE__ */ jsx28("button", { onClick: handleAddAll, children: added ? "\u2713 Added All to Cart" : /* @__PURE__ */ jsxs28(Fragment6, { children: [
        /* @__PURE__ */ jsx28(ShoppingCart7, { size: 18 }),
        "Add All to Cart"
      ] }) })
    ] })
  ] });
}

// src/pages/ProductDetails/ProductDetails.jsx
import { Fragment as Fragment7, jsx as jsx29, jsxs as jsxs29 } from "react/jsx-runtime";
function ProductDetails() {
  const { id } = useParams();
  const product = getProductById(id);
  if (!product) {
    return /* @__PURE__ */ jsxs29("div", { className: "not-found", children: [
      /* @__PURE__ */ jsx29("h2", { children: "Product not found" }),
      /* @__PURE__ */ jsx29(Link3, { to: "/products", className: "back-link", children: "\u2190 Back to Products" })
    ] });
  }
  return /* @__PURE__ */ jsxs29(Fragment7, { children: [
    /* @__PURE__ */ jsx29(Sidebar, {}),
    /* @__PURE__ */ jsxs29("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx29(Navbar, {}),
      /* @__PURE__ */ jsxs29("div", { className: "details-page", children: [
        /* @__PURE__ */ jsxs29("nav", { className: "breadcrumb", children: [
          /* @__PURE__ */ jsx29(Link3, { to: "/", children: "Home" }),
          /* @__PURE__ */ jsx29(ChevronRight, { size: 14 }),
          /* @__PURE__ */ jsx29(Link3, { to: "/products", children: product.category }),
          /* @__PURE__ */ jsx29(ChevronRight, { size: 14 }),
          /* @__PURE__ */ jsx29(Link3, { to: "/products", children: product.brand }),
          /* @__PURE__ */ jsx29(ChevronRight, { size: 14 }),
          /* @__PURE__ */ jsx29("span", { children: product.name })
        ] }),
        /* @__PURE__ */ jsxs29("div", { className: "details-top", children: [
          /* @__PURE__ */ jsx29(ImageGallery, { product }),
          /* @__PURE__ */ jsxs29("div", { className: "details-right", children: [
            /* @__PURE__ */ jsx29(ProductInfo, { product }),
            /* @__PURE__ */ jsx29(DeliveryChecker, { product })
          ] })
        ] }),
        /* @__PURE__ */ jsxs29("div", { className: "details-bottom", children: [
          /* @__PURE__ */ jsx29(ProductSpecification, { product }),
          /* @__PURE__ */ jsxs29("div", { className: "desc-card", children: [
            /* @__PURE__ */ jsx29("h2", { children: "\u{1F4CB} Product Description" }),
            /* @__PURE__ */ jsx29("p", { children: product.description }),
            /* @__PURE__ */ jsx29("p", { children: "This product has been carefully chosen for you by our AI recommendation engine based on your shopping history and preferences. Buy with confidence and enjoy free delivery, easy returns and cash on delivery options." })
          ] })
        ] }),
        /* @__PURE__ */ jsx29(ProductReviews, { product }),
        /* @__PURE__ */ jsx29(BoughtTogether, { product }),
        /* @__PURE__ */ jsx29(SimilarProducts, { product })
      ] })
    ] })
  ] });
}

// src/pages/Cart/Cart.jsx
import { useEffect as useEffect3, useMemo as useMemo2, useState as useState13 } from "react";
import { Link as Link5, useNavigate as useNavigate6 } from "react-router-dom";
import { ShoppingCart as ShoppingCart8 } from "lucide-react";

// src/components/CartItem/CartItem.jsx
import { Link as Link4 } from "react-router-dom";
import { Minus as Minus2, Plus as Plus3, Heart as Heart6, Trash2 } from "lucide-react";

// css:C:\CustomerDashbord\src\components\CartItem\CartItem.css
collectCSS(`.cart-item{

display:flex;

gap:20px;

background:#fff;

padding:20px;

border-radius:16px;

box-shadow:0 6px 16px rgba(0,0,0,.05);

}

.cart-item-img{

width:120px;

height:120px;

background:#F8FAFC;

border-radius:12px;

display:flex;

align-items:center;

justify-content:center;

flex-shrink:0;

overflow:hidden;

}

.cart-item-img img{

width:100%;

height:100%;

object-fit:contain;

}

.cart-item-details{

flex:1;

}

.cart-item-name{

font-family:Poppins;

font-size:17px;

color:inherit;

text-decoration:none;

}

.cart-item-name:hover{

color:#4F46E5;

}

.cart-item-brand{

color:#6B7280;

font-size:13px;

margin-top:4px;

}

.cart-item-price{

font-size:19px;

font-weight:700;

color:#4F46E5;

margin-top:8px;

display:flex;

align-items:center;

gap:10px;

}

.cart-item-price .old-price{

font-size:14px;

color:#9CA3AF;

text-decoration:line-through;

font-weight:400;

}

.cart-item-actions{

display:flex;

align-items:center;

gap:15px;

margin-top:15px;

flex-wrap:wrap;

}

.cart-item-actions .qty{

display:inline-flex;

align-items:center;

border:1px solid #E2E8F0;

border-radius:10px;

overflow:hidden;

}

.cart-item-actions .qty button{

width:34px;

height:34px;

border:none;

background:#F8FAFC;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

}

.cart-item-actions .qty button:hover:not(:disabled){

background:#EEF2FF;

color:#4F46E5;

}

.cart-item-actions .qty span{

width:38px;

text-align:center;

font-weight:600;

}

.save-btn,

.remove-btn{

display:flex;

align-items:center;

gap:6px;

padding:9px 14px;

border-radius:8px;

border:none;

cursor:pointer;

font-size:13px;

font-weight:500;

transition:.3s;

}

.save-btn{

background:#FEF3C7;

color:#B45309;

}

.save-btn:hover{

background:#FDE68A;

}

.remove-btn{

background:#FEE2E2;

color:#B91C1C;

}

.remove-btn:hover{

background:#FECACA;
}
`, "components/CartItem/CartItem.css");

// src/components/CartItem/CartItem.jsx
import { jsx as jsx30, jsxs as jsxs30 } from "react/jsx-runtime";
var fmt4 = (n) => n.toLocaleString("en-IN");
function CartItem({ item, onUpdateQty, onRemove, onSaveLater }) {
  const { product, quantity } = item;
  return /* @__PURE__ */ jsxs30("div", { className: "cart-item", children: [
    /* @__PURE__ */ jsx30(Link4, { to: `/products/${product.id}`, className: "cart-item-img", children: /* @__PURE__ */ jsx30("img", { src: product.image, alt: product.name }) }),
    /* @__PURE__ */ jsxs30("div", { className: "cart-item-details", children: [
      /* @__PURE__ */ jsx30(Link4, { to: `/products/${product.id}`, className: "cart-item-name", children: product.name }),
      /* @__PURE__ */ jsx30("p", { className: "cart-item-brand", children: product.brand }),
      /* @__PURE__ */ jsxs30("div", { className: "cart-item-price", children: [
        "\u20B9",
        fmt4(product.price),
        /* @__PURE__ */ jsxs30("span", { className: "old-price", children: [
          "\u20B9",
          fmt4(product.oldPrice)
        ] })
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "cart-item-actions", children: [
        /* @__PURE__ */ jsxs30("div", { className: "qty", children: [
          /* @__PURE__ */ jsx30(
            "button",
            {
              onClick: () => onUpdateQty(product.id, quantity - 1),
              disabled: quantity <= 1,
              children: /* @__PURE__ */ jsx30(Minus2, { size: 15 })
            }
          ),
          /* @__PURE__ */ jsx30("span", { children: quantity }),
          /* @__PURE__ */ jsx30("button", { onClick: () => onUpdateQty(product.id, quantity + 1), children: /* @__PURE__ */ jsx30(Plus3, { size: 15 }) })
        ] }),
        /* @__PURE__ */ jsxs30("button", { className: "save-btn", onClick: () => onSaveLater(item), children: [
          /* @__PURE__ */ jsx30(Heart6, { size: 15 }),
          "Save for Later"
        ] }),
        /* @__PURE__ */ jsxs30("button", { className: "remove-btn", onClick: () => onRemove(product.id), children: [
          /* @__PURE__ */ jsx30(Trash2, { size: 15 }),
          "Remove"
        ] })
      ] })
    ] })
  ] });
}

// src/components/OrderSummary/OrderSummary.jsx
import { Lock } from "lucide-react";

// css:C:\CustomerDashbord\src\components\OrderSummary\OrderSummary.css
collectCSS(`.order-summary{

background:#fff;

border-radius:18px;

padding:25px;

box-shadow:0 8px 20px rgba(0,0,0,.06);

position:sticky;

top:20px;

}

.order-summary h2{

font-family:Poppins;

font-size:20px;

margin-bottom:20px;

}

.summary-row{

display:flex;

justify-content:space-between;

align-items:center;

padding:11px 0;

font-size:15px;

color:#374151;

}

.summary-row.discount{

color:#15803D;

font-weight:600;

}

.remove-coupon{

border:none;

background:none;

color:#EF4444;

font-size:12px;

cursor:pointer;

margin-left:8px;

text-decoration:underline;

}

.summary-total{

display:flex;

justify-content:space-between;

align-items:center;

border-top:1px dashed #E2E8F0;

margin-top:12px;

padding-top:16px;

font-size:19px;

font-weight:700;

}

.checkout-btn{

width:100%;

margin-top:20px;

padding:15px;

background:linear-gradient(135deg,#4F46E5,#7C3AED);

color:white;

border:none;

border-radius:12px;

font-size:16px;

font-weight:600;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

gap:8px;

transition:.3s;
}

.checkout-btn:hover{

opacity:.92;
}

.secure-note{

text-align:center;

color:#9CA3AF;

font-size:12px;

margin-top:12px;
}
`, "components/OrderSummary/OrderSummary.css");

// src/components/OrderSummary/OrderSummary.jsx
import { jsx as jsx31, jsxs as jsxs31 } from "react/jsx-runtime";
var fmt5 = (n) => n.toLocaleString("en-IN");
function OrderSummary({
  subtotal,
  discount,
  delivery,
  gst,
  total,
  coupon,
  onClearCoupon,
  deliveryLabel = "Delivery",
  buttonLabel = "Proceed to Checkout",
  showButton = true,
  onClick,
  totalLabel = "Total"
}) {
  return /* @__PURE__ */ jsxs31("div", { className: "order-summary", children: [
    /* @__PURE__ */ jsx31("h2", { children: "Order Summary" }),
    /* @__PURE__ */ jsxs31("div", { className: "summary-row", children: [
      /* @__PURE__ */ jsx31("span", { children: "Subtotal" }),
      /* @__PURE__ */ jsxs31("span", { children: [
        "\u20B9",
        fmt5(subtotal)
      ] })
    ] }),
    discount > 0 && /* @__PURE__ */ jsxs31("div", { className: "summary-row discount", children: [
      /* @__PURE__ */ jsxs31("span", { children: [
        "Discount (",
        coupon,
        ")",
        /* @__PURE__ */ jsx31("button", { className: "remove-coupon", onClick: onClearCoupon, children: "Remove" })
      ] }),
      /* @__PURE__ */ jsxs31("span", { children: [
        "-\u20B9",
        fmt5(discount)
      ] })
    ] }),
    /* @__PURE__ */ jsxs31("div", { className: "summary-row", children: [
      /* @__PURE__ */ jsx31("span", { children: deliveryLabel }),
      /* @__PURE__ */ jsx31("span", { children: delivery === 0 ? "Free" : `\u20B9${fmt5(delivery)}` })
    ] }),
    /* @__PURE__ */ jsxs31("div", { className: "summary-row", children: [
      /* @__PURE__ */ jsx31("span", { children: "GST (5%)" }),
      /* @__PURE__ */ jsxs31("span", { children: [
        "\u20B9",
        fmt5(gst)
      ] })
    ] }),
    /* @__PURE__ */ jsxs31("div", { className: "summary-total", children: [
      /* @__PURE__ */ jsx31("span", { children: totalLabel }),
      /* @__PURE__ */ jsxs31("span", { children: [
        "\u20B9",
        fmt5(total)
      ] })
    ] }),
    showButton && /* @__PURE__ */ jsxs31("button", { className: "checkout-btn", onClick, children: [
      /* @__PURE__ */ jsx31(Lock, { size: 16 }),
      buttonLabel
    ] }),
    /* @__PURE__ */ jsx31("p", { className: "secure-note", children: "100% Secure Payments \xB7 Easy Returns" })
  ] });
}

// src/components/CouponBox/CouponBox.jsx
import { useState as useState12 } from "react";
import { Ticket, Check } from "lucide-react";

// css:C:\CustomerDashbord\src\components\CouponBox\CouponBox.css
collectCSS(`.coupon-box{

background:#fff;

border-radius:16px;

padding:22px;

box-shadow:0 6px 16px rgba(0,0,0,.05);

}

.coupon-box h2{

display:flex;

align-items:center;

gap:8px;

font-family:Poppins;

font-size:18px;

margin-bottom:15px;

}

.coupon-input{

display:flex;

gap:10px;

}

.coupon-input input{

flex:1;

padding:13px 14px;

border:1.5px solid #E2E8F0;

border-radius:12px;

outline:none;

font-size:15px;

font-weight:600;

text-transform:uppercase;

}

.coupon-input input:focus{

border-color:#4F46E5;

}

.coupon-input button{

padding:13px 22px;

background:#4F46E5;

color:white;

border:none;

border-radius:12px;

cursor:pointer;

font-weight:600;

}

.coupon-error{

color:#EF4444;

font-size:13px;

margin-top:8px;
}

.coupon-chips{

display:flex;

gap:8px;

margin-top:15px;

flex-wrap:wrap;

}

.coupon-chips button{

padding:7px 12px;

border:1px dashed #A5B4FC;

background:#EEF2FF;

color:#4F46E5;

border-radius:8px;

font-size:12px;

font-weight:600;

cursor:pointer;

}

.coupon-chips button:hover{

background:#C7D2FE;
}

.applied-coupon{

display:flex;

justify-content:space-between;

align-items:center;

background:#DCFCE7;

color:#15803D;

padding:13px 15px;

border-radius:12px;

font-size:14px;

font-weight:500;

gap:10px;

}

.applied-coupon span{

display:flex;

align-items:center;

gap:8px;
}

.applied-coupon button{

border:none;

background:none;

color:#EF4444;

cursor:pointer;

font-size:13px;

font-weight:600;

text-decoration:underline;
}
`, "components/CouponBox/CouponBox.css");

// src/components/CouponBox/CouponBox.jsx
import { Fragment as Fragment8, jsx as jsx32, jsxs as jsxs32 } from "react/jsx-runtime";
function CouponBox({ applied, onCouponChange }) {
  const [code, setCode] = useState12("");
  const [error, setError] = useState12("");
  const handleApply = (value) => {
    const result = applyCoupon(value);
    if (result.ok) {
      setError("");
      setCode("");
      onCouponChange();
    } else {
      setError(result.message);
    }
  };
  const handleRemove = () => {
    clearCoupon();
    setError("");
    onCouponChange();
  };
  return /* @__PURE__ */ jsxs32("div", { className: "coupon-box", children: [
    /* @__PURE__ */ jsxs32("h2", { children: [
      /* @__PURE__ */ jsx32(Ticket, { size: 20 }),
      "Apply Coupon"
    ] }),
    applied ? /* @__PURE__ */ jsxs32("div", { className: "applied-coupon", children: [
      /* @__PURE__ */ jsxs32("span", { children: [
        /* @__PURE__ */ jsx32(Check, { size: 16 }),
        "Coupon ",
        applied.code,
        " applied \u2014 Save \u20B9",
        applied.discount.toLocaleString("en-IN")
      ] }),
      /* @__PURE__ */ jsx32("button", { onClick: handleRemove, children: "Remove" })
    ] }) : /* @__PURE__ */ jsxs32(Fragment8, { children: [
      /* @__PURE__ */ jsxs32("div", { className: "coupon-input", children: [
        /* @__PURE__ */ jsx32(
          "input",
          {
            type: "text",
            placeholder: "Enter coupon code",
            value: code,
            onChange: (e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }
          }
        ),
        /* @__PURE__ */ jsx32("button", { onClick: () => handleApply(code), children: "Apply" })
      ] }),
      error && /* @__PURE__ */ jsx32("p", { className: "coupon-error", children: error })
    ] }),
    /* @__PURE__ */ jsx32("div", { className: "coupon-chips", children: COUPON_LIST.map((c) => /* @__PURE__ */ jsx32("button", { onClick: () => handleApply(c), children: c }, c)) })
  ] });
}

// src/components/SuggestedProducts/SuggestedProducts.jsx
import { Sparkles as Sparkles11 } from "lucide-react";

// css:C:\CustomerDashbord\src\components\SuggestedProducts\SuggestedProducts.css
collectCSS(`.suggested-section{
margin-top:40px;
}

.suggested-head{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
flex-wrap:wrap;
gap:10px;
}

.suggested-head h2{
display:flex;
align-items:center;
gap:10px;
font-family:Poppins;
font-size:24px;
}

.suggested-head span{
color:#6B7280;
font-size:14px;
}

.suggested-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:20px;
}

@media(max-width:1200px){
.suggested-grid{
grid-template-columns:repeat(2,1fr);
}
}

@media(max-width:600px){
.suggested-grid{
grid-template-columns:1fr;
}
}
`, "components/SuggestedProducts/SuggestedProducts.css");

// src/components/SuggestedProducts/SuggestedProducts.jsx
import { jsx as jsx33, jsxs as jsxs33 } from "react/jsx-runtime";
function SuggestedProducts({ excludeIds }) {
  const suggested = getProducts().filter((p) => !excludeIds.includes(p.id)).slice(0, 4);
  return /* @__PURE__ */ jsxs33("div", { className: "suggested-section", children: [
    /* @__PURE__ */ jsxs33("div", { className: "suggested-head", children: [
      /* @__PURE__ */ jsxs33("h2", { children: [
        /* @__PURE__ */ jsx33(Sparkles11, { size: 22 }),
        "You may also like"
      ] }),
      /* @__PURE__ */ jsx33("span", { children: "Recommended by AI based on your cart" })
    ] }),
    /* @__PURE__ */ jsx33("div", { className: "suggested-grid", children: suggested.map((item) => /* @__PURE__ */ jsx33(ProductCard, { product: item }, item.id)) })
  ] });
}

// css:C:\CustomerDashbord\src\pages\Cart\Cart.css
collectCSS(`.cart-page{

padding:30px;

}

.cart-head{

display:flex;

align-items:center;

justify-content:space-between;

margin-bottom:25px;

}

.cart-head h1{

display:flex;

align-items:center;

gap:10px;

font-family:Poppins;

font-size:28px;

}

.cart-head span{

color:#6B7280;

font-size:14px;

}

.cart-layout{

display:grid;

grid-template-columns:1fr 340px;

gap:25px;

align-items:start;

}

.cart-items-list{

display:flex;

flex-direction:column;

gap:15px;

margin-bottom:25px;

}

.empty-cart{

background:#fff;

border-radius:18px;

padding:70px 20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.06);

}

.empty-cart h2{

font-family:Poppins;

margin-bottom:8px;

}

.empty-cart p{

color:#6B7280;

margin-bottom:25px;
}

.empty-btn{

display:inline-block;

padding:14px 28px;

background:#4F46E5;

color:white;

border-radius:12px;

font-weight:600;
}

.empty-btn:hover{

background:#4338CA;
}

@media(max-width:1024px){

.cart-layout{

grid-template-columns:1fr;
}

.order-summary{

position:static;
}
}

@media(max-width:600px){

.cart-page{

padding:15px;
}
}
`, "pages/Cart/Cart.css");

// src/pages/Cart/Cart.jsx
import { Fragment as Fragment9, jsx as jsx34, jsxs as jsxs34 } from "react/jsx-runtime";
function Cart() {
  const navigate = useNavigate6();
  const [cart, setCart] = useState13(getCartItems());
  const [, forceUpdate] = useState13(0);
  useEffect3(() => subscribeCart(() => {
    setCart(getCartItems());
    forceUpdate((n) => n + 1);
  }), []);
  const items3 = useMemo2(
    () => cart.map((i) => ({ ...i, product: getProductById(i.productId) })).filter((i) => i.product),
    [cart]
  );
  const coupon = getAppliedCoupon();
  const discount = coupon?.discount || 0;
  const subtotal = items3.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const delivery = subtotal === 0 || subtotal - discount > 999 ? 0 : 49;
  const gst = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + delivery + gst);
  const handleUpdate = (productId, qty) => updateQuantity(productId, qty);
  const handleRemove = (productId) => removeFromCart(productId);
  const handleSaveLater = (item) => {
    addToWishlist(item.product);
    removeFromCart(item.productId);
  };
  return /* @__PURE__ */ jsxs34(Fragment9, { children: [
    /* @__PURE__ */ jsx34(Sidebar, {}),
    /* @__PURE__ */ jsxs34("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx34(Navbar, {}),
      /* @__PURE__ */ jsxs34("div", { className: "cart-page", children: [
        /* @__PURE__ */ jsxs34("div", { className: "cart-head", children: [
          /* @__PURE__ */ jsxs34("h1", { children: [
            /* @__PURE__ */ jsx34(ShoppingCart8, { size: 26 }),
            "Shopping Cart"
          ] }),
          /* @__PURE__ */ jsxs34("span", { children: [
            items3.length,
            " ",
            items3.length === 1 ? "item" : "items"
          ] })
        ] }),
        items3.length === 0 ? /* @__PURE__ */ jsxs34("div", { className: "empty-cart", children: [
          /* @__PURE__ */ jsx34("h2", { children: "Your cart is empty" }),
          /* @__PURE__ */ jsx34("p", { children: "Browse products and add your favourites to the cart." }),
          /* @__PURE__ */ jsx34(Link5, { to: "/products", className: "empty-btn", children: "Start Shopping" })
        ] }) : /* @__PURE__ */ jsxs34("div", { className: "cart-layout", children: [
          /* @__PURE__ */ jsxs34("div", { className: "cart-left", children: [
            /* @__PURE__ */ jsx34("div", { className: "cart-items-list", children: items3.map((item) => /* @__PURE__ */ jsx34(
              CartItem,
              {
                item,
                onUpdateQty: handleUpdate,
                onRemove: handleRemove,
                onSaveLater: handleSaveLater
              },
              item.productId
            )) }),
            /* @__PURE__ */ jsx34(
              CouponBox,
              {
                applied: coupon,
                onCouponChange: () => forceUpdate((n) => n + 1)
              }
            )
          ] }),
          /* @__PURE__ */ jsx34(
            OrderSummary,
            {
              subtotal,
              discount,
              delivery,
              gst,
              total,
              coupon: coupon?.code,
              onClearCoupon: () => forceUpdate((n) => n + 1),
              onClick: () => navigate("/checkout")
            }
          )
        ] }),
        items3.length > 0 && /* @__PURE__ */ jsx34(SuggestedProducts, { excludeIds: items3.map((i) => i.productId) })
      ] })
    ] })
  ] });
}

// src/pages/Wishlist/Wishlist.jsx
import { useEffect as useEffect5, useMemo as useMemo3, useState as useState15 } from "react";
import { Link as Link7 } from "react-router-dom";
import { Heart as Heart7, ArrowLeft } from "lucide-react";

// src/components/WishlistCard/WishlistCard.jsx
import { useEffect as useEffect4, useState as useState14 } from "react";
import { Link as Link6 } from "react-router-dom";
import {
  ShoppingCart as ShoppingCart9,
  Trash2 as Trash22,
  Share2,
  Check as Check2,
  Star as Star5
} from "lucide-react";

// css:C:\CustomerDashbord\src\components\WishlistCard\WishlistCard.css
collectCSS(`.wcard{

background:#fff;

border-radius:16px;

overflow:hidden;

border:1px solid #EEF2F7;

position:relative;

transition:.25s;
}

.wcard:hover{

box-shadow:0 12px 28px rgba(79,70,229,.12);

transform:translateY(-3px);
}

.wcard-img{

display:block;

position:relative;

height:190px;

background:#F8FAFC;

overflow:hidden;
}

.wcard-img img{

width:100%;

height:100%;

object-fit:contain;

transition:.3s;
}

.wcard:hover .wcard-img img{

transform:scale(1.05);
}

.ai-chip{

position:absolute;

top:10px;

left:10px;

background:linear-gradient(135deg,#7C3AED,#4F46E5);

color:#fff;

font-size:10px;

font-weight:700;

letter-spacing:.5px;

padding:4px 9px;

border-radius:20px;
}

.wcard-body{

padding:14px;
}

.wcard-brand{

font-size:11px;

color:#9CA3AF;

text-transform:uppercase;

letter-spacing:.6px;
}

.wcard-name{

display:block;

font-weight:600;

font-size:14px;

margin:5px 0 6px;

color:#111827;

line-height:1.35;
}

.wcard-name:hover{

color:#4F46E5;
}

.wcard-rating{

display:flex;

align-items:center;

gap:4px;

font-size:12px;

color:#111827;
}

.wcard-rating small{

color:#9CA3AF;
}

.wcard-price{

margin:10px 0 12px;

display:flex;

align-items:baseline;

gap:8px;
}

.wcard-price strong{

font-size:17px;
}

.wcard-mrp{

color:#9CA3AF;

text-decoration:line-through;

font-size:13px;
}

.wcard-off{

color:#22C55E;

font-size:12px;

font-weight:600;
}

.wcard-moved{

display:flex;

align-items:center;

gap:6px;

color:#16A34A;

font-size:13px;

font-weight:600;

margin-bottom:8px;
}

.wcard-actions{

display:flex;

gap:8px;
}

.move-btn{

flex:1;

background:#4F46E5;

color:#fff;

border:none;

border-radius:10px;

padding:10px 8px;

font-weight:600;

font-size:13px;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;

gap:6px;
}

.move-btn:hover{

background:#4338CA;
}

.share-btn{

border:1.5px solid #4F46E5;

color:#4F46E5;

background:#fff;

border-radius:10px;

padding:10px 12px;

font-weight:600;

font-size:13px;

cursor:pointer;

display:flex;

align-items:center;

gap:6px;
}

.share-btn.copied{

background:#22C55E;

border-color:#22C55E;

color:#fff;
}

.del-btn{

border:1.5px solid #FECACA;

color:#EF4444;

background:#FEF2F2;

border-radius:10px;

padding:10px;

cursor:pointer;

display:flex;

align-items:center;
}

.del-btn:hover{

background:#FEE2E2;
}

.wcard-removed{

position:absolute;

inset:0;

background:rgba(255,255,255,.92);

display:flex;

align-items:center;

justify-content:center;

gap:6px;

font-weight:600;

color:#16A34A;

animation:fade .25s ease;
}

@keyframes fade{

from{opacity:0}

to{opacity:1}
}
`, "components/WishlistCard/WishlistCard.css");

// src/components/WishlistCard/WishlistCard.jsx
import { jsx as jsx35, jsxs as jsxs35 } from "react/jsx-runtime";
var fmt6 = (n) => n.toLocaleString("en-IN");
function WishlistCard({ product }) {
  const [inList, setInList] = useState14(isInWishlist(product.id));
  const [moved, setMoved] = useState14(false);
  const [copied, setCopied] = useState14(false);
  useEffect4(
    () => subscribeWishlist(() => setInList(isInWishlist(product.id))),
    [product.id]
  );
  const handleMoveToCart = () => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setMoved(true);
  };
  const handleDelete = () => {
    removeFromWishlist(product.id);
  };
  const handleShare = async () => {
    const url = window.location.origin + "/products/" + product.id;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs35("div", { className: "wcard", children: [
    /* @__PURE__ */ jsxs35(Link6, { to: "/products/" + product.id, className: "wcard-img", children: [
      /* @__PURE__ */ jsx35("img", { src: product.image, alt: product.name, loading: "lazy" }),
      product.aiPick && /* @__PURE__ */ jsx35("span", { className: "ai-chip", children: "AI PICK" })
    ] }),
    /* @__PURE__ */ jsxs35("div", { className: "wcard-body", children: [
      /* @__PURE__ */ jsx35("div", { className: "wcard-brand", children: product.brand }),
      /* @__PURE__ */ jsx35(Link6, { to: "/products/" + product.id, className: "wcard-name", children: product.name }),
      /* @__PURE__ */ jsxs35("div", { className: "wcard-rating", children: [
        /* @__PURE__ */ jsx35(Star5, { size: 13, fill: "#F59E0B", color: "#F59E0B" }),
        /* @__PURE__ */ jsx35("span", { children: product.rating }),
        /* @__PURE__ */ jsxs35("small", { children: [
          "(",
          product.reviews,
          " reviews)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs35("div", { className: "wcard-price", children: [
        /* @__PURE__ */ jsxs35("strong", { children: [
          "\u20B9",
          fmt6(product.price)
        ] }),
        product.mrp > product.price && /* @__PURE__ */ jsxs35("span", { className: "wcard-mrp", children: [
          "\u20B9",
          fmt6(product.mrp)
        ] }),
        product.discount && /* @__PURE__ */ jsxs35("span", { className: "wcard-off", children: [
          product.discount,
          "% off"
        ] })
      ] }),
      moved && /* @__PURE__ */ jsxs35("div", { className: "wcard-moved", children: [
        /* @__PURE__ */ jsx35(Check2, { size: 15 }),
        " Moved to cart"
      ] }),
      /* @__PURE__ */ jsxs35("div", { className: "wcard-actions", children: [
        /* @__PURE__ */ jsxs35("button", { className: "move-btn", onClick: handleMoveToCart, children: [
          /* @__PURE__ */ jsx35(ShoppingCart9, { size: 16 }),
          "Move to Cart"
        ] }),
        /* @__PURE__ */ jsxs35(
          "button",
          {
            className: "share-btn" + (copied ? " copied" : ""),
            onClick: handleShare,
            title: "Share",
            children: [
              /* @__PURE__ */ jsx35(Share2, { size: 16 }),
              copied ? "Copied" : "Share"
            ]
          }
        ),
        /* @__PURE__ */ jsx35(
          "button",
          {
            className: "del-btn",
            onClick: handleDelete,
            title: "Delete",
            children: /* @__PURE__ */ jsx35(Trash22, { size: 16 })
          }
        )
      ] })
    ] }),
    !inList && /* @__PURE__ */ jsxs35("div", { className: "wcard-removed", children: [
      /* @__PURE__ */ jsx35(Check2, { size: 16 }),
      " Removed from wishlist"
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\pages\Wishlist\Wishlist.css
collectCSS(`.wishlist-page{

padding:30px;
}

.wishlist-head{

margin-bottom:24px;
}

.wishlist-head h1{

font-family:Poppins;

font-size:26px;

display:flex;

align-items:center;

gap:10px;
}

.wishlist-count{

background:#EEF2FF;

color:#4F46E5;

font-size:14px;

padding:3px 12px;

border-radius:20px;
}

.wishlist-head p{

color:#6B7280;

margin-top:6px;
}

.wishlist-grid{

display:grid;

grid-template-columns:repeat(auto-fill,minmax(240px,1fr));

gap:20px;
}

.wishlist-empty{

background:#fff;

border-radius:18px;

padding:70px 20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.wishlist-empty h2{

font-family:Poppins;

margin:14px 0 6px;
}

.wishlist-empty p{

color:#6B7280;

margin-bottom:22px;
}

.wishlist-empty a{

display:inline-flex;

align-items:center;

gap:8px;

background:#4F46E5;

color:#fff;

padding:13px 26px;

border-radius:12px;

font-weight:600;
}

.wishlist-ai{

margin-top:40px;
}
`, "pages/Wishlist/Wishlist.css");

// src/pages/Wishlist/Wishlist.jsx
import { Fragment as Fragment10, jsx as jsx36, jsxs as jsxs36 } from "react/jsx-runtime";
function Wishlist() {
  const [items3, setItems] = useState15(getWishlist());
  useEffect5(
    () => subscribeWishlist(() => {
      setItems(getWishlist());
    }),
    []
  );
  const products2 = useMemo3(
    () => items3.map((w) => getProductById(w.productId)).filter(Boolean),
    [items3]
  );
  const excludeIds = useMemo3(
    () => [.../* @__PURE__ */ new Set([...items3.map((w) => w.productId), ...getCartItems().map((c) => c.productId)])],
    [items3]
  );
  return /* @__PURE__ */ jsxs36(Fragment10, { children: [
    /* @__PURE__ */ jsx36(Sidebar, {}),
    /* @__PURE__ */ jsxs36("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx36(Navbar, {}),
      /* @__PURE__ */ jsxs36("div", { className: "wishlist-page", children: [
        /* @__PURE__ */ jsxs36("div", { className: "wishlist-head", children: [
          /* @__PURE__ */ jsxs36("h1", { children: [
            /* @__PURE__ */ jsx36(Heart7, { size: 26, fill: "#EF4444", color: "#EF4444" }),
            "My Wishlist",
            /* @__PURE__ */ jsx36("span", { className: "wishlist-count", children: products2.length })
          ] }),
          products2.length > 0 && /* @__PURE__ */ jsx36("p", { children: "Tap on a product to view details or move it to your cart." })
        ] }),
        products2.length === 0 ? /* @__PURE__ */ jsxs36("div", { className: "wishlist-empty", children: [
          /* @__PURE__ */ jsx36(Heart7, { size: 52, color: "#D1D5DB" }),
          /* @__PURE__ */ jsx36("h2", { children: "Your wishlist is empty" }),
          /* @__PURE__ */ jsx36("p", { children: "Save your favourite products and find them here." }),
          /* @__PURE__ */ jsxs36(Link7, { to: "/products", children: [
            /* @__PURE__ */ jsx36(ArrowLeft, { size: 18 }),
            "Continue Shopping"
          ] })
        ] }) : /* @__PURE__ */ jsxs36(Fragment10, { children: [
          /* @__PURE__ */ jsx36("div", { className: "wishlist-grid", children: products2.map((p) => /* @__PURE__ */ jsx36(WishlistCard, { product: p }, p.id)) }),
          /* @__PURE__ */ jsx36("div", { className: "wishlist-ai", children: /* @__PURE__ */ jsx36(SuggestedProducts, { excludeIds }) })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Checkout/Checkout.jsx
import { useEffect as useEffect6, useMemo as useMemo4, useState as useState17 } from "react";
import { Link as Link8, useNavigate as useNavigate7 } from "react-router-dom";
import { Gift as Gift6, ChevronRight as ChevronRight2 } from "lucide-react";

// src/components/AddressCard/AddressCard.jsx
import { useState as useState16 } from "react";
import { MapPin as MapPin2, Pencil, Phone, X as X3, Save } from "lucide-react";

// css:C:\CustomerDashbord\src\components\AddressCard\AddressCard.css
collectCSS(`.address-card,
.address-form{

background:#fff;

border-radius:16px;

padding:22px;

box-shadow:0 6px 16px rgba(0,0,0,.05);

}

.address-head{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:15px;

}

.address-head h3{

display:flex;

align-items:center;

gap:8px;

font-family:Poppins;

font-size:18px;

}

.change-btn{

display:flex;

align-items:center;

gap:6px;

border:none;

background:#EEF2FF;

color:#4F46E5;

padding:8px 14px;

border-radius:8px;

cursor:pointer;

font-weight:600;

font-size:13px;

}

.address-card h4{

font-size:16px;

margin-bottom:8px;

}

.address-card p{

color:#374151;

font-size:14px;

line-height:1.6;

}

.address-card .phone{

display:flex;

align-items:center;

gap:6px;

margin-top:8px;

color:#6B7280;
}

.address-form-head{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:15px;

}

.address-form-head h3{

font-family:Poppins;

font-size:18px;

}

.x-btn{

border:none;

background:#F8FAFC;

width:32px;

height:32px;

border-radius:8px;

cursor:pointer;

display:flex;

align-items:center;

justify-content:center;
}

.address-form input,
.address-form textarea{

width:100%;

padding:12px 14px;

border:1.5px solid #E2E8F0;

border-radius:10px;

margin-bottom:12px;

font-size:14px;

font-family:inherit;

outline:none;

}

.address-form input:focus,
.address-form textarea:focus{

border-color:#4F46E5;
}

.address-form-row{

display:flex;

gap:10px;

}

.save-address-btn{

display:flex;

align-items:center;

gap:8px;

justify-content:center;

width:100%;

padding:13px;

background:#4F46E5;

color:white;

border:none;

border-radius:10px;

cursor:pointer;

font-weight:600;
}

@media(max-width:600px){

.address-form-row{

flex-direction:column;
}
}
`, "components/AddressCard/AddressCard.css");

// src/components/AddressCard/AddressCard.jsx
import { jsx as jsx37, jsxs as jsxs37 } from "react/jsx-runtime";
function AddressCard({ address, onSave }) {
  const [editing, setEditing] = useState16(false);
  const [form, setForm] = useState16(address);
  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
    setEditing(false);
  };
  if (editing) {
    return /* @__PURE__ */ jsxs37("form", { className: "address-form", onSubmit: handleSave, children: [
      /* @__PURE__ */ jsxs37("div", { className: "address-form-head", children: [
        /* @__PURE__ */ jsx37("h3", { children: "Edit Delivery Address" }),
        /* @__PURE__ */ jsx37("button", { type: "button", className: "x-btn", onClick: () => setEditing(false), children: /* @__PURE__ */ jsx37(X3, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsx37(
        "input",
        {
          placeholder: "Full Name",
          required: true,
          value: form.fullName,
          onChange: (e) => setForm({ ...form, fullName: e.target.value })
        }
      ),
      /* @__PURE__ */ jsx37(
        "input",
        {
          placeholder: "Phone Number",
          required: true,
          maxLength: "10",
          value: form.phone,
          onChange: (e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
        }
      ),
      /* @__PURE__ */ jsx37(
        "textarea",
        {
          placeholder: "Address Line (Flat, Building, Street)",
          required: true,
          rows: "2",
          value: form.addressLine,
          onChange: (e) => setForm({ ...form, addressLine: e.target.value })
        }
      ),
      /* @__PURE__ */ jsxs37("div", { className: "address-form-row", children: [
        /* @__PURE__ */ jsx37(
          "input",
          {
            placeholder: "City",
            required: true,
            value: form.city,
            onChange: (e) => setForm({ ...form, city: e.target.value })
          }
        ),
        /* @__PURE__ */ jsx37(
          "input",
          {
            placeholder: "State",
            required: true,
            value: form.state,
            onChange: (e) => setForm({ ...form, state: e.target.value })
          }
        ),
        /* @__PURE__ */ jsx37(
          "input",
          {
            placeholder: "Pincode",
            required: true,
            maxLength: "6",
            value: form.pincode,
            onChange: (e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs37("button", { className: "save-address-btn", type: "submit", children: [
        /* @__PURE__ */ jsx37(Save, { size: 16 }),
        "Save Address"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs37("div", { className: "address-card", children: [
    /* @__PURE__ */ jsxs37("div", { className: "address-head", children: [
      /* @__PURE__ */ jsxs37("h3", { children: [
        /* @__PURE__ */ jsx37(MapPin2, { size: 18 }),
        "Delivery Address"
      ] }),
      /* @__PURE__ */ jsxs37("button", { className: "change-btn", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsx37(Pencil, { size: 14 }),
        "Change"
      ] })
    ] }),
    /* @__PURE__ */ jsx37("h4", { children: address.fullName }),
    /* @__PURE__ */ jsx37("p", { children: address.addressLine }),
    /* @__PURE__ */ jsxs37("p", { children: [
      address.city,
      ", ",
      address.state,
      " - ",
      address.pincode
    ] }),
    /* @__PURE__ */ jsxs37("p", { className: "phone", children: [
      /* @__PURE__ */ jsx37(Phone, { size: 14 }),
      address.phone
    ] })
  ] });
}

// src/components/ShippingMethod/ShippingMethod.jsx
import { Truck as Truck5 } from "lucide-react";

// src/services/orders.js
var ORDERS_KEY = "clustermind_orders";
var ADDRESS_KEY = "clustermind_address";
var readOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};
var writeOrders = (orders2) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders2));
};
var defaultAddress = {
  fullName: "Rahul Sharma",
  phone: "9876543210",
  addressLine: "Flat 102, Green Residency",
  city: "Solapur",
  state: "Maharashtra",
  pincode: "413001"
};
var getSavedAddress = () => {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null") || defaultAddress;
  } catch {
    return defaultAddress;
  }
};
var saveAddress = (address) => {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
};
var SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", eta: "2-3 Days", price: 0 },
  { id: "express", label: "Express Delivery", eta: "Tomorrow", price: 99 },
  { id: "same-day", label: "Same Day Delivery", eta: "Today", price: 199 }
];
var PAYMENT_METHODS = [
  { id: "upi", label: "UPI", color: "#7C3AED" },
  { id: "credit", label: "Credit Card", color: "#2563EB" },
  { id: "debit", label: "Debit Card", color: "#16A34A" },
  { id: "wallet", label: "Wallet", color: "#F59E0B" },
  { id: "cod", label: "Cash on Delivery", color: "#92400E" }
];
var placeOrder = ({ items: items3, address, shipping, payment, totals }) => {
  const orders2 = readOrders();
  const order = {
    id: "ORD" + Date.now(),
    items: items3.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      image: i.product.image,
      quantity: i.quantity,
      price: i.product.price
    })),
    address,
    shipping: shipping.label,
    shippingEta: shipping.eta,
    shippingPrice: shipping.price,
    payment: payment.label,
    totals,
    status: "Processing",
    placedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  orders2.unshift(order);
  writeOrders(orders2);
  return order;
};
var getOrderById = (id) => readOrders().find((o) => o.id === id);

// css:C:\CustomerDashbord\src\components\ShippingMethod\ShippingMethod.css
collectCSS(`.checkout-card{

background:#fff;

border-radius:16px;

padding:22px;

box-shadow:0 6px 16px rgba(0,0,0,.05);

}

.checkout-card h3{

display:flex;

align-items:center;

gap:8px;

font-family:Poppins;

font-size:18px;

margin-bottom:15px;

}

.shipping-list{

display:flex;

flex-direction:column;

gap:10px;

}

.shipping-option{

display:flex;

align-items:center;

gap:12px;

border:1.5px solid #E2E8F0;

border-radius:12px;

padding:14px 16px;

cursor:pointer;

transition:.3s;

}

.shipping-option:hover{

border-color:#A5B4FC;

}

.shipping-option.active{

border-color:#4F46E5;

background:#EEF2FF;

}

.shipping-option input{

accent-color:#4F46E5;

width:17px;

height:17px;

}

.shipping-info{

flex:1;

display:flex;

flex-direction:column;

}

.shipping-info strong{

font-size:15px;

}

.shipping-info small{

color:#6B7280;

font-size:13px;

}

.shipping-price{

font-weight:700;

color:#4F46E5;

font-size:14px;
}
`, "components/ShippingMethod/ShippingMethod.css");

// src/components/ShippingMethod/ShippingMethod.jsx
import { jsx as jsx38, jsxs as jsxs38 } from "react/jsx-runtime";
function ShippingMethod({ selected, onChange }) {
  return /* @__PURE__ */ jsxs38("div", { className: "checkout-card", children: [
    /* @__PURE__ */ jsxs38("h3", { children: [
      /* @__PURE__ */ jsx38(Truck5, { size: 18 }),
      "Shipping Method"
    ] }),
    /* @__PURE__ */ jsx38("div", { className: "shipping-list", children: SHIPPING_METHODS.map((method) => /* @__PURE__ */ jsxs38(
      "label",
      {
        className: `shipping-option ${selected === method.id ? "active" : ""}`,
        children: [
          /* @__PURE__ */ jsx38(
            "input",
            {
              type: "radio",
              name: "shipping",
              checked: selected === method.id,
              onChange: () => onChange(method.id)
            }
          ),
          /* @__PURE__ */ jsxs38("span", { className: "shipping-info", children: [
            /* @__PURE__ */ jsx38("strong", { children: method.label }),
            /* @__PURE__ */ jsx38("small", { children: method.eta })
          ] }),
          /* @__PURE__ */ jsx38("span", { className: "shipping-price", children: method.price === 0 ? "FREE" : `\u20B9${method.price}` })
        ]
      },
      method.id
    )) })
  ] });
}

// src/components/PaymentMethod/PaymentMethod.jsx
import { CreditCard as CreditCard2 } from "lucide-react";

// css:C:\CustomerDashbord\src\components\PaymentMethod\PaymentMethod.css
collectCSS(`.checkout-card{

background:#fff;

border-radius:16px;

padding:22px;

box-shadow:0 6px 16px rgba(0,0,0,.05);

}

.checkout-card h3{

display:flex;

align-items:center;

gap:8px;

font-family:Poppins;

font-size:18px;

margin-bottom:15px;

}

.payment-grid{

display:grid;

grid-template-columns:repeat(2,1fr);

gap:10px;

}

.payment-option{

display:flex;

align-items:center;

gap:10px;

border:1.5px solid #E2E8F0;

border-radius:12px;

padding:13px 15px;

cursor:pointer;

transition:.3s;

font-size:14px;

font-weight:500;

}

.payment-option:hover{

border-color:#A5B4FC;

}

.payment-option.active{

border-color:#4F46E5;

background:#EEF2FF;

}

.payment-option input{

accent-color:#4F46E5;

width:16px;

height:16px;

}

.payment-dot{

width:14px;

height:14px;

border-radius:50%;
flex-shrink:0;
}

@media(max-width:600px){

.payment-grid{

grid-template-columns:1fr;
}
}
`, "components/PaymentMethod/PaymentMethod.css");

// src/components/PaymentMethod/PaymentMethod.jsx
import { jsx as jsx39, jsxs as jsxs39 } from "react/jsx-runtime";
function PaymentMethod({ selected, onChange }) {
  return /* @__PURE__ */ jsxs39("div", { className: "checkout-card", children: [
    /* @__PURE__ */ jsxs39("h3", { children: [
      /* @__PURE__ */ jsx39(CreditCard2, { size: 18 }),
      "Payment Method"
    ] }),
    /* @__PURE__ */ jsx39("div", { className: "payment-grid", children: PAYMENT_METHODS.map((method) => /* @__PURE__ */ jsxs39(
      "label",
      {
        className: `payment-option ${selected === method.id ? "active" : ""}`,
        children: [
          /* @__PURE__ */ jsx39(
            "input",
            {
              type: "radio",
              name: "payment",
              checked: selected === method.id,
              onChange: () => onChange(method.id)
            }
          ),
          /* @__PURE__ */ jsx39(
            "span",
            {
              className: "payment-dot",
              style: { background: method.color }
            }
          ),
          method.label
        ]
      },
      method.id
    )) })
  ] });
}

// src/components/PlaceOrderButton/PlaceOrderButton.jsx
import { Loader2, ShoppingBag } from "lucide-react";

// css:C:\CustomerDashbord\src\components\PlaceOrderButton\PlaceOrderButton.css
collectCSS(`.place-order-btn{

width:100%;

display:flex;

align-items:center;

justify-content:center;

gap:10px;

padding:16px;

margin-top:15px;

background:linear-gradient(135deg,#4F46E5,#7C3AED);

color:white;

border:none;

border-radius:14px;

font-size:16px;

font-weight:600;

cursor:pointer;

transition:.3s;

}

.place-order-btn:hover:not(:disabled){

opacity:.92;

box-shadow:0 10px 25px rgba(79,70,229,.35);
}

.place-order-btn:disabled{

opacity:.6;

cursor:not-allowed;
}

.spin{

animation:rotate 1s linear infinite;
}

@keyframes rotate{

to{transform:rotate(360deg)}
}
`, "components/PlaceOrderButton/PlaceOrderButton.css");

// src/components/PlaceOrderButton/PlaceOrderButton.jsx
import { Fragment as Fragment11, jsx as jsx40, jsxs as jsxs40 } from "react/jsx-runtime";
var fmt7 = (n) => n.toLocaleString("en-IN");
function PlaceOrderButton({ total, placing, onPlaceOrder }) {
  return /* @__PURE__ */ jsx40("button", { className: "place-order-btn", onClick: onPlaceOrder, disabled: placing, children: placing ? /* @__PURE__ */ jsxs40(Fragment11, { children: [
    /* @__PURE__ */ jsx40(Loader2, { size: 18, className: "spin" }),
    "Placing Order..."
  ] }) : /* @__PURE__ */ jsxs40(Fragment11, { children: [
    /* @__PURE__ */ jsx40(ShoppingBag, { size: 18 }),
    "Place Order \xB7 \u20B9",
    fmt7(total)
  ] }) });
}

// css:C:\CustomerDashbord\src\pages\Checkout\Checkout.css
collectCSS(`.checkout-page{

padding:30px;

}

.checkout-head{

display:flex;

align-items:center;

justify-content:space-between;

margin-bottom:25px;

flex-wrap:wrap;

gap:10px;

}

.checkout-head h1{

font-family:Poppins;

font-size:28px;

}

.checkout-steps{

display:flex;

align-items:center;

gap:8px;

font-size:13px;

color:#9CA3AF;

}

.checkout-steps .active{

color:#4F46E5;

font-weight:600;

}

.checkout-steps .done{

color:#15803D;

font-weight:600;
}

.checkout-layout{

display:grid;

grid-template-columns:1fr 360px;

gap:25px;

align-items:start;

}

.checkout-left{

display:flex;

flex-direction:column;

gap:20px;

}

.checkout-right{

position:sticky;

top:20px;
}

.gift-row label{

display:flex;

align-items:center;

gap:10px;

cursor:pointer;

font-size:15px;

font-weight:500;

}

.gift-row input{

accent-color:#4F46E5;

width:17px;

height:17px;
}

.empty-cart{

background:#fff;

border-radius:18px;

padding:70px 20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.06);

margin:30px;

}

.empty-cart h2{

font-family:Poppins;

margin-bottom:8px;
}

.empty-cart p{

color:#6B7280;

margin-bottom:25px;
}

.empty-btn{

display:inline-block;

padding:14px 28px;

background:#4F46E5;

color:white;

border-radius:12px;

font-weight:600;
}

@media(max-width:1024px){

.checkout-layout{

grid-template-columns:1fr;
}

.checkout-right{

position:static;
}
}

@media(max-width:600px){

.checkout-page{

padding:15px;
}
}
`, "pages/Checkout/Checkout.css");

// src/pages/Checkout/Checkout.jsx
import { Fragment as Fragment12, jsx as jsx41, jsxs as jsxs41 } from "react/jsx-runtime";
function Checkout() {
  const navigate = useNavigate7();
  const [cart, setCart] = useState17(getCartItems());
  const [, force] = useState17(0);
  const [address, setAddress] = useState17(getSavedAddress());
  const [shipping, setShipping] = useState17("standard");
  const [payment, setPayment] = useState17("upi");
  const [gift, setGift] = useState17(false);
  const [placing, setPlacing] = useState17(false);
  useEffect6(() => subscribeCart(() => {
    setCart(getCartItems());
    force((n) => n + 1);
  }), []);
  const items3 = useMemo4(
    () => cart.map((i) => ({ ...i, product: getProductById(i.productId) })).filter((i) => i.product),
    [cart]
  );
  const coupon = getAppliedCoupon();
  const discount = coupon?.discount || 0;
  const subtotal = items3.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shipping);
  const delivery = shippingMethod?.price || 0;
  const gst = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + delivery + gst);
  const handleAddressSave = (addr) => {
    setAddress(addr);
    saveAddress(addr);
  };
  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const order = placeOrder({
        items: items3,
        address,
        shipping: shippingMethod,
        payment: PAYMENT_METHODS.find((p) => p.id === payment),
        totals: { subtotal, discount, delivery, gst, total }
      });
      clearCart();
      navigate(`/order-success/${order.id}`);
    }, 1200);
  };
  if (items3.length === 0) {
    return /* @__PURE__ */ jsxs41(Fragment12, { children: [
      /* @__PURE__ */ jsx41(Sidebar, {}),
      /* @__PURE__ */ jsxs41("div", { style: { marginLeft: "260px" }, children: [
        /* @__PURE__ */ jsx41(Navbar, {}),
        /* @__PURE__ */ jsxs41("div", { className: "empty-cart", children: [
          /* @__PURE__ */ jsx41("h2", { children: "Your cart is empty" }),
          /* @__PURE__ */ jsx41("p", { children: "Add products to your cart before checking out." }),
          /* @__PURE__ */ jsx41(Link8, { to: "/products", className: "empty-btn", children: "Browse Products" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs41(Fragment12, { children: [
    /* @__PURE__ */ jsx41(Sidebar, {}),
    /* @__PURE__ */ jsxs41("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx41(Navbar, {}),
      /* @__PURE__ */ jsxs41("div", { className: "checkout-page", children: [
        /* @__PURE__ */ jsxs41("div", { className: "checkout-head", children: [
          /* @__PURE__ */ jsx41("h1", { children: "Checkout" }),
          /* @__PURE__ */ jsxs41("div", { className: "checkout-steps", children: [
            /* @__PURE__ */ jsx41("span", { className: "done", children: "Cart" }),
            /* @__PURE__ */ jsx41(ChevronRight2, { size: 14 }),
            /* @__PURE__ */ jsx41("span", { className: "active", children: "Address & Payment" }),
            /* @__PURE__ */ jsx41(ChevronRight2, { size: 14 }),
            /* @__PURE__ */ jsx41("span", { children: "Order Success" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs41("div", { className: "checkout-layout", children: [
          /* @__PURE__ */ jsxs41("div", { className: "checkout-left", children: [
            /* @__PURE__ */ jsx41(AddressCard, { address, onSave: handleAddressSave }),
            /* @__PURE__ */ jsx41(ShippingMethod, { selected: shipping, onChange: setShipping }),
            /* @__PURE__ */ jsx41(PaymentMethod, { selected: payment, onChange: setPayment }),
            /* @__PURE__ */ jsx41("div", { className: "checkout-card gift-row", children: /* @__PURE__ */ jsxs41("label", { children: [
              /* @__PURE__ */ jsx41(
                "input",
                {
                  type: "checkbox",
                  checked: gift,
                  onChange: (e) => setGift(e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx41(Gift6, { size: 18 }),
              "This order is a gift"
            ] }) }),
            /* @__PURE__ */ jsx41(
              CouponBox,
              {
                applied: coupon,
                onCouponChange: () => force((n) => n + 1)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs41("div", { className: "checkout-right", children: [
            /* @__PURE__ */ jsx41(
              OrderSummary,
              {
                subtotal,
                discount,
                delivery,
                gst,
                total,
                coupon: coupon?.code,
                onClearCoupon: () => {
                  clearCoupon();
                  force((n) => n + 1);
                },
                deliveryLabel: "Shipping",
                totalLabel: "Grand Total",
                showButton: false
              }
            ),
            /* @__PURE__ */ jsx41(
              PlaceOrderButton,
              {
                total,
                placing,
                onPlaceOrder: handlePlaceOrder
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/OrderSuccess/OrderSuccess.jsx
import { useParams as useParams2, Link as Link9 } from "react-router-dom";
import { CheckCircle2 as CheckCircle23, Truck as Truck6, Package as Package4, Calendar } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\OrderSuccess\OrderSuccess.css
collectCSS(`.success-page{

max-width:560px;

margin:40px auto;

background:#fff;

border-radius:20px;

padding:45px 35px;

box-shadow:0 10px 30px rgba(0,0,0,.08);

text-align:center;

}

.success-icon{

margin-bottom:18px;

animation:pop .4s ease;
}

@keyframes pop{

from{transform:scale(.6);opacity:0}

to{transform:scale(1);opacity:1}
}

.success-page h1{

font-family:Poppins;

font-size:26px;

margin-bottom:10px;
}

.success-page > p{

color:#6B7280;

margin-bottom:25px;
}

.order-details{

text-align:left;

background:#F8FAFC;

border-radius:14px;

padding:20px;

margin-bottom:25px;
}

.detail-row{

display:flex;

align-items:center;

gap:10px;

padding:10px 0;

font-size:14px;
}

.detail-row span{

flex:1;

color:#6B7280;
}

.detail-row strong{

font-weight:600;
}

.detail-row.total{

border-top:1px dashed #E2E8F0;

margin-top:5px;
}

.detail-row.total span{

color:#111827;
}

.detail-row.total strong{

color:#4F46E5;

font-size:17px;
}

.success-buttons{

display:flex;

gap:12px;

justify-content:center;
}

.track-btn,
.continue-btn{

flex:1;

padding:14px;

border-radius:12px;

font-weight:600;

font-size:15px;

display:flex;

align-items:center;

justify-content:center;

gap:8px;
}

.track-btn{

background:#4F46E5;

color:white;
}

.continue-btn{

border:1.5px solid #4F46E5;

color:#4F46E5;
}

.track-btn:hover{

background:#4338CA;
}

.continue-btn:hover{

background:#EEF2FF;
}

@media(max-width:600px){

.success-page{

margin:15px;

padding:30px 20px;
}

.success-buttons{

flex-direction:column;
}
}
`, "pages/OrderSuccess/OrderSuccess.css");

// src/pages/OrderSuccess/OrderSuccess.jsx
import { jsx as jsx42, jsxs as jsxs42 } from "react/jsx-runtime";
var fmt8 = (n) => n.toLocaleString("en-IN");
function OrderSuccess() {
  const { orderId } = useParams2();
  const order = getOrderById(orderId);
  return /* @__PURE__ */ jsxs42("div", { className: "success-page", children: [
    /* @__PURE__ */ jsx42("div", { className: "success-icon", children: /* @__PURE__ */ jsx42(CheckCircle23, { size: 70, color: "#22C55E" }) }),
    /* @__PURE__ */ jsx42("h1", { children: "Order Placed Successfully" }),
    /* @__PURE__ */ jsx42("p", { children: "Thank you for shopping with us. Your order has been confirmed." }),
    order && /* @__PURE__ */ jsxs42("div", { className: "order-details", children: [
      /* @__PURE__ */ jsxs42("div", { className: "detail-row", children: [
        /* @__PURE__ */ jsx42(Package4, { size: 16 }),
        /* @__PURE__ */ jsx42("span", { children: "Order ID" }),
        /* @__PURE__ */ jsx42("strong", { children: order.id })
      ] }),
      /* @__PURE__ */ jsxs42("div", { className: "detail-row", children: [
        /* @__PURE__ */ jsx42(Calendar, { size: 16 }),
        /* @__PURE__ */ jsx42("span", { children: "Placed On" }),
        /* @__PURE__ */ jsx42("strong", { children: new Date(order.placedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }) })
      ] }),
      /* @__PURE__ */ jsxs42("div", { className: "detail-row", children: [
        /* @__PURE__ */ jsx42(Truck6, { size: 16 }),
        /* @__PURE__ */ jsx42("span", { children: "Estimated Delivery" }),
        /* @__PURE__ */ jsx42("strong", { children: order.shippingEta })
      ] }),
      /* @__PURE__ */ jsxs42("div", { className: "detail-row", children: [
        /* @__PURE__ */ jsx42(Package4, { size: 16 }),
        /* @__PURE__ */ jsx42("span", { children: "Items" }),
        /* @__PURE__ */ jsx42("strong", { children: order.items.reduce((s, i) => s + i.quantity, 0) })
      ] }),
      /* @__PURE__ */ jsxs42("div", { className: "detail-row total", children: [
        /* @__PURE__ */ jsx42("span", { children: "Total Paid" }),
        /* @__PURE__ */ jsxs42("strong", { children: [
          "\u20B9",
          fmt8(order.totals.total)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs42("div", { className: "success-buttons", children: [
      /* @__PURE__ */ jsxs42(Link9, { to: "/orders", className: "track-btn", children: [
        /* @__PURE__ */ jsx42(Truck6, { size: 18 }),
        "Track Order"
      ] }),
      /* @__PURE__ */ jsx42(Link9, { to: "/products", className: "continue-btn", children: "Continue Shopping" })
    ] })
  ] });
}

// src/pages/Orders/Orders.jsx
import { Package as Package5 } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\Orders\Orders.css
collectCSS(`.orders-page{

padding:30px;
}

.orders-page h1{

font-family:Poppins;

font-size:28px;

margin-bottom:25px;
}

.orders-placeholder{

background:#fff;

border-radius:18px;

padding:80px 20px;

text-align:center;

box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.orders-placeholder h2{

font-family:Poppins;

margin:15px 0 8px;
}

.orders-placeholder p{

color:#6B7280;
}
`, "pages/Orders/Orders.css");

// src/pages/Orders/Orders.jsx
import { Fragment as Fragment13, jsx as jsx43, jsxs as jsxs43 } from "react/jsx-runtime";
function Orders() {
  return /* @__PURE__ */ jsxs43(Fragment13, { children: [
    /* @__PURE__ */ jsx43(Sidebar, {}),
    /* @__PURE__ */ jsxs43("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx43(Navbar, {}),
      /* @__PURE__ */ jsxs43("div", { className: "orders-page", children: [
        /* @__PURE__ */ jsx43("h1", { children: "My Orders" }),
        /* @__PURE__ */ jsxs43("div", { className: "orders-placeholder", children: [
          /* @__PURE__ */ jsx43(Package5, { size: 48, color: "#9CA3AF" }),
          /* @__PURE__ */ jsx43("h2", { children: "Orders Module Coming Soon" }),
          /* @__PURE__ */ jsx43("p", { children: "Your placed orders will appear here shortly." })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Profile/Profile.jsx
import { useState as useState18 } from "react";
import { useNavigate as useNavigate8 } from "react-router-dom";
import {
  Mail,
  Phone as Phone2,
  Calendar as Calendar2,
  Crown as Crown2,
  Gift as Gift7,
  MapPin as MapPin3,
  BadgeCheck as BadgeCheck2,
  Pencil as Pencil2,
  User as UserIcon
} from "lucide-react";

// css:C:\CustomerDashbord\src\pages\Profile\Profile.css
collectCSS(`.profile-page-main{
margin-left:260px;
min-height:100vh;
}

.profile-page{
padding:28px 30px 40px;
max-width:1280px;
margin:0 auto;
}

.pp-title{
margin-bottom:24px;
}

.pp-title h1{
font-size:32px;
font-family:Poppins;
font-weight:700;
}

.pp-title p{
font-size:14px;
color:var(--secondary);
margin-top:4px;
}

.pp-grid{
display:grid;
grid-template-columns:320px 1fr 1fr;
gap:24px;
align-items:start;
}

.pp-card{
background:#fff;
border:1px solid var(--border);
border-radius:18px;
padding:24px;
box-shadow:var(--shadow);
}

.pp-summary{
text-align:center;
}

.pp-avatar-wrap{
position:relative;
width:110px;
height:110px;
margin:0 auto 16px;
}

.pp-avatar-wrap img{
width:110px;
height:110px;
border-radius:50%;
object-fit:cover;
border:3px solid #E0E7FF;
}

.pp-camera{
position:absolute;
bottom:2px;
right:2px;
width:30px;
height:30px;
border-radius:50%;
border:none;
background:#4F46E5;
color:#fff;
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
}

.pp-summary h2{
font-size:20px;
font-family:Poppins;
}

.pp-email{
color:var(--secondary);
font-size:13px;
margin:4px 0 14px;
}

.pp-member{
display:inline-flex;
align-items:center;
gap:6px;
background:#F5F3FF;
color:#7C3AED;
padding:6px 14px;
border-radius:20px;
font-size:12.5px;
font-weight:600;
}

.pp-points{
display:flex;
align-items:center;
justify-content:center;
gap:12px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
border-radius:14px;
padding:16px;
margin:18px 0;
}

.pp-points strong{
font-size:26px;
font-family:Poppins;
display:block;
}

.pp-points span{
font-size:12px;
opacity:.9;
}

.pp-redeem{
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:#4F46E5;
color:#fff;
font-weight:600;
font-size:14.5px;
cursor:pointer;
transition:.25s;
}

.pp-redeem:hover{
background:#4338CA;
}

.pp-details h2,
.pp-addresses h2{
font-size:18px;
font-family:Poppins;
font-weight:700;
margin-bottom:18px;
}

.pp-row{
display:flex;
align-items:center;
gap:14px;
padding:13px 0;
border-bottom:1px solid var(--border);
}

.pp-row:last-child{
border-bottom:none;
}

.pp-icon{
width:38px;
height:38px;
border-radius:11px;
background:#EEF2FF;
color:#4F46E5;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.pp-row small{
display:block;
font-size:12px;
color:var(--secondary);
margin-bottom:2px;
}

.pp-row strong{
font-size:14.5px;
font-weight:600;
}

.pp-active{
color:#16A34A;
}

.pp-address{
display:flex;
align-items:flex-start;
gap:14px;
padding:13px;
background:#F8FAFC;
border-radius:12px;
margin-bottom:12px;
}

.pp-address strong{
font-size:14px;
}

.pp-address p{
font-size:13px;
color:var(--secondary);
margin-top:2px;
line-height:1.5;
}

.pp-empty{
text-align:center;
padding:20px;
color:var(--secondary);
font-size:13px;
}

.pp-empty svg{
margin:0 auto 10px;
}

.pp-add-btn{
width:100%;
padding:12px;
border:1.5px dashed #C7D2FE;
background:#EEF2FF;
color:#4F46E5;
border-radius:12px;
font-weight:600;
font-size:14px;
cursor:pointer;
transition:.25s;
}

.pp-add-btn:hover{
background:#E0E7FF;
}

@media(max-width:1200px){
.pp-grid{
grid-template-columns:1fr 1fr;
}
}

@media(max-width:1024px){
.profile-page-main{
margin-left:0;
}
}

@media(max-width:700px){
.pp-grid{
grid-template-columns:1fr;
}

.profile-page{
padding:20px 16px;
}
}
`, "pages/Profile/Profile.css");

// src/pages/Profile/Profile.jsx
import { Fragment as Fragment14, jsx as jsx44, jsxs as jsxs44 } from "react/jsx-runtime";
function Profile() {
  const navigate = useNavigate8();
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState18(false);
  if (!user) {
    navigate("/login");
    return null;
  }
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs44(Fragment14, { children: [
    /* @__PURE__ */ jsx44(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs44("div", { className: "profile-page-main", children: [
      /* @__PURE__ */ jsx44(Navbar, { onToggleSidebar: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsxs44("div", { className: "profile-page", children: [
        /* @__PURE__ */ jsxs44("div", { className: "pp-title", children: [
          /* @__PURE__ */ jsx44("h1", { children: "My Profile" }),
          /* @__PURE__ */ jsx44("p", { children: "Manage your personal information" })
        ] }),
        /* @__PURE__ */ jsxs44("div", { className: "pp-grid", children: [
          /* @__PURE__ */ jsxs44("div", { className: "pp-card pp-summary", children: [
            /* @__PURE__ */ jsxs44("div", { className: "pp-avatar-wrap", children: [
              /* @__PURE__ */ jsx44(
                "img",
                {
                  src: user.profileImage || profile_default,
                  alt: user.fullName
                }
              ),
              /* @__PURE__ */ jsx44("button", { className: "pp-camera", "aria-label": "Change photo", children: /* @__PURE__ */ jsx44(Pencil2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsx44("h2", { children: user.fullName }),
            /* @__PURE__ */ jsx44("p", { className: "pp-email", children: user.email }),
            /* @__PURE__ */ jsxs44("span", { className: "pp-member", children: [
              /* @__PURE__ */ jsx44(Crown2, { size: 15 }),
              "Premium Member"
            ] }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-points", children: [
              /* @__PURE__ */ jsx44(Gift7, { size: 20 }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("strong", { children: user.loyaltyPoints || 2450 }),
                /* @__PURE__ */ jsx44("span", { children: "Loyalty Points" })
              ] })
            ] }),
            /* @__PURE__ */ jsx44("button", { className: "pp-redeem", onClick: () => navigate("/"), children: "Redeem Rewards" })
          ] }),
          /* @__PURE__ */ jsxs44("div", { className: "pp-card pp-details", children: [
            /* @__PURE__ */ jsx44("h2", { children: "Personal Information" }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-row", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(UserIcon, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("small", { children: "Full Name" }),
                /* @__PURE__ */ jsx44("strong", { children: user.fullName })
              ] })
            ] }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-row", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(Mail, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("small", { children: "Email Address" }),
                /* @__PURE__ */ jsx44("strong", { children: user.email })
              ] })
            ] }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-row", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(Phone2, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("small", { children: "Phone Number" }),
                /* @__PURE__ */ jsx44("strong", { children: user.phone || "+91 98765 43210" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-row", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(Calendar2, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("small", { children: "Member Since" }),
                /* @__PURE__ */ jsx44("strong", { children: memberSince })
              ] })
            ] }),
            /* @__PURE__ */ jsxs44("div", { className: "pp-row", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(BadgeCheck2, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("small", { children: "Account Status" }),
                /* @__PURE__ */ jsxs44("strong", { className: "pp-active", children: [
                  "Active \xB7 ",
                  user.role
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs44("div", { className: "pp-card pp-addresses", children: [
            /* @__PURE__ */ jsx44("h2", { children: "Saved Addresses" }),
            user.address && user.address.length ? user.address.map((addr, i) => /* @__PURE__ */ jsxs44("div", { className: "pp-address", children: [
              /* @__PURE__ */ jsx44("span", { className: "pp-icon", children: /* @__PURE__ */ jsx44(MapPin3, { size: 18 }) }),
              /* @__PURE__ */ jsxs44("div", { children: [
                /* @__PURE__ */ jsx44("strong", { children: addr.label || "Address " + (i + 1) }),
                /* @__PURE__ */ jsx44("p", { children: addr.address || addr })
              ] })
            ] }, i)) : /* @__PURE__ */ jsxs44("div", { className: "pp-empty", children: [
              /* @__PURE__ */ jsx44(MapPin3, { size: 40, color: "#9CA3AF" }),
              /* @__PURE__ */ jsx44("p", { children: "No saved addresses yet" })
            ] }),
            /* @__PURE__ */ jsx44("button", { className: "pp-add-btn", children: "+ Add New Address" })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Feedback/Feedback.jsx
import { useState as useState19 } from "react";
import { useNavigate as useNavigate9 } from "react-router-dom";
import {
  MessageSquare as MessageSquare2,
  Star as Star6,
  Send,
  CheckCircle2 as CheckCircle24,
  Heart as Heart8,
  Package as Package6,
  Truck as Truck7,
  Sparkles as Sparkles12
} from "lucide-react";

// css:C:\CustomerDashbord\src\pages\Feedback\Feedback.css
collectCSS(`.feedback-page-main{
margin-left:260px;
min-height:100vh;
}

.feedback-page{
padding:28px 30px 40px;
max-width:1280px;
margin:0 auto;
}

.fb-title{
margin-bottom:24px;
}

.fb-title h1{
font-size:32px;
font-family:Poppins;
font-weight:700;
}

.fb-title p{
font-size:14px;
color:var(--secondary);
margin-top:4px;
}

.fb-grid{
display:grid;
grid-template-columns:1fr 340px;
gap:24px;
align-items:start;
}

.fb-card{
background:#fff;
border:1px solid var(--border);
border-radius:18px;
padding:26px;
box-shadow:var(--shadow);
}

.fb-form-card h2,
.fb-side-head h2{
font-size:18px;
font-family:Poppins;
font-weight:700;
}

.fb-field{
margin-bottom:20px;
}

.fb-field label{
display:block;
font-size:13.5px;
font-weight:600;
color:#374151;
margin-bottom:10px;
}

.fb-stars{
display:flex;
gap:6px;
}

.fb-stars button{
background:none;
border:none;
cursor:pointer;
padding:0;
transition:transform .15s;
}

.fb-stars button:hover{
transform:scale(1.15);
}

.fb-rating-text{
font-size:13px;
font-weight:600;
color:#F59E0B;
margin-left:6px;
}

.fb-topics{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:10px;
}

.fb-topics button{
display:flex;
align-items:center;
justify-content:center;
gap:8px;
padding:12px;
border:1.5px solid var(--border);
background:#F8FAFC;
border-radius:12px;
font-size:13.5px;
font-weight:500;
color:#374151;
cursor:pointer;
transition:.25s;
}

.fb-topics button:hover{
border-color:#4F46E5;
}

.fb-topics button.active{
background:#EEF2FF;
border-color:#4F46E5;
color:#4F46E5;
font-weight:600;
}

.fb-field textarea{
width:100%;
padding:14px;
border:1px solid var(--border);
border-radius:12px;
background:#F8FAFC;
font-family:Inter;
font-size:14px;
outline:none;
resize:vertical;
transition:.25s;
}

.fb-field textarea:focus{
border-color:#4F46E5;
background:#fff;
}

.fb-submit{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
font-size:15px;
font-weight:600;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
cursor:pointer;
transition:.3s;
}

.fb-submit:hover:not(:disabled){
opacity:.9;
transform:translateY(-2px);
}

.fb-submit:disabled{
opacity:.5;
cursor:not-allowed;
}

.fb-side-head{
display:flex;
align-items:center;
gap:10px;
color:#4F46E5;
margin-bottom:16px;
}

.fb-side ul{
list-style:none;
display:flex;
flex-direction:column;
gap:16px;
margin-bottom:18px;
}

.fb-side ul li{
padding:14px;
border-radius:12px;
background:#F8FAFC;
}

.fb-side ul li strong{
font-size:14px;
display:block;
margin-bottom:4px;
}

.fb-side ul li p{
font-size:13px;
color:var(--secondary);
line-height:1.5;
}

.fb-points{
display:flex;
align-items:center;
gap:8px;
background:#F5F3FF;
color:#7C3AED;
padding:12px 14px;
border-radius:12px;
font-size:13.5px;
font-weight:500;
}

.fb-success{
background:#fff;
border:1px solid var(--border);
border-radius:18px;
box-shadow:var(--shadow);
text-align:center;
padding:60px 30px;
max-width:520px;
margin:40px auto;
}

.fb-success h2{
font-size:24px;
font-family:Poppins;
margin:16px 0 8px;
}

.fb-success p{
color:var(--secondary);
margin-bottom:24px;
}

.fb-success button{
padding:12px 24px;
border:none;
border-radius:12px;
background:#4F46E5;
color:#fff;
font-weight:600;
cursor:pointer;
}

@media(max-width:1024px){
.feedback-page-main{
margin-left:0;
}

.fb-grid{
grid-template-columns:1fr;
}
}

@media(max-width:700px){
.feedback-page{
padding:20px 16px;
}

.fb-topics{
grid-template-columns:1fr;
}
}
`, "pages/Feedback/Feedback.css");

// src/pages/Feedback/Feedback.jsx
import { Fragment as Fragment15, jsx as jsx45, jsxs as jsxs45 } from "react/jsx-runtime";
var topics = [
  { icon: /* @__PURE__ */ jsx45(Package6, { size: 18 }), label: "Product Quality" },
  { icon: /* @__PURE__ */ jsx45(Truck7, { size: 18 }), label: "Delivery Experience" },
  { icon: /* @__PURE__ */ jsx45(Heart8, { size: 18 }), label: "Customer Support" },
  { icon: /* @__PURE__ */ jsx45(Sparkles12, { size: 18 }), label: "AI Recommendations" }
];
function Feedback() {
  const navigate = useNavigate9();
  const [sidebarOpen, setSidebarOpen] = useState19(false);
  const [rating, setRating] = useState19(0);
  const [hover, setHover] = useState19(0);
  const [topic, setTopic] = useState19("Product Quality");
  const [message, setMessage] = useState19("");
  const [submitted, setSubmitted] = useState19(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return /* @__PURE__ */ jsxs45(Fragment15, { children: [
    /* @__PURE__ */ jsx45(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs45("div", { className: "feedback-page-main", children: [
      /* @__PURE__ */ jsx45(Navbar, { onToggleSidebar: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsxs45("div", { className: "feedback-page", children: [
        /* @__PURE__ */ jsxs45("div", { className: "fb-title", children: [
          /* @__PURE__ */ jsx45("h1", { children: "Feedback" }),
          /* @__PURE__ */ jsx45("p", { children: "Your opinion helps us improve your shopping experience" })
        ] }),
        submitted ? /* @__PURE__ */ jsxs45("div", { className: "fb-success", children: [
          /* @__PURE__ */ jsx45(CheckCircle24, { size: 56, color: "#22C55E" }),
          /* @__PURE__ */ jsx45("h2", { children: "Thank You!" }),
          /* @__PURE__ */ jsx45("p", { children: "Your feedback has been submitted successfully." }),
          /* @__PURE__ */ jsx45("button", { onClick: () => navigate("/"), children: "Back to Home" })
        ] }) : /* @__PURE__ */ jsxs45("div", { className: "fb-grid", children: [
          /* @__PURE__ */ jsxs45("div", { className: "fb-card fb-form-card", children: [
            /* @__PURE__ */ jsx45("h2", { children: "Share Your Feedback" }),
            /* @__PURE__ */ jsxs45("form", { onSubmit: handleSubmit, children: [
              /* @__PURE__ */ jsxs45("div", { className: "fb-field", children: [
                /* @__PURE__ */ jsx45("label", { children: "How was your experience?" }),
                /* @__PURE__ */ jsx45("div", { className: "fb-stars", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx45(
                  "button",
                  {
                    type: "button",
                    onMouseEnter: () => setHover(star),
                    onMouseLeave: () => setHover(0),
                    onClick: () => setRating(star),
                    "aria-label": `Rate ${star} star`,
                    children: /* @__PURE__ */ jsx45(
                      Star6,
                      {
                        size: 30,
                        fill: star <= (hover || rating) ? "#F59E0B" : "none",
                        color: "#F59E0B"
                      }
                    )
                  },
                  star
                )) }),
                rating > 0 && /* @__PURE__ */ jsx45("span", { className: "fb-rating-text", children: rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Poor" : "Very Poor" })
              ] }),
              /* @__PURE__ */ jsxs45("div", { className: "fb-field", children: [
                /* @__PURE__ */ jsx45("label", { children: "Topic" }),
                /* @__PURE__ */ jsx45("div", { className: "fb-topics", children: topics.map((t, i) => /* @__PURE__ */ jsxs45(
                  "button",
                  {
                    type: "button",
                    className: topic === t.label ? "active" : "",
                    onClick: () => setTopic(t.label),
                    children: [
                      t.icon,
                      t.label
                    ]
                  },
                  i
                )) })
              ] }),
              /* @__PURE__ */ jsxs45("div", { className: "fb-field", children: [
                /* @__PURE__ */ jsx45("label", { children: "Your Feedback" }),
                /* @__PURE__ */ jsx45(
                  "textarea",
                  {
                    placeholder: "Tell us what you think...",
                    value: message,
                    onChange: (e) => setMessage(e.target.value),
                    rows: 5,
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs45(
                "button",
                {
                  className: "fb-submit",
                  type: "submit",
                  disabled: rating === 0 || !message.trim(),
                  children: [
                    /* @__PURE__ */ jsx45(Send, { size: 18 }),
                    "Submit Feedback"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs45("div", { className: "fb-card fb-side", children: [
            /* @__PURE__ */ jsxs45("div", { className: "fb-side-head", children: [
              /* @__PURE__ */ jsx45(MessageSquare2, { size: 20 }),
              /* @__PURE__ */ jsx45("h2", { children: "Why Your Feedback Matters" })
            ] }),
            /* @__PURE__ */ jsxs45("ul", { children: [
              /* @__PURE__ */ jsxs45("li", { children: [
                /* @__PURE__ */ jsx45("strong", { children: "Better Product Matches" }),
                /* @__PURE__ */ jsx45("p", { children: "Your ratings train our AI to recommend products you'll love." })
              ] }),
              /* @__PURE__ */ jsxs45("li", { children: [
                /* @__PURE__ */ jsx45("strong", { children: "Improved Delivery" }),
                /* @__PURE__ */ jsx45("p", { children: "Tell us about your delivery experience to help us improve." })
              ] }),
              /* @__PURE__ */ jsxs45("li", { children: [
                /* @__PURE__ */ jsx45("strong", { children: "Rewards" }),
                /* @__PURE__ */ jsx45("p", { children: "Every feedback earns you 50 bonus loyalty points." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs45("div", { className: "fb-points", children: [
              /* @__PURE__ */ jsx45(Star6, { size: 16, fill: "#F59E0B", color: "#F59E0B" }),
              "Earn ",
              /* @__PURE__ */ jsx45("strong", { children: "+50" }),
              " points per feedback"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Help/Help.jsx
import { useState as useState20 } from "react";
import {
  CircleHelp as CircleHelp2,
  ChevronDown as ChevronDown2,
  MessageCircle,
  Phone as Phone3,
  Mail as Mail2,
  MessageSquare as MessageSquare3,
  Truck as Truck8,
  RefreshCw,
  CreditCard as CreditCard3,
  ShieldCheck,
  Package as Package7
} from "lucide-react";

// css:C:\CustomerDashbord\src\pages\Help\Help.css
collectCSS(`.help-page-main{
margin-left:260px;
min-height:100vh;
}

.help-page{
padding:28px 30px 40px;
max-width:1280px;
margin:0 auto;
}

.help-title{
margin-bottom:22px;
}

.help-title h1{
font-size:32px;
font-family:Poppins;
font-weight:700;
}

.help-title p{
font-size:14px;
color:var(--secondary);
margin-top:4px;
}

.help-search{
display:flex;
align-items:center;
gap:12px;
background:#fff;
border:1px solid var(--border);
border-radius:14px;
padding:14px 18px;
box-shadow:var(--shadow);
margin-bottom:24px;
max-width:640px;
}

.help-search svg{
color:#4F46E5;
flex-shrink:0;
}

.help-search input{
flex:1;
border:none;
outline:none;
font-size:14.5px;
font-family:Inter;
background:none;
}

.help-grid{
display:grid;
grid-template-columns:1fr 340px;
gap:24px;
align-items:start;
}

.help-card{
background:#fff;
border:1px solid var(--border);
border-radius:18px;
padding:24px;
box-shadow:var(--shadow);
}

.help-card h2{
font-size:18px;
font-family:Poppins;
font-weight:700;
margin-bottom:16px;
}

.faq-list{
display:flex;
flex-direction:column;
gap:12px;
}

.faq-item{
border:1px solid var(--border);
border-radius:14px;
overflow:hidden;
transition:.25s;
}

.faq-item.open{
border-color:#C7D2FE;
background:#FCFCFF;
}

.faq-item button{
width:100%;
display:flex;
align-items:center;
gap:12px;
padding:15px 16px;
background:none;
border:none;
cursor:pointer;
font-family:Inter;
font-size:14.5px;
font-weight:600;
color:var(--text);
text-align:left;
}

.faq-icon{
width:36px;
height:36px;
border-radius:10px;
background:#EEF2FF;
color:#4F46E5;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.faq-arrow{
margin-left:auto;
color:#9CA3AF;
transition:transform .25s;
flex-shrink:0;
}

.faq-item.open .faq-arrow{
transform:rotate(180deg);
}

.faq-item p{
padding:0 16px 16px 64px;
font-size:13.5px;
color:var(--secondary);
line-height:1.6;
}

.faq-empty{
color:var(--secondary);
font-size:14px;
padding:20px;
text-align:center;
}

.help-side{
display:flex;
flex-direction:column;
gap:24px;
}

.contact-row{
display:flex;
align-items:center;
gap:12px;
padding:13px;
border-radius:12px;
background:#F8FAFC;
margin-bottom:10px;
transition:.25s;
text-decoration:none;
color:inherit;
}

.contact-row:hover{
background:#EEF2FF;
transform:translateX(3px);
}

.c-icon{
width:38px;
height:38px;
border-radius:11px;
background:#EDE9FE;
color:#7C3AED;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.contact-row small{
display:block;
font-size:12px;
color:var(--secondary);
}

.contact-row strong{
font-size:13.5px;
font-weight:600;
word-break:break-all;
}

.help-ticket p{
font-size:13.5px;
color:var(--secondary);
line-height:1.6;
margin-bottom:14px;
}

.help-ticket button{
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:linear-gradient(135deg,#4F46E5,#7C3AED);
color:#fff;
font-size:14.5px;
font-weight:600;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
cursor:pointer;
transition:.3s;
}

.help-ticket button:hover{
opacity:.9;
transform:translateY(-2px);
}

.ticket-sent{
color:#16A34A;
font-weight:600;
background:#F0FDF4;
padding:12px;
border-radius:10px;
}

@media(max-width:1024px){
.help-page-main{
margin-left:0;
}

.help-grid{
grid-template-columns:1fr;
}
}

@media(max-width:700px){
.help-page{
padding:20px 16px;
}
}
`, "pages/Help/Help.css");

// src/pages/Help/Help.jsx
import { Fragment as Fragment16, jsx as jsx46, jsxs as jsxs46 } from "react/jsx-runtime";
var faqs = [
  {
    icon: /* @__PURE__ */ jsx46(Truck8, { size: 18 }),
    q: "How do I track my order?",
    a: "Go to Orders from the sidebar. Every order shows its current status \u2014 Delivered, Shipped, Pending or Cancelled \u2014 along with the expected date."
  },
  {
    icon: /* @__PURE__ */ jsx46(RefreshCw, { size: 18 }),
    q: "What is the return policy?",
    a: "You can return most items within 7 days of delivery for a full refund. The product must be unused and in its original packaging."
  },
  {
    icon: /* @__PURE__ */ jsx46(CreditCard3, { size: 18 }),
    q: "Which payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking and Cash on Delivery for eligible pincodes."
  },
  {
    icon: /* @__PURE__ */ jsx46(ShieldCheck, { size: 18 }),
    q: "How do my loyalty points work?",
    a: "You earn points on every purchase. Points can be redeemed for discounts and exclusive offers from your Profile page."
  },
  {
    icon: /* @__PURE__ */ jsx46(Package7, { size: 18 }),
    q: "How do I cancel an order?",
    a: "Orders can be cancelled from the Orders page before they are shipped. The refund is processed within 5\u20137 business days."
  }
];
function Help() {
  const [sidebarOpen, setSidebarOpen] = useState20(false);
  const [openIndex, setOpenIndex] = useState20(0);
  const [query, setQuery] = useState20("");
  const [sent, setSent] = useState20(false);
  const filtered = faqs.filter(
    (f) => (f.q + f.a).toLowerCase().includes(query.toLowerCase())
  );
  return /* @__PURE__ */ jsxs46(Fragment16, { children: [
    /* @__PURE__ */ jsx46(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs46("div", { className: "help-page-main", children: [
      /* @__PURE__ */ jsx46(Navbar, { onToggleSidebar: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsxs46("div", { className: "help-page", children: [
        /* @__PURE__ */ jsxs46("div", { className: "help-title", children: [
          /* @__PURE__ */ jsx46("h1", { children: "Help & Support" }),
          /* @__PURE__ */ jsx46("p", { children: "We're here to help you 24/7" })
        ] }),
        /* @__PURE__ */ jsxs46("div", { className: "help-search", children: [
          /* @__PURE__ */ jsx46(CircleHelp2, { size: 20 }),
          /* @__PURE__ */ jsx46(
            "input",
            {
              type: "text",
              placeholder: "Search for help topics, e.g. returns, payment, tracking...",
              value: query,
              onChange: (e) => setQuery(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs46("div", { className: "help-grid", children: [
          /* @__PURE__ */ jsxs46("div", { className: "help-card help-faq", children: [
            /* @__PURE__ */ jsx46("h2", { children: "Frequently Asked Questions" }),
            /* @__PURE__ */ jsx46("div", { className: "faq-list", children: filtered.length ? filtered.map((faq, index) => /* @__PURE__ */ jsxs46(
              "div",
              {
                className: `faq-item ${openIndex === index ? "open" : ""}`,
                children: [
                  /* @__PURE__ */ jsxs46("button", { onClick: () => setOpenIndex(openIndex === index ? -1 : index), children: [
                    /* @__PURE__ */ jsx46("span", { className: "faq-icon", children: faq.icon }),
                    /* @__PURE__ */ jsx46("span", { children: faq.q }),
                    /* @__PURE__ */ jsx46(ChevronDown2, { size: 18, className: "faq-arrow" })
                  ] }),
                  openIndex === index && /* @__PURE__ */ jsx46("p", { children: faq.a })
                ]
              },
              index
            )) : /* @__PURE__ */ jsxs46("p", { className: "faq-empty", children: [
              'No results found for "',
              query,
              '"'
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs46("div", { className: "help-side", children: [
            /* @__PURE__ */ jsxs46("div", { className: "help-card", children: [
              /* @__PURE__ */ jsx46("h2", { children: "Contact Support" }),
              /* @__PURE__ */ jsxs46("a", { className: "contact-row", href: "mailto:support@clustermind.com", children: [
                /* @__PURE__ */ jsx46("span", { className: "c-icon", children: /* @__PURE__ */ jsx46(Mail2, { size: 18 }) }),
                /* @__PURE__ */ jsxs46("div", { children: [
                  /* @__PURE__ */ jsx46("small", { children: "Email" }),
                  /* @__PURE__ */ jsx46("strong", { children: "support@clustermind.com" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs46("a", { className: "contact-row", href: "tel:1800123456", children: [
                /* @__PURE__ */ jsx46("span", { className: "c-icon", children: /* @__PURE__ */ jsx46(Phone3, { size: 18 }) }),
                /* @__PURE__ */ jsxs46("div", { children: [
                  /* @__PURE__ */ jsx46("small", { children: "Toll Free" }),
                  /* @__PURE__ */ jsx46("strong", { children: "1800-123-456" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs46("a", { className: "contact-row", href: "mailto:support@clustermind.com", children: [
                /* @__PURE__ */ jsx46("span", { className: "c-icon", children: /* @__PURE__ */ jsx46(MessageCircle, { size: 18 }) }),
                /* @__PURE__ */ jsxs46("div", { children: [
                  /* @__PURE__ */ jsx46("small", { children: "Live Chat" }),
                  /* @__PURE__ */ jsx46("strong", { children: "Mon\u2013Sat, 9am\u20139pm" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs46("div", { className: "help-card help-ticket", children: [
              /* @__PURE__ */ jsx46("h2", { children: "Submit a Ticket" }),
              /* @__PURE__ */ jsx46("p", { children: "Having an issue? Raise a ticket and our team will respond within 24 hours." }),
              sent ? /* @__PURE__ */ jsx46("p", { className: "ticket-sent", children: "\u2705 Ticket submitted! We'll email you shortly." }) : /* @__PURE__ */ jsxs46("button", { onClick: () => setSent(true), children: [
                /* @__PURE__ */ jsx46(MessageSquare3, { size: 18 }),
                "Raise a Ticket"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/pages/Login/Login.jsx
import { useState as useState22 } from "react";
import { useNavigate as useNavigate10, Link as Link10 } from "react-router-dom";
import { Mail as Mail3, LogIn } from "lucide-react";

// css:C:\CustomerDashbord\src\components\AuthLayout\AuthLayout.css
collectCSS(`.auth-layout{

display:flex;

min-height:100vh;

}

.auth-side{

width:45%;

background:linear-gradient(160deg,#4F46E5,#7C3AED 60%,#2563EB);

color:white;

padding:40px;

display:flex;

flex-direction:column;

}

.auth-logo{

display:flex;

align-items:center;

gap:10px;

}

.auth-logo img{

width:45px;

height:45px;

border-radius:12px;

}

.auth-logo h2{

font-family:Poppins;

font-size:20px;

}

.auth-logo span{

font-size:12px;

opacity:.8;

}

.auth-side-content{

margin-top:auto;

margin-bottom:auto;

}

.auth-tag{

display:inline-flex;

align-items:center;

gap:8px;

background:rgba(255,255,255,.15);

padding:8px 15px;

border-radius:50px;

margin-bottom:20px;

font-size:14px;

}

.auth-side-content h1{

font-family:Poppins;

font-size:44px;

line-height:1.2;

margin-bottom:20px;

}

.auth-side-content p{

font-size:16px;

line-height:1.7;

opacity:.9;

margin-bottom:30px;

}

.auth-features{

display:flex;

flex-direction:column;

gap:15px;

}

.feature{

display:flex;

align-items:center;

gap:12px;

background:rgba(255,255,255,.1);

padding:14px 18px;

border-radius:12px;

font-size:15px;

}

.auth-main{

flex:1;

display:flex;

align-items:center;

justify-content:center;

padding:40px;

}

.auth-box{

width:100%;

max-width:420px;

}

.auth-box h1{

font-family:Poppins;

font-size:30px;

margin-bottom:8px;

}

.auth-sub{

color:#6B7280;

margin-bottom:25px;

}

.auth-form{

display:flex;

flex-direction:column;

gap:18px;

}

.auth-btn{

width:100%;

padding:14px;

background:#4F46E5;

color:white;

border:none;

border-radius:12px;

font-size:16px;

font-weight:600;

cursor:pointer;

display:flex;

justify-content:center;

align-items:center;

gap:10px;

transition:.3s;

}

.auth-btn:hover{

background:#4338CA;

}

.auth-btn:disabled{

opacity:.6;

cursor:not-allowed;

}

.auth-row{

display:flex;

justify-content:space-between;

align-items:center;

font-size:14px;

}

.auth-row label{

display:flex;

align-items:center;

gap:8px;

cursor:pointer;

}

.auth-link{

color:#4F46E5;

font-weight:600;

}

.auth-link:hover{

text-decoration:underline;

}

.auth-footer{

text-align:center;

color:#6B7280;

font-size:14px;

margin-top:20px;

}

@media(max-width:1024px){

.auth-side{

display:none;

}

.auth-main{

padding:20px;

}

}
`, "components/AuthLayout/AuthLayout.css");

// src/components/AuthLayout/AuthLayout.jsx
import { Sparkles as Sparkles13, TrendingUp, Gift as Gift8, ShieldCheck as ShieldCheck2 } from "lucide-react";
import { jsx as jsx47, jsxs as jsxs47 } from "react/jsx-runtime";
function AuthLayout({ children, title, subtitle }) {
  return /* @__PURE__ */ jsxs47("div", { className: "auth-layout", children: [
    /* @__PURE__ */ jsxs47("div", { className: "auth-side", children: [
      /* @__PURE__ */ jsxs47("div", { className: "auth-logo", children: [
        /* @__PURE__ */ jsx47("img", { src: "/logo.png", alt: "logo" }),
        /* @__PURE__ */ jsxs47("div", { children: [
          /* @__PURE__ */ jsx47("h2", { children: "ClusterMind" }),
          /* @__PURE__ */ jsx47("span", { children: "AI Powered Shopping" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs47("div", { className: "auth-side-content", children: [
        /* @__PURE__ */ jsxs47("div", { className: "auth-tag", children: [
          /* @__PURE__ */ jsx47(Sparkles13, { size: 16 }),
          "AI Personalized Marketing"
        ] }),
        /* @__PURE__ */ jsxs47("h1", { children: [
          "Smart Shopping",
          /* @__PURE__ */ jsx47("br", {}),
          "Starts Here"
        ] }),
        /* @__PURE__ */ jsx47("p", { children: "Get AI-powered product recommendations, personalized offers and a smarter shopping experience." }),
        /* @__PURE__ */ jsxs47("div", { className: "auth-features", children: [
          /* @__PURE__ */ jsxs47("div", { className: "feature", children: [
            /* @__PURE__ */ jsx47(TrendingUp, { size: 18 }),
            /* @__PURE__ */ jsx47("span", { children: "AI Product Recommendations" })
          ] }),
          /* @__PURE__ */ jsxs47("div", { className: "feature", children: [
            /* @__PURE__ */ jsx47(Gift8, { size: 18 }),
            /* @__PURE__ */ jsx47("span", { children: "Loyalty Rewards & Offers" })
          ] }),
          /* @__PURE__ */ jsxs47("div", { className: "feature", children: [
            /* @__PURE__ */ jsx47(ShieldCheck2, { size: 18 }),
            /* @__PURE__ */ jsx47("span", { children: "Secure & Personalized" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx47("div", { className: "auth-main", children: /* @__PURE__ */ jsxs47("div", { className: "auth-box", children: [
      /* @__PURE__ */ jsx47("h1", { children: title }),
      subtitle && /* @__PURE__ */ jsx47("p", { className: "auth-sub", children: subtitle }),
      children
    ] }) })
  ] });
}

// css:C:\CustomerDashbord\src\components\InputField\InputField.css
collectCSS(`.input-field{

display:flex;

flex-direction:column;

gap:8px;

}

.input-field label{

font-size:14px;

font-weight:600;

}

.input-box{

display:flex;

align-items:center;

background:#F8FAFC;

border:1px solid #E2E8F0;

border-radius:12px;

padding:0 14px;

transition:.3s;

}

.input-box:focus-within{

border-color:#4F46E5;

background:#fff;

box-shadow:0 0 0 3px rgba(79,70,229,.1);

}

.input-box.has-error{

border-color:#EF4444;

}

.input-icon{

color:#6B7280;

flex-shrink:0;

}

.input-box input{

flex:1;

padding:13px 10px;

border:none;

outline:none;

background:none;

font-size:15px;

font-family:inherit;

}

.error-msg{

font-size:13px;

color:#EF4444;

}
`, "components/InputField/InputField.css");

// src/components/InputField/InputField.jsx
import { jsx as jsx48, jsxs as jsxs48 } from "react/jsx-runtime";
function InputField({ label, icon: Icon, error, ...props }) {
  return /* @__PURE__ */ jsxs48("div", { className: "input-field", children: [
    /* @__PURE__ */ jsx48("label", { children: label }),
    /* @__PURE__ */ jsxs48("div", { className: `input-box ${error ? "has-error" : ""}`, children: [
      Icon && /* @__PURE__ */ jsx48(Icon, { size: 18, className: "input-icon" }),
      /* @__PURE__ */ jsx48("input", { ...props })
    ] }),
    error && /* @__PURE__ */ jsx48("span", { className: "error-msg", children: error })
  ] });
}

// src/components/PasswordInput/PasswordInput.jsx
import { useState as useState21 } from "react";
import { Lock as Lock2, Eye, EyeOff } from "lucide-react";

// css:C:\CustomerDashbord\src\components\PasswordInput\PasswordInput.css
collectCSS(`.input-field{

display:flex;

flex-direction:column;

gap:8px;

}

.input-field label{

font-size:14px;

font-weight:600;

}

.input-box{

display:flex;

align-items:center;

background:#F8FAFC;

border:1px solid #E2E8F0;

border-radius:12px;

padding:0 14px;

transition:.3s;

}

.input-box:focus-within{

border-color:#4F46E5;

background:#fff;

box-shadow:0 0 0 3px rgba(79,70,229,.1);

}

.input-box.has-error{

border-color:#EF4444;

}

.input-icon{

color:#6B7280;

flex-shrink:0;

}

.input-box input{

flex:1;

padding:13px 10px;

border:none;

outline:none;

background:none;

font-size:15px;

font-family:inherit;

}

.eye-btn{

border:none;

background:none;

cursor:pointer;

color:#6B7280;

display:flex;

align-items:center;

}

.eye-btn:hover{

color:#4F46E5;

}

.error-msg{

font-size:13px;

color:#EF4444;

}
`, "components/PasswordInput/PasswordInput.css");

// src/components/PasswordInput/PasswordInput.jsx
import { jsx as jsx49, jsxs as jsxs49 } from "react/jsx-runtime";
function PasswordInput({ label, error, ...props }) {
  const [show, setShow] = useState21(false);
  return /* @__PURE__ */ jsxs49("div", { className: "input-field", children: [
    /* @__PURE__ */ jsx49("label", { children: label }),
    /* @__PURE__ */ jsxs49("div", { className: `input-box ${error ? "has-error" : ""}`, children: [
      /* @__PURE__ */ jsx49(Lock2, { size: 18, className: "input-icon" }),
      /* @__PURE__ */ jsx49("input", { type: show ? "text" : "password", ...props }),
      /* @__PURE__ */ jsx49(
        "button",
        {
          type: "button",
          className: "eye-btn",
          onClick: () => setShow(!show),
          "aria-label": show ? "Hide password" : "Show password",
          children: show ? /* @__PURE__ */ jsx49(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx49(Eye, { size: 18 })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx49("span", { className: "error-msg", children: error })
  ] });
}

// css:C:\CustomerDashbord\src\components\SocialLogin\SocialLogin.css
collectCSS(`.social-login{

display:flex;

flex-direction:column;

gap:12px;

}

.divider{

display:flex;

align-items:center;

gap:12px;

color:#9CA3AF;

font-size:13px;

margin:18px 0 6px;

}

.divider::before,

.divider::after{

content:"";

flex:1;

height:1px;

background:#E2E8F0;

}

.social-btn{

display:flex;

align-items:center;

justify-content:center;

gap:10px;

width:100%;

padding:13px;

background:#fff;

border:1px solid #E2E8F0;

border-radius:12px;

font-size:15px;

font-weight:600;

cursor:pointer;

transition:.3s;

}

.social-btn:hover{

background:#F8FAFC;

border-color:#4F46E5;
}
`, "components/SocialLogin/SocialLogin.css");

// src/components/SocialLogin/SocialLogin.jsx
import { jsx as jsx50, jsxs as jsxs50 } from "react/jsx-runtime";
function GoogleIcon() {
  return /* @__PURE__ */ jsxs50("svg", { width: "20", height: "20", viewBox: "0 0 48 48", children: [
    /* @__PURE__ */ jsx50("path", { fill: "#FFC107", d: "M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" }),
    /* @__PURE__ */ jsx50("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
    /* @__PURE__ */ jsx50("path", { fill: "#4CAF50", d: "M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" }),
    /* @__PURE__ */ jsx50("path", { fill: "#1976D2", d: "M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" })
  ] });
}
function GithubIcon() {
  return /* @__PURE__ */ jsx50("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "#111827", children: /* @__PURE__ */ jsx50("path", { d: "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38s1.95.13 2.86.38c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.11v3.13c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" }) });
}
function SocialLogin() {
  return /* @__PURE__ */ jsxs50("div", { className: "social-login", children: [
    /* @__PURE__ */ jsx50("div", { className: "divider", children: /* @__PURE__ */ jsx50("span", { children: "OR" }) }),
    /* @__PURE__ */ jsxs50("button", { type: "button", className: "social-btn", children: [
      /* @__PURE__ */ jsx50(GoogleIcon, {}),
      "Continue with Google"
    ] }),
    /* @__PURE__ */ jsxs50("button", { type: "button", className: "social-btn", children: [
      /* @__PURE__ */ jsx50(GithubIcon, {}),
      "Continue with GitHub"
    ] })
  ] });
}

// css:C:\CustomerDashbord\src\pages\Login\Login.css
collectCSS(`.auth-form .auth-row label input{

accent-color:#4F46E5;

width:16px;

height:16px;

}
`, "pages/Login/Login.css");

// src/pages/Login/Login.jsx
import { jsx as jsx51, jsxs as jsxs51 } from "react/jsx-runtime";
function Login() {
  const navigate = useNavigate10();
  const [form, setForm] = useState22({ email: "", password: "" });
  const [remember, setRemember] = useState22(true);
  const [errors, setErrors] = useState22({});
  const [loading, setLoading] = useState22(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email";
    if (!form.password) err.password = "Password is required";
    return err;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await fakeLogin(form);
      navigate("/");
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs51(
    AuthLayout,
    {
      title: "Welcome Back \u{1F44B}",
      subtitle: "Login to continue shopping smarter",
      children: [
        /* @__PURE__ */ jsxs51("form", { className: "auth-form", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsx51(
            InputField,
            {
              label: "Email Address",
              type: "email",
              name: "email",
              icon: Mail3,
              placeholder: "Enter your email",
              value: form.email,
              onChange: handleChange,
              error: errors.email
            }
          ),
          /* @__PURE__ */ jsx51(
            PasswordInput,
            {
              label: "Password",
              name: "password",
              placeholder: "Enter your password",
              value: form.password,
              onChange: handleChange,
              error: errors.password
            }
          ),
          /* @__PURE__ */ jsxs51("div", { className: "auth-row", children: [
            /* @__PURE__ */ jsxs51("label", { children: [
              /* @__PURE__ */ jsx51(
                "input",
                {
                  type: "checkbox",
                  checked: remember,
                  onChange: (e) => setRemember(e.target.checked)
                }
              ),
              "Remember Me"
            ] }),
            /* @__PURE__ */ jsx51(Link10, { to: "/forgot-password", className: "auth-link", children: "Forgot Password?" })
          ] }),
          /* @__PURE__ */ jsxs51("button", { className: "auth-btn", type: "submit", disabled: loading, children: [
            /* @__PURE__ */ jsx51(LogIn, { size: 18 }),
            loading ? "Logging in..." : "Login Securely"
          ] })
        ] }),
        /* @__PURE__ */ jsx51(SocialLogin, {}),
        /* @__PURE__ */ jsxs51("p", { className: "auth-footer", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsx51(Link10, { to: "/register", className: "auth-link", children: "Register" })
        ] })
      ]
    }
  );
}

// src/pages/Register/Register.jsx
import { useState as useState23 } from "react";
import { useNavigate as useNavigate11, Link as Link11 } from "react-router-dom";
import { User as User2, Mail as Mail4, Phone as Phone4, UserPlus } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\Register\Register.css
collectCSS(`.terms-row{

display:flex;

flex-direction:column;

gap:6px;

}

.terms-row label{

display:flex;

align-items:center;

gap:8px;

font-size:14px;

cursor:pointer;

}

.terms-row input{

accent-color:#4F46E5;

width:16px;

height:16px;

}

.terms-row span{

color:#4F46E5;

font-weight:600;

}
`, "pages/Register/Register.css");

// src/pages/Register/Register.jsx
import { jsx as jsx52, jsxs as jsxs52 } from "react/jsx-runtime";
function Register() {
  const navigate = useNavigate11();
  const [form, setForm] = useState23({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [terms, setTerms] = useState23(false);
  const [errors, setErrors] = useState23({});
  const [loading, setLoading] = useState23(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email";
    if (!form.phone.trim()) err.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.phone)) err.phone = "Enter a valid 10-digit mobile number";
    if (!form.password) err.password = "Password is required";
    else if (form.password.length < 8) err.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) err.confirmPassword = "Passwords do not match";
    if (!terms) err.terms = "Please accept the terms & conditions";
    return err;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await fakeRegister(form);
      navigate("/login");
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs52(
    AuthLayout,
    {
      title: "Create Account",
      subtitle: "Join ClusterMind and shop smarter",
      children: [
        /* @__PURE__ */ jsxs52("form", { className: "auth-form", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsx52(
            InputField,
            {
              label: "Full Name",
              type: "text",
              name: "fullName",
              icon: User2,
              placeholder: "Enter your full name",
              value: form.fullName,
              onChange: handleChange,
              error: errors.fullName
            }
          ),
          /* @__PURE__ */ jsx52(
            InputField,
            {
              label: "Email",
              type: "email",
              name: "email",
              icon: Mail4,
              placeholder: "Enter your email",
              value: form.email,
              onChange: handleChange,
              error: errors.email
            }
          ),
          /* @__PURE__ */ jsx52(
            InputField,
            {
              label: "Mobile Number",
              type: "tel",
              name: "phone",
              icon: Phone4,
              placeholder: "Enter 10-digit mobile number",
              maxLength: "10",
              value: form.phone,
              onChange: handleChange,
              error: errors.phone
            }
          ),
          /* @__PURE__ */ jsx52(
            PasswordInput,
            {
              label: "Password",
              name: "password",
              placeholder: "Create a password (min 8 characters)",
              value: form.password,
              onChange: handleChange,
              error: errors.password
            }
          ),
          /* @__PURE__ */ jsx52(
            PasswordInput,
            {
              label: "Confirm Password",
              name: "confirmPassword",
              placeholder: "Re-enter your password",
              value: form.confirmPassword,
              onChange: handleChange,
              error: errors.confirmPassword
            }
          ),
          /* @__PURE__ */ jsxs52("div", { className: "terms-row", children: [
            /* @__PURE__ */ jsxs52("label", { children: [
              /* @__PURE__ */ jsx52(
                "input",
                {
                  type: "checkbox",
                  checked: terms,
                  onChange: (e) => {
                    setTerms(e.target.checked);
                    setErrors({ ...errors, terms: "" });
                  }
                }
              ),
              "I accept the ",
              /* @__PURE__ */ jsx52("span", { children: "Terms & Conditions" })
            ] }),
            errors.terms && /* @__PURE__ */ jsx52("span", { className: "error-msg", children: errors.terms })
          ] }),
          /* @__PURE__ */ jsxs52("button", { className: "auth-btn", type: "submit", disabled: loading, children: [
            /* @__PURE__ */ jsx52(UserPlus, { size: 18 }),
            loading ? "Creating Account..." : "Create Account"
          ] })
        ] }),
        /* @__PURE__ */ jsxs52("p", { className: "auth-footer", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx52(Link11, { to: "/login", className: "auth-link", children: "Login" })
        ] })
      ]
    }
  );
}

// src/pages/ForgotPassword/ForgotPassword.jsx
import { useState as useState24 } from "react";
import { Link as Link12, useNavigate as useNavigate12 } from "react-router-dom";
import { Mail as Mail5, KeyRound, ShieldCheck as ShieldCheck3, CheckCircle2 as CheckCircle25, ArrowLeft as ArrowLeft2, ArrowRight as ArrowRight3 } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\ForgotPassword\ForgotPassword.css
collectCSS(`.steps-bar{

display:flex;

align-items:center;

justify-content:space-between;

gap:8px;

margin-bottom:25px;

}

.step{

display:flex;

flex-direction:column;

align-items:center;

gap:6px;

flex:1;

position:relative;

}

.step-dot{

width:32px;

height:32px;

border-radius:50%;

background:#E2E8F0;

color:#6B7280;

display:flex;

align-items:center;

justify-content:center;

font-size:14px;

font-weight:600;

}

.step.active .step-dot{

background:#4F46E5;

color:white;

}

.step.done .step-dot{

background:#22C55E;

color:white;

}

.step span{

font-size:12px;

color:#6B7280;

}

.step.active span{

color:#4F46E5;

font-weight:600;

}

.step-card{

min-height:220px;

}

.ghost-btn{

display:flex;

align-items:center;

justify-content:center;

gap:8px;

width:100%;

padding:12px;

background:none;

border:1px solid #E2E8F0;

color:#6B7280;

border-radius:12px;

cursor:pointer;

font-size:14px;

}

.ghost-btn:hover{

background:#F8FAFC;

color:#4F46E5;
}

.success-box{

text-align:center;

}

.success-icon{

margin-bottom:15px;

}

.success-box h2{

font-family:Poppins;

margin-bottom:8px;

}

.success-box p{

color:#6B7280;

margin-bottom:25px;
}
`, "pages/ForgotPassword/ForgotPassword.css");

// src/pages/ForgotPassword/ForgotPassword.jsx
import { Fragment as Fragment17, jsx as jsx53, jsxs as jsxs53 } from "react/jsx-runtime";
var steps = ["Email", "Verify OTP", "New Password"];
function ForgotPassword() {
  const navigate = useNavigate12();
  const [step, setStep] = useState24(0);
  const [email, setEmail] = useState24("");
  const [otp, setOtp] = useState24("");
  const [password, setPassword] = useState24("");
  const [confirm, setConfirm] = useState24("");
  const [errors, setErrors] = useState24({});
  const [loading, setLoading] = useState24(false);
  const [done, setDone] = useState24(false);
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const err = {};
    if (!email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await fakeSendOtp(email);
      setStep(1);
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const err = {};
    if (!otp.trim()) err.otp = "OTP is required";
    else if (otp.trim().length !== 6) err.otp = "OTP must be 6 digits";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await fakeVerifyOtp(otp.trim());
      setStep(2);
    } catch (errObj) {
      setErrors(errObj);
    } finally {
      setLoading(false);
    }
  };
  const handleReset = async (e) => {
    e.preventDefault();
    const err = {};
    if (!password) err.password = "New password is required";
    else if (password.length < 8) err.password = "Password must be at least 8 characters";
    if (confirm !== password) err.confirm = "Passwords do not match";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await fakeResetPassword(email, password);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx53(
    AuthLayout,
    {
      title: "Forgot Password",
      subtitle: "Reset your password in a few steps",
      children: done ? /* @__PURE__ */ jsxs53("div", { className: "success-box", children: [
        /* @__PURE__ */ jsx53("div", { className: "success-icon", children: /* @__PURE__ */ jsx53(CheckCircle25, { size: 48, color: "#22C55E" }) }),
        /* @__PURE__ */ jsx53("h2", { children: "Password Updated Successfully" }),
        /* @__PURE__ */ jsx53("p", { children: "You can now login with your new password." }),
        /* @__PURE__ */ jsx53("button", { className: "auth-btn", onClick: () => navigate("/login"), children: "Go to Login" })
      ] }) : /* @__PURE__ */ jsxs53(Fragment17, { children: [
        /* @__PURE__ */ jsx53("div", { className: "steps-bar", children: steps.map((label, i) => /* @__PURE__ */ jsxs53("div", { className: `step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`, children: [
          /* @__PURE__ */ jsx53("div", { className: "step-dot", children: i < step ? /* @__PURE__ */ jsx53(ShieldCheck3, { size: 16 }) : i + 1 }),
          /* @__PURE__ */ jsx53("span", { children: label })
        ] }, label)) }),
        /* @__PURE__ */ jsxs53("div", { className: "step-card", children: [
          step === 0 && /* @__PURE__ */ jsxs53("form", { className: "auth-form", onSubmit: handleSendOtp, children: [
            /* @__PURE__ */ jsx53(
              InputField,
              {
                label: "Email Address",
                type: "email",
                name: "email",
                icon: Mail5,
                placeholder: "Enter your registered email",
                value: email,
                onChange: (e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                },
                error: errors.email
              }
            ),
            /* @__PURE__ */ jsxs53("button", { className: "auth-btn", type: "submit", disabled: loading, children: [
              "Send OTP",
              /* @__PURE__ */ jsx53(ArrowRight3, { size: 18 })
            ] })
          ] }),
          step === 1 && /* @__PURE__ */ jsxs53("form", { className: "auth-form", onSubmit: handleVerifyOtp, children: [
            /* @__PURE__ */ jsx53(
              InputField,
              {
                label: "Enter OTP",
                type: "text",
                name: "otp",
                icon: KeyRound,
                placeholder: "6-digit OTP sent to your email",
                maxLength: "6",
                value: otp,
                onChange: (e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setErrors({ ...errors, otp: "" });
                },
                error: errors.otp
              }
            ),
            /* @__PURE__ */ jsxs53("button", { className: "auth-btn", type: "submit", disabled: loading, children: [
              "Verify OTP",
              /* @__PURE__ */ jsx53(ArrowRight3, { size: 18 })
            ] }),
            /* @__PURE__ */ jsxs53(
              "button",
              {
                type: "button",
                className: "ghost-btn",
                onClick: () => setStep(0),
                children: [
                  /* @__PURE__ */ jsx53(ArrowLeft2, { size: 16 }),
                  "Change Email"
                ]
              }
            )
          ] }),
          step === 2 && /* @__PURE__ */ jsxs53("form", { className: "auth-form", onSubmit: handleReset, children: [
            /* @__PURE__ */ jsx53(
              PasswordInput,
              {
                label: "New Password",
                name: "password",
                placeholder: "Enter new password",
                value: password,
                onChange: (e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                },
                error: errors.password
              }
            ),
            /* @__PURE__ */ jsx53(
              PasswordInput,
              {
                label: "Confirm New Password",
                name: "confirm",
                placeholder: "Re-enter new password",
                value: confirm,
                onChange: (e) => {
                  setConfirm(e.target.value);
                  setErrors({ ...errors, confirm: "" });
                },
                error: errors.confirm
              }
            ),
            /* @__PURE__ */ jsx53("button", { className: "auth-btn", type: "submit", disabled: loading, children: "Update Password" }),
            /* @__PURE__ */ jsxs53(
              "button",
              {
                type: "button",
                className: "ghost-btn",
                onClick: () => setStep(1),
                children: [
                  /* @__PURE__ */ jsx53(ArrowLeft2, { size: 16 }),
                  "Back to OTP"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs53("p", { className: "auth-footer", children: [
          "Remember your password?",
          " ",
          /* @__PURE__ */ jsx53(Link12, { to: "/login", className: "auth-link", children: "Login" })
        ] })
      ] })
    }
  );
}

// src/pages/ProductImages/ProductImages.jsx
import { useRef, useState as useState25 } from "react";
import { ImagePlus as ImagePlus2, Check as Check3, RotateCcw, Upload, ImageOff } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\ProductImages\ProductImages.css
collectCSS(`.pi-page {
  padding: 30px;
}

.pi-head {
  margin-bottom: 24px;
}

.pi-head h1 {
  font-family: Poppins;
  font-size: 26px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pi-count {
  background: #eef2ff;
  color: #4f46e5;
  font-size: 14px;
  padding: 3px 12px;
  border-radius: 20px;
}

.pi-head p {
  color: #6b7280;
  margin-top: 6px;
}

.pi-toast {
  position: fixed;
  top: 86px;
  right: 30px;
  z-index: 50;
  background: #10b981;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
  animation: pi-fade 0.25s ease;
}

@keyframes pi-fade {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}

.pi-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.pi-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.pi-card.pending {
  border-color: #4f46e5;
}

.pi-preview {
  position: relative;
  height: 170px;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pi-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pi-noimg {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.pi-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #4f46e5;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.pi-info h3 {
  font-family: Poppins;
  font-size: 14px;
  margin: 12px 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pi-info p {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
}

.pi-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.pi-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 14px;
  transition: transform 0.15s ease, background 0.2s ease;
}

.pi-actions button:active {
  transform: scale(0.97);
}

.pi-upload {
  flex: 1;
  background: #4f46e5;
  color: #fff;
}

.pi-upload:hover {
  background: #4338ca;
}

.pi-save {
  flex: 1;
  background: #10b981;
  color: #fff;
}

.pi-save:hover {
  background: #059669;
}

.pi-cancel {
  background: #f3f4f6;
  color: #374151;
}

.pi-reset {
  background: #fef2f2;
  color: #dc2626;
  padding: 9px 10px;
}
`, "pages/ProductImages/ProductImages.css");

// src/pages/ProductImages/ProductImages.jsx
import { Fragment as Fragment18, jsx as jsx54, jsxs as jsxs54 } from "react/jsx-runtime";
var readFileAsImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
var compressImage = (img, maxSize = 900) => {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
};
function ProductImages() {
  const [products2, setProducts] = useState25(() => getProducts());
  const [pending, setPending] = useState25({});
  const [message, setMessage] = useState25("");
  const inputRefs = useRef({});
  const refresh = () => setProducts(getProducts());
  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(""), 2500);
  };
  const handlePick = (id) => inputRefs.current[id]?.click();
  const handleFile = async (id, file) => {
    if (!file || !file.type.startsWith("image/")) {
      showMessage("Please choose an image file.");
      return;
    }
    try {
      const img = await readFileAsImage(file);
      const dataUrl = compressImage(img);
      setPending((prev) => ({ ...prev, [id]: dataUrl }));
    } catch {
      showMessage("Could not read that image.");
    }
  };
  const handleSave = (id) => {
    const dataUrl = pending[id];
    if (!dataUrl) return;
    setProductImage(id, dataUrl);
    setPending((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    refresh();
    showMessage("Image saved.");
  };
  const handleReset = (id) => {
    resetProductImage(id);
    setPending((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    refresh();
    showMessage("Default image restored.");
  };
  const handleCancel = (id) => setPending((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
  return /* @__PURE__ */ jsxs54(Fragment18, { children: [
    /* @__PURE__ */ jsx54(Sidebar, {}),
    /* @__PURE__ */ jsxs54("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx54(Navbar, {}),
      /* @__PURE__ */ jsxs54("div", { className: "pi-page", children: [
        /* @__PURE__ */ jsxs54("div", { className: "pi-head", children: [
          /* @__PURE__ */ jsxs54("h1", { children: [
            /* @__PURE__ */ jsx54(ImagePlus2, { size: 26, color: "#4F46E5" }),
            "Product Images",
            /* @__PURE__ */ jsx54("span", { className: "pi-count", children: products2.length })
          ] }),
          /* @__PURE__ */ jsx54("p", { children: "Upload a custom image for any product. It applies instantly across the store." })
        ] }),
        message && /* @__PURE__ */ jsx54("div", { className: "pi-toast", children: message }),
        /* @__PURE__ */ jsx54("div", { className: "pi-grid", children: products2.map((p) => {
          const isCustom = !!getUploadedImage(p.id);
          const isPending = !!pending[p.id];
          const display = pending[p.id] || p.image;
          return /* @__PURE__ */ jsxs54("div", { className: `pi-card ${isPending ? "pending" : ""}`, children: [
            /* @__PURE__ */ jsxs54("div", { className: "pi-preview", children: [
              display ? /* @__PURE__ */ jsx54("img", { src: display, alt: p.name }) : /* @__PURE__ */ jsx54("div", { className: "pi-noimg", children: /* @__PURE__ */ jsx54(ImageOff, { size: 28, color: "#9CA3AF" }) }),
              isCustom && /* @__PURE__ */ jsx54("span", { className: "pi-badge", children: "Custom" })
            ] }),
            /* @__PURE__ */ jsxs54("div", { className: "pi-info", children: [
              /* @__PURE__ */ jsx54("h3", { children: p.name }),
              /* @__PURE__ */ jsxs54("p", { children: [
                p.brand,
                " \xB7 ",
                p.category
              ] })
            ] }),
            /* @__PURE__ */ jsx54(
              "input",
              {
                ref: (el) => inputRefs.current[p.id] = el,
                type: "file",
                accept: "image/*",
                hidden: true,
                onChange: (e) => {
                  handleFile(p.id, e.target.files[0]);
                  e.target.value = "";
                }
              }
            ),
            isPending ? /* @__PURE__ */ jsxs54("div", { className: "pi-actions", children: [
              /* @__PURE__ */ jsxs54("button", { className: "pi-save", onClick: () => handleSave(p.id), children: [
                /* @__PURE__ */ jsx54(Check3, { size: 16 }),
                " Save"
              ] }),
              /* @__PURE__ */ jsx54("button", { className: "pi-cancel", onClick: () => handleCancel(p.id), children: "Cancel" })
            ] }) : /* @__PURE__ */ jsxs54("div", { className: "pi-actions", children: [
              /* @__PURE__ */ jsxs54("button", { className: "pi-upload", onClick: () => handlePick(p.id), children: [
                /* @__PURE__ */ jsx54(Upload, { size: 16 }),
                " Upload Image"
              ] }),
              isCustom && /* @__PURE__ */ jsx54("button", { className: "pi-reset", onClick: () => handleReset(p.id), children: /* @__PURE__ */ jsx54(RotateCcw, { size: 15 }) })
            ] })
          ] }, p.id);
        }) })
      ] })
    ] })
  ] });
}

// src/pages/CategoryProducts/CategoryProducts.jsx
import { useEffect as useEffect7, useMemo as useMemo5, useState as useState26 } from "react";
import { Link as Link13, useParams as useParams3 } from "react-router-dom";
import { ArrowLeft as ArrowLeft3, PackageSearch, Search as Search4, ShoppingCart as ShoppingCart10, X as X4 } from "lucide-react";

// css:C:\CustomerDashbord\src\pages\CategoryProducts\CategoryProducts.css
collectCSS(`.category-products-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
}

.cp-head {
  margin-bottom: 22px;
}

.cp-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #4f46e5;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
  text-decoration: none;
}

.cp-back:hover {
  background: #eef2ff;
}

.cp-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cp-title-row h1 {
  font-family: Poppins, sans-serif;
  font-size: 30px;
  color: #111827;
  margin: 0 0 5px;
}

.cp-title-row p {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

.cp-cart {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4f46e5;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 17px;
  border-radius: 12px;
  text-decoration: none;
  position: relative;
}

.cp-cart:hover {
  background: #4338ca;
}

.cp-cart-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cp-count {
  display: inline-block;
  margin-top: 12px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.cp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.cp-search {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 12px;
}

.cp-search:focus-within {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.cp-search-icon {
  color: #9ca3af;
}

.cp-search input {
  flex: 1;
  height: 44px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-family: Inter, sans-serif;
  color: #111827;
}

.cp-search-clear {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.cp-sort {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-sort label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.cp-sort select {
  height: 44px;
  padding: 0 34px 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #111827;
  font-size: 14px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.cp-sort select:focus {
  border-color: #4f46e5;
}

.cp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.cp-empty {
  background: #fff;
  border-radius: 18px;
  padding: 70px 20px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.cp-empty h2 {
  font-family: Poppins;
  margin: 14px 0 6px;
}

.cp-empty p {
  color: #6b7280;
  margin-bottom: 22px;
}

.cp-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4f46e5;
  color: #fff;
  padding: 13px 26px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cp-empty-btn:hover {
  background: #4338ca;
}

@media (max-width: 1024px) {
  .cp-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 820px) {
  .cp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 550px) {
  .category-products-page {
    padding: 18px;
  }

  .cp-grid {
    grid-template-columns: 1fr;
  }
}
`, "pages/CategoryProducts/CategoryProducts.css");

// src/pages/CategoryProducts/CategoryProducts.jsx
import { Fragment as Fragment19, jsx as jsx55, jsxs as jsxs55 } from "react/jsx-runtime";
var slugToName = {
  electronics: "Electronics",
  fashion: "Fashion",
  "home-kitchen": "Home & Kitchen",
  beauty: "Beauty",
  sports: "Sports",
  books: "Books",
  "toys-games": "Toys & Games",
  automotive: "Automotive",
  grocery: "Grocery"
};
var SORT_OPTIONS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price Low to High" },
  { id: "price-desc", label: "Price High to Low" },
  { id: "rating", label: "Highest Rated" }
];
function CategoryProducts() {
  const { category } = useParams3();
  const [sidebarOpen, setSidebarOpen] = useState26(false);
  const [query, setQuery] = useState26("");
  const [sort, setSort] = useState26("popular");
  const [cartCount, setCartCount] = useState26(getCartCount());
  useEffect7(
    () => subscribeCart(
      (cart) => setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0))
    ),
    []
  );
  const categoryName = slugToName[category];
  const products2 = useMemo5(() => {
    let list = categoryName ? getProducts({ category: categoryName }) : [];
    return [...list];
  }, [categoryName]);
  const visible = useMemo5(() => {
    let list = products2;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [products2, query, sort]);
  return /* @__PURE__ */ jsxs55(Fragment19, { children: [
    /* @__PURE__ */ jsx55(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs55("div", { style: { marginLeft: "260px" }, children: [
      /* @__PURE__ */ jsx55(Navbar, { onToggleSidebar: () => setSidebarOpen(true) }),
      /* @__PURE__ */ jsxs55("div", { className: "category-products-page", children: [
        /* @__PURE__ */ jsxs55("div", { className: "cp-head", children: [
          /* @__PURE__ */ jsxs55(Link13, { to: "/", className: "cp-back", children: [
            /* @__PURE__ */ jsx55(ArrowLeft3, { size: 18 }),
            "Back to Dashboard"
          ] }),
          /* @__PURE__ */ jsxs55("div", { className: "cp-title-row", children: [
            /* @__PURE__ */ jsxs55("div", { children: [
              /* @__PURE__ */ jsx55("h1", { children: categoryName || "Category" }),
              /* @__PURE__ */ jsxs55("p", { children: [
                "Explore our best ",
                categoryName || "category",
                " products"
              ] })
            ] }),
            /* @__PURE__ */ jsxs55(Link13, { to: "/cart", className: "cp-cart", children: [
              /* @__PURE__ */ jsx55(ShoppingCart10, { size: 19 }),
              "Cart",
              cartCount > 0 && /* @__PURE__ */ jsx55("span", { className: "cp-cart-badge", children: cartCount })
            ] })
          ] }),
          /* @__PURE__ */ jsxs55("span", { className: "cp-count", children: [
            visible.length,
            " product",
            visible.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs55("div", { className: "cp-toolbar", children: [
          /* @__PURE__ */ jsxs55("div", { className: "cp-search", children: [
            /* @__PURE__ */ jsx55(Search4, { size: 18, className: "cp-search-icon" }),
            /* @__PURE__ */ jsx55(
              "input",
              {
                type: "text",
                placeholder: `Search ${categoryName || "category"} products...`,
                value: query,
                onChange: (e) => setQuery(e.target.value)
              }
            ),
            query && /* @__PURE__ */ jsx55(
              "button",
              {
                className: "cp-search-clear",
                onClick: () => setQuery(""),
                "aria-label": "Clear search",
                children: /* @__PURE__ */ jsx55(X4, { size: 16 })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs55("div", { className: "cp-sort", children: [
            /* @__PURE__ */ jsx55("label", { htmlFor: "cp-sort-select", children: "Sort by" }),
            /* @__PURE__ */ jsx55(
              "select",
              {
                id: "cp-sort-select",
                value: sort,
                onChange: (e) => setSort(e.target.value),
                children: SORT_OPTIONS.map((opt) => /* @__PURE__ */ jsx55("option", { value: opt.id, children: opt.label }, opt.id))
              }
            )
          ] })
        ] }),
        visible.length === 0 ? /* @__PURE__ */ jsxs55("div", { className: "cp-empty", children: [
          /* @__PURE__ */ jsx55(PackageSearch, { size: 52, color: "#D1D5DB" }),
          /* @__PURE__ */ jsx55("h2", { children: "No products found" }),
          /* @__PURE__ */ jsx55("p", { children: query ? `Nothing matches "${query}" in ${categoryName || "this category"}.` : "This category has no products yet." }),
          /* @__PURE__ */ jsxs55(
            "button",
            {
              className: "cp-empty-btn",
              onClick: () => {
                setQuery("");
                setSort("popular");
              },
              children: [
                /* @__PURE__ */ jsx55(ArrowLeft3, { size: 18 }),
                "Clear Filters"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx55("div", { className: "cp-grid", children: visible.map((product) => /* @__PURE__ */ jsx55(ProductCard, { product }, product.id)) })
      ] })
    ] })
  ] });
}

// src/App.jsx
import { jsx as jsx56, jsxs as jsxs56 } from "react/jsx-runtime";
function App() {
  const loggedIn = isAuthenticated();
  return /* @__PURE__ */ jsx56(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: /* @__PURE__ */ jsxs56(Routes, { children: [
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/login",
        element: loggedIn ? /* @__PURE__ */ jsx56(Navigate, { to: "/", replace: true }) : /* @__PURE__ */ jsx56(Login, {})
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/register",
        element: loggedIn ? /* @__PURE__ */ jsx56(Navigate, { to: "/", replace: true }) : /* @__PURE__ */ jsx56(Register, {})
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/forgot-password",
        element: loggedIn ? /* @__PURE__ */ jsx56(Navigate, { to: "/", replace: true }) : /* @__PURE__ */ jsx56(ForgotPassword, {})
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/",
        element: loggedIn ? /* @__PURE__ */ jsx56(Home, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/products",
        element: loggedIn ? /* @__PURE__ */ jsx56(Products, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/products/:id",
        element: loggedIn ? /* @__PURE__ */ jsx56(ProductDetails, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/cart",
        element: loggedIn ? /* @__PURE__ */ jsx56(Cart, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/wishlist",
        element: loggedIn ? /* @__PURE__ */ jsx56(Wishlist, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/checkout",
        element: loggedIn ? /* @__PURE__ */ jsx56(Checkout, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/order-success/:orderId",
        element: loggedIn ? /* @__PURE__ */ jsx56(OrderSuccess, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/orders",
        element: loggedIn ? /* @__PURE__ */ jsx56(Orders, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/profile",
        element: loggedIn ? /* @__PURE__ */ jsx56(Profile, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/feedback",
        element: loggedIn ? /* @__PURE__ */ jsx56(Feedback, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/help",
        element: loggedIn ? /* @__PURE__ */ jsx56(Help, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/product-images",
        element: loggedIn ? /* @__PURE__ */ jsx56(ProductImages, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(
      Route,
      {
        path: "/category/:category",
        element: loggedIn ? /* @__PURE__ */ jsx56(CategoryProducts, {}) : /* @__PURE__ */ jsx56(Navigate, { to: "/login", replace: true })
      }
    ),
    /* @__PURE__ */ jsx56(Route, { path: "*", element: /* @__PURE__ */ jsx56(Navigate, { to: "/", replace: true }) })
  ] }) });
}
var App_default = App;

// css:C:\CustomerDashbord\src\css\global.css
collectCSS(`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

:root{

  --primary:#4F46E5;
  --primary-hover:#4338CA;

  --customer:#7C3AED;

  --admin:#2563EB;
  --secondary-blue:#2563EB;

  --marketing:#16A34A;

  --sidebar:#0F172A;
  --sidebar-hover:#1E293B;
  --sidebar-active:#4F46E5;

  --background:#F8FAFC;

  --card:#FFFFFF;

  --border:#E2E8F0;

  --text:#111827;

  --secondary:#6B7280;

  --success:#22C55E;

  --warning:#F59E0B;

  --danger:#EF4444;

  --ai-gradient:linear-gradient(135deg,#4F46E5,#7C3AED);

  --shadow:0 8px 25px rgba(15,23,42,0.06);

  --radius-card:18px;

  --radius-btn:12px;

  --radius-input:12px;

}

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
background:var(--background);
font-family:Inter,sans-serif;
color:var(--text);
-webkit-font-smoothing:antialiased;
}

h1,h2,h3,h4{
font-family:Poppins,sans-serif;
}

a{
text-decoration:none;
color:inherit;
}

button{
cursor:pointer;
font-family:inherit;
}

img{
max-width:100%;
display:block;
}

.card{
background:var(--card);
border:1px solid var(--border);
border-radius:var(--radius-card);
box-shadow:var(--shadow);
}

::-webkit-scrollbar{
width:8px;
height:8px;
}

::-webkit-scrollbar-thumb{
background:#CBD5E1;
border-radius:8px;
}

::-webkit-scrollbar-track{
background:transparent;
}
`, "css/global.css");

// src/main.jsx
import { jsx as jsx57 } from "react/jsx-runtime";
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx57(React.StrictMode, { children: /* @__PURE__ */ jsx57(App_default, {}) })
);

flushCSS();
