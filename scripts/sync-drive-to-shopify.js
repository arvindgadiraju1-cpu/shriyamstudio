#!/usr/bin/env node
/**
 * Shriyam — Drive-to-Shopify Sync Agent
 *
 * Reads the organized Google Drive folder, creates Shopify products, and
 * uploads all media. Tracks state so re-runs only process new/changed files.
 *
 * Flags:
 *   --dry-run   Print what would happen without making API calls
 *   --reset     Delete all existing Shriyam products and re-sync
 *   --watch     Poll the Drive folder every 60 seconds for changes
 *
 * Run:  node scripts/sync-drive-to-shopify.js
 */

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');
const STATE_FILE = join(SCRIPT_DIR, '.sync-state.json');

const DRY_RUN = process.argv.includes('--dry-run');
const RESET = process.argv.includes('--reset');
const WATCH = process.argv.includes('--watch');
const WATCH_INTERVAL_MS = 60_000;

const DRIVE_ROOT =
  '/Users/arvindgadiraju/Library/CloudStorage/' +
  'GoogleDrive-arvindgadiraju1@gmail.com/' +
  '.shortcut-targets-by-id/1p1kd7JCIVK8ZMhtggiL64ya9NItAdXkG/Shriyam';

// ── Folder → Shopify metadata mapping ────────────────────────────────────────
const FOLDER_META = {
  'Women/Dresses ': {
    type: 'Women Dress',
    category: 'dress',
    audience: ['women'],
    collection: 'women-dresses',
    collectionTitle: "Women's Dresses",
  },
  'Women/Kurta sets': {
    type: 'Kurta Set',
    category: 'kurta-set',
    audience: ['women'],
    collection: 'women-kurta-sets',
    collectionTitle: "Women's Kurta Sets",
  },
  'Women/Unstitched suit sets': {
    type: 'Unstitched Suit Set',
    category: 'unstitched-suit',
    audience: ['women'],
    collection: 'women-unstitched-suits',
    collectionTitle: "Women's Unstitched Suit Sets",
  },
  'Kids/Boys clothing ': {
    type: 'Kids Kurta Set',
    category: 'kids-kurta-set',
    audience: ['kids', 'boys'],
    collection: 'kids-boys',
    collectionTitle: 'Kids Boys Clothing',
  },
  'Kids/Girls clothing ': {
    type: 'Kids Girls Clothing',
    category: 'kids-girls',
    audience: ['kids', 'girls'],
    collection: 'kids-girls',
    collectionTitle: 'Kids Girls Clothing',
  },
};

const KNOWN_COLORS = new Set([
  'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'pink',
  'purple', 'lavender', 'teal', 'mint', 'cream', 'ivory', 'maroon', 'wine',
  'navy', 'olive', 'mustard', 'peach', 'coral', 'beige', 'brown', 'grey',
  'gold', 'silver', 'rose', 'crimson', 'magenta', 'indigo', 'lilac', 'mauve',
  'rani', 'multicolor', 'rainbow',
]);

const KNOWN_WORKS = new Set([
  'embroidered', 'printed', 'block-print', 'applique', 'jamdani', 'banarasi',
  'floral', 'stripe', 'striped', 'check', 'checked', 'plaid', 'geometric',
  'ikat', 'brocade', 'mirror', 'gota', 'kasuti', 'crossstitch', 'chikankari',
  'pompom', 'ruffle', 'lace', 'smocked', 'tiered', 'hand-painted',
]);

// ── .env loader ───────────────────────────────────────────────────────────────
function loadDotEnv() {
  for (const p of [join(process.cwd(), '.env'), join(PROJECT_ROOT, '.env')]) {
    let raw;
    try { raw = readFileSync(p, 'utf8'); } catch { continue; }
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key && !(key in process.env)) process.env[key] = val;
    }
    return p;
  }
}

function requireEnv(name) {
  const v = (process.env[name] || '').trim();
  if (!v) { console.error(`Missing env var: ${name}`); process.exit(1); }
  return v;
}

// ── Shopify REST helpers ───────────────────────────────────────────────────────
let SHOP, TOKEN, API_BASE;

function shopifyFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
      ...(opts.headers || {}),
    },
  });
}

