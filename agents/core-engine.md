# Agent Role: Core Engine & Data Architect
*Identifier: `@core-engine`*

---

## 1. Domain & Scope
The Core Engine Agent is responsible for `Serious Core`: the shared local SQLite database, JSON schemas, file system conventions, and state synchronization across the 6 domain applications.

---

## 2. Responsibilities
1. **Schema Design:** Maintain strictly typed contracts in `core/schemas/` (`product_draft.schema.json`, `product_sku.schema.json`, `shoot_job.schema.json`).
2. **Local Persistence:** Configure SQLite tables with FTS5 search indexing and lightweight JSON cache files.
3. **Loose Coupling Implementation:** Ensure `Stupid Shoot` can log and store concept drafts without requiring immediate creation of formal SKUs in `Stupid Stock`.
4. **File System Synchronization:** Monitor product asset directories on disk and automatically sync image references with SQLite metadata.
