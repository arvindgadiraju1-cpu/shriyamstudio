/**
 * Collection definitions for the Shriyam storefront.
 *
 * CURATED_COLLECTIONS — virtual collections resolved from the full product list
 * when a Shopify collection with that handle doesn't exist yet.
 *
 * Collections with `subcategories` render a filter bar on their page.
 */
export const CURATED_COLLECTIONS = [
  // ── Parent: All Women's ────────────────────────────────────────────────────
  {
    handle: 'womens',
    title: "Women's",
    eyebrow: 'Festive & everyday',
    description:
      "Our complete women's collection — dresses, kurta sets, and handpicked unstitched suit fabrics for every occasion.",
    match: {
      tags: ['audience:women'],
    },
    subcategories: [
      {label: "All Women's", handle: 'womens'},
      {label: 'Dresses', handle: 'women-dresses'},
      {label: 'Kurta Sets', handle: 'women-kurta-sets'},
      {label: 'Unstitched Suits', handle: 'women-unstitched-suits'},
    ],
  },

  // ── Women subcategories ────────────────────────────────────────────────────
  {
    handle: 'women-dresses',
    title: 'Dresses',
    eyebrow: 'Effortless silhouettes',
    description:
      'Flowy maxi dresses, embroidered anarkalis, and cotton everyday styles for festive and casual occasions.',
    match: {
      productTypes: ['Women Dress'],
      tags: ['category:dress'],
    },
    parentHandle: 'womens',
    subcategories: [
      {label: "All Women's", handle: 'womens'},
      {label: 'Dresses', handle: 'women-dresses'},
      {label: 'Kurta Sets', handle: 'women-kurta-sets'},
      {label: 'Unstitched Suits', handle: 'women-unstitched-suits'},
    ],
  },
  {
    handle: 'women-kurta-sets',
    title: 'Kurta Sets',
    eyebrow: 'Polished festive sets',
    description:
      'Anarkali kurta sets, block print co-ords, and embroidered ensembles crafted for family celebrations.',
    match: {
      productTypes: ['Kurta Set'],
      tags: ['category:kurta-set'],
    },
    parentHandle: 'womens',
    subcategories: [
      {label: "All Women's", handle: 'womens'},
      {label: 'Dresses', handle: 'women-dresses'},
      {label: 'Kurta Sets', handle: 'women-kurta-sets'},
      {label: 'Unstitched Suits', handle: 'women-unstitched-suits'},
    ],
  },
  {
    handle: 'women-unstitched-suits',
    title: 'Unstitched Suit Sets',
    eyebrow: 'Curated fabric sets',
    description:
      'Handpicked unstitched suit sets — jamdani, appliqué, block print, and hand-painted — ready to be stitched to your fit.',
    match: {
      productTypes: ['Unstitched Suit Set'],
      tags: ['category:unstitched-suit'],
    },
    parentHandle: 'womens',
    subcategories: [
      {label: "All Women's", handle: 'womens'},
      {label: 'Dresses', handle: 'women-dresses'},
      {label: 'Kurta Sets', handle: 'women-kurta-sets'},
      {label: 'Unstitched Suits', handle: 'women-unstitched-suits'},
    ],
  },

  // ── Parent: All Kids ────────────────────────────────────────────────────────
  {
    handle: 'kids',
    title: 'Kids',
    eyebrow: 'Little celebration wear',
    description:
      'All kids clothing — girls and boys ethnic wear for every celebration, puja, birthday, and family occasion.',
    match: {
      tags: ['audience:kids'],
    },
    subcategories: [
      {label: 'All Kids', handle: 'kids'},
      {label: 'Girls', handle: 'kids-girls'},
      {label: 'Boys', handle: 'kids-boys'},
    ],
  },

  // ── Kids subcategories ─────────────────────────────────────────────────────
  {
    handle: 'kids-girls',
    title: 'Girls Clothing',
    eyebrow: 'Little celebration wear',
    description:
      'Dresses, lehenga sets, and ethnic pieces with color, movement, and a traditional finish.',
    match: {
      tags: ['audience:girls', 'category:kids-girls'],
    },
    parentHandle: 'kids',
    subcategories: [
      {label: 'All Kids', handle: 'kids'},
      {label: 'Girls', handle: 'kids-girls'},
      {label: 'Boys', handle: 'kids-boys'},
    ],
  },
  {
    handle: 'kids-boys',
    title: 'Boys Clothing',
    eyebrow: 'Festive boys wear',
    description:
      'Kurta sets, Nehru jackets, and ethnic separates for little celebrations, pujas, and family occasions.',
    match: {
      tags: ['audience:boys', 'category:kids-kurta-set'],
    },
    parentHandle: 'kids',
    subcategories: [
      {label: 'All Kids', handle: 'kids'},
      {label: 'Girls', handle: 'kids-girls'},
      {label: 'Boys', handle: 'kids-boys'},
    ],
  },
];

export function getCuratedCollection(handle) {
  return CURATED_COLLECTIONS.find((c) => c.handle === handle);
}

export function productMatchesCollection(product, collection) {
  if (!product || !collection?.match) return false;
  const {productTypes = [], tags: matchingTags = []} = collection.match;
  const tags = product.tags || [];
  return (
    productTypes.includes(product.productType) ||
    matchingTags.some((t) => tags.includes(t))
  );
}

export function buildCuratedCollectionSummaries(products) {
  return CURATED_COLLECTIONS.map((collection) => {
    const matched = products.filter((p) => productMatchesCollection(p, collection));
    return {
      ...collection,
      count: matched.length,
      image: matched[0]?.featuredImage || null,
    };
  });
}

/** Returns the subcategory filter config for a given handle, or null. */
export function getSubcategoryFilter(handle) {
  const col = getCuratedCollection(handle);
  return col?.subcategories || null;
}