async function shopifyGQL(query, variables = {}) {
  const res = await fetch(`https://${SHOP}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// Publication IDs — publish products to both Hydrogen/headless storefront channels
const STOREFRONT_PUBLICATION_IDS = [
  'gid://shopify/Publication/209207001251', // shriyamstudio
  'gid://shopify/Publication/209107910819', // Shriyamstudio_old
];

const PUBLISH_MUTATION = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

async function publishToStorefrontChannels(gid) {
  try {
    const data = await shopifyGQL(PUBLISH_MUTATION, {
      id: gid,
      input: STOREFRONT_PUBLICATION_IDS.map(publicationId => ({ publicationId })),
    });
    const errors = data.publishablePublish?.userErrors || [];
    if (errors.length) console.warn(`  Publish warning: ${errors[0].message}`);
  } catch (e) {
    console.warn(`  Could not publish to storefront channels: ${e.message}`);
  }
}

// ── State management ──────────────────────────────────────────────────────────
function loadState() {
  if (existsSync(STATE_FILE)) {
    try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch {}
  }
  return { products: {}, collections: {} };
}

function saveState(state) {
  state.lastSync = new Date().toISOString();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function fileHash(filePath) {
  try {
    const stat = statSync(filePath);
    return `${stat.size}-${stat.mtimeMs}`;
  } catch { return null; }
}

// ── Parse filename → product metadata ────────────────────────────────────────
function parseFilename(filename, folderMeta) {
  // Strip extension
  const base = basename(filename, extname(filename));
  const ext = extname(filename).toLowerCase().slice(1);
  const isVideo = ['mov', 'mp4'].includes(ext);
  const isImage = ['jpg', 'jpeg', 'heic', 'png', 'webp'].includes(ext);

  // Extract number suffix: e.g. "women-dress-yellow-1" → base="women-dress-yellow", num=1
  const match = base.match(/^(.+)-(\d+)$/);
  const productKey = match ? match[1] : base;
  const imageNum = match ? parseInt(match[2]) : 1;

  // Build human title from product key
  const parts = productKey.split('-');

  // Strip the category prefix (first 3-4 words that match folder type)
  let descParts = parts;
  const prefixPatterns = [
    'women-dress', 'women-kurta-set', 'women-unstitched-suit',
    'kids-boys-kurta', 'kids-girls-dress', 'kids-girls-lehenga',
    'kids-boys', 'kids-girls', 'kids-collection',
  ];
  for (const prefix of prefixPatterns.sort((a, b) => b.length - a.length)) {
    if (productKey.startsWith(prefix + '-') || productKey === prefix) {
      descParts = productKey.slice(prefix.length + 1).split('-').filter(Boolean);
      break;
    }
  }

  const title = descParts
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') + ' ' + humanType(folderMeta.type);

  // Extract color and work tags from description parts
  const colors = descParts.filter(p => KNOWN_COLORS.has(p)).map(c => `color:${c}`);
  const works = descParts.filter(p => KNOWN_WORKS.has(p)).map(w => `work:${w}`);

  const tags = [
    `category:${folderMeta.category}`,
    ...folderMeta.audience.map(a => `audience:${a}`),
    `collection:${folderMeta.collection}`,
    'occasion:festive',
    ...colors,
    ...works,
  ];

  return { productKey, title, tags, isVideo, isImage, imageNum, ext };
}

function humanType(type) {
  // Remove folder category prefix from title if it's in the type
  const map = {
    'Women Dress': '',
    'Kurta Set': '',
    'Unstitched Suit Set': '',
    'Kids Kurta Set': '',
    'Kids Girls Clothing': '',
  };
  return map[type] !== undefined ? '' : type;
}

// ── Scan Drive folder ─────────────────────────────────────────────────────────
function scanDriveFolder() {
  const products = {}; // productKey → { folderKey, meta, files: [] }

  for (const [folderKey, folderMeta] of Object.entries(FOLDER_META)) {
    const folderPath = join(DRIVE_ROOT, folderKey);
    let files;
    try { files = readdirSync(folderPath); } catch { continue; }

    for (const filename of files) {
      if (filename.startsWith('.')) continue;
      const ext = extname(filename).toLowerCase().slice(1);
      if (!['jpg', 'jpeg', 'heic', 'png', 'mov', 'mp4'].includes(ext)) continue;

      const parsed = parseFilename(filename, folderMeta);
      const key = `${folderKey}/${parsed.productKey}`;

      if (!products[key]) {
        products[key] = {
          folderKey,
          folderPath,
          meta: folderMeta,
          parsed,
          files: [],
        };
      }
      products[key].files.push({
        filename,
        path: join(folderPath, filename),
        imageNum: parsed.imageNum,
        isVideo: parsed.isVideo,
        isImage: parsed.isImage,
        ext: parsed.ext,
        hash: fileHash(join(folderPath, filename)),
      });
    }
  }

  // Sort files within each product by imageNum
  for (const p of Object.values(products)) {
    p.files.sort((a, b) => a.imageNum - b.imageNum);
  }

  return products;
}

// ── Shopify REST: Create / get products ───────────────────────────────────────
async function getExistingProducts() {
  const products = {};
  let url = '/products.json?limit=250&vendor=Shriyam+Studio&fields=id,handle,title,vendor';
  while (url) {
    const res = await shopifyFetch(url);
    const { products: batch } = await res.json();
    for (const p of batch) products[p.handle] = p;
    const link = res.headers.get('link') || '';
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1].replace(API_BASE, '') : null;
  }
  return products;
}

async function deleteProduct(productId) {
  await shopifyFetch(`/products/${productId}.json`, { method: 'DELETE' });
}

async function createProduct(title, type, tags, sku) {
  const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const body = {
    product: {
      title,
      body_html: '',
      vendor: 'Shriyam',
      product_type: type,
      tags: tags.join(', '),
      handle,
      status: 'active',
      variants: [{
        sku,
        price: '0.00',          // placeholder — set real price in Shopify admin
        inventory_management: 'shopify',
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
      }],
    },
  };
  const res = await shopifyFetch('/products.json', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.product;
}

// ── Shopify GraphQL: Staged upload + media attach ─────────────────────────────
const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        parameters { name value }
        resourceUrl
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_CREATE_MEDIA = `
  mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
    productCreateMedia(media: $media, productId: $productId) {
      media { ... on MediaImage { id } ... on Video { id } }
      userErrors { field message }
    }
  }
`;

function mimeType(ext) {
  const map = { heic: 'image/heic', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', webp: 'image/webp', mov: 'video/quicktime', mp4: 'video/mp4' };
  return map[ext] || 'application/octet-stream';
}

async function uploadFileToShopify(filePath, filename, isVideo) {
  const mime = mimeType(extname(filename).toLowerCase().slice(1));
  const resource = isVideo ? 'VIDEO' : 'IMAGE';
  const fileSize = statSync(filePath).size;

  // 1. Get staged upload URL — both images and videos use POST (GCS signed policy)
  const stagedInput = { filename, mimeType: mime, httpMethod: 'POST', resource };
  // fileSize is required by Shopify for VIDEO resources (embedded in GCS policy)
  if (isVideo) stagedInput.fileSize = String(fileSize);

  const data = await shopifyGQL(STAGED_UPLOADS_CREATE, { input: [stagedInput] });
  if (data.stagedUploadsCreate.userErrors.length) {
    throw new Error(JSON.stringify(data.stagedUploadsCreate.userErrors));
  }
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const fileData = readFileSync(filePath);

  // Both images (S3) and videos (GCS) use multipart POST with signed policy params.
  // For videos, Shopify returns Google Cloud Storage signed-policy credentials —
  // these are POST form fields (GoogleAccessId, key, policy, signature), not PUT headers.
  const formData = new FormData();
  for (const { name, value } of target.parameters) {
    formData.append(name, value);
  }
  formData.append('file', new Blob([fileData], { type: mime }), filename);
  const uploadRes = await fetch(target.url, { method: 'POST', body: formData });
  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${body.slice(0, 300)}`);
  }

  return target.resourceUrl;
}

