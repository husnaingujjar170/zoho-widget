'use client';
import { useEffect, useState, useRef } from 'react';

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
  const [currentUser, setCurrentUser] = useState<ZohoUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const initAttempted = useRef(false);
  const pageLoadHandled = useRef(false);

  // Load Zoho SDK dynamically
  useEffect(() => {
    // Prevent double loading in development mode (React Strict Mode)
    if (sdkLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Zoho SDK script loaded');
      setSdkLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Zoho SDK script');
      setStatus('Failed to load Zoho SDK. Make sure you have internet connection.');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      setStatus('Fetching current user...');

      if (!window.ZOHO?.CRM?.CONFIG) {
        throw new Error('Zoho CRM CONFIG not available');
      }

      const response = await window.ZOHO.CRM.CONFIG.getCurrentUser();
      console.log('✅ Current user response:', response);

      if (response?.users && response.users.length > 0) {
        const user = response.users[0];
        setCurrentUser(user);
        setStatus(`✅ User loaded: ${user.full_name}`);
        console.log('✅ User data:', user);
      } else {
        setStatus('❌ No user data found');
        console.error('❌ No user data in response:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching current user:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const initZoho = () => {
    // Prevent multiple initialization attempts
    if (initAttempted.current) {
      console.log('⚠️ Init already attempted, skipping...');
      return;
    }

    try {
      if (typeof window === 'undefined') {
        console.error('❌ Running on server side');
        return;
      }

      if (!window.ZOHO) {
        console.error('❌ window.ZOHO is not available');
        setStatus('❌ Zoho SDK not loaded. Please refresh the page.');
        return;
      }

      if (!window.ZOHO.embeddedApp) {
        console.error('❌ Zoho embeddedApp not available');
        setStatus('❌ This widget must run inside Zoho CRM. Open it from within Zoho CRM.');
        return;
      }

      console.log('✅ Zoho SDK detected, initializing...');
      initAttempted.current = true;

      // CRITICAL: Register PageLoad BEFORE calling init()
      window.ZOHO.embeddedApp.on('PageLoad', function(data: any) {
        if (pageLoadHandled.current) {
          console.log('⚠️ PageLoad already handled, skipping...');
          return;
        }

        console.log('🎉 PageLoad event triggered!', data);
        pageLoadHandled.current = true;
        setStatus('✅ Widget loaded successfully! Entity: ' + (data?.Entity || 'Unknown'));
        
        // Automatically fetch user on PageLoad
        setTimeout(() => {
          getCurrentUser();
        }, 500);
      });

      // Initialize the SDK
      window.ZOHO.embeddedApp.init();
      console.log('✅ Init called successfully');
      setStatus('⏳ Widget initialized. Waiting for PageLoad event...');

    } catch (err) {
      console.error('❌ Initialization error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`❌ Init failed: ${errorMsg}`);
      initAttempted.current = false; // Allow retry on error
    }
  };

  // Initialize Zoho when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initZoho();
    }, 500);

    return () => clearTimeout(timer);
  }, [sdkLoaded]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Zoho CRM Widget (Next.js Fixed)
          </h1>

          {/* Status Display */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-semibold text-blue-700">Status</p>
            <p className="text-gray-700 mt-1">{status}</p>
          </div>

          {/* Important Notes */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Requirements:</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li><strong>Widget Location:</strong> This must be configured as a <strong>Related List</strong>, <strong>Custom Button</strong>, or <strong>Web Tab</strong> in Zoho CRM</li>
              <li><strong>PageLoad Trigger:</strong> Only fires on <strong>Detail Pages</strong> (when viewing a specific record)</li>
              <li><strong>NOT for List View:</strong> Does not work on module list views</li>
              <li><strong>Access Method:</strong> Navigate to: Module → Open Record → Your widget appears</li>
              <li><strong>Hosting:</strong> Must be hosted externally and registered in Zoho Developer Console</li>
            </ul>
          </div>

          {/* SDK Status */}
          <div className="mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-semibold text-gray-700">SDK Loaded:</span>
              <span className={`ml-2 ${sdkLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {sdkLoaded ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Init Attempted:</span>
              <span className={`ml-2 ${initAttempted.current ? 'text-green-600' : 'text-gray-600'}`}>
                {initAttempted.current ? '✅ Yes' : '⏳ No'}
              </span>
            </div>
          </div>

          {/* Manual Fetch Button */}
          <div className="mb-6">
            <button
              onClick={getCurrentUser}
              disabled={loading || !sdkLoaded}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                loading || !sdkLoaded
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {loading ? '⏳ Loading...' : '🔄 Manually Fetch Current User'}
            </button>
            {!sdkLoaded && (
              <p className="text-sm text-gray-500 mt-2">
                Button will be enabled once SDK loads
              </p>
            )}
          </div>

          {/* User Information Display */}
          {currentUser && (
            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                👤 Current User Information
              </h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">Name:</span>
                  <span className="text-gray-900">{currentUser.full_name}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">Email:</span>
                  <span className="text-gray-900">{currentUser.email}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">User ID:</span>
                  <span className="text-gray-900 font-mono text-sm">{currentUser.id}</span>
                </div>
                {currentUser.role && (
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Role:</span>
                    <span className="text-gray-900">{currentUser.role.name}</span>
                  </div>
                )}
                {currentUser.profile && (
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Profile:</span>
                    <span className="text-gray-900">{currentUser.profile.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">🔧 Troubleshooting:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>If PageLoad doesn't trigger, make sure you're on a <strong>Detail Page</strong> (not List View)</li>
              <li>If you see "Parentwindow reference not found", the widget is not loaded inside Zoho CRM</li>
              <li>This widget MUST be accessed through Zoho CRM's interface, not directly in a browser</li>
              <li>Clear your browser cache and refresh if you see unexpected errors</li>
              <li>Check the browser console (F12) for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}