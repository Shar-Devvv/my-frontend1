"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PreviewPage() {
  const params = useParams();
  const uniqueId = params.id || params.uniqueId;

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [views, setViews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [breakdowns, setBreakdowns] = useState(null);
  const [resolvedResumeId, setResolvedResumeId] = useState(null);
  // ✅ TRACK ANALYTICS VIEW
useEffect(() => {
  if (!resolvedResumeId) return;

  // Call track-view API
  fetch("https://my-backend-wo75.onrender.com/api/track-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resumeId: resolvedResumeId,
      uniqueId: resolvedResumeId, // ✅ backend requires it
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log("✅ View Tracked:", data))
    .catch((err) => console.log("❌ Tracking Error:", err));
}, [resolvedResumeId]);


  // ✅ Fetch Resume
  useEffect(() => {
    const loadResume = async () => {
      if (!uniqueId) {
        setError("Resume ID Not Found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://my-backend-wo75.onrender.com/api/resume/public/${uniqueId}`
        );

        if (!res.ok) throw new Error("Resume not found");

        const data = await res.json();

        if (!data.success) {
          setError("Resume not found");
          return;
        }

        setResume(data.resume);

        // ✅ FIX: actual resume ID used for analytics
        setResolvedResumeId(
          data.resumeId || data.resume._id || uniqueId
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [uniqueId]);

  // ✅ Analytics Modal
  const openAnalyticsPopup = async () => {
    if (!resolvedResumeId) return;

    setShowAnalytics(true);
    setAnalyticsLoading(true);

    try {
      // ✅ Fetch views (correct endpoint)
      const viewsRes = await fetch(
        `https://my-backend-wo75.onrender.com/api/views/${resolvedResumeId}?page=1&limit=50`
      );
      const viewsJson = await viewsRes.json();

      setViews(viewsJson?.data?.views || []);

      // ✅ Fetch summary analytics
      const sumRes = await fetch(
        `https://my-backend-wo75.onrender.com/api/analytics/${resolvedResumeId}`
      );
      const sumJson = await sumRes.json();

      setSummary(sumJson?.data?.summary || null);
      setBreakdowns(sumJson?.data?.breakdowns || null);

    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ✅ Loading UI
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Resume...
      </div>
    );

  // ✅ Error UI
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );

  // ✅ No Resume
  if (!resume)
    return (
      <div className="flex justify-center items-center h-screen">
        Resume Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ✅ HEADER */}
      <div className="bg-white p-6 shadow rounded-xl mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{resume.name}</h1>

          <div className="flex gap-3">
            <button
              onClick={openAnalyticsPopup}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              📊 Analytics
            </button>

            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              🖨 Print
            </button>
          </div>
        </div>
      </div>

      {/* ✅ RESUME HTML */}
      <div
        className="bg-white p-6 rounded-xl shadow"
        dangerouslySetInnerHTML={{ __html: resume.resumeData }}
      />

      {/* ✅ Analytics Modal */}
      {showAnalytics && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowAnalytics(false)}
        >
          <div
            className="bg-white w-full max-w-4xl p-6 rounded-xl max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Resume Analytics</h2>

            {analyticsLoading && <p>Loading analytics...</p>}

            {analyticsError && (
              <p className="text-red-600">{analyticsError}</p>
            )}

            {/* ✅ Summary */}
            {summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <p className="font-semibold text-blue-700">Total Views</p>
                  <p className="text-3xl font-bold">{summary.totalViews}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <p className="font-semibold text-green-700">Unique Views</p>
                  <p className="text-3xl font-bold">{summary.uniqueViews}</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <p className="font-semibold text-purple-700">Duplicates</p>
                  <p className="text-3xl font-bold">
                    {summary.duplicateViews}
                  </p>
                </div>
              </div>
            )}

            {/* ✅ Views List */}
            <h3 className="text-lg font-bold mb-2">Recent Views</h3>

            {views.length === 0 ? (
              <p>No views found</p>
            ) : (
              <div className="space-y-3">
                {views.map((v) => (
                  <div
                    key={v._id}
                    className="p-4 bg-gray-100 rounded-lg border"
                  >
                    <p><b>IP:</b> {v.ipAddress}</p>
                    <p><b>Date:</b> {new Date(v.timestamp).toLocaleString()}</p>
                    <p><b>Device:</b> {v.deviceType}</p>
                    <p>
                      <b>Browser:</b> {v.browserName} ({v.browserVersion})
                    </p>
                    <p><b>OS:</b> {v.operatingSystem}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
