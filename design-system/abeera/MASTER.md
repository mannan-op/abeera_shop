# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/abeera/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Abeera
**Generated:** 2026-09-03
**Category:** Luxury fashion / lifestyle e-commerce

---

## Override note

UI/UX Pro Max defaulted to **Liquid Glass** + **Feature-Rich Showcase** + Cormorant/Montserrat.
Those conflict with the brand brief (no glassmorphism, editorial fashion, not SaaS cards).

**Verified direction (2026 refresh):**

- Style: Exaggerated Minimalism + Editorial Grid (`exaggerated-minimalism` + magazine layout)
- Page rhythm: Hero-centric cinematic overlay, then social proof
- Type: Instrument Serif (display, italic for emphasis) + Outfit (UI/forms)
- Palette: warm ivory paper `#F3EEE6`, espresso `#1A1613`, champagne gold `#B0894F`

---

## Brand

Abeera is a contemporary fashion house. Quiet confidence, editorial photography, considered materials. The store should feel like a lookbook that happens to sell clothes — not a marketplace.

Personality: elegant, minimal, premium, modern, sophisticated, editorial, confident, clean.

---

## Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#1A1613` | `--color-primary` |
| On Primary | `#F6F1EA` | `--color-primary-foreground` |
| Secondary | `#3D342C` | `--color-secondary` |
| Accent/CTA | `#B0894F` | `--color-gold` |
| Background | `#F3EEE6` | `--color-background` |
| Foreground | `#14110E` | `--color-foreground` |
| Card | `#FAF7F2` | `--color-card` |
| Ivory | `#FAF7F2` | `--color-ivory` |
| Muted | `#E8E0D4` | `--color-muted` |
| Muted Foreground | `#6B6156` | `--color-muted-foreground` |
| Border | `#DDD4C8` | `--color-border` |
| Destructive | `#B42318` | `--color-destructive` |
| Ring | `#1A1613` | `--color-ring` |

**Color notes:** Warm ivory paper, espresso ink, champagne gold. Never neon, never purple/pink AI gradients.

---

## Typography

- **Display / selected headings:** Instrument Serif (400 + italic). Hero, section titles, product titles, pull quotes. Italic champagne for emphasis.
- **Body / UI:** Outfit (400–600). Nav, forms, prices, buttons, captions.
- **Mood:** cinematic, editorial, rich, contemporary
- **Scale (approx):**
  - Display: clamp(2.75rem, 8vw, 7.25rem), leading 0.95
  - H2: 2.5–3.75rem
  - H3: 1.5rem
  - Body: 1–1.125rem, leading 1.65
  - Kicker / overline: 0.6875rem, tracking 0.22em, uppercase, champagne gold

Buttons: Outfit 500, 12px, tracking 0.12em, uppercase, **pill** (`rounded-full`).
Nav: Outfit 500, 13px, mixed case, light tracking.

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

- Primary: fill espresso, ivory text, pill. Hover: secondary brown + soft depth.
- Gold: champagne for sale / subscribe emphasis.
- Light: ivory fill on photography.
- Secondary: transparent, 1px ink border, pill. Hover: fill espresso.
- Height: 48–56px. Min width 44px for icon buttons.

### Cards / product tiles

- No card chrome. Image, then name, then price.
- Hover (pointer only): crossfade to second image 400ms. Quick-add and wishlist overlay; on touch, those controls are always visible.
- Sale: original price struck, sale in accent gold.
- Out of stock: 50% image, “Sold out” overline, no add.

### Inputs

- 48px height, 1px border, 0–2px radius, 16px font (no iOS zoom).
- Focus: 2px ring `--color-ring`, offset 2px.
- Labels always visible — never placeholder-only.

### Navigation

- Announcement bar: espresso, ivory 12px, champagne link.
- Navbar: sticky, ivory/80 + light blur (not liquid glass). Logo **left** in Instrument Serif. Mixed-case links.
- Mega menu: collections + featured image. Serif titles, not tiny caps.
- Mobile: Sheet `side="left"` with large serif links.

### Hero

Cinematic full-bleed: type **on** the photograph. Viewport-filling remaining height, dark gradient scrim for 4.5:1 contrast, oversized Instrument Serif with italic gold emphasis, pill CTAs on the image. `next/image` + `priority`.

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

1. Announcement + nav
2. Editorial hero (value + lookbook image)
3. Featured collections
4. New arrivals
5. Editorial/promotional banner
6. Best sellers
7. Category strip
8. Brand story
9. Testimonials (serif pull-quotes, pauseable)
10. Social gallery
11. Newsletter
12. Footer

CTA: Shop the collection (hero) + newsletter (bottom). Repeat Shop in nav.

---

## Anti-patterns

- Liquid glass, heavy frost, lensing, glow, neon
- Purple/pink AI gradients, playful colors
- Tiny 11px tracked caps as the primary voice
- Equal 3-up collection grids with captions below
- Centered 2010s boutique logo lockup
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
