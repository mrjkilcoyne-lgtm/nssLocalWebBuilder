// ---------------------------------------------------------------------------
// MP Design Library — curated patterns, components, and page architectures
// ---------------------------------------------------------------------------
// MP draws from this library when building sites. Not templates —
// structural skeletons she dresses in the user's brand. Each pattern
// carries a design rationale she can explain.
// ---------------------------------------------------------------------------

export type Aesthetic = 'editorial' | 'bold' | 'minimal' | 'organic' | 'luxury' | 'playful' | 'industrial'
export type PatternCategory = 'hero' | 'navbar' | 'footer' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'gallery' | 'contact' | 'blog' | 'stats'
export type PageArchetype = 'landing' | 'portfolio' | 'restaurant' | 'saas' | 'blog' | 'agency' | 'ecommerce' | 'personal'

// ---------------------------------------------------------------------------
// Component Patterns
// ---------------------------------------------------------------------------

export interface ComponentPattern {
  id: string
  name: string
  category: PatternCategory
  aesthetic: Aesthetic
  description: string
  rationale: string
  html: string
  css: string
  tags: string[]
}

const COMPONENT_PATTERNS: ComponentPattern[] = [
  // --- Heroes ---
  {
    id: 'hero-editorial-serif',
    name: 'Editorial Serif Hero',
    category: 'hero',
    aesthetic: 'editorial',
    description: 'Full-width hero with large serif headline, generous whitespace, single CTA. The New Yorker meets modern web.',
    rationale: 'Serif headlines at scale create authority and editorial weight. The single CTA prevents decision fatigue. Generous padding lets the typography breathe.',
    html: `<section class="mp-hero-editorial">
  <div class="mp-hero-inner">
    <h1 class="mp-hero-headline">{{headline}}</h1>
    <p class="mp-hero-subtitle">{{subtitle}}</p>
    <a href="{{cta_url}}" class="mp-hero-cta">{{cta_text}}</a>
  </div>
</section>`,
    css: `.mp-hero-editorial {
  display: flex; align-items: center; justify-content: center;
  min-height: 90vh; padding: 4rem 2rem;
  background: var(--mp-bg, #faf8f4);
}
.mp-hero-inner { max-width: 720px; text-align: center; }
.mp-hero-headline {
  font-family: var(--mp-serif, 'Playfair Display', serif);
  font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 400;
  line-height: 1.1; letter-spacing: -0.02em;
  color: var(--mp-text, #1a1a1a); margin-bottom: 1.5rem;
}
.mp-hero-subtitle {
  font-family: var(--mp-body, 'Crimson Pro', serif);
  font-size: clamp(1.1rem, 2vw, 1.4rem); color: var(--mp-muted, #666);
  line-height: 1.6; margin-bottom: 2.5rem;
}
.mp-hero-cta {
  display: inline-block; padding: 0.9rem 2.5rem;
  font-family: var(--mp-body); font-size: 0.95rem;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid var(--mp-text, #1a1a1a); color: var(--mp-text);
  text-decoration: none; transition: all 0.3s ease;
}
.mp-hero-cta:hover { background: var(--mp-text); color: var(--mp-bg); }`,
    tags: ['hero', 'serif', 'editorial', 'minimal', 'elegant'],
  },
  {
    id: 'hero-bold-split',
    name: 'Bold Split Hero',
    category: 'hero',
    aesthetic: 'bold',
    description: 'Two-column hero: headline left, image right. Strong visual impact with asymmetric layout.',
    rationale: 'The split layout creates visual tension and guides the eye left-to-right. Works brilliantly for product launches and portfolios where the image needs equal weight.',
    html: `<section class="mp-hero-split">
  <div class="mp-hero-split-content">
    <h1>{{headline}}</h1>
    <p>{{subtitle}}</p>
    <a href="{{cta_url}}" class="mp-btn-primary">{{cta_text}}</a>
  </div>
  <div class="mp-hero-split-media">
    <img src="{{image_url}}" alt="{{image_alt}}" />
  </div>
</section>`,
    css: `.mp-hero-split {
  display: grid; grid-template-columns: 1fr 1fr;
  min-height: 90vh; overflow: hidden;
}
.mp-hero-split-content {
  display: flex; flex-direction: column; justify-content: center;
  padding: 4rem 6%; gap: 1.5rem;
}
.mp-hero-split-content h1 {
  font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700;
  line-height: 1.05; letter-spacing: -0.03em;
}
.mp-hero-split-media { overflow: hidden; }
.mp-hero-split-media img {
  width: 100%; height: 100%; object-fit: cover;
}
@media (max-width: 768px) {
  .mp-hero-split { grid-template-columns: 1fr; }
  .mp-hero-split-media { max-height: 50vh; }
}`,
    tags: ['hero', 'split', 'bold', 'two-column', 'image'],
  },
  {
    id: 'hero-luxury-minimal',
    name: 'Luxury Minimal Hero',
    category: 'hero',
    aesthetic: 'luxury',
    description: 'Dark background, centred headline with extreme letter-spacing, brass accent line. Members-club entrance.',
    rationale: 'Darkness creates intimacy and luxury. Wide letter-spacing at large sizes reads as confidence, not shouting. The accent line is a brass fixture.',
    html: `<section class="mp-hero-luxury">
  <div class="mp-hero-luxury-inner">
    <div class="mp-hero-luxury-rule"></div>
    <h1>{{headline}}</h1>
    <p>{{subtitle}}</p>
  </div>
</section>`,
    css: `.mp-hero-luxury {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; padding: 4rem 2rem;
  background: #110f0b;
  background-image: radial-gradient(ellipse at 50% 40%, rgba(201,169,110,0.06) 0%, transparent 60%);
}
.mp-hero-luxury-inner { text-align: center; max-width: 640px; }
.mp-hero-luxury-rule {
  width: 60px; height: 1px; margin: 0 auto 2rem;
  background: linear-gradient(to right, transparent, #c9a96e, transparent);
}
.mp-hero-luxury h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 4rem); font-weight: 400;
  letter-spacing: 0.12em; color: #f5f0e8; margin-bottom: 1.5rem;
}
.mp-hero-luxury p {
  font-family: 'Crimson Pro', serif; font-size: 1.1rem;
  color: #8c7e6a; letter-spacing: 0.05em;
}`,
    tags: ['hero', 'luxury', 'dark', 'gold', 'minimal', 'members-club'],
  },

  // --- Navigation ---
  {
    id: 'nav-editorial',
    name: 'Editorial Navigation',
    category: 'navbar',
    aesthetic: 'editorial',
    description: 'Clean horizontal nav with serif wordmark, understated links, no hamburger on desktop.',
    rationale: 'Editorial sites earn trust through simplicity. The wordmark in serif establishes brand authority. Links are quiet until hovered.',
    html: `<nav class="mp-nav-editorial">
  <a href="/" class="mp-nav-wordmark">{{brand}}</a>
  <ul class="mp-nav-links">
    <li><a href="{{link1_url}}">{{link1}}</a></li>
    <li><a href="{{link2_url}}">{{link2}}</a></li>
    <li><a href="{{link3_url}}">{{link3}}</a></li>
    <li><a href="{{cta_url}}" class="mp-nav-cta">{{cta}}</a></li>
  </ul>
</nav>`,
    css: `.mp-nav-editorial {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 4%; border-bottom: 1px solid rgba(0,0,0,0.08);
}
.mp-nav-wordmark {
  font-family: var(--mp-serif, 'Playfair Display', serif);
  font-size: 1.3rem; text-decoration: none; color: inherit;
  letter-spacing: 0.04em;
}
.mp-nav-links {
  display: flex; gap: 2rem; list-style: none; align-items: center;
}
.mp-nav-links a {
  font-size: 0.85rem; text-decoration: none; color: var(--mp-muted, #666);
  letter-spacing: 0.04em; transition: color 0.2s;
}
.mp-nav-links a:hover { color: var(--mp-text, #1a1a1a); }
.mp-nav-cta {
  padding: 0.5rem 1.2rem !important;
  border: 1px solid currentColor !important; border-radius: 2px;
}`,
    tags: ['nav', 'navigation', 'editorial', 'clean', 'serif'],
  },

  // --- Features ---
  {
    id: 'features-grid-minimal',
    name: 'Minimal Features Grid',
    category: 'features',
    aesthetic: 'minimal',
    description: 'Three-column grid with icon, heading, short description. No backgrounds, no cards — just content.',
    rationale: 'Features grids fail when they compete for attention. Minimal treatment lets the content speak. The grid structure provides visual rhythm without decoration.',
    html: `<section class="mp-features-minimal">
  <h2>{{section_heading}}</h2>
  <div class="mp-features-grid">
    <div class="mp-feature">
      <div class="mp-feature-icon">{{icon1}}</div>
      <h3>{{title1}}</h3>
      <p>{{desc1}}</p>
    </div>
    <div class="mp-feature">
      <div class="mp-feature-icon">{{icon2}}</div>
      <h3>{{title2}}</h3>
      <p>{{desc2}}</p>
    </div>
    <div class="mp-feature">
      <div class="mp-feature-icon">{{icon3}}</div>
      <h3>{{title3}}</h3>
      <p>{{desc3}}</p>
    </div>
  </div>
</section>`,
    css: `.mp-features-minimal {
  padding: 6rem 4%; max-width: 1100px; margin: 0 auto;
}
.mp-features-minimal h2 {
  font-family: var(--mp-serif); font-size: 2rem; font-weight: 400;
  text-align: center; margin-bottom: 4rem;
}
.mp-features-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem;
}
.mp-feature-icon { font-size: 1.5rem; margin-bottom: 1rem; }
.mp-feature h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
.mp-feature p { font-size: 0.95rem; line-height: 1.6; color: var(--mp-muted, #666); }
@media (max-width: 768px) {
  .mp-features-grid { grid-template-columns: 1fr; }
}`,
    tags: ['features', 'grid', 'minimal', 'three-column', 'clean'],
  },

  // --- Pricing ---
  {
    id: 'pricing-elegant',
    name: 'Elegant Pricing',
    category: 'pricing',
    aesthetic: 'luxury',
    description: 'Three-tier pricing with subtle card borders, highlighted recommended plan. No aggressive colours.',
    rationale: 'Pricing is a trust moment. Elegant presentation signals confidence in value. The highlighted plan uses a warm accent, not a screaming gradient.',
    html: `<section class="mp-pricing-elegant">
  <h2>{{heading}}</h2>
  <p class="mp-pricing-subtitle">{{subtitle}}</p>
  <div class="mp-pricing-grid">
    <div class="mp-pricing-card">
      <h3>{{tier1_name}}</h3>
      <div class="mp-pricing-price">{{tier1_price}}</div>
      <p>{{tier1_desc}}</p>
      <a href="{{tier1_url}}" class="mp-pricing-btn">Get started</a>
    </div>
    <div class="mp-pricing-card mp-pricing-featured">
      <h3>{{tier2_name}}</h3>
      <div class="mp-pricing-price">{{tier2_price}}</div>
      <p>{{tier2_desc}}</p>
      <a href="{{tier2_url}}" class="mp-pricing-btn">Get started</a>
    </div>
    <div class="mp-pricing-card">
      <h3>{{tier3_name}}</h3>
      <div class="mp-pricing-price">{{tier3_price}}</div>
      <p>{{tier3_desc}}</p>
      <a href="{{tier3_url}}" class="mp-pricing-btn">Get started</a>
    </div>
  </div>
</section>`,
    css: `.mp-pricing-elegant { padding: 6rem 4%; text-align: center; }
.mp-pricing-elegant h2 { font-family: var(--mp-serif); font-size: 2rem; font-weight: 400; }
.mp-pricing-subtitle { color: var(--mp-muted); margin: 1rem 0 3rem; }
.mp-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 960px; margin: 0 auto; }
.mp-pricing-card { padding: 2.5rem 2rem; border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; }
.mp-pricing-featured { border-color: var(--mp-gold, #c9a96e); box-shadow: 0 0 30px rgba(201,169,110,0.08); }
.mp-pricing-price { font-family: var(--mp-serif); font-size: 2.5rem; margin: 1rem 0; }
.mp-pricing-btn {
  display: inline-block; margin-top: 1.5rem; padding: 0.7rem 2rem;
  border: 1px solid currentColor; text-decoration: none; color: inherit;
  font-size: 0.85rem; letter-spacing: 0.06em; transition: all 0.3s;
}
.mp-pricing-featured .mp-pricing-btn { background: var(--mp-gold, #c9a96e); border-color: transparent; color: #fff; }
@media (max-width: 768px) { .mp-pricing-grid { grid-template-columns: 1fr; } }`,
    tags: ['pricing', 'elegant', 'three-tier', 'luxury', 'cards'],
  },

  // --- Footer ---
  {
    id: 'footer-refined',
    name: 'Refined Footer',
    category: 'footer',
    aesthetic: 'editorial',
    description: 'Three-column footer with wordmark, link groups, and newsletter signup. Subtle top border.',
    rationale: 'The footer is the last impression. A refined footer signals professionalism and completeness. The top border provides visual closure.',
    html: `<footer class="mp-footer-refined">
  <div class="mp-footer-inner">
    <div class="mp-footer-brand">
      <span class="mp-footer-wordmark">{{brand}}</span>
      <p>{{tagline}}</p>
    </div>
    <div class="mp-footer-links">
      <h4>{{col1_title}}</h4>
      <a href="#">{{col1_link1}}</a>
      <a href="#">{{col1_link2}}</a>
      <a href="#">{{col1_link3}}</a>
    </div>
    <div class="mp-footer-links">
      <h4>{{col2_title}}</h4>
      <a href="#">{{col2_link1}}</a>
      <a href="#">{{col2_link2}}</a>
      <a href="#">{{col2_link3}}</a>
    </div>
  </div>
  <div class="mp-footer-bottom">
    <span>&copy; {{year}} {{brand}}</span>
  </div>
</footer>`,
    css: `.mp-footer-refined {
  border-top: 1px solid rgba(0,0,0,0.08); padding: 4rem 4% 2rem;
}
.mp-footer-inner { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
.mp-footer-wordmark { font-family: var(--mp-serif); font-size: 1.2rem; display: block; margin-bottom: 0.5rem; }
.mp-footer-brand p { font-size: 0.9rem; color: var(--mp-muted); max-width: 280px; }
.mp-footer-links { display: flex; flex-direction: column; gap: 0.5rem; }
.mp-footer-links h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mp-muted); margin-bottom: 0.5rem; }
.mp-footer-links a { font-size: 0.9rem; text-decoration: none; color: inherit; transition: color 0.2s; }
.mp-footer-links a:hover { color: var(--mp-gold, #c9a96e); }
.mp-footer-bottom { font-size: 0.8rem; color: var(--mp-muted); padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.05); }
@media (max-width: 768px) { .mp-footer-inner { grid-template-columns: 1fr; } }`,
    tags: ['footer', 'refined', 'editorial', 'three-column', 'clean'],
  },
]

