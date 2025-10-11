import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const ADMIN_EMAIL = ["hary123@gmail.com"];

export async function GET() {
    const session = await getServerSession(authOptions);

  // Check session, role, and email whitelist
  if (
    !session ||
    session.user.role !== "admin" ||
    !ADMIN_EMAIL.includes(session.user.email)
  ) {
    return new Response(
      JSON.stringify({ error: "Access denied. Admin only." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    await client.connect();
    const db = client.db("UploadImage"); // replace with your DB name
    const users = await db.collection("users").find({}).toArray();

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
