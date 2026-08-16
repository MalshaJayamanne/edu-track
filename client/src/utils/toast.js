import toast from "react-hot-toast";

export const showToast = {
  success: (message) => {
    return toast.success(message, {
      style: {
        background: "rgba(255, 255, 255, 0.95)",
        color: "#0f172a",
        borderRadius: "1rem",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        padding: "12px 18px",
        fontWeight: 500,
        fontSize: "0.875rem"
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#ffffff"
      }
    });
  },

  error: (message) => {
    return toast.error(message, {
      style: {
        background: "rgba(255, 255, 255, 0.95)",
        color: "#0f172a",
        borderRadius: "1rem",
        border: "1px solid rgba(254, 202, 202, 0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        padding: "12px 18px",
        fontWeight: 500,
        fontSize: "0.875rem"
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff"
      }
    });
  },

  warning: (message) => {
    return toast(message, {
      icon: "⚠️",
      style: {
        background: "rgba(255, 255, 255, 0.95)",
        color: "#0f172a",
        borderRadius: "1rem",
        border: "1px solid rgba(253, 230, 138, 0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        padding: "12px 18px",
        fontWeight: 500,
        fontSize: "0.875rem"
      }
    });
  },

  aiCreditWarning: (message = "AI credits depleted! Please wait for refresh or update settings.") => {
    return toast(message, {
      icon: "⚡",
      duration: 5000,
      style: {
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(168, 85, 247, 0.95))",
        color: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid rgba(199, 210, 254, 0.4)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.3)",
        padding: "12px 18px",
        fontWeight: 600,
        fontSize: "0.875rem"
      }
    });
  },

  info: (message) => {
    return toast(message, {
      icon: "ℹ️",
      style: {
        background: "rgba(255, 255, 255, 0.95)",
        color: "#0f172a",
        borderRadius: "1rem",
        border: "1px solid rgba(191, 219, 254, 0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        padding: "12px 18px",
        fontWeight: 500,
        fontSize: "0.875rem"
      }
    });
  }
};

export default showToast;
