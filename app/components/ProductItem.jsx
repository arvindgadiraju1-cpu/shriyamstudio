import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

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
      </span>
      <span className="product-item-details">
        {product.productType ? (
          <span className="product-item-type">{product.productType}</span>
        ) : null}
        <span className="product-item-title">{product.title}</span>
        <span className="product-item-price">
          <Money data={product.priceRange.minVariantPrice} />
        </span>
        {onQuickView ? (
          <button
            className="product-quick-view-trigger"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onQuickView();
            }}
            type="button"
          >
            Quick view
          </button>
        ) : null}
      </span>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
