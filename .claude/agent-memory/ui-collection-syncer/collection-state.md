---
name: collection-state
description: All 7 Shopify collections — IDs, types, product counts, and sync state as of 2026-06-30
metadata:
  type: project
---

## Last synced: 2026-06-30

## Smart Collections (auto-populate by tag rule)

| Handle  | Title               | Shopify ID    | Tag Rule        | Product Count |
|---------|---------------------|---------------|-----------------|---------------|
| womens  | Women's Ethnic Wear | 335372157091  | audience:women  | 47            |
| kids    | Kids Ethnic Wear    | 335372189859  | audience:kids   | 37            |

## Custom Collections (products manually assigned during catalog sync)

| Handle                 | Title                        | Shopify ID    | Product Count |
|------------------------|------------------------------|---------------|---------------|
| women-dresses          | Women's Dresses              | 335371436195  | 5             |
| women-kurta-sets       | Women's Kurta Sets           | 335371468963  | 7             |
| women-unstitched-suits | Women's Unstitched Suit Sets | 335371501731  | 35            |
| kids-boys              | Kids Boys Clothing           | 335371534499  | 11            |
| kids-girls             | Kids Girls Clothing          | 335371567267  | 26            |

## Notes

- `womens` and `kids` were created as smart collections (not custom) because tag-based rules auto-populate and stay in sync as new products are added. Custom collections would require manual product assignment on each sync.
- `collectionConfig.js` had all 7 collections already correctly defined before this session — no edits needed.
- Total products in store: 84

**Why:** [[project-config]]
