#!/usr/bin/env node
/**
 * Phase 2 — Generate smart collections.
 *
 * Creates 8 smart (rule-based) collections in your Shopify store derived from
 * the live catalog structure discovered in Phase 1. Products auto-populate
 * immediately after creation — no manual linking needed.
 *
 * IDEMPOTENT: each collection is identified by its handle. If a smart
 * collection with that handle already exists, the script skips it (no
 * duplicate, no error).
 *
 * Required env vars (already in shriyamstudio/.env):
 *   SHOPIFY_SHOP_DOMAIN
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN
 *   SHOPIFY_API_VERSION  (defaults to 2026-04)
 *
 * Run:  node scripts/generate-collections.js
 * Dry:  node scripts/generate-collections.js --dry-run
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, "..");
const DEFAULT_API_VERSION = "2026-04";
const DRY_RUN = process.argv.includes("--dry-run");

// --- Minimal .env loader -------------------------------------------------
function loadDotEnv() {
  const candidates = [
    join(process.cwd(), ".env"),
    join(PROJECT_ROOT, ".env"),
    join(SCRIPT_DIR, ".env"),
  ];
  for (const path of candidates) {
    let raw;
    try { raw = readFileSync(path, "utf8"); } catch { continue; }
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) value = value.slice(1, -1);
      if (key && !(key in process.env)) process.env[key] = value;
    }
    return path;
  }
  return null;
}

function requireEnv(name) {
  const value = (process.env[name] || "").trim();
  if (!value) {
    console.error(`\n✖ Missing required environment variable: ${name}\n`);
    process.exit(1);
  }
  return value;
}

function normalizeDomain(value) {
  return value.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

// --- Smart collection definitions ----------------------------------------
// Derived from the live catalog (14 products, all vendor: Shriyam Studio).
// disjunctive: true  → products matching ANY rule are included (OR logic)
// disjunctive: false → products must match ALL rules (AND logic)
const COLLECTIONS = [
  {
    title: "Sarees",
    handle: "sarees",
    body_html: "<p>Soft festive sarees with floral borders, brocade details, and graceful celebration-ready drapes.</p>",
    disjunctive: false,
    rules: [
      { column: "type", relation: "equals", condition: "Saree" },
    ],
  },
  {
    title: "Women's Ethnic",
    handle: "womens-ethnic",
    body_html: "<p>Sarees and salwar suits for festive and graceful occasion dressing.</p>",
    disjunctive: false,
    rules: [
      { column: "tag", relation: "equals", condition: "collection:womens-ethnic" },
    ],
  },
  {
    title: "Salwar Suits",
    handle: "salwar-suits",
    body_html: "<p>Embroidered suits and dupatta sets for intimate celebrations and festive gatherings.</p>",
    disjunctive: false,
    rules: [
      { column: "type", relation: "equals", condition: "Salwar Suit" },
    ],
  },
  {
    title: "Kids Ethnic",
    handle: "kids-ethnic",
    body_html: "<p>Comfortable kurtas, kurta sets, and dresses for family events, birthdays, pujas, and school functions.</p>",
    disjunctive: false,
    rules: [
      { column: "tag", relation: "equals", condition: "collection:kids-ethnic" },
    ],
  },
  {
    title: "Lehengas & Dresses",
    handle: "lehengas-dresses",
    body_html: "<p>Girls dresses and lehenga-style pieces with color, movement, and a traditional finish.</p>",
    disjunctive: true,
    rules: [
      { column: "type", relation: "equals", condition: "Girls Ethnic Dress" },
      { column: "type", relation: "equals", condition: "Girls Lehenga Dress" },
    ],
  },
  {
    title: "Kurta Sets",
    handle: "kurta-sets",
    body_html: "<p>Festive kurtas and kurta sets selected for clean silhouettes, embroidery, and comfortable movement.</p>",
    disjunctive: true,
    rules: [
      { column: "type", relation: "equals", condition: "Kids Kurta" },
      { column: "type", relation: "equals", condition: "Kids Kurta Set" },
      { column: "type", relation: "equals", condition: "Kurta" },
    ],
  },
  {
    title: "Men's Ethnic",
    handle: "mens-ethnic",
    body_html: "<p>Ceremonial kurtas and traditional pieces for festivals, weddings, and haldi celebrations.</p>",
    disjunctive: false,
    rules: [
      { column: "tag", relation: "equals", condition: "collection:mens-ethnic" },
    ],
  },
  {
    title: "Wedding Collection",
    handle: "wedding-collection",
    body_html: "<p>Curated pieces for weddings, receptions, and all the celebrations around them.</p>",
    disjunctive: false,
    rules: [
      { column: "tag", relation: "equals", condition: "occasion:wedding" },
    ],
  },
];

// --- Shopify client -------------------------------------------------------
async function shopifyRequest(base, token, method, path, payload) {
  const url = `${base}${path}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (res.status === 429) {
      const wait = 2000 * attempt;
      console.log(`  ⏳ Rate limited. Waiting ${wait / 1000}s...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Shopify ${method} ${path} → HTTP ${res.status}\n${body}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }
  throw new Error(`Shopify ${method} ${path} failed after retries.`);
}

async function fetchExistingHandles(base, token) {
  const data = await shopifyRequest(base, token, "GET", "/smart_collections.json?limit=250&fields=id,handle,title");
  const existing = new Map();
  for (const c of data.smart_collections || []) existing.set(c.handle, c);
  return existing;
}

// --- Main ----------------------------------------------------------------
const envPath = loadDotEnv();
const domain = normalizeDomain(requireEnv("SHOPIFY_SHOP_DOMAIN"));
const token = requireEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");
const apiVersion = (process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION).trim();
const base = `https://${domain}/admin/api/${apiVersion}`;

console.log(`Loaded env: ${envPath || "(process env)"}`);
console.log(`Store:      ${domain}`);
console.log(`API:        ${apiVersion}`);
if (DRY_RUN) console.log(`Mode:       DRY RUN (pass no flag to create for real)\n`);
else console.log(`Mode:       LIVE — will create collections in your store\n`);

const existing = DRY_RUN ? new Map() : await fetchExistingHandles(base, token);

let created = 0;
let skipped = 0;

for (const def of COLLECTIONS) {
  if (!DRY_RUN && existing.has(def.handle)) {
    console.log(`⏭  SKIP   ${def.title}  (handle "${def.handle}" already exists)`);
    skipped++;
    continue;
  }

  const rulesSummary = def.rules
    .map(r => `${r.column}=${r.condition}`)
    .join(def.disjunctive ? " OR " : " AND ");

  if (DRY_RUN) {
    console.log(`✔  PLAN   ${def.title}  [${rulesSummary}]`);
    continue;
  }

  try {
    const data = await shopifyRequest(base, token, "POST", "/smart_collections.json", {
      smart_collection: {
        title: def.title,
        handle: def.handle,
        body_html: def.body_html,
        published: true,
        disjunctive: def.disjunctive,
        rules: def.rules,
      },
    });
    const c = data.smart_collection;
    console.log(`✅ CREATED  ${c.title}  id=${c.id}  handle=${c.handle}  rules: ${rulesSummary}`);
    created++;

    // Shopify allows 2 calls/sec on the REST API — stay safe.
    await new Promise(r => setTimeout(r, 600));
  } catch (err) {
    console.error(`❌ FAILED   ${def.title}\n   ${err.message}`);
  }
}

console.log(`\n──────────────────────────────────────────`);
if (DRY_RUN) {
  console.log(`Dry run complete. ${COLLECTIONS.length} collections planned.`);
  console.log(`Run without --dry-run to create them for real.`);
} else {
  console.log(`Done. Created: ${created}  Skipped (already exist): ${skipped}`);
  console.log(`View your store collections: https://${domain}/admin/collections`);
}
