'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    ZOHO: any;
  }
}

export default function ZohoWidget() {
  const [status, setStatus] = useState('Initializing Zoho Widget...');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initZoho = async () => {
    try {
      if (typeof window === "undefined" || !window.ZOHO) {
        console.error("❌ window.ZOHO is not available");
        setStatus('Waiting for Zoho SDK...');
        return;
      }

      console.log("Available Zoho SDK methods:", window.ZOHO);
      
      if (!window.ZOHO?.embeddedApp) {
        console.error('❌ Zoho SDK not available');
        setStatus('Zoho SDK not detected. Please open this inside Zoho CRM.');
        return;
      }

      console.log('✅ Zoho SDK detected. Initializing...');

      // Register the PageLoad event handler BEFORE init
      window.ZOHO.embeddedApp.on('PageLoad', async (data: any) => {
        console.log("✅ PageLoad event triggered", data);
        setStatus('Zoho Widget loaded successfully!');
      });

      // Initialize the SDK
      await window.ZOHO.embeddedApp.init();
      console.log("✅ Zoho SDK initialized");

    } catch (err) {
      console.error('❌ Error initializing Zoho SDK:', err);
      setStatus('Error initializing Zoho SDK.');
    }
  };

  useEffect(() => {
    if (!isClient) return;

    const timer = setTimeout(() => initZoho(), 2000);
    return () => clearTimeout(timer);
  }, [isClient]);

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  return (
    <>
      <Script
        src="https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("✅ Zoho script loaded!");
          // Optionally retry init after script loads
          setTimeout(() => initZoho(), 500);
        }}
        onError={(e) => {
          console.error("❌ Failed to load Zoho script:", e);
          setStatus('Failed to load Zoho SDK script.');
        }}
      />

      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Zoho CRM Widget</h1>
        <p>{status}</p>
      </div>
    </>
  );
}