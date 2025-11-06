# TODO: Generate Sitemap for Next.js App

## Steps to Complete:
- [x] Create app/sitemap.ts file with basic structure for sitemap generation
- [x] Add static page entries (/, /admin, /videoplay)
- [x] Fetch video data from database and add dynamic video page entries (/videoplay/[videoId])
- [ ] Fetch category data from database and add category page entries (assuming /categories/[id] or similar) - Skipped as no public category pages exist
- [x] Test sitemap generation by building the app
- [x] Verify sitemap URLs are correct and accessible

## Notes:
- Sitemap will include lastModified dates using timestamps from models.
- Ensure database connection is available in sitemap.ts.
- If category pages don't exist publicly, adjust accordingly after testing.
