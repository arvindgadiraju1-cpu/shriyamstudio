import {useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Section, SectionHeading} from '~/components/ui/Layout';
import {Hero} from '~/components/marketing/Hero';
import {FeaturedCollections} from '~/components/marketing/FeaturedCollections';
import {WeddingStory} from '~/components/marketing/WeddingStory';
import {BrandStory} from '~/components/marketing/BrandStory';
import {InspirationGallery} from '~/components/marketing/InspirationGallery';
import {CollectionVideoStrip} from '~/components/marketing/CollectionVideoStrip';
import {buildCuratedCollectionSummaries} from '~/lib/collectionConfig';
import {editorial, featuredCollections} from '~/lib/storeConfig';

export const meta = () => {
  return [
    {title: 'Shriyam Studio | Indian Ethnic Wear'},
    {
      name: 'description',
      content:
        'Handcrafted Indian ethnic wear — sarees, salwar suits, kurta sets, lehengas, and wedding pieces from Shriyam Studio.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
// Collection definitions for the video strip
const VIDEO_STRIP_COLLECTIONS = [
  {handle: 'womens', title: "Women's Ethnic Wear", eyebrow: 'Dresses & Sets', tags: ['audience:women']},
  {handle: 'women-unstitched-suits', title: 'Unstitched Suit Sets', eyebrow: 'Handpicked fabrics', tags: ['category:unstitched-suit']},
  {handle: 'kids', title: 'Kids Ethnic Wear', eyebrow: 'Little celebrations', tags: ['audience:kids']},
];

export async function loader({context}) {
  const [{products}, {products: videoProducts}] = await Promise.all([
    context.storefront.query(HOME_QUERY),
    context.storefront.query(VIDEO_STRIP_QUERY),
  ]);
  const nodes = products.nodes;
  const byHandle = (handle) => nodes.find((node) => node.handle === handle);

  // "Shop by category" — curated order from storeConfig, images from the catalog.
  const summaries = buildCuratedCollectionSummaries(nodes);
  const featured = featuredCollections.map((entry) => {
    const summary = summaries.find((item) => item.handle === entry.handle);
    return {
      handle: entry.handle,
      title: entry.title,
      eyebrow: entry.eyebrow,
      count: summary?.count ?? 0,
      image: summary?.image ?? null,
    };
  });

  // Editorial imagery, anchored on the strongest catalog shots (storeConfig).
  const heroImage =
    byHandle(editorial.hero.productHandle)?.featuredImage ||
    nodes[0]?.featuredImage ||
    null;
  const weddingImage =
    byHandle(editorial.wedding.productHandle)?.featuredImage ||
    nodes[1]?.featuredImage ||
    null;

  const newArrivals = nodes.slice(0, 8);
  const gallery = nodes
    .filter((node) => node.featuredImage)
    .slice(0, 4)
    .map((node) => ({
      handle: node.handle,
      title: node.title,
      productType: node.productType,
      image: node.featuredImage,
    }));

  // Build video strip: one card per collection, preferring a product with video
  const videoNodes = videoProducts.nodes;
  const videoStrip = VIDEO_STRIP_COLLECTIONS.map((col) => {
    const matching = videoNodes.filter((p) =>
      col.tags.some((t) => p.tags?.includes(t)),
    );
    const withVideo = matching.find(
      (p) => p.media?.nodes?.some((m) => m.__typename === 'Video'),
    );
    const chosen = withVideo || matching[0];
    if (!chosen) return null;

    const videoNode = chosen.media?.nodes?.find((m) => m.__typename === 'Video');
    return {
      handle: col.handle,
      title: col.title,
      eyebrow: col.eyebrow,
      video: videoNode || null,
      image: chosen.featuredImage || null,
    };
  }).filter(Boolean);

  return {featured, heroImage, weddingImage, newArrivals, gallery, videoStrip};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {featured, heroImage, weddingImage, newArrivals, gallery, videoStrip} = useLoaderData();

  return (
    <div className="home">
      <Hero
        image={heroImage}
        eyebrow={editorial.hero.eyebrow}
        headline={editorial.hero.headline}
        cta={editorial.hero.cta}
      />

      {/* Shop by category */}
      <Section size="default">
        <SectionHeading
          eyebrow="The Edit"
          title="Shop by category"
          link={{to: '/collections', label: 'All collections'}}
        />
        <FeaturedCollections collections={featured} />
      </Section>

      {/* New arrivals */}
      <Section size="default">
        <SectionHeading
          eyebrow="New In"
          title="Freshly added pieces"
          link={{to: '/collections/all', label: 'View all'}}
        />
        <div className="products-grid">
          {newArrivals.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : undefined}
            />
          ))}
        </div>
      </Section>

      {/* Video strip — collections in motion */}
      {videoStrip.length > 0 && <CollectionVideoStrip items={videoStrip} />}

      {/* Wedding storytelling */}
      <WeddingStory
        image={weddingImage}
        eyebrow={editorial.wedding.eyebrow}
        headline={editorial.wedding.headline}
        body={editorial.wedding.body}
        cta={editorial.wedding.cta}
      />

      {/* Brand story */}
      <BrandStory
        eyebrow="Our Story"
        statement="Every Shriyam Studio piece is made to order and crafted by hand — soft drapes, considered embroidery, and colour chosen for the people you celebrate with."
        cta={{label: 'Discover the studio', href: '/collections/all'}}
      />

      {/* Inspiration gallery */}
      <Section size="default">
        <SectionHeading eyebrow="Inspiration" title="Styled for the occasion" />
        <InspirationGallery items={gallery} />
      </Section>
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
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProductCard
      }
    }
  }
`;

const VIDEO_STRIP_QUERY = `#graphql
  query HomeVideoStrip($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 30, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        handle
        tags
        featuredImage { url altText width height }
        media(first: 6) {
          nodes {
            __typename
            mediaContentType
            ... on Video {
              id
              sources { url mimeType format height width }
              previewImage { url altText width height }
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
