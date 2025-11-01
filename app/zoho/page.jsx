"use client"
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (window.ZOHO) {
      ZOHO.embeddedApp.on("PageLoad", function(data) {
        console.log("Widget Loaded", data);
      });
      ZOHO.embeddedApp.init();
    }
  }, []);

  const getLead = async () => {
    const res = await ZOHO.CRM.API.getRecord({
      Entity: "Leads",
      RecordID: "123456789"
    });
    console.log(res);
  };

  return (
    <div>
      <h1>Zoho Widget in Next.js</h1>
      <button onClick={getLead}>Fetch Lead</button>
    </div>
  );
}
