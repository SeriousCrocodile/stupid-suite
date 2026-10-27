# Stupid Stock — Version Log & Changelog
*Part of the Stupid Suite by Serious Studio*

---

## [1.5.0] — 2026-10-26
### Codename: Sprint 2: Multi-Axes Variations, Chromatic Swatches & 21st.dev Dynamic Bulk Toolbar
**UX Focus:** Résolution de PIN-004, déclinaisons multi-axes (joaillerie, maroquinerie, prêt-à-porter), pastilles chromatiques calibrées, dock d'actions en lot flottant inspiré de 21st.dev, et rollback transactionnel `Cmd+Z`.

#### 🎨 Pastilles Chromatiques Calibrées & Swatches Produits (PIN-004)
- **Palette d'Atelier Étendue :** Couleurs d'orfèvrerie (Argent 925, Or Jaune 18K, Or Rose, Noir Carbone, Titane, Bronze), maroquinerie (Cuir Noir, Havane, Saddle, Cognac, Chocolat, Végétal Naturel) et textile (Écru Naturel, Noir Anthracite, Vert Olive/Kaki, Indigo, Blanc Optique).
- **Affichage Compact sous le Titre :** Pastilles circulaires de 12px avec infobulle en direct (libellé + stock physique disponible).
- **Interaction au Clic :** Clic sur une pastille ouvre instantanément la fiche SKU ou la déclinaison correspondante.

#### 🎛️ Déclinaisons Multi-Axes & Isomorphisme Shopify (PIN-004)
- **Options Configurables :** Support de 1 à 3 axes configurables (`option1_value`, `option2_value`, `option3_value` associées au `options_config` du produit : Couleur, Taille, Gauge/Matière).
- **Formulaire Dynamique dans le Tiroir :** Adaptation automatique des champs d'entrée selon la configuration de la pièce (ex: gants et sacs en cuir avec couleur cuir + métal bouclerie + format sangle ; manteau kimono en lin avec teinte + taille atelier + tissage).

#### 🛸 Dock d'Actions en Lot Flottant (0xUrvish / 21st.dev)
- **Composant Animé en Bas d'Écran :** Barre flottante sombre avec effet de flou d'arrière-plan (`backdrop-blur-md`), apparaissant automatiquement dès qu'au moins une pièce est cochée.
- **Compteur & Désélection en 1 Clic :** Badge avec nombre d'éléments sélectionnés et touche `Échap` pour tout désélectionner.
- **Impression Thermique en Continu (50×30mm) :** Impression en un seul envoi de toutes les étiquettes QR sélectionnées sur rouleau thermique sans superposition de pages (`break-after: page`).
- **Affectation de Casier en Lot :** Sélection d'un bac physique dans le sélecteur visuel pour réassigner instantanément l'ensemble du lot sélectionné.
- **Pont Stupid Shoot en Lot :** Export immédiat des SKUs cochés vers l'atelier photo 2x2.
- **Panneau Dépliable (Bouton ➔ / ⬅) :** Allocation vers Valise Festival (Atelier éphémère) et suppression sécurisée en lot.

#### ↶ Suppression Réversible & Rollback Transactionnel (Cmd+Z)
- **Snapshot Architecture :** Toute suppression en lot sauvegarde un instantané complet des produits, variantes et niveaux d'inventaire côté serveur.
- **Restauration Immédiate :** Notification Sonner avec bouton `[↶ Annuler (Cmd+Z)]` et raccourci clavier global `Cmd+Z` permettant d'annuler une suppression par erreur en restaurant l'état exact.

---

## [1.4.0] — 2026-10-26
### Codename: Sprint 1: Offline Autonomy, 8-Pin Polish, Visual Casier Picker & 540px Modal Drawer
**UX Focus:** Résolution des 8 retours épinglés (Pins 002 à 009), autonomie 100% hors-ligne, compression brutale des assets et navigation atelier fluide.

#### ⚡ Autonomie 100% Hors-Ligne (Zero-CDN)
- **Rapatriement de Tailwind CSS :** Inclusion du moteur Tailwind autonome dans `public/vendor/tailwindcss.min.js`. Plus aucune dépendance envers `cdn.tailwindcss.com` — l'application fonctionne parfaitement sans connexion Internet (vols, stands, festivals).
- **Régime des Favicons (-99.6% de poids) :** Compression des 53,3 MB de favicons PNG bruts en images Retina 128px optimisées (total < 150 KB pour les 7 favicons).

