const DEFAULTS = {
  autoUnlock: false,
  silentMode: true,
  openWhere: 'same',
  mirror: 'freedium',
  customMirrors: [],
  readerFallback: true,
  cfWait: 15,
  preset: 'medium',
  textScale: 100,
  columnWidth: 816,
  lineHeight: 158,
  headingScale: 100,
  accentColor: '#1a8917',
  underlineLinks: true,
  progressBar: false,
  hideBadges: true,
  headingWeight: 700,
  bodyWeight: 400,
  backgroundColor: '#ffffff',
  uiFont: 'sohne',
  bodyFont: 'source-serif-pro',
  hierarchy: ['title','subtitle','byline','body'],
  excludes: []
};

function $(sel){return document.querySelector(sel)}
function $all(sel){return [...document.querySelectorAll(sel)]}

function applyPreview(state){
  const root = document.getElementById('previewRoot');
  if(!root) return;
  // variables
  const scale = Math.max(0.8, Math.min(2, (state.textScale||100) / 100));
  const bodySize = Math.round(20 * scale);
  const bodyLH = (state.lineHeight||158) / 100;
  const hscale = Math.max(0.9, Math.min(1.15, (state.headingScale||100) / 100));
  const colWidth = Math.max(560, Math.min(1200, state.columnWidth||816));
  root.style.setProperty('--fm-body-size', bodySize + 'px');
  root.style.setProperty('--fm-body-lh', String(bodyLH));
  root.style.setProperty('--fm-col-width', colWidth + 'px');
  root.style.setProperty('--fm-underline', state.underlineLinks ? 'underline' : 'none');
  root.style.setProperty('--fm-hscale', String(hscale));
  root.style.setProperty('--fm-accent', state.accentColor || '#1a8917');
  root.style.setProperty('--fm-bg', state.backgroundColor || '#ffffff');
  root.style.setProperty('--fm-heading-w', String(state.headingWeight||700));
  root.style.setProperty('--fm-body-w', String(state.bodyWeight||400));

  // fonts
  const uiFont = state.uiFont === 'system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'sohne, Helvetica Neue, Helvetica, Arial, sans-serif';
  const bodyFont = state.bodyFont === 'system-serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : state.bodyFont === 'system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'source-serif-pro, Georgia, Cambria, "Times New Roman", Times, serif';
  root.style.setProperty('--fm-ui-font', uiFont);
  root.style.setProperty('--fm-body-font', bodyFont);
  // theme classes
  root.classList.toggle('freedium-theme-contrast', state.preset === 'contrast');
  root.classList.toggle('freedium-theme-serif', state.preset === 'serif');
  root.classList.toggle('freedium-hide-badges', !!state.hideBadges);
  // progress bar simulation
  const prog = document.getElementById('previewProgress');
  if(prog){ prog.style.background = state.accentColor || '#1a8917'; prog.style.width = state.progressBar ? '56%' : '0%'; }
}

