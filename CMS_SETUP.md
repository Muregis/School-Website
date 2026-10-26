# Gracious Love Academy — CMS Technical Setup

## Overview

This site uses **Decap CMS** (formerly Netlify CMS) to allow non-technical administrators to update content through a visual, browser-based interface. Changes are committed directly to the GitHub repository and deployed automatically via GitHub Pages.

## Architecture

```
School-Website/
├── admin/
│   ├── index.html          # CMS login and interface
│   └── config.yml          # CMS configuration
├── content/
│   ├── settings.json       # Homepage settings (hero text, phone, etc.)
│   ├── team/
│   │   ├── _index.json     # Team members list
│   │   ├── headteacher.md
│   │   └── ...
│   ├── news/
│   │   ├── _index.json     # News posts list
│   │   └── *.md            # Individual news posts
│   ├── events/
│   │   └── term-dates.json # Term dates and events
│   └── gallery/
│       └── _index.json     # Gallery images
├── index.html              # Homepage with dynamic content sections
├── team.html               # Team page
├── news.html               # News page
├── gallery.html            # Gallery page
├── calendar.html           # Term dates page
├── css/style.css           # Design system
├── js/script.js            # Dynamic content loading
└── ...
```

## How it works

1. Administrator visits `/admin/` on the live site
2. Logs in with GitHub OAuth
3. Edits content in visual forms
4. CMS commits changes to the `main` branch
5. GitHub Pages auto-deploys the site

## Setup Requirements

### 1. GitHub OAuth App

Create a GitHub OAuth App to enable login:

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Gracious Love Academy CMS
   - **Homepage URL:** https://graciousloveacademy-school-website.vercel.app/
   - **Authorization callback URL:** https://graciousloveacademy-school-website.vercel.app/admin/
4. Click **Register application**
5. Copy the **Client ID** and **Client Secret**

### 2. Update admin/index.html

Replace the placeholder values in `admin/index.html`:

```html
<a href="https://github.com/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=repo">
```

Change to:
```html
<a href="https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://graciousloveacademy-school-website.vercel.app/admin/&scope=repo">
```

### 3. Update admin/config.yml

Update the repository and branch settings:

```yaml
backend:
  name: github
  repo: muregis/School-Website
  branch: main
  base_url: https://graciousloveacademy-school-website.vercel.app/
```

## Content File Formats

### JSON Files (Settings, Events, Team Index, Gallery Index)

These are simple data files that the CMS edits through forms. Example `content/settings.json`:

```json
{
  "hero_badge": "Knowledge for Diversity",
  "hero_title": "Where every child is known",
  "phone": "+254 727 345 438",
  "email": "graciousloveacademy23@gmail.com"
}
```

### Markdown Files (News Posts, Team Members)

These use YAML frontmatter for metadata and Markdown for body text.

**News post example:**
```markdown
---
title: "PP2 Graduation Ceremony 2026"
date: 2026-03-15
image: "images/news/pp2-graduation.jpg"
---
Our PP2 class celebrated their graduation today...
```

**Team member example:**
```markdown
---
name: "Mrs. Grace Muthoni"
role: "Headteacher"
photo: "images/team/headteacher.jpg"
bio: "Mrs. Muthoni founded the school in 2023..."
years: "12 years experience"
---
```

## Dynamic Content Loading

The site uses vanilla JavaScript to fetch and render content from JSON files:

```javascript
async function loadTeam() {
    const res = await fetch('content/team/_index.json');
    const team = await res.json();
    // Render team cards...
}
```

This keeps the site fast (no build step, no framework) while allowing dynamic updates.

## Adding a New Collection

To add a new content type (e.g., "Events"):

1. Add collection to `admin/config.yml`
2. Create initial content file in `content/events/`
3. Add loader function in `js/script.js`
4. Add HTML container in the relevant page
5. Test by visiting `/admin/` and creating a new entry

## Deployment

Changes published through the CMS are committed to the `main` branch. GitHub Pages automatically rebuilds and deploys the site within 1-2 minutes.

No manual deployment is needed.

## Security Notes

- Only users with commit access to the repository can log in to the CMS
- The CMS uses GitHub OAuth — no passwords are stored on the site
- Image uploads are stored in the `images/uploads/` folder
- All changes are tracked in Git history

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CMS login fails | Check OAuth app callback URL matches `/admin/` |
| Images not showing | Ensure `images/uploads/` exists in repo |
| Changes not appearing | Wait 2 minutes for GitHub Pages deploy |
| JSON parse errors | Check for trailing commas in JSON files |
| 404 on /admin/ | Ensure `admin/index.html` exists in repo |

## Alternative: Direct File Editing

If the CMS is not configured, content can still be updated by editing the JSON and Markdown files directly in GitHub:

1. Go to https://github.com/muregis/School-Website
2. Navigate to the file to edit (e.g., `content/settings.json`)
3. Click the pencil icon to edit
4. Make changes
5. Click **Commit changes**
6. Wait 1-2 minutes for deploy

This is suitable for technical users but not recommended for non-technical administrators.

---

*Last updated: September 2026*
