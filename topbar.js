// =============================================================
// Persistent dashboard top bar + bottom tab bar.
// Drop this on any page with:
//     <script src="topbar.js" defer></script>
// It self-injects HTML + CSS, reads progress from localStorage,
// and renders the water +1 button in the top bar plus the
// Main/Health/Fitness bottom tabs. Skips chrome on finance.html
// and inside iframes (so the water tracker can embed cleanly).
// =============================================================
(function () {
  'use strict';

  // Apply theme immediately before injecting elements to prevent flashes
  const currentTheme = localStorage.getItem('dashboard-theme');
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
  }

  // -------- Supabase config (replace with your own project URL + publishable key) --------
  const TOPBAR_SUPABASE_URL = 'https://ueaszyqknwxghvkwcwjo.supabase.co';
  const TOPBAR_SUPABASE_KEY = 'sb_publishable_Cf33A_7gzY3Es4yiwM4EdA_PNKG74iJ';

  // -------- CSS --------
  const css = `
.topbar {
  position: sticky; top: 0; z-index: 40;
  display: flex; justify-content: flex-end; align-items: center;
  gap: 8px;
  padding-top: max(12px, env(safe-area-inset-top));
  padding-bottom: 8px;
  padding-left: max(14px, env(safe-area-inset-left));
  padding-right: max(14px, env(safe-area-inset-right));
  background: #0a0a0b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}
.topbar-theme-toggle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.topbar-theme-toggle:hover { background: rgba(255, 255, 255, 0.08); }
.topbar-theme-icon {
  font-size: 20px; line-height: 1;
}
.topbar-water-wrap { display: flex; align-items: stretch; }
.topbar-water-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-right: none;
  border-radius: 12px 0 0 12px;
  text-decoration: none; color: #FAFAFA;
  -webkit-tap-highlight-color: transparent;
}
.topbar-water-pill .topbar-pill-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #7DD3FC; flex-shrink: 0;
}
.topbar-water-pill.warn .topbar-pill-dot { background: #fbbf24; }
.topbar-water-pill.miss .topbar-pill-dot {
  background: #ff8a8a;
  animation: topbar-miss-pulse 1.6s ease-in-out infinite;
}
@keyframes topbar-miss-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50%      { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
}
.topbar-pill-count {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px; font-weight: 700; color: #FAFAFA;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.topbar-water-add {
  width: 44px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.28), rgba(110, 231, 183, 0.28));
  color: #FFFFFF; font-family: inherit;
  font-size: 20px; font-weight: 700; line-height: 1;
  cursor: pointer; border-radius: 0 12px 12px 0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, transform 0.10s;
}
.topbar-water-add:active { transform: scale(0.94); }
.topbar-water-add.flash {
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.7), rgba(110, 231, 183, 0.7));
}
.topbar-finance-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px; text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.topbar-finance-btn:hover { background: rgba(255, 255, 255, 0.08); }
.topbar-finance-icon {
  font-size: 20px; line-height: 1;
  filter: grayscale(100%) brightness(1.4); opacity: 0.85;
}
.bottombar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  display: flex; justify-content: space-around; align-items: stretch;
  padding: 6px max(0px, env(safe-area-inset-left)) calc(6px + env(safe-area-inset-bottom)) max(0px, env(safe-area-inset-right));
  background: #0a0a0b;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}
.bottombar-tab {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; padding: 6px 0 4px; text-decoration: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
  -webkit-tap-highlight-color: transparent; transition: color 0.15s;
}
.bottombar-tab-icon {
  font-size: 24px; line-height: 1;
  filter: grayscale(100%) brightness(1.2); opacity: 0.55;
  transition: opacity 0.15s, filter 0.15s, transform 0.10s;
}
.bottombar-tab.active { color: #FAFAFA; }
.bottombar-tab.active .bottombar-tab-icon {
  filter: grayscale(100%) brightness(1.6); opacity: 1;
}
.bottombar-tab:active .bottombar-tab-icon { transform: scale(0.92); }
body.has-bottombar {
  padding-bottom: calc(72px + env(safe-area-inset-bottom)) !important;
}
@media (max-width: 480px) {
  .topbar {
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
    gap: 6px;
  }
  .topbar-theme-toggle { width: 40px; height: 38px; }
  .topbar-theme-icon { font-size: 18px; }
  .topbar-water-pill { padding: 8px 11px; gap: 6px; }
  .topbar-pill-count { font-size: 12px; }
  .topbar-water-add { width: 40px; font-size: 18px; }
  .topbar-finance-btn { width: 40px; height: 38px; }
  .topbar-finance-icon { font-size: 18px; }
  .bottombar-tab-icon { font-size: 22px; }
  .bottombar-tab { font-size: 10px; }
}
html, body { -webkit-text-size-adjust: 100%; }
@media (max-width: 768px) {
  html { touch-action: pan-y; }
  ::-webkit-scrollbar { width: 0; height: 0; display: none; }
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
}
.modal-bg, .modal, .po-modal-bg, .po-modal, .wt-overlay, .wt-viewer {
  overscroll-behavior: contain;
}
body.topbar-modal-open { overflow: hidden; touch-action: none; }
@media (max-width: 480px) {
  .modal-bg, .po-modal-bg {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  .modal, .po-modal {
    width: 100% !important; max-width: 100% !important;
    max-height: 100vh !important; height: 100vh !important;
    border-radius: 0 !important;
    padding-top: max(20px, env(safe-area-inset-top)) !important;
    padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important; overscroll-behavior: contain;
  }
}

/* ==========================================
   LIGHT MODE AESTHETIC OVERRIDES
   ========================================== */
html.light-theme {
  --bg: #F4F4F6;
  --bg-deep: #EAEAEF;
  --bg-card: #FFFFFF;
  --bg-secondary: #F8F8FA;
  --bg-input: #F3F3F6;
  --border: rgba(0, 0, 0, 0.08);
  --border-soft: rgba(0, 0, 0, 0.05);
  --border-strong: rgba(0, 0, 0, 0.15);
  --text-primary: #1A1A1E;
  --text-secondary: #4A4A52;
  --text-tertiary: #8A8A96;
  --text-quaternary: #A0A0B0;
  
  --text-1: #1A1A1E;
  --text-2: rgba(0, 0, 0, 0.65);
  --text-3: rgba(0, 0, 0, 0.45);
  --text-4: rgba(0, 0, 0, 0.25);
  
  --accent: #E07658;
}

html.light-theme body {
  background: #F4F4F6 !important;
  color: #4A4A52 !important;
}

html.light-theme body::before {
  background:
    radial-gradient(circle at 82% 14%, rgba(224, 118, 88, 0.08), transparent 45%),
    radial-gradient(circle at 18% 90%, rgba(180, 180, 200, 0.08), transparent 50%) !important;
}

html.light-theme .topbar {
  background: #FFFFFF !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}
html.light-theme .topbar-water-pill {
  background: rgba(125, 211, 252, 0.15) !important;
  border: 1px solid rgba(125, 211, 252, 0.3) !important;
  color: #0369a1 !important;
}
html.light-theme .topbar-pill-count {
  color: #0369a1 !important;
}
html.light-theme .topbar-water-add {
  border: 1px solid rgba(125, 211, 252, 0.3) !important;
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.4), rgba(110, 231, 183, 0.4)) !important;
  color: #0369a1 !important;
}
html.light-theme .topbar-finance-btn {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  background: rgba(0, 0, 0, 0.04) !important;
}
html.light-theme .topbar-finance-icon {
  filter: none !important;
  opacity: 0.95 !important;
}
html.light-theme .topbar-theme-toggle {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  background: rgba(0, 0, 0, 0.04) !important;
}
html.light-theme .bottombar {
  background: #FFFFFF !important;
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}
html.light-theme .bottombar-tab {
  color: rgba(0, 0, 0, 0.45) !important;
}
html.light-theme .bottombar-tab.active {
  color: #1A1A1E !important;
}
html.light-theme .bottombar-tab-icon {
  filter: grayscale(100%) brightness(0.5) !important;
  opacity: 0.55 !important;
}
html.light-theme .bottombar-tab.active .bottombar-tab-icon {
  filter: grayscale(100%) brightness(0.2) !important;
  opacity: 1 !important;
}

html.light-theme .dash-title {
  background: linear-gradient(180deg, #1A1A1E 0%, #5A5A66 120%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
}
html.light-theme .gm-card,
html.light-theme .day-ring-wrap,
html.light-theme .stack-card,
html.light-theme .card,
html.light-theme .nw-chart-wrap,
html.light-theme .nw-donut-wrap {
  background: #FFFFFF !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .gm-row,
html.light-theme .stack-item,
html.light-theme .sub-row,
html.light-theme .nw-subcard,
html.light-theme .nw-activity-row,
html.light-theme .ord-card {
  background: #F8F8FA !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
html.light-theme .gm-text,
html.light-theme .stack-item-name,
html.light-theme .nw-name,
html.light-theme .ord-card-name {
  color: #1A1A1E !important;
}
html.light-theme .gm-input,
html.light-theme .stack-input,
html.light-theme .search-input,
html.light-theme .field input,
html.light-theme .field select,
html.light-theme .ord-input {
  background: #F3F3F6 !important;
  color: #1A1A1E !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}
html.light-theme .gm-input::placeholder,
html.light-theme .stack-input::placeholder,
html.light-theme .search-input::placeholder,
html.light-theme .ord-input::placeholder {
  color: #8A8A96 !important;
}
html.light-theme .gm-polish,
html.light-theme .day-pill,
html.light-theme .icon-btn,
html.light-theme .why-toggle,
html.light-theme .po-btn,
html.light-theme .po-btn-icon,
html.light-theme .po-seg-control {
  background: #F3F3F6 !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #1A1A1E !important;
}
html.light-theme .goal-ticker {
  background: #FFFFFF !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .goal-ticker-row {
  color: #1A1A1E !important;
}
html.light-theme .goal-ticker-meta {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #4A4A52 !important;
}
html.light-theme .day-ring-track {
  stroke: rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .day-ring-percent {
  color: #1A1A1E !important;
}
html.light-theme .stack-check {
  background: #FFFFFF !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
}
html.light-theme .stack-ticker {
  background: #F3F3F6 !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .stack-ticker-msg {
  color: #1A1A1E !important;
}
html.light-theme .search-results {
  background: #FFFFFF !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important;
}
html.light-theme .search-result-name {
  color: #1A1A1E !important;
}
html.light-theme .why-body {
  background: #F8F8FA !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
html.light-theme .why-row .why-val {
  color: #1A1A1E !important;
}
html.light-theme .hist-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .hist-count {
  color: #4A4A52 !important;
}
html.light-theme .hist-bar-wrap {
  background: rgba(0, 0, 0, 0.04) !important;
}
html.light-theme .spark-target {
  stroke: rgba(0, 0, 0, 0.12) !important;
}
html.light-theme .modal-bg {
  background: rgba(0, 0, 0, 0.4) !important;
}
html.light-theme .modal {
  background: #FFFFFF !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
}
html.light-theme .seg {
  background: rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
}
html.light-theme .seg button.active {
  background: linear-gradient(180deg, #FFFFFF 0%, #E8E5DD 100%) !important;
  color: #0A0A0B !important;
}
html.light-theme .ord-add-grid {
  background: rgba(0, 0, 0, 0.03) !important;
}
html.light-theme .ord-card-name {
  color: #1A1A1E !important;
}
html.light-theme .ord-card-amt {
  color: #1A1A1E !important;
}
html.light-theme .nw-amt {
  color: #1A1A1E !important;
}
html.light-theme .po-title {
  color: #1A1A1E !important;
}
html.light-theme .po-reps-pill {
  background: #F3F3F6 !important;
}
html.light-theme .po-reps-val {
  color: #1A1A1E !important;
}
html.light-theme .po-w-btn {
  background: #F3F3F6 !important;
  color: #1A1A1E !important;
}
html.light-theme .po-done-btn {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
html.light-theme .wt-photo-card {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  background: #F3F3F6 !important;
}
html.light-theme .wt-photo-meta {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1A1A1E !important;
}
html.light-theme .wt-photo-date {
  color: #1A1A1E !important;
}
html.light-theme .wt-photo-weight {
  color: #4A4A52 !important;
}
`;

  const topbarHtml = `
<header class="topbar" id="topbar" role="navigation" aria-label="Quick actions">
  <button class="topbar-theme-toggle" id="topbarThemeToggle" aria-label="Toggle theme" type="button">
    <span class="topbar-theme-icon" id="topbarThemeIcon">☀️</span>
  </button>
  <div class="topbar-water-wrap">
    <a href="health.html#water" class="topbar-water-pill" id="topbarWater" aria-label="Water progress">
      <span class="topbar-pill-dot"></span>
      <span class="topbar-pill-count" id="topbarWaterCount">0/0</span>
    </a>
    <button class="topbar-water-add" id="topbarWaterAdd" aria-label="Log one drink" type="button">+</button>
  </div>
  <a href="finance.html" class="topbar-finance-btn" id="topbarFinance" aria-label="Finance">
    <span class="topbar-finance-icon">📊</span>
  </a>
</header>`;

  const bottombarHtml = `
<nav class="bottombar" id="bottombar" role="navigation" aria-label="Main tabs">
  <a href="index.html" class="bottombar-tab" data-page="main">
    <span class="bottombar-tab-icon">🏠</span><span>Main</span>
  </a>
  <a href="health.html" class="bottombar-tab" data-page="health">
    <span class="bottombar-tab-icon">💊</span><span>Health</span>
  </a>
  <a href="gym.html" class="bottombar-tab" data-page="fitness">
    <span class="bottombar-tab-icon">💪</span><span>Fitness</span>
  </a>
</nav>`;

  function isFinancePage() {
    const p = (window.location.pathname || '').toLowerCase();
    return p.indexOf('/finance') !== -1 || p.endsWith('finance') || p.endsWith('finance.html');
  }
  function isEmbedded() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }
  function shouldShowChrome() { return !isFinancePage() && !isEmbedded(); }
  function currentPageKey() {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.indexOf('/health') !== -1 || p.endsWith('health') || p.endsWith('health.html')) return 'health';
    if (p.indexOf('/gym') !== -1 || p.endsWith('gym') || p.endsWith('gym.html')) return 'fitness';
    return 'main';
  }

  function injectStyleAndHTML() {
    if (!document.getElementById('topbar-style')) {
      const style = document.createElement('style');
      style.id = 'topbar-style';
      style.textContent = css;
      document.head.appendChild(style);
    }
    if (document.getElementById('topbar') || document.getElementById('bottombar')) return;
    if (!shouldShowChrome()) return;
    const topWrap = document.createElement('div');
    topWrap.innerHTML = topbarHtml.trim();
    document.body.insertBefore(topWrap.firstChild, document.body.firstChild);
    const bottomWrap = document.createElement('div');
    bottomWrap.innerHTML = bottombarHtml.trim();
    document.body.appendChild(bottomWrap.firstChild);
    const active = currentPageKey();
    document.querySelectorAll('.bottombar-tab').forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-page') === active);
    });
    document.body.classList.add('has-bottombar');
  }

  function calendarDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function getWaterProgress() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state) return { done: 0, total: 0 };
    const todayKey = calendarDateKey();
    const done = (state.logs || {})[todayKey] || 0;
    const p = state.profile || { weightKg: 75 };
    const wKg = state.weightUnit === 'lb' ? (p.weightKg || 0) / 2.20462 : (p.weightKg || 0);
    const base = wKg * 35;
    const exercise = (p.activityHrsPerWeek || 0) / 7 * 500;
    const caffeine = Math.max(0, (state.caffeineMgPerDay || 0) - 200) * 1.5;
    const subs = (state.substances || []).reduce((s, x) => {
      const dose = (x && x.dose != null ? x.dose : (x && x.defaultDose)) || 0;
      return s + Math.max(0, dose * ((x && x.mlPerUnit) || 0));
    }, 0);
    let adjust = 0;
    if (p.sex === 'm') adjust += 200;
    if ((p.age || 0) >= 50) adjust += 100;
    const totalMl = base + exercise + caffeine + subs + adjust;
    let unitVol;
    if (state.unit === 'glass') unitVol = state.glassMl || 250;
    else if (state.unit === 'oz') unitVol = 30;
    else if (state.unit === 'ml') unitVol = 1;
    else unitVol = state.bottleMl || 500;
    const total = Math.max(1, Math.ceil(totalMl / unitVol));
    return { done, total };
  }
  function classifyStatus(done, total) {
    if (total === 0) return 'idle';
    if (done >= total) return 'good';
    if (done >= total * 0.5) return 'warn';
    const h = new Date().getHours();
    if (h >= 18 && done < total * 0.5) return 'miss';
    return 'warn';
  }
  function setPillStatus(pillEl, status) {
    pillEl.classList.remove('good', 'warn', 'miss');
    if (status === 'warn' || status === 'miss') pillEl.classList.add(status);
  }
  function render() {
    const waterEl = document.getElementById('topbarWater');
    if (!waterEl) return;
    const w = getWaterProgress();
    const countEl = document.getElementById('topbarWaterCount');
    if (countEl) countEl.textContent = w.total ? w.done + '/' + w.total : '0/0';
    setPillStatus(waterEl, classifyStatus(w.done, w.total));
  }

  function defaultWaterState() {
    return {
      unit: 'bottle', bottleMl: 500, glassMl: 250, weightUnit: 'kg',
      profile: { weightKg: 75, age: 25, sex: 'm', activityHrsPerWeek: 5 },
      caffeineMgPerDay: 200, substances: [], logs: {}
    };
  }
  async function pushWaterMergedToSupabase(localWater) {
    const p = (window.location.pathname || '').toLowerCase();
    const isHealth = p.indexOf('/health') !== -1 || p.endsWith('health') || p.endsWith('health.html');
    if (isHealth) return;
    if (!window.supabase || !TOPBAR_SUPABASE_URL || !TOPBAR_SUPABASE_KEY) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;
    try {
      const supa = window.supabase.createClient(TOPBAR_SUPABASE_URL, TOPBAR_SUPABASE_KEY);
      const { data } = await supa
        .from('app_state').select('data').eq('key', 'health').maybeSingle();
      const current = (data && data.data) || {};
      const merged = Object.assign({}, current, { po_water_v1: localWater });
      await supa.from('app_state').upsert(
        { key: 'health', data: merged, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {}
  }
  function addWater() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state || typeof state !== 'object') state = defaultWaterState();
    state.logs = state.logs || {};
    const k = calendarDateKey();
    state.logs[k] = (state.logs[k] || 0) + 1;
    try { localStorage.setItem('po_water_v1', JSON.stringify(state)); } catch (e) {}
    render();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) { btn.classList.add('flash'); setTimeout(() => btn.classList.remove('flash'), 220); }
    pushWaterMergedToSupabase(state);
  }

  function blockGesture(e) { e.preventDefault(); }
  function lockGestures() {
    document.addEventListener('gesturestart', blockGesture, { passive: false });
    document.addEventListener('gesturechange', blockGesture, { passive: false });
    document.addEventListener('gestureend', blockGesture, { passive: false });
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }
  function startModalLock() {
    const MODAL_SELECTORS = ['.modal-bg', '.po-modal-bg', '.wt-overlay', '.wt-viewer', '.wt-cam'];
    function anyOpen() {
      for (const sel of MODAL_SELECTORS) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (el.classList.contains('show') || el.classList.contains('is-open')) return true;
        }
      }
      return false;
    }
    function sync() { document.body.classList.toggle('topbar-modal-open', anyOpen()); }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    sync();
  }

  function renderThemeToggle() {
    const iconEl = document.getElementById('topbarThemeIcon');
    if (!iconEl) return;
    const isLight = document.documentElement.classList.contains('light-theme');
    iconEl.textContent = isLight ? '🌙' : '☀️';
  }

  function boot() {
    injectStyleAndHTML();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); addWater(); });
    
    const themeBtn = document.getElementById('topbarThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isLight = document.documentElement.classList.toggle('light-theme');
        localStorage.setItem('dashboard-theme', isLight ? 'light' : 'dark');
        renderThemeToggle();
        
        // Post message to any iframes on the page (like the water tracker embed)
        // so they also toggle their theme instantly!
        document.querySelectorAll('iframe').forEach(iframe => {
          try {
            iframe.contentWindow.postMessage({ type: 'theme-changed', theme: isLight ? 'light' : 'dark' }, '*');
          } catch(err) {}
        });
      });
    }
    
    // Listen for theme change message in embedded iframe
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'theme-changed') {
        if (e.data.theme === 'light') {
          document.documentElement.classList.add('light-theme');
        } else {
          document.documentElement.classList.remove('light-theme');
        }
        renderThemeToggle();
      }
    });

    renderThemeToggle();
    render();
    lockGestures();
    startModalLock();
    window.addEventListener('storage', render);
    window.addEventListener('focus', render);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    setInterval(render, 30 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
