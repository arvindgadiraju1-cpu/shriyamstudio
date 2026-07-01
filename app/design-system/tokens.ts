/**
 * Shriyam — Design Tokens
 * =============================================================================
 * THE single source of truth for every primitive design value in the store:
 * color, spacing, radii, shadows, breakpoints, z-index, containers, tracking.
 *
 * These values are MIRRORED into CSS custom properties + Tailwind v4 utilities
 * in `app/styles/theme.css` (see the `@theme` block there). When you change a
 * value here, change it there too — the comment headers in both files point at
 * each other. JS/TS code (motion, hooks, the occasional inline style) imports
 * from this file; CSS reads the `var(--*)` mirror.
 *
 * Design language: "Modern heirloom" — warm, editorial, confident, mostly
 * monochrome with metal (gold/bronze) used like jewelry: sparingly.
 * =============================================================================
 */

/* -----------------------------------------------------------------------------
 * Color — warm luxury palette. Metal is an accent, never a fill.
 * --------------------------------------------------------------------------- */
export const color = {
  /** Page background — warm ivory, the "luxury signal". */
  surface: '#FAF8F5',
  /** Cards, overlays, anything that needs to lift off the page. */
  surfaceRaised: '#FFFFFF',
  /** Image mats / tiles — a hair deeper than surface so framed photos sit calmly. */
  surfaceSoft: '#F1ECE4',
  /** Deep contrast surface for footer / editorial inverse sections.
   *  This is the BRAND TEAL drawn from the Shriyam logo — peacock teal
   *  paired with gold + ivory. Used wherever the page goes dark. */
  surfaceDark: '#143A34',
  /** Slightly lifted teal for layered elements on a dark surface (hovers, tiles). */
  surfaceDarkRaised: '#1C4A42',

  /** Primary text. */
  ink: '#111111',
  /** Secondary text. */
  inkMuted: '#666666',
  /** Tertiary text, captions, disabled. */
  inkFaint: '#9B948A',
  /** Text/icons on dark surfaces. */
  onDark: '#FAF8F5',

  /** Links, focus rings, small intentional marks. */
  accent: '#8B6B3E',
  /** Hairline rules, hover accents — the "soft gold". */
  gold: '#C8A96B',

  /** Default border / divider. */
  line: '#ECE7DF',
  /** Stronger divider when one hairline isn't enough. */
  lineStrong: '#DED5C6',

  /** Scrim over hero imagery so overlaid type stays legible. */
  scrim: 'rgba(17, 15, 12, 0.34)',
  /** Faint warm wash laid over product photos to harmonize white balance. */
  imageWash: 'rgba(250, 248, 245, 0.06)',
} as const;

/* -----------------------------------------------------------------------------
 * Spacing — 4px base scale + semantic layout rhythm tokens.
 * Section + gutter are fluid; they carry most of the "generous whitespace".
 * --------------------------------------------------------------------------- */
export const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
} as const;

/** Fluid vertical rhythm between major page sections. */
export const sectionSpace = 'clamp(4.5rem, 9vw, 9rem)';
/** Fluid horizontal page padding (the side "gutter"). */
export const gutter = 'clamp(1.25rem, 5vw, 4.5rem)';

/* -----------------------------------------------------------------------------
 * Container widths — editorial layouts breathe wide; text stays narrow.
 * --------------------------------------------------------------------------- */
export const container = {
  /** Full editorial max width. */
  max: '1600px',
  /** Standard content width. */
  wide: '1280px',
  /** Narrow column for prose / centered hero copy. */
  narrow: '1040px',
  /** Optimal measure for body text. */
  text: '46rem',
} as const;

/* -----------------------------------------------------------------------------
 * Radius — luxury reads sharp. Images & primary controls stay square.
 * --------------------------------------------------------------------------- */
export const radius = {
  none: '0px',
  sm: '2px',
  md: '4px',
  pill: '999px',
} as const;

/* -----------------------------------------------------------------------------
 * Shadow — used almost never. Reserve for overlays/asides that truly float.
 * --------------------------------------------------------------------------- */
export const shadow = {
  none: 'none',
  soft: '0 1px 2px rgba(17, 17, 17, 0.04)',
  card: '0 18px 40px -24px rgba(17, 15, 12, 0.22)',
  overlay: '0 40px 90px -30px rgba(17, 15, 12, 0.45)',
} as const;

/* -----------------------------------------------------------------------------
 * Letter-spacing (tracking) — wide tracking on small caps is the editorial tell.
 * --------------------------------------------------------------------------- */
export const tracking = {
  tight: '-0.02em',
  snug: '-0.01em',
  normal: '0',
  wide: '0.06em',
  wider: '0.12em',
  eyebrow: '0.22em',
} as const;

/* -----------------------------------------------------------------------------
 * Breakpoints — one small, intentional set. (min-width, em-based.)
 * Used by hooks/matchMedia in JS; CSS uses the same literal em values.
 * --------------------------------------------------------------------------- */
export const breakpoint = {
  sm: '40em', // 640px — large phone
  md: '48em', // 768px — tablet
  lg: '64em', // 1024px — laptop / desktop nav appears
  xl: '90em', // 1440px — large desktop
} as const;

export const mediaUp = (bp: keyof typeof breakpoint) =>
  `(min-width: ${breakpoint[bp]})`;

/* -----------------------------------------------------------------------------
 * Z-index — named layers, no magic numbers.
 * --------------------------------------------------------------------------- */
export const z = {
  base: 0,
  raised: 10,
  header: 100,
  overlay: 200,
  aside: 210,
  modal: 300,
  toast: 400,
} as const;

export const tokens = {
  color,
  space,
  sectionSpace,
  gutter,
  container,
  radius,
  shadow,
  tracking,
  breakpoint,
  z,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof color;

export default tokens;
