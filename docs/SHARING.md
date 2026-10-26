# Facebook and metadata verification

Set NEXT_PUBLIC_SITE_URL to the actual site origin at build time and runtime. `.env.example` uses localhost for local development only; there is no hardcoded production localhost fallback. If unset, canonical/absolute image URLs are omitted rather than publishing incorrect production addresses. The visible share button uses the current browser page URL as a local fallback; this lets the button work locally but does not make localhost reachable by Facebook. Set the variable and rebuild to enable the correct public metadata and share origin.

Each `/news/[slug]` and `/projects/[slug]` route emits server-rendered canonical, Open Graph and Twitter metadata from its central record. The share URL contains only the encoded individual page URL. Facebook chooses the photo from the page's own absolute `og:image`; no photograph is injected into its dialog.

After an approved public deployment:

1. Confirm the real HTTPS origin is configured and rebuilt.
2. Open each article/project URL without authentication; confirm its page and featured image return HTTP 200 publicly, without blocking social crawlers.
3. Inspect the HTML for canonical, og:title, og:description, og:url, og:type, og:image and twitter:card.
4. Paste each detail URL into Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) and request a scrape. Check title, description and photograph. Re-scrape after metadata changes to refresh Facebook's cache.
5. Test the Facebook Share button; it must share the individual page URL.

Local HTML metadata and share URL generation can be tested now. Facebook photo previews cannot be verified from localhost and have not been claimed verified.
