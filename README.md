# Chavez Automotive Repair website

Static website for Chavez Automotive Repair Inc., 25741 Obrero Dr Ste F, Mission Viejo, CA 92691.
Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Files

```
index.html        the page
css/styles.css    all styles (font: Archivo, from Google Fonts)
js/main.js        menu, live open/closed hours, before/after sliders, contact form
images/hero.webp  hero background photo
images/favicon.svg
```

## Publish with GitHub Pages

1. Push these files to the root of a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

To use a custom domain (for example `chavezautomotive.com`), enter it on the same Pages screen and follow GitHub's DNS instructions.

## Turn on the contact form

GitHub Pages can't receive form submissions by itself, so the form sends through Formspree (free plan available).

1. Sign up at https://formspree.io and create a new form. Use the shop's email address as the destination.
2. Copy the form ID: the code after `/f/` in the endpoint, such as `xyzabcd1`.
3. Open `js/main.js` and set it near the top:
   ```js
   const FORMSPREE_ID = "xyzabcd1";
   ```
4. Commit and push. Each message arrives by email, marked "(after hours)" when it was sent while the shop was closed.

Until the ID is set, the form asks visitors to call (949) 633-1794 instead.

## Common edits

- **Hours:** edit the `HOURS` object near the top of the hours section in `js/main.js` (24-hour clock, `null` = closed). Times are shown in Pacific time.
- **Gallery:** the before/after images are drawn placeholders defined in the `GALLERY` object in `js/main.js`. To use real photos, replace the `b:` and `a:` functions with image tags, for example
  `b:() => '<img src="images/door-before.jpg" alt="">'`, `a:() => '<img src="images/door-after.jpg" alt="">'`,
  and add `.ba .layer img{width:100%;height:100%;object-fit:cover}` to the CSS. Use before/after photos taken from the same angle.
- **Phone, address, copy:** edit `index.html` directly.
