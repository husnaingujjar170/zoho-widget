'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    ZOHO: any;
  }
}

export default function ZohoWidget() {
  const [status, setStatus] = useState('🚀 Starting Zoho Widget initialization...');

  // Utility to log with timestamp
  const log = (...args: any[]) => {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${time}]`, ...args);
  };

  // Repeatedly check if ZOHO SDK exists
  const waitForZoho = (retries = 20, delay = 500) => {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (window.ZOHO && window.ZOHO.embeddedApp) {
          log('✅ ZOHO.embeddedApp found in window');
          clearInterval(interval);
          resolve();
        } else {
          log(`⏳ Waiting for ZOHO.embeddedApp... retries left: ${retries}`);
          retries--;
          if (retries <= 0) {
            clearInterval(interval);
            log('❌ ZOHO.embeddedApp NOT found after retries');
            reject(new Error('ZOHO SDK not available'));
          }
        }
      }, delay);
    });
  };

  // Main init logic
  const initZoho = async () => {
    try {
      log('⚙️ Attempting initialization at', new Date().toString());
      setStatus('⏳ Waiting for Zoho SDK...');

      await waitForZoho();

      log('✅ ZOHO SDK detected:', window.ZOHO);
      setStatus('✅ Zoho SDK detected, setting up event listeners...');

      // Event handler logging
      window.ZOHO.embeddedApp.on('PageLoad', (data: any) => {
        log('📦 PageLoad event fired:', data);
        setStatus('🎉 Widget loaded successfully!');
        try {
          log('📋 Entity:', data.Entity, 'EntityId:', data.EntityId);
        } catch (err) {
          log('⚠️ Failed to extract PageLoad data:', err);
        }
      });

      window.ZOHO.embeddedApp.on('EntityPageLoad', (data: any) => {
        log('📄 EntityPageLoad event fired:', data);
      });

      window.ZOHO.embeddedApp.on('Navigate', (data: any) => {
        log('🧭 Navigate event fired:', data);
      });

      log('🚀 Calling ZOHO.embeddedApp.init()...');
      const initResult = await window.ZOHO.embeddedApp.init();
      log('✅ ZOHO.embeddedApp.init() completed successfully:', initResult);

      // Post-init diagnostics
      try {
        const info = await window.ZOHO.CRM.API.getOrgVariable('zcrm_orgid');
        log('🏢 Organization variable fetched:', info);
      } catch (e) {
        log('⚠️ Unable to fetch org variable:', e);
      }

      setStatus('✅ Initialization completed. Waiting for Zoho events...');
    } catch (err) {
      log('❌ Error during initZoho():', err);
      setStatus('❌ Zoho SDK initialization failed. Check console for details.');
    }
  };

  useEffect(() => {
    log('🧠 Component mounted — preparing Zoho initialization sequence');
  }, []);

  return (
    <>
      <Script
        src="https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          log('✅ Zoho SDK script loaded');
          initZoho();
        }}
        onError={(e) => {
          log('❌ Failed to load Zoho SDK script:', e);
          setStatus('❌ Failed to load Zoho SDK script');
        }}
      />
      <div
        style={{
          padding: 20,
          fontFamily: 'sans-serif',
          backgroundColor: '#f7f7f7',
          border: '1px solid #ddd',
          borderRadius: 6,
          marginTop: 10,
        }}
      >
        <h2>🔍 Zoho CRM Widget Debug Mode</h2>
        <p>{status}</p>
        <pre style={{ fontSize: 12, background: '#fff', padding: 10 }}>
          Check browser console for detailed logs →  
          "✅" = success, "❌" = failure, "⏳" = waiting
        </pre>
      </div>
    </>
  );
}