# The "Stupid Suite" — Design Decisions & Feature Innovation Ledger
*Document: Architecture Decisions & Field Insights Log*  
*Custodian: Head of Product & Engineering Orchestrator*  
*Origin: Workshop Iterations with Founder & Creative Director*

---

## 1. Purpose of this Document

This ledger captures all real-world requirements, edge cases, and architectural nuances uncovered during interactive UI/UX prototyping. It acts as the binding reference for all future backend and application development across the agent fleet (`@core-engine`, `@pixel-artisan`, `@shoot-vision`, `@channel-gateway`, `@money-intelligence`, `@break-tester`).

---

## 2. Core Architectural Decisions (ADR Register)

### ADR-01: Upstream Creation Decoupling
* **Context:** In artisanal luxury jewelry and fashion ateliers, a physical piece, concept, or sample is photographed and evaluated *before* it is formally cataloged with a price, SKU, or storage location.
* **Decision:** `Stupid Shoot` can shoot raw drafts and concept moodboards independently of `Stupid Stock`.
* **Data Flow:** Bidirectional (`Draft in Shoot` $\rightarrow$ `Mint in Stock` OR `Batch in Stock` $\rightarrow$ `Shoot`).

### ADR-02: Multi-Brand Partitioning & Consolidated Atelier View
* **Context:** The studio operates multiple in-house brands (*Kaya Movement*, *Sismique*) and client studio accounts (*BamBam*).
* **Decision:** Single local SQLite database (`serious_core.db`) partitioned by `brand_id`.
* **Behavior:** Selecting a brand in the left sidebar filters all channels (B2C, B2B, Raw Materials, Events, Collections), while `All Brands` provides a consolidated view of studio inventory and valuation.

### ADR-03: Multi-Brand Boutique Consignment (B2B Dépôt)
* **Context:** A single partner boutique (e.g. *Boutique Noir Marais* in Paris) frequently carries pieces from **multiple studio brands** simultaneously (*Kaya Movement* rings alongside *Sismique* apparel).
* **Decision:** Consignment allocation is tracked per SKU per partner boutique. Filtering a brand filters the piece breakdown inside the boutique, rather than hiding the boutique entirely if it carries that brand.

### ADR-04: Event & Festival Inventory Allocator (Replacing Generic POS)
* **Context:** Independent ateliers already use physical POS terminals (SumUp, Zettle, Square) or cash at market stalls and festivals. Building another generic cash register is low value.
* **Decision:** Replace the POS terminal with the **Event & Festival Stock Allocator**:
  1. **Event Containers:** Create named event suitcases (*Hellfest 2026*, *Boom Festival Portugal*, *Marché de Créateurs Lille*).
  2. **Inventory Locking:** Automatically decrements items from online B2C Shopify/Etsy stock between event start and end dates to eliminate weekend overselling.
  3. **Symmetric Conflict Detection:** If multiple simultaneous events require more units than total physical stock, raise symmetric warnings on **all involved events** (`10 / 14 real [Total demand: 16, Deficit: -2]`).
  4. **Post-Event Reconciliation:** Upon festival return, enter units sold; remaining pieces are automatically restored to the Lille/Bali warehouse stock.

### ADR-05: Bridge to Stupid Dispatch (Shelf Coordinates & Thermal QR Labels)
* **Context:** Physical inventory tracking requires knowing *exactly* where items are located (e.g. *Lille Hub — Casier A-04*, *Bali Atelier — Drawer 02*).
* **Decision:** Every SKU and variant maintains a `shelf_coordinate` attribute and generates a standard thermal QR barcode label (50x30mm) encoding `stupid://stock/{sku}/{bin_id}` for mobile phone scanning.

### ADR-06: Raw Materials Full Registry & Health Jauges
* **Context:** Raw materials (sterling silver casting grain, leather hides, titanium rods) require exact warehouse and shelf tracking, supplier source logging, and reservation per collection.
* **Decision:** Raw materials feature a visual health dashboard with threshold progress bars (Green = Safe, Red = Restock alert with 1-click supplier order trigger) coupled with a full detailed spreadsheet table.

