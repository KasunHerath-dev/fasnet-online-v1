# 🎓 LMS Sync Service

A standalone Node.js microservice that sits alongside your MERN student management system. It logs into Wayamba University's Moodle LMS using student credentials, downloads their calendar, extracts assignment/tutorial deadlines, and pushes them through your backend notification system.

---

## Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│   MERN Backend (port 5000)  │◄──────►│  LMS Sync Service (port 4000)│
│                             │        │                              │
│  • Student auth             │        │  • Puppeteer browser         │
│  • MongoDB                  │        │  • Moodle login + ICS export │
│  • Push notifications       │        │  • ICS parser                │
│  • REST API                 │        │  • Cron scheduler            │
└─────────────────────────────┘        └──────────────────────────────┘
                                                    │
                                                    ▼
                                       ┌──────────────────────┐
                                       │  lmsk.wyb.ac.lk LMS  │
                                       │  (Moodle)            │
                                       └──────────────────────┘
```

---

## Quick Start

### 1. Install dependencies

```bash
cd lms-sync-service
npm install

# Puppeteer downloads Chromium automatically (~170MB)
# If on a server without GUI, it uses headless mode
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

Key variables:

| Variable | Description |
|---|---|
| `PORT` | Port for this service (default: 4000) |
| `LMS_BASE_URL` | `https://lmsk.wyb.ac.lk` |
| `MAIN_BACKEND_URL` | Your MERN backend URL (e.g. `http://localhost:5000`) |
| `MAIN_BACKEND_SECRET` | Shared secret between services |
| `SYNC_CRON` | Cron schedule (default: `0 6 * * *` = 6 AM daily) |
| `PUPPETEER_HEADLESS` | `true` for production, `false` to watch browser |

### 3. Integrate into your MERN backend

Copy the code from `MERN_BACKEND_INTEGRATION.js` into your backend:

```
a) Create  models/Assignment.js           ← new Mongoose model
b) Create  routes/internal/lmsAssignments.js ← new internal route
c) Register in app.js:
     app.use('/api/internal', require('./routes/internal/lmsAssignments'));
d) Add  LMS_SYNC_SERVICE_URL=http://localhost:4000  to your backend .env
```

### 4. Start the service

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## Data Flow

```
Student logs into your app
        │
        ▼
MERN backend calls POST http://localhost:4000/sync/student
        │
        ▼
Puppeteer opens Chrome (headless)
   → logs in at lmsk.wyb.ac.lk/login/index.php
   → navigates to /calendar/export.php
   → selects "All events" + "Recent and next 60 days"
   → clicks Export → downloads .ics file
        │
        ▼
ICS Parser reads the file and extracts:
   ┌─────────────────────────────────────────────────────┐
   │ moodleUid: "40201@lmsk.wyb.ac.lk"                  │
   │ title:     "MATH 1222 - Tutorial #02"               │
   │ moduleCode: "MATH 1222"                             │
   │ type:       "tutorial"                              │
   │ dueDate:    "2026-04-06T10:30:00.000Z"             │
   │ description: "Submit on or before 6th April..."    │
   └─────────────────────────────────────────────────────┘
        │
        ▼
POST http://localhost:5000/api/internal/lms-assignments
   → Deduplicate by moodleUid (no double notifications)
   → Save to MongoDB Assignment collection
   → Fire push notification to student:
        "🟡 Due Soon — MATH 1222 — Tutorial
         'Tutorial #02' is due on Monday, April 6 at 10:30 AM"
        │
        ▼
🧹 Temp .ics file deleted from server
```

---

## API Endpoints

All endpoints require header: `x-internal-secret: <your secret>`

### `POST /sync/student`
Trigger an immediate sync for one student.

```json
// Request body
{
  "studentId": "mongo_object_id_here",
  "username": "s242074",
  "password": "student_password"
}

// Response (sync runs in background)
{ "message": "Sync started for student s242074", "studentId": "..." }
```

### `POST /sync/batch`
Sync multiple students at once (sequential, 2s delay between each).

```json
// Request body
{
  "students": [
    { "studentId": "id1", "username": "s242074", "password": "pass1" },
    { "studentId": "id2", "username": "s242075", "password": "pass2" }
  ]
}
```

### `GET /health`
Health check — no auth required.

```json
{ "status": "ok", "service": "lms-sync-service", "timestamp": "..." }
```

### `POST /debug/parse-ics`
Parse a local .ics file without logging into LMS (for testing).

```json
{ "filePath": "/absolute/path/to/icalexport.ics" }
```

---

## Parsed Assignment Fields

| Field | Example | Notes |
|---|---|---|
| `moodleUid` | `40201@lmsk.wyb.ac.lk` | Unique per Moodle event |
| `title` | `MATH 1222 - Tutorial #02` | Cleaned (no "is due" suffix) |
| `moduleCode` | `MATH 1222` | Extracted from CATEGORIES or SUMMARY |
| `type` | `tutorial` | `assignment`, `tutorial`, `quiz`, `exam`, `other` |
| `dueDate` | `2026-04-06T10:30:00Z` | ISO 8601, UTC |
| `description` | `Submit before 6th April at 4pm` | Cleaned plain text |

---

## Security Notes

⚠️ **Student credentials are sensitive.** Follow these practices:

1. **Encrypt at rest**: If storing credentials in MongoDB, use AES-256 encryption (not bcrypt — you need to decrypt them for the cron job).
2. **Encrypt in transit**: Ensure your internal service-to-service calls use HTTPS in production.
3. **Consent**: Only store credentials for students who explicitly opt in.
4. **Minimal scope**: The service only reads calendar data — it never writes to the LMS.
5. **Secret rotation**: Rotate `MAIN_BACKEND_SECRET` regularly.

---

## Deployment (Production)

```bash
# Using PM2
npm install -g pm2
pm2 start src/index.js --name lms-sync-service
pm2 save
pm2 startup

# Using Docker (optional)
docker build -t lms-sync-service .
docker run -d --env-file .env -p 4000:4000 lms-sync-service
```

For Docker, the service needs extra flags for Puppeteer:
```
--cap-add=SYS_ADMIN  (or use --no-sandbox which is already set)
```

---

## Logs

Logs are written to:
- `logs/combined.log` — all levels
- `logs/error.log` — errors only
- Console — colorized output

---

## Manual Test

```bash
# Test the parser alone (no LMS login needed)
# Put your .ics file at /tmp/test.ics, then:
curl -X POST http://localhost:4000/debug/parse-ics \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: your_secret" \
  -d '{ "filePath": "/tmp/test.ics" }'

# Trigger a sync manually
curl -X POST http://localhost:4000/sync/student \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: your_secret" \
  -d '{ "studentId": "abc123", "username": "s242074", "password": "yourpass" }'
```
