---
name: Proton Admin
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system focuses on a **Corporate / Modern** aesthetic, emphasizing precision, reliability, and executive-level clarity. It is tailored for enterprise administrators who require high-density information without cognitive overload. 

The brand personality is authoritative yet approachable, avoiding the playful "bubbly" trends in favor of a "software-as-a-service" professional standard. The emotional response is one of trust and efficiency. The interface utilizes a high-end enterprise feel by employing generous whitespace, a strictly governed color palette, and subtle elevation changes rather than loud decorative elements.

## Colors
The palette is built on a foundation of **Sophisticated Navy and Slate Blues**. 
- **Primary ($0F172A):** Deep navy used for core brand elements, sidebar backgrounds, and high-level headings to anchor the UI.
- **Secondary ($334155):** Slate blue for secondary information and iconography.
- **Status Accents:** Emerald, Amber, and Crimson are used in muted, high-chroma variants to ensure they remain professional while providing instant semantic meaning. 
- **Neutrality:** The background uses a very cool-toned white ($F8FAFC) to differentiate from the pure white surface of cards, creating a natural sense of depth without needing heavy borders.

## Typography
This design system utilizes a dual-font strategy. **Plus Jakarta Sans** provides a modern, slightly geometric feel for headings and large data points, creating a high-end editorial look. **Inter** is used for all body copy, labels, and data tables to ensure maximum legibility and a systematic, "utility-first" feel. 

Weights are used strictly: Bold/Semi-bold for primary headings and labels, Regular for reading text. Letter spacing is slightly tightened on large headings for a premium look and slightly opened on small labels for clarity.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 280px, while the main content area occupies the remaining space up to a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.

A 12-column grid is used for dashboard widgets, with standard spans of 3, 4, 6, or 12 columns. Spacing is based on an 8px base unit. 
- **Desktop:** 32px outer margins with 24px gutters between cards.
- **Tablet:** 24px margins with 16px gutters.
- **Mobile:** 16px margins, cards stack vertically.

## Elevation & Depth
Depth is conveyed through **Tonal Layers and Subtle Ambient Shadows**. 
1. **Level 0 (Background):** $F8FAFC - The canvas.
2. **Level 1 (Cards):** Pure White ($FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)).
3. **Level 2 (Overlays/Dropdowns):** Pure White with a more defined shadow (0px 10px 30px rgba(15, 23, 42, 0.1)).

Low-contrast outlines (1px solid #E2E8F0) are used on all cards and input fields to provide structural definition even when shadows are minimal.

## Shapes
The design system adopts a **Rounded** shape language. 
- **Standard Cards/Modals:** 12px (rounded-lg) for a modern, soft professional look.
- **Buttons & Inputs:** 8px (standard) to maintain a sense of structural integrity.
- **Chips/Badges:** 6px or full pill for status indicators to distinguish them from interactive buttons.
Large containers or sidebar active states use 12px to match the card rhythm.

## Components
- **Buttons:** Primary buttons use the Navy Blue ($0F172A) with white text. Secondary buttons use a slate outline. Avoid gradients; use solid fills.
- **Status Chips:** Use a "soft background" style (e.g., Active status has 10% opacity Emerald background with 100% opacity Emerald text).
- **Cards:** Must include 24px internal padding. Titles should be Headline-sm.
- **Input Fields:** 8px corners, 1px #E2E8F0 border. On focus, the border transitions to Primary Navy or a subtle blue glow.
- **Data Tables:** Clean, no vertical borders. Horizontal borders in light gray. Header row uses Label-md typography with a subtle gray background.
- **Sidebar:** Dark theme by default (Primary Navy background) with a "glass" or high-contrast active state for the current page indicator.