// ---------------------------------------------------------------------------
// Page Architectures
// ---------------------------------------------------------------------------

export interface PageArchitecture {
  id: string
  name: string
  archetype: PageArchetype
  description: string
  sections: string[] // ordered component pattern IDs
  rationale: string
  tags: string[]
}

const PAGE_ARCHITECTURES: PageArchitecture[] = [
  {
    id: 'page-restaurant',
    name: 'Restaurant Landing',
    archetype: 'restaurant',
    description: 'Warm, inviting restaurant page. Hero with atmosphere photo, menu collection, reservation CTA, location and hours.',
    sections: ['hero-luxury-minimal', 'features-grid-minimal', 'pricing-elegant', 'footer-refined'],
    rationale: 'Restaurants sell atmosphere before food. The luxury hero creates mood. Features become the menu highlights. Pricing becomes the menu itself.',
    tags: ['restaurant', 'cafe', 'bar', 'food', 'hospitality'],
  },
  {
    id: 'page-portfolio',
    name: 'Creative Portfolio',
    archetype: 'portfolio',
    description: 'Minimal portfolio with editorial hero, project grid, about section, contact.',
    sections: ['hero-editorial-serif', 'features-grid-minimal', 'footer-refined'],
    rationale: 'Portfolios need to get out of the way and let the work speak. Editorial treatment adds authority without competing.',
    tags: ['portfolio', 'creative', 'designer', 'photographer', 'artist'],
  },
  {
    id: 'page-saas',
    name: 'SaaS Product',
    archetype: 'saas',
    description: 'Product landing with bold split hero, feature grid, pricing tiers, CTA footer.',
    sections: ['hero-bold-split', 'features-grid-minimal', 'pricing-elegant', 'footer-refined'],
    rationale: 'SaaS pages need to show and tell simultaneously. The split hero gives equal weight to headline and product screenshot.',
    tags: ['saas', 'product', 'startup', 'app', 'software'],
  },
]

