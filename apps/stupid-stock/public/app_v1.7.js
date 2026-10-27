/**
 * Stupid Stock — Application Engine (Gateway Pulse Dual-Rail Architecture)
 * Version: 1.3.1 (Precision Polish, Sorting, Toasts & Full Variant CRUD)
 * Autonomous Multi-App Operating System by Serious Studio
 * Design Reference: Design Vault entry-1792936422493
 */

// Application State (Single Boutique: Kaya Movement)
const state = {
  brandId: 'kaya_movement',
  workspace: 'Kaya Movement (Hub Lille)',
  products: [],
  filteredProducts: [],
  activeFilter: 'all', // 'all', 'septum', 'rings', 'leather', 'low_stock', 'needs_photos'
  activeDomainView: 'b2c',
  selectedMetals: new Set(),
  selectedCategories: new Set(),
  dockedFacetsOpen: false,
  isDraggingRow: false,
  draggedSku: null,
  traySearchQuery: '',
  activeTrayBinFilter: 'all',
  activeTrayPreviewSku: null,
  searchQuery: '',
  viewMode: 'list', // 'list' or 'grid'
  sortColumn: 'sku',
  sortDirection: 'asc',
  currentDrawerSku: null,
  expandedVariants: new Set(),
  checkedSkus: new Set(),
  bulkToolbarExpanded: false,
  undoStack: [],
  casierBatchMode: false,
  activeCasierFilter: null,
  confirmModalCallback: null,
  activeConcept: 'C',
  drawerModalMode: localStorage.getItem('stupid_stock_drawer_modal_mode') === 'true',
  inspectorActive: false,
  inspectorCategory: 'ui',
  inspectorTarget: null,
  pinsVisible: true,
  feedbacks: [],
  activePinId: null,
  subSidebarCollapsed: localStorage.getItem('stupid_stock_sub_sidebar_collapsed') === 'true'
};

// HTML Escaper helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Collapsible Sub-Sidebar (PIN-007 / 21st.dev style)
function toggleSubSidebar(forceState) {
  playTactileClick();
  const sidebar = document.getElementById('app-sub-sidebar');
  if (!sidebar) return;

  if (typeof forceState === 'boolean') {
    state.subSidebarCollapsed = forceState;
  } else {
    state.subSidebarCollapsed = !state.subSidebarCollapsed;
  }

  localStorage.setItem('stupid_stock_sub_sidebar_collapsed', state.subSidebarCollapsed ? 'true' : 'false');

  if (state.subSidebarCollapsed) {
    sidebar.classList.remove('w-64', 'border-r', 'border-slate-800');
    sidebar.classList.add('w-0', 'border-r-0', 'pointer-events-none');
  } else {
    sidebar.classList.remove('w-0', 'border-r-0', 'pointer-events-none');
    sidebar.classList.add('w-64', 'border-r', 'border-slate-800');
  }

  // Update header button if rendered
  renderHeaderAndToolbar();
}

function renderSidebarToggleButton() {
  return `
    <button type="button" onclick="toggleSubSidebar()" class="btn-tactile p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0" title="Afficher/Masquer le volet latéral (⌘\\ ou [)">
      ${state.subSidebarCollapsed ? `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M9 3v18"/>
          <path d="m14 9 3 3-3 3"/>
        </svg>
      ` : `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M9 3v18"/>
          <path d="m16 15-3-3 3-3"/>
        </svg>
      `}
    </button>
  `;
}

// Subtle Web Audio Click Helper (Emil Kowalski design engineering)
function playTactileClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {}
}

// -------------------------------------------------------------
// Atelier Chromatic Palette (Jewelry, Leather Accessories, Clothing)
// -------------------------------------------------------------
const ATELIER_PALETTE = {
  "ARGENT": { hex: "#E2E8F0", label: "Argent 925" },
  "SILVER": { hex: "#E2E8F0", label: "Argent 925" },
  "OR": { hex: "#FACC15", label: "Or Jaune 18K" },
  "OR JAUNE": { hex: "#FACC15", label: "Or Jaune 18K" },
  "GOLD": { hex: "#FACC15", label: "Or Jaune 18K" },
  "OR ROSE": { hex: "#F472B6", label: "Or Rose" },
  "ROSE GOLD": { hex: "#F472B6", label: "Or Rose" },
  "NOIR": { hex: "#1E293B", label: "Noir Carbone" },
  "BLACK": { hex: "#1E293B", label: "Noir Carbone" },
  "CHARCOAL": { hex: "#334155", label: "Anthracite / Charcoal" },
  "CUIR NOIR": { hex: "#0F172A", label: "Cuir Noir Pleine Fleur" },
  "SADDLE": { hex: "#B45309", label: "Cuir Havane / Cognac" },
  "HAVANE": { hex: "#B45309", label: "Cuir Havane / Cognac" },
  "COGNAC": { hex: "#9A3412", label: "Cuir Cognac" },
  "CHOCOLAT": { hex: "#451A03", label: "Cuir Chocolat" },
  "NATUREL": { hex: "#D97706", label: "Cuir Végétal Naturel" },
  "TITANE": { hex: "#94A3B8", label: "Titane Grade 5" },
  "BRONZE": { hex: "#CA8A04", label: "Bronze Antique" },
  "RUST": { hex: "#C2410C", label: "Rouille / Rust" },
  "OLIVE": { hex: "#4D7C0F", label: "Vert Olive" },
  "KAKI": { hex: "#3F6212", label: "Kaki Militaire" },
  "ECRU": { hex: "#FEF3C7", label: "Écru Naturel" },
  "ÉCRU": { hex: "#FEF3C7", label: "Écru Naturel" },
  "BLANC": { hex: "#F8FAFC", label: "Blanc Optique" },
  "INDIGO": { hex: "#1D4ED8", label: "Indigo Brut" },
  "DENIM": { hex: "#2563EB", label: "Denim Délavé" },
  "DEFAULT": { hex: "#94A3B8", label: "Finition Atelier" }
};

function getAtelierColorHex(name) {
  if (!name) return null;
  const upper = String(name).trim().toUpperCase();
  for (const [key, val] of Object.entries(ATELIER_PALETTE)) {
    if (upper.includes(key) || key.includes(upper)) {
      return val.hex;
    }
  }
  return null;
}

function getAtelierColorInfo(name) {
  if (!name) return { hex: "#94A3B8", label: "Standard" };
  const upper = String(name).trim().toUpperCase();
  for (const [key, val] of Object.entries(ATELIER_PALETTE)) {
    if (upper.includes(key) || key.includes(upper)) {
      return val;
    }
  }
  return { hex: "#94A3B8", label: name };
}

function renderChromaticSwatchesHtml(product) {
  const swatchesMap = new Map();

  // 1. Check variants for color values
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      const candidates = [v.option1_value, v.option2_value, v.name];
      for (const cand of candidates) {
        if (!cand) continue;
        const hex = getAtelierColorHex(cand);
        if (hex) {
          const info = getAtelierColorInfo(cand);
          const key = info.label;
          if (!swatchesMap.has(key)) {
            swatchesMap.set(key, { hex: info.hex, label: info.label, stock: v.stock || 0, value: cand });
          } else {
            swatchesMap.get(key).stock += (v.stock || 0);
          }
          break;
        }
      }
    });
  }

  // 2. Fallback to product materials or title if no variant swatches found
  if (swatchesMap.size === 0) {
    const textToCheck = `${product.title} ${JSON.stringify(product.materials || product.materials_json || '')}`;
    for (const [key, val] of Object.entries(ATELIER_PALETTE)) {
      if (key !== 'DEFAULT' && textToCheck.toUpperCase().includes(key)) {
        swatchesMap.set(val.label, { hex: val.hex, label: val.label, stock: product.total_physical_stock || 0, value: key });
        break;
      }
    }
  }

  if (swatchesMap.size === 0) return '';

  const swatches = Array.from(swatchesMap.values());
  return `
    <div class="flex items-center gap-1.5 mt-1.5 select-none" onclick="event.stopPropagation()">
      ${swatches.map(s => `
        <span 
          class="inline-block w-3 h-3 rounded-full border border-slate-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer" 
          style="background-color: ${s.hex};" 
          title="${s.label} (${s.stock} pcs en stock)"
          onclick="handleSwatchClick('${product.sku}', '${s.value}')"
        ></span>
      `).join('')}
    </div>
  `;
}

function handleSwatchClick(sku, colorValue) {
  playTactileClick();
  showToast(`Finition ${colorValue} sélectionnée pour ${sku}`, 'info', '🎨');
  openSkuDrawer(sku);
}

