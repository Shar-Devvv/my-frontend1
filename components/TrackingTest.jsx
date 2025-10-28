"use client";

import { useState } from "react";

/**
 * Tracking Test Component
 * Use this to test the tracking system manually
 * Remove after testing is complete
 */
export default function TrackingTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testTracking = async () => {
    setLoading(true);
    setTestResults([]);
    
    const testResumeId = "test-resume-" + Date.now();
    const results = [];

    try {
      // Test 1: Track a view
      results.push("🧪 Testing view tracking...");
      
      const response = await fetch("/api/track-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: testResumeId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: "test-referrer"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        results.push("✅ View tracking successful");
        results.push(`📊 View ID: ${data.viewId}`);
      } else {
        const error = await response.json();
        results.push(`❌ View tracking failed: ${error.message}`);
      }

      // Test 2: Get views for resume
      results.push("🧪 Testing analytics retrieval...");
      
      const viewsResponse = await fetch(`/api/views/${testResumeId}`);
      
      if (viewsResponse.ok) {
        const viewsData = await viewsResponse.json();
        results.push("✅ Analytics retrieval successful");
        results.push(`📊 Total views: ${viewsData.totalViews}`);
      } else {
        const error = await viewsResponse.json();
        results.push(`❌ Analytics retrieval failed: ${error.message}`);
      }

    } catch (error) {
      results.push(`❌ Test failed: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
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
      maxWidth: "400px",
      zIndex: 10000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>
        🧪 Tracking System Test
      </h3>
      
      <button
        onClick={testTracking}
        disabled={loading}
        style={{
          background: loading ? "#6b7280" : "#3b82f6",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px"
        }}
      >
        {loading ? "Testing..." : "Run Test"}
      </button>
      
      {testResults.length > 0 && (
        <div style={{ fontSize: "12px", color: "#374151" }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {result}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "10px" }}>
        Remove this component after testing
      </div>
    </div>
  );
}

