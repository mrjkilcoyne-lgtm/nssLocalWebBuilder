# REFERRED Data Directory

Master catalog and contact data for the REFERRED affiliate program implementation.

## Files

### referred-catalog.csv
Master product catalog with 200+ rows across 11 categories. Each row represents a product/service with affiliate program details, regional availability, and metadata.

**Categories covered:**
1. AI Platforms (OpenAI, Anthropic, Google Cloud AI, AWS Bedrock, Azure AI, Hugging Face, Replicate, Together AI, Groq, Mistral)
2. AI Software/Tools (Cursor, Replit, GitHub Copilot, Notion AI, Jasper, Midjourney, RunwayML, ElevenLabs, Descript, Otter.ai)
3. Cloud/Infra (AWS, GCP, Azure, Cloudflare, Vercel, Netlify, DigitalOcean, Hetzner, OVH, Linode)
4. Hardware - Compute (NVIDIA GPUs, AMD GPUs/CPUs, Intel, Apple Silicon, Google Coral, Jetson, Raspberry Pi 5)
5. Hardware - Audio (Rode, Blue Yeti, Shure, Focusrite, Elgato Wave)
6. Hardware - Video (Logitech, Elgato Facecam, Insta360, capture cards)
7. Hardware - Home Hubs (Echo, Nest Hub, HomePod, Home Assistant)
8. Hardware - Networking (Ubiquiti, TP-Link, Synology, TrueNAS)
9. Hardware - Speakers (Sonos, JBL, Bose, studio monitors)
10. Financial Services (Starling, Monzo, Wise, Revolut)
11. Dev Tools (JetBrains, Docker, Supabase, PlanetScale, Neon, Turso)

**Key columns:**
- `open_program`: TRUE if affiliate program is publicly open to join
- `pitch_likelihood_pct`: For closed programs, estimated likelihood of successful pitch (0-100)
- `region_*`: Boolean flags for geographic availability (US, EU, CN, ROW)
- `credit_rating`: Company creditworthiness estimate (AAA, AA, A, B)
- `beginner_friendly`: Whether the product suits beginners
- `modality`: Product type (text, api, web, desktop, hardware, app, platform, plugin)

### referred-contacts.csv
Contact information for companies without open affiliate programs, to support outreach/pitch efforts.

**Columns:**
- `company`: Company name
- `contact_name`: Contact person or team name
- `contact_email`: Email address (generic department emails where specific contacts unknown)
- `contact_role`: Role or department
- `pitch_status`: Current outreach status (not_started, pitched, negotiating, accepted, rejected)
- `likelihood_pct`: Estimated probability of successful partnership
- `notes`: Additional context for the pitch

## Data freshness
- Researched: March 2026
- Amazon UK ASINs included where products are available on amazon.co.uk
- Commission rates and program availability verified via web search against official sources

## Usage
This data feeds into the REFERRED frontend (built by Swarm C) and is consumed by the recommendation engine to match users with the best affiliate opportunities based on their region, experience level, and content modality.