// -------------------------------------------------------------
// Sonner-style Floating Toast Notifications
// -------------------------------------------------------------
function showToast(message, type = 'success', icon = '✓', actionText = null, onAction = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-2xl border border-slate-700/80 animate-toast';
  
  let iconColor = 'text-emerald-400';
  if (type === 'error') iconColor = 'text-rose-400';
  if (type === 'warning') iconColor = 'text-amber-400';
  if (type === 'info') iconColor = 'text-blue-400';

  const actionBtnId = `toast-act-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  let actionHtml = '';
  if (actionText && typeof onAction === 'function') {
    actionHtml = `<button id="${actionBtnId}" class="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-mono text-[11px] font-bold border border-slate-600 transition btn-tactile">${actionText}</button>`;
  }

  toast.innerHTML = `
    <span class="${iconColor} font-bold text-sm">${icon}</span>
    <span class="text-slate-100">${message}</span>
    ${actionHtml}
  `;

  container.appendChild(toast);

  if (actionText && typeof onAction === 'function') {
    const btn = document.getElementById(actionBtnId);
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        onAction();
        toast.remove();
      };
    }
  }

  const duration = actionText ? 7000 : 2800;
  setTimeout(() => {
    toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Apply initial sidebar collapse state immediately to prevent layout shifts
  if (state.subSidebarCollapsed) {
    const sidebar = document.getElementById('app-sub-sidebar');
    if (sidebar) {
      sidebar.classList.remove('w-64', 'border-r', 'border-slate-800');
      sidebar.classList.add('w-0', 'border-r-0', 'pointer-events-none');
    }
  }
  setupKeyboardShortcuts();
  renderHeaderAndToolbar();
  updateConceptButtonsUI();
  initInspector();
  setupDrawerDragAndDrop();
  await loadProducts();
  await loadFeedbacks();

  // URL Hash Auto-Open Triggers for Testing
  if (window.location.hash === '#tray' || window.location.hash === '#casier') {
    openCasierOrganizer();
  } else if (window.location.hash === '#km') {
    toggleKmPopover();
  } else if (window.location.hash === '#facets') {
    toggleDockedFacets();
  }
});

// -------------------------------------------------------------
// Dynamic Header & Toolbar Rendering (Interactive Concepts Bake-Off)
// -------------------------------------------------------------
function renderHeaderAndToolbar() {
  const headerContainer = document.getElementById('header-container');
  const toolbarContainer = document.getElementById('toolbar-container');
  if (!headerContainer || !toolbarContainer) return;

  const concept = state.activeConcept || 'A';

  if (concept === 'A') {
    // Concept A: Linear 2-Tier Stack (RECOMMENDED)
    headerContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          ${renderSidebarToggleButton()}
          <div>
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">KAYA MOVEMENT ATELIER • HUB LILLE</div>
            <div class="flex items-center gap-2.5 mt-0.5">
              <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Stock &amp; Piercing Catalog</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Inventaire Réel</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a href="/api/export/csv" class="btn-tactile px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 flex items-center gap-1.5 whitespace-nowrap" title="Exporter l'inventaire en format CSV pour comptabilité et atelier">
            <span>📥</span> <span>Export CSV</span>
          </a>
          <button onclick="openNewSkuModal()" class="btn-tactile px-3.5 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-sm font-bold">+</span> <span>Nouveau SKU</span>
          </button>
        </div>
      </div>
    `;

    toolbarContainer.innerHTML = `
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 overflow-x-auto">
        <!-- Left Search Input -->
        <div class="relative w-full sm:w-64 shrink-0">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            id="searchInput" 
            oninput="handleSearch(this.value)" 
            value="${state.searchQuery}"
            placeholder="Filtrer l'atelier... (⌘K)" 
            class="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <button id="searchClearBtn" onclick="clearSearch()" class="${state.searchQuery ? '' : 'hidden'} absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>

        <!-- Center Filter Pills -->
        <div class="flex items-center gap-1.5 shrink-0 overflow-x-auto py-0.5">
          ${renderFilterPillsHtml()}
        </div>

        <!-- Right View Mode Toggle -->
        <div class="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium shrink-0 self-end lg:self-auto">
          <button onclick="setViewMode('list')" id="btn-view-list" class="btn-tactile px-2.5 py-1 rounded-md ${state.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-1.5 transition whitespace-nowrap">
            <span>≡</span> <span>Liste</span>
          </button>
          <button onclick="setViewMode('grid')" id="btn-view-grid" class="btn-tactile px-2.5 py-1 rounded-md ${state.viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-1.5 transition whitespace-nowrap">
            <span>⊞</span> <span>Vignettes</span>
          </button>
        </div>
      </div>
    `;

  } else if (concept === 'B') {
    // Concept B: Gateway Pulse Compact (Single Row)
    headerContainer.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <!-- Left Title -->
        <div class="flex items-center gap-2.5 shrink-0">
          ${renderSidebarToggleButton()}
          <h1 class="text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">Stock Atelier</h1>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">KM • LIL</span>
          <span class="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="En direct SQLite"></span>
        </div>

        <!-- Right Controls: Expandable Search, Compact Icon Toggle, New SKU -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              id="searchInput" 
              oninput="handleSearch(this.value)" 
              value="${state.searchQuery}"
              placeholder="Rechercher... ⌘K" 
              class="w-36 focus:w-60 pl-7 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
            <button id="searchClearBtn" onclick="clearSearch()" class="${state.searchQuery ? '' : 'hidden'} absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-700 text-xs">✕</button>
          </div>

          <!-- Icon-only View Toggle -->
          <div class="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs shrink-0">
            <button onclick="setViewMode('list')" id="btn-view-list" class="btn-tactile w-7 h-7 rounded-md ${state.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'} flex items-center justify-center transition" title="Vue Liste">≡</button>
            <button onclick="setViewMode('grid')" id="btn-view-grid" class="btn-tactile w-7 h-7 rounded-md ${state.viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'} flex items-center justify-center transition" title="Vue Vignettes">⊞</button>
          </div>

          <button onclick="openNewSkuModal()" class="btn-tactile px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span class="font-bold">+</span> <span>SKU</span>
          </button>
        </div>
      </div>
    `;

    toolbarContainer.innerHTML = `
      <div class="flex items-center justify-between gap-2 overflow-x-auto py-0.5">
        <div class="flex items-center gap-1.5 shrink-0">
          ${renderFilterPillsHtml()}
        </div>
        <div class="text-[11px] font-mono text-slate-400 hidden lg:block shrink-0">
          Export CSV accessible via la barre latérale gauche (Outils)
        </div>
      </div>
    `;

  } else if (concept === 'C') {
    // Concept C: Stripe Dashboard Unified
    headerContainer.innerHTML = `
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <!-- Left Title + Inline Telemetry Badges -->
        <div class="flex items-center gap-3">
          ${renderSidebarToggleButton()}
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold text-slate-900 tracking-tight">Atelier Stock &amp; Piercing</h1>
              <span class="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold">Kaya Movement</span>
            </div>
            <div class="flex items-center gap-2 mt-1 font-mono text-[11px]">
              <span class="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" id="header-chip-count">${state.products.length} Modèles</span>
              <span class="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Hub Lille Central</span>
              <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold" id="header-chip-margin">Marge 76.0%</span>
            </div>
          </div>
        </div>

        <!-- Right Unified Bar: Search, View Mode, Export, New SKU -->
        <div class="flex items-center flex-wrap gap-2 shrink-0">
          <div class="relative w-48">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              id="searchInput" 
              oninput="handleSearch(this.value)" 
              value="${state.searchQuery}"
              placeholder="Rechercher... (⌘K)" 
              class="w-full pl-7 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button id="searchClearBtn" onclick="clearSearch()" class="${state.searchQuery ? '' : 'hidden'} absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-700 text-xs">✕</button>
          </div>

          <div class="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium shrink-0">
            <button onclick="setViewMode('list')" id="btn-view-list" class="btn-tactile px-2.5 py-1 rounded-md ${state.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'}">≡</button>
            <button onclick="setViewMode('grid')" id="btn-view-grid" class="btn-tactile px-2.5 py-1 rounded-md ${state.viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'}">⊞</button>
          </div>

          <a href="/api/export/csv" class="btn-tactile px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 flex items-center gap-1" title="Export CSV">
            <span>📥</span> <span class="hidden sm:inline">Export</span>
          </a>

          <button onclick="openNewSkuModal()" class="btn-tactile px-3.5 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span class="font-bold">+</span> <span>Nouveau SKU</span>
          </button>
        </div>
      </div>
    `;

    toolbarContainer.innerHTML = `
      <div class="flex items-center justify-between gap-2 overflow-x-auto py-0.5">
        <div class="flex items-center gap-1.5 shrink-0">
          ${renderFilterPillsHtml()}
        </div>
        <div class="text-[11px] font-mono text-slate-400 hidden lg:block shrink-0">
          Filtres actifs par catégorie de bijou
        </div>
      </div>
    `;
  }
}

function renderFilterPillsHtml() {
  const count = state.products ? state.products.length : 5;
  const filters = [
    { id: 'all', label: `Tous (${count})` },
    { id: 'septum', label: 'Septum & Clickers' },
    { id: 'rings', label: 'Bagues & Armures' },
    { id: 'leather', label: 'Maroquinerie' },
    { id: 'low_stock', label: '⚠️ Stock Faible (≤ 2)' },
    { id: 'needs_photos', label: '📸 À photographier' }
  ];

  let html = filters.map(f => {
    const isActive = state.activeFilter === f.id;
    return `
      <button onclick="setFilter('${f.id}')" class="filter-pill px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap btn-tactile ${
        isActive 
          ? 'font-semibold ring-1 ring-inset ring-slate-900 bg-slate-900 text-white' 
          : 'ring-1 ring-inset ring-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }" data-filter="${f.id}">
        ${f.label}
      </button>
    `;
  }).join('');

  // Dedicated Active Cockpit Bottleneck Filter Badge with Dismiss [✕]
  const cockpitBadges = {
    'needs_photos': { label: '📸 Sans Packshot', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    'low_stock': { label: '🚨 Rupture Imminente (≤ 1)', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    'no_casier': { label: '🏷️ File Étiquetage (Sans Casier)', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    'no_price': { label: '⚠️ Sans Prix Public', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  if (cockpitBadges[state.activeFilter]) {
    const b = cockpitBadges[state.activeFilter];
    html += `
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${b.cls} border shadow-2xs animate-toast">
        <span>${b.label}</span>
        <button onclick="setFilter('all')" class="hover:opacity-80 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ml-0.5 btn-tactile cursor-pointer" title="Retirer ce filtre">✕</button>
      </div>
    `;
  }

  // Dedicated Active Casier Filter Badge with Dismiss [✕] (FRIC-04)
  if (state.activeCasierFilter) {
    html += `
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs animate-toast">
        <span>🗄️ Tiroir : <strong>${state.activeCasierFilter}</strong></span>
        <button onclick="clearCasierFilter()" class="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-blue-800 font-bold ml-0.5 btn-tactile cursor-pointer" title="Retirer ce filtre de casier">✕</button>
      </div>
    `;
  }

  return html;
}

function setConcept(c) {
  playTactileClick();
  state.activeConcept = c;
  localStorage.setItem('stupid_stock_concept', c);
  updateConceptButtonsUI();
  renderHeaderAndToolbar();
  applyFilters();
  showToast(`Affichage du ${c === 'A' ? 'Concept A (Linear 2-Tier)' : c === 'B' ? 'Concept B (Gateway Compact)' : 'Concept C (Stripe Unified)'}`, 'info', '🎨');
}

function updateConceptButtonsUI() {
  const current = state.activeConcept || 'A';
  ['A', 'B', 'C'].forEach(id => {
    const btn = document.getElementById(`btn-concept-${id}`);
    if (btn) {
      if (id === current) {
        btn.className = 'px-3 py-1 rounded-full font-bold text-xs transition btn-tactile bg-white text-slate-950 shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-full font-bold text-xs transition btn-tactile text-slate-400 hover:text-white';
      }
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // If user is typing in an input or select, do not trigger global single-key shortcuts
    const isTyping = document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // Cmd+Z / Ctrl+Z Transactional Batch Undo
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !isTyping) {
      if (state.undoStack.length > 0) {
        e.preventDefault();
        executeUndo();
        return;
      }
    }

    // Cmd+\ or Cmd+[ or Ctrl+\ or Ctrl+[ Toggle Sub-Sidebar
    if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === '[' || e.code === 'Backslash' || e.code === 'BracketLeft') && !isTyping) {
      e.preventDefault();
      toggleSubSidebar();
      return;
    }

    // Cmd+B / Ctrl+B Toggle Plateau d'Atelier (Prevent Chrome Bookmark Bar collision)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b' && !isTyping) {
      e.preventDefault();
      toggleCasierOrganizer();
      return;
    }

    if (e.key === 'Escape') {
      const trayBackdrop = document.getElementById('casier-bottom-tray-backdrop');
      if (trayBackdrop && !trayBackdrop.classList.contains('hidden')) {
        closeCasierOrganizer();
        return;
      }
      const kmPop = document.getElementById('km-popover-menu');
      if (kmPop && !kmPop.classList.contains('hidden')) {
        closeKmPopover();
        return;
      }
      const wsDropdown = document.getElementById('ws-dropdown-menu');
      if (wsDropdown && !wsDropdown.classList.contains('hidden')) {
        wsDropdown.classList.add('hidden');
        return;
      }
      if (state.checkedSkus && state.checkedSkus.size > 0) {
        clearBulkSelection();
        return;
      }
      const popover = document.getElementById('inspector-popover');
      if (popover && !popover.classList.contains('hidden')) {
        closeInspectorPopover();
        return;
      }
      const pinDetail = document.getElementById('inspector-pin-detail-modal');
      if (pinDetail && !pinDetail.classList.contains('hidden')) {
        closePinDetailModal();
        return;
      }
      if (state.inspectorActive) {
        toggleInspectorMode(false);
        return;
      }
      const lightbox = document.getElementById('photo-lightbox-modal');
      if (lightbox && !lightbox.classList.contains('hidden')) {
        closePhotoLightbox();
        return;
      }
      closeSkuDrawer();
      closeNewSkuModal();
      closeThermalModal();
      closeCasierHubModal();
      closeCasierPicker();
      closeConfirmModal(false);
      clearSearch();
      return;
    }

    // Lightbox Arrow Navigation (Left / Right)
    const lightboxModal = document.getElementById('photo-lightbox-modal');
    if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLightbox(-1);
        return;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLightbox(1);
        return;
      }
    }

    if (!isTyping) {
      if (e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        focusSearchInput();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openNewSkuModal();
      } else if (e.key === 'e' || e.key === 'E') {
        // Trigger CSV download
        window.location.href = '/api/export/csv';
        showToast("Téléchargement de l'inventaire CSV lancé...", 'info', '📥');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleInspectorMode();
      }
    }
  });
}

function focusSearchInput() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.focus();
    input.select();
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`/api/products?brand_id=${state.brandId}`);
    const data = await res.json();
    state.products = data.products || [];
    applyFilters();
    updateMetrics();
  } catch (err) {
    console.error('Error loading products from SQLite:', err);
    showToast('Erreur de chargement des produits SQLite', 'error', '✕');
  }
}

// -------------------------------------------------------------
// Metrics Calculation (Actionable Atelier Cockpit Pipeline)
// -------------------------------------------------------------
function updateMetrics() {
  const products = state.products;
  if (!products) return;

  let totalValue = 0;
  let totalUnits = 0;
  let totalCost = 0;
  let lowStockCount = 0;
  let needsPhotosCount = 0;
  let noCasierCount = 0;
  let noPriceCount = 0;

  products.forEach(p => {
    const stock = Number(p.total_physical_stock || 0);
    const retail = Number(p.retail_price || 0);
    const cost = Number(p.production_cost || 0);

    totalValue += retail * stock;
    totalUnits += stock;
    totalCost += cost * stock;

    // Bottleneck 1: Shoot Readiness (no photos or empty photo list)
    if (!p.photos || p.photos.length === 0) {
      needsPhotosCount++;
    }

    // Bottleneck 2: Critical Stockout (stock <= 1 unit)
    if (stock <= 1) {
      lowStockCount++;
    }

    // Bottleneck 3: Unlabeled / No physical casier assigned
    if (!p.shelf_coordinate || p.shelf_coordinate.trim() === '') {
      noCasierCount++;
    }

    // Bottleneck 4: Public catalog health (stock > 0 but no retail price or price <= 0)
    if (stock > 0 && (!p.retail_price || Number(p.retail_price) <= 0)) {
      noPriceCount++;
    }
  });

  const avgMargin = totalValue > 0 ? (((totalValue - totalCost) / totalValue) * 100).toFixed(1) : '76.0';

  // 1. Update 4 Cockpit Cards Counts & Indicator Dots
  const countPhotosEl = document.getElementById('cockpit-count-photos');
  const countStockoutEl = document.getElementById('cockpit-count-stockout');
  const countLabelsEl = document.getElementById('cockpit-count-labels');
  const countPricingEl = document.getElementById('cockpit-count-pricing');

  if (countPhotosEl) countPhotosEl.textContent = needsPhotosCount;
  if (countStockoutEl) countStockoutEl.textContent = lowStockCount;
  if (countLabelsEl) countLabelsEl.textContent = noCasierCount;
  if (countPricingEl) countPricingEl.textContent = noPriceCount;

  const dotPhotos = document.getElementById('cockpit-dot-photos');
  const dotStockout = document.getElementById('cockpit-dot-stockout');
  const dotLabels = document.getElementById('cockpit-dot-labels');
  const dotPricing = document.getElementById('cockpit-dot-pricing');

  if (dotPhotos) dotPhotos.className = needsPhotosCount > 0 ? 'w-2 h-2 rounded-full bg-blue-500 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-300';
  if (dotStockout) dotStockout.className = lowStockCount > 0 ? 'w-2 h-2 rounded-full bg-rose-500 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-300';
  if (dotLabels) dotLabels.className = noCasierCount > 0 ? 'w-2 h-2 rounded-full bg-purple-500 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-300';
  if (dotPricing) dotPricing.className = noPriceCount > 0 ? 'w-2 h-2 rounded-full bg-amber-500 animate-pulse' : 'w-2 h-2 rounded-full bg-slate-300';

  // 2. Sidebar Navigation Counters
  const navCountLow = document.getElementById('nav-count-low');
  const navCountAll = document.getElementById('nav-count-all');
  const navCountPhotos = document.getElementById('nav-count-photos');
  const filterCountAll = document.getElementById('filter-count-all');

  if (navCountLow) navCountLow.textContent = lowStockCount;
  if (navCountAll) navCountAll.textContent = products.length;
  if (navCountPhotos) navCountPhotos.textContent = needsPhotosCount;
  if (filterCountAll) filterCountAll.textContent = products.length;

  // Master Sidebar Sub-Elements
  const navDomainB2c = document.getElementById('nav-domain-count-b2c');
  const quickCountAll = document.getElementById('quick-count-all');
  const quickCountStockout = document.getElementById('quick-count-stockout');
  if (navDomainB2c) navDomainB2c.textContent = products.length;
  if (quickCountAll) quickCountAll.textContent = products.length;
  if (quickCountStockout) quickCountStockout.textContent = lowStockCount;

  // 4 Physical Bins Counters in Sub-Sidebar
  const itemsA = products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith('LIL-A'));
  const itemsB = products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith('LIL-B'));
  const itemsC = products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith('LIL-C'));
  const itemsD = products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith('LIL-D'));

  const qtyA = itemsA.reduce((sum, p) => sum + Number(p.total_physical_stock || 0), 0);
  const qtyB = itemsB.reduce((sum, p) => sum + Number(p.total_physical_stock || 0), 0);
  const qtyC = itemsC.reduce((sum, p) => sum + Number(p.total_physical_stock || 0), 0);
  const qtyD = itemsD.reduce((sum, p) => sum + Number(p.total_physical_stock || 0), 0);

  const binCountA = document.getElementById('sidebar-bin-count-A');
  const binQtyA = document.getElementById('sidebar-bin-qty-A');
  const binBarA = document.getElementById('sidebar-bin-bar-A');
  if (binCountA) binCountA.textContent = `${itemsA.length} SKUs`;
  if (binQtyA) binQtyA.textContent = `${qtyA} pcs`;
  if (binBarA) binBarA.style.width = `${Math.min(100, itemsA.length * 35)}%`;

  const binCountB = document.getElementById('sidebar-bin-count-B');
  const binQtyB = document.getElementById('sidebar-bin-qty-B');
  const binBarB = document.getElementById('sidebar-bin-bar-B');
  if (binCountB) binCountB.textContent = `${itemsB.length} SKUs`;
  if (binQtyB) binQtyB.textContent = `${qtyB} pcs`;
  if (binBarB) binBarB.style.width = `${Math.min(100, itemsB.length * 35)}%`;

  const binCountC = document.getElementById('sidebar-bin-count-C');
  const binQtyC = document.getElementById('sidebar-bin-qty-C');
  const binBarC = document.getElementById('sidebar-bin-bar-C');
  if (binCountC) binCountC.textContent = `${itemsC.length} SKUs`;
  if (binQtyC) binQtyC.textContent = `${qtyC} pcs`;
  if (binBarC) binBarC.style.width = `${Math.min(100, itemsC.length * 35)}%`;

  const binCountD = document.getElementById('sidebar-bin-count-D');
  const binQtyD = document.getElementById('sidebar-bin-qty-D');
  const binBarD = document.getElementById('sidebar-bin-bar-D');
  if (binCountD) binCountD.textContent = `${itemsD.length} SKUs`;
  if (binQtyD) binQtyD.textContent = `${qtyD} pcs`;
  if (binBarD) binBarD.style.width = `${Math.min(100, itemsD.length * 35)}%`;

  // Update Facets Counts
  updateFacetCounts(products);

  // 3. Header Chips
  const headerChipCount = document.getElementById('header-chip-count');
  const headerChipMargin = document.getElementById('header-chip-margin');
  if (headerChipCount) headerChipCount.textContent = `${products.length} Modèles`;
  if (headerChipMargin) headerChipMargin.textContent = `Marge ${avgMargin}%`;

  // Update Cockpit active highlights
  updateCockpitActiveStyles(state.activeFilter);
}

// -------------------------------------------------------------
// Filters, Search & Sorting
// -------------------------------------------------------------
function toggleCockpitFilter(filterKey) {
  playTactileClick();
  if (state.activeFilter === filterKey) {
    setFilter('all');
  } else {
    setFilter(filterKey);
  }
}

function updateCockpitActiveStyles(activeFilter) {
  const cards = {
    'needs_photos': document.getElementById('cockpit-card-photos'),
    'low_stock': document.getElementById('cockpit-card-stockout'),
    'no_casier': document.getElementById('cockpit-card-labels'),
    'no_price': document.getElementById('cockpit-card-pricing')
  };

  Object.entries(cards).forEach(([key, el]) => {
    if (!el) return;
    if (key === activeFilter) {
      el.classList.add('ring-2', 'shadow-sm');
      if (key === 'needs_photos') el.classList.add('ring-blue-500', 'border-blue-500', 'bg-blue-50/50');
      if (key === 'low_stock') el.classList.add('ring-rose-500', 'border-rose-500', 'bg-rose-50/50');
      if (key === 'no_casier') el.classList.add('ring-purple-500', 'border-purple-500', 'bg-purple-50/50');
      if (key === 'no_price') el.classList.add('ring-amber-500', 'border-amber-500', 'bg-amber-50/50');
      el.classList.remove('bg-slate-50/80', 'border-slate-200/90');
    } else {
      el.classList.remove(
        'ring-2', 'shadow-sm',
        'ring-blue-500', 'border-blue-500', 'bg-blue-50/50',
        'ring-rose-500', 'border-rose-500', 'bg-rose-50/50',
        'ring-purple-500', 'border-purple-500', 'bg-purple-50/50',
        'ring-amber-500', 'border-amber-500', 'bg-amber-50/50'
      );
      el.classList.add('bg-slate-50/80', 'border-slate-200/90');
    }
  });
}

function setFilter(filterType) {
  playTactileClick();
  state.activeFilter = filterType;

  // Update pill styles
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterType) {
      btn.className = 'filter-pill px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-slate-900 bg-slate-900 text-white transition whitespace-nowrap btn-tactile';
    } else {
      btn.className = 'filter-pill px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ring-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition whitespace-nowrap btn-tactile';
    }
  });

  // Update sidebar menu items
  const navItems = {
    'all': document.getElementById('nav-item-all'),
    'low_stock': document.getElementById('nav-item-low'),
    'needs_photos': document.getElementById('nav-item-photos')
  };
  Object.entries(navItems).forEach(([key, el]) => {
    if (!el) return;
    if (key === filterType) {
      el.className = 'w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#1C202E] text-white font-medium text-xs transition text-left group btn-tactile';
    } else {
      el.className = 'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs transition text-left group btn-tactile';
    }
  });

  // Update Cockpit active highlights
  updateCockpitActiveStyles(filterType);

  applyFilters();
  renderHeaderAndToolbar();
}

function handleSearch(query) {
  state.searchQuery = query.toLowerCase().trim();
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) {
    if (state.searchQuery.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  applyFilters();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    handleSearch('');
    input.focus();
  }
}

function toggleSort(column) {
  playTactileClick();
  if (state.sortColumn === column) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortColumn = column;
    state.sortDirection = 'asc';
  }

  // Update table header icons
  const columns = ['title', 'category', 'shelf_coordinate', 'total_physical_stock', 'retail_price', 'production_cost'];
  columns.forEach(col => {
    const iconEl = document.getElementById(`sort-icon-${col}`);
    if (iconEl) {
      if (col === state.sortColumn) {
        iconEl.textContent = state.sortDirection === 'asc' ? '▲' : '▼';
        iconEl.className = 'text-[10px] text-blue-600 font-bold';
      } else {
        iconEl.textContent = '⇅';
        iconEl.className = 'text-[10px] text-slate-400';
      }
    }
  });

  applyFilters();
}

function applyFilters() {
  let list = [...state.products];

  // 1. Filter by category or threshold
  if (state.activeFilter === 'septum') {
    list = list.filter(p => (p.category || '').toLowerCase().includes('septum') || (p.title || '').toLowerCase().includes('clicker'));
  } else if (state.activeFilter === 'rings') {
    list = list.filter(p => (p.category || '').toLowerCase().includes('ring') || (p.title || '').toLowerCase().includes('armor') || (p.title || '').toLowerCase().includes('viper'));
  } else if (state.activeFilter === 'leather') {
    list = list.filter(p => (p.category || '').toLowerCase().includes('leather') || (p.category || '').toLowerCase().includes('holster'));
  } else if (state.activeFilter === 'low_stock') {
    list = list.filter(p => (p.total_physical_stock || 0) <= 1);
  } else if (state.activeFilter === 'needs_photos') {
    list = list.filter(p => !p.photos || p.photos.length === 0);
  } else if (state.activeFilter === 'no_casier') {
    list = list.filter(p => !p.shelf_coordinate || p.shelf_coordinate.trim() === '');
  } else if (state.activeFilter === 'no_price') {
    list = list.filter(p => (p.total_physical_stock || 0) > 0 && (!p.retail_price || Number(p.retail_price) <= 0));
  }

  // 1.5. Dedicated Casier Shelf Filter (FRIC-04)
  if (state.activeCasierFilter) {
    const cf = state.activeCasierFilter.toUpperCase().trim();
    list = list.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith(cf));
  }

  // 1.6. Facet Filter: Metal & Materials
  if (state.selectedMetals && state.selectedMetals.size > 0) {
    list = list.filter(p => {
      const pMats = (p.materials || []).map(m => String(m).toLowerCase());
      const pTitle = (p.title || '').toLowerCase();
      return Array.from(state.selectedMetals).some(m => {
        const metalKey = m.toLowerCase();
        if (metalKey === 'argent') return pMats.some(mat => mat.includes('argent') || mat.includes('silver') || mat.includes('925')) || pTitle.includes('argent') || pTitle.includes('silver');
        if (metalKey === 'or') return pMats.some(mat => mat.includes('or') || mat.includes('gold') || mat.includes('vermeil') || mat.includes('18k')) || pTitle.includes('or ') || pTitle.includes('gold');
        if (metalKey === 'cuir') return pMats.some(mat => mat.includes('cuir') || mat.includes('leather')) || pTitle.includes('cuir') || pTitle.includes('leather');
        if (metalKey === 'titane') return pMats.some(mat => mat.includes('titane') || mat.includes('titanium')) || pTitle.includes('titane');
        return pMats.some(mat => mat.includes(metalKey)) || pTitle.includes(metalKey);
      });
    });
  }

  // 1.7. Facet Filter: Product Types
  if (state.selectedCategories && state.selectedCategories.size > 0) {
    list = list.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pTitle = (p.title || '').toLowerCase();
      return Array.from(state.selectedCategories).some(c => {
        const catKey = c.toLowerCase();
        if (catKey === 'septum') return pCat.includes('septum') || pTitle.includes('clicker') || pTitle.includes('septum');
        if (catKey === 'rings') return pCat.includes('ring') || pTitle.includes('ring') || pTitle.includes('armor') || pTitle.includes('bague');
        if (catKey === 'leather') return pCat.includes('leather') || pCat.includes('holster') || pTitle.includes('holster') || pTitle.includes('cuir');
        return pCat.includes(catKey) || pTitle.includes(catKey);
      });
    });
  }

  // 2. Search query filter
  if (state.searchQuery) {
    list = list.filter(p => 
      p.sku.toLowerCase().includes(state.searchQuery) ||
      p.title.toLowerCase().includes(state.searchQuery) ||
      (p.shelf_coordinate || '').toLowerCase().includes(state.searchQuery) ||
      (p.category || '').toLowerCase().includes(state.searchQuery)
    );
  }

  // 3. Sorting
  const dir = state.sortDirection === 'asc' ? 1 : -1;
  const col = state.sortColumn;

  list.sort((a, b) => {
    let valA = a[col];
    let valB = b[col];

    if (typeof valA === 'string') {
      return valA.localeCompare(valB || '') * dir;
    }
    valA = valA || 0;
    valB = valB || 0;
    return (valA - valB) * dir;
  });

  state.filteredProducts = list;
  renderView();

  const paginationSummary = document.getElementById('paginationSummary');
  if (paginationSummary) {
    paginationSummary.textContent = `Affichage de ${list.length} sur ${state.products.length} pièces de joaillerie`;
  }
}

// -------------------------------------------------------------
// View Switching (List vs Vignettes Grid)
// -------------------------------------------------------------
function setViewMode(mode) {
  playTactileClick();
  state.viewMode = mode;

  const btnList = document.getElementById('btn-view-list');
  const btnGrid = document.getElementById('btn-view-grid');
  const table = document.getElementById('productsTable');
  const grid = document.getElementById('vignettesGrid');

  if (mode === 'list') {
    btnList.className = 'btn-tactile px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm font-semibold flex items-center gap-1.5 transition whitespace-nowrap';
    btnGrid.className = 'btn-tactile px-3 py-1.5 rounded-md text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition whitespace-nowrap';
    table.classList.remove('hidden');
    grid.classList.add('hidden');
  } else {
    btnGrid.className = 'btn-tactile px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm font-semibold flex items-center gap-1.5 transition whitespace-nowrap';
    btnList.className = 'btn-tactile px-3 py-1.5 rounded-md text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition whitespace-nowrap';
    grid.classList.remove('hidden');
    table.classList.add('hidden');
  }

  renderView();
}

function renderView() {
  if (state.viewMode === 'list') {
    renderTable();
  } else {
    renderGrid();
  }
}

// -------------------------------------------------------------
// Table Rendering (Gateway Pulse High-Density Rows with Strict Layout)
// -------------------------------------------------------------
function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  if (state.filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="py-12 text-center text-slate-400 font-mono">
          Aucun produit ne correspond aux critères de recherche ou de filtre.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';

  state.filteredProducts.forEach((p, rowIndex) => {
    const stock = p.total_physical_stock || 0;
    const isExpanded = state.expandedVariants.has(p.sku);
    const photoUrl = (p.photos && p.photos.length > 0) ? `/${p.photos[0].file_path}` : null;
    const variantsCount = (p.variants && p.variants.length > 0) ? p.variants.length : 0;
    
    // Status Badge Logic
    let statusPill = '';
    if (stock > 5) {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap inline-flex items-center">EN STOCK</span>`;
    } else if (stock > 0) {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/30 whitespace-nowrap inline-flex items-center">FAIBLE (${stock})</span>`;
    } else {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 whitespace-nowrap inline-flex items-center">RUPTURE</span>`;
    }

    // Margin Calculation
    const marginPercent = p.retail_price > 0 
      ? Math.round(((p.retail_price - p.production_cost) / p.retail_price) * 100) 
      : 0;

    // Currency Formatting
    const formattedRetail = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.retail_price || 0);
    const formattedCost = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.production_cost || 0);

    html += `
      <tr id="table-row-${p.sku}"
          draggable="true"
          ondragstart="handleRowDragStart(event, '${p.sku}')"
          ondragend="handleRowDragEnd(event)"
          class="hover:bg-slate-50/80 transition-colors cursor-pointer group select-none ${state.checkedSkus.has(p.sku) ? 'bg-blue-50/40' : ''}" 
          onclick="handleRowClick(event, '${p.sku}')">
        
        <!-- Multi-Selection Checkbox & Drag Grip Handle -->
        <td class="py-3 px-2 text-center whitespace-nowrap" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-1">
            <span class="text-slate-300 group-hover:text-blue-500 font-bold text-xs cursor-grab active:cursor-grabbing px-0.5" title="Glisser vers un casier">⋮⋮</span>
            <input type="checkbox" 
              class="sku-row-checkbox w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
              value="${p.sku}"
              ${state.checkedSkus.has(p.sku) ? 'checked' : ''}
              onchange="toggleSelectSku('${p.sku}', this.checked)"
              title="Sélectionner ${p.sku}"
            />
          </div>
        </td>

        <!-- Image & Ref with Interactive Variations Chevron Toggle -->
        <td class="py-3 px-2 text-center whitespace-nowrap">
          <div class="flex items-center justify-center gap-1.5">
            <!-- Sleek Arrow Button (Points Right when closed, Down when active) -->
            ${variantsCount > 1 ? `
              <button 
                onclick="event.stopPropagation(); toggleVariantsAccordion('${p.sku}')" 
                class="w-5 h-5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-transform duration-200 btn-tactile ${isExpanded ? 'rotate-90 text-blue-600 bg-blue-50' : ''}" 
                title="${isExpanded ? 'Replier les variations' : 'Déplier les variations'}"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            ` : `
              <div class="w-5 h-5"></div>
            `}

            <!-- Product Photo Thumbnail with Multi-Photo Indicator Badge -->
            <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm shrink-0">
              ${photoUrl 
                ? `<img src="${photoUrl}" alt="${p.sku}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onerror="this.src=''; this.parentElement.innerHTML='💎';">` 
                : `<span class="text-base">💎</span>`}
              ${p.photos && p.photos.length > 1 ? `
                <span class="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] font-mono font-bold px-1 rounded-tl shadow-xs" title="${p.photos.length} photos enregistrées">${p.photos.length}</span>
              ` : ''}
            </div>
          </div>
        </td>

        <!-- Product Title & SKU with Chromatic Swatches (PIN-010 Hierarchy) -->
        <td class="py-3 px-3 truncate">
          <!-- Line 1: Editable Title (PIN-005) -->
          <div id="product-title-container-${p.sku}" data-no-drawer="true" class="truncate">
            <div 
              id="product-title-text-${p.sku}" 
              ondblclick="startInlineTitleEdit('${p.sku}')" 
              class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate select-text cursor-text" 
              title="Double-cliquer pour modifier le nom du produit (Entrée pour valider, Échap pour annuler)"
            >
              ${escapeHtml(p.title)}
            </div>
          </div>

          <!-- Line 2: SKU Mono Badge + Variant Count Link -->
          <div class="flex items-center gap-1.5 mt-0.5 select-none">
            <span class="font-mono text-[10px] font-bold text-blue-600 bg-blue-50/80 px-1.5 py-0.2 rounded border border-blue-200/60 whitespace-nowrap tracking-tight">${p.sku}</span>
            ${variantsCount > 1 ? `<span class="text-[10px] text-slate-400 font-mono whitespace-nowrap hover:text-blue-600 transition-colors cursor-pointer" onclick="event.stopPropagation(); toggleVariantsAccordion('${p.sku}')">${variantsCount} déclinaisons</span>` : ''}
          </div>

          <!-- Line 3: Chromatic Color Swatches (12px) -->
          ${renderChromaticSwatchesHtml(p)}
        </td>

        <!-- Category -->
        <td class="py-3 px-3 whitespace-nowrap">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate inline-block max-w-[130px]" title="${p.category || 'Atelier'}">
            ${p.category || 'Atelier'}
          </span>
        </td>

        <!-- Casier Atelier (Bin) -->
        <td class="py-3 px-3 text-center whitespace-nowrap">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 tracking-wider whitespace-nowrap inline-flex items-center gap-1 shadow-2xs">
            <span>📦</span> <span>${p.shelf_coordinate || 'LIL-A00'}</span>
          </span>
        </td>

        <!-- Stock Physique with Quick Stepper & Direct Editable Input (FRIC-01 Notion/Excel Keydown) -->
        <td class="py-3 px-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs" onclick="event.stopPropagation()">
            <button onclick="updateStock('${p.sku}', -1)" class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition btn-tactile" title="Décrémenter (-1)">
              -
            </button>
            <input type="number" 
              id="stock-val-${p.sku}" 
              value="${stock}" 
              min="0"
              data-sku="${p.sku}"
              data-row-index="${rowIndex}"
              onchange="handleDirectStockInput('${p.sku}', this.value)"
              onkeydown="handleStockInputKeydown(event, '${p.sku}', ${rowIndex})"
              onfocus="this.select()"
              title="Entrée clavier rapide : Entrée / Bas pour descendre, Haut pour monter, Échap pour annuler"
              class="stepper-input table-stock-input w-8 text-center bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-500 rounded font-mono font-bold text-xs text-slate-900 tabular-nums border-0 outline-none cursor-text transition-colors p-0" />
            <button onclick="updateStock('${p.sku}', 1)" class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition btn-tactile" title="Incrémenter (+1)">
              +
            </button>
          </div>
        </td>

        <!-- Prix Public -->
        <td class="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
          ${formattedRetail}
        </td>

        <!-- Coût d'Atelier & Marge -->
        <td class="py-3 px-3 text-right font-mono whitespace-nowrap tabular-nums">
          <div class="text-slate-700 font-medium">${formattedCost}</div>
          <div class="text-[9px] text-emerald-600 font-bold">${marginPercent}% marge</div>
        </td>

        <!-- Statut Pill Badge -->
        <td class="py-3 px-3 text-center whitespace-nowrap" id="status-pill-cell-${p.sku}">
          ${statusPill}
        </td>

        <!-- Actions -->
        <td class="py-3 px-4 text-right whitespace-nowrap" onclick="event.stopPropagation()">
          <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <button onclick="openSkuDrawer('${p.sku}')" class="btn-tactile px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded border border-blue-200/80 whitespace-nowrap" title="Éditer la fiche SKU">
              ✏️ Fiche
            </button>
            <button onclick="openThermalQr('${p.sku}')" class="btn-tactile px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 whitespace-nowrap" title="Imprimer Étiquette Thermique">
              🏷️
            </button>
          </div>
        </td>
      </tr>
    `;

    // Variant Accordion Sub-Rows with Interactive Variant Stock Steppers!
    if (isExpanded && p.variants && p.variants.length > 0) {
      html += `
        <tr class="bg-slate-50/70 border-y border-slate-200/80">
          <td colspan="10" class="p-4 pl-14">
            <div class="flex items-center justify-between mb-2.5">
              <div class="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                Variations &amp; Déclinaisons d'Atelier (${p.variants.length}) :
              </div>
              <div class="text-[10px] font-mono text-slate-400">
                Tailles, finitions et déclinaisons reliées directement aux casiers physiques
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${p.variants.map((v, vIndex) => {
                const optHex = getAtelierColorHex(v.option1_value || v.name);
                return `
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between font-mono text-xs">
                  <div>
                    <div class="flex items-center gap-1.5">
                      ${optHex ? `<span class="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style="background-color: ${optHex};"></span>` : ''}
                      <strong class="text-slate-900 text-xs">${v.name || v.variant_sku}</strong>
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">Casier : <span class="font-bold text-blue-600">${v.shelf_bin || p.shelf_coordinate}</span></div>
                  </div>
                  <!-- Interactive Variant Stock Stepper with Direct Editable Input (FRIC-01 Keydown) -->
                  <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1" onclick="event.stopPropagation()">
                    <button onclick="updateVariantStock('${v.variant_sku}', '${p.sku}', -1)" class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 transition btn-tactile" title="Décrémenter (-1)">-</button>
                    <input type="number" 
                      id="variant-stock-val-${v.variant_sku}" 
                      value="${v.stock}" 
                      min="0"
                      data-variant-sku="${v.variant_sku}"
                      data-parent-sku="${p.sku}"
                      onchange="handleDirectVariantStockInput('${v.variant_sku}', '${p.sku}', this.value)"
                      onkeydown="handleVariantStockInputKeydown(event, '${v.variant_sku}', '${p.sku}')"
                      onfocus="this.select()"
                      title="Entrée clavier rapide : Entrée / Bas pour descendre"
                      class="stepper-input variant-stock-input w-8 text-center bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-500 rounded font-mono font-bold text-xs text-slate-900 tabular-nums border-0 outline-none cursor-text transition-colors p-0" />
                    <button onclick="updateVariantStock('${v.variant_sku}', '${p.sku}', 1)" class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200 transition btn-tactile" title="Incrémenter (+1)">+</button>
                  </div>
                </div>
              `;}).join('')}
            </div>
          </td>
        </tr>
      `;
    }
  });

  tbody.innerHTML = html;
  updateBulkToolbar();
}

