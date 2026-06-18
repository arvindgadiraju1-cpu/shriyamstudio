import {Image} from '@shopify/hydrogen';
import {Button} from '~/components/ui/Button';
import {Eyebrow} from '~/components/ui/Layout';
import {Reveal} from '~/components/ui/Reveal';

/**
 * WeddingStory — a dark editorial band pairing a framed image with a statement.
 * Stacks on mobile (image, then copy); two columns on desktop. Content comes
 * from storeConfig.editorial.wedding.
 *
 * @param {{
 *   image?: any,
 *   eyebrow?: string,
 *   headline: string,
 *   body?: string,
 *   cta?: {label: string, href: string},
 * }} props
 */
export function WeddingStory({image, eyebrow, headline, body, cta}) {
  return (
    <section className="wedding-story section--dark">
      <div className="container wedding-story__inner">
        <Reveal className="wedding-story__media" variant="rise">
          {image ? (
            <Image
              data={image}
              aspectRatio="4/5"
              sizes="(min-width: 64em) 45vw, 100vw"
              loading="lazy"
              alt={image.altText || headline}
            />
          ) : null}
        </Reveal>

        <Reveal className="wedding-story__copy">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="t-display-l">{headline}</h2>
          {body ? <p className="t-body-l">{body}</p> : null}
          {cta ? (
            <Button to={cta.href} variant="on-dark">
              {cta.label}
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
