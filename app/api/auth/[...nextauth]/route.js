// app/api/auth/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// --- Generate Access Token ---
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id.toString(), email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

// --- Generate Refresh Token ---
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id.toString(), email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "10d" }
  );
}

// --- NextAuth Options ---
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        await connectToDB();
        const user = await User.findOne({ email });
        if (!user) throw new Error("No user found with this email");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ---------------- JWT CALLBACK ----------------
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id.toString();
        token.accessToken = generateAccessToken(user);
        token.refreshToken = generateRefreshToken(user);
        token.role = user.role;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;

        console.log("✅ JWT callback user login:", {
          tokenId: token.id,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expires: new Date(token.accessTokenExpires),
        });
      } else {
        // Optional: check token expiry
        if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
          console.log("⚠️ Access token expired, refresh required");
          // Here you can implement refresh token logic
        }
      }
      return token;
    },

    // ---------------- SESSION CALLBACK ----------------
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      console.log("✅ Session callback:", session);
      return session;
    },

    // ---------------- SIGNIN CALLBACK ----------------
    async signIn({ user, account }) {
      console.log("🔑 SignIn callback:", { user, account });
      if (account?.provider === "google") {
        await connectToDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "", // Google login does not require password
            provider: "google",
          });
          console.log("✅ Google user created:", user.email);
        } else {
          console.log("ℹ️ Google user exists:", user.email);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=", // redirect to login page with error
  },
};

// --- NextAuth handler ---
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