function applyModalPreview(state){
  const root = document.getElementById('modalPreviewRoot');
  if(!root) return;
  const scale = Math.max(0.8, Math.min(2, (state.textScale||100) / 100));
  const bodySize = Math.round(20 * scale);
  const bodyLH = (state.lineHeight||158) / 100;
  const hscale = Math.max(0.9, Math.min(1.15, (state.headingScale||100) / 100));
  const colWidth = Math.max(560, Math.min(1200, state.columnWidth||816));
  root.style.setProperty('--fm-body-size', bodySize + 'px');
  root.style.setProperty('--fm-body-lh', String(bodyLH));
  root.style.setProperty('--fm-col-width', colWidth + 'px');
  root.style.setProperty('--fm-underline', state.underlineLinks ? 'underline' : 'none');
  root.style.setProperty('--fm-hscale', String(hscale));
  root.style.setProperty('--fm-accent', state.accentColor || '#1a8917');
  root.style.setProperty('--fm-bg', state.backgroundColor || '#ffffff');
  root.style.setProperty('--fm-heading-w', String(state.headingWeight||700));
  root.style.setProperty('--fm-body-w', String(state.bodyWeight||400));
  const uiFont = state.uiFont === 'system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'sohne, Helvetica Neue, Helvetica, Arial, sans-serif';
  const bodyFont = state.bodyFont === 'system-serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : state.bodyFont === 'system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'source-serif-pro, Georgia, Cambria, "Times New Roman", Times, serif';
  root.style.setProperty('--fm-ui-font', uiFont);
  root.style.setProperty('--fm-body-font', bodyFont);
  root.classList.toggle('freedium-theme-contrast', state.preset === 'contrast');
  root.classList.toggle('freedium-theme-serif', state.preset === 'serif');
  root.classList.toggle('freedium-hide-badges', !!state.hideBadges);
  const prog = document.getElementById('modalPreviewProgress');
  if(prog){ prog.style.background = state.accentColor || '#1a8917'; prog.style.width = state.progressBar ? '56%' : '0%'; }

  // hierarchy
  const order = state.hierarchy || DEFAULTS.hierarchy;
  const map = {
    title: document.getElementById('previewTitle'),
    subtitle: document.getElementById('previewSubtitle'),
    byline: root.querySelector('.freedium-byline'),
    body: document.getElementById('previewBody')
  };
  const frag = document.createDocumentFragment();
  order.forEach(k=>{ const el = map[k]; if(el) frag.appendChild(el); });
  root.appendChild(frag);
}

async function load(){
  const saved = await chrome.storage.sync.get(DEFAULTS);
  const state = {...DEFAULTS, ...saved};

  $('#autoUnlock').checked = state.autoUnlock;
  $('#silentMode').checked = state.silentMode;
  $all('input[name="openWhere"]').forEach(r=>r.checked = r.value===state.openWhere);
  $all('input[name="mirror"]').forEach(r=>r.checked = r.value===state.mirror);
  $('#readerFallback').checked = state.readerFallback;
  $('#cfWait').value = state.cfWait; $('#cfWaitVal').textContent = `${state.cfWait}s`;
  $('#textScale').value = state.textScale; $('#textScaleVal').textContent = `${state.textScale}%`;
  $('#headingScale').value = state.headingScale; $('#headingScaleVal').textContent = `${state.headingScale}%`;
  $('#columnWidth').value = state.columnWidth; $('#columnWidthVal').textContent = `${state.columnWidth}px`;
  $('#lineHeight').value = state.lineHeight; $('#lineHeightVal').textContent = `${state.lineHeight}%`;
  $('#headingWeight') && ($('#headingWeight').value = state.headingWeight, $('#headingWeightVal').textContent = `${state.headingWeight}`);
  $('#bodyWeight') && ($('#bodyWeight').value = state.bodyWeight, $('#bodyWeightVal').textContent = `${state.bodyWeight}`);
  $('#accentColor').value = state.accentColor;
  $('#backgroundColor') && ($('#backgroundColor').value = state.backgroundColor);
  $('#uiFont') && ($('#uiFont').value = state.uiFont);
  $('#bodyFont') && ($('#bodyFont').value = state.bodyFont);
  $('#underlineLinks').checked = state.underlineLinks;
  $('#progressBar').checked = state.progressBar;
  $('#hideBadges').checked = state.hideBadges;
  // telemetry removed for privacy minimization

  renderMirrors(state.customMirrors);
  renderExcludes(state.excludes);
  selectPreset(state.preset);
  toggleCustomMirrorBlock(state.mirror === 'custom');
  applyPreview(state);
  applyModalPreview(state);

  // Reflect status card truth
  try{
    const statusTitle = document.querySelector('.status-title');
    const statusSub = document.querySelector('.status-sub');
    if(statusTitle && statusSub){
      if(state.autoUnlock){
        statusTitle.textContent = 'Automatic unlock is enabled';
        statusSub.textContent = 'Works silently on Medium.';
      } else {
        statusTitle.textContent = 'Automatic unlock is disabled';
        statusSub.textContent = 'Use the toolbar or open link manually.';
      }
    }
  }catch(_){}
}

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400)}

