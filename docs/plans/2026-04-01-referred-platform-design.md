# REFERRED — Platform Design Document

**Date:** 2026-04-01
**Branch:** Doctor
**Status:** Approved
**Network:** BACK-ONLINE

---

## 1. Vision

REFERRED is the BACK-ONLINE network's first public brand. A curated affiliate marketplace and AI-powered advisor for people who are excited about AI and technology but overwhelmed by the pace of change — and for anyone who wants the best deal possible.

Two value propositions in one:
1. **"I'm lost, help me figure out what I need"** — the agentic interviewer
2. **"I know what I want, show me the best deal"** — the searchable catalog

The interviewer converts group 1 into group 2. The catalog earns affiliate revenue. The conversation data (aggregate, anonymised) becomes strategic intelligence. The brand builds trust for the network.

**Referral codename:** "BACK-ONLINE told me to tell you they referred me"

---

## 2. Architecture (Option C — Split Secure)

```
                    +------------------+
                    |   Netlify CDN    |
                    |  (Static React)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v----------+     +------------v-----------+
    |     Supabase       |     |   AI Backend           |
    |  - Catalog DB      |     |   (Railway/Fly.io)     |
    |  - Auth (admin)    |     |   - Own Postgres DB    |
    |  - Edge Functions  |     |   - Encrypted convos   |
    |  - RLS policies    |     |   - Rate limited       |
    +--------------------+     +------------------------+
```

**Why split:** Conversation data is strategically valuable. Isolating it from the public catalog means a breach of one doesn't compromise the other. The AI backend scales independently.

---

## 3. Workstreams

### W1 — Affiliate Research & Outreach

**Categories:**

| Category | Examples |
|----------|---------|
| AI Platforms | OpenAI, Anthropic, Google Cloud AI, AWS Bedrock, Azure AI, Hugging Face, Replicate, Together AI, Groq, Mistral |
| AI Software/Tools | Cursor, Replit, GitHub Copilot, Notion AI, Jasper, Midjourney, RunwayML, ElevenLabs, Descript, Otter.ai |
| Cloud/Infra | AWS, GCP, Azure, Cloudflare, Vercel, Netlify, DigitalOcean, Hetzner, OVH, Linode |
| Hardware — Compute | NVIDIA GPUs, AMD GPUs/CPUs, Intel, Apple Silicon, Google Coral TPU, Jetson Orin, Raspberry Pi 5 |
| Hardware — Audio | Rode (NT-USB, PodMic), Blue Yeti, Shure (MV7, SM7B), Focusrite Scarlett, Elgato Wave |
| Hardware — Video | Logitech (Brio, C920), Elgato Facecam, Insta360, OBS-compatible capture cards |
| Hardware — Home Hubs | Amazon Echo, Google Nest Hub, Apple HomePod, Home Assistant hardware |
| Hardware — Networking | Ubiquiti UniFi, TP-Link Omada, Synology NAS, TrueNAS, Tailscale |
| Hardware — Amplifiers & Speakers | Sonos, JBL, Bose, studio monitors, PA systems |
| Financial Services | Starling, Monzo, Wise, Revolut, trade associations, professional indemnity insurance |
| Dev Tools | JetBrains, Docker, Postman, Linear, Supabase, PlanetScale, Neon, Turso |

**Amazon Associates Integration:**
- Direct product links via Amazon Associates (already authenticated)
- Hardware categories prioritise Amazon links where commission is available
- Product URLs follow `https://www.amazon.co.uk/dp/ASIN?tag=ASSOCIATE-TAG` format
- Specific ASINs curated per product recommendation
- Amazon links embedded in catalog data alongside direct-vendor affiliate links
- Where both exist, show both: "Buy direct" vs "Buy on Amazon"

**Deliverables:**
- `data/referred-catalog.csv` — full catalog with columns:
  - `company, category, subcategory, product_name, affiliate_url, amazon_url, amazon_asin, commission_rate, cookie_duration, open_program, pitch_likelihood_pct, region_us, region_eu, region_cn, region_row, credit_rating, google_review_score, beginner_friendly, modality, price_range_low, price_range_high, currency, notes`
