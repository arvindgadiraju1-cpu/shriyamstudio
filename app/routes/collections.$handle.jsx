import {redirect, useLoaderData} from 'react-router';
import {Link} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  getCuratedCollection,
  productMatchesCollection,
  getSubcategoryFilter,
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

export async function loader(args) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) throw redirect('/collections');

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
      collection: {
        ...collection,
        // merge curated metadata (eyebrow, subcategories, etc.) if available
        ...(curatedCollection
          ? {eyebrow: curatedCollection.eyebrow, subcategories: curatedCollection.subcategories}
          : {}),
      },
      curatedProducts: null,
      isCurated: false,
      subcategories: curatedCollection?.subcategories || null,
      currentHandle: handle,
    };
  }

  if (!curatedCollection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  return {
    collection: {...curatedCollection, products: null},
    curatedProducts: products.nodes.filter((p) => productMatchesCollection(p, curatedCollection)),
    isCurated: true,
    subcategories: curatedCollection.subcategories || null,
    currentHandle: handle,
  };
}

export default function Collection() {
  const {collection, curatedProducts, isCurated, subcategories, currentHandle} = useLoaderData();
  const products = isCurated ? curatedProducts : collection.products.nodes;

  return (
    <div className="collection">
      {/* Collection hero */}
      <section className="collection-hero compact">
        {collection.eyebrow ? <p className="eyebrow">{collection.eyebrow}</p> : null}
        <h1>{collection.title}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
      </section>

      {/* Subcategory filter bar */}
      {subcategories ? (
        <div className="collection-filter" role="tablist" aria-label="Filter by category">
          {subcategories.map((sub) => (
            <Link
              key={sub.handle}
              to={`/collections/${sub.handle}`}
              prefetch="intent"
              role="tab"
              aria-selected={sub.handle === currentHandle}
              className={`collection-filter__tab${sub.handle === currentHandle ? ' collection-filter__tab--active' : ''}`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Products grid */}
      {isCurated ? (
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product, index) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            ))
          ) : (
            <p className="collection-empty">No products found in this collection yet.</p>
          )}
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
          data={{collection: {id: collection.id, handle: collection.handle}}}
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
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
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
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
      ) {
        nodes { ...ProductItem }
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
    products(first: 250, sortKey: UPDATED_AT, reverse: true) {
      nodes { ...ProductItem }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
