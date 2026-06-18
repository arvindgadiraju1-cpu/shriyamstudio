import {redirect, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  getCuratedCollection,
  productMatchesCollection,
} from '~/lib/collectionConfig';

export const meta = ({data}) => {
  return [
    {
      title: data?.collection
        ? `Shriyam Studio | ${data.collection.title}`
        : 'Shriyam Studio | Collection',
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const curatedCollection = getCuratedCollection(handle);
  const [{collection}, {products}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
    curatedCollection
      ? storefront.query(CURATED_PRODUCTS_QUERY)
      : Promise.resolve({products: {nodes: []}}),
  ]);

  if (collection) {
    redirectIfHandleIsLocalized(request, {handle, data: collection});

    return {
      collection,
      curatedProducts: null,
      isCurated: false,
    };
  }

  if (!curatedCollection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection: {
      ...curatedCollection,
      products: null,
    },
    curatedProducts: products.nodes.filter((product) =>
      productMatchesCollection(product, curatedCollection),
    ),
    isCurated: true,
  };
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection, curatedProducts, isCurated} = useLoaderData();
  const products = isCurated ? curatedProducts : collection.products.nodes;

  return (
    <div className="collection">
      <section className="collection-hero compact">
        {collection.eyebrow ? <p className="eyebrow">{collection.eyebrow}</p> : null}
        <h1>{collection.title}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
      </section>

      {isCurated ? (
        <div className="products-grid">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          ))}
        </div>
      ) : (
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      )}

      {!isCurated ? (
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      ) : null}
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

const CURATED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CuratedCollectionProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 100, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductItem
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
