# Gracious Love Academy — Developer Setup Guide

## What Changed

The old Decap CMS (GitHub-based) has been removed and replaced with a simple, password-protected admin panel powered by Vercel serverless functions.

**New architecture:**
- Admin panel at `/admin` (password protected)
- API routes at `/api/*` handle data storage
- Vercel KV stores all content data
- Cloudinary stores uploaded images
- Main website reads from API routes (with local JSON fallback)

---

## Prerequisites

1. A Vercel account (free)
2. A Cloudinary account (free)
3. The project deployed on Vercel

---

## Step 1: Configure Vercel KV (Recommended for Production)

The admin panel works without Vercel KV using an in-memory fallback, but sessions and data will not persist across deployments or serverless instance restarts.

For full persistence:
1. Go to your Vercel dashboard
2. Open the School-Website project
3. Go to **Storage** tab
4. Click **Create Database** → select **Redis** (Upstash Redis)
5. Name it `school-admin-redis`
6. Click **Create**
7. Vercel will automatically add the required environment variables

---

## Step 2: Configure Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From your dashboard, copy your **Cloud Name**
3. Go to **Settings** → **Upload** → **Upload presets**
4. Create a new preset:
   - **Signing Mode:** Unsigned
   - **Folder:** `school-website`
   - **Transformations:** Auto format, auto quality
5. Copy the **Upload Preset** name
6. In your Vercel project, go to **Settings** → **Environment Variables** and add:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_UPLOAD_PRESET` = your upload preset name

---

## Step 3: Set Admin Password

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - `ADMIN_PASSWORD` = choose a strong password (e.g., `admin2026`)
3. Click **Save**

---

## Step 4: Deploy

1. Push your code to GitHub
2. Vercel will automatically redeploy
3. Visit `https://your-domain.vercel.app/admin/`
4. Enter your admin password
5. You should see the dashboard

---

## How It Works

### Data Flow

**Public website → API routes → Vercel KV**
- The main site fetches content from `/api/content/*`
- If KV is unavailable, it falls back to local `content/*.json` files

**Admin → API routes → Vercel KV**
- The admin panel POSTs updated content to `/api/content/*`
- Images are uploaded via `/api/upload` → Cloudinary

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth` | POST | Login (verify password, create session) |
| `/api/auth` | DELETE | Logout |
| `/api/content/settings` | GET | Fetch homepage settings |
| `/api/content/settings` | POST | Update homepage settings |
| `/api/content/team` | GET | Fetch team members |
| `/api/content/team` | POST | Update team members |
| `/api/content/news` | GET | Fetch news posts |
| `/api/content/news` | POST | Update news posts |
| `/api/content/gallery` | GET | Fetch gallery images |
| `/api/content/gallery` | POST | Update gallery images |
| `/api/content/events` | GET | Fetch term dates & events |
| `/api/content/events` | POST | Update term dates & events |
| `/api/upload` | POST | Upload image to Cloudinary |

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary unsigned upload preset |
| `KV_REST_API_URL` | Auto | Added by Vercel KV integration |
| `KV_REST_API_TOKEN` | Auto | Added by Vercel KV integration |
| `KV_REST_API_READ_ONLY_TOKEN` | Auto | Added by Vercel KV integration |

---

## Local Development

```bash
# Install dependencies
npm install

# Run local dev server
npx vercel dev
```

This will run your site locally with the API routes. You'll need to set the same environment variables in your local `.env` file or Vercel CLI.

---

## Content Structure

The admin manages these content types:

**Homepage Settings** (`content/settings.json`)
- Hero badge, title, subtitle
- CTA button text
- Phone, email, WhatsApp link

**Team Members** (`content/team/_index.json`)
- Array of objects with: name, role, bio, years, photo

**News Posts** (`content/news/_index.json`)
- Array of objects with: title, date, image, excerpt, body, slug

**Gallery** (`content/gallery/_index.json`)
- Array of objects with: image, alt, category, caption

**Term Dates & Events** (`content/events/term-dates.json`)
- Object with term date strings and events array

---

## Security Notes

- The admin uses HTTP-only session cookies (24h expiry)
- Passwords are never stored in the database
- Image uploads go through Cloudinary (never stored on Vercel)
- All admin API routes require a valid session
- The login page has no rate limiting (add if needed for production)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "KV may not be configured" | Add Vercel KV integration in dashboard |
| "Cloudinary not configured" | Add `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` env vars |
| Images not uploading | Check Cloudinary upload preset is set to "Unsigned" |
| Admin login fails | Check `ADMIN_PASSWORD` env var is set |
| Changes not appearing | Refresh the page — changes are instant via API |
| 404 on /admin | Check `vercel.json` rewrites are deployed |

---

## Changing the Admin Password

Simply update the `ADMIN_PASSWORD` environment variable in your Vercel project settings and redeploy.

---

## Backing Up Data

To export all content from Vercel KV:

```bash
vercel env pull .env.local
npx vercel kv get content:settings
npx vercel kv get content:team
npx vercel kv get content:news
npx vercel kv get content:gallery
npx vercel kv get content:events
```

---

*Last updated: September 2026*
