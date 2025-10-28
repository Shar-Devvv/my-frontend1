import React from 'react';
import { motion } from 'framer-motion';

// ----------------------------------------------------------------------
// 1. REUSABLE COMPONENT FOR SCROLL ANIMATION
// ----------------------------------------------------------------------

// Simple slide-up + fade-in animation, text remains visible
const ClipRevealTextScroll = ({ children, delay = 0 }) => {
  const DURATION = 0.9;
  const PRO_EASE = [0.22, 1, 0.36, 1];

  const variants = {
    hidden: { y: 20, opacity: 0 },   // small slide from bottom
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: DURATION, delay, ease: PRO_EASE } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }} // triggers every scroll
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 2. HERO SECTION
// ----------------------------------------------------------------------

const HeroSection = () => {
  return (
    <div 
      className='min-h-screen 
                 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 
                 text-white 
                 flex flex-col justify-center items-center 
                 p-8 md:p-20 font-sans relative' 
    >
      <div className="absolute inset-0 opacity-10 bg-cover"></div>

      <div className="relative z-10 text-center">
        {/* Main Headline */}
        <div className="mb-6">
          <ClipRevealTextScroll delay={0.2}>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight"
                style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }} 
            >
              RESUME BUILDER
            </h1>
          </ClipRevealTextScroll>
        </div>

        {/* Tagline */}
        <div className="mb-12">
          <ClipRevealTextScroll delay={0.4}>
            <p className="text-xl md:text-2xl font-light opacity-80 max-w-2xl mx-auto">
              Every Resume shows your struggles and achievements.
            </p>    
          </ClipRevealTextScroll>
        </div>

        {/* Menu Links */}
        <div className="flex flex-wrap justify-center space-x-4 md:space-x-8">
          {['RESEARCH', 'ABOUT', 'CONTACT'].map((item, index) => (
            <ClipRevealTextScroll key={item} delay={0.6 + index * 0.1}>
              <motion.a 
                href="#" 
                className="text-sm md:text-lg font-semibold uppercase tracking-wider hover:text-indigo-200 transition-colors p-2"
              >
                {item}
              </motion.a>
            </ClipRevealTextScroll>
          ))}

          <ClipRevealTextScroll delay={1.0}>
            <motion.div className="mt-4 md:mt-0 text-sm md:text-lg font-bold uppercase tracking-wider bg-pink-500 hover:bg-pink-600 transition-colors px-4 py-2 rounded-lg shadow-xl">
              <a href="/create">
                <h2>Create Your Resume</h2>
              </a>
            </motion.div>
          </ClipRevealTextScroll>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. REUSABLE SCROLL ANIMATION WRAPPER
// ----------------------------------------------------------------------

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const AnimatedSectionWrapper = ({ bgDesign, children }) => {
  return (
    <motion.section
      className={`min-h-[50vh] flex flex-col justify-center items-center w-full p-8 md:p-16 ${bgDesign}`}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }} // repeat animation on every scroll
    >
      <div className="max-w-6xl w-full mx-auto"> 
        {children}
      </div>
    </motion.section>
  );
};

// ----------------------------------------------------------------------
// 4. HELPER COMPONENT FOR STEPS
// ----------------------------------------------------------------------

const Step = ({ number, title, description }) => (
  <div className="max-w-xs text-center p-4">
    <div className="w-12 h-12 flex items-center justify-center bg-pink-500 text-white rounded-full text-2xl font-bold mx-auto mb-4 shadow-xl">
      {number}
    </div>
    <h3 className="text-2xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

// ----------------------------------------------------------------------
// 5. MAIN APP
// ----------------------------------------------------------------------

export default function App() {
  return (
    <div className="min-h-screen font-sans bg-gray-50">
      
      {/* HERO SECTION */}
      <HeroSection />

      {/* SECTION 1: Features */}
      <AnimatedSectionWrapper bgDesign="bg-white shadow-xl">
        <ClipRevealTextScroll delay={0.2}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
            Key Features that Get You Hired
          </h2>
        </ClipRevealTextScroll>
        <ClipRevealTextScroll delay={0.4}>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our tool goes beyond simple formatting to ensure your resume passes ATS scans and impresses recruiters.
          </p>
        </ClipRevealTextScroll>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[{ title: 'ATS Optimized', icon: '🤖' }, { title: 'AI Suggestions', icon: '✨' }, { title: 'Premium Templates', icon: '📄' }]
            .map((feature, index) => (
            <ClipRevealTextScroll key={feature.title} delay={0.6 + index * 0.1}>
              <div className="p-6 border rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500">Have Man Templated for professional resume.</p>
              </div>
            </ClipRevealTextScroll>
          ))}
        </div>
      </AnimatedSectionWrapper>

      {/* SECTION 2: Steps */}
      <AnimatedSectionWrapper bgDesign="bg-gray-800 text-white relative overflow-hidden">
        <ClipRevealTextScroll delay={0.2}>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
            Create Your Resume in 3 Easy Steps
          </h2>
        </ClipRevealTextScroll>
        <ClipRevealTextScroll delay={0.4}>
          <p className="text-xl opacity-70 mb-12 relative z-10">
            From zero to interview-ready in minutes.
          </p>
        </ClipRevealTextScroll>

        <div className="flex flex-col md:flex-row justify-center items-start gap-10 w-full relative z-10">
          <ClipRevealTextScroll delay={0.6}>
            <Step number="1" title="Input Data" description="Enter your experience, education, and skills into our intuitive guided form." />
          </ClipRevealTextScroll>
          <ClipRevealTextScroll delay={0.8}>
            <Step number="2" title="Choose Template" description="Select a professionally designed template that fits your industry and style." />
          </ClipRevealTextScroll>
          <ClipRevealTextScroll delay={1.0}>
            <Step number="3" title="Download & Apply" description="Instantly download your ATS-optimized PDF and start applying confidently." />
          </ClipRevealTextScroll>
        </div>
      </AnimatedSectionWrapper>

      {/* SECTION 3: Shareable Link Feature */}
      <AnimatedSectionWrapper bgDesign="bg-white shadow-xl">
        <ClipRevealTextScroll delay={0.2}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
            What Makes It Special
          </h2>
        </ClipRevealTextScroll>
        <ClipRevealTextScroll delay={0.4}>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our tool goes beyond simple formatting to ensure your resume gives you a directly shareable link.
          </p>
        </ClipRevealTextScroll>

        <div className="md:grid-cols-3 gap-8 w-full flex justify-center items-center">
          <ClipRevealTextScroll delay={0.6}>
            <div className="p-6 border rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Shareable Link</h3>
              <p className="text-gray-500">Directly shareable link to your resume</p>
            </div>
          </ClipRevealTextScroll>
        </div>
      </AnimatedSectionWrapper>

      {/* FOOTER */}
      <div className="py-10 bg-white text-center text-gray-400">
        <p>&copy; 2025 Professional Resume Builder. All rights reserved.</p>
      </div>
    </div>
  );
}
