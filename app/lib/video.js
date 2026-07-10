/**
 * Pick the best MP4 rendition from a Shopify Video's `sources` array.
 *
 * Shopify transcodes every uploaded video into several MP4 renditions
 * (480p / 720p / 1080p…) plus an HLS playlist. The array order is not
 * meaningful, so callers must choose by resolution — never take
 * `sources[0]`, which is frequently the 480p rung and looks soft when
 * displayed large.
 *
 * @param {Array<{url: string, mimeType?: string, format?: string, height?: number, width?: number}>} sources
 * @param {number} [maxP] Cap the rendition's "p" value — its smaller dimension,
 *   so 720 matches the 720p rung even for portrait 720×1280 clips. Use for
 *   small autoplaying cards where bandwidth matters more than pixel-perfection.
 *   Omit for the largest available.
 * @returns {{url: string} | null}
 */
export function pickVideoSource(sources = [], maxP = Infinity) {
  // A rendition's quality label (480p/720p/1080p) is its SMALLER dimension —
  // portrait uploads have height > width, so height alone overshoots the cap.
  const p = (s) => Math.min(s.width ?? 0, s.height ?? 0) || (s.height ?? 0);

  const mp4s = sources
    .filter((s) => s.mimeType === 'video/mp4' || s.format === 'mp4')
    .sort((a, b) => p(b) - p(a)); // largest first

  return (
    mp4s.find((s) => p(s) <= maxP) ||
    mp4s[0] ||
    sources.find((s) => s.mimeType !== 'application/x-mpegURL') ||
    sources[0] ||
    null
  );
}