- Draft pitch emails (Gmail-ready) for companies without open programs
- Contact database: company, key contact name, email, role

### W2 — Catalog Data Layer (Supabase)

**Schema:**

```sql
-- Core catalog
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  category text NOT NULL,
  subcategory text,
  website_url text,
  founded_year int,
  hq_country text,
  operations_regions text[], -- ['US','EU','CN','ROW']
  credit_rating text, -- e.g. 'AAA', 'BBB', 'NR'
  google_review_score numeric(2,1),
  google_review_count int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  modality text NOT NULL, -- compute, audio, video, networking, storage, software, financial, hub
  price_range_low numeric,
  price_range_high numeric,
  currency text DEFAULT 'USD',
  beginner_friendly boolean DEFAULT false,
  tags text[],
  regions text[], -- ['US','EU','CN','ROW']
  created_at timestamptz DEFAULT now()
);

CREATE TABLE affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  product_id uuid REFERENCES products(id),
  url text NOT NULL,
  amazon_url text,
  amazon_asin text,
  link_type text NOT NULL, -- 'direct_affiliate', 'amazon_associate', 'referral_code'
  commission_rate numeric,
  cookie_duration_days int,
  status text DEFAULT 'active', -- active, pending, pitched, declined
  region text, -- 'US','EU','CN','ROW' or null for global
  created_at timestamptz DEFAULT now()
);

CREATE TABLE pitch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  contact_name text,
  contact_email text,
  contact_role text,
  email_draft text,
  sent_date timestamptz,
  status text DEFAULT 'draft', -- draft, sent, responded, accepted, declined
  likelihood_pct int, -- 0-100 judgment call
  notes text,
  created_at timestamptz DEFAULT now()
);
```

**GitHub CSV:** Auto-exported from Supabase via edge function, committed to `data/referred-catalog.csv`.

### W3 — Frontend (Netlify)

**Tech:** React 18 + Vite + Tailwind CSS + shadcn/ui
**Domain:** referred.netlify.app (upgrade to custom domain later)

**Pages:**

1. **Home** (`/`)
   - Hero: "Stop drowning in AI news. Start building."
   - Subtitle: "The best deals. The best tools. The best path forward."
   - Featured deals carousel
   - Category grid (8 categories with icons)
   - "Talk to our AI Advisor" CTA
   - Tip jar (Stripe)

2. **Catalog** (`/catalog`)
   - Search bar (full-text across company names, products, tags)
   - Filter sidebar:
     - Category (multi-select)
     - Region toggle: US | EU | China | ROW
     - Price range slider
     - Credit rating minimum
     - Beginner-friendly toggle
     - Modality (compute/audio/video/networking/etc.)
   - Sort: rating, price low-high, price high-low, newest, commission value
   - Grid/list view toggle
   - Each card: company logo, product name, price range, credit badge, review stars, "Get Deal" CTA

3. **Product Detail** (`/product/:slug`)
   - Company info, credit rating badge, Google review stars
   - Product description, specs, modality tags
   - Affiliate link CTA: "Buy Direct" + "Buy on Amazon" (where available)
   - Related products
   - Contextual tip: "This research saved you hours — drop us a thank you"

4. **AI Advisor** (`/advisor`)
   - Full-page chat interface
   - Region selector prominent at top
   - Progress indicator: "Understanding you → Building your stack → Here's your plan"
   - n00b-to-pro confidence meter
   - Output: recommended stack with total cost, all affiliate links

5. **Stack Builder** (`/stack/:id`)
   - Shareable URL of a recommended stack
   - Itemised list with swap-out options per region
   - Total cost calculator
   - "Buy all on Amazon" mega-link where possible
   - Export as PDF / share link

6. **About** (`/about`)
   - BACK-ONLINE network story
   - Trust signals
   - All payment methods
   - "BACK-ONLINE told me to tell you they referred me" explanation

**Region Toggle:**
- Persistent bar at top of every page: `US | EU | China | Rest of World`
- Filters catalog, adjusts pricing currency, changes AI advisor recommendations
- Stored in localStorage, respects URL params (`?region=eu`)

### W4 — Agentic Interviewer

