"""
Serious Core — Database Access Object (core/db.py)
Part of the Stupid Suite by Serious Studio.
Provides high-performance, native SQLite data access for all applications.
"""

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_PATH = Path(__file__).resolve().parent / "serious_core.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_brands() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM brands ORDER BY name ASC").fetchall()
        return [dict(r) for r in rows]


def get_products(brand_id: Optional[str] = None, tier: Optional[str] = None) -> List[Dict[str, Any]]:
    query = """
        SELECT 
            p.*,
            b.name AS brand_name,
            COALESCE(SUM(il.stock_count), 0) AS total_physical_stock
        FROM products p
        JOIN brands b ON p.brand_id = b.id
        LEFT JOIN inventory_levels il ON p.sku = il.product_sku AND il.variant_sku IS NULL
        WHERE 1=1
    """
    params: List[Any] = []
    if brand_id and brand_id != "all":
        query += " AND p.brand_id = ?"
        params.append(brand_id)
    if tier:
        query += " AND p.tier = ?"
        params.append(tier)

    query += " GROUP BY p.sku ORDER BY p.sku ASC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        results = []
        for r in rows:
            item = dict(r)
            item["materials"] = json.loads(item["materials_json"]) if item.get("materials_json") else []
            item["specs"] = json.loads(item["specs_json"]) if item.get("specs_json") else {}
            item["options_config"] = json.loads(item["options_config"]) if item.get("options_config") else []
            
            # Fetch attached photos
            photo_rows = conn.execute(
                "SELECT id, file_path, slot_type, is_primary FROM product_photos WHERE product_sku = ? ORDER BY is_primary DESC, id ASC",
                (item["sku"],),
            ).fetchall()
            item["photos"] = [dict(pr) for pr in photo_rows]

            # Fetch variants with synchronized inventory level
            variant_rows = conn.execute(
                """
                SELECT v.*, COALESCE(il.stock_count, v.stock, 0) AS current_stock
                FROM variants v
                LEFT JOIN inventory_levels il ON v.variant_sku = il.variant_sku AND il.location_id = 'lille_hub'
                WHERE v.product_sku = ? ORDER BY v.variant_sku ASC
                """,
                (item["sku"],),
            ).fetchall()
            item["variants"] = []
            for vr in variant_rows:
                v = dict(vr)
                v["stock"] = v.get("current_stock", v.get("stock", 0))
                v["specs"] = json.loads(v["specs_json"]) if v.get("specs_json") else {}
                item["variants"].append(v)

            # If product has variants, physical stock is the sum of all variant stocks
            if item["variants"]:
                item["total_physical_stock"] = sum(v["stock"] for v in item["variants"])

            results.append(item)
        return results


def get_product(sku: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT p.*, b.name AS brand_name
            FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE p.sku = ?
            """,
            (sku,),
        ).fetchone()
        if not row:
            return None
        item = dict(row)
        item["materials"] = json.loads(item["materials_json"]) if item.get("materials_json") else []
        item["specs"] = json.loads(item["specs_json"]) if item.get("specs_json") else {}
        item["options_config"] = json.loads(item["options_config"]) if item.get("options_config") else []

        # Photos
        photo_rows = conn.execute(
            "SELECT id, file_path, slot_type, is_primary FROM product_photos WHERE product_sku = ? ORDER BY is_primary DESC, id ASC",
            (sku,),
        ).fetchall()
        item["photos"] = [dict(pr) for pr in photo_rows]

        # Variants with synchronized stock
        variant_rows = conn.execute(
            """
            SELECT v.*, COALESCE(il.stock_count, v.stock, 0) AS current_stock
            FROM variants v
            LEFT JOIN inventory_levels il ON v.variant_sku = il.variant_sku AND il.location_id = 'lille_hub'
            WHERE v.product_sku = ? ORDER BY v.variant_sku ASC
            """,
            (sku,),
        ).fetchall()
        item["variants"] = []
        for vr in variant_rows:
            v = dict(vr)
            v["stock"] = v.get("current_stock", v.get("stock", 0))
            v["specs"] = json.loads(v["specs_json"]) if v.get("specs_json") else {}
            item["variants"].append(v)

        if item["variants"]:
            item["total_physical_stock"] = sum(v["stock"] for v in item["variants"])

        # Inventory by location
        stock_rows = conn.execute(
            """
            SELECT il.location_id, l.name AS location_name, l.city, l.country, il.stock_count
            FROM inventory_levels il
            JOIN locations l ON il.location_id = l.id
            WHERE il.product_sku = ? AND il.variant_sku IS NULL
            """,
            (sku,),
        ).fetchall()
        item["stock_by_location"] = {sr["location_id"]: sr["stock_count"] for sr in stock_rows}
        item["locations_detail"] = [dict(sr) for sr in stock_rows]

        return item


def search_products(query: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT p.sku, p.title, p.brand_id, p.category, p.retail_price, p.shelf_coordinate
            FROM products_fts fts
            JOIN products p ON fts.rowid = p.rowid
            WHERE products_fts MATCH ?
            LIMIT 20
            """,
            (f"{query}*",),
        ).fetchall()
        return [dict(r) for r in rows]


