# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/abeera/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Abeera
**Generated:** 2026-09-03
**Shipped visual system:** 2026-10-23 — Concept C, Lahore House
**Category:** Luxury fashion / lifestyle e-commerce

---

## Override note

Concept C replaces the cream/burgundy hybrid. Champagne is for hairlines, kickers, and hovers — not large filled blocks.

**Active direction:**

- Style: editorial fashion house, flush photography, pill controls
- Page rhythm: trust ticker, transparent nav over a full-bleed hero, collection tiles with a 20px gap, moment rail, product grid, house story, benefits, newsletter, espresso footer
- Type: Instrument Serif (display, italic for emphasis) + Outfit (UI/forms), loaded with `next/font`
- Palette: ivory `#F4EFE6`, paper `#FAF7F2`, espresso `#1A1613`, ink `#14110E`, champagne `#B0894F`

---

## Brand

Abeera is a contemporary fashion house. Quiet confidence, editorial photography, considered materials. The store should feel like a lookbook that happens to sell clothes — not a marketplace.

Personality: elegant, minimal, premium, modern, sophisticated, editorial, confident, clean.

---

## Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Page / ivory | `#F4EFE6` | `--color-background`, `--color-ivory` |
| Paper | `#FAF7F2` | `--color-paper`, `--color-card` |
| Espresso | `#1A1613` | `--color-primary`, `--color-espresso` |
| On primary | `#FAF7F2` | `--color-primary-foreground` |
| Ink | `#14110E` | `--color-foreground`, `--color-ink` |
| Muted text | `#6B6156` | `--color-muted-foreground` |
| Taupe | `#A89886` | `--color-taupe` |
| Wash | `#E8E0D4` | `--color-muted`, `--color-blush` |
| Champagne | `#B0894F` | `--color-champagne`, `--color-gold` |
| Champagne soft | `#D4BC8E` | `--color-champagne-soft`, `--color-gold-soft` |
| Hairline gold | `#C4A574` | `--color-gold-line` |
| Border | `#DDD4C8` | `--color-border` |
| Destructive | `#9F2D2D` | `--color-destructive` |
| Ring | `#1A1613` | `--color-ring` |

**Color notes:** Ivory page, paper fields, espresso fills. Champagne and soft champagne stay on hairlines, kickers, ticker type, and hovers. Never neon, never purple/pink gradients, no burgundy primary.

---

## Typography

- **Display / selected headings:** Instrument Serif 400 + italic. Hero, section titles, product names. Italic champagne-soft for emphasis on photography.
- **Body / UI:** Outfit 400–600. Nav, forms, prices, buttons, captions.
- **Mood:** cinematic, editorial, quiet
- **Scale:**
  - Display: `clamp(2.8rem, 8vw, 6.75rem)`, leading 0.94
  - Section title: `clamp(2rem, 4vw, 3.35rem)`, leading 1.05
  - Product name: 1.15rem serif
  - Body: 0.9375rem, leading 1.65
  - Kicker: 0.65rem, tracking 0.22em, uppercase, champagne

Buttons: Outfit 500, 0.7rem, tracking 0.14em, uppercase, pill.
Nav: Outfit 500, 0.7rem, tracking 0.12em, uppercase. Wordmark is Instrument Serif, centered.

---

## Spacing

8px base. Section vertical: 64–120px desktop, 48–72px mobile. Content max width 1440px, inner 72px desktop / 20px mobile.

| Token | Value |
|-------|-------|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |
| `--space-3xl` | `64px` |
| `--space-4xl` | `96px` |

---

## Surfaces

- **Radius:** 0 on photography. Pill (`999px`) on buttons, inputs, badges. `1rem` on dialogs, summaries, and cards that are not photos.
- **Shadows:** none on product tiles. Soft espresso shadow only on primary button hover and dialogs.
- **Borders:** `#DDD4C8` hairline. Photography is flush, no card chrome.

---

## Components

### Buttons