### ADR-07: Docked Right Inspector Panel for Collections (Non-Blocking)
* **Context:** Pop-up modals blocking the entire screen disrupt inventory auditing.
* **Decision:** The collections hierarchy and facet filters are housed in a **docked right inspector panel** that pushes the table without blocking interaction, and filters strictly by the active brand.

### ADR-08: Dual-Mode Variant Architecture (Grouped vs Deconstructed)
* **Context:** Jewelry and apparel require sizing (T52, T54, T56) and material/color options (925 Silver, Raw Brass, Solid Gold).
* **Decision:** 
  1. **Grouped Mode (Default):** Parent model row with expandable chevron `[▶]` displaying child variant rows with dedicated SKU, stock count, shelf location, and margin. Mapped directly to Shopify/Etsy variant options (`Option 1: Metal`, `Option 2: Size`).
  2. **Deconstructed Mode:** Flattens every variant into independent unit rows for linear inventory counting.

### ADR-09: Dual-Mode Production Cost Engine
* **Context:** Studio clients alternate between wholesale resale (buying finished blanks) and custom fabrication (artisan forging).
* **Decision:**
  1. **Wholesale Buy-Resale Mode:** Direct purchase price from supplier $\rightarrow$ retail price $\rightarrow$ instant margin.
  2. **Fabrication BOM Mode:** Raw material weight (e.g. 14g Silver @ €0.85/g) + gemstone cost + artisan bench time. Updating raw metal spot price updates unit margins across all dependent models.

### ADR-10: Stock Movement Audit Log (Traçabilité)
* **Context:** Auditing who transferred pieces between Lille, Bali, festivals, and consignments.
* **Decision:** Chronological audit trail logging timestamp, delta (+/-), origin, destination, author, and linked document (e.g. Bon de Dépôt DEP-084).

### ADR-11: Shopify & Etsy Option Matrix Generation (Stupid Shop Bridge)
* **Context:** Creating products on Shopify or Etsy requires structured option sets (`Option 1: Size [52, 54, 56, 58]`, `Option 2: Material [Argent 925, Or, Laiton]`).
* **Decision:** The parent-variant relationship in Stupid Stock automatically compiles into ready-to-export Shopify Product & Variant schemas, eliminating repetitive data entry when publishing to Stupid Shop.

### ADR-12: Symmetric Multi-Event Deficit Badging
* **Context:** When multiple concurrent festivals (e.g. Hellfest and Marché de Lille) demand inventory, flagging only the second event causes confusion because both events contribute to the stock deficit.
* **Decision:** Symmetric conflict detection: all overlapping events allocate against physical available stock, showing real quantity held, aggregated demand across all simultaneous events, and the exact deficit badge (`10/14 real [Demand: 16, Deficit: -2]`).

### ADR-13: Universal Docked Right Inspector (Zero Modal Overlays)
* **Context:** Overlay pop-ups and full-screen drawers disrupt high-speed inventory editing by masking tables and preventing side-by-side contextual cross-checking.
* **Decision:** The docked right panel (`w-80` to `w-96`) becomes the single universal contextual inspector for the entire application, featuring 3 hot-swappable modes:
  1. **Collections & Filters View:** Brand-scoped taxonomy tree, subcategories, material facets, and collection creation.
  2. **Product Reference & Cost Editor:** Triggered when clicking any SKU row or "Ouvrir". Contains title, SKU, sizes/variants, wholesale buy/resale margin calculator, multi-hub bin allocations, and Shopify options matrix.
  3. **Product Ingestion & Creation Suite:** Dedicated onboarding drawer for new items without leaving the workspace.

