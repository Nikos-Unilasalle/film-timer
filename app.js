/* =============================================
   FilmTimer — App Logic
   ============================================= */

// ---- STATE ----
let state = {
  baths: [],
  currentIndex: 0,
  timerInterval: null,
  agitInterval: null,
  remaining: 0,
  totalSeconds: 0,
  paused: false,
  running: false,
  masterVolume: 0.7,
  // global config
  globalOffset: 5,
  globalAutoAdvance: false,
  globalAgitFreq: 60,
  globalAgitDur: 3,
  globalAgitSound: 'bell',
  globalEndSound: 'alarm',
  // corrections
  tempRef: 20,
  tempReal: 20,
  rollCount: 0,
  rollCompensation: 10,
  isoRef: 100,
  isoReal: 100,
  isoStopFactor: 33,
};

let bathIdCounter = 0;
let dragState = { el: null };

// ---- AUDIO ENGINE ----
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type, volume = 1) {
  const ctx = getAudioCtx();
  const vol = volume * state.masterVolume;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  const sounds = {
    click: () => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.06);
    },
    beep: () => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.02);
      gain.gain.setValueAtTime(vol * 0.5, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.26);
    },
    bell: () => {
      [1, 2.756, 5.404].forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 * ratio, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.4 / (i + 1), now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
      });
      return;
    },
    ping: () => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.65);
    },
    alarm: () => {
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.35;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(660, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(vol * 0.4, t + 0.02);
        g.gain.setValueAtTime(vol * 0.4, t + 0.25);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      }
      return;
    },
    chime: () => {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const t = now + i * 0.22;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.85);
      });
      return;
    },
    wood: () => {
      // Wooden block — short low thud
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.value = 350;
      flt.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * 0.9, now);
      src.connect(flt);
      flt.connect(g);
      g.connect(ctx.destination);
      src.start(now);
    },
    soft: () => {
      // Soft muted ding
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.4);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol * 0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.75);
    },
    double: () => {
      // Two quick beeps
      [0, 0.22].forEach(delay => {
        const t = now + delay;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(vol * 0.45, t + 0.01);
        g.gain.setValueAtTime(vol * 0.45, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
      return;
    },
    low: () => {
      // Deep, resonant low tone
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.05);
      gain.gain.setValueAtTime(vol * 0.7, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.95);
    },
    glass: () => {
      // Crystal glass tap
      [1, 3.01, 6.18].forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520 * ratio, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.35 / (i + 1), now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.3);
      });
      return;
    },
    fanfare: () => {
      // Short ascending fanfare — 4 notes
      const melody = [523.25, 659.25, 783.99, 1046.5];
      const durations = [0.18, 0.18, 0.18, 0.55];
      let t = now;
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(vol * 0.3, t + 0.02);
        g.gain.setValueAtTime(vol * 0.3, t + durations[i] - 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + durations[i] + 0.01);
        t += durations[i];
      });
      return;
    },
  };

  if (sounds[type]) sounds[type]();
}

// ---- UTILS ----
function parseDuration(str) {
  // accepts mm:ss or plain seconds
  if (!str) return 0;
  str = str.trim();
  if (str.includes(':')) {
    const [m, s] = str.split(':').map(Number);
    return (m || 0) * 60 + (s || 0);
  }
  return parseInt(str, 10) || 0;
}

