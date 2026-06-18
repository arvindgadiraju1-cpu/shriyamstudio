import {Image} from '@shopify/hydrogen';
import {Button} from '~/components/ui/Button';
import {Eyebrow} from '~/components/ui/Layout';

/**
 * Hero — full-bleed editorial hero. The image is absolutely filled (object-fit
 * cover) so it can never collapse into a void, with a bottom scrim keeping the
 * overlaid type legible. Content is curated in storeConfig.editorial.hero.
 *
 * @param {{
 *   image?: {url: string, altText?: string, width?: number, height?: number} | null,
 *   eyebrow?: string,
 *   headline: string,   // supports \n line breaks (white-space: pre-line)
 *   cta?: {label: string, href: string},
 * }} props
 */
export function Hero({image, eyebrow, headline, cta}) {
  return (
    <section className="hero">
      <div className="hero__media">
        {image ? (
          <Image
            data={image}
            sizes="100vw"
            loading="eager"
            fetchpriority="high"
            alt={image.altText || headline}
          />
        ) : null}
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="hero__headline">{headline}</h1>
          {cta ? (
            <div className="hero__actions">
              <Button to={cta.href} variant="on-dark">
                {cta.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
