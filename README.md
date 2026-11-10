# Полиця — інтернет-магазин

A full e-commerce storefront in the style of a large Ukrainian marketplace: white retail layout, green accent, dense product grids.
The backend is Java 21 with **no dependencies** (the JDK's built-in HTTP server). The frontend is a vanilla JavaScript SPA built from ES modules, with **no build step**.

## Put it online

See **[DEPLOY.md](DEPLOY.md)**: a step-by-step guide to GitHub, Render and your own domain, written for beginners.

## Run

Requires JDK 21+.

```bash
./run.sh                 # compiles with javac and starts http://localhost:8080
PORT=9000 ./run.sh       # another port
```

Or with Maven:

```bash
mvn package && java -jar target/polytsia.jar
```

With Docker (same as the hosting service):

```bash
docker build -t polytsia . && docker run -p 8080:8080 polytsia
```

Static files are served from `src/main/resources/static` on the classpath. When started with `run.sh`, frontend edits show up on reload with no restart.

## What's inside

| Area | Features |
|---|---|
| Header | Sticky dark header, catalog mega-menu, search with live suggestions, keyboard navigation and recent searches, account / wishlist / cart with badges, promo navigation strip |
| Home | Hero carousel (autoplay with progress, arrows, dots, swipe, keyboard, pauses on hover/focus, honours reduced motion), category sidebar, popular categories, featured / bestsellers / discounts rails, promo tiles, recommended grid, recently viewed, brands |
| Catalog | `/catalog`, `/catalog/:category`, `/search?q=`; category navigation, price (inputs + dual range), brand (with search), rating, availability and discount filters with live facet counts; active-filter chips; 6 sort orders; pagination plus "Показати ще"; URL-synced state (back/forward works); slide-in filter sheet on mobile |
| Product | Gallery with thumbnails, swipe and fullscreen lightbox; price, discount and installment; availability; delivery options with dates; specs; rating histogram; paginated reviews; review submission; similar and recently viewed; sticky section tabs; mobile buy bar |
| Cart & checkout | Cart modal and `/cart` page with quantity controls, free-delivery progress and server-side pricing; checkout with client and server validation, delivery methods that update the cost, payment methods; order confirmation page |
| QR code | `/qr`: printable QR code for the store with the logo in the centre. Points to the address the site is opened at, so it is correct on any domain. Change the link or pick a preset (home, sales, bestsellers); download PNG (1024 px) or SVG; print; copy the link. A small version sits in the footer on desktop. |
| Other | Wishlist, sign-in modal, account with order history and profile editing, info pages (delivery, payment, installments, warranty, returns, about, contacts), 404 page, toasts, fly-to-cart animation, loading skeletons, page transitions, mobile side menu and bottom tab bar |

## Structure

```
src/main/java/ua/polytsia/
  App.java                     server bootstrap (PORT env, virtual threads)
  data/CatalogData.java        categories, 67 products, banners (seed data)
  model/                       Product, Category, Spec, Review, Banner, Stock
  service/CatalogService.java  listing, filters, facets, search (with Cyrillic aliases), product details
  service/ReviewService.java   deterministic review history + submitted reviews
  service/OrderService.java    cart pricing, delivery cost, order validation & placement
  web/ApiHandler.java          JSON API
  web/StaticHandler.java       static files + SPA fallback
  util/Json.java               tiny JSON writer/parser
src/main/resources/static/
  index.html, css/{base,layout,components,pages}.css
  js/core/        router, store (localStorage), api client, DOM/format helpers, icons
  js/components/  header, footer, side menu, product card & rails, carousel, cart, modal, toast, auth
  js/pages/       home, catalog, product, checkout (cart/checkout/order), misc (wishlist/account/info/404)
  img/            product and banner photos
```

## API

| Method | Path | |
|---|---|---|
| GET | `/api/home` | Homepage sections |
| GET | `/api/categories` | Category tree with counts |
| GET | `/api/products` | `category, q, brand (a,b), minPrice, maxPrice, rating, available=1, onSale=1, sort, page, size, ids` → items, facets, paging |
| GET | `/api/products/{id}` | Product details |
| GET/POST | `/api/products/{id}/reviews` | Review page / submit review |
| GET | `/api/search/suggest?q=` | Typeahead |
| POST | `/api/cart/quote` | `{items:[{id,qty}], delivery}` → priced cart |
| POST | `/api/orders` | Place order (422 with per-field errors) |
| GET | `/api/orders/{number}` | Order details |

Orders and submitted reviews are kept in memory and reset when the server restarts. Cart, wishlist, profile and history live in the browser's localStorage.

## Notes

- The brand «Полиця», its logo and all copy are original. Product names refer to real manufacturers' products, as in any retailer's catalog.
- QR codes are generated in the browser by the vendored [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 (MIT), in `js/vendor/qrcode.js`.
- Product and banner photos are from [Unsplash](https://unsplash.com) (Unsplash License).
