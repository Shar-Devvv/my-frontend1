"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ViewsPage() {
  const params = useParams();
  const resumeId = params.unqiueid; // ✅ Correct param name
  
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);

  // ✅ FETCH ANALYTICS
  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(`/api/views/${resumeId}`);
        
        if (response.ok) {
          const data = await response.json();
          setViews(data.views || []);
          setResumeInfo(data.resumeInfo);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to load views");
        }
      } catch (err) {
        setError("Failed to load views");
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) fetchViews();
  }, [resumeId]);

  // ✅ TRACK VIEW (Fixed: replaced id → resumeId)
  useEffect(() => {
    if (!resumeId) return;

    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });
  }, [resumeId]); // ✅ Correct dependency

  const formatDate = (dateString) => new Date(dateString).toLocaleString();
  const getLocationFromIP = (ip) => ip === "unknown" ? "Local" : ip;

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Resume Analytics</h1>

      {resumeInfo && (
        <div>
          <p><strong>Resume:</strong> {resumeInfo.name}</p>
          <p><strong>Total Views:</strong> {views.length}</p>
          <p><strong>Resume ID:</strong> {resumeId}</p>
        </div>
      )}

      {/* ✅ TABLE */}
      <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>IP</th>
            <th>Browser</th>
            <th>Device</th>
            <th>OS</th>
            <th>Referrer</th>
          </tr>
        </thead>

        <tbody>
          {views.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No views yet
              </td>
            </tr>
          ) : (
            views.map((view) => (
              <tr key={view._id}>
                <td>{formatDate(view.timestamp)}</td>
                <td>{getLocationFromIP(view.ipAddress)}</td>
                <td>{view.browserName || "Unknown"}</td>
                <td>{view.deviceType || "Unknown"}</td>
                <td>{view.operatingSystem || "Unknown"}</td>
                <td>
                  {view.referrerUrl ? (
                    <a href={view.referrerUrl} target="_blank" rel="noreferrer">
                      {view.referrerUrl}
                    </a>
                  ) : (
                    "Direct"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
