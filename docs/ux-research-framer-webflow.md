# UX Research: Framer & Webflow Analysis for MP

**Date:** 2026-04-01
**Objective:** Study AI-native design tools to inform the design of MP, an AI-first website builder

---

## 1. AI Generation

### Framer: Wireframer

**How it works:**
- Accessed via the insert panel or pressing `W` — opens a chat sidebar on the left
- User enters a natural language prompt describing their site (e.g., "portfolio site for a photographer with a project grid and contact form")
- Suggested presets are available: Personal Page, Landing Page, About Page, Resume, Portfolio — each with hover previews
- AI generates a complete responsive layout with navigation, headings, image placeholders, and AI-generated body copy
- All breakpoints are created automatically — responsive from the start
- Users can iterate conversationally: "Add a newsletter signup section" or "Give me a grid instead"

**What makes it feel magical:**
- The output is a *wireframe*, not a finished design — this is the key insight. By generating structure and hierarchy (not polished visuals), Framer sets realistic expectations and gives designers a useful starting point rather than a mediocre finished product
- Instant responsiveness across all breakpoints removes a major pain point
- Conversational iteration keeps the user in flow — no modal dialogs, no form-filling
- The metaphor is "world's fastest wireframing partner" not "AI designer"

**What makes it clunky:**
- Chat history is cleared when you close the project — no persistent memory
- Chat is not aware of manual canvas edits — you must finish prompting before editing
- Each page has its own isolated chat — no cross-page awareness
- Output quality varies significantly with prompt specificity

**MP takeaway:** Position AI as a structural scaffold generator, not a finished-design machine. The wireframe metaphor manages expectations brilliantly. Persistent chat memory and canvas-awareness would be major differentiators.

### Webflow: AI Assistant & Site Builder

**How it works:**
- Conversational AI assistant that understands your site structure, styles, and CMS
- Can generate entire responsive sites from basic details
- Proposes changes and applies only those you approve
- Can generate React-based code components
- AppGen feature generates production-grade web apps (dashboards, calculators) using Astro framework, deployed to Webflow Cloud

**Key difference from Framer:**
- Webflow AI is more of a co-pilot within the existing editor, not a separate generation mode
- Framer separates AI generation (Wireframer) from the editor; Webflow integrates AI throughout
- Webflow AI can refactor existing sections, rename classes to match conventions, and update CMS content

**MP takeaway:** The integrated assistant model (Webflow) feels more natural for ongoing work. The separate generation mode (Framer) is better for initial creation. MP should offer both: a generation flow for new sites, and an omnipresent assistant for ongoing editing.

---

## 2. Editor UX

### Framer Editor Layout

**Three-panel architecture:**
- **Left panel:** Layers tree + Insert panel + Wireframer chat
- **Center:** Canvas (freeform, Figma-like)
- **Right panel:** Context-sensitive properties (position, size, layout, styles, opacity, fill, borders, shadows, radius)

**Key patterns:**
- Frames are the fundamental building block (equivalent to `div`). Everything is a frame
- Stacks are visual Flexbox — toggle direction, gap, alignment, distribution, wrapping
- Layout is CSS Flexbox/Grid surfaced through visual controls — users never write `display: flex`
- The canvas is freeform — drag anywhere, pixel-perfect positioning, break out of grids
- Familiar to Figma users: same selection, grouping, and alignment patterns
- Command bar (`Cmd+K`) for quick navigation, plugins, actions

**What works:**
- Figma-like familiarity reduces learning curve for designers
- Frame-based mental model is simpler than Webflow's div/class model
- Context-sensitive properties panel reduces cognitive load
- Freeform canvas gives creative freedom

### Webflow Designer Layout

**Multi-panel architecture:**
- **Left panel:** Element structure tree (Navigator) + Add panel + Pages + CMS
- **Center:** Canvas with visual breakpoint controls
- **Right panel:** Style panel (the core — exposes full CSS) + Settings + Interactions
- **Top bar:** Breakpoint selector, preview, publish

