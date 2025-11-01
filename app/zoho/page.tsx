'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    ZOHO: any;
  }
}

interface ZohoUser {
  id: string;
  full_name: string;
  email: string;
  role?: {
    name: string;
    id: string;
  };
  profile?: {
    name: string;
    id: string;
  };
}

export default function ZohoWidget() {
  const [status, setStatus] = useState('Initializing Zoho Widget...');
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<ZohoUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      setStatus('Fetching current user...');

      if (!window.ZOHO?.CRM?.CONFIG) {
        console.error('❌ Zoho CRM CONFIG not available');
        setStatus('Zoho CRM API not ready');
        return;
      }

      const response = await window.ZOHO.CRM.CONFIG.getCurrentUser();
      console.log('✅ Current user response:', response);

      if (response?.users && response.users.length > 0) {
        const user = response.users[0];
        setCurrentUser(user);
        setStatus(`User loaded: ${user.full_name}`);
        console.log('✅ User data:', user);
      } else {
        setStatus('No user data found');
        console.error('❌ No user data in response:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching current user:', err);
      setStatus('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const initZoho = () => {
    try {
      if (typeof window === "undefined" || !window.ZOHO) {
        console.error("❌ window.ZOHO is not available");
        setStatus('Waiting for Zoho SDK...');
        return;
      }

      if (!window.ZOHO?.embeddedApp) {
        console.error('❌ Zoho embeddedApp not available');
        setStatus('Zoho SDK not detected. Please open this inside Zoho CRM.');
        return;
      }

      console.log('✅ Zoho SDK detected');
      console.log('Available Zoho SDK methods:', Object.keys(window.ZOHO));

      // CRITICAL: Register event listener BEFORE calling init()
      console.log('Registering PageLoad event listener...');
      window.ZOHO.embeddedApp.on("PageLoad", function(data: any) {
        console.log("✅ PageLoad event triggered!", data);
        setStatus('Zoho Widget loaded successfully!');
        
        // Automatically fetch user on page load
        getCurrentUser();
      });

      // Now initialize the SDK (don't await, just call it)
      console.log('Calling ZOHO.embeddedApp.init()...');
      window.ZOHO.embeddedApp.init();
      console.log("✅ Zoho SDK init() called successfully");
      
      setStatus('Waiting for PageLoad event...');

    } catch (err) {
      console.error('❌ Error initializing Zoho SDK:', err);
      setStatus('Error: ' + (err as Error).message);
    }
  };

  // Initialize Zoho when SDK is loaded
  useEffect(() => {
    if (!isClient || !sdkLoaded) return;

    console.log('SDK loaded, initializing Zoho...');
    // Small delay to ensure SDK is fully ready
    const timer = setTimeout(() => {
      initZoho();
    }, 100);

    return () => clearTimeout(timer);
  }, [isClient, sdkLoaded]);

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
          setSdkLoaded(true);
        }}
        onError={(e) => {
          console.error("❌ Failed to load Zoho script:", e);
          setStatus('Failed to load Zoho SDK script.');
        }}
      />

      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Zoho CRM Widget</h1>
        <p><strong>Status:</strong> {status}</p>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <p>SDK Loaded: {sdkLoaded ? '✅ Yes' : '❌ No'}</p>
          <p>Check console for detailed logs</p>
        </div>

        <button 
          onClick={getCurrentUser}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Fetch Current User'}
        </button>

        {currentUser && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <h3>Current User Information</h3>
            <p><strong>Name:</strong> {currentUser.full_name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>ID:</strong> {currentUser.id}</p>
            {currentUser.role && (
              <p><strong>Role:</strong> {currentUser.role.name}</p>
            )}
            {currentUser.profile && (
              <p><strong>Profile:</strong> {currentUser.profile.name}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}