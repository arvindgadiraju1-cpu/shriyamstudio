import {useMemo, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';

const SORT_OPTIONS = [
  {label: 'Featured', value: 'featured'},
  {label: 'Price low to high', value: 'price-asc'},
  {label: 'Price high to low', value: 'price-desc'},
  {label: 'Name A to Z', value: 'title-asc'},
];

const FILTER_PREFIXES = [
  'occasion:',
  'color:',
  'work:',
  'category:',
  'collection:',
  'audience:',
  'pattern:',
  'style:',
];

/**
 * @param {{
 *   products: Array<any>;
 *   headingId?: string;
 * }}
 */
export function ProductGrid({products, headingId}) {
  const [sort, setSort] = useState('featured');
  const [tag, setTag] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const filterTags = useMemo(() => {
    const tags = new Set();
    products.forEach((product) => {
      (product.tags || []).forEach((tag) => {
        if (FILTER_PREFIXES.some((prefix) => tag.startsWith(prefix))) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags).sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesTag = tag === 'all' || (product.tags || []).includes(tag);
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available'
          ? product.availableForSale !== false
          : product.availableForSale === false);

      return matchesTag && matchesAvailability;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'price-asc') return productPrice(a) - productPrice(b);
      if (sort === 'price-desc') return productPrice(b) - productPrice(a);
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [availability, products, sort, tag]);

  return (
    <section className="product-browser" aria-labelledby={headingId}>
      <div className="product-toolbar">
        <div className="product-toolbar-group">
          <label htmlFor="product-tag-filter">Filter</label>
          <select
            id="product-tag-filter"
            onChange={(event) => setTag(event.target.value)}
            value={tag}
          >
            <option value="all">All tags</option>
            {filterTags.map((tag) => (
              <option key={tag} value={tag}>
                {tagLabel(tag)}
              </option>
            ))}
          </select>
        </div>

        <div className="product-toolbar-group">
          <label htmlFor="product-availability-filter">Availability</label>
          <select
            id="product-availability-filter"
            onChange={(event) => setAvailability(event.target.value)}
            value={availability}
          >
            <option value="all">All</option>
            <option value="available">In stock</option>
            <option value="sold-out">Sold out</option>
          </select>
        </div>

        <div className="product-toolbar-group">
          <label htmlFor="product-sort">Sort</label>
          <select
            id="product-sort"
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className="product-count">
          {visibleProducts.length} {visibleProducts.length === 1 ? 'style' : 'styles'}
        </p>
      </div>

      {visibleProducts.length ? (
        <div className="products-grid">
          {visibleProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
              onQuickView={() => setQuickViewProduct(product)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-product-state">
          <p>No products match these filters.</p>
          <button
            className="text-button"
            onClick={() => {
              setTag('all');
              setAvailability('all');
              setSort('featured');
            }}
            type="button"
          >
            Reset filters
          </button>
        </div>
      )}

      {quickViewProduct ? (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      ) : null}
    </section>
  );
}

function QuickViewModal({product, onClose}) {
  const images = product.images?.nodes?.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <div className="quick-view-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="quick-view-title"
        aria-modal="true"
        className="quick-view-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Close quick view"
          className="quick-view-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="quick-view-gallery">
          {images.map((image, index) => (
            <Image
              alt={image.altText || product.title}
              aspectRatio="4/5"
              data={image}
              key={image.id || image.url || index}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="(min-width: 900px) 44vw, 100vw"
            />
          ))}
        </div>

        <div className="quick-view-copy">
          {product.productType ? (
            <p className="product-item-type">{product.productType}</p>
          ) : null}
          <h2 id="quick-view-title">{product.title}</h2>
          <p className="quick-view-price">
            <Money data={product.priceRange.minVariantPrice} withoutTrailingZeros />
          </p>
          {product.description ? <p>{product.description}</p> : null}
          <div className="quick-view-tags">
            {(product.tags || []).slice(0, 8).map((tag) => (
              <span key={tag}>{tagLabel(tag)}</span>
            ))}
          </div>
          <Link
            className="button-primary quick-view-link"
            prefetch="intent"
            to={`/products/${product.handle}`}
          >
            View product
          </Link>
        </div>
      </section>
    </div>
  );
}

function productPrice(product) {
  return Number(product.priceRange?.minVariantPrice?.amount || 0);
}

function tagLabel(tag) {
  return tag
    .replace(/^[^:]+:/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