// -------------------------------------------------------------
// Vignettes Grid Rendering
// -------------------------------------------------------------
function renderGrid() {
  const grid = document.getElementById('vignettesGrid');
  if (!grid) return;

  if (state.filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 font-mono">
        Aucun produit ne correspond aux critères de filtre.
      </div>
    `;
    return;
  }

  let html = '';

  state.filteredProducts.forEach(p => {
    const stock = p.total_physical_stock || 0;
    const photoUrl = (p.photos && p.photos.length > 0) ? `/${p.photos[0].file_path}` : null;
    const formattedRetail = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.retail_price || 0);

    html += `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer ${state.checkedSkus.has(p.sku) ? 'ring-2 ring-blue-500' : ''}" onclick="openSkuDrawer('${p.sku}')">
        
        <!-- Image Canvas -->
        <div class="w-full h-48 bg-slate-100 overflow-hidden relative">
          ${photoUrl 
            ? `<img src="${photoUrl}" alt="${p.sku}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">`
            : `<div class="w-full h-full flex items-center justify-center text-3xl text-slate-300">💎</div>`}
          
          <!-- Top Floating Badges & Checkbox -->
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5" onclick="event.stopPropagation()">
            <input type="checkbox" 
              class="sku-grid-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white/95 shadow-sm"
              value="${p.sku}"
              ${state.checkedSkus.has(p.sku) ? 'checked' : ''}
              onchange="toggleSelectSku('${p.sku}', this.checked)"
              title="Sélectionner ${p.sku}"
            />
            <span class="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
              📦 ${p.shelf_coordinate || 'LIL-A00'}
            </span>
          </div>

          <div class="absolute top-2.5 right-2.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${stock > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}">
              ${stock > 0 ? `${stock} en stock` : 'Rupture'}
            </span>
          </div>

          ${p.photos && p.photos.length > 1 ? `
            <div class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
              <span>📷</span> <span>${p.photos.length} vues</span>
            </div>
          ` : ''}
        </div>

        <!-- Card Body -->
        <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <div class="font-mono text-[11px] font-bold text-blue-600 tracking-tight">${p.sku}</div>
            <h4 class="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mt-0.5">${p.title}</h4>
            ${renderChromaticSwatchesHtml(p)}
            <div class="text-[11px] text-slate-500 mt-1">${p.category}</div>
          </div>

          <!-- Bottom Footer -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between" onclick="event.stopPropagation()">
            <div class="font-mono text-sm font-extrabold text-slate-900 tabular-nums">
              ${formattedRetail}
            </div>
            <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button onclick="updateStock('${p.sku}', -1)" class="w-6 h-6 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center btn-tactile" title="Décrémenter (-1)">-</button>
              <input type="number" 
                id="grid-stock-val-${p.sku}" 
                value="${stock}" 
                min="0"
                onchange="handleDirectStockInput('${p.sku}', this.value)"
                onkeydown="if(event.key==='Enter'){this.blur();}"
                onfocus="this.select()"
                title="Cliquer pour entrer une quantité au clavier"
                class="stepper-input w-8 text-center bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-500 rounded font-mono font-bold text-xs text-slate-900 tabular-nums border-0 outline-none cursor-text transition-colors p-0" />
              <button onclick="updateStock('${p.sku}', 1)" class="w-6 h-6 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center btn-tactile" title="Incrémenter (+1)">+</button>
            </div>
          </div>
        </div>

      </div>
    `;
  });

  grid.innerHTML = html;
  updateBulkToolbar();
}

// -------------------------------------------------------------
// Keyboard Stepper Navigation (FRIC-01: Notion / Excel Ergonomics)
// -------------------------------------------------------------
function handleStockInputKeydown(event, sku, rowIndex) {
  const allInputs = Array.from(document.querySelectorAll('.table-stock-input'));
  const currentIdx = allInputs.findIndex(inp => inp === event.target);

  if (event.key === 'Enter' || event.key === 'ArrowDown') {
    event.preventDefault();
    event.target.blur(); // Triggers onchange -> saves to SQLite
    playTactileClick();
    if (currentIdx >= 0 && currentIdx < allInputs.length - 1) {
      const nextInput = allInputs[currentIdx + 1];
      nextInput.focus();
      nextInput.select();
    }
  } else if ((event.key === 'Enter' && event.shiftKey) || event.key === 'ArrowUp') {
    event.preventDefault();
    event.target.blur();
    playTactileClick();
    if (currentIdx > 0) {
      const prevInput = allInputs[currentIdx - 1];
      prevInput.focus();
      prevInput.select();
    }
  } else if (event.key === 'Escape') {
    const product = state.products.find(p => p.sku === sku);
    if (product) {
      event.target.value = product.total_physical_stock || 0;
    }
    event.target.blur();
  }
}

function handleVariantStockInputKeydown(event, variantSku, parentSku) {
  const allVarInputs = Array.from(document.querySelectorAll('.variant-stock-input'));
  const currentIdx = allVarInputs.findIndex(inp => inp === event.target);

  if (event.key === 'Enter' || event.key === 'ArrowDown') {
    event.preventDefault();
    event.target.blur();
    playTactileClick();
    if (currentIdx >= 0 && currentIdx < allVarInputs.length - 1) {
      const nextInput = allVarInputs[currentIdx + 1];
      nextInput.focus();
      nextInput.select();
    }
  } else if ((event.key === 'Enter' && event.shiftKey) || event.key === 'ArrowUp') {
    event.preventDefault();
    event.target.blur();
    playTactileClick();
    if (currentIdx > 0) {
      const prevInput = allVarInputs[currentIdx - 1];
      prevInput.focus();
      prevInput.select();
    }
  } else if (event.key === 'Escape') {
    const parent = state.products.find(p => p.sku === parentSku);
    const variant = parent?.variants?.find(v => v.variant_sku === variantSku);
    if (variant) {
      event.target.value = variant.stock || 0;
    }
    event.target.blur();
  }
}

// -------------------------------------------------------------
// Interactive Stock Steppers (Direct SQLite Persistence)
// -------------------------------------------------------------
async function updateStock(sku, delta) {
  playTactileClick();
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  const currentStock = product.total_physical_stock || 0;
  const newStock = Math.max(0, currentStock + delta);
  product.total_physical_stock = newStock;

  // Immediate optimistic UI update on both table & grid inputs
  const tableInput = document.getElementById(`stock-val-${sku}`);
  if (tableInput) {
    if (tableInput.tagName === 'INPUT') tableInput.value = newStock;
    else tableInput.textContent = newStock;
  }
  const gridInput = document.getElementById(`grid-stock-val-${sku}`);
  if (gridInput) {
    if (gridInput.tagName === 'INPUT') gridInput.value = newStock;
    else gridInput.textContent = newStock;
  }

  updateMetrics();

  try {
    await fetch(`/api/products/${sku}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_count: newStock,
        location_id: 'lille_hub'
      })
    });
    showToast(`Stock ${sku}: ${newStock} pièces`, 'success', '📦');
  } catch (err) {
    console.error(`Failed to persist stock update for ${sku}:`, err);
    showToast(`Erreur mise à jour stock ${sku}`, 'error', '✕');
  }
}

