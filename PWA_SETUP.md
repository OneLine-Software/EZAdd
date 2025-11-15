# PWA Setup Guide

## Installation

1. Install the PWA plugin:
```bash
npm install --save-dev @vite-pwa/vite-plugin-pwa workbox-window
```

## Required Icons

You need to generate the following icons and place them in the `public` folder:

- `pwa-192x192.png` - 192x192px app icon
- `pwa-512x512.png` - 512x512px app icon
- `apple-touch-icon.png` - 180x180px Apple touch icon
- `favicon.ico` - Standard favicon

### Generate Icons

You can use tools like:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://realfavicongenerator.net/)
- Or manually create them from your logo

## Features

✅ **Offline Support** - App works offline after first load
✅ **Auto Updates** - Service worker automatically updates in background
✅ **Add to Home Screen** - Users can install app on mobile devices
✅ **System Theme Detection** - Automatically matches system dark/light mode
✅ **Responsive Theme Color** - Status bar adapts to system theme

## Testing PWA

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve the build:**
   ```bash
   npm run preview
   ```

3. **Test offline:**
   - Open in browser
   - Open DevTools → Application → Service Workers
   - Check "Offline" mode
   - Refresh - app should still work!

4. **Test installation:**
   - On mobile: Browser will show "Add to Home Screen" prompt
   - On desktop: Look for install icon in address bar

## Manifest Configuration

The PWA manifest is configured in `vite.config.ts`:

- **Name:** EZAdd - Quick Addition Calculator
- **Short Name:** EZAdd  
- **Theme Color:** Responds to system dark/light mode
- **Display:** Standalone (fullscreen app experience)
- **Start URL:** /

## Service Worker

- Caches all static assets (JS, CSS, HTML, images)
- Caches Google Fonts if used
- Auto-updates in background without disrupting user
- Logs when new version available or offline ready

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox
- ✅ Samsung Internet