async function attachMediaToProduct(productGid, resourceUrl, isVideo) {
  const data = await shopifyGQL(PRODUCT_CREATE_MEDIA, {
    productId: productGid,
    media: [{
      originalSource: resourceUrl,
      mediaContentType: isVideo ? 'VIDEO' : 'IMAGE',
    }],
  });
  if (data.productCreateMedia.userErrors.length) {
    throw new Error(JSON.stringify(data.productCreateMedia.userErrors));
  }
  return data.productCreateMedia.media[0];
}

// ── Collection management ─────────────────────────────────────────────────────
async function ensureCustomCollection(handle, title) {
  // Check if exists
  const res = await shopifyFetch(`/custom_collections.json?handle=${handle}&limit=1`);
  const { custom_collections } = await res.json();
  if (custom_collections.length > 0) return custom_collections[0];

  const body = {
    custom_collection: {
      title,
      handle,
      published: true,
      sort_order: 'manual',
    },
  };
  const createRes = await shopifyFetch('/custom_collections.json', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const json = await createRes.json();
  return json.custom_collection;
}

async function addProductToCollection(collectionId, productId) {
  await shopifyFetch('/collects.json', {
    method: 'POST',
    body: JSON.stringify({ collect: { collection_id: collectionId, product_id: productId } }),
  });
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function withRateLimit(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      await sleep(500); // basic throttle: 2 req/s
      return result;
    } catch (err) {
      if (err.message?.includes('429') && i < retries - 1) {
        console.log('  Rate limited, waiting 2s...');
        await sleep(2000);
      } else throw err;
    }
  }
}

// ── Main sync ─────────────────────────────────────────────────────────────────
async function sync(state) {
  const driveProducts = scanDriveFolder();
  console.log(`\nDrive folder: ${Object.keys(driveProducts).length} products found`);

  // Ensure all collections exist
  const collectionIdMap = {};
  const seenCollections = new Set(Object.values(FOLDER_META).map(m => m.collection));
  for (const folderMeta of Object.values(FOLDER_META)) {
    const { collection, collectionTitle } = folderMeta;
    if (collectionIdMap[collection]) continue;
    if (!DRY_RUN) {
      const col = await withRateLimit(() => ensureCustomCollection(collection, collectionTitle));
      collectionIdMap[collection] = col.id;
      console.log(`  Collection "${collectionTitle}" → id ${col.id}`);
    } else {
      console.log(`[DRY] Would ensure collection: ${collectionTitle} (${collection})`);
      collectionIdMap[collection] = `dry-${collection}`;
    }
  }

  let created = 0, skipped = 0, uploaded = 0;

  for (const [productKey, productData] of Object.entries(driveProducts)) {
    const { meta, parsed, files, folderKey } = productData;

    // Check if any file changed since last sync
    const stateEntry = state.products[productKey];
    const hasChanges = !stateEntry || files.some(f => {
      const prevHash = stateEntry.fileHashes?.[f.filename];
      return !prevHash || prevHash !== f.hash;
    });

    if (!hasChanges) {
      skipped++;
      continue;
    }

    // Build human-readable title from productKey
    const keyParts = productKey.split('/').pop(); // get last part after /
    const parts = keyParts.split('-');
    // Remove category prefix (up to 4 words)
    const prefixLen = { 'women-dress': 2, 'women-kurta-set': 3, 'women-unstitched-suit': 3,
      'kids-boys-kurta-set': 4, 'kids-boys-kurta': 3, 'kids-girls-dress': 3,
      'kids-girls-lehenga': 3, 'kids-girls-dress-set': 4, 'kids-collection': 2 };
    let skipLen = 0;
    const joined = parts.join('-');
    for (const [prefix, len] of Object.entries(prefixLen).sort((a, b) => b[1] - a[1])) {
      if (joined.startsWith(prefix + '-') || joined === prefix) { skipLen = len; break; }
    }
    const descWords = parts.slice(skipLen).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const typeSuffix = {
      'Women Dress': 'Dress',
      'Kurta Set': 'Kurta Set',
      'Unstitched Suit Set': 'Suit Set',
      'Kids Kurta Set': 'Kurta Set',
      'Kids Girls Clothing': '',
    }[meta.type] || meta.type;
    const title = [...descWords, typeSuffix].filter(Boolean).join(' ');

    // Derive tags
    const descLower = parts.slice(skipLen).map(p => p.toLowerCase());
    const colors = descLower.filter(p => KNOWN_COLORS.has(p)).map(c => `color:${c}`);
    const works = descLower.filter(p => KNOWN_WORKS.has(p)).map(w => `work:${w}`);
    const tags = [
      `category:${meta.category}`,
      ...meta.audience.map(a => `audience:${a}`),
      `collection:${meta.collection}`,
      'occasion:festive',
      ...colors,
      ...works,
    ];

    console.log(`\n→ ${title}`);
    console.log(`  Files: ${files.map(f => f.filename).join(', ')}`);

    if (DRY_RUN) {
      console.log(`  [DRY] Would create product: "${title}" (${meta.type})`);
      console.log(`  [DRY] Tags: ${tags.join(', ')}`);
      console.log(`  [DRY] Would upload ${files.filter(f => f.isImage).length} image(s) and ${files.filter(f => f.isVideo).length} video(s)`);
      created++;
      continue;
    }

    // Create or get existing product
    let shopifyProduct;
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (stateEntry?.shopifyId) {
      shopifyProduct = { id: stateEntry.shopifyId.split('/').pop(), gid: stateEntry.shopifyId };
      console.log(`  Existing product: id ${shopifyProduct.id}`);
    } else {
      try {
        // SKU: SS-{CATEGORY_CODE}-{HANDLE_SLUG_TRUNCATED}
        const catCode = {
          'Women Dress': 'WD',
          'Kurta Set': 'WKS',
          'Unstitched Suit Set': 'USS',
          'Kids Kurta Set': 'KBS',
          'Kids Girls Clothing': 'KGC',
        }[meta.type] || 'SS';
        const sku = `SS-${catCode}-${handle.slice(0, 20).toUpperCase().replace(/-/g, '')}`;

        shopifyProduct = await withRateLimit(() => createProduct(title, meta.type, tags, sku));
        shopifyProduct.gid = `gid://shopify/Product/${shopifyProduct.id}`;
        console.log(`  Created product: id ${shopifyProduct.id}`);
        await publishToStorefrontChannels(shopifyProduct.gid);
        created++;
      } catch (err) {
        console.error(`  ERROR creating product: ${err.message}`);
        continue;
      }
    }

    // Add to collection
    const collectionId = collectionIdMap[meta.collection];
    if (collectionId && !stateEntry?.collectionId) {
      try {
        await withRateLimit(() => addProductToCollection(collectionId, shopifyProduct.id));
        console.log(`  Added to collection ${meta.collection}`);
      } catch { /* may already be in collection */ }
    }

    // Upload images and videos
    const fileHashes = {};
    for (const file of files) {
      const prevHash = stateEntry?.fileHashes?.[file.filename];
      if (prevHash && prevHash === file.hash) {
        fileHashes[file.filename] = file.hash;
        continue;
      }
      try {
        const resourceUrl = await withRateLimit(() =>
          uploadFileToShopify(file.path, file.filename, file.isVideo)
        );
        await withRateLimit(() =>
          attachMediaToProduct(shopifyProduct.gid, resourceUrl, file.isVideo)
        );
        fileHashes[file.filename] = file.hash;
        uploaded++;
        console.log(`  Uploaded: ${file.filename}`);
      } catch (err) {
        console.error(`  ERROR uploading ${file.filename}: ${err.message}`);
      }
    }

    // Save to state
    state.products[productKey] = {
      shopifyId: shopifyProduct.gid,
      handle,
      title,
      collectionId,
      fileHashes,
    };
    saveState(state);
  }

  console.log(`\n✓ Done — ${created} created, ${uploaded} files uploaded, ${skipped} unchanged`);
  return state;
}

