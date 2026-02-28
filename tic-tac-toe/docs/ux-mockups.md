# UX Mockups & Design System
## Tic Tac Toe -- Web-Based Game
**Version**: 1.0
**Date**: 2026-02-28
**Author**: Aria, Senior UX Designer

---

## Table of Contents
1. [Design Brief](#1-design-brief)
2. [Design Principles](#2-design-principles)
3. [Colour System](#3-colour-system)
4. [Typography Scale](#4-typography-scale)
5. [Spacing & Layout Grid](#5-spacing--layout-grid)
6. [CSS Custom Properties](#6-css-custom-properties)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Screen Mockups](#8-screen-mockups)
   - 8.1 Mode Selection Screen
   - 8.2 AI Difficulty Selection Screen
   - 8.3 Main Game Board
   - 8.4 Win/Draw Result Overlay
9. [Component Specifications](#9-component-specifications)
   - 9.1 Button (Primary, Secondary, Ghost)
   - 9.2 Game Cell
   - 9.3 Game Board
   - 9.4 Score Tracker
   - 9.5 Turn Indicator
   - 9.6 Result Overlay
   - 9.7 Difficulty Badge
   - 9.8 Symbol Selector
10. [Interactive States](#10-interactive-states)
11. [Animation & Transition Guidance](#11-animation--transition-guidance)
12. [Accessibility Specifications](#12-accessibility-specifications)
13. [Dark Mode Specifications](#13-dark-mode-specifications)
14. [Edge Cases & Empty States](#14-edge-cases--empty-states)
15. [Recommendations & Next Steps](#15-recommendations--next-steps)

---

## 1. Design Brief

### User Personas
- **Priya** (28, casual player): Wants zero-friction, quick games during breaks. Mobile-first.
- **David** (38, parent): Plays with his 7-year-old on a shared tablet. Needs safe, intuitive UI.
- **Alex** (22, developer): Studies the codebase. Appreciates clean implementation details.

### Key Job-to-Be-Done
Start a satisfying game of Tic Tac Toe within 2 taps of opening the page, with no sign-ups, no ads, and no confusion.

### Design Objectives
1. Two taps to gameplay (mode select, then difficulty/start).
2. Game state is always unambiguous -- whose turn, what happened, what to do next.
3. Works flawlessly from 320px mobile to 1440px+ desktop.
4. WCAG 2.1 AA compliant at minimum.
5. Feels calm, modern, and subtly delightful -- not childish.

### Platform & Viewport Targets
- Mobile-first (320px minimum width).
- Progressive enhancement to tablet (768px) and desktop (1024px+).
- Landscape and portrait orientations supported.

---

## 2. Design Principles

1. **Respectful Simplicity**: Generous whitespace, restrained palette, no visual noise. Every element earns its place.
2. **Instant Clarity**: The user should never wonder what to do next. Status, available actions, and outcomes are always obvious.
3. **Tactile Feedback**: Every interaction produces immediate, satisfying visual response. Taps feel acknowledged.
4. **Accessible by Default**: Contrast ratios, focus indicators, keyboard navigation, and screen reader support are not afterthoughts -- they are foundational.
5. **Calm Delight**: Subtle animations and micro-interactions reward engagement without demanding attention.

---

## 3. Colour System

### 3.1 Light Mode Palette

#### Core Colours

| Role             | Hex       | RGB              | Usage                                      |
|------------------|-----------|------------------|--------------------------------------------|
| **Background**   | `#F8F9FB` | rgb(248,249,251) | Page background                            |
| **Surface**      | `#FFFFFF` | rgb(255,255,255) | Cards, board cells, overlays               |
| **Primary**      | `#4F46E5` | rgb(79,70,229)   | CTAs, active elements, focus rings         |
| **Primary Hover**| `#4338CA` | rgb(67,56,202)   | Button hover state                         |
| **Primary Light**| `#EEF2FF` | rgb(238,242,255) | Subtle primary tints, selected states      |
| **Secondary**    | `#0F172A` | rgb(15,23,42)    | Headings, primary text                     |
| **Text Primary** | `#1E293B` | rgb(30,41,59)    | Body text                                  |
| **Text Secondary**| `#64748B`| rgb(100,116,139) | Subtitles, descriptions, metadata          |
| **Border**       | `#E2E8F0` | rgb(226,232,240) | Cell borders, dividers, input borders      |
| **Border Strong**| `#CBD5E1` | rgb(203,213,225) | Hover borders, emphasized dividers         |

#### Player Colours

| Role              | Hex       | RGB              | Usage                                    |
|-------------------|-----------|------------------|------------------------------------------|
| **Player X**      | `#6366F1` | rgb(99,102,241)  | X marks, X turn indicator, X score       |
| **Player X Light**| `#E0E7FF` | rgb(224,231,255) | X cell background tint on hover          |
| **Player O**      | `#EC4899` | rgb(236,72,153)  | O marks, O turn indicator, O score       |
| **Player O Light**| `#FCE7F3` | rgb(252,231,243) | O cell background tint on hover          |

#### Semantic Colours

| Role         | Hex       | RGB              | Usage                                      |
|--------------|-----------|------------------|--------------------------------------------|
| **Success**  | `#10B981` | rgb(16,185,129)  | Win highlight background                   |
| **Success Light** | `#D1FAE5` | rgb(209,250,229) | Winning cell background               |
| **Warning**  | `#F59E0B` | rgb(245,158,11)  | Draw state accent                          |
| **Warning Light** | `#FEF3C7` | rgb(254,243,199) | Draw overlay tint                     |
| **Error**    | `#EF4444` | rgb(239,68,68)   | Reserved for future error states           |
| **Info**     | `#3B82F6` | rgb(59,130,246)  | Informational badges, tooltips             |

### 3.2 Contrast Ratios (Light Mode)

All ratios verified against WCAG 2.1 guidelines.

| Combination                               | Ratio   | WCAG Level           |
|-------------------------------------------|---------|----------------------|
| Secondary (#0F172A) on Background (#F8F9FB)| 16.5:1 | AAA (all text)       |
| Text Primary (#1E293B) on Background (#F8F9FB)| 13.2:1| AAA (all text)      |
| Text Primary (#1E293B) on Surface (#FFFFFF)| 14.5:1 | AAA (all text)       |
| Text Secondary (#64748B) on Surface (#FFFFFF)| 4.6:1 | AA (normal text)     |
| Primary (#4F46E5) on Surface (#FFFFFF)     | 5.2:1  | AA (normal text), AAA (large text) |
| White (#FFFFFF) on Primary (#4F46E5)       | 5.2:1  | AA (normal text), AAA (large text) |
| Player X (#6366F1) on Surface (#FFFFFF)    | 4.5:1  | AA (large text -- marks are large) |
| Player O (#EC4899) on Surface (#FFFFFF)    | 3.6:1  | AA (large text -- marks are 40px+) |
| Player O (#EC4899) on Background (#F8F9FB) | 3.5:1  | AA (large text, UI components)     |

Note: Player X and O marks render at 40-64px (qualifying as "large text" under WCAG, requiring only 3:1). Both exceed this threshold.

---

## 4. Typography Scale

### Font Family
```
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Why Inter**: Excellent legibility at all sizes, extensive weight range, strong numeral design (important for scores), open-source, widely available via Google Fonts. Its tall x-height improves readability on small screens.

**Monospace** is used for the X and O marks on the board for a distinctive, geometric feel.

### Type Scale (based on 1.250 -- Major Third)

| Token        | Size   | Weight | Line Height | Letter Spacing | Usage                              |
|--------------|--------|--------|-------------|----------------|------------------------------------|
| `--text-h1`  | 40px   | 800    | 1.1         | -0.02em        | Game title on mode selection       |
| `--text-h2`  | 32px   | 700    | 1.2         | -0.015em       | Screen headings                    |
| `--text-h3`  | 24px   | 600    | 1.3         | -0.01em        | Section headers, result messages   |
| `--text-lg`  | 20px   | 500    | 1.4         | 0              | Turn indicator, score labels       |
| `--text-body`| 16px   | 400    | 1.5         | 0              | Body text, descriptions            |
| `--text-sm`  | 14px   | 400    | 1.5         | 0.01em         | Captions, secondary info           |
| `--text-xs`  | 12px   | 500    | 1.5         | 0.02em         | Badges, labels                     |
| `--text-mark`| 48px   | 700    | 1.0         | 0              | X and O marks on board (mobile)    |
| `--text-mark-lg` | 64px | 700  | 1.0         | 0              | X and O marks on board (desktop)   |

### Responsive Typography
- Mobile (< 768px): h1 scales to 32px, h2 to 26px, marks stay at 48px.
- Tablet (768px-1023px): Full scale as defined above.
- Desktop (1024px+): h1 may scale up to 48px; marks at 64px.

---

## 5. Spacing & Layout Grid

### 8pt Spacing Scale

| Token          | Value | Usage                                     |
|----------------|-------|-------------------------------------------|
| `--space-1`    | 4px   | Micro-spacing (icon-to-text gaps)         |
| `--space-2`    | 8px   | Tight padding, small gaps                 |
| `--space-3`    | 12px  | Compact component padding                 |
| `--space-4`    | 16px  | Standard component padding, grid gaps     |
| `--space-5`    | 20px  | Medium section spacing                    |
| `--space-6`    | 24px  | Card padding, group spacing               |
| `--space-8`    | 32px  | Section gaps                              |
| `--space-10`   | 40px  | Large section spacing                     |
| `--space-12`   | 48px  | Screen-level vertical rhythm              |
| `--space-16`   | 64px  | Major section breaks                      |
| `--space-20`   | 80px  | Hero/header spacing                       |

### Layout Grid
- **Mobile**: Single column, 16px horizontal padding.
- **Tablet**: Single column centered, max-width 480px, 24px horizontal padding.
- **Desktop**: Single column centered, max-width 560px, 32px horizontal padding.

The game is a focused, single-column experience at all breakpoints. No multi-column layouts are needed.

---

## 6. CSS Custom Properties

```css
:root {
  /* ---- Colour Tokens ---- */
  --color-bg:              #F8F9FB;
  --color-surface:         #FFFFFF;
  --color-primary:         #4F46E5;
  --color-primary-hover:   #4338CA;
  --color-primary-light:   #EEF2FF;
  --color-secondary:       #0F172A;
  --color-text-primary:    #1E293B;
  --color-text-secondary:  #64748B;
  --color-border:          #E2E8F0;
  --color-border-strong:   #CBD5E1;

  --color-player-x:        #6366F1;
  --color-player-x-light:  #E0E7FF;
  --color-player-o:        #EC4899;
  --color-player-o-light:  #FCE7F3;

  --color-success:         #10B981;
  --color-success-light:   #D1FAE5;
  --color-warning:         #F59E0B;
  --color-warning-light:   #FEF3C7;
  --color-error:           #EF4444;
  --color-info:            #3B82F6;

  /* ---- Typography Tokens ---- */
  --font-sans:             'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono:             'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  --text-h1:               40px;
  --text-h2:               32px;
  --text-h3:               24px;
  --text-lg:               20px;
  --text-body:             16px;
  --text-sm:               14px;
  --text-xs:               12px;
  --text-mark:             48px;
  --text-mark-lg:          64px;

  --weight-regular:        400;
  --weight-medium:         500;
  --weight-semibold:       600;
  --weight-bold:           700;
  --weight-extrabold:      800;

  --leading-tight:         1.1;
  --leading-snug:          1.2;
  --leading-normal:        1.5;

  /* ---- Spacing Tokens ---- */
  --space-1:               4px;
  --space-2:               8px;
  --space-3:               12px;
  --space-4:               16px;
  --space-5:               20px;
  --space-6:               24px;
  --space-8:               32px;
  --space-10:              40px;
  --space-12:              48px;
  --space-16:              64px;
  --space-20:              80px;

  /* ---- Border Radius Tokens ---- */
  --radius-sm:             4px;
  --radius-md:             8px;
  --radius-lg:             12px;
  --radius-xl:             16px;
  --radius-full:           9999px;

  /* ---- Shadow Tokens ---- */
  --shadow-sm:             0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md:             0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg:             0 8px 24px rgba(15, 23, 42, 0.12);
  --shadow-xl:             0 16px 48px rgba(15, 23, 42, 0.16);

  /* ---- Transition Tokens ---- */
  --transition-fast:       150ms ease;
  --transition-normal:     250ms ease;
  --transition-slow:       400ms ease;

  /* ---- Z-Index Scale ---- */
  --z-base:                0;
  --z-above:               10;
  --z-overlay:             100;
  --z-modal:               200;

  /* ---- Layout Tokens ---- */
  --board-gap:             4px;
  --cell-size:             96px;
  --cell-size-sm:          80px;
  --board-size:            calc(var(--cell-size) * 3 + var(--board-gap) * 2);
  --board-size-sm:         calc(var(--cell-size-sm) * 3 + var(--board-gap) * 2);
  --content-max-width:     480px;
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width     | Token                  | Notes                                          |
|------------|-----------|------------------------|-------------------------------------------------|
| **xs**     | < 360px   | `--bp-xs`              | Smallest phones (Galaxy Fold outer). Cell: 72px.|
| **sm**     | 360-479px | `--bp-sm: 360px`       | Standard phones. Cell: 80px.                    |
| **md**     | 480-767px | `--bp-md: 480px`       | Large phones, small tablets. Cell: 96px.        |
| **lg**     | 768-1023px| `--bp-lg: 768px`       | Tablets. Cell: 104px. Marks at 56px.            |
| **xl**     | 1024px+   | `--bp-xl: 1024px`      | Desktop. Cell: 120px. Marks at 64px.            |

### Breakpoint Media Queries
```css
/* Small phones */
@media (max-width: 359px) { ... }

/* Standard mobile (default -- mobile-first base styles) */

/* Large mobile / small tablet */
@media (min-width: 480px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

---

## 8. Screen Mockups

### 8.1 Mode Selection Screen

This is the landing screen. Two large, card-style buttons guide the user to choose their mode. The game title anchors the top. The layout is vertically centered.

#### Mobile (360px)
```
┌──────────────────────────────────────┐
│                                      │
│            (vertical center)         │
│                                      │
│         ╳ ╱ ○                        │  -- Decorative logo mark
│                                      │
│          Tic Tac Toe                 │  -- H1, 32px, Inter ExtraBold
│                                      │    colour: var(--color-secondary)
│      A clean, minimal game.          │  -- body, 16px, Inter Regular
│                                      │    colour: var(--color-text-secondary)
│                                      │
│  ┌──────────────────────────────┐   │
│  │  [CPU icon]                  │   │  -- Mode card, 100% width
│  │                              │   │    bg: var(--color-surface)
│  │  vs Computer                 │   │    border: 1px solid var(--color-border)
│  │  Challenge the AI            │   │    border-radius: var(--radius-lg)
│  │                              │   │    padding: var(--space-6)
│  └──────────────────────────────┘   │    shadow: var(--shadow-sm)
│                                      │    min-height: 88px
│          ↕ 16px gap                  │
│  ┌──────────────────────────────┐   │
│  │  [Users icon]                │   │  -- Same card style
│  │                              │   │
│  │  vs Player                   │   │    Title: 20px, semibold
│  │  Play with a friend          │   │    Subtitle: 14px, regular
│  │                              │   │    colour (subtitle): --color-text-secondary
│  └──────────────────────────────┘   │
│                                      │
│                                      │
└──────────────────────────────────────┘
 16px padding left/right
```

#### Desktop (1024px+)
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                          (vertical center)                           │
│                                                                      │
│                           ╳ ╱ ○                                     │
│                                                                      │
│                         Tic Tac Toe                                  │  -- H1, 48px
│                    A clean, minimal game.                             │  -- body, 16px
│                                                                      │
│            ┌─────────────────┐    ┌─────────────────┐               │  -- Cards sit
│            │  [CPU icon]     │    │  [Users icon]   │               │    side by side
│            │                 │    │                 │               │    gap: 24px
│            │  vs Computer    │    │  vs Player      │               │    max-width each:
│            │  Challenge      │    │  Play with      │               │    232px
│            │  the AI         │    │  a friend       │               │
│            │                 │    │                 │               │
│            └─────────────────┘    └─────────────────┘               │
│                                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
 Content max-width: 560px, centered horizontally
```

#### Interaction Notes
- Cards have a hover state: border transitions to `--color-primary`, shadow lifts to `--shadow-md`, subtle translateY(-2px).
- Cards have a focus-visible outline: 2px solid `--color-primary`, 2px offset.
- Cards have an active/pressed state: translateY(0), shadow returns to `--shadow-sm`, bg tints to `--color-primary-light`.
- Both cards are full-width `<button>` elements (not links) for accessibility -- they trigger in-app screen transitions.

---

### 8.2 AI Difficulty Selection Screen

Appears after tapping "vs Computer". Includes a back action, difficulty options, and an inline symbol chooser.

#### Mobile (360px)
```
┌──────────────────────────────────────┐
│                                      │
│  [<- Back]            vs Computer    │  -- Top bar, 56px height
│                                      │    Back: ghost button, 14px
├──────────────────────────────────────┤    "vs Computer": text-sm, semibold
│                                      │     colour: --color-text-secondary
│       Choose Difficulty              │  -- H2, 26px, bold
│                                      │    colour: --color-secondary
│  ┌──────────────────────────────┐   │
│  │  Easy                        │   │  -- Difficulty card
│  │  AI makes random moves       │   │    Same card pattern as mode cards
│  └──────────────────────────────┘   │    Title: 18px, semibold
│          ↕ 12px                      │    Description: 14px, regular
│  ┌──────────────────────────────┐   │    colour (desc): --color-text-secondary
│  │  Medium                      │   │
│  │  A decent challenge          │   │
│  └──────────────────────────────┘   │
│          ↕ 12px                      │
│  ┌──────────────────────────────┐   │
│  │  Hard                        │   │
│  │  Unbeatable AI               │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │  -- Subtle divider
│                                      │
│       Play as                        │  -- Label: 14px, semibold
│                                      │    colour: --color-text-secondary
│    ┌──────────┐    ┌──────────┐     │
│    │          │    │          │     │  -- Toggle buttons, 64px x 64px
│    │    X     │    │    O     │     │    Selected: primary bg, white text
│    │          │    │          │     │    Unselected: surface bg, border
│    └──────────┘    └──────────┘     │    X default selected
│     (selected)      (unselected)     │    Font: --font-mono, 32px, bold
│                                      │
└──────────────────────────────────────┘
```

#### Interaction Notes
- Tapping a difficulty card immediately starts the game (no separate "Start" button -- reduces taps).
- The symbol selector defaults to X. Users can switch before selecting difficulty.
- If user changes symbol to O, the AI will move first after difficulty is selected.
- Back arrow returns to mode selection. No confirmation needed (per PRD).
- Difficulty cards use the same hover/focus/active patterns as mode cards.

---

### 8.3 Main Game Board Screen

The primary gameplay screen. Contains: back navigation, turn/status indicator, the 3x3 game grid, score tracker, and action buttons.

#### Mobile (360px) -- In Progress (X's Turn)
```
┌──────────────────────────────────────┐
│                                      │
│  [<- Menu]     Easy    [Restart ↻]  │  -- Top bar, 48px height
│                                      │    Menu: ghost button
├──────────────────────────────────────┤    Difficulty badge: xs text, pill shape
│                                      │      bg: --color-primary-light
│                                      │      colour: --color-primary
│               X's Turn               │  -- Turn indicator, 20px, semibold
│            ───────────               │    colour: --color-player-x
│                                      │    Underline: 3px, --color-player-x
│                                      │    (changes to --color-player-o on O's turn)
│       ┌────────┬────────┬────────┐  │
│       │        │        │        │  │  -- Game board
│       │   X    │        │   O    │  │    CSS Grid, 3 columns
│       │        │        │        │  │    Gap: var(--board-gap) = 4px
│       ├────────┼────────┼────────┤  │    Cell: 80x80px (mobile)
│       │        │        │        │  │    bg (cell): var(--color-surface)
│       │        │   X    │        │  │    border: none (use gap + board bg for lines)
│       │        │        │        │  │    Board bg: var(--color-border)
│       ├────────┼────────┼────────┤  │    border-radius (board): var(--radius-lg)
│       │        │        │        │  │    overflow: hidden
│       │   O    │        │        │  │
│       │        │        │        │  │    X mark: --color-player-x, --font-mono
│       └────────┴────────┴────────┘  │    O mark: --color-player-o, --font-mono
│                                      │    Mark size: var(--text-mark) = 48px
│                                      │
│    ┌──────────┬──────────┬────────┐ │  -- Score tracker
│    │  X: 2    │ Draw: 1  │  O: 1  │ │    Inline flex, centered
│    └──────────┴──────────┴────────┘ │    Font: 14px, semibold
│                                      │    X colour: --color-player-x
│                                      │    O colour: --color-player-o
│                                      │    Draw colour: --color-text-secondary
│                                      │    Dividers: 1px --color-border
│                                      │
└──────────────────────────────────────┘
```

#### Mobile (360px) -- Game Won (X Wins, diagonal)
```
┌──────────────────────────────────────┐
│                                      │
│  [<- Menu]     Easy    [Restart ↻]  │
│                                      │
├──────────────────────────────────────┤
│                                      │
│                                      │
│              X Wins!                 │  -- Result text, 24px, bold
│            ───────────               │    colour: --color-player-x
│                                      │    (or "O Wins!" in --color-player-o)
│                                      │    (or "It's a Draw!" in --color-warning)
│       ┌────────┬────────┬────────┐  │
│       │ ██████ │        │        │  │  -- Winning cells highlighted
│       │ █ X  █ │   O    │   O    │  │    bg: --color-success-light
│       │ ██████ │        │        │  │    border: 2px solid --color-success
│       ├────────┼────────┼────────┤  │    Non-winning cells: opacity 0.5
│       │        │ ██████ │        │  │
│       │        │ █ X  █ │        │  │
│       │        │ ██████ │        │  │
│       ├────────┼────────┼────────┤  │
│       │        │        │ ██████ │  │
│       │        │        │ █ X  █ │  │
│       │        │        │ ██████ │  │
│       └────────┴────────┴────────┘  │
│                                      │
│    ┌──────────┬──────────┬────────┐ │
│    │  X: 3    │ Draw: 1  │  O: 1  │ │  -- Score updated
│    └──────────┴──────────┴────────┘ │
│                                      │
│      [ ──── Play Again ──── ]       │  -- Primary button, full width
│                                      │    bg: --color-primary
│                                      │    colour: #FFFFFF
│                                      │    height: 48px
│                                      │    border-radius: --radius-md
│                                      │
└──────────────────────────────────────┘
```

#### Desktop (1024px+) -- In Progress
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [<- Menu]                 Easy                       [Restart ↻]   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                            X's Turn                                  │
│                          ───────────                                 │
│                                                                      │
│                  ┌──────────┬──────────┬──────────┐                 │
│                  │          │          │          │                 │  -- Cell: 120x120px
│                  │    X     │          │    O     │                 │    Mark: 64px
│                  │          │          │          │                 │
│                  ├──────────┼──────────┼──────────┤                 │
│                  │          │          │          │                 │
│                  │          │    X     │          │                 │
│                  │          │          │          │                 │
│                  ├──────────┼──────────┼──────────┤                 │
│                  │          │          │          │                 │
│                  │    O     │          │          │                 │
│                  │          │          │          │                 │
│                  └──────────┴──────────┴──────────┘                 │
│                                                                      │
│                  ┌──────────┬──────────┬──────────┐                 │
│                  │  X: 2    │ Draw: 1  │  O: 1    │                 │
│                  └──────────┴──────────┴──────────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
 Content max-width: 560px, centered
```

#### Multiplayer Variant
The game board screen for "vs Player" mode is identical except:
- No difficulty badge in the top bar.
- Top bar reads: `[<- Menu]` on left, `[Restart]` on right, no center badge.
- Turn indicator says "Player X's Turn" / "Player O's Turn".
- Score tracker labels say "Player X" / "Player O" instead of just "X" / "O".

---

### 8.4 Win/Draw Result Overlay

The result is communicated in two ways simultaneously for clarity:
1. **Inline**: The turn indicator text changes to "X Wins!" / "O Wins!" / "It's a Draw!" and the winning cells highlight.
2. **Play Again Button**: Appears below the score tracker.

There is deliberately NO modal overlay. Rationale:
- Modals add interaction cost (must be dismissed).
- The inline result + highlighted board provides immediate visual feedback.
- The "Play Again" button is always visible without dismissing anything.
- This is cleaner, faster, and more accessible.

#### Draw State (Mobile)
```
┌──────────────────────────────────────┐
│                                      │
│  [<- Menu]     Hard    [Restart ↻]  │
│                                      │
├──────────────────────────────────────┤
│                                      │
│           It's a Draw!               │  -- 24px, bold
│          ───────────────             │    colour: --color-warning
│                                      │
│       ┌────────┬────────┬────────┐  │
│       │        │        │        │  │  -- All cells at full opacity
│       │   X    │   O    │   X    │  │    No highlight applied
│       │        │        │        │  │    Board bg tints to
│       ├────────┼────────┼────────┤  │    --color-warning-light subtly
│       │        │        │        │  │
│       │   O    │   X    │   X    │  │
│       │        │        │        │  │
│       ├────────┼────────┼────────┤  │
│       │        │        │        │  │
│       │   O    │   X    │   O    │  │
│       │        │        │        │  │
│       └────────┴────────┴────────┘  │
│                                      │
│    ┌──────────┬──────────┬────────┐ │
│    │  X: 2    │ Draw: 2  │  O: 1  │ │
│    └──────────┴──────────┴────────┘ │
│                                      │
│      [ ──── Play Again ──── ]       │
│                                      │
└──────────────────────────────────────┘
```

---

## 9. Component Specifications

### 9.1 Button

Three variants: **Primary**, **Secondary**, **Ghost**.

#### Primary Button (CTA -- "Play Again", mode cards on press)
```
Property               Value
─────────────────────  ──────────────────────────────────────
width                  100% (mobile) or auto with min-width: 200px (desktop)
height                 48px
padding                0 var(--space-6)       [0 24px]
background             var(--color-primary)   [#4F46E5]
colour (text)          #FFFFFF
font-size              var(--text-body)       [16px]
font-weight            var(--weight-semibold) [600]
line-height            1
letter-spacing         0
border                 none
border-radius          var(--radius-md)       [8px]
box-shadow             var(--shadow-sm)
cursor                 pointer
transition             background var(--transition-fast),
                       box-shadow var(--transition-fast),
                       transform var(--transition-fast)

States:
  hover                bg: var(--color-primary-hover) [#4338CA]
                       box-shadow: var(--shadow-md)
                       transform: translateY(-1px)

  focus-visible        outline: 2px solid var(--color-primary)
                       outline-offset: 2px

  active               bg: #3730A3
                       box-shadow: var(--shadow-sm)
                       transform: translateY(0)

  disabled             bg: var(--color-border) [#E2E8F0]
                       colour: var(--color-text-secondary)
                       cursor: not-allowed
                       box-shadow: none
```

#### Secondary Button (used if needed for secondary actions)
```
Property               Value
─────────────────────  ──────────────────────────────────────
height                 48px
padding                0 var(--space-6)
background             var(--color-surface)
colour (text)          var(--color-primary)
border                 1px solid var(--color-border)
border-radius          var(--radius-md)
font-size / weight     16px / 600

States:
  hover                border-color: var(--color-primary)
                       bg: var(--color-primary-light)
  focus-visible        outline: 2px solid var(--color-primary), offset 2px
  active               bg: #E0E7FF
```

#### Ghost Button (Back, Restart)
```
Property               Value
─────────────────────  ──────────────────────────────────────
height                 40px
padding                0 var(--space-3)       [0 12px]
background             transparent
colour (text)          var(--color-text-secondary)
border                 none
border-radius          var(--radius-md)
font-size              var(--text-sm)         [14px]
font-weight            var(--weight-medium)   [500]

States:
  hover                bg: rgba(15, 23, 42, 0.05)
                       colour: var(--color-text-primary)
  focus-visible        outline: 2px solid var(--color-primary), offset 2px
  active               bg: rgba(15, 23, 42, 0.08)
```

### 9.2 Game Cell

```
Property               Value
─────────────────────  ──────────────────────────────────────
width                  var(--cell-size-sm) [80px] mobile
                       var(--cell-size) [96px] at 480px+
                       104px at 768px+
                       120px at 1024px+
height                 same as width (square)
background             var(--color-surface) [#FFFFFF]
border                 none (gap-based grid lines)
border-radius          0 (inner cells); corner cells get board radius
display                flex
align-items            center
justify-content        center
cursor                 pointer (if empty and game active)
transition             background var(--transition-fast)
touch-action           manipulation
-webkit-tap-highlight  transparent

Mark Typography:
  font-family          var(--font-mono)
  font-size            var(--text-mark) [48px] mobile, var(--text-mark-lg) [64px] desktop
  font-weight          var(--weight-bold) [700]
  colour (X)           var(--color-player-x) [#6366F1]
  colour (O)           var(--color-player-o) [#EC4899]
  user-select          none

States:
  empty + hover        bg: var(--color-player-x-light) or var(--color-player-o-light)
                       depending on whose turn it is
                       Show faint ghost of the current player's mark at opacity 0.2

  empty + focus-vis    outline: 2px solid var(--color-primary) inset
                       (inset to avoid breaking grid alignment)

  occupied             cursor: default
                       pointer-events: none (if game active)

  winning-cell         bg: var(--color-success-light) [#D1FAE5]
                       mark colour remains player colour
                       subtle scale animation: transform: scale(1.08)

  non-winning (game    opacity: 0.4
  over, not in
  winning line)

  draw-cell            no highlight, full opacity on all cells
                       board background briefly pulses --color-warning-light
```

### 9.3 Game Board

```
Property               Value
─────────────────────  ──────────────────────────────────────
display                grid
grid-template-columns  repeat(3, 1fr)
grid-template-rows     repeat(3, 1fr)
gap                    var(--board-gap) [4px]
background             var(--color-border) [#E2E8F0]
                       (gap colour forms the grid lines)
border-radius          var(--radius-lg) [12px]
overflow               hidden (clips cell corners to match board radius)
box-shadow             var(--shadow-md)
width                  fit-content
margin                 0 auto
transition             background var(--transition-normal)

Responsive Sizing:
  < 360px              grid cells 72px -> board ~220px
  360-479px            grid cells 80px -> board ~244px
  480-767px            grid cells 96px -> board ~296px
  768-1023px           grid cells 104px -> board ~320px
  1024px+              grid cells 120px -> board ~368px

Draw State:
  background           var(--color-warning-light) for 600ms, then back to --color-border

Game Over State:
  pointer-events       none (disables all cell interactions)
```

### 9.4 Score Tracker

```
Property               Value
─────────────────────  ──────────────────────────────────────
display                flex
justify-content        center
align-items            center
gap                    0 (sections divided by border)
width                  fit-content
margin                 var(--space-6) auto 0
background             var(--color-surface)
border                 1px solid var(--color-border)
border-radius          var(--radius-md) [8px]
overflow               hidden

Each Section:
  padding              var(--space-2) var(--space-4)  [8px 16px]
  border-right         1px solid var(--color-border) (except last)
  text-align           center
  min-width            72px

Label:
  font-size            var(--text-xs) [12px]
  font-weight          var(--weight-medium) [500]
  colour               var(--color-text-secondary)
  text-transform       uppercase
  letter-spacing       0.05em
  margin-bottom        var(--space-1)

Value:
  font-size            var(--text-lg) [20px]
  font-weight          var(--weight-bold) [700]
  font-variant-numeric tabular-nums
  colour (X section)   var(--color-player-x)
  colour (Draw)        var(--color-text-secondary)
  colour (O section)   var(--color-player-o)

Score Update Animation:
  On value change, the number briefly scales to 1.2 and back (200ms)
  Uses CSS transform + transition
```

#### Score Tracker Layout

```
┌──────────────────┬──────────────────┬──────────────────┐
│    X (Player)    │      DRAW        │    O (AI)        │
│                  │                  │                  │
│       2          │       1          │       1          │
└──────────────────┴──────────────────┴──────────────────┘

In AI mode, labels may read:
  "YOU (X)" | "DRAW" | "AI (O)"
or if player chose O:
  "AI (X)" | "DRAW" | "YOU (O)"

In multiplayer mode:
  "PLAYER X" | "DRAW" | "PLAYER O"
```

### 9.5 Turn Indicator

```
Property               Value
─────────────────────  ──────────────────────────────────────
text-align             center
margin-bottom          var(--space-6) [24px]

Text:
  font-size            var(--text-lg) [20px]
  font-weight          var(--weight-semibold) [600]
  colour (X turn)      var(--color-player-x)
  colour (O turn)      var(--color-player-o)
  colour (X wins)      var(--color-player-x)
  colour (O wins)      var(--color-player-o)
  colour (draw)        var(--color-warning)

Underline Indicator:
  width                48px
  height               3px
  border-radius        var(--radius-full)
  background           matches text colour
  margin               var(--space-2) auto 0
  transition           background var(--transition-fast)

Screen Reader:
  Use aria-live="polite" on this element so turn changes are announced.
  Use role="status".
```

### 9.6 Result Display (Inline -- No Modal)

When the game ends, the Turn Indicator transforms into the Result Display.

```
Property               Value
─────────────────────  ──────────────────────────────────────
Container is the same as Turn Indicator (same DOM element).

Text:
  Content changes to "X Wins!", "O Wins!", or "It's a Draw!"
  font-size            var(--text-h3) [24px]
  font-weight          var(--weight-bold) [700]
  colour               same colour mapping as turn indicator
  animation            fadeInUp (opacity 0->1, translateY(8px->0), 300ms ease-out)

Play Again Button:
  Appears below score tracker
  margin-top           var(--space-6) [24px]
  Uses Primary Button spec (Section 9.1)
  Full width on mobile
  animation            fadeIn (opacity 0->1, 200ms, delay 200ms)
```

### 9.7 Difficulty Badge

Displayed in the top bar during AI gameplay.

```
Property               Value
─────────────────────  ──────────────────────────────────────
display                inline-flex
align-items            center
padding                var(--space-1) var(--space-3)  [4px 12px]
background             var(--color-primary-light) [#EEF2FF]
colour                 var(--color-primary) [#4F46E5]
font-size              var(--text-xs) [12px]
font-weight            var(--weight-semibold) [600]
text-transform         uppercase
letter-spacing         0.05em
border-radius          var(--radius-full) [9999px]
line-height            1.5
```

### 9.8 Symbol Selector

Two toggle buttons for choosing X or O before an AI game.

```
Property               Value
─────────────────────  ──────────────────────────────────────
Container:
  display              flex
  gap                  var(--space-4) [16px]
  justify-content      center

Each Toggle:
  width                64px
  height               64px
  display              flex
  align-items          center
  justify-content      center
  border-radius        var(--radius-lg) [12px]
  font-family          var(--font-mono)
  font-size            32px
  font-weight          var(--weight-bold)
  cursor               pointer
  transition           all var(--transition-fast)

  Unselected State:
    background         var(--color-surface)
    border             2px solid var(--color-border)
    colour             var(--color-text-secondary)

  Selected State (X):
    background         var(--color-player-x-light) [#E0E7FF]
    border             2px solid var(--color-player-x) [#6366F1]
    colour             var(--color-player-x)

  Selected State (O):
    background         var(--color-player-o-light) [#FCE7F3]
    border             2px solid var(--color-player-o) [#EC4899]
    colour             var(--color-player-o)

  Hover (unselected):
    border-color       var(--color-border-strong)
    bg                 var(--color-bg)

  Focus-visible:
    outline            2px solid var(--color-primary), offset 2px

ARIA:
  Use role="radiogroup" on container
  Use role="radio" + aria-checked on each toggle
```

### 9.9 Mode Selection Card

```
Property               Value
─────────────────────  ──────────────────────────────────────
width                  100% (mobile), 232px (desktop side-by-side)
min-height             88px
padding                var(--space-6) [24px]
background             var(--color-surface) [#FFFFFF]
border                 1px solid var(--color-border) [#E2E8F0]
border-radius          var(--radius-lg) [12px]
box-shadow             var(--shadow-sm)
cursor                 pointer
transition             all var(--transition-fast)
text-align             left (mobile), center (desktop)

Icon:
  Size                 24px
  colour               var(--color-primary)
  margin-bottom        var(--space-2)

Title:
  font-size            var(--text-lg) [20px]
  font-weight          var(--weight-semibold) [600]
  colour               var(--color-secondary) [#0F172A]
  margin-bottom        var(--space-1) [4px]

Subtitle:
  font-size            var(--text-sm) [14px]
  font-weight          var(--weight-regular) [400]
  colour               var(--color-text-secondary) [#64748B]

States:
  hover                border-color: var(--color-primary)
                       box-shadow: var(--shadow-md)
                       transform: translateY(-2px)

  focus-visible        outline: 2px solid var(--color-primary)
                       outline-offset: 2px

  active               transform: translateY(0)
                       box-shadow: var(--shadow-sm)
                       bg: var(--color-primary-light)
```

---

## 10. Interactive States

### 10.1 Cell States Matrix

```
State                    Background              Mark         Cursor       Border/Outline
───────────────────────  ──────────────────────  ──────────  ───────────  ──────────────
Empty (default)          --color-surface          none        pointer      none
Empty (hover, X turn)    --color-player-x-light   ghost X    pointer      none
                                                  at 20%
Empty (hover, O turn)    --color-player-o-light   ghost O    pointer      none
                                                  at 20%
Empty (focus-visible)    --color-surface          none        pointer      2px inset primary
Occupied (X)             --color-surface          X (full)   default      none
Occupied (O)             --color-surface          O (full)   default      none
Winning Cell             --color-success-light    mark       default      none
                                                  (scale 1.08)
Non-Winning (game over)  --color-surface          mark at    default      none
                         at opacity 0.4           opacity 0.4
Draw Cell                --color-surface          mark       default      none
                                                  (full)
Disabled (AI thinking)   --color-surface          mark       wait         none
```

### 10.2 Button States Matrix

```
State            Primary                    Ghost
───────────────  ─────────────────────────  ─────────────────────
Default          bg: primary, text: white   bg: transparent
Hover            bg: primary-hover, lift    bg: rgba(0,0,0,0.05)
Focus-Visible    2px primary outline        2px primary outline
Active/Pressed   bg: #3730A3, no lift       bg: rgba(0,0,0,0.08)
Disabled         bg: border, text: muted    opacity: 0.5
```

---

## 11. Animation & Transition Guidance

All animations respect `prefers-reduced-motion: reduce` by disabling transforms and reducing durations to near-zero.

### 11.1 Mark Placement
```css
@keyframes mark-appear {
  0%   { opacity: 0; transform: scale(0.5); }
  60%  { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
/* Duration: 250ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1) -- slight overshoot */
```

### 11.2 Winning Cell Highlight
```css
@keyframes winning-cell {
  0%   { background: var(--color-surface); transform: scale(1); }
  50%  { background: var(--color-success-light); transform: scale(1.1); }
  100% { background: var(--color-success-light); transform: scale(1.05); }
}
/* Duration: 400ms, stagger: 80ms per cell (first winning cell, then second, then third) */
```

### 11.3 Score Update
```css
@keyframes score-bump {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
/* Duration: 200ms */
```

### 11.4 Play Again Button Entrance
```css
@keyframes fade-in-up {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
/* Duration: 300ms, delay: 300ms after game end, easing: ease-out */
```

### 11.5 Screen Transitions
- Mode selection to difficulty: Slide left (outgoing) / slide in from right (incoming). Duration 250ms.
- Difficulty to game board: Same slide pattern.
- Back navigation: Reverse slide direction.
- If `prefers-reduced-motion: reduce`, use a simple crossfade (150ms) instead.

### 11.6 AI Thinking Indicator
During the AI's artificial delay (300-600ms), the turn indicator text shows a subtle pulse animation:
```css
@keyframes thinking-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
/* Duration: 800ms, infinite while AI is thinking */
/* Text: "AI is thinking..." */
```

### 11.7 Reduced Motion Override
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Accessibility Specifications

### 12.1 Keyboard Navigation

| Element            | Tab Order | Activation      | Notes                                    |
|--------------------|-----------|-----------------|------------------------------------------|
| Back / Menu button | 1         | Enter / Space   | Returns to previous screen               |
| Restart button     | 2         | Enter / Space   | Resets current game                      |
| Game cells (1-9)   | 3-11      | Enter / Space   | Places mark in cell. Tab order: L-to-R, top-to-bottom. |
| Play Again button  | 12        | Enter / Space   | Visible only after game ends             |

- Arrow keys can navigate between cells within the grid (grid navigation pattern).
- Tab moves focus to the grid; arrow keys move within it.
- `role="grid"` on the board, `role="gridcell"` on each cell.
- `aria-label` on each cell: "Row 1, Column 1, empty" / "Row 1, Column 1, X".

### 12.2 Screen Reader Announcements

| Event                | Announcement                              | Method               |
|----------------------|-------------------------------------------|----------------------|
| Turn change          | "X's turn" / "O's turn"                  | aria-live="polite"   |
| Mark placed          | "X placed in row 2, column 1"            | aria-live="polite"   |
| AI thinking          | "AI is thinking"                          | aria-live="polite"   |
| Game won             | "X wins! Winning line: row 1"            | aria-live="assertive"|
| Game drawn           | "Game is a draw"                          | aria-live="assertive"|
| Score updated        | "Score: X 3, Draw 1, O 1"               | aria-live="polite"   |

### 12.3 Focus Management

- When transitioning between screens, focus moves to the first interactive element of the new screen.
- After a game ends, focus moves to the "Play Again" button.
- After placing a mark, focus remains on the grid (does not jump elsewhere).
- Focus indicators: 2px solid `--color-primary`, 2px offset. Always visible on keyboard navigation (`:focus-visible` only).

### 12.4 Colour Independence

- Player X and O are distinguished by shape (the letterforms themselves), colour, and position label -- never colour alone.
- Winning cells use a background highlight AND a subtle scale transform, not just colour.
- The turn indicator uses text ("X's Turn") alongside the coloured underline.

### 12.5 Touch Targets

- All interactive elements meet the 48x48px minimum touch target size.
- Game cells on the smallest breakpoint (72px) exceed this easily.
- Ghost buttons (Back, Restart) have 40px visible height but 48px total clickable area (padded).

---

## 13. Dark Mode Specifications

Dark mode activates automatically via `prefers-color-scheme: dark`. The CSS custom properties are overridden.

### 13.1 Dark Mode Palette

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:              #0F172A;
    --color-surface:         #1E293B;
    --color-primary:         #818CF8;
    --color-primary-hover:   #A5B4FC;
    --color-primary-light:   rgba(129, 140, 248, 0.15);
    --color-secondary:       #F1F5F9;
    --color-text-primary:    #E2E8F0;
    --color-text-secondary:  #94A3B8;
    --color-border:          #334155;
    --color-border-strong:   #475569;

    --color-player-x:        #A5B4FC;
    --color-player-x-light:  rgba(165, 180, 252, 0.15);
    --color-player-o:        #F9A8D4;
    --color-player-o-light:  rgba(249, 168, 212, 0.15);

    --color-success:         #34D399;
    --color-success-light:   rgba(52, 211, 153, 0.15);
    --color-warning:         #FBBF24;
    --color-warning-light:   rgba(251, 191, 36, 0.15);
    --color-error:           #F87171;
    --color-info:            #60A5FA;

    --shadow-sm:             0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md:             0 4px 12px rgba(0, 0, 0, 0.4);
    --shadow-lg:             0 8px 24px rgba(0, 0, 0, 0.5);
    --shadow-xl:             0 16px 48px rgba(0, 0, 0, 0.6);
  }
}
```

### 13.2 Dark Mode Contrast Ratios

| Combination                                       | Ratio  | WCAG Level        |
|---------------------------------------------------|--------|--------------------|
| Secondary (#F1F5F9) on Background (#0F172A)       | 14.8:1 | AAA                |
| Text Primary (#E2E8F0) on Background (#0F172A)    | 12.1:1 | AAA                |
| Text Primary (#E2E8F0) on Surface (#1E293B)       | 8.5:1  | AAA                |
| Text Secondary (#94A3B8) on Surface (#1E293B)     | 4.5:1  | AA                 |
| Primary (#818CF8) on Surface (#1E293B)            | 5.0:1  | AA                 |
| Player X (#A5B4FC) on Surface (#1E293B)           | 6.7:1  | AA                 |
| Player O (#F9A8D4) on Surface (#1E293B)           | 7.2:1  | AA                 |

---

## 14. Edge Cases & Empty States

### 14.1 First Visit / Empty Score
```
Score tracker shows:  X: 0  |  Draw: 0  |  O: 0
All values start at zero. No special "empty" state needed -- zeros are meaningful.
```

### 14.2 AI Thinking State
```
Turn indicator text:  "AI is thinking..."
Turn indicator colour: --color-player-o (or X if AI plays X)
Board:                 pointer-events: none (all cells non-interactive)
Cursor:                wait (on the board area)
Animation:             Thinking pulse on text
```

### 14.3 Very Narrow Viewport (< 320px)
```
- Cell size reduces to 64px minimum (board ~196px total)
- Mark font size reduces to 36px
- Score tracker stacks vertically if needed (flex-wrap: wrap)
- Horizontal padding reduces to 12px
```

### 14.4 Landscape Mobile
```
- Reduce vertical margins between sections (space-8 -> space-4)
- Turn indicator and board should still fit above the fold
- Score tracker moves closer to board
- No layout reflow needed -- single column still works
```

### 14.5 High Score Counts (99+)
```
- Score values use tabular-nums for stable width
- At 100+, values are displayed as-is (no truncation)
- min-width on score sections ensures no layout shift: 72px handles 3-digit numbers
```

### 14.6 Game Restart During AI Turn
```
- Cancel any pending setTimeout for AI move
- Immediately clear the board
- Reset to human's turn (X if human is X)
- No score change for abandoned game (per PRD)
```

---

## 15. Recommendations & Next Steps

### 15.1 Variations Worth Exploring

1. **Confetti micro-animation on win**: A brief, subtle confetti burst (CSS-only, 5-8 particles) behind the winning text. Adds delight without being childish if particles are small, muted-colour, and disappear in < 1 second.

2. **Winning line SVG overlay**: Instead of just highlighting cells, draw an SVG line across the three winning cells. This is more visually satisfying and clearer than cell background colour alone.

3. **Dark mode manual toggle**: While auto-detection via `prefers-color-scheme` is sufficient for MVP, a sun/moon toggle in the top bar would give users explicit control. Low effort post-MVP.

### 15.2 Usability Testing Suggestions

1. **5-second test**: Show the mode selection screen for 5 seconds. Ask: "What is this? What can you do?" Validates clarity.
2. **Task-based test**: "Start a game against the AI on Medium difficulty." Measure time-to-task and errors. Target: < 6 seconds, 0 errors.
3. **Accessibility audit**: Run with VoiceOver (macOS/iOS) and NVDA (Windows). Verify all game states are announced.
4. **Mobile device testing**: Test on real devices -- iPhone SE (375px), Galaxy S21 (360px), iPad (768px). Verify touch targets and layout.
5. **Colour blindness simulation**: Use tools like Sim Daltonism or Chrome DevTools to verify distinguishability of X and O marks under protanopia, deuteranopia, and tritanopia.

### 15.3 Edge Cases to Design For (Post-MVP)

- **Offline state**: If PWA support is added, show a subtle "Playing offline" badge.
- **Orientation lock warning**: On very small screens in landscape, consider suggesting portrait mode.
- **Browser back button**: Integrate with the History API so the browser back button navigates between game screens.

### 15.4 Implementation Notes for Developers

1. **Use CSS custom properties exactly as defined** in Section 6. This ensures dark mode works with a single media query override.
2. **Board is a CSS Grid**, not a table. Use `gap` for grid lines rather than cell borders. The board background colour showing through the gap creates the line effect.
3. **Mark rendering**: Use text content ("X" / "O") with the monospace font, not SVGs or images. This is simpler, more accessible, and scales naturally.
4. **Touch handling**: Apply `touch-action: manipulation` on the board to prevent double-tap zoom on mobile Safari.
5. **Font loading**: Use `font-display: swap` for Inter and JetBrains Mono. The system font stack provides adequate fallbacks during loading.
6. **Score tracker numbers**: Use `font-variant-numeric: tabular-nums` to prevent layout shifts when numbers change.

---

## Appendix A: Complete Screen Flow Diagram

```
┌─────────────────────┐
│   Mode Selection     │
│                     │
│  [vs Computer]      │──────┐
│  [vs Player]   │──────────────────────────────────────────┐
│                     │      │                              │
└─────────────────────┘      v                              v
                     ┌─────────────────┐          ┌─────────────────┐
                     │ AI Difficulty    │          │ Game Board      │
                     │ + Symbol Choice  │          │ (Multiplayer)   │
                     │                 │          │                 │
                     │ [Easy]          │          │ Player X/O      │
                     │ [Medium]        │          │ turns            │
                     │ [Hard]          │          │                 │
                     │                 │          │ [<-Menu]        │
                     │ Play as [X][O]  │          │ [Restart]       │
                     │                 │          │ [Play Again]    │
                     │ [<- Back]       │          │                 │
                     └────────┬────────┘          └────────┬────────┘
                              │                            │
                              v                            │
                     ┌─────────────────┐                   │
                     │ Game Board      │                   │
                     │ (vs AI)         │                   │
                     │                 │                   │
                     │ Human + AI      │                   │
                     │ turns            │                   │
                     │                 │                   │
                     │ [<-Menu]        │                   │
                     │ [Restart]       │                   │
                     │ [Play Again]    │                   │
                     └────────┬────────┘                   │
                              │                            │
                              v                            v
                     ┌─────────────────────────────────────────┐
                     │        Inline Result Display            │
                     │  "X Wins!" / "O Wins!" / "It's a Draw" │
                     │  + Winning cell highlight               │
                     │  + Score update                         │
                     │  + [Play Again] button                  │
                     │  + [<- Menu] still available            │
                     └─────────────────────────────────────────┘
```

---

## Appendix B: Icon Recommendations

Use a minimal icon set. Suggested source: Lucide Icons (open-source, MIT license, consistent stroke width).

| Icon         | Usage                          | Lucide Name     |
|--------------|--------------------------------|-----------------|
| CPU/Monitor  | "vs Computer" card             | `monitor`       |
| Users        | "vs Player" card               | `users`         |
| Arrow Left   | Back navigation                | `arrow-left`    |
| Rotate CW    | Restart game                   | `rotate-cw`     |

Icon specifications:
- Size: 24px (20px on mobile)
- Stroke width: 2px
- Colour: inherits from parent text colour

---

*End of UX Mockups & Design System Document*
