# REFERRED Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy REFERRED — the BACK-ONLINE network's curated affiliate marketplace + AI advisor for AI-overwhelmed enthusiasts seeking the best deals.

**Architecture:** Split-secure (Option C). Static React SPA on Netlify, catalog data in Supabase, isolated AI backend on Railway/Fly.io with its own encrypted Postgres. Amazon Associates links embedded alongside direct vendor affiliates.

**Tech Stack:** React 18, Vite, Tailwind CSS, shadcn/ui, Supabase (catalog DB + auth + edge functions), Railway (AI backend), Stripe, GoCardless, PayPal, Bitcoin/Lightning, Netlify (hosting).

**Design Doc:** `docs/plans/2026-04-01-referred-platform-design.md`

---

## Execution Architecture

This plan is designed for **parallel agent swarm execution**. Tasks are grouped into independent swarms that can run simultaneously. Dependencies between swarms are noted explicitly.

```
BLOCK 1 (Parallel — no dependencies):
  Swarm A: Affiliate Research → CSV
  Swarm B: Supabase Schema → Migrations
  Swarm C: Frontend Scaffold → Netlify
  Swarm D: Outreach Email Drafts → Gmail

BLOCK 2 (Parallel — depends on Block 1):
  Agent E: Seed Data → Supabase (needs A + B)
  Agent F: Search/Filter UI (needs C)
  Agent G: Payment Integrations (needs C)
  Agent H: AI Backend Scaffold (independent)

BLOCK 3 (Sequential — depends on Block 2):
  Wire frontend ↔ Supabase
  Wire frontend ↔ AI backend
  Implement 5 Zingers
  Security hardening
  Deploy + test
```

---

## SWARM A: Affiliate Research (Block 1)

**Goal:** Research all affiliate programs across 11 categories, build the master CSV, identify Amazon ASINs for hardware.

**Output:** `data/referred-catalog.csv` + `data/referred-contacts.csv`

### Task A1: Create data directory and CSV templates

**Files:**
- Create: `data/referred-catalog.csv`
- Create: `data/referred-contacts.csv`
- Create: `data/README.md`

**Step 1: Create the data directory**

```bash
mkdir -p data
```

**Step 2: Create the catalog CSV with headers**

```csv
company,category,subcategory,product_name,affiliate_url,amazon_url,amazon_asin,commission_rate,cookie_duration_days,open_program,pitch_likelihood_pct,region_us,region_eu,region_cn,region_row,credit_rating,google_review_score,beginner_friendly,modality,price_range_low,price_range_high,currency,notes
```

**Step 3: Create the contacts CSV with headers**

```csv
company,contact_name,contact_email,contact_role,pitch_status,likelihood_pct,notes
```

**Step 4: Create data README**

```markdown
# REFERRED Data

## referred-catalog.csv
Master catalog of all affiliate products, deals, and programs tracked by REFERRED.

## referred-contacts.csv
Contact database for affiliate outreach. Contains publicly available contact information only.

## Usage
This data is mirrored from Supabase. The CSV serves as a portable resource for community use and backup.
```

**Step 5: Commit**

```bash
git add data/
git commit -m "feat: add data directory with CSV templates for REFERRED catalog"
```

### Task A2: Research AI Platform affiliate programs

**Files:**
- Modify: `data/referred-catalog.csv`
- Modify: `data/referred-contacts.csv`

**Step 1: Research each AI platform**

Use web search to find affiliate/referral programs for:
- OpenAI (API credits referral)
- Anthropic (API credits)
- Google Cloud AI (GCP partner/referral credits)
- AWS Bedrock (AWS partner network)
- Azure AI (Microsoft partner)
- Hugging Face (Pro/Enterprise referral)
- Replicate (referral program)
- Together AI (referral credits)
- Groq (developer program)
- Mistral (API referral)

For each, record: affiliate URL, commission rate, cookie duration, whether program is open, and a pitch_likelihood_pct for closed programs.

**Step 2: Add rows to catalog CSV**

Add one row per product/service per company. Include regions where available.

**Step 3: Add contacts for closed programs to contacts CSV**

Research publicly listed partnership/business development contacts.

**Step 4: Commit**

```bash
git add data/
git commit -m "feat: add AI platform affiliate data to catalog"
```

### Task A3: Research AI Software/Tools affiliate programs

**Files:**
- Modify: `data/referred-catalog.csv`
- Modify: `data/referred-contacts.csv`

**Step 1: Research each AI tool**

