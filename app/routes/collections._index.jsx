import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {buildCuratedCollectionSummaries} from '~/lib/collectionConfig';

export const meta = () => {
  return [{title: 'Shriyam Studio | Collections'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {products} = await context.storefront.query(COLLECTIONS_INDEX_QUERY);
  return {
    collections: buildCuratedCollectionSummaries(products.nodes),
  };
}

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="collections">
      <section className="collection-hero compact">
        <p className="eyebrow">Curated edits</p>
        <h1>Collections</h1>
        <p>
          Simple storefront groupings based on product type and import tags, so
          your shop stays organized as more styles are added.
        </p>
      </section>

      <div className="collections-grid">
        {collections.map((collection) => (
          <Link
            className="collection-item"
            key={collection.handle}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
          >
            <span className="collection-item-media">
              {collection.image ? (
                <Image
                  alt={collection.image.altText || collection.title}
                  aspectRatio="4/5"
                  data={collection.image}
                  loading="lazy"
                  sizes="(min-width: 64em) 25vw, (min-width: 45em) 50vw, 100vw"
                />
              ) : null}
            </span>
            <span className="collection-item-copy">
              <span>{collection.eyebrow}</span>
              <strong>{collection.title}</strong>
              <small>{collection.count} styles</small>
              <p>{collection.description}</p>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const COLLECTIONS_INDEX_QUERY = `#graphql
  query CollectionIndexProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 100, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        productType
        tags
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
