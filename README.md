# EZAdd - Simple Addition Calculator

A mobile-first addition calculator built with Vue 3, TypeScript, Vite, and Tailwind CSS v4.

## Features

- **Dynamic Price Entries** - Add/remove as many items as you need
- **Quantity Multipliers** - 2×, 3×, or custom multipliers for each entry
- **Real-time Calculation** - Automatic subtotal and total
- **Multiple Tax Support** - Add multiple taxes (percentage or flat fee) with custom labels
- **Floating Total** - Total stays visible above keyboard on mobile
- **Dark Mode** - Automatically matches system theme on open
- **Theme Colors** - Customize the primary color
- **PWA Support** - Install as app, works offline
- **Mobile Optimized** - Touch-friendly interface with proper keyboard handling
- **Input Validation** - Only allows numbers, decimals, and negative values
- **Smart Keyboard** - iOS gets standard keyboard, Android gets number pad with negatives sign
- **Keyboard shortcuts**:
  - `Enter` - Add new entry (desktop)
  - `Cmd/Ctrl + Backspace` - Delete current entry
- **Click "Add item"** button for mobile users

- **Add multiple taxes** - Support for both percentage and flat fees
- **Custom labels** - Name your taxes (e.g., "Sales Tax", "Service Fee")
- **Auto-labeling** - Defaults to "X%" or "+$X" if no label provided
- **Easy removal** - Click any tax badge to remove it
- **Dynamic label** - Shows "Tax" or "Taxes" based on count

### 🎨 Customization
- **Dark mode** - Toggle or auto-detect system preference
- **Theme colors** - 6 preset colors to choose from
- **Clean, minimal UI** - Focus on what matters

### 📱 Mobile-First Design
- **Always-visible total** - Fixed to bottom, never scrolls away
- **Touch-optimized** - Large tap targets and smooth animations
- **Network accessible** - Runs on `0.0.0.0` for local network testing

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development
- **Tailwind CSS v4** with HSL color system
- **ShadCN Vue** components
- **Lucide Vue** icons

## Component Structure

The app is built with modular, reusable components:

- **`Calculator.vue`** - Main container that orchestrates state
- **`PriceInput.vue`** - Individual price entry with keyboard shortcuts
- **`TaxManager.vue`** - Tax section with multiple tax support and 'T' shortcut
- **`TotalDisplay.vue`** - Bottom total display
- **`SettingsMenu.vue`** - Dark mode and theme settings

## Keyboard Shortcuts

Desktop only (hidden on mobile):

- **`Enter`** - Add new price entry
- **`Cmd/Ctrl + Backspace`** - Delete current price entry
- **`T`** - Open tax popover (when not typing in a field)
- **`Cmd/Ctrl + Enter`** - Submit tax (while in tax popover)

## Development

```bash
# Install dependencies
npm install

# Install PWA plugin
npm install --save-dev @vite-pwa/vite-plugin-pwa workbox-window

# Start dev server (accessible on local network)
npm run dev

# Build for production
npm run build

# Preview production build (test PWA)
npm run preview
```

## PWA Installation

After building, the app can be installed as a Progressive Web App:

1. **Mobile (iOS/Android):**
   - Open in Safari/Chrome
   - Tap "Add to Home Screen" when prompted
   - App opens in fullscreen mode

2. **Desktop:**
   - Look for install icon in address bar
   - Click to install as desktop app

3. **Offline Support:**
   - Works offline after first load
   - Auto-updates in background

See [PWA_SETUP.md](./PWA_SETUP.md) for detailed configuration and icon requirements.

## Requirements

- Node.js 20.19+ or 22.12+
- Modern browser (Chrome 111+, Safari 16.4+, Firefox 128+)