### ADR-14: Four-Pillar Catalog Ingestion Pipeline
* **Context:** Independent jewelers and creators maintain heterogeneous workflows: some start by forging in an atelier, others drop unorganized photo folders on their desktop, others operate existing Shopify/Etsy stores, and others keep Excel/CSV stock sheets.
* **Decision:** Stupid Stock implements 4 native ingestion methods:
  1. **Native Atelier Creation (A to Z):** In-app form defining parent model, material specs, automated variant generator (e.g. ring sizes 50 to 60), initial workshop balances, and bin coordinates.
  2. **Folder Ingestion (Local File Watcher):** Dropping a folder of product photos (`/incoming_shoots/` or named subfolders like `KM-RNG-001 - Claw/`) automatically creates draft products, extracts tags, and attaches packshots.
  3. **CSV / Matrix Bulk Ingestion:** Upload standard CSV or Shopify export file with instant column mapping and validation preview.
  4. **Omnichannel Store Sync (Shopify GraphQL & Etsy v3):** Bidirectional live sync. Imports existing cloud products down to Stupid Stock or pushes local atelier creations up to online channels.

### ADR-15: Stupid Shoot 2x2 Packshot Architecture & Flowboard Nodal Hybridization
* **Context:** Luxury jewelry photography requires strict multi-angle optical consistency (upright front, 45° profile, macro detail, editorial on-body) rather than unpredictable fantasy renders. Furthermore, creators need both automated turnkey e-commerce packshots and granular nodal control (Flowboard) for complex bespoke campaign shots without cognitive clutter.
* **Decision:**
  1. **Strict 2x2 Contact Sheet:** Packshot studio operates on a 2x2 matrix (4 quadrants: Front Upright, 45° Angle Profile, Macro Hardware Detail, Editorial Worn). Output format: vertical 3:4 portrait, edge-to-edge full bleed, zero synthetic text.
  2. **Mandatory 3-Photo Reference Stack:** No generative hallucinations from blind prompts; each SKU requires 3 real physical reference photos (`Face`, `Angle 45°`, `Macro`) to guarantee geometric and gemological fidelity.
  3. **Canvas-Inspector Synchrony:** Clicking any quadrant in the central 2x2 grid dynamically updates the docked right inspector with tailored optical directives (focal length 85mm/100mm, lighting setup, cyclorama backdrop `#EFEFEF` / `#1A1A1A` / `#D97443`).
  4. **Studio Packshot vs Flowboard Nodal Switcher:** Seamless header toggle between turnkey 2x2 Packshot mode and advanced Flowboard nodal graph view (Input References $\rightarrow$ Lighting Rig $\rightarrow$ Slicer Engine) for unique hero images.
  5. **Sliding Multi-SKU Batch Runner:** Collapsible bottom drawer for multi-SKU queue orchestration connected to the local Google Flow Bridge on `http://localhost:8100`.
  6. **Bi-directional Stock $\leftrightarrow$ Shoot Interoperability:** Instant navigation between `Stupid Stock` and `Stupid Shoot` via URL parameters (`?sku=...`) and direct contextual triggers from products flagged with `⚠ Sans Photo`.

### ADR-16: Studio Shoot Product Lifecycle (Inline CRUD & 3-Slot Reference Binding)
* **Context:** In `Stupid Shoot`, creators frequently iterate on prototypes, add unreleased bench samples, replace defective reference angles, or remove decommissioned items from the batch queue without leaving the photo studio canvas.

### ADR-17: Stupid Stock Actionable Atelier Cockpit (Deprecating Passive Macro-KPIs)
* **Context:** The legacy dashboard displayed passive macro-KPIs ("Valeur Totale du Stock" and "Vélocité / Couverture en Jours") which offer zero immediate operational utility to an independent artisan/jeweler.
* **Decision:** Replace passive summary cards with a high-density, 6-card actionable cockpit combining **Action Bottlenecks** and **Omnichannel Logistics**:
  1. **Deadlock Atelier:** SKUs without inventory movement > 60 days (dormant capital, liquidation/remelt candidates).
  2. **Shoot Readiness:** Stock items awaiting primary packshot or Flow Bridge generation in `Stupid Shoot`.
  3. **Best-Sellers Imminent Stockout:** High-velocity pieces at critical thresholds ($\le 1$ unit).
  4. **Omnichannel Desynchronization & Conflicts:** Quantity mismatches between Shopify/Etsy and physical bin coordinates.
  5. **Thermal Print Queue:** Unlabeled physical items awaiting 50x30mm thermal QR stickers with 1-click batch execution.
  6. **Public Catalog Health:** Items with positive stock ($> 0$) currently stuck in unlisted/draft status or lacking public pricing.
