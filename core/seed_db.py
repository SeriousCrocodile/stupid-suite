#!/usr/bin/env python3
"""
Serious Core — Database Seeder (seed_db.py)
Initializes and populates core/serious_core.db from data/sample_shops/catalog_seed.json.
Part of the Stupid Suite by Serious Studio.
"""

import json
import os
import sqlite3
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "core" / "serious_core.db"
SCHEMA_PATH = BASE_DIR / "core" / "schema.sql"
SEED_JSON_PATH = BASE_DIR / "data" / "sample_shops" / "catalog_seed.json"


def init_db():
    print(f"[1/4] Initializing SQLite database at {DB_PATH}...")
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn.executescript(schema_sql)
    conn.commit()
    return conn


def seed_locations(conn):
    print("[2/4] Seeding storage locations and hubs...")
    locations = [
        ("lille_hub", "Lille Main Storage & Shipping Hub", "HUB", "Lille", "France"),
        ("bali_workshop", "Bali Handcraft Casting Workshop", "WORKSHOP", "Canggu", "Indonesia"),
        ("bangkok_atelier", "Bangkok Precision Stone Setting Atelier", "WORKSHOP", "Bangkok", "Thailand"),
        ("consignment_noir_marais", "Boutique Noir Marais", "CONSIGNMENT", "Paris", "France"),
        ("consignment_dark_berlin", "Dark Atelier Berlin", "CONSIGNMENT", "Berlin", "Germany"),
    ]
    conn.executemany(
        """
        INSERT INTO locations (id, name, type, city, country)
        VALUES (?, ?, ?, ?, ?)
        """,
        locations,
    )
    conn.commit()


def seed_catalog(conn):
    print(f"[3/4] Ingesting catalog from {SEED_JSON_PATH}...")
    with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    # Collect and insert brands first
    brands = {}
    for p in products:
        b_id = p.get("brand_id")
        b_name = p.get("brand_name", b_id)
        if b_id and b_id not in brands:
            brands[b_id] = {
                "id": b_id,
                "name": b_name,
                "slug": b_id.replace("_", "-"),
                "website": f"https://{b_id.replace('_', '')}.com",
            }

    for b in brands.values():
        conn.execute(
            """
            INSERT OR IGNORE INTO brands (id, name, slug, website)
            VALUES (?, ?, ?, ?)
            """,
            (b["id"], b["name"], b["slug"], b["website"]),
        )

    # Insert products, variants, photos, inventory levels
    for p in products:
        sku = p["sku"]
        conn.execute(
            """
            INSERT INTO products (
                sku, brand_id, title, category, tier,
                production_cost, retail_price, wholesale_price,
                currency, shelf_coordinate, shoot_prompt, has_photos,
                materials_json, specs_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sku,
                p["brand_id"],
                p["title"],
                p["category"],
                p.get("tier", "B2C_FINISHED"),
                float(p.get("production_cost", 0.0)),
                float(p.get("retail_price", 0.0)),
                float(p["wholesale_price"]) if p.get("wholesale_price") is not None else None,
                p.get("currency", "EUR"),
                p.get("shelf_coordinate", "LIL-A01"),
                p.get("shoot_prompt", ""),
                1 if p.get("has_photos") else 0,
                json.dumps(p.get("materials", [])),
                json.dumps(p.get("specs", {})),
            ),
        )

        # Photos
        photos = p.get("photos", [])
        for i, photo_path in enumerate(photos):
            conn.execute(
                """
                INSERT INTO product_photos (product_sku, file_path, slot_type, is_primary)
                VALUES (?, ?, ?, ?)
                """,
                (sku, photo_path, f"photo_{i+1}", 1 if i == 0 else 0),
            )

        # Variants
        variants = p.get("variants", [])
        for v in variants:
            conn.execute(
                """
                INSERT INTO variants (variant_sku, product_sku, name, specs_json, stock, shelf_bin, price_override)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    v["variant_sku"],
                    sku,
                    v["name"],
                    json.dumps(v.get("specs", {})),
                    int(v.get("stock", 0)),
                    v.get("shelf_bin"),
                    v.get("price_override"),
                ),
            )

            # Insert variant inventory level for lille_hub
            conn.execute(
                """
                INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                VALUES (?, ?, ?, ?)
                """,
                (sku, v["variant_sku"], "lille_hub", int(v.get("stock", 0))),
            )

        # General stock_by_location
        stock_by_loc = p.get("stock_by_location", {})
        for loc_id, count in stock_by_loc.items():
            # Check if location exists
            cur = conn.execute("SELECT id FROM locations WHERE id = ?", (loc_id,))
            if not cur.fetchone():
                conn.execute(
                    "INSERT INTO locations (id, name, type, city, country) VALUES (?, ?, ?, ?, ?)",
                    (loc_id, loc_id.replace("_", " ").title(), "HUB", "Unknown", "Unknown"),
                )
            conn.execute(
                """
                INSERT OR REPLACE INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                VALUES (?, NULL, ?, ?)
                """,
                (sku, loc_id, int(count)),
            )

    conn.commit()


