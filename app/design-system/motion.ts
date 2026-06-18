/**
 * Shriyam Studio — Motion System
 * =============================================================================
 * All animation primitives live here: durations, easings, and named presets.
 * Motion is CSS-driven (no animation library) so client JS stays minimal and
 * Lighthouse stays high. These values are mirrored as CSS variables in
 * `app/styles/theme.css` and used by reveal/transition classes in app.css.
 *
 * Principle: motion should feel expensive and intentional — gentle fades,
 * slow image reveals, refined hover. Nothing bouncy, nothing flashy.
 * All motion respects `prefers-reduced-motion` (handled in app.css).
 * =============================================================================
 */

/** Durations in milliseconds. */
export const duration = {
  /** Micro-interactions: link color, small state changes. */
  fast: 180,
  /** Default UI transition. */
  base: 300,
  /** Reveals, panel slides. */
  slow: 560,
  /** Image zoom / large editorial reveals — deliberately unhurried. */
  image: 760,
} as const;

/** Easing curves. `luxury` is the house default: a slow, settled ease-out. */
export const easing = {
  /** Expo-style ease-out — confident arrivals. */
  luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Symmetric ease for slides/panels. */
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Standard ease-out for hovers. */
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  linear: 'linear',
} as const;

/** Ready-made `transition` shorthands for use in inline styles or JS. */
export const transition = {
  color: `color ${duration.fast}ms ${easing.out}`,
  fade: `opacity ${duration.slow}ms ${easing.luxury}`,
  transform: `transform ${duration.base}ms ${easing.out}`,
  imageZoom: `transform ${duration.image}ms ${easing.luxury}`,
  panel: `transform ${duration.slow}ms ${easing.inOut}`,
} as const;

/**
 * Scroll-reveal presets. The `useReveal` hook adds `data-reveal` + a variant;
 * app.css animates from the hidden state to visible when `data-revealed` flips.
 */
export const revealVariant = {
  /** Fade up from slightly below. The default editorial entrance. */
  up: 'up',
  /** Fade in place. */
  fade: 'fade',
  /** Gentle scale + fade, for imagery. */
  rise: 'rise',
} as const;

export type RevealVariant = (typeof revealVariant)[keyof typeof revealVariant];

/** Staggered delay (ms) for the Nth item in a revealed group. */
export const staggerStep = 80;
export const stagger = (index: number, step: number = staggerStep) =>
  `${index * step}ms`;

export const motion = {
  duration,
  easing,
  transition,
  revealVariant,
  staggerStep,
  stagger,
} as const;

export default motion;
