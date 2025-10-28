import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "resume_tracker";

/**
 * Track Resume View API Route
 * POST /api/track-view
 * 
 * Tracks when a resume preview is viewed
 * Stores tracking data in MongoDB "views" collection
 */
export async function POST(request) {
  let client;
  
  try {
    console.log("📊 Tracking API: Received view tracking request");
    
    // Parse request body
    const body = await request.json();
    const { resumeId, timestamp, userAgent, url, referrer } = body;
    
    // Validate required fields
    if (!resumeId) {
      return NextResponse.json(
        { success: false, message: "resumeId is required" },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwarded?.split(",")[0] || realIp || "unknown";

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const viewsCollection = db.collection("views");

    // Create tracking record
    const viewRecord = {
      resumeId: resumeId,
      ipAddress: clientIp,
      userAgent: userAgent || "unknown",
      timestamp: timestamp || new Date().toISOString(),
      url: url || null,
      referrer: referrer || null,
      createdAt: new Date(),
      // Additional metadata
      country: null, // Could be enhanced with IP geolocation
      city: null,
      device: getDeviceType(userAgent),
      browser: getBrowserInfo(userAgent),
      os: getOSInfo(userAgent)
    };

    // Insert the view record
    const result = await viewsCollection.insertOne(viewRecord);
    
    console.log("✅ View tracked successfully:", {
      resumeId,
      viewId: result.insertedId,
      ip: clientIp,
      timestamp: viewRecord.timestamp
    });

    return NextResponse.json({
      success: true,
      message: "View tracked successfully",
      viewId: result.insertedId,
      resumeId: resumeId,
      timestamp: viewRecord.timestamp
    });

  } catch (error) {
    console.error("❌ Error tracking view:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to track view",
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

/**
 * Helper function to detect device type from user agent
 */
function getDeviceType(userAgent) {
  if (!userAgent) return "unknown";
  
  if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
    return "mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    return "tablet";
  } else {
    return "desktop";
  }
}

/**
 * Helper function to detect browser from user agent
 */
function getBrowserInfo(userAgent) {
  if (!userAgent) return "unknown";
  
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  
  return "Other";
}

/**
 * Helper function to detect OS from user agent
 */
function getOSInfo(userAgent) {
  if (!userAgent) return "unknown";
  
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  
  return "Other";
}

