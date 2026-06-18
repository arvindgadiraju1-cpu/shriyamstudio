import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {buildCuratedCollectionSummaries} from '~/lib/collectionConfig';

export const meta = () => {
  return [
    {title: 'Shriyam Studio | Indian Ethnic Wear'},
    {
      name: 'description',
      content:
        'Shop sarees, kids ethnic wear, kurta sets, salwar suits, lehengas, and festive clothing from Shriyam Studio.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {products} = await context.storefront.query(HOME_QUERY);
  const productNodes = products.nodes;

  return {
    products: productNodes,
    collections: buildCuratedCollectionSummaries(productNodes),
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {products, collections} = useLoaderData();
  const heroProduct = products[0];
  const heroImage = heroProduct?.featuredImage;
  const featuredProducts = products.slice(0, 8);
  const heroCollections = collections.filter((collection) => collection.count);

  return (
    <div className="home">
      <section className="home-hero">
        {heroImage ? (
          <Link
            className="home-hero-image"
            to={`/products/${heroProduct.handle}`}
            prefetch="intent"
          >
            <Image
              alt={heroImage.altText || heroProduct.title}
              aspectRatio="16/9"
              data={heroImage}
              loading="eager"
              sizes="100vw"
            />
          </Link>
        ) : null}
        <div className="home-hero-copy">
          <p>Festivities with loved ones</p>
          <h1>Shriyam Studio</h1>
          <div className="home-hero-actions">
            <Link className="button-primary" to="/collections/all">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      <section className="home-products" aria-labelledby="new-arrivals">
        <div className="section-heading">
          <p className="eyebrow">New in</p>
          <h2 id="new-arrivals">Freshly added pieces</h2>
          <Link to="/collections/all">View all</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : undefined}
            />
          ))}
        </div>
      </section>

      <section className="home-collections" aria-labelledby="shop-by-edit">
        <div className="section-heading">
          <p className="eyebrow">Shop by category</p>
          <h2 id="shop-by-edit">Sarees, clothing, kids, and occasion wear</h2>
        </div>
        <div className="collection-teaser-grid">
          {heroCollections.map((collection) => (
            <Link
              className="collection-teaser"
              key={collection.handle}
              to={`/collections/${collection.handle}`}
              prefetch="intent"
            >
              {collection.image ? (
                <Image
                  alt={collection.image.altText || collection.title}
                  aspectRatio="4/5"
                  data={collection.image}
                  loading="lazy"
                  sizes="(min-width: 64em) 25vw, (min-width: 45em) 50vw, 100vw"
                />
              ) : null}
              <span className="collection-teaser-copy">
                <span>{collection.eyebrow}</span>
                <strong>{collection.title}</strong>
                <small>{collection.count} styles</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment HomeProductCard on Product {
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
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const HOME_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query HomeProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 24, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProductCard
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
