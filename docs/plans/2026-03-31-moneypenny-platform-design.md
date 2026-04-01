# Moneypenny Platform — Full Design Document

## Vision

An AI-first website platform where **Moneypenny** — a persistent, cost-aware, learning AI concierge — is the primary interface. She builds sites, manages content, configures payments, deploys to production, and improves over time. The visual editor exists as a secondary tool for manual fine-tuning.

Not a Squarespace clone with AI bolted on. A fundamentally new interaction model: **talk to Moneypenny, she does the work.**

---

## 1. Moneypenny — The AI Concierge

### Persona
- British, female, academic warmth — think Moneypenny meets university tutor
- Competent, calm, occasionally dry wit
- Never condescending, always explains what she's doing and why
- Consistent voice and personality regardless of which AI model powers her brain

### Voice Architecture
```
User speaks/types
       ↓
Small local model (in-browser via WebGPU)
  - Qwen 2.5 0.5B / Mistral 3B / Gemma 2B
  - Handles: persona consistency, conversation flow, routing decisions
  - Runs at 30-70 tok/s, no API cost
       ↓
Text-to-Speech for voice output
  - Primary: Hume AI Octave ("sophisticated British woman") or Fish Audio clone
  - Fallback: Web Speech API "Google UK English Female"
  - Voice is ALWAYS the same regardless of backend model
       ↓
Heavy tasks routed to user's chosen model via their API key
  - Claude, GPT-4o, Gemini, Llama, Mistral Large, Cohere, etc.
  - User configures in Settings → API Keys
```

### Cost Awareness
- Before every AI action, Moneypenny estimates token cost
- "That'll be about 1,200 tokens — roughly half a penny. Go ahead?"
- Running cost tracker in settings: daily, weekly, monthly spend per model
- Budget caps: user sets max spend, Moneypenny warns and stops at limit
- She learns usage patterns: "You typically spend about £3/month. This week you're on track for £5 — the blog series is the reason."

### Memory & Learning (Persistent State)
- Stored in IndexedDB, structured as:
  - `preferences`: brand voice, style choices, content tone
  - `history`: past conversations, decisions made, outcomes
  - `patterns`: learned workflows ("you always publish blog posts on Tuesdays")
  - `estimates`: actual vs predicted costs, improving accuracy over time
- Memory is local-first. Never sent to third parties without explicit consent.
- Export/import memory (JSON) for backup or migration.

### Transparent Orchestration
- Activity feed (collapsible sidebar): shows what agents are doing in real-time
  ```
  ● Content Agent (Claude Sonnet) — Writing "Our New Menu" blog post...
  ● Research Agent (Gemini) — Finding coffee shop imagery on Unsplash...
  ● SEO Agent (GPT-4o) — Generating meta description...
  ✓ Deploy Agent — Site published to coffeeshop.pages.dev
  ```
- Users who don't care can collapse this. Users who do can watch every token.
- Each agent shows: model used, tokens consumed, cost, status.

---

## 2. BYOK Model Architecture

### API Key Management
```
Settings → AI Models

┌─────────────────────────────────────────────────┐
│ AI Model Configuration                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ Default Model: [Claude Sonnet 4 ▾]              │
│                                                 │
│ API Keys:                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ Anthropic  [sk-ant-•••••••••] ✓ Connected   │ │
│ │ OpenAI     [sk-•••••••••••••] ✓ Connected   │ │
│ │ Google     [AIza••••••••••••] ✓ Connected   │ │
│ │ Mistral    [not configured]    + Add Key     │ │
│ │ Cohere     [not configured]    + Add Key     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Task Routing (optional — Moneypenny auto-routes  │
│ if you don't configure this):                   │
│                                                 │
│ Content writing:  [Claude Sonnet 4 ▾]           │
│ Code generation:  [Claude Sonnet 4 ▾]           │
│ Research:         [Gemini 2.5 Flash ▾]          │
│ Image gen:        [DALL-E 3 ▾]                  │
│ SEO analysis:     [GPT-4o ▾]                    │
│                                                 │
│ Monthly budget cap: [£10.00]                    │
│ Spent this month:    £2.34                      │
└─────────────────────────────────────────────────┘
```

### Supported Providers (launch)
- Anthropic (Claude family)
- OpenAI (GPT family + DALL-E)
- Google (Gemini family)
- Mistral (Mistral family)
- Cohere (Command R family)
- Together AI (open-source models)
- Groq (fast inference for Llama/Mixtral)

### Agent Types
1. **Content Agent** — writes copy, blog posts, product descriptions, emails
2. **Design Agent** — generates layouts, picks color palettes, selects typography
3. **Code Agent** — writes custom CSS/JS, creates interactive components
4. **Research Agent** — finds images, checks competitors, gathers market data
5. **SEO Agent** — audits pages, generates meta, tracks LLM visibility
6. **Deploy Agent** — builds, deploys, manages DNS/domains
7. **Commerce Agent** — configures payments, manages products/inventory
8. **Analytics Agent** — reads traffic data, identifies trends, suggests actions

