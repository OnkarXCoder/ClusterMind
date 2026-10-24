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
 * Resolves with the gateway's payment response once the browser reports
 * success. The caller must still verify the signature server-side before
 * treating the payment as settled.
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
      // Fires after the user completes the payment in the browser. The
      // signature still has to be verified by the server before we trust it.
      handler: (response) => {
        resolve({
          paymentId: response?.razorpay_payment_id,
          gatewayOrderId: response?.razorpay_order_id,
          signature: response?.razorpay_signature,
        });
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