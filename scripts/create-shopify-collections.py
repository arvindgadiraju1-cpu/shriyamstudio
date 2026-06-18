#!/usr/bin/env python3
"""
Create Shopify custom collections from the product import CSV and connect
existing products to those collections.

Dry-run is the default. Add --live to create collections and collects.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


API_VERSION = os.getenv("SHOPIFY_API_VERSION", "2026-04")
DEFAULT_CSV_PATH = "/Users/arvindgadiraju/Downloads/product_template.csv"


@dataclass(frozen=True)
class CollectionRule:
    handle: str
    title: str
    description: str
    product_types: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()


COLLECTION_RULES = (
    CollectionRule(
        handle="sarees",
        title="Sarees",
        description=(
            "Soft festive sarees with floral borders, brocade details, "
            "and graceful celebration-ready drapes."
        ),
        product_types=("Saree",),
        tags=("category:saree",),
    ),
    CollectionRule(
        handle="kids-ethnic",
        title="Kids Ethnic",
        description=(
            "Comfortable kurtas, kurta sets, and dresses for family events, "
            "birthdays, pujas, and school functions."
        ),
        tags=("collection:kids-ethnic", "audience:kids", "audience:girls"),
    ),
    CollectionRule(
        handle="kurta-sets",
        title="Kurta Sets",
        description=(
            "Festive kurtas and kurta sets selected for clean silhouettes, "
            "embroidery, and comfortable movement."
        ),
        product_types=("Kids Kurta", "Kids Kurta Set", "Kurta"),
        tags=("category:kids-kurta", "category:kids-kurta-set", "category:kurta"),
    ),
    CollectionRule(
        handle="salwar-suits",
        title="Salwar Suits",
        description=(
            "Embroidered suits and dupatta sets for intimate celebrations "
            "and festive gatherings."
        ),
        product_types=("Salwar Suit",),
        tags=("category:salwar-suit",),
    ),
    CollectionRule(
        handle="lehengas-dresses",
        title="Lehengas & Dresses",
        description=(
            "Girls dresses and lehenga-style pieces with color, movement, "
            "and a traditional finish."
        ),
        product_types=("Girls Ethnic Dress", "Girls Lehenga Dress"),
        tags=("category:girls-dress", "category:girls-lehenga", "category:girls-lehenga-dress"),
    ),
    CollectionRule(
        handle="festive-wear",
        title="Festive Wear",
        description=(
            "A broad edit for weddings, pujas, haldi, birthdays, family "
            "portraits, and cultural celebrations."
        ),
        tags=("occasion:festive", "occasion:puja", "occasion:wedding", "occasion:haldi"),
    ),
    CollectionRule(
        handle="womens-ethnic",
        title="Women's Ethnic",
        description="Sarees and salwar suits for festive and graceful occasion dressing.",
        tags=("collection:womens-ethnic", "audience:women"),
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--csv",
        default=os.getenv("PRODUCT_CSV_PATH", DEFAULT_CSV_PATH),
        help="Path to Shopify product CSV. Defaults to PRODUCT_CSV_PATH or Downloads/product_template.csv.",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Actually create collections and collects in Shopify. Without this, only prints a dry-run plan.",
    )
    return parser.parse_args()


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
      raise SystemExit(f"Missing required environment variable: {name}")
    return value


def normalize_shop_domain(value: str) -> str:
    value = value.strip().replace("https://", "").replace("http://", "").strip("/")
    if not value:
        raise SystemExit("SHOPIFY_SHOP_DOMAIN is empty.")
    return value


def read_products(csv_path: str) -> list[dict[str, Any]]:
    path = Path(csv_path)
    if not path.exists():
        raise SystemExit(f"CSV not found: {path}")

    products: list[dict[str, Any]] = []
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        for row in reader:
            title = (row.get("Title") or "").strip()
            handle = (row.get("URL handle") or "").strip()
            if not title or not handle:
                continue

            tags = [tag.strip() for tag in (row.get("Tags") or "").split(",") if tag.strip()]
            products.append(
                {
                    "handle": handle,
                    "title": title,
                    "product_type": (row.get("Type") or "").strip(),
                    "tags": tags,
                    "image_url": (row.get("Product image URL") or "").strip(),
                }
            )

    if not products:
        raise SystemExit(f"No product rows found in CSV: {path}")
    return products


def product_matches(product: dict[str, Any], rule: CollectionRule) -> bool:
    product_type = product["product_type"]
    tags = set(product["tags"])
    return product_type in rule.product_types or any(tag in tags for tag in rule.tags)


def build_collection_plan(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    plan = []
    for rule in COLLECTION_RULES:
        matched_products = [product for product in products if product_matches(product, rule)]
        if not matched_products:
            continue
        plan.append({"rule": rule, "products": matched_products})
    return plan


class ShopifyAdminClient:
    def __init__(self, shop_domain: str, access_token: str) -> None:
        self.base_url = f"https://{normalize_shop_domain(shop_domain)}/admin/api/{API_VERSION}"
        self.access_token = access_token

    def request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        query: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        if query:
            url = f"{url}?{urllib.parse.urlencode(query)}"

        body = None
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.access_token,
        }
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        for attempt in range(1, 4):
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    raw = response.read().decode("utf-8")
                    return json.loads(raw) if raw else {}
            except urllib.error.HTTPError as error:
                raw = error.read().decode("utf-8", errors="replace")
                if error.code == 429 and attempt < 3:
                    time.sleep(2 * attempt)
                    continue
                raise RuntimeError(f"Shopify API {method} {path} failed: HTTP {error.code} {raw}") from error
            except urllib.error.URLError as error:
                if attempt < 3:
                    time.sleep(2 * attempt)
                    continue
                raise RuntimeError(f"Shopify API {method} {path} failed: {error}") from error

        raise RuntimeError(f"Shopify API {method} {path} failed after retries.")

    def find_product_id_by_handle(self, handle: str) -> int | None:
        data = self.request(
            "GET",
            "/products.json",
            query={"handle": handle, "fields": "id,handle,title"},
        )
        products = data.get("products", [])
        return products[0]["id"] if products else None

    def find_custom_collection_by_handle(self, handle: str) -> dict[str, Any] | None:
        data = self.request("GET", "/custom_collections.json", query={"limit": 250})
        for collection in data.get("custom_collections", []):
            if collection.get("handle") == handle:
                return collection
        return None

    def create_or_reuse_collection(self, rule: CollectionRule, cover_image_url: str | None) -> dict[str, Any]:
        existing = self.find_custom_collection_by_handle(rule.handle)
        if existing:
            return existing

        custom_collection: dict[str, Any] = {
            "title": rule.title,
            "handle": rule.handle,
            "body_html": f"<p>{rule.description}</p>",
            "published": True,
            "sort_order": "manual",
        }
        if cover_image_url:
            custom_collection["image"] = {"src": cover_image_url}

        data = self.request(
            "POST",
            "/custom_collections.json",
            payload={"custom_collection": custom_collection},
        )
        return data["custom_collection"]

    def collect_exists(self, collection_id: int, product_id: int) -> bool:
        data = self.request(
            "GET",
            "/collects.json",
            query={"collection_id": collection_id, "product_id": product_id, "fields": "id"},
        )
        return bool(data.get("collects"))

    def create_collect(self, collection_id: int, product_id: int) -> dict[str, Any] | None:
        if self.collect_exists(collection_id, product_id):
            return None
        data = self.request(
            "POST",
            "/collects.json",
            payload={"collect": {"collection_id": collection_id, "product_id": product_id}},
        )
        return data.get("collect")


def print_plan(plan: list[dict[str, Any]]) -> None:
    print("Collection creation plan:")
    for item in plan:
        rule = item["rule"]
        print(f"\n- {rule.title} ({rule.handle})")
        for product in item["products"]:
            print(f"  - {product['handle']} | {product['title']}")


def run_live(plan: list[dict[str, Any]]) -> None:
    shop_domain = require_env("SHOPIFY_SHOP_DOMAIN")
    token = require_env("SHOPIFY_ADMIN_API_ACCESS_TOKEN")
    client = ShopifyAdminClient(shop_domain, token)

    product_ids_by_handle: dict[str, int] = {}
    for item in plan:
        for product in item["products"]:
            handle = product["handle"]
            if handle in product_ids_by_handle:
                continue
            product_id = client.find_product_id_by_handle(handle)
            if not product_id:
                print(f"WARNING: product not found in Shopify by handle: {handle}", file=sys.stderr)
                continue
            product_ids_by_handle[handle] = product_id

    for item in plan:
        rule = item["rule"]
        cover_image_url = next((product["image_url"] for product in item["products"] if product["image_url"]), None)
        collection = client.create_or_reuse_collection(rule, cover_image_url)
        collection_id = collection["id"]
        print(f"\nCollection ready: {rule.title} | id={collection_id} | handle={collection.get('handle')}")

        for product in item["products"]:
            product_id = product_ids_by_handle.get(product["handle"])
            if not product_id:
                continue
            collect = client.create_collect(collection_id, product_id)
            action = "connected" if collect else "already connected"
            print(f"  {action}: {product['title']} | product_id={product_id}")


def main() -> None:
    args = parse_args()
    products = read_products(args.csv)
    plan = build_collection_plan(products)

    print_plan(plan)
    if not args.live:
        print("\nDry run only. Add --live to create collections and attach products in Shopify.")
        return

    run_live(plan)


if __name__ == "__main__":
    main()
