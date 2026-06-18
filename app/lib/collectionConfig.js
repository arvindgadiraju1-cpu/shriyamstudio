export const CURATED_COLLECTIONS = [
  {
    handle: 'sarees',
    title: 'Sarees',
    eyebrow: 'Signature drapes',
    description:
      'Soft festive sarees with floral borders, brocade details, and graceful everyday celebration energy.',
    match: {
      productTypes: ['Saree'],
      tags: ['category:saree'],
    },
  },
  {
    handle: 'kids-ethnic',
    title: 'Kids Ethnic',
    eyebrow: 'Little celebration wear',
    description:
      'Comfortable kurtas, kurta sets, and dresses for family events, birthdays, pujas, and school functions.',
    match: {
      tags: ['collection:kids-ethnic', 'audience:kids'],
    },
  },
  {
    handle: 'kurta-sets',
    title: 'Kurta Sets',
    eyebrow: 'Polished festive sets',
    description:
      'Easy festive kurtas and kurta sets selected for clean silhouettes, embroidery, and comfortable movement.',
    match: {
      productTypes: ['Kids Kurta', 'Kids Kurta Set', 'Kurta'],
      tags: ['category:kids-kurta', 'category:kids-kurta-set', 'category:kurta'],
    },
  },
  {
    handle: 'salwar-suits',
    title: 'Salwar Suits',
    eyebrow: 'Elegant occasion sets',
    description:
      'Embroidered suits and dupatta sets that work beautifully for intimate celebrations and festive gatherings.',
    match: {
      productTypes: ['Salwar Suit'],
      tags: ['category:salwar-suit'],
    },
  },
  {
    handle: 'lehengas-dresses',
    title: 'Lehengas & Dresses',
    eyebrow: 'Dress-up moments',
    description:
      'Girls dresses and lehenga-style pieces with color, movement, and a traditional finish.',
    match: {
      productTypes: ['Girls Dress', 'Girls Lehenga Dress'],
      tags: ['category:girls-dress', 'category:girls-lehenga-dress'],
    },
  },
  {
    handle: 'festive-wear',
    title: 'Festive Wear',
    eyebrow: 'Ready for the occasion',
    description:
      'A broad edit for weddings, pujas, haldi, birthdays, family portraits, and cultural celebrations.',
    match: {
      tags: ['occasion:festive', 'occasion:puja', 'occasion:wedding', 'occasion:haldi'],
    },
  },
];

export function getCuratedCollection(handle) {
  return CURATED_COLLECTIONS.find((collection) => collection.handle === handle);
}

export function productMatchesCollection(product, collection) {
  if (!product || !collection?.match) return false;

  const productType = product.productType;
  const tags = product.tags || [];
  const {productTypes = [], tags: matchingTags = []} = collection.match;

  return (
    productTypes.includes(productType) ||
    matchingTags.some((tag) => tags.includes(tag))
  );
}

export function buildCuratedCollectionSummaries(products) {
  return CURATED_COLLECTIONS.map((collection) => {
    const matchedProducts = products.filter((product) =>
      productMatchesCollection(product, collection),
    );

    return {
      ...collection,
      count: matchedProducts.length,
      image: matchedProducts[0]?.featuredImage || null,
    };
  });
}
