# PWA Offline Support Guide

## Current Configuration

The app is now configured with improved offline support:

### What's Been Added:
1. **NavigateFallback**: Routes all navigation requests to `index.html` for SPA routing
2. **NetworkFirst Strategy**: Tries network first, falls back to cache if offline
3. **Precaching**: All assets (JS, CSS, HTML, images) are precached during service worker installation

## Testing Offline Functionality

### Method 1: Chrome DevTools (Recommended for Testing)
1. Open the app in Chrome
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Check the **Offline** checkbox at the top
5. Refresh the page - it should still work!

### Method 2: Real Device Testing
1. Visit the app online first (to install service worker and cache assets)
2. Add to home screen (iOS: Share → Add to Home Screen, Android: Menu → Add to Home Screen)
3. **Wait 5-10 seconds** after installation for service worker to finish caching
4. Turn on Airplane Mode
5. Open the app from home screen - should work offline!

## Important Notes

### Initial Installation
- The service worker needs to **install and cache all assets** the first time you visit
- This happens in the background and may take a few seconds
- The app won't work offline until caching is complete

### After Updates
- When you deploy new code, users need to visit the app **online first** to get updates
- The service worker will auto-update in the background
- A console message will appear: "New content available, please refresh."

### Debugging
Check service worker status:
1. Chrome DevTools → **Application** tab → **Service Workers**
2. Look for status: "activated and is running"
3. Check **Cache Storage** to see if assets are cached

### Build & Deploy
Always run `npm run build` before deploying. This ensures:
- Service worker is generated with all asset hashes
- Proper precache manifest is created
- Assets are optimized and fingerprinted

## Troubleshooting

**App doesn't work offline after installation:**
- Visit the app online first and wait 10 seconds
- Check DevTools → Application → Service Workers (should show "activated")
- Check DevTools → Application → Cache Storage (should have cached files)
- Try clearing all cache and reinstalling

**Service worker not updating:**
- In DevTools → Application → Service Workers, click "Skip waiting"
- Or unregister the service worker and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

**Still having issues:**
- Make sure you're using HTTPS or localhost (service workers require secure context)
- Check browser console for any errors
- Verify all PWA icons exist in the `public` folder
