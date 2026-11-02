/* ============================================================
   ui.js — map, panels, modals, flow
   ============================================================ */
(function () {
  const CFG = FO.CONFIG;
  const S = FO.state;

  const UI = {
    state: null,
    selectedTile: null,
    selectedCrewId: null,
    tab: 'crews',
    showAllActions: false,
    workshopFocus: 'build',
    foundingTile: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    drag: null,
    lastReport: null,
    busy: false,
    modalOpen: false
  };

  /* ---------------- tiny helpers ---------------- */
  function t(key, vars) { return FO.i18n.t(key, vars); }
  function L(obj) { return FO.i18n.L(obj); }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function svgIcon(name, cls) { return FO.art.icon(name, cls); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function round(n) { return Math.round(n); }
  function pct(v) { return Math.round(v); }
  function crewName(c) { return L(c.name); }
  function terrainName(terrain) { return t('terrain.' + terrain); }
  function byId(id) { return document.getElementById(id); }

  function logoMarkup(key, cls) {
    return FO.art.logo(key || 'fist', cls || '');
  }

  function nameListRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* ---------------- toast ---------------- */
  function toast(text, tone) {
    const root = byId('toast-root');
    if (!root || !text) return;
    const el = document.createElement('div');
    el.className = 'toast' + (tone ? ' ' + tone : '');
    el.textContent = text;
    root.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }, 3200);
  }

  /* ---------------- modal ---------------- */
  function closeModal() {
    const root = byId('modal-root');
    if (root) root.innerHTML = '';
    UI.modalOpen = false;
  }

  function openModal(opts) {
    const root = byId('modal-root');
    if (!root) return null;
    const cardClass = 'modal-card' + (opts.wide ? ' wide' : '') + (opts.narrow ? ' narrow' : '') +
      (opts.cls ? ' ' + opts.cls : '');
    const closeHtml = opts.closable === false ? '' :
      '<button class="modal-close" aria-label="' + esc(t('ui.close')) + '">×</button>';
    const actions = opts.actions || [];
    const actionsHtml = actions.length ? '<footer class="modal-actions' +
      (opts.actionsSplit ? ' split' : '') + '">' + actions.map(function (a, i) {
        return '<button class="btn ' + (a.cls || 'btn-paper') + '" data-modal-act="' + i + '">' +
          esc(a.label) + '</button>';
      }).join('') + '</footer>' : '';

    root.innerHTML = '<div class="modal-backdrop"><div class="' + cardClass + '">' +
      '<header class="modal-head"><div><div class="modal-kicker">' + esc(opts.kicker || '') +
      '</div><h2 class="modal-title">' + esc(opts.title || '') + '</h2>' +
      (opts.sub ? '<div class="modal-sub">' + esc(opts.sub) + '</div>' : '') +
      '</div>' + closeHtml + '</header>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' + actionsHtml + '</div></div>';

    UI.modalOpen = true;
    const back = root.querySelector('.modal-backdrop');
    const closeBtn = root.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        FO.audio.play('click');
        if (opts.onClose) opts.onClose();
        closeModal();
      });
    }
    if (opts.closable !== false && !opts.noBackdropClose) {
      back.addEventListener('click', function (e) {
        if (e.target !== back) return;
        FO.audio.play('click');
        if (opts.onClose) opts.onClose();
        closeModal();
      });
    }
    actions.forEach(function (a, i) {
      const btn = root.querySelector('[data-modal-act="' + i + '"]');
      if (!btn) return;
      btn.addEventListener('click', function () {
        FO.audio.play('click');
        if (a.onClick) a.onClick();
      });
    });
    if (opts.onMount) opts.onMount(root);
    return root;
  }

  function confirmBox(opts) {
    openModal({
      kicker: opts.kicker || t('ui.confirm'),
      title: opts.title,
      sub: opts.sub || '',
      narrow: true,
      body: '<p>' + esc(opts.text) + '</p>',
      actions: [
        { label: t('ui.cancel'), cls: 'btn-paper', onClick: closeModal },
        { label: opts.okLabel || t('ui.confirm'), cls: opts.danger ? 'btn-primary' : 'btn-primary', onClick: function () {
          closeModal();
          if (opts.onOk) opts.onOk();
        } }
      ]
    });
  }

  /* ---------------- stats / topbar ---------------- */
  function statBlock(key, iconName, label, value, barValue, options) {
    const o = options || {};
    let cls = 'stat stat-' + key;
    if (o.critical) cls += ' is-critical';
    if (o.good) cls += ' is-good';
    if (o.bad) cls += ' is-bad';
    return '<div class="' + cls + '" title="' + esc(o.tip || '') + '">' +
      '<div class="stat-ico">' + svgIcon(iconName) + '</div>' +
      '<div class="stat-body"><div class="stat-label">' + esc(label) + '</div>' +
      '<div class="stat-val">' + value + (o.suffix || '') + '</div>' +
      '<div class="stat-bar"><span style="width:' + clamp(barValue, 0, 100) + '%"></span></div></div></div>';
  }

  function renderTopbar() {
    const st = UI.state;
    if (!st) return;
    byId('player-forest').textContent = st.player.forest;
    byId('player-group').textContent = st.player.group;
    byId('player-logo').innerHTML = logoMarkup(st.player.logo);
    byId('day-num').textContent = Math.min(st.day, CFG.maxDays);
    document.querySelector('.day-max').textContent = '/' + CFG.maxDays;
    const phaseKey = st.stage === 'founding' ? 'phase.founding' :
      (st.phase === 'event' ? 'phase.event' : (st.phase === 'over' ? 'phase.over' : 'phase.plan'));
    byId('phase-label').textContent = t(phaseKey);

    const forest = S.forestPct(st);
    byId('stats-top').innerHTML = [
      statBlock('energy', 'energy', t('stat.energy'), round(st.stats.energy),
        st.stats.energy, { critical: st.stats.energy < 20, tip: t('stat.energy.tip') }),
      statBlock('acceptance', 'acceptance', t('stat.acceptance'), round(st.stats.acceptance),
        st.stats.acceptance, { critical: st.stats.acceptance < 20, bad: st.stats.acceptance < 35, tip: t('stat.acceptance.tip') }),
      statBlock('heat', 'heat', t('stat.heat'), round(st.stats.heat), st.stats.heat,
        { critical: st.stats.heat > 80, bad: st.stats.heat > 65, tip: t('stat.heat.tip') }),
      statBlock('forest', 'forest', t('stat.forest'), forest, forest,
        { suffix: '%', critical: forest < 30, bad: forest < CFG.forestGoal, tip: t('stat.forest.tip') }),
      statBlock('company', 'company', t('stat.company'), round(st.stats.funds),
        clamp(100 - st.stats.funds / 2, 0, 100),
        { good: st.stats.funds < 55, tip: t('stat.company.tip') }),
      statBlock('supporters', 'supporters', t('stat.supporters'), round(st.stats.size),
        clamp(st.stats.size, 0, 100), { tip: t('stat.supporters.tip') })
    ].join('');

    const sound = FO.audio.getSettings();
    const snd = byId('btn-sound');
    snd.textContent = sound.enabled ? '♪' : '✕';
    snd.title = sound.enabled ? t('settings.soundOn') : t('settings.soundOff');
  }

  function renderResources() {
    const st = UI.state;
    if (!st) return;
    const defs = [
      { key: 'wood', icon: 'wood', low: 2 },
      { key: 'food', icon: 'food', low: 3 },
      { key: 'gear', icon: 'gear', low: 2 },
      { key: 'money', icon: 'money', low: 6 }
    ];
    byId('resources').innerHTML = defs.map(function (d) {
      const val = Math.floor(st.resources[d.key] || 0);
      return '<span class="res-chip' + (val <= d.low ? ' low' : '') + '" title="' + esc(t('res.' + d.key)) + '">' +
        svgIcon(d.icon) + '<span class="res-val">' + val + '</span>' +
        '<span class="res-label">' + esc(t('res.' + d.key)) + '</span></span>';
    }).join('');

    const summary = FO.game.planSummary(st);
    const next = CFG.recruitAt[(st.recruitIndex || 0)];
    let text = '<b>' + summary.assigned + '/' + summary.total + '</b> ' + esc(t('ui.plan'));
    if (next && st.stats.size < next) {
      text += ' · ' + esc(t('crew.nextJoin', { n: next }));
    }
    byId('plan-summary').innerHTML = text;
    const endBtn = byId('btn-end-day');
    const ready = FO.game.canEndDay(st);
    endBtn.disabled = !ready;
    endBtn.classList.toggle('is-ready', ready && summary.assigned >= summary.total);
  }

  /* ---------------- ticker / hint ---------------- */
  function renderTicker() {
    const st = UI.state;
    const ticker = byId('ticker');
    if (!st || !ticker) return;
    const items = st.headlines.slice(0, 7).map(function (h) {
      return '<span class="tk"><b>' + esc(t('ui.day')) + ' ' + h.day + '</b> ' + esc(L(h)) + '</span>';
    });
    ticker.innerHTML = items.join('') || '<span class="tk">' + esc(t('journal.empty')) + '</span>';
  }

  function renderHint() {
    const st = UI.state;
    const hint = byId('map-hint');
    if (!st || !hint) return;
    // the tutorial banner only lives through the first day
    if (st.stage !== 'founding' && st.day > 1) {
      hint.classList.add('hidden');
      hint.innerHTML = '';
      return;
    }
    hint.classList.remove('hidden');
    let kicker = '';
    let text = '';
    if (st.stage === 'founding') {
      kicker = t('map.hintFounding');
      text = t('map.hintFoundingSub');
    } else if (st.phase === 'event') {
      kicker = t('map.hintEvent');
      text = t('map.hintEventSub');
    } else if (UI.selectedTile) {
      const tile = S.tileById(st, UI.selectedTile);
      if (tile) {
        kicker = terrainName(tile.terrain) + ' · ' + tile.id;
        text = t('map.hintPlaySub');
      }
    } else {
      kicker = t('map.hintPlay');
      text = t('map.hintPlaySub');
    }
    hint.innerHTML = '<span class="hint-kicker">' + esc(kicker) + '</span><strong>' +
      esc(text) + '</strong>';
  }

  /* ---------------- map ---------------- */
  const TERRAIN_FILL = {
    forest: '#8fbf77', ancient: '#4f8a60', clearcut: '#c9ab7c', mine: '#6d4b3a',
    plant: '#62676b', company: '#b7543f', village: '#e3bf76', ghost: '#b6ac97',
    field: '#d8d179', water: '#63b4c9', young: '#a9d18e'
  };

  function mapBox() {
    const m = CFG.map;
    const r = m.radius;
    return {
      w: m.margin * 2 + Math.sqrt(3) * r * (m.cols + 0.5),
      h: m.margin * 2 + 1.5 * r * (m.rows - 1) + r * 2
    };
  }

  function mapLinks(state) {
    const tiles = state.tiles;
    const out = [];
    function pair(list, cls, width) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (S.hexDistance(list[i], list[j]) !== 1) continue;
          out.push('<line class="conn-line ' + cls + '" x1="' + list[i].x.toFixed(1) + '" y1="' +
            (list[i].y + 12).toFixed(1) + '" x2="' + list[j].x.toFixed(1) + '" y2="' +
            (list[j].y + 12).toFixed(1) + '"/>');
        }
      }
    }
    pair(tiles.filter(function (t) { return t.rail; }), 'rail-line', 3);
    pair(tiles.filter(function (t) { return t.road; }), 'road-line', 6);
    const poles = tiles.filter(function (t) { return t.pole; });
    for (let i = 0; i < poles.length; i++) {
      for (let j = i + 1; j < poles.length; j++) {
        if (S.hexDistance(poles[i], poles[j]) > 2) continue;
        if (i > 0 && j % 2 === 0) continue;
        out.push('<line class="conn-line power-cable' +
          (poles[i].poleDown || poles[j].poleDown ? '' : ' live') + '" x1="' +
          poles[i].x.toFixed(1) + '" y1="' + (poles[i].y - 14).toFixed(1) + '" x2="' +
          poles[j].x.toFixed(1) + '" y2="' + (poles[j].y - 14).toFixed(1) + '"/>');
      }
    }
    return '<g class="map-links" opacity="0.55">' + out.join('') + '</g>';
  }

  function terrainArt(tile) {
    const rng = FO.art.rng(FO.art.hash(tile.id));
    let out = '';
    if (tile.terrain === 'forest') {
      out += FO.art.conifer(-15 + rng() * 5, 12, 0.55 + rng() * 0.1);
      out += FO.art.broadleaf(10 + rng() * 5, 12, 0.5 + rng() * 0.1);
      out += FO.art.conifer(0, 17, 0.38, '#4f9a5a');
      out += '<g class="tile-detail">' + FO.art.conifer(20, 16, 0.35, '#6aa86a') + '</g>';
    } else if (tile.terrain === 'ancient') {
      out += FO.art.ancientTree(-8, 15, 0.85);
      out += FO.art.conifer(15, 16, 0.55, '#2f6b45');
      out += '<g class="tile-detail">' + FO.art.broadleaf(-20, 18, 0.35, '#3f7a4e') + '</g>';
    } else if (tile.terrain === 'clearcut') {
      out += FO.art.stump(-14, 12, 0.9);
      out += FO.art.stump(9, 7, 0.7);
      out += FO.art.logPile(2, 17, 0.75);
      out += '<g class="tile-detail">' + FO.art.stump(18, 17, 0.55) + '</g>';
    } else if (tile.terrain === 'mine') {
      out += '<path d="M-29 13 Q-14 2 0 10 Q15 18 29 9 L31 21 L-31 21 Z" fill="#4e3529" stroke="' + FO.art.INK + '" stroke-width="1"/>';
      out += '<path d="M-24 16 Q-8 8 6 14 Q18 18 26 13" stroke="#2c1c15" stroke-width="1.4" fill="none" opacity="0.7"/>';
      if (tile.machineDown > 0) {
        out += '<g transform="translate(0 4)"><path class="x-mark" d="M-10 -10 L10 4 M10 -10 L-10 4"/></g>';
      } else {
        out += FO.art.excavator(0, 6, 0.5);
      }
    } else if (tile.terrain === 'plant') {
      out += FO.art.powerPlant(0, 8, 0.62);
    } else if (tile.terrain === 'company') {
      out += FO.art.companyHQ(0, 8, 0.6);
    } else if (tile.terrain === 'village') {
      if (tile.church) {
        out += FO.art.church(0, 8, 0.55);
        out += '<g class="tile-detail">' + FO.art.house(19, 16, 0.45) + '</g>';
      } else {
        out += FO.art.house(-9, 10, 0.6);
        out += FO.art.house(10, 15, 0.5);
      }
      out += '<g class="tile-detail">' + FO.art.flag(-21, 6, 0.6, '#ff3d7f') + '</g>';
    } else if (tile.terrain === 'ghost') {
      out += FO.art.house(-9, 10, 0.55, '#c9bfa9', '#8b7b6b');
      out += '<g class="tile-detail">' + FO.art.house(10, 15, 0.45, '#c9bfa9', '#8b7b6b') +
        FO.art.stump(-20, 15, 0.6) + '</g>';
    } else if (tile.terrain === 'field') {
      out += '<g stroke="#8f8d4a" stroke-width="1.2" opacity="0.75">';
      for (let i = -18; i <= 18; i += 7) out += '<line x1="' + i + '" y1="2" x2="' + (i + 4) + '" y2="20"/>';
      out += '</g>';
      out += '<g class="tile-detail">' + FO.art.stump(16, 18, 0.4) + '</g>';
    } else if (tile.terrain === 'water') {
      out += '<g stroke="#2c7f96" stroke-width="1.4" fill="none" opacity="0.7">' +
        '<path d="M-22 8 q7 -5 14 0 q7 5 14 0"/><path d="M-22 15 q7 -5 14 0 q7 5 14 0"/>' +
        '<path d="M-16 3 q6 -4 12 0"/></g>';
      out += '<g class="tile-detail">' + FO.art.flag(18, 2, 0.5, '#45c7e8') + '</g>';
    } else if (tile.terrain === 'young') {
      out += FO.art.conifer(-12, 14, 0.35, '#7dbb6a');
      out += FO.art.conifer(2, 17, 0.3, '#7dbb6a');
      out += FO.art.broadleaf(15, 15, 0.28, '#8fc47a');
      out += '<g class="tile-detail">' + FO.art.stump(-20, 18, 0.4) + '</g>';
    }
    return out;
  }

  function badge(x, y, text, fill, extraCls) {
    return '<g class="tile-detail' + (extraCls ? ' ' + extraCls : '') + '"><circle class="badge-circle" cx="' + x + '" cy="' + y +
      '" r="8" fill="' + (fill || '#ff3d7f') + '"/><text class="badge-text" x="' + x +
      '" y="' + (y + 2.4) + '" text-anchor="middle">' + esc(text) + '</text></g>';
  }

  function tileMarkup(state, tile) {
    const r = CFG.map.radius - 2.5;
    const isCand = state.stage === 'founding' && state.startCandidates.indexOf(tile.id) !== -1;
    let targetable = false;
    if (state.stage === 'play' && UI.selectedCrewId) {
      targetable = FO.game.validActionsForTile(state, tile.id, UI.selectedCrewId).some(function (a) { return a.ok; });
    }
    const cls = ['tile', 'terrain-' + tile.terrain];
    if (isCand) cls.push('founding-candidate');
    if (targetable) cls.push('targetable');
    if (UI.selectedTile === tile.id || UI.foundingTile === tile.id) cls.push('selected');
    const jailStation = !state.policeCampId
      ? state.tiles.filter(function (x) { return x.terrain === 'company'; })[0]
      : null;
    const jailedHere = (tile.policeCamp || state.policeCampId === tile.id ||
      (jailStation && jailStation.id === tile.id))
      ? FO.game.jailedCrews(state).length : 0;
    if (jailedHere) cls.push('has-jail');

    let out = '<g class="' + cls.join(' ') + '" data-tile="' + tile.id + '" transform="translate(' +
      tile.x.toFixed(1) + ' ' + tile.y.toFixed(1) + ')">';
    out += '<polygon class="hex-base" points="' + FO.art.hexPoints(0, 0, r) + '" fill="' +
      (TERRAIN_FILL[tile.terrain] || '#8fbf77') + '" stroke="' + FO.art.INK + '" stroke-width="2"/>';
    out += terrainArt(tile);

    if (tile.court > 0) out += badge(-21, -17, '⚖', '#45c7e8');
    if (tile.logging > 0) {
      out += '<g class="tile-detail"><text class="tile-sublabel" x="0" y="-27" text-anchor="middle" fill="#a01c0a">LOG</text></g>';
    }
    if (tile.roadProject) {
      out += '<path d="M-24 6 Q0 16 24 6" stroke="#ff7a1a" stroke-width="3" stroke-dasharray="5 4" fill="none" class="tile-detail"/>';
    }
    if (tile.reforestIn > 0) {
      out += '<g class="tile-detail"><text class="tile-sublabel" x="0" y="-27" text-anchor="middle">' +
        esc(t('tile.reforest', { n: tile.reforestIn })) + '</text></g>';
    }

    if (tile.occupied > 0) {
      if (tile.barrio && tile.barrio.type === 'house') {
        out += '<g transform="translate(0 4)">' + FO.art.house(0, 0, 0.78, '#e7c98c', '#ff3d7f') + '</g>';
      } else {
        out += '<g transform="translate(0 4)">' +
          FO.art.treehouse(0, 0, 0.58, tile.occupied, '#ff3d7f') + '</g>';
      }
      out += badge(-20, -12, String(tile.occupied), '#c9f24b');
      if (tile.police > 0) out += '<g class="tile-detail">' + FO.art.policeFig(20, 22, 0.7) + '</g>';
    } else if (tile.police > 0) {
      out += FO.art.policeFig(18, 14, 0.7);
      out += badge(-20, -12, String(tile.police), '#45c7e8');
    }

    if (tile.policeCamp) {
      const down = !!UI.state.policeCampDown;
      out += '<g class="tile-detail police-camp always' + (down ? ' camp-down' : '') + '">' +
        '<path d="M-16 16 L-6 -4 L4 16 Z" fill="#45c7e8" stroke="' + FO.art.INK + '" stroke-width="1.6"/>' +
        '<path d="M6 16 L16 -2 L26 16 Z" fill="#3aa8cc" stroke="' + FO.art.INK + '" stroke-width="1.6"/>' +
        '<line x1="16" y1="-2" x2="16" y2="-16" stroke="' + FO.art.INK + '" stroke-width="1.4"/>' +
        '<circle cx="16" cy="-18" r="3" fill="#eaf6ff" stroke="' + FO.art.INK + '" stroke-width="1"/>' +
        '</g>';
      out += '<g class="tile-detail"><text class="tile-sublabel" x="-4" y="-33" text-anchor="middle" fill="#1e7a96">' +
        esc(down ? t('tile.campDown') : t('tile.policeCamp')) + '</text></g>';
    }

    if (tile.pole) {
      out += '<g class="tile-detail">' + FO.art.pylon(23, 2, 0.55, tile.poleDown > 0 ? 1 : 0) + '</g>';
      if (tile.poleDown > 0) {
        out += '<g class="tile-detail"><path class="x-mark" d="M17 -19 L29 -7 M29 -19 L17 -7"/></g>';
      }
    }
    if (tile.rail) {
      out += '<g class="tile-detail"><path class="rail-line" d="M-24 20 H24 M-24 25 H24"/>' +
        '<path class="rail-tie" d="M-18 18 v9 M-8 18 v9 M2 18 v9 M12 18 v9 M22 18 v9"/></g>';
    } else if (tile.road) {
      out += '<g class="tile-detail"><path class="road-line" d="M-24 23 H24"/>' +
        '<path class="road-inner" d="M-24 23 H24"/></g>';
    }
    if (tile.blockade > 0) {
      out += FO.art.barricade(0, 23, 0.85);
      out += '<g class="tile-detail"><text class="tile-sublabel" x="0" y="-28" text-anchor="middle" fill="#a01c0a">' +
        tile.blockade + '</text></g>';
    }
    if (tile.machineDown > 0 && !tile.pole) out += '<g class="tile-detail"><path class="x-mark" d="M-16 -14 L16 10 M16 -14 L-16 10"/></g>';

    if (tile.police > 0) {
      out += '<circle class="police-light" cx="-26" cy="-24" r="3.4" stroke="' + FO.art.INK + '" stroke-width="1"/>';
    }
    if (jailedHere) {
      out += badge(-23, -13, String(jailedHere), '#ff3d7f', 'always');
    }
    out += '</g>';
    return out;
  }

  function tileLabel(state, tile) {
    let label = '';
    if (tile.terrain === 'village' || tile.terrain === 'ghost') {
      const v = S.villageOfTile(state, tile);
      // draw the village name once, anchored to the church (or first tile)
      if (v && (v.church || v.tiles[0]) === tile.id) label = v.name;
    }
    if (tile.occupied > 0 && tile.barrio) label = tile.barrio.name;
    if (!label) return '';
    return '<g transform="translate(' + tile.x.toFixed(1) + ' ' + tile.y.toFixed(1) + ')">' +
      '<text class="tile-label" x="0" y="' + (tile.rail || tile.road ? 36 : 33) +
      '" text-anchor="middle">' + esc(label) + '</text></g>';
  }

  function applyMapTransform() {
    const world = byId('map-world');
    const map = byId('map');
    const box = mapBox();
    // keep the map from being dragged out of view
    const slack = 30;
    const mx = Math.max(0, (UI.zoom - 1) / 2 * box.w + slack);
    const my = Math.max(0, (UI.zoom - 1) / 2 * box.h + slack);
    UI.pan.x = clamp(UI.pan.x, -mx, mx);
    UI.pan.y = clamp(UI.pan.y, -my, my);
    if (world) {
      world.setAttribute('transform',
        'translate(' + (box.w / 2 + UI.pan.x) + ' ' + (box.h / 2 + UI.pan.y) + ') ' +
        'scale(' + UI.zoom + ') translate(' + (-box.w / 2) + ' ' + (-box.h / 2) + ')');
    }
    if (map) {
      map.classList.toggle('zoom-far', UI.zoom <= 1.01);
      map.classList.toggle('zoom-mid', UI.zoom > 1.01 && UI.zoom < 1.7);
      map.classList.toggle('zoom-near', UI.zoom >= 2.05);
    }
  }

  function renderMap() {
    const state = UI.state;
    const map = byId('map');
    if (!state || !map) return;
    const box = mapBox();
    map.setAttribute('viewBox', '0 0 ' + box.w.toFixed(0) + ' ' + box.h.toFixed(0));
    map.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const tiles = state.tiles.map(function (tile) { return tileMarkup(state, tile); }).join('');
    const labels = state.tiles.map(function (tile) { return tileLabel(state, tile); }).join('');
    map.innerHTML = '<g id="map-world">' + mapLinks(state) + '<g class="tiles">' + tiles + '</g>' +
      '<g class="tile-labels">' + labels + '</g></g>';
    applyMapTransform();
  }

  function selectTile(tileId) {
    const state = UI.state;
    if (!state) return;
    const tile = S.tileById(state, tileId);
    if (!tile) return;
    if (state.stage === 'founding') {
      if (state.startCandidates.indexOf(tileId) === -1) {
        toast(t('founding.hint'));
        return;
      }
      UI.foundingTile = tileId;
    }
    UI.selectedTile = tileId;
    if (!UI.selectedCrewId || state.stage !== 'founding') {
      const avail = FO.game.availableCrews(state).filter(function (c) { return !c.assigned; });
      if (!UI.selectedCrewId || !FO.game.crewById(state, UI.selectedCrewId)) {
        UI.selectedCrewId = avail.length ? avail[0].id : (FO.game.activeCrews(state)[0] || {}).id;
      }
    }
    setTab('area');
    FO.audio.play('select');
    refresh();
  }

  function zoomMap(delta) {
    const step = 0.6;
    UI.zoom = clamp(UI.zoom + (delta > 0 ? step : -step), 1, 3.4);
    if (UI.zoom <= 1.01) UI.pan = { x: 0, y: 0 };
    applyMapTransform();
    FO.audio.play('click');
  }

  /* ---------------- sidebar: crews ---------------- */
  function crewCard(crew) {
    const state = UI.state;
    const assigned = state.assignments[crew.id];
    const selected = UI.selectedCrewId === crew.id;
    const energyPct = clamp(crew.energy, 0, 100);
    const energyCls = energyPct < 30 ? 'low' : (energyPct > 80 ? 'high' : '');
    let status = t('crew.statusReady');
    if (crew.arrested) status = t('crew.statusHeld', { day: crew.returnDay || 0 });
    else if (assigned) status = t('crew.statusAssigned', { action: t('action.' + assigned.actionId + '.name') });
    else if (crew.energy < 15) status = t('crew.statusExhausted');
    const canAct = !crew.arrested && !assigned;
    const canTrust = canAct && crew.energy >= 8;
    const canRest = !crew.arrested && crew.energy < 100;
    const canSupply = canAct && crew.energy >= 10 && state.resources.money >= 12;
    const canBulk = canAct && crew.energy >= 14 && state.resources.money >= 30;
    const heldCamp = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
    const heldPlace = heldCamp && heldCamp.policeCamp ? t('tile.policeCamp') : t('crew.station');

    const skills = ['build', 'climb', 'organize', 'media', 'sabotage'].map(function (sk) {
      const v = crew.skills[sk] || 0;
      if (!v) return '';
      return '<span class="skill-pip" title="' + esc(t('skill.' + sk)) + '">' +
        svgIcon(sk === 'build' ? 'build' : sk === 'climb' ? 'scout' : sk === 'organize' ? 'network' :
          sk === 'media' ? 'media' : 'sabotage') + ' ' + esc(t('skill.' + sk)) + ' <b>' + v + '</b></span>';
    }).join('');

    let planHtml = '';
    if (crew.arrested) {
      planHtml = '<div class="crew-plan crew-jail"><div class="crew-plan-text"><b>' +
        esc(t('crew.heldAt', { place: heldPlace })) + '</b><span>' +
        esc(t('crew.heldHint')) + '</span></div><div class="crew-actions">' +
        (heldCamp && heldCamp.policeCamp
          ? '<button class="btn btn-xs btn-paper" data-jail-tile="' + heldCamp.id + '">' +
            esc(t('crew.gotoCamp')) + '</button>' : '') +
        '</div></div>';
    } else if (assigned) {
      const tile = assigned.tileId ? S.tileById(state, assigned.tileId) : null;
      planHtml = '<div class="crew-plan"><div class="crew-plan-text"><b>' +
        esc(t('action.' + assigned.actionId + '.name')) +
        (assigned.focus ? ' · ' + esc(t('skill.' + assigned.focus)) : '') + '</b><span>' +
        (tile ? esc(terrainName(tile.terrain) + ' · ' + tile.id) : esc(t('actions.instant'))) +
        '</span></div><div class="crew-actions"><button class="btn btn-xs btn-paper" data-cancel="' +
        crew.id + '">' + esc(t('actions.cancel')) + '</button></div></div>';
    } else {
      planHtml = '<div class="crew-plan"><div class="crew-plan-text"><span>' +
        esc(t('crew.select')) + '</span></div><div class="crew-actions">' +
        (canTrust ? '<button class="btn btn-xs btn-paper" data-instant="trust" data-crew="' + crew.id + '">' +
          esc(t('crew.trustBtn')) + '</button>' : '') +
        (canSupply ? '<button class="btn btn-xs btn-paper" data-instant="supply" data-crew="' + crew.id + '">' +
          esc(t('crew.supplyBtn')) + '</button>' : '') +
        (canBulk ? '<button class="btn btn-xs btn-paper" data-instant="bulk" data-crew="' + crew.id + '">' +
          esc(t('crew.bulkBtn')) + '</button>' : '') +
        (canRest ? '<button class="btn btn-xs btn-paper" data-instant="rest" data-crew="' + crew.id + '">' +
          esc(t('crew.restBtn')) + '</button>' : '') +
        '</div></div>';
    }

    return '<article class="crew-card' + (selected ? ' selected' : '') +
      (assigned ? ' assigned' : '') + (crew.arrested ? ' jailed' : '') +
      (energyPct < 15 ? ' exhausted' : '') +
      (crew.suspicion >= 2 ? ' inf-suspect' : '') + '" data-crew-card="' + crew.id + '">' +
      '<div class="crew-top"><div class="crew-avatar">' +
      FO.art.activistFig(0, 0, 1, crew.inf && crew.suspicion >= 3 ? 'reader' : 'masked') +
      '</div><div class="crew-id"><div class="crew-name">' + esc(crewName(crew)) +
      ' <span class="crew-num">#' + crew.id.replace('crew', '') + '</span></div>' +
      '<div class="crew-sub"><span class="crew-size">' + svgIcon('supporters') + ' ' +
      esc(t('crew.members', { n: crew.size })) + '</span><span class="crew-status' +
      (assigned ? ' assigned' : '') + (crew.arrested ? ' jailed' : '') + '">' + esc(status) + '</span></div>' +
      '<div class="crew-energy"><div class="energy-track ' + energyCls + '"><span style="width:' +
      energyPct + '%"></span></div><span class="en-val">' + Math.round(crew.energy) + '</span></div>' +
      '</div></div>' +
      (skills ? '<div class="skills">' + skills + '</div>' : '') +
      (crew.suspicion >= 2 ? '<div class="crew-inf-note">' + esc(t('crew.infSuspicion')) + '</div>' : '') +
      planHtml + '</article>';
  }

  function renderCrewsPanel() {
    const state = UI.state;
    const panel = byId('tab-crews');
    const crews = state.crews.filter(function (c) { return !c.removed; })
      .sort(function (a, b) { return (a.arrested ? 1 : 0) - (b.arrested ? 1 : 0); });
    const jailed = crews.filter(function (c) { return c.arrested; });
    const next = CFG.recruitAt[(state.recruitIndex || 0)];
    let html = '<div class="panel-section"><div class="panel-title">' + esc(t('crew.title')) +
      '<span class="pt-note">' + esc(t('crew.subtitle')) + '</span></div>';
    if (!crews.length) {
      html += '<div class="empty-note">' + esc(t('crew.noCrews')) + '</div>';
    } else {
      html += '<div class="crew-list">' + crews.map(crewCard).join('') + '</div>';
      if (jailed.length) {
        html += '<div class="jail-note">' + esc(t('crew.jailNote', { n: jailed.length })) + '</div>';
      }
      if (next && state.stats.size < next) {
        html += '<div class="field-help" style="margin-top:10px">' +
          esc(t('crew.nextJoin', { n: next })) + '</div>';
      }
    }
    html += '</div>';
    panel.innerHTML = html;

    panel.querySelectorAll('[data-crew-card]').forEach(function (el) {
      el.addEventListener('click', function () {
        UI.selectedCrewId = el.getAttribute('data-crew-card');
        FO.audio.play('select');
        refresh();
      });
    });
    panel.querySelectorAll('[data-jail-tile]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        UI.selectedTile = el.getAttribute('data-jail-tile');
        FO.audio.play('select');
        setTab('area');
        refresh();
      });
    });
    panel.querySelectorAll('[data-cancel]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        FO.game.cancelAssign(state, el.getAttribute('data-cancel'));
        FO.audio.play('cancel');
        toast(t('toast.cancelled'));
        refresh();
      });
    });
    panel.querySelectorAll('[data-instant]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        const crewId = el.getAttribute('data-crew');
        const actionId = el.getAttribute('data-instant');
        UI.selectedCrewId = crewId;
        const res = FO.game.assignInstant(state, crewId, actionId);
        if (!res.ok) {
          toast(t(res.reason));
          FO.audio.play('fail');
          return;
        }
        FO.audio.play('assign');
        const toastKey = actionId === 'rest' ? 'toast.rest' :
          actionId === 'supply' ? 'toast.supply' :
          actionId === 'bulk' ? 'toast.bulk' : 'toast.trust';
        toast(t(toastKey, { crew: crewName(FO.game.crewById(state, crewId)) }));
        selectNextCrew(state, crewId);
        refresh();
      });
    });
  }

  function selectNextCrew(state, afterId) {
    const avail = FO.game.availableCrews(state).filter(function (c) { return !c.assigned; });
    const next = avail[0];
    UI.selectedCrewId = next ? next.id : afterId;
  }

  /* ---------------- sidebar: area ---------------- */
  function money(n) { return Math.round(n * 10) / 10; }

  function signed(n) {
    const v = Math.round(n * 10) / 10;
    return (v > 0 ? '+' : '') + v;
  }

  function costChips(state, action, crewId) {
    if (!action.cost) return '';
    const free = FO.game.freeResources ? FO.game.freeResources(state, crewId) : state.resources;
    return ['wood', 'food', 'gear', 'money'].filter(function (k) {
      return action.cost[k];
    }).map(function (k) {
      const enough = (free[k] || 0) >= action.cost[k];
      return '<span class="cost-chip' + (enough ? '' : ' missing') + '">' +
        svgIcon(k) + ' ' + action.cost[k] + '</span>';
    }).join('');
  }

  function chancePill(chance) {
    const cls = chance >= 70 ? 'good' : (chance >= 45 ? 'mid' : 'bad');
    return '<span class="chance-pill ' + cls + '">' + esc(t('actions.chance')) +
      ' ' + Math.round(chance) + '%</span>';
  }

  function actionRelevant(action, tile, state) {
    const id = action.id;
    const terrain = tile.terrain;
    if (id === 'build') {
      if (tile.occupied > 0) return !tile.barrio || tile.barrio.level < 3;
      return terrain === 'forest' || terrain === 'ancient' || terrain === 'ghost';
    }
    if (id === 'scout') return ['forest', 'ancient', 'clearcut', 'field', 'water', 'mine'].indexOf(terrain) !== -1;
    if (id === 'kitchen' || id === 'workshop' || id === 'media' || id === 'fundraise') return tile.occupied > 0;
    if (id === 'demo') return ['village', 'company', 'plant', 'mine'].indexOf(terrain) !== -1;
    if (id === 'blockade') return !!(tile.rail || tile.road || tile.roadProject ||
      ['mine', 'plant', 'company'].indexOf(terrain) !== -1);
    if (id === 'sabotage') return !!(tile.pole || tile.machineDown > 0 ||
      ['mine', 'plant', 'company'].indexOf(terrain) !== -1 || tile.policeCamp);
    if (id === 'liberate') {
      const camp = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
      if (camp && camp.policeCamp) return tile.id === camp.id;
      const station = state.tiles.filter(function (x) { return x.terrain === 'company'; })[0];
      return !!(station && station.id === tile.id);
    }
    if (id === 'network') return terrain === 'village' && !!S.villageOfTile(state, tile);
    if (id === 'reforest') return terrain === 'clearcut';
    return false;
  }

  function actionRow(entry, tile) {
    const state = UI.state;
    const action = entry.action;
    const crew = UI.selectedCrewId ? FO.game.crewById(state, UI.selectedCrewId) : null;
    const plan = crew ? state.assignments[crew.id] : null;
    const here = !!(plan && plan.tileId === tile.id && plan.actionId === action.id);
    const can = entry.ok && !!crew && !crew.arrested;
    const rows = [];

    let chance = '';
    if (entry.ok && crew) chance = chancePill(entry.chance);
    let reason = '';
    if (!entry.ok && crew) {
      const reasonText = t(entry.reason || 'toast.invalid');
      reason = '<div class="req-note">' + esc(reasonText) + '</div>';
    }

    let side = '';
    if (here) {
      side = '<button class="btn btn-xs btn-paper" data-cancel-here="' + crew.id + '">' +
        esc(t('actions.cancel')) + '</button>';
    } else if (can) {
      const label = plan ? t('actions.reassign') : t('actions.assign');
      side = '<button class="btn btn-xs btn-primary" data-assign="' + action.id + '">' +
        esc(label) + '</button>';
    } else {
      side = '<button class="btn btn-xs btn-paper" disabled>' + esc(t('actions.assign')) + '</button>';
    }

    let focus = '';
    if (action.focus) {
      const chosen = UI.workshopFocus || 'organize';
      const chips = ['build', 'climb', 'organize', 'media', 'sabotage'].map(function (sk) {
        return '<button type="button" class="focus-chip' + (chosen === sk ? ' active' : '') +
          '" data-focus-pick="' + sk + '">' +
          esc(t('actions.focus' + sk.charAt(0).toUpperCase() + sk.slice(1))) + '</button>';
      }).join('');
      focus = '<div class="workshop-focus"><span class="focus-label">' + esc(t('actions.focus')) +
        '</span><div class="focus-chips">' + chips + '</div></div>';
    }

    rows.push('<div class="action-row' + (entry.ok ? '' : ' locked') +
      (here ? ' assigned-here' : '') + '">' +
      '<div class="action-ico">' + svgIcon(action.icon) + '</div>' +
      '<div class="action-body"><div class="action-name">' + esc(t('action.' + action.id + '.name')) +
      '</div><div class="action-desc">' + esc(t(action.desc)) + '</div>' +
      '<div class="action-meta">' + costChips(state, action, crew ? crew.id : null) + chance + '</div>' +
      reason + '</div><div class="action-side">' + side + '</div>' + focus + '</div>');
    return rows.join('');
  }

  function crewPicker() {
    const state = UI.state;
    const crews = FO.game.activeCrews(state);
    if (!crews.length) return '<div class="empty-note">' + esc(t('crew.noCrews')) + '</div>';
    return '<div class="crew-picker">' + crews.map(function (c) {
      const assigned = state.assignments[c.id];
      let cls = 'picker-chip';
      if (UI.selectedCrewId === c.id) cls += ' active';
      if (assigned) cls += ' busy';
      if (c.energy < 15) cls += ' exhausted';
      return '<button class="' + cls + '" data-pick-crew="' + c.id + '" title="' +
        esc(crewName(c)) + '">' + '<span class="dot"></span>' + esc(crewName(c)) +
        ' <b>' + Math.round(c.energy) + '</b></button>';
    }).join('') + '</div>';
  }

  function tileTags(tile) {
    const state = UI.state;
    const tags = [];
    if (tile.terrain === 'village' || tile.terrain === 'ghost') {
      const v = S.villageOfTile(state, tile);
      if (v) {
        const label = v.status === 'ally' ? t('tile.villageAlly') :
          (v.status === 'expropriated' ? t('tile.villageExpropriated') : t('tile.villageNeutral'));
        const cls = v.status === 'ally' ? 'good' : (v.status === 'expropriated' ? 'hot' : '');
        tags.push('<span class="tag ' + cls + '">' + esc(v.name) + ' · ' + esc(label) + '</span>');
      }
    }
    if (tile.occupied > 0) {
      tags.push('<span class="tag good">' + esc(t('tile.occupiedByUs')) + ' ' + tile.occupied + '</span>');
      if (tile.barrio) tags.push('<span class="tag">' + esc(tile.barrio.name) + ' · ' +
        esc(t('tile.level', { n: tile.barrio.level })) + '</span>');
    }
    if (tile.police > 0) tags.push('<span class="tag hot">' + esc(t('tile.police')) + ' ' + tile.police + '</span>');
    if (tile.policeCamp) tags.push('<span class="tag hot">' + esc(UI.state.policeCampDown ? t('tile.campDown') : t('tile.policeCamp')) + '</span>');
    if (tile.logging > 0) tags.push('<span class="tag hot">' + esc(t('tile.logging')) + '</span>');
    if (tile.rail) tags.push('<span class="tag cold">' + esc(t('tile.rail')) + '</span>');
    if (tile.road) tags.push('<span class="tag cold">' + esc(t('tile.road')) + '</span>');
    if (tile.roadProject) tags.push('<span class="tag hot">' + esc(t('sit.policy.road')) + '</span>');
    if (tile.pole) tags.push('<span class="tag cold">' + esc(t('tile.power')) +
      (tile.poleDown > 0 ? ' · ' + esc(t('tile.powerDown')) : '') + '</span>');
    if (tile.blockade > 0) tags.push('<span class="tag pink">' + esc(t('tile.blockaded')) + '</span>');
    if (tile.court > 0) tags.push('<span class="tag cold">' + esc(t('tile.court')) + '</span>');
    if (tile.reforestIn > 0) tags.push('<span class="tag good">' + esc(t('tile.reforest', { n: tile.reforestIn })) + '</span>');
    if (tile.young) tags.push('<span class="tag good">' + esc(t('tile.youth')) + '</span>');
    if (tile.terrain === 'mine' || tile.terrain === 'plant' || tile.terrain === 'company') {
      tags.push('<span class="tag hot">' + esc(t('tile.occupiedCompany')) + '</span>');
    }
    if (tile.terrain === 'clearcut') tags.push('<span class="tag hot">' + esc(t('tile.clearedBy')) + '</span>');
    return tags.join('');
  }

  function tileFlavor(tile) {
    const state = UI.state;
    if (tile.terrain === 'village' || tile.terrain === 'ghost') {
      const v = S.villageOfTile(state, tile);
      if (v && v.desc) return L(v.desc);
    }
    const map = {
      forest: 'tile.forestText', ancient: 'tile.ancientText', clearcut: 'tile.clearcutText',
      mine: 'tile.mineText', plant: 'tile.plantText', company: 'tile.companyText',
      village: 'tile.villageText', ghost: 'tile.ghostText', field: 'tile.fieldText',
      water: 'tile.waterText', young: 'tile.youngText'
    };
    return t(map[tile.terrain] || 'tile.nothingHere');
  }

  function tileStatusGrid(tile) {
    const state = UI.state;
    const items = [];
    function item(label, value, danger) {
      items.push('<div class="status-item"><span>' + esc(label) + '</span><b' +
        (danger ? ' class="danger"' : '') + '>' + value + '</b></div>');
    }
    if (tile.terrain === 'village' || tile.terrain === 'ghost') {
      const v = S.villageOfTile(state, tile);
      if (v) {
        const status = v.status === 'ally' ? t('tile.villageAlly') :
          (v.status === 'expropriated' ? t('tile.villageExpropriated') : t('tile.villageNeutral'));
        item(t('tile.support'), v.support + '% · ' + status, v.support < 20);
      }
    }
    if (tile.occupied > 0 && tile.barrio) {
      item(t('tile.barrio'), esc(tile.barrio.name));
      item(t('tile.level', { n: tile.barrio.level }),
        t('tile.founded', { n: tile.barrio.foundedDay }));
    }
    if (tile.police > 0) item(t('tile.police'), String(tile.police), true);
    if (tile.policeCamp) item(t('tile.policeCamp'),
      UI.state.policeCampDown ? t('tile.campDown') : t('tile.campActive'), true);
    if (tile.logging > 0) item(t('tile.logging'), String(tile.logging), true);
    if (tile.blockade > 0) item(t('tile.blockaded'), t('tile.blockadeDays', { n: tile.blockade }));
    if (tile.court > 0) item(t('tile.court'), t('tile.blockadeDays', { n: tile.court }));
    if (tile.reforestIn > 0) item(t('tile.reforest', { n: tile.reforestIn }), '');
    if (!items.length) return '';
    return '<div class="status-grid">' + items.join('') + '</div>';
  }

  function jailListHtml(tile) {
    const state = UI.state;
    const jailed = FO.game.jailedCrews ? FO.game.jailedCrews(state) : [];
    if (!jailed.length) return '';
    const camp = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
    let here = !!tile.policeCamp;
    if (!camp && tile.terrain === 'company') {
      const station = state.tiles.filter(function (x) { return x.terrain === 'company'; })[0];
      here = !!(station && station.id === tile.id);
    }
    if (!here) return '';
    return '<div class="jail-box"><div class="jail-title">' +
      esc(t('tile.jailedTitle', { n: jailed.length })) + '</div>' +
      jailed.map(function (c) {
        return '<div class="jail-row"><b>' + esc(crewName(c)) + '</b><span>' +
          esc(t('crew.statusHeld', { day: c.returnDay || 0 })) + '</span></div>';
      }).join('') +
      '<div class="field-help">' + esc(t('tile.liberateHint')) + '</div></div>';
  }

  function tileCard(tile) {
    const state = UI.state;
    const headCls = 'tile-head terrain-' + tile.terrain;
    let badgeText = terrainName(tile.terrain);
    if (tile.occupied > 0 && tile.barrio) badgeText = tile.barrio.name;
    else if (tile.terrain === 'village') {
      const v = S.villageOfTile(state, tile);
      if (v) badgeText = v.name;
    } else if (tile.police > 0) badgeText = t('tile.police') + ' ' + tile.police;
    if (tile.policeCamp) badgeText = t('tile.policeCamp');

    let actions = '';
    if (state.stage === 'play' && state.phase === 'plan' && !state.ending) {
      const crew = UI.selectedCrewId ? FO.game.crewById(state, UI.selectedCrewId) : null;
      const all = FO.game.validActionsForTile(state, tile.id, UI.selectedCrewId)
        .filter(function (e) { return !e.action.instantCrew; });
      let entries = all.filter(function (e) { return actionRelevant(e.action, tile, state); });
      if (UI.showAllActions) entries = all;
      actions += '<div class="tile-actions-title">' + esc(t('tile.actionsHere')) +
        '<span>' + (crew ? esc(crewName(crew)) : esc(t('tile.selectCrewFirst'))) + '</span></div>';
      if (!crew) {
        actions += '<div class="empty-note">' + esc(t('tile.selectCrewFirst')) + '</div>';
      } else if (!entries.length) {
        actions += '<div class="empty-note">' + esc(t('tile.noValidActions')) + '</div>';
      } else {
        actions += '<div class="tile-actions">' + entries.map(function (e) {
          return actionRow(e, tile);
        }).join('') + '</div>';
      }
      actions += '<div style="margin-top:8px;text-align:right"><button class="btn btn-xs btn-paper" data-toggle-actions>' +
        esc(UI.showAllActions ? t('tile.hideAll') : t('tile.showAll')) + '</button></div>';
    }

    return '<article class="tile-card">' +
      '<div class="' + headCls + '"><div><div class="tile-title">' + esc(terrainName(tile.terrain)) +
      '</div><div class="tile-coord">' + esc(tile.id) + ' · ' +
      esc(t('ui.day')) + ' ' + state.day + '</div></div>' +
      '<div class="tile-badge">' + esc(badgeText) + '</div></div>' +
      '<div class="tile-body"><div class="tile-tags">' + tileTags(tile) + '</div>' +
      tileStatusGrid(tile) + jailListHtml(tile) +
      '<div class="tile-flavor">' + esc(tileFlavor(tile)) + '</div>' +
      actions + '</div></article>';
  }

  function bindAreaPanel(panel) {
    panel.querySelectorAll('[data-pick-crew]').forEach(function (el) {
      el.addEventListener('click', function () {
        UI.selectedCrewId = el.getAttribute('data-pick-crew');
        FO.audio.play('select');
        refresh();
      });
    });
    panel.querySelectorAll('[data-assign]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        const actionId = el.getAttribute('data-assign');
        const state = UI.state;
        const crew = UI.selectedCrewId ? FO.game.crewById(state, UI.selectedCrewId) : null;
        if (!crew) { toast(t('actions.needCrew')); return; }
        const res = FO.game.assign(state, crew.id, actionId, UI.selectedTile, UI.workshopFocus);
        if (!res.ok) {
          FO.audio.play('fail');
          toast(t(res.reason || 'toast.invalid'));
          return;
        }
        FO.audio.play('assign');
        toast(t('toast.assigned', {
          crew: crewName(crew),
          action: t('action.' + actionId + '.name')
        }));
        selectNextCrew(state, crew.id);
        refresh();
      });
    });
    panel.querySelectorAll('[data-cancel-here]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        const crewId = el.getAttribute('data-cancel-here');
        FO.game.cancelAssign(UI.state, crewId);
        UI.selectedCrewId = crewId;
        FO.audio.play('cancel');
        toast(t('toast.cancelled'));
        refresh();
      });
    });
    panel.querySelectorAll('[data-focus-pick]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        UI.workshopFocus = el.getAttribute('data-focus-pick');
        FO.audio.play('select');
        refresh();
      });
    });
    panel.querySelectorAll('[data-toggle-actions]').forEach(function (el) {
      el.addEventListener('click', function () {
        UI.showAllActions = !UI.showAllActions;
        FO.audio.play('click');
        refresh();
      });
    });
    panel.querySelectorAll('[data-found-camp]').forEach(function (el) {
      el.addEventListener('click', function () {
        foundFirstCamp(el.getAttribute('data-found-camp'));
      });
    });
    panel.querySelectorAll('[data-founding-tile]').forEach(function (el) {
      el.addEventListener('click', function () {
        selectTile(el.getAttribute('data-founding-tile'));
      });
    });
  }

  function renderFoundingPanel(panel) {
    const state = UI.state;
    const candidates = state.startCandidates.map(function (id) {
      const tile = S.tileById(state, id);
      return tile ? { tile: tile } : null;
    }).filter(Boolean);

    let html = '<div class="panel-section"><div class="lede"><div class="lede-kicker">' +
      esc(t('founding.kicker')) + '</div><div class="lede-text"><strong>' +
      esc(t('founding.title')) + '</strong><br>' + esc(t('founding.text')) + '</div></div>';

    if (!candidates.length) {
      html += '<div class="empty-note">' + esc(t('founding.hint')) + '</div></div>';
      panel.innerHTML = html;
      return;
    }

    html += '<div class="panel-title">' + esc(t('map.hintFounding')) +
      '<span class="pt-note">' + candidates.length + '</span></div>' +
      '<div class="founding-grid">' + candidates.map(function (c) {
        const sel = UI.foundingTile === c.tile.id;
        return '<button class="founding-option' + (sel ? ' selected' : '') +
          '" data-founding-tile="' + c.tile.id + '"><b>' + esc(terrainName(c.tile.terrain)) +
          '</b><span>' + esc(c.tile.id) + '</span></button>';
      }).join('') + '</div>';

    if (UI.foundingTile) {
      const tile = S.tileById(state, UI.foundingTile);
      if (tile) {
        html += '<div class="tile-card" style="margin-top:12px"><div class="tile-head terrain-' +
          tile.terrain + '"><div><div class="tile-title">' + esc(terrainName(tile.terrain)) +
          '</div><div class="tile-coord">' + esc(tile.id) + '</div></div>' +
          '<div class="tile-badge">' + esc(t('tile.foundBtn')) + '</div></div>' +
          '<div class="tile-body"><div class="tile-flavor">' + esc(t('tile.foundText')) + '</div>' +
          '<button class="btn btn-primary btn-block" data-found-camp="' + tile.id + '">' +
          esc(t('tile.foundBtn')) + '</button></div></div>';
      }
    } else {
      html += '<div class="empty-note" style="margin-top:12px">' + esc(t('founding.hint')) + '</div>';
    }
    html += '</div>';
    panel.innerHTML = html;
    bindAreaPanel(panel);
  }

  function renderAreaPanel() {
    const state = UI.state;
    const panel = byId('tab-area');
    if (!state || !panel) return;
    if (state.stage === 'founding') {
      renderFoundingPanel(panel);
      return;
    }
    let html = '';
    const tile = UI.selectedTile ? S.tileById(state, UI.selectedTile) : null;
    if (!tile) {
      html += '<div class="panel-section"><div class="lede"><div class="lede-kicker">' +
        esc(t('tabs.area')) + '</div><div class="lede-text"><strong>' +
        esc(t('tile.selectPrompt')) + '</strong><br>' + esc(t('tile.selectPromptSub')) +
        '</div></div></div>';
    } else {
      html += '<div class="panel-section">' + crewPicker() + tileCard(tile) + '</div>';
    }
    panel.innerHTML = html;
    bindAreaPanel(panel);
  }

  /* ---------------- sidebar: situation ---------------- */
  function goalsMarkup() {
    const state = UI.state;
    const forest = S.forestPct(state);
    const goals = [];
    function add(done, warn, text) {
      goals.push({ done: done, warn: warn, text: text });
    }
    add(state.stats.funds <= 0, state.stats.funds < 45,
      t('stat.company') + ': ' + Math.round(state.stats.funds) + ' — ' + t('stat.company.tip'));
    add(forest >= CFG.forestGoal, forest < CFG.forestGoal,
      t('stat.forest') + ': ' + forest + '% / ' + CFG.forestGoal + '%');
    add(state.stats.acceptance >= CFG.acceptanceGoal, state.stats.acceptance < 20,
      t('stat.acceptance') + ': ' + Math.round(state.stats.acceptance) + ' / ' + CFG.acceptanceGoal);
    add(state.day > CFG.maxDays, state.day > CFG.maxDays - 5,
      t('sit.daysLeft', { n: Math.max(0, CFG.maxDays + 1 - state.day) }));

    if (state.stats.acceptance < 20) goals.push({ warn: true, text: t('sit.lowAcceptance') });
    if (state.stats.heat > 70) goals.push({ warn: true, text: t('sit.highHeat') });
    if (state.stats.energy < 20) goals.push({ warn: true, text: t('sit.lowEnergy') });
    if (forest < CFG.forestGoal) goals.push({ warn: true, text: t('sit.forestLow') });
    if (state.stats.funds < 45) goals.push({ done: false, text: t('sit.fundsLow') });
    if (state.stats.acceptance > 60 && state.stats.heat < 55) goals.push({ text: t('sit.good') });

    return '<ul class="goal-list">' + goals.map(function (g) {
      const cls = g.done ? 'done' : (g.warn ? 'warn' : '');
      const bullet = g.done ? '✓' : (g.warn ? '!' : '●');
      return '<li class="goal-item ' + cls + '"><span class="goal-bullet">' + bullet +
        '</span><span>' + esc(g.text) + '</span></li>';
    }).join('') + '</ul>';
  }

  function meterRow(label, value, max, type) {
    const width = clamp(max > 0 ? value / max * 100 : 0, 0, 100);
    return '<div class="meter-row"><span class="meter-label">' + esc(label) + '</span>' +
      '<div class="meter-track"><span style="width:' + width + '%;background:' +
      (type || 'var(--pink)') + '"></span></div><span class="meter-val">' +
      Math.round(value) + '</span></div>';
  }

  function renderSituationPanel() {
    const state = UI.state;
    const panel = byId('tab-situation');
    if (!state || !panel) return;
    const forest = S.forestPct(state);
    const allies = FO.game.alliedVillages(state);
    const people = FO.game.totalPeople(state);
    const foodNeed = Math.max(1, Math.ceil(people * CFG.dailyFoodPerPerson) - allies.length);
    const income = FO.game.companyIncome(state);
    const capacity = S.capacity(state);
    const donations = Math.max(0, Math.round(state.stats.acceptance * CFG.donationPerAcceptance +
      allies.length * 3 + state.stats.media * 0.15));

    let html = '<div class="panel-section"><div class="lede"><div class="lede-kicker">' +
      esc(t('sit.objectives')) + '</div><div class="lede-text">' + goalsMarkup() + '</div></div></div>';

    html += '<div class="panel-section"><div class="panel-title">' + esc(t('sit.title')) +
      '<span class="pt-note">' + esc(t('report.day', { n: state.day })) + '</span></div>' +
      meterRow(t('stat.energy'), state.stats.energy, 100, 'var(--orange)') +
      meterRow(t('stat.acceptance'), state.stats.acceptance, 100, 'var(--pink)') +
      meterRow(t('stat.heat'), state.stats.heat, 100, 'var(--red)') +
      meterRow(t('stat.media'), state.stats.media, 24, 'var(--sky)') +
      meterRow(t('sit.forest'), forest, 100, 'var(--acid)') +
      meterRow(t('stat.company'), Math.max(0, 100 - state.stats.funds / 2), 100, 'var(--violet)') +
      '</div>';

    html += '<div class="panel-section"><div class="panel-title">' + esc(t('sit.daily')) +
      '<span class="pt-note">' + esc(t('misc.perDay')) + '</span></div>' +
      '<div class="policy-list"><div class="policy-item"><span class="p-ico">' +
      svgIcon('food') + '</span><span>' + esc(t('sit.dailyLine', {
        food: foodNeed, energy: CFG.energyNightDecay, money: money(donations)
      })) + '</span></div>' +
      '<div class="policy-item"><span class="p-ico">' + svgIcon('company') + '</span><span>' +
      esc(t('sit.companyIncome')) + ': ' + signed(income) + '</span></div>' +
      '<div class="policy-item"><span class="p-ico">' + svgIcon('treehouse') + '</span><span>' +
      esc(t('sit.capacityValue', { used: S.occupiedTiles(state).length, max: capacity })) +
      '</span></div></div></div>';

    html += '<div class="panel-section"><div class="panel-title">' + esc(t('sit.villages')) +
      '<span class="pt-note">' + allies.length + ' ' + esc(t('sit.allies')) + '</span></div>';
    if (!state.villages.length) {
      html += '<div class="empty-note">' + esc(t('sit.villagesNone')) + '</div>';
    } else {
      html += state.villages.map(function (v) {
        const status = v.status === 'ally' ? t('tile.villageAlly') :
          (v.status === 'expropriated' ? t('tile.villageExpropriated') : t('tile.villageNeutral'));
        const cls = v.status === 'ally' ? 'ally' : (v.status === 'expropriated' ? 'exp' : 'neutral');
        return '<div class="village-row"><div class="village-head"><span class="village-name">' +
          esc(v.name) + '</span><span class="village-status ' + cls + '">' + esc(status) +
          '</span></div><div class="mini-bar"><span style="width:' + v.support + '%"></span></div>' +
          '<div class="field-help">' + esc(t('tile.support')) + ': ' + v.support + '%</div>' +
          (v.desc ? '<div class="field-help">' + esc(L(v.desc)) + '</div>' : '') + '</div>';
      }).join('');
      if (allies.length) {
        html += '<div class="field-help">' + esc(t('sit.allyBonus', {
          money: allies.length * 3, food: allies.length
        })) + '</div>';
      }
    }
    html += '</div>';

    html += '<div class="panel-section"><div class="panel-title">' + esc(t('sit.policies')) + '</div>';
    const policies = [];
    if (state.policies.demoBan) policies.push(['×', t('sit.policy.demoBan')]);
    if (state.policies.road) policies.push(['→', t('sit.policy.road')]);
    if (state.policies.minePermit) policies.push(['▲', t('sit.policy.mine')]);
    if (state.policies.policeFunding) policies.push(['!', t('sit.policy.police') + ' +' + state.policies.policeFunding]);
    if (state.policies.expropriated && state.policies.expropriated.length) {
      const names = state.policies.expropriated.map(function (id) {
        const v = S.villageById(state, id);
        return v ? v.name : id;
      }).join(', ');
      policies.push(['⌂', t('sit.policy.expropriation', { names: names })]);
    }
    if (state.flags.negotiation) policies.push(['◎', t('sit.policy.negotiation')]);
    if (state.flags.court) policies.push(['⚖', t('sit.policy.court')]);
    if (!policies.length) {
      html += '<div class="empty-note">' + esc(t('sit.policiesNone')) + '</div>';
    } else {
      html += '<div class="policy-list">' + policies.map(function (p) {
        return '<div class="policy-item"><span class="p-ico">' + esc(p[0]) + '</span><span>' +
          esc(p[1]) + '</span></div>';
      }).join('') + '</div>';
    }
    html += '</div>';

    html += '<div class="panel-section"><div class="forecast"><div class="fc-title">' +
      esc(t('sit.forecast')) + '</div>' + FO.game.forecast(state).map(function (f) {
        const tone = f.tone === 'bad' ? ' style="color:#ff9e8c"' :
          (f.tone === 'good' ? ' style="color:#c9f24b"' : '');
        return '<div' + tone + '>◆ ' + esc(L(f)) + '</div>';
      }).join('') + '</div></div>';

    panel.innerHTML = html;
  }

  /* ---------------- sidebar: journal ---------------- */
  function renderJournalPanel() {
    const state = UI.state;
    const panel = byId('tab-journal');
    if (!state || !panel) return;
    const entries = state.log.slice().reverse();
    let html = '<div class="panel-section"><div class="panel-title">' + esc(t('journal.title')) +
      '<span class="pt-note">' + state.log.length + '</span></div>';
    if (!entries.length) {
      html += '<div class="journal-empty">' + esc(t('journal.empty')) + '</div>';
    } else {
      let lastDay = null;
      html += '<div class="journal-list">';
      entries.forEach(function (e) {
        if (e.day !== lastDay) {
          html += '<div class="journal-entry day-sep">' + esc(t('journal.day', { n: e.day })) + '</div>';
          lastDay = e.day;
        }
        html += '<div class="journal-entry ' + esc(e.type || '') + '">' +
          esc(L(e)) + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    panel.innerHTML = html;
  }

  /* ---------------- map legend ---------------- */
  function legendItem(label, color, iconName) {
    return '<div class="legend-item"><span class="legend-swatch" style="background:' + color + '">' +
      (iconName ? svgIcon(iconName) : '') + '</span><span>' + esc(label) + '</span></div>';
  }

  function renderLegend() {
    const root = byId('map-legend');
    if (!root) return;
    const terrain = [
      ['forest', TERRAIN_FILL.forest], ['ancient', TERRAIN_FILL.ancient],
      ['clearcut', TERRAIN_FILL.clearcut], ['mine', TERRAIN_FILL.mine],
      ['plant', TERRAIN_FILL.plant], ['company', TERRAIN_FILL.company],
      ['village', TERRAIN_FILL.village], ['ghost', TERRAIN_FILL.ghost],
      ['field', TERRAIN_FILL.field], ['water', TERRAIN_FILL.water]
    ];
    let html = '<h4>' + esc(t('map.legend')) + '</h4><div class="legend-grid">' +
      terrain.map(function (d) {
        return legendItem(t('map.legend.' + d[0]), d[1]);
      }).join('') + '</div>' +
      '<h4 style="margin-top:12px">' + esc(t('map.legend.symbols')) + '</h4>' +
      '<div class="legend-grid">' +
      legendItem(t('map.legend.rail'), '#f2e7d0', 'rail') +
      legendItem(t('map.legend.road'), '#b08b5a', 'road') +
      legendItem(t('map.legend.power'), '#ff7a1a', 'pylon') +
      legendItem(t('map.legend.police'), '#45c7e8', 'shield') +
      legendItem(t('map.legend.policeCamp'), '#45c7e8', 'shield') +
      legendItem(t('map.legend.barrio'), '#c9f24b', 'treehouse') +
      legendItem(t('map.legend.logging'), '#e8452c', 'saw') +
      '</div>';
    root.innerHTML = html;
    if (!root.getAttribute('data-built')) {
      root.setAttribute('data-built', '1');
      root.classList.add('hidden');
    }
  }

  function toggleLegend() {
    const root = byId('map-legend');
    const btn = byId('map-legend-btn');
    if (!root || !btn) return;
    const show = root.classList.contains('hidden');
    root.classList.toggle('hidden', !show);
    btn.classList.toggle('active', show);
    FO.audio.play('click');
  }

  /* ---------------- panels dispatcher ---------------- */
  function renderPanel(tab) {
    if (!UI.state) return;
    if (tab === 'crews') renderCrewsPanel();
    else if (tab === 'area') renderAreaPanel();
    else if (tab === 'situation') renderSituationPanel();
    else if (tab === 'journal') renderJournalPanel();
  }

  function setTab(tab) {
    if (!tab) return;
    UI.tab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
    ['crews', 'area', 'situation', 'journal'].forEach(function (name) {
      const panel = byId('tab-' + name);
      if (panel) panel.classList.toggle('hidden', name !== tab);
    });
    renderPanel(tab);
  }

  /* ---------------- main refresh ---------------- */
  function refresh() {
    const state = UI.state;
    if (!state) return;
    renderTopbar();
    renderResources();
    renderTicker();
    renderHint();
    renderMap();
    renderLegend();
    renderPanel(UI.tab);
  }

  /* ============================================================
     FLOW — screens, setup, events, reports, endings, settings
     ============================================================ */

  function showScreen(name) {
    const start = byId('screen-start');
    const game = byId('screen-game');
    if (start) start.classList.toggle('hidden', name !== 'start');
    if (game) game.classList.toggle('hidden', name !== 'game');
    if (name === 'start') updateStart();
  }

  function updateStart() {
    const btn = byId('btn-continue');
    if (!btn) return;
    btn.classList.toggle('hidden', !FO.game.hasSave());
  }

  function showError(message) {
    const banner = byId('error-banner');
    if (!banner) return;
    banner.hidden = false;
    banner.textContent = t('ui.error') + (message ? ' · ' + message : '');
    if (UI.errTimer) clearTimeout(UI.errTimer);
    UI.errTimer = setTimeout(function () { banner.hidden = true; }, 14000);
  }

  function firstFreeCrew(state) {
    const free = FO.game.availableCrews(state).filter(function (c) { return !state.assignments[c.id]; });
    if (free.length) return free[0].id;
    const active = FO.game.activeCrews(state);
    return active.length ? active[0].id : null;
  }

  function enterGame(state, opts) {
    if (!state) return;
    const o = opts || {};
    UI.state = state;
    UI.selectedTile = null;
    UI.foundingTile = null;
    UI.showAllActions = false;
    UI.zoom = 1;
    UI.pan = { x: 0, y: 0 };
    UI.lastReport = state.report || null;
    UI.selectedCrewId = firstFreeCrew(state);
    if (!UI.workshopFocus) UI.workshopFocus = 'organize';
    FO.game.attach(state);

    if (state.stage === 'founding') {
      UI.foundingTile = state.startCandidates[0] || null;
      UI.selectedTile = UI.foundingTile;
    } else if (o.tileId) {
      UI.selectedTile = o.tileId;
    }

    showScreen('game');
    setTab(state.stage === 'founding' ? 'area' : (o.tab || 'crews'));
    refresh();

    if (state.ending) {
      showEnding(state.ending);
    } else if (state.report) {
      showReport(state.report);
    } else if (state.pendingEvent && FO.EVENT_BY_ID[state.pendingEvent]) {
      showEvent(FO.EVENT_BY_ID[state.pendingEvent]);
    }
  }

  /* ---------------- setup ---------------- */
  function randomSetupNames() {
    UI.setup.forest = nameListRandom(FO.FOREST_NAMES);
    UI.setup.group = nameListRandom(FO.GROUP_NAMES);
    const keys = FO.art.logoKeys || ['fist'];
    UI.setup.logo = nameListRandom(keys);
  }

  function setupBody() {
    const s = UI.setup;
    const diffKeys = ['easy', 'normal', 'hard'];
    const logos = (FO.art.logoKeys || ['fist']).map(function (key) {
      return '<button type="button" class="logo-opt' + (s.logo === key ? ' active' : '') +
        '" data-setup-logo="' + esc(key) + '" title="' + esc(key) + '">' +
        FO.art.logo(key) + '</button>';
    }).join('');
    const diffs = diffKeys.map(function (key) {
      const d = FO.DIFFICULTIES[key];
      return '<button type="button" class="diff-opt' + (s.difficulty === key ? ' active' : '') +
        '" data-setup-diff="' + esc(key) + '"><b>' + esc(t(d.label)) + '</b><span>' +
        esc(t(d.desc)) + '</span></button>';
    }).join('');
    const maps = (FO.MAPS || []).map(function (m) {
      return '<button type="button" class="diff-opt map-opt' + (s.mapId === m.id ? ' active' : '') +
        '" data-setup-map="' + esc(m.id) + '"><b>' + esc(FO.i18n.L(m.name)) + '</b><span>' +
        esc(FO.i18n.L(m.tagline)) + '</span></button>';
    }).join('');

    return '<div class="field-row">' +
      '<div class="field"><label for="setup-forest">' + esc(t('setup.forest')) + '</label>' +
      '<input id="setup-forest" type="text" maxlength="32" value="' + esc(s.forest) + '" autocomplete="off">' +
      '<div class="field-help">' + esc(t('setup.forestHelp')) + '</div></div>' +
      '<div class="field"><label for="setup-group">' + esc(t('setup.group')) + '</label>' +
      '<input id="setup-group" type="text" maxlength="32" value="' + esc(s.group) + '" autocomplete="off">' +
      '<div class="field-help">' + esc(t('setup.groupHelp')) + '</div></div></div>' +
      '<div class="field"><label>' + esc(t('setup.map')) + '</label>' +
      '<div class="map-picker">' + maps + '</div>' +
      '<div class="field-help">' + esc(t('setup.mapHelp')) + '</div></div>' +
      '<div class="field"><label>' + esc(t('setup.logo')) + '</label>' +
      '<div class="logo-picker">' + logos + '</div>' +
      '<div class="field-help">' + esc(t('setup.logoHelp')) + '</div></div>' +
      '<div class="field"><label>' + esc(t('setup.difficulty')) + '</label>' +
      '<div class="diff-picker">' + diffs + '</div></div>' +
      '<div class="field-row" style="align-items:center">' +
      '<button type="button" class="btn btn-paper btn-sm" data-setup-random>✳ ' +
      esc(t('setup.randomName')) + '</button>' +
      '<span class="field-help" style="margin:0">' + esc(t('ui.autosave')) + '</span></div>';
  }

  function openSetup() {
    if (!UI.setup) {
      UI.setup = { forest: '', group: '', logo: 'fist', difficulty: 'normal', mapId: 'talwald' };
      randomSetupNames();
    }
    UI.modalLock = true;
    openModal({
      kicker: t('setup.kicker'),
      title: t('setup.title'),
      sub: t('setup.sub'),
      wide: true,
      noBackdropClose: true,
      body: setupBody(),
      actions: [
        { label: t('ui.back'), cls: 'btn-paper', onClick: function () {
          closeModal();
          UI.modalLock = false;
          if (!UI.state) showScreen('start');
        } },
        { label: t('setup.begin'), cls: 'btn-primary', onClick: beginSetup }
      ],
      onMount: function (root) {
        const forest = byId('setup-forest');
        const group = byId('setup-group');
        if (forest) forest.addEventListener('input', function () { UI.setup.forest = forest.value; });
        if (group) group.addEventListener('input', function () { UI.setup.group = group.value; });
        root.querySelectorAll('[data-setup-logo]').forEach(function (el) {
          el.addEventListener('click', function () {
            UI.setup.logo = el.getAttribute('data-setup-logo');
            root.querySelectorAll('[data-setup-logo]').forEach(function (b) {
              b.classList.toggle('active', b === el);
            });
            FO.audio.play('click');
          });
        });
        root.querySelectorAll('[data-setup-map]').forEach(function (el) {
          el.addEventListener('click', function () {
            const mapId = el.getAttribute('data-setup-map');
            if (UI.setup.mapId === mapId) return;
            UI.setup.mapId = mapId;
            root.querySelectorAll('[data-setup-map]').forEach(function (b) {
              b.classList.toggle('active', b === el);
            });
            // offer the map's own forest name if the player hasn't named one yet
            const def = FO.mapById(mapId);
            if (!UI.setup.forest.trim() && def && def.forest) {
              UI.setup.forest = FO.i18n.L(def.forest);
              if (forest) forest.value = UI.setup.forest;
            }
            FO.audio.play('click');
          });
        });
        root.querySelectorAll('[data-setup-diff]').forEach(function (el) {
          el.addEventListener('click', function () {
            UI.setup.difficulty = el.getAttribute('data-setup-diff');
            root.querySelectorAll('[data-setup-diff]').forEach(function (b) {
              b.classList.toggle('active', b === el);
            });
            FO.audio.play('click');
          });
        });
        const rand = root.querySelector('[data-setup-random]');
        if (rand) rand.addEventListener('click', function () {
          randomSetupNames();
          if (forest) forest.value = UI.setup.forest;
          if (group) group.value = UI.setup.group;
          root.querySelectorAll('[data-setup-logo]').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-setup-logo') === UI.setup.logo);
          });
          FO.audio.play('select');
        });
      }
    });
  }

  function beginSetup() {
    const forest = (UI.setup.forest || '').trim() || nameListRandom(FO.FOREST_NAMES);
    const group = (UI.setup.group || '').trim() || nameListRandom(FO.GROUP_NAMES);
    const state = FO.game.newGame({
      forest: forest,
      group: group,
      logo: UI.setup.logo || 'fist',
      difficulty: UI.setup.difficulty || 'normal',
      mapId: UI.setup.mapId || 'talwald'
    });
    closeModal();
    UI.modalLock = false;
    FO.audio.init();
    FO.audio.play('build');
    enterGame(state, { tab: 'area' });
    toast(t('founding.hint'), 'good');
  }

  function newGameFlow() {
    if (FO.game.hasSave()) {
      confirmBox({
        kicker: t('cover.newGame'),
        title: t('confirm.newGameTitle'),
        text: t('confirm.newGameText'),
        okLabel: t('cover.newGame'),
        danger: true,
        onOk: function () {
          UI.setup = null;
          openSetup();
        }
      });
    } else {
      UI.setup = null;
      openSetup();
    }
  }

  function continueGame() {
    const state = FO.game.load();
    if (!state) {
      toast(t('ui.noSave'), 'bad');
      updateStart();
      return;
    }
    FO.audio.init();
    FO.audio.play('select');
    enterGame(state);
    toast(t('toast.dayStart', { day: state.day }), 'good');
  }

  /* ---------------- first camp ---------------- */
  function foundFirstCamp(tileId) {
    const state = UI.state;
    if (!state) return;
    const ok = FO.game.foundCamp(state, tileId);
    if (!ok) {
      toast(t('founding.hint'), 'bad');
      FO.audio.play('fail');
      return;
    }
    UI.foundingTile = null;
    UI.selectedTile = tileId;
    UI.selectedCrewId = firstFreeCrew(state);
    FO.audio.play('build');
    refresh();
    setTab('crews');
    toast(t('toast.founded'), 'good');
    const event = state.pendingEvent ? FO.EVENT_BY_ID[state.pendingEvent] : null;
    if (event) {
      setTimeout(function () { showEvent(event); }, 220);
    }
  }

  /* ---------------- effects / deltas ---------------- */
  const FX_META = [
    { key: 'energy', label: 'stat.energy', up: 1 },
    { key: 'acceptance', label: 'stat.acceptance', up: 1 },
    { key: 'heat', label: 'stat.heat', up: -1 },
    { key: 'size', label: 'stat.supporters', up: 1 },
    { key: 'funds', label: 'stat.company', up: -1 },
    { key: 'media', label: 'stat.media', up: 1 }
  ];

  function fxChips(fx) {
    if (!fx) return '';
    const out = [];
    FX_META.forEach(function (m) {
      const n = fx[m.key];
      if (!n) return;
      const good = n * m.up > 0;
      out.push('<span class="fx ' + (good ? 'pos' : 'neg') + '">' + esc(t(m.label)) + ' ' +
        signed(n) + '</span>');
    });
    if (fx.resources) {
      ['wood', 'food', 'gear', 'money'].forEach(function (k) {
        const n = fx.resources[k];
        if (!n) return;
        out.push('<span class="fx ' + (n > 0 ? 'pos' : 'neg') + '">' + esc(t('res.' + k)) + ' ' +
          signed(n) + '</span>');
      });
    }
    if (fx.villageSupport) {
      out.push('<span class="fx ' + (fx.villageSupport > 0 ? 'pos' : 'neg') + '">' +
        esc(t('tile.support')) + ' ' + signed(fx.villageSupport) + '</span>');
    }
    if (fx.occupation && fx.occupation < 0) {
      out.push('<span class="fx neg">' + esc(t('tile.occupation')) + ' ' + signed(fx.occupation) + '</span>');
    }
    if (fx.exposeInf) out.push('<span class="fx pos">' + esc(t('inf.found')) + '</span>');
    if (fx.spawnInf || fx.spawnInfChance) out.push('<span class="fx">?</span>');
    return out.join('');
  }

  function chipListChips(chips) {
    if (!chips || !chips.length) return '';
    return chips.map(function (c) {
      const n = c.n;
      const label = t(c.key);
      return '<span class="fx ' + (n > 0 ? 'pos' : 'neg') + '">' + esc(label) + ' ' +
        signed(n) + '</span>';
    }).join('');
  }

  function deltaChips(before, after) {
    if (!before || !after) return '';
    const defs = [
      ['energy', 'stat.energy', 1], ['acceptance', 'stat.acceptance', 1],
      ['heat', 'stat.heat', -1], ['size', 'stat.supporters', 1],
      ['media', 'stat.media', 1], ['forest', 'stat.forest', 1],
      ['funds', 'stat.company', -1], ['occupied', 'tile.occupation', 1],
      ['wood', 'res.wood', 1], ['food', 'res.food', 1],
      ['gear', 'res.gear', 1], ['money', 'res.money', 1]
    ];
    return defs.map(function (d) {
      const diff = Math.round((after[d[0]] - before[d[0]]) * 10) / 10;
      if (!diff) return '';
      const good = diff * d[2] > 0;
      return '<span class="delta ' + (good ? 'up' : 'down') + '">' + esc(t(d[1])) +
        ' ' + signed(diff) + '</span>';
    }).join('');
  }

  /* ---------------- events ---------------- */
  function eventToneLabel(event) {
    if (!event || !event.tone) return t('phase.event');
    return t('phase.event');
  }

  function showEvent(event) {
    const state = UI.state;
    if (!state || !event) return;
    state.pendingEvent = event.id;
    state.phase = 'event';
    UI.modalKind = 'event';
    UI.modalLock = true;
    refresh();

    const options = (event.options || []).map(function (opt, i) {
      const isCheck = opt.chance !== undefined;
      const chance = isCheck ? FO.game.eventChance(state, opt) : null;
      const pill = isCheck
        ? '<span class="event-option-pill' + (chance < 50 ? ' risk' : '') + '">' +
          esc(t('actions.chance')) + ' ' + chance + '%</span>'
        : '<span class="event-option-pill">' + esc(t('ui.choose')) + '</span>';
      return '<button type="button" class="event-option" data-event-opt="' + i + '">' +
        '<span><span class="event-option-label">' + esc(L(opt.label)) + '</span>' +
        (opt.hint ? '<span class="event-option-hint">' + esc(L(opt.hint)) + '</span>' : '') +
        '<span class="fx-line">' + fxChips(opt.effects) + '</span></span>' + pill + '</button>';
    }).join('');

    openModal({
      kicker: eventToneLabel(event),
      title: L(event.title),
      sub: t('report.day', { n: state.day }),
      wide: true,
      closable: false,
      noBackdropClose: true,
      body: '<div class="event-kicker">' + esc(t('event.kicker')) + '</div>' +
        '<p class="event-text">' + esc(L(event.text)) + '</p>' +
        '<div class="event-options">' + options + '</div>',
      onMount: function (root) {
        root.querySelectorAll('[data-event-opt]').forEach(function (el) {
          el.addEventListener('click', function () {
            chooseEvent(Number(el.getAttribute('data-event-opt')));
          });
        });
      }
    });
  }

  function chooseEvent(index) {
    const state = UI.state;
    if (!state || UI.busy) return;
    UI.busy = true;
    FO.audio.play('click');
    let res = null;
    try {
      res = FO.game.chooseEventOption(state, index);
    } catch (err) {
      showError(err && err.message);
    }
    UI.busy = false;
    if (!res) {
      toast(t('toast.invalid'), 'bad');
      return;
    }
    FO.audio.play(res.success === false ? 'fail' : 'success');
    UI.lastEventRes = res;
    showEventResult(res);
  }

  function showEventResult(res) {
    const state = UI.state;
    const kind = !res.isCheck ? 'event.outcome' : (res.success ? 'event.success' : 'event.failure');
    const toneCls = !res.isCheck ? '' : (res.success ? ' good' : ' bad');
    const resultText = res.result ? L(res.result) : t('event.outcome');
    refresh();
    UI.modalLock = true;
    openModal({
      kicker: L(res.event.title),
      title: t(kind),
      sub: t('report.day', { n: state.day }),
      wide: true,
      closable: false,
      noBackdropClose: true,
      body: '<div class="report-entry' + toneCls + '" style="border-left-width:4px">' +
        esc(resultText) + '</div>' +
        (res.isCheck && res.chance !== undefined ? '<div class="field-help" style="margin-top:8px">' +
          esc(t('actions.chance')) + ': ' + res.chance + '% · ' +
          esc(res.success ? t('event.success') : t('event.failure')) + '</div>' : '') +
        (res.chips && res.chips.length ? '<div class="report-deltas">' + chipListChips(res.chips) + '</div>' : ''),
      actions: [
        { label: t('ui.continue'), cls: 'btn-primary', onClick: function () {
          closeModal();
          UI.modalLock = false;
          UI.lastEventRes = null;
          refresh();
          if (state.ending) {
            showEnding(state.ending);
          } else if (state.pendingEvent && FO.EVENT_BY_ID[state.pendingEvent]) {
            showEvent(FO.EVENT_BY_ID[state.pendingEvent]);
          }
        } }
      ]
    });
    FO.audio.play('success');
  }

  /* ---------------- night report ---------------- */
  function reportStat(label, before, after, goodUp, suffix) {
    const diff = Math.round((after - before) * 10) / 10;
    const cls = !diff ? '' : ((diff > 0) === (goodUp !== false) ? 'up' : 'down');
    return '<div class="report-stat"><b class="' + cls + '">' + Math.round(after) +
      (suffix || '') + '</b><span>' + esc(label) + '</span></div>';
  }

  function reportEntryHtml(entry) {
    const tone = entry.tone || 'night';
    const isPlayer = tone === 'player' || tone === 'player-bad';
    const cls = isPlayer ? 'player' + (tone === 'player-bad' ? ' bad' : '') : tone;
    return '<div class="report-entry ' + esc(cls) + '">' +
      '<span class="re-tag">' + esc(isPlayer ? t('report.yourActions') : t('report.night')) +
      '</span>' + esc(L(entry)) + '</div>';
  }

  function showReport(report) {
    const state = UI.state;
    if (!state || !report) return;
    UI.modalKind = 'report';
    UI.modalLock = true;
    UI.lastReport = report;

    const before = report.before || {};
    const after = report.after || {};
    const playerEntries = (report.entries || []).filter(function (e) {
      return e.tone === 'player' || e.tone === 'player-bad';
    });
    const nightEntries = (report.entries || []).filter(function (e) {
      return e.tone !== 'player' && e.tone !== 'player-bad';
    });
    const headlines = report.headlines || [];

    let html = '<div class="report-summary">' +
      reportStat(t('stat.energy'), before.energy || 0, after.energy || 0, true) +
      reportStat(t('stat.acceptance'), before.acceptance || 0, after.acceptance || 0, true) +
      reportStat(t('stat.heat'), before.heat || 0, after.heat || 0, false) +
      reportStat(t('stat.forest'), before.forest || 0, after.forest || 0, true, '%') +
      '</div>';

    html += '<div class="report-deltas">' + deltaChips(before, after) + '</div>';

    html += '<div class="report-section"><h4>' + esc(t('report.yourActions')) + '</h4>' +
      (playerEntries.length ? playerEntries.map(reportEntryHtml).join('') :
        '<div class="report-entry">' + esc(t('report.noActions')) + '</div>') + '</div>';

    html += '<div class="report-section night"><h4>' + esc(t('report.night')) + '</h4>' +
      (nightEntries.length ? nightEntries.map(reportEntryHtml).join('') :
        '<div class="report-entry">' + esc(t('report.quietNight')) + '</div>') + '</div>';

    html += '<div class="report-section"><h4>' + esc(t('report.stats')) + '</h4>' +
      '<div class="report-entry">' + esc(t('report.companyNow', { n: Math.round(state.stats.funds) })) + '</div>' +
      '<div class="report-entry">' + esc(t('report.forestNow', { n: Math.round(after.forest || 0) })) + '</div>' +
      (report.arrests ? '<div class="report-entry bad">' +
        esc(t('report.arrests', { n: report.arrests })) + '</div>' : '') + '</div>';

    if (headlines.length) {
      html += '<div class="report-section"><h4>' + esc(t('report.headlines')) + '</h4>' +
        headlines.slice(0, 4).map(function (h) {
          return '<div class="report-headline"><b>' + esc(t('ui.day')) + ' ' + (h.day || state.day) +
            '</b> ' + esc(L(h)) + '</div>';
        }).join('') + '</div>';
    }

    openModal({
      kicker: t('report.kicker'),
      title: t('report.title', { day: report.day }),
      sub: t('report.sub'),
      wide: true,
      closable: false,
      noBackdropClose: true,
      body: html,
      actions: [
        { label: t('report.continue'), cls: 'btn-primary', onClick: function () {
          closeModal();
          UI.modalLock = false;
          state.report = null;
          FO.game.save(state);
          refresh();
          if (state.ending) {
            showEnding(state.ending);
          } else if (state.pendingEvent && FO.EVENT_BY_ID[state.pendingEvent]) {
            showEvent(FO.EVENT_BY_ID[state.pendingEvent]);
          }
        } }
      ]
    });
  }

  function requestEndDay() {
    const state = UI.state;
    if (!state || state.stage !== 'play' || state.ending) return;
    if (state.phase !== 'plan' || !FO.game.canEndDay(state)) {
      toast(t('toast.invalid'), 'bad');
      return;
    }
    const summary = FO.game.planSummary(state);
    confirmBox({
      kicker: t('ui.endDay'),
      title: t('confirm.endDayTitle'),
      text: t('confirm.endDayText') + ' (' + summary.assigned + '/' + summary.total + ')',
      okLabel: t('confirm.endDayBtn'),
      onOk: runEndDay
    });
  }

  function runEndDay() {
    const state = UI.state;
    if (!state || UI.busy) return;
    UI.busy = true;
    const overlay = byId('resolve-overlay');
    if (overlay) overlay.classList.remove('hidden');
    FO.audio.play('day');

    setTimeout(function () {
      let report = null;
      try {
        report = FO.game.endDay(state);
      } catch (err) {
        showError(err && err.message);
        if (window.console && console.error) console.error(err);
      }
      UI.busy = false;
      if (overlay) overlay.classList.add('hidden');
      if (!report) {
        refresh();
        toast(t('toast.invalid'), 'bad');
        return;
      }
      UI.lastReport = report;
      refresh();
      if (report.arrests) toast(t('report.arrests', { n: report.arrests }), 'bad');
      if (state.stats.funds <= 0) FO.audio.play('victory');
      else if (state.stats.forest === undefined) FO.audio.play('day');
      showReport(report);
    }, 520);
  }

  /* ---------------- endings ---------------- */
  function endingArt(key) {
    const win = key === 'victoryRetreat' || key === 'victoryMoratorium';
    const gone = key === 'forestGone';
    const partial = key === 'partial' || key === 'tooComfortable';
    const sky = gone ? '#6d4632' : (win ? '#1e3a29' : (partial ? '#3a2b20' : '#1c1815'));
    const sun = gone ? '#b9533b' : (win ? '#ffd23f' : '#e0a34a');
    let out = '<svg viewBox="0 0 600 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    out += '<rect width="600" height="130" fill="' + sky + '"/>';
    out += '<circle cx="474" cy="38" r="28" fill="' + sun + '" opacity="0.92"/>';
    out += '<path d="M0 108 Q120 96 240 106 Q360 96 480 106 Q540 101 600 105 L600 130 L0 130 Z" fill="#0d1c12"/>';
    if (gone) {
      out += FO.art.stump(90, 104, 2.4) + FO.art.stump(160, 108, 1.8) +
        FO.art.stump(220, 102, 2) + FO.art.stump(280, 109, 1.5);
      out += '<g transform="translate(420 96)">' + FO.art.excavator(0, 0, 1.5) + '</g>';
      out += FO.art.smoke(500, 18, 2.4);
    } else {
      out += FO.art.conifer(60, 108, 1.35) + FO.art.broadleaf(108, 110, 1.35) +
        FO.art.conifer(150, 107, 1.1) + FO.art.ancientTree(196, 111, 1.4) +
        FO.art.conifer(248, 109, 1.5);
      out += FO.art.treehouse(330, 108, 1.45, win ? 3 : 2, win ? '#c9f24b' : '#ff3d7f');
      out += FO.art.conifer(424, 110, 1.25, '#3f8a4a') + FO.art.broadleaf(478, 111, 1.05) +
        FO.art.conifer(534, 108, 1.4, '#2f6b45');
      if (win) out += FO.art.crowd(300, 117, 0.8, ['#ff3d7f', '#c9f24b', '#45c7e8']);
      if (partial) out += FO.art.barricade(410, 112, 1.4);
      if (key === 'collapse') out += FO.art.tent(380, 116, 1.2, '#b9aa88');
    }
    out += '</svg>';
    return out;
  }

  function showEnding(ending) {
    const state = UI.state;
    if (!ending) return;
    const key = ending.key;
    const win = key === 'victoryRetreat' || key === 'victoryMoratorium';
    const loss = key === 'collapse' || key === 'forestGone';
    const cls = 'ending-card' + (loss ? ' loss' : (win ? '' : ' partial'));
    UI.modalKind = 'ending';
    UI.modalLock = true;
    if (state) {
      state.ending = ending;
      state.phase = 'over';
    }
    refresh();

    const stats = [
      [t('end.stats.forest'), ending.forest + '%'],
      [t('end.stats.acceptance'), ending.acceptance],
      [t('end.stats.company'), ending.funds],
      [t('end.stats.days'), ending.day],
      [t('end.stats.supporters'), ending.supporters],
      [t('end.stats.barrios'), ending.barrios]
    ].map(function (s) {
      return '<div class="ending-stat"><b>' + esc(s[1]) + '</b><span>' + esc(s[0]) + '</span></div>';
    }).join('');

    const body = '<div class="ending-art">' + endingArt(key) + '</div>' +
      '<div class="ending-title">' + esc(t('end.' + key + '.title')) + '</div>' +
      '<div class="ending-text">' + esc(t('end.' + key + '.text')) + '</div>' +
      '<div class="help-block" style="margin-bottom:12px"><h4 style="margin-top:0">' +
      esc(t('end.epilogue')) + '</h4><div class="ending-stats" style="margin-bottom:0">' +
      stats + '</div></div>';

    openModal({
      kicker: t('end.' + key + '.kicker'),
      title: state ? state.player.forest : t('cover.subtitle'),
      sub: state ? state.player.group : '',
      wide: true,
      cls: cls,
      closable: false,
      noBackdropClose: true,
      body: body,
      actions: [
        { label: t('end.again'), cls: 'btn-primary', onClick: function () {
          closeModal();
          UI.modalLock = false;
          showScreen('start');
          updateStart();
          UI.setup = null;
          openSetup();
        } },
        { label: t('end.toTitle'), cls: 'btn-paper', onClick: function () {
          closeModal();
          UI.modalLock = false;
          UI.state = null;
          showScreen('start');
          updateStart();
        } }
      ]
    });
    FO.audio.play(win ? 'victory' : 'defeat');
  }

  /* ---------------- help ---------------- */
  function showHelp() {
    const actionList = FO.ACTIONS.map(function (a) {
      return '<div class="help-action"><b>' + esc(t('action.' + a.id + '.name')) + '</b>' +
        esc(t(a.desc)) + '</div>';
    }).join('');

    const loop = ['help.day1', 'help.day2', 'help.day3'].map(function (k) {
      return '<li>' + esc(t(k)) + '</li>';
    }).join('');

    const tips = [1, 2, 3, 4, 5, 6].map(function (n) {
      return '<li>' + esc(t('help.tip' + n)) + '</li>';
    }).join('');

    const body = '<p>' + esc(t('help.intro')) + '</p><div class="help-grid">' +
      '<div class="help-block"><h4>' + esc(t('help.loopTitle')) + '</h4><p>' +
      esc(t('help.loop')) + '</p><ol>' + loop + '</ol></div>' +
      '<div class="help-block"><h4>' + esc(t('help.statsTitle')) + '</h4><p>' +
      esc(t('help.stats')) + '</p><h4>' + esc(t('help.resourcesTitle')) + '</h4><p>' +
      esc(t('help.resources')) + '</p></div>' +
      '<div class="help-block"><h4>' + esc(t('help.occupyTitle')) + '</h4><p>' +
      esc(t('help.occupy')) + '</p><h4>' + esc(t('help.enemyTitle')) + '</h4><p>' +
      esc(t('help.enemy')) + '</p></div>' +
      '<div class="help-block"><h4>' + esc(t('help.winTitle')) + '</h4><p>' +
      esc(t('help.win')) + '</p><h4>' + esc(t('help.keysTitle')) + '</h4><p>' +
      esc(t('help.keys')) + '</p></div>' +
      '<div class="help-block"><h4>' + esc(t('help.tipsTitle')) + '</h4><ul>' + tips + '</ul></div>' +
      '</div><h4>' + esc(t('help.actionsTitle')) + '</h4><div class="help-actions">' +
      actionList + '</div><div class="disclaimer">' + esc(t('help.disclaimer')) + '</div>';

    openModal({
      kicker: t('help.kicker'),
      title: t('help.title'),
      wide: true,
      body: body,
      actions: [{ label: t('ui.close'), cls: 'btn-primary', onClick: closeModal }]
    });
  }

  /* ---------------- settings ---------------- */
  function settingsBody() {
    const audio = FO.audio.getSettings();
    const common = [
      { lang: 'en', label: 'English' },
      { lang: 'de', label: 'Deutsch' }
    ].map(function (l) {
      return '<button type="button" class="' + (FO.i18n.getLang() === l.lang ? 'active' : '') +
        '" data-set-lang="' + l.lang + '">' + l.label + '</button>';
    }).join('');

    return '<div class="field"><label>' + esc(t('settings.audio')) + '</label>' +
      '<div class="seg" style="margin-bottom:10px">' +
      '<button type="button" class="' + (audio.enabled ? 'active' : '') + '" data-set-sound="on">' +
      esc(t('settings.soundOn')) + '</button>' +
      '<button type="button" class="' + (!audio.enabled ? 'active' : '') + '" data-set-sound="off">' +
      esc(t('settings.soundOff')) + '</button></div>' +
      '<div class="range-row"><span class="field-help" style="margin:0">' +
      esc(t('settings.volume')) + '</span><input type="range" min="0" max="1" step="0.05" value="' +
      audio.volume + '" data-set-volume><span class="range-val">' + Math.round(audio.volume * 100) +
      '%</span></div>' +
      '<label style="display:flex;gap:8px;align-items:center;font-family:var(--font-mono);font-size:.68rem">' +
      '<input type="checkbox" data-set-music' + (audio.music ? ' checked' : '') + '> ' +
      esc(t('settings.music')) + '</label>' +
      '<label style="display:flex;gap:8px;align-items:center;font-family:var(--font-mono);font-size:.68rem;margin-top:6px">' +
      '<input type="checkbox" data-set-sfx' + (audio.sfx ? ' checked' : '') + '> ' +
      esc(t('settings.sfx')) + '</label></div>' +
      '<div class="field"><label>' + esc(t('settings.language')) + '</label>' +
      '<div class="seg">' + common + '</div></div>' +
      '<div class="field"><label>' + esc(t('settings.save')) + '</label>' +
      '<div class="field-help" style="margin-top:0">' + esc(t('settings.saveInfo')) + '</div>' +
      (FO.game.hasSave() ? '<button type="button" class="btn btn-paper btn-sm" style="margin-top:8px" data-set-delete>' +
        esc(t('settings.deleteSave')) + '</button>' : '') + '</div>';
  }

  function showSettings() {
    UI.modalKind = 'settings';
    UI.modalLock = false;
    openModal({
      kicker: t('settings.kicker'),
      title: t('settings.title'),
      body: settingsBody(),
      actions: [{ label: t('ui.close'), cls: 'btn-primary', onClick: function () {
        closeModal();
        if (UI.state) refresh();
      } }],
      onMount: function (root) {
        root.querySelectorAll('[data-set-sound]').forEach(function (el) {
          el.addEventListener('click', function () {
            FO.audio.setEnabled(el.getAttribute('data-set-sound') === 'on');
            FO.audio.play('click');
            showSettings();
          });
        });
        const vol = root.querySelector('[data-set-volume]');
        if (vol) vol.addEventListener('input', function () {
          FO.audio.setVolume(Number(vol.value));
          const label = vol.parentNode.querySelector('.range-val');
          if (label) label.textContent = Math.round(Number(vol.value) * 100) + '%';
        });
        const music = root.querySelector('[data-set-music]');
        if (music) music.addEventListener('change', function () {
          FO.audio.setMusic(music.checked);
          FO.audio.play('click');
        });
        const sfx = root.querySelector('[data-set-sfx]');
        if (sfx) sfx.addEventListener('change', function () {
          FO.audio.setSfx(sfx.checked);
          FO.audio.play('click');
        });
        root.querySelectorAll('[data-set-lang]').forEach(function (el) {
          el.addEventListener('click', function () {
            FO.i18n.setLang(el.getAttribute('data-set-lang'));
            FO.audio.play('click');
            showSettings();
          });
        });
        const del = root.querySelector('[data-set-delete]');
        if (del) del.addEventListener('click', function () {
          closeModal();
          confirmBox({
            kicker: t('settings.save'),
            title: t('settings.deleteSave'),
            text: t('settings.deleteConfirm'),
            okLabel: t('settings.deleteSave'),
            danger: true,
            onOk: function () {
              FO.game.deleteSave();
              updateStart();
              toast(t('toast.saveDeleted'), 'good');
              showSettings();
            }
          });
        });
      }
    });
  }

  /* ---------------- menu ---------------- */
  function showMenu() {
    const state = UI.state;
    if (!state) return;
    const phase = state.stage === 'founding' ? t('phase.founding') :
      (state.phase === 'event' ? t('phase.event') : (state.phase === 'over' ? t('phase.over') : t('phase.plan')));
    const body = '<div class="lede"><div class="lede-kicker">' +
      esc(t('menu.kicker')) + '</div><div class="lede-text"><strong>' +
      esc(t('menu.dayInfo', { day: Math.min(state.day, CFG.maxDays), phase: phase })) +
      '</strong><br>' + esc(state.player.forest) + ' · ' + esc(state.player.group) +
      (state.mapId && FO.mapById ? '<br><span class="field-help">' + esc(t('menu.mapLabel')) + ': ' +
        esc(FO.i18n.L(FO.mapById(state.mapId).name)) + '</span>' : '') + '</div></div>' +
      '<div class="field-help">' + esc(t('settings.saveInfo')) + '</div>';

    openModal({
      kicker: t('menu.kicker'),
      title: t('menu.title'),
      body: body,
      actions: [
        { label: t('menu.resume'), cls: 'btn-primary', onClick: closeModal },
        { label: t('menu.save'), cls: 'btn-paper', onClick: function () {
          if (FO.game.save(state)) toast(t('toast.saved'), 'good');
          else toast(t('ui.error'), 'bad');
        } },
        { label: t('menu.help'), cls: 'btn-paper', onClick: function () { closeModal(); showHelp(); } },
        { label: t('menu.settings'), cls: 'btn-paper', onClick: function () { closeModal(); showSettings(); } },
        { label: t('menu.restart'), cls: 'btn-paper', onClick: function () {
          closeModal();
          confirmBox({
            kicker: t('menu.kicker'),
            title: t('settings.restart'),
            text: t('settings.restartConfirm'),
            okLabel: t('menu.restart'),
            danger: true,
            onOk: function () {
              UI.setup = null;
              showScreen('start');
              updateStart();
              openSetup();
            }
          });
        } },
        { label: t('menu.quit'), cls: 'btn-paper', onClick: function () {
          closeModal();
          confirmBox({
            kicker: t('menu.kicker'),
            title: t('menu.quit'),
            text: t('menu.confirmQuit'),
            okLabel: t('menu.quit'),
            onOk: function () {
              if (UI.state) FO.game.save(UI.state);
              UI.state = null;
              UI.selectedTile = null;
              showScreen('start');
              updateStart();
            }
          });
        } }
      ]
    });
  }

  /* ---------------- bindings ---------------- */
  function fitMap() {
    UI.zoom = 1;
    UI.pan = { x: 0, y: 0 };
    applyMapTransform();
    FO.audio.play('click');
  }

  function bindMap() {
    const map = byId('map');
    if (!map || map.getAttribute('data-bound')) return;
    map.setAttribute('data-bound', '1');

    map.addEventListener('click', function (e) {
      if (UI.suppressClick) {
        UI.suppressClick = false;
        return;
      }
      let el = e.target;
      while (el && el !== map && !(el.getAttribute && el.getAttribute('data-tile'))) el = el.parentNode;
      if (el && el.getAttribute && el.getAttribute('data-tile')) {
        selectTile(el.getAttribute('data-tile'));
      }
    });

    map.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      UI.drag = { x: e.clientX, y: e.clientY, px: UI.pan.x, py: UI.pan.y, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!UI.drag) return;
      const dx = e.clientX - UI.drag.x;
      const dy = e.clientY - UI.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) {
        UI.drag.moved = true;
        map.classList.add('dragging');
      }
      UI.pan.x = UI.drag.px + dx;
      UI.pan.y = UI.drag.py + dy;
      applyMapTransform();
    });
    window.addEventListener('pointerup', function () {
      if (UI.drag && UI.drag.moved) UI.suppressClick = true;
      UI.drag = null;
      map.classList.remove('dragging');
    });
    map.addEventListener('wheel', function (e) {
      e.preventDefault();
      const next = clamp(UI.zoom + (e.deltaY < 0 ? 0.18 : -0.18), 1, 3.4);
      UI.zoom = next;
      if (UI.zoom <= 1.01) UI.pan = { x: 0, y: 0 };
      applyMapTransform();
    }, { passive: false });
  }

  function bindUi() {
    byId('btn-new-game').addEventListener('click', newGameFlow);
    byId('btn-continue').addEventListener('click', continueGame);
    byId('btn-how').addEventListener('click', showHelp);
    byId('btn-start-settings').addEventListener('click', showSettings);
    byId('btn-help').addEventListener('click', showHelp);
    byId('btn-settings').addEventListener('click', showSettings);
    byId('btn-menu').addEventListener('click', showMenu);
    byId('btn-end-day').addEventListener('click', requestEndDay);
    byId('zoom-in').addEventListener('click', function () { zoomMap(1); });
    byId('zoom-out').addEventListener('click', function () { zoomMap(-1); });
    byId('zoom-fit').addEventListener('click', fitMap);
    byId('map-legend-btn').addEventListener('click', toggleLegend);
    byId('btn-sound').addEventListener('click', function () {
      const audio = FO.audio.getSettings();
      FO.audio.setEnabled(!audio.enabled);
      FO.audio.play('click');
      if (UI.state) renderTopbar();
    });

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTab(btn.getAttribute('data-tab'));
        FO.audio.play('click');
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        FO.i18n.setLang(btn.getAttribute('data-lang'));
        FO.audio.play('click');
        updateStart();
        if (UI.state) refresh();
      });
    });

    document.addEventListener('fo:lang', function () {
      if (UI.state) refresh();
    });
    document.addEventListener('fo:audio', function () {
      if (UI.state) renderTopbar();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (UI.modalOpen && !UI.modalLock) {
          closeModal();
          if (UI.state) refresh();
        }
        return;
      }
      if (UI.modalOpen || !UI.state) return;
      const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      if (e.key === '1') setTab('crews');
      else if (e.key === '2') setTab('area');
      else if (e.key === '3') setTab('situation');
      else if (e.key === '4') setTab('journal');
      else if (e.key === ' ') { e.preventDefault(); requestEndDay(); }
      else if (e.key === '+' || e.key === '=') zoomMap(1);
      else if (e.key === '-') zoomMap(-1);
      else if (e.key === 'f' || e.key === 'F') fitMap();
    });

    bindMap();
  }

  function boot() {
    if (UI.booted) return;
    UI.booted = true;
    FO.i18n.applyStatic(document);
    FO.i18n.setLang(FO.i18n.getLang());
    bindUi();
    updateStart();
    showScreen('start');

    let unlocked = false;
    document.addEventListener('pointerdown', function () {
      if (unlocked) return;
      unlocked = true;
      FO.audio.init();
    });
  }

  window.FO = window.FO || {};
  FO.ui = {
    boot: boot,
    refresh: refresh,
    showError: showError,
    showHelp: showHelp,
    showSettings: showSettings,
    showMenu: showMenu,
    openSetup: openSetup,
    UI: UI
  };
})();