- Cursor, Replit, GitHub Copilot, Notion AI, Jasper, Midjourney, RunwayML, ElevenLabs, Descript, Otter.ai

**Step 2: Add to CSVs, commit**

```bash
git commit -m "feat: add AI software/tools affiliate data to catalog"
```

### Task A4: Research Cloud/Infrastructure affiliate programs

**Files:**
- Modify: `data/referred-catalog.csv`

**Step 1: Research**

- AWS, GCP, Azure, Cloudflare, Vercel, Netlify, DigitalOcean, Hetzner, OVH, Linode
- Most cloud providers have referral credit programs. Document credit amounts and terms.

**Step 2: Add to CSV, commit**

```bash
git commit -m "feat: add cloud/infra affiliate data to catalog"
```

### Task A5: Research Hardware — Compute (with Amazon ASINs)

**Files:**
- Modify: `data/referred-catalog.csv`

**Step 1: Research compute hardware**

- NVIDIA GPUs (RTX 4090, 5090, A100, H100 where consumer-available)
- AMD GPUs/CPUs (RX 7900 XTX, Ryzen 9, Threadripper)
- Intel (Arc GPUs, Core Ultra)
- Apple Silicon (Mac Mini M4, Mac Studio)
- Google Coral TPU
- NVIDIA Jetson Orin
- Raspberry Pi 5

**Step 2: Find Amazon ASINs**

For each hardware product, search Amazon and record the ASIN from the product URL (`/dp/ASIN`). Format Amazon URLs as `https://www.amazon.co.uk/dp/{ASIN}?tag=ASSOCIATE-TAG`.

**Step 3: Check vendor direct affiliate programs**

NVIDIA, AMD, Intel direct purchase programs. Raspberry Pi authorized resellers.

**Step 4: Add to CSV, commit**

```bash
git commit -m "feat: add compute hardware with Amazon ASINs to catalog"
```

### Task A6: Research Hardware — Audio/Video/Peripherals (with Amazon ASINs)

**Files:**
- Modify: `data/referred-catalog.csv`

**Step 1: Research audio gear**

- Rode NT-USB Mini, PodMic, Wireless GO II
- Blue Yeti, Yeti X
- Shure MV7, SM7B
- Focusrite Scarlett 2i2, Solo
- Elgato Wave:3

**Step 2: Research video gear**

- Logitech Brio 4K, C920, C922
- Elgato Facecam, Cam Link 4K
- Insta360 Link
- Capture cards (Elgato HD60 X, AVerMedia)

**Step 3: Find Amazon ASINs for all, add to CSV, commit**

```bash
git commit -m "feat: add audio/video hardware with Amazon ASINs to catalog"
```

### Task A7: Research Hardware — Home Hubs, Networking, Speakers (with Amazon ASINs)

**Files:**
- Modify: `data/referred-catalog.csv`

**Step 1: Home hubs**

- Amazon Echo (various), Google Nest Hub, Apple HomePod, Home Assistant Yellow/Green

**Step 2: Networking**

- Ubiquiti UniFi (Dream Machine, access points), TP-Link Omada
- Synology NAS (DS224+, DS923+), TrueNAS hardware
- Tailscale (software — referral program)

**Step 3: Speakers/Amplifiers**

- Sonos (Era 100, Era 300, Arc), JBL (Charge, Flip), Bose (SoundLink)
- Studio monitors (KRK Rokit, Yamaha HS5)
- PA systems for events

**Step 4: Find ASINs, add to CSV, commit**

```bash
git commit -m "feat: add home hubs, networking, speakers with Amazon ASINs to catalog"
```

### Task A8: Research Financial Services & Dev Tools

**Files:**
- Modify: `data/referred-catalog.csv`
- Modify: `data/referred-contacts.csv`

**Step 1: Financial services**

- Starling (referral program), Monzo (referral), Wise (referral credits)
- Revolut (referral program)
- Trade associations (identify relevant ones)
- Professional indemnity insurance (comparison sites with affiliate programs)

**Step 2: Dev tools**

- JetBrains (affiliate program), Docker (enterprise referral)
- Postman, Linear, Supabase, PlanetScale, Neon, Turso

**Step 3: Add to CSVs, commit**

```bash
git commit -m "feat: add financial services and dev tools to catalog"
```

### Task A9: Final catalog review and validation

**Files:**
- Modify: `data/referred-catalog.csv`

**Step 1: Validate all rows**

