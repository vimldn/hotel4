# OTA-Killer MVP

Intent-based hotel booking. Travellers submit a brief — hotels email them directly with a private rate. No Expedia. No commission. No database.

---

## How it works

1. **Traveller** fills in the brief form (destination, dates, budget, requirements like "squat rack" or "4K monitor")
2. Brief is written to a Google Sheet and forwarded to all matching hotels by email via Resend
3. **Hotels** reply directly to the traveller's inbox with their private rate
4. Traveller picks the best offer and books direct — no middleman

---

## Stack

- **Next.js 15** (App Router) — frontend + API routes
- **Resend** — transactional email (traveller confirmation + hotel brief emails)
- **Google Apps Script** — writes to Google Sheets and handles hotel matching
- **Vercel** — deployment (free tier works)
- No database. No auth. No Supabase.

---

## Setup — from zip to live in ~20 minutes

### 1. Unzip and install

```bash
cd ota-killer-mvp
npm install
```

### 2. Google Sheet + Apps Script

This is where hotels and briefs are stored, and where matching happens.

**a) Create a Google Sheet**

Go to [sheets.google.com](https://sheets.google.com) → create a new blank spreadsheet.
Name it anything — "OTA-Killer" works.

**b) Open Apps Script**

Extensions → Apps Script

**c) Paste the script**

Delete all default code. Open `google-apps-script/Code.gs` from this project and paste the entire contents.

**d) Deploy as a Web App**

- Click **Deploy** → **New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Click **Deploy**
- **Copy the Web App URL** — you'll need this in step 4

> If Google asks for permissions, click Allow. This lets the script write to your Sheet.

**e) Test it**

Visit the Web App URL in your browser. You should see:
```
OTA-Killer script is running.
```

If you see a permissions error, go to Deploy → Manage deployments → edit and redeploy.

---

### 3. Resend

Sign up at [resend.com](https://resend.com) — free tier is 3,000 emails/month, plenty for MVP.

**a) Verify your domain**

Resend → Domains → Add domain → follow the DNS instructions for your domain.

Takes 5–15 minutes to verify. You need this before emails will send.

**b) Get your API key**

Resend → API Keys → Create API key → copy it.

---

### 4. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=briefs@yourdomain.com
RESEND_FROM_NAME=OTA-Killer
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=OTA-Killer
```

---

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test the full flow locally:**

1. Register a test hotel at `/hotels/register`
   - Use your own email
   - Set location area to something like "Shoreditch, London"
   - Select a few capabilities
2. Check your Google Sheet — a row should appear in the Hotels tab
3. Submit a test brief at `/brief/new`
   - Use the same location ("Shoreditch, London")
   - Select matching tags
4. Check your Google Sheet — row in Briefs tab
5. Check your inbox — you should get both the traveller confirmation and the hotel brief email

---

### 6. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — OTA-Killer MVP"
git remote add origin https://github.com/yourusername/ota-killer.git
git push -u origin main
```

---

### 7. Deploy to Vercel

**Option A — Vercel dashboard (easiest):**

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: Next.js (auto-detected)
4. Add environment variables (same as your `.env.local` — paste each one)
5. Deploy

**Option B — Vercel CLI:**

```bash
npm i -g vercel
vercel --prod
```

Add env vars in Vercel Dashboard → Project → Settings → Environment Variables.

---

## File structure

```
ota-killer-mvp/
├── google-apps-script/
│   └── Code.gs                     ← Paste this into Apps Script
├── src/
│   ├── app/
│   │   ├── page.tsx                ← Landing page
│   │   ├── brief/
│   │   │   ├── new/page.tsx        ← Brief form
│   │   │   └── confirm/page.tsx    ← After brief submitted
│   │   ├── hotels/
│   │   │   ├── register/page.tsx   ← Hotel signup
│   │   │   └── confirm/page.tsx    ← After hotel registered
│   │   └── api/
│   │       ├── submit-brief/       ← Calls Sheet + sends emails
│   │       └── register-hotel/     ← Calls Sheet + welcome email
│   ├── components/
│   │   ├── BriefForm.tsx           ← 3-step brief form (client)
│   │   └── HotelRegisterForm.tsx   ← Hotel signup form (client)
│   └── lib/
│       ├── email.ts                ← All Resend email templates
│       ├── sheets.ts               ← Google Apps Script client
│       └── semantic-tags.ts        ← Tag taxonomy (the platform's IP)
├── .env.example
├── package.json
└── README.md
```

