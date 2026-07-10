/**
 * Wishlist — saved products with no account required.
 *
 * The list lives in localStorage (persists across visits, per-device) behind
 * a tiny external store: every heart button, the header count, and the
 * wishlist page subscribe through useSyncExternalStore, so a toggle anywhere
 * updates everywhere, and edits in another tab sync via the `storage` event.
 *
 * Entries are `{id, handle, addedAt}` — `id` is the product GID. The wishlist
 * page resolves entries against the live catalog (see /api/wishlist) and
 * prunes any that no longer exist, so this store never needs product data
 * beyond identity.
 */
import {useSyncExternalStore} from 'react';

const STORAGE_KEY = 'shriyam:wishlist:v1';
export const WISHLIST_MAX_ITEMS = 100;

/** Stable server/initial snapshot — SSR renders every heart unsaved. */
const EMPTY = Object.freeze([]);

/** @type {WishlistEntry[] | null} null = localStorage not read yet */
let items = null;
const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => typeof entry?.id === 'string');
  } catch {
    // Unreadable/corrupt storage (or privacy mode) — start empty.
    return [];
  }
}

/** @param {WishlistEntry[]} next */
function write(next) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota/privacy-mode failure: keep the in-memory copy so the current
    // session still behaves; it just won't survive a reload.
  }
  for (const listener of listeners) listener();
}

function onStorageEvent(event) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  items = read();
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  if (listeners.size === 0) window.addEventListener('storage', onStorageEvent);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorageEvent);
    }
  };
}

/** @returns {WishlistEntry[]} newest first */
export function getWishlist() {
  if (typeof window === 'undefined') return EMPTY;
  if (items === null) items = read();
  return items;
}

/** @param {{id: string, handle: string}} product */
export function toggleWishlist(product) {
  const list = getWishlist();
  const next = list.some((entry) => entry.id === product.id)
    ? list.filter((entry) => entry.id !== product.id)
    : [
        {id: product.id, handle: product.handle, addedAt: Date.now()},
        ...list,
      ].slice(0, WISHLIST_MAX_ITEMS);
  write(next);
}

/**
 * Remove one or more products (used by availability pruning).
 * @param {string | string[]} ids product GID(s)
 */
export function removeFromWishlist(ids) {
  const drop = new Set(Array.isArray(ids) ? ids : [ids]);
  const list = getWishlist();
  const next = list.filter((entry) => !drop.has(entry.id));
  if (next.length !== list.length) write(next);
}

/**
 * Reactive wishlist for components. Server-safe: SSR and the first client
 * render see an empty list; the real one appears right after hydration.
 * @returns {WishlistEntry[]}
 */
export function useWishlist() {
  return useSyncExternalStore(subscribe, getWishlist, () => EMPTY);
}

/** @typedef {{id: string, handle: string, addedAt: number}} WishlistEntry */