#### 🧹 Nettoyage de la Barre Latérale & du Mini-Rail (PIN-002, PIN-007, PIN-009)
- **PIN-002 (Mini-Rail 64px) :** Suppression de l'icône loupe `🔍` redondante avec la recherche `(⌘K)`.
- **PIN-007 (Sidebar 224px) :** Suppression du bouton en doublon `Shoot Packshot (2x2)`.
- **PIN-009 (Sidebar 224px) :** Suppression du bouton en doublon `Export CSV Inventaire`.

#### 🗄️ Module Logistique & Sélecteur Visuel de Casier (PIN-005, PIN-006, PIN-008)
- **PIN-006 & PIN-008 :** Création d'une section dédiée **`CASIERS & LOGISTIQUE`** regroupant le plan du Hub Lille et l'impression d'étiquettes QR 50×30mm.
- **PIN-005 (Sélecteur Visuel au Clic) :** Clic sur un champ casier (produit ou variante) ouvre une grille d'étagères interactive (Tiroirs A à D, 32 bacs) permettant d'affecter un casier physique en 1 clic sans saisie aveugle au clavier.

#### 📐 Élargissement du Tiroir & Bascule en Modale Plein Format (PIN-003)
- **Largeur portée à 540px :** Passage de 420px à 540px pour un confort de lecture optimal des galeries photos et des déclinaisons.
- **Bouton de bascule `[⤢ Modal / ⤡ Tiroir]` :** Permet d'alterner en 1 clic entre le tiroir latéral classique et une grande modale centrée immersive (780px de large).

#### 🗺️ Télémétrie de Version & Roadmap des 5 Sprints
- **Bouton de version cliquable :** Le badge `v1.4.0` dans la barre latérale ouvre une modale à 2 onglets : Journal des versions interactif et Roadmap complète des 5 Sprints Agile issue du Google Doc.

---

## [1.3.10] — 2026-10-26
### Codename: Locked Header A, Centered Feedback Pill & Suite Favicons
**UX Focus:** Validation du Header A épuré, centrage ergonomique de la pilule et déploiement des 7 favicons

#### 💎 Verrouillage Définitif du Header A (Haute Joaillerie Épurée)
- **Choix figé en production :** Titre commercial en vedette (16px), micro-étiquette `FICHE ATELIER • Kaya Movement` avec point vert pulsant, pilule SKU éditable avec icône ✎ et puce dossier cliquable compacte.
- **Suppression des boutons de test :** Retrait du commutateur temporaire `[ A | B | C ]` pour une interface épurée sans distraction.

#### 💬 Pilule d'Annotation Recentrée & Compactée (Bottom-Middle)
- **Positionnement ergonomique :** Déplacement de la barre d'annotation en bas au centre (`bottom-4 left-1/2 -translate-x-1/2`).
- **Format ultra-compact :** Suppression du texte "Commenter", conservation exclusive de la bulle emoji `💬` (32x32px) et du compteur tactile d'épingles `📍 0`.

#### 🖼️ Déploiement des 7 Favicons Transparents
- **Stupid Stock :** Câblage de `/data/favicon/favicon_stupid_stock.png` dans `<head>` et route `/favicon.ico` directe.
- **Stupid Shoot :** Câblage de `/data/favicon/favicon_stupid_sheet.png`.
- **Stupid Shop :** Câblage de `/data/favicon/favicon_stupid_shop.png`.
- **Serious Studio :** Déploiement de `favicon_serious-studio.png` dans `perso/Serious-Studio/static/brand/favicon.png` et `favicon.ico`.

---

## [1.3.9] — 2026-10-26
### Codename: Atelier In-App Pin & Comment Inspector (Obsidian Live Sync)
**UX Focus:** Système d'annotation visuel in-app façon Vercel/Figma Toolbar avec synchronisation bidirectionnelle Obsidian