- Primary: espresso fill, paper text, pill. Hover mixes a little champagne into espresso.
- Gold: champagne fill for subscribe only.
- Light: paper fill on photography. Hover shifts to champagne-soft.
- Overlay: transparent, paper hairline, for the second hero action.
- Outline: transparent, ink hairline, pill. Hover fills espresso.
- Height: 48px default, 40px small, 56px large. Icon buttons are 44px circles.

### Cards / product tiles

- No card chrome. Image, then name, then price.
- Hover (pointer only): crossfade to second image 400ms. Quick-add and wishlist overlay; on touch, those controls are always visible.
- Sale: original price struck, sale in accent gold.
- Out of stock: 50% image, “Sold out” overline, no add.

### Inputs

- 48px height, 1px border, pill, 16px font on small screens (no iOS zoom).
- Focus: 2px ring `--color-ring`, offset 2px.
- Labels always visible — never placeholder-only.

### Navigation

- Trust ticker: espresso strip, champagne-soft tracked caps. Messages are the live ones: free delivery over Rs. 5,000, cash on delivery, Eid collection, WhatsApp help on product pages.
- Navbar: menu and Collections on the left, Abeera wordmark centered, Search, account, and bag on the right. Over the homepage hero it is transparent with paper type. After the hero (and on every other page) it is sticky ivory at 94% with a gold hairline.
- Menu sheet: left side, serif category links. Wishlist and account stay in the sheet.
- Bag count sits beside the icon. No filled notification pill.

### Hero

Full-bleed campaign photograph from the existing Unsplash allowlist. Type sits on the image: kicker “Eid · Lahore”, headline “Woven with tradition & grace” with the second phrase in italic champagne-soft, a gold hairline before “Lahore · Contemporary pret”, then Explore the Collection and Shop unstitched. Image eases in; type rises. Both respect `prefers-reduced-motion`. `next/image` with `priority`.

### Cart / search / filters

- Cart: Sheet right.
- Search: Dialog + Command. Recents, popular, live product hits.
- Filters: sidebar desktop, Sheet left on mobile.

---

## Motion

- Duration 180–280ms, ease `[0.22, 1, 0.36, 1]`.
- Hero entrance + section fade/slide once in view.
- Cart sheet, dialog, wishlist heart, image crossfade.
- `prefers-reduced-motion: reduce` → opacity only, no transform, stop carousels.

---

## Page pattern (home)

1. Trust ticker
2. Editorial nav, transparent over the hero
3. Full-bleed hero
4. Three tiles with a 20px gap: Festive Edit, Everyday Pret, Formals — linked to live search and category routes
5. “Find your edit” moment rail: new arrivals, stitched suits, bestsellers, accessories
6. Bestsellers grid from `getBestSellers` (new arrivals if that list is empty; lookbook only when the catalog returns nothing)
7. House story using the existing Lahore / lawn / chiffon / zardozi / pret copy
8. Benefits: free delivery over Rs. 5,000, easy exchange, COD, JazzCash and EasyPaisa
9. Letters from Lahore
10. Espresso footer with a gold hairline
11. WhatsApp button when `NEXT_PUBLIC_WHATSAPP_NUMBER` is set, otherwise the same button goes to `/contact`

Do not replace API products with a hardcoded demo grid. Do not add founding myths, sustainability claims, or shipping rules that are not already on the site.

---

## Anti-patterns

- Liquid glass, heavy frost, lensing, glow, neon
- Purple/pink AI gradients, playful colors
- Tiny 11px tracked caps as the primary voice
- Equal 3-up collection grids with captions below
- Stacked logo-and-tagline lockup (the centered Instrument Serif wordmark is the nav)
- Emoji icons
- Hover-only essential actions
- Placeholder-only form labels
- Instant state changes with no 150–300ms transition
- Invisible focus

---

## Pre-delivery checklist

- [ ] Lucide SVG icons only
- [ ] `cursor-pointer` on clickable elements
- [ ] Hover 150–300ms, no layout-shifting scale
- [ ] Text contrast 4.5:1
- [ ] Visible focus rings
- [ ] `prefers-reduced-motion` respected
- [ ] 375 / 768 / 1024 / 1440
- [ ] No content under sticky nav
- [ ] No horizontal scroll on mobile
