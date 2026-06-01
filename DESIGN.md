---
name: High-Density Lab
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#5b005b'
  tertiary-container: '#ffd7f5'
  on-tertiary-container: '#b300b3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffd7f5'
  tertiary-fixed-dim: '#ffabf3'
  on-tertiary-fixed: '#380038'
  on-tertiary-fixed-variant: '#810081'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-fixed:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-ui:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
spacing:
  unit: 4px
  gutter: 12px
  margin-edge: 16px
  density-tight: 4px
  density-medium: 8px
  density-loose: 16px
---

## Brand & Style

The design system is engineered for technical precision and rapid cognitive processing within AI orchestration environments. It targets a demographic of developers, data scientists, and system architects who require maximum information density and clear visual hierarchies for complex logic flows.

The aesthetic is a fusion of **High-Contrast Modernism** and **Technical Brutalism**. It prioritizes function over decoration, utilizing sharp edges, thin structural lines, and glowing accents to signify activity and status. The interface should feel like a high-performance instrument—cold, responsive, and authoritative.

**Key Principles:**
- **Absolute Precision:** Every pixel serves a functional purpose; whitespace is minimized in favor of structured data density.
- **Luminous Hierarchy:** Dark surfaces use vibrant, neon-spectrum accents to draw immediate attention to critical states and primary actions.
- **Architectural Rigor:** The layout mimics technical schematics, using borders and grids rather than shadows to define space.

## Colors

The palette is centered on a "Deep Charcoal" ecosystem to reduce eye strain during long-form orchestration sessions, punctuated by hyper-saturated "Signal Colors."

- **Primary (Fraunhofer Green):** Used exclusively for successful execution states, primary action triggers, and active logic nodes.
- **Secondary (Cyan):** Dedicated to system telemetry, data streams, and neutral technical metadata.
- **Tertiary (Magenta):** Reserved for experimental features, AI-generated suggestions, or distinct alternative logic branches.
- **Neutral/Surface:** The background is near-black to maximize the luminance of the neon accents. Structural borders use a slightly lighter charcoal to maintain visibility without creating visual noise.

Contrast ratios must exceed 7:1 for all interactive elements to ensure visibility of dense technical data.

## Typography

Typography in this design system is divided between **functional UI text** and **technical data**.

- **JetBrains Mono** is the primary driver for all technical data, headers, and status labels. Its monospaced nature ensures that columns of data remain perfectly aligned, aiding in pattern recognition within AI logs.
- **Geist** is used for interface labels and descriptive text where readability and space efficiency are paramount.
- **Label-caps** should be used for section headers and table column headers to create a distinct structural "frame" for content.

All headings are sharp and condensed. Avoid large-scale fluid typography; instead, use stepped increments to maintain the "grid-bound" feel of the lab environment.

## Layout & Spacing

This design system utilizes a **High-Density Modular Grid**. The base unit is a strict 4px grid.

- **Desktop:** 12-column fluid grid for the main canvas, with fixed-width (240px - 320px) sidebars for tooling and telemetry.
- **Density:** Components are tightly packed. Vertical rhythm is maintained by 8px increments, but internal component padding often drops to 4px to maximize screen real estate.
- **Borders as Spacers:** Use 1px solid borders (`#1A1A1C`) to separate modules instead of whitespace.
- **Responsive Behavior:** On mobile, the grid collapses to a single column, but the "Density" remains high—text sizes do not scale down aggressively; instead, horizontal scrolling is permitted for code blocks and data tables to preserve structural integrity.

## Elevation & Depth

In a high-density environment, shadows are avoided as they create "fuzziness" and consume valuable pixels. Depth is communicated through **Tonal Tiering** and **Luminous Accents**.

- **Level 0 (Canvas):** The deepest black (#050505).
- **Level 1 (Panels):** Slightly lighter (#0A0A0B) with a 1px solid stroke.
- **Level 2 (Active/Floating):** Use a primary color glow (`box-shadow: 0 0 10px rgba(204, 255, 0, 0.2)`) to indicate focus or "active" nodes.
- **Inlays:** Input fields and code editors should appear "sunken" into the surface using a darker background than the panel they sit on.

## Shapes

The shape language is strictly **Geometric and Sharp**. 

- **Corners:** 0px radius for all containers, buttons, and inputs. This reinforces the technical, "engineered" feel of the system.
- **Strokes:** All borders are 1px. Avoid varying stroke weights to maintain a clean, schematic appearance.
- **Icons:** Use thin-stroke (1px or 1.5px) vector icons with sharp terminals. Avoid filled icons unless they represent a critical "On/Active" state.

## Components

- **Buttons:** Rectangular, sharp-edged. The Primary button is solid Fraunhofer Green with black text. Secondary buttons are ghost-style with a Cyan 1px border.
- **Inputs:** Darker than the panel background. On focus, the border changes to Primary Green with a subtle 2px outer glow.
- **Status Chips:** Small, rectangular, monospaced text. Use a "dot" indicator in the corner of the chip (Green for active, Cyan for idle, Red for error).
- **Nodes/Cards:** Used for AI orchestration steps. Sharp 1px border. The header of the card should have a 2px top-border in a signal color (Cyan/Magenta) to categorize the node type.
- **Telemetry Lists:** High-density rows (24px - 28px height). Alternating row highlights are not used; instead, use thin horizontal lines to separate entries.
- **Scrollbars:** Custom-styled to be ultra-thin (4px), using the neutral stroke color for the track and the secondary cyan for the thumb.