#### 🎯 Module d'Inspection Visuelle & Prise de Note Directe
- **Déclenchement clavier `C` ou pilule flottante :** Raccourci global touche `C` ou bouton tactile en bas à gauche (`💬 Commenter (C)`) activant le mode ciblage.
- **Survol haute précision :** Encadrement pointillé bleu électrique (`#inspector-hover-box`) suivant le curseur en temps réel avec badge d'identification de l'élément cible (`tag#id.class`).
- **Planté d'épingle au clic :** Clic sur n'importe quel élément fige les coordonnées et ouvre un mini-popover d'annotation ancré avec focus direct.
- **Capture automatique de contexte :** Injection sans effort du sélecteur DOM, du SKU le plus proche (ex: `KM-SEP-001`), de la catégorie (`Style/UI`, `Bug`, `Idée`, `Data`) et de la date.
- **Synchronisation immédiate dans l'Obsidian Vault :** 
  - Écriture d'une case à cocher dans `02_PRO/apps/stupid-suite-backlog.md` (`- [ ] **PIN-001**...`)
  - Notification dans `00_INBOX/Quick_Notes.md`
  - Persistance dans `apps/stupid-stock/data/atelier_feedback.json`
- **Résolution en 1 clic :** Clic sur une épingle existante permet de consulter la note et de la marquer résolue (`✓`), ce qui coche automatiquement la case dans Obsidian (`- [x] **PIN-001**`).
- **Affichage/Masquage des épingles :** Bouton `[📍 count]` dans la barre flottante pour masquer ou réafficher les pins sans encombrer la vue.

---

## [1.3.8] — 2026-10-26
### Codename: Uncropped Photo Lightbox & Dynamic Atelier Header Variations
**UX Focus:** Visionneuse grand format non tronquée et déclinaisons d'en-tête pour la fiche atelier

#### 🔍 Lightbox Photo 100% Non Tronquée
- **Agrandissement immersif :** Clic sur la photo d'aperçu du tiroir ouvre une modal plein écran sombre (`bg-slate-950/90 backdrop-blur-md`) affichant l'image entière sans rognage (`object-contain`, max 85vw x 72vh).
- **Navigation tactile et clavier :** Prise en charge des touches `Flèche Gauche`, `Flèche Droite` et `Échap` pour feuilleter les photos du produit ou fermer.
- **Bascule in-place dans le tiroir :** Bouton `↔ Remplir / ⛶ Réel` sur l'overlay de l'aperçu pour alterner sans quitter le tiroir entre mode recadré et format réel.
- **Filmstrip inférieur :** Défilement des vignettes miniatures en bas de la lightbox pour un repérage rapide.

#### 📐 3 Déclinaisons d'En-Tête Fiche Atelier
- **Variation A (Haute Joaillerie Épurée) :** Titre commercial mis en vedette (16px), SKU en pilule bleu satiné avec icône ✎ et puce dossier cliquable compacte.
- **Variation B (Passeport Industriel) :** Plaque métallique sombre à fort contraste pour le SKU, titre en dessous et barre terminal complète.
- **Variation C (Linear SaaS Power Lockup) :** SKU et Titre regroupés sur la même ligne, gain de 36px de hauteur verticale.
- **Sélecteur interactif direct :** Mini-commutateur `[ A | B | C ]` intégré dans le tiroir de l'application et prototype dédié sur `http://localhost:8200/drawer_header_variations.html`.

---

## [1.3.7] — 2026-10-26
### Codename: Transparent Alpha Favicon Suite (Rembg Batch)
**UX Focus:** Découpe automatique des 7 favicons de la suite avec contour noir pur

- **Découpe transparente 100% propre :** Détourage des 7 favicons d'applications avec le modèle Bria-RMBG 2.0 ONNX.
- **Suppression intégrale des franges grises :** Vérification rigoureuse des bords (RGB moyen < 35 sur les 4 contours).
- **Showcase de validation :** Studio comparatif multi-fonds sur `http://localhost:8200/favicon_showcase.html`.

---

## [1.3.6] — 2026-10-26
### Codename: Editable Drawer SKU & Minimalist Atelier Header
**UX Focus:** Saisie directe du SKU, simplification de la galerie et repositionnement de la puce dossier

#### 🏷️ SKU Modifiable dans la Fiche Atelier
- **Champ SKU éditable :** Le badge de SKU dans l'en-tête du tiroir latéral devient un champ éditable au clavier (`drawer-input-sku`) avec auto-sélection au focus.
- **Cascade SQLite & migration de dossier :** La modification du code SKU renomme en cascade toutes les tables liées (`variants`, `inventory_levels`, `product_photos`, `consignments`, etc.) et déplace automatiquement le dossier d'images physique sur disque (`data/sample_shops/<brand>/products/<new_sku>`).
- **Puce dossier repositionnée sous le SKU :** La puce indiquant le chemin de centralisation d'atelier (`📁 Dossier : data/...`) est remontée sous le SKU dans l'en-tête du tiroir, avec un bouton tactile `Copier` en 1 clic.
- **Galerie épurée :** Suppression du gros bouton bleu redondant et des options avancées. Seule la vignette `+ Ajouter` reste active dans le filmstrip pour déclencher l'upload natif Mac.

