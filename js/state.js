/* ============================================================
   state.js — hex map generation, game state, geometry helpers
   ============================================================ */
(function () {
  const CFG = FO.CONFIG;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function key(col, row) { return 'c' + col + 'r' + row; }

  function tilePos(col, row) {
    const r = CFG.map.radius;
    return {
      x: CFG.map.margin + Math.sqrt(3) * r * (col + 0.5 * (row & 1)),
      y: CFG.map.margin + 1.5 * r * row
    };
  }

  function makeTile(col, row) {
    const pos = tilePos(col, row);
    return {
      id: key(col, row),
      col: col,
      row: row,
      x: pos.x,
      y: pos.y,
      terrain: 'forest',
      variant: (col * 7 + row * 13) % 5,
      villageId: null,
      church: false,
      occupied: 0,
      barrio: null,
      police: 0,
      logging: 0,
      rail: false,
      road: false,
      pole: false,
      poleDown: 0,
      blockade: 0,
      roadProject: false,
      reforestIn: 0,
      court: 0,
      mine: false,
      plant: false,
      company: false,
      policeCamp: false,
      young: false
    };
  }

  function buildMap(def) {
    const tiles = [];
    for (let row = 0; row < CFG.map.rows; row++) {
      for (let col = 0; col < CFG.map.cols; col++) {
        tiles.push(makeTile(col, row));
      }
    }
    const byId = {};
    tiles.forEach(function (t) { byId[t.id] = t; });

    function setTerrain(list, terrain) {
      list.forEach(function (c) {
        const t = byId[key(c[0], c[1])];
        if (t) t.terrain = terrain;
      });
    }

    const terrains = def.terrains || {};
    ['ancient', 'water', 'field', 'clearcut', 'mine', 'plant', 'company'].forEach(function (kind) {
      setTerrain(terrains[kind] || [], kind);
    });
    ['mine', 'plant', 'company'].forEach(function (kind) {
      (terrains[kind] || []).forEach(function (c) {
        const t = byId[key(c[0], c[1])];
        if (t) t[kind] = true;
      });
    });

    (def.villages || []).forEach(function (v) {
      v.tiles.forEach(function (c) {
        const t = byId[key(c[0], c[1])];
        if (!t) return;
        t.terrain = 'village';
        t.villageId = v.id;
        if (v.church && v.church[0] === c[0] && v.church[1] === c[1]) t.church = true;
      });
    });

    const infra = def.infra || {};
    (infra.rail || []).forEach(function (c) {
      const t = byId[key(c[0], c[1])];
      if (t) t.rail = true;
    });
    (infra.road || []).forEach(function (c) {
      const t = byId[key(c[0], c[1])];
      if (t) t.road = true;
    });
    (infra.roadProject || []).forEach(function (c) {
      const t = byId[key(c[0], c[1])];
      if (t) t.roadProject = true;
    });
    (infra.poles || []).forEach(function (c) {
      const t = byId[key(c[0], c[1])];
      if (t) t.pole = true;
    });

    return { tiles: tiles, byId: byId };
  }

  /* ---------- geometry ---------- */
  const NEIGHBORS_EVEN = [[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
  const NEIGHBORS_ODD = [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]];

  function neighborCoords(col, row) {
    const dirs = (row & 1) ? NEIGHBORS_ODD : NEIGHBORS_EVEN;
    return dirs.map(function (d) { return [col + d[0], row + d[1]]; });
  }

  function neighborsOf(state, tile) {
    if (!tile) return [];
    const out = [];
    neighborCoords(tile.col, tile.row).forEach(function (c) {
      const t = state.tiles.find(function (x) { return x.col === c[0] && x.row === c[1]; });
      if (t) out.push(t);
    });
    return out;
  }

  function tileById(state, id) {
    if (!id) return null;
    return state.tiles.find(function (t) { return t.id === id; }) || null;
  }

  function tileAt(state, col, row) {
    return state.tiles.find(function (t) { return t.col === col && t.row === row; }) || null;
  }

  function cube(col, row) {
    const x = col - (row - (row & 1)) / 2;
    const z = row;
    return { x: x, y: -x - z, z: z };
  }

  function hexDistance(a, b) {
    const ca = cube(a.col, a.row);
    const cb = cube(b.col, b.row);
    return Math.max(Math.abs(ca.x - cb.x), Math.abs(ca.y - cb.y), Math.abs(ca.z - cb.z));
  }

  function villageById(state, id) {
    return state.villages.find(function (v) { return v.id === id; }) || null;
  }

  function villageOfTile(state, tile) {
    if (!tile || !tile.villageId) return null;
    return villageById(state, tile.villageId);
  }

  function isAlliedVillage(state, tile) {
    const v = villageOfTile(state, tile);
    return !!(v && v.status === 'ally');
  }

  function isBase(state, tile) {
    return !!(tile && (tile.occupied > 0 || isAlliedVillage(state, tile)));
  }

  function hasBaseNeighbor(state, tile) {
    if (!tile) return false;
    if (isBase(state, tile)) return true;
    return neighborsOf(state, tile).some(function (n) { return isBase(state, n); });
  }

  function occupiedTiles(state) {
    return state.tiles.filter(function (t) { return t.occupied > 0; });
  }

  function capacity(state) {
    return CFG.capacityBase + Math.floor(state.stats.acceptance / 10) + Math.floor(state.stats.size / 20);
  }

  function forestPct(state) {
    const total = state.initialForest || 1;
    const now = state.tiles.filter(function (t) {
      return t.terrain === 'forest' || t.terrain === 'ancient' || t.young;
    }).length;
    return Math.round(clamp(now / total * 100, 0, 100));
  }

  function forestTiles(state) {
    return state.tiles.filter(function (t) { return t.terrain === 'forest' || t.terrain === 'ancient'; });
  }

  function nearestVillageDistance(state, tile) {
    let best = 99;
    state.villages.forEach(function (v) {
      v.tiles.forEach(function (c) {
        const vt = (typeof c === 'string') ? tileById(state, c) : tileAt(state, c[0], c[1]);
        if (!vt) return;
        const d = hexDistance(tile, vt);
        if (d < best) best = d;
      });
    });
    return best;
  }

  function mineDistance(state, tile) {
    let best = 99;
    state.tiles.forEach(function (t) {
      if (t.terrain !== 'mine') return;
      const d = hexDistance(tile, t);
      if (d < best) best = d;
    });
    return best;
  }

  function foundingCandidates(state) {
    return state.tiles.filter(function (t) {
      if (t.terrain !== 'forest' && t.terrain !== 'ancient') return false;
      if (t.rail || t.road || t.pole) return false;
      if (t.occupied > 0) return false;
      if (nearestVillageDistance(state, t) > 2) return false;
      if (mineDistance(state, t) < 3) return false;
      return true;
    });
  }

  /* ---------- creation ---------- */
  function makeCrew(def, index, isInfiltrator) {
    return {
      id: 'crew' + (index + 1),
      name: def.name,
      size: def.size,
      energy: def.energy,
      skills: Object.assign({ build: 0, climb: 0, organize: 0, media: 0, sabotage: 0 }, def.skills),
      inf: !!isInfiltrator,
      knownInf: false,
      suspicion: 0,
      assigned: null,
      arrested: false
    };
  }

  function createGame(opts) {
    opts = opts || {};
    const diffKey = opts.difficulty || 'normal';
    const diff = FO.DIFFICULTIES[diffKey] || FO.DIFFICULTIES.normal;
    const mapDef = FO.mapById ? FO.mapById(opts.mapId) : null;
    const built = buildMap(mapDef || { terrains: {}, villages: FO.VILLAGES || [], infra: {} });
    const state = {
      version: 1,
      day: 1,
      stage: 'founding',
      phase: 'plan',
      difficulty: diffKey,
      mapId: mapDef ? mapDef.id : 'talwald',
      policeCampId: null,
      policeCampDown: 0,
      player: {
        forest: opts.forest || 'Waldstatt',
        group: opts.group || 'Wurzelwerk',
        logo: opts.logo || 'fist'
      },
      stats: {
        energy: CFG.initial.energy,
        acceptance: diff.acceptance,
        heat: diff.startHeat,
        size: CFG.initial.size,
        funds: diff.funds,
        media: CFG.initial.media
      },
      resources: {
        wood: CFG.initial.wood,
        food: CFG.initial.food,
        gear: CFG.initial.gear,
        money: CFG.initial.money
      },
      tiles: built.tiles,
      villages: (mapDef && mapDef.villages ? mapDef.villages : FO.VILLAGES || []).map(function (v) {
        return {
          id: v.id,
          name: v.name,
          tiles: v.tiles.map(function (c) { return key(c[0], c[1]); }),
          church: v.church ? key(v.church[0], v.church[1]) : null,
          support: (v.support !== undefined ? v.support : 15),
          status: 'neutral',
          desc: v.desc
        };
      }),
      crews: CFG.crews.map(function (c, i) { return makeCrew(c, i, false); }),
      assignments: {},
      log: [],
      headlines: [],
      flags: {
        policeArrived: false,
        roadAnnounced: false,
        roadProjectActive: false,
        infSpawned: false,
        falseFlagSeen: false,
        court: false,
        negotiation: false,
        eventCooldown: 0,
        lastRaidDay: 0,
        bigRaidDay: 0
      },
      policies: {
        demoBan: false,
        road: false,
        minePermit: false,
        policeFunding: 0,
        expropriated: [],
        negotiation: false,
        court: false
      },
      links: {
        rail: ((mapDef && mapDef.infra && mapDef.infra.rail) || []).map(function (c) { return key(c[0], c[1]); }),
        road: ((mapDef && mapDef.infra && mapDef.infra.road) || []).map(function (c) { return key(c[0], c[1]); }),
        power: ((mapDef && mapDef.infra && mapDef.infra.power) || []).map(function (line) {
          return line.map(function (c) { return key(c[0], c[1]); });
        }),
        poles: ((mapDef && mapDef.infra && mapDef.infra.poles) || []).map(function (c) { return key(c[0], c[1]); })
      },
      metrics: {
        built: 0,
        upgraded: 0,
        evictions: 0,
        arrests: 0,
        sabotage: 0,
        blockades: 0,
        demos: 0,
        exposed: 0,
        villagesAlly: 0,
        forestLost: 0
      },
      seenEvents: {},
      usedEventIds: {},
      report: null,
      pendingEvent: null,
      ending: null,
      initialForest: 0,
      startCandidates: [],
      selectedCrewId: null,
      tutorialSeen: false,
      saveTime: Date.now()
    };

    state.initialForest = forestTiles(state).length;
    state.startCandidates = foundingCandidates(state).map(function (t) { return t.id; });
    state.selectedCrewId = state.crews[0].id;

    const introEn = 'Day one. The forest has a name, the company has a permit, and you have a camp to build.';
    const introDe = 'Tag eins. Der Wald hat einen Namen, der Konzern hat eine Genehmigung, und ihr habt ein Camp zu bauen.';
    state.log.push({ day: 1, type: 'good', en: introEn, de: introDe });

    state.headlines = [
      { day: 1, en: 'RESISTANCE CAMP FOUNDED IN ' + state.player.forest.toUpperCase() + '.', de: 'WIDERSTANDSCAMP IN ' + state.player.forest.toUpperCase() + ' GEGRÜNDET.' },
      { day: 1, en: 'Company: "The mine is already fully permitted."', de: 'Konzern: "Der Tagebau ist bereits vollständig genehmigt."' },
      { day: 1, en: 'Weather: fog until noon, then a stubborn sun.', de: 'Wetter: Nebel bis Mittag, dann eine hartnäckige Sonne.' }
    ];

    return state;
  }

  function setFirstCamp(state, tileId) {
    const t = tileById(state, tileId);
    if (!t) return false;
    const names = FO.BARRIO_NAMES;
    const name = names[Math.floor(Math.random() * names.length)] || 'Kronennest';
    t.occupied = 1;
    t.barrio = {
      name: name,
      foundedDay: 1,
      level: 1,
      type: t.terrain === 'ghost' ? 'house' : 'treehouse'
    };
    state.stage = 'play';
    state.metrics.built = 1;
    state.startCandidates = [];
    state.log.push({
      day: 1,
      type: 'good',
      en: 'The first barrio, ' + name + ', is founded in the ' + state.player.forest + '.',
      de: 'Das erste Barrio, ' + name + ', wird im ' + state.player.forest + ' gegründet.'
    });
    state.headlines.unshift({
      day: 1,
      en: 'TREEHOUSE CAMP "' + name.toUpperCase() + '" RISES IN ' + state.player.forest.toUpperCase() + '.',
      de: 'BAUMHAUSCAMP "' + name.toUpperCase() + '" ENTSTEHT IN ' + state.player.forest.toUpperCase() + '.'
    });
    return true;
  }

  /* ---------- serialization helpers ---------- */
  function snapshot(state) {
    return {
      energy: state.stats.energy,
      acceptance: state.stats.acceptance,
      heat: state.stats.heat,
      size: state.stats.size,
      funds: state.stats.funds,
      media: state.stats.media,
      wood: state.resources.wood,
      food: state.resources.food,
      gear: state.resources.gear,
      money: state.resources.money,
      forest: forestPct(state),
      occupied: occupiedTiles(state).length
    };
  }

  window.FO = window.FO || {};
  FO.state = {
    createGame: createGame,
    setFirstCamp: setFirstCamp,
    snapshot: snapshot,
    clamp: clamp,
    tileById: tileById,
    tileAt: tileAt,
    neighborsOf: neighborsOf,
    neighborCoords: neighborCoords,
    hexDistance: hexDistance,
    villageById: villageById,
    villageOfTile: villageOfTile,
    isAlliedVillage: isAlliedVillage,
    isBase: isBase,
    hasBaseNeighbor: hasBaseNeighbor,
    occupiedTiles: occupiedTiles,
    capacity: capacity,
    forestPct: forestPct,
    forestTiles: forestTiles,
    foundingCandidates: foundingCandidates,
    nearestVillageDistance: nearestVillageDistance,
    mineDistance: mineDistance,
    key: key
  };
})();
