// _app.js
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://live.zwidgets.com/js-sdk/1.4/ZohoEmbededAppSDK.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}
