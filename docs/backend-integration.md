# Backend Integration for Resume Tracking

## Required Backend Changes

### 1. Update Your Resume Save Endpoint

In your existing backend (where you save resumes), you need to ensure the `uniqueId` is being generated and returned. 

**Current backend save response should include:**
```javascript
{
  success: true,
  uniqueId: "generated-unique-id",  // ← This is what we need
  _id: "mongodb-object-id",
  message: "Resume saved successfully"
}
```

### 2. Database Schema Update

Your existing `resumes` collection should have:
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  uniqueId: String,        // ← This field is required for tracking
  name: String,
  resumeData: String,
  userId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. No Other Backend Changes Needed

The tracking system is **frontend-only** and doesn't require any backend modifications beyond ensuring `uniqueId` exists.

## How to Get the uniqueId

### From Your Existing Backend:
When a resume is saved, your backend should return:
```javascript
// In your save resume endpoint
const uniqueId = generateUniqueId(); // Your existing unique ID generation

// Save to database
const resume = {
  _id: new ObjectId(),
  uniqueId: uniqueId,
  name: resumeData.name,
  resumeData: resumeData.content,
  userId: userId,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Return response
res.json({
  success: true,
  uniqueId: uniqueId,  // ← This is what the frontend uses
  _id: resume._id,
  message: "Resume saved successfully"
});
```

### From Frontend:
The `uniqueId` is already being used in your create page (line 180):
```javascript
link: `https://my-frontend1-2hth.vercel.app/preview/${resume.uniqueId || resume.id}`
```

## Testing the Integration

### 1. Check if uniqueId exists:
```javascript
// In your browser console, check a saved resume:
console.log("Resume uniqueId:", resume.uniqueId);
```

### 2. Test the tracking:
1. Visit: `https://my-frontend1-2hth.vercel.app/preview/[uniqueId]`
2. Check console for: `📊 Tracking resume view for ID: [uniqueId]`
3. Visit: `https://my-frontend1-2hth.vercel.app/views/[uniqueId]`
4. Should show analytics for that resume

## If uniqueId is Missing

If your backend doesn't generate `uniqueId`, you can:

### Option 1: Update Backend (Recommended)
Add uniqueId generation to your save endpoint.

### Option 2: Use MongoDB _id (Quick Fix)
Update the tracking system to use `_id` instead by modifying the API routes.

## Environment Variables

Add to your `.env.local`:
```bash
MONGODB_URI=your-mongodb-connection-string
DB_NAME=your-database-name
```

The tracking system will use the same database as your existing resumes.

