"use client"
import { useState} from 'react';
import { useEffect} from 'react';
import { useSession, signOut } from "next-auth/react";
// FIX: Using dynamic import or a script tag is usually required in restricted environments
// For this environment, we will comment out the import statement to proceed 
// and assume jsPDF is globally available (e.g., loaded via a script tag).
import { jsPDF } from "jspdf"; 
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import About from './Pages/About';
import Link from 'next/link';
import Recruiter from "../components/recruiter";
import SignupPage from './signup/page';


// Constants
const API_BASE_URL = "https://my-backend-wo75.onrender.com";


// --- NEW/UPDATED: Live Resume Preview Component ---
const ResumePreview = ({ name, uploadedImage }) => {
    // Hardcoded resume content for the live visual mockup
    const contact = { phone: '555-123-4567', email: 'jane.doe@example.com', linkedin: 'linkedin.com/in/janedoe' };
    const summary = "Highly motivated and results-oriented professional with 5+ years of experience in MERN stack development, specializing in scalable web applications and intuitive user interfaces. Seeking a challenging role to leverage expertise in Node.js, React, and MongoDB.";
    const experience = [
        { title: 'Senior MERN Developer', company: 'Tech Solutions Inc.', years: '2020 - Present', duties: ['Developed and maintained core API services using Node.js and Express.', 'Led migration of legacy systems to a React/Redux frontend.', 'Optimized database queries in MongoDB, resulting in 40% performance improvement.'] },
    ];
    const skills = ["JavaScript (ES6+)", "React", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"];

    return (
        <div style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            minHeight: '842px', // Approx A4 height
            width: '80%',
        }}>
            {/* Header / Name */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', marginBottom: '20px', borderBottom: '3px solid #6366f1' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>{name || "YOUR NAME HERE"}</h1>
                    <h2 style={{ fontSize: '1.1rem', color: '#4f46e5', fontWeight: '500', marginTop: '5px' }}>Frontend Developer / UI Specialist</h2>
                </div>
                {uploadedImage && (
                    <img
                        src={uploadedImage}
                        alt="Profile"
                        width="100"
                        height="100"
                        style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid #c7d2fe' }}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                )}
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', color: '#6b7280', marginBottom: '30px' }}>
                <span>📞 {contact.phone}</span>
                <span>📧 {contact.email}</span>
                <span>🔗 {contact.linkedin}</span>
            </div>

            {/* Summary */}
            <section style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>
                    Profile Summary
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#374151' }}>{summary}</p>
            </section>

            {/* Skills */}
            <section style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>
                    Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {skills.map(skill => (
                        <span key={skill} style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>
                            {skill}
                        </span>
                    ))}
                </div>
            </section>

            {/* Experience */}
            <section style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>
                    Professional Experience
                </h3>
                {experience.map((job, index) => (
                    <div key={index} style={{ marginBottom: '15px', paddingLeft: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>{job.title} at Tech Solutions Inc.</h4>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>2020 - Present</span>
                        </div>
                        <ul style={{ listStyleType: 'disc', marginLeft: '20px', fontSize: '0.9rem', color: '#4b5563', marginTop: '5px' }}>
                            {job.duties.map((duty, idx) => <li key={idx} style={{ marginBottom: '3px' }}>{duty}</li>)}
                        </ul>
                    </div>
                ))}
            </section>
        </div>
    );
};




// Custom UI state to replace alert/confirm calls
const useAppMessages = () => {
  const [message, setMessage] = useState(null); // For simple success/error messages
  const [confirmAction, setConfirmAction] = useState(null); // For delete confirmation

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
  };

  return { message, showMessage, confirmAction, setConfirmAction };
};


// Custom Modal Component
const ConfirmModal = ({ title, onConfirm, onCancel }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
        <div style={{
            backgroundColor: '#fff', padding: '20px', borderRadius: '8px', 
            maxWidth: '400px', width: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Confirm Deletion</h3>
            <p style={{ marginBottom: '20px', color: '#555' }}>Are you sure you want to delete the resume titled: <strong>{title}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                    onClick={onCancel} 
                    style={{ padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', background: '#f5f5f5', cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    style={{ padding: '8px 15px', border: 'none', borderRadius: '4px', background: '#e53e3e', color: 'white', cursor: 'pointer' }}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);


function Page() {
  const [img, setImg] = useState(null);
  const [name, setName] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [resumes, setResumes] = useState([]); // New state for recent resumes
  const [selectedResume, setSelectedResume] = useState(null); // New state for viewing/editing

  const { message, showMessage, confirmAction, setConfirmAction } = useAppMessages();
const [sidebarOpen, setSidebarOpen] = useState(false);
const { data: session,status } = useSession();
console.log(session?.accessToken);

useEffect(() => {
  if (status === "authenticated") {
    console.log("Session:", session);

    // Access token may be inside session.user or session itself depending on your NextAuth config
    const token = session?.accessToken || session?.user?.accessToken;

    if (token) {
      fetch("/api/protected", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json())
        .then(data => console.log("Protected data:", data))
        .catch(err => console.error("Fetch error:", err));
    }
  }
}, [status, session]);


  // 1. READ: Function to fetch the list of resumes
  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes`); 
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      // Assuming data is an array of objects: [{id: 1, title: 'Name', filename: '...'}]
      setResumes(data); 
    } catch (error) {
      console.error("Error fetching resumes:", error.message);
      showMessage("Could not load recent resumes.");
    }
  };

  useEffect(() => {
    fetchResumes(); // Fetch the list once when the component loads
  }, []); 
  
  // New function to handle selecting a resume from the list (Read/View)
  const handleSelectResume = (resume) => {
      setSelectedResume(resume);
      setName(resume.title || "");
      // Reconstruct the image URL for the preview
      const imageUrl = `${API_BASE_URL}/uploads/${resume.filename}`;
      setUploadedImage(imageUrl);
      showMessage(`Viewing resume: ${resume.title || resume.id}`);
  };

  // 2. DELETE: Function to handle deletion after confirmation
  const executeDelete = async () => {
  if (!confirmAction) return;

  const { id, title } = confirmAction;
  setConfirmAction(null); // Close the modal immediately

  try {
    const response = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // ✅ Remove deleted resume from state immediately
      setResumes(currentResumes => currentResumes.filter(r => r._id !== id && r.id !== id));

      // ✅ Clear preview if it’s the one deleted
      if (selectedResume && (selectedResume._id === id || selectedResume.id === id)) {
        setSelectedResume(null);
        setName("");
        setUploadedImage(null);
      }

      showMessage(`Successfully deleted: ${title}.`);
    } else {
      showMessage('Failed to delete the resume. The file may no longer exist.');
    }
  } catch (error) {
    console.error("Network error during delete:", error.message);
    showMessage('Network error. Could not connect to the server to delete.');
  }
};
  
  // 3. CREATE: Handle image upload
  const handleClick = async () => {
    if (!img) {
      showMessage("Please select an image first");
      return;
    }
 if (!name.trim()) {
    showMessage("Please enter a name before uploading");
    return;
  }

    const formdata = new FormData();
    formdata.append("image", img);
formdata.append("title",name)

    try {
      const res = await fetch(`${API_BASE_URL}/single`, {
        method: "POST",
        body: formdata
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image.");
      }

      const imageUrl = `${API_BASE_URL}/uploads/${data.filename}`;
      setUploadedImage(imageUrl);
      showMessage("Image uploaded successfully! Remember to save this entry to the Recents list if your backend supports it.");
      
      // We refetch the list to show the new item in 'Recents' if the backend automatically saves it
      await fetchResumes(); 

    } catch (err) {
      console.error(err.message);
      showMessage(`Upload failed: ${err.message}`);
    }
  };


  // PDF Generation (DO NOT TOUCH)
 const handleDownloadPDF = async () => {

    const doc = new jsPDF('p', 'mm', 'a4'); // A4 size
    let y_offset = 20; // Starting Y position

    // --- Content Styling and Generation to match ResumePreview ---
    const page_width = doc.internal.pageSize.getWidth();
    const margin = 20;

    // 1. Header / Name Section
    const header_line_color = '#6366f1'; // Matches the blue color
    const text_color_dark = '#1f2937';
    const text_color_blue = '#4f46e5';

    // Name (H1)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(text_color_dark);
    const name_text = name || "YOUR NAME HERE";
    doc.text(name_text, margin, y_offset);

    // Title/Specialization (H2)
    y_offset += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(text_color_blue);
    doc.text("Frontend Developer / UI Specialist", margin, y_offset);

    // Header Separator Line (Simulate borderBottom)
    y_offset += 10;
    doc.setDrawColor(header_line_color); 
    doc.setLineWidth(1.5);
    doc.line(margin, y_offset, page_width - margin, y_offset);
    y_offset += 10; // Space after the line

    // Profile Image (Top right, if available)
    if (uploadedImage) {
        const img = new Image();
        img.src = uploadedImage;
        img.onload = () => {
            const img_size = 30; // 30mm x 30mm for a good profile picture size
            const img_x = page_width - margin - img_size;
            const img_y = margin;
            
            // Draw image. Note: jsPDF doesn't automatically crop to a circle.
            // We'll draw a square image in the top-right corner near the header.
            doc.addImage(img, "JPEG", img_x, img_y, img_size, img_size);

            // 2. Contact Info (Placed after the image loading if needed, but easier to place after the header)
            // Recalculate y_offset after image placement if it overlaps, but generally we continue down.
            // We will proceed as if the image is an async addition and the text flow continues.
            addContactInfo(doc, y_offset, margin, text_color_dark);

            // The rest of the content must be added inside the onload to ensure it's generated *after* the image is ready.
            // Since we need to match the sequential flow, we'll call the rest of the functions inside onload.
            y_offset = addSummary(doc, y_offset + 10, margin, text_color_dark);
            y_offset = addSkills(doc, y_offset + 10, margin, text_color_dark, text_color_blue);
            y_offset = addExperience(doc, y_offset + 10, margin, text_color_dark);
            
            doc.save("resume.pdf");
        };
        img.onerror = () => {
            // If image fails to load, save the rest of the PDF content
            console.error("Failed to load image for PDF. Generating without image.");
            // 2. Contact Info (Run synchronously)
            y_offset = addContactInfo(doc, y_offset, margin, text_color_dark);
            y_offset = addSummary(doc, y_offset + 10, margin, text_color_dark);
            y_offset = addSkills(doc, y_offset + 10, margin, text_color_dark, text_color_blue);
            y_offset = addExperience(doc, y_offset + 10, margin, text_color_dark);
            
            doc.save("resume.pdf");
        };
    } else {
        // 2. Contact Info (Run synchronously)
        y_offset = addContactInfo(doc, y_offset, margin, text_color_dark);
        y_offset = addSummary(doc, y_offset + 10, margin, text_color_dark);
        y_offset = addSkills(doc, y_offset + 10, margin, text_color_dark, text_color_blue);
        y_offset = addExperience(doc, y_offset + 10, margin, text_color_dark);

        doc.save("resume.pdf");
    }
};

// Helper function to add Contact Info
const addContactInfo = (doc, y_start, margin, text_color) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(text_color);
    const spacing = (doc.internal.pageSize.getWidth() - 2 * margin) / 3;

    doc.text(`📞 ${contact_pdf.phone}`, margin + spacing * 0, y_start, { align: "left" });
    doc.text(`📧 ${contact_pdf.email}`, margin + spacing * 1, y_start, { align: "center" });
    doc.text(`🔗 ${contact_pdf.linkedin}`, margin + spacing * 2, y_start, { align: "right" });

    return y_start + 10;
};

// Helper function to add Summary
const addSummary = (doc, y_start, margin, text_color) => {
    // Section Header (H3)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(text_color);
    doc.text("Profile Summary", margin, y_start);
    y_start += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, y_start, doc.internal.pageSize.getWidth() - margin, y_start);
    y_start += 5;

    // Summary Text
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(text_color);
    const splitText = doc.splitTextToSize(summary_pdf, doc.internal.pageSize.getWidth() - 2 * margin);
    doc.text(splitText, margin, y_start);
    y_start += splitText.length * 5; 

    return y_start;
};

const contact_pdf = { phone: '', email: 'j@example.com', linkedin: 'linkedin.com' };
const summary_pdf = "Highly motivated and results-oriented professional with 5+ years of experience in MERN stack development, specializing in scalable web applications and intuitive user interfaces. Seeking a challenging role to leverage expertise in Node.js, React, and MongoDB.";
const experience_pdf = [
    { title: 'Senior MERN Developer', company: 'Tech Solutions Inc.', years: '2020 - Present', duties: ['Developed and maintained core API services using Node.js and Express.', 'Led migration of legacy systems to a React/Redux frontend.', 'Optimized database queries in MongoDB, resulting in 40% performance improvement.'] },
];
const skills_pdf = ["JavaScript (ES6+)", "React", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"];

// Helper function to add Skills
const addSkills = (doc, y_start, margin, text_color_dark, text_color_blue) => {
    // Section Header (H3)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(text_color_dark);
    doc.text("Skills", margin, y_start);
    y_start += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, y_start, doc.internal.pageSize.getWidth() - margin, y_start);
    y_start += 5;

    // Skills List (Simple implementation - one line)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(text_color_blue);
    
    // Join skills into a comma-separated string
    const skills_string = skills_pdf.join(" • "); 
    const splitText = doc.splitTextToSize(skills_string, doc.internal.pageSize.getWidth() - 2 * margin);
    doc.text(splitText, margin, y_start);
    y_start += splitText.length * 5;

    return y_start;
};

// Helper function to add Experience
const addExperience = (doc, y_start, margin, text_color_dark) => {
    // Section Header (H3)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(text_color_dark);
    doc.text("Professional Experience", margin, y_start);
    y_start += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, y_start, doc.internal.pageSize.getWidth() - margin, y_start);
    y_start += 5;

    // Loop through jobs (only one hardcoded job)
    experience_pdf.forEach((job) => {
        // Job Title and Company (H4)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(text_color_dark);
        const title_company = `${job.title} at ${job.company}`;
        doc.text(title_company, margin + 5, y_start);
        
        // Years
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor('#6b7280');
        doc.text(job.years, doc.internal.pageSize.getWidth() - margin, y_start, { align: "right" });
        y_start += 5;

        // Duties (Bulleted list)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor('#4b5563');
        job.duties.forEach((duty) => {
            const duty_text = `• ${duty}`;
            const splitDuty = doc.splitTextToSize(duty_text, doc.internal.pageSize.getWidth() - margin - 10);
            doc.text(splitDuty, margin + 5, y_start);
            y_start += splitDuty.length * 4;
        });
        y_start += 5; // Extra space after each job
    });

    return y_start;
};


 


if (status === "loading") {
  return <p>Loading...</p>;
}

// Example: Only call protected API if authenticated

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}>
      
      {/* Global Message Display */}
      {message && (
          <div style={{
              position: 'fixed', top: '10px', right: '10px', padding: '10px 20px', 
              backgroundColor: '#48bb78', color: 'white', borderRadius: '6px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 50
          }}>
              {message}
          </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
          <ConfirmModal
              title={confirmAction.title}
              onConfirm={executeDelete}
              onCancel={() => setConfirmAction(null)}
          />
      )}

      {/* Main Content Area */}
      <div style={{ 
          display: 'flex',
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'margin-right 0.3s ease', // <-- smooth shift
    marginRight: sidebarOpen ? '250px' : '0px' 
      }}>
        
        {/* LEFT COLUMN: Live Preview */}
        <div style={{ width: '600px', padding: '20px', borderRight: '1px solid #e5e7eb', minHeight: '80vh' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Live Resume Preview</h2>
          {uploadedImage || name ? (
                <ResumePreview name={name} uploadedImage={uploadedImage} />
            ) : (
                <div style={{ padding: '40px', border: '2px dashed #6366f1', borderRadius: '8px', textAlign: 'center', color: '#6b7280', minHeight: '842px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{marginBottom: '10px', fontSize: '1.1rem'}}>🖼️</p>
                    <p>Enter your details and upload an image (Steps 1 & 2) to see the live resume mock-up here.</p>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: Resume Creation Form/Controls */}
        <div style={{ flexGrow: 1, padding: '30px 40px' }}>
            <h1 style={{ fontSize: '30px',whiteSpace: 'nowrap', fontWeight: '700', color: '#1f2937', marginBottom: '30px' }}>
                {selectedResume ? `Viewing/Editing: ${selectedResume.title || selectedResume.id}` : 'Create New Resume'}
            </h1>
<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="relative bottom-[9%] left-[85%] z-50 bg-indigo-600 text-white p-3 rounded-md"
  
>
  ☰
</button>


<div className="flex items-center space-x-4 p-1 bg-[#f9fafb] relative bottom-[23.5%] text-white  justify-end">
        
        {/* Custom Alert (for mock signOut) */}
        <div id="custom-alert" className="fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-xl z-50 transition-opacity duration-500 opacity-90 hidden">
            Alert Message
        </div>

        {/* 1. Contact Recruiter Button */}
        <Link href={"/query"}>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition duration-200 hover:scale-[1.03]"
          >
            Contact A Recruiter
          </button>
        </Link>

        {/* 2. Authentication Block (Login/Logout/Signup) */}
        <div className="flex items-center space-x-3">
          
          {/* Conditional rendering for Logged IN state */}
          {session?.user ? (
            <>
              <span className="text-sm text-black font-semibold">
                Hello, {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md transition duration-200 hover:cursor-pointer"
              >
                Logout
              </button>
              {session?.user && (
  <>
    <span className='text-black' style={{ marginLeft: '10px', fontWeight: '600' }}>Role: {session.user.role}</span>
  </>
)}
            </>
          ) : (
            // Conditional rendering for Logged OUT state (using !session?.user)
            <>
                <Link href="/signup">
                    <button 
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200"
                    >
                      Signup
                    </button>
                </Link>
                
                <Link href={"/login"}>
                    <button 
                        className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200"
                    >
                        Login
                    </button>
                </Link>
            </>
          )}
        </div>
      </div>


   
{/* Sidebar */}
<div
  className={`sidebar ${sidebarOpen ? "open" : ""}`}
>
  <div className="sidebar-header">
    <h2>📁 Saved Resumes</h2>
    <button onClick={() => setSidebarOpen(false)} className="close-btn">&times;</button>
  </div>

  <div className="sidebar-content">
    {resumes.length === 0 && <p className="empty-text">No resumes found.</p>}
    {resumes.map((resume) => (
      <div key={resume._id || resume.id} className="resume-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div onClick={() => { handleSelectResume(resume); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <img src={`${API_BASE_URL}/uploads/${resume.filename}`} alt={resume.title} className="resume-thumb" />
      <span className="resume-title" style={{ marginLeft: '10px' }}>{resume.title}</span>
    </div>
    <button
      onClick={() => setConfirmAction({ id: resume._id || resume.id, title: resume.title })}
      style={{ background: 'transparent', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '1.1rem' }}
    >
      🗑️
    </button>
  </div>
    ))}
  </div>
</div>

            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>1. Enter your Username</h1>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    style={{ 
                        width: '57%', padding: '10px', border: '1px solid #ccc', 
                        borderRadius: '6px', fontSize: '1rem' 
                    }}
                />
            </div>
          
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>2. Upload your Profile Image</h1>

                 <input
        type="file"
        id="fileInput"
        onChange={(e) => setImg(e.target.files[0])}
        style={{ display: "none" }}
      />
      <label
        htmlFor="fileInput"
        style={{
          display: 'inline-block',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#4f46e5',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'background-color 0.2s',
          marginRight: '15px',
          padding: '8px 16px'
        }}
      >
        Upload Image
      </label>
      
            </div>



            <button 
                onClick={handleClick}
                style={{
                    padding: '12px 25px', border: 'none', borderRadius: '8px',
                    backgroundColor: '#4f46e5', color: 'white', fontWeight: '600',
                    cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s',
                    marginRight: '15px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
                Save & Prepare Resume
            </button>
            
            <p style={{ marginTop: '15px', color: '#6b7280', fontSize: '0.85rem' }}>*This uploads the image and updates the Recents list if your backend saves new files automatically.</p>


            {/* Download Button Section */}
            {uploadedImage && (
                <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #e0e7ff', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Download Ready</h2>
                    <button 
                        onClick={handleDownloadPDF}
                        style={{
                            padding: '12px 25px', border: 'none', borderRadius: '8px',
                            backgroundColor: '#10b981', color: 'white', fontWeight: '600',
                            cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                        Download PDF
                    </button>
                </div>
            )}

            {/* Recents List (Moved from left column, now acting as secondary content/storage view) */}
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                
                
            </div>

        </div>
      </div>
    </div>
  );
}

export default Page;
