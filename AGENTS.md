# EZAdd

Quick-addition calculator PWA (mobile-first). OneLine LAB product; portfolio piece at `/work/ezadd` on oneline.software.

## Stack

- Vue 3 + TypeScript (strict), Vite 5, Tailwind CSS, shadcn-vue (`components.json`), lucide-vue-next
- PWA (`vite-plugin-pwa`); Cloudflare Pages Functions under `functions/` (`wrangler.toml`)
- No test runner configured — verify = typecheck + build

## Conventions

- `<script setup lang="ts">` Composition API only. Components in `src/components/`, shadcn primitives in `src/components/ui/`.
- Keyboard-first UX: Enter/`N` adds an entry, `T` opens the tax popover — keep shortcuts working.
- Dark mode via `.dark` class on `<html>`; entries/taxes persist in `localStorage`.
- Never commit `.env` or secrets.

## Verify

```
npm run build    # vue-tsc -b && vite build — covers typecheck
npm run dev      # vite --host 0.0.0.0
```

## Done when

- `npm run build` passes and the feature works at 390px width in both themes.

## Never do

- Push directly to master — the PR is the deliverable.
- Add a test framework or state library without asking.
