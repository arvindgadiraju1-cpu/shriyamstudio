/**
 * =============================================================================
 * BUSINESS CONFIG — Shriyam
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
  name: 'Shriyam',
  /** Shown in the footer + meta. */
  tagline: 'Handcrafted Indian ethnic wear, made for the people you celebrate with.',
};

/** Rotating announcement-bar message (single string for now). */
export const announcement = '';

/**
 * Primary navigation (desktop + mobile).
 * Items with `columns` render an editorial mega-menu panel on desktop.
 * `feature` is a typographic call-out tile inside the panel (no image needed).
 */
export const navigation = [
  {
    label: "Women's",
    href: '/collections/womens',
    columns: [
      {
        heading: "Women's Collections",
        links: [
          {label: "All Women's", href: '/collections/womens'},
          {label: 'Dresses', href: '/collections/women-dresses'},
          {label: 'Kurta Sets', href: '/collections/women-kurta-sets'},
          {label: 'Unstitched Suit Sets', href: '/collections/women-unstitched-suits'},
        ],
      },
    ],
    feature: {eyebrow: 'Festive 2026', title: "Women's Ethnic Collection", href: '/collections/womens'},
  },
  {
    label: 'Kids',
    href: '/collections/kids',
    columns: [
      {
        heading: 'Kids Collections',
        links: [
          {label: 'All Kids', href: '/collections/kids'},
          {label: 'Girls Clothing', href: '/collections/kids-girls'},
          {label: 'Boys Clothing', href: '/collections/kids-boys'},
        ],
      },
    ],
    feature: {eyebrow: 'Little Celebrations', title: 'Kids Ethnic Wear', href: '/collections/kids'},
  },
];

/**
 * Featured collections for the homepage "Shop by category" showcase.
 * Order matters — this is the curated sequence shoppers see first.
 */
export const featuredCollections = [
  {handle: 'womens', title: "All Women's", eyebrow: 'Festive & everyday'},
  {handle: 'women-dresses', title: 'Dresses', eyebrow: 'Effortless silhouettes'},
  {handle: 'women-kurta-sets', title: 'Kurta Sets', eyebrow: 'Polished festive sets'},
  {handle: 'kids-girls', title: 'Girls Clothing', eyebrow: 'Little celebration wear'},
];

/**
 * Editorial anchors — which products carry the big homepage moments. Driven by
 * real catalog imagery (chosen as the strongest, most "product-like" shots).
 * Used in a later phase; safe to retune anytime.
 */
export const editorial = {
  /**
   * Hero carousel — each slide's image and CTA point at the SAME collection,
   * so they can never drift apart. `productHandle` is looked up directly (works
   * regardless of catalog size or recency); `fallbackTags` is only used if that
   * product is ever removed/unpublished.
   */
  heroSlides: [
    {
      eyebrow: 'Festive Collection 2026',
      headline: 'Handcrafted for the\nmoments that matter',
      productHandle: 'wine-mirror-embroidery-anarkali-kurta-set',
      fallbackTags: ['audience:women'],
      cta: {label: "Explore Women's Collection", href: '/collections/womens'},
    },
    {
      eyebrow: 'Curated Fabric Sets',
      headline: 'Handpicked fabric,\nstitched to your fit',
      productHandle: 'navy-tribal-geometric-suit-set',
      fallbackTags: ['category:unstitched-suit'],
      cta: {label: 'Shop Unstitched Suits', href: '/collections/women-unstitched-suits'},
    },
    {
      eyebrow: 'Little Celebrations',
      headline: 'Ethnic wear, made\nfor tiny moments',
      productHandle: 'pink-mirror-buti-blouse-shorts-kids-girls-clothing',
      fallbackTags: ['audience:kids'],
      cta: {label: "Explore Kids' Collection", href: '/collections/kids'},
    },
    {
      eyebrow: 'Effortless Silhouettes',
      headline: 'Flowing dresses for\nfestive days ahead',
      productHandle: 'mustard-yellow-gathered-maxi-dress',
      fallbackTags: ['category:dress'],
      cta: {label: 'Shop Dresses', href: '/collections/women-dresses'},
    },
  ],
  /** Story band beneath the hero. */
  wedding: {
    eyebrow: 'The Festive Edit',
    headline: 'Dressed for every celebration',
    body: 'From intimate pujas to grand weddings — pieces made with care, made to be remembered.',
    productHandle: 'white-gold-polka-dot-kurta-set',
    cta: {label: "Shop all women's", href: '/collections/womens'},
  },
};

/** Footer navigation columns. */
export const footerColumns = [
  {
    heading: 'Shop',
    links: [
      {label: "All Women's", href: '/collections/womens'},
      {label: 'Dresses', href: '/collections/women-dresses'},
      {label: 'Kurta Sets', href: '/collections/women-kurta-sets'},
      {label: 'Unstitched Suit Sets', href: '/collections/women-unstitched-suits'},
      {label: 'Girls Clothing', href: '/collections/kids-girls'},
      {label: 'Boys Clothing', href: '/collections/kids-boys'},
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
      {label: 'Instagram', href: 'https://www.instagram.com/shriyamstudio/', external: true},
      {label: 'WhatsApp', href: 'https://wa.me/918463965336', external: true},
    ],
  },
];

/**
 * Search starting points: shown in the search overlay before anything is
 * typed, and on the /search page when a query comes up empty.
 */
export const searchSuggestions = {
  popularTerms: ['Kurta set', 'Chikankari', 'Frock', 'Festive'],
  browseLinks: [
    {label: "All Women's", href: '/collections/womens'},
    {label: 'All Kids', href: '/collections/kids'},
    {label: 'Everything', href: '/collections/all'},
  ],
};

export const storeConfig = {
  brand,
  announcement,
  navigation,
  featuredCollections,
  editorial,
  footerColumns,
  searchSuggestions,
};

export default storeConfig;
