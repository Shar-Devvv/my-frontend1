"use client";

import { useState } from "react";

export default function AnalyticsButton({ resumeId, uniqueId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/views/${resumeId}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to load analytics");
        return;
      }

      // ✅ Extract Stats
      const views = json.views || [];

      const totalViews = views.length;
      const uniqueViews = views.filter(v => v.isUniqueView).length;

      const latestView = views.length ? views[0]?.timestamp : "No views yet";

      // ✅ Count device types
      const deviceCount = views.reduce(
        (acc, v) => {
          acc[v.deviceType || "unknown"]++;
          return acc;
        },
        { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
      );

      // ✅ Count browsers
      const browserCount = views.reduce((acc, v) => {
        const b = v.browserName || "Unknown";
        acc[b] = (acc[b] || 0) + 1;
        return acc;
      }, {});

      setData({
        totalViews,
        uniqueViews,
        latestView,
        deviceCount,
        browserCount,
        list: views,
      });
    } catch (err) {
      setError("Error fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Button */}
      <button
        onClick={fetchAnalytics}
        style={{
          padding: "10px 18px",
          background: "#3b82f6",
          color: "white",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        📊 Analytics
      </button>

      {/* ✅ Popup */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "500px",
              background: "white",
              borderRadius: "10px",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>📊 Resume Analytics</h2>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : data ? (
              <>
                <p><strong>Total Views:</strong> {data.totalViews}</p>
                <p><strong>Unique Views:</strong> {data.uniqueViews}</p>
                <p><strong>Latest View:</strong> {new Date(data.latestView).toLocaleString()}</p>

                <h3 style={{ marginTop: "15px" }}>👤 Device Type</h3>
                <ul>
                  <li>Desktop: {data.deviceCount.desktop}</li>
                  <li>Mobile: {data.deviceCount.mobile}</li>
                  <li>Tablet: {data.deviceCount.tablet}</li>
                  <li>Unknown: {data.deviceCount.unknown}</li>
                </ul>

                <h3>🧭 Browsers</h3>
                <ul>
                  {Object.keys(data.browserCount).map((browser) => (
                    <li key={browser}>
                      {browser}: {data.browserCount[browser]}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: "15px",
                padding: "8px 14px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
