"use client";

import Script from "next/script";

export default function Hotjar() {
  const HOTJAR_ID = 6556937; // Your Hotjar ID

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
        (function (c, s, q, u, a, r, e) {
          c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
          c._hjSettings = { hjid: ${HOTJAR_ID} };
          r = s.getElementsByTagName('head')[0];
          e = s.createElement('script');
          e.async = true;
          e.src = q + c._hjSettings.hjid + u;
          r.appendChild(e);
        })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', ${HOTJAR_ID});
      `}
    </Script>
  );
}
