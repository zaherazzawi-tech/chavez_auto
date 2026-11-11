# Chavez Automotive Repair website

Static website for Chavez Automotive Repair Inc., 25741 Obrero Dr Ste F, Mission Viejo, CA 92691.
Plain HTML, CSS and JavaScript. No build step: the site itself has no dependencies.
(The image script in `scripts/` uses one npm package, `sharp`, on your computer only.)

## Files

```
index.html                      the page
favicon.ico                     browser tab icon (browsers ask for /favicon.ico on their own, so it stays in the root)
site.webmanifest                name, colors and icons used when the site is added to a phone home screen
icons/                          favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180x180),
                                android-chrome-192x192.png, android-chrome-512x512.png
css/styles.css                  all styles (font: Archivo, from Google Fonts)
js/main.js                      menu, live open/closed hours, Our Work film strip + lightbox, review "Read more", logo and story photo fallbacks
images/hero.webp                hero background photo
images/logo.png                 the logo (header, mobile menu, footer), see "Logo" below
images/story/story-1..3.webp    Our Story photos
images/gallery/work-NN.webp     Our Work photos, full size (opened in the lightbox)
images/gallery/thumbs/work-NN.webp   Our Work film-strip frames (704x528, 4:3)
scripts/optimize-images.js      turns original photos into the web images above
```

## Publish with GitHub Pages

1. Push these files to the root of a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

To use a custom domain (for example `chavezautomotive.com`), enter it on the same Pages screen and follow GitHub's DNS instructions.

## Contact

There is no contact form and no email address on the site. Everything steers visitors to call (949) 633-1794 or walk in, including the "Have a quick question?" line in the "Call or stop by" panel.

## Common edits

- **Hours:** edit the `HOURS` object at the top of the hours section in `js/main.js`. Each day is `[open, close]` in minutes after midnight (`420` = 7:00 AM, `840` = 2:00 PM, `990` = 4:30 PM), or `null` when closed. Day `0` is Sunday. Times are Pacific. Current hours: Mon–Fri 7 AM – 4:30 PM, Sat 7 AM – 2 PM, Sun closed. If you change them, also update `openingHoursSpecification` in the `application/ld+json` block in the `<head>` of `index.html`.
- **Yelp link:** `https://www.yelp.com/biz/chavez-automotive-repair-mission-viejo` appears in three places in `index.html`: the "See us on Yelp" button in the hero, the "See us on Yelp" link in the "Call or stop by" panel, and the "Yelp" link in the footer. Search for `yelp.com` to change all three.
- **Hero:** heading, then the call/Yelp buttons right under it (28px gap on desktop, 22px on phones: `.hero h1 + .hero-actions` in `css/styles.css`).
- **Reviews:** the `#reviews` section in `index.html`. Each review is a `<figure class="review">`; copy one to add another. Give long ones `rv-clamp` on the `<blockquote>` plus a `rv-more` button (see Nadine's or Michael's) and they get cut to about 6 lines with a "Read more" toggle. There is deliberately no review markup in the JSON-LD.
- **Phone, address, copy:** edit `index.html` directly. The phone number and directions link also appear in the mobile bottom bar at the end of the page.

## Photos

Original photos are **not** kept in this repo. They live in a folder next to it, `../photo-originals`
(for example `Dev/Chavez/photo-originals` beside `Dev/Chavez/chavez-automotive-site`), so the repo stays small.
The script reads that folder and writes web-ready copies into `images/`: auto-rotated, every bit of metadata
removed (including GPS location), at most 1600px on the long edge, WebP quality 80, plus 704x528 (4:3) film-strip frames.
It also turns `logo.png` into `images/logo.png`.

How the script sorts originals, by file name (or sub-folder name):

- name contains **`story`** → Our Story. A name with `main` goes first (the large frame), then by the number in the name. The first 3 fill the frames; any more go to the gallery.
- name contains **`gallery`** or **`work`** → Our Work, in number order (`gallery_1`, `gallery_2`, ...).
- name contains **`logo`** → the logo (trimmed, 150px tall, transparency kept; the original is not changed).
- anything else is skipped and listed.

### Run the script

```
cd scripts
npm install                 # first time only (installs sharp)
node optimize-images.js     # or: npm run optimize-images
```

It rebuilds `images/story/` and `images/gallery/` from scratch each time and prints what went where, including each frame's size.

### Add more photos to Our Work

Our Work is a film strip that slides slowly right to left (about 50 seconds per full set; change `SECONDS_PER_SET` in `js/main.js`).
It pauses on hover and while a finger is on it, can be dragged, and opens a photo in the lightbox when clicked.
With "reduce motion" turned on in the visitor's system settings it doesn't move and is simply swipeable.

1. Put the original in `../photo-originals`, named with the next number, e.g. `gallery_10.jpg`.
2. Run the script (above).
3. In `index.html`, find the `film-track` and copy the last `<a class="film-frame">` line, changing the number in all three places and the photo number in the alt text:
   ```html
   <a class="film-frame" href="images/gallery/work-10.webp"><img src="images/gallery/thumbs/work-10.webp" width="704" height="528" loading="lazy" decoding="async" alt="Work by Chavez Automotive Repair, photo 10"></a>
   ```
   Use the frame size the script printed for `width`/`height`. Keep `loading="lazy"` off the first 5 so the strip never starts empty.

The loop copy and the lightbox pick up new frames automatically.

### Our Story photos

`images/story/story-1.webp` is the large frame, `story-2.webp` and `story-3.webp` the small ones. All three frames are 4:3, so photos are cropped to fit. To change which part of a photo stays in view, edit its `object-position` in `index.html` (for example `style="object-position:50% 18%"` keeps the top of a tall photo). If a file is missing, its frame shows the built-in navy placeholder instead.

## Logo

`images/logo.png` is made by the script from `../photo-originals/logo.png`. It shows in the header (60px tall on desktop, 44px on phones), at the bottom of the mobile menu and in the footer, replacing the built-in gauge icon and "Chavez Automotive / REPAIR INC." wordmark. If the file is ever missing, the gauge and wordmark come back automatically.

## Favicon

The tab and home-screen icons (`favicon.ico`, `icons/`, `site.webmanifest`) came from a favicon.io export. To replace them, export a new set and overwrite the files with the same names; keep the icon paths in `site.webmanifest` pointing at `/icons/...`.
