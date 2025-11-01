"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    ZOHO: any;
  }
}

export default function Home() {
  useEffect(() => {
    
    // ✅ Safety check — if window or document not available, exit early
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn("Window or document not available (likely server-side).");
      return;
    }

    // ✅ Load Zoho SDK dynamically
    const script = document.createElement("script");
    script.src = "https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js";
    script.async = true;
    script.onload = () => waitForZoho();
    document.body.appendChild(script);

    function waitForZoho() {
      const interval = setInterval(() => {
        // ✅ Check if ZOHO SDK is available
        if (window.ZOHO && window.ZOHO.embeddedApp) {
          clearInterval(interval);
          initZoho();
        }
      }, 300);
    }

    function initZoho() {
      if (!window.ZOHO || !window.ZOHO.embeddedApp) {
        console.error("❌ ZOHO SDK not found. Make sure widget is loaded inside Zoho CRM.");
        return;
      }

      // ✅ Register SDK listeners
      window.ZOHO.embeddedApp.on("PageLoad", (data: any) => {
        console.log("📄 Page Loaded:", data);
      });

      window.ZOHO.embeddedApp.on("Dial", (data: any) => {
        console.log("☎️ Dial Event:", data);
      });

      window.ZOHO.embeddedApp.on("ContextUpdate", (data: any) => {
        console.log("🧩 Context Update:", data);
      });

      // ✅ Initialize Zoho SDK
      window.ZOHO.embeddedApp.init().then(() => {
        console.log("✅ Zoho SDK Initialized Successfully");
      });
    }
  }, []);

  // ✅ Fetch a Lead record example
  const getLead = async () => {
    if (!window.ZOHO?.CRM?.API) {
      console.warn("⚠️ Zoho SDK not ready yet — wait for initialization.");
      return;
    }

    try {
      const res = await window.ZOHO.CRM.API.getRecord({
        Entity: "Leads",
        RecordID: "123456789",
      });
      console.log("✅ Lead Data:", res);
    } catch (err) {
      console.error("❌ Error fetching lead:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Zoho CRM Widget (Next.js + SDK v1.4)</h1>
      <button
        onClick={getLead}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          background: "#f7f7f7",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        Fetch Lead
      </button>
    </div>
  );
}
