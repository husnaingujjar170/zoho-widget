'use client'

import { useState, useEffect } from "react";

declare global {
  interface Window {
    ZOHO: any;
  }
}

const ZohoApp = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch current user, Contacts, and Leads
  const fetchZohoRecords = () => {
    if (typeof window !== 'undefined' && window.ZOHO) {
      // Fetch Current User
      window.ZOHO.CRM.CONFIG.getCurrentUser()
        .then((response: any) => {
          console.log("Current User Info:", response);
          if (response.data) {
            setCurrentUser(response.data);
          }
        })
        .catch((error: any) => {
          console.error("Error fetching current user:", error);
          setError("Error fetching current user.");
        });

      // Fetch Contacts
      window.ZOHO.CRM.API.getAllRecords({ Entity: "Contacts" })
        .then((response: any) => {
          console.log("Fetched contacts:", response);
          if (response.data) {
            setContacts(response.data);
          }
        })
        .catch((error: any) => {
          console.error("Error fetching Zoho CRM contacts:", error);
          setError("Error fetching contacts from Zoho CRM.");
        });

      // Fetch Leads
      window.ZOHO.CRM.API.getAllRecords({ Entity: "Leads" })
        .then((response: any) => {
          console.log("Fetched leads:", response);
          if (response.data) {
            setLeads(response.data);
          }
          setLoading(false);
        })
        .catch((error: any) => {
          console.error("Error fetching Zoho CRM leads:", error);
          setError("Error fetching leads from Zoho CRM.");
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchZohoRecords();
  }, []);

  return (
    <div>
      <h2>Current User Info:</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div>
          <h3>Current User:</h3>
          {currentUser ? (
            <div>
              <p><strong>Name:</strong> {currentUser.full_name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
            </div>
          ) : (
            <p>No current user data available.</p>
          )}

          <h3>Contacts</h3>
          <ul>
            {contacts.map((record: any) => (
              <li key={record.id}>{record.Full_Name}</li>
            ))}
          </ul>

          <h3>Leads</h3>
          <ul>
            {leads.map((record: any) => (
              <li key={record.id}>{record.Full_Name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ZohoApp;