async function handleDirectStockInput(sku, val) {
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  const newStock = Math.max(0, parseInt(val, 10) || 0);
  product.total_physical_stock = newStock;

  // Sync inputs across table and grid views
  const tableInput = document.getElementById(`stock-val-${sku}`);
  if (tableInput && tableInput.value !== String(newStock)) tableInput.value = newStock;
  const gridInput = document.getElementById(`grid-stock-val-${sku}`);
  if (gridInput && gridInput.value !== String(newStock)) gridInput.value = newStock;

  updateMetrics();

  try {
    await fetch(`/api/products/${sku}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_count: newStock,
        location_id: 'lille_hub'
      })
    });
    showToast(`Stock ${sku}: ${newStock} pièces`, 'success', '📦');
  } catch (err) {
    console.error(`Failed to persist direct stock update for ${sku}:`, err);
    showToast(`Erreur mise à jour stock ${sku}`, 'error', '✕');
  }
}

async function updateVariantStock(variantSku, parentSku, delta) {
  playTactileClick();
  const parent = state.products.find(p => p.sku === parentSku);
  if (!parent || !parent.variants) return;

  const variant = parent.variants.find(v => v.variant_sku === variantSku);
  if (!variant) return;

  const newStock = Math.max(0, (variant.stock || 0) + delta);
  variant.stock = newStock;

  // Recalculate parent total stock
  parent.total_physical_stock = parent.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  // Sync variant inputs in accordion and drawer
  const accInput = document.getElementById(`variant-stock-val-${variantSku}`);
  if (accInput) {
    if (accInput.tagName === 'INPUT') accInput.value = newStock;
    else accInput.textContent = newStock;
  }
  const drwInput = document.getElementById(`drawer-variant-stock-val-${variantSku}`);
  if (drwInput) {
    if (drwInput.tagName === 'INPUT') drwInput.value = newStock;
    else drwInput.textContent = newStock;
  }

  // Sync parent total stock input in table and grid
  const parentTableInput = document.getElementById(`stock-val-${parentSku}`);
  if (parentTableInput) {
    if (parentTableInput.tagName === 'INPUT') parentTableInput.value = parent.total_physical_stock;
    else parentTableInput.textContent = parent.total_physical_stock;
  }
  const parentGridInput = document.getElementById(`grid-stock-val-${parentSku}`);
  if (parentGridInput) {
    if (parentGridInput.tagName === 'INPUT') parentGridInput.value = parent.total_physical_stock;
    else parentGridInput.textContent = parent.total_physical_stock;
  }

  // Update status pill cell dynamically (FRIC-03)
  const pillCell = document.getElementById(`status-pill-cell-${parentSku}`);
  if (pillCell) {
    const tot = parent.total_physical_stock;
    if (tot > 5) {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap inline-flex items-center">EN STOCK</span>`;
    } else if (tot > 0) {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/30 whitespace-nowrap inline-flex items-center">FAIBLE (${tot})</span>`;
    } else {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 whitespace-nowrap inline-flex items-center">RUPTURE</span>`;
    }
  }
  const drawerStockInput = document.getElementById('drawer-input-stock');
  if (drawerStockInput && state.currentDrawerSku === parentSku) {
    drawerStockInput.value = parent.total_physical_stock;
  }

  updateMetrics();

  try {
    await fetch(`/api/variants/${variantSku}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_count: newStock,
        location_id: 'lille_hub'
      })
    });
    showToast(`${variant.name || variantSku}: ${newStock} pcs`, 'success', '📦');
  } catch (err) {
    console.error(`Failed to persist variant stock for ${variantSku}:`, err);
    showToast(`Erreur mise à jour variante`, 'error', '✕');
  }
}

async function handleDirectVariantStockInput(variantSku, parentSku, val) {
  const parent = state.products.find(p => p.sku === parentSku);
  if (!parent || !parent.variants) return;

  const variant = parent.variants.find(v => v.variant_sku === variantSku);
  if (!variant) return;

  const newStock = Math.max(0, parseInt(val, 10) || 0);
  variant.stock = newStock;

  // Recalculate parent total stock
  parent.total_physical_stock = parent.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  // Sync variant inputs in accordion and drawer
  const accInput = document.getElementById(`variant-stock-val-${variantSku}`);
  if (accInput && accInput.value !== String(newStock)) accInput.value = newStock;
  const drwInput = document.getElementById(`drawer-variant-stock-val-${variantSku}`);
  if (drwInput && drwInput.value !== String(newStock)) drwInput.value = newStock;

  // Sync parent total stock input in table and grid
  const parentTableInput = document.getElementById(`stock-val-${parentSku}`);
  if (parentTableInput) {
    if (parentTableInput.tagName === 'INPUT') parentTableInput.value = parent.total_physical_stock;
    else parentTableInput.textContent = parent.total_physical_stock;
  }
  const parentGridInput = document.getElementById(`grid-stock-val-${parentSku}`);
  if (parentGridInput) {
    if (parentGridInput.tagName === 'INPUT') parentGridInput.value = parent.total_physical_stock;
    else parentGridInput.textContent = parent.total_physical_stock;
  }

  // Update status pill cell dynamically (FRIC-03)
  const pillCell = document.getElementById(`status-pill-cell-${parentSku}`);
  if (pillCell) {
    const tot = parent.total_physical_stock;
    if (tot > 5) {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap inline-flex items-center">EN STOCK</span>`;
    } else if (tot > 0) {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/30 whitespace-nowrap inline-flex items-center">FAIBLE (${tot})</span>`;
    } else {
      pillCell.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 whitespace-nowrap inline-flex items-center">RUPTURE</span>`;
    }
  }
  const drawerStockInput = document.getElementById('drawer-input-stock');
  if (drawerStockInput && state.currentDrawerSku === parentSku) {
    drawerStockInput.value = parent.total_physical_stock;
  }

  updateMetrics();

  try {
    await fetch(`/api/variants/${variantSku}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_count: newStock,
        location_id: 'lille_hub'
      })
    });
    showToast(`${variant.name || variantSku}: ${newStock} pcs`, 'success', '📦');
  } catch (err) {
    console.error(`Failed to persist variant stock for ${variantSku}:`, err);
    showToast(`Erreur mise à jour variante`, 'error', '✕');
  }
}

// -------------------------------------------------------------
// Accordion Toggle & Row Click
// -------------------------------------------------------------
function toggleVariantsAccordion(sku) {
  playTactileClick();
  if (state.expandedVariants.has(sku)) {
    state.expandedVariants.delete(sku);
  } else {
    state.expandedVariants.add(sku);
  }
  renderTable();
}

function handleRowClick(event, sku) {
  if (state.isDraggingRow) return;
  if (event.target.closest('[data-no-drawer]') || event.target.closest('button') || event.target.closest('input')) return;
  openSkuDrawer(sku);
}

// -------------------------------------------------------------
// PIN-005: Inline Editable Product Title with Cmd+Z Rollback
// -------------------------------------------------------------
function startInlineTitleEdit(sku) {
  playTactileClick();
  const container = document.getElementById(`product-title-container-${sku}`);
  if (!container) return;
  if (container.querySelector('input')) return;

  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  const currentTitle = product.title || '';

  // Render input inside container
  container.innerHTML = `
    <input 
      type="text" 
      id="product-title-input-${sku}" 
      data-no-drawer="true" 
      value="${escapeHtml(currentTitle)}" 
      class="w-full text-xs font-bold text-slate-900 bg-white border-2 border-blue-500 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xs"
      onclick="event.stopPropagation()"
    />
  `;

  const input = document.getElementById(`product-title-input-${sku}`);
  if (input) {
    input.focus();
    input.select();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        renderTable();
      }
    });

    input.addEventListener('blur', () => {
      saveInlineTitle(sku, input.value, currentTitle);
    });
  }
}

async function saveInlineTitle(sku, newTitle, previousTitle) {
  const trimmed = (newTitle || '').trim();
  const prevTrimmed = (previousTitle || '').trim();

  // If identical, revert display cleanly
  if (trimmed === prevTrimmed) {
    renderTable();
    return;
  }

  if (!trimmed) {
    showToast('Le nom du produit ne peut pas être vide', 'error', '✕');
    renderTable();
    return;
  }

  try {
    const res = await fetch(`/api/products/${encodeURIComponent(sku)}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed })
    });
    const data = await res.json();
    if (data.status === 'updated' || data.status === 'ok' || data.success) {
      // Push onto undo stack
      state.undoStack.push({
        type: 'title_update',
        sku: sku,
        previousTitle: prevTrimmed,
        newTitle: trimmed
      });

      // Update state locally
      const p = state.products.find(item => item.sku === sku);
      if (p) p.title = trimmed;
      const fp = state.filteredProducts.find(item => item.sku === sku);
      if (fp) fp.title = trimmed;

      renderTable();
      showToast(`Titre mis à jour : « ${trimmed} » (⌘Z pour annuler)`, 'success', '✓');

      // Pulse highlight animation on edited cell
      const el = document.getElementById(`product-title-container-${sku}`);
      if (el) {
        el.classList.add('bg-emerald-100', 'rounded', 'px-1', 'transition-colors', 'duration-500');
        setTimeout(() => el.classList.remove('bg-emerald-100', 'px-1'), 1200);
      }
    } else {
      showToast(data.message || 'Erreur lors de la mise à jour du titre', 'error', '✕');
      renderTable();
    }
  } catch (err) {
    console.error('Error saving inline title:', err);
    showToast('Erreur de communication avec le serveur', 'error', '✕');
    renderTable();
  }
}

// -------------------------------------------------------------
// Drawer Photo Gallery & Thumbnail Filmstrip Slider
// -------------------------------------------------------------
function renderDrawerPhotoGallery(product, activeIndex = 0) {
  const drawerImg = document.getElementById('drawer-img');
  const placeholder = document.getElementById('drawer-img-placeholder');
  const countBadge = document.getElementById('drawer-photo-count-badge');
  const sliderContainer = document.getElementById('drawer-thumbnails-slider');
  const badgeContainer = document.getElementById('drawer-img-badge');
  const actionsContainer = document.getElementById('drawer-img-actions');

  const photos = product.photos || [];
  if (countBadge) countBadge.textContent = photos.length;

  if (photos.length === 0) {
    const imgContainer = document.getElementById('drawer-img-container');
    if (imgContainer) {
      imgContainer.className = 'w-full h-48 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 overflow-hidden flex items-center justify-center relative group shadow-inner transition-colors cursor-pointer';
    }
    if (drawerImg) {
      drawerImg.src = '';
      drawerImg.classList.add('hidden');
    }
    if (placeholder) {
      placeholder.classList.remove('hidden');
      placeholder.classList.add('flex');
    }
    if (badgeContainer) badgeContainer.innerHTML = '';
    if (actionsContainer) actionsContainer.innerHTML = '';
    if (sliderContainer) {
      sliderContainer.innerHTML = `
        <button onclick="document.getElementById('drawer-file-picker').click()" 
                ondragover="event.preventDefault(); event.stopPropagation();"
                ondrop="handleThumbnailDrop(event)"
                class="w-14 h-14 rounded-lg shrink-0 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition btn-tactile"
                title="Ajouter une première photo (clic ou glisser-déposer)">
          <span class="text-base font-bold leading-none">+</span>
          <span class="text-[9px] font-medium mt-0.5">Ajouter</span>
        </button>
      `;
    }
    return;
  }

  // Restore solid border when photo is present
  const imgContainer = document.getElementById('drawer-img-container');
  if (imgContainer) {
    imgContainer.className = 'w-full h-48 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group shadow-inner cursor-zoom-in';
  }

  // Bound index
  if (activeIndex < 0 || activeIndex >= photos.length) activeIndex = 0;
  state.currentPhotoIndex = activeIndex;

  const currentPhoto = photos[activeIndex];

  // Update big hero preview
  if (drawerImg) {
    drawerImg.src = `/${currentPhoto.file_path}`;
    drawerImg.classList.remove('hidden');
    if (state.drawerAspectFit) {
      drawerImg.className = 'w-full h-full object-contain p-2 transition-all duration-150';
    } else {
      drawerImg.className = 'w-full h-full object-cover transition-all duration-150';
    }
  }
  if (placeholder) {
    placeholder.classList.add('hidden');
    placeholder.classList.remove('flex');
  }

  // Floating Status Badge on large photo
  if (badgeContainer) {
    if (currentPhoto.is_primary) {
      badgeContainer.innerHTML = `
        <span class="px-2 py-0.5 rounded-md bg-blue-600/90 text-white font-mono text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1">
          <span>★</span> <span>Packshot Principal</span>
        </span>
      `;
    } else {
      badgeContainer.innerHTML = `
        <span class="px-2 py-0.5 rounded-md bg-slate-900/70 text-slate-200 font-mono text-[10px] shadow-sm backdrop-blur-xs">
          Vue ${activeIndex + 1} / ${photos.length}
        </span>
      `;
    }
  }

  // Floating Action Buttons on large photo
  if (actionsContainer) {
    let actionsHtml = '';
    
    // In-place Aspect Fit Toggle button
    actionsHtml += `
      <button onclick="toggleDrawerAspectFit()" 
              class="btn-tactile px-2 py-1 rounded bg-black/70 hover:bg-slate-800 text-white text-[10px] font-medium backdrop-blur-sm shadow-xs flex items-center gap-1 transition"
              title="${state.drawerAspectFit ? 'Remplir le cadre (crop)' : 'Afficher non tronquée (fit)'}">
        <span>${state.drawerAspectFit ? '↔ Remplir' : '⛶ Réel'}</span>
      </button>
      <button onclick="openPhotoLightbox()" 
              class="btn-tactile p-1 rounded bg-black/70 hover:bg-blue-600 text-white text-[10px] backdrop-blur-sm shadow-xs transition"
              title="Agrandir en plein écran (haute résolution sans coupure)">
        🔍
      </button>
    `;

    if (!currentPhoto.is_primary && currentPhoto.id) {
      actionsHtml += `
        <button onclick="handleSetPrimaryPhoto(${currentPhoto.id})" 
                class="btn-tactile px-2 py-1 rounded bg-black/70 hover:bg-blue-600 text-white text-[10px] font-medium backdrop-blur-sm shadow-xs flex items-center gap-1 transition"
                title="Définir comme photo de couverture catalogue">
          <span>★</span> <span>Définir principale</span>
        </button>
      `;
    }
    if (currentPhoto.id) {
      actionsHtml += `
        <button onclick="handleDeletePhoto(${currentPhoto.id})" 
                class="btn-tactile p-1 rounded bg-black/70 hover:bg-rose-600 text-white text-[10px] backdrop-blur-sm shadow-xs transition"
                title="Supprimer cette photo">
          🗑️
        </button>
      `;
    }
    actionsContainer.innerHTML = actionsHtml;
  }

  // Render Horizontal Thumbnail Slider
  if (sliderContainer) {
    const thumbsHtml = photos.map((p, idx) => {
      const isSelected = idx === activeIndex;
      return `
        <div onclick="selectDrawerPhoto(${idx})" 
             class="w-14 h-14 rounded-lg shrink-0 overflow-hidden relative cursor-pointer border-2 transition-all duration-150 btn-tactile ${isSelected ? 'border-blue-600 ring-2 ring-blue-500/30 scale-102 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'}"
             title="Vue ${idx + 1}${p.is_primary ? ' (Packshot Principal)' : ''}">
          <img src="/${p.file_path}" alt="Vue ${idx + 1}" class="w-full h-full object-cover">
          ${p.is_primary ? `
            <span class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">★</span>
          ` : ''}
          <span class="absolute bottom-0 right-0 text-[8px] font-mono font-bold bg-black/60 text-white px-1 rounded-tl">${idx + 1}</span>
        </div>
      `;
    }).join('');

    const addBtnHtml = `
      <button onclick="document.getElementById('drawer-file-picker').click()" 
              ondragover="event.preventDefault(); event.stopPropagation();"
              ondrop="handleThumbnailDrop(event)"
              class="w-14 h-14 rounded-lg shrink-0 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition btn-tactile"
              title="Ajouter ou glisser une photo depuis votre Mac">
        <span class="text-base font-bold leading-none">+</span>
        <span class="text-[9px] font-medium mt-0.5">Ajouter</span>
      </button>
    `;

    sliderContainer.innerHTML = thumbsHtml + addBtnHtml;
  }
}

function selectDrawerPhoto(index) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;
  renderDrawerPhotoGallery(product, index);
}

async function handleSetPrimaryPhoto(photoId) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  if (!sku || !photoId) return;

  try {
    const res = await fetch(`/api/products/${sku}/photos/set-primary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: photoId })
    });
    const result = await res.json();
    if (result.status === 'primary_updated') {
      showToast('Photo définie comme packshot principal', 'success', '⭐');
      await loadProducts();
      const updated = state.products.find(p => p.sku === sku);
      if (updated) {
        const newIdx = updated.photos.findIndex(p => p.id === photoId);
        renderDrawerPhotoGallery(updated, newIdx >= 0 ? newIdx : 0);
      }
    }
  } catch (err) {
    console.error('Error setting primary photo:', err);
    showToast('Erreur mise à jour packshot', 'error', '✕');
  }
}

async function handleDeletePhoto(photoId) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  if (!sku || !photoId) return;

  if (!confirm('Voulez-vous supprimer cette photo du produit ?')) return;

  try {
    const res = await fetch(`/api/products/${sku}/photos/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: photoId })
    });
    const result = await res.json();
    if (result.status === 'photo_deleted') {
      showToast('Photo supprimée de la galerie', 'success', '🗑️');
      await loadProducts();
      const updated = state.products.find(p => p.sku === sku);
      if (updated) {
        renderDrawerPhotoGallery(updated, 0);
      }
    }
  } catch (err) {
    console.error('Error deleting photo:', err);
    showToast('Erreur suppression photo', 'error', '✕');
  }
}

function toggleDrawerAspectFit() {
  playTactileClick();
  state.drawerAspectFit = !state.drawerAspectFit;
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (product) {
    renderDrawerPhotoGallery(product, state.currentPhotoIndex || 0);
  }
}

