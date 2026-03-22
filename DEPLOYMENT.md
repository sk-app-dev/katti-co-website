# Katti & Co. — Complete Deployment Guide
# Vercel + Next.js + Sanity + Resend
# ═══════════════════════════════════════════════════════

## WHAT YOU'LL HAVE AFTER THIS GUIDE
- Website live at kattiandco.in
- Blog posts editable at kattiandco.in/studio (Sanity Studio)
- Contact form emails landing in your inbox
- Secure admin login (bcrypt + JWT, server-side)
- Lex AI chat with API key safely on the server

## TIME NEEDED: ~45 minutes (first time)

---

## STEP 1 — Install Prerequisites (on your computer)

```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org  (choose LTS version)

# Verify installation
node --version   # should show v18+ or v20+
npm --version    # should show 9+

# Install Git (if not installed)
# Download from: https://git-scm.com
```

---

## STEP 2 — Set Up the Project

```bash
# 1. Create a new folder and copy these project files into it
mkdir katti-co-website
cd katti-co-website

# 2. Copy all files from this project into that folder

# 3. Install dependencies
npm install

# 4. Create your environment file
cp .env.example .env.local
```

---

## STEP 3 — Create Sanity Account & Project

1. Go to **https://sanity.io** → Sign Up (free)
2. Create new project:
   - Name: "Katti & Co."
   - Dataset: production
   - Plan: Free
3. Copy your **Project ID** (looks like: `abc1def2`)
4. Go to **API** tab → **Tokens** → Add API Token:
   - Name: "website-write"
   - Permissions: **Editor**
   - Copy the token (starts with `sk...`)

```bash
# Put these in your .env.local:
NEXT_PUBLIC_SANITY_PROJECT_ID=abc1def2      # your project ID
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...                      # your editor token
```

---

## STEP 4 — Create Resend Account (Email)

1. Go to **https://resend.com** → Sign Up (free)
2. Add your domain: **kattiandco.in**
3. Add the DNS records it shows you (in your domain provider — GoDaddy/Namecheap etc.)
4. Wait for verification (usually 5-10 minutes)
5. Create API Key → copy it

```bash
# In .env.local:
RESEND_API_KEY=re_...                       # your Resend API key
CONTACT_RECIPIENT_EMAIL=aprameya.katti@kattiandco.com
CONTACT_SENDER_EMAIL=noreply@kattiandco.in  # must be verified in Resend
```

---

## STEP 5 — Generate Admin Password Hash

```bash
# Run this in your terminal to generate your bcrypt password hash
node -e "
const bcrypt = require('bcryptjs');
const password = 'YourPasswordHere';   // CHANGE THIS to your real password
const hash = bcrypt.hashSync(password, 12);
console.log('Add this to .env.local:');
console.log('ADMIN_PASSWORD_HASH=' + hash);
"
```

```bash
# In .env.local:
ADMIN_USERNAME=ank
ADMIN_PASSWORD_HASH=$2a$12$...            # the hash from above
```

---

## STEP 6 — Generate NextAuth Secret

```bash
# In your terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy the output into .env.local:
NEXTAUTH_SECRET=your_random_output_here
NEXTAUTH_URL=http://localhost:3000        # change to https://kattiandco.in for production
```

---

## STEP 7 — Add Anthropic API Key

1. Go to **https://console.anthropic.com**
2. API Keys → Create Key
3. Add to .env.local:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

## STEP 8 — Test Locally

```bash
npm run dev
# Open http://localhost:3000
# Test contact form, blog, chat
```

---

## STEP 9 — Push to GitHub

```bash
# Create a GitHub account if you don't have one: https://github.com

# Initialize git in your project folder
git init
git add .
git commit -m "Initial commit: Katti & Co. website"

# Create new repo on GitHub:
# Go to github.com → New Repository → Name: katti-co-website → Create

# Push your code
git remote add origin https://github.com/YOUR_USERNAME/katti-co-website.git
git branch -M main
git push -u origin main
```

---

## STEP 10 — Deploy to Vercel

1. Go to **https://vercel.com** → Sign Up with GitHub
2. Click **"Add New Project"**
3. Import **katti-co-website** from GitHub
4. Framework: **Next.js** (auto-detected)
5. Click **"Environment Variables"** → Add all from your .env.local:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL → set to: https://kattiandco.in
   - NEXT_PUBLIC_SANITY_PROJECT_ID
   - NEXT_PUBLIC_SANITY_DATASET
   - SANITY_API_TOKEN
   - RESEND_API_KEY
   - CONTACT_RECIPIENT_EMAIL
   - CONTACT_SENDER_EMAIL
   - ADMIN_USERNAME
   - ADMIN_PASSWORD_HASH
   - ANTHROPIC_API_KEY
6. Click **Deploy** → wait ~2 minutes

Your site is now live at a `.vercel.app` URL.

---

## STEP 11 — Connect Your Domain (kattiandco.in)

1. In Vercel → Project Settings → **Domains**
2. Add: **kattiandco.in** and **www.kattiandco.in**
3. Vercel will show you DNS records to add
4. Log in to your domain provider (GoDaddy/Namecheap/etc.)
5. Add the records (takes 5-30 minutes to propagate)
6. Vercel auto-issues an SSL certificate (HTTPS) ✓

---

## STEP 12 — Set Up Sanity Studio CORS

1. Go to **sanity.io** → your project → **API** → **CORS Origins**
2. Add: `https://kattiandco.in`
3. Check "Allow credentials"

---

## STEP 13 — Write Your First Blog Post

1. Go to **https://kattiandco.in/studio**
2. Log in with admin credentials
3. Click **Blog Posts** → **Create**
4. Write, publish — appears on site immediately (within 60 seconds due to ISR)

---

## AFTER DEPLOYMENT — HOW TO UPDATE

```bash
# Every time you make changes:
git add .
git commit -m "describe your change"
git push

# Vercel auto-deploys every push to main branch
# Zero downtime — takes ~1 minute
```

---

## SECURITY SUMMARY

| What | How it's secured |
|---|---|
| Admin password | bcrypt hash (12 rounds), server-side only |
| Auth session | JWT signed with NEXTAUTH_SECRET, 8hr expiry |
| API keys | Server-side only (env vars), never in browser |
| Contact form | Input validation (Zod) + rate limiting (3/min per IP) |
| Chat | Rate limiting (20/hr per IP) |
| Admin routes | Edge middleware checks JWT before page loads |
| Sanity Studio | Protected behind auth middleware |
| HTTPS | Auto-provisioned by Vercel (Let's Encrypt) |
| Env vars | Vercel encrypts at rest, never exposed in logs |

---

## TROUBLESHOOTING

**"NEXTAUTH_SECRET missing"**
→ Make sure you added it in Vercel Environment Variables

**"Sanity fetch returns empty"**
→ Check CORS origins in Sanity project settings

**"Email not sending"**
→ Verify your domain in Resend, check RESEND_API_KEY

**"Admin login fails"**
→ Regenerate bcrypt hash — make sure no extra spaces in password

---

## SUPPORT
For any issues, the Vercel and Next.js docs are excellent:
- https://nextjs.org/docs
- https://vercel.com/docs
- https://www.sanity.io/docs
- https://resend.com/docs
