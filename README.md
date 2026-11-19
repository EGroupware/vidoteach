# vidoteach

vidoteach.de website – static HTML/CSS, exported 1:1 from the former WordPress/Divi site
(19 pages, German and English). No build step, no WordPress, nothing is loaded from other servers.

## Structure

- `de/…/index.html`, `en/…/index.html` – one folder per page, so the old addresses
  (`/de/kontakt/`, `/en/contact-us/`, …) stay exactly the same
- `index.html` – forwards to `/de/` (the old site answered `/` with a 301 to `/de/`)
- `404.html` – the former WordPress 404 page
- `assets/uploads/` – images and fonts (formerly `/wp-content/uploads/`)
- `assets/themes/`, `assets/plugins/`, `assets/et-cache/`, `assets/includes/` – the theme and
  plugin CSS/JS the pages need (Divi, Supreme Modules, accessibility sidebar, jQuery), stored locally
- `sitemap_index.xml`, `page-sitemap.xml` – same addresses as before

Local CSS/JS are referenced with `?v=YYYYMMDD`; raise the number in all pages when one of these files changes.

## Local preview

    python -m http.server 8791

then open http://127.0.0.1:8791/de/. Links are root-relative (`/de/…`), so opening the files
directly from disk does not work.

## Branches

| Branch    | Push deploys to                          |
|-----------|------------------------------------------|
| `staging` | staging.vidoteach.de (working branch)    |
| `main`    | live site                                |
