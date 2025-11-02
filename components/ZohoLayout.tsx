'use client'

import { useState, useEffect, useRef } from "react";
import ZohoApp from "./ZohoApp";

declare global {
  interface Window {
    ZOHO: any;
  }
}

// Module-level flag to prevent multiple script loads across all component instances
let sdkLoadAttempted = false;
let sdkLoadPromise: Promise<void> | null = null;

const ZohoLayout = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization in React StrictMode
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const isLocalhost = () => {
      if (typeof window === 'undefined') return false;
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname.startsWith('192.168.');
    };

    const initializeSDK = () => {
      if (typeof window !== 'undefined' && window.ZOHO && window.ZOHO.embeddedApp) {
        // Add timeout to detect if init() hangs (e.g., when running locally)
        const initTimeout = setTimeout(() => {
          if (isLocalhost()) {
            setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
          } else {
            setError("Zoho SDK initialization timeout. Please ensure this page is opened within Zoho CRM widget.");
          }
          setLoading(false);
        }, 5000); // 5 second timeout

        return window.ZOHO.embeddedApp.init().then(() => {
          clearTimeout(initTimeout);
          console.log("Zoho SDK Initialized!");
          setLoading(false);
        }).catch((error: any) => {
          clearTimeout(initTimeout);
          console.error("Error initializing Zoho SDK:", error);
          
          if (isLocalhost()) {
            setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
          } else {
            setError("Error initializing Zoho SDK.");
          }
          setLoading(false);
        });
      } else {
        if (typeof window !== 'undefined') {
          if (isLocalhost()) {
            setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
          } else {
            setError("Zoho SDK not available. Please ensure this page is opened within Zoho CRM widget.");
          }
        }
        setLoading(false);
        return Promise.resolve();
      }
    };

    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // If SDK is already loaded, initialize immediately
    if (window.ZOHO && window.ZOHO.embeddedApp) {
      initializeSDK();
      return;
    }

    // If we've already attempted to load the SDK, wait for that promise
    if (sdkLoadPromise) {
      sdkLoadPromise.then(() => {
        // Wait a bit for window.ZOHO to be available after script loads
        const checkSDK = setInterval(() => {
          if (window.ZOHO && window.ZOHO.embeddedApp) {
            clearInterval(checkSDK);
            initializeSDK();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkSDK);
          if (!window.ZOHO) {
            if (isLocalhost()) {
              setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
            } else {
              setError("Zoho SDK failed to load.");
            }
            setLoading(false);
          }
        }, 10000);

        return () => clearInterval(checkSDK);
      });
      return;
    }

    // Check if script tag already exists (from Zoho CRM or previous load)
    const scriptUrl = "https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js";
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

    if (existingScript) {
      // Script exists, wait for SDK to become available
      sdkLoadPromise = new Promise((resolve) => {
        const checkSDK = setInterval(() => {
          if (window.ZOHO && window.ZOHO.embeddedApp) {
            clearInterval(checkSDK);
            resolve();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkSDK);
          resolve();
        }, 10000);
      });

      sdkLoadPromise.then(() => {
        const finalCheck = setInterval(() => {
          if (window.ZOHO && window.ZOHO.embeddedApp) {
            clearInterval(finalCheck);
            initializeSDK();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(finalCheck);
          if (!window.ZOHO) {
            if (isLocalhost()) {
              setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
            } else {
              setError("Zoho SDK not available.");
            }
            setLoading(false);
          }
        }, 10000);
      });
      return;
    }

    // Only attempt to load script if we haven't attempted before
    if (!sdkLoadAttempted) {
      sdkLoadAttempted = true;

      sdkLoadPromise = new Promise<void>((resolve, reject) => {
        const loadZohoSDK = () => {
          if (window.ZOHO && window.ZOHO.embeddedApp) {
            console.log("Available Zoho SDK methods:", window.ZOHO);

            // Check if isIframe method exists before calling it
            if (window.ZOHO.embeddedApp && typeof window.ZOHO.embeddedApp.isIframe === 'function') {
              if (window.ZOHO.embeddedApp.isIframe()) {
                console.log("App is running inside Zoho CRM iframe.");
              } else {
                console.log("App is not running inside Zoho CRM iframe.");
              }
            }

            resolve();
          } else {
            reject(new Error("Zoho SDK not available after script load"));
          }
        };

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.id = "zoho-embedded-app-sdk";

        script.onload = () => {
          // Give the script a moment to initialize window.ZOHO
          setTimeout(() => {
            loadZohoSDK();
          }, 100);
        };

        script.onerror = () => {
          console.error("Failed to load Zoho SDK script");
          if (isLocalhost()) {
            setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
          } else {
            setError("Failed to load Zoho SDK script.");
          }
          setLoading(false);
          reject(new Error("Script load failed"));
        };

        document.body.appendChild(script);
      });

      sdkLoadPromise.then(() => {
        initializeSDK();
      }).catch((error) => {
        console.error("Error loading Zoho SDK:", error);
        if (isLocalhost()) {
          setError("This app must run within Zoho CRM. It cannot run on localhost directly. Please use ngrok or deploy to a public URL and access it through Zoho CRM.");
        } else {
          setError("Error loading Zoho SDK.");
        }
        setLoading(false);
      });
    }
  }, []);

  return (
    <div>
      <h1>Zoho CRM Widget</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ZohoApp />
      )}
    </div>
  );
};

export default ZohoLayout;