---

## 3. User Experience — The Three Layers

### Layer 1: Moneypenny (Primary Interface)
- Command bar at bottom of screen (like Spotlight/Raycast)
- Voice input via microphone button
- Full conversational context
- She can open/close panels, navigate pages, show previews
- "Show me the mobile version" → she switches viewport
- "Make the hero bigger" → she edits the canvas in real-time
- "How's the site performing?" → she pulls analytics

### Layer 2: Visual Editor (Secondary)
- GrapesJS canvas for manual drag-drop editing
- Appears when user says "Let me tinker" or clicks the canvas
- Moneypenny watches and can comment: "Nice choice on that font"
- All blocks from v0.1 plus new ones (see Section 5)
- Device-aware: knows what device is viewing, shows responsive preview

### Layer 3: Dashboard (Tertiary)
- Project overview (4-10 sites)
- Analytics per site
- Domain management
- Billing/cost tracking
- Team management (future)
- Extension marketplace (future)

### First-Time Experience
```
1. Dark screen, subtle animation
2. Moneypenny: "Hello. I'm Moneypenny. I build websites.
   Would you like a tour, or shall we get started?"
3. [Tour] / [Let's build] / [I have a site to import]

"Let's build" flow:
4. "What's the project? A business, a blog, a portfolio?"
5. "Tell me about it — even just a sentence is enough."
6. User: "A coffee shop in Hackney called Dark Horse"
7. "Lovely name. Before I build anything, you'll need to
   connect an AI model. I can work with Claude, GPT, Gemini,
   or several others. Which do you use?"
8. User pastes API key
9. "Perfect. Give me a moment..."
   → Activity feed shows agents spinning up
   → Site generates section by section on the canvas
   → Moneypenny narrates: "I've set up your menu page with
     a database behind it so you can update items without
     touching the design. There's a booking form connected
     to a calendar. And I've drafted some copy based on
     Hackney coffee culture. Want to hear it?"
```

---

## 4. Full Feature Set (Squarespace Parity + Beyond)

### Website Building
- [ ] Visual drag-drop editor (GrapesJS)
- [ ] 30+ pre-built blocks (hero, navbar, footer, features, pricing, FAQ, testimonials, gallery, etc.)
- [ ] 10+ full-page templates
- [ ] AI site generation from description
- [ ] Separate mobile layout editing
- [ ] Block animations and scroll effects
- [ ] Custom CSS/JS injection
- [ ] Multi-page with auto-navigation

### Content Management
- [ ] Database collections (like Wix CMS / Airtable-lite)
- [ ] Dynamic pages connected to collections
- [ ] Blog with rich editor, categories, tags, RSS
- [ ] Member-only gated content
- [ ] Media library with AI image search
- [ ] Content scheduling (publish at future date/time)

### Device Awareness
- [ ] Auto-detect viewing device (user agent + viewport)
- [ ] Show device-specific stats in analytics
- [ ] Responsive preview (desktop/tablet/mobile) in editor
- [ ] Separate mobile layout overrides
- [ ] PWA support for mobile-app-like experience
- [ ] AMP pages option for maximum mobile performance

### Payments & Commerce
- [ ] Stripe integration (cards, Apple Pay, Google Pay)
- [ ] PayPal integration
- [ ] Product catalog with inventory management
- [ ] Digital product delivery
- [ ] Subscription/recurring billing
- [ ] Invoice generation
- [ ] Tax calculation (automatic by region)
- [ ] Discount codes and promotions
- [ ] Checkout customization
- [ ] Order management dashboard

### Scheduling & Calendar
- [ ] Booking/appointment system
- [ ] Calendar view (day/week/month)
- [ ] Intake forms per appointment type
- [ ] Automated reminders (email/SMS)
- [ ] Payment collection at booking
- [ ] Staff calendar sync (Google Calendar, Outlook)
- [ ] Recurring appointment support
- [ ] Buffer time between appointments

### Forms
- [ ] Visual form builder
- [ ] Conditional logic (show/hide fields based on answers)
- [ ] File upload fields
- [ ] Payment collection in forms
- [ ] Form analytics (completion rates, drop-offs)
- [ ] Email notifications on submission
- [ ] Webhook integration
- [ ] Spam protection (Turnstile/hCaptcha)

### Email Marketing
- [ ] Email template builder (matching site design)
- [ ] Subscriber management
- [ ] Automated campaigns (welcome series, abandoned cart)
- [ ] Blog-to-email (auto-convert blog posts)
- [ ] A/B testing subject lines
- [ ] Unsubscribe management
- [ ] Sending via Resend/Postmark/SendGrid

