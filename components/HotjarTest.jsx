"use client";

import { useState, useEffect } from "react";

export default function HotjarTest() {
  const [hotjarStatus, setHotjarStatus] = useState("Checking...");
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const checkHotjar = () => {
      const results = [];
      
      // Check if window.hj exists
      if (typeof window !== 'undefined' && window.hj) {
        results.push("✅ window.hj is available");
        setHotjarStatus("✅ Hotjar is loaded");
        
        // Test sending an event
        try {
          window.hj('event', 'hotjar_test_component', {
            component: 'HotjarTest',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
          results.push("✅ Test event sent successfully");
        } catch (error) {
          results.push(`❌ Failed to send test event: ${error.message}`);
        }
        
        // Check Hotjar settings
        if (window._hjSettings) {
          results.push(`✅ Hotjar settings found: ID ${window._hjSettings.hjid}`);
        } else {
          results.push("⚠️ Hotjar settings not found");
        }
        
        // Check if there are queued events
        if (window.hj.q && window.hj.q.length > 0) {
          results.push(`✅ Hotjar queue has ${window.hj.q.length} events`);
        } else {
          results.push("ℹ️ Hotjar queue is empty");
        }
        
      } else {
        results.push("❌ window.hj is not available");
        setHotjarStatus("❌ Hotjar not detected");
      }
      
      setTestResults(results);
    };

    // Check immediately
    checkHotjar();
    
    // Check again after 2 seconds
    setTimeout(checkHotjar, 2000);
    
    // Check again after 5 seconds
    setTimeout(checkHotjar, 5000);
  }, []);

  const sendTestEvent = () => {
    if (typeof window !== 'undefined' && window.hj) {
      try {
        window.hj('event', 'manual_test', {
          action: 'button_click',
          timestamp: new Date().toISOString()
        });
        alert("✅ Test event sent! Check your Hotjar dashboard.");
      } catch (error) {
        alert(`❌ Failed to send test event: ${error.message}`);
      }
    } else {
      alert("❌ Hotjar is not available");
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "white",
      border: "2px solid #333",
      borderRadius: "8px",
      padding: "15px",
      maxWidth: "300px",
      zIndex: 10000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>
        🔥 Hotjar Status: {hotjarStatus}
      </h3>
      
      <div style={{ fontSize: "12px", marginBottom: "10px" }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ marginBottom: "2px" }}>
            {result}
          </div>
        ))}
      </div>
      
      <button
        onClick={sendTestEvent}
        style={{
          background: "#ff6b35",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold"
        }}
      >
        Send Test Event
      </button>
    </div>
  );
}