// ---------------------------------------------------------------------------
// Design DNA — colour palettes, typography pairings, spacing rhythms
// ---------------------------------------------------------------------------

export interface DesignDNA {
  id: string
  name: string
  aesthetic: Aesthetic
  colours: {
    background: string
    surface: string
    text: string
    muted: string
    accent: string
    accentHover: string
  }
  typography: {
    display: string
    body: string
    mono: string
  }
  spacing: {
    sectionPadding: string
    contentMaxWidth: string
    gap: string
  }
  description: string
}

const DESIGN_DNA: DesignDNA[] = [
  {
    id: 'dna-editorial-warm',
    name: 'Editorial Warm',
    aesthetic: 'editorial',
    colours: {
      background: '#faf8f4',
      surface: '#f0ede6',
      text: '#1a1a1a',
      muted: '#7a7468',
      accent: '#c9a96e',
      accentHover: '#b8964e',
    },
    typography: {
      display: '"Playfair Display", serif',
      body: '"Crimson Pro", serif',
      mono: '"JetBrains Mono", monospace',
    },
    spacing: {
      sectionPadding: '6rem 4%',
      contentMaxWidth: '1100px',
      gap: '2rem',
    },
    description: 'Warm cream backgrounds, serif typography, gold accents. The Financial Times meets Kinfolk.',
  },
  {
    id: 'dna-luxury-dark',
    name: 'Luxury Dark',
    aesthetic: 'luxury',
    colours: {
      background: '#110f0b',
      surface: '#1a1610',
      text: '#f5f0e8',
      muted: '#8c7e6a',
      accent: '#c9a96e',
      accentHover: '#dbb87a',
    },
    typography: {
      display: '"Playfair Display", serif',
      body: '"Crimson Pro", serif',
      mono: '"JetBrains Mono", monospace',
    },
    spacing: {
      sectionPadding: '6rem 4%',
      contentMaxWidth: '960px',
      gap: '2rem',
    },
    description: 'Deep walnut backgrounds, cream text, brass accents. A private members\u2019 club after hours.',
  },
  {
    id: 'dna-bold-modern',
    name: 'Bold Modern',
    aesthetic: 'bold',
    colours: {
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#0a0a0a',
      muted: '#666666',
      accent: '#0a0a0a',
      accentHover: '#333333',
    },
    typography: {
      display: '"Inter", sans-serif',
      body: '"Inter", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    spacing: {
      sectionPadding: '5rem 4%',
      contentMaxWidth: '1200px',
      gap: '1.5rem',
    },
    description: 'High contrast black and white. No decoration, no colour — pure structure and typography.',
  },
]

