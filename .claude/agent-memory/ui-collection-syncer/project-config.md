---
name: project-config
description: Shopify API credentials, module format, route fallthrough logic, and collectionConfig.js structure
metadata:
  type: project
---

## Shopify API

- Store domain: `1rvgn9-hd.myshopify.com`
- API version: `2026-04`
- Credentials in `.env` at project root: `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`
- REST Admin API used for collection management

## collectionConfig.js

- Path: `app/lib/collectionConfig.js`
- Module format: ESM (`export const CURATED_COLLECTIONS`, named exports)
- Custom fields beyond Shopify: `eyebrow`, `description`, `match` (tag/productType rules), `subcategories` (filter bar config), `parentHandle`
- The `match` field drives client-side filtering when a Shopify collection doesn't exist for a given handle

## Route Behavior (`app/routes/collections.$handle.jsx`)

- Loader first fetches Shopify collection by handle (COLLECTION_QUERY via storefront GraphQL)
- If Shopify collection found: uses `collection.products` (Shopify-managed, paginated). Merges `eyebrow` and `subcategories` from collectionConfig if handle exists there.
- If Shopify collection NOT found: checks `getCuratedCollection(handle)`. If found, fetches all 250 products and filters client-side via `productMatchesCollection`. If neither found, throws 404.
- Creating a Shopify collection for a handle that was previously virtual moves it from client-side to server-side rendering. MUST be non-empty or the page shows zero products.

## Smart vs Custom Collections

- The 5 subcategory collections are **custom collections** (manual, products assigned during catalog sync)
- The 2 parent collections (`womens`, `kids`) are **smart collections** with tag rules — they auto-populate and stay in sync when new products are added with the correct tags
- Smart collections created with tag rules: `audience:women` and `audience:kids`

## Tag Structure (confirmed 2026-06-30)

- Women's products: `audience:women` + `category:dress` / `category:kurta-set` / `category:unstitched-suit`
- Kids products: `audience:kids` + `audience:girls` or `audience:boys` + `category:kids-girls` / `category:kids-kurta-set`
- All 84 products carry both a specific audience tag AND the parent audience tag
