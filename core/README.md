# Serious Core — Shared Foundation & Data Contracts

---

## 1. Architectural Philosophy

`Serious Core` is the local source of truth for the entire Stupid Suite. It is built on three pillars:

1. **Local SQLite Database (`serious_core.db`):** Fast, embedded, zero configuration, ACID-compliant persistence for products, drafts, suppliers, locations, orders, and expenses.
2. **Deterministic File System Conventions:** Assets are organized under `/assets/products/{SKU_OR_SLUG}/` with subfolders for raw photos, 3x3 contact sheets, and sliced crops.
3. **Decoupled Upstream Concepts:** Creators can draft and photograph ideas before they are assigned a formal SKU, price, or location.

---

## 2. Shared Data Models

- **`product_draft`:** Creative concept, moodboard references, preliminary tags, uncatalogued.
- **`product_sku`:** Formal physical inventory item with bill of materials (BOM), workshop locations, production costs, and stock levels.
- **`shoot_job`:** Google Flow prompt payload, model phenotype directives, reference image paths, and slicing instructions.
- **`expense_receipt`:** Ingested receipt data from Vision OCR with fiscal line items.