* **Decision:**
  1. **Inline Product Actions:** The left sidebar product selector provides a persistent `[+ Nouveau]` button in its header and contextual `✏️` (Edit) and `🗑️` (Delete) triggers on every product row, with a matching `✏️ Éditer` shortcut in the top target badge and 3-slot reference stack.
  2. **Tactile Slide-over Shoot Product Manager:** A dedicated slide-over panel provides instant field manipulation (brand selector, SKU auto-suggester `⚡ Auto-SKU`, model title, jewelry category, and material specifications).
  3. **Visual Reference Stack Binding:** The modal enables individual inspection and re-upload of the 3 mandatory physical references (`Face Hero`, `Profil 45°`, `Macro Poinçon`) with real-time thumbnail binding to the 2x2 grid and prompt directives.
  4. **Safe Deletion & Immediate Focus Hand-off:** Deleting an item triggers a safety confirmation, purges it from the in-memory queue, and automatically delegates focus to the nearest remaining SKU to avoid UI desynchronization.

### ADR-17: Stupid Shop Channel Gateway & Anti-Censorship Semantic Shield
* **Context:** Alternative luxury, gothic, and avant-garde jewelry brands (Kaya Movement, Ask & Embla, Parts of Four) frequently experience severe algorithmic shadowbans, ad account suspensions, or product rejections by automated bots on Meta Ads, Google Merchant, Stripe, and Etsy. Flagged terms include anatomical keywords (*septum, piercings, fangs, teeth*), dark culture motifs (*unholy, grail, skull, vertebrae*), or utilitarian keywords (*knife, bondage, holster*). Furthermore, creators struggle with commission reconciliation across direct Shopify storefronts vs marketplace models (Etsy).
* **Decision:**
  1. **Omnichannel Store Gateway:** `Stupid Shop` (`stupid_shop_gateway.html`) acts as the single publishing portal connecting stock inventory and 2x2 sliced packshots directly to Shopify GraphQL and Etsy v3.
  2. **Anti-Censorship Semantic Shield:** Real-time text scanner that highlights bot-sensitive trigger words, assesses platform risk level, and suggests safe luxury/editorial alternatives (e.g. *septum* $\rightarrow$ *sculptural nasal adornment*, *fangs* $\rightarrow$ *contoured incisor curves*, *unholy* $\rightarrow$ *sacred obscure*) with 1-click substitution.
  3. **Brand Voice AI Presets:** Dynamic copywriting engine with specialized tonal profiles: *Cerebral Biomechanical* (Kaya), *Dark Romantic & Sacred* (Ask & Embla), and *Monolithic Brutalism* (Parts of Four).
  4. **Dual Marketplace P&L Simulator:** Live net margin calculator comparing direct Shopify processing fees (2.9% + €0.30) against Etsy marketplace commissions (6.5% transaction + 4% payment processing + €0.50 listing/handling) to identify optimal channel pricing.
  5. **Storefront Previews:** Instant toggle between Shopify Dawn/Studio theme presentation and Etsy marketplace listing card.

### ADR-18: Native SQLite Core & Zero-Lockin Design Token Architecture
* **Context:** The founder expressed concern that early UI decisions might get "carved in stone" during backend development, making future aesthetic pivots tedious or destructive. Simultaneously, early prototypes felt dense/cluttered ("un peu fouillis") due to testing all features simultaneously on a single view.
* **Decision:**
  1. **Strictly Decoupled Native Data Layer (`core/serious_core.db`):** 100% agnostic SQLite database with foreign keys, cascading triggers, and FTS5 full-text search. No ORM bloat; native Python `sqlite3` and `http.server` running on port 8200.
  2. **Zero-Lockin CSS Design Token Engine:** Surface colors, typography, borders, and corner radii are bound to CSS variables (`var(--bg-canvas)`, `var(--border-subtle)`, `var(--font-main)`).
  3. **Instant Aesthetic Presets from `✦ Design Inspiration Vault`:** Switching between *Linear Luxury Dark*, *Print-Tech-Paper* (warm cream `#F6F0E8`, hairline borders, mono coordinates), and *Dither-Mono* (1-bit tactile hardware) is achieved instantly via `data-theme` attribute swapping with zero business logic alterations.
  4. **Progressive Disclosure Navigation:** Replaced visual clutter with clean domain tabs (`Inventaire B2C & B2B`, `Dépôts Vente B2B`, `Festivals & Valises`, `Matières Premières`) and a contextual right docked inspector.

