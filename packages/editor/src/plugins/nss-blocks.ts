import type { Editor } from 'grapesjs'

export function nssBlocksPlugin(editor: Editor) {
  const bm = editor.BlockManager

  // --- Layout Blocks ---

  bm.add('section', {
    label: 'Section',
    category: 'Layout',
    content: `<section style="padding: 60px 24px; max-width: 1200px; margin: 0 auto;">
      <div data-gjs-type="text" style="text-align: center; font-size: 14px; color: #737373;">Drop content here</div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`,
  })

  bm.add('container', {
    label: 'Container',
    category: 'Layout',
    content: `<div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;"></div>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="4 2"/></svg>`,
  })

  bm.add('columns-2', {
    label: '2 Columns',
    category: 'Layout',
    content: `<div style="display: flex; gap: 24px; padding: 24px;">
      <div style="flex: 1; padding: 24px; min-height: 100px; background: #f9fafb; border-radius: 8px;"></div>
      <div style="flex: 1; padding: 24px; min-height: 100px; background: #f9fafb; border-radius: 8px;"></div>
    </div>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="9" height="16" rx="1"/><rect x="13" y="4" width="9" height="16" rx="1"/></svg>`,
  })

  bm.add('columns-3', {
    label: '3 Columns',
    category: 'Layout',
    content: `<div style="display: flex; gap: 24px; padding: 24px;">
      <div style="flex: 1; padding: 24px; min-height: 100px; background: #f9fafb; border-radius: 8px;"></div>
      <div style="flex: 1; padding: 24px; min-height: 100px; background: #f9fafb; border-radius: 8px;"></div>
      <div style="flex: 1; padding: 24px; min-height: 100px; background: #f9fafb; border-radius: 8px;"></div>
    </div>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="6" height="16" rx="1"/><rect x="9" y="4" width="6" height="16" rx="1"/><rect x="17" y="4" width="6" height="16" rx="1"/></svg>`,
  })

  // --- Hero Blocks ---

  bm.add('hero-centered', {
    label: 'Hero Centered',
    category: 'Hero',
    content: `<section style="padding: 120px 24px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h1 style="font-size: 48px; font-weight: 700; line-height: 1.1; margin-bottom: 24px;">Build Something Beautiful</h1>
        <p style="font-size: 20px; color: #94a3b8; line-height: 1.6; margin-bottom: 40px;">Create stunning websites with drag-and-drop simplicity. No code required.</p>
        <a href="#" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
      </div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><rect x="9" y="15" width="6" height="3" rx="1"/></svg>`,
  })

  bm.add('hero-split', {
    label: 'Hero Split',
    category: 'Hero',
    content: `<section style="display: flex; align-items: center; min-height: 600px; padding: 60px 24px;">
      <div style="flex: 1; padding-right: 60px;">
        <h1 style="font-size: 48px; font-weight: 700; line-height: 1.1; margin-bottom: 24px; color: #0f172a;">Your Next Big Idea Starts Here</h1>
        <p style="font-size: 18px; color: #64748b; line-height: 1.6; margin-bottom: 32px;">Everything you need to launch, grow, and scale your online presence.</p>
        <div style="display: flex; gap: 16px;">
          <a href="#" style="padding: 14px 28px; background: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Free</a>
          <a href="#" style="padding: 14px 28px; border: 2px solid #e2e8f0; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 600;">Learn More</a>
        </div>
      </div>
      <div style="flex: 1; background: #f1f5f9; border-radius: 16px; min-height: 400px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">Image Placeholder</div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="9" height="16" rx="1"/><rect x="13" y="4" width="9" height="16" rx="1"/><line x1="4" y1="8" x2="9" y2="8"/><line x1="4" y1="11" x2="8" y2="11"/></svg>`,
  })

  // --- Content Blocks ---

  bm.add('text-block', {
    label: 'Text',
    category: 'Content',
    content: `<div data-gjs-type="text" style="padding: 16px; font-size: 16px; line-height: 1.7; color: #374151;">
      <p>Start typing your content here. Click to edit this text block. You can format text, add links, and create rich content.</p>
    </div>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7V4h16v3"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>`,
  })

  bm.add('heading', {
    label: 'Heading',
    category: 'Content',
    content: `<h2 data-gjs-type="text" style="font-size: 36px; font-weight: 700; color: #0f172a; padding: 16px;">Your Heading Here</h2>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4v16"/><path d="M20 4v16"/><path d="M4 12h16"/></svg>`,
  })

  bm.add('image', {
    label: 'Image',
    category: 'Content',
    content: {
      type: 'image',
      style: { width: '100%', 'border-radius': '8px' },
      attributes: { alt: 'Image description' },
    },
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  })

  bm.add('button', {
    label: 'Button',
    category: 'Content',
    content: `<a href="#" style="display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;">Click Me</a>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="8" rx="4"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  })

  bm.add('divider', {
    label: 'Divider',
    category: 'Content',
    content: `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  })

  // --- Feature Blocks ---

  bm.add('feature-grid', {
    label: 'Feature Grid',
    category: 'Sections',
    content: `<section style="padding: 80px 24px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; font-weight: 700; text-align: center; margin-bottom: 16px; color: #0f172a;">Features</h2>
        <p style="text-align: center; color: #64748b; font-size: 18px; margin-bottom: 60px; max-width: 600px; margin-left: auto; margin-right: auto;">Everything you need to succeed online</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="width: 48px; height: 48px; background: #eff6ff; border-radius: 10px; margin-bottom: 20px;"></div>
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #0f172a;">Feature One</h3>
            <p style="color: #64748b; line-height: 1.6;">Describe your amazing feature here. Keep it concise and compelling.</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="width: 48px; height: 48px; background: #f0fdf4; border-radius: 10px; margin-bottom: 20px;"></div>
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #0f172a;">Feature Two</h3>
            <p style="color: #64748b; line-height: 1.6;">Describe your amazing feature here. Keep it concise and compelling.</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 10px; margin-bottom: 20px;"></div>
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #0f172a;">Feature Three</h3>
            <p style="color: #64748b; line-height: 1.6;">Describe your amazing feature here. Keep it concise and compelling.</p>
          </div>
        </div>
      </div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="6" height="8" rx="1"/><rect x="9" y="3" width="6" height="8" rx="1"/><rect x="17" y="3" width="6" height="8" rx="1"/><rect x="1" y="13" width="6" height="8" rx="1"/><rect x="9" y="13" width="6" height="8" rx="1"/><rect x="17" y="13" width="6" height="8" rx="1"/></svg>`,
  })

  bm.add('cta-banner', {
    label: 'CTA Banner',
    category: 'Sections',
    content: `<section style="padding: 80px 24px; background: #0f172a; color: white; text-align: center;">
      <div style="max-width: 700px; margin: 0 auto;">
        <h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">Ready to Get Started?</h2>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 40px;">Join thousands of creators building beautiful websites today.</p>
        <a href="#" style="display: inline-block; padding: 16px 40px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">Start Building</a>
      </div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><rect x="8" y="13" width="8" height="2" rx="1"/></svg>`,
  })

  // --- Navigation ---

  bm.add('navbar', {
    label: 'Navbar',
    category: 'Navigation',
    content: `<nav style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1200px; margin: 0 auto;">
      <div style="font-size: 20px; font-weight: 700; color: #0f172a;">YourBrand</div>
      <div style="display: flex; gap: 32px; align-items: center;">
        <a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">Home</a>
        <a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">About</a>
        <a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">Services</a>
        <a href="#" style="color: #64748b; text-decoration: none; font-weight: 500;">Contact</a>
        <a href="#" style="padding: 10px 20px; background: #0f172a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Get Started</a>
      </div>
    </nav>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  })

  bm.add('footer', {
    label: 'Footer',
    category: 'Navigation',
    content: `<footer style="padding: 60px 24px 32px; background: #0f172a; color: white;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">YourBrand</div>
          <p style="color: #94a3b8; line-height: 1.6; max-width: 300px;">Building the future of the web, one pixel at a time.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-bottom: 16px;">Product</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">Features</a>
            <a href="#" style="color: #94a3b8; text-decoration: none;">Pricing</a>
            <a href="#" style="color: #94a3b8; text-decoration: none;">Templates</a>
          </div>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-bottom: 16px;">Company</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">About</a>
            <a href="#" style="color: #94a3b8; text-decoration: none;">Blog</a>
            <a href="#" style="color: #94a3b8; text-decoration: none;">Careers</a>
          </div>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-bottom: 16px;">Legal</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy</a>
            <a href="#" style="color: #94a3b8; text-decoration: none;">Terms</a>
          </div>
        </div>
      </div>
      <div style="border-top: 1px solid #1e293b; padding-top: 24px; text-align: center; color: #64748b; font-size: 14px;">
        &copy; 2026 YourBrand. All rights reserved.
      </div>
    </footer>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="17" x2="10" y2="17"/><line x1="14" y1="17" x2="18" y2="17"/></svg>`,
  })

  // --- Form ---

  bm.add('contact-form', {
    label: 'Contact Form',
    category: 'Forms',
    content: `<section style="padding: 80px 24px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #0f172a;">Get in Touch</h2>
        <p style="text-align: center; color: #64748b; margin-bottom: 40px;">We'd love to hear from you.</p>
        <form style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; gap: 16px;">
            <input type="text" placeholder="First Name" style="flex: 1; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none;" />
            <input type="text" placeholder="Last Name" style="flex: 1; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none;" />
          </div>
          <input type="email" placeholder="Email Address" style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none;" />
          <textarea placeholder="Your Message" rows="5" style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; resize: vertical;"></textarea>
          <button type="submit" style="padding: 16px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer;">Send Message</button>
        </form>
      </div>
    </section>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>`,
  })
}
