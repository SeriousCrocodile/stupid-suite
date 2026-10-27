# Sprint 2 Technical Design Specification: Multi-Axes Variations & Dynamic Bulk Toolbar (v2 - Approved)

> **Document ID:** `DESIGN-SPRINT-02-V2`  
> **Author:** Head of Product & Engineering Orchestrator (The Elephant)  
> **Review Status:** Addressed Goldfish Adversarial Findings (VERDICT: READY FOR IMPLEMENTATION)  
> **Périmètre:** `core/schema.sql`, `core/db.py`, `apps/stupid-stock/server.py`, `apps/stupid-stock/public/index.html`, `apps/stupid-stock/public/app.js`

---

## 1. Scope & Domain Coverage

Inventory spans three distinct atelier categories, all handled through Shopify's canonical 3-option structure:
1. **Body Jewelry & Piercings:** Option 1 = Finish / Metal, Option 2 = Inner Diameter / Size, Option 3 = Gauge / Thickness.
2. **Leather Goods & Accessories:** Option 1 = Leather Color, Option 2 = Hardware Finish, Option 3 = Strap Size / Fit.
3. **Studio Apparel & Clothing:** Option 1 = Garment Colorway, Option 2 = Size (XS..XL), Option 3 = Cut / Edition.

---

## 2. Refined SQLite Schema (100% Shopify-Isomorphic)

### 2.1 The Normalized Model
Following Shopify's GraphQL / REST standard:
- **`products` table** defines the options structure:
  ```sql
  ALTER TABLE products ADD COLUMN options_config TEXT DEFAULT '[]';
  -- Example options_config:
  -- [
  --   {"name": "Couleur / Finition", "position": 1, "type": "color"},
  --   {"name": "Diamètre", "position": 2, "type": "size"},
  --   {"name": "Gauge", "position": 3, "type": "spec"}
  -- ]
  ```
- **`variants` table** stores ONLY option values:
  ```sql
  ALTER TABLE variants ADD COLUMN option1_value TEXT DEFAULT NULL;
  ALTER TABLE variants ADD COLUMN option2_value TEXT DEFAULT NULL;
  ALTER TABLE variants ADD COLUMN option3_value TEXT DEFAULT NULL;
  ```

### 2.2 Backward Compatibility & Zero-Loss Migration
Existing rows in `core/serious_core.db` have descriptive strings in `variants.name` and JSON in `variants.specs_json` (e.g. `{"gauge": "16g", "inner_diameter": "8mm"}`).

The migration executes:
```sql
-- For products with empty options_config, assign default based on category
UPDATE products SET options_config = json_array(
  json_object('name', 'Déclinaison / Taille', 'position', 1, 'type', 'size')
) WHERE options_config IS NULL OR options_config = '[]';

-- For variants with NULL option1_value, populate from variants.name
UPDATE variants SET option1_value = name WHERE option1_value IS NULL;
```
When `specs_json` contains `{"color": ...}` or `{"gauge": ...}`, the backend parser extracts them into `option1_value`, `option2_value`, `option3_value` automatically.

### 2.3 Dynamic Color Palette Engine (Client & Server)
Instead of a rigid column, hex swatches are resolved dynamically:
```javascript
const ATELIER_PALETTE = {
  // Gold / Warm metals
  'or jaune': '#D4AF37', 'gold': '#D4AF37', 'brass': '#C5A059',
  'or rose': '#B76E79', 'rose gold': '#B76E79', 'bronze': '#CD7F32',
  // Silver / Cool metals
  'argent 925': '#E2E8F0', 'silver': '#E2E8F0', 'palladium': '#CBD5E1',
  'titanium': '#94A3B8', 'acier': '#64748B', 'mirror rhodium': '#F1F5F9',
  // Dark finishes
  'noir': '#1A1D24', 'black': '#1A1D24', 'ruthenium': '#27272A', 'gunmetal': '#3F3F46',
  // Leather colors
  'charcoal black': '#18181B', 'saddle brown': '#78350F', 'raw tan': '#D97706', 'cognac': '#9A3412',
  // Apparel
  'bone white': '#F8FAFC', 'washed sage': '#84A98C', 'taupe': '#A8A29E'
};
// Fallback for unlisted finishes: calibrated neutral titanium #94A3B8
```

---

## 3. Dynamic Floating Bulk Toolbar (0xUrvish / 21st.dev Interaction Pattern)

### 3.1 Visual Anatomy & Motion Physics
- Floating centered pill (`bottom-5 left-1/2 -translate-x-1/2 z-40`), dark glassmorphic container:
  `bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md rounded-full`.
- **Primary Panel (Collapsed, fluid width transition):**
  - **Selection Badge:** `[ N sélectionnés ✕ ]` (click `✕` clears selection).
  - **Tool 1:** `[🏷️ Imprimer QR]` (batch thermal print modal).
  - **Tool 2:** `[🗄️ Assigner Casier]` (batch casier visual picker).
  - **Tool 3:** `[📸 Envoyer vers Shoot]` (batch photo queue).
  - **Toggle Expand Arrow:** `[➔]`.
- **Secondary Panel (Expanded state):**
  - **Back Button:** `[⬅]`.
  - **Tool 4:** `[⛺ Valise Festival]`.
  - **Tool 5:** `[📂 Catégorie]`.
  - **Tool 6:** `[🗑️ Supprimer]` with confirmation modal.

### 3.2 Backend API Contracts
In `apps/stupid-stock/server.py`:
- `POST /api/products/batch-shelf`
  - Payload: `{"skus": ["KM-SEP-001", "KM-BAG-005"], "shelf_coordinate": "LIL-A04"}`
  - Response: `{"status": "ok", "updated": 2}`
- `POST /api/products/batch-delete`
  - Payload: `{"skus": ["KM-SEP-001"]}`
  - Snapshot journal saved before deletion for undo rollback.
- `POST /api/products/batch-undo`
  - Payload: `{"action_id": "..."}`
  - Restores previous database snapshot.

---

## 4. Multi-Page Thermal Print Engine (`50×30mm`)

### 4.1 Page Break Layout
Replace single-label `position: fixed` CSS with a continuous multi-page thermal print queue:
```css
@media print {
  body * { visibility: hidden !important; }
  #thermal-batch-queue, #thermal-batch-queue * { visibility: visible !important; }
  #thermal-batch-queue {
    position: absolute !important;
    left: 0 !important; top: 0 !important;
    width: 50mm !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .thermal-label-page {
    width: 50mm !important;
    height: 30mm !important;
    page-break-after: always !important;
    break-after: page !important;
    box-sizing: border-box !important;
    padding: 2.5mm !important;
  }
}
```
User can select:
- **Mode A:** Print 1 label per distinct SKU.
- **Mode B:** Print 1 label per on-hand stock unit (e.g., 5 rings in stock = 5 labels).
