'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const asset = name => `assets/${name}.svg`;
const palettes = [
  { color: '#8cdecf', name: 'Aurora', note: 'Sakin bir odak' },
  { color: '#bca4f1', name: 'Lilac', note: 'Yaratıcı akış' },
  { color: '#efb89f', name: 'Dusk', note: 'Sıcak bir denge' },
  { color: '#8bb8f3', name: 'Nebula', note: 'Derin düşünceler' }
];
const defaults = { accent: '#8cdecf', wall: '#352447' };
let prefs = { ...defaults }, storageAvailable = true;
function readStored(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { storageAvailable = false; return fallback; } }
function store(key, value) { try { localStorage.setItem(key, value); return true; } catch { storageAvailable = false; return false; } }
try { const saved = JSON.parse(readStored('luma-v02-prefs', '{}')); for (const key of Object.keys(defaults)) if (/^#[0-9a-f]{6}$/i.test(saved?.[key])) prefs[key] = saved[key]; } catch {}
function applyPrefs() { document.documentElement.style.setProperty('--accent', prefs.accent); document.documentElement.style.setProperty('--wall', prefs.wall); }
function persistPrefs() { if (!store('luma-v02-prefs', JSON.stringify(prefs))) toast('Tarayıcı kaydı kullanılamıyor; renkler bu oturumda uygulanıyor.'); }
applyPrefs();
let topZ = 30, currentPage = 'home', currentApp = null, toastTimer;
const windows = { welcome: $('#welcome-window'), terminal: $('#terminal-window'), app: $('#app-window') };
function front(name) { if (windows[name]) windows[name].style.zIndex = ++topZ; }
function showWindow(name) { windows[name].classList.remove('hidden'); front(name); updateDock(); }
function hideWindow(name) { windows[name].classList.add('hidden'); updateDock(); }
function toggleMax(name) { windows[name].classList.toggle('maximized'); front(name); }
function toast(message) { $('#toast').textContent = message; $('#toast').classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.add('hidden'), 3500); }
function updateDock() { $$('.dock [data-app]').forEach(button => { const name = button.dataset.app; button.classList.toggle('running', name === 'terminal' ? !windows.terminal.classList.contains('hidden') : name === 'settings' ? !windows.welcome.classList.contains('hidden') && currentPage === 'appearance' : name === currentApp && !windows.app.classList.contains('hidden')); }); }
function paletteMarkup() { return `<div class="palettes">${palettes.map(p => `<button class="palette-choice" data-color="${p.color}" style="--sw:${p.color}" aria-label="${p.name} vurgu rengi" aria-pressed="${prefs.accent === p.color}"><span class="orb"><svg width="27" height="27" viewBox="0 0 24 24" aria-hidden="true" fill="#343147" opacity=".58"><ellipse cx="5" cy="8" rx="2.2" ry="3" transform="rotate(-20 5 8)"/><ellipse cx="10" cy="5" rx="2.2" ry="3"/><ellipse cx="15.5" cy="5.5" rx="2.2" ry="3" transform="rotate(12 15.5 5.5)"/><ellipse cx="20" cy="9" rx="2.2" ry="3" transform="rotate(25 20 9)"/><path d="M5 18c0-3 4-8 7-8s7 5 7 8-4 2-7 2-7 1-7-2"/></svg></span><span class="palette-name">${p.name}</span><span class="palette-note">${p.note}</span></button>`).join('')}</div>`; }
function intro(eyebrow, title, subtitle) { return `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p>`; }
const creativeTools = [ ['art', 'Çizim alanı', 'Hızlı bir eskiz yap, PNG olarak kaydet.', 'art'], ['art', 'Krita', 'Linux sürümü için çizim aracı adayı.'], ['files', 'Blender', 'Linux sürümü için 3D ve animasyon aracı adayı.'] ];
const developerTools = [ ['code', 'Kod defteri', 'Notlarını yerelde tut, dosya olarak indir.', 'code'], ['terminal', 'Terminal demosu', 'Arayüzü dene; sistem komutları çalıştırılmaz.', 'terminal'], ['code', 'Git ve geliştirme araçları', 'Gerçek Linux ortamında kurulması planlanıyor.'] ];
function toolList(items) { return `<div class="app-list">${items.map(([image, title, desc, app]) => `<div class="app-item"><img src="${asset(image)}" alt=""><div><strong>${title}</strong><small>${desc}</small></div>${app ? `<button class="secondary" data-app="${app}">Aç ↗</button>` : '<span class="badge">Planlanan</span>'}</div>`).join('')}</div>`; }
function setPage(page) {
  currentPage = page;
  $$('.sidebar [data-page]').forEach(b => { const selected = b.dataset.page === page; b.classList.toggle('selected', selected); if (selected) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  let html;
  if (page === 'home') html = intro('SENİN DÜNYAN. SENİN MASAÜSTÜN.', 'Burası senin alanın.', 'Biraz hayal gücü. Biraz kod. Tamamen sen.') + paletteMarkup() + `<div class="cards"><article class="welcome-card"><h2>Hayal et. Üret.</h2><p>İlk eskizden son piksele.<br>Fikirlerine ve karakterlerine yer aç.</p><img class="card-art" src="assets/create-scene.svg" alt="Çizim tableti, fırçalar ve pati desenli kupa"><button class="primary lilac" data-page="create">Üretim alanını keşfet ${icon('arrow')}</button></article><article class="welcome-card"><h2>Yaz. Geliştir.</h2><p>Küçük bir script, kocaman bir fikir.<br>Sıradaki projen burada başlasın.</p><img class="card-art" src="assets/develop-scene.svg" alt="Kod ekranı, terminal ve küçük bir bitki"><button class="primary" data-page="develop">Geliştirme alanını keşfet ${icon('arrow')}</button></article></div><div class="welcome-footer">KENDİ RİTMİNDE. KENDİ RENKLERİNLE.</div>`;
  else if (page === 'appearance') html = intro('KİŞİSELLEŞTİR', 'Rengini bul.', 'Fursonanın renkleri, masaüstünde küçük bir imza.') + paletteMarkup() + `<div class="setting-row"><div><strong>Düz mor arka plan</strong><p>Çizimin hazır olana kadar sade bir zemin.</p></div><input type="color" id="wall-color" class="color-control" value="${prefs.wall}" aria-label="Arka plan rengi"></div><div class="setting-row"><div><strong>İlk palete dön</strong><p>Mor arka plan, nane yeşili vurgular.</p></div><button class="secondary" id="reset-colors">Renkleri sıfırla</button></div><div class="info-box">Tercihlerin bu tarayıcıda saklanır. Gerçek KDE renk teması proje klasöründeki <strong>linux</strong> bölümünde.</div>`;
  else if (page === 'desktop') html = intro('GÜNLÜK AKIŞIN', 'Biraz daha alan.', 'Pencereleri başlıklarından sürükle. Araçlarını alt çubuktan aç.') + `<div class="setting-row"><div><strong>Masaüstünü göster</strong><p>Açık pencereleri küçültür. Simgelerden tekrar açabilirsin.</p></div><button class="secondary" id="show-desktop">Masaüstünü göster</button></div><div class="setting-row"><div><strong>Pencere düzenini sıfırla</strong><p>İlk karşılama düzenine dön.</p></div><button class="secondary" id="reset-layout">Düzeni sıfırla</button></div><div class="info-box"><strong>Küçük kısayollar</strong><br>Alt + Boşluk: uygulamaları aç<br>Esc: açılır menüyü kapat<br>Pencere başlığına çift tık: büyüt / küçült</div>`;
  else if (page === 'apps') html = intro('ARAÇ KUTUN', 'Bir şeyler yapalım.', 'Önizleme araçları ve Linux için düşündüğümüz uygulamalar.') + toolList([...creativeTools, ...developerTools]);
  else if (page === 'create' || page === 'develop') html = `<button class="back" data-page="home">← Başlangıç</button>` + intro(page === 'create' ? 'ÜRETİM ALANI' : 'GELİŞTİRME ALANI', page === 'create' ? 'Hayal gücüne yer aç.' : 'Sıradaki fikrini yaz.', page === 'create' ? 'Bir eskizle başla. Gerisini sonra düşünürüz.' : 'Kod, küçük notlar ve yeni başlangıçlar.') + toolList(page === 'create' ? creativeTools : developerTools);
  else html = intro('LUMA / 0.2', 'Henüz başlangıç.', 'Furry topluluğu, sanatçılar ve geliştiriciler için bir Linux masaüstü fikri.') + `<div class="info-box"><strong>Bu ekran nedir?</strong><br>İnternetsiz açılabilen, etkileşimli bir masaüstü prototipi. Çalışan bir Linux oturumu veya ISO değildir.<br><br><strong>Gerçek çalışan parçalar</strong><br>Çizim ve PNG dışa aktarma, kod defteri, yerel tercih kaydı, pencere taşıma ve uygulama arama.<br><br><strong>Linux başlangıç paketi</strong><br>Projedeki linux klasöründe KDE renk şeması, düz mor duvar kâğıdı ve geri alınabilir dosya kurulumu bulunur. KDE üzerinde çalışma testi henüz yapılmadı.<br><br>Luma geçici proje adı. Simge ve illüstrasyonlar bu proje için hazırlandı.</div>`;
  $('#welcome-content').innerHTML = html;
  $('#welcome-content').scrollTop = 0;
  showWindow('welcome');
}
const apps = [ ['welcome', 'Hoş geldin', 'paw'], ['files', 'Dosyalar', 'files'], ['browser', 'Tarayıcı', 'browser'], ['terminal', 'Terminal', 'terminal'], ['code', 'Kod defteri', 'code'], ['art', 'Çizim alanı', 'art'], ['settings', 'Görünüm', 'settings'] ];
function renderLauncher(query = '') { const found = apps.filter(a => a[1].toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'))); $('#launcher-apps').innerHTML = found.length ? found.map(([id, name, image]) => `<button data-app="${id}"><img src="${asset(image)}" alt=""><span>${name}</span></button>`).join('') : '<div class="no-results">Bu isimde bir uygulama yok.</div>'; }
function toggleLauncher() { const launcher = $('#launcher'); launcher.classList.toggle('hidden'); $('#popover').classList.add('hidden'); if (!launcher.classList.contains('hidden')) { $('#app-search').value = ''; renderLauncher(); $('#app-search').focus(); } }
let draft = readStored('luma-v02-draft', '# Merhaba, Luma.\n\n# Sıradaki fikrin burada başlasın.\n# Bu defter metin düzenler; kod çalıştırmaz.\n\ndef hello(name):\n    return f"Merhaba, {name}!"\n\nprint(hello("dünya"))\n');
let artCanvas = document.createElement('canvas'); artCanvas.width = 960; artCanvas.height = 540;
let brushColor = '#8060a7', brushSize = 6, isDrawing = false, lastPoint, artUndo = [];
let artContext = artCanvas.getContext('2d'); artContext.fillStyle = '#f6f1fb'; artContext.fillRect(0, 0, 960, 540);
function rememberArt() { artUndo.push(artContext.getImageData(0, 0, 960, 540)); if (artUndo.length > 15) artUndo.shift(); }
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); }
function drawPoint(e) { const r = artCanvas.getBoundingClientRect(); return { x: (e.clientX-r.left)*960/r.width, y: (e.clientY-r.top)*540/r.height }; }
artCanvas.addEventListener('pointerdown', e => { if (e.button !== 0) return; rememberArt(); isDrawing = true; lastPoint = drawPoint(e); artCanvas.setPointerCapture(e.pointerId); artContext.fillStyle = brushColor; artContext.beginPath(); artContext.arc(lastPoint.x, lastPoint.y, brushSize/2, 0, Math.PI*2); artContext.fill(); });
artCanvas.addEventListener('pointermove', e => { if (!isDrawing) return; const p = drawPoint(e); artContext.strokeStyle = brushColor; artContext.lineWidth = brushSize; artContext.lineCap = 'round'; artContext.lineJoin = 'round'; artContext.beginPath(); artContext.moveTo(lastPoint.x,lastPoint.y); artContext.lineTo(p.x,p.y); artContext.stroke(); lastPoint = p; });
function stopDrawing() { isDrawing = false; }
artCanvas.addEventListener('pointerup', stopDrawing); artCanvas.addEventListener('pointercancel', stopDrawing); artCanvas.addEventListener('lostpointercapture', stopDrawing);
const folders = { 'Ev': ['Projeler', 'Çizimler', 'Belgeler', 'İndirilenler'], 'Projeler': ['merhaba.py'], 'Çizimler': ['eskiz.png'], 'Belgeler': ['Luma hakkında'], 'İndirilenler': [] };
let currentFolder = 'Ev';
function filesMarkup(folder) { return `<div class="files-layout"><nav class="files-side" aria-label="Klasörler">${Object.keys(folders).map(name => `<button data-folder="${name}" class="${name === folder ? 'active' : ''}">${name === 'Ev' ? '⌂  ' : ''}${name}</button>`).join('')}</nav><div class="files-main"><div class="breadcrumb"><button class="secondary" data-folder="Ev" aria-label="Ana klasör">⌂</button><span>nova / ${folder}</span><span class="badge">Önizleme</span></div><div class="file-grid">${folders[folder].map(name => `<button class="file-tile" ${folders[name] ? `data-folder="${name}"` : `data-file="${name}"`}><img src="${asset(folders[name] ? 'files' : name.endsWith('.py') ? 'code' : name.endsWith('.png') ? 'art' : 'paw')}" alt=""><span>${name}</span></button>`).join('')}</div>${folders[folder].length ? '' : '<div class="empty-folder">Henüz bir şey yok.<br>Yeni fikirlere yer var.</div>'}<p class="files-note">Örnek çalışma alanı · bilgisayarının dosyalarına erişmez.</p></div></div>`; }
function openApp(name) {
  $('#launcher').classList.add('hidden'); $('#popover').classList.add('hidden');
  if (name === 'welcome' || name === 'settings') { setPage(name === 'settings' ? 'appearance' : 'home'); return; }
  if (name === 'terminal') { showWindow('terminal'); $('#terminal-input').focus(); return; }
  currentApp = name;
  const entry = apps.find(a => a[0] === name); if (!entry) return;
  $('#app-title').textContent = entry[1]; $('#app-title-icon').src = asset(entry[2]);
  let html = '';
  if (name === 'files') html = filesMarkup(currentFolder);
  if (name === 'browser') html = `<div class="browser-page"><img src="assets/browser.svg" alt=""><p class="eyebrow">KEŞFETMEYE DEVAM ET</p><h1>Küçük bir başlangıç sayfası.</h1><p class="subtitle">Bağlantılar gerçek tarayıcında yeni sekmede açılır.</p><div class="browser-links"><a href="https://kde.org/" target="_blank" rel="noopener noreferrer">KDE ↗</a><a href="https://krita.org/" target="_blank" rel="noopener noreferrer">Krita ↗</a><a href="https://www.blender.org/" target="_blank" rel="noopener noreferrer">Blender ↗</a><a href="https://docs.python.org/3/" target="_blank" rel="noopener noreferrer">Python ↗</a></div><div class="info-box">Luma önizlemesi, kendi tarayıcı motorunu içermez.</div></div>`;
  if (name === 'code') html = `<div class="editor"><div class="editor-toolbar"><span>merhaba.py</span><button class="secondary" id="export-code">Dosyayı indir ↓</button></div><textarea id="code-input" aria-label="Kod defteri" spellcheck="false"></textarea><div class="editor-status" id="editor-status"></div></div>`;
  if (name === 'art') html = `<div class="art-app"><div class="art-toolbar"><label>Renk <input id="brush-color" type="color" value="${brushColor}" aria-label="Fırça rengi"></label><label>Kalınlık <input id="brush-size" type="range" min="1" max="40" value="${brushSize}" aria-label="Fırça kalınlığı"></label><button class="secondary" id="undo-art">Geri al</button><button class="secondary" id="clear-art">Temizle</button><button class="secondary" id="export-art">PNG indir ↓</button></div><div id="art-stage" class="art-stage"></div><div class="art-hint">960 × 540 · Eskizin bu oturumda kalır. Saklamak için PNG indir.</div></div>`;
  $('#app-content').innerHTML = html;
  if (name === 'code') { $('#code-input').value = draft; editorStatus(); }
  if (name === 'art') { $('#art-stage').appendChild(artCanvas); artCanvas.setAttribute('aria-label', 'Çizim tuvali'); }
  showWindow('app');
}
function editorStatus() { const status = $('#editor-status'); if (status) status.textContent = `${draft.split('\n').length} satır · ${draft.length} karakter · ${storageAvailable ? 'Bu tarayıcıda kaydedilir' : 'Yalnızca bu oturum — dosya olarak indir'} · Kod çalıştırılmaz`; }
const terminalCommands = [];
let historyIndex = 0;
function terminalResponse(command) { const normalized = command.trim().toLowerCase(); if (normalized === 'help') return 'help     Komutları göster\nabout    Luma hakkında\nls       Örnek klasörleri listele\npwd      Örnek çalışma yolu\ndate     Güncel tarih ve saat\nclear    Ekranı temizle'; if (normalized === 'about') return 'Luma 0.2 — masaüstü tasarım önizlemesi.\nBu terminal gerçek sistem komutları çalıştırmaz.'; if (normalized === 'ls') return 'Projeler/   Çizimler/   Belgeler/   İndirilenler/'; if (normalized === 'pwd') return '/home/nova  (örnek yol)'; if (normalized === 'date') return new Date().toLocaleString('tr-TR'); return `“${command}” demo komutları arasında yok. help yazabilirsin.`; }
$('#terminal-form').addEventListener('submit', e => { e.preventDefault(); const command = $('#terminal-input').value.trim(); if (!command) return; terminalCommands.push(command); historyIndex = terminalCommands.length; $('#terminal-input').value = ''; if (command.toLowerCase() === 'clear') { $('#terminal-history').replaceChildren(); $('.terminal-greeting').classList.add('hidden'); return; } const entry = document.createElement('div'); entry.className = 'terminal-entry'; const cmd = document.createElement('div'); cmd.className = 'terminal-command'; cmd.textContent = '❯ ' + command; const result = document.createElement('div'); result.textContent = terminalResponse(command); entry.append(cmd, result); $('#terminal-history').appendChild(entry); $('#terminal-body').scrollTop = $('#terminal-body').scrollHeight; });
$('#terminal-input').addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); historyIndex = Math.max(0, Math.min(terminalCommands.length, historyIndex + (e.key === 'ArrowUp' ? -1 : 1))); e.target.value = terminalCommands[historyIndex] || ''; } });
function resetLayout() { Object.values(windows).forEach(w => { w.style.removeProperty('left'); w.style.removeProperty('top'); w.style.removeProperty('transform'); w.classList.remove('maximized'); }); showWindow('terminal'); setPage('home'); }
document.addEventListener('click', e => {
  const app = e.target.closest('[data-app]'); if (app) openApp(app.dataset.app);
  const page = e.target.closest('[data-page]'); if (page) setPage(page.dataset.page);
  for (const action of ['minimize', 'close', 'maximize']) { const control = e.target.closest(`[data-${action}]`); if (control) { if (action === 'maximize') toggleMax(control.dataset[action]); else hideWindow(control.dataset[action]); } }
  const swatch = e.target.closest('[data-color]'); if (swatch) { prefs.accent = swatch.dataset.color; applyPrefs(); persistPrefs(); $$('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === prefs.accent))); }
  if (e.target.closest('#reset-colors')) { prefs = { ...defaults }; applyPrefs(); persistPrefs(); setPage('appearance'); }
  if (e.target.closest('#show-desktop')) Object.keys(windows).forEach(hideWindow);
  if (e.target.closest('#reset-layout')) resetLayout();
  if (e.target.closest('#launcher-button') || e.target.closest('#brand')) toggleLauncher();
  const folder = e.target.closest('[data-folder]'); if (folder) { currentFolder = folder.dataset.folder; $('#app-content').innerHTML = filesMarkup(currentFolder); }
  const file = e.target.closest('[data-file]'); if (file) { if (file.dataset.file === 'merhaba.py') openApp('code'); else if (file.dataset.file === 'eskiz.png') openApp('art'); else setPage('about'); }
  if (e.target.closest('#export-code')) downloadBlob(new Blob([draft], { type: 'text/plain;charset=utf-8' }), 'merhaba.py');
  if (e.target.closest('#clear-art')) { rememberArt(); artContext.fillStyle = '#f6f1fb'; artContext.fillRect(0, 0, 960, 540); toast('Tuval temizlendi. “Geri al” ile geri getirebilirsin.'); }
  if (e.target.closest('#undo-art')) { const previous = artUndo.pop(); if (previous) artContext.putImageData(previous, 0, 0); else toast('Geri alınacak çizim yok.'); }
  if (e.target.closest('#export-art')) artCanvas.toBlob(blob => { if (blob) downloadBlob(blob, 'luma-eskiz.png'); }, 'image/png');
  if (e.target.closest('#clock')) { const wasHidden = $('#popover').classList.contains('hidden'); $('#popover').innerHTML = `<h3>${new Date().toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})}</h3><p>${new Date().toLocaleDateString('tr-TR', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>`; $('#popover').classList.toggle('hidden', !wasHidden); $('#launcher').classList.add('hidden'); }
  if (e.target.closest('#status')) { const wasHidden = $('#popover').classList.contains('hidden'); $('#popover').innerHTML = '<h3>Yerel önizleme</h3><p>Ağ, ses ve pil simgeleri tasarımın parçası; cihaz durumunu ölçmez.<br><br>Tüm masaüstü varlıkları bu klasörde. Önizlemeyi internetsiz kullanabilirsin.</p>'; $('#popover').classList.toggle('hidden', !wasHidden); $('#launcher').classList.add('hidden'); }
  if (!e.target.closest('#launcher, #launcher-button, #brand')) $('#launcher').classList.add('hidden');
  if (!e.target.closest('#popover, #clock, #status')) $('#popover').classList.add('hidden');
});
document.addEventListener('input', e => { if (e.target.id === 'wall-color') { prefs.wall = e.target.value; applyPrefs(); persistPrefs(); } if (e.target.id === 'app-search') renderLauncher(e.target.value); if (e.target.id === 'code-input') { draft = e.target.value; store('luma-v02-draft', draft); editorStatus(); } if (e.target.id === 'brush-color') brushColor = e.target.value; if (e.target.id === 'brush-size') brushSize = Number(e.target.value); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('#launcher').classList.add('hidden'); $('#popover').classList.add('hidden'); } if (e.altKey && e.code === 'Space') { e.preventDefault(); toggleLauncher(); } if (e.target.id === 'code-input' && e.key === 'Tab') { e.preventDefault(); const input = e.target, start = input.selectionStart, end = input.selectionEnd; input.setRangeText('  ', start, end, 'end'); draft = input.value; store('luma-v02-draft', draft); editorStatus(); } });
for (const [name, win] of Object.entries(windows)) {
  win.addEventListener('pointerdown', () => front(name));
  const bar = $('[data-drag]', win); let drag = null;
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) toggleMax(name); });
  bar.addEventListener('pointerdown', e => { if (e.button !== 0 || e.target.closest('button') || win.classList.contains('maximized')) return; const r = win.getBoundingClientRect(), area = $('#desktop').getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, left: r.left-area.left, top: r.top-area.top }; win.style.left = `${drag.left}px`; win.style.top = `${drag.top}px`; win.style.transform = 'none'; bar.setPointerCapture(e.pointerId); });
  bar.addEventListener('pointermove', e => { if (!drag) return; const area = $('#desktop'); win.style.left = `${Math.max(0, Math.min(area.clientWidth-win.offsetWidth, drag.left+e.clientX-drag.x))}px`; win.style.top = `${Math.max(0, Math.min(area.clientHeight-100, drag.top+e.clientY-drag.y))}px`; });
  bar.addEventListener('pointerup', () => drag = null); bar.addEventListener('pointercancel', () => drag = null); bar.addEventListener('lostpointercapture', () => drag = null);
}
window.addEventListener('resize', () => { for (const w of Object.values(windows)) { if (w.style.left && !w.classList.contains('maximized')) { w.style.left = `${Math.max(0, Math.min(parseFloat(w.style.left), $('#desktop').clientWidth-w.offsetWidth))}px`; w.style.top = `${Math.max(0, Math.min(parseFloat(w.style.top), $('#desktop').clientHeight-130))}px`; } } });
function clock() { $('#clock').textContent = new Date().toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}); } clock(); setInterval(clock, 15000);
setPage('home'); updateDock();