- Check all URLs are well-formed
- Ensure every hardware product has an Amazon ASIN where available
- Verify region flags are set correctly
- Ensure credit_rating and google_review_score are populated where data exists
- Set beginner_friendly flags appropriately
- Verify modality tags are consistent

**Step 2: Sort CSV by category, then company name**

**Step 3: Commit final validated catalog**

```bash
git commit -m "feat: finalize and validate REFERRED catalog — A9 complete"
```

---

## SWARM B: Database Architecture (Block 1)

**Goal:** Create Supabase schema, RLS policies, edge functions, admin auth.

**Requires:** Access to the Supabase project.

### Task B1: List Supabase projects and identify target

**Step 1: List projects**

Use `list_projects` to find the correct Supabase project or create a new one for REFERRED.

**Step 2: Decide — use existing project or create new**

If creating new: use `create_project` with name "referred" in the appropriate org.

### Task B2: Create companies table

**Step 1: Apply migration**

```sql
CREATE TABLE public.companies (
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
  operations_regions text[] DEFAULT '{}',
  credit_rating text DEFAULT 'NR',
  google_review_score numeric(2,1),
  google_review_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_companies_category ON public.companies(category);
CREATE INDEX idx_companies_slug ON public.companies(slug);
```

**Step 2: Verify table exists**

```sql
SELECT * FROM public.companies LIMIT 0;
```

### Task B3: Create products table

**Step 1: Apply migration**

```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  modality text NOT NULL CHECK (modality IN ('compute','audio','video','networking','storage','software','financial','hub')),
  price_range_low numeric,
  price_range_high numeric,
  currency text DEFAULT 'USD',
  beginner_friendly boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  regions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_products_modality ON public.products(modality);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_regions ON public.products USING GIN(regions);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
```

### Task B4: Create affiliate_links table

**Step 1: Apply migration**

```sql
CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  amazon_url text,
  amazon_asin text,
  link_type text NOT NULL CHECK (link_type IN ('direct_affiliate','amazon_associate','referral_code')),
  commission_rate numeric,
  cookie_duration_days int,
  status text DEFAULT 'active' CHECK (status IN ('active','pending','pitched','declined')),
  region text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_affiliate_links_product ON public.affiliate_links(product_id);
CREATE INDEX idx_affiliate_links_status ON public.affiliate_links(status);
```

### Task B5: Create pitch_log table

**Step 1: Apply migration**

```sql
CREATE TABLE public.pitch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_name text,
  contact_email text,
  contact_role text,
  email_draft text,
  sent_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','responded','accepted','declined')),
  likelihood_pct int CHECK (likelihood_pct >= 0 AND likelihood_pct <= 100),
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### Task B6: Create price_history table (for Time Machine zinger)

**Step 1: Apply migration**

```sql
CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  source text, -- 'amazon', 'vendor', 'manual'
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_price_history_product ON public.price_history(product_id);
CREATE INDEX idx_price_history_recorded ON public.price_history(recorded_at);
```

### Task B7: Create stack_battles table (for Stack Battles zinger)

**Step 1: Apply migration**

```sql
CREATE TABLE public.stack_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- 'home_lab', 'business_infra', 'creative', 'dev_stack'
  choice_a_product_id uuid REFERENCES public.products(id),
  choice_b_product_id uuid REFERENCES public.products(id),
  choice_a_count int DEFAULT 0,
  choice_b_count int DEFAULT 0,
  week_starting date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(choice_a_product_id, choice_b_product_id, week_starting)
);
```

### Task B8: Create deal_ticker table (for The Ticker zinger)

**Step 1: Apply migration**

```sql
CREATE TABLE public.deal_ticker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id),
  headline text NOT NULL, -- e.g. "NVIDIA RTX 5090 just dropped 12% on Amazon"
  link_url text,
  is_active boolean DEFAULT true,
  priority int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_deal_ticker_active ON public.deal_ticker(is_active) WHERE is_active = true;

-- Enable realtime for the ticker
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_ticker;
```

### Task B9: Create easter_egg_deals table (for Easter Egg zinger)

**Step 1: Apply migration**

```sql
CREATE TABLE public.easter_egg_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL CHECK (trigger_type IN ('konami','hidden_link','advisor_secret','url_param')),
  trigger_value text, -- the konami sequence, hidden link id, secret phrase
  product_id uuid REFERENCES public.products(id),
  discount_code text,
  description text,
  is_active boolean DEFAULT true,
  unlocked_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
