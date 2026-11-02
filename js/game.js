/* ============================================================
   game.js — the engine: actions, night, politics, endings
   ============================================================ */
(function () {
  const CFG = FO.CONFIG;
  const S = FO.state;
  const SAVE_KEY = 'fo.save.v1';

  let R = null;

  /* ---------------- helpers ---------------- */
  function clamp(v, lo, hi) { return S.clamp(v, lo, hi); }
  function rnd() { return Math.random(); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function activeCrews(state) {
    return state.crews.filter(function (c) { return !c.removed; });
  }
  function availableCrews(state) {
    return state.crews.filter(function (c) { return !c.removed && !c.arrested; });
  }
  function crewById(state, id) {
    return state.crews.filter(function (c) { return c.id === id; })[0] || null;
  }
  function actionById(id) { return FO.ACTION_BY_ID[id] || null; }
  function villageOf(state, tile) { return S.villageOfTile(state, tile); }
  function alliedVillages(state) {
    return state.villages.filter(function (v) { return v.status === 'ally'; });
  }
  function totalPeople(state) {
    return activeCrews(state).reduce(function (n, c) { return n + c.size; }, 0) +
      Math.round(state.stats.size * 0.12);
  }
  function totalCrewEnergy(state) {
    const cs = activeCrews(state);
    if (!cs.length) return 0;
    return cs.reduce(function (n, c) { return n + c.energy; }, 0) / cs.length;
  }
  function occupiedCount(state) { return S.occupiedTiles(state).length; }

  function pushLog(state, type, en, de) {
    state.log.push({ day: state.day, type: type, en: en, de: de });
    if (state.log.length > 500) state.log.splice(0, state.log.length - 500);
  }
  function repEntry(report, tone, en, de) {
    if (!report) return;
    report.entries.push({ tone: tone || 'night', en: en, de: de });
  }

  function setStat(state, key, value) {
    const caps = { energy: 100, acceptance: 100, heat: 100, media: 24, size: 240, funds: 9999 };
    state.stats[key] = clamp(value, 0, caps[key] === undefined ? 9999 : caps[key]);
  }

  /* ---------------- chance & validation ---------------- */
  function chanceFor(state, crew, action, tile) {
    if (!action || !crew) return 0;
    if (action.id === 'rest') return 100;
    if (action.id === 'trust') {
      let c = 46 + (crew.skills.organize || 0) * 8 + (state.stats.acceptance - 40) * 0.2;
      if (state.metrics.exposed > 0) c += 8;
      return Math.round(clamp(c, 15, 92));
    }
    const skill = action.skill ? (crew.skills[action.skill] || 0) : 0;
    let c = 58 + skill * 9 - (action.difficulty || 0) * 7;
    c += (state.stats.acceptance - 40) * 0.22;
    c += (state.stats.media - 5) * 1.1;
    c += (crew.energy - 50) * 0.1;
    if (state.stats.heat > 65) c -= (state.stats.heat - 65) * 0.35;
    if (tile) {
      if (tile.police > 0) c -= tile.police * 6;
      if (tile.court > 0) c += 6;
      if (tile.occupied > 0) c += 5;
    }
    if (action.id === 'sabotage' && tile && tile.pole) c += 4;
    if (action.id === 'fundraise') c += Math.min(12, alliedVillages(state).length * 3);
    if (action.prisonTargets && tile && tile.policeCamp && state.policeCampDown > 0) c += 25;
    if (tile && state.policeCampId) {
      const camp = S.tileById(state, state.policeCampId);
      const campDown = !!state.policeCampDown;
      if (camp && !campDown && (camp.id === tile.id ||
        S.neighborsOf(state, camp).some(function (n) { return n.id === tile.id; }))) {
        c -= 6;
      }
    }
    return Math.round(clamp(c, 8, 96));
  }

  function reservedCosts(state, excludeCrewId) {
    const out = { wood: 0, food: 0, gear: 0, money: 0 };
    Object.keys(state.assignments || {}).forEach(function (id) {
      if (id === excludeCrewId) return;
      const plan = state.assignments[id];
      const a = actionById(plan && plan.actionId);
      if (!a || !a.cost) return;
      Object.keys(a.cost).forEach(function (k) {
        if (out[k] !== undefined) out[k] += a.cost[k];
      });
    });
    return out;
  }

  function freeResources(state, excludeCrewId) {
    const reserved = reservedCosts(state, excludeCrewId);
    return {
      wood: Math.max(0, state.resources.wood - reserved.wood),
      food: Math.max(0, state.resources.food - reserved.food),
      gear: Math.max(0, state.resources.gear - reserved.gear),
      money: Math.max(0, state.resources.money - reserved.money)
    };
  }

  function missingCost(free, cost) {
    if (!cost) return null;
    if (cost.wood && free.wood < cost.wood) return 'actions.needWood';
    if (cost.food && free.food < cost.food) return 'actions.needFood';
    if (cost.gear && free.gear < cost.gear) return 'actions.needGear';
    if (cost.money && free.money < cost.money) return 'actions.needMoney';
    return null;
  }

  function needsBaseAnywhere(state) {
    return state.tiles.some(function (t) { return t.occupied > 0; });
  }

  function validate(state, crew, actionId, tileId) {
    const action = actionById(actionId);
    if (!action) return { ok: false, reason: 'toast.invalid' };
    if (!crew) return { ok: false, reason: 'actions.needCrew' };
    if (crew.arrested) return { ok: false, reason: 'crew.statusArrested' };
    if (crew.energy < action.stamina && action.id !== 'rest') {
      return { ok: false, reason: 'actions.needEnergy' };
    }

    const tile = tileId ? S.tileById(state, tileId) : null;
    if (!action.instantCrew && !tile) return { ok: false, reason: 'toast.invalid' };

    if (action.id === 'demo' && state.policies.demoBan) {
      return { ok: false, reason: 'actions.policyBan' };
    }
    if (action.minSize && state.stats.size < action.minSize) {
      return { ok: false, reason: 'actions.needSize' };
    }
    const costReason = missingCost(freeResources(state, crew.id), action.cost);
    if (costReason) return { ok: false, reason: costReason };

    if (action.needBase) {
      if (!needsBaseAnywhere(state)) return { ok: false, reason: 'actions.needBase' };
      if (!tile || tile.occupied <= 0) return { ok: false, reason: 'actions.needBarrio' };
    }

    if (action.id === 'build') {
      if (tile.occupied > 0) {
        if ((tile.barrio && tile.barrio.level >= 3)) return { ok: false, reason: 'actions.maxLevel' };
      } else {
        if (action.terrains.indexOf(tile.terrain) === -1) return { ok: false, reason: 'actions.needForest' };
        if (!S.hasBaseNeighbor(state, tile)) return { ok: false, reason: 'actions.needAdjacent' };
        if (occupiedCount(state) >= S.capacity(state)) return { ok: false, reason: 'actions.needCapacity' };
      }
    }

    if (action.terrains && action.id !== 'build') {
      if (action.terrains.indexOf(tile.terrain) === -1) {
        if (action.id === 'reforest') return { ok: false, reason: 'actions.needClearcut' };
        if (action.id === 'scout') return { ok: false, reason: 'actions.needForest' };
        return { ok: false, reason: 'toast.invalid' };
      }
    }

    if (action.id === 'reforest') {
      if (tile.occupied > 0) return { ok: false, reason: 'actions.occupied' };
      if (tile.reforestIn > 0 || tile.young) return { ok: false, reason: 'actions.occupied' };
    }

    if (action.id === 'network') {
      const v = villageOf(state, tile);
      if (!v) return { ok: false, reason: 'actions.needVillage' };
      if (v.status === 'expropriated') return { ok: false, reason: 'actions.needVillage' };
      if (v.status === 'ally' && v.support >= 100) return { ok: false, reason: 'actions.occupied' };
    }

    if (action.demoTargets) {
      const ok = tile.terrain === 'village' || tile.terrain === 'company' ||
        tile.terrain === 'plant' || tile.terrain === 'mine';
      if (!ok) return { ok: false, reason: 'actions.needDemoTarget' };
    }

    if (action.blockadeTargets) {
      const ok = tile.rail || tile.road || tile.terrain === 'mine' ||
        tile.terrain === 'plant' || tile.terrain === 'company' || tile.roadProject;
      if (!ok) return { ok: false, reason: 'actions.needRail' };
      if (tile.blockade > 0) return { ok: false, reason: 'actions.occupied' };
    }

    if (action.sabotageTargets) {
      const ok = tile.pole || tile.terrain === 'mine' || tile.terrain === 'plant' ||
        tile.terrain === 'company' || tile.machineDown > 0 || tile.policeCamp;
      if (!ok) return { ok: false, reason: 'actions.needSabotageTarget' };
      if (tile.pole && tile.poleDown > 0) return { ok: false, reason: 'actions.occupied' };
      if (!tile.pole && tile.machineDown > 0) return { ok: false, reason: 'actions.occupied' };
      if (tile.policeCamp && state.policeCampDown > 0) return { ok: false, reason: 'actions.occupied' };
    }

    if (action.prisonTargets) {
      const jailed = jailedCrews(state);
      if (!jailed.length) return { ok: false, reason: 'actions.needPrisoners' };
      const camp = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
      if (camp && camp.policeCamp) {
        if (tile.id !== camp.id) return { ok: false, reason: 'actions.needPoliceCamp' };
      } else if (tile.terrain !== 'company') {
        return { ok: false, reason: 'actions.needPoliceStation' };
      }
    }

    return { ok: true, chance: chanceFor(state, crew, action, tile) };
  }

  function jailedCrews(state) {
    return state.crews.filter(function (c) { return c.arrested && !c.removed; });
  }

  function freeJailed(state, n, report, whyEn, whyDe) {
    const jailed = jailedCrews(state).slice(0, n || 99);
    jailed.forEach(function (c) {
      c.arrested = false;
      c.returnDay = 0;
      c.energy = Math.max(c.energy, 55);
      c.assigned = null;
      if (report) {
        repEntry(report, 'good', whyEn.replace('{crew}', c.name.en), whyDe.replace('{crew}', c.name.de));
      }
      pushLog(state, 'good', whyEn.replace('{crew}', c.name.en), whyDe.replace('{crew}', c.name.de));
    });
    return jailed;
  }

  function validActionsForTile(state, tileId, crewId) {    const crew = crewById(state, crewId);
    const out = [];
    FO.ACTIONS.forEach(function (a) {
      if (a.instantCrew) return;
      const v = validate(state, crew, a.id, tileId);
      out.push({ action: a, ok: v.ok, reason: v.reason, chance: v.chance || 0 });
    });
    return out;
  }

  /* ---------------- assignment ---------------- */
  function assign(state, crewId, actionId, tileId, focus) {
    const crew = crewById(state, crewId);
    const action = actionById(actionId);
    const v = validate(state, crew, actionId, tileId);
    if (!v.ok) return v;
    const tile = tileId ? S.tileById(state, tileId) : null;
    const plan = {
      crewId: crewId,
      actionId: actionId,
      tileId: tileId || null,
      focus: focus || null,
      chance: v.chance,
      name: action.id
    };
    state.assignments[crewId] = plan;
    crew.assigned = plan;
    return { ok: true, plan: plan };
  }

  function cancelAssign(state, crewId) {
    const crew = crewById(state, crewId);
    delete state.assignments[crewId];
    if (crew) crew.assigned = null;
  }

  function assignInstant(state, crewId, actionId) {
    return assign(state, crewId, actionId, null, null);
  }

  function canEndDay(state) {
    return !!state && state.stage === 'play' && state.phase === 'plan' && !state.ending;
  }

  function planSummary(state) {
    const assigned = Object.keys(state.assignments || {}).length;
    const available = availableCrews(state).length;
    return { assigned: assigned, available: available, total: activeCrews(state).length };
  }

  /* ---------------- resources & effects ---------------- */
  function addResource(state, key, amount) {
    if (!amount) return;
    const v = (state.resources[key] || 0) + amount;
    state.resources[key] = clamp(v, 0, 999);
  }

  function effectChips(effects) {
    const out = [];
    if (!effects) return out;
    const statMap = { energy: 'stat.energy', acceptance: 'stat.acceptance', heat: 'stat.heat',
      size: 'stat.supporters', funds: 'stat.company', media: 'stat.media' };
    Object.keys(statMap).forEach(function (k) {
      if (effects[k]) out.push({ key: statMap[k], n: effects[k] });
    });
    if (effects.resources) {
      ['wood', 'food', 'gear', 'money'].forEach(function (k) {
        if (effects.resources[k]) out.push({ key: 'res.' + k, n: effects.resources[k] });
      });
    }
    if (effects.villageSupport) out.push({ key: 'stat.crewsupport', n: effects.villageSupport });
    return out;
  }

  function spawnInfiltrator(state) {
    const candidates = activeCrews(state).filter(function (c) { return !c.inf; });
    if (!candidates.length) return null;
    const c = pick(candidates);
    c.inf = true;
    c.knownInf = false;
    c.suspicion = 0;
    state.flags.infSpawned = true;
    return c;
  }

  function exposeInfiltrator(state) {
    const infs = state.crews.filter(function (c) { return c.inf && !c.removed; });
    if (!infs.length) return null;
    const c = pick(infs);
    c.removed = true;
    c.assigned = null;
    delete state.assignments[c.id];
    state.metrics.exposed++;
    return c;
  }

  function arrestCrew(state, crew, days) {
    if (!crew || crew.arrested) return;
    crew.arrested = true;
    crew.returnDay = state.day + (days || 2);
    crew.assigned = null;
    delete state.assignments[crew.id];
    state.metrics.arrests++;
  }

  function evictTile(state, tile) {
    if (!tile || tile.occupied <= 0) return false;
    tile.occupied = 0;
    tile.barrio = null;
    state.metrics.evictions++;
    return true;
  }

  /**
   * Apply a declarative event effect object. Returns an array of chips.
   */
  function applyEffects(state, fx) {
    if (!fx) return [];
    const chips = effectChips(fx);
    if (fx.energy) setStat(state, 'energy', state.stats.energy + fx.energy);
    if (fx.acceptance) setStat(state, 'acceptance', state.stats.acceptance + fx.acceptance);
    if (fx.heat) setStat(state, 'heat', state.stats.heat + fx.heat);
    if (fx.size) setStat(state, 'size', state.stats.size + fx.size);
    if (fx.funds) setStat(state, 'funds', state.stats.funds + fx.funds);
    if (fx.media) setStat(state, 'media', state.stats.media + fx.media);
    if (fx.resources) {
      Object.keys(fx.resources).forEach(function (k) {
        if (state.resources[k] !== undefined) addResource(state, k, fx.resources[k]);
      });
    }
    if (fx.villageSupport) {
      state.villages.forEach(function (v) {
        if (v.status === 'expropriated') return;
        v.support = clamp(v.support + fx.villageSupport, 0, 100);
        if (v.support >= 60 && v.status !== 'ally') {
          v.status = 'ally';
          state.metrics.villagesAlly++;
        }
      });
    }
    if (fx.occupation && fx.occupation < 0) {
      let n = Math.abs(fx.occupation);
      const occupied = S.occupiedTiles(state);
      while (n > 0 && occupied.length) {
        const t = occupied.pop();
        evictTile(state, t);
        n--;
      }
    }
    if (fx.spawnInf) spawnInfiltrator(state);
    if (fx.spawnInfChance && rnd() * 100 < fx.spawnInfChance) spawnInfiltrator(state);
    if (fx.exposeInf) exposeInfiltrator(state);
    if (fx.freePrisoner) {
      freeJailed(state, 1, null,
        '{crew} walks out of custody after a legal filing.',
        '{crew} kommt nach einem juristischen Vorstoß frei.');
    }
    if (fx.policy) {
      state.policies[fx.policy] = true;
      if (fx.policy === 'court') state.flags.court = true;
      if (fx.policy === 'negotiation') state.flags.negotiation = true;
      if (fx.policy === 'road') {
        state.flags.roadProjectActive = true;
        state.flags.roadAnnounced = true;
      }
    }
    if (fx.court) {
      state.flags.court = true;
      const occupied = S.occupiedTiles(state);
      if (occupied.length) occupied[0].court = 3;
    }
    if (fx.police) {
      const occupied = S.occupiedTiles(state);
      if (occupied.length) pick(occupied).police = clamp(fx.police, 0, 3);
    }
    if (fx.logging && fx.logging > 0) {
      const frontier = frontierForest(state);
      for (let i = 0; i < fx.logging && frontier.length; i++) {
        cutTile(state, frontier.splice(Math.floor(rnd() * frontier.length), 1)[0], null);
      }
    }
    return chips;
  }

  /* ---------------- save / load ---------------- */
  function save(state) {
    if (!state) return false;
    try {
      state.saveTime = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.tiles || !data.crews) return null;
      if (data.stage !== 'play' && data.stage !== 'founding') return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }

  function deleteSave() {
    try { localStorage.removeItem(SAVE_KEY); return true; } catch (e) { return false; }
  }

  /* ---------------- forest frontier helpers ---------------- */
  function frontierForest(state) {
    const forest = state.tiles.filter(function (t) {
      return (t.terrain === 'forest' || t.terrain === 'ancient') &&
        t.occupied <= 0 && t.court <= 0;
    });
    const near = forest.filter(function (t) {
      return S.neighborsOf(state, t).some(function (n) {
        return n.terrain === 'clearcut' || n.terrain === 'mine' || n.terrain === 'plant' ||
          n.terrain === 'company' || n.rail || n.road || n.logging > 0 || n.roadProject;
      });
    });
    return near.length ? near : forest;
  }

  function cutTile(state, tile) {
    if (!tile) return null;
    if (tile.terrain !== 'forest' && tile.terrain !== 'ancient') return null;
    if (tile.occupied > 0 || tile.court > 0) return null;
    const wasAncient = tile.terrain === 'ancient';
    tile.terrain = 'clearcut';
    tile.logging = 0;
    tile.young = false;
    state.metrics.forestLost++;
    return { wasAncient: wasAncient, id: tile.id };
  }

  /* ---------------- action resolution ---------------- */
  function spendCost(state, action) {
    if (!action.cost) return;
    Object.keys(action.cost).forEach(function (k) {
      if (state.resources[k] !== undefined) addResource(state, k, -action.cost[k]);
    });
  }

  function maybeArrest(state, crew, base, report) {
    const p = base + Math.max(0, state.stats.heat - 55) * 0.35;
    if (rnd() * 100 < p) {
      arrestCrew(state, crew, 2);
      repEntry(report, 'bad',
        crew.name.en + ' was arrested by the police.',
        crew.name.de + ' wurde von der Polizei festgenommen.');
      pushLog(state, 'bad',
        crew.name.en + ' was arrested.',
        crew.name.de + ' wurde festgenommen.');
      if (report) report.arrests = (report.arrests || 0) + 1;
      return true;
    }
    return false;
  }

  function resolveTrust(state, crew, action, report) {
    const chance = chanceFor(state, crew, action, null);
    const success = rnd() * 100 < chance;
    const infs = state.crews.filter(function (c) { return c.inf && !c.removed; });
    if (success) {
      if (infs.length) {
        const exposed = pick(infs);
        exposed.removed = true;
        exposed.assigned = null;
        delete state.assignments[exposed.id];
        state.metrics.exposed++;
        const en = 'The trust circle found them: ' + exposed.name.en +
          ' was feeding plans to the company. They are gone by morning.';
        const de = 'Der Vertrauenskreis hat sie enttarnt: ' + exposed.name.de +
          ' gab Pläne an den Konzern weiter. Am Morgen sind sie verschwunden.';
        repEntry(report, 'player', en, de);
        pushLog(state, 'good', en, de);
        state.headlines.unshift({
          day: state.day,
          en: 'INFILTRATOR EXPELLED FROM ' + state.player.forest.toUpperCase() + ' CAMP.',
          de: 'SPITZEL AUS DEM CAMP IN ' + state.player.forest.toUpperCase() + ' GEWORFEN.'
        });
      } else {
        const en = 'The trust circle is clean — for now. People talk, cry a little, eat soup.';
        const de = 'Der Vertrauenskreis ist sauber — vorerst. Es wird geredet, ein bisschen geweint, Suppe gegessen.';
        repEntry(report, 'player', en, de);
        pushLog(state, 'good', en, de);
        setStat(state, 'energy', state.stats.energy + 2);
        setStat(state, 'acceptance', state.stats.acceptance + 1);
        activeCrews(state).forEach(function (c) {
          if (c.inf) c.suspicion = Math.max(0, c.suspicion - 1);
        });
      }
    } else {
      const en = 'The circle closes ranks around the wrong person. The real informant keeps smiling.';
      const de = 'Der Kreis schließt sich um die falsche Person. Die echte undichte Stelle lächelt weiter.';
      repEntry(report, 'player-bad', en, de);
      pushLog(state, 'bad', en, de);
      setStat(state, 'heat', state.stats.heat + 2);
      setStat(state, 'acceptance', state.stats.acceptance - 1);
      crew.energy = clamp(crew.energy - 4, 0, 100);
      const suspects = activeCrews(state).filter(function (c) { return !c.inf; });
      if (suspects.length) pick(suspects).suspicion = clamp((pick(suspects).suspicion || 0) + 1, 0, 5);
    }
  }

  function resolveAction(state, crew, plan, report) {
    const action = actionById(plan.actionId);
    if (!action) return;
    const tile = plan.tileId ? S.tileById(state, plan.tileId) : null;

    if (action.id === 'rest') {
      crew.energy = clamp(crew.energy + 42, 0, 100);
      const en = crew.name.en + ' takes a breath. The forest holds them.';
      const de = crew.name.de + ' atmet durch. Der Wald hält sie.';
      repEntry(report, 'player', en, de);
      pushLog(state, 'player', en, de);
      return;
    }

    crew.energy = clamp(crew.energy - action.stamina, 0, 100);
    spendCost(state, action);

    if (action.id === 'trust') {
      resolveTrust(state, crew, action, report);
      return;
    }

    if (action.id === 'supply') {
      const chance = clamp(62 + (crew.skills.media || 0) * 8 + state.stats.acceptance * 0.2, 40, 95);
      const success = rnd() * 100 < chance;
      let en = '';
      let de = '';
      if (success) {
        const bonus = Math.floor(state.stats.acceptance / 25);
        const pool = ['wood', 'food', 'gear'];
        const extra = pool[Math.floor(rnd() * pool.length)];
        addResource(state, 'wood', 5 + bonus);
        addResource(state, 'food', 5 + bonus);
        addResource(state, 'gear', 3 + Math.floor(bonus / 2));
        addResource(state, extra, 2);
        en = 'The donations become timber, lentils and rope. The bike trailer groans on the way back — plus a lucky extra: ' + extra + '.';
        de = 'Aus den Spenden werden Balken, Linsen und Seile. Der Fahrradanhänger ächzt auf dem Rückweg — dazu ein Glücksfund: ' + extra + '.';
      } else {
        addResource(state, 'wood', 3);
        addResource(state, 'food', 2);
        addResource(state, 'gear', 1);
        en = 'The hardware store had a sale, but the food co-op was closed. Half a haul, half the plan.';
        de = 'Der Baumarkt hatte Ausverkauf, aber die Food-Coop war zu. Halbe Beute, halber Plan.';
      }
      repEntry(report, success ? 'player' : 'player-bad', en, de);
      pushLog(state, success ? 'player' : 'bad', en, de);
      return;
    }

    if (action.id === 'bulk') {
      const chance = clamp(55 + (crew.skills.media || 0) * 8 + state.stats.acceptance * 0.15, 35, 92);
      const success = rnd() * 100 < chance;
      let en = '';
      let de = '';
      if (success) {
        const extra = ['wood', 'food', 'gear'][Math.floor(rnd() * 3)];
        addResource(state, 'wood', 12);
        addResource(state, 'food', 11);
        addResource(state, 'gear', 7);
        addResource(state, extra, 4);
        setStat(state, 'acceptance', state.stats.acceptance + 1);
        en = 'A borrowed van, a wholesale market and a very persuasive speech. The camp is stocked for days — including 4 extra ' + extra + '.';
        de = 'Ein geliehener Van, ein Großmarkt und eine sehr überzeugende Rede. Das Camp ist tagelang versorgt — inklusive 4× ' + extra + ' extra.';
      } else {
        addResource(state, 'wood', 5);
        addResource(state, 'food', 4);
        addResource(state, 'gear', 2);
        en = 'The wholesale trip goes wrong: a flat tyre, a closed gate and a parking ticket. Still, some of it arrives.';
        de = 'Der Großmarkt-Trip geht schief: ein Platten, ein geschlossenes Tor und ein Strafzettel. Trotzdem kommt einiges an.';
      }
      repEntry(report, success ? 'player' : 'player-bad', en, de);
      pushLog(state, success ? 'player' : 'bad', en, de);
      return;
    }

    if (action.id === 'liberate') {
      let en = '';
      let de = '';
      const camp = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
      const chance = chanceFor(state, crew, action, tile);
      const success = rnd() * 100 < chance;
      if (success) {
        const freed = freeJailed(state, 99, report,
          'The fence has a gap, the guard is on a break, and {crew} walks free.',
          'Der Zaun hat eine Lücke, die Wache macht Pause, und {crew} kommt frei.');
        setStat(state, 'heat', state.stats.heat + 6);
        setStat(state, 'acceptance', state.stats.acceptance + 2);
        state.metrics.sabotage++;
        const names = freed.map(function (c) { return c.name.en; }).join(', ');
        const namesDe = freed.map(function (c) { return c.name.de; }).join(', ');
        en = 'Liberation! ' + names + ' are out. The police camp wakes up to an open gate and no explanation.';
        de = 'Befreiung! ' + namesDe + ' sind raus. Das Polizeicamp wacht mit einem offenen Tor und keiner Erklärung auf.';
        repEntry(report, 'player', en, de);
        pushLog(state, 'good', en, de);
        state.headlines.unshift({
          day: state.day,
          en: 'PRISONERS FREED FROM POLICE CAMP — "THE GATE WAS OPEN", SAY POLICE.',
          de: 'GEFANGENE AUS POLIZEICAMP BEFREIT — "DAS TOR WAR OFFEN", SAGT DIE POLIZEI.'
        });
        if (camp) camp.police = clamp((camp.police || 0) + 1, 0, 3);
      } else {
        setStat(state, 'heat', state.stats.heat + 5);
        en = 'The attempt fails. Floodlights, dogs, shouting. The crew scatters — and one of them does not make it out.';
        de = 'Der Versuch scheitert. Flutlicht, Hunde, Geschrei. Die Gruppe zerstreut sich — und eine Person kommt nicht raus.';
        repEntry(report, 'player-bad', en, de);
        pushLog(state, 'bad', en, de);
        arrestCrew(state, crew, 3);
        if (report) report.arrests = (report.arrests || 0) + 1;
      }
      return;
    }

    if (!tile) {
      repEntry(report, 'player-bad', 'The plan fell apart: nobody could find the place.', 'Der Plan scheiterte: Niemand fand den Ort.');
      return;
    }

    const chance = chanceFor(state, crew, action, tile);
    const success = rnd() * 100 < chance;
    let en = '';
    let de = '';

    if (success) {
      switch (action.id) {
        case 'build': {
          if (tile.occupied > 0) {
            tile.barrio.level = clamp((tile.barrio.level || 1) + 1, 1, 3);
            tile.occupied = tile.barrio.level;
            state.metrics.upgraded++;
            setStat(state, 'acceptance', state.stats.acceptance + 1);
            setStat(state, 'heat', state.stats.heat + 1);
            setStat(state, 'energy', state.stats.energy + 1);
            en = 'The barrio grows taller. Level ' + tile.barrio.level + ' now holds more people and is harder to evict.';
            de = 'Das Barrio wächst. Stufe ' + tile.barrio.level + ' bietet mehr Menschen Platz und ist schwerer zu räumen.';
          } else {
            const names = FO.BARRIO_NAMES;
            const name = names[Math.floor(rnd() * names.length)] || 'Kronennest';
            tile.occupied = 1;
            tile.barrio = {
              name: name,
              foundedDay: state.day,
              level: 1,
              type: tile.terrain === 'ghost' ? 'house' : 'treehouse'
            };
            tile.logging = 0;
            state.metrics.built++;
            setStat(state, 'acceptance', state.stats.acceptance + 2);
            setStat(state, 'heat', state.stats.heat + 2);
            setStat(state, 'energy', state.stats.energy + 2);
            en = 'A new barrio rises: ' + name + '. The chainsaws will have to go through people now.';
            de = 'Ein neues Barrio entsteht: ' + name + '. Die Kettensägen müssen jetzt durch Menschen hindurch.';
            state.headlines.unshift({
              day: state.day,
              en: 'NEW TREEHOUSE CAMP "' + name.toUpperCase() + '" TAKES ROOT IN ' + state.player.forest.toUpperCase() + '.',
              de: 'NEUES BAUMHAUSCAMP "' + name.toUpperCase() + '" WÄCHST IN ' + state.player.forest.toUpperCase() + '.'
            });
          }
          break;
        }
        case 'scout': {
          const gains = { wood: 0, food: 0, gear: 0 };
          if (tile.terrain === 'clearcut') { gains.wood = 4; gains.gear = 1; }
          else if (tile.terrain === 'ancient') { gains.wood = 3; gains.food = 2; gains.gear = 1; }
          else if (tile.terrain === 'forest') { gains.wood = 3; gains.food = 1; }
          else if (tile.terrain === 'young') { gains.food = 2; gains.wood = 1; }
          else if (tile.terrain === 'field') { gains.food = 4; }
          else if (tile.terrain === 'water') { gains.food = 3; gains.gear = 1; }
          else if (tile.terrain === 'mine') { gains.gear = 3; gains.wood = 2; }
          else { gains.wood = 1; gains.food = 2; }
          let bonus = null;
          if (rnd() < 0.3) {
            const pool = ['wood', 'food', 'gear'];
            bonus = pool[Math.floor(rnd() * pool.length)];
            gains[bonus] += 2;
          }
          Object.keys(gains).forEach(function (k) { addResource(state, k, gains[k]); });
          setStat(state, 'acceptance', state.stats.acceptance + 1);
          en = 'The crew comes back with ' + gains.wood + ' wood, ' + gains.food + ' food and ' +
            gains.gear + ' gear. Someone also found a good mushroom spot.';
          if (bonus) en += ' Plus a lucky find: ' + gains[bonus] + ' ' + bonus + '.';
          de = 'Die Gruppe kommt mit ' + gains.wood + ' Holz, ' + gains.food + ' Essen und ' +
            gains.gear + ' Material zurück. Jemand hat außerdem eine gute Pilzstelle gefunden.';
          if (bonus) de += ' Dazu ein Glücksfund: ' + gains[bonus] + '× ' + bonus + '.';
          break;
        }
        case 'kitchen': {
          addResource(state, 'food', 5 + alliedVillages(state).length * 2);
          setStat(state, 'energy', state.stats.energy + CFG.kitchenEnergy);
          setStat(state, 'acceptance', state.stats.acceptance + 2);
          activeCrews(state).forEach(function (c) {
            c.energy = clamp(c.energy + CFG.kitchenCrewMeal, 0, 100);
          });
          en = 'The kitchen serves soup to everyone — and to the neighbours. Full bellies, full camp.';
          de = 'Die Küche kocht Suppe für alle — und für die Nachbarschaft. Volle Bäuche, volles Camp.';
          break;
        }
        case 'demo': {
          setStat(state, 'size', state.stats.size + 5);
          setStat(state, 'acceptance', state.stats.acceptance + 3);
          setStat(state, 'heat', state.stats.heat + 3);
          setStat(state, 'media', state.stats.media + 1);
          addResource(state, 'money', 2);
          state.metrics.demos++;
          en = 'The demo fills the village square. Speeches, drums, a very good banner. The movement grows.';
          de = 'Die Demo füllt den Dorfplatz. Reden, Trommeln, ein sehr gutes Banner. Die Bewegung wächst.';
          break;
        }
        case 'blockade': {
          const extra = (crew.skills.climb || 0) >= 4 ? 1 : 0;
          tile.blockade = 2 + extra;
          setStat(state, 'funds', state.stats.funds - CFG.blockadeFunds);
          setStat(state, 'heat', state.stats.heat + 3);
          setStat(state, 'acceptance', state.stats.acceptance + 1);
          state.metrics.blockades++;
          en = 'The blockade holds. ' + (tile.rail ? 'The coal rail' : 'The road') +
            ' is shut for ' + tile.blockade + ' days. Company income drops.';
          de = 'Die Blockade hält. ' + (tile.rail ? 'Die Kohlebahn' : 'Die Straße') +
            ' ist ' + tile.blockade + ' Tage dicht. Die Konzerneinnahmen sinken.';
          break;
        }
        case 'sabotage': {
          if (tile.policeCamp) {
            state.policeCampDown = 6;
            const freed = freeJailed(state, 99, report,
              'In the confusion of the dark camp, {crew} slips out through the fence.',
              'Im Durcheinander des dunklen Camps schlüpft {crew} durch den Zaun.');
            setStat(state, 'heat', state.stats.heat + 4);
            setStat(state, 'acceptance', state.stats.acceptance + 2);
            state.metrics.sabotage++;
            en = 'The forward camp goes dark: cut cables, a glue-soaked generator, floodlights pointing at the sky. The police will need days to get operational again.' +
              (freed.length ? ' In the chaos, ' + freed.length + ' prisoner(s) walk free.' : '');
            de = 'Das Vorwartscamp liegt im Dunkeln: durchtrennte Kabel, ein verklebter Generator, Flutlicht in den Himmel. Die Polizei braucht Tage, um wieder einsatzbereit zu sein.' +
              (freed.length ? ' Im Chaos kommen ' + freed.length + ' Gefangene frei.' : '');
            state.headlines.unshift({
              day: state.day,
              en: 'POLICE CAMP SABOTAGED — OPERATION STALLED.',
              de: 'POLIZEICAMP LAHMGEGLEGT — EINSATZ UNTERBROCHEN.'
            });
            break;
          }
          if (tile.pole) tile.poleDown = 3;
          else tile.machineDown = 3;
          setStat(state, 'funds', state.stats.funds - CFG.sabotageFunds);
          setStat(state, 'heat', state.stats.heat + 5);
          state.metrics.sabotage++;
          en = tile.pole
            ? 'A pylon leans into the fog. The line is dead for three days.'
            : 'A machine coughs, then stops. Repairs will cost the company dearly.';
          de = tile.pole
            ? 'Ein Mast neigt sich in den Nebel. Die Leitung ist drei Tage tot.'
            : 'Eine Maschine hustet und steht. Die Reparatur wird den Konzern teuer zu stehen kommen.';
          break;
        }
        case 'workshop': {
          const focus = plan.focus || 'organize';
          const focusName = FO.i18n ? FO.i18n.t('skill.' + focus) : focus;
          crew.skills[focus] = clamp((crew.skills[focus] || 0) + 2, 0, 7);
          const others = activeCrews(state).filter(function (c) { return c.id !== crew.id; });
          const mate = others.length ? pick(others) : null;
          if (mate) mate.skills[focus] = clamp((mate.skills[focus] || 0) + 1, 0, 7);
          setStat(state, 'energy', state.stats.energy + 3);
          setStat(state, 'acceptance', state.stats.acceptance + 1);
          en = 'Workshop day: ' + crew.name.en + ' trains ' + focusName + ' (+2)' +
            (mate ? ', ' + mate.name.en + ' learns alongside (+1).' : '.') +
            ' Knowledge is gear you cannot confiscate.';
          de = 'Workshoptag: ' + crew.name.de + ' trainiert ' + focusName + ' (+2)' +
            (mate ? ', ' + mate.name.de + ' lernt mit (+1).' : '.') +
            ' Wissen ist Material, das nicht beschlagnahmt werden kann.';
          break;
        }
        case 'network': {
          const v = villageOf(state, tile);
          if (v) {
            const gain = 10 + (crew.skills.organize || 0) * 2;
            v.support = clamp(v.support + gain, 0, 100);
            setStat(state, 'acceptance', state.stats.acceptance + 2);
            addResource(state, 'money', 2);
            if (v.support >= 60 && v.status !== 'ally') {
              v.status = 'ally';
              state.metrics.villagesAlly++;
              state.headlines.unshift({
                day: state.day,
                en: v.name.toUpperCase() + ' DECLARES SOLIDARITY WITH THE FOREST CAMP.',
                de: v.name.toUpperCase() + ' ERKLÄRT SOLIDARITÄT MIT DEM WALDCAMP.'
              });
              en = v.name + ' stands with you now. Kitchens, workshops, spare rooms, votes.';
              de = v.name + ' steht jetzt an eurer Seite. Küchen, Werkstätten, Gästezimmer, Stimmen.';
            } else {
              en = 'An evening in ' + v.name + ': tea, arguments, a door left open. Support grows to ' + v.support + '.';
              de = 'Ein Abend in ' + v.name + ': Tee, Diskussionen, eine offene Tür. Der Rückhalt wächst auf ' + v.support + '.';
            }
          }
          break;
        }
        case 'media': {
          setStat(state, 'media', state.stats.media + 4);
          setStat(state, 'acceptance', state.stats.acceptance + 3);
          setStat(state, 'heat', state.stats.heat - 2);
          en = 'The story gets out clean: the forest, the water, the people. The police hate being described accurately.';
          de = 'Die Geschichte kommt sauber heraus: der Wald, das Wasser, die Menschen. Die Polizei hasst genaue Beschreibungen.';
          break;
        }
        case 'fundraise': {
          const allies = alliedVillages(state).length;
          const gain = Math.round(6 + state.stats.acceptance * 0.18 + state.stats.media * 0.4 + allies * 2);
          addResource(state, 'money', gain);
          setStat(state, 'acceptance', state.stats.acceptance + 1);
          en = 'The donation tin comes back heavy: ' + gain + ' in notes and coins, plus a jar of jam.';
          de = 'Die Spendendose kommt schwer zurück: ' + gain + ' in Scheinen und Münzen, dazu ein Glas Marmelade.';
          break;
        }
        case 'reforest': {
          tile.reforestIn = 3;
          setStat(state, 'acceptance', state.stats.acceptance + 2);
          setStat(state, 'heat', state.stats.heat + 1);
          en = 'Saplings go into the raw ground. In three days this will be young forest again.';
          de = 'Setzlinge kommen in die rohe Erde. In drei Tagen ist hier wieder junger Wald.';
          break;
        }
        default: break;
      }
      repEntry(report, 'player', en, de);
      pushLog(state, 'player', en, de);
      return;
    }

    /* failures */
    switch (action.id) {
      case 'build':
        setStat(state, 'heat', state.stats.heat + 1);
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        setStat(state, 'energy', state.stats.energy - 3);
        en = 'The platform slips. Rope burns, wood splinters, and the company surveyor gets a good laugh.';
        de = 'Die Plattform rutscht. Seilbrand, Holzsplitter, und der Vermesser des Konzerns lacht.';
        break;
      case 'scout':
        setStat(state, 'heat', state.stats.heat + 1);
        en = 'A long walk, a broken boot and a security guard who follows the crew for an hour. Nothing found.';
        de = 'Ein langer Marsch, ein kaputter Stiefel und ein Wachmann, der der Gruppe eine Stunde folgt. Nichts gefunden.';
        break;
      case 'kitchen':
        addResource(state, 'food', -2);
        setStat(state, 'energy', state.stats.energy - 2);
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        en = 'The gas runs out halfway through the soup. People eat cold potatoes and quietly resent it.';
        de = 'Das Gas geht mitten in der Suppe aus. Es gibt kalte Kartoffeln und leisen Groll.';
        break;
      case 'demo':
        setStat(state, 'acceptance', state.stats.acceptance - 2);
        setStat(state, 'heat', state.stats.heat + 5);
        setStat(state, 'size', state.stats.size - 1);
        en = 'Police block the route before the demo starts. The crowd scatters into side streets and frustration.';
        de = 'Die Polizei blockiert die Route, bevor die Demo beginnt. Die Menge zerstreut sich in Seitenstraßen und Frust.';
        maybeArrest(state, crew, 14, report);
        break;
      case 'blockade':
        setStat(state, 'heat', state.stats.heat + 4);
        addResource(state, 'gear', -2);
        en = 'Security pulls the blockade apart before noon. The gear is gone and the route is open again.';
        de = 'Die Security reißt die Blockade vor Mittag ab. Das Material ist weg, die Route wieder offen.';
        maybeArrest(state, crew, 16, report);
        break;
      case 'sabotage':
        setStat(state, 'heat', state.stats.heat + 7);
        addResource(state, 'gear', -1);
        en = 'A floodlight snaps on. The crew runs. The machine is still running, and now there is a camera photo.';
        de = 'Ein Flutlicht geht an. Die Gruppe rennt. Die Maschine läuft noch, und jetzt gibt es ein Kamerafoto.';
        maybeArrest(state, crew, 32, report);
        break;
      case 'workshop':
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        en = 'Nobody agrees on what to learn. Three hours of arguing about facilitation methods.';
        de = 'Niemand einigt sich, was gelernt werden soll. Drei Stunden Diskussion über Moderationsmethoden.';
        break;
      case 'bulk':
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        en = 'The big order goes wrong: a closed wholesale gate and a van that will not start. Some of it still arrives.';
        de = 'Die Großbestellung geht schief: ein geschlossenes Großmarkt-Tor und ein Van, der nicht anspringt. Einiges kommt trotzdem an.';
        break;
      case 'network': {
        const v = villageOf(state, tile);
        if (v) v.support = clamp(v.support + 2, 0, 100);
        setStat(state, 'heat', state.stats.heat + 1);
        en = 'The village meeting turns hostile. Someone repeats a company talking point, and the room turns cold.';
        de = 'Der Dorfabend wird feindselig. Jemand wiederholt einen Konzern-Slogan, und der Raum wird kalt.';
        break;
      }
      case 'media':
        setStat(state, 'acceptance', state.stats.acceptance - 2);
        setStat(state, 'media', state.stats.media - 1);
        setStat(state, 'heat', state.stats.heat + 1);
        en = 'The interview goes badly. One sentence is cut into a soundbite that makes the camp look ridiculous.';
        de = 'Das Interview läuft schlecht. Ein Satz wird zu einem O-Ton geschnitten, der das Camp lächerlich macht.';
        break;
      case 'fundraise':
        addResource(state, 'money', 1);
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        en = 'A wet afternoon at the market. One euro fifty, two dirty looks and a very long story from a man with a dog.';
        de = 'Ein nasser Nachmittag am Markt. Ein Euro fünfzig, zwei böse Blicke und eine sehr lange Geschichte von einem Mann mit Hund.';
        break;
      case 'reforest':
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        en = 'The saplings are the wrong species for this soil. Half will not survive the week.';
        de = 'Die Setzlinge passen nicht zu diesem Boden. Die Hälfte überlebt die Woche nicht.';
        break;
      default:
        en = 'The plan does not survive contact with the day.';
        de = 'Der Plan überlebt den Tag nicht.';
    }
    repEntry(report, 'player-bad', en, de);
    pushLog(state, 'bad', en, de);
  }

  function resolveAssignments(state, report) {
    const plans = Object.keys(state.assignments || {}).map(function (id) { return state.assignments[id]; });
    plans.forEach(function (plan) {
      const crew = crewById(state, plan.crewId);
      if (!crew || crew.removed || crew.arrested) return;
      resolveAction(state, crew, plan, report);
    });
    state.assignments = {};
    activeCrews(state).forEach(function (c) { c.assigned = null; });
  }

  /* ---------------- night: economy / forest ---------------- */
  function companyIncome(state) {
    let mines = 0;
    let plants = 0;
    let blocked = 0;
    state.tiles.forEach(function (t) {
      if (t.terrain === 'mine') {
        if (t.machineDown > 0 || t.blockade > 0) blocked++;
        else mines++;
      }
      if (t.terrain === 'plant' && t.machineDown <= 0) plants++;
      if ((t.rail || t.road) && t.blockade > 0) blocked++;
    });
    let income = CFG.companyIncomeBase + mines * CFG.companyIncomePerMine + plants * 1.4;
    income -= blocked * 1.6;
    income -= CFG.companyUpkeep;
    if (state.policies.minePermit) income += 1.5;
    if (state.policies.road) income += 0.8;
    income *= (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    return Math.round(income * 10) / 10;
  }

  function nightEconomy(state, report) {
    const allies = alliedVillages(state);
    const people = totalPeople(state);
    let need = Math.ceil(people * CFG.dailyFoodPerPerson) - allies.length;
    need = Math.max(1, need);
    let shortage = 0;
    if (state.resources.food >= need) {
      addResource(state, 'food', -need);
    } else {
      shortage = need - state.resources.food;
      state.resources.food = 0;
      setStat(state, 'energy', state.stats.energy - (1 + Math.min(shortage, 8) * 1.2));
      setStat(state, 'acceptance', state.stats.acceptance - 1);
      repEntry(report, 'bad',
        'The kitchen runs out of food. ' + shortage + ' portions are missing. People get quiet.',
        'Der Küche geht das Essen aus. ' + shortage + ' Portionen fehlen. Die Leute werden still.');
    }
    const donations = Math.max(0, Math.round(
      state.stats.acceptance * CFG.donationPerAcceptance + allies.length * 3 + state.stats.media * 0.15
    ));
    addResource(state, 'money', donations);
    repEntry(report, 'night',
      'Daily upkeep: ' + need + ' food eaten, ' + donations + ' in donations collected' +
        (allies.length ? ', ' + allies.length + ' allied village(s) helping.' : '.'),
      'Täglicher Unterhalt: ' + need + ' Essen verbraucht, ' + donations + ' Spenden gesammelt' +
        (allies.length ? ', ' + allies.length + ' verbündete Dörfer helfen.' : '.'));

    let energyDelta = -CFG.energyNightDecay;
    energyDelta += Math.round((totalCrewEnergy(state) - 50) / 10);
    if (allies.length) energyDelta += 1;
    if (state.stats.acceptance >= 60) energyDelta += 1;
    if (state.stats.heat >= 70) energyDelta -= 2;
    if (shortage) energyDelta -= 2;
    setStat(state, 'energy', state.stats.energy + energyDelta);

    // crews sleep: everyone recovers overnight, allied villages cook for the camp
    const sleepBonus = allies.length ? CFG.crewNightRecovery + CFG.crewAllyRecovery : CFG.crewNightRecovery;
    activeCrews(state).forEach(function (c) {
      c.energy = clamp(c.energy + (shortage ? Math.ceil(sleepBonus / 2) : sleepBonus), 0, 100);
    });
    if (energyDelta < -3) {
      repEntry(report, 'bad', 'The camp is running on fumes. People need rest and a real meal.',
        'Das Camp läuft auf Reserve. Die Leute brauchen Ruhe und eine echte Mahlzeit.');
    }

    let heatDelta = -1;
    if (state.policies.policeFunding) heatDelta += state.policies.policeFunding * 0.4;
    setStat(state, 'heat', state.stats.heat + heatDelta);
    if (state.day % 2 === 0) {
      const media = state.stats.media;
      if (media > 5) setStat(state, 'media', media - 1);
      else if (media < 5) setStat(state, 'media', media + 1);
    }
    if (state.stats.heat > 70) {
      setStat(state, 'acceptance', state.stats.acceptance - 1);
    }
  }

  function nightLogging(state, report) {
    const enemy = (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    let pressure = enemy * (0.5 + (state.policies.road ? 0.2 : 0) + (state.policies.minePermit ? 0.12 : 0));
    let cuts = 0;
    if (rnd() < pressure) cuts = 1;
    if (rnd() < pressure * 0.22) cuts++;
    if (state.day % 7 === 0) cuts++;
    if (!cuts) return;

    let felled = 0;
    let ancient = 0;
    for (let i = 0; i < cuts; i++) {
      const options = frontierForest(state);
      if (!options.length) break;
      const candidates = options.filter(function (t) {
        return t.logging > 0 || S.neighborsOf(state, t).some(function (n) { return n.logging > 0; });
      });
      const tile = pick(candidates.length ? candidates : options);
      const res = cutTile(state, tile);
      if (res) {
        felled++;
        if (res.wasAncient) ancient++;
        S.neighborsOf(state, tile).forEach(function (n) {
          if (n.terrain === 'forest' || n.terrain === 'ancient') n.logging = 1;
        });
      }
    }
    if (!felled) return;
    const pct = S.forestPct(state);
    repEntry(report, 'bad',
      felled + ' tree(s) fell in the night. The logging front moves closer. Forest standing: ' + pct + '%.' +
        (ancient ? ' Some of it was old growth.' : ''),
      felled + ' Baum/Bäume sind in der Nacht gefallen. Die Abholzungsfront rückt näher. Waldbestand: ' + pct + '%.' +
        (ancient ? ' Ein Teil war Urwald.' : ''));
    pushLog(state, 'bad',
      felled + ' trees were cut at the logging front.',
      felled + ' Bäume wurden an der Abholzungsfront gefällt.');
  }

  function nightMine(state, report) {
    if (state.day % 3 !== 0 && !state.policies.minePermit) return;
    if (rnd() > 0.55) return;
    const clearcuts = state.tiles.filter(function (t) {
      if (t.terrain !== 'clearcut' || t.occupied > 0 || t.road || t.rail) return false;
      return S.neighborsOf(state, t).some(function (n) { return n.terrain === 'mine'; });
    });
    if (!clearcuts.length) return;
    const tile = pick(clearcuts);
    tile.terrain = 'mine';
    tile.mine = true;
    repEntry(report, 'bad',
      'The open-pit mine swallows another stretch of cleared land. The excavators are never satisfied.',
      'Der Tagebau schluckt ein weiteres Stück Kahlfläche. Die Bagger sind nie satt.');
    state.headlines.unshift({
      day: state.day,
      en: 'MINE EXPANDS AGAIN. Company calls it "site optimisation".',
      de: 'TAGEBAU WÄCHST ERNEUT. Konzern nennt es "Standortoptimierung".'
    });
  }

  function nightVillages(state, report) {
    state.villages.forEach(function (v) {
      if (v.status === 'expropriated') return;
      if (v.status === 'ally') {
        v.support = clamp(v.support + 1, 0, 100);
      } else if (state.day % 2 === 0) {
        v.support = clamp(v.support - 1, 0, 100);
        if (v.support >= 60) {
          v.status = 'ally';
          state.metrics.villagesAlly++;
          repEntry(report, 'good', v.name + ' declares solidarity with the camp.',
            v.name + ' erklärt sich solidarisch mit dem Camp.');
        }
      }
      if (v.status !== 'expropriated' && v.support <= 8 && state.day > 10 &&
        state.stats.acceptance < 35 && rnd() < 0.1) {
        v.status = 'expropriated';
        v.tiles.forEach(function (id) {
          const t = S.tileById(state, id);
          if (t) t.terrain = 'ghost';
        });
        state.policies.expropriated.push(v.name);
        setStat(state, 'acceptance', state.stats.acceptance - 2);
        setStat(state, 'heat', state.stats.heat + 1);
        repEntry(report, 'bad',
          v.name + ' is expropriated. The houses stand empty behind orange fencing.',
          v.name + ' wird enteignet. Die Häuser stehen leer hinter orangefarbenem Bauzaun.');
      }
    });
  }

  function nightPolice(state, report) {
    if (!occupiedCount(state)) return;
    const enemy = (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    const since = state.day - (state.flags.lastRaidDay || 0);
    if (since < 2) return;

    // police build a forward camp when the heat stays high
    if (!state.policeCampId && state.stats.heat >= 50) {
      const campChance = 0.1 + (state.stats.heat - 50) * 0.008 +
        (state.policies.policeFunding || 0) * 0.05;
      if (rnd() < campChance) {
        const spots = state.tiles.filter(function (t) {
          return !t.occupied && !t.policeCamp && !t.villageId &&
            (t.terrain === 'company' || t.terrain === 'plant' || t.terrain === 'mine' ||
              t.rail || t.road || t.roadProject);
        });
        if (spots.length) {
          const spot = pick(spots);
          spot.policeCamp = true;
          spot.police = 2;
          state.policeCampId = spot.id;
          state.headlines.unshift({
            day: state.day,
            en: 'POLICE SET UP FORWARD CAMP IN ' + state.player.forest.toUpperCase() + '.',
            de: 'POLIZEI RICHTET VORWARTSCAMP IN ' + state.player.forest.toUpperCase() + ' EIN.'
          });
          repEntry(report, 'bad',
            'Blue tents and floodlights on the ' + (spot.terrain === 'mine' ? 'mine' : 'company ground') +
              ': the police have built a forward camp. Their raids will be faster and closer now. Sabotage could shut it down.',
            'Blaue Zelte und Flutlicht: Die Polizei hat ein Vorwartscamp gebaut. Ihre Einsätze werden jetzt schneller und näher. Sabotage könnte es lahmlegen.');
          pushLog(state, 'bad', 'Police forward camp established.', 'Polizeiliches Vorwartscamp errichtet.');
        }
      }
    }

    const campTile = state.policeCampId ? S.tileById(state, state.policeCampId) : null;
    const campActive = !!(campTile && campTile.policeCamp && !state.policeCampDown);
    if (campActive) campTile.police = 2;

    let chance = CFG.raidBaseChance * (0.35 + state.stats.heat / 100) * enemy +
      (state.policies.policeFunding || 0) * 0.035 +
      (campActive ? 0.09 : 0);
    if (state.stats.heat < 20) chance *= 0.5;

    // a quiet period can make the camp pack up
    if (campTile && campTile.policeCamp && state.stats.heat < 25 && rnd() < 0.3) {
      campTile.policeCamp = false;
      campTile.police = 0;
      state.policeCampId = null;
      state.policeCampDown = 0;
      setStat(state, 'acceptance', state.stats.acceptance + 1);
      repEntry(report, 'good',
        'The police forward camp is gone — the blue tents were struck overnight. The forest road is ours again.',
        'Das polizeiliche Vorwartscamp ist weg — die blauen Zelte wurden über Nacht abgebaut. Die Waldstraße ist wieder unsere.');
    }

    if (rnd() > chance) return;

    state.flags.lastRaidDay = state.day;
    setStat(state, 'heat', state.stats.heat + 2);
    const targets = S.occupiedTiles(state).slice().sort(function (a, b) {
      if (!campActive) return 0;
      const na = S.neighborsOf(state, campTile).some(function (n) { return n.id === a.id; }) ? 0 : 1;
      const nb = S.neighborsOf(state, campTile).some(function (n) { return n.id === b.id; }) ? 0 : 1;
      return na - nb;
    });
    const count = Math.min(targets.length, 1 + (state.stats.heat >= 70 ? 1 : 0));
    let evictions = 0;
    for (let i = 0; i < count; i++) {
      const tile = targets[i];
      if (!tile || tile.occupied <= 0) continue;
      const allies = S.neighborsOf(state, tile).some(function (n) {
        const v = S.villageOfTile(state, n);
        return v && v.status === 'ally';
      });
      const defense = tile.occupied * 9 + state.stats.acceptance * 0.35 +
        tile.court * 25 + (allies ? 8 : 0);
      const evictChance = clamp(45 + state.stats.heat * 0.35 - defense + (enemy - 1) * 20, 8, 92);
      if (rnd() * 100 < evictChance) {
        const name = tile.barrio ? tile.barrio.name : 'A barrio';
        evictTile(state, tile);
        evictions++;
        repEntry(report, 'bad',
          'Police evict the barrio "' + name + '". Platforms are torn down, people are pushed off the road.',
          'Die Polizei räumt das Barrio "' + name + '". Plattformen werden abgerissen, Menschen von der Straße gedrängt.');
        if (rnd() < 0.35) {
          const victim = pick(activeCrews(state).filter(function (c) { return !c.arrested; }));
          if (victim) {
            arrestCrew(state, victim, 2);
            if (report) report.arrests = (report.arrests || 0) + 1;
            repEntry(report, 'bad', victim.name.en + ' is arrested during the eviction.',
              victim.name.de + ' wird bei der Räumung festgenommen.');
          }
        }
      } else {
        const name = tile.barrio ? tile.barrio.name : 'A barrio';
        repEntry(report, 'good',
          'Police try to clear "' + name + '" — and fail. Neighbours, lawyers and locked-on bodies hold the line.',
          'Die Polizei versucht, "' + name + '" zu räumen — und scheitert. Nachbarschaft, Anwält*innen und angeschlossene Körper halten die Linie.');
        tile.police = clamp(tile.police + 1, 0, 3);
      }
    }
    if (report) report.evictions = (report.evictions || 0) + evictions;
    if (!evictions) {
      setStat(state, 'acceptance', state.stats.acceptance + 1);
    }
    state.headlines.unshift({
      day: state.day,
      en: evictions ? 'POLICE CLEAR CAMP IN ' + state.player.forest.toUpperCase() + '.' :
        'EVICTION FAILS: CAMP HOLDS THE LINE.',
      de: evictions ? 'POLIZEI RÄUMT CAMP IN ' + state.player.forest.toUpperCase() + '.' :
        'RÄUMUNG GESCHEITERT: CAMP HÄLT DIE STELLUNG.'
    });
  }

  function nightCompany(state, report) {
    const enemy = (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    const p = 0.4 * enemy + (state.stats.funds < 60 ? 0.12 : 0);
    if (rnd() > p) return;
    const ops = ['pr', 'bribe', 'lawsuit'];
    if (!state.flags.falseFlagSeen && state.day > 8) ops.push('falseflag', 'falseflag');
    if (state.stats.acceptance > 55) ops.push('smear');
    const op = pick(ops);
    if (op === 'pr') {
      setStat(state, 'media', state.stats.media - 2);
      setStat(state, 'acceptance', state.stats.acceptance - 1);
      repEntry(report, 'bad',
        'A company PR campaign runs full-page ads: "We care about the forest." They planted a tree in a car park.',
        'Eine PR-Kampagne des Konzerns schaltet ganzseitige Anzeigen: "Wir lieben den Wald." Gepflanzt wurde ein Baum auf einem Parkplatz.');
    } else if (op === 'bribe') {
      const targets = state.villages.filter(function (v) {
        return v.status !== 'expropriated' && v.status !== 'ally';
      });
      if (targets.length) {
        const v = pick(targets);
        v.support = clamp(v.support - 7, 0, 100);
        repEntry(report, 'bad',
          'Company "community liaisons" visit ' + v.name + '. A new football kit, a sponsorship, a lot of doubts.',
          '"Bürgerdialog"-Leute des Konzerns besuchen ' + v.name + '. Neue Trikots, ein Sponsoring, viele Zweifel.');
      }
    } else if (op === 'falseflag') {
      setStat(state, 'acceptance', state.stats.acceptance - 3);
      setStat(state, 'heat', state.stats.heat + 3);
      state.flags.falseFlagSeen = true;
      repEntry(report, 'bad',
        'Someone sprays slogans on a company wall in your name. The paint is fresh, the photographer is early, the story is ready.',
        'Jemand sprüht in eurem Namen Parolen an eine Konzernwand. Die Farbe ist frisch, der Fotograf früh, die Story fertig.');
      state.headlines.unshift({
        day: state.day,
        en: 'VANDALISM AT COMPANY SITE: "ACTIVISTS" LEAVE PAINT AND A PERFECT PRESS RELEASE.',
        de: 'VANDALISMUS AM KONZERNGELÄNDE: "AKTIVIST*INNEN" HINTERLASSEN FARBE UND EINE PERFEKTE PRESSEMITTEILUNG.'
      });
    } else if (op === 'lawsuit') {
      const protectedTiles = S.occupiedTiles(state).filter(function (t) { return t.court > 0; });
      if (protectedTiles.length) {
        const tile = pick(protectedTiles);
        tile.court = 0;
        repEntry(report, 'bad',
          'The company wins an appeal. Court protection for one barrio is lifted.',
          'Der Konzern gewinnt eine Berufung. Der Gerichtsschutz für ein Barrio wird aufgehoben.');
      } else {
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        repEntry(report, 'bad',
          'A company lawsuit names the camp as a "commercial nuisance". The lawyers are already billing hours.',
          'Eine Klage des Konzerns nennt das Camp eine "gewerbliche Störung". Die Anwält*innen schreiben schon Stunden.');
      }
    } else if (op === 'smear') {
      setStat(state, 'acceptance', state.stats.acceptance - 3);
      setStat(state, 'media', state.stats.media - 1);
      repEntry(report, 'bad',
        'A coordinated smear campaign calls the camp "privileged radicals". Three talk shows repeat it without checking.',
        'Eine koordinierte Schmutzkampagne nennt das Camp "privilegierte Radikale". Drei Talkshows wiederholen es ungeprüft.');
    }
  }

  function nightPolitics(state, report) {
    if (!state.policies.demoBan && state.stats.heat >= 55 && state.day >= 6 && rnd() < 0.35) {
      state.policies.demoBan = true;
      repEntry(report, 'bad',
        'The interior ministry bans "unauthorised forest assemblies". Demos are now illegal.',
        'Das Innenministerium verbietet "nicht genehmigte Waldversammlungen". Demos sind jetzt illegal.');
      state.headlines.unshift({
        day: state.day,
        en: 'DEMONSTRATION BAN DECLARED FOR THE FOREST DISTRICT.',
        de: 'DEMONSTRATIONSVERBOT FÜR DEN WALDKREIS VERHÄNGT.'
      });
    } else if (state.policies.demoBan && state.stats.heat < 30 && rnd() < 0.2) {
      state.policies.demoBan = false;
      repEntry(report, 'good',
        'A court overturns the demonstration ban. People can march again.',
        'Ein Gericht hebt das Demonstrationsverbot auf. Menschen dürfen wieder marschieren.');
    }
    if (!state.policies.minePermit && state.day >= 14 && rnd() < 0.14) {
      state.policies.minePermit = true;
      repEntry(report, 'bad',
        'The regional government grants a mine expansion permit. The map has already been redrawn.',
        'Die Landesregierung erteilt eine Genehmigung zur Tagebauerweiterung. Die Karte wurde bereits neu gezeichnet.');
    }
    if ((state.policies.policeFunding || 0) < 3 && state.stats.heat >= 60 && rnd() < 0.3) {
      state.policies.policeFunding = (state.policies.policeFunding || 0) + 1;
      repEntry(report, 'bad',
        'The police budget for "forest operations" is increased. More buses, more overtime, more helmets.',
        'Das Polizeibudget für "Wald-Einsätze" wird erhöht. Mehr Busse, mehr Überstunden, mehr Helme.');
    }
    if (state.flags.roadProjectActive && state.day >= 9 && rnd() < 0.22) {
      const strips = state.tiles.filter(function (t) {
        return t.roadProject && t.occupied <= 0 && t.blockade <= 0;
      });
      if (strips.length) {
        const tile = pick(strips);
        tile.roadProject = false;
        tile.road = true;
        if (!tile.rail) tile.terrain = 'clearcut';
        state.metrics.forestLost++;
        repEntry(report, 'bad',
          'The road corridor advances. Another strip of forest becomes gravel and a survey line.',
          'Der Straßenkorridor rückt vor. Ein weiterer Waldstreifen wird Schotter und Vermessungslinie.');
      }
    }
  }

  function nightInfiltrator(state, report) {
    const enemy = (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    const infs = state.crews.filter(function (c) { return c.inf && !c.removed; });
    infs.forEach(function (c) {
      if (rnd() < 0.3) c.suspicion = clamp(c.suspicion + 1, 0, 5);
      if (rnd() < 0.14 * enemy) {
        setStat(state, 'heat', state.stats.heat + 2);
        addResource(state, 'gear', -1);
        setStat(state, 'acceptance', state.stats.acceptance - 1);
        repEntry(report, 'bad',
          'Plans leaked. The company knew where the crew would be. Nothing is where it was supposed to be.',
          'Pläne sind durchgesickert. Der Konzern wusste, wo die Gruppe sein würde. Nichts ist, wo es sein sollte.');
        pushLog(state, 'bad', 'Plans leaked to the company.', 'Pläne sind an den Konzern durchgesickert.');
      }
    });
  }

  function nightRecruit(state, report) {
    state.recruitIndex = state.recruitIndex || 0;
    let added = 0;
    while (state.recruitIndex < CFG.recruitAt.length &&
      state.stats.size >= CFG.recruitAt[state.recruitIndex] &&
      activeCrews(state).length < CFG.maxCrews) {
      const used = state.crews.map(function (c) { return c.name.en; });
      const options = FO.CREW_NAMES.filter(function (n) { return used.indexOf(n.en) === -1; });
      const def = options.length ? pick(options) : pick(FO.CREW_NAMES);
      const ids = state.crews.map(function (c) { return parseInt(c.id.replace('crew', ''), 10) || 0; });
      const id = 'crew' + (Math.max.apply(null, ids) + 1);
      const infChance = state.difficulty === 'hard' ? 0.24 : (state.difficulty === 'easy' ? 0.07 : 0.14);
      const isInf = infs(state) < 2 && rnd() < infChance;
      const crew = {
        id: id,
        name: { en: def.en, de: def.de },
        size: 2 + Math.floor(rnd() * 3),
        energy: 72 + Math.floor(rnd() * 24),
        skills: {
          build: Math.floor(rnd() * 3),
          climb: Math.floor(rnd() * 3),
          organize: Math.floor(rnd() * 3),
          media: Math.floor(rnd() * 3),
          sabotage: Math.floor(rnd() * 3)
        },
        inf: isInf,
        knownInf: false,
        suspicion: 0,
        assigned: null,
        arrested: false
      };
      state.crews.push(crew);
      state.recruitIndex++;
      added++;
      repEntry(report, 'good', 'A new crew joins the camp: ' + def.en + ' (' + crew.size + ' people).',
        'Eine neue Gruppe stößt zum Camp: ' + def.de + ' (' + crew.size + ' Menschen).');
    }
    if (added) {
      state.headlines.unshift({
        day: state.day,
        en: 'CAMP GROWS: ' + added + ' NEW CREW(S) JOIN THE RESISTANCE.',
        de: 'CAMP WÄCHST: ' + added + ' NEUE GRUPPE(N) STOSSEN ZUM WIDERSTAND.'
      });
    }
  }

  function infs(state) {
    return state.crews.filter(function (c) { return c.inf && !c.removed; }).length;
  }

  function nightTimers(state, report) {
    let blockadesEnded = 0;
    let regrown = 0;
    let matured = 0;
    state.tiles.forEach(function (t) {
      if (t.blockade > 0) {
        t.blockade--;
        if (t.blockade === 0) blockadesEnded++;
      }
      if (t.poleDown > 0) t.poleDown--;
      if (t.machineDown > 0) t.machineDown--;
      if (t.court > 0) t.court--;
      if (t.reforestIn > 0) {
        t.reforestIn--;
        if (t.reforestIn === 0) {
          t.terrain = 'young';
          t.young = true;
          t.youngDays = 0;
          t.reforestIn = 0;
          regrown++;
        }
      } else if (t.young) {
        t.youngDays = (t.youngDays || 0) + 1;
        if (t.youngDays >= 6) {
          t.terrain = 'forest';
          t.young = false;
          t.youngDays = 0;
          matured++;
        }
      }
      if (t.police > 0 && state.day % 3 === 0 && !t.policeCamp) t.police--;
    });
    if (state.policeCampDown > 0) {
      state.policeCampDown--;
      if (state.policeCampDown === 0 && state.policeCampId) {
        repEntry(report, 'bad',
          'The police forward camp is running again. The floodlights are back on.',
          'Das polizeiliche Vorwartscamp läuft wieder. Das Flutlicht ist wieder an.');
      }
    }
    if (blockadesEnded) {
      repEntry(report, 'night', blockadesEnded + ' blockade(s) ended. The company moves again.',
        blockadesEnded + ' Blockade(n) beendet. Der Konzern bewegt sich wieder.');
    }
    if (regrown) {
      setStat(state, 'acceptance', state.stats.acceptance + 1);
      repEntry(report, 'good', regrown + ' patch(es) of cleared land are young forest again.',
        regrown + ' Kahlfläche(n) sind wieder junger Wald.');
    }
    if (matured) {
      repEntry(report, 'good', matured + ' young forest patch(es) have grown into real forest — ready for new barrios.',
        matured + ' Fläche(n) mit jungem Wald sind echter Wald geworden — bereit für neue Barrios.');
    }
    activeCrews(state).forEach(function (c) {
      if (c.arrested && state.day >= (c.returnDay || 0)) {
        c.arrested = false;
        c.returnDay = 0;
        c.energy = Math.max(c.energy, 55);
        repEntry(report, 'good', c.name.en + ' is released from custody.',
          c.name.de + ' wird aus der Haft entlassen.');
      }
    });
  }

  function nightHeadlines(state, report) {
    const n = 1 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const h = pick(FO.HEADLINES);
      state.headlines.unshift({ day: state.day, en: h.en, de: h.de });
    }
    state.headlines = state.headlines.slice(0, 40);
    if (state.stats.funds < 45 && state.stats.funds > 0) {
      state.headlines.unshift({
        day: state.day,
        en: 'COMPANY SHARES SLIDE. "Temporary market headwinds," says CEO.',
        de: 'KONZERNAKTIEN FALLEN. "Vorübergehende Marktgegenwinde", sagt der CEO.'
      });
    }
    if (report) report.headlines = state.headlines.slice(0, 4);
  }

  function nightUnassigned(state, report) {
    let rested = 0;
    activeCrews(state).forEach(function (c) {
      if (c.arrested) return;
      if (!c.assigned) {
        c.energy = clamp(c.energy + 4, 0, 100);
        rested++;
      }
    });
    if (rested) {
      repEntry(report, 'night',
        rested + ' crew(s) had no plan and got some sleep. The camp is quiet.',
        rested + ' Gruppe(n) hatten keinen Plan und konnten schlafen. Das Camp ist still.');
    }
  }

  function nightPhase(state, report) {
    nightTimers(state, report);
    nightUnassigned(state, report);
    nightEconomy(state, report);
    nightLogging(state, report);
    nightMine(state, report);
    nightVillages(state, report);
    nightPolice(state, report);
    nightCompany(state, report);
    nightPolitics(state, report);
    nightInfiltrator(state, report);
    nightRecruit(state, report);
    if (state.stats.funds > 0) {
      const income = companyIncome(state);
      setStat(state, 'funds', state.stats.funds + income);
      repEntry(report, 'night',
        'The company books: ' + (income >= 0 ? '+' : '') + income + ' after sabotage, blockades and upkeep. Funds now ' + Math.round(state.stats.funds) + '.',
        'Die Konzernbilanz: ' + (income >= 0 ? '+' : '') + income + ' nach Sabotage, Blockaden und Betriebskosten. Kasse jetzt ' + Math.round(state.stats.funds) + '.');
      if (state.stats.funds < 40) {
        repEntry(report, 'good', 'The company is bleeding money. Keep the pressure on.',
          'Der Konzern blutet Geld. Haltet den Druck hoch.');
      }
    }
    if (state.stats.funds <= 0) state.stats.funds = 0;
    nightHeadlines(state, report);
  }

  /* ---------------- endings ---------------- */
  function makeEnding(state, key) {
    return {
      key: key,
      day: state.day,
      forest: S.forestPct(state),
      acceptance: Math.round(state.stats.acceptance),
      funds: Math.round(state.stats.funds),
      supporters: Math.round(state.stats.size),
      barrios: S.occupiedTiles(state).length
    };
  }

  function evaluateEnding(state) {
    const pct = S.forestPct(state);
    if (state.stats.funds <= 0) return makeEnding(state, 'victoryRetreat');
    if (pct <= 4) return makeEnding(state, 'forestGone');
    if (state.stats.acceptance <= 0 || state.stats.energy <= 0) return makeEnding(state, 'collapse');
    if (S.occupiedTiles(state).length === 0 && state.day > 3) return makeEnding(state, 'collapse');
    if (state.day > CFG.maxDays) {
      if (pct >= CFG.forestGoal && state.stats.acceptance >= CFG.acceptanceGoal) {
        return makeEnding(state, 'victoryMoratorium');
      }
      if (pct >= 45 && state.stats.acceptance >= 40) return makeEnding(state, 'partial');
      if (pct >= 30 && state.stats.acceptance >= 50) return makeEnding(state, 'tooComfortable');
      return makeEnding(state, 'timeUp');
    }
    return null;
  }

  /* ---------------- end of day ---------------- */
  function endDay(state) {
    if (!canEndDay(state)) return null;
    state.phase = 'resolve';
    const before = S.snapshot(state);
    const report = {
      day: state.day,
      entries: [],
      arrests: 0,
      evictions: 0,
      before: before,
      after: null,
      headlines: []
    };
    resolveAssignments(state, report);
    nightPhase(state, report);
    state.day += 1;
    const ending = evaluateEnding(state);
    report.after = S.snapshot(state);
    state.report = report;
    if (ending) {
      state.ending = ending;
      state.phase = 'over';
      report.ending = ending;
    } else {
      state.phase = 'plan';
      nextEvent(state);
      if (state.pendingEvent) state.phase = 'event';
    }
    save(state);
    return report;
  }

  /* ---------------- events ---------------- */
  function eventChance(state, option) {
    if (option.chance === undefined) return 100;
    const skill = option.check;
    let best = 0;
    activeCrews(state).forEach(function (c) {
      const v = c.skills[skill] || 0;
      if (v > best) best = v;
    });
    let c = option.chance + (best - 2) * 5 + (state.stats.acceptance - 40) * 0.2 +
      (state.stats.media - 5) * 0.7;
    c -= Math.max(0, state.stats.heat - 60) * 0.2;
    return Math.round(clamp(c, 8, 95));
  }

  function eventEligible(state, e) {
    if (!e.when) return true;
    try { return !!e.when(state); } catch (err) { return false; }
  }

  function pickEvent(state) {
    const once = FO.EVENTS.filter(function (e) {
      return e.once && !state.usedEventIds[e.id] && e.day <= state.day && eventEligible(state, e);
    }).sort(function (a, b) { return a.day - b.day; });
    if (once.length) {
      const firstDay = once[0].day;
      const tied = once.filter(function (e) { return e.day === firstDay; });
      return pick(tied);
    }
    const repeat = FO.EVENTS.filter(function (e) {
      if (e.once || e.day > state.day || !eventEligible(state, e)) return false;
      const last = state.seenEvents[e.id];
      return last === undefined || state.day - last >= 4;
    });
    if (!repeat.length) return null;
    if (rnd() > 0.7) return null;
    let total = 0;
    repeat.forEach(function (e) { total += (e.weight || 3); });
    let roll = rnd() * total;
    for (let i = 0; i < repeat.length; i++) {
      roll -= (repeat[i].weight || 3);
      if (roll <= 0) return repeat[i];
    }
    return repeat[repeat.length - 1];
  }

  function nextEvent(state) {
    if (state.pendingEvent && FO.EVENT_BY_ID[state.pendingEvent]) {
      state.phase = 'event';
      return FO.EVENT_BY_ID[state.pendingEvent];
    }
    if (state.ending) return null;
    const event = pickEvent(state);
    if (!event) {
      state.pendingEvent = null;
      state.phase = 'plan';
      return null;
    }
    state.pendingEvent = event.id;
    state.usedEventIds[event.id] = true;
    state.seenEvents[event.id] = state.day;
    state.phase = 'event';
    return event;
  }

  function applyEventSpecial(state, event) {
    if (event.id === 'road_project') {
      state.flags.roadProjectActive = true;
      state.flags.roadAnnounced = true;
      state.policies.road = true;
    }
  }

  function chooseEventOption(state, index) {
    const event = state.pendingEvent ? FO.EVENT_BY_ID[state.pendingEvent] : null;
    if (!event || !event.options || !event.options[index]) return null;
    const option = event.options[index];
    const chance = eventChance(state, option);
    const isCheck = option.chance !== undefined;
    const success = !isCheck || rnd() * 100 < chance;
    const before = S.snapshot(state);
    let chips = applyEffects(state, option.effects);
    if (isCheck) {
      const branch = success ? option.success : option.fail;
      chips = chips.concat(applyEffects(state, branch));
    }
    applyEventSpecial(state, event);
    const result = isCheck
      ? (success ? option.successResult : option.failResult)
      : option.result;
    const tone = !isCheck ? 'player' : (success ? 'good' : 'bad');
    if (result) {
      repEntry({ entries: state.log }, tone, result.en, result.de);
      state.log.push({ day: state.day, type: tone, en: result.en, de: result.de });
    }
    state.pendingEvent = null;
    state.phase = state.ending ? 'over' : 'plan';
    state.seenEvents[event.id] = state.day;
    save(state);
    return {
      event: event,
      option: option,
      success: success,
      chance: chance,
      isCheck: isCheck,
      result: result,
      chips: chips,
      before: before,
      after: S.snapshot(state)
    };
  }

  /* ---------------- forecast ---------------- */
  function forecast(state) {
    const out = [];
    const allies = alliedVillages(state).length;
    const people = totalPeople(state);
    const need = Math.max(1, Math.ceil(people * CFG.dailyFoodPerPerson) - allies);
    out.push({
      en: 'Food: about ' + need + ' portions will be eaten. You have ' + Math.floor(state.resources.food) + '.',
      de: 'Essen: etwa ' + need + ' Portionen werden gebraucht. Vorhanden: ' + Math.floor(state.resources.food) + '.',
      tone: state.resources.food < need ? 'bad' : 'neutral'
    });
    const donations = Math.max(0, Math.round(state.stats.acceptance * CFG.donationPerAcceptance + allies * 3 + state.stats.media * 0.15));
    out.push({
      en: 'Donations: about ' + donations + ' more in the tin tomorrow.',
      de: 'Spenden: etwa ' + donations + ' kommen morgen in die Kasse.',
      tone: 'neutral'
    });
    const income = companyIncome(state);
    out.push({
      en: 'Company income: about ' + (income >= 0 ? '+' : '') + income + ' per night. Their funds: ' + Math.round(state.stats.funds) + '.',
      de: 'Konzerneinnahmen: etwa ' + (income >= 0 ? '+' : '') + income + ' pro Nacht. Konzernkasse: ' + Math.round(state.stats.funds) + '.',
      tone: income <= 0 ? 'good' : 'bad'
    });
    const enemy = (FO.DIFFICULTIES[state.difficulty] || FO.DIFFICULTIES.normal).enemy;
    const raidChance = occupiedCount(state)
      ? CFG.raidBaseChance * (0.35 + state.stats.heat / 100) * enemy + (state.policies.policeFunding || 0) * 0.035
      : 0;
    const raidText = raidChance > 0.35 ? 'high' : (raidChance > 0.16 ? 'rising' : 'low');
    out.push({
      en: 'Police raid risk: ' + raidText + '. Heat is ' + Math.round(state.stats.heat) + '.',
      de: 'Risiko einer Polizeiräumung: ' + (raidText === 'high' ? 'hoch' : raidText === 'rising' ? 'steigend' : 'niedrig') + '. Hitze: ' + Math.round(state.stats.heat) + '.',
      tone: raidChance > 0.35 ? 'bad' : 'neutral'
    });
    const forest = S.forestPct(state);
    out.push({
      en: 'Logging: the chainsaws are working the frontier. Forest standing: ' + forest + '%.',
      de: 'Abholzung: Die Sägen arbeiten an der Front. Waldbestand: ' + forest + '%.',
      tone: forest < CFG.forestGoal ? 'bad' : 'good'
    });
    if (state.policies.demoBan) {
      out.push({ en: 'A demonstration ban is in force.', de: 'Ein Demonstrationsverbot ist in Kraft.', tone: 'bad' });
    }
    if (!out.length) {
      out.push({ en: 'The night is quiet. Too quiet.', de: 'Die Nacht ist still. Zu still.', tone: 'neutral' });
    }
    return out;
  }

  function foundCamp(state, tileId) {
    const ok = S.setFirstCamp(state, tileId);
    if (ok) {
      save(state);
      nextEvent(state);
      save(state);
    }
    return ok;
  }

  window.FO = window.FO || {};
  FO.game = {
    attach: function (state) { R = state; return R; },
    get state() { return R; },
    newGame: function (opts) {
      R = FO.state.createGame(opts);
      return R;
    },
    validate: validate,
    freeResources: freeResources,
    reservedCosts: reservedCosts,
    chanceFor: chanceFor,
    validActionsForTile: validActionsForTile,
    assign: assign,
    assignInstant: assignInstant,
    cancelAssign: cancelAssign,
    canEndDay: canEndDay,
    planSummary: planSummary,
    activeCrews: activeCrews,
    availableCrews: availableCrews,
    crewById: crewById,
    totalPeople: totalPeople,
    alliedVillages: alliedVillages,
    jailedCrews: jailedCrews,
    freeJailed: freeJailed,
    applyEffects: applyEffects,
    foundCamp: foundCamp,
    endDay: endDay,
    nextEvent: nextEvent,
    chooseEventOption: chooseEventOption,
    eventChance: eventChance,
    forecast: forecast,
    evaluateEnding: evaluateEnding,
    companyIncome: companyIncome,
    save: save,
    load: load,
    hasSave: hasSave,
    deleteSave: deleteSave,
    SAVE_KEY: SAVE_KEY
  };
})();