**Backend:** Railway or Fly.io, own Postgres DB, Node.js/Deno service.

**Conversation Flow:**
1. "What are you trying to build?" — open-ended
2. Classify intent: home lab | business infra | creative tools | dev stack | mixed
3. Budget range
4. Region (pre-filled from toggle)
5. Experience level (self-assessed + inferred from language)
6. Modalities needed: compute, audio, video, networking, storage, software
7. Specific use cases: "I want to run local LLMs" / "I want to podcast" / "I want a smart home"
8. Generate stack from catalog, with:
   - Estimated total cost
   - Per-item affiliate links (direct + Amazon)
   - n00b confidence score (1-10)
   - "Here's what a beginner would combo" alternative stack
   - "Here's what a pro would do differently" comparison

**n00b Calculator:**
- Rates experience 1-10 based on answers
- 1-3: Simple stacks, more guides, hand-holding language, beginner bundles
- 4-6: Balanced recommendations, some advanced options flagged
- 7-10: Raw specs, bulk deals, prosumer gear, minimal explanation

**Data Security:**
- Conversations encrypted at rest (AES-256)
- No PII stored by default
- 30-day auto-purge unless user opts in
- Rate limited: 10 conversations/hour per IP
- API key auth between Netlify frontend and AI backend
- Aggregate analytics only (no individual conversation export)

### W5 — Payment & Monetization

| Method | Provider | Use Case | Placement |
|--------|----------|----------|-----------|
| One-time tips | Stripe | Quick thank-you | Floating CTA every page, post-recommendation |
| Recurring support | GoCardless | UK/EU monthly supporters | /about, supporter badge |
| Bitcoin | BTC + Lightning Network | Crypto-native users | Footer QR, /about |
| Direct transfer | Bank details | Large/corporate supporters | /about only |
| Casual tips | Buy Me a Coffee | Low-friction small tips | Floating widget |
| Universal | PayPal | Fallback for everyone | Footer, /about |
| Dev community | GitHub Sponsors | Developer audience | Repo README, /about |

**Contextual placement rules:**
- After AI advisor recommendation: Stripe tip + "This saved you X hours"
- Product detail pages: small "support our research" in sidebar
- Catalog browsing: unobtrusive footer tip jar
- /about: full showcase of all payment methods
- Never interruptive — always optional, always grateful

### W6 — Security Architecture

| Layer | Implementation |
|-------|---------------|
| Frontend | Netlify CDN, CSP headers, no secrets in client bundle |
| Catalog API | Supabase RLS — public read, admin-only write |
| Admin Auth | Supabase Auth, MFA required for catalog management |
| AI Backend | Isolated network, own DB, encrypted at rest |
| API Auth | API key + rate limiting between frontend ↔ AI backend |
| Conversations | AES-256 encryption, 30-day auto-purge, no PII default |
| Monitoring | Error tracking, anomaly detection on API usage patterns |

---

## 4. Amazon Associates Integration

Since Amazon Associates is already authenticated:
- Hardware recommendations include direct Amazon product links with associate tag
- Each product in the catalog can have both a `affiliate_url` (vendor direct) and `amazon_url` (Amazon Associates)
- UI shows both options: "Buy from [Vendor]" and "Buy on Amazon"
- Amazon links are prioritised for hardware categories where Amazon typically has competitive pricing
- Product pages show real-time-ish Amazon pricing where available (via Product Advertising API)
- Stack Builder includes a "Buy all on Amazon" convenience link that builds a cart

---

## 5. The Five Secret Zingers

These are the little big things that make REFERRED zing:

### Zinger 1: "The Ticker"
A real-time scrolling ticker across the top of the site showing the latest AI deal drops, price cuts, and new affiliate programs going live. Like a stock ticker but for deals. Updates via Supabase realtime subscriptions. Creates urgency without being pushy. "NVIDIA RTX 5090 just dropped 12% on Amazon" scrolling past makes people click.

### Zinger 2: "Stack Battles"
Anonymous, aggregated comparison: "This week, 73% of home labbers chose AMD over NVIDIA for local inference." Real data from the AI advisor conversations (fully anonymised). Social proof that's actually useful. Updated weekly. Shows trends over time. People love seeing what everyone else picked — and arguing about it.

