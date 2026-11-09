# Chavez Automotive Repair website

Static website for Chavez Automotive Repair Inc., 25741 Obrero Dr Ste F, Mission Viejo, CA 92691.
Plain HTML, CSS and JavaScript. No build step: the site itself has no dependencies.
(The image script in `scripts/` uses one npm package, `sharp`, on your computer only.)

## Files

```
index.html                      the page
css/styles.css                  all styles (font: Archivo, from Google Fonts)
js/main.js                      menu, live open/closed hours, Our Work lightbox, logo and story photo fallbacks
images/hero.webp                hero background photo
images/favicon.svg
images/logo.png                 (optional, add later) your logo, see "Logo" below
images/story/story-1..3.webp    Our Story photos
images/gallery/work-NN.webp     Our Work photos, full size (opened in the lightbox)
images/gallery/thumbs/work-NN.webp   Our Work grid thumbnails (600x600 square)
scripts/optimize-images.js      turns original photos into the web images above
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
- **Yelp link:** `https://www.yelp.com/biz/chavez-automotive-repair-mission-viejo` appears in three places in `index.html`: the "See us on Yelp" button in the hero, the "See us on Yelp" link in the "Call or stop by" panel, and the "Yelp" link in the footer. Search for `yelp.com` to change all three.
- **Hero tagline:** the `<p class="lede">` in the hero in `index.html`.
- **Phone, address, email, copy:** edit `index.html` directly. The phone number and directions link also appear in the mobile bottom bar at the end of the page.

## Photos

Original photos are **not** kept in this repo. They live in a folder next to it, `../photo-originals`
(for example `Dev/Chavez/photo-originals` beside `Dev/Chavez/chavez-automotive-site`), so the repo stays small.
The script reads that folder and writes web-ready copies into `images/`: auto-rotated, every bit of metadata
removed (including GPS location), at most 1600px on the long edge, WebP quality 80, plus 600x600 square thumbnails.

How the script sorts originals, by file name (or sub-folder name):

- name contains **`story`** → Our Story. A name with `main` goes first (the large frame), then by the number in the name. The first 3 fill the frames; any more go to the gallery.
- name contains **`gallery`** or **`work`** → Our Work, in number order (`gallery_1`, `gallery_2`, ...).
- anything else is skipped and listed.

### Run the script

```
cd scripts
npm install                 # first time only (installs sharp)
node optimize-images.js     # or: npm run optimize-images
```

It rebuilds `images/story/` and `images/gallery/` from scratch each time and prints what went where, including each thumbnail's size.

### Add more photos to Our Work

1. Put the original in `../photo-originals`, named with the next number, e.g. `gallery_10.jpg`.
2. Run the script (above).
3. In `index.html`, find the `work-grid` and copy the last `<a class="work-tile">` line, changing the number in all three places and the photo number in the alt text:
   ```html
   <a class="work-tile" href="images/gallery/work-10.webp"><img src="images/gallery/thumbs/work-10.webp" width="600" height="600" loading="lazy" decoding="async" alt="Work by Chavez Automotive Repair, photo 10"></a>
   ```
   Use the thumbnail size the script printed for `width`/`height` (600x600 unless the original was smaller).

The lightbox picks up new tiles automatically. Once there are more than 9 tiles, the first 9 show and a "Show all photos" button reveals the rest.

### Our Story photos

`images/story/story-1.webp` is the large frame, `story-2.webp` and `story-3.webp` the small ones. All three frames are 4:3, so photos are cropped to fit. To change which part of a photo stays in view, edit its `object-position` in `index.html` (for example `style="object-position:50% 18%"` keeps the top of a tall photo). If a file is missing, its frame shows the built-in navy placeholder instead.

## Logo

Drop a transparent-background logo at **`images/logo.png`** and it appears in the header automatically, replacing the gauge icon and "Chavez Automotive / REPAIR INC." wordmark (shown up to 44px tall on desktop, 36px on mobile). If you'd rather use an SVG, change the `src` of the `<img class="logo-img">` in the header in `index.html` to `images/logo.svg`. Until the file exists, the built-in gauge and wordmark stay.
