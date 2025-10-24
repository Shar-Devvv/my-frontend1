import React from 'react';
import { motion } from 'framer-motion';
// Removed: import Link from 'next/link';

// Assuming Tailwind CSS is configured for responsiveness

// ----------------------------------------------------------------------
// 1. REUSABLE COMPONENTS FOR HERO ANIMATION (Initial Load Animation)
// ----------------------------------------------------------------------

// ClipRevealText component for the initial page load animation
const ClipRevealText = ({ children, delay = 0 }) => {
    const PRO_EASE = [0.22, 1, 0.36, 1];
    const DURATION = 0.9; 

    const containerVariants = {
        hidden: { clipPath: 'inset(100% 0 0 0)' },
        visible: {
            clipPath: 'inset(0% 0 0 0)',
            transition: { duration: DURATION, delay: delay, ease: PRO_EASE }
        }
    };

    const innerVariants = {
        hidden: { y: '100%' },
        visible: { 
            y: '0%', 
            transition: { duration: DURATION, delay: delay, ease: PRO_EASE }
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ overflow: 'hidden' }} 
        >
            <motion.div variants={innerVariants}>
                {children}
            </motion.div>
        </motion.div>
    );
};

// The Hero Section - Uses initial/animate, NOT scroll-based, so it remains static after the page loads.
const HeroSection = () => {
    return (
        <div 
            className='min-h-screen 
                        bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 
                        text-white 
                        flex flex-col justify-center items-center 
                        p-8 md:p-20 font-sans relative' 
        >
            {/* Background design element (optional for visual depth) */}
            <div className="absolute inset-0 opacity-10 bg-cover"></div>

            <div className="relative z-10 text-center">
                 {/* 1. Main Headline */}
                <div className="mb-6">
                    <ClipRevealText delay={0.2}>
                        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight"
                            style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }} 
                        >
                            RESUME BUILDER
                        </h1>
                    </ClipRevealText>
                </div>

                {/* 2. Main Tagline */}
                <div className="mb-12">
                    <ClipRevealText delay={0.4}>
                        <p className="text-xl md:text-2xl font-light opacity-80 max-w-2xl mx-auto">
                            Every Resume shows your struggles and achievements.
                        </p>    
                    </ClipRevealText>
                </div>

                {/* 3. Menu Links (Simplified for responsiveness) */}
                <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
                    {/* Simplified Link setup for clarity and responsiveness */}
                    {['RESEARCH', 'ABOUT', 'CONTACT'].map((item, index) => (
                        <ClipRevealText key={item} delay={0.6 + index * 0.1}>
                            <motion.a 
                                href="#" 
                                className="text-sm md:text-lg font-semibold uppercase tracking-wider hover:text-indigo-200 transition-colors p-2"
                            >
                                {item}
                            </motion.a>
                        </ClipRevealText>
                    ))}
                    
                    <ClipRevealText delay={1.0}>
                        <motion.div className="mt-4 md:mt-0 text-sm md:text-lg font-bold uppercase tracking-wider bg-pink-500 hover:bg-pink-600 transition-colors px-4 py-2 rounded-lg shadow-xl">
                            {/* Replaced Link with simple anchor tag */}
                            <a href="/create">
                                <h2>Create Your Resume</h2>
                            </a>
                        </motion.div>
                    </ClipRevealText>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. THE REUSABLE SCROLL ANIMATION WRAPPER
// ----------------------------------------------------------------------

// Consistent, professional fade-up animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 }, // Starts invisible and 50px below final position
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, // Consistent speed (0.8 seconds)
      ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth, premium motion
    } 
  }
};

/**
 * @param {string} bgDesign - Tailwind classes for background (e.g., 'bg-gray-100', 'bg-red-500')
 * @param {React.ReactNode} children - The content inside the section
 */
const AnimatedSectionWrapper = ({ bgDesign, children }) => {
    return (
        <motion.section
            // Responsive sizing: Min height on mobile, generous padding
            className={`min-h-[50vh] flex flex-col justify-center items-center w-full p-8 md:p-16 ${bgDesign}`}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            // Triggers animation when 30% of the section is visible, and only runs once
            viewport={{ once: true, amount: 0.3 }} 
        >
            {/* Inner content container for maximum width and centering */}
            <div className="max-w-6xl w-full mx-auto"> 
                {children}
            </div>
        </motion.section>
    );
};

// ----------------------------------------------------------------------
// 3. MAIN APP STRUCTURE
// ----------------------------------------------------------------------

export default function App() {
  return (
    <div className="min-h-screen font-sans bg-gray-50">
      
      {/* 1. HERO SECTION (Static/Page-Load Animation ONLY) */}
      <HeroSection />

      {/* 2. SECTION 1: Features (Fades & Slides Up - bg-white) */}
      <AnimatedSectionWrapper bgDesign="bg-white shadow-xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
            Key Features that Get You Hired
        </h2>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our tool goes beyond simple formatting to ensure your resume passes ATS scans and impresses recruiters.
        </p>
        
        {/* Feature Cards Grid (Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
                { title: 'ATS Optimized', icon: '🤖' },
                { title: 'AI Suggestions', icon: '✨' },
                { title: 'Premium Templates', icon: '📄' }
            ].map((feature) => (
                <div key={feature.title} className="p-6 border rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, est.</p>
                </div>
            ))}
        </div>
      </AnimatedSectionWrapper>
      
      {/* 3. SECTION 2: How It Works (Fades & Slides Up - Dark Background with Design) */}
      <AnimatedSectionWrapper 
        bgDesign="bg-gray-800 text-white relative overflow-hidden" // Dark background
      >
        {/* Geometric background detail */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-color-indigo-500)_0%,_transparent_60%)]"></div>

        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
            Create Your Resume in 3 Easy Steps
        </h2>
        <p className="text-xl opacity-70 mb-12 relative z-10">
            From zero to interview-ready in minutes.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-start gap-10 w-full relative z-10">
            <Step number="1" title="Input Data" description="Enter your experience, education, and skills into our intuitive guided form." />
            <Step number="2" title="Choose Template" description="Select a professionally designed template that fits your industry and style." />
            <Step number="3" title="Download & Apply" description="Instantly download your ATS-optimized PDF and start applying confidently." />
        </div>
      </AnimatedSectionWrapper>


      <AnimatedSectionWrapper bgDesign="bg-white shadow-xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center ">
            Whats make it more special
        </h2>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our tool goes beyond simple formatting to ensure your resume gives you an directly Shareable resume Link.
        </p>
        
        {/* Feature Cards Grid (Responsive) */}
        <div className=" md:grid-cols-3 gap-8 w-full flex justify-center items-center">
            {[
                
                { title: 'Shareable Link', icon: '✨' },
                
            ].map((feature) => (
                <div key={feature.title} className="p-6 border rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-500">Directly Shareable Link to your resume</p>
                </div>
            ))}
        </div>
      </AnimatedSectionWrapper>

      {/* 4. FOOTER */}
      <div className="py-10 bg-white text-center text-gray-400">
        <p>&copy; 2025 Professional Resume Builder. All rights reserved.</p>
      </div>

    </div>
  );
}

// Helper component for Step visualization
const Step = ({ number, title, description }) => (
    <div className="max-w-xs text-center p-4">
        <div className="w-12 h-12 flex items-center justify-center bg-pink-500 text-white rounded-full text-2xl font-bold mx-auto mb-4 shadow-xl">
            {number}
        </div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);
