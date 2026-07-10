import {toggleWishlist, useWishlist} from '~/lib/wishlist';
import {HeartIcon} from '~/components/ui/Icon';

/**
 * Heart toggle that saves a product to the wishlist. Works anywhere — product
 * cards nest it inside a <Link>, so the click never navigates.
 *
 * @param {{
 *   product: {id: string, handle: string, title: string},
 *   className?: string,
 * }} props
 */
export function WishlistButton({product, className}) {
  const saved = useWishlist().some((entry) => entry.id === product.id);

  return (
    <button
      type="button"
      className={[
        'wishlist-toggle',
        saved && 'wishlist-toggle--saved',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={
        saved
          ? `Remove ${product.title} from wishlist`
          : `Add ${product.title} to wishlist`
      }
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(product);
      }}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
