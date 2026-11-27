# Yorkshire Man & Van Removals — website

Live site: https://yorkshiremanandvanremovals.co.uk
Preview: https://preview-yorkshire-man-and-van-removals-v1.pvzv6vpvmn.workers.dev

## How it's hosted
- A Cloudflare Worker called `yorkshire-man-and-van-removals-v1` serves everything in `public/` (settings in `wrangler.jsonc`).
- Pushing to `main` updates the live site. Pushing to `preview` updates the preview link.
- Don't rename the Worker: the preview link and deploys depend on its name.

## Workflow
1. Make every change on the `preview` branch first and check it on the preview link.
2. Only merge `preview` into `main` when the owner says "go live".
3. Bump the `?v=` number on the CSS/JS links in every HTML page with each change (it forces browsers to load the new files).
4. Convert photos to resized `.webp` in `public/assets/`, in two widths like the existing ones (e.g. `-480` and `-900`).

## Files
- `public/index.html`: the homepage. The towns covered are in `class="area-list"`.
- `public/privacy.html`: a plain-English privacy notice (not legal advice). It's set to `noindex` on purpose, so it isn't in the sitemap.
- `public/404.html`: the "page not found" page.
- `public/css/styles.css`, `public/js/main.js`: styles and scripts.
- `public/_headers`: security and caching headers.
- `public/sitemap.xml`, `public/robots.txt`: for search engines.

## How the quote form works
3 short steps (what & when / where / what & who). The answers become a WhatsApp message that the customer checks and sends. Nothing is stored on a server.

## Domain
The site uses https://yorkshiremanandvanremovals.co.uk (no www) in the canonical link, social preview, structured data, robots.txt and sitemap.xml. The www version should redirect to it (Cloudflare > Rules > Redirect Rules).

## Housekeeping
- Google Search Console: submit `sitemap.xml`.
- Keep the phone number and website the same on the Google Business Profile.
- Optional: Cloudflare Web Analytics (free, cookie-free). The CSP in `_headers` already allows it.
