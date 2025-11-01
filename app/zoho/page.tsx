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

  const initZoho = async () => {
    try {
      if (typeof window === "undefined" || !window.ZOHO) {
        console.error("❌ window.ZOHO is not available");
        console.error("This page must be loaded within Zoho CRM as a widget");
        return;
      }
        console.log("Available Zoho SDK methods:", window.ZOHO);
      if (!window.ZOHO?.embeddedApp) {
        console.error('❌ Zoho SDK not available');
        setStatus('Zoho SDK not detected. Please open this inside Zoho CRM.');
        return;
      }

      console.log('✅ Zoho SDK detected. Initializing...');

      window.ZOHO.embeddedApp.on('PageLoad', async (data: any) => {
        console.log("block started");
      });

      window.ZOHO.embeddedApp.init();
    } catch (err) {
      console.error('❌ Error initializing Zoho SDK:', err);
      setStatus('Error initializing Zoho SDK.');
    }
        console.log("block started part");


  };

  useEffect(() => {
    const timer = setTimeout(() => initZoho(), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script
        src="https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js"
        strategy="afterInteractive"
        onLoad={()=> console.log("script loaded!")}
      />

      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Zoho CRM Widget</h1>
        <p>{status}</p>
      </div>
    </>
  );
}
