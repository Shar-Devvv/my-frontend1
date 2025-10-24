// This file is the root layout for the Next.js App Router structure.
import { Inter } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";
import Buttons from "@/components/Buttons";

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
        {/* Wrap the entire application with the Providers component */}
        <SessionWrapper>
          <Buttons/>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