**Key patterns:**
- 1:1 mapping between visual controls and CSS properties — every slider maps to a CSS property
- Class-based styling system — create reusable classes, cascade changes
- CSS Preview feature shows code generating in real-time as you design
- Variables manage design tokens (colors, spacing) with cascading
- Component Canvas (2025) — Figma-like interface for building reusable components
- Separate Designer (build) and Editor (content) modes

**What works:**
- True CSS mastery surface — designers learn CSS as they design
- Class system enables proper design systems at scale
- CSS Preview builds mental model of what the tool is actually doing
- Separation of Designer/Editor roles suits agency workflows

**MP takeaway:** Adopt Framer's simplicity of mental model (frames, stacks) but expose Webflow-level CSS control as a progressive disclosure layer. The CSS Preview feature is brilliant for education and debugging — MP should show the generated code optionally.

---

## 3. Design System (Editor's Own UI)

### Framer

- **Background:** Dark theme (near-black, ~#111)
- **Typography:** Clean sans-serif, likely Inter or similar
- **Panels:** Subtle border separations, minimal chrome
- **Controls:** Small, dense property inputs — similar to Figma's approach
- **Icons:** Minimal, monochrome line icons
- **Spacing:** Tight but not cramped — optimized for information density
- **Accent:** Blue/purple for selected states and active elements
- **Overall feel:** Professional, design-tool-native, familiar to Figma/Sketch users

### Webflow

- **Background:** Dark theme (slate/charcoal)
- **Typography:** System sans-serif, slightly larger than Framer
- **Panels:** More segmented with clear section headers (Layout, Typography, Backgrounds, etc.)
- **Controls:** Grouped by CSS category — immediately recognizable to developers
- **Icons:** Functional, descriptive icons alongside labels
- **Spacing:** More generous padding, clearer hierarchy between property groups
- **Accent:** Blue for selected/active states
- **Overall feel:** More structured, development-tool-adjacent, IDE-like

**MP takeaway:** Framer's density is better for designers who want speed. Webflow's grouped sections are better for systematic styling. MP should use Framer-level density with Webflow-style grouping — collapsible property sections with clear headers, but compact individual controls.

---

## 4. Animation / Interaction Tools

### Framer

- **Appear animations:** Configure entrance effects per element with ease/spring/bezier curves, timing (1s), and delay (0.1s)
- **Scroll effects:** Scroll progress component with parallax and reveal animations
- **Hover states:** Button/component variants (Default, Hover, Pressed) with transition configuration
- **Page transitions:** Built-in smooth page transitions
- **Ease curves:** Ease In/Out, Spring, Custom Bezier — visual curve editor
- **Strength:** Animation is a first-class citizen, not an afterthought. Every site feels polished with minimal effort

### Webflow

- **Interactions panel:** Dedicated right-panel section for interactions
- **Triggers:** Hover, click, scroll-into-view, page load, page scroll, mouse move
- **Timeline editor:** Visual timeline for sequencing multiple animations (GSAP integration in 2025)
- **Scroll triggers:** Parallax, reveal, sticky, progress-based animations
- **3D transforms:** CSS 3D effects and animations
- **Strength:** More granular control, GSAP-grade animation power, but steeper learning curve

**MP takeaway:** Copy Framer's approach of making basic animations effortless (appear, hover, scroll parallax as simple toggles). Layer Webflow-style timeline control as an advanced feature. The key insight: 80% of sites need simple appear/hover/scroll animations. Make those one-click. The remaining 20% need timeline control.

---

## 5. Component Architecture

### Framer

- **Design components:** Create from any frame, reuse throughout site with instance overrides
- **Variants:** Define states (Default, Hover, Pressed, Active) with transitions between them
- **Code components:** Custom React/TypeScript components with property controls (text inputs, color pickers, dropdowns) that appear in the properties panel
- **Workshop:** AI generates custom code components from prompts inside the editor
- **Marketplace:** 1,500+ pre-built community components (sliders, hover effects, flip cards, animated gradients)
- **Variables:** Colors, spacing, typography as tokens — instant theme changes

### Webflow

- **Components (evolved Symbols):** Reusable design elements with instance overrides
- **Component Canvas:** Dedicated Figma-like workspace for building components (2025)
- **Variants:** Managed in the Component Canvas
- **Classes:** Cascading style classes for consistent design systems
- **Shared Libraries:** Unified design systems across multiple sites (beta)
- **Variables:** Design tokens with modes for responsive/theme switching

**MP takeaway:** Framer's Workshop (AI generates React components from prompts) is the single most innovative feature in either platform. MP should have this from day one. The ability to say "build me a pricing toggle with monthly/annual switching" and get a working component instantly is transformative. Combine with Webflow's class-based design system for scalable consistency.

---

## 6. Collaboration Features

### Framer
- Real-time multiplayer editing (like Figma)
- Auto-saved changes with instant notifications
- On-page editing for marketing teams (content editing without accessing the full editor)
- "Like working in a live Figma file"

### Webflow
- Real-time multi-user collaboration (added 2025)
- Comment-only sharing links
- Separate Designer (dev) and Editor (content) roles
- Client editor mode with whitelabeling

**MP takeaway:** Both have converged on real-time collaboration. The key differentiator is role separation. Webflow's Designer/Editor split is excellent for agencies. Framer's on-page editing is excellent for marketing teams. MP should support both patterns: a full editor for builders, and an in-context editor for content teams.

---

## 7. Publishing Flow

### Framer
- One-click publish with free `*.framer.website` subdomain
- Custom domain connection
- Blazing-fast hosting built-in (no configuration)
- Preview before publish
- Integrated analytics (pageviews, visitors, funnels)
- A/B testing

### Webflow
- Staging and production environments (separate databases)
- Custom domains with Google Domains integration
- CDN hosting (CloudFront, Fastly) — migrated to Cloudflare in 2025
- Password protection (site-wide or per-page)
- Daily backups with one-click restore
- 301 redirects
- Custom 404 pages

**MP takeaway:** Framer's simplicity wins for speed. Webflow's staging/production split wins for professional workflows. MP should default to Framer-level simplicity (one-click publish) with optional staging environments for teams that need them. The free subdomain (`.mp.site` or similar) is essential for zero-friction first publish.

---

## 8. CMS / Collections

### Framer
- Built-in CMS with collections, items, and fields
- Dynamic pages generated from collections
- Collection lists for displaying multiple items
- JSON synchronization for external data
- Dynamic filtering
- Limited to 100 items on Basic, 1,000 on Pro

**Limitation:** Works for blogs under 100 posts, portfolios, simple catalogs. Not suitable for content-heavy sites.

### Webflow
- Unlimited collections on higher plans
- 12+ field types
- Dynamic templates with auto-generated SEO tags
- REST API for programmatic CRUD
- Collection filtering and sorting
- Related content (cross-referencing)
- RSS feeds
- Draft/publish workflow
- Client editor mode for content management

**MP takeaway:** For MP's AI-first approach, the CMS should be auto-generated from the site structure. When the AI creates a blog layout, it should automatically create the Blog Posts collection with appropriate fields. Webflow's field type richness and API access are essential for serious use. Framer's simplicity is right for the default experience.

---

## Key Patterns MP Should Adopt

### From Framer (Steal These)

1. **Wireframe-first AI generation** — Generate structure, not finished design. Manage expectations by calling it a starting point
2. **Conversational iteration in sidebar** — "Add a newsletter section" without leaving the canvas
3. **Frame-based mental model** — Everything is a frame (div) with visual flexbox/grid controls. No CSS jargon
4. **Workshop / AI component generation** — Prompt-to-React-component inside the editor. This is the killer feature
5. **One-click responsive** — Generate all breakpoints automatically during AI creation
6. **Freeform canvas** — Let designers break out of grids when they want to
7. **Dense, Figma-like property panel** — Information-rich without being overwhelming
8. **Built-in animation as default** — Appear effects and hover states should be one-click, not a separate workflow

### From Webflow (Steal These)

1. **CSS Preview / code visibility** — Show the generated code optionally, building trust and education
2. **Class-based design system** — Reusable styles that cascade. Essential for sites with 10+ pages
3. **Component Canvas** — Dedicated workspace for building components in isolation
4. **Designer/Editor role separation** — Builder mode vs. content-editor mode
5. **Staging/production environments** — Professional deploy workflow when needed
6. **GSAP timeline editor** — Visual timeline for complex animation sequences
7. **CMS API access** — REST API for programmatic content management
8. **Shared libraries across sites** — Design system reuse across multiple projects

### Original Ideas for MP

1. **Canvas-aware AI** — Unlike Framer's Wireframer, the AI should see and understand manual edits. "Make the hero section taller" should work after manual changes
2. **Persistent AI memory** — Remember past conversations and site context across sessions
3. **Auto-CMS from AI** — When AI generates a blog layout, auto-create the CMS collection with appropriate fields
4. **Progressive CSS disclosure** — Start with simple controls (like Framer), reveal full CSS (like Webflow) when users are ready
5. **Live code view toggle** — Not just CSS preview, but a full split-pane code view for developers
6. **AI style transfer** — "Make this section look like [screenshot/URL]" using vision models
7. **Component marketplace with AI search** — "I need an animated testimonial carousel" surfaces the right component
8. **Multi-page AI awareness** — Unlike Framer's per-page isolation, AI should understand the full site structure and maintain consistency

---

## Information Architecture Comparison

| Feature | Framer | Webflow | MP Recommendation |
|---------|--------|---------|-------------------|
| Mental model | Frames (divs) | HTML/CSS | Frames with optional CSS view |
| Layout system | Visual Flexbox/Grid | Visual Flexbox/Grid + CSS | Same, with progressive disclosure |
| Styling | Properties panel | Class-based style panel | Properties first, classes for power users |
| AI entry point | Separate Wireframer mode | Integrated assistant | Both: generation mode + omnipresent assistant |
| Components | Design + Code + Marketplace | Components + Shared Libraries | Design + AI-generated code + marketplace |
| CMS | Simple, limited | Rich, scalable | Auto-generated, API-enabled |
| Animation | First-class, easy | Powerful, complex | Easy defaults + advanced timeline |
| Publishing | One-click | Staging + production | One-click default, staging optional |
| Collaboration | Real-time multiplayer | Real-time + role separation | Both |
| Target user | Designers, solo creators | Developers, agencies | Everyone (progressive complexity) |

---

## The Magic Formula

The best AI-first website builder would combine:
- **Framer's speed** (prompt to published in minutes)
- **Framer's design freedom** (freeform canvas, easy animations)
- **Framer's Workshop** (AI-generated React components)
- **Webflow's depth** (CSS control, CMS power, design systems)
- **Webflow's professionalism** (staging, roles, API access)
- **Neither platform's AI memory** (both lack persistent, canvas-aware AI)

MP's unique advantage should be **AI that understands the full site context** — not isolated per-page chats, not context-blind generation, but a true design partner that remembers your brand, sees your canvas, and maintains consistency across pages.

---

## Sources

- [Framer AI](https://www.framer.com/ai/)
- [Framer Wireframer](https://www.framer.com/wireframer/)
- [Framer Features](https://www.framer.com/features)
- [Framer Academy](https://www.framer.com/academy/)
- [Webflow Designer](https://www.webflow.com/designer)
- [Webflow Features](https://www.webflow.com/features)
- [Webflow AI](https://webflow.com/ai)
- [Framer Review 2026 - CPO Club](https://cpoclub.com/tools/framer-review/)
- [Framer Review 2026 - vibecoding.app](https://vibecoding.app/blog/framer-review)
- [Webflow Review 2026 - usereviews.io](https://usereviews.io/tools/webflow)
- [Framer vs Webflow 2026 - gemeosagency](https://www.gemeosagency.com/en/blog/webflow-vs-framer-which-no-code-tool-to-choose)
- [Webflow Conf 2025 Recap](https://webflow.com/blog/webflow-conf-2025-keynote-recap)
- [Framer AI Workflow - Framer University](https://framer.university/blog/the-new-ai-workflow-for-building-websites)
- [Webflow AI Overview](https://help.webflow.com/hc/en-us/articles/34297897805715-Webflow-AI-overview)
