# Putting «Полиця» online with your own domain

This guide assumes no prior experience. Expect about 30 minutes of clicking, plus waiting time.

## First, the words you'll see

| Word | What it means here |
|---|---|
| **Repository (repo)** | A folder of code stored on GitHub. Hosting services read your code from it. |
| **GitHub** | A free website that stores code. Think "Google Drive for code". |
| **Hosting / Render** | A computer on the internet that runs your site 24/7. We use **Render** (render.com) because it is free to start and needs almost no setup. |
| **Deploy** | Telling the host to take the latest code and start the site. On Render this happens automatically on every update. |
| **Docker / Dockerfile** | The `Dockerfile` in this project is a recipe: "install Java, compile the code, start the server". Render follows it for you. You never need to run Docker yourself. |
| **Domain** | Your address, e.g. `polytsia.com.ua`. You rent it yearly from a **registrar**. |
| **DNS** | The internet's phone book. A DNS record says "`polytsia.com.ua` lives at Render's computer". |
| **HTTPS** | The padlock in the browser. Render sets it up for free and automatically. |

## How the pieces fit

```
your domain (polytsia.com.ua)  --DNS-->  Render (runs the site)  <--reads code--  GitHub (stores the code)
```

---

## Step 1 — Put the code on GitHub

1. Create a free account at **github.com** (skip if you have one).
2. Click **+** (top right) → **New repository**.
3. Name: `polytsia`. Choose **Private** (only you can see the code) or Public.
4. **Do not** tick "Add a README", ".gitignore" or "license". The repository must be empty.
5. Click **Create repository**.
6. Tell Claude the repository name (e.g. `your-username/polytsia`). Claude uploads ("pushes") the code there for you.

✅ Done when you can see folders like `src` and files like `Dockerfile` on the repository page.

## Step 2 — Start the site on Render

1. Go to **render.com** → **Get Started** → **Sign up with GitHub**. Allow Render to see your repositories (you can allow just `polytsia`).
2. In the Render dashboard click **New +** → **Blueprint**.
3. Pick the `polytsia` repository. Render finds the `render.yaml` file in it, which already contains all the settings.
4. Click **Apply** (or **Deploy Blueprint**).
5. Wait 3–6 minutes while Render builds the site. You can watch the log; it ends with
   `Polytsia store is running at http://localhost:10000`. That line is normal: it is Render's internal address.
6. At the top of the service page you'll see an address like **`https://polytsia.onrender.com`**. Open it. That's your live store!

✅ Done when the store opens at the `.onrender.com` address on your phone.

> **Free plan note:** after 15 minutes without visitors, Render puts the site to sleep. The next visitor waits about 30–60 seconds while it wakes up. Render's paid "Starter" plan keeps it always on. Check Render's pricing page for the current price; you can switch any time under **Settings → Instance Type**.

## Step 3 — Buy a domain

1. Choose a name and check it is free:
   - **`.com.ua`**: open to anyone. Sold by Ukrainian registrars such as **nic.ua**, **imena.ua** or **ukraine.com.ua**.
   - **`.ua`** (without `.com`): requires a registered trademark.
   - **`.com`**: any registrar, e.g. **Namecheap** or **Cloudflare**.
2. Buy it for 1 year. Domains are usually inexpensive, a few hundred hryvnias a year for `.com.ua`; the registrar shows the exact price. You **don't** need their hosting, email or website-builder add-ons.
3. Before printing anything, check that the name «Полиця» is not someone else's trademark.

## Step 4 — Connect the domain to Render

1. In Render, open your **polytsia** service → **Settings** → **Custom Domains** → **Add Custom Domain**.
2. Add both `polytsia.com.ua` and `www.polytsia.com.ua` (use your real domain).
3. Render shows the DNS records to create. Usually:
   - for `www`: a **CNAME** record → `polytsia.onrender.com`
   - for the bare domain: an **A** record → an IP address Render shows you
4. In another tab, open your registrar → your domain → **DNS** / **DNS-записи** / **Керування DNS**. Add exactly those records. Delete any existing "parking" A record for the bare domain (`@`) if the registrar created one.
5. Back in Render, click **Verify**. DNS changes take from 5 minutes up to a few hours. When it's ready, Render issues the HTTPS certificate by itself.
6. Last touch: Render → **Environment** → set **`SITE_URL`** to `https://polytsia.com.ua` → **Save Changes**. This tells Google's sitemap your real address.

✅ Done when `https://polytsia.com.ua` opens your store with a padlock.

## Step 5 — QR code for print

Open **`https://your-domain/qr`** → **Завантажити PNG**. The code points at your domain automatically. There's also a small one in the site footer.

## Step 6 — Tell Google about the site (optional, free)

1. Go to **search.google.com/search-console** → add your domain → follow the steps to prove you own it (it gives you one more DNS record to add, just like Step 4).
2. Under **Sitemaps**, submit `https://your-domain/sitemap.xml`.

---

## Changing the site later

Ask Claude for a change, then ask it to push. Render notices the update on GitHub and redeploys within a few minutes. No other steps are needed.

## Settings you can change in Render → Environment

| Setting | What it does |
|---|---|
| `DEMO_MODE` | `true` shows a yellow "demo store" notice across the top. Set to `false` only after the checklist below is done. |
| `SITE_URL` | Your public address, used in `sitemap.xml` and `robots.txt`. |

## ⚠️ Before selling to real customers

The site is a complete, working storefront, but some parts are **samples** and must be replaced first. That's why the demo notice is on:

1. **Orders reach no one yet.** Orders are kept in the server's memory: nobody is notified, and they disappear when the site restarts or sleeps. Needed: a database plus an email or Telegram notification to you for every order, and a simple admin page.
2. **Payments.** "Карткою онлайн" doesn't charge cards yet. Needed: a payment provider account (LiqPay, WayForPay, Monobank acquiring, …).
3. **Reviews and ratings are generated examples.** Remove them and start from zero; the review form already collects real ones.
4. **Company details are placeholders:** phone `0 800 30 77 77`, `support@polytsia.ua`, the Kyiv office address, the store count and customer statistics on the "Про компанію" page. Replace them with your real details.
5. **Products and prices** are sample data in `src/main/java/ua/polytsia/data/CatalogData.java`.
6. **Legal pages:** a public offer (публічна оферта) and a privacy policy are required for Ukrainian online stores.

Claude can do items 1, 3, 4 and 5 and prepare 2 and 6 for you. Just ask.
