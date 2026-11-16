# Baya Garden Studio

The Astro rebuild of bayagardenstudio.com.

## Forms and client galleries

Everything here runs on the Cloudflare Worker; all other pages are static.

| What | Route | Service |
|---|---|---|
| Contact form | `POST /api/contact/` | Turnstile, then Amazon SES (Reply-To is the sender) |
| Newsletter | `POST /api/newsletter/` | Turnstile, then Brevo (optional double opt-in) |
| Client galleries | `/gallery/<name>/` | Per-gallery password, signed cookie, photos from private R2 |

Settings live in `wrangler.jsonc` (`vars`) and as Worker secrets (listed there and in `.dev.vars.example`).
Set the public Turnstile site key as `PUBLIC_TURNSTILE_SITE_KEY` in the build environment.

**Galleries**

1. Upload photos and zips once: `node scripts/upload-galleries.mjs <wp-content/uploads folder>`.
2. Set passwords: `node scripts/gallery-passwords.mjs local.sql | npx wrangler secret put GALLERY_PASSWORDS`
   (or pass a `slug,password` CSV). Only hashes are stored.
3. Set a cookie secret once: `openssl rand -hex 32 | npx wrangler secret put GALLERY_COOKIE_SECRET`.

To add a gallery, add it to `src/data/galleries.json`, upload its files and re-run step 2.
Changing a gallery's password signs everyone out of that gallery.
