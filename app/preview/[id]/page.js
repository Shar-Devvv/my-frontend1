'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PreviewPage() {
  const params = useParams();
  // ✅ Works for both [id] and [uniqueId] folder names
  const uniqueId = params.uniqueId || params.id;
  
  console.log('All params:', params);
  console.log('Extracted uniqueId:', uniqueId);
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!uniqueId) {
        console.log('❌ uniqueId is missing!');
        setError('No resume ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching resume with uniqueId:', uniqueId);
        
        // ✅ Use PUBLIC endpoint (no authentication)
        const response = await fetch(
          `https://my-backend-wo75.onrender.com/api/resume/public/${uniqueId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        if (data.success && data.resume) {
          setResume(data.resume);
          setError(null);
        } else {
          setError(data.message || 'Resume not found');
        }
      } catch (err) {
        console.error('❌ Failed to load resume:', err);
        setError(`Failed to load resume: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [uniqueId]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading resume...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-2xl">
          <div className="text-7xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">{error}</h2>
          <p className="text-gray-600 mb-4">This resume link may be invalid or the resume has been deleted.</p>
          {uniqueId && (
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">Resume ID:</p>
              <p className="text-sm font-mono text-gray-700 break-all">{uniqueId}</p>
            </div>
          )}
          <button
            onClick={() => window.location.href = '/create'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Create Your Own Resume
          </button>
        </div>
      </div>
    );
  }

  // No Resume Found
  if (!resume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">No resume data available</h2>
        </div>
      </div>
    );
  }

  // Success - Display Resume
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-t-xl shadow-lg p-6 border-b-4 border-indigo-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {resume.name || 'Untitled Resume'}
              </h1>
              {resume.createdAt && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    Created: {new Date(resume.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>🖨️</span>
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  const link = window.location.href;
                  navigator.clipboard.writeText(link);
                  alert('Link copied to clipboard!');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>🔗</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resume Content Card */}
        <div className="bg-white shadow-lg rounded-b-xl p-8 sm:p-12">
          <div
            className="resume-content prose max-w-none"
            dangerouslySetInnerHTML={{ __html: resume.resumeData }}
            style={{ 
              minHeight: '400px',
              lineHeight: '1.7'
            }}
          />
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-8 bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 mb-4">Want to create your own professional resume?</p>
          <a
            href="/create"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Create Your Resume Now →
          </a>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .bg-gradient-to-br,
          button,
          a[href="/create"] {
            display: none !important;
          }
          .resume-content {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .bg-white {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}