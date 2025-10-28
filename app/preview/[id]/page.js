"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import ResumeTracking from "@/components/ResumeTracking";

// Note: This file is JavaScript (not TypeScript). Any type-like annotations
// have been removed to avoid runtime errors while preserving functionality.

export default function ResumePreviewPage() {
  const params = useParams();
  const uniqueId = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. https://my-backend-wo75.onrender.com

  const [resume, setResume] = useState(null);
  const [resolvedResumeId, setResolvedResumeId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state
  const [showViews, setShowViews] = useState(false);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsError, setViewsError] = useState(null);
  const [views, setViews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [breakdowns, setBreakdowns] = useState(null);

  // Derived title/date
  const lastUpdated = useMemo(() => {
    if (!resume?.createdAt) return "Unknown";
    try {
      return new Date(resume.createdAt).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  }, [resume?.createdAt]);

  useEffect(() => {
    const fetchResume = async () => {
      if (!API_BASE) {
        console.warn("NEXT_PUBLIC_API_BASE is not set");
      }

      try {
        setLoading(true);
        setError(null);

        // Use the public endpoint that also auto-tracks the view
        // Make sure your backend route: GET /api/resume/public/:uniqueId
        const url = `${API_BASE}/api/resume/public/${uniqueId}`;
        const res = await fetch(url);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Resume not found");
          } else {
            setError("Failed to load resume");
          }
          return;
        }

        const data = await res.json();
        // Expected shape: { success: true, resume: { name, resumeData, createdAt, _id? }, resumeId?: string }
        setResume(data.resume || null);

        // Resolve the Mongo resume _id if backend includes it
        // Prefer explicit resumeId if provided; otherwise use resume._id if present
        const idFromBackend = (data && data.resumeId) || (data && data.resume && data.resume._id);
        if (idFromBackend) {
          setResolvedResumeId(String(idFromBackend));
        } else {
          // Fallback: use the public uniqueId. If your /api/views/:id endpoint
          // ONLY accepts MongoId, you should update public route to include _id.
          setResolvedResumeId(uniqueId);
        }
      } catch (err) {
        console.error("❌ Error fetching resume:", err);
        setError("Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    if (uniqueId) fetchResume();
  }, [uniqueId, API_BASE]);

  const openViewsPopup = async () => {
    if (!resolvedResumeId) return;
    setShowViews(true);
    setViewsLoading(true);
    setViewsError(null);

    try {
      // 1) Fetch paginated views
      const url = `${API_BASE}/api/views/${resolvedResumeId}?page=1&limit=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch views (${res.status})`);
      const data = await res.json();

      setViews(data?.data?.views || []);
      setAnalytics(data?.data?.analytics || null);

      // 2) Fetch analytics summary + breakdowns
      const url2 = `${API_BASE}/api/analytics/${resolvedResumeId}`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const analyticsData = await res2.json();
        setSummary(analyticsData?.data?.summary || null);
        setBreakdowns(analyticsData?.data?.breakdowns || null);
      }
    } catch (e) {
      setViewsError(e?.message || "Failed to load views");
    } finally {
      setViewsLoading(false);
    }
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
        Loading resume...
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
        <p style={{ color: "#666", marginBottom: "20px" }}>
          The resume you're looking for might not exist or has been removed.
        </p>
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Auto tracking component (already posts track events) */}
      <ResumeTracking resumeId={uniqueId} />

      {/* Resume Content */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "20px",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}>
          <div>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 10px 0"
            }}>
              {resume?.name || "Resume Preview"}
            </h1>
            <p style={{
              color: "#6b7280",
              margin: "0",
              fontSize: "0.9rem"
            }}>
              Last updated: {lastUpdated}
            </p>
          </div>

          <button
            onClick={openViewsPopup}
            style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            View Analytics
          </button>
        </div>

        {/* Resume HTML */}
        <div
          dangerouslySetInnerHTML={{ __html: resume?.resumeData || "" }}
          style={{
            lineHeight: "1.6",
            color: "#374151"
          }}
        />
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "20px",
        color: "#6b7280",
        fontSize: "0.8rem"
      }}>
        <p>Resume ID (public): {uniqueId}</p>
        <p>View tracking is enabled for analytics</p>
      </div>

      {/* Analytics Popup */}
      {showViews && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50
          }}
          onClick={() => setShowViews(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              maxHeight: "80vh",
              overflow: "auto"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Resume Views {resolvedResumeId ? `(id: ${resolvedResumeId})` : ""}
              </h2>
              <button
                onClick={() => setShowViews(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #e5e7eb",
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>

            {viewsLoading && <p style={{ margin: 0, color: "#6b7280" }}>Loading views...</p>}
            {viewsError && <p style={{ margin: 0, color: "#ef4444" }}>{viewsError}</p>}

            {!viewsLoading && !viewsError && (
              <div>
                {/* Top summary */}
                {(summary || analytics) && (
                  <div style={{
                    marginBottom: 12,
                    color: "#374151",
                    fontSize: 14,
                    display: "grid",
                    gap: 6
                  }}>
                    <div>
                      <strong>Total Views:</strong>{" "}
                      {summary?.totalViews ?? analytics?.totalViews ?? "—"}
                      {"  "}·{"  "}
                      <strong>Unique Views:</strong>{" "}
                      {summary?.uniqueViews ?? analytics?.uniqueViews ?? "—"}
                      {summary?.duplicateViews != null && (
                        <>
                          {"  "}·{"  "}
                          <strong>Duplicates:</strong>{" "}
                          {summary.duplicateViews}
                        </>
                      )}
                    </div>
                    {(analytics?.currentPage || analytics?.totalPages) && (
                      <div>
                        <strong>Page:</strong>{" "}
                        {analytics?.currentPage || 1} / {analytics?.totalPages || 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Breakdown chips */}
                {breakdowns && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {(breakdowns.devices || []).map((d) => (
                      <span key={`dev-${d._id}`} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>
                        {d._id || "Unknown Device"}: {d.count}
                      </span>
                    ))}
                    {(breakdowns.browsers || []).map((b) => (
                      <span key={`br-${b._id}`} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>
                        {b._id || "Unknown Browser"}: {b.count}
                      </span>
                    ))}
                    {(breakdowns.operatingSystems || []).map((o) => (
                      <span key={`os-${o._id}`} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>
                        {o._id || "Unknown OS"}: {o.count}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: "1px solid #e5e7eb" }} />

                {/* Views list */}
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {views.length === 0 && (
                    <p style={{ margin: 0, color: "#6b7280" }}>No views yet.</p>
                  )}
                  {views.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: 12,
                        display: "grid",
                        gap: 4,
                        fontSize: 14,
                        color: "#374151",
                        background: "#fafafa"
                      }}
                    >
                      <div><strong>IP:</strong> {v.ipAddress || "Unknown"}</div>
                      <div><strong>Date:</strong> {v.timestamp ? new Date(v.timestamp).toLocaleString() : (v.createdAt ? new Date(v.createdAt).toLocaleString() : "—")}</div>
                      <div><strong>Browser:</strong> {v.browserName || "—"} {v.browserVersion ? `(${v.browserVersion})` : ""}</div>
                      <div><strong>Device:</strong> {v.deviceType || "—"}</div>
                      <div><strong>OS:</strong> {v.operatingSystem || "—"}</div>
                      <div><strong>Referrer:</strong> {v.referrerUrl || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}