---

## Adding hotels manually

Before you have hotels registering themselves, you can add them directly to the Sheet:

1. Open your Google Sheet → Hotels tab (created automatically on first registration)
2. Add a row with these columns:

| Registered At | Hotel Name | Contact Name | Email | Location | Location Area | Direct Booking URL | Tags (IDs) | Tag Labels | Note | Active |
|---|---|---|---|---|---|---|---|---|---|---|
| 2025-01-01 | The Hoxton | Sarah Jones | sarah@hoxton.com | 81 Great Eastern St, London | Shoreditch, London | https://thehoxton.com/book | squat_rack,fast_wifi,4k_monitor | Squat rack in gym, Fast WiFi, 4K monitor | — | YES |

The Tags (IDs) column must use the exact IDs from `src/lib/semantic-tags.ts`.

---

## How hotel matching works

When a brief comes in for "Shoreditch, London":

1. Script reads all rows in the Hotels sheet where `Active = YES`
2. For each hotel, checks if its `Location Area` is contained in the brief location (or vice versa)
3. If location matches, checks tag overlap:
   - Hotel has tags registered → must share at least one tag with the brief
   - Hotel has **no tags** → receives all briefs in their area (good for early hotels who want maximum coverage)
4. Matched hotels are returned to Next.js, which sends each one the brief email

---

## Customising the matching logic

The matching is in `google-apps-script/Code.gs` in the `findMatchingHotels()` function.

To make matching stricter (e.g. require 2+ tag matches):
```js
if (matchedTags.length < 2) return; // was < 1
```

To expand location matching to partial city names:
```js
// Current — exact substring
var locationMatch = briefLoc.includes(hotelArea) || hotelArea.includes(briefLoc);

// Looser — first word match (e.g. "London" matches any London area)
var firstWord = briefLoc.split(',')[0].trim();
var locationMatch = hotelArea.includes(firstWord);
```

After any change, re-deploy the script (Deploy → Manage deployments → edit → New version).

---

## Updating the tag list

Edit `src/lib/semantic-tags.ts` — add new tags to the `SEMANTIC_TAGS` array. The form automatically picks them up. No other changes needed.

---

## What's not in the MVP (V2 roadmap)

- Hotel dashboard with real-time brief feed (Supabase Realtime)
- E2E encrypted bid payloads (Web Crypto API)
- AI Fiduciary scoring (Anthropic API)
- Stripe subscriptions for hotels
- Programmatic SEO shadow pages
- Booking token redirect system

All of this is fully speced and partially built in the V1 architecture document.

---

## Troubleshooting

**Emails not sending**
- Check Resend dashboard for bounces or errors
- Make sure your domain is verified in Resend
- `RESEND_FROM_EMAIL` must use your verified domain

**Google Sheet not getting rows**
- Visit the Apps Script Web App URL in your browser — should show "OTA-Killer script is running."
- Check that `GOOGLE_SCRIPT_URL` in `.env.local` is the full deployment URL
- In Apps Script → Executions — you'll see any errors there

**No hotels matched**
- Check the Hotels sheet `Location Area` column — must be a substring of the brief location (e.g. "Shoreditch, London" in the sheet matches "Shoreditch, London" or "London" in the brief)
- Case-insensitive, but spelling must match

**Build failing on Vercel**
- Check all env vars are added in Vercel dashboard
- `NEXT_PUBLIC_` vars must be added as-is including the prefix
