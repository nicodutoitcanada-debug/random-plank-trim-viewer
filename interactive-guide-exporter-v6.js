(() => {
  'use strict';

  // This file is intentionally isolated from the main viewer. If anything here
  // fails, the existing model viewer / BUILD PLAN code has already initialized.
  try {
    const BUTTON_ID = 'generatedPlanInteractiveGuideButton';
    const RED = '#d52b37';
    const FILES = {
      logo: 'logo.png',
      general: 'GENERAL.pdf',
      boxBase: 'BOX BASE.pdf',
      starter: 'STARTER.pdf',
      terminate: 'TERMINATE.pdf',
      isEndStart: 'INSIDE END START.pdf',
      isEndEnd: 'INSIDE END END.pdf',
      isStartStart: 'INSIDE START START.pdf',
      osEndEnd: 'OUTSIDE END END.pdf',
      osStartEnd: 'OUTSIDE START END.pdf',
      osStartStart: 'OUTSIDE START START.pdf',
      lastPage: 'LAST PAGE.pdf'
    };

    const LABELS = {
      starter: 'STARTER',
      terminate: 'TERMINATE',
      isEndStart: 'INSIDE END START',
      isEndEnd: 'INSIDE END END',
      isStartStart: 'INSIDE START START',
      osEndEnd: 'OUTSIDE END END',
      osStartEnd: 'OUTSIDE START END',
      osStartStart: 'OUTSIDE START START'
    };

    const htmlEscape = (value) => String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const fileSafe = (value) => String(value || 'Random-Plank-Project')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 90) || 'Random-Plank-Project';

    function addStyles() {
      if (document.getElementById('interactiveGuideExporterStyles')) return;
      const style = document.createElement('style');
      style.id = 'interactiveGuideExporterStyles';
      style.textContent = `
        #${BUTTON_ID}{min-width:236px;min-height:42px;padding:4px 16px 4px 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(5,5,5,.78);box-shadow:0 9px 26px rgba(0,0,0,.26);gap:9px;opacity:1;display:none;align-items:center;justify-content:center;color:#fff;cursor:pointer;font-weight:800;letter-spacing:.02em;}
        .generatedPlanOverlay[data-phase="generated"] #${BUTTON_ID}.isAvailable{display:flex;}
        #${BUTTON_ID}:hover{background:rgba(201,34,46,.72);border-color:rgba(255,255,255,.24);box-shadow:0 11px 30px rgba(201,34,46,.18);transform:translateY(-1px)}
        #${BUTTON_ID}:active{transform:translateY(0) scale(.985)}
        #${BUTTON_ID}.isBusy{opacity:.55;pointer-events:none}
        #${BUTTON_ID} svg{width:29px;height:29px;flex:0 0 29px;pointer-events:none}
        #${BUTTON_ID} .screen{fill:rgba(255,255,255,.07);stroke:rgba(255,255,255,.94);stroke-width:1.7}
        #${BUTTON_ID} .play{fill:${RED}}
        .igNameOverlay{position:fixed;inset:0;z-index:10000050;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(0,0,0,.56);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .22s ease}
        .igNameOverlay.open{opacity:1;pointer-events:auto}.igNameCard{width:min(590px,calc(100vw - 34px));padding:30px;border:1px solid rgba(255,255,255,.18);border-radius:26px;background:rgba(18,18,18,.97);box-shadow:0 26px 90px rgba(0,0,0,.5);color:#fff}.igNameTitle{font-size:24px;font-weight:900;letter-spacing:.025em;text-transform:uppercase}.igNameBody{margin:10px 0 20px;color:rgba(255,255,255,.76);font-size:14px;line-height:1.5}.igNameInput{display:block;width:100%;height:48px;box-sizing:border-box;padding:0 15px;border:1px solid rgba(255,255,255,.23);border-radius:12px;outline:0;background:rgba(255,255,255,.07);color:#fff;font:600 15px Arial,sans-serif}.igNameInput:focus{border-color:rgba(255,255,255,.65);box-shadow:0 0 0 3px rgba(255,255,255,.07)}.igNameActions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.igNameBtn{min-width:116px;min-height:43px;border:0;border-radius:999px;padding:0 18px;background:rgba(255,255,255,.13);color:#fff;font-weight:800;cursor:pointer}.igNameBtn.primary{background:${RED}}.igNameError{height:18px;margin-top:8px;color:#ff6670;font-size:11px;font-weight:700;opacity:0}.igNameError.show{opacity:1}
      `;
      document.head.appendChild(style);
    }

    function createButton() {
      if (document.getElementById(BUTTON_ID)) return document.getElementById(BUTTON_ID);
      const pdfButton = document.getElementById('generatedPlanDownloadFooterButton');
      const actions = pdfButton && pdfButton.parentElement;
      if (!actions) return null;
      const button = document.createElement('button');
      button.id = BUTTON_ID;
      button.type = 'button';
      button.setAttribute('data-show-phase', 'generated');
      button.setAttribute('aria-label', 'Generate interactive installation guide');
      button.title = 'Generate interactive installation guide';
      button.innerHTML = `
        <svg viewBox="0 0 32 32" aria-hidden="true"><rect class="screen" x="3.5" y="5" width="25" height="19" rx="4"></rect><path class="screen" d="M11 27h10"></path><path class="play" d="M14 10.5 22 14.5 14 18.5Z"></path></svg>
        <span>GENERATE INTERACTIVE GUIDE</span>`;
      // Reuse the existing footer's layout class only after creation.
      button.className = 'generatedPlanActionButton isAvailable';
      actions.appendChild(button);
      return button;
    }

    function requestProjectName() {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'igNameOverlay';
        overlay.innerHTML = `<div class="igNameCard" role="dialog" aria-modal="true" aria-label="Project name"><div class="igNameTitle">Custom Interactive Guide</div><div class="igNameBody">Enter the project name for this Random Plank installation guide.</div><input class="igNameInput" autocomplete="off" placeholder="Project name"><div class="igNameError">Please enter a project name.</div><div class="igNameActions"><button class="igNameBtn cancel" type="button">CANCEL</button><button class="igNameBtn primary generate" type="button">GENERATE GUIDE</button></div></div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('open'));
        const input = overlay.querySelector('.igNameInput');
        const error = overlay.querySelector('.igNameError');
        const close = (value) => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 220); resolve(value); };
        const submit = () => { const value = input.value.trim(); if (!value) { error.classList.add('show'); input.focus(); return; } close(value); };
        overlay.querySelector('.cancel').onclick = () => close(null);
        overlay.querySelector('.generate').onclick = submit;
        input.addEventListener('input', () => error.classList.remove('show'));
        overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } if (e.key === 'Escape') { e.preventDefault(); close(null); } });
        setTimeout(() => input.focus(), 70);
      });
    }

    function getHotspots() {
      return Array.from(document.querySelectorAll('#generatedPlanViewport .generatedPlanHotspot')).map((node) => ({
        key: node.dataset.hotspotKey || '',
        label: (node.querySelector('.generatedPlanHotspotLabel')?.textContent || '').trim()
      })).filter((item) => item.key && FILES[item.key]);
    }

    function uniqueConditionsInPlanOrder() {
      const seen = new Set();
      const out = [];
      for (const item of getHotspots()) {
        if (seen.has(item.key)) continue;
        seen.add(item.key);
        out.push({ key: item.key, title: item.label || LABELS[item.key] || item.key, file: FILES[item.key] });
      }
      return out;
    }

    function capturePlanSvg() {
      const canvas = document.getElementById('generatedPlanCanvas');
      const viewport = document.getElementById('generatedPlanViewport');
      if (!canvas || !viewport || !viewport.childNodes.length) throw new Error('Generate the installation plan before creating an interactive guide.');
      const clone = canvas.cloneNode(true);
      clone.removeAttribute('style');
      const cloneViewport = clone.querySelector('#generatedPlanViewport');
      if (cloneViewport) cloneViewport.removeAttribute('transform');
      clone.querySelectorAll('#generatedPlanPreview,#generatedPlanAngleGuide,.generatedPlanCurveEditGuides').forEach((n) => n.remove());

      let box = { x: 0, y: 0, width: 1000, height: 600 };
      try {
        const b = viewport.getBBox();
        if (b && b.width > 1 && b.height > 1) box = b;
      } catch (_) {}
      const pad = Math.max(55, Math.min(115, Math.max(box.width, box.height) * 0.10));
      clone.setAttribute('viewBox', `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`);
      clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      clone.removeAttribute('width'); clone.removeAttribute('height');
      clone.classList.add('interactivePlanSvg');
      clone.querySelectorAll('.generatedPlanHotspot').forEach((n) => {
        n.setAttribute('tabindex', '0');
        n.setAttribute('role', 'button');
      });
      clone.querySelectorAll('.generatedPlanRpPlank.isGenerated').forEach((n, i) => n.setAttribute('data-install-order', String(i)));
      return new XMLSerializer().serializeToString(clone);
    }

    async function fetchBlob(file) {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${file} (${response.status}).`);
      return response.blob();
    }

    const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Could not encode an asset.'));
      reader.readAsDataURL(blob);
    });

    const blobToBase64 = async (blob) => {
      const url = await blobToDataUrl(blob);
      return url.slice(url.indexOf(',') + 1);
    };

    async function buildInteractiveHtml(projectName) {
      const planSvg = capturePlanSvg();
      const conditions = uniqueConditionsInPlanOrder();
      const logoData = await blobToDataUrl(await fetchBlob(FILES.logo));
      const sections = [
        { key: 'general', title: 'GENERAL', file: FILES.general },
        { key: 'boxBase', title: 'BOX BASE', file: FILES.boxBase },
        ...conditions,
        { key: 'lastPage', title: 'FINAL INFORMATION', file: FILES.lastPage }
      ];
      const embedded = [];
      for (const section of sections) embedded.push({ ...section, base64: await blobToBase64(await fetchBlob(section.file)) });

      const sequence = conditions.length
        ? conditions.map((c) => c.title).join('  •  ')
        : 'Follow the installation direction shown in the plan.';
      const disclaimer = 'This generated plan is based on the information and wall layout provided and our interpretation of the installation conditions. Final site measurements, quantities, cut lists, trim requirements, and installation details remain the responsibility of the contractor/installer and must be verified on site before ordering materials, fabrication, or installation.';
      const sectionMarkup = embedded.map((s) => `<section class="manualSection" id="guide-section-${htmlEscape(s.key)}"><div class="sectionHeading"><div><span>CUSTOM INSTALLATION GUIDE</span><h2>${htmlEscape(s.title)}</h2></div><a href="#interactive-plan">BACK TO PLAN</a></div><div class="pdfPages"><div class="loading">Preparing ${htmlEscape(s.title)}...</div></div><template class="pdfData">${s.base64}</template></section>`).join('');

      const closeScript = '</scr' + 'ipt>';
      return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(projectName)} - Interactive Random Plank Installation Guide</title><style>