async function save(partial, silent=false){
  await chrome.storage.sync.set(partial);
  const saved = await chrome.storage.sync.get(DEFAULTS);
  const merged = {...DEFAULTS, ...saved};
  applyPreview(merged);
  applyModalPreview(merged);
  if(!silent) toast('Saved');
}

function selectPreset(p){
  $all('#presetChips .chip').forEach(c=>c.classList.toggle('selected', c.dataset.preset===p));
}

function presetOverrides(p){
  switch(p){
    case 'medium':
      return {
        uiFont: 'sohne', bodyFont: 'source-serif-pro',
        textScale: 100, headingScale: 100,
        headingWeight: 700, bodyWeight: 400,
        lineHeight: 158, columnWidth: 816,
        backgroundColor: '#ffffff', accentColor: '#1a8917',
        underlineLinks: true, progressBar: false, hideBadges: true
      };
    case 'serif':
      return {
        uiFont: 'sohne', bodyFont: 'source-serif-pro',
        underlineLinks: true, backgroundColor: '#ffffff'
      };
    case 'contrast':
      return {
        uiFont: 'sohne', bodyFont: 'source-serif-pro',
        textScale: 102, headingScale: 105,
        headingWeight: 750, bodyWeight: 450,
        lineHeight: 162, columnWidth: 800,
        backgroundColor: '#ffffff', accentColor: '#0A84FF',
        underlineLinks: true
      };
    case 'bookish':
      return {
        uiFont: 'system-serif', bodyFont: 'source-serif-pro',
        textScale: 102, headingScale: 100,
        headingWeight: 700, bodyWeight: 400,
        lineHeight: 165, columnWidth: 740,
        backgroundColor: '#FBF5E6', accentColor: '#7A5C2E',
        underlineLinks: true
      };
    case 'focus':
      return {
        uiFont: 'system-sans', bodyFont: 'source-serif-pro',
        textScale: 100, headingScale: 98,
        headingWeight: 700, bodyWeight: 400,
        lineHeight: 164, columnWidth: 720,
        backgroundColor: '#ffffff', accentColor: '#0B6E4F',
        underlineLinks: false, progressBar: false, hideBadges: true
      };
    case 'sepia':
      return {
        uiFont: 'sohne', bodyFont: 'source-serif-pro',
        textScale: 100, headingScale: 100,
        lineHeight: 162, columnWidth: 760,
        backgroundColor: '#F5E9DA', accentColor: '#8A4B08',
        underlineLinks: true
      };
    default:
      return {};
  }
}

function renderMirrors(list){
  const ul = $('#mirrorList');
  ul.innerHTML = '';
  list.forEach((url,idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${url}</span><button data-idx="${idx}">Remove</button>`;
    ul.appendChild(li);
  });
}

function renderExcludes(list){
  const ul = $('#excludeList');
  ul.innerHTML = '';
  list.forEach((pat,idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<code>${pat}</code><button data-idx="${idx}">Remove</button>`;
    ul.appendChild(li);
  });
}

function toggleCustomMirrorBlock(show){
  $('#customMirrorBlock').classList.toggle('hidden', !show);
}

