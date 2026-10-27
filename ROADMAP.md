# The "Stupid Suite" — Master Roadmap & Milestones

---

## 🧭 Milestone Progress Matrix (Lavish Visual Format)

| Visual Status | Milestone | Target Deliverable | Exit Criteria |
| :---: | :--- | :--- | :--- |
| 🟢 `[DONE]` | **Milestone 0.1: Architecture & Project Structure** | Locked official spec, multi-agent directive, directory skeleton, schema contracts. | All documentation, agent markdown roles, and directory trees committed. |
| 🟡 **`[ACTIVE]`** | **Milestone 0.2: UI/UX Direction Bake-Off & Atelier Cockpit** | Side-by-side interactive prototype comparing **Modernized Win98** vs **Google Workspace Minimal**, and spec of the new 6-card actionable Atelier Cockpit for Stupid Stock. | Founder selects visual direction or hybrid tokens; Cockpit metrics validated. |
| ⚪ `[QUEUED]` | **Milestone 1.0: Serious Core & Data Schemas** | SQLite schema & JSON contracts for `product_draft`, `product_sku`, and `shoot_job`. | Schema validation passes with bidirectional draft/SKU conversion. |
| ⚪ `[QUEUED]` | **Milestone 1.2: Stupid Stock Cockpit & Inventory Engine** | Replace passive valuation/velocity cards with the 6 actionable widgets (Action Board + Omnichannel), high-density spreadsheet UI with 3-tier inventory tabs. | 6 actionable cards live in hero bar, inline keyboard editing, multi-location filter, net margin calculation. |
| ⚪ `[QUEUED]` | **Milestone 2.0: Stupid Shop & Semantic Shield** | Shopify GraphQL & Etsy v3 connectors with anti-censorship copywriting shield. | One-click draft listing export with verified tags and safe terms. |
| ⚪ `[QUEUED]` | **Milestone 2.1: Stupid Content Lookbook Engine** | Social carousel builder (4:5, 9:16) and B2B wholesale PDF catalog compiler. | Clean vector PDF export from local asset paths. |
| ⚪ `[QUEUED]` | **Milestone 3.0: Stupid Dispatch QR Hub** | Thermal QR label generation, morning packing list, mobile camera scan-to-verify. | Zero admin access required for field helpers; instant Shopify tracking update. |
| ⚪ `[QUEUED]` | **Milestone 3.1: Stupid Money OCR Ingestion** | Gemini Vision receipt parser, fiscal category tagging, annual P&L calculator. | Instant extraction of amount, supplier, and VAT from receipt photos. |
| ⚪ `[QUEUED]` | **Milestone 4.0: Desktop Packaging & Commercial Pass** | Standalone desktop distribution with local database installer & **Animated Video Splash Launcher**. | Single-click installable app bundle on macOS with 150KB ultra-light video boot screen (`assets/media/splashscreen/`). |

---

## ⚡ Active Focus Details

- **Current Milestone:** `Milestone 0.2: UI/UX Direction Bake-Off` & `Atelier Ergonomics Polish`
- **Active Friction Ledger:** See [`02_PRO/apps/stupid-suite-backlog.md`](file:///Users/seriouscrocodile/Documents/Obsidian%20Vault/02_PRO/apps/stupid-suite-backlog.md) (6 initial friction items + In-App Pin & Comment Inspector).
- **Stupid Stock Dashboard Redesign (Hybrid Actionable Cockpit):**
  - Deprecating passive metrics ("Valeur Totale du Stock", "Vélocité & Couverture en Jours").
  - Adopting the 6 actionable modules combining **Proposition 1 (Action Board & Bottlenecks)** and **Proposition 3 (Omnichannel & Synchro)**:
    1. **Deadlock Atelier :** SKUs dormant without movement > 60 days (dormant capital, liquidation/remelt candidates).
    2. **Shoot Readiness :** Items missing packshots / pending AI generation in Stupid Shoot.
    3. **Best-Sellers Low Stock Alert :** High-velocity pieces at critical thresholds (≤ 1 unit).
    4. **Stock Sync & Conflicts :** Discrepancies between Shopify/Etsy and physical shelf bins.
    5. **Thermal Print Queue :** Physical pieces awaiting 50x30mm QR labels with 1-click batch print trigger.
    6. **Public Catalog Health :** Active stock > 0 items missing pricing, descriptions, or draft state warnings.
- **Next Physical Action (< 2 min):** Ouvrir et tester le prototype interactif comparatif dans le navigateur (`prototypes/design-exploration/ui_direction_comparison.html`).
