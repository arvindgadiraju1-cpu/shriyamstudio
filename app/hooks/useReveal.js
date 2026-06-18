import {useEffect, useRef, useState} from 'react';

/**
 * useReveal — scroll-reveal via IntersectionObserver.
 *
 * Attach the returned `ref` to an element; when it scrolls into view the
 * element is marked revealed (once, by default). Drives the `[data-reveal]`
 * animations in app.css. Falls back to immediately-revealed where
 * IntersectionObserver is unavailable (SSR / old browsers). Reduced-motion is
 * additionally handled in CSS.
 *
 * @param {{threshold?: number, rootMargin?: string, once?: boolean}} [options]
 * @returns {{ref: import('react').RefObject<any>, revealed: boolean}}
 */
export function useReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setRevealed(false);
          }
        });
      },
      {threshold, rootMargin},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return {ref, revealed};
}
