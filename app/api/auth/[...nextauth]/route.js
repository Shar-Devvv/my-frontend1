import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: "10d" });
}

// ✅ Define authOptions as a separate object
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

        return { id: user._id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = generateAccessToken(user);
        token.refreshToken = generateRefreshToken(user);
        token.role = user.role;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      session.refreshToken = token.refreshToken;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "",
            provider: "google",
          });
        }
      }
      return true;
    },
  },
};

// ✅ Pass authOptions to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };