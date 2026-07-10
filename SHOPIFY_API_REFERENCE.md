# Shopify API Reference — Shriyam

Every API pattern used to manage this store's catalog: uploading images/videos,
creating and deleting products, collections, publishing, and the diagnostic
queries that solved real incidents. Written so future work starts here instead
of re-deriving any of it.

## Setup

Two APIs are in play — don't confuse them:

| API | Used for | Auth |
|---|---|---|
| **Admin GraphQL** | media uploads, product/media deletion, publishing, diagnostics | `X-Shopify-Access-Token` header |
| **Admin REST** | product create, custom collections, collects (legacy but working in `scripts/sync-drive-to-shopify.js`) | same token |
| **Storefront GraphQL** | everything the Hydrogen app renders (via `context.storefront.query`) | handled by Hydrogen |

Credentials live in `.env` (never commit):

```
SHOPIFY_SHOP_DOMAIN=1rvgn9-hd.myshopify.com
SHOPIFY_API_VERSION=2026-04
SHOPIFY_ADMIN_API_ACCESS_TOKEN=<in .env>
```

Admin GraphQL endpoint:
`https://${SHOP}/admin/api/${VERSION}/graphql.json` — POST, body `{query, variables}`.

Quick inline-node template (used throughout past sessions):

```bash
node -e '
const fs = require("fs");
fs.readFileSync(".env","utf8").split("\n").forEach(l=>{const m=l.match(/^([A-Z_]+)=(.*)$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].trim();});
const SHOP=process.env.SHOPIFY_SHOP_DOMAIN, V=process.env.SHOPIFY_API_VERSION, T=process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
(async()=>{
  const q=`query{ ... }`;
  const r=await fetch(`https://${SHOP}/admin/api/${V}/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":T},body:JSON.stringify({query:q})});
  console.log(JSON.stringify(await r.json(),null,2));
})();
'
```

## Uploading images & videos (staged uploads → attach)

Two-step flow, implemented in `scripts/sync-drive-to-shopify.js`
(`uploadFileToShopify` + `attachMediaToProduct`).

**Step 1 — `stagedUploadsCreate`** gets a signed upload target:

```graphql
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url parameters { name value } resourceUrl }
    userErrors { field message }
  }
}
```

Input: `{filename, mimeType, httpMethod: "POST", resource: "IMAGE" | "VIDEO"}`.

Gotchas learned the hard way:
- **`httpMethod: "POST"` for both images and videos.** The response is a
  signed-policy multipart POST (S3 for images, GCS for videos), NOT a PUT.
- **`fileSize` (as a string) is REQUIRED for `VIDEO`** — it's embedded in the
  GCS policy. Omit it and the upload 403s.
- Upload = `FormData` with every `parameters` name/value appended **first**,
  then `file` last. POST to `target.url`.

**Step 2 — `productCreateMedia`** attaches the uploaded file:

```graphql
mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
  productCreateMedia(media: $media, productId: $productId) {
    media { ... on MediaImage { id } ... on Video { id } }
    userErrors { field message }
  }
}
```

Media input: `{originalSource: <resourceUrl from step 1>, mediaContentType: "IMAGE" | "VIDEO"}`.

MIME map: heic→image/heic, jpg/jpeg→image/jpeg, png→image/png,
webp→image/webp, mov→video/quicktime, mp4→video/mp4.

### ⚠️ The 20-megapixel image limit (real incident, July 2026)

Shopify silently FAILS images over ~20MP. The product stays ACTIVE and
published, `productCreateMedia` returns no error — but `MediaImage.status`
becomes `FAILED` and `featuredImage` stays null, so the storefront shows no
image at all. 7 products were affected (source photos were 4536–4672 ×
6162–7008 px).

Diagnose:

```graphql
query { productByHandle(handle: "…") {
  media(first: 10) { nodes {
    ... on MediaImage { id status mediaErrors { code details } }
  } }
} }
```

`mediaErrors: [{code: INVALID_IMAGE_RESOLUTION}]` = this bug.

Fix: resize under 20MP (`sips -Z 4200 file.jpg` on macOS keeps aspect ratio),
delete the FAILED media, re-upload:

```graphql
mutation productDeleteMedia($mediaIds: [ID!]!, $productId: ID!) {
  productDeleteMedia(mediaIds: $mediaIds, productId: $productId) {
    deletedMediaIds
    userErrors { field message }
  }
}
```

### Video renditions (frontend consumption)

Shopify transcodes each uploaded video into 480p/720p/1080p MP4s + an HLS
playlist. **`sources` array order is meaningless** and the quality label is
the SMALLER dimension (portrait "720p" = 720×1280). Never take `sources[0]` —
always pick via `pickVideoSource()` in `app/lib/video.js` (no cap for the PDP
gallery, `maxP: 720` for multi-video autoplay strips).

## Products

**Create** (REST, in the sync script): `POST /products.json` with
`{product: {title, handle, body_html, tags, status: "active", variants: [{price: "0.00", …}]}}`.
Prices are `0.00` placeholders — real prices are set manually in admin.

**Delete** (used to remove the bogus "Peach Lavender Ombre" duplicate):

```graphql
mutation { productDelete(input: {id: "gid://shopify/Product/<id>"}) {
  deletedProductId userErrors { field message }
} }
```

Before deleting, verify nothing references the handle
(`grep -rn "<handle>" app/`) and the variant carries no unique price/SKU/inventory.

**Search/query products**:

```graphql
query { products(first: 10, query: "ombre") {   # or "title:*X*", "handle:Y"
  nodes { id title handle status tags
    media(first: 10) { nodes { ... on MediaImage { id image { url width height } } } }
    variants(first: 5) { nodes { id sku price inventoryQuantity } }
  }
} }
```

## Publishing to sales channels

New products are invisible on the storefront until published to the Hydrogen
channel:

```graphql
mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) { userErrors { field message } }
}
```

Input: `[{publicationId: "gid://shopify/Publication/…"}]`.

Publication IDs (also in `scripts/sync-drive-to-shopify.js` as
`STOREFRONT_PUBLICATION_IDS`):
- `gid://shopify/Publication/209207001251` — **shriyamstudio (active)**
- `gid://shopify/Publication/209107910819` — Shriyamstudio_old — **storefront
  deleted July 2026; remove this ID from the script if publishing errors appear.**

## Collections

Two independent systems — know which one you're touching:

1. **Shopify custom collections** (REST, sync script + `scripts/create-shopify-collections.py`):
   - Find: `GET /custom_collections.json?handle=<h>&limit=1`
   - Create: `POST /custom_collections.json` with `{custom_collection: {title, handle, published: true, sort_order: "manual"}}`
   - Add product: `POST /collects.json` with `{collect: {collection_id, product_id}}`
2. **Curated UI collections** (`app/lib/collectionConfig.js`) — tag-driven
   groupings rendered by the app (e.g. `womens` matches `audience:women`).
   These do NOT exist in Shopify. After catalog changes run the
   `ui-collection-syncer` agent / `scripts/sync-ui-collections.js`.

Tag taxonomy on products: `audience:women|kids`, `category:<type>`,
`collection:<handle>`, `color:<name>`, `occasion:<name>`, `work:<technique>`.

## Rate limiting

- GraphQL: cost-based (2000 bucket, 100/s restore — check
  `extensions.cost.throttleStatus` in any response).
- REST: the sync script throttles to ~2 req/s and retries on 429 with a 2s
  wait (`withRateLimit`).

## Hydrogen storefront deployments (context)

- Active storefront: **shriyamstudio** (id 1000149621) —
  `https://shriyamstudio-489fab320dc20706e4a4.o2.myshopify.dev`
- Deploys: GitHub Actions on push to `main`
  (`.github/workflows/oxygen-deployment-1000149621.yml`). Verify with `gh run list`.
- Current production URL after any deploy: `npx shopify hydrogen env list`
  (local link lives in `.shopify/project.json` — keep it pointed at 1000149621).
- Per-deployment preview URLs are **immutable snapshots** — never bookmark
  them as "the site" (caused a confusing stale-iPhone incident).
