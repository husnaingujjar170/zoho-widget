"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    ZOHO: any;
    ZDK: any;
  }
}

export default function Home() {
  useEffect(() => {
    // Load Zoho SDK dynamically (v1.4)
    const script = document.createElement("script");
    script.src = "https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js";
    script.async = true;
    script.onload = () => initializeZoho();
    document.body.appendChild(script);

    function initializeZoho() {
      if (!window.ZOHO) {
        console.error("ZOHO SDK not loaded.");
        return;
      }

      // Register all event listeners before initialization
      window.ZOHO.embeddedApp.on("PageLoad", function (data: any) {
        console.log("📄 Page loaded:", data);
      });

      window.ZOHO.embeddedApp.on("DialerActive", function () {
        console.log("📞 Dialer Activated");
      });

      window.ZOHO.embeddedApp.on("Dial", function (data: any) {
        console.log("📲 Number Dialed:", data);
      });

      window.ZOHO.embeddedApp.on("Notify", function (data: any) {
        console.log("🔔 Client Script Notification:", data);
      });

      window.ZOHO.embeddedApp.on("NotifyAndWait", function (data: any) {
        console.log("⏳ NotifyAndWait Event:", data);

        // Example of sending a response
        if (window.ZDK && window.ZDK.Client) {
          window.ZDK.Client.sendResponse(data.id, {
            choice: "mail",
            value: "example@zoho.com",
          });
        }
      });

      window.ZOHO.embeddedApp.on("ContextUpdate", function (data: any) {
        console.log("🧩 Context Updated:", data);
      });

      // Initialize Zoho embedded app
      window.ZOHO.embeddedApp.init();
    }
  }, []);

  // Example: Fetch a record (same pattern works for create/update)
  const getLead = async () => {
    if (!window.ZOHO || !window.ZOHO.CRM) {
      console.error("ZOHO SDK not ready yet!");
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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
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
        Fetch Lead Record
      </button>
    </div>
  );
}
