#!/usr/bin/env python3
"""
Stupid Stock — Local Application Server (server.py)
Autonomous Native Backend for Physical Inventory & Atelier Margins.
Part of the Stupid Suite by Serious Studio.
Zero-dependency: uses standard library http.server, sqlite3, and json.
"""

import json
import mimetypes
import os
import sys
import urllib.parse
from datetime import datetime
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Add project root to sys.path to import core
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from core.db import (
    get_brands,
    get_consignments,
    get_event_allocations,
    get_financial_summary,
    get_product,
    get_products,
    get_raw_materials,
    search_products,
)

PORT = 8200
PUBLIC_DIR = Path(__file__).resolve().parent / "public"
FEEDBACK_FILE = Path(__file__).resolve().parent / "data" / "atelier_feedback.json"
OBSIDIAN_VAULT = Path("/Users/seriouscrocodile/Documents/Obsidian Vault")
OBSIDIAN_BACKLOG = OBSIDIAN_VAULT / "02_PRO" / "apps" / "stupid-suite-backlog.md"
OBSIDIAN_INBOX = OBSIDIAN_VAULT / "00_INBOX" / "Quick_Notes.md"
UNDO_SNAPSHOTS = {}


def load_feedbacks():
    if not FEEDBACK_FILE.exists():
        return []
    try:
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Feedback] Error reading {FEEDBACK_FILE}: {e}")
        return []


def save_feedbacks_to_file(feedbacks):
    FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
        json.dump(feedbacks, f, indent=2, ensure_ascii=False)


def append_to_obsidian(feedback_item):
    """Sync newly created feedback pin directly into Obsidian Vault"""
    pin_id = feedback_item.get("id", "PIN-???")
    comment = feedback_item.get("comment", "").strip()
    category = feedback_item.get("category", "ui").upper()
    ctx = feedback_item.get("context", {})
    selector = ctx.get("selector", "") or ctx.get("target_id", "") or ctx.get("tag", "element")
    sku = ctx.get("sku", "")
    timestamp = feedback_item.get("created_at", datetime.now().strftime("%Y-%m-%d %H:%M"))

    target_desc = f"`{selector}`"
    if sku:
        target_desc += f" (SKU: `{sku}`)"

    markdown_line = f"- [ ] **{pin_id}** `[{category}]` : {comment} — *Cible : {target_desc} ({timestamp})*\n"

    # 1. Append to Obsidian Backlog if file exists
    if OBSIDIAN_BACKLOG.exists():
        try:
            content = OBSIDIAN_BACKLOG.read_text(encoding="utf-8")
            section_header = "## 📌 In-App Live Feedback Pins"
            if section_header in content:
                parts = content.split(section_header)
                new_content = parts[0] + section_header + "\n" + markdown_line + parts[1].lstrip("\n")
            else:
                new_content = content.rstrip() + f"\n\n{section_header}\n{markdown_line}"
            OBSIDIAN_BACKLOG.write_text(new_content, encoding="utf-8")
            print(f"[Feedback] Synced {pin_id} to Obsidian Backlog: {comment[:40]}")
        except Exception as e:
            print(f"[Feedback] Failed to sync to Obsidian backlog: {e}")

    # 2. Append to Obsidian Inbox Quick Notes if exists
    if OBSIDIAN_INBOX.exists():
        try:
            inbox_line = f"- [ ] [Stupid Stock] **{pin_id}** : {comment} (sur {target_desc})\n"
            with open(OBSIDIAN_INBOX, "a", encoding="utf-8") as f:
                f.write(inbox_line)
            print(f"[Feedback] Synced {pin_id} to Obsidian Inbox")
        except Exception as e:
            print(f"[Feedback] Failed to sync to Obsidian inbox: {e}")


class StupidStockHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # CORS Headers for local development
        if path.startswith("/api/"):
            self.handle_api_get(path, query)
        elif path == "/" or path == "/index.html" or path == "/ui_direction_comparison.html":
            # Serve the Stupid Stock app index
            self.serve_file(PUBLIC_DIR / "index.html", "text/html; charset=utf-8")
        elif path in ("/index_v1.7.html", "/v1.7", "/v1.7/"):
            self.serve_file(PUBLIC_DIR / "index_v1.7.html", "text/html; charset=utf-8")
        elif path == "/favicon.ico" or path == "/favicon.png":
            self.serve_file(BASE_DIR / "data" / "favicon" / "favicon_stupid_stock.png", "image/png")
        elif path == "/app.js":
            self.serve_file(PUBLIC_DIR / "app.js", "application/javascript; charset=utf-8")
        elif path == "/app_v1.7.js":
            self.serve_file(PUBLIC_DIR / "app_v1.7.js", "application/javascript; charset=utf-8")
        elif path == "/stupid_shoot_studio.html":
            self.serve_file(BASE_DIR / "prototypes" / "design-exploration" / "stupid_shoot_studio.html", "text/html; charset=utf-8")
        elif path == "/stupid_shop_gateway.html":
            self.serve_file(BASE_DIR / "prototypes" / "design-exploration" / "stupid_shop_gateway.html", "text/html; charset=utf-8")
        elif path == "/favicon_showcase.html":
            self.serve_file(BASE_DIR / "prototypes" / "design-exploration" / "favicon_showcase.html", "text/html; charset=utf-8")
        elif path == "/drawer_header_variations.html":
            self.serve_file(BASE_DIR / "prototypes" / "design-exploration" / "drawer_header_variations.html", "text/html; charset=utf-8")
        elif path == "/sidebar_bakeoff.html":
            self.serve_file(BASE_DIR / "prototypes" / "design-exploration" / "sidebar_bakeoff.html", "text/html; charset=utf-8")
        elif path.startswith("/public/"):
            # Serve assets from public/
            rel = path[len("/public/"):]
            self.serve_file(PUBLIC_DIR / rel)
        elif path.startswith("/vendor/"):
            # Serve vendor scripts (e.g. standalone tailwind)
            rel = path[len("/vendor/"):]
            self.serve_file(PUBLIC_DIR / "vendor" / rel)
        elif path.startswith("/data/"):
            # Serve real product images from data/
            rel = path[len("/data/"):]
            self.serve_file(BASE_DIR / "data" / rel)
        else:
            # Fallback to standard handler
            super().do_GET()

    def handle_api_get(self, path: str, query: dict):
        if path == "/api/export/csv":
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="stupid_stock_inventory.csv"')
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            import csv
            import io
            output = io.StringIO()
            writer = csv.writer(output, delimiter=';')
            writer.writerow([
                "SKU", "Titre", "Marque", "Catégorie", "Casier Atelier",
                "Stock Physique", "Prix Public (€)", "Coût Atelier (€)",
                "Prix Grossiste (€)", "Marge Brute (%)", "Valeur Totale (€)", "Déclinaisons"
            ])
            products = get_products(brand_id="kaya_movement")
            for p in products:
                stock = p.get("total_physical_stock", 0)
                retail = p.get("retail_price", 0.0)
                cost = p.get("production_cost", 0.0)
                wholesale = p.get("wholesale_price", 0.0)
                margin = f"{(((retail - cost) / retail) * 100):.1f}%" if retail > 0 else "0.0%"
                total_val = f"{(retail * stock):.2f}"
                variants_str = ", ".join([f"{v.get('name')}: {v.get('stock')}" for v in p.get("variants", [])])
                writer.writerow([
                    p.get("sku"),
                    p.get("title"),
                    p.get("brand_name", "Kaya Movement"),
                    p.get("category", ""),
                    p.get("shelf_coordinate", ""),
                    stock,
                    f"{retail:.2f}",
                    f"{cost:.2f}",
                    f"{wholesale:.2f}",
                    margin,
                    total_val,
                    variants_str
                ])
            self.wfile.write(output.getvalue().encode("utf-8-sig"))
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

        response_data = {}

        if path == "/api/health":
            response_data = {
                "status": "online",
                "app": "Stupid Stock",
                "version": "1.6.0",
                "database": "core/serious_core.db",
            }
        elif path == "/api/version":
            version_file = Path(__file__).resolve().parent / "VERSION.json"
            if version_file.exists():
                try:
                    with open(version_file, "r", encoding="utf-8") as vf:
                        response_data = json.load(vf)
                except Exception as e:
                    response_data = {"version": "1.6.0", "error": str(e)}
            else:
                response_data = {"version": "1.6.0"}
        elif path == "/api/brands":
            response_data = {"brands": get_brands()}
        elif path == "/api/products":
            brand_id = query.get("brand_id", [None])[0]
            tier = query.get("tier", [None])[0]
            response_data = {
                "brand_id": brand_id or "all",
                "products": get_products(brand_id=brand_id, tier=tier),
            }
        elif path.startswith("/api/products/"):
            sku = path[len("/api/products/"):]
            product = get_product(sku)
            if product:
                response_data = {"product": product}
            else:
                self.send_error(HTTPStatus.NOT_FOUND, f"SKU {sku} not found")
                return
        elif path == "/api/consignments":
            brand_id = query.get("brand_id", [None])[0]
            response_data = {"consignments": get_consignments(brand_id=brand_id)}
        elif path == "/api/events":
            response_data = {"events": get_event_allocations()}
        elif path == "/api/raw-materials":
            brand_id = query.get("brand_id", [None])[0]
            response_data = {"raw_materials": get_raw_materials(brand_id=brand_id)}
        elif path == "/api/financials":
            brand_id = query.get("brand_id", [None])[0]
            response_data = {"financials": get_financial_summary(brand_id=brand_id)}
        elif path == "/api/search":
            q = query.get("q", [""])[0]
            response_data = {"query": q, "results": search_products(q) if q else []}
        elif path == "/api/feedback":
            response_data = {"status": "success", "feedbacks": load_feedbacks()}
        else:
            response_data = {"error": "Endpoint not recognized"}

        self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body) if body else {}
            except Exception:
                payload = {}

            self.handle_api_post(path, payload)
        else:
            self.send_error(HTTPStatus.NOT_FOUND)

    def handle_api_post(self, path: str, payload: dict):
        import sqlite3
        from core.db import DB_PATH

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        response = {"status": "success"}

        # Handle stock updates
        if path.startswith("/api/products/") and path.endswith("/stock"):
            # format: /api/products/<sku>/stock
            parts = path.split("/")
            sku = parts[3]
            location_id = payload.get("location_id", "lille_hub")
            new_stock = int(payload.get("stock_count", 0))

            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    """
                    INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                    VALUES (?, NULL, ?, ?)
                    ON CONFLICT(product_sku, variant_sku, location_id) DO UPDATE SET stock_count = excluded.stock_count
                    """,
                    (sku, location_id, new_stock),
                )
                conn.commit()

            response = {
                "status": "updated",
                "sku": sku,
                "location_id": location_id,
                "new_stock": new_stock,
            }

        elif path.startswith("/api/products/") and path.endswith("/update"):
            parts = path.split("/")
            sku = parts[3]
            new_sku = payload.get("new_sku", "").strip().upper()
            title = payload.get("title")
            category = payload.get("category")
            buy = payload.get("production_cost")
            retail = payload.get("retail_price")
            shelf = payload.get("shelf_coordinate")
            materials = payload.get("materials")

            with sqlite3.connect(DB_PATH) as conn:
                # 1. Handle SKU rename if requested and different
                if new_sku and new_sku != sku:
                    cur = conn.cursor()
                    cur.execute("SELECT 1 FROM products WHERE sku = ?", (new_sku,))
                    if cur.fetchone():
                        self.wfile.write(json.dumps({"status": "error", "message": f"Le SKU {new_sku} existe déjà"}).encode("utf-8"))
                        return

                    conn.execute("PRAGMA foreign_keys = OFF;")
                    conn.execute("UPDATE products SET sku = ? WHERE sku = ?", (new_sku, sku))
                    conn.execute("UPDATE variants SET product_sku = ? WHERE product_sku = ?", (new_sku, sku))
                    conn.execute("UPDATE inventory_levels SET product_sku = ? WHERE product_sku = ?", (new_sku, sku))
                    conn.execute("UPDATE product_photos SET product_sku = ? WHERE product_sku = ?", (new_sku, sku))
                    conn.execute("UPDATE consignments SET product_sku = ? WHERE product_sku = ?", (new_sku, sku))
                    conn.execute("UPDATE event_stock_allocations SET product_sku = ? WHERE product_sku = ?", (new_sku, sku))

                    # Migrate directory on disk if it exists
                    cur.execute("SELECT brand_id FROM products WHERE sku = ?", (new_sku,))
                    b_row = cur.fetchone()
                    brand_dir = b_row[0] if b_row and b_row[0] else "kaya_movement"
                    old_dir = BASE_DIR / "data" / "sample_shops" / brand_dir / "products" / sku
                    new_dir = BASE_DIR / "data" / "sample_shops" / brand_dir / "products" / new_sku
                    if old_dir.exists() and not new_dir.exists():
                        try:
                            old_dir.rename(new_dir)
                            old_rel = f"data/sample_shops/{brand_dir}/products/{sku}/"
                            new_rel = f"data/sample_shops/{brand_dir}/products/{new_sku}/"
                            conn.execute(
                                "UPDATE product_photos SET file_path = REPLACE(file_path, ?, ?) WHERE product_sku = ?",
                                (old_rel, new_rel, new_sku)
                            )
                        except Exception as rename_err:
                            print(f"Error renaming product directory: {rename_err}")

                    conn.execute("PRAGMA foreign_keys = ON;")
                    conn.commit()
                    sku = new_sku

                updates = []
                params = []
                if title:
                    updates.append("title = ?")
                    params.append(title)
                if category:
                    updates.append("category = ?")
                    params.append(category)
                if buy is not None:
                    updates.append("production_cost = ?")
                    params.append(float(buy))
                if retail is not None:
                    updates.append("retail_price = ?")
                    params.append(float(retail))
                if shelf is not None:
                    clean_shelf = shelf.strip().upper()
                    updates.append("shelf_coordinate = ?")
                    params.append(clean_shelf)
                    # Sync child variants to maintain 100% database consistency
                    conn.execute("UPDATE variants SET shelf_bin = ? WHERE product_sku = ?", (clean_shelf, sku))
                if materials is not None:
                    updates.append("materials_json = ?")
                    params.append(json.dumps(materials))
                if updates:
                    params.append(sku)
                    conn.execute(f"UPDATE products SET {', '.join(updates)} WHERE sku = ?", params)
                    conn.commit()

            response = {"status": "updated", "sku": sku}

        elif path == "/api/products/create":
            sku = payload.get("sku", "").strip().upper()
            title = payload.get("title", "").strip()
            brand_id = payload.get("brand_id", "kaya_movement")
            category = payload.get("category", "Piercing / Jewelry")
            shelf = payload.get("shelf_coordinate", "LIL-A01").strip().upper()
            retail = float(payload.get("retail_price", 0))
            cost = float(payload.get("production_cost", 0))
            wholesale = float(payload.get("wholesale_price", retail * 0.5))
            stock = int(payload.get("stock_count", 0))
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if not sku or not title:
                response = {"status": "error", "message": "SKU and title are required"}
            else:
                with sqlite3.connect(DB_PATH) as conn:
                    conn.execute(
                        """
                        INSERT OR REPLACE INTO products 
                        (sku, brand_id, title, category, tier, production_cost, retail_price, wholesale_price, shelf_coordinate, has_photos, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 'B2C_FINISHED', ?, ?, ?, ?, 0, ?, ?)
                        """,
                        (sku, brand_id, title, category, cost, retail, wholesale, shelf, now, now)
                    )
                    conn.execute(
                        """
                        INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                        VALUES (?, NULL, 'lille_hub', ?)
                        ON CONFLICT(product_sku, variant_sku, location_id) DO UPDATE SET stock_count = excluded.stock_count
                        """,
                        (sku, stock)
                    )
                    conn.commit()
                response = {"status": "created", "sku": sku}

        elif path.startswith("/api/products/") and path.endswith("/delete"):
            parts = path.split("/")
            sku = parts[3]
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                conn.execute("DELETE FROM products WHERE sku = ?", (sku,))
                conn.commit()
            response = {"status": "deleted", "sku": sku}

        elif path == "/api/products/batch-shelf":
            skus = payload.get("skus", [])
            shelf = payload.get("shelf_coordinate", "").strip().upper()
            if not skus or not shelf:
                response = {"status": "error", "message": "skus and shelf_coordinate required"}
            else:
                with sqlite3.connect(DB_PATH) as conn:
                    for s in skus:
                        conn.execute("UPDATE products SET shelf_coordinate = ? WHERE sku = ?", (shelf, s))
                        conn.execute("UPDATE variants SET shelf_bin = ? WHERE product_sku = ?", (shelf, s))
                    conn.commit()
                response = {"status": "ok", "updated": len(skus), "shelf": shelf}

        elif path == "/api/products/batch-delete":
            skus = payload.get("skus", [])
            if not skus:
                response = {"status": "error", "message": "skus required"}
            else:
                undo_id = f"undo_{int(datetime.now().timestamp())}_{len(skus)}"
                snapshot_data = []
                with sqlite3.connect(DB_PATH) as conn:
                    conn.row_factory = sqlite3.Row
                    for s in skus:
                        p = conn.execute("SELECT * FROM products WHERE sku = ?", (s,)).fetchone()
                        if p:
                            vars_rows = conn.execute("SELECT * FROM variants WHERE product_sku = ?", (s,)).fetchall()
                            inv_rows = conn.execute("SELECT * FROM inventory_levels WHERE product_sku = ?", (s,)).fetchall()
                            snapshot_data.append({
                                "product": dict(p),
                                "variants": [dict(v) for v in vars_rows],
                                "inventory": [dict(i) for i in inv_rows]
                            })
                    conn.execute("PRAGMA foreign_keys = ON;")
                    for s in skus:
                        conn.execute("DELETE FROM products WHERE sku = ?", (s,))
                    conn.commit()

                UNDO_SNAPSHOTS[undo_id] = snapshot_data
                response = {"status": "ok", "deleted": len(skus), "undo_id": undo_id}

        elif path == "/api/products/batch-undo":
            undo_id = payload.get("undo_id", "")
            snapshot_data = UNDO_SNAPSHOTS.get(undo_id)
            if not snapshot_data:
                response = {"status": "error", "message": "Snapshot expired or not found"}
            else:
                with sqlite3.connect(DB_PATH) as conn:
                    for item in snapshot_data:
                        p = item["product"]
                        cols = list(p.keys())
                        placeholders = ", ".join(["?"] * len(cols))
                        conn.execute(
                            f"INSERT OR REPLACE INTO products ({', '.join(cols)}) VALUES ({placeholders})",
                            list(p.values())
                        )
                        for v in item["variants"]:
                            vcols = list(v.keys())
                            vplaceholders = ", ".join(["?"] * len(vcols))
                            conn.execute(
                                f"INSERT OR REPLACE INTO variants ({', '.join(vcols)}) VALUES ({vplaceholders})",
                                list(v.values())
                            )
                        for inv in item["inventory"]:
                            icols = list(inv.keys())
                            iplaceholders = ", ".join(["?"] * len(icols))
                            conn.execute(
                                f"INSERT OR REPLACE INTO inventory_levels ({', '.join(icols)}) VALUES ({iplaceholders})",
                                list(inv.values())
                            )
                    conn.commit()
                response = {"status": "ok", "restored": len(snapshot_data)}

        elif path.startswith("/api/products/") and "/variants/create" in path:
            parts = path.split("/")
            sku = parts[3]
            name = payload.get("name", "").strip()
            variant_sku = payload.get("variant_sku", "").strip().upper()
            stock = int(payload.get("stock", 0))
            shelf_bin = payload.get("shelf_bin", "").strip().upper()
            specs = payload.get("specs", {})
            opt1 = payload.get("option1_value") or payload.get("color") or ""
            opt2 = payload.get("option2_value") or payload.get("size") or ""
            opt3 = payload.get("option3_value") or payload.get("material") or payload.get("gauge") or ""
            if not variant_sku:
                clean_name = name.upper().replace(" ", "-").replace("/", "-")
                variant_sku = f"{sku}-{clean_name}"
            if not shelf_bin:
                shelf_bin = "LIL-A00"

            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                conn.execute(
                    """
                    INSERT INTO variants (variant_sku, product_sku, name, specs_json, stock, shelf_bin, option1_value, option2_value, option3_value)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(variant_sku) DO UPDATE SET 
                        name = excluded.name, 
                        specs_json = excluded.specs_json, 
                        stock = excluded.stock, 
                        shelf_bin = excluded.shelf_bin,
                        option1_value = excluded.option1_value,
                        option2_value = excluded.option2_value,
                        option3_value = excluded.option3_value
                    """,
                    (variant_sku, sku, name, json.dumps(specs), stock, shelf_bin, opt1, opt2, opt3)
                )
                conn.execute(
                    """
                    INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                    VALUES (?, ?, 'lille_hub', ?)
                    ON CONFLICT(product_sku, variant_sku, location_id) DO UPDATE SET stock_count = excluded.stock_count
                    """,
                    (sku, variant_sku, stock)
                )
                conn.commit()
            response = {"status": "created", "variant_sku": variant_sku, "sku": sku}

        elif path.startswith("/api/variants/") and path.endswith("/delete"):
            parts = path.split("/")
            variant_sku = parts[3]
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                conn.execute("DELETE FROM variants WHERE variant_sku = ?", (variant_sku,))
                conn.commit()
            response = {"status": "deleted", "variant_sku": variant_sku}

        elif path.startswith("/api/products/") and "/photos/upload" in path:
            import base64
            import time
            parts = path.split("/")
            sku = parts[3]
            raw_filename = payload.get("filename", "packshot.jpg")
            content_base64 = payload.get("content_base64", "")

            # Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
            if "," in content_base64:
                content_base64 = content_base64.split(",", 1)[1]

            if not content_base64:
                response = {"status": "error", "message": "content_base64 is required"}
            else:
                with sqlite3.connect(DB_PATH) as conn:
                    conn.execute("PRAGMA foreign_keys = ON;")
                    cur = conn.cursor()
                    cur.execute("SELECT p.brand_id FROM products p WHERE p.sku = ?", (sku,))
                    row = cur.fetchone()
                    brand_dir = row[0] if row and row[0] else "kaya_movement"

                    # Canonical central storage directory
                    target_dir = BASE_DIR / "data" / "sample_shops" / brand_dir / "products" / sku / "images"
                    target_dir.mkdir(parents=True, exist_ok=True)

                    ext = Path(raw_filename).suffix.lower() or ".jpg"
                    clean_name = f"photo_{int(time.time())}{ext}"
                    dest_file = target_dir / clean_name

                    with open(dest_file, "wb") as f:
                        f.write(base64.b64decode(content_base64))

                    rel_path = str(dest_file.relative_to(BASE_DIR))

                    # Make this uploaded photo the primary packshot
                    conn.execute("UPDATE product_photos SET is_primary = 0 WHERE product_sku = ?", (sku,))
                    conn.execute(
                        "INSERT INTO product_photos (product_sku, file_path, slot_type, is_primary) VALUES (?, ?, 'upload', 1)",
                        (sku, rel_path)
                    )
                    conn.execute("UPDATE products SET has_photos = 1 WHERE sku = ?", (sku,))
                    conn.commit()

                response = {
                    "status": "uploaded",
                    "sku": sku,
                    "file_path": rel_path,
                    "filename": clean_name
                }

        elif path.startswith("/api/products/") and "/photos/add" in path:
            parts = path.split("/")
            sku = parts[3]
            file_path = payload.get("file_path", "").strip()
            slot_type = payload.get("slot_type", "photo_1")
            is_primary = 1 if payload.get("is_primary", True) else 0

            if file_path:
                with sqlite3.connect(DB_PATH) as conn:
                    conn.execute("PRAGMA foreign_keys = ON;")
                    conn.execute(
                        "INSERT INTO product_photos (product_sku, file_path, slot_type, is_primary) VALUES (?, ?, ?, ?)",
                        (sku, file_path, slot_type, is_primary)
                    )
                    conn.execute("UPDATE products SET has_photos = 1 WHERE sku = ?", (sku,))
                    conn.commit()
                response = {"status": "photo_added", "sku": sku, "file_path": file_path}
            else:
                response = {"status": "error", "message": "file_path is required"}

        elif path.startswith("/api/products/") and "/photos/delete" in path:
            parts = path.split("/")
            sku = parts[3]
            photo_id = payload.get("photo_id")
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                if photo_id:
                    conn.execute("DELETE FROM product_photos WHERE id = ? AND product_sku = ?", (photo_id, sku))
                else:
                    conn.execute("DELETE FROM product_photos WHERE product_sku = ?", (sku,))
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM product_photos WHERE product_sku = ?", (sku,))
                rem = cur.fetchone()[0]
                if rem == 0:
                    conn.execute("UPDATE products SET has_photos = 0 WHERE sku = ?", (sku,))
                conn.commit()
            response = {"status": "photo_deleted", "sku": sku}

        elif path.startswith("/api/products/") and "/photos/set-primary" in path:
            parts = path.split("/")
            sku = parts[3]
            photo_id = payload.get("photo_id")
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                if photo_id:
                    conn.execute("UPDATE product_photos SET is_primary = 0 WHERE product_sku = ?", (sku,))
                    conn.execute("UPDATE product_photos SET is_primary = 1 WHERE id = ? AND product_sku = ?", (photo_id, sku))
                    conn.commit()
            response = {"status": "primary_updated", "photo_id": photo_id, "sku": sku}

        elif path.startswith("/api/variants/") and path.endswith("/stock"):
            # format: /api/variants/<variant_sku>/stock
            parts = path.split("/")
            variant_sku = parts[3]
            location_id = payload.get("location_id", "lille_hub")
            new_stock = int(payload.get("stock_count", 0))

            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                # Find parent product_sku
                cur = conn.cursor()
                cur.execute("SELECT product_sku FROM variants WHERE variant_sku = ?", (variant_sku,))
                row = cur.fetchone()
                product_sku = row[0] if row else None

                conn.execute("UPDATE variants SET stock = ? WHERE variant_sku = ?", (new_stock, variant_sku))
                conn.execute(
                    """
                    INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(product_sku, variant_sku, location_id) DO UPDATE SET stock_count = excluded.stock_count
                    """,
                    (product_sku, variant_sku, location_id, new_stock)
                )

                # Real-Time Parent Product Stock Recalculation (FRIC-03)
                if product_sku:
                    cur.execute("SELECT SUM(stock) FROM variants WHERE product_sku = ?", (product_sku,))
                    tot_row = cur.fetchone()
                    parent_tot = tot_row[0] if tot_row and tot_row[0] is not None else new_stock
                    conn.execute(
                        """
                        INSERT INTO inventory_levels (product_sku, variant_sku, location_id, stock_count)
                        VALUES (?, NULL, ?, ?)
                        ON CONFLICT(product_sku, variant_sku, location_id) DO UPDATE SET stock_count = excluded.stock_count
                        """,
                        (product_sku, location_id, parent_tot)
                    )

                conn.commit()

            response = {
                "status": "updated",
                "variant_sku": variant_sku,
                "new_stock": new_stock
            }

        elif path == "/api/feedback":
            feedbacks = load_feedbacks()
            pin_num = len(feedbacks) + 1
            pin_id = f"PIN-{pin_num:03d}"

            new_item = {
                "id": pin_id,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "comment": payload.get("comment", "").strip(),
                "category": payload.get("category", "ui"),
                "status": "OPEN",
                "context": payload.get("context", {})
            }
            feedbacks.append(new_item)
            save_feedbacks_to_file(feedbacks)
            append_to_obsidian(new_item)

            response = {"status": "created", "feedback": new_item}

        elif path.startswith("/api/feedback/") and path.endswith("/resolve"):
            parts = path.split("/")
            pin_id = parts[3]
            feedbacks = load_feedbacks()
            updated = None
            for fb in feedbacks:
                if fb.get("id") == pin_id:
                    fb["status"] = "RESOLVED"
                    fb["resolved_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    updated = fb
                    break
            if updated:
                save_feedbacks_to_file(feedbacks)
                if OBSIDIAN_BACKLOG.exists():
                    try:
                        content = OBSIDIAN_BACKLOG.read_text(encoding="utf-8")
                        content = content.replace(f"- [ ] **{pin_id}**", f"- [x] **{pin_id}**")
                        OBSIDIAN_BACKLOG.write_text(content, encoding="utf-8")
                    except Exception as e:
                        print(f"[Feedback] Error updating Obsidian checkbox: {e}")
                response = {"status": "resolved", "feedback": updated}
            else:
                response = {"status": "not_found", "message": f"Pin {pin_id} not found"}

        elif path.startswith("/api/feedback/") and path.endswith("/delete"):
            parts = path.split("/")
            pin_id = parts[3]
            feedbacks = load_feedbacks()
            feedbacks = [fb for fb in feedbacks if fb.get("id") != pin_id]
            save_feedbacks_to_file(feedbacks)
            response = {"status": "deleted", "id": pin_id}

        self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def serve_file(self, file_path: Path, content_type: str = None):
        if not file_path.exists() or not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, f"File not found: {file_path}")
            return

        if not content_type:
            content_type, _ = mimetypes.guess_type(str(file_path))
            content_type = content_type or "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, f"Error reading file: {e}")


def run_server(port=PORT):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, StupidStockHandler)
    print(f"✨ Stupid Stock backend server running on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
