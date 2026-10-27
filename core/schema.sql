-- Serious Core Schema (SQLite 3)
-- Shared Local Foundation for the Stupid Suite
-- Autonomous Multi-App Operating System by Serious Studio

PRAGMA foreign_keys = ON;

-- 1. Brands Partitioning Table
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Physical Storage & Commercial Locations
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('HUB', 'WORKSHOP', 'CONSIGNMENT', 'EVENT')),
    city TEXT,
    country TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Formal Physical Products Table
CREATE TABLE IF NOT EXISTS products (
    sku TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES brands(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('B2C_FINISHED', 'B2B_WHOLESALE', 'RAW_MATERIAL')),
    production_cost REAL NOT NULL DEFAULT 0.0,
    retail_price REAL NOT NULL DEFAULT 0.0,
    wholesale_price REAL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    shelf_coordinate TEXT,
    shoot_prompt TEXT,
    has_photos BOOLEAN NOT NULL DEFAULT 0,
    materials_json TEXT, -- JSON Array: ["925 Sterling Silver", ...]
    specs_json TEXT,     -- JSON Object: {"gauge": "16g", ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Variants (Sizes, Gauges, Dimensions)
CREATE TABLE IF NOT EXISTS variants (
    variant_sku TEXT PRIMARY KEY,
    product_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specs_json TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    shelf_bin TEXT,
    price_override REAL
);

-- 5. Multi-Location Stock Matrix
CREATE TABLE IF NOT EXISTS inventory_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    variant_sku TEXT REFERENCES variants(variant_sku) ON DELETE CASCADE,
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    stock_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_sku, variant_sku, location_id)
);

-- 6. Multi-Brand Consignment Partners (B2B Dépôt)
CREATE TABLE IF NOT EXISTS consignments (
    id TEXT PRIMARY KEY,
    boutique_name TEXT NOT NULL,
    city TEXT NOT NULL,
    brand_id TEXT NOT NULL REFERENCES brands(id),
    product_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    allocated_units INTEGER NOT NULL DEFAULT 0,
    sold_units INTEGER NOT NULL DEFAULT 0,
    commission_rate REAL NOT NULL DEFAULT 0.30,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'AUDIT_PENDING')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Event & Festival Allocator Containers
CREATE TABLE IF NOT EXISTS event_containers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'LOCKED', 'ACTIVE', 'RECONCILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Event Locked Stock Allocations
CREATE TABLE IF NOT EXISTS event_stock_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL REFERENCES event_containers(id) ON DELETE CASCADE,
    product_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    requested_units INTEGER NOT NULL DEFAULT 0,
    locked_units INTEGER NOT NULL DEFAULT 0,
    sold_units INTEGER NOT NULL DEFAULT 0,
    UNIQUE (event_id, product_sku)
);

-- 9. Raw Materials Stock & Restock Thresholds
CREATE TABLE IF NOT EXISTS raw_materials (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES brands(id),
    name TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('g', 'kg', 'm2', 'pcs', 'meters')),
    current_stock REAL NOT NULL DEFAULT 0.0,
    alert_threshold REAL NOT NULL DEFAULT 0.0,
    cost_per_unit REAL NOT NULL DEFAULT 0.0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    shelf_coordinate TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Product Photographic Assets
CREATE TABLE IF NOT EXISTS product_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    slot_type TEXT NOT NULL DEFAULT 'photo_1',
    is_primary BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Full-Text Search (FTS5) for High-Speed Omnibar Search
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
    sku,
    title,
    category,
    materials_json,
    content='products',
    content_rowid='rowid'
);

-- Triggers for FTS5 Synchrony
CREATE TRIGGER IF NOT EXISTS products_ai AFTER INSERT ON products BEGIN
    INSERT INTO products_fts(rowid, sku, title, category, materials_json)
    VALUES (new.rowid, new.sku, new.title, new.category, new.materials_json);
END;

CREATE TRIGGER IF NOT EXISTS products_ad AFTER DELETE ON products BEGIN
    INSERT INTO products_fts(products_fts, rowid, sku, title, category, materials_json)
    VALUES ('delete', old.rowid, old.sku, old.title, old.category, old.materials_json);
END;

CREATE TRIGGER IF NOT EXISTS products_au AFTER UPDATE ON products BEGIN
    INSERT INTO products_fts(products_fts, rowid, sku, title, category, materials_json)
    VALUES ('delete', old.rowid, old.sku, old.title, old.category, old.materials_json);
    INSERT INTO products_fts(rowid, sku, title, category, materials_json)
    VALUES (new.rowid, new.sku, new.title, new.category, new.materials_json);
END;