---

## [1.3.5] — 2026-10-26
### Codename: Multi-Photo Gallery & Horizontal Filmstrip Slider
**UX Focus:** Navigation visuelle multi-vues & gestion des packshots du tiroir produit

#### 📸 Galerie Multi-Photos & Thumbnail Filmstrip Slider
- **Slider horizontal de vignettes :** Positionnement d'un filmstrip de vignettes défilant directement sous la grande photo principale dans le tiroir d'inspection SKU.
- **Sélection interactive & halo bleu actif :** Clic sur n'importe quelle vignette permute instantanément la grande photo d'aperçu avec un indicateur d'accentuation bleu vif (`ring-2 ring-blue-500/30 border-blue-600 scale-102`).
- **Gestion du Packshot Principal :** Possibilité de définir n'importe quelle vue secondaire en tant que photo principale (`★ Définir principale`) avec persistance SQLite immédiate via `/api/products/<sku>/photos/set-primary`.
- **Bouton d'ajout rapide `[+]` intégré au slider :** Une carte `+ Ajouter` en fin de filmstrip permet d'ajouter directement une nouvelle photo depuis le Mac sans chercher d'autre bouton.
- **Badges compteurs multi-vues :** Affichage d'un badge compteur (ex: `2 vues` ou `2`) directement sur la miniature du tableau principal et sur les cartes de la vue vignettes.
- **Suppression unitaire :** Bouton corbeille discret pour retirer une vue obsolète de la base SQLite.

---

## [1.3.4] — 2026-10-26
### Codename: Click-to-Type Steppers & Centralized Asset Ingestion
**UX Focus:** Saisie ultra-rapide des quantités & centralisation automatique des fichiers photos de l'atelier

#### ⚡ Saisie Directe au Clavier sur les Steppers (Photos 1 & 2)
- **Chiffres cliquables et éditables :** Remplacement des `<span>` statiques par des champs `<input type="number">` transparents et intégrés sur la ligne produit, les cartes vignettes, l'accordéon des déclinaisons et le tiroir latéral.
- **Sélection automatique au focus :** Clic sur le nombre sélectionne immédiatement l'intégralité du texte (`onfocus="this.select()"`), permettant de saisir directement un nouveau stock (ex: taper `24`) sans devoir effacer l'ancien chiffre au préalable.
- **Validation fluide :** Touche `Entrée` ou perte de focus (`blur`) persiste instantanément la valeur dans la base SQLite locale (`inventory_levels`).
- **Conservation des boutons tactiles `[-]` et `[+]` :** Incrément/décrément unitaire préservé avec retour visuel immédiat (0ms de latence) sans saccade d'écran.
- **Suppression des flèches natives de navigateur :** Règle CSS `.stepper-input` neutralisant l'affichage disgracieux des doubles flèches par défaut de Chrome/Safari/Firefox.

#### 📁 Rapatriement Automatique & Centralisé des Images (Photo 3)
- **Bouton natif "Parcourir les fichiers" :** Remplacement de la saisie manuelle de chemin par un bouton pro `📁 Parcourir les fichiers (depuis votre Mac)...` ouvrant le sélecteur natif macOS.
- **Dossier centralisé unique :** Tout fichier image uploadé est automatiquement copié et rapatrié dans le dossier canonique de la marque et du produit :
  `data/sample_shops/kaya_movement/products/<sku>/images/photo_<timestamp>.<ext>`
- **Création automatique de l'arborescence :** `mkdir(parents=True, exist_ok=True)` crée automatiquement les dossiers s'il s'agit d'un nouveau produit ou d'une nouvelle marque.
- **Liaison SQLite automatique :** Création immédiate de l'entrée dans la table `product_photos` avec `is_primary = 1` et mise à jour de `products.has_photos = 1`.
- **Indicateur de destination visible :** Affichage clair du chemin de rapatriement dans le tiroir d'inspection produit pour une transparence totale de l'atelier.

---

## [1.3.3] — 2026-10-26
### Codename: Interactive Variations Chevron & Clean Actions
**UX Focus:** Ergonomie des déclinaisons & fluidité de navigation atelier

