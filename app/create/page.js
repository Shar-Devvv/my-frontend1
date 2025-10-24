"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

// --- JODIT EDITOR DYNAMIC IMPORT ---
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// --- INITIAL TEMPLATE ---
const INITIAL_RESUME_HTML = `
<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 700px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
        <div>
            <h1 style="margin: 0; font-size: 24px; color: #333;">Your Name Here</h1>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #666;">Professional Title / Role</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">(123) 456-7890 | email@example.com | LinkedIn/Profile</p>
        </div>
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
             alt="Profile Picture" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #ccc;">
    </div>

    <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; color: #333;">Profile Summary</h2>
    <p>Highly motivated and results-oriented professional with 5+ years of experience in MERN stack development, specializing in scalable web applications and intuitive user interfaces. Seeking a challenging role to leverage expertise in Node.js, React, and MongoDB.</p>

    <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; color: #333;">Professional Experience</h2>
    
    <div style="margin-bottom: 15px;">
        <h3 style="font-size: 16px; margin: 0;">Senior MERN Developer | Tech Solutions Inc.</h3>
        <p style="font-style: italic; font-size: 12px; margin: 0 0 5px 0;">2020 - Present</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
            <li>Developed and maintained core API services using Node.js and Express.</li>
            <li>Led migration of legacy systems to a React/Redux frontend.</li>
            <li>Optimized database queries in MongoDB, resulting in 40% performance improvement.</li>
        </ul>
    </div>

    <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; color: #333;">Skills</h2>
    <p style="font-size: 12px;">JavaScript (ES6+), React, Node.js, MongoDB, Tailwind CSS, REST APIs, Git</p>
</div>
`;

// --- REUSABLE MESSAGE HOOK ---
const useAppMessages = () => {
  const [message, setMessage] = useState(null);
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };
  return { message, showMessage };
};

