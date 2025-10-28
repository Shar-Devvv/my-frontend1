"use client";

import { useEffect, useState } from "react";

/**
 * Resume Tracking Component
 * Automatically tracks when a resume preview is viewed
 * Sends tracking data to backend API endpoint
 */
export default function ResumeTracking({ resumeId }) {
  const [trackingStatus, setTrackingStatus] = useState("pending");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resumeId) {
      console.warn("⚠️ ResumeTracking: No resumeId provided");
      return;
    }

    const trackView = async () => {
      try {
        console.log("📊 Tracking resume view for ID:", resumeId);
        
        const response = await fetch("/api/track-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId: resumeId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Resume view tracked successfully:", data);
          setTrackingStatus("success");
        } else {
          const errorData = await response.json();
          console.error("❌ Failed to track resume view:", errorData);
          setError(errorData.message || "Failed to track view");
          setTrackingStatus("error");
        }
      } catch (err) {
        console.error("❌ Error tracking resume view:", err);
        setError(err.message);
        setTrackingStatus("error");
      }
    };

    // Track the view after a short delay to ensure page is fully loaded
    const timer = setTimeout(trackView, 1000);
    
    return () => clearTimeout(timer);
  }, [resumeId]);

  // Optional: Return a small indicator (hidden by default)
  if (process.env.NODE_ENV === "development") {
    return (
      <div style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: trackingStatus === "success" ? "#10b981" : trackingStatus === "error" ? "#ef4444" : "#f59e0b",
        color: "white",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        zIndex: 1000
      }}>
        📊 Tracking: {trackingStatus}
        {error && ` (${error})`}
      </div>
    );
  }

  return null; // Hidden in production
}