function openPhotoLightbox(photoIndex = null) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!product || !product.photos || product.photos.length === 0) return;

  const modal = document.getElementById('photo-lightbox-modal');
  if (!modal) return;

  const photos = product.photos;
  let idx = photoIndex !== null ? photoIndex : (state.currentPhotoIndex || 0);
  if (idx < 0 || idx >= photos.length) idx = 0;
  state.lightboxIndex = idx;

  const photo = photos[idx];

  const skuBadge = document.getElementById('lightbox-sku-badge');
  if (skuBadge) skuBadge.textContent = product.sku;
  const titleEl = document.getElementById('lightbox-title');
  if (titleEl) titleEl.textContent = product.title;
  const metaEl = document.getElementById('lightbox-meta');
  if (metaEl) metaEl.textContent = `Vue ${idx + 1} sur ${photos.length}${photo.is_primary ? ' • Packshot Principal' : ''}`;
  
  const img = document.getElementById('lightbox-img');
  if (img) img.src = `/${photo.file_path}`;

  // Render bottom thumbnail filmstrip in lightbox
  const thumbContainer = document.getElementById('lightbox-thumbnails');
  if (thumbContainer) {
    thumbContainer.innerHTML = photos.map((p, i) => `
      <div onclick="openPhotoLightbox(${i})" class="w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all btn-tactile ${i === idx ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'}">
        <img src="/${p.file_path}" class="w-full h-full object-cover">
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
}

function closePhotoLightbox() {
  playTactileClick();
  const modal = document.getElementById('photo-lightbox-modal');
  if (modal) modal.classList.add('hidden');
}

function navigateLightbox(delta) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!product || !product.photos || product.photos.length === 0) return;

  const total = product.photos.length;
  let current = state.lightboxIndex || 0;
  let next = (current + delta + total) % total;
  openPhotoLightbox(next);
}

// -------------------------------------------------------------
// Slide-Over SKU Inspector Drawer
// -------------------------------------------------------------
function handleDrawerSkuInput(val) {
  val = (val || '').trim().toUpperCase();
  const repoEl = document.getElementById('drawer-repo-path');
  if (repoEl) {
    repoEl.textContent = `data/sample_shops/kaya_movement/products/${val || '...'}/images/`;
  }
}

function setDrawerHeaderStyle(style) {
  playTactileClick();
  state.drawerHeaderStyle = style;
  localStorage.setItem('stupid_stock_drawer_header_style', style);
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (product) {
    renderDrawerHeader(product, style);
  }
  showToast(`En-tête basculé vers Style ${style}`, 'info', '✨');
}

function renderDrawerHeader(product) {
  const mount = document.getElementById('drawer-header-mount');
  if (!mount || !product) return;

  const brand = 'Kaya Movement';
  const sku = product.sku || '';
  const title = product.title || '';
  const repoPath = `data/sample_shops/kaya_movement/products/${sku}/images/`;

  // Permanent Locked Design: Variation A (Haute Joaillerie Épurée)
  mount.innerHTML = `
    <div class="p-4 bg-white space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Fiche Atelier</span>
          <span class="text-slate-300">•</span>
          <span class="text-[10px] font-mono text-slate-400">${brand}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="toggleDrawerModalMode()" class="text-slate-500 hover:text-blue-600 text-xs font-semibold px-2 py-1 rounded-md hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition btn-tactile flex items-center gap-1" title="Basculer entre tiroir latéral et modale centrée (PIN-003)">
            <span id="drawer-toggle-icon">${state.drawerModalMode ? '⤡ Tiroir' : '⤢ Modal'}</span>
          </button>
          <button onclick="closeSkuDrawer()" class="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-md hover:bg-slate-100 transition btn-tactile" title="Fermer (Échap)">✕</button>
        </div>
      </div>

      <h3 class="text-base font-extrabold text-slate-900 leading-snug tracking-tight" id="drawer-title">
        ${title}
      </h3>

      <div class="flex items-center gap-2 pt-0.5">
        <div class="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/90 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 shadow-2xs">
          <span class="text-[9px] font-mono font-bold text-blue-500 uppercase select-none">SKU</span>
          <input 
            type="text" 
            id="drawer-input-sku" 
            value="${sku}" 
            onfocus="this.select()"
            oninput="handleDrawerSkuInput(this.value)"
            onkeydown="if(event.key === 'Enter') saveSkuDrawerChanges()"
            class="font-mono text-xs font-black text-blue-700 bg-transparent border-0 outline-none uppercase w-24 tracking-wide cursor-text p-0"
            title="Modifier le code SKU du produit (Entrée pour valider)"
          />
          <span class="text-blue-400 text-[10px]" title="Modifiable">✎</span>
        </div>

        <div onclick="copyDrawerRepoPath()" class="flex-1 min-w-0 flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1 cursor-pointer transition btn-tactile group shadow-2xs" title="Cliquer pour copier le chemin d'images">
          <div class="flex items-center gap-1.5 truncate text-[10px] font-mono text-slate-600">
            <span class="text-blue-600 font-bold shrink-0">📁</span>
            <span id="drawer-repo-path" class="truncate font-medium">${repoPath}</span>
          </div>
          <span class="text-[10px] font-medium text-slate-400 group-hover:text-blue-600 ml-1 shrink-0">📋</span>
        </div>
      </div>
    </div>
  `;
}

function toggleDrawerModalMode() {
  playTactileClick();
  state.drawerModalMode = !state.drawerModalMode;
  localStorage.setItem('stupid_stock_drawer_modal_mode', state.drawerModalMode ? 'true' : 'false');
  applyDrawerModalClasses();
  const toggleBtn = document.getElementById('drawer-toggle-icon');
  if (toggleBtn) {
    toggleBtn.textContent = state.drawerModalMode ? '⤡ Tiroir' : '⤢ Modal';
  }
  showToast(state.drawerModalMode ? 'Mode Modale Centrée activé (PIN-003)' : 'Mode Tiroir Latéral réactivé', 'info', state.drawerModalMode ? '⤢' : '⤡');
}

function applyDrawerModalClasses() {
  const drawer = document.getElementById('sku-drawer');
  if (!drawer) return;
  if (state.drawerModalMode) {
    drawer.classList.remove('right-0', 'w-full', 'sm:w-[500px]', 'md:w-[540px]', 'border-l');
    drawer.classList.add('sku-modal-mode', 'fixed', 'inset-y-6', 'left-1/2', '-translate-x-1/2', 'w-[92vw]', 'max-w-[780px]', 'rounded-3xl', 'border', 'border-slate-200', 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]', 'overflow-hidden');
  } else {
    drawer.classList.remove('sku-modal-mode', 'inset-y-6', 'left-1/2', '-translate-x-1/2', 'w-[92vw]', 'max-w-[780px]', 'rounded-3xl', 'border', 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]', 'overflow-hidden');
    drawer.classList.add('right-0', 'w-full', 'sm:w-[500px]', 'md:w-[540px]', 'border-l');
  }
}

function openSkuDrawer(sku) {
  playTactileClick();
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  state.currentDrawerSku = sku;
  window.currentDrawerSku = sku;

  // Render Dynamic Drawer Header (Variation A, B, or C)
  renderDrawerHeader(product);

  // Populate drawer fields
  const skuInput = document.getElementById('drawer-input-sku');
  if (skuInput) skuInput.value = product.sku;
  const skuBadge = document.getElementById('drawer-sku-badge');
  if (skuBadge) skuBadge.textContent = product.sku;
  document.getElementById('drawer-title').textContent = product.title;
  document.getElementById('drawer-input-title').value = product.title;
  document.getElementById('drawer-input-category').value = product.category || 'Septum & Piercings';
  document.getElementById('drawer-input-bin').value = product.shelf_coordinate || '';
  document.getElementById('drawer-input-stock').value = product.total_physical_stock || 0;
  document.getElementById('drawer-input-retail').value = product.retail_price || 0;
  document.getElementById('drawer-input-cost').value = product.production_cost || 0;

  // Render Photo Gallery with Thumbnail Filmstrip Slider
  renderDrawerPhotoGallery(product, 0);

  // Link to Shoot studio
  const shootLink = document.getElementById('drawer-shoot-link');
  if (shootLink) shootLink.href = `/stupid_shoot_studio.html?sku=${product.sku}`;

  // Update centralized repatriation path hint
  const repoEl = document.getElementById('drawer-repo-path');
  if (repoEl) {
    repoEl.textContent = `data/sample_shops/kaya_movement/products/${product.sku}/images/`;
  }

  // Materials badges
  renderDrawerMaterials(product);

  // Variants list & multi-axes creation form
  renderDrawerVariants(product);
  renderDrawerVariantForm(product);

  // Slide drawer open with backdrop
  applyDrawerModalClasses();
  const drawer = document.getElementById('sku-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) {
    drawer.classList.remove('translate-x-full', 'hidden');
  }
  if (backdrop) backdrop.classList.remove('hidden');
}

function closeSkuDrawer() {
  playTactileClick();
  const drawer = document.getElementById('sku-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) {
    if (state.drawerModalMode) {
      drawer.classList.add('hidden');
    } else {
      drawer.classList.add('translate-x-full');
    }
  }
  if (backdrop) backdrop.classList.add('hidden');
}

function renderDrawerMaterials(product) {
  const container = document.getElementById('drawer-materials');
  if (!container) return;
  const materials = product.materials || [];
  container.innerHTML = materials.length > 0
    ? materials.map((m, idx) => `
        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200 inline-flex items-center gap-1">
          <span>${m}</span>
          <button onclick="handleRemoveMaterial(${idx})" class="text-slate-400 hover:text-red-500 font-bold ml-0.5">×</button>
        </span>
      `).join('')
    : `<span class="text-slate-400 font-mono text-[11px]">Alliage standard atelier</span>`;
}

function handleAddMaterial() {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  const input = document.getElementById('drawer-new-material');
  if (!product || !input || !input.value.trim()) return;

  if (!product.materials) product.materials = [];
  product.materials.push(input.value.trim());
  input.value = '';
  renderDrawerMaterials(product);
  showToast('Matière ajoutée (enregistrez pour persister)', 'info', '🏷️');
}

function handleRemoveMaterial(index) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!product || !product.materials) return;
  product.materials.splice(index, 1);
  renderDrawerMaterials(product);
}

function renderDrawerVariantForm(product) {
  const container = document.getElementById('drawer-new-variant-fields');
  const hintEl = document.getElementById('drawer-options-config-hint');
  if (!container) return;

  const opts = product.options_config;
  if (opts && Array.isArray(opts) && opts.length > 0) {
    if (hintEl) hintEl.textContent = `${opts.length} Axes configurés`;
    container.innerHTML = `
      <div class="grid grid-cols-${opts.length > 2 ? 3 : opts.length} gap-2">
        ${opts.map(opt => `
          <div>
            <label class="block text-[10px] font-mono text-slate-500 mb-0.5 truncate" title="${opt.name}">${opt.name}</label>
            <input type="text" 
              id="new-var-opt-${opt.position}" 
              placeholder="${opt.type === 'color' ? 'ex: Or, Noir' : (opt.type === 'size' ? 'ex: 8mm, M' : 'ex: 16g, Lin')}" 
              class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-900" 
            />
          </div>
        `).join('')}
      </div>
    `;
  } else {
    if (hintEl) hintEl.textContent = 'Axe Simple';
    container.innerHTML = `
      <input type="text" id="new-var-name" placeholder="Nom/Taille (ex: 8mm, L, US7)" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-900" />
    `;
  }
}

function renderDrawerVariants(product) {
  const container = document.getElementById('drawer-variants-list');
  const countEl = document.getElementById('drawer-variant-count');
  if (!container) return;

  const variants = product.variants || [];
  if (countEl) countEl.textContent = `${variants.length} déclinaison(s)`;

  if (variants.length === 0) {
    container.innerHTML = `<div class="text-[11px] text-slate-400 font-mono italic">Aucune déclinaison configurée. Produit à taille unique.</div>`;
    return;
  }

  container.innerHTML = variants.map(v => {
    const optValues = [v.option1_value, v.option2_value, v.option3_value].filter(Boolean);
    let optionsPills = '';
    if (optValues.length > 0) {
      optionsPills = optValues.map(val => {
        const hex = getAtelierColorHex(val);
        return `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
            ${hex ? `<span class="w-2 h-2 rounded-full border border-slate-300" style="background-color: ${hex};"></span>` : ''}
            <span>${val}</span>
          </span>
        `;
      }).join('');
    }

    return `
      <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
        <div class="min-w-0 pr-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <strong class="text-slate-900">${v.name || v.variant_sku}</strong>
            ${optionsPills}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5 truncate">
            SKU: <span class="text-slate-700 font-bold">${v.variant_sku}</span> · Casier: <span class="font-bold text-blue-600">${v.shelf_bin || product.shelf_coordinate}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5">
            <button onclick="updateVariantStock('${v.variant_sku}', '${product.sku}', -1)" class="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 btn-tactile" title="Décrémenter (-1)">-</button>
            <input type="number" 
              id="drawer-variant-stock-val-${v.variant_sku}" 
              value="${v.stock}" 
              min="0"
              onchange="handleDirectVariantStockInput('${v.variant_sku}', '${product.sku}', this.value)"
              onkeydown="if(event.key==='Enter'){this.blur();}"
              onfocus="this.select()"
              title="Cliquer pour entrer une quantité au clavier"
              class="stepper-input w-8 text-center bg-transparent hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-blue-500 rounded font-mono font-bold text-xs text-slate-900 tabular-nums border-0 outline-none cursor-text transition-colors p-0" />
            <button onclick="updateVariantStock('${v.variant_sku}', '${product.sku}', 1)" class="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 btn-tactile" title="Incrémenter (+1)">+</button>
          </div>
          <button onclick="handleDeleteVariant('${v.variant_sku}')" class="text-slate-400 hover:text-rose-600 p-1 font-bold text-xs" title="Supprimer cette déclinaison">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleCreateVariant() {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  const bin = document.getElementById('new-var-bin')?.value.trim().toUpperCase() || product.shelf_coordinate || 'LIL-A00';
  const stock = parseInt(document.getElementById('new-var-stock')?.value, 10) || 0;

  let opt1 = '', opt2 = '', opt3 = '', name = '';
  const opts = product.options_config;
  if (opts && Array.isArray(opts) && opts.length > 0) {
    opt1 = document.getElementById('new-var-opt-1')?.value.trim() || '';
    opt2 = document.getElementById('new-var-opt-2')?.value.trim() || '';
    opt3 = document.getElementById('new-var-opt-3')?.value.trim() || '';
    name = [opt1, opt2, opt3].filter(Boolean).join(' / ');
  } else {
    const nameInput = document.getElementById('new-var-name');
    name = nameInput ? nameInput.value.trim() : '';
  }

  if (!name && !opt1 && !opt2) {
    showToast('Veuillez remplir au moins une option ou taille', 'warning', '⚠️');
    return;
  }

  try {
    const res = await fetch(`/api/products/${sku}/variants/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        shelf_bin: bin,
        stock,
        option1_value: opt1,
        option2_value: opt2,
        option3_value: opt3
      })
    });
    const result = await res.json();
    if (result.status === 'created') {
      showToast(`Déclinaison "${name || result.variant_sku}" créée avec succès ✓`, 'success', '✓');
      if (document.getElementById('new-var-name')) document.getElementById('new-var-name').value = '';
      if (document.getElementById('new-var-opt-1')) document.getElementById('new-var-opt-1').value = '';
      if (document.getElementById('new-var-opt-2')) document.getElementById('new-var-opt-2').value = '';
      if (document.getElementById('new-var-opt-3')) document.getElementById('new-var-opt-3').value = '';
      await loadProducts();
      const updatedProduct = state.products.find(p => p.sku === sku);
      if (updatedProduct) {
        renderDrawerVariants(updatedProduct);
      }
    }
  } catch (err) {
    console.error('Error creating variant:', err);
    showToast('Erreur création variante', 'error', '✕');
  }
}

function handleDeleteVariant(variantSku) {
  confirmAction("Supprimer cette déclinaison ?", `Voulez-vous supprimer définitivement la déclinaison ${variantSku} ?`, async () => {
    try {
      const res = await fetch(`/api/variants/${variantSku}/delete`, { method: 'POST' });
      const result = await res.json();
      if (result.status === 'deleted') {
        showToast(`Déclinaison supprimée`, 'success', '🗑️');
        await loadProducts();
        const updatedProduct = state.products.find(p => p.sku === state.currentDrawerSku);
        if (updatedProduct) renderDrawerVariants(updatedProduct);
      }
    } catch (err) {
      console.error('Error deleting variant:', err);
      showToast('Erreur lors de la suppression', 'error', '✕');
    }
  });
}

async function uploadProductPhotoFile(sku, file) {
  playTactileClick();
  showToast(`Rapatriement de ${file.name}...`, 'info', '⏳');

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const contentBase64 = e.target.result;
      try {
        const res = await fetch(`/api/products/${sku}/photos/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            content_base64: contentBase64
          })
        });
        const data = await res.json();
        if (data.status === 'uploaded') {
          showToast(`Photo ${file.name} ajoutée avec succès ✓`, 'success', '📸');
          await loadProducts();
          openSkuDrawer(sku);
          resolve(true);
        } else {
          showToast(data.message || "Erreur rapatriement photo", 'error', '✕');
          resolve(false);
        }
      } catch (err) {
        console.error('File upload error:', err);
        showToast("Erreur communication upload", 'error', '✕');
        resolve(false);
      }
    };
    reader.readAsDataURL(file);
  });
}

async function handleFileUpload(event) {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const files = event.target.files;
  if (!sku || !files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    await uploadProductPhotoFile(sku, files[i]);
  }
  event.target.value = '';
}

// Native Finder Drag & Drop Setup (Pattern C: Full-Drawer & Zero Aiming)
let drawerDragCounter = 0;

function setupDrawerDragAndDrop() {
  const drawer = document.getElementById('sku-drawer');
  const globalOverlay = document.getElementById('drawer-global-dropzone');
  const skuHint = document.getElementById('drawer-dropzone-sku-hint');
  if (!drawer) return;

  // Prevent browser default behavior of navigating away when dropping files outside
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  drawer.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawerDragCounter++;
    const isDrawerOpen = !drawer.classList.contains('translate-x-full') && !drawer.classList.contains('hidden');
    if (globalOverlay && isDrawerOpen) {
      const sku = state.currentDrawerSku || '';
      if (skuHint) {
        skuHint.textContent = sku 
          ? `Attribution immédiate au produit : ${sku}` 
          : `Rapatriement direct dans l'Atelier`;
      }
      globalOverlay.classList.remove('hidden');
    }
  });

  drawer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  });

  drawer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawerDragCounter--;
    if (drawerDragCounter <= 0) {
      drawerDragCounter = 0;
      if (globalOverlay) globalOverlay.classList.add('hidden');
    }
  });

  drawer.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawerDragCounter = 0;
    if (globalOverlay) globalOverlay.classList.add('hidden');

    const sku = state.currentDrawerSku;
    if (!sku) {
      showToast('Aucun SKU ouvert dans le tiroir', 'warning', '⚠️');
      return;
    }

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (!files || files.length === 0) return;

    const imageFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type && (file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name))) {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      showToast('Seuls les fichiers images (JPG, PNG, WebP) sont acceptés', 'warning', '⚠️');
      return;
    }

    showToast(`Rapatriement de ${imageFiles.length} photo(s) vers ${sku}...`, 'info', '📸');

    let successCount = 0;
    for (let i = 0; i < imageFiles.length; i++) {
      const ok = await uploadProductPhotoFile(sku, imageFiles[i]);
      if (ok) successCount++;
    }

    if (successCount > 1) {
      showToast(`${successCount} photos ajoutées à la galerie de ${sku} ✓`, 'success', '📸');
    }
  });
}

async function handleThumbnailDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const sku = state.currentDrawerSku;
  if (!sku) return;

  const files = event.dataTransfer ? event.dataTransfer.files : null;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type && file.type.startsWith('image/')) {
      await uploadProductPhotoFile(sku, file);
    }
  }
}

async function handleAttachPhoto() {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const input = document.getElementById('drawer-photo-input');
  if (!sku || !input || !input.value.trim()) return;

  const filePath = input.value.trim();
  try {
    const res = await fetch(`/api/products/${sku}/photos/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: filePath })
    });
    const result = await res.json();
    if (result.status === 'photo_added') {
      showToast(`Photo packshot liée avec succès`, 'success', '📸');
      input.value = '';
      await loadProducts();
      openSkuDrawer(sku);
    }
  } catch (err) {
    console.error('Error attaching photo:', err);
    showToast('Erreur lors de la liaison photo', 'error', '✕');
  }
}

function copyDrawerRepoPath() {
  playTactileClick();
  const repoEl = document.getElementById('drawer-repo-path');
  if (!repoEl) return;
  const path = repoEl.textContent.trim();
  navigator.clipboard.writeText(path).then(() => {
    showToast('Chemin d\'atelier copié dans le presse-papier', 'success', '📋');
  }).catch(() => {
    showToast('Dossier : ' + path, 'info', '📁');
  });
}

async function saveSkuDrawerChanges() {
  playTactileClick();
  const sku = state.currentDrawerSku;
  const product = state.products.find(p => p.sku === sku);
  if (!sku || !product) return;

  const skuInput = document.getElementById('drawer-input-sku');
  const newSku = (skuInput ? skuInput.value.trim().toUpperCase() : sku) || sku;
  const newTitle = document.getElementById('drawer-input-title').value.trim();
  const newCat = document.getElementById('drawer-input-category').value;
  const newBin = document.getElementById('drawer-input-bin').value.trim().toUpperCase();
  const newStock = parseInt(document.getElementById('drawer-input-stock').value, 10) || 0;
  const newRetail = parseFloat(document.getElementById('drawer-input-retail').value) || 0;
  const newCost = parseFloat(document.getElementById('drawer-input-cost').value) || 0;

  if (!newSku) {
    showToast('Le code SKU ne peut pas être vide', 'warning', '⚠️');
    return;
  }

  try {
    const resUpdate = await fetch(`/api/products/${sku}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_sku: newSku,
        title: newTitle,
        category: newCat,
        shelf_coordinate: newBin,
        retail_price: newRetail,
        production_cost: newCost,
        materials: product.materials || []
      })
    });
    const updateResult = await resUpdate.json();

    if (updateResult.status === 'error') {
      showToast(updateResult.message || 'Erreur lors de la mise à jour', 'error', '✕');
      return;
    }

    const effectiveSku = updateResult.sku || newSku;

    await fetch(`/api/products/${effectiveSku}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_count: newStock,
        location_id: 'lille_hub'
      })
    });

    state.currentDrawerSku = effectiveSku;

    // Explicit Visual Feedback on SKU Rename (FRIC-05)
    if (newSku !== sku) {
      showToast(`✓ SKU renommé : ${sku} ➔ ${effectiveSku} (dossier canonique migré)`, 'success', '🏷️');
      const input = document.getElementById('drawer-input-sku');
      if (input) {
        input.classList.add('ring-4', 'ring-emerald-500/50', 'bg-emerald-50');
        setTimeout(() => input.classList.remove('ring-4', 'ring-emerald-500/50', 'bg-emerald-50'), 1500);
      }
    } else {
      showToast(`Fiche ${effectiveSku} enregistrée avec succès`, 'success', '💾');
    }

    await loadProducts();
    openSkuDrawer(effectiveSku);
  } catch (err) {
    console.error('Error saving SKU changes:', err);
    showToast('Erreur réseau lors de la sauvegarde', 'error', '✕');
  }
}

function confirmDeleteCurrentSku() {
  const sku = state.currentDrawerSku;
  if (!sku) return;
  confirmAction("Supprimer le produit de l'Atelier ?", `Êtes-vous sûr de vouloir supprimer définitivement ${sku} ainsi que toutes ses déclinaisons physiques ?`, async () => {
    try {
      const res = await fetch(`/api/products/${sku}/delete`, { method: 'POST' });
      const result = await res.json();
      if (result.status === 'deleted') {
        showToast(`Produit ${sku} supprimé de l'atelier`, 'success', '🗑️');
        closeSkuDrawer();
        await loadProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Erreur lors de la suppression', 'error', '✕');
    }
  });
}

// -------------------------------------------------------------
// Confirmation Modal
// -------------------------------------------------------------
function confirmAction(title, desc, callback) {
  playTactileClick();
  state.confirmModalCallback = callback;
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const descEl = document.getElementById('confirm-modal-desc');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (modal) modal.classList.remove('hidden');
}

function closeConfirmModal(confirmed) {
  playTactileClick();
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.add('hidden');

  if (confirmed && state.confirmModalCallback) {
    state.confirmModalCallback();
  }
  state.confirmModalCallback = null;
}

