# Before launch: confirm with Ava (and Hunter)

Everything on this list is either a placeholder on the live pages, a call I
made that Ava should sign off on, or setup that needs an account. Placeholders
render as **dashed amber chips** on the site, so they can't be missed.

## 1. Placeholders in `content/site.ts`

| Placeholder | Where it shows | Notes |
|---|---|---|
| `BRAND.name` = "Ava Michelle Photography" | Footer ©, metadata, JSON-LD, OG cards | **Confirm the final brand name.** One constant, `content/site.ts` line ~14. |
| `[[SERVICE AREA]]` | Contact page "Based in" | Also enables `areaServed` in the LocalBusiness JSON-LD automatically once filled in. Add the area to `SEO.description`/`keywords` too (e.g. "Baltimore sports photographer"). |
| `[[PRICE]]` ×4 | Services: Game Day, Team & Media Day, Athlete Individual, Senior & Grad | "Starting at …" |
| `[[TURNAROUND]]` | Services → How it works → 04 Gallery | Gallery delivery time. |
| `[[RESPONSE TIME]]` | Contact form success message | e.g. "48 hours". |
| `[[AVA HEADSHOT]]` | About page portrait frame (`app/about/page.tsx`) | Swap the placeholder `<div role="img">` for `<Photo>` once she approves a portrait (add it to `curation.json` like any photo). |
| `[[TESTIMONIAL — get from Ava]]` | About page, above "Work with me" | One real quote with name and team. Nothing has been invented. |
| `[[INSTAGRAM — 2021 high school sidelines photo, Ava to approve]]` | About timeline, stop 01 (2021) | Needs the Instagram export (see §3). |

## 2. Copy to read through with Ava

All copy is first person and drafted only from the facts in the brief. These
lines describe how she works or what's included in a service. They're
reasonable but **not confirmed facts**:

- Hero line: "I’ve played under these lights. I know where the moment lands."
- Services: the "includes" bullets for each service (e.g. "Follow-cam game coverage", "Recruiting-ready selects", "Organized by roster", "Location planning").
- Services → How it works, step 03: "I show up early, learn the field, and stay late for the handshake line."
- About, paragraph 3: "Learning how athletes move, get hurt, and come back has made me a better photographer."
- Home story: "Watching bodies at full speed is, quite literally, my homework."
- Timeline stop 04: "grad portraits at Mustang Stadium became part of the work: the field, the boardwalk, the statue."
- Alt text names an opponent only where it's legible in the frame ("York" jerseys in two soccer frames).

## 3. Instagram export (`Instagram Photos (@avatreakle)/`)

The Drive folder was **empty** when this was built, so every image on the site
comes from Ava's curated portfolio folder. When the export arrives:

1. Download it into `_source/instagram/`.
2. Add entries to `scripts/curation.json`. New sports (Field Hockey, Track &
   Field, Wrestling, Cross Country, Marching Band…) also go in `SPORTS` in
   `content/site.ts`; pages, sitemap and OG images follow automatically.
3. Fill About timeline stop 01 (2021) with a high school sidelines frame.
4. Use personal or lifestyle photos **only on the About page**, and only ones Ava approves.
5. Run `npm run images`.

## 4. High school athletes / permissions

- **No high school images are used.** All 48 published frames are Stevenson
  University (college) work: football, men's & women's soccer, men's lacrosse,
  baseball, men's beach volleyball, and graduation portraits.
- High school frames from the Instagram export will likely show minors. List
  each one used here, and have Ava confirm she has permission before it goes
  live. Keep them out of the hero and featured slots.
- The portraits show identifiable graduates. Ava should be comfortable
  publishing each one, as with any portfolio.

## 5. Curation calls (easy to reverse in `scripts/curation.json`)

Six frames were left out (each entry keeps its reason):

| Frame | Reason |
|---|---|
| Baseball 8 (wide pitch) | Subject small in frame; a stronger pitching frame is kept |
| Baseball 9 (batting stance) | Parked van and spectators pull focus |
| Men's Lacrosse 7 (faceoff) | Officials dominate the frame |
| Portraits 4 (boardwalk) | Near-duplicate of Portraits 3, which has the better sky and expressions |
| Portraits 6 (cap toss) | Same composition as Portraits 10. **Different graduate.** Restore if he should be represented |
| Soccer 5 (team celebration) | Light pole splits the frame through the subject |

The "Men's Lacrosse – RAW" set has a consistent night-game grade (black/white
point, slight contrast, +15% saturation) so it sits with her edited work. If
Ava would rather edit those herself, drop the `"grade": "night"` lines and
re-run `npm run images -- --force`.

## 6. Setup

- [ ] **Vercel**: import the repo (Next.js preset, no config needed).
- [ ] `NEXT_PUBLIC_SITE_URL` = the final domain (canonical, sitemap and OG URLs).
- [ ] Booking form: set `RESEND_API_KEY` (+ `CONTACT_FROM` on a verified domain) **or** `FORMSPREE_ENDPOINT`. See `.env.example`. Without one, the live form shows its designed error state and points people to her email.
- [ ] Submit `sitemap.xml` in Google Search Console once the domain is live.
- [ ] Optional: replace the men's lacrosse frame on timeline stop 02 ("Commit") with a photo of Ava playing for Stevenson, if she has one she likes.

## 7. QA status (local production build, Lighthouse 12)

| Page | Perf mobile* | Perf desktop | Accessibility | Best Practices | SEO | CLS |
|---|---|---|---|---|---|---|
| `/` | 91–92 | 100 | 100 | 100 | 100 | 0 |
| `/work` | 96 | — | 100 | 100 | 100 | 0 |
| `/work/soccer` | 92 | 99 | 100 | 100 | 100 | 0 |
| `/work/lacrosse` | 94 | — | 100 | 100 | 100 | 0 |
| `/about` | 95 | 100 | 100 | 100 | 100 | 0 |
| `/services` | 94 | — | 100 | 100 | 100 | 0 |
| `/contact` | 97 | — | 100 | 100 | 100 | 0 |

\* **Mobile performance is short of the 95 target on Home, the galleries and
Services.** Lighthouse's simulated throttling on `localhost` charges the whole
React/Next runtime (~150 KB gzipped) to LCP, even though the LCP image paints
in the first frame (observed LCP ≈ 0.2 s; with real devtools throttling, home
LCP ≈ 2.0 s). A blank page with just the site chrome already simulates at
LCP ≈ 2.8 s here. Already done to cut it:
- GSAP and Lenis load at idle.
- The display font is a static 18 KB subset.
- Reveals are CSS-only scroll-driven animations.
- `Photo` renders on the server.
- Above-the-fold images load eagerly.
- An 828px variant serves 1.75× phones.

**Re-check on the Vercel URL with PageSpeed Insights after deploying.**

Interaction smoke tests (`scripts/interaction-test.mjs`): 18/18 pass. They
cover the keyboard lightbox, wrap-around, zoom, Esc and focus return, touch
swipe, the route curtain, the form's validation, prefill and error states, the
mobile menu, and reduced motion. No horizontal overflow at 390px, and no
console errors.