// ---------------------------------------------------------------------------
// Query API — how MP searches the library
// ---------------------------------------------------------------------------

export function getPattern(
  category: PatternCategory,
  filters?: { aesthetic?: Aesthetic; tags?: string[] },
): ComponentPattern[] {
  return COMPONENT_PATTERNS.filter(p => {
    if (p.category !== category) return false
    if (filters?.aesthetic && p.aesthetic !== filters.aesthetic) return false
    if (filters?.tags) {
      const hasAllTags = filters.tags.every(t =>
        p.tags.some(pt => pt.includes(t.toLowerCase()))
      )
      if (!hasAllTags) return false
    }
    return true
  })
}

export function getPageArchitecture(
  archetype: PageArchetype,
): PageArchitecture | undefined {
  return PAGE_ARCHITECTURES.find(p => p.archetype === archetype)
}

export function getDesignDNA(aesthetic: Aesthetic): DesignDNA | undefined {
  return DESIGN_DNA.find(d => d.aesthetic === aesthetic)
}

export function searchPatterns(query: string): ComponentPattern[] {
  const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  if (words.length === 0) return COMPONENT_PATTERNS

  return COMPONENT_PATTERNS
    .map(p => {
      const searchable = `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase()
      const score = words.filter(w => searchable.includes(w)).length
      return { pattern: p, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.pattern)
}

export function getAllPatterns(): ComponentPattern[] {
  return COMPONENT_PATTERNS
}

export function getAllPageArchitectures(): PageArchitecture[] {
  return PAGE_ARCHITECTURES
}

export function getAllDesignDNA(): DesignDNA[] {
  return DESIGN_DNA
}