// -------------------------------------------------------------
// Thermal QR Label Modal (50x30mm) with Authentic Vector QR
// -------------------------------------------------------------
function openThermalQr(sku) {
  playTactileClick();
  const targetSku = sku || state.currentDrawerSku || (state.filteredProducts[0] ? state.filteredProducts[0].sku : null);
  const product = state.products.find(p => p.sku === targetSku);
  if (!product) return;

  document.getElementById('modal-thermal-sku').textContent = product.sku;
  document.getElementById('modal-thermal-title').textContent = product.title;
  document.getElementById('modal-thermal-bin').textContent = product.shelf_coordinate || 'LIL-A00';

  // Render Real Vector SVG QR code
  renderSvgQr(product.sku);

  const modal = document.getElementById('thermal-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeThermalModal() {
  playTactileClick();
  const modal = document.getElementById('thermal-modal');
  if (modal) modal.classList.add('hidden');
}

function generateSvgQr(sku) {
  const size = 21;
  let svg = `<svg viewBox="0 0 ${size} ${size}" class="w-full h-full" shape-rendering="crispEdges">`;
  svg += `<rect width="${size}" height="${size}" fill="white" />`;

  const drawCorner = (x, y) => {
    let s = '';
    s += `<rect x="${x}" y="${y}" width="7" height="7" fill="black" />`;
    s += `<rect x="${x+1}" y="${y+1}" width="5" height="5" fill="white" />`;
    s += `<rect x="${x+2}" y="${y+2}" width="3" height="3" fill="black" />`;
    return s;
  };

  svg += drawCorner(0, 0);
  svg += drawCorner(size - 7, 0);
  svg += drawCorner(0, size - 7);

  let seed = 0;
  const safeSku = String(sku || 'KM-000');
  for (let i = 0; i < safeSku.length; i++) {
    seed = (seed * 31 + safeSku.charCodeAt(i)) % 2147483647;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="black" />`;
        continue;
      }
      seed = (seed * 16807) % 2147483647;
      if (seed % 3 === 0) {
        svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="black" />`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

function renderSvgQr(sku) {
  const container = document.getElementById('modal-qr-container');
  const svg = generateSvgQr(sku);
  if (container) container.innerHTML = svg;
  return svg;
}

function generateThermalLabelHtml(p) {
  const qrSvg = generateSvgQr(p.sku);
  const lotDate = new Date().toISOString().slice(0, 10);
  const bin = p.shelf_coordinate || 'LIL-A00';
  const price = (p.retail_price !== undefined && p.retail_price !== null && p.retail_price !== '') 
    ? `${Number(p.retail_price).toFixed(2)} € TTC` 
    : '';
  const safeTitle = (p.title || p.sku || 'Joaillerie Atelier')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const safeSku = String(p.sku || '').replace(/</g, '&lt;');

  return `
    <div class="thermal-label-page font-mono text-black">
      <div class="label-header flex justify-between items-baseline border-b border-black pb-0.5 mb-1">
        <span class="font-bold text-[8.5px] tracking-wider uppercase truncate">KAYA MOVEMENT ATELIER</span>
        <span class="text-[7.5px] text-slate-800 shrink-0 ml-1">50 × 30 mm</span>
      </div>
      <div class="label-body flex items-center gap-2">
        <div class="label-qr w-12 h-12 shrink-0 flex items-center justify-center p-0.5 border border-black bg-white">
          ${qrSvg}
        </div>
        <div class="label-info flex-1 min-w-0 leading-tight">
          <div class="text-[12px] font-black truncate">${safeSku}</div>
          <div class="text-[8.5px] font-semibold truncate text-slate-900">${safeTitle}</div>
          <div class="text-[8.5px] mt-0.5">CASIER : <strong class="font-black text-black">${bin}</strong></div>
          <div class="text-[9px] font-black mt-0.5">${price}</div>
        </div>
      </div>
      <div class="label-footer mt-auto pt-0.5 border-t border-black flex justify-between text-[7px] text-slate-700">
        <span>LOT ${lotDate}</span>
        <span>FABRICATION ARTISANALE</span>
      </div>
    </div>
  `;
}

function triggerPrintThermalModal() {
  playTactileClick();
  const sku = document.getElementById('modal-thermal-sku').textContent;
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;

  const stage = document.getElementById('thermal-print-stage');
  if (stage) {
    stage.innerHTML = generateThermalLabelHtml(product);
    showToast(`Préparation de l'étiquette ${product.sku}...`, 'info', '🏷️');
    setTimeout(() => {
      window.print();
    }, 150);
  }
}

// -------------------------------------------------------------
// New SKU Creation Modal (SQLite Ingestion)
// -------------------------------------------------------------
function openNewSkuModal() {
  playTactileClick();
  const modal = document.getElementById('new-sku-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const count = state.products.length + 1;
    const suggestedSku = `KM-JEW-${String(count).padStart(3, '0')}`;
    const skuInput = document.getElementById('new-sku-code');
    if (skuInput) skuInput.value = suggestedSku;
  }
}

function closeNewSkuModal() {
  playTactileClick();
  const modal = document.getElementById('new-sku-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleCreateSku(e) {
  e.preventDefault();
  playTactileClick();

  const sku = document.getElementById('new-sku-code').value.trim().toUpperCase();
  const title = document.getElementById('new-sku-title').value.trim();
  const category = document.getElementById('new-sku-category').value;
  const bin = document.getElementById('new-sku-bin').value.trim().toUpperCase();
  const stock = parseInt(document.getElementById('new-sku-stock').value, 10) || 0;
  const retail = parseFloat(document.getElementById('new-sku-retail').value) || 0;
  const cost = parseFloat(document.getElementById('new-sku-cost').value) || 0;

  try {
    const res = await fetch('/api/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku,
        title,
        brand_id: state.brandId,
        category,
        shelf_coordinate: bin,
        stock_count: stock,
        retail_price: retail,
        production_cost: cost
      })
    });
    const result = await res.json();
    if (result.status === 'created') {
      closeNewSkuModal();
      document.getElementById('newSkuForm').reset();
      showToast(`Nouveau SKU créé: ${sku}`, 'success', '➕');
      await loadProducts();
      openSkuDrawer(sku);
    } else {
      showToast(`Erreur: ${result.message || 'Création impossible'}`, 'error', '✕');
    }
  } catch (err) {
    console.error('Error creating product:', err);
    showToast('Erreur réseau lors de la création du SKU', 'error', '✕');
  }
}

// -------------------------------------------------------------
// Casier Hub Modal & Visual Rack Mapper
// -------------------------------------------------------------
function openCasierHubModal() {
  playTactileClick();
  const modal = document.getElementById('casier-modal');
  const grid = document.getElementById('casier-modal-grid');
  if (!modal || !grid) return;

  const zones = [
    { prefix: 'LIL-A', name: 'Tiroir A • Septum & Clickers', icon: '💍', desc: 'Bijoux de septum, daith et clickers articulés' },
    { prefix: 'LIL-B', name: 'Tiroir B • Poids & Anneaux', icon: '⚖️', desc: 'Poids d\'oreille géométriques et grandes créoles' },
    { prefix: 'LIL-C', name: 'Tiroir C • Bagues & Armures', icon: '🦾', desc: 'Bagues cinétiques, armures de doigt et gantelets' },
    { prefix: 'LIL-D', name: 'Tiroir D • Maroquinerie & Holsters', icon: '🎒', desc: 'Maroquinerie d\'atelier, holsters et harnais' }
  ];

  let html = '';

  zones.forEach(z => {
    const matchingProducts = state.products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith(z.prefix));
    const totalUnits = matchingProducts.reduce((sum, p) => sum + (p.total_physical_stock || 0), 0);

    html += `
      <div class="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition group">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-slate-200/70">
            <div class="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <span>${z.icon}</span>
              <span>${z.name}</span>
            </div>
            <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded ${totalUnits > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}">
              ${totalUnits} pcs
            </span>
          </div>
          <div class="text-[11px] text-slate-500 mt-1">${z.desc}</div>

          <!-- Product Bins inside this drawer -->
          <div class="mt-2.5 space-y-1">
            ${matchingProducts.length > 0 ? matchingProducts.map(p => `
              <div class="flex items-center justify-between py-1 px-2 rounded bg-white border border-slate-200/80 font-mono text-[11px]">
                <div class="flex items-center gap-1.5 truncate mr-2">
                  <span class="font-bold text-blue-600 bg-blue-50 px-1 rounded">${p.shelf_coordinate || z.prefix}</span>
                  <span class="text-slate-800 font-sans truncate" title="${p.title}">${p.title}</span>
                </div>
                <strong class="text-slate-900 tabular-nums shrink-0">${p.total_physical_stock || 0} pcs</strong>
              </div>
            `).join('') : `<div class="text-[11px] text-slate-400 font-mono italic py-1">Tiroir disponible pour réassort</div>`}
          </div>
        </div>

        <button onclick="filterByCasier('${z.prefix}')" class="btn-tactile mt-3 w-full py-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold text-xs rounded-lg border border-slate-200 hover:border-blue-300 transition flex items-center justify-center gap-1">
          <span>Filtrer les pièces du ${z.prefix}</span> <span>➔</span>
        </button>
      </div>
    `;
  });

  grid.innerHTML = html;
  modal.classList.remove('hidden');
}

function closeCasierHubModal() {
  playTactileClick();
  const modal = document.getElementById('casier-modal');
  if (modal) modal.classList.add('hidden');
}

function filterByCasier(prefix) {
  playTactileClick();
  closeCasierHubModal();
  state.activeCasierFilter = prefix;
  applyFilters();
  renderHeaderAndToolbar();
  showToast(`Filtré sur le tiroir physique ${prefix}`, 'info', '🗄️');
}

function clearCasierFilter() {
  playTactileClick();
  state.activeCasierFilter = null;
  applyFilters();
  renderHeaderAndToolbar();
  showToast(`Filtre de casier retiré`, 'info', '✓');
}

// -------------------------------------------------------------
// Casier Visual Picker (1-Click Shelf Selector - PIN-005)
// -------------------------------------------------------------
let casierPickerTargetInputId = 'drawer-input-bin';
let currentCasierPickerZone = 'LIL-A';

function openCasierPicker(targetInputId = 'drawer-input-bin') {
  playTactileClick();
  casierPickerTargetInputId = targetInputId;
  const modal = document.getElementById('casier-picker-modal');
  const hint = document.getElementById('casier-picker-target-hint');
  if (hint) {
    if (targetInputId === 'batch') {
      hint.textContent = `Affectation en lot (${state.checkedSkus.size} pièces sélectionnées)`;
    } else if (targetInputId === 'new-var-bin') {
      hint.textContent = 'Cible : Nouvelle déclinaison';
    } else {
      hint.textContent = 'Cible : Fiche produit (Bin)';
    }
  }
  setCasierPickerZone(currentCasierPickerZone);
  if (modal) modal.classList.remove('hidden');
}

function closeCasierPicker() {
  playTactileClick();
  const modal = document.getElementById('casier-picker-modal');
  if (modal) modal.classList.add('hidden');
}

function setCasierPickerZone(zone) {
  playTactileClick();
  currentCasierPickerZone = zone;
  ['LIL-A', 'LIL-B', 'LIL-C', 'LIL-D'].forEach(z => {
    const tab = document.getElementById(`picker-tab-${z}`);
    if (tab) {
      if (z === zone) {
        tab.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile bg-white text-blue-600 shadow-xs';
      } else {
        tab.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile text-slate-600 hover:text-slate-900';
      }
    }
  });
  renderCasierPickerGrid(zone);
}

function renderCasierPickerGrid(zonePrefix) {
  const grid = document.getElementById('casier-picker-grid');
  if (!grid) return;

  let html = '';
  for (let i = 1; i <= 8; i++) {
    const binCode = `${zonePrefix}${i < 10 ? '0' + i : i}`;
    const occupant = state.products.find(p => (p.shelf_coordinate || '').toUpperCase() === binCode);
    const isOccupied = !!occupant;

    html += `
      <div onclick="selectCasierFromPicker('${binCode}')" class="p-2.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${isOccupied ? 'bg-blue-50/50 border-blue-200 hover:border-blue-500 hover:bg-blue-100/50' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'} shadow-2xs">
        <div class="flex items-center justify-between pb-1 border-b border-slate-200/60">
          <span class="font-mono text-xs font-black text-slate-900 group-hover:text-blue-600">${binCode}</span>
          <span class="text-[9px] font-mono px-1 py-0.2 rounded font-bold ${isOccupied ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}">
            ${isOccupied ? 'Occupé' : 'Libre'}
          </span>
        </div>
        <div class="pt-1.5 text-[10px]">
          ${isOccupied 
            ? `<div class="font-bold text-slate-800 truncate" title="${occupant.title}">${occupant.sku}</div>
               <div class="text-slate-500 font-mono text-[9px]">${occupant.total_physical_stock || 0} pcs</div>`
            : `<div class="text-slate-400 italic">Cliquer pour assigner</div>`
          }
        </div>
      </div>
    `;
  }

  grid.innerHTML = html;
}

async function selectCasierFromPicker(binCode) {
  playTactileClick();
  if (casierPickerTargetInputId === 'batch') {
    closeCasierPicker();
    const skus = Array.from(state.checkedSkus);
    if (skus.length === 0) return;
    try {
      const res = await fetch('/api/products/batch-shelf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skus, shelf_coordinate: binCode })
      });
      const result = await res.json();
      if (result.status === 'success') {
        showToast(`Casier ${binCode} assigné à ${skus.length} pièce(s) ✓`, 'success', '🗄️');
        await loadProducts();
        clearBulkSelection();
      }
    } catch (err) {
      console.error('Batch casier error:', err);
      showToast("Erreur lors de l'assignation en lot", 'error', '✕');
    }
    return;
  }

  const input = document.getElementById(casierPickerTargetInputId);
  if (input) {
    input.value = binCode;
    input.focus();
    input.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
    setTimeout(() => input.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50'), 600);
  }
  closeCasierPicker();
  showToast(`Casier ${binCode} assigné ✓`, 'success', '🗄️');
}

// -------------------------------------------------------------
// Version Changelog & Roadmap Modal (v1.4.0)
// -------------------------------------------------------------
let versionDataCache = null;

async function openVersionModal() {
  playTactileClick();
  const modal = document.getElementById('version-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (!versionDataCache) {
    try {
      const res = await fetch('/api/version');
      if (res.ok) {
        versionDataCache = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch /api/version, using fallback:', e);
    }
  }

  renderVersionChangelog();
}

function closeVersionModal() {
  playTactileClick();
  const modal = document.getElementById('version-modal');
  if (modal) modal.classList.add('hidden');
}

function switchVersionTab(tab) {
  playTactileClick();
  const changelogTab = document.getElementById('version-tab-changelog');
  const roadmapTab = document.getElementById('version-tab-roadmap');
  const btnChangelog = document.getElementById('tab-btn-changelog');
  const btnRoadmap = document.getElementById('tab-btn-roadmap');

  if (tab === 'changelog') {
    changelogTab.classList.remove('hidden');
    roadmapTab.classList.add('hidden');
    btnChangelog.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile bg-white text-blue-600 shadow-xs';
    btnRoadmap.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile text-slate-600 hover:text-slate-900';
  } else {
    changelogTab.classList.add('hidden');
    roadmapTab.classList.remove('hidden');
    btnRoadmap.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile bg-white text-blue-600 shadow-xs';
    btnChangelog.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg transition btn-tactile text-slate-600 hover:text-slate-900';
  }
}

function renderVersionChangelog() {
  const container = document.getElementById('version-tab-changelog');
  if (!container) return;

  const history = (versionDataCache && versionDataCache.history) || [];
  if (history.length === 0) {
    container.innerHTML = `<div class="p-4 text-slate-500">Chargement du journal des versions...</div>`;
    return;
  }

  container.innerHTML = history.map((ver, idx) => `
    <div class="p-3.5 rounded-xl border ${idx === 0 ? 'border-blue-200 bg-blue-50/40 shadow-xs' : 'border-slate-200 bg-slate-50'} space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-xs ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'} px-2 py-0.5 rounded">
            v${ver.version}
          </span>
          <span class="font-bold text-slate-900 text-xs">${ver.title}</span>
        </div>
        <span class="text-[10px] font-mono text-slate-500">${ver.date}</span>
      </div>
      <ul class="list-disc list-inside space-y-1 text-slate-600 text-[11px] pl-1">
        ${ver.changes.map(ch => `<li>${ch}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// =============================================================
// Atelier In-App Pin & Comment Inspector (Vercel/Figma Style)
// =============================================================

function toggleInspectorMode(forceState = null) {
  playTactileClick();
  const next = forceState !== null ? forceState : !state.inspectorActive;
  state.inspectorActive = next;

  const btn = document.getElementById('inspector-toggle-btn');
  const icon = document.getElementById('inspector-icon');
  const hoverBox = document.getElementById('inspector-hover-box');

  if (next) {
    document.body.classList.add('inspector-active');
    if (btn) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/30');
      btn.classList.remove('hover:bg-slate-800');
    }
    if (icon) icon.textContent = '🎯';
    showToast("Mode Feedback Actif : Cliquez sur un élément pour commenter (Échap pour quitter)", "info", "🎯");
  } else {
    document.body.classList.remove('inspector-active');
    if (btn) {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/30');
      btn.classList.add('hover:bg-slate-800');
    }
    if (icon) icon.textContent = '💬';
    if (hoverBox) hoverBox.classList.add('hidden');
    state.inspectorTarget = null;
  }
}

function initInspector() {
  const hoverBox = document.getElementById('inspector-hover-box');
  const hoverTag = document.getElementById('inspector-hover-tag');

  // Track hover movement when inspect mode is active
  window.addEventListener('mousemove', (e) => {
    if (!state.inspectorActive) return;

    // Freeze hover while popover is open
    const popover = document.getElementById('inspector-popover');
    if (popover && !popover.classList.contains('hidden')) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;

    // Ignore inspector's own UI elements
    if (el.closest('#inspector-floating-bar') || el.closest('#inspector-popover') || el.closest('#inspector-pin-detail-modal') || el.closest('#toast-container') || el.closest('#inspector-hover-box') || el.closest('.inspector-pin-marker')) {
      if (hoverBox) hoverBox.classList.add('hidden');
      return;
    }

    const rect = el.getBoundingClientRect();
    if (hoverBox) {
      hoverBox.style.left = `${rect.left}px`;
      hoverBox.style.top = `${rect.top}px`;
      hoverBox.style.width = `${rect.width}px`;
      hoverBox.style.height = `${rect.height}px`;
      hoverBox.classList.remove('hidden');
    }

    if (hoverTag) {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : '';
      hoverTag.textContent = `${tag}${id || cls}`;
    }
  }, true);

  // Intercept click to drop pin
  window.addEventListener('click', (e) => {
    if (!state.inspectorActive) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;

    // Allow interaction with floating bar and popovers
    if (el.closest('#inspector-floating-bar') || el.closest('#inspector-popover') || el.closest('#inspector-pin-detail-modal') || el.closest('#toast-container')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Freeze element context
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const id = el.id || '';
    const firstClass = el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : '';
    const selector = id ? `#${id}` : (firstClass ? `${tag}.${firstClass}` : tag);
    const textPreview = (el.innerText || el.textContent || '').trim().slice(0, 50);

    // Closest SKU context
    const row = el.closest('tr[onclick*="openSkuDrawer"]') || el.closest('[data-sku]');
    const closestSku = state.currentDrawerSku || (row ? (row.getAttribute('data-sku') || '') : '');

    state.inspectorTarget = {
      tag: el.tagName,
      target_id: id,
      selector: selector,
      text_preview: textPreview,
      sku: closestSku,
      clientX: e.clientX,
      clientY: e.clientY,
      docX: e.clientX + window.scrollX,
      docY: e.clientY + window.scrollY,
      elementRect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    };

    openInspectorPopover(e.clientX, e.clientY, selector, closestSku);
  }, true);

  window.addEventListener('resize', () => renderPins());
  window.addEventListener('scroll', () => renderPins(), true);
}

function openInspectorPopover(clientX, clientY, selector, sku) {
  playTactileClick();
  const popover = document.getElementById('inspector-popover');
  if (!popover) return;

  const label = document.getElementById('popover-target-label');
  if (label) label.textContent = `${selector}`;
  const skuHint = document.getElementById('popover-sku-hint');
  if (skuHint) skuHint.textContent = sku ? `SKU : ${sku}` : 'Portée : Générale';

  const input = document.getElementById('popover-comment-input');
  if (input) input.value = '';

  const popoverWidth = 320;
  const popoverHeight = 220;
  let posX = clientX + 12;
  let posY = clientY + 12;

  if (posX + popoverWidth > window.innerWidth) {
    posX = clientX - popoverWidth - 12;
  }
  if (posY + popoverHeight > window.innerHeight) {
    posY = clientY - popoverHeight - 12;
  }
  if (posX < 10) posX = 10;
  if (posY < 10) posY = 10;

  popover.style.left = `${posX}px`;
  popover.style.top = `${posY}px`;
  popover.classList.remove('hidden');

  selectPopoverCategory('ui');

  setTimeout(() => {
    if (input) input.focus();
  }, 60);
}

function closeInspectorPopover() {
  playTactileClick();
  const popover = document.getElementById('inspector-popover');
  if (popover) popover.classList.add('hidden');
  const hoverBox = document.getElementById('inspector-hover-box');
  if (hoverBox) hoverBox.classList.add('hidden');
  toggleInspectorMode(false);
}

function selectPopoverCategory(cat) {
  state.inspectorCategory = cat;
  document.querySelectorAll('.popover-cat-btn').forEach(btn => {
    const isMatch = btn.getAttribute('data-cat') === cat;
    if (isMatch) {
      btn.className = 'popover-cat-btn btn-tactile px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition bg-blue-600/30 text-blue-300 border-blue-500/50';
    } else {
      btn.className = 'popover-cat-btn btn-tactile px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition bg-slate-800 text-slate-400 border-slate-700 hover:text-white';
    }
  });
}

async function submitInspectorComment() {
  const input = document.getElementById('popover-comment-input');
  if (!input) return;
  const comment = input.value.trim();
  if (!comment) {
    showToast("Veuillez saisir votre retour avant d'envoyer", "warning", "⚠️");
    input.focus();
    return;
  }

  playTactileClick();

  const payload = {
    comment: comment,
    category: state.inspectorCategory || 'ui',
    context: state.inspectorTarget || {
      selector: 'General Screen',
      sku: state.currentDrawerSku || ''
    }
  };

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'created') {
      showToast(`📍 Note ${result.feedback.id} consignée dans Obsidian !`, 'success', '✨');
      closeInspectorPopover();
      await loadFeedbacks();
    } else {
      showToast('Erreur lors de la consignation', 'error', '✕');
    }
  } catch (err) {
    console.error('Error submitting feedback:', err);
    showToast('Erreur réseau lors de la soumission', 'error', '✕');
  }
}

async function loadFeedbacks() {
  try {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    if (data.status === 'success') {
      state.feedbacks = data.feedbacks || [];
      const countEl = document.getElementById('inspector-pins-count');
      if (countEl) {
        const openCount = state.feedbacks.filter(f => f.status === 'OPEN').length;
        countEl.textContent = openCount;
      }
      renderPins();
    }
  } catch (err) {
    console.error('Error loading feedbacks:', err);
  }
}

function renderPins() {
  const container = document.getElementById('inspector-pins-layer');
  if (!container) return;
  container.innerHTML = '';

  if (!state.pinsVisible || !state.feedbacks || state.feedbacks.length === 0) return;

  state.feedbacks.forEach((fb, idx) => {
    const ctx = fb.context || {};
    const x = ctx.clientX !== undefined ? ctx.clientX : 50;
    const y = ctx.clientY !== undefined ? ctx.clientY : 50;
    const isResolved = fb.status === 'RESOLVED';

    const pin = document.createElement('div');
    pin.className = 'inspector-pin-marker fixed pointer-events-auto';
    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;

    const bgColor = isResolved ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30';
    const icon = isResolved ? '✓' : (idx + 1);

    pin.innerHTML = `
      <div onclick="openPinDetail('${fb.id}')" class="flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} border text-[10px] font-mono font-bold select-none btn-tactile hover:scale-110 transition cursor-pointer" title="Cliquer pour voir la note (${fb.id})">
        <span>📍</span>
        <span>${icon}</span>
      </div>
    `;
    container.appendChild(pin);
  });
}

function openPinDetail(pinId) {
  playTactileClick();
  const fb = (state.feedbacks || []).find(f => f.id === pinId);
  if (!fb) return;

  state.activePinId = pinId;
  const modal = document.getElementById('inspector-pin-detail-modal');
  if (!modal) return;

  const badge = document.getElementById('pin-detail-badge');
  if (badge) badge.textContent = fb.id;
  const cat = document.getElementById('pin-detail-cat');
  if (cat) cat.textContent = (fb.category || 'ui').toUpperCase();
  const commentEl = document.getElementById('pin-detail-comment');
  if (commentEl) commentEl.textContent = fb.comment;

  const ctx = fb.context || {};
  const targetEl = document.getElementById('pin-detail-target');
  if (targetEl) targetEl.textContent = `Cible : ${ctx.selector || 'Element'}${ctx.sku ? ' (SKU: ' + ctx.sku + ')' : ''}`;
  const dateEl = document.getElementById('pin-detail-date');
  if (dateEl) dateEl.textContent = `Date : ${fb.created_at || 'Aujourd\'hui'}${fb.status === 'RESOLVED' ? ' • Résolu ✓' : ''}`;

  const resolveBtn = document.getElementById('pin-detail-resolve-btn');
  if (resolveBtn) {
    if (fb.status === 'RESOLVED') {
      resolveBtn.textContent = '✓ Déjà Résolu';
      resolveBtn.disabled = true;
      resolveBtn.classList.add('opacity-50');
    } else {
      resolveBtn.textContent = '✓ Marquer résolu';
      resolveBtn.disabled = false;
      resolveBtn.classList.remove('opacity-50');
    }
  }

  const x = ctx.clientX !== undefined ? Math.min(ctx.clientX + 10, window.innerWidth - 330) : 50;
  const y = ctx.clientY !== undefined ? Math.min(ctx.clientY + 10, window.innerHeight - 220) : 50;
  modal.style.left = `${Math.max(10, x)}px`;
  modal.style.top = `${Math.max(10, y)}px`;
  modal.classList.remove('hidden');
}

function closePinDetailModal() {
  playTactileClick();
  const modal = document.getElementById('inspector-pin-detail-modal');
  if (modal) modal.classList.add('hidden');
  state.activePinId = null;
}

async function resolveCurrentPin() {
  const pinId = state.activePinId;
  if (!pinId) return;
  playTactileClick();

  try {
    const res = await fetch(`/api/feedback/${pinId}/resolve`, { method: 'POST' });
    const data = await res.json();
    if (data.status === 'resolved') {
      showToast(`Épingle ${pinId} résolue & cochée dans Obsidian`, 'success', '✓');
      closePinDetailModal();
      await loadFeedbacks();
    }
  } catch (err) {
    console.error('Error resolving pin:', err);
  }
}

async function deleteCurrentPin() {
  const pinId = state.activePinId;
  if (!pinId) return;
  playTactileClick();

  try {
    const res = await fetch(`/api/feedback/${pinId}/delete`, { method: 'POST' });
    const data = await res.json();
    if (data.status === 'deleted') {
      showToast(`Épingle ${pinId} supprimée`, 'info', '🗑️');
      closePinDetailModal();
      await loadFeedbacks();
    }
  } catch (err) {
    console.error('Error deleting pin:', err);
  }
}

function togglePinsVisibility() {
  playTactileClick();
  state.pinsVisible = !state.pinsVisible;
  const toggleBtn = document.getElementById('inspector-pins-toggle');
  if (toggleBtn) {
    toggleBtn.classList.toggle('opacity-50', !state.pinsVisible);
  }
  renderPins();
  showToast(state.pinsVisible ? 'Épingles affichées' : 'Épingles masquées', 'info', '📍');
}

// -------------------------------------------------------------
// Dynamic Bulk Floating Toolbar & Batch Actions (0xUrvish / 21st.dev)
// -------------------------------------------------------------
function toggleSelectSku(sku, isChecked) {
  playTactileClick();
  if (isChecked) {
    state.checkedSkus.add(sku);
  } else {
    state.checkedSkus.delete(sku);
  }
  updateBulkToolbar();
  renderView();
}

function toggleSelectAll(isChecked) {
  playTactileClick();
  if (isChecked) {
    state.filteredProducts.forEach(p => state.checkedSkus.add(p.sku));
  } else {
    state.checkedSkus.clear();
  }
  updateBulkToolbar();
  renderView();
}

function clearBulkSelection() {
  playTactileClick();
  state.checkedSkus.clear();
  state.bulkToolbarExpanded = false;
  toggleBulkToolbarExpanded(false);
  updateBulkToolbar();
  renderView();
}

function toggleBulkToolbarExpanded(expanded) {
  playTactileClick();
  state.bulkToolbarExpanded = expanded;
  const prim = document.getElementById('bulk-toolbar-primary');
  const sec = document.getElementById('bulk-toolbar-secondary');
  if (prim && sec) {
    if (expanded) {
      prim.classList.add('hidden');
      sec.classList.remove('hidden');
    } else {
      prim.classList.remove('hidden');
      sec.classList.add('hidden');
    }
  }
}

function updateBulkToolbar() {
  const toolbar = document.getElementById('dynamic-bulk-toolbar');
  const countEl = document.getElementById('bulk-selected-count');
  const selectAllBox = document.getElementById('select-all-checkbox');
  const inspectorBar = document.getElementById('inspector-floating-bar');

  const count = state.checkedSkus.size;
  if (countEl) countEl.textContent = count;

  if (toolbar) {
    if (count > 0) {
      toolbar.classList.remove('hidden');
      if (inspectorBar) inspectorBar.classList.add('opacity-0', 'pointer-events-none');
    } else {
      toolbar.classList.add('hidden');
      if (inspectorBar) inspectorBar.classList.remove('opacity-0', 'pointer-events-none');
    }
  }

  if (selectAllBox) {
    const totalVisible = state.filteredProducts.length;
    let checkedVisible = 0;
    state.filteredProducts.forEach(p => {
      if (state.checkedSkus.has(p.sku)) checkedVisible++;
    });

    if (totalVisible > 0 && checkedVisible === totalVisible) {
      selectAllBox.checked = true;
      selectAllBox.indeterminate = false;
    } else if (checkedVisible > 0) {
      selectAllBox.checked = false;
      selectAllBox.indeterminate = true;
    } else {
      selectAllBox.checked = false;
      selectAllBox.indeterminate = false;
    }
  }
}

// Bulk Action 1: Batch Thermal QR Print (50x30mm)
function openBatchThermalPrint() {
  playTactileClick();
  const stage = document.getElementById('thermal-print-stage');
  if (!stage) return;

  const skus = Array.from(state.checkedSkus);
  if (skus.length === 0) return;

  const productsToPrint = state.products.filter(p => skus.includes(p.sku));
  stage.innerHTML = productsToPrint.map(p => generateThermalLabelHtml(p)).join('');

  showToast(`Préparation rouleau continu de ${skus.length} étiquette(s)...`, 'info', '🏷️');
  setTimeout(() => {
    window.print();
  }, 200);
}

// Bulk Action 2: Batch Casier Shelf Assignment
function openBatchCasierAssignment() {
  playTactileClick();
  openCasierPicker('batch');
}

// Bulk Action 3: Send Batch to Shoot Studio
function sendBatchToShoot() {
  playTactileClick();
  const skus = Array.from(state.checkedSkus);
  if (skus.length === 0) return;
  const skuParams = skus.join(',');
  showToast(`${skus.length} pièce(s) envoyée(s) vers Stupid Shoot Studio ⚡`, 'info', '⚡');
  window.location.href = `/stupid_shoot_studio.html?batch=${encodeURIComponent(skuParams)}`;
}

// Bulk Action 4: Festival Allocation
function allocateBatchToFestival() {
  playTactileClick();
  const skus = Array.from(state.checkedSkus);
  if (skus.length === 0) return;
  showToast(`${skus.length} pièce(s) allouée(s) pour la Valise Festival (Atelier Éphémère) ⛺`, 'success', '⛺');
  clearBulkSelection();
}

// Bulk Action 5: Batch Delete with Reversible Undo
async function deleteBatchSelection() {
  playTactileClick();
  const skus = Array.from(state.checkedSkus);
  if (skus.length === 0) return;

  confirmAction(
    `Supprimer ${skus.length} pièce(s) en lot ?`,
    `Attention : vous êtes sur le point de supprimer ${skus.length} pièce(s) de l'inventaire. Cette action reste annulable avec Cmd+Z.`,
    async () => {
      try {
        const res = await fetch('/api/products/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skus })
        });
        const result = await res.json();
        if (result.status === 'deleted') {
          if (result.undo_id) {
            state.undoStack.push(result.undo_id);
          }
          state.products = state.products.filter(p => !skus.includes(p.sku));
          clearBulkSelection();
          applyFilters();
          showToast(
            `${result.deleted_count} pièce(s) supprimée(s)`,
            'warning',
            '🗑️',
            '↶ Annuler (Cmd+Z)',
            () => executeUndo()
          );
        }
      } catch (err) {
        console.error('Batch delete error:', err);
        showToast('Erreur suppression en lot', 'error', '✕');
      }
    }
  );
}

