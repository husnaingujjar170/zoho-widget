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
      setStatus('Error fetching user data: ' + (err as Error).message);
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
      console.log('Available methods:', Object.keys(window.ZOHO));

      // METHOD 1: Traditional way - Register event BEFORE init
      console.log('Method 1: Registering PageLoad with .on()...');
      window.ZOHO.embeddedApp.on("PageLoad", function(data: any) {
        console.log("🎉 PageLoad event triggered (Method 1)!", data);
        setStatus('Zoho Widget loaded successfully!');
        getCurrentUser();
      });

      console.log('Calling ZOHO.embeddedApp.init()...');
      
      // METHOD 2: Alternative - Pass events in init (try if Method 1 fails)
      // Uncomment this and comment out Method 1 if needed
      /*
      window.ZOHO.embeddedApp.init({
        events: {
          PageLoad: function(data) {
            console.log("🎉 PageLoad event triggered (Method 2)!", data);
            setStatus('Zoho Widget loaded successfully!');
            getCurrentUser();
          }
        }
      }).then(function() {
        console.log("✅ SDK initialized with events");
      }).catch(function(err) {
        console.error("❌ Init failed:", err);
      });
      */
      
      // For Method 1, just call init without parameters
      window.ZOHO.embeddedApp.init();
      
      console.log("✅ Init called - Waiting for PageLoad...");
      setStatus('Widget initialized. Open a RECORD to trigger PageLoad.');

    } catch (err) {
      console.error('❌ Error:', err);
      setStatus('Error: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    if (!isClient || !sdkLoaded) return;

    console.log('=== Starting Zoho initialization ===');
    const timer = setTimeout(() => {
      initZoho();
    }, 300);

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

        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>⚠️ Important:</strong>
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            <li>PageLoad only triggers on <strong>DETAIL PAGES</strong> (when you open a specific record)</li>
            <li>Widget must be configured as <strong>Related List</strong> or <strong>Custom Button</strong></li>
            <li>Does NOT work on List View or Web Tab widgets</li>
            <li>Go to: Module → Open a Record → Scroll to see your widget</li>
          </ul>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <p>SDK Loaded: {sdkLoaded ? '✅ Yes' : '❌ No'}</p>
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
          {loading ? 'Loading...' : 'Manually Fetch Current User'}
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