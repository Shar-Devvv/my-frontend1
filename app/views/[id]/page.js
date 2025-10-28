"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Admin Page: View Resume Analytics
 * GET /views/[id]
 * 
 * Shows all views for a specific resume
 * Displays IP, timestamp, browser info, etc.
 */
export default function ViewsPage() {
  const params = useParams();
  const resumeId = params.id;
  
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        console.log("📊 Fetching views for resume ID:", resumeId);
        
        const response = await fetch(`/api/views/${resumeId}`);
        
        if (response.ok) {
          const data = await response.json();
          setViews(data.views || []);
          setResumeInfo(data.resumeInfo);
          console.log("✅ Views loaded successfully:", data.views?.length || 0);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to load views");
        }
      } catch (err) {
        console.error("❌ Error fetching views:", err);
        setError("Failed to load views");
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchViews();
    }
  }, [resumeId]);

  useEffect(() => {
    if (!id) return;
  
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: id }),
    });
  }, [id]);
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationFromIP = (ip) => {
    // This is a placeholder - you could integrate with IP geolocation services
    if (ip === "unknown" || ip === "127.0.0.1") return "Local";
    return ip;
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "1.2rem",
        color: "#666"
      }}>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#ef4444", marginBottom: "20px" }}>
          {error}
        </h1>
        <a 
          href="/" 
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "20px"
        }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "bold", 
            color: "#1f2937",
            margin: "0 0 10px 0"
          }}>
            📊 Resume Analytics
          </h1>
          {resumeInfo && (
            <div style={{ color: "#6b7280", marginBottom: "20px" }}>
              <p><strong>Resume:</strong> {resumeInfo.name}</p>
              <p><strong>Total Views:</strong> {views.length}</p>
              <p><strong>Resume ID:</strong> {resumeId}</p>
            </div>
          )}
        </div>

        {/* Views Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb"
          }}>
            <h2 style={{ margin: "0", fontSize: "1.2rem", color: "#374151" }}>
              View History ({views.length} views)
            </h2>
          </div>

          {views.length === 0 ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280"
            }}>
              <p>No views recorded yet.</p>
              <p>Views will appear here when someone visits the resume preview.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      Date & Time
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      IP Address
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      Browser
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      Device
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      OS
                    </th>
                    <th style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {views.map((view, index) => (
                    <tr key={view._id || index} style={{
                      borderBottom: "1px solid #f3f4f6"
                    }}>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontSize: "0.9rem"
                      }}>
                        {formatDate(view.timestamp)}
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontFamily: "monospace",
                        fontSize: "0.9rem"
                      }}>
                        {getLocationFromIP(view.ipAddress)}
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontSize: "0.9rem"
                      }}>
                        {view.browser || "Unknown"}
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontSize: "0.9rem"
                      }}>
                        <span style={{
                          background: view.device === "mobile" ? "#fef3c7" : 
                                     view.device === "tablet" ? "#dbeafe" : "#f3f4f6",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          textTransform: "capitalize"
                        }}>
                          {view.device || "Unknown"}
                        </span>
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontSize: "0.9rem"
                      }}>
                        {view.os || "Unknown"}
                      </td>
                      <td style={{
                        padding: "12px 16px",
                        color: "#374151",
                        fontSize: "0.9rem",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {view.referrer ? (
                          <a 
                            href={view.referrer} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: "#3b82f6", textDecoration: "none" }}
                          >
                            {view.referrer}
                          </a>
                        ) : (
                          "Direct"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          padding: "20px",
          color: "#6b7280",
          fontSize: "0.9rem"
        }}>
          <p>Analytics data is collected automatically when resumes are viewed</p>
          <a 
            href="/" 
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

