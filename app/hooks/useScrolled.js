import {useEffect, useState} from 'react';

/**
 * useScrolled — true once the window has scrolled past `threshold` px.
 * SSR-safe (starts false, syncs on mount). Passive listener for performance.
 * Used by the header to flip from transparent-over-hero to solid.
 *
 * @param {number} threshold
 * @returns {boolean}
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
