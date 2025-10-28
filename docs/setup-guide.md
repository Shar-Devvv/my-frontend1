# Resume Tracking System Setup Guide

## Overview
This system automatically tracks when resume previews are viewed and provides analytics for resume owners.

## Features
- ✅ Automatic view tracking on resume preview pages
- ✅ IP address and browser detection
- ✅ Device type detection (mobile/tablet/desktop)
- ✅ Admin analytics page showing all views
- ✅ Public access (no login required for tracking)
- ✅ Console logging for debugging

## File Structure
```
app/
├── api/
│   ├── track-view/route.js          # POST endpoint for tracking views
│   ├── resume/[id]/route.js          # GET resume data for preview
│   └── views/[id]/route.js           # GET analytics data
├── preview/[id]/page.js              # Resume preview page
├── views/[id]/page.js                # Admin analytics page
components/
├── ResumeTracking.jsx                # Tracking component
docs/
├── mongodb-schema.md                 # Database schema
└── setup-guide.md                   # This file
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local` file:
```bash
MONGODB_URI=mongodb://localhost:27017
DB_NAME=resume_tracker
```

### 2. MongoDB Setup
Make sure MongoDB is running locally or use MongoDB Atlas:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 3. Test the System

#### Test Resume Preview (with tracking):
1. Visit: `http://localhost:3000/preview/[resume-id]`
2. Check browser console for tracking messages:
   - `📊 Tracking resume view for ID: [id]`
   - `✅ Resume view tracked successfully`

#### Test Analytics Page:
1. Visit: `http://localhost:3000/views/[resume-id]`
2. Should show all views for that resume

### 4. API Endpoints

#### Track a View
```bash
POST /api/track-view
Content-Type: application/json

{
  "resumeId": "your-resume-id",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "url": "https://yoursite.com/preview/your-resume-id",
  "referrer": "https://google.com"
}
```

#### Get Resume Data
```bash
GET /api/resume/[id]
```

#### Get Analytics
```bash
GET /api/views/[id]
```

## Usage Examples

### 1. Add Tracking to Existing Resume Preview
```jsx
import ResumeTracking from "@/components/ResumeTracking";

export default function ResumePreview({ resumeId }) {
  return (
    <div>
      {/* Your resume content */}
      <ResumeTracking resumeId={resumeId} />
    </div>
  );
}
```

### 2. Manual Tracking
```javascript
// Track a view manually
fetch('/api/track-view', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeId: 'your-resume-id',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })
});
```

## Database Collections

### `views` Collection
Stores tracking data:
- `resumeId`: ID of the resume
- `ipAddress`: Viewer's IP
- `userAgent`: Browser info
- `timestamp`: When viewed
- `device`: mobile/tablet/desktop
- `browser`: Chrome/Firefox/etc
- `os`: Windows/macOS/etc

### `resumes` Collection
Your existing resume data.

## Troubleshooting

### Tracking Not Working?
1. Check browser console for errors
2. Verify MongoDB connection
3. Check API endpoint responses
4. Ensure resume ID exists

### No Data in Analytics?
1. Verify views are being tracked (check console)
2. Check MongoDB for `views` collection
3. Ensure resume ID matches in both collections

### Development Mode
The tracking component shows a small indicator in development mode to help debug.

## Production Considerations

1. **Remove Debug Component**: Remove `<HotjarTest/>` from layout.js
2. **Environment Variables**: Set proper MongoDB URI for production
3. **Rate Limiting**: Consider adding rate limiting to prevent spam
4. **IP Geolocation**: Add IP geolocation service for country/city data
5. **Privacy**: Add privacy notice about tracking

## Security Notes

- IP addresses are stored (consider GDPR compliance)
- No authentication required for tracking
- Consider adding rate limiting
- Review data retention policies

