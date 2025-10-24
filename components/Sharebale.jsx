"use client";
import { useState } from "react";

export default function ResumeLink({ link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!link) return null;

  return (
    <div className="mt-4 flex items-center space-x-2">
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        View Latest Resume
      </a>
      <button onClick={handleCopy} className="px-2 py-1 bg-gray-200 rounded">
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
