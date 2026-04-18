# Notice Scraper Service

Automated notice aggregator for your MERN project.
Scrapes a target website's notice section, rewrites content with AI, downloads attachments, and saves to your shared MongoDB — ready for your frontend to display.

---

## Project structure

```
project-root/
├── backend/
│   └── routes/
│       └── notices.routes.js   ← copy notices.routes.js here
├── frontend/
│   └── src/components/
│       └── NoticeBoard.jsx     ← copy NoticeBoard.jsx here
└── scraper/                    ← this folder
    ├── src/
    │   ├── index.js            (entry point / cron)
    │   ├── pipeline.js         (orchestrator)
    │   ├── scraper.js          (Cheerio + Playwright)
    │   ├── rewriter.js         (Claude AI rewrite)
    │   ├── attachments.js      (download + store files)
    │   └── models/
    │       └── Notice.js       (Mongoose schema)
    ├── attachments/            (created automatically if using local storage)
    ├── .env                    (copy from .env.example)
    └── package.json
```

---

## Setup

### 1. Install dependencies

```bash
cd scraper
npm install

# If using Playwright (auto-fallback installs it anyway):
npx playwright install chromium
```

### 2. Configure .env

```bash
cp .env.example .env
```

Edit `.env` — the key fields:

| Variable | Description |
|---|---|
| `MONGODB_URI` | Same URI as your backend |
| `TARGET_URL` | Full URL of the notice page to monitor |
| `NOTICE_ITEM_SELECTOR` | CSS selector for each notice (inspect the site) |
| `NOTICE_TITLE_SELECTOR` | CSS selector for the title inside each notice |
| `NOTICE_BODY_SELECTOR` | CSS selector for the body text |
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `AUTO_PUBLISH` | `true` = publish immediately, `false` = save as draft |
| `CRON_SCHEDULE` | How often to check (default: every 30 min) |
| `ATTACHMENT_STORAGE` | `local` or `s3` |

### 3. Find the right CSS selectors

Open the target website, right-click a notice item → Inspect.
Look for a repeating container class. Common patterns:

```
.notice-item        → NOTICE_ITEM_SELECTOR
.notice-title       → NOTICE_TITLE_SELECTOR
.notice-body        → NOTICE_BODY_SELECTOR
```

Test your selectors in the browser console:
```js
document.querySelectorAll('.notice-item').length
```

### 4. Wire up the backend

In your backend `app.js` / `server.js`:

```js
import noticesRouter from './routes/notices.routes.js';
import path from 'path';

// Notices API
app.use('/api/notices', noticesRouter);

// Serve attachment files (local storage only)
app.use('/attachments', express.static(
  path.join(process.cwd(), '../scraper/attachments')
));
```

### 5. Add the frontend component

```jsx
// In your notices page component:
import NoticeBoard from '../components/NoticeBoard';

export default function NoticesPage() {
  return (
    <main>
      <NoticeBoard />
    </main>
  );
}
```

If your API is on a different port during development, set in `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Running

```bash
# Development (auto-restarts on file change)
cd scraper
npm run dev

# Production
npm start

# Run once and exit (useful for testing)
npm run scrape:once
```

---

## Admin: publishing drafts

When `AUTO_PUBLISH=false`, notices are saved as drafts.
Publish them via the API:

```bash
# List drafts
GET /api/notices?status=draft

# Publish one
PATCH /api/notices/:id/publish

# Unpublish
PATCH /api/notices/:id/unpublish
```

You can build a simple admin page in React using these endpoints, or call them from Postman/Insomnia during testing.

---

## Switching attachment storage

**To switch to S3**, update `.env`:
```
ATTACHMENT_STORAGE=s3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```
Then install the AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

For **Cloudflare R2 or MinIO**, also set:
```
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

No code changes needed — the storage driver swaps automatically.

---

## How it works

```
Cron fires every N minutes
  └─ scrape()
      ├─ Try Cheerio (fast, no browser)
      └─ Fallback: Playwright (handles JS-rendered sites)
          └─ parse notices with CSS selectors
              └─ for each NEW notice (hash-based dedup)
                  ├─ rewriteNotice() → Claude API
                  ├─ downloadAttachment() → local disk or S3
                  └─ Notice.create() → MongoDB
                      └─ Express API → React frontend
```