:root{color-scheme:dark;--red:${RED};--bg:#0a0b0c}*{box-sizing:border-box}html{scroll-behavior:smooth;background:var(--bg)}body{margin:0;font-family:Arial,sans-serif;color:#fff;background:radial-gradient(circle at 50% -12%,#2b2d30 0,#131416 42%,#090a0b 100%)}.topBar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:rgba(8,9,10,.86);backdrop-filter:blur(15px);border-bottom:1px solid rgba(255,255,255,.1)}.topTitle{font-size:12px;font-weight:800}.actions{display:flex;gap:8px}.btn{border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:10px 15px;background:rgba(255,255,255,.08);color:#fff;font-weight:800;cursor:pointer}.btn.primary{background:var(--red);border-color:transparent}.btn:disabled{opacity:.45}.cover{min-height:calc(100vh - 60px);padding:48px 34px 34px}.coverHeader{width:min(1160px,100%);margin:auto;display:flex;justify-content:space-between;align-items:flex-start;gap:28px}.project{margin:0;font-size:clamp(28px,4vw,52px);line-height:.95;font-weight:900;text-transform:uppercase}.subtitle{margin-top:7px;color:rgba(255,255,255,.62);font-size:18px;text-transform:uppercase}.logo{width:min(180px,24vw);max-height:76px;object-fit:contain}.planCard{width:min(1180px,100%);margin:34px auto 0;padding:20px;border:1px solid rgba(255,255,255,.14);border-radius:26px;background:rgba(3,4,5,.70);box-shadow:0 28px 90px rgba(0,0,0,.34);overflow:hidden}.interactivePlanSvg{width:100%;height:auto;max-height:65vh;display:block}.interactivePlanSvg .generatedPlanBaseWall{stroke:rgba(255,255,255,.33);stroke-width:5;fill:none}.interactivePlanSvg .generatedPlanFlow{stroke:var(--red)!important;stroke-width:5;stroke-linecap:round;fill:none}.interactivePlanSvg .generatedPlanFlowMotion{stroke:rgba(255,255,255,.88)!important;stroke-width:2;stroke-linecap:round;stroke-dasharray:7 18;fill:none;opacity:.9;animation:igFlowDash 1.05s linear infinite}.interactivePlanSvg .generatedPlanArrowHead{fill:var(--red)!important;stroke:var(--red)!important;stroke-width:3.5;stroke-linejoin:round;stroke-linecap:round}@keyframes igFlowDash{to{stroke-dashoffset:-50}}.interactivePlanSvg .generatedPlanRpPlank.isGenerated{stroke:rgba(255,255,255,.17)!important;stroke-width:7;stroke-linecap:round;transition:stroke .24s ease,filter .24s ease}.interactivePlanSvg .generatedPlanRpPlank.isGenerated.installLit{stroke:#fff!important;filter:drop-shadow(0 0 7px rgba(255,255,255,.5))}.interactivePlanSvg .generatedPlanHotspot{cursor:pointer;transform-box:fill-box;transform-origin:center;outline:none!important;-webkit-tap-highlight-color:transparent}.interactivePlanSvg .generatedPlanHotspot:focus,.interactivePlanSvg .generatedPlanHotspot:focus-visible{outline:none!important}.interactivePlanSvg .generatedPlanHotspotCore{fill:#111;stroke:#fff;stroke-width:4}.interactivePlanSvg .generatedPlanHotspotDot{fill:#fff}.interactivePlanSvg .generatedPlanHotspotConnector{stroke:rgba(255,255,255,.88);stroke-width:1.8}.interactivePlanSvg .generatedPlanHotspotLabelBg{fill:rgba(0,0,0,.82);stroke:rgba(128,128,128,1);stroke-width:1;transition:.18s ease}.interactivePlanSvg .generatedPlanHotspotLabel{fill:#fff;font-size:12px;font-weight:800;text-anchor:middle}.interactivePlanSvg .generatedPlanHotspot:hover .generatedPlanHotspotCore{fill:var(--red);transform:scale(1.14);transform-box:fill-box;transform-origin:center}.interactivePlanSvg .generatedPlanHotspot:hover .generatedPlanHotspotLabelBg,.interactivePlanSvg .generatedPlanHotspot:focus .generatedPlanHotspotLabelBg,.interactivePlanSvg .generatedPlanHotspot:focus-visible .generatedPlanHotspotLabelBg{fill:rgba(213,43,55,.92)}.interactivePlanSvg .generatedPlanHotspot:focus .generatedPlanHotspotCore,.interactivePlanSvg .generatedPlanHotspot:focus-visible .generatedPlanHotspotCore{fill:var(--red)}.copy{width:min(1020px,100%);margin:26px auto 0;color:rgba(255,255,255,.78);font-size:14px;line-height:1.65}.callout{margin-top:15px;padding:14px 16px;border-left:3px solid var(--red);background:rgba(213,43,55,.08);border-radius:0 12px 12px 0;font-weight:700}.disclaimer{width:min(1120px,100%);margin:24px auto 0;color:rgba(255,255,255,.46);font-size:10px;line-height:1.55}.manualSection{width:min(1180px,calc(100% - 34px));margin:34px auto;padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(20,21,23,.95);box-shadow:0 20px 70px rgba(0,0,0,.28);scroll-margin-top:76px}.sectionHeading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:18px}.sectionHeading span{color:var(--red);font-size:9px;font-weight:800;letter-spacing:.12em}.sectionHeading h2{margin:4px 0 0;font-size:24px}.sectionHeading a{color:rgba(255,255,255,.72);font-size:9px;font-weight:800;text-decoration:none}.pdfPages{display:flex;flex-direction:column;align-items:center;gap:18px}.loading{padding:56px 18px;color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;gap:12px}.loading:before{content:'';width:22px;height:22px;border:3px solid rgba(255,255,255,.14);border-top-color:var(--red);border-radius:50%;animation:igLoadSpin .8s linear infinite}@keyframes igLoadSpin{to{transform:rotate(360deg)}}.pdfPage{width:min(100%,1000px);background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 42px rgba(0,0,0,.3)}.pdfPage canvas{display:block;width:100%;height:auto;border-radius:inherit}.fallback{padding:32px;text-align:center}.fallback a{display:inline-flex;margin-top:12px;padding:10px 16px;border-radius:999px;background:var(--red);color:#fff;text-decoration:none;font-size:10px;font-weight:800}@media(max-width:720px){.cover{padding:26px 14px}.planCard{padding:9px}.manualSection{padding:14px}.logo{width:128px}}@media print{html,body{background:#fff!important;color:#111!important}.topBar,.sectionHeading{display:none!important}.cover{min-height:auto;background:#e9e9e9!important;color:#111!important;break-after:page}.subtitle,.copy{color:#333!important}.disclaimer{color:#555!important}.planCard{background:#141516!important;box-shadow:none}.manualSection{width:100%;margin:0;padding:0;border:0;background:#fff!important;box-shadow:none}.pdfPages{gap:0}.pdfPage{width:100%;border-radius:0;box-shadow:none;break-after:page}}
</style></head><body><div class="topBar"><div class="topTitle">${htmlEscape(projectName)} · Interactive Installation Guide</div><div class="actions"><button class="btn" id="viewPlan">VIEW PLAN</button><button class="btn primary" id="printGuide" disabled>PREPARING GUIDE...</button></div></div><main><section class="cover" id="interactive-plan"><div class="coverHeader"><div><h1 class="project">${htmlEscape(projectName)}</h1><div class="subtitle">Interactive Installation Guide</div></div><img class="logo" src="${logoData}" alt="LUX"></div><div class="planCard">${planSvg}</div><div class="copy"><strong>INSTALLATION FLOW:</strong> ${htmlEscape(sequence)}<div class="callout">Important: read the GENERAL section in full before beginning installation. Click any marked intersection in the plan to jump directly to the matching installation condition below.</div></div><div class="disclaimer"><strong>PLANNING / SITE VERIFICATION DISCLAIMER:</strong> ${htmlEscape(disclaimer)}</div></section>${sectionMarkup}</main><script>
(function(){const PDF_JS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',PDF_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',printBtn=document.getElementById('printGuide');document.getElementById('viewPlan').onclick=()=>document.getElementById('interactive-plan').scrollIntoView({behavior:'smooth'});function b64(s){const raw=atob((s||'').replace(/\\s+/g,'')),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i)&255;return a}function load(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);return new Promise((res,rej)=>{const s=document.createElement('script');s.src=PDF_JS;s.onload=()=>window.pdfjsLib?res(window.pdfjsLib):rej(new Error('PDF renderer did not initialize.'));s.onerror=()=>rej(new Error('PDF renderer could not be loaded.'));document.head.appendChild(s)})}function fallback(sec,data,msg){const p=sec.querySelector('.pdfPages');p.innerHTML='';const d=document.createElement('div');d.className='fallback';d.textContent=msg||'This section could not be rendered.';try{const a=document.createElement('a');a.textContent='OPEN SECTION PDF';a.target='_blank';a.href=URL.createObjectURL(new Blob([b64(data)],{type:'application/pdf'}));d.appendChild(document.createElement('br'));d.appendChild(a)}catch(e){}p.appendChild(d)}async function render(lib,sec){const data=sec.querySelector('.pdfData').innerHTML.trim(),pages=sec.querySelector('.pdfPages');try{const pdf=await lib.getDocument({data:b64(data)}).promise;pages.innerHTML='';for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n),raw=page.getViewport({scale:1}),css=Math.min(1000,Math.max(320,innerWidth-90)),os=Math.min(2,devicePixelRatio||1),vp=page.getViewport({scale:(css/raw.width)*os}),c=document.createElement('canvas');c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);c.style.width=Math.round(vp.width/os)+'px';c.style.height=Math.round(vp.height/os)+'px';const w=document.createElement('div');w.className='pdfPage';w.appendChild(c);pages.appendChild(w);await page.render({canvasContext:c.getContext('2d',{alpha:false}),viewport:vp}).promise}}catch(e){fallback(sec,data,e.message)}}document.querySelectorAll('.interactivePlanSvg .generatedPlanHotspot').forEach(h=>{const go=()=>{const t=document.getElementById('guide-section-'+h.getAttribute('data-hotspot-key'));if(t)t.scrollIntoView({behavior:'smooth',block:'start'})};h.onclick=go;h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});const tiles=[...document.querySelectorAll('.interactivePlanSvg .generatedPlanRpPlank.isGenerated')];if(tiles.length){let timers=[];const cycle=()=>{timers.forEach(clearTimeout);timers=[];tiles.forEach(t=>t.classList.remove('installLit'));const step=Math.max(55,Math.min(110,2600/tiles.length));tiles.forEach((t,i)=>timers.push(setTimeout(()=>t.classList.add('installLit'),i*step)));const end=tiles.length*step+650;timers.push(setTimeout(()=>tiles.forEach(t=>t.classList.remove('installLit')),end));timers.push(setTimeout(cycle,end+850))};cycle()}(async()=>{try{const lib=await load();lib.GlobalWorkerOptions.workerSrc=PDF_WORKER;for(const sec of document.querySelectorAll('.manualSection'))await render(lib,sec)}catch(e){document.querySelectorAll('.manualSection').forEach(sec=>fallback(sec,sec.querySelector('.pdfData').innerHTML.trim(),e.message))}printBtn.disabled=false;printBtn.textContent='PRINT / SAVE AS PDF'})();printBtn.onclick=()=>window.print()})();
${closeScript}</body></html>`;
    }

    async function run(button) {
      const projectName = await requestProjectName();
      if (!projectName) return;
      const label = button.querySelector('span');
      const originalText = label ? label.textContent : button.textContent;
      button.classList.add('isBusy');
      button.disabled = true;
      if (label) label.textContent = 'GENERATING INTERACTIVE GUIDE...';
      else button.textContent = 'GENERATING INTERACTIVE GUIDE...';
      if (window.LuxPlanBusy && typeof window.LuxPlanBusy.show === 'function') {
        window.LuxPlanBusy.show('COMPILING INTERACTIVE GUIDE...');
      }
      let url = null;
      try {
        const html = await buildInteractiveHtml(projectName);
        if (window.LuxPlanBusy && typeof window.LuxPlanBusy.update === 'function') {
          window.LuxPlanBusy.update('PACKAGING INTERACTIVE GUIDE...');
        }
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileSafe(projectName)}-Random-Plank-Interactive-Installation-Guide.html`;
        a.style.display = 'none';
        document.body.appendChild(a); a.click(); a.remove();
      } catch (error) {
        console.error('Interactive guide generation failed:', error);
        alert('The interactive installation guide could not be generated.\n\n' + (error?.message || 'Unknown error.'));
      } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 5000);
        if (window.LuxPlanBusy && typeof window.LuxPlanBusy.hide === 'function') window.LuxPlanBusy.hide();
        button.classList.remove('isBusy');
        button.disabled = false;
        if (label) label.textContent = originalText || 'GENERATE INTERACTIVE GUIDE';
        else button.textContent = originalText || 'GENERATE INTERACTIVE GUIDE';
      }
    }

    function init() {
      addStyles();
      const button = createButton();
      if (button) button.classList.add('isAvailable');
      if (!button) {
        console.warn('Interactive guide exporter: PDF guide action area not found; exporter left disabled.');
        return;
      }
      button.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); run(button); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
  } catch (error) {
    // Never rethrow: this file is optional and must never affect the main page.
    console.error('Interactive guide exporter initialization failed:', error);
  }
})();
