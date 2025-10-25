"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function Hotjar() {
  const HOTJAR_ID = 6556937; // Your Hotjar ID

  useEffect(() => {
    // Debug: Check if Hotjar is loading
    console.log("🔥 Hotjar component mounted, ID:", HOTJAR_ID);
    
    // Manual Hotjar initialization as fallback
    const initHotjar = () => {
      if (typeof window !== 'undefined') {
        window.hj = window.hj || function(){(window.hj.q = window.hj.q || []).push(arguments)};
        window._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://static.hotjar.com/c/hotjar-${HOTJAR_ID}.js?sv=6`;
        document.head.appendChild(script);
        
        console.log("🔥 Manual Hotjar initialization completed");
      }
    };

    // Try manual initialization after a short delay
    setTimeout(initHotjar, 1000);
    
    // Check if Hotjar is working after a delay
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.hj) {
        console.log("✅ Hotjar is loaded and working!");
        console.log("Hotjar queue:", window.hj.q);
        
        // Test Hotjar with a custom event
        try {
          window.hj('event', 'hotjar_test', {
            test: 'Hotjar is working correctly',
            timestamp: new Date().toISOString()
          });
          console.log("🔥 Hotjar test event sent successfully!");
        } catch (error) {
          console.error("❌ Failed to send Hotjar test event:", error);
        }
      } else {
        console.log("❌ Hotjar not detected, trying manual initialization...");
        initHotjar();
      }
    }, 3000);
  }, []);

  return (
    <>
      {/* Primary Hotjar Script */}
      <Script 
        id="hotjar-tracking" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log("✅ Primary Hotjar script loaded successfully");
        }}
        onError={(e) => {
          console.error("❌ Primary Hotjar script failed to load:", e);
        }}
      >
        {`
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
      
      {/* Alternative Hotjar implementation */}
      <Script 
        id="hotjar-alternative" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log("✅ Alternative Hotjar script loaded");
        }}
        onError={() => {
          console.log("Alternative Hotjar script failed (this is normal if primary works)");
        }}
      >
        {`
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
    </>
  );
}
