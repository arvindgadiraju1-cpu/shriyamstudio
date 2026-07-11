import {useId} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {CloseIcon, SearchIcon} from '~/components/ui/Icon';
import {searchSuggestions} from '~/lib/storeConfig';

const {popularTerms: POPULAR_TERMS, browseLinks: BROWSE_LINKS} =
  searchSuggestions;

/**
 * SearchOverlay — an elegant top-sheet search (replaces the stock right-aside
 * with its `<br/>`/`&nbsp;` template markup). Opens when the Aside context type
 * is 'search'; keeps Hydrogen's predictive search, dressed for the brand.
 */
export function SearchOverlay() {
  const {type, close} = useAside();
  const open = type === 'search';
  const queriesDatalistId = useId();

  return (
    <>
      <button
        type="button"
        className="search-overlay-backdrop"
        data-open={open ? 'true' : 'false'}
        aria-label="Close search"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />

      <div
        className="search-overlay"
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-label="Search"
        aria-hidden={!open}
      >
        <div className="search-overlay__inner">
          <div className="search-overlay__top">
            <p className="eyebrow">Search the studio</p>
            <button className="icon-btn" aria-label="Close search" onClick={close}>
              <CloseIcon />
            </button>
          </div>

          <SearchFormPredictive>
            {({fetchResults, goToSearch, inputRef}) => (
              <div className="search-field">
                <SearchIcon />
                <input
                  name="q"
                  ref={inputRef}
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder="Sarees, kurta sets, wedding…"
                  type="search"
                  list={queriesDatalistId}
                />
                <button onClick={goToSearch}>Search</button>
              </div>
            )}
          </SearchFormPredictive>

          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              // Nothing typed yet — offer starting points instead of a void.
              if (!term.current) {
                return (
                  <div className="search-overlay__results">
                    <div className="search-suggest">
                      <p className="search-suggest__label">Popular right now</p>
                      <div className="search-suggest__chips">
                        {POPULAR_TERMS.map((suggestion) => (
                          <Link
                            key={suggestion}
                            className="search-chip"
                            onClick={closeSearch}
                            to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(suggestion)}`}
                          >
                            {suggestion}
                          </Link>
                        ))}
                      </div>
                      <p className="search-suggest__label">Or browse</p>
                      <div className="search-suggest__chips">
                        {BROWSE_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            className="search-chip"
                            onClick={closeSearch}
                            to={link.href}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              if (state === 'loading') {
                return <p className="search-overlay__status">Searching…</p>;
              }

              if (!total) {
                return (
                  <div className="search-overlay__results">
                    <div className="search-suggest">
                      <p className="search-overlay__status">
                        Nothing matches “{term.current}” — try a different word,
                        or start from a collection.
                      </p>
                      <div className="search-suggest__chips">
                        {BROWSE_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            className="search-chip"
                            onClick={closeSearch}
                            to={link.href}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="search-overlay__results">
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                  />
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <Link
                    className="link-underline"
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    View all results for “{term.current}” →
                  </Link>
                </div>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </div>
    </>
  );
}
