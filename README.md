# Chavez Automotive Repair website

Static website for Chavez Automotive Repair Inc., 25741 Obrero Dr Ste F, Mission Viejo, CA 92691.
Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Files

```
index.html        the page
css/styles.css    all styles (font: Archivo, from Google Fonts)
js/main.js        menu, live open/closed hours, before/after slider, story photo fallback
images/hero.webp  hero background photo
images/favicon.svg
```

## Publish with GitHub Pages

1. Push these files to the root of a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

To use a custom domain (for example `chavezautomotive.com`), enter it on the same Pages screen and follow GitHub's DNS instructions.

## Contact

There is no contact form. The site steers visitors to call (949) 633-1794 or walk in, with a small `mailto:` link in the "Call or stop by" panel for quick questions. To change that email address, edit the `mailto:` link in `index.html`.

## Common edits

- **Hours:** edit the `HOURS` object at the top of the hours section in `js/main.js`. Each day is `[open, close]` in minutes after midnight (`420` = 7:00 AM, `840` = 2:00 PM, `990` = 4:30 PM), or `null` when closed. Day `0` is Sunday. Times are Pacific. Current hours: Mon–Fri 7 AM – 4:30 PM, Sat 7 AM – 2 PM, Sun closed. If you change them, also update `openingHoursSpecification` in the `application/ld+json` block in the `<head>` of `index.html`.
- **Gallery:** there is one before/after slider (the front-end collision repair). Its drawn placeholder images and caption are defined in the `GALLERY_PAIR` object in `js/main.js`. To use real photos, replace the `b:` and `a:` functions with image tags, for example
  `b:() => '<img src="images/body-before.jpg" alt="">'`, `a:() => '<img src="images/body-after.jpg" alt="">'`,
  and add `.ba .layer img{width:100%;height:100%;object-fit:cover}` to the CSS. Use before/after photos taken from the same angle.
- **Phone, address, email, copy:** edit `index.html` directly. The phone number and directions link also appear in the mobile bottom bar at the end of the page.

## Story photos

The "Our story" section has three photo frames that show a navy placeholder until real photos exist. To add them, drop these files into `/images` (no code changes needed):

- `story-1.jpg`: the large photo, landscape (4:3), about 1600px wide
- `story-2.jpg` and `story-3.jpg`: the two smaller photos (4:3), about 800px wide

Use compressed JPG or WebP. If you use WebP, change the matching `src` in `index.html` to the `.webp` name. Any photo that is missing simply keeps showing the placeholder.
