'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PreviewPage() {
  const params = useParams();
  const uniqueId = params.id; // ✅ Changed from params.uniqueId to params.id
  
  console.log('Params:', params);
  console.log('uniqueId:', uniqueId);
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!uniqueId) {
        console.log('uniqueId is missing!');
        setError('No resume ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching resume with uniqueId:', uniqueId);
        
        const response = await fetch(
          `https://my-backend-wo75.onrender.com/api/resume/preview/${uniqueId}`
        );
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          setResume(data.resume);
          setError(null);
        } else {
          setError(data.message || 'Resume not found');
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        setError('Resume not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading resume...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">❌ {error}</h2>
          <p className="mt-4 text-gray-600">This resume link may be invalid or expired.</p>
          <p className="mt-2 text-sm text-gray-500">ID: {uniqueId || 'undefined'}</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No resume found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container max-w-4xl mx-auto p-8">
      <div className="preview-header mb-6 text-center">
      </div>

      <div 
        className="resume-preview bg-white shadow-lg p-8 rounded-lg"
        dangerouslySetInnerHTML={{ __html: resume?.resumeData }}
      />

      

      {resume?.createdAt && (
        <div className="text-center mt-4 text-gray-500 text-sm">
          Created: {new Date(resume.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}