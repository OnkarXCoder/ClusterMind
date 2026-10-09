const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

// Load Razorpay's checkout script once and reuse it
export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser environment"));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay));
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error("Razorpay loaded but did not initialise"));
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens the Razorpay modal.
 *
 * Resolves only after the SERVER has verified the payment signature, so
 * `onSuccess` here means "confirmed by us", not merely "the browser said so".
 */
export async function openRazorpayCheckout({ order, config, user, onDismiss }) {
  const Razorpay = await loadRazorpay();

  return new Promise((resolve, reject) => {
    const options = {
      key: config.keyId,
      amount: order.amount, // paise, provided by the backend
      currency: order.currency || "INR",
      name: "ClusterMind",
      description: `Order ${order.gatewayOrderId}`.slice(0, 40),
      order_id: order.gatewayOrderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      notes: { orderId: order.orderId },
      // Test mode offers UPI, cards, netbanking and wallets
      theme: { color: "#7C3AED" },
      retry: { enabled: true },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error("PAYMENT_DISMISSED"));
        },
      },
    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", (response) => {
      const err = new Error(
        response?.error?.description || "The payment did not go through."
      );
      err.code = "PAYMENT_FAILED";
      err.dismissed = false;
      reject(err);
    });

    rzp.open();
  });
}