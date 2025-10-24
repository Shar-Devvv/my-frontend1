// --- UPDATED: Live Resume Preview Component for Direct Editing ---
const ResumePreview = ({ name, uploadedImage, onNameChange }) => {
    // Hardcoded content remains for other sections...
    const contact = { phone: '555-123-4567', email: 'jane.doe@example.com', linkedin: 'linkedin.com/in/janedoe' };
    const summary = "Highly motivated and results-oriented professional with 5+ years of experience...";
    const experience = [/* ... */];
    const skills = [/* ... */];

    // 🎯 Handler for the contentEditable field 🎯
    const handleNameBlur = (e) => {
        // Ensure we only update if the text actually changed
        const newName = e.target.innerText.trim();
        if (newName !== name) {
            onNameChange(newName); // Calls setName in the parent Page component
        }
    };

    return (
        <motion.div /* ... (styling) ... */>
            
            {/* Header / Name */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', marginBottom: '20px', borderBottom: '3px solid #6366f1' }}>
                <div>
                    <h1 
                        // 1. Enable direct editing
                        contentEditable 
                        // 2. Suppress the React warning for contentEditable elements
                        suppressContentEditableWarning={true} 
                        // 3. Update the state when the user clicks away (loses focus)
                        onBlur={handleNameBlur} 
                        style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', minWidth: '200px', cursor: 'text' }} // Added minWidth and cursor for better UX
                    >
                        {name || "YOUR NAME HERE"}
                    </h1>
                    {/* Make the Title editable as well for consistency */}
                    <h2 
                        contentEditable 
                        suppressContentEditableWarning={true}
                        // For a real app, you'd add a separate onTitleChange prop
                        onBlur={(e) => console.log('Title changed to:', e.target.innerText)} 
                        style={{ fontSize: '1.1rem', color: '#4f46e5', fontWeight: '500', marginTop: '5px' }}
                    >
                        Frontend Developer / UI Specialist
                    </h2>
                </div>
                {/* ... (Image rendering) ... */}
            </div>

            {/* ... (Contact, Summary, Skills, Experience sections remain the same or can also be updated with contentEditable) ... */}

        </motion.div>
    );
};