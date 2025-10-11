import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/userModel";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();
    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Save the selected role
    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      role // <-- use the role from frontend
    });

    return NextResponse.json({ message: "Signup successful", user: newUser });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