#### 🚀 Déplacement du Déclencheur de Variations
- **Flèche/Chevron interactif à côté de la photo :** La commande d'expansion est maintenant un chevron SVG épuré placé directement à gauche de la vignette photo.
- **Statut dynamique Droite ➔ Bas :** La flèche pointe vers la droite (`›`) lorsque les variations sont repliées, et pivote fluidement à 90° vers le bas (`⌄`) lorsqu'elle est active (`rotate-90 text-blue-600 bg-blue-50`).
- **Épuration de la colonne Actions :** Suppression définitive du bouton textuel `▲ Tailles / ▼ Tailles`. La colonne de droite ne contient plus que le duo net `[✏️ Fiche]` et `[🏷️ Étiquette]`.
- **Généralisation des variations :** Prise en compte de toutes les déclinaisons d'atelier (tailles, diamètres, finitions, jauges, coloris).

---

## [1.3.2] — 2026-10-26
### Codename: Stripe Unified Telemetry Header
**Selection:** Choix validé par le fondateur (Concept C) pour l'agencement de l'en-tête.

#### 🚀 Améliorations de l'En-tête Concept C
- **Adoption définitive du Concept C :** Structure unifiée avec titre net `Atelier Stock & Piercing` et badge `Kaya Movement`.
- **Puces télémétriques dynamiques :** 3 puces au format monospace (`[5 Modèles]`, `[Hub Lille Central]`, `[Marge 76.0%]`) connectées dynamiquement aux calculs SQLite de `updateMetrics()`.
- **Cartographie Interactive des Casiers Hub Lille :** Clic sur *Casiers Hub Lille* ouvre désormais la modale de cartographie des 4 tiroirs d'atelier (`LIL-A`, `LIL-B`, `LIL-C`, `LIL-D`) avec pièces affectées, stocks physiques et filtrage direct en 1 clic.
- **Barre d'actions groupée :** Champ de recherche propre (`w-48 sm:w-56`) avec raccourci `⌘K`, bascule de vue `[≡] [⊞]`, bouton `[📥 Export CSV]` et bouton primaire `[+ Nouveau SKU]`.
- **Zéro encombrement dev :** Retrait du bandeau de test temporaire pour une interface de production pure.

---

## [1.3.1] — 2026-10-26
### Codename: Gateway Pulse Production Atelier Engine
**Reference:** User Layout & UI/UX Audit (`STUPID_STOCK_FULL_AUDIT_AND_ROADMAP.md`)

#### 🚀 Layout, Table & Responsiveness Fixes
- **Strict `table-fixed` Geometry:** Implemented `<colgroup>` with explicit pixel widths (`w-14`, `w-64`, `w-36`, `w-28`, `w-36`, `w-28`, `w-28`, `w-28`, `w-44`) inside `overflow-x-auto min-w-[980px]`. Eliminates all table shaking, cell wrapping, and column drift during filtering and size accordion toggles.
- **Dual-Rail Viewport Anchoring:** `w-16 shrink-0` on Mini-Rail and `w-56 shrink-0` on App Menu. Enforced `flex-1 min-w-0 overflow-hidden` on main canvas to ensure sidebars never compress or push off-screen.
- **Interactive Sorting Engine:** Added clickable sorting headers on Product Title, Category, Casier, Stock, Public Price, and Atelier Cost with dynamic `▲`/`▼`/`⇅` indicators.
- **Sonner-Style Floating Toast Stack:** Minimalist non-blocking toast notifications positioned at bottom-right (`#toast-container`) providing instant physical feedback on stock changes, SKU creations, and saves.
- **Dedicated `@media print` Thermal Sticker CSS:** Direct browser print (`window.print()`) now isolates **only** the 50x30mm thermal label, hiding browser chrome, dark sidebars, and overlays, with `@page { size: 50mm 30mm; margin: 0; }`.
- **Keyboard Power Shortcuts:** `⌘K` or `/` to focus search, `N` for new SKU creation, `Esc` to close modals/drawer, `E` to trigger CSV export.

#### ⚙️ Complete CRUD & SQLite Persistence
- **Product Deletion with Safeguard:** Drawer includes a deletion action hooked to a confirmation modal, performing full SQLite cascade deletion.
- **Variant Management inside Drawer:** Added an interactive variant editor to view, add (`+ Nouvelle Déclinaison`), and delete individual sizes and casier bins.
- **Two-Way Stock Recalculation:** Variant stock updates now synchronize both `variants.stock` and `inventory_levels` while dynamically updating the parent product's physical stock.
- **Photo Binding:** Attached packshot image paths directly from the drawer or linked to `Stupid Shoot` (`port 8100`).
- **CSV Atelier Export:** `GET /api/export/csv` generates clean RFC-4180 CSV with UTF-8 BOM for French spreadsheet tools.

