import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {Reveal} from '~/components/ui/Reveal';

/**
 * InspirationGallery — an editorial grid of framed product images that link
 * straight to the product. 2 columns on mobile, 4 on desktop. Driven by real
 * catalog imagery (the strongest available shots, passed in by the route).
 *
 * @param {{items: Array<{handle: string, title: string, image?: any, productType?: string}>}} props
 */
export function InspirationGallery({items}) {
  return (
    <div className="gallery-grid">
      {items.map((item, index) => (
        <Reveal
          as={Link}
          key={item.handle}
          to={`/products/${item.handle}`}
          prefetch="intent"
          className="gallery-item"
          variant="rise"
          delay={index * 60}
        >
          {item.image ? (
            <Image
              data={item.image}
              aspectRatio="4/5"
              sizes="(min-width: 64em) 25vw, 50vw"
              loading="lazy"
              alt={item.image.altText || item.title}
            />
          ) : null}
          <span className="gallery-item__label">{item.title}</span>
        </Reveal>
      ))}
    </div>
  );
}
