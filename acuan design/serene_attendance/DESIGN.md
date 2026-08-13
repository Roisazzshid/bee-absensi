---
name: Serene Attendance
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#414751'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#727782'
  outline-variant: '#c1c6d3'
  surface-tint: '#075fab'
  primary: '#075fab'
  on-primary: '#ffffff'
  primary-container: '#5d9cec'
  on-primary-container: '#003260'
  inverse-primary: '#a4c9ff'
  secondary: '#006b5b'
  on-secondary: '#ffffff'
  secondary-container: '#7cf8dd'
  on-secondary-container: '#007261'
  tertiary: '#575f69'
  on-tertiary: '#ffffff'
  tertiary-container: '#939ba5'
  on-tertiary-container: '#2b333c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004884'
  secondary-fixed: '#7cf8dd'
  secondary-fixed-dim: '#5ddbc1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005144'
  tertiary-fixed: '#dbe3ef'
  tertiary-fixed-dim: '#bfc7d2'
  on-tertiary-fixed: '#141c24'
  on-tertiary-fixed-variant: '#404851'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-time:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -1px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-main: 20px
  gutter-card: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 32px
---

## Brand & Style

The design system is built on a **Modern Corporate** foundation with a **Tactile** twist. It targets modern workplaces that value employee well-being as much as productivity. The emotional response should be one of "calm reliability"—reducing the anxiety often associated with time-tracking and surveillance.

The style leverages high-quality whitespace and a "soft-UI" approach, sitting between minimalism and neomorphism. It uses subtle depth and layered surfaces to create a friendly, approachable interface that feels native to high-end mobile hardware.

## Colors

The palette uses a "Colorful but Calm" strategy. 

- **Primary (Soft Blue):** Used for the main action (Clock-In) and active navigation states. It represents trust and professional stability.
- **Secondary (Mint Green):** Used for success states, "Clocked-In" status indicators, and geofencing "In-Range" confirmations.
- **Tertiary (Subtle Gray):** Reserved for secondary information, borders, and inactive states.
- **Background/Neutral:** A very soft off-white/blue-tinted gray to reduce eye strain compared to pure white.

Use low-saturation versions of these colors for large background areas (e.g., card backgrounds) to maintain the "kalem" (calm) aesthetic.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, rounded terminals which harmonize with the soft UI elements. 

- **Display-Time:** Specifically for the digital clock on the dashboard. It uses a tighter letter-spacing for a modern, digital-first look.
- **Headlines:** Use Bold weights to create a clear hierarchy against the soft background colors.
- **Body:** Standardized at 16px for maximum legibility on mobile devices while walking or on the go.
- **Labels:** Used for metadata in Attendance History and status badges.

## Layout & Spacing

The layout follows a **Fluid Mobile Grid** philosophy. Since this is a mobile-first Flutter app, the focus is on vertical rhythm and thumb-reachability.

- **Margins:** A generous 20px side margin ensures content doesn't feel cramped and accounts for various phone bezel widths.
- **Vertical Rhythm:** Use 8px increments for all spacing. 16px is the standard gap between related elements (e.g., label and input), while 32px separates distinct sections (e.g., the Clock-in button from the History list).
- **Safe Areas:** All critical actions (Clock-in/out) should be placed in the lower 60% of the screen for ergonomic one-handed use.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of approachability. 

- **Surface Level 0:** The app background (#F5F7FA).
- **Surface Level 1 (Cards):** Pure white background with a very soft, diffused shadow: `Offset(0, 4), Blur(20), Color(0,0,0, 0.05)`. This creates a "floating" effect without harsh lines.
- **Active Elevation:** When a user presses a button, the shadow should slightly shrink to simulate the button being physically pushed into the screen.
- **Geofence Indicator:** Uses a subtle inner shadow or a soft glow of the Primary/Secondary color to indicate "active" zones without cluttering the map view.

## Shapes

The shape language is defined by **High Roundedness**. All container elements and buttons must have a minimum of 16px corner radius to match the "friendly and approachable" brand persona.

- **Cards & Inputs:** 16px (`rounded-lg` equivalent).
- **Primary Buttons:** 20px or fully pill-shaped to differentiate them from static cards.
- **Status Chips:** Fully rounded (pill) to denote they are non-interactive labels.
- **Selection Indicators:** Use soft, rounded squares for checkboxes to maintain a modern look.

## Components

### Buttons
- **Primary Action (Clock-In/Out):** Large, 64px height, using a gradient of Primary to a slightly darker shade. High elevation.
- **Secondary Action:** 48px height, outlined in Tertiary color or using a Ghost style (no background).

### Attendance Cards
- Use Surface Level 1 elevation. Include a left-side color accent (Mint Green for "Present", Soft Blue for "Work from Home").
- Display time in `headline-md` and date in `label-sm`.

### Geofencing Status
- A specialized card at the top of the dashboard.
- **Active state:** Pulsing Mint Green icon with "In Range" text.
- **Inactive state:** Subtle Gray icon with "Locating..." or "Out of Range" text.

### List Items (History)
- Minimalist rows with 1px Tertiary borders between items.
- Use `label-bold` for status types (e.g., LATE, ON TIME) with low-opacity background tints.

### Inputs
- Background should be white or a very light gray. 
- Focus state should be indicated by a 2px Primary color border—no harsh black outlines.