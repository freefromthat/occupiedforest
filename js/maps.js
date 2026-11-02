/* ============================================================
   maps.js — handcrafted map variants
   ------------------------------------------------------------
   Every map is a hand-designed layout on the same 12×9 hex grid.
   They all provide the same set of features (old forest, mine,
   plant, company, villages, rail, road, power lines) so the exact
   same game logic runs on all of them — but the geography differs
   and changes how the occupation plays out. Nothing here is
   randomized: each variant is a fixed, authored place.
   ============================================================ */
(function () {
  const MAPS = [
    /* ---------------- 1. Talwald — the classic valley ---------------- */
    {
      id: 'talwald',
      name: { en: 'Talwald', de: 'Talwald' },
      tagline: {
        en: 'The classic valley: one old wood, three villages, a mine in the east.',
        de: 'Das klassische Tal: ein alter Wald, drei Dörfer, der Tagebau im Osten.'
      },
      forest: { en: 'Talwald', de: 'Talwald' },
      terrains: {
        ancient: [[0, 1], [0, 2], [1, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5], [0, 6], [1, 6], [0, 7], [1, 7]],
        water: [[3, 7], [4, 7], [5, 7], [4, 8], [5, 8], [3, 8]],
        field: [[1, 3], [4, 2], [4, 4], [6, 3], [7, 3], [6, 6], [7, 6], [2, 7], [1, 8], [8, 7]],
        mine: [[10, 7], [11, 7], [10, 8], [11, 8]],
        clearcut: [[9, 6], [9, 7], [9, 8], [10, 6], [8, 8]],
        plant: [[10, 0], [11, 0]],
        company: [[9, 5], [8, 6]]
      },
      villages: [
        {
          id: 'waldbach', name: 'Waldbach',
          tiles: [[2, 3], [3, 3], [2, 4], [3, 4]],
          church: [3, 3],
          support: 26,
          desc: { en: 'A village of carpenters, gardeners and stubborn grandmothers at the edge of the old forest.', de: 'Ein Dorf aus Tischler*innen, Gärtner*innen und sturen Großmüttern am Rand des alten Waldes.' }
        },
        {
          id: 'talheim', name: 'Talheim',
          tiles: [[7, 2], [8, 2], [8, 1]],
          church: [8, 1],
          support: 18,
          desc: { en: 'A commuter village with a church, a bakery and a lot of people who work for the company.', de: 'Ein Pendlerdorf mit Kirche, Bäckerei und vielen Leuten, die beim Konzern arbeiten.' }
        },
        {
          id: 'seeblick', name: 'Seeblick',
          tiles: [[2, 6], [3, 6]],
          church: null,
          support: 12,
          desc: { en: 'A handful of houses by the lake. Fishermen, a pub and a long memory.', de: 'Eine Handvoll Häuser am See. Fischer, ein Pub und ein langes Gedächtnis.' }
        }
      ],
      infra: {
        rail: [[10, 0], [10, 1], [11, 1], [10, 2], [11, 2], [11, 3], [10, 3], [10, 4], [11, 4], [11, 5], [10, 6], [10, 7]],
        road: [[9, 5], [8, 5], [8, 6], [7, 5], [6, 5], [6, 4], [5, 4], [4, 3], [3, 3],
          [6, 4], [7, 3], [7, 2], [8, 2],
          [5, 4], [4, 5], [3, 5]],
        roadProject: [[7, 4], [8, 4], [8, 3]],
        power: [
          [[10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 1], [4, 1], [3, 2], [2, 2], [1, 2], [0, 3], [0, 4]],
          [[7, 0], [7, 1], [8, 1]],
          [[5, 1], [5, 2], [5, 3], [5, 4], [4, 4]],
          [[3, 2], [3, 3]]
        ],
        poles: [[9, 0], [8, 0], [6, 0], [4, 1], [2, 2], [0, 3], [5, 3], [7, 1], [5, 1]]
      }
    },

    /* ---------------- 2. Seemoor — the lake moor ---------------- */
    {
      id: 'seemoor',
      name: { en: 'Seemoor', de: 'Seemoor' },
      tagline: {
        en: 'A big lake splits the forest. The company digs on the far shore.',
        de: 'Ein großer See teilt den Wald. Der Konzern gräbt am anderen Ufer.'
      },
      forest: { en: 'Seemoor', de: 'Seemoor' },
      terrains: {
        ancient: [[0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 7], [0, 7], [0, 8], [1, 8], [2, 8]],
        water: [[3, 3], [4, 3], [5, 3], [6, 3], [3, 4], [4, 4], [5, 4], [6, 4], [4, 5], [5, 5], [6, 5], [4, 6], [5, 6]],
        field: [[2, 3], [5, 2], [6, 2], [7, 2], [8, 4], [3, 6], [8, 8], [9, 8], [2, 1], [6, 1], [3, 1]],
        mine: [[10, 6], [11, 6], [10, 7], [11, 7], [11, 8]],
        clearcut: [[8, 2], [9, 2], [9, 3], [8, 3], [9, 4]],
        plant: [[10, 1], [11, 1]],
        company: [[9, 5], [8, 6]]
      },
      villages: [
        {
          id: 'moorhausen', name: 'Moorhausen',
          tiles: [[3, 2], [4, 2], [5, 2]],
          church: [4, 2],
          support: 22,
          desc: { en: 'Peat cutters and organic farmers on the north shore. Wary of the company, warier of the mine.', de: 'Torfstecher*innen und Bio-Bäuer*innen am Nordufer. Dem Konzern skeptisch, dem Tagebau noch skeptischer.' }
        },
        {
          id: 'schilfhaven', name: 'Schilfhaven',
          tiles: [[7, 4], [7, 5], [8, 5]],
          church: null,
          support: 14,
          desc: { en: 'A reed-bed hamlet of fishers and bird watchers. The lake is their larder and their law.', de: 'Ein Schilf-Weiler voller Fischer*innen und Vogelkundler*innen. Der See ist ihr Vorratslager und ihr Recht.' }
        },
        {
          id: 'bootssteg', name: 'Bootssteg',
          tiles: [[2, 6], [2, 5], [1, 6]],
          church: [2, 6],
          support: 18,
          desc: { en: 'A jetty, a boat shed, and families who have ferried protesters for generations.', de: 'Ein Steg, ein Bootsschuppen und Familien, die seit Generationen Protestierende übersetzen.' }
        }
      ],
      infra: {
        rail: [[10, 0], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8]],
        road: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6],
          [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]],
        roadProject: [[7, 2], [7, 3], [7, 4]],
        power: [
          [[9, 6], [8, 7], [7, 7], [6, 7], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7]],
          [[10, 1], [9, 1], [8, 1], [7, 1]]
        ],
        poles: [[9, 6], [8, 7], [7, 7], [6, 7], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7], [8, 1], [7, 1]]
      }
    },

    /* ---------------- 3. Kahlhieb — the clearcut frontier ---------------- */
    {
      id: 'kahlhieb',
      name: { en: 'Kahlhieb', de: 'Kahlhieb' },
      tagline: {
        en: 'The frontier: half the map already stumps. The forest holds the west — barely.',
        de: 'Die Frontier: die halbe Karte ist schon Kahlfläche. Der Wald hält sich im Westen — knapp.'
      },
      forest: { en: 'Kahlhieb', de: 'Kahlhieb' },
      terrains: {
        ancient: [[0, 6], [0, 7], [1, 7], [0, 8], [1, 8]],
        water: [[10, 8], [11, 8]],
        field: [[1, 2], [2, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5], [3, 1], [4, 1], [9, 5], [9, 6], [8, 7], [9, 7], [4, 6]],
        mine: [[9, 2], [10, 2], [9, 3], [10, 3], [10, 1]],
        clearcut: [[5, 1], [6, 1], [7, 1], [8, 1], [5, 2], [6, 2], [7, 2], [8, 2], [5, 3], [6, 3], [7, 3], [8, 3], [6, 4], [7, 4], [8, 4], [7, 5], [8, 5]],
        plant: [[11, 5], [11, 6]],
        company: [[8, 0], [9, 0]]
      },
      villages: [
        {
          id: 'hartenrod', name: 'Hartenrod',
          tiles: [[2, 0], [3, 0], [3, 1]],
          church: [2, 0],
          support: 20,
          desc: { en: 'A ridge village of smallholders who remember when the whole valley was woods.', de: 'Ein Berghof-Dorf voller Kleinbäuer*innen, die sich erinnern, als das ganze Tal Wald war.' }
        },
        {
          id: 'lindach', name: 'Lindach',
          tiles: [[2, 6], [3, 6], [2, 7]],
          church: [3, 6],
          support: 16,
          desc: { en: 'An orchard village above the last old stand. They fight for every tree and press cider for the camp.', de: 'Ein Obstbau-Dorf über dem letzten Altholz. Sie kämpfen um jeden Baum und pressen Most fürs Camp.' }
        },
        {
          id: 'steinbach', name: 'Steinbach',
          tiles: [[10, 6], [10, 7]],
          church: null,
          support: 8,
          desc: { en: 'A company settlement of digger drivers and haulage trucks. Organizing here is slow, necessary work.', de: 'Eine Konzernsiedlung voller Baggerfahrenden und Lastwagen. Hier zu arbeiten ist langsam — und nötig.' }
        }
      ],
      infra: {
        rail: [[9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [10, 4], [11, 4], [11, 5]],
        road: [[8, 0], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [3, 5], [2, 5], [1, 5],
          [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [9, 7], [10, 7], [10, 8]],
        roadProject: [[5, 4], [5, 5], [6, 5]],
        power: [
          [[10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 0]],
          [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [10, 5], [11, 5]]
        ],
        poles: [[9, 0], [8, 0], [7, 0], [6, 0], [5, 1], [5, 3], [5, 5], [7, 6], [9, 6], [10, 5]]
      }
    },

    /* ---------------- 4. Zweital — twin valleys, one corridor ---------------- */
    {
      id: 'zweital',
      name: { en: 'Zweital', de: 'Zweital' },
      tagline: {
        en: 'Twin woods cut in half by the rail corridor. Cross it — or choke it.',
        de: 'Zwei Wälder, geteilt vom Bahnkorridor. Ihn überqueren — oder ihn würgen.'
      },
      forest: { en: 'Zweital', de: 'Zweital' },
      terrains: {
        ancient: [[0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4], [2, 4], [2, 3], [9, 6], [10, 6], [9, 7], [10, 7]],
        water: [[9, 1], [10, 1], [9, 2], [10, 2]],
        field: [[3, 2], [4, 2], [3, 3], [4, 3], [2, 1], [3, 1], [8, 1], [8, 0], [9, 4], [8, 6], [9, 5], [4, 6], [3, 6], [7, 7], [7, 8]],
        mine: [[2, 7], [3, 7], [2, 8], [3, 8]],
        clearcut: [[7, 2], [8, 2], [7, 3], [8, 3], [7, 6]],
        plant: [[11, 0], [10, 0]],
        company: [[8, 4], [8, 5]]
      },
      villages: [
        {
          id: 'tannheim', name: 'Tannheim',
          tiles: [[1, 1], [2, 1], [2, 0]],
          church: [1, 1],
          support: 24,
          desc: { en: 'A fir-valley village of foresters who quit the company and now advise the occupation.', de: 'Ein Tannental-Dorf voller Förstereien, die dem Konzern gekündigt haben und die Besetzung jetzt beraten.' }
        },
        {
          id: 'bruckhof', name: 'Bruckhof',
          tiles: [[8, 1], [9, 0], [8, 2]],
          church: [8, 1],
          support: 13,
          desc: { en: 'A bridge-farm hamlet by the rail line. Every train to the mine rolls past their gate.', de: 'Ein Bruckhof-Weiler an der Bahnstrecke. Jeder Zug zum Tagebau rollt an ihrem Tor vorbei.' }
        },
        {
          id: 'suedweiler', name: 'Südweiler',
          tiles: [[7, 8], [8, 8], [8, 7]],
          church: [7, 8],
          support: 15,
          desc: { en: 'A sunny southern hamlet of winegrowers with a hall big enough for whole assemblies.', de: 'Ein sonniges Süddorf voller Winzer*innen mit einem Saal, groß genug für ganze Vollversammlungen.' }
        }
      ],
      infra: {
        rail: [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8]],
        road: [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8],
          [7, 0], [8, 0], [8, 1], [7, 4], [7, 5], [6, 6], [7, 6], [7, 7]],
        roadProject: [[4, 5], [4, 6], [5, 6]],
        power: [
          [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8]],
          [[6, 0], [7, 0], [8, 0], [8, 1], [9, 1], [10, 1], [11, 0]],
          [[5, 2], [4, 2], [3, 2], [2, 2], [1, 2], [0, 3]]
        ],
        poles: [[6, 1], [6, 3], [6, 5], [6, 7], [7, 0], [8, 1], [10, 1], [4, 2], [2, 2], [0, 3]]
      }
    }
  ];

  window.FO = window.FO || {};
  FO.MAPS = MAPS;
  FO.mapById = function (id) {
    for (let i = 0; i < MAPS.length; i++) if (MAPS[i].id === id) return MAPS[i];
    return MAPS[0];
  };
})();
