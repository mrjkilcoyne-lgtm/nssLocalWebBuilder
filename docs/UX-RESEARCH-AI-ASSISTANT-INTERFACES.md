# AI Assistant Interface UX Research
## Competitive Analysis for MP Concierge Design

**Researcher:** Claude (UX Research Agent)
**Date:** 1 April 2026
**Sites Studied:** v0.dev, Cursor, Linear, Notion AI, bolt.new, Lovable.dev

---

## 1. v0.dev (Vercel)

### Chat Panel Design
- **Position:** Centred on landing; left panel in workspace (chat left, preview right)
- **Initial state:** Full-width centred prompt with hero text "What do you want to create?"
- **Input:** Large rounded textarea with soft border, ~600px wide centred. Placeholder: "Ask v0 to build..."
- **Model selector:** Bottom-left of input area, dropdown labelled "v0 Max" with icon. Subtle, does not dominate
- **Microphone button:** Bottom-right of input, circular icon for voice input
- **Suggestion chips:** Row of pill-shaped buttons below input (Contact Form, Image Editor, Mini Game, Finance Calculator) with leading icons and a refresh/shuffle button
- **Background:** Clean white (#FFFFFF), minimal chrome. Very Vercel -- Swiss, functional
- **Nav bar:** Minimal top bar with logo, Templates dropdown, Resources, Enterprise, Pricing, iOS, Students, FAQ, Sign In/Sign Up

### Message Rendering
- In workspace mode: Chat messages on left, live preview on right (split-pane, approximately 40/60)
- Code blocks with syntax highlighting, file-path labels (e.g. `app/page.tsx +52 -0`), diff indicators showing lines added/removed in green/red
- AI responses include natural language explanation followed by file change cards
- File change cards show filename, +/- line counts as coloured badges

### Loading/Streaming States
- Real-time preview updates as code generates
- "Read about-acme.md" / "Read brand-guidelines.pdf" -- shows file reading steps as discrete log entries
- "Thought 6s" -- explicit thinking time displayed
- Token-by-token streaming of text responses

### Multi-step Workflows
- Sequential task steps shown as an activity log: Read file -> Think -> Generate code -> Show preview
- Each step is a discrete, visible entry in the chat thread

### Agent/Tool Visibility
- File reads shown explicitly ("Read about-acme.md")
- Thinking time shown ("Thought 6s")
- File changes shown as cards with diffs
- Very transparent about what the AI did

### Templates
- Grid of template cards below the prompt (Apps and Games, Landing Pages, Components, Dashboards)
- Each template has a thumbnail preview image, title, and description
- "Browse all" link for full template gallery

### Key Patterns for MP
- **The centred hero prompt is the gold standard for first-touch** -- simple, inviting, no friction
- **Suggestion chips reduce blank-page anxiety** -- critical for non-technical users
- **Model selector as understated dropdown** -- power users can change, beginners ignore it
- **Split-pane workspace** (chat left, preview right) -- essential for any builder tool
- **Transparent tool steps** -- users trust AI more when they can see what it read and did

---

## 2. Cursor

### Chat Panel Design
- **Layout:** Three-panel design -- Task sidebar (left), Chat centre, Preview/output (right)
- **Left sidebar:** Shows task list with status indicators:
  - "IN PROGRESS 2" section with animated sparkle icons and status text ("Fetching data", "Generating plan")
  - "READY FOR REVIEW 4" section with completed tasks, timestamps ("now", "10m", "30m", "45m"), and summary text
  - Tasks show diff stats in coloured text (e.g. "+135 -21" in green/red)
- **Centre panel:** Full chat interface with title bar showing task name, chat history, and message input
- **Right panel:** Live browser preview (embedded localhost:3000) showing the actual running application
- **Background:** Warm off-white/cream (#FAF9F6 approximate), very warm and premium feeling
- **Window chrome:** macOS-style traffic light dots (red/yellow/green) at top-left

### Message Rendering
- User messages in quoted/indented blocks with subtle left border
- AI responses stream as natural text
- File read operations shown as monospace log entries: "Read about-acme.md", "Read brand-guidelines.pdf"
- "Thought 6s" indicator for reasoning time
- File change cards: icon + filename + diff stats ("+52 -0" in green/red)
- Completion summary in natural language below the changes

### Loading/Streaming States
- Sparkle/star animated icon next to in-progress tasks
- Status text updates below task name ("Fetching data", "Generating plan")
- Tasks move from "IN PROGRESS" to "READY FOR REVIEW" sections
- Timestamps show relative time ("now", "10m", "30m", "45m")

### Multi-step Workflows
- Task sidebar acts as a kanban-style workflow tracker
- Multiple tasks can run simultaneously
- Each task has its own chat thread
- Tasks show discrete steps (read, think, generate, apply)

### Agent/Tool Visibility
- Explicit file reads logged
- Thinking time quantified
- File changes shown with diffs
- Terminal commands visible
- Browser preview updates in real-time
- GitHub integration visible (PRs, branches)

### Keyboard Shortcuts
- **Cmd+L:** Open chat panel
- **Cmd+K:** Inline code generation / command palette
- **Tab:** Accept AI suggestions (inline completions)
- **Cmd+I:** Composer mode (multi-file editing)

### Key Patterns for MP
- **Three-panel layout is the aspirational standard** -- task list / chat / preview
- **Task sidebar with status grouping** (In Progress / Ready for Review) is superb for managing multiple builds
- **Warm off-white background** is more inviting than pure white or dark -- fits "understated luxury"
- **Relative timestamps** make the interface feel alive
- **Diff stats on file cards** (+52 -0) give instant feedback on change magnitude
- **The sparkle animation** for in-progress work is subtle and premium

---

## 3. Linear

### Chat Panel Design
- **Theme:** Full dark mode -- near-black background (#1A1A1A approximate), white/grey text
- **Layout:** Three-panel -- Sidebar navigation (left), Issue detail (centre), Properties panel (right)
- **Sidebar:** Compact nav with workspace selector, search icon, compose icon, then sections: Inbox, My issues, Reviews, Pulse, Workspace (Initiatives, Projects, More), Favourites
- **AI Agent chat:** Embedded directly into the issue activity feed -- not a separate panel
- **Agent messages:** Appear inline with human messages, distinguished by bot icon and name ("Cursor")
- **Message input:** "Message Cursor..." placeholder at bottom of the activity feed/properties panel

### Message Rendering
- Human messages: Avatar + name + relative timestamp + message text
- Agent messages: Bot icon + "Cursor" label + status text ("Examining issue ENG-2703")
- @mentions rendered as interactive links ("@Cursor can you take a stab at this?")
- Status changes shown inline: "Cursor moved from Todo to In Progress - just now"
- Code/technical references in monospace: `vehicle_state`, `isFullySynced`, `syncStatus`
- Git activity: Repository name, Branch name, file change stats, merge status with coloured indicators

### Loading/Streaming States
- Agent status shown as activity entry: "Examining issue ENG-2703"
- "Worked for 2min" -- explicit work duration
- Status transitions logged: "moved from Todo to In Progress"
- Integration status shown: "jori connected Cursor - just now"

### Multi-step Workflows
- Work is tracked as issue state transitions (Todo -> In Progress -> Done)
- Agent actions appear chronologically in the activity feed
- Git operations (branch, commit, PR, merge) shown as linked cards
- Results include: Repository, Branch, Changed files with diffs, Merge status

### Agent/Tool Visibility
- **Highly transparent:** Every agent action logged in the activity feed
- File changes with diff counts (+2 -3)
- Merge operations with source/target branches
- Work duration tracked
- Connected tool integrations visible

### Keyboard Shortcuts
- **Cmd+K:** Command palette (universal search and action)
- **Cmd+J:** Open Linear Agent chat
- **C:** Create new issue
- **S:** Set status
- Extensive vim-style keyboard navigation

### Command Palette (Cmd+K)
- Universal search across issues, projects, teams
- Quick actions (create, assign, change status)
- Fuzzy matching
- Recently used actions

### Key Patterns for MP
- **Agent as team member in activity feed** -- not a separate chat, but a colleague in the conversation. Brilliant for transparency
- **Cmd+K command palette** is the gold standard for power users -- must have
- **Cmd+J for AI chat** as a separate shortcut -- quick invocation
- **Dark mode done right** -- not harsh, but deep and professional
- **Work duration visibility** ("Worked for 2min") builds trust
- **Status transitions as first-class events** -- users see the AI moving work forward
- **@mention to invoke AI** is natural and familiar from Slack

---

## 4. Notion AI

### Chat Panel Design
- **Theme:** Light mode, clean white with subtle warm grey accents
- **AI positioning:** "Meet your 24/7 AI team" -- framed as team members, not tools
- **Invocation:** Multiple entry points:
  - Inline in documents (slash command /ai or space bar)
  - Dedicated AI chat panel
  - Custom Agents that run autonomously on triggers/schedules
  - @mention in pages
- **Background:** Clean white with Notion's signature light UI

### Agent Types
- **Notion Agent:** Conversational AI that works in your workspace context -- answers questions, creates/edits pages and databases
- **Custom Agents:** Automated workflows with triggers or schedules, run 24/7. One person builds, whole team benefits
- **Research Mode:** Deep research that generates detailed reports and summaries
- **AI Autofill:** Fills database columns automatically based on page content

### Message Rendering
- AI responses appear inline within documents -- not in a separate panel
- Can generate structured content: tables, databases, formatted text
- Meeting notes with transcription, key points, action items
- Status updates generated from database context

### Loading/Streaming States
- Token-by-token streaming for inline generation
- Progress indicators for multi-step agent work
- Research mode shows explicit progress through research steps

### Multi-step Workflows
- Custom Agents handle multi-step work across workspace and connected tools
- Triggers and schedules for autonomous execution
- Cross-tool integration (Slack, GitHub, Google Drive, Intercom, Zendesk, Gong)

### Agent/Tool Visibility
- Connected apps shown: Slack, GitHub, Google Drive
- Agent actions logged
- Research mode shows sources and steps
- Database autofill shows which fields were generated

### Key Patterns for MP
- **Inline AI invocation** (slash commands) is the most natural entry point for content creation
- **Custom Agents with triggers** -- brilliant for automation (e.g. "when a new enquiry comes in, draft a response")
- **AI as team member framing** is emotionally compelling
- **Research Mode** as a distinct capability -- useful for MP doing competitor research or content generation
- **Autofill for databases** -- directly applicable to MP filling in site content, SEO fields, meta descriptions

---

## 5. bolt.new (StackBlitz)

### Chat Panel Design
- **Position:** Left panel chat, right panel live preview (similar to v0)
- **Landing:** Centred prompt with "The #1 professional vibe coding tool"
- **Theme:** Dark mode with gradient accents
- **Design Systems:** Recently introduced, suggesting template-based starting points

### Message Rendering
- Chat messages with code generation
- Live preview in embedded browser
- File tree visible for project structure
- Terminal output integrated

### Loading/Streaming States
- Real-time code generation with preview updates
- WebContainer technology for instant preview without server deployment

### Key Patterns for MP
- **WebContainer-style instant preview** -- no deploy step, instant feedback
- **File tree visibility** gives users confidence about what was created

---

## 6. Lovable.dev

### Chat Panel Design
- **Position:** Centred hero prompt on landing, left chat in workspace
- **Landing text:** "Build something Lovable" -- warm, inviting
- **Input:** Large rounded textarea with cream/warm-white background (#FAF5E8 approximate)
- **Placeholder:** "Ask Lovable to create a web app that..."
- **Input controls:** Plus button (attachments) left, clipboard icon, microphone icon, send arrow right
- **Background:** Gradient from light blue through white to pink/orange -- warm, creative, joyful
- **Theme:** Light mode with warm pastels

### Templates
- Grid layout, 4 columns
- Template cards with thumbnail previews, title, and one-line description
- Categories: Personal portfolio, Slides, Architecture, Fashion blog, Event platform, Personal blog, Lifestyle blog
- "View all" button for full gallery

### Key Patterns for MP
- **Warm gradient background** creates emotional warmth -- good for creative tools
- **"Build something Lovable"** -- the naming/copy creates emotional connection
- **Attachment support** (+ button) for uploading images/docs with prompts
- **Voice input** as standard -- accessibility and convenience
- **Template thumbnails** are full visual previews, not abstract icons

---

## Synthesis: Best Patterns for MP

### 1. CHAT PANEL ARCHITECTURE

**Recommended: Adaptive three-zone layout**

```
+------------------+------------------------+------------------+
|                  |                        |                  |
|   TASK/CONTEXT   |      CHAT THREAD       |  LIVE PREVIEW    |
|   SIDEBAR        |                        |                  |
|                  |                        |                  |
|   (collapsible)  |   (always visible)     |  (expandable)    |
|                  |                        |                  |
+------------------+------------------------+------------------+
     ~240px              ~flex-1                 ~50%
```

- **First visit:** Centred hero prompt (v0 pattern), full width, no sidebar
- **Active project:** Three-panel split with collapsible sidebar
- **Mobile:** Stack vertically -- chat top, preview bottom with swipe toggle

### 2. INPUT DESIGN

**Recommended specification:**
- **Shape:** Rounded rectangle, border-radius: 16px
- **Background:** Warm off-white (#FAF9F6) -- from Cursor's palette
- **Border:** 1px solid #E5E2DC, focus: 1px solid #1A1A1A
- **Placeholder:** "Tell MP what you'd like to build..." (conversational, British)
- **Height:** 56px default, expands to max 200px as user types
- **Model selector:** Bottom-left, understated dropdown (v0 pattern)
- **Action buttons:** Bottom-right -- attachment (+), voice (mic icon), send (arrow)
- **Suggestion chips:** Below input, pill-shaped, with leading icons
  - "Landing page for my business"
  - "Add a contact form"
  - "Redesign my hero section"
  - "Write my About page copy"
- **Chip style:** Border: 1px solid #E5E2DC, border-radius: 20px, padding: 8px 16px, font-size: 14px

### 3. MESSAGE RENDERING

**User messages:**
- Right-aligned or full-width with subtle background (#F5F3EF)
- No avatar needed (it's your message)
- Timestamp on hover only

**AI messages (MP responses):**
- Left-aligned with MP avatar/icon
- Streaming text, token-by-token
- **Tool steps shown explicitly** (Cursor/v0 pattern):
  ```
  Reading your current homepage...
  Analysing brand colours...
  Thought for 4s
  Generating new hero section...
  ```
- **File/component change cards:**
  - Filename with icon
  - Diff stats: "+24 lines" in muted green
  - Click to expand and see code
- **Completion summary:** Natural language below changes
  "Done. I've updated your hero section with a new headline, adjusted the CTA button colour to match your brand, and optimised the image for mobile."

### 4. LOADING/STREAMING STATES

**Recommended approach (layered):**

1. **Immediate feedback** (0-500ms): Subtle pulse animation on MP avatar
2. **Step logging** (500ms+): Show what MP is doing:
   - "Reading your site configuration..." (with subtle animated ellipsis)
   - "Analysing your content..."
   - "Generating changes..."
3. **Thinking indicator:** "Thinking..." with elapsed time counter (Linear pattern: "Thought for 4s")
4. **Preview updates:** Live preview refreshes as code generates (v0/bolt pattern)
5. **Completion:** Subtle checkmark animation, summary message

**Animation specs:**
- Pulse: Scale 1.0 -> 1.05 -> 1.0, 1.5s ease-in-out, infinite during loading
- Step entry: Fade-in + slide-up, 200ms ease-out
- Streaming text: Character-by-character, ~30ms per character
- Preview refresh: Crossfade, 300ms

### 5. MULTI-STEP WORKFLOWS

**Recommended: Task sidebar with status grouping (Cursor pattern)**

```
BUILDING (1)
  * Update hero section
    Generating layout...

READY FOR REVIEW (2)
  * New contact form         2m ago
    Added form with validation
  * SEO meta tags            5m ago
    +8 meta tags added

DEPLOYED (3)
  * Navigation update       1h ago
  * Footer redesign         2h ago
  * Colour scheme change    3h ago
```

- Status groups: Building -> Ready for Review -> Deployed
- Each task shows: title, timestamp, brief summary
- Click to expand full chat thread for that task
- Animated transition when tasks move between groups

### 6. AGENT/TOOL VISIBILITY

**Recommended: Transparent but not overwhelming**

- Show file reads, thinking time, and generation steps (v0/Cursor)
- Use collapsible sections for technical detail
- Default: Show summary ("Updated 3 files")
- Expand: Show individual file changes with diffs
- Power user toggle: "Show detailed logs" in settings

### 7. ERROR HANDLING

**Recommended approach:**
- **Soft errors:** Inline message with suggestion: "I couldn't update that section. Would you like me to try a different approach?"
- **Hard errors:** Card with error type, suggested fix, and retry button
- **Never show raw error messages** to end users
- **Graceful degradation:** If preview fails, show last known good state with "Preview updating..." overlay

### 8. KEYBOARD SHORTCUTS

**Essential shortcuts for MP:**

| Shortcut | Action | Source |
|----------|--------|--------|
| Cmd+K | Command palette (search, quick actions) | Linear |
| Cmd+J | Open/focus MP chat | Linear |
| Cmd+Enter | Send message | Universal |
| Cmd+P | Toggle preview panel | Cursor |
| Cmd+/ | Show keyboard shortcuts | Universal |
| Escape | Close panel / cancel | Universal |
| Cmd+Z | Undo last AI change | Cursor |
| / (in editor) | Slash commands for inline AI | Notion |

### 9. COMMAND PALETTE (Cmd+K)

**Must-have for MP:**
- Fuzzy search across all actions
- Recent actions at top
- Categories: Pages, Components, Settings, AI Actions
- Each result shows: icon + name + description + keyboard shortcut
- Dark overlay background with centred modal
- Input with search icon, auto-focus
- Results update as you type, <100ms response time

### 10. COLOUR PALETTE -- "UNDERSTATED BRITISH LUXURY"

Based on the best elements observed:

```
Primary Background:    #FAF9F6  (Cursor's warm off-white -- NOT pure white)
Secondary Background:  #F5F3EF  (Message bubbles, cards)
Tertiary Background:   #ECEAE4  (Hover states, active items)
Border:                #E5E2DC  (Subtle, warm grey)
Text Primary:          #1A1A1A  (Near-black, not pure black)
Text Secondary:        #6B6560  (Warm grey for meta text)
Text Tertiary:         #9B9590  (Timestamps, hints)
Accent Primary:        #1A1A1A  (Black for CTAs -- like Linear/Cursor)
Accent Secondary:      #2563EB  (Blue for links, interactive elements)
Success:               #16A34A  (Muted green for diffs, completions)
Error:                 #DC2626  (Red for errors, deletions)
Warning:               #D97706  (Amber for caution states)

Dark Mode (optional):
Background:            #0F0F0F  (Linear's deep black)
Surface:               #1A1A1A
Border:                #2A2A2A
Text:                  #FAFAFA
```

### 11. TYPOGRAPHY

```
Headings:     Inter or equivalent system sans-serif, weight 600
Body:         Inter, weight 400, 15px/1.6 line-height
Code/Mono:    JetBrains Mono or SF Mono, 13px
Chat input:   16px (prevents iOS zoom on focus)
Timestamps:   12px, text-tertiary colour
Chip labels:  14px, weight 500
```

### 12. SPACING SYSTEM

```
Base unit: 4px
xs:   4px   (inline padding)
sm:   8px   (between related elements)
md:   16px  (between sections)
lg:   24px  (panel padding)
xl:   32px  (section separation)
2xl:  48px  (major section gaps)
```

---

## Priority Implementation Order

### Phase 1 -- MVP Chat (Week 1-2)
1. Centred hero prompt with suggestion chips
2. Basic chat thread with streaming responses
3. Live preview panel (right side)
4. Loading states with step logging

### Phase 2 -- Power Features (Week 3-4)
5. Command palette (Cmd+K)
6. Task sidebar with status grouping
7. File change cards with diffs
8. Keyboard shortcuts

### Phase 3 -- Agent Intelligence (Week 5-6)
9. Multi-step workflow tracking
10. Tool/step transparency controls
11. Error handling with recovery suggestions
12. Inline AI (slash commands in editor)

### Phase 4 -- Polish (Week 7-8)
13. Dark mode
14. Voice input
15. Custom agent templates
16. Usage/cost indicators

---

## Summary of What to Steal

| Pattern | From | Why |
|---------|------|-----|
| Centred hero prompt | v0 | Perfect first-touch, zero friction |
| Suggestion chips | v0 | Eliminates blank-page anxiety |
| Three-panel layout | Cursor | Best workspace for builder tools |
| Task sidebar with status groups | Cursor | Manages multiple concurrent builds |
| Warm off-white palette | Cursor | Premium feel without dark mode |
| Agent in activity feed | Linear | Natural, transparent, trustworthy |
| Cmd+K command palette | Linear | Power user essential |
| Cmd+J AI chat shortcut | Linear | Instant AI access |
| @mention to invoke AI | Linear | Natural interaction pattern |
| Inline slash commands | Notion | Contextual AI within editor |
| Custom Agents with triggers | Notion | Automation for recurring tasks |
| Transparent tool steps | v0/Cursor | Builds trust by showing work |
| Thinking time display | v0/Cursor | Users know the AI is working |
| Live preview updates | v0/bolt | Instant visual feedback |
| Template gallery with thumbnails | v0/Lovable | Quick-start options |
| Voice input | Lovable | Accessibility and convenience |
| Diff stats on changes | Cursor | Quantifies AI contribution |

---

*"The goal is not to be the loudest AI tool in the room. It is to be the one that feels like having a quietly brilliant colleague who already knows what you need."*
