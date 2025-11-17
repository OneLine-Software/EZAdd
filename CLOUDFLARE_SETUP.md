# Cloudflare D1 + Pages Functions Setup Guide

## 📋 Overview

This project uses **Cloudflare D1** (serverless SQLite) for storing feature requests and feedback, with **Cloudflare Pages Functions** as the API layer.

### ✅ What's Already Done:
- ✅ D1 Database created (`ezadd`)
- ✅ Schema applied (3 tables: feature_requests, feedback, app_stats)
- ✅ API Functions created in `/functions/api/`
- ✅ Vue composable created for easy API calls

---

## 🔧 How It Works

### Architecture:
```
Vue App (EZAdd)
    ↓ (HTTP POST)
Cloudflare Pages Functions (/functions/api/*.ts)
    ↓ (SQL queries)
Cloudflare D1 Database (ezadd)
```

### **No API Keys Needed!** 🎉

When you deploy to Cloudflare Pages:
1. Your functions run **on the same domain** as your app
2. D1 database is **automatically bound** to your functions
3. **No authentication needed** for public endpoints (feature requests/feedback)
4. Everything is serverless and scales automatically

---

## 🚀 Deployment Steps

### 1. **Connect to Cloudflare Pages**

If you haven't already, connect your GitHub repo to Cloudflare Pages:

```bash
# You can do this via Cloudflare Dashboard:
# https://dash.cloudflare.com/pages
# 
# Or via CLI:
wrangler pages project create ezadd
```

### 2. **Configure D1 Binding**

In your **Cloudflare Pages Dashboard**:
1. Go to your project → **Settings** → **Functions**
2. Add **D1 Database Binding**:
   - Variable name: `DB`
   - D1 Database: `ezadd`

**OR** it will automatically use your `wrangler.toml` configuration!

### 3. **Deploy**

Your existing deployment process stays the same:

```bash
npm run build
# Cloudflare Pages will automatically detect and deploy the functions
```

---

## 📡 API Endpoints

Once deployed, these endpoints are available at:

### **Production:**
- `https://your-app.pages.dev/api/feature-request` (POST)
- `https://your-app.pages.dev/api/feedback` (POST)
- `https://your-app.pages.dev/api/stats` (POST)

### **Development:**
```bash
# Test locally with Wrangler
wrangler pages dev dist -- npm run dev
```

---

## 💻 Using the API in Your Vue App

### Example 1: Submit Feature Request

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'

const { submitFeatureRequest } = useApi()
const { success, error } = useToast()

const handleSubmit = async () => {
  try {
    await submitFeatureRequest({
      title: 'Add Dark Mode',
      description: 'Would love a dark mode toggle!',
      email: 'user@example.com' // Optional
    })
    success('Feature request submitted!')
  } catch (err) {
    error('Failed to submit request')
  }
}
</script>
```

### Example 2: Submit Feedback

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'

const { submitFeedback } = useApi()

await submitFeedback({
  name: 'John Doe', // Optional
  email: 'john@example.com', // Optional
  message: 'Love this app!',
  rating: 5 // Optional (1-5)
})
</script>
```

### Example 3: Track Anonymous Stats

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'

const { logStat } = useApi()

// Track when user adds tax
logStat('tax_added', { count: 1 })

// Track PWA install
logStat('pwa_installed')
</script>
```

---

## 🔍 Viewing Your Data

### Option 1: Cloudflare Dashboard
1. Go to **D1** in your Cloudflare dashboard
2. Select `ezadd` database
3. Use the SQL console to query data:

```sql
SELECT * FROM feature_requests ORDER BY created_at DESC LIMIT 10;
SELECT * FROM feedback WHERE approved = 1;
```

### Option 2: Wrangler CLI

```bash
# Query via CLI
wrangler d1 execute ezadd --remote --command "SELECT * FROM feature_requests"
```

### Option 3: Create Admin Dashboard (Future)

You could create a `/functions/admin/` directory with password-protected endpoints to:
- View feature requests
- Approve testimonials
- View analytics

---

## 🔒 Security Notes

### Current Setup:
- ✅ Public endpoints (anyone can submit)
- ✅ Rate-limited by Cloudflare automatically
- ✅ No PII stored (email is optional)
- ✅ CORS enabled for your domain

### For Admin Features (Future):
You'll want to add authentication:
- Use Cloudflare Access
- Or add a simple API key check
- Or use middleware for admin routes

---

## 💰 Free Tier Limits

**Cloudflare D1 (Free):**
- 5 GB storage
- 5 million reads/day
- 100,000 writes/day

**Cloudflare Pages (Free):**
- Unlimited requests
- 100,000 requests/day for functions

**You're good for thousands of users!** 🚀

---

## 🧪 Testing Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local dev with functions
wrangler pages dev dist -- npm run dev

# 3. Test endpoints
curl -X POST http://localhost:5173/api/feature-request \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Testing local API"}'
```

---

## 📊 Example Queries for Analytics

```sql
-- Most requested features (by votes)
SELECT title, votes, created_at 
FROM feature_requests 
ORDER BY votes DESC 
LIMIT 10;

-- Approved testimonials
SELECT name, message, rating, created_at 
FROM feedback 
WHERE approved = 1 
ORDER BY rating DESC;

-- Usage stats breakdown
SELECT event_type, COUNT(*) as count 
FROM app_stats 
GROUP BY event_type 
ORDER BY count DESC;
```

---

## 🎯 Next Steps

1. **Add Feature Request Button** in settings menu
2. **Add Feedback Modal** after user completes calculation
3. **Track Stats** for interesting events (PWA install, tax usage, etc.)
4. **Create Admin Panel** (optional) to view/manage submissions

---

## ❓ FAQ

**Q: Do I need environment variables?**  
A: Nope! The D1 binding is configured in `wrangler.toml` and Cloudflare Pages automatically injects it.

**Q: Is this secure?**  
A: Yes! The database binding only works server-side (in functions). Client-side code can't access D1 directly.

**Q: What about spam?**  
A: Cloudflare automatically rate-limits. You can also add honeypot fields or simple validation.

**Q: Can I use this for user data?**  
A: For now, avoid storing sensitive user data. Use localStorage for calculations. In the future, you could add authentication and user-specific tables.

---

Enjoy your serverless feedback system! 🎉
