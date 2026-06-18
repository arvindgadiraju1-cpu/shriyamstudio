import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Reveal} from '~/components/ui/Reveal';

/**
 * FeaturedCollections — the "Shop by category" showcase. Each teaser is a
 * framed 4:5 tile (so mismatched catalog photography reads as one boutique)
 * with the caption beneath. Curated order comes from storeConfig.featuredCollections.
 *
 * @param {{collections: Array<{handle: string, title: string, eyebrow?: string, count?: number, image?: any}>}} props
 */
export function FeaturedCollections({collections}) {
  return (
    <div className="collection-teaser-grid">
      {collections.map((collection, index) => (
        <Reveal
          as={Link}
          key={collection.handle}
          to={`/collections/${collection.handle}`}
          prefetch="intent"
          className="collection-teaser"
          variant="rise"
          delay={index * 70}
        >
          <span className="collection-teaser-media">
            {collection.image ? (
              <Image
                data={collection.image}
                aspectRatio="4/5"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 33vw, 50vw"
                loading="lazy"
                alt={collection.image.altText || collection.title}
              />
            ) : null}
          </span>
          <span className="collection-teaser-copy">
            {collection.eyebrow ? <span>{collection.eyebrow}</span> : null}
            <strong>{collection.title}</strong>
            {typeof collection.count === 'number' ? (
              <small>
                {collection.count} {collection.count === 1 ? 'style' : 'styles'}
              </small>
            ) : null}
          </span>
        </Reveal>
      ))}
    </div>
  );
}