// ── Reset: delete existing products ──────────────────────────────────────────
async function resetExistingProducts() {
  console.log('Fetching existing Shriyam products to delete...');
  const existing = await getExistingProducts();
  const ids = Object.values(existing).map(p => p.id);
  if (!ids.length) { console.log('No existing products found.'); return; }
  console.log(`Deleting ${ids.length} products...`);
  for (const id of ids) {
    await withRateLimit(() => deleteProduct(id));
    console.log(`  Deleted: ${id}`);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  loadDotEnv();
  SHOP = requireEnv('SHOPIFY_SHOP_DOMAIN');
  TOKEN = requireEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN');
  const version = process.env.SHOPIFY_API_VERSION || '2026-04';
  API_BASE = `https://${SHOP}/admin/api/${version}`;

  console.log(`Store: ${SHOP}`);
  console.log(`Mode:  ${DRY_RUN ? 'DRY RUN' : 'LIVE'}${WATCH ? ' + WATCH' : ''}`);

  if (RESET && !DRY_RUN) {
    await resetExistingProducts();
    writeFileSync(STATE_FILE, JSON.stringify({ products: {}, collections: {} }, null, 2));
  }

  let state = loadState();

  if (WATCH) {
    console.log(`\nWatching for changes every ${WATCH_INTERVAL_MS / 1000}s (Ctrl+C to stop)\n`);
    while (true) {
      state = await sync(state);
      await sleep(WATCH_INTERVAL_MS);
    }
  } else {
    await sync(state);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
