// This file is the root layout for the Next.js App Router structure.
import { Inter } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Live Chat App",
  description: "Real-time communication for recruiter and candidate.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire application with the Providers component */}
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