```

### Task B10: Set up RLS policies

**Step 1: Enable RLS on all tables**

```sql
-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_ticker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.easter_egg_deals ENABLE ROW LEVEL SECURITY;

-- Public read on catalog tables
CREATE POLICY "Public read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read affiliate_links" ON public.affiliate_links FOR SELECT USING (status = 'active');
CREATE POLICY "Public read price_history" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Public read stack_battles" ON public.stack_battles FOR SELECT USING (true);
CREATE POLICY "Public read deal_ticker" ON public.deal_ticker FOR SELECT USING (is_active = true);
CREATE POLICY "Public read easter_eggs" ON public.easter_egg_deals FOR SELECT USING (is_active = true);

-- Admin write on all tables (authenticated users only)
CREATE POLICY "Admin write companies" ON public.companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write affiliate_links" ON public.affiliate_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write pitch_log" ON public.pitch_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write price_history" ON public.price_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write stack_battles" ON public.stack_battles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write deal_ticker" ON public.deal_ticker FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write easter_eggs" ON public.easter_egg_deals FOR ALL USING (auth.role() = 'authenticated');

-- Pitch log is admin-only for read too
CREATE POLICY "Admin read pitch_log" ON public.pitch_log FOR SELECT USING (auth.role() = 'authenticated');
```

### Task B11: Create full-text search function

**Step 1: Apply migration**

```sql
-- Add search vectors
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(subcategory, ''))
  ) STORED;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
  ) STORED;

CREATE INDEX idx_companies_search ON public.companies USING GIN(search_vector);
CREATE INDEX idx_products_search ON public.products USING GIN(search_vector);

-- Search function
CREATE OR REPLACE FUNCTION public.search_catalog(search_query text)
RETURNS TABLE (
  result_type text,
  id uuid,
  name text,
  slug text,
  category text,
  modality text,
  rank real
) LANGUAGE sql STABLE AS $$
  SELECT 'company', c.id, c.name, c.slug, c.category, NULL::text, ts_rank(c.search_vector, plainto_tsquery('english', search_query))
  FROM public.companies c
  WHERE c.search_vector @@ plainto_tsquery('english', search_query)
  UNION ALL
  SELECT 'product', p.id, p.name, p.slug, NULL, p.modality, ts_rank(p.search_vector, plainto_tsquery('english', search_query))
  FROM public.products p
  WHERE p.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT 50;
$$;
```

### Task B12: Run security advisors

**Step 1: Check security advisors**

Use `get_advisors` with type "security" to verify RLS is properly configured.

**Step 2: Check performance advisors**

Use `get_advisors` with type "performance" to verify indexes are optimal.

**Step 3: Fix any flagged issues**

---

## SWARM C: Frontend Scaffold (Block 1)

**Goal:** Create the React SPA with routing, layout, region toggle, and Netlify config.

### Task C1: Create the REFERRED frontend package

**Files:**
- Create: `packages/referred/package.json`
- Create: `packages/referred/vite.config.ts`
- Create: `packages/referred/tsconfig.json`
- Create: `packages/referred/index.html`
- Create: `packages/referred/tailwind.config.js`
- Create: `packages/referred/postcss.config.js`
- Modify: `pnpm-workspace.yaml`

**Step 1: Create package.json**

```json
{
  "name": "@nss/referred",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@supabase/supabase-js": "^2.47.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
  },
});
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>REFERRED — The Best Deals in AI</title>
    <meta name="description" content="Stop drowning in AI news. Start building. The best deals, tools, and path forward." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create tailwind.config.js and postcss.config.js**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        referred: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
```

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 6: Update pnpm-workspace.yaml**

Add `packages/referred` to the workspace.

**Step 7: Install dependencies**

```bash
cd packages/referred && pnpm install
```

**Step 8: Commit**

```bash
git add packages/referred/ pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat: scaffold REFERRED frontend package"
```

### Task C2: Create base app structure with routing

**Files:**
- Create: `packages/referred/src/main.tsx`
- Create: `packages/referred/src/App.tsx`
- Create: `packages/referred/src/styles/globals.css`
- Create: `packages/referred/src/lib/utils.ts`

**Step 1: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
}

@layer base {
  body {
    @apply bg-white text-gray-900 antialiased;
  }
}
```

