// --- OLD ResumePreview (Keep the content logic, but change the wrapper) ---
// Note: We are keeping the content logic inside the function below, 
// but removing the 'motion.div' from its root, as the wrapper will apply it.

const ResumePreviewContent = ({ name, uploadedImage }) => {
    // Hardcoded resume content (KEEP AS-IS)
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
            width: '100%',
        }}>
            {/* ... (Existing Header, Contact, Summary, Skills, Experience JSX goes here, UNCHANGED) ... */}
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
                <span className='w-[800px]'>📧 {contact.email}</span>
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


// --- NEW Tiltable Wrapper Component ---
const TiltableResumePreview = ({ name, uploadedImage }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Transforms mouse position (-0.5 to 0.5) to a subtle rotation (-5 to 5 degrees)
    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

    // Use a spring for smooth, professional motion
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 15 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalize mouse coordinates to a range of -0.5 to 0.5
        x.set((mouseX / rect.width) - 0.5);
        y.set((mouseY / rect.height) - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0); // Reset X rotation
        y.set(0); // Reset Y rotation
    };

    return (
        <motion.div 
            style={{ 
                rotateX: springRotateX, 
                rotateY: springRotateY, 
                perspective: 1000, // CRITICAL: Enables 3D rendering
                scale: 1, 
                cursor: 'grab', // Visual cue for interaction
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
            }}
            whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }} // Deeper shadow on hover
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* The Resume Preview content is now wrapped */}
            <ResumePreviewContent name={name} uploadedImage={uploadedImage} />
        </motion.div>
    );
};