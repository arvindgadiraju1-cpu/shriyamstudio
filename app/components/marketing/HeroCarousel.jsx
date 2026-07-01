import {useCallback, useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Button} from '~/components/ui/Button';
import {Eyebrow} from '~/components/ui/Layout';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;

/**
 * HeroCarousel — full-bleed editorial hero that rotates through collections.
 * Each slide's image and CTA belong to the same collection, so they never
 * fall out of sync. Autoplays with a crossfade + gentle zoom, pauses on
 * hover, supports swipe, and respects prefers-reduced-motion.
 *
 * @param {{
 *   slides: Array<{
 *     image: {url: string, altText?: string, width?: number, height?: number},
 *     eyebrow?: string,
 *     headline: string,
 *     cta?: {label: string, href: string},
 *   }>,
 * }} props
 */
export function HeroCarousel({slides = []}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restartTick, setRestartTick] = useState(0);
  const touchStartX = useRef(null);
  const count = slides.length;

  const goTo = useCallback(
    (next) => {
      setIndex(((next % count) + count) % count);
      setRestartTick((t) => t + 1);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused, restartTick]);

  if (!count) return null;

  const active = slides[index];

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  return (
    <section
      className="hero"
      role="region"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero__media-stack">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`hero__media${i === index ? ' hero__media--active' : ''}`}
            aria-hidden={i !== index}
          >
            {slide.image ? (
              <Image
                data={slide.image}
                sizes="100vw"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : undefined}
                alt={slide.image.altText || slide.headline}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="hero__inner">
        <div className="hero__copy" key={index}>
          {active.eyebrow ? <Eyebrow>{active.eyebrow}</Eyebrow> : null}
          <h1 className="hero__headline">{active.headline}</h1>
          {active.cta ? (
            <div className="hero__actions">
              <Button to={active.cta.href} variant="on-dark">
                {active.cta.label}
              </Button>
            </div>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="hero__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1} of ${count}`}
                aria-current={i === index}
                className={`hero__dot${i === index ? ' hero__dot--active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
