# Chavez Automotive Repair website

Static website for Chavez Automotive Repair Inc., 25741 Obrero Dr Ste F, Mission Viejo, CA 92691.
Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Files

```
index.html        the page
css/styles.css    all styles (font: Archivo, from Google Fonts)
js/main.js        menu, live open/closed hours, before/after sliders
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

- **Hours:** edit the `HOURS` object near the top of the hours section in `js/main.js` (24-hour clock, `null` = closed). Times are shown in Pacific time.
- **Gallery:** the before/after images are drawn placeholders defined in the `GALLERY` object in `js/main.js`. To use real photos, replace the `b:` and `a:` functions with image tags, for example
  `b:() => '<img src="images/door-before.jpg" alt="">'`, `a:() => '<img src="images/door-after.jpg" alt="">'`,
  and add `.ba .layer img{width:100%;height:100%;object-fit:cover}` to the CSS. Use before/after photos taken from the same angle.
- **Phone, address, email, copy:** edit `index.html` directly. The phone number and directions link also appear in the mobile bottom bar at the end of the page.