### SEO & Visibility
- [ ] Per-page meta tags, OG images, structured data
- [ ] Real-time SEO scoring
- [ ] AI meta description generation
- [ ] Sitemap.xml and robots.txt auto-generation
- [ ] LLM visibility tracking (how AI chatbots cite your site)
- [ ] PageSpeed analysis and recommendations
- [ ] Redirect management (301/302)

### Analytics
- [ ] Privacy-respecting analytics (no cookies, Plausible/Umami style)
- [ ] Traffic sources, pages, devices, locations
- [ ] Conversion tracking
- [ ] Commerce analytics (revenue, AOV, conversion rate)
- [ ] Real-time visitor count
- [ ] Moneypenny interprets data: "Traffic spiked 40% Tuesday — your Instagram post drove it"

### Domain Management
- [ ] Connect existing domains
- [ ] DNS configuration guidance (Moneypenny walks you through it)
- [ ] SSL auto-provisioned
- [ ] Multiple domains per project
- [ ] Subdomain support

### Extensions (Future)
- [ ] Extension API for third-party integrations
- [ ] Community extension marketplace
- [ ] OAuth connections to external services
- [ ] Zapier/Make webhook integration

---

## 5. Database/Collections System

One of the biggest gaps. Users need structured data without knowing what a database is.

### How Moneypenny presents it:
"Your menu items are stored in a collection — think of it as a spreadsheet that powers your website. Add a new coffee, and it appears on your menu page automatically."

### Technical implementation:
- Collections stored in Cloudflare D1 (SQLite at the edge) or KV
- Schema defined visually or by Moneypenny
- CRUD interface for managing records
- Dynamic page templates that render from collection data
- Relationships between collections (e.g., Blog Posts → Authors)
- API endpoint auto-generated for each collection (for integrations)

### Example collections:
- Blog Posts (title, body, image, date, category, author, published)
- Products (name, price, description, image, inventory, category)
- Team Members (name, role, bio, photo, social links)
- Menu Items (name, description, price, category, dietary info)
- Testimonials (name, quote, company, rating)
- Events (title, date, location, description, ticket link)

---

## 6. Technical Architecture (Revised)

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │Moneypenny│  │ Visual Editor │  │    Dashboard     │  │
│  │ Chat/Voice│  │  (GrapesJS)  │  │ (Analytics/CMS)  │  │
│  └─────┬────┘  └──────┬───────┘  └────────┬─────────┘  │
│        └───────────────┼──────────────────┘             │
│                        ↓                                │
│              ┌─────────────────┐                        │
│              │  Agent Router   │                        │
│              │  (Orchestrator) │                        │
│              └────────┬────────┘                        │
│                       ↓                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Content│ │Design│ │ Code │ │  SEO │ │Deploy│  ...    │
│  │Agent  │ │Agent │ │Agent │ │Agent │ │Agent │        │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘        │
│     └────────┴────────┴────────┴────────┘              │
│                       ↓                                 │
│         ┌──────────────────────────┐                    │
│         │    BYOK Model Router     │                    │
│         │ Claude│GPT│Gemini│Mistral │                    │
│         └──────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                         │
│  IndexedDB (projects, memory, preferences)              │
│  Cloudflare KV/D1 (collections, dynamic content)        │
│  Cloudflare R2 (images, media, assets)                  │
│  Cloudflare Pages (deployed sites)                      │
└─────────────────────────────────────────────────────────┘
```

### Key packages to add:
```
packages/
  ├── editor/          # Visual editor (existing)
  ├── moneypenny/      # AI concierge (persona, memory, voice)
  ├── agents/          # Agent definitions and orchestrator
  ├── models/          # BYOK model router (API adapters)
  ├── collections/     # Database/CMS system
  ├── commerce/        # Payments, products, orders
  ├── scheduler/       # Booking/calendar system
  ├── email/           # Email marketing
  ├── analytics/       # Privacy-respecting analytics
  ├── renderer/        # Static site output (existing concept)
  ├── blocks/          # Component library (existing concept)
  └── deploy/          # Deployment utilities (existing)
