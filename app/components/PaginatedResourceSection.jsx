import {useEffect, useRef} from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * PaginatedResourceSection — infinite scroll wrapper around Hydrogen's Pagination.
 *
 * An IntersectionObserver watches a sentinel element placed below the grid.
 * When the sentinel enters the viewport (with a 300px lookahead), it
 * programmatically clicks the hidden NextLink, loading the next page.
 *
 * No "Load more" button is shown; the spinner appears while fetching.
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  ariaLabel,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink, hasNextPage}) => (
        <InfiniteGrid
          nodes={nodes}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          PreviousLink={PreviousLink}
          NextLink={NextLink}
          resourcesClassName={resourcesClassName}
          ariaLabel={ariaLabel}
        >
          {children}
        </InfiniteGrid>
      )}
    </Pagination>
  );
}

function InfiniteGrid({
  nodes,
  isLoading,
  hasNextPage,
  PreviousLink,
  NextLink,
  resourcesClassName,
  ariaLabel,
  children,
}) {
  const sentinelRef = useRef(null);
  const nextLinkWrapRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Find and click the anchor/button inside the hidden NextLink wrapper
        const link = nextLinkWrapRef.current?.querySelector('a, button');
        if (link && !isLoading) link.click();
      },
      {rootMargin: '0px 0px 400px 0px'}, // load 400px before the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, nodes.length]); // re-attach when page loads

  const items = nodes.map((node, index) => children({node, index}));

  return (
    <>
      {/* Previous page link (rarely needed but kept for keyboard/a11y) */}
      <PreviousLink className="pagination-link pagination-link-previous sr-only">
        Load previous
      </PreviousLink>

      {/* Product grid */}
      {resourcesClassName ? (
        <div
          aria-label={ariaLabel}
          className={resourcesClassName}
          role={ariaLabel ? 'region' : undefined}
        >
          {items}
        </div>
      ) : (
        items
      )}

      {/* Sentinel — IntersectionObserver watches this */}
      <div ref={sentinelRef} className="infinite-scroll-sentinel" aria-hidden="true" />

      {/* Hidden NextLink — clicked programmatically by the observer */}
      <div ref={nextLinkWrapRef} className="infinite-scroll-next-wrap" aria-hidden="true">
        <NextLink>next</NextLink>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="infinite-scroll-spinner" aria-live="polite" aria-label="Loading more products">
          <span className="infinite-scroll-dot" />
          <span className="infinite-scroll-dot" />
          <span className="infinite-scroll-dot" />
        </div>
      )}
    </>
  );
}