function formatDuration(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDurationLong(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

// ---- CORRECTIONS ----
function calcTempFactor(realTemp, refTemp) {
  // Ilford Q10 method: time doubles/halves every 10°C (Q10=2)
  // Factor = 2^((refTemp - realTemp) / 10)
  const delta = refTemp - realTemp;
  return Math.pow(2, delta / 10);
}

function calcRollFactor(rollCount, compensationPct) {
  return 1 + (rollCount * compensationPct / 100);
}

function calcIsoFactor(isoReal, isoRef, stopFactorPct) {
  // stops = log2(isoReal / isoRef)  — positive = push, negative = pull
  if (isoRef <= 0 || isoReal <= 0) return 1;
  const stops = Math.log2(isoReal / isoRef);
  // Each stop of push adds stopFactorPct% to development time
  // pull works inversely: each stop under removes stopFactorPct%
  const factorPerStop = 1 + (stopFactorPct / 100);
  return Math.pow(factorPerStop, stops);
}

function updateCorrectionPreviews() {
  // --- Temperature ---
  const ref = parseFloat(document.getElementById('temp-ref').value) || 20;
  const real = parseFloat(document.getElementById('temp-real').value) || ref;
  const delta = ref - real;
  const tFactor = calcTempFactor(real, ref);

  const tDisp = document.getElementById('temp-factor-display');
  const tHint = document.getElementById('temp-hint');
  tDisp.textContent = `× ${tFactor.toFixed(2)}`;
  tDisp.className = 'factor-pill ' + (Math.abs(delta) < 0.1 ? 'neutral' : delta > 0 ? 'slower' : 'faster');
  tHint.textContent = Math.abs(delta) < 0.1
    ? 'Aucun écart'
    : `${delta > 0 ? '▲ Plus froid' : '▼ Plus chaud'} — écart ${Math.abs(delta).toFixed(1)}°C`;

  // --- Roll exhaustion ---
  const rolls = parseInt(document.getElementById('roll-count').value, 10) || 0;
  const pct = parseFloat(document.getElementById('roll-compensation').value) || 10;
  const rFactor = calcRollFactor(rolls, pct);
  const rDisp = document.getElementById('roll-factor-display');
  const rPct = Math.round((rFactor - 1) * 100);
  rDisp.textContent = `+ ${rPct}%`;
  rDisp.className = 'factor-pill ' + (rPct === 0 ? 'neutral' : 'slower');

  // --- ISO Push/Pull ---
  const isoRef = parseFloat(document.getElementById('iso-ref').value) || 100;
  const isoReal = parseFloat(document.getElementById('iso-real').value) || isoRef;
  const stopFactor = parseFloat(document.getElementById('iso-stop-factor').value) || 33;
  const stops = Math.log2(isoReal / isoRef);
  const iFactor = calcIsoFactor(isoReal, isoRef, stopFactor);

  const iDisp = document.getElementById('iso-factor-display');
  const iHint = document.getElementById('iso-hint');
  iDisp.textContent = `× ${iFactor.toFixed(2)}`;

  const stopsLabel = Math.abs(stops) < 0.05
    ? '0 stop — aucun écart'
    : `${stops > 0 ? 'Push' : 'Pull'} ${Math.abs(stops).toFixed(2).replace('.00', '')} stop${Math.abs(stops) >= 2 ? 's' : ''}` ;

  if (Math.abs(stops) < 0.05) {
    iDisp.className = 'factor-pill neutral';
  } else if (stops > 0) {
    iDisp.className = 'factor-pill slower'; // push = more time
  } else {
    iDisp.className = 'factor-pill faster'; // pull = less time
  }
  iHint.textContent = stopsLabel;
}

// ---- BATH ITEM BUILDER ----
function createBathItem() {
  const template = document.getElementById('bath-template');
  const clone = template.content.cloneNode(true);
  const item = clone.querySelector('.bath-item');
  const id = ++bathIdCounter;
  item.dataset.id = id;

  // Toggle expand
  const toggleBtn = item.querySelector('.bath-toggle-expand');
  const body = item.querySelector('.bath-item-body');
  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('hidden');
    toggleBtn.textContent = body.classList.contains('hidden') ? '▸' : '▾';
  });

  // Delete
  item.querySelector('.bath-delete').addEventListener('click', () => {
    item.remove();
    refreshBathIndices();
    updateStartBtn();
  });

  // Toggle agitation
  const agitCheck = item.querySelector('.bath-agit-enabled');
  const agitOpts = item.querySelector('.bath-agit-options');
  agitCheck.addEventListener('change', () => {
    agitOpts.classList.toggle('hidden', !agitCheck.checked);
  });

  // ---- DRAG & DROP ----
  const handle = item.querySelector('.bath-drag-handle');

  handle.addEventListener('mousedown', () => {
    item.draggable = true;
  });

  item.addEventListener('dragstart', (e) => {
    if (!item.draggable) { e.preventDefault(); return; }
    dragState.el = item;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
    requestAnimationFrame(() => item.classList.add('dragging'));
  });

  item.addEventListener('dragend', () => {
    item.draggable = false;
    item.classList.remove('dragging');
    document.querySelectorAll('.bath-item').forEach(el => el.classList.remove('drag-over'));
    dragState.el = null;
    refreshBathIndices();
  });

  item.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragState.el || dragState.el === item) return;
    const rect = item.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    document.querySelectorAll('.bath-item').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
    const list = document.getElementById('baths-list');
    if (e.clientY < mid) {
      list.insertBefore(dragState.el, item);
    } else {
      list.insertBefore(dragState.el, item.nextSibling);
    }
  });

  item.addEventListener('drop', (e) => {
    e.preventDefault();
    item.classList.remove('drag-over');
  });

  return item;
}

