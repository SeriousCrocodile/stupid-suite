# Stupid Shoot — AI Visual Studio & Flowboard

---

## 1. Core Purpose
`Stupid Shoot` turns raw artisanal pieces and initial product sketches into high-end luxury e-commerce visuals without booking expensive models or studio spaces.

---

## 2. Upstream Decoupling & Workflow
- **Concept Mode (Upstream):** Shoot and generate contact sheets for raw ideas, uncatalogued pieces, or moodboards before assigning any SKU or price.
- **Catalog Mode (Downstream):** Ingest items flagged as "needs photos" from `Stupid Stock`, automatically applying material and dimension directives.
- **Local Flow Bridge:** Communicates with `http://localhost:8100` (`~/Serious-AI/perso/flow-tools-dev`) to drive Google Flow without third-party GPU costs.
- **Automated Slicing:** Executes `slicer.py` locally to crop 3x3 grids into 9 individual 2048x2048 high-definition square packshots.
- **Future Flowboard Module:** Visual canvas to drag-and-drop reference bubbles, connect nodes, and generate variations interactively.
