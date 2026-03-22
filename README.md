# GadgetPriceBD – Mobile Shop

A Next.js application for mobile phone prices, specifications and reviews in Bangladesh.

## Folder Structure

```
.
├── phones/                    # Markdown data files, organised by brand
│   ├── samsung/
│   │   ├── samsung-galaxy-s24-ultra.md
│   │   └── samsung-galaxy-s24.md
│   ├── apple/
│   │   └── iphone-15-pro-max.md
│   ├── xiaomi/ ...
│   ├── oppo/   ...
│   ├── oneplus/ ...
│   ├── realme/ ...
│   └── vivo/   ...
│
├── public/
│   └── images/
│       └── phones/            # Phone images, organised by brand
│           ├── samsung/
│           │   └── samsung-galaxy-s24-ultra.svg
│           ├── apple/
│           │   └── iphone-15-pro-max.svg
│           └── placeholder-phone.svg
│
├── scripts/
│   └── scrape.py              # Python scraper (run locally)
│
├── app/                       # Next.js App Router
│   ├── page.tsx               # Homepage
│   ├── phones/page.tsx        # Phone listing with sort/filter
│   ├── phones/[slug]/page.tsx # Phone detail
│   ├── brands/[brand]/page.tsx # Brand listing
│   ├── tablets/page.tsx       # Tablets (coming soon)
│   ├── watches/page.tsx       # Watches (coming soon)
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── Navbar.tsx             # Category + brand dropdown nav
│   ├── PhoneCard.tsx          # Phone card with price-range badge
│   └── SearchFilter.tsx       # Search, sort, price-range & brand filter
│
└── lib/
    ├── phones.ts              # Read brand-subfolder MD files
    └── price.ts               # Price parsing & range labels
```

---

## Scraper — `scripts/scrape.py`

Downloads phone data and saves everything under **brand subfolders**:

- MD files:  `phones/{brand}/{slug}.md`
- Images:    `public/images/phones/{brand}/{slug}.jpg`

### Requirements

```bash
pip install requests beautifulsoup4 lxml
```

### Usage (run from project root)

```bash
# Scrape all phones
python scripts/scrape.py

# First 20 only (great for testing)
python scripts/scrape.py --limit 20

# Single phone by URL slug
python scripts/scrape.py --slug samsung-galaxy-s25

# Set category label (default: phone)
python scripts/scrape.py --category phone

# Custom delay between requests
python scripts/scrape.py --delay 2
```

---

## Frontend — Next.js

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

### Routes

| Route | Description |
|---|---|
| `/` | Homepage with category cards & featured phones |
| `/phones` | Full phone listing, sort by price, filter by brand / price range |
| `/phones/[slug]` | Phone detail page |
| `/brands/[brand]` | All phones for a brand |
| `/tablets` | Tablets (coming soon) |
| `/watches` | Watches (coming soon) |
| `/sitemap.xml` | Auto-generated SEO sitemap |
| `/robots.txt` | Robots file |

### Price Ranges

| Label | BDT Range |
|---|---|
| Budget | < ৳30,000 |
| Mid-range | ৳30,000 – ৳80,000 |
| Flagship | > ৳80,000 |

### Environment

Copy `.env.local.example` → `.env.local` if you plan to add a backend API for new devices.

---

## Adding Phones Manually

Create `phones/{brand}/{slug}.md`:

```markdown
---
name: "Samsung Galaxy S25"
slug: "samsung-galaxy-s25"
brand: "Samsung"
price: "৳ 1,20,000"
image: "/images/phones/samsung/samsung-galaxy-s25.jpg"
released: "2025"
category: "phone"
source: "md"
tags: ["5G", "50MP"]
---

Description here.

## Specifications

| Feature | Details |
|---|---|
| Display | 6.2-inch AMOLED |
```

Place the image at `public/images/phones/samsung/samsung-galaxy-s25.jpg`.
