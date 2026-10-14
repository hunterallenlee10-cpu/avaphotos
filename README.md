# Ava Treakle — Sports & Portrait Photography

Portfolio site for Ava Treakle (working brand: **Ava Michelle Photography**).
Design direction: **"Under the Lights"**, a stadium at night. Ink and paper,
one scoreboard-amber accent pulled from her own frames, dot-matrix scoreboard
numerals, film grain, a viewfinder cursor, and an amber curtain between routes.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis.
Every page is statically generated.

## Quick start

```sh
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## Where things live

| Path | What |
|---|---|
| `content/site.ts` | **All copy**: brand constants, nav, page text, services, timeline, 404. Edit words here, not in components. `[[DOUBLE BRACKETS]]` are placeholders (see `TODO.md`). |
| `content/photos.json` | Generated photo metadata (`id, src, sport, width, height, blur, dominant, alt, caption, featured, focus, widths`). Don't hand-edit; change `scripts/curation.json` and re-run the pipeline. |
| `scripts/curation.json` | Hand curation: alt text, captions, featured flags, focal points, exclusions (with reasons), and the night-game grade for the RAW lacrosse set. |
| `scripts/process-images.ts` | Image pipeline (sharp). |
| `public/photos/` | Processed AVIF + WebP variants (committed; originals are not). |
| `app/` | Routes: `/`, `/work`, `/work/[sport]`, `/about`, `/services`, `/contact`, 404, OG images, sitemap, robots. |
| `components/` | UI. Motion pieces live in `components/motion/`; GSAP loads lazily via `lib/motion.ts`. |

## Photos

Originals are **never committed** (`_source/` is git-ignored).

1. Put originals in `_source/portfolio/<Sport>/` (and later `_source/instagram/`).
2. Add or adjust entries in `scripts/curation.json` (`src` is relative to `_source/`).
3. Run `npm run images`. For each frame it:
   - auto-rotates the image
   - strips all EXIF, including GPS
   - writes AVIF and WebP at 640, 828, 1080, 1600 and 2400px
   - generates a blur placeholder
   - records the dominant colour
   - rewrites `content/photos.json`

   Re-runs are incremental; `--force` rebuilds everything.
4. To add a sport, add it to `SPORTS` in `content/site.ts`. Its gallery page,
   Work index row, sitemap entry and OG image all follow automatically.

Images are served through `next/image`'s `getImageProps()` inside a `<picture>`
(AVIF with WebP fallback). A custom loader maps requested widths onto the
pre-generated files, so Vercel's image optimizer isn't needed.

## Booking form

`app/contact/actions.ts` is a server action with validation and a honeypot. It
sends through Resend or Formspree depending on env vars. Copy `.env.example`
to `.env.local` locally, and set the same variables in Vercel → Project → Settings → Environment Variables.

## Deploying (Vercel)

Import the repo in Vercel; framework preset **Next.js** and no extra config.
Set `NEXT_PUBLIC_SITE_URL` once the domain is known, plus one form provider.

## QA scripts

```sh
node scripts/screenshot.mjs http://localhost:3000 / /work /work/soccer   # 1440 + 390 screenshots → _qa/shots
node scripts/interaction-test.mjs http://localhost:3100                    # lightbox, swipe, curtain, form, menu, reduced motion
```

Set `PW_CHROMIUM=/path/to/chromium` if Playwright's bundled browser isn't installed.
