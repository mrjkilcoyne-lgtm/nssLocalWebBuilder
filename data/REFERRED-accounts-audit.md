# REFERRED — Accounts & Links Audit

**Date:** 2026-04-02
**Status:** NEEDS MATT'S REVIEW — items marked [CONFIRM] need your input

---

## Known Accounts (Verified)

| Service | Account | Status |
|---------|---------|--------|
| **Amazon Associates** | Store ID: `mrjkilcoyne-21` | VERIFIED — logged in, tag working |
| **Stripe** | CANZUK ltd (`acct_1Sv5hHGYQT9JdyOr`) | VERIFIED — account active |
| **Gmail** | mrjkilcoyne@gmail.com | VERIFIED |
| **GitHub** | mrjkilcoyne-lgtm | VERIFIED |

---

## Payment Links — What Needs Fixing

### 1. Stripe Tips [ACTION NEEDED]
- **Current:** `https://buy.stripe.com/YOUR_LINK` — PLACEHOLDER, goes nowhere
- **Fix:** Need a Stripe Payment Link created at https://dashboard.stripe.com/payment-links/create
- Select "Customers choose what to pay", title "Support REFERRED"
- [CONFIRM] Paste the resulting URL here: _______________

### 2. PayPal [CONFIRM]
- **Current:** `https://paypal.me/YOURHANDLE` — PLACEHOLDER
- [CONFIRM] Your PayPal.me link? Likely `https://paypal.me/mrjkilcoyne` or similar: _______________

### 3. Buy Me a Coffee [CONFIRM]
- **Current:** `https://buymeacoffee.com/YOURHANDLE` — PLACEHOLDER
- [CONFIRM] Do you have an account? If yes, handle: _______________
- If no, create at https://buymeacoffee.com — takes 30 seconds

### 4. GitHub Sponsors
- **Current:** `https://github.com/sponsors/YOURHANDLE` — PLACEHOLDER
- **Fix to:** `https://github.com/sponsors/mrjkilcoyne-lgtm`
- [CONFIRM] Is GitHub Sponsors enabled on your account? Check https://github.com/sponsors/mrjkilcoyne-lgtm

### 5. Bitcoin [CONFIRM]
- **Current:** `bc1qreferred000000000000000000000` — FAKE ADDRESS
- [CONFIRM] Your real BTC wallet address: _______________
- If you don't have one, skip this or set up a simple wallet

### 6. GoCardless [CONFIRM]
- **Current:** `https://pay.gocardless.com/YOUR_LINK` — PLACEHOLDER
- [CONFIRM] Do you have a GoCardless account? If yes, payment page URL: _______________
- Lower priority — can remove if you don't have one

### 7. Bank Transfer [CONFIRM]
- **Current:** Placeholder sort code + account number in the About page
- [CONFIRM] Do you want real bank details shown publicly? Sort code + account number: _______________
- Alternatively, can remove this option

---

## Affiliate Links — What's Real vs Broken

### Amazon Associates (58 products) — ALL CORRECT
All use `tag=mrjkilcoyne-21`. Format: `https://www.amazon.co.uk/dp/{ASIN}?tag=mrjkilcoyne-21`
These will earn commission when clicked. ASINs need spot-checking but format is correct.

### Direct Affiliate Programs — STATUS

| Program | URL in DB | Real? | Action Needed |
|---------|-----------|-------|---------------|
| ElevenLabs | `elevenlabs.io/affiliate` | Generic page | Need to sign up and get personal referral link |
| Copy.ai | `copy.ai/affiliate` | Generic page | Need to sign up and get personal referral link |
| JetBrains | `jetbrains.com/affiliate` | Generic page | Need to sign up and get personal referral link |
| DigitalOcean | `digitalocean.com/referral` | Generic page | Need to sign up via Impact and get personal link |
| Hetzner | `hetzner.cloud/referral` | Generic page | Need to log in to Hetzner console and get referral link |
| Wise | `wise.com/referral` | Generic page | Need personal referral link from Wise account |
| Supabase | `supabase.com/partners` | Generic page | Need to apply to partner program |
| Neon | `neon.tech/partners` | Generic page | Need to apply to partner program |
| Cursor | `cursor.com/referral` | Generic page | No commission program exists yet |

**Bottom line:** These all point to the *program sign-up pages*, not your personal referral links. They won't earn you commission. You need to sign up for each program individually and replace the URLs with your personal referral links.

**Quick wins (have open programs you can sign up for today):**
1. ElevenLabs — 22% recurring, sign up via PartnerStack
2. DigitalOcean — 10% recurring, sign up via Impact
3. Wise — GBP10-50 CPA, sign up via Partnerize (partnerwise@wise.com for custom rates)
4. JetBrains — 25% commission, sign up at jetbrains.com/affiliate

---

## What Claude Can Fix Right Now (Without Matt's Input)

1. Replace `YOUR_LINK` / `YOURHANDLE` placeholders with known values where possible
2. Set GitHub Sponsors to `mrjkilcoyne-lgtm`
3. Remove payment methods we don't have accounts for (or hide them until configured)
4. Fix any broken UI / rendering on the live site
5. Verify the site pages all load and route correctly

## What Needs Matt (5 minutes)

1. Create Stripe Payment Link (30 seconds at dashboard.stripe.com)
2. Confirm PayPal.me handle
3. Confirm or create Buy Me a Coffee account
4. Provide real BTC address (or skip)
5. Sign up for 4 affiliate programs (ElevenLabs, DigitalOcean, Wise, JetBrains) and paste personal referral URLs
