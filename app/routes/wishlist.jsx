import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {getWishlist, removeFromWishlist, useWishlist} from '~/lib/wishlist';

/**
 * Wishlist page. The list lives in the browser (see ~/lib/wishlist), so there
 * is no server loader — the clientLoader reads localStorage, resolves the
 * saved ids against the live catalog via /api/wishlist, and prunes anything
 * that no longer exists or can't be bought. SSR renders the HydrateFallback.
 */

export const meta = () => {
  return [{title: 'Shriyam | Wishlist'}];
};

export async function clientLoader() {
  const saved = getWishlist();
  if (saved.length === 0) {
    return {products: [], removedCount: 0, lookupFailed: false};
  }

  let response;
  try {
    const params = new URLSearchParams({
      ids: saved.map((entry) => entry.id).join(','),
    });
    response = await fetch(`/api/wishlist?${params}`);
  } catch {
    response = null;
  }

  // Never prune on a failed lookup — a network blip must not empty the list.
  if (!response?.ok) {
    return {products: [], removedCount: 0, lookupFailed: true};
  }

  /** @type {{products: WishlistProduct[]}} */
  const {products} = await response.json();
  const live = new Map(products.map((product) => [product.id, product]));

  const goneIds = saved
    .filter((entry) => {
      const product = live.get(entry.id);
      return !product || product.availableForSale === false;
    })
    .map((entry) => entry.id);
  if (goneIds.length > 0) removeFromWishlist(goneIds);

  // Map through the saved entries so display keeps newest-first order.
  const kept = saved
    .filter((entry) => !goneIds.includes(entry.id))
    .map((entry) => live.get(entry.id));

  return {products: kept, removedCount: goneIds.length, lookupFailed: false};
}
clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <WishlistShell>
      <p className="wishlist-status">Loading your saved pieces…</p>
    </WishlistShell>
  );
}

export default function Wishlist() {
  /** @type {Awaited<ReturnType<typeof clientLoader>>} */
  const {products, removedCount, lookupFailed} = useLoaderData();

  // Hearts on the cards below untoggle live: render only what's still saved.
  const savedIds = new Set(useWishlist().map((entry) => entry.id));
  const visible = products.filter((product) => savedIds.has(product.id));

  return (
    <WishlistShell count={visible.length}>
      {removedCount > 0 && (
        <p className="wishlist-status wishlist-status--notice" role="status">
          {removedCount === 1
            ? 'One saved piece is no longer available and was removed.'
            : `${removedCount} saved pieces are no longer available and were removed.`}
        </p>
      )}

      {lookupFailed ? (
        <p className="wishlist-status" role="alert">
          We couldn&rsquo;t load your wishlist just now — please refresh to try
          again. Nothing you saved has been lost.
        </p>
      ) : visible.length === 0 ? (
        <div className="wishlist-empty">
          <p>
            Nothing saved yet. Tap the heart on any piece you love and it will
            wait for you here.
          </p>
          <Link className="button-primary" to="/collections/all">
            Browse all pieces
          </Link>
        </div>
      ) : (
        <div className="products-grid wishlist-grid">
          {visible.map((product) => (
            <ProductItem key={product.id} product={product} loading="eager" />
          ))}
        </div>
      )}
    </WishlistShell>
  );
}

/**
 * @param {{count?: number, children: import('react').ReactNode}} props
 */
function WishlistShell({count, children}) {
  return (
    <div className="collection wishlist-page">
      <section className="collection-hero compact">
        <p className="eyebrow">Saved for later</p>
        <h1>Wishlist</h1>
        <p>
          {typeof count === 'number' && count > 0
            ? `${count} ${count === 1 ? 'piece' : 'pieces'} you loved — saved on this device, no account needed.`
            : 'Pieces you love, saved on this device — no account needed.'}
        </p>
      </section>
      {children}
    </div>
  );
}

/**
 * @typedef {{
 *   id: string,
 *   handle: string,
 *   title: string,
 *   availableForSale: boolean,
 *   featuredImage: object | null,
 *   priceRange: {minVariantPrice: {amount: string, currencyCode: string}},
 * }} WishlistProduct
 */
