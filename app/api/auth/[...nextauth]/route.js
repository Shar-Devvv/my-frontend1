import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration object.
 * Defines providers, secret, and callbacks.
 */
const handler = NextAuth({
  // 1. Configure one or more authentication providers
  providers: [
    GoogleProvider({
      // These keys are automatically read from environment variables:
      // GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add other providers (GitHub, Facebook, etc.) here if needed
  ],

  // 2. Define the secret used to sign the session cookie.
  // This is read from the NEXTAUTH_SECRET environment variable.
  secret: process.env.NEXTAUTH_SECRET,
  
  // 3. Define optional callbacks for custom session handling (recommended)
  callbacks: {
    // Modify the session object before it is returned to the client
    async session({ session, token }) {
      // You can add custom properties to the session object here.
      // For instance, adding the user ID from the token:
      if (token?.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
    // Modify the JWT token after sign-in, before it is saved
    async jwt({ token, user }) {
      // Add profile information (like user ID) to the token right after sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  
  // 4. Customizing the pages (optional but helpful)
  pages: {
    // Use this to redirect to a custom sign-in page if you create one
    // signIn: '/auth/signin',
  }
});

// The Next.js App Router expects GET and POST methods to be exported
export { handler as GET, handler as POST };
