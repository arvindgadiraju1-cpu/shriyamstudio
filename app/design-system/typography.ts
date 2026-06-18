/**
 * Shriyam Studio — Typography System
 * =============================================================================
 * One typed type-scale, consumed everywhere via the `.t-*` classes defined in
 * `app/styles/app.css`. Components never hardcode font sizes/weights — they use
 * a scale class (e.g. `class="t-display-l"`) or a semantic element styled here.
 *
 * Voice:
 *   - Playfair Display — the editorial display voice (headings, statements).
 *   - Inter — the quiet workhorse (body, UI, captions).
 *
 * Fonts are loaded via <link rel="preconnect"> + a single stylesheet in
 * `app/root.jsx` (NOT a render-blocking CSS @import) with display=swap.
 * =============================================================================
 */

export const fontFamily = {
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * The Google Fonts stylesheet href. Referenced in root.jsx `links()`.
 * Playfair Display 400–700 (+ italics) for display; Inter 300–600 for UI.
 */
export const fontStylesheetHref =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap';

/**
 * A single step in the type scale. `clamp()` sizes are fluid by design so the
 * hierarchy holds from iPhone to large desktop without breakpoint juggling.
 */
export interface TypeStyle {
  family: keyof typeof fontFamily;
  /** Fluid font-size, usually a clamp(). */
  size: string;
  weight: number;
  lineHeight: number | string;
  letterSpacing: string;
  /** Optional UPPERCASE transform (used by eyebrows). */
  uppercase?: boolean;
}

/**
 * The scale. Keys map 1:1 to `.t-<kebab-key>` classes in app.css.
 * Display → editorial Playfair; Body/Caption → Inter.
 */
export const typeScale = {
  'display-xl': {
    family: 'display',
    size: 'clamp(3.25rem, 8vw, 7.5rem)',
    weight: 400,
    lineHeight: 0.96,
    letterSpacing: '-0.02em',
  },
  'display-l': {
    family: 'display',
    size: 'clamp(2.5rem, 5.5vw, 5rem)',
    weight: 400,
    lineHeight: 1.02,
    letterSpacing: '-0.015em',
  },
  h1: {
    family: 'display',
    size: 'clamp(2rem, 4vw, 3.25rem)',
    weight: 400,
    lineHeight: 1.06,
    letterSpacing: '-0.01em',
  },
  h2: {
    family: 'display',
    size: 'clamp(1.6rem, 3vw, 2.4rem)',
    weight: 400,
    lineHeight: 1.12,
    letterSpacing: '-0.01em',
  },
  h3: {
    family: 'display',
    size: 'clamp(1.25rem, 2vw, 1.6rem)',
    weight: 500,
    lineHeight: 1.2,
    letterSpacing: '0',
  },
  'body-l': {
    family: 'body',
    size: 'clamp(1.05rem, 1.3vw, 1.2rem)',
    weight: 400,
    lineHeight: 1.62,
    letterSpacing: '0',
  },
  body: {
    family: 'body',
    size: '1rem',
    weight: 400,
    lineHeight: 1.65,
    letterSpacing: '0',
  },
  'body-s': {
    family: 'body',
    size: '0.875rem',
    weight: 400,
    lineHeight: 1.55,
    letterSpacing: '0.01em',
  },
  caption: {
    family: 'body',
    size: '0.8rem',
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  /** Small-caps label above headings — the editorial signature. */
  eyebrow: {
    family: 'body',
    size: '0.72rem',
    weight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.22em',
    uppercase: true,
  },
} as const satisfies Record<string, TypeStyle>;

export type TypeScaleKey = keyof typeof typeScale;

export const typography = {
  fontFamily,
  fontWeight,
  fontStylesheetHref,
  typeScale,
} as const;

export default typography;
