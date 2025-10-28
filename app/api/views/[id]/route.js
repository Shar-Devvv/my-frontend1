import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "resume_tracker";

/**
 * Get Views for Resume API Route
 * GET /api/views/[id]
 * 
 * Fetches all view tracking data for a specific resume
 * Used by admin analytics page
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

    console.log("📊 Fetching views for resume ID:", id);

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const viewsCollection = db.collection("views");
    const resumesCollection = db.collection("resumes");

    // Get resume info
    const resumeInfo = await resumesCollection.findOne({
      $or: [
        { _id: id },
        { uniqueId: id }
      ]
    });

    if (!resumeInfo) {
      return NextResponse.json(
        { success: false, message: "Resume not found" },
        { status: 404 }
      );
    }

    // Get all views for this resume, sorted by most recent first
    const views = await viewsCollection
      .find({ resumeId: id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("✅ Views fetched successfully:", {
      resumeId: id,
      viewCount: views.length,
      resumeName: resumeInfo.name
    });

    return NextResponse.json({
      success: true,
      views: views,
      resumeInfo: {
        _id: resumeInfo._id,
        uniqueId: resumeInfo.uniqueId,
        name: resumeInfo.name,
        createdAt: resumeInfo.createdAt,
        updatedAt: resumeInfo.updatedAt
      },
      totalViews: views.length
    });

  } catch (error) {
    console.error("❌ Error fetching views:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch views",
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

