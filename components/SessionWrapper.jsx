"use client";

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// This component uses the SessionProvider to make the session context available
// to all client components, like your Navbar.
const SessionWrapper = ({ children }) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};

export default SessionWrapper;