### Zinger 3: "The Time Machine"
A toggle that shows "What this stack would have cost 6 months ago" vs now. Price history tracking on key products. Makes people feel smart when prices dropped ("you saved 34% by waiting") or creates urgency when they're rising. Historical price data scraped/tracked over time.

### Zinger 4: "Easter Egg Deals"
Hidden deals unlocked by specific interactions — type a konami code on the keyboard, find a hidden link in the footer, or ask the AI advisor "what's the secret?" and it reveals exclusive discount codes or limited-time affiliate bonuses not shown on the main catalog. Gamification that rewards curious users. Shareable bragging rights: "I found the Easter Egg deal."

### Zinger 5: "The Prophecy Engine"
At the bottom of every AI advisor recommendation: "Based on current trajectories, in 6 months your stack will be worth X% more/less, and here's what we'd recommend swapping." Forward-looking guidance that makes people bookmark and come back. Builds the habit loop. Uses trend data from Stack Battles + price history from Time Machine. Not financial advice — just pattern recognition. "The GPU you're looking at typically drops 20% in Q3. Consider waiting, or grab this alternative now."

---

## 6. Execution Architecture (Parallel Agent Swarms)

### Morning Block 1 (Parallel — 4 agent swarms):

**Swarm A: Affiliate Research**
- Web research across all categories
- Identify open affiliate programs
- Collect commission rates, cookie durations
- Note Amazon ASINs for hardware products
- Build initial CSV

**Swarm B: Database Architect**
- Create Supabase schema (migrations)
- Set up RLS policies
- Create edge functions for CSV export
- Set up admin auth

**Swarm C: Frontend Scaffold**
- React + Vite + Tailwind + shadcn/ui project
- Netlify deployment config
- Page routing structure
- Region toggle component
- Base layout with header/footer

**Swarm D: Outreach Drafts**
- Draft pitch emails for non-open programs
- Research key contacts (public info only)
- Create Gmail-ready drafts
- Assign pitch_likelihood_pct to each

### Morning Block 2 (Parallel — 4 agents, after Block 1):

**Agent E: Data Seeding**
- Parse CSV into Supabase
- Create Amazon product links
- Seed initial catalog

**Agent F: Search & Filter UI**
- Catalog page with all filters
- Product detail pages
- Search implementation
- Region toggle wiring

**Agent G: Payment Integration**
- Stripe checkout/tips
- Bitcoin address + QR generation
- GoCardless setup
- PayPal button
- Buy Me a Coffee widget
- GitHub Sponsors link

**Agent H: AI Backend Scaffold**
- Railway/Fly.io project setup
- Conversation DB schema
- API endpoints
- LLM integration scaffold
- Encryption layer

### Afternoon Block (Sequential):

1. Wire frontend → Supabase catalog
2. Wire frontend → AI backend
3. Implement the 5 zingers
4. Security hardening (CSP, RLS audit, rate limiting)
5. Deploy to Netlify
6. End-to-end testing
7. Final review + launch checklist

---

## 7. Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Hosting | Netlify (free tier) |
| Database | Supabase (catalog) + Isolated Postgres (conversations) |
| AI Backend | Railway or Fly.io, Node.js/Deno |
| Auth | Supabase Auth (admin), API keys (service-to-service) |
| Payments | Stripe, GoCardless, PayPal, Bitcoin, Buy Me a Coffee, GitHub Sponsors |
| Affiliate | Direct vendor programs + Amazon Associates |
| CI/CD | GitHub → Netlify auto-deploy |
| Monitoring | Supabase dashboard, Railway logs, Sentry |

---

## 8. Success Metrics

- Catalog size: 200+ products at launch
- Affiliate programs: 50+ active, 30+ pitched
- AI Advisor conversations: track volume, completion rate, stack generation rate
- Revenue: affiliate clicks → conversions, tip/donation volume
- Return visits: bookmarks, Stack Battle engagement, Prophecy Engine return rate
- Brand: "BACK-ONLINE told me" recognition in pitch responses