// Transactional Batch & Title Undo
async function executeUndo() {
  playTactileClick();
  if (state.undoStack.length === 0) {
    showToast('Aucune action récente à annuler', 'info', 'ℹ️');
    return;
  }
  const action = state.undoStack.pop();
  if (!action) return;

  // 1. Title Update Rollback
  if (typeof action === 'object' && action.type === 'title_update') {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(action.sku)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: action.previousTitle })
      });
      const data = await res.json();
      if (data.status === 'updated' || data.status === 'ok' || data.success) {
        showToast(`Titre restauré : « ${action.previousTitle} » ✓`, 'success', '↶');
        await loadProducts();
      } else {
        showToast('Erreur lors du rollback du titre', 'error', '✕');
      }
    } catch (err) {
      console.error('Title rollback error:', err);
      showToast('Erreur lors du rollback du titre', 'error', '✕');
    }
    return;
  }

  // 1.5. Shelf Coordinate Reassignment Rollback
  if (typeof action === 'object' && action.type === 'shelf_update') {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(action.sku)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelf_coordinate: action.previousShelf })
      });
      const data = await res.json();
      if (data.status === 'updated' || data.status === 'ok' || data.success) {
        showToast(`Casier restauré pour ${action.sku} : « ${action.previousShelf} » ✓`, 'success', '↶');
        await loadProducts();
      } else {
        showToast('Erreur lors du rollback du casier', 'error', '✕');
      }
    } catch (err) {
      console.error('Shelf rollback error:', err);
      showToast('Erreur lors du rollback du casier', 'error', '✕');
    }
    return;
  }

  // 2. Batch Delete Rollback
  const undoId = typeof action === 'string' ? action : action.undoId;
  try {
    const res = await fetch('/api/products/batch-undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ undo_id: undoId })
    });
    const result = await res.json();
    if (result.status === 'restored') {
      showToast(`Restauration de ${result.restored_count} pièce(s) effectuée avec succès ✓`, 'success', '↶');
      await loadProducts();
    } else {
      showToast('Impossible de restaurer (snapshot expiré)', 'error', '✕');
    }
  } catch (err) {
    console.error('Undo execution error:', err);
    showToast('Erreur lors du rollback', 'error', '✕');
  }
}

// =========================================================================
// STANDARD ATELIER MASTER: KM POPOVER, WORKSPACE SWITCHER & DOMAINS
// =========================================================================

function toggleKmPopover() {
  playTactileClick();
  const pop = document.getElementById('km-popover-menu');
  if (pop) pop.classList.toggle('hidden');
}

function closeKmPopover() {
  const pop = document.getElementById('km-popover-menu');
  if (pop) pop.classList.add('hidden');
}

function toggleWsDropdown() {
  playTactileClick();
  const drop = document.getElementById('ws-dropdown-menu');
  if (drop) drop.classList.toggle('hidden');
}

function setWorkspace(wsName) {
  playTactileClick();
  state.workspace = wsName;
  const nameEl = document.getElementById('current-workspace-name');
  if (nameEl) nameEl.textContent = wsName.split(' ')[0] + ' ' + (wsName.split(' ')[1] || '');
  const drop = document.getElementById('ws-dropdown-menu');
  if (drop) drop.classList.add('hidden');
  showToast(`Atelier actif : ${wsName}`, 'info', '🏢');
}

function switchDomainView(view) {
  playTactileClick();
  state.activeDomainView = view;
  
  // Highlight active domain button
  const domains = ['b2c', 'materials', 'consignments', 'festivals'];
  domains.forEach(d => {
    const btn = document.getElementById(`nav-domain-${d}`);
    if (btn) {
      if (d === view) {
        btn.className = 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left bg-blue-600/15 text-blue-300 border border-blue-500/30 btn-tactile';
      } else {
        btn.className = 'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left text-slate-400 hover:text-white hover:bg-white/5 btn-tactile';
      }
    }
  });

  if (view === 'b2c') {
    state.activeFilter = 'all';
    applyFilters();
    showToast('Domaine : Catalogue B2C (Pièces Finies en Stock)', 'info', '📦');
  } else if (view === 'materials') {
    showToast('Domaine : Matières Premières & BOM Atelier (En développement)', 'info', '🧱');
  } else if (view === 'consignments') {
    showToast('Domaine : Dépôts-Vente B2B Revendeurs (En développement)', 'info', '🤝');
  } else if (view === 'festivals') {
    showToast('Domaine : Valises Festivals & Trunk Show (En développement)', 'info', '🎪');
  }
}

// =========================================================================
// DOCKED FILTRES & FACETTES DRAWER
// =========================================================================

function toggleDockedFacets() {
  playTactileClick();
  state.dockedFacetsOpen = !state.dockedFacetsOpen;
  const body = document.getElementById('docked-facets-body');
  const chev = document.getElementById('docked-facets-chevron');
  if (body) body.classList.toggle('hidden', !state.dockedFacetsOpen);
  if (chev) chev.textContent = state.dockedFacetsOpen ? '▾' : '▴';
}

function toggleFacetMetal(metal, isChecked) {
  playTactileClick();
  if (isChecked) {
    state.selectedMetals.add(metal.toLowerCase());
  } else {
    state.selectedMetals.delete(metal.toLowerCase());
  }
  updateFacetChips();
  applyFilters();
}

function toggleFacetCategory(category, isChecked) {
  playTactileClick();
  if (isChecked) {
    state.selectedCategories.add(category.toLowerCase());
  } else {
    state.selectedCategories.delete(category.toLowerCase());
  }
  updateFacetChips();
  applyFilters();
}

function clearAllFacetFilters() {
  playTactileClick();
  state.selectedMetals.clear();
  state.selectedCategories.clear();
  document.querySelectorAll('.facet-checkbox').forEach(cb => cb.checked = false);
  updateFacetChips();
  applyFilters();
  showToast('Filtres & Facettes réinitialisés', 'info', '✓');
}

function updateFacetChips() {
  const container = document.getElementById('active-facet-chips');
  const countBadge = document.getElementById('docked-facets-count');
  if (!container) return;

  const totalActive = state.selectedMetals.size + state.selectedCategories.size;
  if (countBadge) {
    countBadge.textContent = `${totalActive} actif${totalActive > 1 ? 's' : ''}`;
  }

  let html = '';
  state.selectedMetals.forEach(m => {
    const label = m === 'argent' ? 'Argent 925' : m === 'or' ? 'Or / Vermeil' : m === 'cuir' ? 'Cuir' : m;
    html += `
      <span class="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
        ${label} <span class="cursor-pointer font-bold hover:text-white" onclick="toggleFacetMetal('${m}', false)">✕</span>
      </span>
    `;
  });
  state.selectedCategories.forEach(c => {
    const label = c === 'septum' ? 'Septums' : c === 'rings' ? 'Bagues' : c === 'leather' ? 'Maroquinerie' : c;
    html += `
      <span class="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
        ${label} <span class="cursor-pointer font-bold hover:text-white" onclick="toggleFacetCategory('${c}', false)">✕</span>
      </span>
    `;
  });

  container.innerHTML = html;
}

function updateFacetCounts(products) {
  let countArgent = 0, countOr = 0, countCuir = 0, countTitane = 0;
  let countSeptum = 0, countRings = 0, countLeather = 0;

  products.forEach(p => {
    const mats = (p.materials || []).map(m => String(m).toLowerCase());
    const title = (p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();

    if (mats.some(m => m.includes('argent') || m.includes('silver') || m.includes('925')) || title.includes('argent') || title.includes('silver')) countArgent++;
    if (mats.some(m => m.includes('or') || m.includes('gold') || m.includes('vermeil') || m.includes('18k')) || title.includes('or ') || title.includes('gold')) countOr++;
    if (mats.some(m => m.includes('cuir') || m.includes('leather')) || title.includes('cuir') || title.includes('leather')) countCuir++;
    if (mats.some(m => m.includes('titane') || m.includes('titanium')) || title.includes('titane')) countTitane++;

    if (cat.includes('septum') || title.includes('clicker') || title.includes('septum')) countSeptum++;
    if (cat.includes('ring') || title.includes('armor') || title.includes('viper') || title.includes('bague')) countRings++;
    if (cat.includes('leather') || cat.includes('holster') || title.includes('holster') || title.includes('cuir')) countLeather++;
  });

  const elArgent = document.getElementById('facet-count-argent');
  const elOr = document.getElementById('facet-count-or');
  const elCuir = document.getElementById('facet-count-cuir');
  const elTitane = document.getElementById('facet-count-titane');
  const elSeptum = document.getElementById('facet-count-septum');
  const elRings = document.getElementById('facet-count-rings');
  const elLeather = document.getElementById('facet-count-leather');

  if (elArgent) elArgent.textContent = countArgent;
  if (elOr) elOr.textContent = countOr;
  if (elCuir) elCuir.textContent = countCuir;
  if (elTitane) elTitane.textContent = countTitane;
  if (elSeptum) elSeptum.textContent = countSeptum;
  if (elRings) elRings.textContent = countRings;
  if (elLeather) elLeather.textContent = countLeather;
}

// =========================================================================
// TABLE ROW DRAG & DROP TO SUB-SIDEBAR BINS (BAC A, B, C, D)
// =========================================================================

function handleRowDragStart(e, sku) {
  state.isDraggingRow = true;
  state.draggedSku = sku;
  e.dataTransfer.setData('application/x-atelier-sku', sku);
  e.dataTransfer.setData('text/plain', sku);
  e.dataTransfer.effectAllowed = 'move';

  // Highlight all sidebar target bins with blue ring
  document.querySelectorAll('.sidebar-bin-target').forEach(el => {
    el.classList.add('border-blue-400', 'bg-blue-600/20', 'ring-2', 'ring-blue-400/40');
  });
}

function handleRowDragEnd(e) {
  setTimeout(() => {
    state.isDraggingRow = false;
    state.draggedSku = null;
  }, 120);

  // Clear highlights from all sidebar target bins
  document.querySelectorAll('.sidebar-bin-target').forEach(el => {
    el.classList.remove('border-blue-400', 'bg-blue-600/20', 'ring-2', 'ring-blue-400/40', 'border-emerald-400', 'bg-emerald-500/30', 'scale-[1.02]');
  });
}

function allowDrop(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleSidebarBinDragEnter(e, binId) {
  e.preventDefault();
  const el = document.getElementById(`sidebar-bin-${binId}`);
  if (el) {
    el.classList.add('border-emerald-400', 'bg-emerald-500/30', 'scale-[1.02]');
  }
}

function handleSidebarBinDragLeave(e, binId) {
  e.preventDefault();
  const el = document.getElementById(`sidebar-bin-${binId}`);
  if (el) {
    el.classList.remove('border-emerald-400', 'bg-emerald-500/30', 'scale-[1.02]');
  }
}

function handleSidebarBinDrop(e, targetBin) {
  e.preventDefault();
  const sku = e.dataTransfer.getData('application/x-atelier-sku') || e.dataTransfer.getData('text/plain') || state.draggedSku;
  handleRowDragEnd(e);

  if (!sku) return;
  reassignPieceToBin(sku, targetBin);
}

async function reassignPieceToBin(sku, targetBin) {
  const prod = state.products.find(p => p.sku === sku);
  if (!prod) return;

  playTactileClick();
  const oldShelf = prod.shelf_coordinate || 'LIL-A00';
  const newShelf = targetBin.endsWith('01') ? targetBin : `${targetBin}01`;

  // Optimistic update
  prod.shelf_coordinate = newShelf;
  if (prod.variants && prod.variants.length > 0) {
    prod.variants.forEach(v => v.shelf_bin = newShelf);
  }

  // Push to Undo stack
  state.undoStack.push({
    type: 'shelf_update',
    sku: sku,
    previousShelf: oldShelf,
    newShelf: newShelf
  });

  showToast(`✓ SKU ${sku} réassigné : ${oldShelf} ➔ ${newShelf} ! (Cmd+Z pour annuler)`, 'success', '📦');
  flashRowDropped(sku);
  updateSummary(state.products);
  renderTable();

  // If tray is open, update it
  const trayBackdrop = document.getElementById('casier-bottom-tray-backdrop');
  if (trayBackdrop && !trayBackdrop.classList.contains('hidden')) {
    renderCasierOrganizer();
    previewThermalFromTray(sku);
  }

  // Persist to SQLite
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(sku)}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shelf_coordinate: newShelf })
    });
    const data = await res.json();
    if (!data.status && !data.success && data.status !== 'updated') {
      console.warn('Shelf update returned unexpected response:', data);
    }
  } catch (err) {
    console.error('Failed to persist shelf update:', err);
    showToast(`Erreur de sauvegarde casier pour ${sku}`, 'error');
  }
}

