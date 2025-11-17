# 📧 Email Notifications Setup (Cloudflare)

## Overview

Get email notifications when users submit feature requests or feedback using **Cloudflare Email Workers** (free tier available).

---

## Option 1: Cloudflare Email Workers + SendGrid (Recommended)

### Step 1: Get SendGrid API Key (Free)

1. Sign up at [SendGrid](https://sendgrid.com) (100 emails/day free)
2. Go to **Settings** → **API Keys** → Create API Key
3. Copy your API key

### Step 2: Add to Cloudflare

1. Go to Cloudflare Dashboard → **Workers & Pages** → Your project
2. **Settings** → **Environment Variables**
3. Add variable:
   - Name: `SENDGRID_API_KEY`
   - Value: Your SendGrid API key
   - Type: Secret (encrypted)

### Step 3: Update Functions

Update your function files to send emails:

**`functions/api/feature-request.ts`:**
```typescript
interface Env {
  DB: D1Database
  SENDGRID_API_KEY: string
}

const sendEmail = async (apiKey: string, subject: string, body: string) => {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: 'your@email.com' }],
        subject: subject
      }],
      from: { email: 'noreply@yourdomain.com' },
      content: [{
        type: 'text/plain',
        value: body
      }]
    })
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { title, description, email } = await context.request.json()
    
    // ... existing DB insert code ...
    
    // Send email notification
    try {
      await sendEmail(
        context.env.SENDGRID_API_KEY,
        `🚀 New Feature Request: ${title}`,
        `Title: ${title}\n\nDescription: ${description || 'N/A'}\n\nEmail: ${email || 'Anonymous'}\n\nSubmitted: ${new Date().toISOString()}`
      )
    } catch (emailError) {
      console.error('Email failed:', emailError)
      // Don't fail the request if email fails
    }
    
    // ... rest of existing code ...
  }
}
```

---

## Option 2: Cloudflare Email Routing (Simpler)

### Step 1: Setup Email Routing

1. Cloudflare Dashboard → Your domain → **Email** → **Email Routing**
2. Add destination email address (where you want notifications)
3. Verify your email

### Step 2: Use Mailchannels (Built into Cloudflare Workers)

**No API key needed!** Cloudflare Workers can send emails directly:

```typescript
const sendEmailViaMailchannels = async (to: string, subject: string, body: string) => {
  await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: 'notifications@your-pages-url.pages.dev',
        name: 'EZAdd Notifications'
      },
      subject: subject,
      content: [{
        type: 'text/plain',
        value: body
      }]
    })
  })
}
```

---

## Option 3: Webhook to Discord/Slack (Easiest!)

### Discord Webhook:

1. Create a Discord webhook in your server
2. Add to environment variables: `DISCORD_WEBHOOK_URL`

```typescript
const notifyDiscord = async (webhookUrl: string, message: string) => {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🚀 New Feature Request',
        description: message,
        color: 0x5865F2,
        timestamp: new Date().toISOString()
      }]
    })
  })
}
```

### Slack Webhook:

1. Create a Slack webhook in your workspace
2. Add to environment variables: `SLACK_WEBHOOK_URL`

```typescript
const notifySlack = async (webhookUrl: string, message: string) => {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚀 New Feature Request`,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }]
    })
  })
}
```

---

## Updated wrangler.toml

Add environment variables config:

```toml
name = "ezadd-api"
compatibility_date = "2024-11-17"

[[d1_databases]]
binding = "DB"
database_name = "ezadd"
database_id = "dd516bc2-94e6-4157-b458-7275de1ae8bb"

# Environment variables (set these in Cloudflare Dashboard)
[vars]
NOTIFICATION_EMAIL = "your@email.com"
```

**Note:** Secrets like API keys should be set in Cloudflare Dashboard, not in wrangler.toml!

---

## Complete Example Function with Notifications

```typescript
interface Env {
  DB: D1Database
  SENDGRID_API_KEY?: string
  DISCORD_WEBHOOK_URL?: string
  NOTIFICATION_EMAIL: string
}

const notify = async (env: Env, type: string, data: any) => {
  const message = `New ${type}:\n${JSON.stringify(data, null, 2)}`
  
  // Try Discord first (easiest)
  if (env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🔔 New ${type}`,
            description: message,
            color: 0x00ff00,
            timestamp: new Date().toISOString()
          }]
        })
      })
    } catch (e) {
      console.error('Discord notification failed:', e)
    }
  }
  
  // Try SendGrid if configured
  if (env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: env.NOTIFICATION_EMAIL }],
            subject: `New ${type} - EZAdd`
          }],
          from: { email: 'noreply@ezadd.pages.dev' },
          content: [{
            type: 'text/plain',
            value: message
          }]
        })
      })
    } catch (e) {
      console.error('Email notification failed:', e)
    }
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json()
    
    // Insert to DB
    const result = await context.env.DB.prepare(
      'INSERT INTO feature_requests (title, description, email) VALUES (?, ?, ?)'
    ).bind(data.title, data.description, data.email).run()
    
    // Send notification (non-blocking)
    notify(context.env, 'Feature Request', data).catch(console.error)
    
    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

---

## Recommendation: Start with Discord

**Why Discord is easiest:**
1. ✅ Free & instant
2. ✅ No API keys needed
3. ✅ Get notifications on mobile
4. ✅ Rich formatting with embeds
5. ✅ 2 lines of code

**Setup:**
1. Create a Discord server (or use existing)
2. Create a webhook: Server Settings → Integrations → Webhooks
3. Copy webhook URL
4. Add to Cloudflare Pages environment variables
5. Done! 🎉

---

## Testing

After setting up, test with:

```bash
curl -X POST https://your-app.pages.dev/api/feature-request \
  -H "Content-Type: application/json" \
  -d '{"title":"Test notification","description":"Testing email alerts"}'
```

You should receive a notification within seconds!

---

## Cost Comparison

| Service | Free Tier | Best For |
|---------|-----------|----------|
| Discord Webhook | Unlimited | Dev notifications |
| SendGrid | 100/day | Production emails |
| Mailchannels | 100/day | Cloudflare users |
| Slack | Unlimited | Team notifications |

---

🎯 **My Recommendation:** Start with Discord for instant notifications while developing, then add SendGrid for production if you want proper emails!
