# Barzakh: Star Gardener Website

Official static website for **Barzakh: Star Gardener**, an atmospheric puzzle adventure game by Han Interactive Entertainment.

## Structure

- `index.html`: Turkish homepage
- `en.html`: English homepage
- `privacy.html`: Turkish copyright/privacy page
- `privacy-en.html`: English copyright/privacy page
- `style.css`: main styles
- `script.js`: UI behavior and video/gallery interactions
- `steam-assets.js`: optional Steam screenshot sync via `fetch_steam.php`
- `robots.txt`, `sitemap.xml`, `llms.txt`: SEO and GEO files

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server.

```bash
npx serve .
```

## Deployment Notes

This site can be deployed as a static site to GitHub Pages, Cloudflare Pages, Netlify, or Vercel. `fetch_steam.php` only works on PHP-capable hosting; static hosts will still show the hardcoded Steam screenshots already present in the HTML.

Recommended production domain:

```text
https://barzakh.emirhangungormez.com.tr/
```

After deploy, submit these to Google Search Console:

- `https://barzakh.emirhangungormez.com.tr/sitemap.xml`
- `https://barzakh.emirhangungormez.com.tr/llms.txt`
