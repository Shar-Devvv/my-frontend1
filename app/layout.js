// This file is the root layout for the Next.js App Router structure.
import { Inter } from "next/font/google";
import "./globals.css";
import Hotjar from "@/components/Hotjar";
import SessionWrapper from "@/components/SessionWrapper";
import Buttons from "@/components/Buttons";
import HotjarTest from "@/components/HotjarTest";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Resume Builder",
  description: "Real-time communication for recruiter and candidate.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png"/>
      </head>
      <body className={inter.className}>
        {/* Hotjar tracking script */}
        <Hotjar/>
        {/* Wrap the entire application with the Providers component */}
        <SessionWrapper>
          <Buttons/>
          {children}
          {/* Hotjar test component - remove this after verification */}
          
        </SessionWrapper>
      </body>
    </html>
  );
}
