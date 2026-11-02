/* ============================================================
   audio.js — procedural WebAudio: forest drone, punk clicks
   No external audio files. Everything is synthesised.
   ============================================================ */
(function () {
  const KEY = 'fo.audio';
  const settings = { enabled: true, volume: 0.55, music: true, sfx: true };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.enabled === 'boolean') settings.enabled = parsed.enabled;
      if (typeof parsed.volume === 'number') settings.volume = Math.max(0, Math.min(1, parsed.volume));
      if (typeof parsed.music === 'boolean') settings.music = parsed.music;
      if (typeof parsed.sfx === 'boolean') settings.sfx = parsed.sfx;
    }
  } catch (e) { /* ignore */ }

  let ctx = null;
  let master = null;
  let ambientGain = null;
  let ambientNodes = null;
  let started = false;

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }

  function makeCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = settings.enabled ? settings.volume : 0;
    master.connect(ctx.destination);
    return ctx;
  }

  function noiseBuffer(seconds) {
    const len = Math.floor((ctx.sampleRate || 44100) * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate || 44100);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function startAmbient() {
    if (!settings.enabled || !settings.music) return;
    if (!makeCtx()) return;
    if (ambientNodes) return;
    if (ctx.state === 'suspended') ctx.resume();
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.0;
    ambientGain.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    filter.connect(ambientGain);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 82.5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    osc1.connect(filter);
    osc2.connect(g2);
    g2.connect(filter);

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(3);
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGain);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.start();
    osc2.start();
    noise.start();
    lfo.start();

    ambientGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 3);
    ambientNodes = { osc1: osc1, osc2: osc2, noise: noise, lfo: lfo, gain: ambientGain };
  }

  function stopAmbient() {
    if (!ambientNodes) return;
    const nodes = ambientNodes;
    ambientNodes = null;
    try {
      nodes.gain.gain.cancelScheduledValues(ctx.currentTime);
      nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(function () {
        try { nodes.osc1.stop(); nodes.osc2.stop(); nodes.noise.stop(); nodes.lfo.stop(); } catch (e) { /* ignore */ }
      }, 600);
    } catch (e) { /* ignore */ }
  }

  function tone(freq, type, dur, vol, slideTo) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  function noiseHit(dur, vol, freq, type) {
    if (!ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const filter = ctx.createBiquadFilter();
    filter.type = type || 'bandpass';
    filter.frequency.value = freq || 1200;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
  }

  function play(name) {
    if (!settings.enabled || !settings.sfx) return;
    if (!makeCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    switch (name) {
      case 'click':
        tone(180, 'square', 0.05, 0.07, 130);
        break;
      case 'select':
        tone(330, 'triangle', 0.08, 0.1, 440);
        break;
      case 'assign':
        tone(420, 'square', 0.06, 0.08, 620);
        setTimeout(function () { tone(620, 'triangle', 0.09, 0.09, 820); }, 55);
        break;
      case 'cancel':
        tone(300, 'square', 0.1, 0.07, 150);
        break;
      case 'success':
        tone(392, 'triangle', 0.12, 0.11);
        setTimeout(function () { tone(523, 'triangle', 0.14, 0.11); }, 100);
        setTimeout(function () { tone(659, 'triangle', 0.2, 0.1); }, 210);
        break;
      case 'fail':
        tone(220, 'sawtooth', 0.18, 0.08, 110);
        setTimeout(function () { noiseHit(0.18, 0.06, 300, 'lowpass'); }, 90);
        break;
      case 'build':
        noiseHit(0.12, 0.12, 700);
        setTimeout(function () { tone(140, 'square', 0.1, 0.1, 90); }, 60);
        break;
      case 'raid':
        tone(700, 'sawtooth', 0.22, 0.09, 900);
        setTimeout(function () { tone(900, 'sawtooth', 0.22, 0.09, 700); }, 240);
        setTimeout(function () { tone(700, 'sawtooth', 0.3, 0.09, 500); }, 480);
        break;
      case 'day':
        tone(196, 'triangle', 0.25, 0.12);
        setTimeout(function () { tone(294, 'triangle', 0.3, 0.1); }, 180);
        break;
      case 'victory':
        [392, 523, 659, 784].forEach(function (f, i) {
          setTimeout(function () { tone(f, 'triangle', 0.35, 0.12); }, i * 150);
        });
        break;
      case 'defeat':
        [330, 294, 247, 196].forEach(function (f, i) {
          setTimeout(function () { tone(f, 'sawtooth', 0.3, 0.07); }, i * 170);
        });
        break;
      default:
        tone(260, 'triangle', 0.07, 0.08);
    }
  }

  function setEnabled(v) {
    settings.enabled = !!v;
    persist();
    if (settings.enabled) {
      if (!makeCtx()) return;
      master.gain.linearRampToValueAtTime(settings.volume, ctx.currentTime + 0.2);
      startAmbient();
    } else if (ctx) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      stopAmbient();
    }
    document.dispatchEvent(new CustomEvent('fo:audio', { detail: getSettings() }));
  }

  function setVolume(v) {
    settings.volume = Math.max(0, Math.min(1, v));
    persist();
    if (ctx && settings.enabled) master.gain.linearRampToValueAtTime(settings.volume, ctx.currentTime + 0.1);
    document.dispatchEvent(new CustomEvent('fo:audio', { detail: getSettings() }));
  }

  function setMusic(v) {
    settings.music = !!v;
    persist();
    if (settings.music) startAmbient();
    else stopAmbient();
  }

  function setSfx(v) {
    settings.sfx = !!v;
    persist();
  }

  function getSettings() {
    return { enabled: settings.enabled, volume: settings.volume, music: settings.music, sfx: settings.sfx };
  }

  function unlock() {
    if (!makeCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (settings.enabled && settings.music) startAmbient();
  }

  window.FO = window.FO || {};
  FO.audio = {
    init: unlock,
    play: play,
    setEnabled: setEnabled,
    setVolume: setVolume,
    setMusic: setMusic,
    setSfx: setSfx,
    getSettings: getSettings,
    startAmbient: startAmbient,
    stopAmbient: stopAmbient
  };
})();