// --- JODIT EDITOR COMPONENT ---
const ResumeEditor = ({ initialContent, handleContentChange }) => {
  const editor = useRef(null);
  const config = {
    readonly: false,
    height: 842,
    toolbarAdaptive: false,
    toolbarSticky: false,
    uploader: { insertImageAsBase64URI: true },
    buttons: [
      "source", "|",
      "bold", "italic", "underline", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "align", "|",
      "link", "image", "table", "|",
      "undo", "redo", "hr", "|",
      "brush", "fontsize", "paragraph", "preview",
    ],
    removeButtons: ["file", "video"],
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      <JoditEditor
        ref={editor}
        value={initialContent}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => handleContentChange(newContent)}
      />
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
function Page() {
  const [editorContent, setEditorContent] = useState(INITIAL_RESUME_HTML);
  const [name, setName] = useState("Your Name Here");
  const [recents, setRecents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState(""); // ✅ NEW: Store shareable link
  const [showLinkCopied, setShowLinkCopied] = useState(false); // ✅ NEW: Copy feedback
  const { message, showMessage } = useAppMessages();
  const { data: session, status } = useSession();

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedResumes") || "[]");
    setRecents(saved);
  }, []);

  // Save to localStorage when recents change
  useEffect(() => {
    localStorage.setItem("savedResumes", JSON.stringify(recents));
  }, [recents]);

  const handleContentChange = (content) => setEditorContent(content);

  const handleSaveResume = async () => {
  if (!name.trim()) {
    showMessage("Please enter a valid name before saving.");
    return;
  }

  try {
    const res = await fetch("https://my-backend-wo75.onrender.com/api/resume/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        resumeData: editorContent,
      }),
    });

    const data = await res.json();

    if (data.success) {
      showMessage(`✅ Saved "${name}" successfully!`);
      
      // ✅ Construct the preview URL from uniqueId
      const previewUrl = `http://localhost:3001/preview/${data.uniqueId}`;
      setShareableLink(previewUrl);
      
      setRecents((prev) => [
        { 
          id: data.uniqueId || Date.now(), 
          name: name.trim(), 
          content: editorContent,
          link: previewUrl  // ✅ Store the constructed link
        },
        ...prev,
      ]);
    } else {
      showMessage(`⚠️ ${data.message}`);
    }
  } catch (err) {
    console.error("Save error:", err);
    showMessage("❌ Failed to save resume (server error)");
  }
};
  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setShowLinkCopied(true);
      setTimeout(() => setShowLinkCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const width = doc.internal.pageSize.getWidth() - 2 * margin;
    doc.html(editorContent, {
      callback: function (d) {
        d.save(`${name || "resume"}.pdf`);
        showMessage("📄 PDF Download Started!");
      },
      x: margin,
      y: margin,
      width: width,
      windowWidth: 700,
    });
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <>
      {/* ✅ HAMBURGER ICON */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "8px 10px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        ☰
      </button>

      {/* 📌 SIDEBAR */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: sidebarOpen ? 0 : 300 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 260,
          height: "100%",
          background: "#111827",
          color: "#fff",
          padding: "20px 15px",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
          zIndex: 9999,
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1.3rem",
            cursor: "pointer",
          }}
          title="Close"
        >
          ✖
        </button>

        <h2 style={{ fontSize: "1.2rem", marginBottom: 15, marginTop: 35 }}>
          📄 Saved Resumes
        </h2>

        {recents.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#9CA3AF" }}>
            No resumes saved yet.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recents.map((r) => (
              <li
                key={r.id}
                style={{
                  background: "#1F2937",
                  padding: "10px 12px",
                  borderRadius: 6,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#374151")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1F2937")
                }
              >
                <div
                  style={{ flexGrow: 1, cursor: "pointer" }}
                  onClick={() => {
                    setEditorContent(r.content);
                    setName(r.name);
                    setShareableLink(r.link || "");
                    showMessage(`✅ Loaded "${r.name}"`);
                    setSidebarOpen(false);
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                    Click to load this resume
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecents((prev) =>
                      prev.filter((item) => item.id !== r.id)
                    );
                    showMessage(`🗑️ Deleted "${r.name}"`);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#F87171",
                    cursor: "pointer",
                    fontSize: "1rem",
                    marginLeft: 10,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#DC2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#F87171")
                  }
                  title="Delete this resume"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}

        {recents.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all saved resumes?")) setRecents([]);
            }}
            style={{
              marginTop: 15,
              width: "100%",
              background: "#EF4444",
              border: "none",
              padding: "8px",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🧹 Clear All
          </button>
        )}
      </motion.div>

      {/* 🧭 MAIN CONTENT */}
      <motion.div
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        animate={{ marginRight: sidebarOpen ? 260 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{
          fontFamily: "Inter, sans-serif",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        {message && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: sidebarOpen ? 280 : 20,
              background: "#111",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 6,
              zIndex: 1100,
              transition: "right 0.3s ease",
            }}
          >
            {message}
          </div>
        )}

        <motion.div
          className="main shadow-lg border"
          style={{
            display: "flex",
            backgroundColor: "#fff",
            borderRadius: 12,
            maxWidth: 1200,
            margin: "20px auto",
          }}
        >
          {/* LEFT: Editor */}
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              flexGrow: 1,
              padding: 20,
              borderRight: "1px solid #e5e7eb",
              minHeight: "80vh",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 15 }}>
              Live Resume Editor (A4 View)
            </h2>
            <motion.div
              whileHover={{ scale: 1.005 }}
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                minHeight: 842,
              }}
            >
              <ResumeEditor
                initialContent={editorContent}
                handleContentChange={handleContentChange}
              />
            </motion.div>
          </motion.div>

          {/* RIGHT: Controls */}
          <motion.div
            initial={{ x: 200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: 400, padding: "30px 20px", minHeight: "80vh" }}
          >
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: 30,
              }}
            >
              Resume Controls
            </h1>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Resume Name"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ccc",
                marginBottom: 20,
              }}
            />

            <div style={{ marginBottom: 20 }}>
              <motion.button
                onClick={handleSaveResume}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#3b82f6",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                💾 Save Resume
              </motion.button>
            </div>

            {/* ✅ SHAREABLE LINK SECTION */}
            {shareableLink && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 30,
                  padding: 15,
                  border: "2px solid #10b981",
                  borderRadius: 8,
                  backgroundColor: "#ecfdf5",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#065f46",
                    marginBottom: 10,
                  }}
                >
                  🔗 Shareable Link
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid #10b981",
                      fontSize: "0.85rem",
                      backgroundColor: "#fff",
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#10b981",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {showLinkCopied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <a
                  href={shareableLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    color: "#059669",
                    textDecoration: "underline",
                    fontSize: "0.85rem",
                  }}
                >
                  🔍 Open Preview
                </a>
              </motion.div>
            )}

            <div
              style={{
                marginTop: 40,
                padding: 20,
                border: "1px solid #e0e7ff",
                borderRadius: 8,
                backgroundColor: "#f0f4ff",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Download Resume
              </h2>
              <button
                onClick={handleDownloadPDF}
                style={{
                  width: "100%",
                  padding: "12px 25px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: "#10b981",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ⬇️ Download PDF with Edits
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default Page;