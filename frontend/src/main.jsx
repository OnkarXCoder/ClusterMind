import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./css/global.css";
import "./css/marketing.css";
import "./css/dashboard.css";
import "./css/design-system.css";

// In production the frontend and backend are deployed on different hosts, but
// all client code calls the API with root-relative "/api/..." paths. When
// VITE_API_URL is set we transparently rewrite those requests to the backend
// origin. In local dev it is unset, so Vite's proxy handles "/api" as before.
const VITE_API_URL = import.meta.env.VITE_API_URL;
if (VITE_API_URL) {
  const apiHost = VITE_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (resource, options) => {
    if (typeof resource === "string" && resource.startsWith("/api/")) {
      return nativeFetch(apiHost + resource, options);
    }
    return nativeFetch(resource, options);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