**Step 2: Create utils**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Create main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Step 4: Create App.tsx with routes**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { CatalogPage } from './pages/Catalog';
import { ProductPage } from './pages/Product';
import { AdvisorPage } from './pages/Advisor';
import { StackPage } from './pages/Stack';
import { AboutPage } from './pages/About';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/advisor" element={<AdvisorPage />} />
        <Route path="/stack/:id" element={<StackPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
```

**Step 5: Commit**

```bash
git commit -m "feat: add base app structure with routing"
```

### Task C3: Create Layout with region toggle and navigation

**Files:**
- Create: `packages/referred/src/components/Layout.tsx`
- Create: `packages/referred/src/components/RegionToggle.tsx`
- Create: `packages/referred/src/components/DealTicker.tsx`
- Create: `packages/referred/src/components/Footer.tsx`
- Create: `packages/referred/src/stores/regionStore.ts`

**Step 1: Create region store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Region = 'US' | 'EU' | 'CN' | 'ROW';

interface RegionState {
  region: Region;
  setRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: 'US',
      setRegion: (region) => set({ region }),
    }),
    { name: 'referred-region' }
  )
);
```

**Step 2: Create RegionToggle component**

A persistent top-bar selector with 4 buttons: US | EU | China | Rest of World. Highlights active region. Reads/writes from regionStore.

**Step 3: Create DealTicker component**

A horizontally scrolling marquee bar. Subscribes to Supabase realtime on `deal_ticker` table. Shows deal headlines scrolling left-to-right.

**Step 4: Create Layout with Header, DealTicker, RegionToggle, Footer, Outlet**

**Step 5: Create Footer with payment links (Bitcoin QR, PayPal, GitHub Sponsors)**

**Step 6: Commit**

```bash
git commit -m "feat: add layout with region toggle, deal ticker, and footer"
```

### Task C4: Create placeholder pages

**Files:**
- Create: `packages/referred/src/pages/Home.tsx`
- Create: `packages/referred/src/pages/Catalog.tsx`
- Create: `packages/referred/src/pages/Product.tsx`
- Create: `packages/referred/src/pages/Advisor.tsx`
- Create: `packages/referred/src/pages/Stack.tsx`
- Create: `packages/referred/src/pages/About.tsx`

**Step 1: Create each page as a placeholder**

Each page exports a named component with a heading and brief description. These will be fleshed out in Block 2.

Home page should include:
- Hero section: "Stop drowning in AI news. Start building."
- Category grid (8 categories with icons from lucide-react)
- "Talk to our AI Advisor" CTA button linking to /advisor

**Step 2: Commit**

```bash
git commit -m "feat: add placeholder pages for all routes"
```

### Task C5: Create Netlify config

**Files:**
- Create: `packages/referred/netlify.toml`
- Create: `packages/referred/public/_redirects`

**Step 1: Create netlify.toml**

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
```

**Step 2: Create _redirects for SPA**

```
/*    /index.html   200
```

**Step 3: Commit**

```bash
git commit -m "feat: add Netlify config with security headers"
```

### Task C6: Create Supabase client config

**Files:**
- Create: `packages/referred/src/lib/supabase.ts`
- Create: `packages/referred/.env.example`

**Step 1: Create supabase client**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 2: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_AI_BACKEND_URL=https://your-ai-backend.railway.app
```

**Step 3: Add .env to .gitignore**

**Step 4: Commit**

```bash
git commit -m "feat: add Supabase client config"
```

---

## SWARM D: Outreach Email Drafts (Block 1)

**Goal:** Create Gmail-ready pitch email drafts for companies without open affiliate programs.

### Task D1: Create pitch email template

**Files:**
- Create: `data/pitch-templates/affiliate-pitch.md`

**Step 1: Write the template**

A professional outreach email template with:
- Subject line: "Partnership Enquiry — REFERRED by BACK-ONLINE"
- Opening: who we are, what REFERRED does
- Value prop: curated audience of AI enthusiasts, direct purchase intent
- Ask: affiliate partnership, commission structure
- Closing: reference code "BACK-ONLINE told me to tell you they referred me"
- Signature block

**Step 2: Commit**

```bash
git commit -m "feat: add affiliate pitch email template"
```

### Task D2: Generate personalized pitch emails

**Files:**
- Create: `data/pitch-drafts/` (one file per company)

**Step 1: For each company in contacts CSV with pitch_status = 'draft':**

Generate a personalized version of the pitch template. Customize:
- Company name and what they offer
- Why their specific product fits our audience
- Specific commission structure suggestion based on industry norms

**Step 2: Save each as `data/pitch-drafts/{company-slug}.md`**

**Step 3: Create Gmail drafts**

Use `gmail_create_draft` for each pitch email with:
- To: contact email from CSV
- Subject: personalized subject
- Body: personalized pitch

**Step 4: Commit the draft files**

```bash
git add data/pitch-drafts/ data/pitch-templates/
git commit -m "feat: generate personalized affiliate pitch emails"
```

---

## AGENT E: Data Seeding (Block 2 — depends on A + B)

**Goal:** Parse the CSV and seed Supabase with catalog data.

### Task E1: Seed companies from CSV

**Step 1: Parse CSV for unique companies**

**Step 2: Insert into Supabase companies table via `execute_sql`**

**Step 3: Verify count matches**

### Task E2: Seed products from CSV

**Step 1: For each product row, look up company_id by name**

**Step 2: Insert into products table**

**Step 3: Verify count**

### Task E3: Seed affiliate links from CSV

**Step 1: For each row with an affiliate_url or amazon_url, create affiliate_link entries**

**Step 2: Create Amazon Associate links with proper tag format**

**Step 3: Verify all links are active status**

### Task E4: Seed initial deal ticker entries

**Step 1: Create 10-15 compelling deal ticker headlines from the catalog data**

**Step 2: Insert into deal_ticker table**

### Task E5: Seed Easter Egg deals

**Step 1: Create 3-5 Easter Egg deals**

- Konami code: unlocks a hidden 10% off deal on a popular product
- Hidden footer link: reveals a curated "best bang for buck" starter pack
- Advisor secret phrase "what's the secret?": reveals exclusive bundle deal

**Step 2: Insert into easter_egg_deals table**

---

## AGENT F: Search & Filter UI (Block 2 — depends on C)

**Goal:** Build the full catalog browsing experience.

### Task F1: Build catalog page with search and filters

**Files:**
- Modify: `packages/referred/src/pages/Catalog.tsx`
- Create: `packages/referred/src/components/catalog/SearchBar.tsx`
- Create: `packages/referred/src/components/catalog/FilterSidebar.tsx`
- Create: `packages/referred/src/components/catalog/ProductCard.tsx`
- Create: `packages/referred/src/components/catalog/ProductGrid.tsx`
- Create: `packages/referred/src/hooks/useCatalog.ts`

**Step 1: Create useCatalog hook**

Fetches products from Supabase with filters: category, region, price range, modality, beginner_friendly. Uses the search_catalog function for text search. Supports pagination.

**Step 2: Create SearchBar — full-text search input with debounce**

**Step 3: Create FilterSidebar — category multi-select, region (from store), price slider, modality checkboxes, beginner toggle**

**Step 4: Create ProductCard — company logo, name, price range, credit badge, review stars, "Get Deal" button**

**Step 5: Create ProductGrid — responsive grid with grid/list toggle**

**Step 6: Wire it all together in Catalog page**

**Step 7: Commit**

```bash
git commit -m "feat: build catalog page with search and filters"
```

### Task F2: Build product detail page

**Files:**
- Modify: `packages/referred/src/pages/Product.tsx`
- Create: `packages/referred/src/components/product/ProductDetail.tsx`
- Create: `packages/referred/src/components/product/AffiliateButtons.tsx`
- Create: `packages/referred/src/components/product/RelatedProducts.tsx`
- Create: `packages/referred/src/components/product/PriceHistory.tsx`
- Create: `packages/referred/src/hooks/useProduct.ts`

**Step 1: Create useProduct hook — fetches product by slug with company, affiliate links, price history**

**Step 2: Create AffiliateButtons — "Buy Direct" + "Buy on Amazon" side by side**

**Step 3: Create PriceHistory — simple line chart showing price over time (Time Machine zinger)**

**Step 4: Create RelatedProducts — products in same category/modality**

**Step 5: Wire together in Product page**

**Step 6: Commit**

```bash
git commit -m "feat: build product detail page with affiliate buttons and price history"
```

### Task F3: Build Stack Builder page

**Files:**
- Modify: `packages/referred/src/pages/Stack.tsx`
- Create: `packages/referred/src/components/stack/StackList.tsx`
- Create: `packages/referred/src/components/stack/StackItem.tsx`
- Create: `packages/referred/src/components/stack/CostCalculator.tsx`
- Create: `packages/referred/src/components/stack/NerdScore.tsx`

**Step 1: Create StackList — itemized stack with swap-out buttons per region**

**Step 2: Create CostCalculator — running total, per-item costs**

**Step 3: Create NerdScore — visual n00b-to-pro meter (1-10 scale)**

**Step 4: Create "Buy all on Amazon" link builder**

**Step 5: Commit**

```bash
git commit -m "feat: build stack builder page with cost calculator"
```

---

## AGENT G: Payment Integrations (Block 2 — depends on C)

**Goal:** Integrate all payment/donation methods.

### Task G1: Stripe tip jar

**Files:**
- Create: `packages/referred/src/components/payments/StripeTipJar.tsx`
- Create: `packages/referred/src/components/payments/TipButton.tsx`

**Step 1: Create Stripe checkout session flow**

Use Stripe.js for a simple tip jar. Amounts: $5, $10, $25, custom. Opens Stripe Checkout in a new tab.

**Step 2: Create floating TipButton component**

Small, unobtrusive button in bottom-right corner. "Buy us a coffee" style.

**Step 3: Commit**

```bash
git commit -m "feat: add Stripe tip jar integration"
```

### Task G2: Bitcoin/Lightning donation

**Files:**
- Create: `packages/referred/src/components/payments/BitcoinDonate.tsx`

**Step 1: Create Bitcoin donation component**

Shows BTC address + QR code. Optionally show Lightning Network invoice.

**Step 2: Commit**

```bash
git commit -m "feat: add Bitcoin/Lightning donation component"
```

### Task G3: Other payment methods

**Files:**
- Create: `packages/referred/src/components/payments/PaymentMethods.tsx`

**Step 1: Create unified payment methods component for /about page**

Includes: Stripe, GoCardless link, PayPal button, Bitcoin QR, Buy Me a Coffee embed, GitHub Sponsors link, bank transfer details.

**Step 2: Commit**

```bash
git commit -m "feat: add unified payment methods component"
```

---

## AGENT H: AI Backend Scaffold (Block 2 — independent)

**Goal:** Scaffold the AI interviewer backend service.

### Task H1: Create backend project

**Files:**
- Create: `packages/ai-backend/package.json`
- Create: `packages/ai-backend/tsconfig.json`
- Create: `packages/ai-backend/src/index.ts`
- Create: `packages/ai-backend/src/routes/conversation.ts`
- Create: `packages/ai-backend/src/lib/db.ts`
- Create: `packages/ai-backend/src/lib/encryption.ts`

**Step 1: Create package.json**

Node.js/Express service with:
- express, cors, helmet
- pg (postgres client)
- crypto (built-in, for AES-256)
- rate-limiter-flexible

**Step 2: Create database connection module**

Connects to isolated Postgres DB (Railway-provisioned). Connection string from env.

**Step 3: Create encryption module**

AES-256-GCM encryption/decryption for conversation data.

**Step 4: Create conversation routes**

- POST /api/conversation/start — create new conversation
- POST /api/conversation/:id/message — send message, get AI response
- GET /api/conversation/:id — get conversation history (encrypted, decrypted on read)

**Step 5: Create main server with CORS, helmet, rate limiting**

**Step 6: Commit**

```bash
git commit -m "feat: scaffold AI backend with encrypted conversation storage"
```

### Task H2: Create conversation DB schema

**Files:**
- Create: `packages/ai-backend/src/migrations/001_conversations.sql`

**Step 1: Create migration**

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text DEFAULT 'US',
  experience_level int,
  intent text,
  encrypted_messages bytea,
  iv bytea,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

CREATE INDEX idx_conversations_expires ON conversations(expires_at);

-- Auto-purge expired conversations
CREATE OR REPLACE FUNCTION purge_expired_conversations()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM conversations WHERE expires_at < now();
$$;
```

**Step 2: Commit**

```bash
git commit -m "feat: add conversation DB schema with auto-purge"
```

### Task H3: Create AI conversation flow logic

**Files:**
- Create: `packages/ai-backend/src/lib/advisor.ts`
- Create: `packages/ai-backend/src/lib/prompts.ts`
- Create: `packages/ai-backend/src/lib/stackBuilder.ts`

**Step 1: Create prompt templates for each conversation stage**

Stage 1: Intent classification
Stage 2: Budget/region/experience
Stage 3: Modality selection
Stage 4: Stack generation from catalog

**Step 2: Create stackBuilder**

Queries Supabase catalog, filters by region/modality/budget, ranks by review score and beginner-friendliness, generates a recommended stack with costs and affiliate links.

**Step 3: Create n00b calculator logic**

Scores 1-10 based on:
- Self-reported experience
- Language complexity in messages
- Familiarity with technical terms

**Step 4: Commit**

```bash
git commit -m "feat: add AI advisor conversation flow and stack builder"
```

---

## BLOCK 3: Integration & Zingers (Sequential — depends on Block 2)

### Task I1: Wire frontend to Supabase

**Step 1: Add real Supabase URL and anon key to .env**

**Step 2: Test catalog page loads real data**

**Step 3: Test search function works**

**Step 4: Test region toggle filters correctly**

**Step 5: Commit**

### Task I2: Wire frontend to AI backend

**Step 1: Create API client for AI backend in frontend**

**Step 2: Build chat UI in Advisor page**

**Step 3: Wire conversation flow: start → messages → stack recommendation**

**Step 4: Commit**

### Task I3: Implement The Ticker (Zinger 1)

**Step 1: Subscribe DealTicker component to Supabase realtime**

**Step 2: CSS marquee animation with pause-on-hover**

**Step 3: Click-through to product pages**

**Step 4: Commit**

### Task I4: Implement Stack Battles (Zinger 2)

**Step 1: Create StackBattles component on home page**

**Step 2: Query stack_battles table for current week's data**

**Step 3: Display as percentage bars: "73% chose AMD vs 27% NVIDIA"**

**Step 4: After AI advisor generates a stack, update stack_battles counts**

**Step 5: Commit**

### Task I5: Implement The Time Machine (Zinger 3)

**Step 1: Already built PriceHistory in F2**

**Step 2: Add "6 months ago" comparison calculation**

**Step 3: Show savings/cost increase badge: "You'd save 34%" or "Prices up 12%"**

**Step 4: Commit**

### Task I6: Implement Easter Egg Deals (Zinger 4)

**Step 1: Add konami code listener to Layout**

```typescript
// Listen for: up up down down left right left right b a
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
```

**Step 2: On trigger, fetch easter_egg_deals where trigger_type = 'konami'**

**Step 3: Show celebration modal with the hidden deal**

**Step 4: Increment unlocked_count in Supabase**

**Step 5: Add hidden link in footer (tiny, nearly invisible text)**

**Step 6: Add "what's the secret?" detection in AI advisor**

**Step 7: Commit**

### Task I7: Implement The Prophecy Engine (Zinger 5)

**Step 1: After stack recommendation, calculate trend predictions**

Use price_history data to extrapolate 6-month forward prices.

**Step 2: Display "In 6 months..." card at bottom of stack recommendation**

**Step 3: Include swap suggestions based on predicted price drops**

**Step 4: Commit**

### Task I8: Security hardening

**Step 1: Verify CSP headers in netlify.toml are correct**

**Step 2: Audit all Supabase RLS policies**

**Step 3: Verify AI backend rate limiting works**

**Step 4: Verify no secrets in client bundle**

**Step 5: Test API key auth between frontend and AI backend**

**Step 6: Commit**

### Task I9: Deploy to Netlify

**Step 1: Connect GitHub repo to Netlify**

**Step 2: Set build command: `cd packages/referred && pnpm build`**

**Step 3: Set publish directory: `packages/referred/dist`**

**Step 4: Add environment variables in Netlify dashboard**

**Step 5: Deploy and verify**

**Step 6: Test all pages, search, filters, region toggle**

### Task I10: Final review and launch checklist

**Step 1: Verify all affiliate links are correct format**

**Step 2: Verify Amazon Associate tag is in all Amazon URLs**

**Step 3: Test all payment methods render correctly**

**Step 4: Test all 5 zingers work**

**Step 5: Check mobile responsiveness**

**Step 6: Run Lighthouse audit**

**Step 7: Final commit**

```bash
git commit -m "feat: REFERRED v1.0 — launch ready"
```

---

## Summary: Task Count by Swarm

| Swarm | Tasks | Can Run In Parallel With |
|-------|-------|------------------------|
| A (Affiliate Research) | A1-A9 (9 tasks) | B, C, D |
| B (Database) | B1-B12 (12 tasks) | A, C, D |
| C (Frontend) | C1-C6 (6 tasks) | A, B, D |
| D (Outreach) | D1-D2 (2 tasks) | A, B, C |
| E (Data Seeding) | E1-E5 (5 tasks) | F, G, H |
| F (Search/Filter UI) | F1-F3 (3 tasks) | E, G, H |
| G (Payments) | G1-G3 (3 tasks) | E, F, H |
| H (AI Backend) | H1-H3 (3 tasks) | E, F, G |
| I (Integration) | I1-I10 (10 tasks) | Sequential |

**Total: 53 tasks across 9 workstreams.**
