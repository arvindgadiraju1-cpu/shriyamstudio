import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {WishlistButton} from '~/components/WishlistButton';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   onQuickView?: () => void;
 * }}
 */
export function ProductItem({product, loading, onQuickView}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <span className="product-item-media">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 33vw, (min-width: 45em) 50vw, 100vw"
          />
        )}
        <WishlistButton product={product} className="wishlist-toggle--card" />
        {onQuickView ? (
          <button
            aria-label={`Quick view ${product.title}`}
            className="product-item-quickview"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onQuickView();
            }}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        ) : null}
      </span>
      <span className="product-item-details">
        <span className="product-item-title">{product.title}</span>
        <span className="product-item-price">
          <Money data={product.priceRange.minVariantPrice} withoutTrailingZeros />
        </span>
      </span>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
