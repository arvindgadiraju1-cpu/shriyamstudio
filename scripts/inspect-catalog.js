#!/usr/bin/env node
/**
 * Phase 1 — Inspect catalog.
 *
 * Reads your live Shopify catalog via the Admin REST API and prints a clean
 * summary of the structural attributes (product_type, vendor, tags, status)
 * we will use to build smart collections in Phase 2.
 *
 * This script only READS. It never writes anything to your store.
 *
 * Required environment variables (put them in shriyamstudio/.env):
 *   SHOPIFY_SHOP_DOMAIN            e.g. 1rvgn9-hd.myshopify.com
 *   SHOPIFY_ADMIN_API_ACCESS_TOKEN your shpat_... Admin API access token
 * Optional:
 *   SHOPIFY_API_VERSION           defaults to 2026-04
 *
 * Run:  node scripts/inspect-catalog.js
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, "..");
const DEFAULT_API_VERSION = "2026-04";

// --- Minimal .env loader (no dependencies) -------------------------------
// Loads the first .env found, without clobbering vars already in the process.
function loadDotEnv() {
  const candidates = [
    join(process.cwd(), ".env"),
    join(PROJECT_ROOT, ".env"),
    join(SCRIPT_DIR, ".env"),
  ];
  for (const path of candidates) {
    let raw;
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      continue;
    }
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
      ) {
        value = value.slice(1, -1);
      }
      if (key && !(key in process.env)) process.env[key] = value;
    }
    return path;
  }
  return null;
}

function requireEnv(name) {
  const value = (process.env[name] || "").trim();
  if (!value) {
    console.error(`\n✖ Missing required environment variable: ${name}`);
    console.error(`  Add it to ${join(PROJECT_ROOT, ".env")} and re-run.\n`);
    process.exit(1);
  }
  return value;
}

function normalizeDomain(value) {
  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

// --- Shopify Admin REST client (read-only here) --------------------------
async function fetchAllProducts(domain, token, apiVersion) {
  const base = `https://${domain}/admin/api/${apiVersion}`;
  const fields = "id,title,handle,product_type,vendor,tags,status";
  let url = `${base}/products.json?limit=250&fields=${fields}`;
  const products = [];

  while (url) {
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Shopify API GET failed: HTTP ${res.status} ${res.statusText}\n${body}`,
      );
    }

    const data = await res.json();
    products.push(...(data.products || []));

    // Follow REST cursor pagination via the Link header (rel="next").
    const link = res.headers.get("link") || res.headers.get("Link");
    const next = link && link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
  }

  return products;
}

// --- Reporting -----------------------------------------------------------
function tally(items) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function printSection(title) {
  console.log(`\n${"=".repeat(60)}\n${title}\n${"=".repeat(60)}`);
}

function printTally(label, pairs) {
  console.log(`\n${label} (${pairs.length} unique):`);
  if (!pairs.length) {
    console.log("  (none)");
    return;
  }
  for (const [value, count] of pairs) {
    console.log(`  ${String(count).padStart(4)} x  ${value || "(empty)"}`);
  }
}

// --- Main ----------------------------------------------------------------
const envPath = loadDotEnv();
const domain = normalizeDomain(requireEnv("SHOPIFY_SHOP_DOMAIN"));
const token = requireEnv("SHOPIFY_ADMIN_API_ACCESS_TOKEN");
const apiVersion = (process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION).trim();

console.log(`Loaded env from: ${envPath || "(none found — using process env)"}`);
console.log(`Store:           ${domain}`);
console.log(`API version:     ${apiVersion}`);
console.log(`Fetching products...`);

const products = await fetchAllProducts(domain, token, apiVersion);

printSection(`PRODUCTS (${products.length} total)`);
for (const p of products) {
  const tags = Array.isArray(p.tags)
    ? p.tags.join(", ")
    : String(p.tags || "");
  console.log(`\n• ${p.title}  [${p.status}]`);
  console.log(`    handle:  ${p.handle}`);
  console.log(`    type:    ${p.product_type || "(none)"}`);
  console.log(`    vendor:  ${p.vendor || "(none)"}`);
  console.log(`    tags:    ${tags || "(none)"}`);
}

// Aggregations — these map directly onto smart_collection rule columns.
const allTypes = products.map((p) => p.product_type || "");
const allVendors = products.map((p) => p.vendor || "");
const allTags = products.flatMap((p) =>
  (Array.isArray(p.tags) ? p.tags : String(p.tags || "").split(","))
    .map((t) => t.trim())
    .filter(Boolean),
);

printSection("STRUCTURAL SUMMARY (use this to design collections)");
printTally("product_type", tally(allTypes));
printTally("vendor", tally(allVendors));
printTally("tags", tally(allTags));

console.log(
  `\nDone. Paste the STRUCTURAL SUMMARY back to me and I'll write generate-collections.js for Phase 2.\n`,
);