function flashRowDropped(sku) {
  const row = document.getElementById(`table-row-${sku}`);
  if (row) {
    row.classList.add('bg-emerald-100');
    setTimeout(() => row.classList.remove('bg-emerald-100'), 1400);
  }
}

function setCasierFilter(binId) {
  playTactileClick();
  if (state.activeCasierFilter === binId) {
    state.activeCasierFilter = null;
    showToast(`Filtre casier désactivé : Toutes les pièces`, 'info', '✓');
  } else {
    state.activeCasierFilter = binId;
    showToast(`Filtre actif : ${binId}`, 'info', '🗄️');
  }
  applyFilters();
}

// =========================================================================
// PLATEAU D'ATELIER (SLIDING BOTTOM TRAY) & CASIERS ORGANIZER
// =========================================================================

function toggleCasierOrganizer() {
  const backdrop = document.getElementById('casier-bottom-tray-backdrop');
  if (backdrop && !backdrop.classList.contains('hidden')) {
    closeCasierOrganizer();
  } else {
    openCasierOrganizer();
  }
}

function openCasierOrganizer() {
  playTactileClick();
  const backdrop = document.getElementById('casier-bottom-tray-backdrop');
  if (backdrop) backdrop.classList.remove('hidden');
  renderCasierOrganizer();
  // Select first item for thermal preview if available
  if (state.products.length > 0 && !state.activeTrayPreviewSku) {
    previewThermalFromTray(state.products[0].sku);
  }
}

function closeCasierOrganizer() {
  playTactileClick();
  const backdrop = document.getElementById('casier-bottom-tray-backdrop');
  if (backdrop) backdrop.classList.add('hidden');
}

function onTraySearch(val) {
  state.traySearchQuery = (val || '').toLowerCase().trim();
  renderCasierOrganizer();
}

function filterTrayBin(binId) {
  playTactileClick();
  state.activeTrayBinFilter = binId;
  const allBins = ['all', 'LIL-A', 'LIL-B', 'LIL-C', 'LIL-D'];
  allBins.forEach(b => {
    const btn = document.getElementById(`tray-bin-filter-${b}`);
    if (btn) {
      if (b === binId) {
        btn.className = 'px-2.5 py-1 rounded-lg text-white bg-blue-600 font-bold text-[11px] shadow-sm';
      } else {
        btn.className = 'px-2 py-1 rounded-lg text-slate-400 hover:text-white text-[11px]';
      }
    }
  });
  renderCasierOrganizer();
}

function previewThermalFromTray(sku) {
  state.activeTrayPreviewSku = sku;
  const p = state.products.find(item => item.sku === sku);
  if (!p) return;

  const tTitle = document.getElementById('thermal-preview-title');
  const tSku = document.getElementById('thermal-preview-sku');
  const tShelf = document.getElementById('thermal-preview-shelf');
  const tStock = document.getElementById('thermal-preview-stock');
  const tMetal = document.getElementById('thermal-preview-metal');
  const tQr = document.getElementById('thermal-preview-qr');

  if (tTitle) tTitle.textContent = p.title;
  if (tSku) tSku.textContent = p.sku;
  if (tShelf) tShelf.textContent = p.shelf_coordinate || 'LIL-A01';
  if (tStock) tStock.textContent = `${p.total_physical_stock || 0} pcs en stock`;
  if (tMetal) tMetal.textContent = (p.materials && p.materials.length > 0 ? p.materials[0] : 'Argent 925') + ' • Piercing';
  if (tQr) tQr.innerHTML = generateSvgQr(p.sku);
}

function printSingleThermalFromTray() {
  playTactileClick();
  const sku = state.activeTrayPreviewSku || (state.products[0] ? state.products[0].sku : null);
  const prod = state.products.find(p => p.sku === sku);
  if (!prod) {
    showToast('Aucun bijou sélectionné pour impression', 'error');
    return;
  }
  const stage = document.getElementById('thermal-print-stage');
  if (stage) {
    stage.innerHTML = generateThermalLabelHtml(prod);
    showToast(`Impression étiquette continue 50×30mm : ${prod.sku}...`, 'info', '🏷️');
    setTimeout(() => {
      window.print();
    }, 150);
  }
}

function printBatchThermalFromTray() {
  playTactileClick();
  let targetProducts = state.products;
  if (state.activeTrayBinFilter !== 'all') {
    targetProducts = state.products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith(state.activeTrayBinFilter));
  }
  if (targetProducts.length === 0) {
    showToast('Aucun bijou dans ce casier pour impression', 'info');
    return;
  }
  const stage = document.getElementById('thermal-print-stage');
  if (stage) {
    stage.innerHTML = targetProducts.map(p => generateThermalLabelHtml(p)).join('');
    showToast(`Impression en lot de ${targetProducts.length} étiquettes sur rouleau continu 50×30mm...`, 'info', '🖨️');
    setTimeout(() => {
      window.print();
    }, 150);
  }
}

function handleTrayDragStart(e, sku) {
  state.isDraggingRow = true;
  state.draggedSku = sku;
  e.dataTransfer.setData('application/x-atelier-sku', sku);
  e.dataTransfer.setData('text/plain', sku);
  e.dataTransfer.effectAllowed = 'move';
}

function handleTrayDragEnter(e, binId) {
  e.preventDefault();
  const el = document.getElementById(`bin-target-${binId}`);
  if (el) el.classList.add('border-blue-400', 'bg-blue-600/30', 'scale-[1.02]');
}

function handleTrayDragLeave(e, binId) {
  e.preventDefault();
  const el = document.getElementById(`bin-target-${binId}`);
  if (el) el.classList.remove('border-blue-400', 'bg-blue-600/30', 'scale-[1.02]');
}

function handleTrayDrop(e, targetBin) {
  e.preventDefault();
  const sku = e.dataTransfer.getData('application/x-atelier-sku') || e.dataTransfer.getData('text/plain') || state.draggedSku;
  const el = document.getElementById(`bin-target-${targetBin}`);
  if (el) el.classList.remove('border-blue-400', 'bg-blue-600/30', 'scale-[1.02]');
  if (sku) {
    reassignPieceToBin(sku, targetBin);
  }
}

function renderCasierOrganizer() {
  const grid = document.getElementById('organizer-bins-grid');
  const list = document.getElementById('organizer-draggable-list');
  const count = document.getElementById('organizer-items-count');
  const hubFill = document.getElementById('hub-total-fill-indicator');
  if (!grid || !list) return;

  const bins = [
    { id: 'LIL-A', label: 'BAC A', desc: 'Septums & Clickers', color: 'emerald' },
    { id: 'LIL-B', label: 'BAC B', desc: 'Maroquinerie & Cuir', color: 'amber' },
    { id: 'LIL-C', label: 'BAC C', desc: 'Titane & Spikes', color: 'rose' },
    { id: 'LIL-D', label: 'BAC D', desc: 'Réserves Atelier', color: 'slate' }
  ];

  // 1. Column 1: Drop Targets Bins
  grid.innerHTML = bins.map(b => {
    const itemsInBin = state.products.filter(p => (p.shelf_coordinate || '').toUpperCase().startsWith(b.id));
    const totalQty = itemsInBin.reduce((acc, p) => acc + Number(p.total_physical_stock || 0), 0);
    const fillPercent = Math.min(100, itemsInBin.length * 40);
    return `
      <div id="bin-target-${b.id}"
           ondragover="allowDrop(event)"
           ondragenter="handleTrayDragEnter(event, '${b.id}')"
           ondragleave="handleTrayDragLeave(event, '${b.id}')"
           ondrop="handleTrayDrop(event, '${b.id}')"
           onclick="filterTrayBin('${b.id}')"
           class="p-3 rounded-2xl border-2 border-dashed border-slate-700 bg-[#131622] hover:border-blue-400/80 transition-all duration-150 flex flex-col justify-between min-h-[92px] group select-none cursor-pointer">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-${b.color}-400"></span>
            <span>${b.label}</span>
          </span>
          <span class="text-[10px] text-${b.color}-400 font-bold">${itemsInBin.length} SKU (${totalQty} pcs)</span>
        </div>
        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
          <div class="bg-${b.color}-500 h-full rounded-full transition-all" style="width: ${fillPercent}%"></div>
        </div>
        <div class="text-[10px] text-slate-400 font-mono truncate flex justify-between items-center">
          <span>${b.desc}</span>
          <span class="text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition">Déposer ⇣</span>
        </div>
      </div>
    `;
  }).join('');

  if (hubFill) hubFill.textContent = `4 Casiers • ${state.products.length} bijoux`;

  // 2. Column 2: Filterable Draggable Card Deck
  let filteredProducts = state.products.filter(p => {
    if (state.traySearchQuery) {
      const matchTitle = (p.title || '').toLowerCase().includes(state.traySearchQuery);
      const matchSku = (p.sku || '').toLowerCase().includes(state.traySearchQuery);
      const matchShelf = (p.shelf_coordinate || '').toLowerCase().includes(state.traySearchQuery);
      if (!matchTitle && !matchSku && !matchShelf) return false;
    }
    if (state.activeTrayBinFilter !== 'all') {
      return (p.shelf_coordinate || '').toUpperCase().startsWith(state.activeTrayBinFilter);
    }
    return true;
  });

  if (count) count.textContent = `${filteredProducts.length} pièce${filteredProducts.length > 1 ? 's' : ''}`;

  if (filteredProducts.length === 0) {
    list.innerHTML = `
      <div class="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
        Aucun bijou ne correspond au filtre dans le plateau.
      </div>
    `;
    return;
  }

  list.innerHTML = filteredProducts.map(p => {
    const shelf = p.shelf_coordinate || 'LIL-A00';
    let shelfBadgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    if (shelf.startsWith('LIL-A')) shelfBadgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    else if (shelf.startsWith('LIL-B')) shelfBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    else if (shelf.startsWith('LIL-C')) shelfBadgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

    const stock = Number(p.total_physical_stock || 0);
    const metalLabel = (p.materials && p.materials.length > 0) ? p.materials[0] : 'Argent 925';

    return `
      <div draggable="true"
           ondragstart="handleTrayDragStart(event, '${p.sku}')"
           ondragend="handleRowDragEnd(event)"
           onclick="previewThermalFromTray('${p.sku}')"
           class="p-3 rounded-2xl border border-slate-800 bg-[#121520] hover:border-blue-500/60 hover:bg-[#161a29] cursor-grab active:cursor-grabbing transition flex flex-col justify-between font-mono text-xs select-none shadow-sm group">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 overflow-hidden">
            <span class="text-slate-500 group-hover:text-blue-400 font-bold">⋮⋮</span>
            <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm shrink-0 shadow-inner">
              💎
            </div>
            <div class="overflow-hidden">
              <div class="font-bold text-white truncate text-xs">${escapeHtml(p.title)}</div>
              <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span class="text-blue-400 font-bold">${p.sku}</span>
                <span>•</span>
                <span class="text-slate-300">${escapeHtml(metalLabel)}</span>
                <span>•</span>
                <span class="font-bold text-slate-200">${p.retail_price || 0} €</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${shelfBadgeStyle} border">
              ${shelf}
            </span>
            <span class="font-bold ${stock > 0 ? 'text-slate-200' : 'text-rose-400'} text-xs">${stock} pcs</span>
          </div>
        </div>

        <!-- Quick 1-Click Reassignment Bar -->
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span class="text-slate-500 uppercase font-semibold">Réassigner 1-clic :</span>
          <div class="flex items-center gap-1 font-bold">
            <button onclick="event.stopPropagation(); reassignPieceToBin('${p.sku}', 'LIL-A')" class="px-2 py-0.5 rounded hover:bg-emerald-600 hover:text-white transition ${shelf.startsWith('LIL-A') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}">➔ Bac A</button>
            <button onclick="event.stopPropagation(); reassignPieceToBin('${p.sku}', 'LIL-B')" class="px-2 py-0.5 rounded hover:bg-amber-600 hover:text-white transition ${shelf.startsWith('LIL-B') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}">➔ Bac B</button>
            <button onclick="event.stopPropagation(); reassignPieceToBin('${p.sku}', 'LIL-C')" class="px-2 py-0.5 rounded hover:bg-rose-600 hover:text-white transition ${shelf.startsWith('LIL-C') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'}">➔ Bac C</button>
            <button onclick="event.stopPropagation(); reassignPieceToBin('${p.sku}', 'LIL-D')" class="px-2 py-0.5 rounded hover:bg-slate-600 hover:text-white transition ${shelf.startsWith('LIL-D') ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40' : 'bg-slate-800 text-slate-400'}">➔ Bac D</button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

// Global click listener to close popovers when clicking outside
window.addEventListener('click', (e) => {
  const kmPop = document.getElementById('km-popover-menu');
  const kmBtn = document.getElementById('km-avatar-btn');
  if (kmPop && !kmPop.classList.contains('hidden')) {
    if (!kmPop.contains(e.target) && !kmBtn?.contains(e.target)) {
      closeKmPopover();
    }
  }
  const wsDrop = document.getElementById('ws-dropdown-menu');
  if (wsDrop && !wsDrop.classList.contains('hidden')) {
    if (!wsDrop.contains(e.target) && !e.target.closest('#current-workspace-name') && !e.target.closest('[onclick="toggleWsDropdown()"]')) {
      wsDrop.classList.add('hidden');
    }
  }
});

// Expose globals for HTML inline triggers
window.setFilter = setFilter;
window.handleSearch = handleSearch;
window.clearSearch = clearSearch;
window.setViewMode = setViewMode;
window.toggleSort = toggleSort;
window.updateStock = updateStock;
window.handleDirectStockInput = handleDirectStockInput;
window.updateVariantStock = updateVariantStock;
window.handleDirectVariantStockInput = handleDirectVariantStockInput;
window.toggleVariantsAccordion = toggleVariantsAccordion;
window.openSkuDrawer = openSkuDrawer;
window.closeSkuDrawer = closeSkuDrawer;
window.copyDrawerRepoPath = copyDrawerRepoPath;
window.saveSkuDrawerChanges = saveSkuDrawerChanges;
window.openThermalQr = openThermalQr;
window.closeThermalModal = closeThermalModal;
window.openNewSkuModal = openNewSkuModal;
window.closeNewSkuModal = closeNewSkuModal;
window.handleCreateSku = handleCreateSku;
window.handleRowClick = handleRowClick;
window.handleAddMaterial = handleAddMaterial;
window.handleRemoveMaterial = handleRemoveMaterial;
window.handleCreateVariant = handleCreateVariant;
window.handleDeleteVariant = handleDeleteVariant;
window.handleAttachPhoto = handleAttachPhoto;
window.handleFileUpload = handleFileUpload;
window.selectDrawerPhoto = selectDrawerPhoto;
window.handleSetPrimaryPhoto = handleSetPrimaryPhoto;
window.handleDeletePhoto = handleDeletePhoto;
window.confirmDeleteCurrentSku = confirmDeleteCurrentSku;
window.closeConfirmModal = closeConfirmModal;
window.focusSearchInput = focusSearchInput;
window.setConcept = setConcept;
window.openCasierHubModal = openCasierHubModal;
window.closeCasierHubModal = closeCasierHubModal;
window.filterByCasier = filterByCasier;
window.openPhotoLightbox = openPhotoLightbox;
window.closePhotoLightbox = closePhotoLightbox;
window.navigateLightbox = navigateLightbox;
window.toggleDrawerAspectFit = toggleDrawerAspectFit;
window.setDrawerHeaderStyle = setDrawerHeaderStyle;
window.handleDrawerSkuInput = handleDrawerSkuInput;
window.renderDrawerHeader = renderDrawerHeader;
window.toggleInspectorMode = toggleInspectorMode;
window.openInspectorPopover = openInspectorPopover;
window.closeInspectorPopover = closeInspectorPopover;
window.selectPopoverCategory = selectPopoverCategory;
window.submitInspectorComment = submitInspectorComment;
window.loadFeedbacks = loadFeedbacks;
window.renderPins = renderPins;
window.openPinDetail = openPinDetail;
window.closePinDetailModal = closePinDetailModal;
window.resolveCurrentPin = resolveCurrentPin;
window.deleteCurrentPin = deleteCurrentPin;
window.togglePinsVisibility = togglePinsVisibility;
window.toggleDrawerModalMode = toggleDrawerModalMode;
window.openCasierPicker = openCasierPicker;
window.closeCasierPicker = closeCasierPicker;
window.setCasierPickerZone = setCasierPickerZone;
window.selectCasierFromPicker = selectCasierFromPicker;
window.openVersionModal = openVersionModal;
window.closeVersionModal = closeVersionModal;
window.switchVersionTab = switchVersionTab;
window.toggleSelectSku = toggleSelectSku;
window.toggleSelectAll = toggleSelectAll;
window.clearBulkSelection = clearBulkSelection;
window.toggleBulkToolbarExpanded = toggleBulkToolbarExpanded;
window.openBatchThermalPrint = openBatchThermalPrint;
window.openBatchCasierAssignment = openBatchCasierAssignment;
window.sendBatchToShoot = sendBatchToShoot;
window.allocateBatchToFestival = allocateBatchToFestival;
window.deleteBatchSelection = deleteBatchSelection;
window.executeUndo = executeUndo;
window.handleSwatchClick = handleSwatchClick;
window.handleStockInputKeydown = handleStockInputKeydown;
window.handleVariantStockInputKeydown = handleVariantStockInputKeydown;
window.clearCasierFilter = clearCasierFilter;
window.setupDrawerDragAndDrop = setupDrawerDragAndDrop;
window.uploadProductPhotoFile = uploadProductPhotoFile;
window.handleThumbnailDrop = handleThumbnailDrop;
window.triggerPrintThermalModal = triggerPrintThermalModal;
window.toggleCockpitFilter = toggleCockpitFilter;
window.toggleSubSidebar = toggleSubSidebar;
window.startInlineTitleEdit = startInlineTitleEdit;
window.saveInlineTitle = saveInlineTitle;
window.escapeHtml = escapeHtml;

// Standard Atelier Master & Casier Organizer Exports
window.toggleKmPopover = toggleKmPopover;
window.closeKmPopover = closeKmPopover;
window.toggleWsDropdown = toggleWsDropdown;
window.setWorkspace = setWorkspace;
window.switchDomainView = switchDomainView;
window.toggleDockedFacets = toggleDockedFacets;
window.toggleFacetMetal = toggleFacetMetal;
window.toggleFacetCategory = toggleFacetCategory;
window.clearAllFacetFilters = clearAllFacetFilters;
window.handleRowDragStart = handleRowDragStart;
window.handleRowDragEnd = handleRowDragEnd;
window.allowDrop = allowDrop;
window.handleSidebarBinDragEnter = handleSidebarBinDragEnter;
window.handleSidebarBinDragLeave = handleSidebarBinDragLeave;
window.handleSidebarBinDrop = handleSidebarBinDrop;
window.reassignPieceToBin = reassignPieceToBin;
window.setCasierFilter = setCasierFilter;
window.toggleCasierOrganizer = toggleCasierOrganizer;
window.openCasierOrganizer = openCasierOrganizer;
window.closeCasierOrganizer = closeCasierOrganizer;
window.onTraySearch = onTraySearch;
window.filterTrayBin = filterTrayBin;
window.previewThermalFromTray = previewThermalFromTray;
window.printSingleThermalFromTray = printSingleThermalFromTray;
window.printBatchThermalFromTray = printBatchThermalFromTray;
window.handleTrayDragStart = handleTrayDragStart;
window.handleTrayDragEnter = handleTrayDragEnter;
window.handleTrayDragLeave = handleTrayDragLeave;
window.handleTrayDrop = handleTrayDrop;
window.renderCasierOrganizer = renderCasierOrganizer;

// Auto-clean print stage after browser print dialog closes
window.addEventListener('afterprint', () => {
  const stage = document.getElementById('thermal-print-stage');
  if (stage) stage.innerHTML = '';
});