document.addEventListener('DOMContentLoaded', async () => {
  await load();
  // manifest version -> badge
  try{
    const v = chrome.runtime.getManifest?.().version;
    const badge = document.getElementById('versionBadge');
    if(badge && v) badge.textContent = `v${v}`;
  }catch(_){}
  // Auto-open theme modal if ?open=theme
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('open') === 'theme') {
      $('#openThemeBtn')?.click();
    }
  } catch (_) {}

  $('#autoUnlock').addEventListener('change', async (e)=>{
    await save({autoUnlock:e.target.checked});
    try{
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: e.target.checked ? ['medium-to-freedium'] : [],
        disableRulesetIds: e.target.checked ? [] : ['medium-to-freedium']
      });
    }catch(_){ /* ignore if not permitted */ }
    // Update status card copy
    const statusTitle = document.querySelector('.status-title');
    const statusSub = document.querySelector('.status-sub');
    if(statusTitle && statusSub){
      if(e.target.checked){
        statusTitle.textContent = 'Automatic unlock is enabled';
        statusSub.textContent = 'Works silently on Medium.';
      } else {
        statusTitle.textContent = 'Automatic unlock is disabled';
        statusSub.textContent = 'Use the toolbar or open link manually.';
      }
    }
  });
  $('#silentMode').addEventListener('change', e=>save({silentMode:e.target.checked}));
  $all('input[name="openWhere"]').forEach(r=>r.addEventListener('change',()=>save({openWhere:document.querySelector('input[name="openWhere"]:checked').value})));
  $all('input[name="mirror"]').forEach(r=>r.addEventListener('change',()=>{
    const mirror = document.querySelector('input[name="mirror"]:checked').value;
    toggleCustomMirrorBlock(mirror==='custom');
    save({mirror});
  }));
  $('#readerFallback').addEventListener('change', e=>save({readerFallback:e.target.checked}));

  $('#cfWait').addEventListener('input', e=>{ $('#cfWaitVal').textContent = `${e.target.value}s`; });
  $('#cfWait').addEventListener('change', e=>save({cfWait:parseInt(e.target.value,10)}));

  $('#textScale').addEventListener('input', e=>{ $('#textScaleVal').textContent = `${e.target.value}%`; });
  $('#textScale').addEventListener('change', e=>save({textScale:parseInt(e.target.value,10)}));
  $('#columnWidth').addEventListener('input', e=>{ $('#columnWidthVal').textContent = `${e.target.value}px`; });
  $('#columnWidth').addEventListener('change', e=>save({columnWidth:parseInt(e.target.value,10)}));
  $('#lineHeight').addEventListener('input', e=>{ $('#lineHeightVal').textContent = `${e.target.value}%`; });
  $('#lineHeight').addEventListener('change', e=>save({lineHeight:parseInt(e.target.value,10)}));
  $('#headingScale').addEventListener('input', e=>{ $('#headingScaleVal').textContent = `${e.target.value}%`; });
  $('#headingScale').addEventListener('change', e=>save({headingScale:parseInt(e.target.value,10)}));
  $('#accentColor').addEventListener('change', e=>save({accentColor:e.target.value}));

  $('#underlineLinks').addEventListener('change', e=>save({underlineLinks:e.target.checked}));
  $('#progressBar').addEventListener('change', e=>save({progressBar:e.target.checked}));
  $('#hideBadges').addEventListener('change', e=>save({hideBadges:e.target.checked}));

  // telemetry removed

  $('#presetChips').addEventListener('click', async (e)=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    const preset = btn.dataset.preset;
    selectPreset(preset);
    const overrides = presetOverrides(preset);
    await save({preset, ...overrides}, true);
    await load();
  });

  $('#addMirrorBtn').addEventListener('click', async ()=>{
    const val = $('#customMirrorInput').value.trim();
    if(!/^https?:\/\//i.test(val)) return toast('Enter a valid URL');
    const {customMirrors=[]} = await chrome.storage.sync.get({customMirrors:[]});
    if(!customMirrors.includes(val)) customMirrors.push(val);
    await save({customMirrors});
    renderMirrors(customMirrors);
    $('#customMirrorInput').value='';
  });

  $('#mirrorList').addEventListener('click', async (e)=>{
    if(e.target.tagName!=='BUTTON') return;
    const idx = parseInt(e.target.dataset.idx,10);
    const {customMirrors=[]} = await chrome.storage.sync.get({customMirrors:[]});
    customMirrors.splice(idx,1);
    await save({customMirrors});
    renderMirrors(customMirrors);
  });

  $('#addExcludeBtn').addEventListener('click', async ()=>{
    const val = $('#excludeInput').value.trim();
    if(!val) return;
    const {excludes=[]} = await chrome.storage.sync.get({excludes:[]});
    if(!excludes.includes(val)) excludes.push(val);
    await save({excludes});
    renderExcludes(excludes);
    $('#excludeInput').value='';
  });

  $('#excludeList').addEventListener('click', async (e)=>{
    if(e.target.tagName!=='BUTTON') return;
    const idx = parseInt(e.target.dataset.idx,10);
    const {excludes=[]} = await chrome.storage.sync.get({excludes:[]});
    excludes.splice(idx,1);
    await save({excludes});
    renderExcludes(excludes);
  });

  $('#exportBtn').addEventListener('click', async ()=>{
    const data = await chrome.storage.sync.get(DEFAULTS);
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href:url, download:'free-medium-settings.json'});
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  $('#importFile').addEventListener('change', async (e)=>{
    const file = e.target.files?.[0];
    if(!file) return; const text = await file.text();
    try{ const json = JSON.parse(text); await chrome.storage.sync.set(json); toast('Imported'); await load(); }
    catch{ toast('Invalid file'); }
    finally{ e.target.value=''; }
  });

  $('#restoreBtn').addEventListener('click', async ()=>{
    await chrome.storage.sync.set(DEFAULTS); toast('Defaults restored'); await load();
  });

  // Open/close theme modal
  $('#openThemeBtn').addEventListener('click', async ()=>{
    const modal = document.getElementById('themeModal');
    modal.classList.remove('hidden');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    const saved = await chrome.storage.sync.get(DEFAULTS);
    applyModalPreview({...DEFAULTS, ...saved});
  });
  $('#closeThemeBtn').addEventListener('click', ()=>{
    document.getElementById('themeModal').classList.add('hidden');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  });

  // Modal controls wiring
  const modalWires = [
    ['#uiFont','change', v=>({uiFont:v})],
    ['#bodyFont','change', v=>({bodyFont:v})],
    ['#backgroundColor','change', v=>({backgroundColor:v})],
    ['#textScale','change', v=>({textScale:parseInt(v,10)})],
    ['#headingScale','change', v=>({headingScale:parseInt(v,10)})],
    ['#headingWeight','change', v=>({headingWeight:parseInt(v,10)})],
    ['#bodyWeight','change', v=>({bodyWeight:parseInt(v,10)})],
    ['#columnWidth','change', v=>({columnWidth:parseInt(v,10)})],
    ['#lineHeight','change', v=>({lineHeight:parseInt(v,10)})],
    ['#accentColor','change', v=>({accentColor:v})],
    ['#underlineLinks','change', v=>({underlineLinks:document.querySelector('#underlineLinks').checked})],
    ['#progressBar','change', v=>({progressBar:document.querySelector('#progressBar').checked})],
    ['#hideBadges','change', v=>({hideBadges:document.querySelector('#hideBadges').checked})],
  ];
  modalWires.forEach(([sel,evt,fn])=>{
    const el = document.querySelector(sel);
    if(!el) return;
    el.addEventListener(evt, async (e)=>{
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      await save(fn(val));
      const saved = await chrome.storage.sync.get(DEFAULTS);
      applyModalPreview({...DEFAULTS, ...saved});
      const id = e.target.id;
      const valEl = document.getElementById(id+ (id==='columnWidth'?'Val':'Val'));
      if(valEl && typeof val === 'number'){
        valEl.textContent = id==='columnWidth'? `${val}px` : id==='lineHeight' ? `${val}%` : `${val}%`;
      }
    });
  });

  // DnD hierarchy
  const list = document.getElementById('hierarchyList');
  if(list){
    let dragEl = null;
    list.addEventListener('dragstart', (e)=>{ dragEl = e.target.closest('li'); e.dataTransfer.effectAllowed='move'; });
    list.addEventListener('dragover', (e)=>{ e.preventDefault(); const over = e.target.closest('li'); if(!over||over===dragEl) return; const rect = over.getBoundingClientRect(); const next = (e.clientY - rect.top) / rect.height > .5; over.parentNode.insertBefore(dragEl, next? over.nextSibling : over); });
    list.addEventListener('drop', async ()=>{
      const order = [...list.querySelectorAll('li')].map(li=>li.dataset.key);
      await save({hierarchy:order});
      const saved = await chrome.storage.sync.get(DEFAULTS);
      applyModalPreview({...DEFAULTS, ...saved});
    });
  }
});