### ADR-19: Gateway Pulse Architecture, Universal Right Dock Rail & Strict Semantic Versioning
* **Context:** Static prototype mockups contained broken accordion toggles, placeholder emoji vignettes, duplicate DOM IDs in B2B partner cards, and an inspector isolated exclusively to B2C e-commerce. The founder mandated transitioning to a genuine dynamic web application styled after Design Vault entry `entry-1792936422493` ("Gateway Pulse") with formal semantic versioning.
* **Decision:**
  1. **Formal Version Tracking (`VERSION.json` & `VERSION_LOG.md`):** Every milestone stamped with semantic version (`v1.0.0-beta.1 - Gateway Pulse Atelier`), codename, and verifiable changelog.
  2. **Universal Right Dock Rail:** Replaced in-table inspector buttons with a persistent right-edge tool rail contracted to 36px with micro-icons (`⚡`, `📂`, `➕`, `🏷️`). It expands smoothly to a 380px drawer across all channels (B2C, B2B, Festivals, Raw Materials).
  3. **100% Dynamic SQLite Rendering (`app.js`):** Eliminated hardcoded mockup elements. Products, size variants, real photos, consignments, and raw materials render directly from SQLite `core/serious_core.db`.
  4. **Accordion & Grid Fixes:** Size variants (`▶`) expand dynamically on all multi-size pieces (`KM-SEP-001`, `KM-GLV-004`, `AE-RNG-003`, `P4-RNG-001`, `P4-BRC-002`). Vignettes grid displays real high-res photography.
  5. **B2B Duplicate ID Resolution:** Fixed duplicate `#b2b-card-berlin` IDs, enabling seamless interactive filtering of partner boutiques.

### ADR-20: Gateway Pulse Pure Atelier Architecture (Single Boutique Focus: Kaya Movement)
* **Context:** The founder mandated refocusing `Stupid Stock` exclusively on one simple, functional atelier boutique (Kaya Movement) with strict adherence to the **Gateway Pulse** visual brief (`entry-1792936422493` from the Design Inspiration Vault on port 4610).
* **Decision:**
  1. **Asymmetric Split Layout:** Fixed dark obsidian sidebar (240px wide, `#0F1117`) on the left, paired with a floating rounded white dashboard canvas (`rounded-3xl bg-white shadow-2xl border border-slate-200/60 p-7`) on a soft `#F8FAFC` background on the right.
  2. **Single Boutique Focus:** Dedicated entirely to Kaya Movement Atelier, eliminating multi-brand noise.
  3. **Master Suite Apps Rail:** Far-left sidebar anchors the 6 suite apps (`01. Stupid Stock` active, `02. Stupid Shoot`, `03. Stupid Shop`, `04. Content`, `05. Dispatch`, `06. Money`).
  4. **Gateway Pulse Hero Metric Bar:** Two summary cards: Card 1 with public stock valuation and an electric blue (`#3B82F6`) linear capacity progress bar; Card 2 with atelier autonomy days, margin percentage, and critical low stock alerts.
  5. **High-Density Data Table:** Alternating hover rows (`hover:bg-slate-50/80`), real jewelry photography, casier coordinates (`LIL-A04`), instant inline stock steppers (`[-]` `[+]`) with SQLite persistence, and pill status badges formatted as `px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset`.
  6. **Slide-Over SKU Inspector & Thermal QR:** Seamless 380px drawer for editing parameters, bound to an authentic 50x30mm thermal label generator.




