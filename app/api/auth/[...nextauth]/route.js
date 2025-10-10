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
const handler = NextAuth({
  providers: [
    // 🟦 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🟨 CREDENTIALS LOGIN (EMAIL + PASSWORD)
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

        return { id: user._id, name: user.name, email: user.email };
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
      token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min
    }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
    session.accessToken = token.accessToken;   // use in frontend API calls
    session.refreshToken = token.refreshToken; // store securely for refresh
    return session;
    },
    async signIn({ user, account }) {
      // If Google login, ensure user exists in DB
      if (account?.provider === "google") {
        await connectToDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "", // Not used for Google
            provider: "google",
          });
        }
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
