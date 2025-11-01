'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window { ZOHO: any; }
}

export default function ZohoWidgetPage() {
  const [status, setStatus] = useState('⏳ Loading Zoho SDK...');
  const [ready, setReady] = useState(false);

  const log = (...args: any[]) => {
    console.log(new Date().toISOString(), ...args);
  };

  const waitForEmbeddedApp = (tries = 10, delay = 500): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attempt = () => {
        if (window.ZOHO?.embeddedApp) {
          log('✅ ZOHO.embeddedApp found');
          resolve();
        } else if (tries <= 0) {
          reject(new Error('ZOHO.embeddedApp not found after retries'));
        } else {
          log(`⏳ Waiting for ZOHO.embeddedApp... (${tries} tries left)`);
          tries--;
          setTimeout(attempt, delay);
        }
      };
      attempt();
    });
  };

  const initZoho = async () => {
    try {
      log('⚙️ Attempting initialization');
      setStatus('⏳ Waiting for Zoho SDK instance...');
      await waitForEmbeddedApp();

      log('✅ Zoho SDK detected:', window.ZOHO);
      setStatus('✅ Zoho SDK detected. Listening for events...');

      window.ZOHO.embeddedApp.on('PageLoad', (data: any) => {
        log('📦 PageLoad event fired:', data);
        setStatus('🎉 Widget loaded with context');
      });

      log('🚀 Calling ZOHO.embeddedApp.init()...');
      await window.ZOHO.embeddedApp.init();
      log('✅ Zoho SDK init complete');
      setStatus('✅ Zoho SDK initialized!');
      setReady(true);
    } catch (err) {
      log('❌ Initialization failed:', err);
      setStatus('❌ Zoho SDK initialization failed');
    }
  };

  useEffect(() => {
    // listen to postMessage for debugging
    const handler = (event: MessageEvent) => {
      log('📨 Message from parent:', event.origin, event.data);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
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
          log('❌ Failed to load SDK script', e);
          setStatus('❌ Failed to load Zoho SDK script');
        }}
      />

      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h2>Zoho CRM Widget (Next.js)</h2>
        <p>{status}</p>
        {ready && <div>✅ Ready to perform SDK functions!</div>}
      </div>
    </>
  );
}