function refreshBathIndices() {
  const items = document.querySelectorAll('#baths-list .bath-item');
  items.forEach((el, i) => {
    el.querySelector('.bath-index').textContent = `${i + 1}.`;
  });
  document.getElementById('bath-count-badge').textContent = items.length;
  updateStartBtn();
}

function updateStartBtn() {
  const count = document.querySelectorAll('#baths-list .bath-item').length;
  document.getElementById('btn-start').disabled = count === 0;
}

// ---- COLLECT CONFIG ----
function collectConfig() {
  state.globalOffset = parseInt(document.getElementById('global-offset').value, 10) || 5;
  state.globalAutoAdvance = document.getElementById('global-auto').checked;
  state.globalAgitFreq = parseInt(document.getElementById('global-agit-freq').value, 10) || 60;
  state.globalAgitDur = parseInt(document.getElementById('global-agit-dur').value, 10) || 3;
  state.globalAgitSound = document.getElementById('global-agit-sound').value;
  state.globalEndSound = document.getElementById('global-end-sound').value;
  state.tempRef = parseFloat(document.getElementById('temp-ref').value) || 20;
  state.tempReal = parseFloat(document.getElementById('temp-real').value) || state.tempRef;
  state.rollCount = parseInt(document.getElementById('roll-count').value, 10) || 0;
  state.rollCompensation = parseFloat(document.getElementById('roll-compensation').value) || 10;
  state.isoRef = parseFloat(document.getElementById('iso-ref').value) || 100;
  state.isoReal = parseFloat(document.getElementById('iso-real').value) || state.isoRef;
  state.isoStopFactor = parseFloat(document.getElementById('iso-stop-factor').value) || 33;

  state.baths = [];
  document.querySelectorAll('#baths-list .bath-item').forEach((el, i) => {
    const durStr = el.querySelector('.bath-duration').value || '5:00';
    const offset = el.querySelector('.bath-offset').value;
    const agitEnabled = el.querySelector('.bath-agit-enabled').checked;
    const agitFreqVal = el.querySelector('.bath-agit-freq').value;
    const agitDurVal = el.querySelector('.bath-agit-dur').value;
    const agitSoundVal = el.querySelector('.bath-agit-sound').value;
    const applyCorrection = el.querySelector('.bath-apply-correction').checked;

    state.baths.push({
      index: i,
      name: el.querySelector('.bath-name-input').value || `Bain ${i + 1}`,
      message: el.querySelector('.bath-message').value,
      duration: parseDuration(durStr),
      offset: offset !== '' ? parseInt(offset, 10) : state.globalOffset,
      applyCorrection,
      agitation: agitEnabled ? {
        freq: agitFreqVal ? parseInt(agitFreqVal, 10) : state.globalAgitFreq,
        dur: agitDurVal ? parseInt(agitDurVal, 10) : state.globalAgitDur,
        sound: agitSoundVal || state.globalAgitSound,
      } : null,
    });
  });
}

// ---- VIEWS ----
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---- TIMER LOGIC ----
function startSequence() {
  collectConfig();
  if (!state.baths.length) return;
  state.currentIndex = 0;
  state.running = true;
  buildSidebar();
  showView('view-timer');
  startBath(0, true);
}

function buildSidebar() {
  const ol = document.getElementById('sidebar-steps');
  ol.innerHTML = '';
  state.baths.forEach((b, i) => {
    const li = document.createElement('li');
    li.dataset.index = i;
    li.innerHTML = `<span class="step-num">${i + 1}</span><span class="step-info"><span>${b.name}</span><span class="step-dur">${formatDuration(b.duration)}</span></span>`;
    ol.appendChild(li);
  });
  updateSidebarActive(0);
}

function updateSidebarActive(idx) {
  document.querySelectorAll('.sidebar-steps li').forEach((li, i) => {
    li.classList.remove('active', 'done');
    if (i < idx) li.classList.add('done');
    else if (i === idx) li.classList.add('active');
  });
}

