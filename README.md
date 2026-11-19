# vidoteach

vidoteach.de website – plain static HTML and CSS, no build step, no WordPress, no frameworks,
no web fonts. Rebuilt without Divi in November 2026 on the same basis as www.egroupware.org
(same stylesheet and components, VIDOTEACH colours and logo). Nothing is loaded from other servers.

## Structure

- `de/…/index.html`, `en/…/index.html` – one folder per page, so the old addresses
  (`/de/kontakt/`, `/en/contact-us/`, …) stay exactly the same. Links are root-relative (`/de/…`).
- `index.html` – language switch as on www.egroupware.org: a choice made with DE/EN
  (`localStorage` key `vidoteach-lang`) wins, otherwise German browsers go to `/de/`, all others to `/en/`
- `de/home/` – former duplicate of the start page, forwards to `/de/` (a server 301 is better)
- `404.html` – page for unknown addresses
- `send.php` – contact form handler (needs PHP and mail on the server; recipient via `VIDOTEACH_MAIL_TO`)
- `assets/css/style.css` – the only stylesheet: the www.egroupware.org stylesheet plus the
  blocks "VIDOTEACH: Markenfarben" and "VIDOTEACH: eigene Bausteine" at the end
- `assets/js/main.js` – menu, light/dark mode (`vidoteach-theme`), language memory, footer year
- `assets/img/` – logo (light/dark), icon sprites (`nav-icons.svg`, `social.svg`), `og-image.jpg`
- `assets/uploads/` – images from the former site (same addresses as before, `.webp` used on the pages)
- `sitemap_index.xml`, `page-sitemap.xml`, `robots.txt`

## Rules (as on www.egroupware.org)

- German and English pages are kept equal in content and structure; change both in the same commit.
- Header, menu and footer are written into every page; a change there means changing all pages.
- New colours need values for dark mode; text contrast at least 4.5:1.
- Every page must work on a phone (no sideways scrolling).
- `style.css` and `main.js` are referenced with `?v=YYYYMMDD`; raise the number in all pages when one changes.

## Local preview

    python -m http.server 8791

then open http://127.0.0.1:8791/de/. Opening the files directly from disk does not work
because links are root-relative. The contact form needs PHP and only works on the server.

## Branches

| Branch    | Push deploys to                          |
|-----------|------------------------------------------|
| `staging` | staging.vidoteach.de (working branch)    |
| `main`    | live site                                |
