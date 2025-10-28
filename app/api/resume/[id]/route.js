import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "resume_tracker";

/**
 * Get Resume by ID API Route
 * GET /api/resume/[id]
 * 
 * Fetches resume data for preview
 * Public access - no authentication required
 */
export async function GET(request, { params }) {
  let client;
  
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Resume ID is required" },
        { status: 400 }
      );
    }

    console.log("📄 Fetching resume for ID:", id);

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const resumesCollection = db.collection("resumes");

    // Find resume by ID or uniqueId
    const resume = await resumesCollection.findOne({
      $or: [
        { _id: id },
        { uniqueId: id }
      ]
    });

    if (!resume) {
      console.log("❌ Resume not found for ID:", id);
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    console.log("✅ Resume found:", {
      id: resume._id,
      name: resume.name,
      hasContent: !!resume.resumeData
    });

    // Return resume data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      _id: resume._id,
      uniqueId: resume.uniqueId,
      name: resume.name,
      resumeData: resume.resumeData || resume.content,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      userId: resume.userId
    });

  } catch (error) {
    console.error("❌ Error fetching resume:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch resume",
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