```

---

## 7. Pricing Model — Peppercorn Rent

### Philosophy
Maintenance is hard. Good maintenance is harder. Users need to understand that a living, updated, patched platform costs real human effort. The pricing model reflects this honestly.

### Structure — Two Paths

#### Path 1: Spot Fee (One-Off)
- Pay once, use forever
- User sets the amount (minimum £20)
- Covers: lifetime platform access, all features
- Does NOT include ongoing maintenance — you're on community support
- Good for: self-sufficient technical users, developers, tinkerers

#### Path 2: Monthly (Peppercorn Rent + Appreciation)

**£1/month — Peppercorn Rent (mandatory for monthly users)**
- Covers infrastructure costs (Cloudflare, domain routing, CDN)
- Access to the full platform, all features, all updates
- Community support
- This is the floor. Everyone pays this.

**"What's it worth to you?" — Voluntary Appreciation Pricing**
- After using the platform, a tasteful prompt (not nagware):
  > "If Moneypenny's been useful, you can set what you'd like to pay.
  > This covers maintenance, security patches, and new features."
- User enters an amount above the £1 base
- **Generates an invoice** sent to Matt for approval
- Matt reviews and approves/declines
- If approved, user gets a receipt and moves into a maintenance tier

### Maintenance Tiers (soft, not walls)

| Monthly Payment | What You Get |
|----------------|-------------|
| £1 (base) | Platform access, community support, major updates when they land |
| £5-10 | Priority patch notifications, changelog emails, faster bug acknowledgement |
| £15-25 | Direct maintenance window, feature request consideration, named in contributors |
| £25+ | Priority support, early access to new features, input on roadmap direction |
| Spot fee only | Platform forever, community support only, no maintenance guarantee |

**No features are locked behind tiers.** Everyone gets the full platform. The tiers affect maintenance attention, communication speed, and influence on direction.

### The Honesty Message
The pricing page is transparent about WHY maintenance costs what it costs:

> "This platform is maintained by a dedicated developer based in the UK.
> Not a faceless support team. Not an outsourced ticket queue. A real person
> who writes the patches, reviews the security updates, and answers your
> questions in English at a reasonable hour.
>
> That costs more than farming it out. You're paying for quality, accountability,
> and someone who actually understands the codebase they're maintaining.
>
> You'll get what you pay for. We're honest about that."

This isn't apologetic — it's a selling point. UK-based, accountable, competent maintenance is a premium service and should be presented as one.

### How Moneypenny Handles It
- She doesn't nag. Ever.
- After 30 days of active use, she mentions it once:
  > "By the way — if you've found this useful, there's a way to
  > support the maintenance. No pressure. The button's in Settings
  > whenever you're ready."
- If the user sets a very low appreciation amount, Moneypenny is honest:
  > "I've submitted that for approval. Fair warning — at that level,
  > maintenance responses may take a bit longer. The base platform
  > will always work, though."
- She never brings it up again unless the user asks.

### Invoice System
- User clicks "Support this project" in Settings
- Sets their monthly amount
- Invoice generated (PDF, line items: Platform License, Maintenance Contribution)
- Sent to Matt's email/dashboard for approval
- Stripe handles recurring billing
- User gets receipt on approval
- Decline = user stays on base tier, no penalty, no nagging

### Why This Works
- No free tier abuse (£1 floor filters out noise)
- Honest about costs (users see exactly where money goes)
- Respects users who genuinely can't pay more
- Rewards users who value the work
- Matt controls who gets maintenance attention
- No enterprise sales team, no "contact us for pricing" nonsense

---

## 8. What Makes This Different

| Feature | Squarespace | Wix | nssLocalWebBuilder |
|---------|------------|-----|--------------------|
| Primary interface | Visual editor | Visual editor + AI chat | AI agent (Moneypenny) |
| AI model | Proprietary (Beacon) | Proprietary (Aria) | User's choice (BYOK) |
| Cost transparency | Hidden in subscription | Hidden in subscription | Per-token cost tracking |
| AI memory | None across sessions | Limited | Full persistent memory |
| Agent orchestration | None | Single AI | Multi-agent swarm |
| Data ownership | Locked in platform | Locked in platform | Local-first, exportable |
| Voice interface | None | None | Built-in with cloned voice |
| Open source | No | No | Yes |
| Hosting cost | $16-65/month | $17-159/month | £1/month + pay what you value |
| Pricing model | Fixed tiers, features locked | Fixed tiers, features locked | All features included, maintenance tiers voluntary |
| Invoice control | Automated | Automated | Human-approved, honest about what you're paying for |

---

## 8. Build Phases (Revised)

### Phase 1: Moneypenny Core (Next)
- Chat interface with command bar
- BYOK model configuration (API key management)
- Agent router (content, design, code agents)
- Cost estimation and tracking
- Memory/preference persistence
- Integrate with existing editor

### Phase 2: Full Platform Features
- Database/collections system
- Payments (Stripe)
- Booking/calendar
- Forms with conditional logic
- Blog CMS
- SEO panel

### Phase 3: Voice & Polish
- Text-to-speech (Moneypenny's voice)
- Speech-to-text input
- Transparent orchestration feed
- Onboarding experience
- Mobile layout editing
- Email marketing

### Phase 4: Intelligence Layer
- Analytics with AI interpretation
- LLM visibility tracking
- A/B testing
- Budget optimization suggestions
- Learning from user patterns
- Extension marketplace

---

*This is not a website builder with AI features. It's an AI agent that builds websites.*
