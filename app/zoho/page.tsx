"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    ZOHO: any;
  }
}

export default function Home() {
  useEffect(() => {
    // Load Zoho SDK script dynamically (if not already loaded)
    if (!window.ZOHO) {
      const script = document.createElement("script");
      script.src = "https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js";
      script.async = true;
      script.onload = () => {
        initializeZoho();
      };
      document.body.appendChild(script);
    } else {
      initializeZoho();
    }

    function initializeZoho() {
      window.ZOHO.embeddedApp.on("PageLoad", function (data: any) {
        console.log("Widget Loaded", data);
      });
      window.ZOHO.embeddedApp.init();
    }
  }, []);

  const getLead = async () => {
    if (!window.ZOHO) {
      console.error("ZOHO SDK not loaded yet!");
      return;
    }
console.log("fetchingg");
    const res = await window.ZOHO.CRM.API.getRecord({
      Entity: "Leads",
      RecordID: "123456789",
    });
    console.log("Lead Data:", res);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Zoho Widget in Next.js</h1>
      <button
        onClick={getLead}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Fetch Lead
      </button>
    </div>
  );
}
