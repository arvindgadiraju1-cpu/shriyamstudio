import {Button} from '~/components/ui/Button';
import {Eyebrow} from '~/components/ui/Layout';
import {Reveal} from '~/components/ui/Reveal';

/**
 * BrandStory — a calm, centered editorial statement. Type-led (no imagery) so it
 * gives the page breathing room between the product-heavy sections.
 *
 * @param {{eyebrow?: string, statement: string, cta?: {label: string, href: string}}} props
 */
export function BrandStory({eyebrow, statement, cta}) {
  return (
    <section className="home-section brand-story">
      <Reveal className="brand-story__inner">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <p className="brand-story__statement">{statement}</p>
        {cta ? (
          <Button to={cta.href} variant="ghost">
            {cta.label}
          </Button>
        ) : null}
      </Reveal>
    </section>
  );
}