function startBath(index, startPaused = false) {
  if (index >= state.baths.length) { endSequence(); return; }
  const bath = state.baths[index];
  state.currentIndex = index;
  state.paused = startPaused;

  // Apply corrections if flagged for this bath
  let correctedDuration = bath.duration;
  let correctionNote = '';
  if (bath.applyCorrection) {
    const tFactor = calcTempFactor(state.tempReal, state.tempRef);
    const rFactor = calcRollFactor(state.rollCount, state.rollCompensation);
    const iFactor = calcIsoFactor(state.isoReal, state.isoRef, state.isoStopFactor);
    correctedDuration = Math.round(bath.duration * tFactor * rFactor * iFactor);
    const parts = [];
    if (Math.abs(tFactor - 1) > 0.005) parts.push(`temp ×${tFactor.toFixed(2)}`);
    if (rFactor > 1.005) parts.push(`épuis. ×${rFactor.toFixed(2)}`);
    if (Math.abs(iFactor - 1) > 0.005) parts.push(`iso ×${iFactor.toFixed(2)}`);
    if (parts.length) correctionNote = `[Corrigé : ${parts.join(', ')}]`;
  }

  state.remaining = correctedDuration;
  state.totalSeconds = correctedDuration;

  updateSidebarActive(index);

  // UI
  document.getElementById('timer-step-label').textContent = `Étape ${index + 1} / ${state.baths.length}`;
  document.getElementById('timer-bath-title').textContent = bath.name;
  const msg = [bath.message, correctionNote].filter(Boolean).join(' ');
  document.getElementById('timer-bath-message').textContent = msg;
  document.getElementById('timer-total').textContent = formatDuration(correctedDuration);
  document.getElementById('btn-pause').textContent = state.paused ? '▶ Commencer' : '⏸ Pause';
  document.getElementById('btn-next').classList.add('hidden');
  document.getElementById('agitation-indicator').classList.add('hidden');

  updateRing(1);
  updateDisplay();

  clearAllIntervals();

  // Agitation
  if (bath.agitation) {
    let agitElapsed = 0;
    let agitShowTimeout = null;
    state.agitInterval = setInterval(() => {
      if (state.paused) return;
      agitElapsed++;
      if (agitElapsed % bath.agitation.freq === 0) {
        playSound(bath.agitation.sound);
        showAgitIndicator(bath.agitation.dur);
      }
    }, 1000);
  }

  // Main countdown
  let offsetFired = false;
  state.timerInterval = setInterval(() => {
    if (state.paused) return;
    state.remaining--;

    // offset alarm
    if (!offsetFired && state.remaining === bath.offset && bath.offset > 0) {
      offsetFired = true;
      playSound(state.globalEndSound);
    }

    updateDisplay();
    updateRing(state.remaining / state.totalSeconds);

    if (state.remaining <= 10) {
      document.getElementById('ring-progress').classList.add('warning');
    }

    if (state.remaining <= 0) {
      clearAllIntervals();
      document.getElementById('ring-progress').classList.remove('warning');
      playSound(state.globalEndSound);

      if (state.globalAutoAdvance) {
        setTimeout(() => startBath(state.currentIndex + 1), 1200);
      } else {
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('timer-display').textContent = '00:00';
      }
    }
  }, 1000);
}

function showAgitIndicator(dur) {
  const el = document.getElementById('agitation-indicator');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), dur * 1000);
}

function updateDisplay() {
  document.getElementById('timer-display').textContent = formatDuration(Math.max(0, state.remaining));
}

function updateRing(fraction) {
  const circumference = 2 * Math.PI * 100; // r=100
  const offset = circumference * (1 - Math.max(0, Math.min(1, fraction)));
  document.getElementById('ring-progress').style.strokeDashoffset = offset;
}

function clearAllIntervals() {
  clearInterval(state.timerInterval);
  clearInterval(state.agitInterval);
  state.timerInterval = null;
  state.agitInterval = null;
}

function endSequence() {
  clearAllIntervals();
  state.running = false;
  showView('view-done');
}

