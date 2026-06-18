/**
 * =============================================================================
 * BUSINESS CONFIG — Shriyam Studio
 * =============================================================================
 * The single, obvious home for merchandising & curation decisions. This is a
 * boutique, not a multi-tenant platform, so these values are intentionally
 * hardcoded here for clarity. Edit THIS file to change navigation, the homepage
 * story, footer links, or which products anchor the editorial sections — never
 * scatter these choices inside components.
 *
 * Collection handles map to the live smart collections in the store:
 *   sarees · womens-ethnic · salwar-suits · kids-ethnic
 *   lehengas-dresses · kurta-sets · mens-ethnic · wedding-collection
 * =============================================================================
 */

/** Brand identity. */
export const brand = {
  name: 'Shriyam Studio',
  /** Shown in the footer + meta. */
  tagline: 'Handcrafted Indian ethnic wear, made for the people you celebrate with.',
};

/** Rotating announcement-bar message (single string for now). */
export const announcement =
  'Complimentary shipping across India · Worldwide delivery · Made to order, dispatched in 4 weeks';

/**
 * Primary navigation (desktop + mobile).
 * Items with `columns` render an editorial mega-menu panel on desktop.
 * `feature` is a typographic call-out tile inside the panel (no image needed).
 */
export const navigation = [
  {label: 'Sarees', href: '/collections/sarees'},
  {
    label: 'Women',
    href: '/collections/womens-ethnic',
    columns: [
      {
        heading: 'Shop Women',
        links: [
          {label: 'All Women’s Ethnic', href: '/collections/womens-ethnic'},
          {label: 'Sarees', href: '/collections/sarees'},
          {label: 'Salwar Suits', href: '/collections/salwar-suits'},
        ],
      },
      {
        heading: 'Occasion',
        links: [
          {label: 'Wedding Collection', href: '/collections/wedding-collection'},
          {label: 'Festive & Everyday', href: '/collections/all'},
        ],
      },
    ],
    feature: {eyebrow: 'The Edit', title: 'Wedding Collection', href: '/collections/wedding-collection'},
  },
  {
    label: 'Kids',
    href: '/collections/kids-ethnic',
    columns: [
      {
        heading: 'Shop Kids',
        links: [
          {label: 'All Kids Ethnic', href: '/collections/kids-ethnic'},
          {label: 'Kurta Sets', href: '/collections/kurta-sets'},
          {label: 'Lehengas & Dresses', href: '/collections/lehengas-dresses'},
        ],
      },
    ],
    feature: {eyebrow: 'Little Ones', title: 'Celebration Dressing', href: '/collections/kids-ethnic'},
  },
  {label: 'Men', href: '/collections/mens-ethnic'},
  {label: 'Wedding', href: '/collections/wedding-collection'},
];

/**
 * Featured collections for the homepage "Shop by category" showcase.
 * Order matters — this is the curated sequence shoppers see first.
 */
export const featuredCollections = [
  {handle: 'sarees', title: 'Sarees', eyebrow: 'Signature drapes'},
  {handle: 'kids-ethnic', title: 'Kids Ethnic', eyebrow: 'Little celebration wear'},
  {handle: 'salwar-suits', title: 'Salwar Suits', eyebrow: 'Elegant occasion sets'},
  {handle: 'lehengas-dresses', title: 'Lehengas & Dresses', eyebrow: 'Dress-up moments'},
];

/**
 * Editorial anchors — which products carry the big homepage moments. Driven by
 * real catalog imagery (chosen as the strongest, most "product-like" shots).
 * Used in a later phase; safe to retune anytime.
 */
export const editorial = {
  /** Hero statement + the product whose image backs it. */
  hero: {
    eyebrow: 'Festive & Wedding 2026',
    headline: 'Heirlooms for the\nmoments that matter',
    productHandle: 'girls-mint-floral-lehenga-dress',
    cta: {label: 'Explore the collection', href: '/collections/all'},
  },
  /** Wedding storytelling band. */
  wedding: {
    eyebrow: 'The Wedding Edit',
    headline: 'Dressed for every celebration',
    body: 'From mehendi mornings to reception evenings — pieces made to be photographed and remembered.',
    productHandle: 'blue-gold-brocade-saree',
    cta: {label: 'Shop the wedding collection', href: '/collections/wedding-collection'},
  },
};

/** Footer navigation columns. */
export const footerColumns = [
  {
    heading: 'Shop',
    links: [
      {label: 'Sarees', href: '/collections/sarees'},
      {label: 'Salwar Suits', href: '/collections/salwar-suits'},
      {label: 'Kids Ethnic', href: '/collections/kids-ethnic'},
      {label: 'Kurta Sets', href: '/collections/kurta-sets'},
      {label: 'Wedding Collection', href: '/collections/wedding-collection'},
      {label: 'All Collections', href: '/collections'},
    ],
  },
  {
    heading: 'Client Care',
    links: [
      {label: 'Shipping', href: '/policies/shipping-policy'},
      {label: 'Returns & Refunds', href: '/policies/refund-policy'},
      {label: 'Privacy', href: '/policies/privacy-policy'},
      {label: 'Terms of Service', href: '/policies/terms-of-service'},
      {label: 'Your Account', href: '/account'},
    ],
  },
  {
    heading: 'Connect',
    links: [
      // External — update to the store's real handles.
      {label: 'Instagram', href: 'https://instagram.com', external: true},
      {label: 'WhatsApp', href: 'https://wa.me/', external: true},
    ],
  },
];

export const storeConfig = {
  brand,
  announcement,
  navigation,
  featuredCollections,
  editorial,
  footerColumns,
};

export default storeConfig;
