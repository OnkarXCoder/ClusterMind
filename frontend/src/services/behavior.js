import { hasRemoteAuth } from "./auth";

const endpoint = "/api/behavior";

export const trackBehavior = async (payload = {}) => {
  const token = localStorage.getItem("clustermind_token");
  if (!token || !hasRemoteAuth()) return null;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
};

export const trackSearch = (searchTerm, extra = {}) => {
  const term = String(searchTerm || "").trim();
  if (!term) return null;
  return trackBehavior({ action: "search", searchTerm: term, ...extra });
};

export const trackProductBehavior = (action, product, extra = {}) => {
  const productId = product?.id || product?._id || product?.productId;
  if (!productId) return null;
  return trackBehavior({
    action,
    productId,
    productName: product?.name || "",
    category: product?.category || "",
    ...extra,
  });
};