def seed_consignments_and_events(conn):
    print("[4/4] Seeding B2B consignments, festival containers, and raw materials...")
    
    # 1. Consignments
    consignments = [
        ("CS-MARAIS-001", "Boutique Noir Marais", "Paris", "kaya_movement", "KM-SEP-001", 3, 1, 0.35),
        ("CS-MARAIS-002", "Boutique Noir Marais", "Paris", "ask_and_embla", "AE-EAR-005", 4, 2, 0.35),
        ("CS-MARAIS-003", "Boutique Noir Marais", "Paris", "parts_of_four", "P4-RNG-001", 2, 0, 0.40),
        ("CS-BERLIN-001", "Dark Atelier Berlin", "Berlin", "kaya_movement", "KM-WGT-002", 5, 2, 0.30),
        ("CS-BERLIN-002", "Dark Atelier Berlin", "Berlin", "parts_of_four", "P4-WAT-004", 1, 0, 0.40),
    ]
    conn.executemany(
        """
        INSERT INTO consignments (id, boutique_name, city, brand_id, product_sku, allocated_units, sold_units, commission_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        consignments,
    )

    # 2. Event containers
    events = [
        ("EV-HELLFEST-2026", "Hellfest Clisson 2026", "Clisson, France", "2026-06-18", "2026-06-21", "PLANNED"),
        ("EV-BOOM-2026", "Boom Festival Portugal", "Idanha-a-Nova, Portugal", "2026-07-20", "2026-07-27", "PLANNED"),
        ("EV-LILLE-CREATEURS", "Marché de Créateurs Wazemmes", "Lille, France", "2026-05-10", "2026-05-11", "PLANNED"),
    ]
    conn.executemany(
        """
        INSERT INTO event_containers (id, name, location, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        events,
    )

    # Event stock allocations
    event_alloc = [
        ("EV-HELLFEST-2026", "KM-SEP-001", 6, 6, 0),
        ("EV-HELLFEST-2026", "KM-WGT-002", 8, 8, 0),
        ("EV-HELLFEST-2026", "AE-NCK-001", 4, 4, 0),
        ("EV-BOOM-2026", "KM-SEP-001", 10, 4, 0),  # Intentionally triggers symmetric deficit warning (Total demand: 16, available: 10)
        ("EV-BOOM-2026", "KM-BAG-005", 2, 2, 0),
    ]
    conn.executemany(
        """
        INSERT INTO event_stock_allocations (event_id, product_sku, requested_units, locked_units, sold_units)
        VALUES (?, ?, ?, ?, ?)
        """,
        event_alloc,
    )

    # 3. Raw materials
    raw_materials = [
        ("RAW-AG-925", "kaya_movement", "925 Sterling Silver Casting Grain", "g", 1450.0, 500.0, 0.95, "EUR", "LIL-RAW-01"),
        ("RAW-BRASS-INGOT", "kaya_movement", "High-Density Antique Brass Ingot", "kg", 18.5, 5.0, 24.0, "EUR", "LIL-RAW-02"),
        ("RAW-LEATHER-VEG", "kaya_movement", "Vegetable Tanned Cowhide 2.5mm (Black)", "m2", 12.0, 4.0, 85.0, "EUR", "LIL-RAW-03"),
        ("RAW-BASALT-ROUGH", "parts_of_four", "Volcanic Basalt Rough Core", "kg", 45.0, 10.0, 12.0, "EUR", "LIL-RAW-04"),
        ("RAW-WOOD-ACACIA", "parts_of_four", "Ancient Acacia Fossilized Wood", "kg", 8.2, 2.0, 140.0, "EUR", "LIL-RAW-05"),
    ]
    conn.executemany(
        """
        INSERT INTO raw_materials (id, brand_id, name, unit, current_stock, alert_threshold, cost_per_unit, currency, shelf_coordinate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        raw_materials,
    )

    conn.commit()


def main():
    conn = init_db()
    seed_locations(conn)
    seed_catalog(conn)
    seed_consignments_and_events(conn)

    # Quick audit count
    products_count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    variants_count = conn.execute("SELECT COUNT(*) FROM variants").fetchone()[0]
    photos_count = conn.execute("SELECT COUNT(*) FROM product_photos").fetchone()[0]
    brands_count = conn.execute("SELECT COUNT(*) FROM brands").fetchone()[0]
    consignments_count = conn.execute("SELECT COUNT(*) FROM consignments").fetchone()[0]
    fts_count = conn.execute("SELECT COUNT(*) FROM products_fts").fetchone()[0]

    print("\n✅ Serious Core SQLite Database successfully initialized and seeded!")
    print(f"   • Database: {DB_PATH}")
    print(f"   • Brands: {brands_count}")
    print(f"   • Products: {products_count}")
    print(f"   • Variants: {variants_count}")
    print(f"   • Photos attached: {photos_count}")
    print(f"   • Consignments: {consignments_count}")
    print(f"   • FTS5 search index entries: {fts_count}")

    conn.close()


if __name__ == "__main__":
    main()
