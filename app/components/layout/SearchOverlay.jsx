import {useId} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {CloseIcon, SearchIcon} from '~/components/ui/Icon';

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

              if (state === 'loading' && term.current) {
                return <p className="search-overlay__status">Searching…</p>;
              }

              if (!total) {
                return (
                  <div className="search-overlay__results">
                    <SearchResultsPredictive.Empty term={term} />
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
                  {term.current && total ? (
                    <Link
                      className="link-underline"
                      onClick={closeSearch}
                      to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    >
                      View all results for “{term.current}” →
                    </Link>
                  ) : null}
                </div>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </div>
    </>
  );
}