// ---- MEMO / PRINT ----
function buildMemo() {
  collectConfig();
  const c = document.getElementById('print-content');
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
  const totalSec = state.baths.reduce((s, b) => s + b.duration, 0);

  // Build one clean table with all baths
  let rows = '';
  state.baths.forEach((b, i) => {
    let agitCell = '—';
    if (b.agitation) {
      agitCell = `/${formatDurationLong(b.agitation.freq)}`;
    }
    const even = i % 2 === 0 ? 'memo-row-even' : '';
    rows += `<tr class="${even}">
      <td class="memo-num">${i + 1}</td>
      <td class="memo-name">${b.name}</td>
      <td class="memo-dur">${formatDuration(b.duration)}</td>
      <td class="memo-agit">${agitCell}</td>
      <td class="memo-msg">${b.message || ''}</td>
    </tr>`;
  });

  const html = `
  <div class="memo-sheet">
    <div class="memo-header-block">
      <div class="memo-title-row">
        <span class="memo-brand">⬡ FilmTimer</span>
        <span class="memo-date">${dateStr}</span>
      </div>
      <div class="memo-meta-row">
        <span>Enchaînement : <strong>${state.globalAutoAdvance ? 'Auto' : 'Manuel'}</strong></span>
        <span>Sonnerie fin : <strong>${state.globalOffset}s avant</strong></span>
        <span>Retournement (défaut) : <strong>/${formatDurationLong(state.globalAgitFreq)}</strong></span>
        <span>Durée totale : <strong>${formatDurationLong(totalSec)}</strong></span>
      </div>
    </div>

    <table class="memo-main-table">
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-name">Bain</th>
          <th class="col-dur">Durée</th>
          <th class="col-agit">Retourn.</th>
          <th class="col-msg">Notes / Consignes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="memo-total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="memo-dur"><strong>${formatDurationLong(totalSec)}</strong></td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>

    <div class="memo-footer-block">
      <div class="memo-checkbox-row">
        <span class="memo-check-label">Pellicule&nbsp;:</span>
        <div class="memo-check-field"></div>
        <span class="memo-check-label">Température&nbsp;:</span>
        <div class="memo-check-field"></div>
        <span class="memo-check-label">ISO&nbsp;:</span>
        <div class="memo-check-field"></div>
        <span class="memo-check-label">Résultat&nbsp;:</span>
        <div class="memo-check-field wide"></div>
      </div>
    </div>
  </div>`;

  c.innerHTML = html;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {

  // Toggle auto label
  const autoToggle = document.getElementById('global-auto');
  const autoLabel = document.getElementById('auto-label');
  autoToggle.addEventListener('change', () => {
    autoLabel.textContent = autoToggle.checked ? 'Automatique' : 'Manuel';
  });

  // Add bath
  document.getElementById('btn-add-bath').addEventListener('click', () => {
    const item = createBathItem();
    document.getElementById('baths-list').appendChild(item);
    refreshBathIndices();
  });

  // Start
  document.getElementById('btn-start').addEventListener('click', () => {
    getAudioCtx(); // unlock audio on user gesture
    startSequence();
  });

  // Pause / Start
  document.getElementById('btn-pause').addEventListener('click', () => {
    state.paused = !state.paused;
    // If it was "Commencer" (starting state), once clicked it becomes "Pause".
    // If it was "Pause", it becomes "Reprendre".
    // To handle this cleanly: if it's paused, we show "Reprendre". But at the very start, it should read "Commencer".
    // Since "Commencer" is handled in `startBath`, here we simply toggle between "Reprendre" and "Pause" after the first click.
    if (state.paused) {
      document.getElementById('btn-pause').textContent = '▶ Reprendre';
    } else {
      document.getElementById('btn-pause').textContent = '⏸ Pause';
    }
  });

  // Next (manual)
  document.getElementById('btn-next').addEventListener('click', () => {
    document.getElementById('btn-next').classList.add('hidden');
    startBath(state.currentIndex + 1);
  });

  // Stop
  document.getElementById('btn-stop').addEventListener('click', () => {
    if (confirm("Voulez-vous vraiment arrêter la séquence en cours ?")) {
      clearAllIntervals();
      state.running = false;
      showView('view-setup');
    }
  });

  // Restart
  document.getElementById('btn-restart').addEventListener('click', () => {
    showView('view-setup');
  });

  // Print memo
  document.getElementById('btn-print').addEventListener('click', () => {
    buildMemo();
    document.getElementById('print-overlay').classList.remove('hidden');
  });
  document.getElementById('btn-close-print').addEventListener('click', () => {
    document.getElementById('print-overlay').classList.add('hidden');
  });
  document.getElementById('btn-do-print').addEventListener('click', () => {
    window.print();
  });

  // Settings
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('settings-overlay').classList.remove('hidden');
  });
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('settings-overlay').classList.add('hidden');
  });

  // Sound tests
  document.querySelectorAll('.btn-sound-test').forEach(btn => {
    btn.addEventListener('click', () => {
      getAudioCtx();
      playSound(btn.dataset.sound);
    });
  });

  // Volume
  document.getElementById('master-volume').addEventListener('input', (e) => {
    state.masterVolume = parseFloat(e.target.value);
  });

  // ---- PRESETS DATA ----
  const PRESETS = [
    {
      id: 'c41',
      label: 'C-41 Kodak',
      tag: 'Couleur',
      baths: [
        { name: 'Révélateur C-41', duration: '03:15', message: 'Agitation 30s, puis 10s/min. 38°C ±0.15°C', agit: true, freq: 60 },
        { name: 'Blix', duration: '06:30', message: 'Agitation continue les 30 premières sec', agit: true, freq: 30 },
        { name: 'Stabilisateur', duration: '01:00', message: '5 agitations douces', agit: false },
      ]
    },
    {
      id: 'colortex',
      label: 'Colortex C-41',
      tag: 'Couleur',
      baths: [
        { name: 'Révélateur', duration: '03:30', message: '38°C — agitation 1 min puis 5 inv./30s', agit: true, freq: 30 },
        { name: 'Blix', duration: '08:00', message: 'Agitation modérée', agit: true, freq: 60 },
        { name: 'Stabilisateur', duration: '01:00', message: 'Pas de rinçage après', agit: false },
      ]
    },
    {
      id: 'fomadon_lqn',
      label: 'Fomadon LQN',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur', duration: '08:00', message: '20°C — 5 inv. 1ère min, puis 5 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '05:00', message: '5 inv. 1ère min, puis 5 inv./2min', agit: true, freq: 120 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante 20°C', agit: false },
      ]
    },
    {
      id: 'fomadon_excel',
      label: 'Fomadon Excel',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur', duration: '07:00', message: '20°C — agitation 30s, puis 5 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '05:00', message: '5 inv. 1ère min, puis 5 inv./2min', agit: true, freq: 120 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'rodinal50',
      label: 'Rodinal 1+50',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur', duration: '11:00', message: '20°C — agitation 1ère min, puis 3 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '05:00', message: '30s agitation, puis 10s/min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'id11',
      label: 'Ilford ID-11 1+1',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur', duration: '13:00', message: '20°C — 10 inv. 1ère min, puis 4 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur Rapid', duration: '05:00', message: '10 inv. 1ère min, puis 5 inv./min', agit: true, freq: 60 },
        { name: 'Lavage final', duration: '10:00', message: 'Méthode Ilford : 5 inv. x 3 bains', agit: false },
      ]
    },
    {
      id: 'hc110',
      label: 'HC-110 dil. B',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur', duration: '07:00', message: '20°C — agitation 30s, puis 5 inv./30s', agit: true, freq: 30 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '05:00', message: '30s agitation, puis 10s/min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'tmax400',
      label: 'Kodak T-Max 400 (T-Max Dev)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur (1+4)', duration: '06:00', message: '20°C — Agit. 30s puis 5 inv/30s', agit: true, freq: 30 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur Rapid', duration: '05:00', message: '10 inv. 1ère min, puis 5 inv./min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'hp5_id11',
      label: 'Ilford HP5+ 400 (ID-11)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur ID-11 (Stock)', duration: '07:30', message: '20°C — 10 inv. 1ère min, puis 4 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '00:30', message: 'Agitation continue', agit: false },
        { name: 'Fixateur Rapid', duration: '03:00', message: '4 inv./min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Méthode Ilford', agit: false },
      ]
    },
    {
      id: 'fp4_id11',
      label: 'Ilford FP4+ 125 (ID-11)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur ID-11 (Stock)', duration: '08:30', message: '20°C — 10 inv. 1ère min, puis 4 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '00:30', message: 'Agitation continue', agit: false },
        { name: 'Fixateur Rapid', duration: '03:00', message: '4 inv./min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Méthode Ilford', agit: false },
      ]
    },
    {
      id: 'trix_d76',
      label: 'Kodak Tri-X 400 (D-76)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur D-76 (Stock)', duration: '06:45', message: '20°C — Agitation 5 inv/30s', agit: true, freq: 30 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '05:00', message: 'Agitation 5 inv/min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'kentmere400',
      label: 'Kentmere 400 (Rodinal 1+25)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur Rodinal', duration: '05:30', message: '20°C — Agitation 1ère min puis 4 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
        { name: 'Fixateur', duration: '04:00', message: 'Agitation 5 inv/min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
      ]
    },
    {
      id: 'delta3200',
      label: 'Ilford Delta 3200 (Microphen)',
      tag: 'N&B',
      baths: [
        { name: 'Révélateur Microphen (Stock)', duration: '09:00', message: '20°C — (Poussé à 3200 ASA) 4 inv./min', agit: true, freq: 60 },
        { name: 'Stop Bath', duration: '00:30', message: 'Agitation continue', agit: false },
        { name: 'Fixateur Rapid', duration: '05:00', message: 'Agitation 4 inv./min', agit: true, freq: 60 },
        { name: 'Lavage', duration: '10:00', message: 'Méthode Ilford', agit: false },
      ]
    },
  ];

  function loadPreset(preset) {
    document.getElementById('baths-list').innerHTML = '';
    bathIdCounter = 0;

    // Auto-set reference temperature
    if (preset.tag === 'Couleur') {
      document.getElementById('temp-ref').value = 38;
      document.getElementById('temp-real').value = 38;
    } else {
      document.getElementById('temp-ref').value = 20;
      document.getElementById('temp-real').value = 20;
    }
    updateCorrectionPreviews();

    preset.baths.forEach((b, idx) => {
      const item = createBathItem();
      item.querySelector('.bath-name-input').value = b.name;
      item.querySelector('.bath-duration').value = b.duration;
      item.querySelector('.bath-message').value = b.message || '';
      if (b.agit) {
        const agitCheck = item.querySelector('.bath-agit-enabled');
        agitCheck.checked = true;
        item.querySelector('.bath-agit-options').classList.remove('hidden');
        if (b.freq) item.querySelector('.bath-agit-freq').value = b.freq;
      }
      // Auto-enable correction on first bath (developer)
      if (idx === 0) {
        item.querySelector('.bath-apply-correction').checked = true;
      }
      document.getElementById('baths-list').appendChild(item);
      refreshBathIndices();
    });

    // Update dropdown label
    const tag = preset.tag === 'Couleur' ? '🌸' : '■';
    document.getElementById('preset-select-label').textContent = `${tag} ${preset.label} (${preset.baths.length} bains)`;
    document.getElementById('preset-dropdown').classList.remove('open');
    document.querySelector('.preset-select-wrap').classList.remove('open');

    document.querySelector('.baths-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getCustomPresets() {
    try {
      const d = localStorage.getItem('filmtimer_presets');
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }
  function saveCustomPresets(arr) {
    localStorage.setItem('filmtimer_presets', JSON.stringify(arr));
  }

  // Build preset dropdown
  const dropdown = document.getElementById('preset-dropdown');
  const selectBtn = document.getElementById('preset-select-btn');
  const selectWrap = document.querySelector('.preset-select-wrap');

  function renderPresetsDropdown() {
    dropdown.innerHTML = '';
    const allPresets = [...PRESETS, ...getCustomPresets()];

    // Group by tag
    const groups = {};
    allPresets.forEach(p => {
      const t = p.tag || 'Mes Présets';
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    });

    Object.entries(groups).forEach(([tag, presets]) => {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'preset-group-label';
      if (tag === 'Couleur') groupLabel.textContent = '🌸 Couleur';
      else if (tag === 'N&B') groupLabel.textContent = '■ N&B';
      else groupLabel.textContent = `💾 ${tag}`;
      dropdown.appendChild(groupLabel);

      presets.forEach(preset => {
        const opt = document.createElement('button');
        opt.className = 'preset-option';
        
        // Add delete button if it's a custom preset
        let delBtn = '';
        if (preset.isCustom) {
           delBtn = `<span class="preset-action-del" data-id="${preset.id}" title="Supprimer">✕</span>`;
        }

        opt.innerHTML = `<span class="preset-opt-name">${preset.label}</span><div style="display:flex;align-items:center;gap:0.7rem"><span class="preset-opt-count">${preset.baths.length} bains</span>${delBtn}</div>`;
        
        opt.addEventListener('click', (e) => {
          if (e.target.classList.contains('preset-action-del')) {
            e.stopPropagation();
            if (confirm(`Supprimer définitivement le préset "${preset.label}" ?`)) {
              let c = getCustomPresets();
              c = c.filter(x => x.id !== preset.id);
              saveCustomPresets(c);
              renderPresetsDropdown();
            }
            return;
          }
          getAudioCtx();
          loadPreset(preset);
        });
        dropdown.appendChild(opt);
      });
    });
  }

  renderPresetsDropdown();

  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectWrap.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    selectWrap.classList.remove('open');
  });

  // Action Buttons: Save, Export, Import
  document.getElementById('btn-save-preset').addEventListener('click', () => {
    collectConfig(); // Ensure state.baths is up to date
    if (!state.baths || state.baths.length === 0) {
      alert("Ajoutez au moins un bain avant d'enregistrer !");
      return;
    }
    const name = prompt("Nom de votre séquence de développement :");
    if (!name || !name.trim()) return;

    // Build preset structure
    const preset = {
      id: 'custom_' + Date.now(),
      label: name.trim(),
      tag: 'Mes Présets',
      isCustom: true,
      baths: state.baths.map(b => ({
        name: b.name,
        duration: formatDurationShort(b.duration), // Re-convert back to mm:ss for preset compatibility
        message: b.message,
        agit: b.agitation !== null,
        freq: b.agitation ? b.agitation.freq : null
      }))
    };

    const c = getCustomPresets();
    c.push(preset);
    saveCustomPresets(c);
    renderPresetsDropdown();
    alert("Séquence enregistrée ! Elle sera disponible la prochaine fois dans le menu.");
  });

  // Format integer seconds to mm:ss for export
  function formatDurationShort(sec) {
     const m = Math.floor(sec / 60);
     const s = sec % 60;
     return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  document.getElementById('btn-export-preset').addEventListener('click', () => {
    collectConfig();
    if (!state.baths || state.baths.length === 0) return alert("Rien à exporter.");
    const preset = {
      id: 'export_' + Date.now(),
      label: "Export FilmTimer",
      tag: "Mes Présets",
      isCustom: true,
      baths: state.baths.map(b => ({
        name: b.name,
        duration: formatDurationShort(b.duration),
        message: b.message,
        agit: b.agitation !== null,
        freq: b.agitation ? b.agitation.freq : null
      }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "filmtimer_preset.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  document.getElementById('file-import-preset').addEventListener('change', (e) => {
     const file = e.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = function(evt) {
        try {
           const parsed = JSON.parse(evt.target.result);
           if (!parsed.baths || !Array.isArray(parsed.baths)) throw new Error("Format JSON invalide.");
           
           parsed.id = 'imported_' + Date.now();
           parsed.tag = 'Mes Présets';
           parsed.isCustom = true;
           if (!parsed.label) parsed.label = "Importé";

           const c = getCustomPresets();
           c.push(parsed);
           saveCustomPresets(c);
           renderPresetsDropdown();
           alert(`Préset "${parsed.label}" importé avec succès !`);
           loadPreset(parsed);
        } catch (err) {
           alert("Erreur lors de la lecture du fichier : " + err.message);
        }
        e.target.value = ''; // Reset input
     };
     reader.readAsText(file);
  });

  // Fullscreen button
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.getElementById('btn-fullscreen').textContent = '⛶';
    } else {
      document.exitFullscreen();
      document.getElementById('btn-fullscreen').textContent = '⛶';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('btn-fullscreen');
    btn.textContent = document.fullscreenElement ? '⛶' : '⛶';
    btn.title = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran';
  });

  // Temperature shortcuts (N&B / C-41)
  document.querySelectorAll('.btn-temp-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.temp;
      document.getElementById('temp-ref').value = t;
      document.getElementById('temp-real').value = t;
      updateCorrectionPreviews();
    });
  });

  // Live correction previews
  ['temp-ref', 'temp-real', 'roll-count', 'roll-compensation', 'iso-ref', 'iso-real', 'iso-stop-factor'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateCorrectionPreviews);
  });
  updateCorrectionPreviews();
  // Pre-populate default baths (blank start)
  const examples = [
    { name: 'Révélateur', duration: '06:00', message: 'Agitation continue 30s puis 5 inv./min', agit: true },
    { name: 'Stop Bath', duration: '01:00', message: 'Agitation continue', agit: false },
    { name: 'Fixateur', duration: '05:00', message: '30s agitation, puis 5 inv. toutes les min', agit: true },
    { name: 'Lavage', duration: '10:00', message: 'Eau courante', agit: false },
  ];

  examples.forEach(ex => {
    const item = createBathItem();
    item.querySelector('.bath-name-input').value = ex.name;
    item.querySelector('.bath-duration').value = ex.duration;
    item.querySelector('.bath-message').value = ex.message;
    if (ex.agit) {
      const agitCheck = item.querySelector('.bath-agit-enabled');
      agitCheck.checked = true;
      item.querySelector('.bath-agit-options').classList.remove('hidden');
    }
    document.getElementById('baths-list').appendChild(item);
    refreshBathIndices();
  });

  // Close overlays on backdrop click
  document.getElementById('print-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('print-overlay')) {
      document.getElementById('print-overlay').classList.add('hidden');
    }
  });
  document.getElementById('settings-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-overlay')) {
      document.getElementById('settings-overlay').classList.add('hidden');
    }
  });

  document.getElementById('btn-lang').addEventListener('click', () => {
    switchLang(currentLang === 'fr' ? 'en' : 'fr');
  });
});