---

## [1.2.1-beta.1] — 2026-10-25
### Codename: Gateway Pulse Dual-Rail Architecture
**Design Reference:** Capture d'écran utilisateur & Design Vault `entry-1792936422493`

#### 🚀 Dual-Rail Architecture Upgrades
- **Mini-Rail tout à gauche (64px, `#0B0C10`) :**
  - Badge logo carré arrondi `S` (Serious Studio).
  - Raccourci recherche rapide (`🔍`).
  - Colonne verticale des 6 applications de la suite avec indicateur actif latéral bleu (`#3B82F6`) sur `📦 01. Stupid Stock`.
  - Statut système et avatar atelier en bas.
- **Panneau de Navigation Application Stupid Stock (224px, `#0F1117`) :**
  - En-tête : Titre `Stupid Stock` avec badge `v1.2` et sous-titre `Kaya Movement Atelier`.
  - Section *CORE ATELIER* : `Vue d'ensemble`, `Alertes Seuil (≤ 2)`, `À photographier`, `Casiers Hub Lille`.
  - Section *OUTILS & ACTIONS* : `Étiquettes QR (50x30)`, `Shoot Packshot (2x2)`, `Audit SQLite`.
- **Canevas Blanc Flottant Préservé :**
  - Carte `rounded-3xl` sur fond `#F8FAFC`, les 2 cartes de synthèse héro, le tableau avec alternance de survol et le tiroir inspecteur.

---

## [1.2.0-beta.1] — 2026-10-25
### Codename: Gateway Pulse Pure Atelier (Single Boutique Focus: Kaya Movement)
**Design Vault Reference:** `entry-1792936422493` (*Gateway Pulse* — dark obsidian sidebar x clean-canvas data dashboard)

#### 🚀 Graphic & Architectural Upgrades (100% Faithful to Vault Brief)
- **Asymmetric Split Layout:** Fixed dark obsidian sidebar (240px wide, `#0F1117`) on the left and a floating rounded white dashboard canvas (`rounded-3xl bg-white shadow-2xl border border-slate-200/60 p-7`) on a soft `#F8FAFC` background on the right.
- **Single Boutique Focus:** Dedicated 100% to **Kaya Movement** atelier inventory (Bali & Lille Casier Hub), eliminating distracting multi-brand channel tabs.
- **Suite Apps Left Rail:** Left sidebar embeds the 6 Stupid Suite applications (📦 `01. Stupid Stock` active, 📸 `02. Stupid Shoot`, 🛍️ `03. Stupid Shop`, 📑 `04. Stupid Content`, 🚚 `05. Stupid Dispatch`, 💰 `06. Stupid Money`).
- **Gateway Pulse Hero Metric Bar:** Two summary cards:
  1. *Total Stock Valuation & Capacity:* Total public value (`€14,820 EUR`), 248 physical units, and an electric blue (`#3B82F6`) linear capacity progress bar (`84% occupée`).
  2. *Atelier Velocity & Telemetry:* 34 days of estimated autonomy, micro-trend badge (`🟢 +12% ce mois`), average gross margin (`74.1%`), and critical stock alerts.
- **High-Density Data Table:** Alternating hover rows (`hover:bg-slate-50/80`), real product photography, JetBrains Mono SKU badges (`KM-SEP-001`), casier atelier bin coordinates (`LIL-A04`), retail & cost prices, and pill status badges formatted as `px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset`.
- **Instant Stock Stepper:** Inline `[-]` and `[+]` buttons with instant SQLite persistence on `POST /api/products/<sku>/stock`.
- **Variant Accordion:** `▼ Tailles` expands size variants with individual casier bins and stock levels.
- **Slide-Over SKU Inspector:** Smooth 380px drawer with direct editing of title, casier coordinate, retail price, cost price, and stock, with instant SQLite persistence.
- **Authentic Thermal QR Label Modal:** 50x30mm black & white sticker modal with 1-click print.

---

## [1.0.0-beta.1] — 2026-10-25
### Codename: Gateway Pulse Prototype Transition
- Transition from static prototype to initial dynamic REST endpoints.
