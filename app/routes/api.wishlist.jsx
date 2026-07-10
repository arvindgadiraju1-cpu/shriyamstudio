import {WISHLIST_MAX_ITEMS} from '~/lib/wishlist';

/**
 * Resource route: resolve wishlist product GIDs against the live catalog.
 *
 * GET /api/wishlist?ids=gid://shopify/Product/1,gid://shopify/Product/2
 *
 * Deleted or unpublished products come back as null from `nodes(ids:)` and
 * are dropped here — a missing id in the response is the caller's signal
 * that the product is no longer available.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const ids = (url.searchParams.get('ids') ?? '')
    .split(',')
    .filter((id) => id.startsWith('gid://shopify/Product/'))
    .slice(0, WISHLIST_MAX_ITEMS);

  if (ids.length === 0) {
    return Response.json({products: []});
  }

  const {nodes} = await context.storefront.query(WISHLIST_PRODUCTS_QUERY, {
    variables: {ids},
    // Availability is the whole point of this lookup — never serve it stale.
    cache: context.storefront.CacheNone(),
  });

  return Response.json({products: nodes.filter((node) => node?.id)});
}

const WISHLIST_PRODUCTS_QUERY = `#graphql
  query WishlistProducts(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        availableForSale
        featuredImage {
          id
          altText
          url
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/api.wishlist').Route} Route */
