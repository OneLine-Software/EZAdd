# 🛠️ Local Development with Cloudflare Functions

## Quick Start

### Option 1: Wrangler Dev Server (Recommended)

```bash
# 1. Build your app
npm run build

# 2. Run with Wrangler (serves app + functions + D1)
wrangler pages dev dist

# Your app will be at: http://localhost:8788
# Functions work at: http://localhost:8788/api/*
```

**Pros:**
- ✅ Full feature parity with production
- ✅ Real D1 database (local SQLite)
- ✅ Functions work exactly as deployed

**Cons:**
- ❌ Need to rebuild after every change
- ❌ Different port than Vite dev server

---

### Option 2: Vite Dev + Wrangler in Parallel

Run both servers and use one for frontend, one for API:

**Terminal 1 (Frontend with HMR):**
```bash
npm run dev
# Runs at: http://localhost:5173
```

**Terminal 2 (API Functions):**
```bash
npm run build && wrangler pages dev dist
# Runs at: http://localhost:8788
```

**Then update `useApi.ts` to use different ports:**

```typescript
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8788/api' // Wrangler for functions
  : '/api' // Production
```

**Workflow:**
1. Develop UI at `localhost:5173` (fast HMR)
2. API calls go to `localhost:8788` (Wrangler)
3. Rebuild when you change function code

---

### Option 3: Mock API During Development

Add mock responses for local dev without running Wrangler:

```typescript
// src/composables/useApi.ts
const USE_MOCK_API = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API

export function useApi() {
  const submitFeatureRequest = async (data: any) => {
    if (USE_MOCK_API) {
      // Mock response for local dev
      console.log('Mock: Feature request submitted', data)
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true, id: Math.random(), message: 'Mock submitted!' }
    }
    
    // Real API call
    const response = await fetch(`${API_BASE}/feature-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return await response.json()
  }
  
  // ... rest of composable
}
```

Then develop UI without needing the backend!

---

### Option 4: Just Deploy & Test (Simplest!)

For a small project like this:

1. **Develop UI** locally with `npm run dev`
2. **Deploy** to Cloudflare Pages to test API
3. **Iterate** quickly with auto-deploy on push

**Why this works:**
- ✅ Fast feedback loop
- ✅ No complex local setup
- ✅ Test in real environment
- ✅ Cloudflare deploys are instant (~30 seconds)

---

## 🎯 Recommendation

**For initial development:**
→ Use **Option 4** (Deploy & Test)

**Once you have many API changes:**
→ Use **Option 2** (Vite + Wrangler parallel)

**For complex function debugging:**
→ Use **Option 1** (Full Wrangler dev)

---

## 📦 Package Scripts

Add these to `package.json` for convenience:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "wrangler:dev": "wrangler pages dev dist",
    "dev:full": "npm run build && wrangler pages dev dist",
    "dev:watch": "npm run build && wrangler pages dev dist --watch"
  }
}
```

Then use:
```bash
npm run dev:full    # Build + run with Wrangler
npm run dev:watch   # Same but watches for changes
```

---

## 🐛 Troubleshooting

### Functions return 404
- Make sure functions are in `/functions/api/` directory
- Check file names match routes (e.g., `feature-request.ts` → `/api/feature-request`)
- Ensure you're using Wrangler, not just Vite

### Database not found
- Run `wrangler d1 execute ezadd --file=schema.sql` locally
- Or use `--remote` flag for production DB

### CORS errors
- Make sure your functions include CORS headers
- Check `onRequestOptions` handler exists for preflight

---

## 🔍 Viewing Local Database

```bash
# Query local database
wrangler d1 execute ezadd --command "SELECT * FROM feature_requests"

# Query remote database
wrangler d1 execute ezadd --remote --command "SELECT * FROM feature_requests"
```

---

## 🚀 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (UI only) |
| `npm run build` | Build for production |
| `wrangler pages dev dist` | Full local environment |
| `wrangler d1 execute ezadd --command "..."` | Query local DB |
| `git push` | Deploy to production |

---

**For your case:** Just deploy and test! It's the fastest way to validate everything works. 🚀
