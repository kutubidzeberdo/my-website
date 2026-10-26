# Targeted navigation, homepage links and sharing correction

## Changes

- The Projects submenu contains exactly **მიმდინარე → /projects/ongoing** and **დასრულებული → /projects/completed** in both language modes. The top-level link still opens `/projects`. Existing inline chevron, hover, keyboard and mobile controls are retained.
- Added the missing static `/projects/completed` listing. Previously this reserved listing URL could fall into `[slug]` lookup and return 404. It now uses the same ContentListing component as News, All Projects and Ongoing Projects.
- Homepage limits are enforced at 6 infrastructure / 2 ongoing / 3 latest news. Existing data currently produces **5 / 2 / 3**. Small Next.js View All links open `/projects`, `/projects/ongoing`, `/news`. No Grid/List controls were added to the homepage. Existing slider, photos, cards, grid columns, dimensions, section order and section spacing are retained.
- Project detail Back links return to the appropriate ongoing/completed/all listing. Every existing record keeps its existing ID/slug and featured image. Unknown slugs still return the shared 404 page.
- A visible Facebook share button with a recognizable icon appears on every news/project detail. Configured public URLs are preferred; if NEXT_PUBLIC_SITE_URL is unset, hydration uses the current browser URL, so the local button remains visible and usable. There is no production localhost constant.
- Per-record generateMetadata continues generating canonical, Open Graph and Twitter metadata with each record's own photograph when the public site origin is configured. News listing markup, proportions, images, dates and content are unchanged.
- Listing/detail progress bars now require explicit `progressVerified: true`; existing unverified demo values remain in the data and unchanged homepage previews but are not presented as verified measurements on these pages. No official data was fabricated.

## Verified

- `npm run typecheck`: passed.
- `npm run build`: passed, including the new completed route.
- `node --test --test-name-pattern='Central records|Detail metadata' tests/gmail-contact.test.cjs`: 2 relevant non-email tests passed. The Gmail test case was not executed.
- `node --test tests/project-navigation.test.cjs`: 4 passed, covering unique/reserved slugs, per-item canonical/featured-photo metadata, encoded Facebook URLs/icon and visible local initial button.
- Real headless Chrome clicks verified all three View All destinations.
- Real homepage clicks verified **all 5 project** and **all 3 news** detail URLs. Titles and featured images match their clicked records. Browser refresh succeeds for each detail.
- Listing counts: News 3; All Projects 5; Ongoing 2; Completed 2. Grid/List modes switch on every listing without full-page navigation.
- Responsive checks at **320, 375, 390, 440, 768, 1024, 1440px** cover homepage links, News and all three project listings in Grid/List, every project detail and every news detail. No horizontal overflow or hydration/runtime errors were detected. Actual text-range measurements confirm no View All/section-label overlap.
- Desktop Enter-key activation and mobile expansion show the two submenu items correctly. Both KA/EN selections retain the same two Georgian labels.
- Share anchors and icons are visible on all 8 details with correctly encoded item-specific URLs, including with NEXT_PUBLIC_SITE_URL unset. Unit checks verify all 8 records' own public canonical and featured-image metadata with a configured origin.
- Eleven listing/detail routes return HTTP 200; unknown project returns HTTP 404. All four existing featured/gallery image source URLs return valid HTTP 200 image responses.
- Existing card and image sources remain unchanged. No Gmail source, OAuth configuration, email environment variables, API routes or contact form code were changed. No authorization or real email sending was attempted.

Browser QA output is outside the repository in `/tmp/adjara-phase2-qa/corrective-navigation-results.json`, `/tmp/adjara-phase2-qa/home-links-menu-results.json` and `/tmp/adjara-phase2-qa/menu-debug-results.json`. The first overlap probe used block widths; the final text-range probe corrected that false positive. The final keyboard probe includes the native Enter character event required for default button activation.

## Remaining limitation

Set NEXT_PUBLIC_SITE_URL to the real public HTTPS origin and rebuild before publishing production metadata. A local share URL is not publicly reachable by Facebook. Actual Facebook photo previews have **not** been verified on localhost; follow `docs/SHARING.md` after approved public hosting. Official project measurements and other unavailable facts remain omitted unless verified data is supplied.

No deployment, GitHub push, CMS or database work was performed.

## Files modified

- `src/components/Header.tsx`
- `src/components/ProjectPortfolio.tsx`
- `src/components/HomepageSections.tsx`
- `src/components/ContentListing.tsx`
- `src/components/ContentElements.tsx`
- `src/app/projects/[slug]/page.tsx`
- `src/app/globals.css`
- `src/lib/records.ts`
- `docs/SHARING.md`

## Files created

- `src/app/projects/completed/page.tsx`
- `src/components/FacebookShareButton.tsx`
- `tests/project-navigation.test.cjs`
- `docs/NAVIGATION_FIX_REPORT.md`
