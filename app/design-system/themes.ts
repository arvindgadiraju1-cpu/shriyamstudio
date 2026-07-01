/**
 * Shriyam — Theme
 * =============================================================================
 * Assembles primitive tokens into the semantic "Modern Heirloom" theme: the
 * meaningful roles the UI actually references (surface / ink / accent / line),
 * plus the two inversion contexts (light default, dark editorial sections).
 *
 * This is the layer designers reason about ("what is the section background?")
 * rather than raw hex. The values resolve to `tokens.ts` so there is exactly
 * one place each hex is written.
 * =============================================================================
 */

import {color, radius, shadow} from './tokens';
import {fontFamily} from './typography';

/** Semantic roles for the default (light, warm) context. */
export const light = {
  bg: color.surface,
  bgRaised: color.surfaceRaised,
  bgSoft: color.surfaceSoft,
  text: color.ink,
  textMuted: color.inkMuted,
  textFaint: color.inkFaint,
  accent: color.accent,
  gold: color.gold,
  line: color.line,
  lineStrong: color.lineStrong,
} as const;

/** Semantic roles for inverse (dark) editorial sections + footer. */
export const dark = {
  bg: color.surfaceDark,
  bgRaised: '#1F1A14',
  bgSoft: '#241E17',
  text: color.onDark,
  textMuted: 'rgba(250, 248, 245, 0.66)',
  textFaint: 'rgba(250, 248, 245, 0.42)',
  accent: color.gold,
  gold: color.gold,
  line: 'rgba(250, 248, 245, 0.16)',
  lineStrong: 'rgba(250, 248, 245, 0.28)',
} as const;

export const theme = {
  name: 'modern-heirloom',
  fontFamily,
  radius,
  shadow,
  contexts: {light, dark},
  /** The default context the app boots in. */
  default: light,
} as const;

export type Theme = typeof theme;
export type ThemeContext = typeof light;

export default theme;