def get_consignments(brand_id: Optional[str] = None) -> List[Dict[str, Any]]:
    query = """
        SELECT c.*, p.title AS product_title, p.retail_price, b.name AS brand_name
        FROM consignments c
        JOIN products p ON c.product_sku = p.sku
        JOIN brands b ON c.brand_id = b.id
        WHERE 1=1
    """
    params = []
    if brand_id and brand_id != "all":
        query += " AND c.brand_id = ?"
        params.append(brand_id)
    query += " ORDER BY c.boutique_name ASC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_event_allocations() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        events = conn.execute("SELECT * FROM event_containers ORDER BY start_date ASC").fetchall()
        results = []
        for ev in events:
            ev_dict = dict(ev)
            alloc_rows = conn.execute(
                """
                SELECT esa.*, p.title AS product_title, p.retail_price,
                       COALESCE((SELECT stock_count FROM inventory_levels WHERE product_sku = esa.product_sku AND location_id = 'lille_hub' AND variant_sku IS NULL), 0) AS lille_available_stock
                FROM event_stock_allocations esa
                JOIN products p ON esa.product_sku = p.sku
                WHERE esa.event_id = ?
                """,
                (ev["id"],),
            ).fetchall()
            ev_dict["allocations"] = [dict(ar) for ar in alloc_rows]
            results.append(ev_dict)
        return results


def get_raw_materials(brand_id: Optional[str] = None) -> List[Dict[str, Any]]:
    query = "SELECT * FROM raw_materials WHERE 1=1"
    params = []
    if brand_id and brand_id != "all":
        query += " AND brand_id = ?"
        params.append(brand_id)
    query += " ORDER BY name ASC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_financial_summary(brand_id: Optional[str] = None) -> Dict[str, Any]:
    query = """
        SELECT 
            COUNT(DISTINCT p.sku) AS total_skus,
            SUM(p.retail_price * il.stock_count) AS total_retail_value,
            SUM(p.production_cost * il.stock_count) AS total_production_cost,
            SUM(il.stock_count) AS total_units_in_stock
        FROM inventory_levels il
        JOIN products p ON il.product_sku = p.sku
        WHERE il.variant_sku IS NULL
    """
    params = []
    if brand_id and brand_id != "all":
        query += " AND p.brand_id = ?"
        params.append(brand_id)

    with get_connection() as conn:
        row = conn.execute(query, params).fetchone()
        retail = row["total_retail_value"] or 0.0
        cost = row["total_production_cost"] or 0.0
        margin = retail - cost
        margin_pct = (margin / retail * 100.0) if retail > 0 else 0.0

        return {
            "total_skus": row["total_skus"] or 0,
            "total_units_in_stock": row["total_units_in_stock"] or 0,
            "total_retail_value": round(retail, 2),
            "total_production_cost": round(cost, 2),
            "total_margin_value": round(margin, 2),
            "average_margin_percentage": round(margin_pct, 1),
        }
