const TTL_MS = 2 * 60 * 1000; // 2 minutes — long enough that browsing back and
// forth feels instant, short enough that price/stock edits don't linger stale.

// Module scope = one browser session. Keyed by pathname+search, so two
// different products/collections/variants can never be handed each other's
// data — unlike shouldRevalidate, which keeps the PREVIOUS route data and
// broke same-route navigation (product → product, collection tab → tab).
const cache = new Map();

/**
 * clientLoader body: serve the last server response for this exact URL if it
 * is fresher than the TTL, otherwise fetch and remember it. Only successful
 * responses are cached; redirects/404s propagate uncached.
 *
 * Usage in a route module:
 *   export async function clientLoader(args) {
 *     return cachedClientLoader(args);
 *   }
 */
export async function cachedClientLoader({request, serverLoader}) {
  const url = new URL(request.url);
  const key = url.pathname + url.search;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < TTL_MS) return hit.data;

  const data = await serverLoader();
  cache.set(key, {time: Date.now(), data});
  return data;
}
