/* ============================================================
   data.js — config, actions, events, names
   ============================================================ */
(function () {
  const CONFIG = {
    maxDays: 40,
    map: { cols: 12, rows: 9, radius: 38, margin: 74 },
    initial: {
      energy: 70,
      acceptance: 20,
      heat: 12,
      size: 14,
      funds: 140,
      media: 5,
      wood: 7,
      food: 12,
      gear: 3,
      money: 35
    },
    crews: [
      {
        name: { en: 'Climbing collective', de: 'Kletterkollektiv' },
        size: 5,
        energy: 88,
        skills: { build: 2, climb: 3, organize: 1, media: 0, sabotage: 1 }
      },
      {
        name: { en: 'Kitchen crew', de: 'Küchencrew' },
        size: 4,
        energy: 92,
        skills: { build: 1, climb: 0, organize: 3, media: 1, sabotage: 0 }
      },
      {
        name: { en: 'Press posse', de: 'Pressetruppe' },
        size: 3,
        energy: 84,
        skills: { build: 0, climb: 1, organize: 2, media: 3, sabotage: 0 }
      }
    ],
    recruitAt: [26, 44, 64, 88, 112],
    maxCrews: 6,
    capacityBase: 2,
    forestGoal: 60,
    acceptanceGoal: 65,
    startVillageSupport: { waldbach: 26, talheim: 18, seeblick: 12 },
    // night economy
    companyIncomeBase: 2,
    companyIncomePerMine: 2.2,
    companyUpkeep: 3,
    sabotageFunds: 11,
    blockadeFunds: 8,
    raidBaseChance: 0.22,
    loggingPerNight: 16,
    dailyFoodPerPerson: 0.28,
    donationPerAcceptance: 0.16,
    energyNightDecay: 1,
    crewNightRecovery: 10,
    crewAllyRecovery: 4,
    kitchenEnergy: 7,
    kitchenCrewMeal: 6
  };

  /* ---------------- actions ---------------- */
  const ACTIONS = [
    {
      id: 'build', icon: 'treehouse', skill: 'build', difficulty: 2, stamina: 16,
      cost: { wood: 4 },
      terrains: ['forest', 'ancient', 'ghost', 'young'],
      targetsOccupied: true,
      desc: 'action.build.desc'
    },
    {
      id: 'scout', icon: 'scout', skill: 'climb', difficulty: 1, stamina: 12,
      cost: {},
      terrains: ['forest', 'ancient', 'clearcut', 'field', 'water', 'mine', 'young'],
      desc: 'action.scout.desc'
    },
    {
      id: 'kitchen', icon: 'kitchen', skill: 'organize', difficulty: 1, stamina: 12,
      cost: { food: 1 },
      needBase: true,
      desc: 'action.kitchen.desc'
    },
    {
      id: 'demo', icon: 'demo', skill: 'organize', difficulty: 2, stamina: 20,
      cost: { food: 2 },
      demoTargets: true,
      minSize: 12,
      desc: 'action.demo.desc'
    },
    {
      id: 'blockade', icon: 'blockade', skill: 'climb', difficulty: 2, stamina: 18,
      cost: { gear: 2 },
      blockadeTargets: true,
      desc: 'action.blockade.desc'
    },
    {
      id: 'sabotage', icon: 'sabotage', skill: 'sabotage', difficulty: 3, stamina: 18,
      cost: { gear: 2 },
      sabotageTargets: true,
      desc: 'action.sabotage.desc'
    },
    {
      id: 'workshop', icon: 'workshop', skill: 'organize', difficulty: 1, stamina: 12,
      cost: { money: 6 },
      needBase: true,
      focus: true,
      desc: 'action.workshop.desc'
    },
    {
      id: 'network', icon: 'network', skill: 'organize', difficulty: 1, stamina: 12,
      cost: {},
      villageOnly: true,
      desc: 'action.network.desc'
    },
    {
      id: 'media', icon: 'media', skill: 'media', difficulty: 2, stamina: 12,
      cost: { money: 8 },
      needBase: true,
      desc: 'action.media.desc'
    },
    {
      id: 'trust', icon: 'trust', skill: 'organize', difficulty: 2, stamina: 8,
      cost: {},
      instantCrew: true,
      desc: 'action.trust.desc'
    },
    {
      id: 'rest', icon: 'rest', skill: null, difficulty: 0, stamina: -36,
      cost: {},
      instantCrew: true,
      desc: 'action.rest.desc'
    },
    {
      id: 'fundraise', icon: 'fundraise', skill: 'media', difficulty: 2, stamina: 10,
      cost: {},
      needBase: true,
      desc: 'action.fundraise.desc'
    },
    {
      id: 'supply', icon: 'fundraise', skill: 'media', difficulty: 1, stamina: 10,
      cost: { money: 12 },
      instantCrew: true,
      desc: 'action.supply.desc'
    },
    {
      id: 'bulk', icon: 'fundraise', skill: 'media', difficulty: 2, stamina: 14,
      cost: { money: 30 },
      instantCrew: true,
      desc: 'action.bulk.desc'
    },
    {
      id: 'liberate', icon: 'sabotage', skill: 'sabotage', difficulty: 3, stamina: 16,
      cost: { gear: 2 },
      prisonTargets: true,
      desc: 'action.liberate.desc'
    },
    {
      id: 'reforest', icon: 'reforest', skill: 'build', difficulty: 1, stamina: 14,
      cost: { wood: 2 },
      terrains: ['clearcut'],
      desc: 'action.reforest.desc'
    }
  ];

  const ACTION_BY_ID = {};
  ACTIONS.forEach(function (a) { ACTION_BY_ID[a.id] = a; });

  /* ---------------- difficulties ---------------- */
  const DIFFICULTIES = {
    easy: { key: 'easy', enemy: 0.7, funds: 112, acceptance: 26, startHeat: 8, label: 'setup.diffEasy', desc: 'setup.diffEasyDesc' },
    normal: { key: 'normal', enemy: 1, funds: 140, acceptance: 20, startHeat: 12, label: 'setup.diffNormal', desc: 'setup.diffNormalDesc' },
    hard: { key: 'hard', enemy: 1.28, funds: 168, acceptance: 15, startHeat: 16, label: 'setup.diffHard', desc: 'setup.diffHardDesc' }
  };

  /* ---------------- names ---------------- */
  const FOREST_NAMES = ['Waldstatt', 'Silberwald', 'Moosgrund', 'Tannental', 'Krähenforst', 'Rotbuchenhain', 'Nebelwald', 'Eichenkamm', 'Farnschlucht', 'Birkental'];
  const GROUP_NAMES = ['Wurzelwerk', 'Rindenrebellen', 'Moos & Wut', 'Blattwerk', 'Waldkante', 'Kronenkollektiv', 'Farnfront', 'Eichelkommune', 'Hinterland', 'Zartbitter'];
  const BARRIO_NAMES = ['Kronennest', 'Wurzelwerk', 'Farncamp', 'Buchenburg', 'Spechtplatz', 'Moosdach', 'Eichenkrone', 'Haselnuss', 'Lichtung 7', 'Waldkante', 'Kleeblatt', 'Hinterland', 'Astwerk', 'Nebelbett'];
  const CREW_NAMES = [
    { en: 'Climbing collective', de: 'Kletterkollektiv' },
    { en: 'Kitchen crew', de: 'Küchencrew' },
    { en: 'Press posse', de: 'Pressetruppe' },
    { en: 'Build team', de: 'Bauteam' },
    { en: 'Legal aid', de: 'Rechtshilfe' },
    { en: 'Outreach crew', de: 'Vernetzungsteam' },
    { en: 'Night watch', de: 'Nachtwache' },
    { en: 'Forest scouts', de: 'Waldläufer*innen' },
    { en: 'Art & banner crew', de: 'Kunst- & Bannercrew' },
    { en: 'Bike kitchen', de: 'Fahrradküche' }
  ];

  /* ---------------- villages ---------------- */
  const VILLAGES = [
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
  ];

  /* ---------------- events ---------------- */
  /* effect objects are interpreted by game.applyEffects */
  const EVENTS = [
    {
      id: 'first_dawn', day: 1, once: true, tone: 'social',
      title: { en: 'The first morning', de: 'Der erste Morgen' },
      text: {
        en: 'The forest smells of wet moss and diesel. Your first barrio is barely a platform and a tarp. Somewhere below, a truck engine idles, then fades. Everyone looks at you. What does the day belong to?',
        de: 'Der Wald riecht nach nassem Moos und Diesel. Euer erstes Barrio ist kaum mehr als eine Plattform und eine Plane. Irgendwo unten läuft ein Motor, dann verschwindet er. Alle schauen dich an. Wem gehört dieser Tag?'
      },
      options: [
        {
          label: { en: 'Cook together first', de: 'Erst gemeinsam kochen' },
          hint: { en: 'A shared meal builds trust and stamina.', de: 'Ein gemeinsames Essen schafft Vertrauen und Ausdauer.' },
          effects: { energy: 6, acceptance: 2, resources: { food: 2 } },
          result: { en: 'The kitchen is a pot, a gas burner and six mismatched mugs. It is enough. By noon, everyone knows each other\'s names.', de: 'Die Küche ist ein Topf, ein Gaskocher und sechs verschiedene Becher. Es reicht. Am Mittag kennen alle ihre Namen.' }
        },
        {
          label: { en: 'Scout the perimeter', de: 'Das Gelände erkunden' },
          hint: { en: 'Learn the logging front and find useful material.', de: 'Die Abholzungsfront erkunden und Material finden.' },
          effects: { resources: { wood: 3, gear: 1 }, energy: -2, acceptance: 1 },
          result: { en: 'You find a broken fence, a pile of pallets and the fresh tracks of a harvester. The forest is already being mapped for cutting.', de: 'Ihr findet einen kaputten Zaun, einen Stapel Paletten und die frischen Spuren eines Harvesters. Der Wald wird bereits für die Rodung vermessen.' }
        },
        {
          label: { en: 'Paint a banner over the road', de: 'Ein Banner über die Straße hängen' },
          hint: { en: 'Make the occupation visible. Attention and heat.', de: 'Die Besetzung sichtbar machen. Aufmerksamkeit und Hitze.' },
          effects: { acceptance: 3, heat: 4, size: 2, energy: 2 },
          result: { en: 'By evening, a photo of the banner is shared two thousand times. The police also have a copy.', de: 'Am Abend wird ein Foto des Banners zweitausendmal geteilt. Die Polizei hat auch ein Exemplar.' }
        }
      ]
    },
    {
      id: 'police_arrive', day: 2, once: true, tone: 'danger',
      title: { en: 'They are watching', de: 'Sie beobachten' },
      text: {
        en: 'A white van parks at the forest edge. Two officers get out, take photos of the platforms and leave without a word. A third stays behind with a clipboard.',
        de: 'Ein weißer Transporter parkt am Waldrand. Zwei Beamt*innen steigen aus, fotografieren die Plattformen und fahren wortlos wieder los. Eine dritte Person bleibt mit einem Klemmbrett zurück.'
      },
      options: [
        {
          label: { en: 'Offer them coffee', de: 'Ihnen Kaffee anbieten' },
          hint: { en: 'De-escalate and show a human face.', de: 'Deeskalieren und ein menschliches Gesicht zeigen.' },
          effects: { acceptance: 3, heat: -3, energy: 1 },
          result: { en: 'They decline the coffee but take the offer seriously. One of them writes down the camp\'s water supply instead of its weak points.', de: 'Sie lehnen den Kaffee ab, nehmen das Angebot aber ernst. Eine Person notiert die Wasserversorgung des Camps statt seiner Schwachstellen.' }
        },
        {
          label: { en: 'Film them openly', de: 'Sie offen filmen' },
          hint: { en: 'Transparency protects — and provokes.', de: 'Transparenz schützt — und provoziert.' },
          effects: { acceptance: 2, heat: 3, media: 3 },
          result: { en: 'The video shows an officer writing down licence plates. It gets shared widely. The police call it "routine observation".', de: 'Das Video zeigt eine Beamtin, die Kennzeichen notiert. Es wird viel geteilt. Die Polizei nennt es "routinemäßige Beobachtung".' }
        },
        {
          label: { en: 'Ignore them', de: 'Sie ignorieren' },
          hint: { en: 'Keep working. They will be back.', de: 'Weiterarbeiten. Sie kommen wieder.' },
          effects: { heat: 1, energy: 2 },
          result: { en: 'The van leaves at dusk. Nobody sleeps well.', de: 'Der Transporter fährt in der Dämmerung davon. Niemand schläft gut.' }
        }
      ]
    },
    {
      id: 'road_project', day: 5, once: true, tone: 'danger',
      title: { en: 'The road decree', de: 'Der Straßenerlass' },
      text: {
        en: 'The district council approves a "transport corridor" through the forest. Surveyors arrive with orange poles. The company calls it progress. The maps call it a wound.',
        de: 'Der Kreisrat genehmigt einen "Verkehrskorridor" durch den Wald. Vermesser*innen kommen mit orangefarbenen Pfählen. Der Konzern nennt es Fortschritt. Die Karten nennen es eine Wunde.'
      },
      options: [
        {
          label: { en: 'File an urgent legal challenge', de: 'Sofort Klage einreichen' },
          hint: { en: 'Costs money. A court might slow the corridor.', de: 'Kostet Geld. Ein Gericht könnte den Korridor bremsen.' },
          chance: 52, check: 'media',
          effects: { resources: { money: -10 }, heat: 1 },
          success: { policy: 'court', acceptance: 3, heat: -3 },
          fail: { acceptance: -1, heat: 2 },
          successResult: { en: 'The court suspends the corridor for now. The surveyors pack up, furious.', de: 'Das Gericht setzt den Korridor vorerst aus. Die Vermesser*innen packen wütend zusammen.' },
          failResult: { en: 'The challenge is dismissed as "unfounded". The saws get a schedule.', de: 'Die Klage wird als "unbegründet" abgewiesen. Die Sägen bekommen einen Zeitplan.' }
        },
        {
          label: { en: 'Occupy the survey line', de: 'Die Vermessungslinie besetzen' },
          hint: { en: 'Direct action. Stops work now, raises the heat.', de: 'Direkte Aktion. Stoppt die Arbeit jetzt, treibt die Hitze.' },
          chance: 60, check: 'climb',
          effects: { heat: 5, energy: 2 },
          success: { funds: -4, acceptance: 2, size: 3 },
          fail: { acceptance: -2, heat: 4 },
          successResult: { en: 'Thirty people sit on the survey line. The surveyors leave. For one day, the corridor exists only on paper.', de: 'Dreißig Menschen sitzen auf der Vermessungslinie. Die Vermesser*innen gehen. Für einen Tag existiert der Korridor nur auf Papier.' },
          failResult: { en: 'Security clears the line before lunch. The orange poles remain.', de: 'Security räumt die Linie vor dem Mittag. Die orangefarbenen Pfähle bleiben.' }
        },
        {
          label: { en: 'Take the story to the press', de: 'Die Geschichte an die Presse geben' },
          hint: { en: 'Turn the corridor into a national scandal.', de: 'Den Korridor zum landesweiten Skandal machen.' },
          effects: { acceptance: 4, media: 6, heat: 1, resources: { money: 4 } },
          result: { en: 'A regional paper runs the headline "A road through the last old forest". The council calls it "balanced reporting".', de: 'Eine Regionalzeitung titelt "Eine Straße durch den letzten alten Wald". Der Rat nennt es "ausgewogene Berichterstattung".' }
        }
      ]
    },
    {
      id: 'v_mensch', day: 7, once: true, tone: 'paranoia',
      title: { en: 'Someone is too helpful', de: 'Jemand ist zu hilfsbereit' },
      text: {
        en: 'A new face has been at every meeting, taking notes, asking exactly the right questions. They brought expensive coffee and a very good map. Nobody remembers who invited them.',
        de: 'Ein neues Gesicht war bei jedem Treffen, hat Notizen gemacht und genau die richtigen Fragen gestellt. Sie brachten teuren Kaffee und eine sehr gute Karte mit. Niemand erinnert sich, wer sie eingeladen hat.'
      },
      options: [
        {
          label: { en: 'Hold a trust circle', de: 'Einen Vertrauenskreis abhalten' },
          hint: { en: 'Quiet, uncomfortable, necessary. Might expose a snitch.', de: 'Still, unangenehm, notwendig. Könnte einen Spitzel enttarnen.' },
          chance: 58, check: 'organize',
          effects: { energy: -2 },
          success: { exposeInf: true, acceptance: 1 },
          fail: { heat: 2, energy: -2 },
          successResult: { en: 'Two hours of hard questions. A contradiction about a "cousin in the IT department". By morning, the helpful stranger is gone.', de: 'Zwei Stunden harte Fragen. Ein Widerspruch über einen "Cousin in der IT". Am Morgen ist die hilfsbereite Person verschwunden.' },
          failResult: { en: 'The circle closes ranks around the wrong person. The real informant keeps smiling.', de: 'Der Kreis schließt sich um die falsche Person. Der echte Spitzel lächelt weiter.' }
        },
        {
          label: { en: 'Feed them false plans', de: 'Ihnen falsche Pläne füttern' },
          hint: { en: 'Clever, risky. The company may waste resources — or call the bluff.', de: 'Clever, riskant. Der Konzern verschwendet vielleicht Geld — oder durchschaut es.' },
          chance: 48, check: 'organize',
          effects: { energy: -1 },
          success: { funds: -5, heat: -2, acceptance: 1, exposeInf: true },
          fail: { heat: 5, funds: 3, acceptance: -1 },
          successResult: { en: 'Security raids an empty meadow. The company\'s operations map now has a beautiful, completely fictional barrio on it.', de: 'Security stürmt eine leere Wiese. Die Einsatzkarte des Konzerns hat jetzt ein wunderschönes, völlig erfundenes Barrio.' },
          failResult: { en: 'The false plan is too perfect. They realise it is bait — and use the real meeting place for a raid.', de: 'Der falsche Plan ist zu perfekt. Sie erkennen die Falle — und nutzen den echten Treffpunkt für eine Razzia.' }
        },
        {
          label: { en: 'Do nothing', de: 'Nichts tun' },
          hint: { en: 'Trust is a risk. So is paranoia.', de: 'Vertrauen ist ein Risiko. Paranoia auch.' },
          effects: { energy: 2, acceptance: 1 },
          result: { en: 'You decide not to tear the camp apart over a feeling. The stranger stays. So does the feeling.', de: 'Ihr entscheidet, das Camp nicht wegen eines Gefühls auseinanderzunehmen. Die Person bleibt. Das Gefühl auch.' }
        }
      ]
    },
    {
      id: 'expropriation', day: 9, once: true, tone: 'danger',
      title: { en: 'The expropriation list', de: 'Die Enteignungsliste' },
      text: {
        en: 'The council publishes a list of plots to be expropriated "for the public good". Two village gardens are on it. One of them belongs to a family that has voted for the ruling party for thirty years.',
        de: 'Der Rat veröffentlicht eine Liste von Flächen, die "zum Wohle der Allgemeinheit" enteignet werden sollen. Zwei Dorfgärten stehen darauf. Einer gehört einer Familie, die seit dreißig Jahren die Regierungspartei wählt.'
      },
      options: [
        {
          label: { en: 'Turn the list into a public scandal', de: 'Die Liste zum Skandal machen' },
          hint: { en: 'Facts and neighbours. Slow, effective.', de: 'Fakten und Nachbarschaft. Langsam, effektiv.' },
          effects: { acceptance: 5, media: 5, villageSupport: 8, heat: 2 },
          result: { en: 'A local reporter maps every plot. The family puts the article on their fridge. The council calls the list "a draft".', de: 'Ein Lokalreporter kartiert jede Fläche. Die Familie hängt den Artikel an den Kühlschrank. Der Rat nennt die Liste "einen Entwurf".' }
        },
        {
          label: { en: 'Physically occupy the gardens', de: 'Die Gärten physisch besetzen' },
          hint: { en: 'Protect the plots now. Police will come.', de: 'Die Flächen jetzt schützen. Die Polizei kommt.' },
          chance: 60, check: 'climb',
          effects: { heat: 6, energy: 2, size: 3 },
          success: { acceptance: 3, villageSupport: 12, funds: -2 },
          fail: { acceptance: -2, villageSupport: -4, heat: 3 },
          successResult: { en: 'You build a small camp between the tomato beds. The eviction is postponed. The tomatoes are excellent.', de: 'Ihr baut ein kleines Camp zwischen den Tomatenbeeten. Die Räumung wird verschoben. Die Tomaten sind exzellent.' },
          failResult: { en: 'Security removes you before sunset. The gardens are fenced with orange plastic.', de: 'Security entfernt euch vor Sonnenuntergang. Die Gärten sind mit orangefarbenem Plastik eingezäunt.' }
        },
        {
          label: { en: 'Quietly buy the plots', de: 'Die Flächen still aufkaufen' },
          hint: { en: 'Money solves what protest cannot. For now.', de: 'Geld löst, was Protest nicht löst. Vorerst.' },
          effects: { resources: { money: -18 }, villageSupport: 6, acceptance: 2, heat: -2 },
          result: { en: 'A supporter lends the money. The plots are bought under a cooperative\'s name. The council is furious about "speculation".', de: 'Ein Unterstützer leiht das Geld. Die Flächen werden auf den Namen einer Genossenschaft gekauft. Der Rat ist wütend über "Spekulation".' }
        }
      ]
    },
    {
      id: 'donor', day: 11, once: false, weight: 6, tone: 'opportunity',
      title: { en: 'An anonymous envelope', de: 'Ein anonymer Umschlag' },
      text: {
        en: 'A lawyer hands you an envelope. Inside: €40,000 in cashier\'s cheques and one condition — "no property damage, no masks in photos". The donor wants a respectable resistance.',
        de: 'Ein Anwalt reicht dir einen Umschlag. Darin: 40.000 € in Schecks und eine Bedingung — "keine Sachschäden, keine Masken auf Fotos". Der Spender will einen respektablen Widerstand.'
      },
      options: [
        {
          label: { en: 'Take the money, keep the masks', de: 'Nimm das Geld, behalte die Masken' },
          hint: { en: 'Much needed cash, some strings attached.', de: 'Dringend benötigtes Geld, einige Bedingungen.' },
          effects: { resources: { money: 34 }, acceptance: -2, size: 1 },
          result: { en: 'The lawyer sighs. The money pays for wood, legal aid and three months of fuel. The masks stay.', de: 'Der Anwalt seufzt. Das Geld bezahlt Holz, Rechtshilfe und drei Monate Sprit. Die Masken bleiben.' }
        },
        {
          label: { en: 'Refuse the strings', de: 'Die Bedingungen ablehnen' },
          hint: { en: 'Autonomy is worth more than a cheque.', de: 'Autonomie ist mehr wert als ein Scheck.' },
          effects: { acceptance: 3, energy: 4, size: 2 },
          result: { en: 'The story of the refused cheque travels faster than the cheque ever would. A small fundraiser beats the original sum.', de: 'Die Geschichte vom abgelehnten Scheck verbreitet sich schneller als der Scheck. Eine kleine Spendensammlung übertrifft die Summe.' }
        },
        {
          label: { en: 'Ask where the money came from', de: 'Fragen, woher das Geld kommt' },
          hint: { en: 'Principles, or a trap? Investigate.', de: 'Prinzipien oder eine Falle? Nachforschen.' },
          chance: 50, check: 'media',
          effects: { energy: -2 },
          success: { resources: { money: 6 }, acceptance: 4, media: 4 },
          fail: { acceptance: -3, heat: 3 },
          successResult: { en: 'The donor is a retired teacher who sold a house. She joins the kitchen crew and refuses to be named.', de: 'Der Spender ist eine pensionierte Lehrerin, die ein Haus verkauft hat. Sie kommt in die Küchencrew und will nicht genannt werden.' },
          failResult: { en: 'The money traces back to a company subcontractor. The press smells hypocrisy. The envelope disappears.', de: 'Das Geld führt zu einem Subunternehmer des Konzerns. Die Presse wittert Heuchelei. Der Umschlag verschwindet.' }
        }
      ]
    },
    {
      id: 'press_request', day: 12, once: false, weight: 5, tone: 'media',
      title: { en: 'A camera at the gate', de: 'Eine Kamera am Tor' },
      text: {
        en: 'A national TV team wants an interview. The reporter is friendly but hungry. Behind her, a security guard films you with his phone.',
        de: 'Ein nationales TV-Team will ein Interview. Die Reporterin ist freundlich, aber hungrig. Hinter ihr filmt ein Sicherheitsmann mit seinem Handy.'
      },
      options: [
        {
          label: { en: 'Give a calm, clear interview', de: 'Ein ruhiges, klares Interview geben' },
          hint: { en: 'Explain the forest, the water, the future.', de: 'Erklärt den Wald, das Wasser, die Zukunft.' },
          effects: { acceptance: 5, media: 7, heat: -2 },
          result: { en: 'Six minutes of prime time. The forest looks ancient and fragile. The company\'s spokesperson looks like a spreadsheet.', de: 'Sechs Minuten zur besten Sendezeit. Der Wald wirkt uralt und zerbrechlich. Der Sprecher des Konzerns wirkt wie eine Tabelle.' }
        },
        {
          label: { en: 'Go radical on camera', de: 'Vor der Kamera radikal werden' },
          hint: { en: 'Fire up the base, alarm the middle.', de: 'Die Basis begeistern, die Mitte alarmieren.' },
          effects: { size: 5, acceptance: -3, heat: 3, energy: 4 },
          result: { en: 'The clip becomes a slogan. It also becomes evidence in a later court case. Both are useful, in different ways.', de: 'Der Clip wird zum Slogan. Er wird auch Beweismittel in einem späteren Verfahren. Beides ist nützlich, auf verschiedene Weise.' }
        },
        {
          label: { en: 'Let the forest speak', de: 'Den Wald sprechen lassen' },
          hint: { en: 'No talking heads. Just birdsong and chainsaws.', de: 'Keine Reden. Nur Vogelstimmen und Kettensägen.' },
          effects: { acceptance: 3, media: 4, energy: 2 },
          result: { en: 'The segment is mostly silence, wind and one long shot of a stump. It is the most shared clip of the week.', de: 'Der Beitrag ist vor allem Stille, Wind und eine lange Einstellung auf einen Baumstumpf. Es ist der meistgeteilte Clip der Woche.' }
        }
      ]
    },
    {
      id: 'solidarity_concert', day: 13, once: false, weight: 5, tone: 'opportunity',
      title: { en: 'A stage in the clearing', de: 'Eine Bühne auf der Lichtung' },
      text: {
        en: 'Three bands offer a solidarity concert: punk, folk and something with too many synthesizers. The village council is nervous. The police want a security plan.',
        de: 'Drei Bands bieten ein Solidaritätskonzert an: Punk, Folk und etwas mit zu vielen Synthesizern. Der Dorfrat ist nervös. Die Polizei will ein Sicherheitskonzept.'
      },
      options: [
        {
          label: { en: 'Host the big concert', de: 'Das große Konzert ausrichten' },
          hint: { en: 'Money, people, energy — and attention.', de: 'Geld, Menschen, Energie — und Aufmerksamkeit.' },
          effects: { resources: { money: 18, food: 4 }, acceptance: 4, size: 6, energy: 6, heat: 3 },
          result: { en: 'Eight hundred people, one generator, zero parking. The donation box overflows. So does the compost toilet.', de: 'Achthundert Menschen, ein Generator, kein Parkplatz. Die Spendenbox läuft über. Das Kompostklo auch.' }
        },
        {
          label: { en: 'Keep it small and acoustic', de: 'Klein und akustisch bleiben' },
          hint: { en: 'Neighbours stay friendly, the camp stays calm.', de: 'Die Nachbarschaft bleibt freundlich, das Camp bleibt ruhig.' },
          effects: { resources: { money: 7, food: 2 }, acceptance: 3, villageSupport: 6, energy: 5 },
          result: { en: 'Forty people, a guitar and a pot of soup. The village mayor brings a cake and a list of complaints. Both are handled.', de: 'Vierzig Menschen, eine Gitarre und ein Topf Suppe. Die Bürgermeisterin bringt einen Kuchen und eine Beschwerdeliste. Beides wird erledigt.' }
        },
        {
          label: { en: 'Say no to the spectacle', de: 'Nein zum Spektakel sagen' },
          hint: { en: 'Protect the camp\'s focus — and its neighbours.', de: 'Den Fokus des Camps schützen — und die Nachbarschaft.' },
          effects: { acceptance: 1, energy: -2, villageSupport: 3, heat: -2 },
          result: { en: 'The bands play in the village hall instead. You can hear the bass from the platforms. It is enough.', de: 'Die Bands spielen stattdessen im Dorfsaal. Man hört den Bass bis auf die Plattformen. Es reicht.' }
        }
      ]
    },
    {
      id: 'false_flag', day: 16, once: true, tone: 'paranoia',
      title: { en: 'Paint on the mayor\'s car', de: 'Farbe am Auto der Bürgermeisterin' },
      text: {
        en: 'Someone sprayed "FOREST OR DEATH" on the mayor\'s car overnight. A company-funded news site already has the story, the photos and a quote calling you terrorists. You did not do it.',
        de: 'Jemand hat nachts "WALD ODER TOD" auf das Auto der Bürgermeisterin gesprüht. Ein konzernfinanziertes Nachrichtenportal hat schon die Story, die Fotos und ein Zitat, das euch Terroristen nennt. Ihr wart es nicht.'
      },
      options: [
        {
          label: { en: 'Counter with a media offensive', de: 'Mit einer Medienoffensive kontern' },
          hint: { en: 'Denounce the attack, show your own rules.', de: 'Den Angriff verurteilen, eigene Regeln zeigen.' },
          chance: 62, check: 'media',
          effects: { resources: { money: -6 }, heat: 2 },
          success: { acceptance: 4, media: 8, heat: -3 },
          fail: { acceptance: -4, media: -3 },
          successResult: { en: 'Your press conference is calm and specific. "We do not attack people\'s cars. We sit in trees." The story flips.', de: 'Eure Pressekonferenz ist ruhig und konkret. "Wir greifen keine Autos an. Wir sitzen in Bäumen." Die Story dreht sich.' },
          failResult: { en: 'Your denial is buried under a new headline: "Activists refuse to condemn violence".', de: 'Eure Dementis verschwinden unter einer neuen Schlagzeile: "Aktivist*innen verurteilen Gewalt nicht".' }
        },
        {
          label: { en: 'Run your own investigation', de: 'Eigene Untersuchung starten' },
          hint: { en: 'Find the paint, find the buyer.', de: 'Findet die Farbe, findet den Käufer.' },
          chance: 50, check: 'organize',
          effects: { energy: -3, resources: { money: -4 } },
          success: { acceptance: 5, media: 5, funds: -4 },
          fail: { acceptance: -2, heat: 3 },
          successResult: { en: 'A hardware store receipt leads to a company security contractor. You publish it with the paint can still in the frame.', de: 'Ein Baumarktbeleg führt zu einem Sicherheitsdienst des Konzerns. Ihr veröffentlicht ihn — mit der Farbdose im Bild.' },
          failResult: { en: 'You find nothing but a half-empty paint can. The internet finds a conspiracy theory instead.', de: 'Ihr findet nur eine halbleere Farbdose. Das Internet findet stattdessen eine Verschwörungstheorie.' }
        },
        {
          label: { en: 'Stay silent and keep working', de: 'Schweigen und weiterarbeiten' },
          hint: { en: 'Do not feed the story. It will hurt anyway.', de: 'Die Story nicht füttern. Es wird trotzdem wehtun.' },
          effects: { acceptance: -6, energy: 2, heat: 2 },
          result: { en: 'For three days, every interview starts with the car. Then a flood hits a company village, and the news moves on. The damage remains.', de: 'Drei Tage lang beginnt jedes Interview mit dem Auto. Dann überschwemmt ein Hochwasser ein Konzerndorf, und die Nachrichten ziehen weiter. Der Schaden bleibt.' }
        }
      ]
    },
    {
      id: 'jobs_debate', day: 14, once: false, weight: 5, tone: 'social',
      title: { en: 'What about our jobs?', de: 'Und unsere Arbeitsplätze?' },
      text: {
        en: 'At the bakery, a miner\'s daughter asks the question everyone avoids: "If the mine closes, what happens to my father?" The room goes quiet. Outside, a company billboard promises 800 secure jobs.',
        de: 'In der Bäckerei stellt die Tochter eines Bergmanns die Frage, die alle vermeiden: "Wenn der Tagebau schließt, was passiert mit meinem Vater?" Es wird still. Draußen verspricht ein Konzernplakat 800 sichere Arbeitsplätze.'
      },
      options: [
        {
          label: { en: 'Present a transition plan', de: 'Einen Übergangsplan vorstellen' },
          hint: { en: 'Jobs in reforestation, care, energy. Concrete beats slogans.', de: 'Arbeitsplätze in Aufforstung, Care, Energie. Konkretes schlägt Parolen.' },
          chance: 58, check: 'organize',
          effects: { energy: -2 },
          success: { acceptance: 6, size: 4, villageSupport: 10 },
          fail: { acceptance: -2, size: -1 },
          successResult: { en: 'A retired engineer and two apprentices draft a plan on a napkin. It is more credible than the company\'s billboard.', de: 'Ein pensionierter Ingenieur und zwei Auszubildende entwerfen einen Plan auf einer Serviette. Er ist glaubwürdiger als das Konzernplakat.' }
        },
        {
          label: { en: 'Listen to the workers first', de: 'Erst den Arbeiter*innen zuhören' },
          hint: { en: 'No lecture. Just listening.', de: 'Kein Vortrag. Nur Zuhören.' },
          effects: { acceptance: 3, villageSupport: 8, energy: 1, heat: -1 },
          result: { en: 'You spend the evening hearing about shift schedules, bad knees and fear of being forgotten. Nobody converts anybody. Something changes anyway.', de: 'Ihr verbringt den Abend mit Schichtplänen, schlechten Knien und der Angst, vergessen zu werden. Niemand bekehrt jemanden. Trotzdem verändert sich etwas.' }
        },
        {
          label: { en: 'Call the jobs promise a lie', de: 'Das Job-Versprechen eine Lüge nennen' },
          hint: { en: 'True, but not persuasive here.', de: 'Wahr, aber hier nicht überzeugend.' },
          effects: { size: 3, acceptance: -2, villageSupport: -4, energy: 2 },
          result: { en: 'The room claps a little. The miner\'s daughter leaves. The billboard stays up.', de: 'Der Raum klatscht ein bisschen. Die Tochter des Bergmanns geht. Das Plakat bleibt stehen.' }
        }
      ]
    },
    {
      id: 'court_injunction', day: 18, once: false, weight: 4, tone: 'opportunity',
      title: { en: 'A strange victory', de: 'Ein seltsamer Sieg' },
      text: {
        en: 'A court suspends one eviction on a technicality: the company\'s environmental impact report is missing a page. The page is about groundwater. The company appeals immediately.',
        de: 'Ein Gericht setzt eine Räumung aus formalen Gründen aus: Im Umweltbericht des Konzerns fehlt eine Seite. Die Seite handelt vom Grundwasser. Der Konzern legt sofort Berufung ein.'
      },
      options: [
        {
          label: { en: 'Use the pause to fortify', de: 'Die Pause zum Ausbauen nutzen' },
          hint: { en: 'Wood and time. Make the next eviction expensive.', de: 'Holz und Zeit. Die nächste Räumung teuer machen.' },
          effects: { resources: { wood: 2, gear: 1 }, energy: 3, acceptance: 2, court: true },
          result: { en: 'The platforms grow taller. The court protection is temporary, but the view is excellent.', de: 'Die Plattformen wachsen. Der Gerichtsschutz ist befristet, aber die Aussicht ist exzellent.' }
        },
        {
          label: { en: 'Publish the missing page', de: 'Die fehlende Seite veröffentlichen' },
          hint: { en: 'Turn one page into public outrage.', de: 'Aus einer Seite öffentliche Empörung machen.' },
          effects: { acceptance: 5, media: 6, heat: 2, funds: -3 },
          result: { en: 'The page shows arsenic levels four times the limit. The company calls the page "a draft from 2019".', de: 'Die Seite zeigt Arsenwerte viermal über dem Grenzwert. Der Konzern nennt die Seite "einen Entwurf von 2019".' }
        }
      ]
    },
    {
      id: 'storm', day: 20, once: false, weight: 4, tone: 'danger',
      title: { en: 'Storm over the canopy', de: 'Sturm über den Kronen' },
      text: {
        en: 'A storm tears through the valley. Two platforms lose their tarps, the kitchen tent takes on water, and the oldest oak drops a limb the size of a car.',
        de: 'Ein Sturm fegt durch das Tal. Zwei Plattformen verlieren ihre Planen, das Küchenzelt läuft voll, und die älteste Eiche verliert einen Ast so groß wie ein Auto.'
      },
      options: [
        {
          label: { en: 'Rebuild with what you have', de: 'Mit dem Vorhandenen wieder aufbauen' },
          hint: { en: 'Wood and stamina for shelter.', de: 'Holz und Ausdauer für ein Dach.' },
          effects: { resources: { wood: -3 }, energy: -4, acceptance: 2 },
          result: { en: 'Everyone works through the rain. The camp is patched by midnight. The oak is still standing, minus one arm.', de: 'Alle arbeiten durch den Regen. Bis Mitternacht ist das Camp geflickt. Die Eiche steht noch, minus einen Arm.' }
        },
        {
          label: { en: 'Ask the villages for help', de: 'Die Dörfer um Hilfe bitten' },
          hint: { en: 'Accept solidarity. It deepens the bond.', de: 'Solidarität annehmen. Das vertieft die Verbindung.' },
          effects: { resources: { food: 3, wood: 2 }, villageSupport: 8, acceptance: 3, energy: 2 },
          result: { en: 'Three trailers arrive with tarps, soup and a generator. The village council stays for coffee. Nobody talks politics for an hour.', de: 'Drei Anhänger kommen mit Planen, Suppe und einem Generator. Der Dorfrat bleibt auf einen Kaffee. Eine Stunde lang redet niemand über Politik.' }
        },
        {
          label: { en: 'Ride it out', de: 'Aussitzen' },
          hint: { en: 'Save resources. Lose comfort and stamina.', de: 'Ressourcen sparen. Komfort und Ausdauer verlieren.' },
          effects: { energy: -7, acceptance: -2, heat: -1 },
          result: { en: 'The night is cold and wet. In the morning, the camp is intact but the mood is not.', de: 'Die Nacht ist kalt und nass. Am Morgen ist das Camp intakt, die Stimmung nicht.' }
        }
      ]
    },
    {
      id: 'big_raid_event', day: 24, once: true, tone: 'danger',
      title: { en: 'The big eviction', de: 'Die große Räumung' },
      text: {
        en: 'At 5 a.m., blue lights fill the forest road. Three buses, two excavators, a police negotiator with a megaphone. They are not here for one camp. They are here for all of them.',
        de: 'Um 5 Uhr morgens füllen blaue Lichter die Waldstraße. Drei Busse, zwei Bagger, eine Polizeiverhandlerin mit Megafon. Sie sind nicht für ein Camp hier. Sie sind für alle da.'
      },
      options: [
        {
          label: { en: 'Mass mobilisation — call everyone', de: 'Massenmobilisierung — alle anrufen' },
          hint: { en: 'Supporters flood the forest. Numbers protect — and raise heat.', de: 'Unterstützer*innen fluten den Wald. Zahlen schützen — und erhöhen die Hitze.' },
          chance: 62, check: 'organize',
          effects: { size: 4, energy: -3, heat: 6 },
          success: { occupation: 0, acceptance: 4, size: 5, energy: 3 },
          fail: { occupation: -1, acceptance: 1, energy: -5 },
          successResult: { en: 'By seven, four hundred people are on the forest road. The eviction stops at the first barrio. Police retreat to "reassess".', de: 'Um sieben stehen vierhundert Menschen auf der Waldstraße. Die Räumung stoppt am ersten Barrio. Die Polizei zieht sich "zur Neubewertung" zurück.' },
          failResult: { en: 'The buses block the road before supporters arrive. One barrio falls. The rest hold.', de: 'Die Busse blockieren die Straße, bevor die Unterstützer*innen ankommen. Ein Barrio fällt. Der Rest hält.' }
        },
        {
          label: { en: 'Legal observers and lockdown', de: 'Rechtsbeobachter*innen und Lockdown' },
          hint: { en: 'Document everything. Make every eviction costly.', de: 'Alles dokumentieren. Jede Räumung teuer machen.' },
          chance: 56, check: 'media',
          effects: { resources: { money: -8 }, heat: 3 },
          success: { occupation: -1, acceptance: 5, media: 5, heat: -2 },
          fail: { occupation: -2, acceptance: 2, energy: -3 },
          successResult: { en: 'Every helmet number, every injury, every broken door is recorded. Two barrios fall, but the footage forces a parliamentary question.', de: 'Jede Helmnummer, jede Verletzung, jede kaputte Tür wird dokumentiert. Zwei Barrios fallen, aber das Material erzwingt eine parlamentarische Anfrage.' },
          failResult: { en: 'The observers are pushed out before sunrise. The cameras are "accidentally" covered. Three barrios fall.', de: 'Die Beobachter*innen werden vor Sonnenaufgang verdrängt. Die Kameras werden "versehentlich" abgedeckt. Drei Barrios fallen.' }
        },
        {
          label: { en: 'Evacuate the platforms, keep the people', de: 'Plattformen räumen, Menschen behalten' },
          hint: { en: 'Lose ground. Avoid arrests. Live to fight tomorrow.', de: 'Boden verlieren. Verhaftungen vermeiden. Morgen weiterkämpfen.' },
          effects: { occupation: -2, energy: 4, acceptance: 2, heat: -4 },
          result: { en: 'You call everyone down before the buses arrive. The police find empty platforms and a pot of coffee. Nobody is arrested. The camp moves into the village hall.', de: 'Ihr ruft alle herunter, bevor die Busse kommen. Die Polizei findet leere Plattformen und einen Topf Kaffee. Niemand wird verhaftet. Das Camp zieht ins Dorfhaus.' }
        }
      ]
    },
    {
      id: 'police_violence', day: 15, once: false, weight: 5, tone: 'danger',
      title: { en: 'A helmet camera goes viral', de: 'Eine Helmkamera geht viral' },
      text: {
        en: 'A video shows an officer dragging a teenager by the hood off a platform. The teenager is crying. The officer is laughing. By noon, the clip has two million views.',
        de: 'Ein Video zeigt, wie ein Beamter einen Jugendlichen an der Kapuze von einer Plattform zieht. Der Jugendliche weint. Der Beamte lacht. Am Mittag hat der Clip zwei Millionen Aufrufe.'
      },
      options: [
        {
          label: { en: 'Publish it everywhere, calmly', de: 'Überall veröffentlichen, ruhig' },
          hint: { en: 'Sympathy grows. So does police anger.', de: 'Die Sympathie wächst. Der Polizeizorn auch.' },
          effects: { acceptance: 6, media: 8, heat: 4, size: 3 },
          result: { en: 'The clip is used in three talk shows. The police union calls it "taken out of context". Nobody believes them.', de: 'Der Clip läuft in drei Talkshows. Die Polizeigewerkschaft nennt ihn "aus dem Zusammenhang gerissen". Niemand glaubt ihr.' }
        },
        {
          label: { en: 'File a criminal complaint', de: 'Strafanzeige stellen' },
          hint: { en: 'Slow, institutional, harder to dismiss.', de: 'Langsam, institutionell, schwerer abzutun.' },
          effects: { acceptance: 3, heat: -2, resources: { money: -5 }, media: 4 },
          result: { en: 'The complaint is accepted. The case will take two years. The officer is transferred to a desk with a view.', de: 'Die Anzeige wird angenommen. Das Verfahren dauert zwei Jahre. Der Beamte wird an einen Schreibtisch mit Aussicht versetzt.' }
        },
        {
          label: { en: 'Call for a night of action', de: 'Zu einer Nacht der Aktion aufrufen' },
          hint: { en: 'Anger into motion. High risk, high heat.', de: 'Wut in Bewegung. Hohes Risiko, hohe Hitze.' },
          effects: { size: 5, heat: 9, acceptance: -3, energy: 5, funds: -4 },
          result: { en: 'Two power boxes and one company window. The movement feels alive and exposed. The next police budget passes without debate.', de: 'Zwei Stromkästen und ein Konzernfenster. Die Bewegung fühlt sich lebendig und ausgesetzt an. Das nächste Polizeibudget wird ohne Debatte beschlossen.' }
        }
      ]
    },
    {
      id: 'supply_raid', day: 17, once: false, weight: 4, tone: 'danger',
      title: { en: 'They found the depot', de: 'Sie haben das Depot gefunden' },
      text: {
        en: 'At dawn, police and a company lawyer search the supply trailer. They have a warrant for "stolen construction materials". The trailer contains pallets, rope, a generator and 200 litres of soup.',
        de: 'Im Morgengrauen durchsuchen Polizei und ein Konzernanwalt den Materialanhänger. Sie haben einen Durchsuchungsbeschluss wegen "gestohlenen Baumaterials". Im Anhänger: Paletten, Seile, ein Generator und 200 Liter Suppe.'
      },
      options: [
        {
          label: { en: 'Hide the gear in the woods', de: 'Das Material im Wald verstecken' },
          hint: { en: 'Quick, muddy, effective.', de: 'Schnell, matschig, effektiv.' },
          chance: 64, check: 'climb',
          effects: { energy: -2 },
          success: { resources: { gear: 1, wood: 1 }, acceptance: 1 },
          fail: { resources: { gear: -2, wood: -2 }, acceptance: -1, heat: 2 },
          successResult: { en: 'The search finds three pallets and a folding chair. The good gear is under a tarp in the stream.', de: 'Die Durchsuchung findet drei Paletten und einen Campingstuhl. Das gute Material liegt unter einer Plane im Bach.' },
          failResult: { en: 'They find the gear behind the compost toilet. The receipt for the soup is used as evidence.', de: 'Sie finden das Material hinter dem Kompostklo. Der Kassenzettel für die Suppe dient als Beweis.' }
        },
        {
          label: { en: 'Film everything and refuse consent', de: 'Alles filmen und Einverständnis verweigern' },
          hint: { en: 'Legal pressure. Slow the search.', de: 'Rechtlicher Druck. Die Durchsuchung verlangsamen.' },
          chance: 55, check: 'media',
          effects: { heat: 2 },
          success: { acceptance: 3, media: 4, resources: { gear: 1 } },
          fail: { resources: { gear: -2, food: -3 }, acceptance: -1 },
          successResult: { en: 'The search takes four hours and yields nothing but bad PR. The lawyer looks exhausted.', de: 'Die Durchsuchung dauert vier Stunden und bringt außer schlechter PR nichts. Der Anwalt sieht erschöpft aus.' },
          failResult: { en: 'The warrant is valid. The gear and the soup go into a police van. Someone is charged with "receiving stolen soup".', de: 'Der Beschluss ist gültig. Material und Suppe landen in einem Polizeibus. Jemand wird wegen "Hehlerei mit Suppe" angeklagt.' }
        },
        {
          label: { en: 'Let them take it', de: 'Sie sollen es mitnehmen' },
          hint: { en: 'No confrontation. Rebuild later.', de: 'Keine Konfrontation. Später wieder aufbauen.' },
          effects: { resources: { gear: -2, food: -2 }, acceptance: 1, heat: -2, energy: 1 },
          result: { en: 'The trailer empties. The camp eats potatoes for a week and borrows a wheelbarrow. The police look slightly ridiculous carrying soup.', de: 'Der Anhänger leert sich. Das Camp isst eine Woche Kartoffeln und leiht sich eine Schubkarre. Die Polizei sieht leicht lächerlich aus, wie sie Suppe trägt.' }
        }
      ]
    },
    {
      id: 'new_recruits', day: 10, once: false, weight: 5, tone: 'opportunity',
      title: { en: 'A bus from the city', de: 'Ein Bus aus der Stadt' },
      text: {
        en: 'A bus arrives with fourteen people, two crates of vegetables and a dog. They want to help. They have read about the camp online. They have also brought three people nobody knows.',
        de: 'Ein Bus kommt mit vierzehn Menschen, zwei Kisten Gemüse und einem Hund. Sie wollen helfen. Sie haben online vom Camp gelesen. Sie haben auch drei Leute mitgebracht, die niemand kennt.'
      },
      options: [
        {
          label: { en: 'Welcome everyone', de: 'Alle willkommen heißen' },
          hint: { en: 'More hands, more risk. Vetting is optional.', de: 'Mehr Hände, mehr Risiko. Prüfung optional.' },
          effects: { size: 6, energy: 4, resources: { food: 3 }, spawnInfChance: 45 },
          result: { en: 'The camp doubles in noise and triples in soup. Somewhere among the newcomers, someone is taking notes for a different employer.', de: 'Das Camp wird doppelt so laut und dreimal so suppig. Irgendwo unter den Neuen macht jemand Notizen für einen anderen Arbeitgeber.' }
        },
        {
          label: { en: 'Screen everyone first', de: 'Erst alle überprüfen' },
          hint: { en: 'Slower, safer, a little colder.', de: 'Langsamer, sicherer, etwas kälter.' },
          effects: { size: 3, acceptance: 1, energy: 2, spawnInfChance: 10 },
          result: { en: 'Two people leave, offended. Twelve stay. The dog stays with them, which feels like a good sign.', de: 'Zwei Leute gehen beleidigt. Zwölf bleiben. Der Hund bleibt bei ihnen, was wie ein gutes Zeichen wirkt.' }
        },
        {
          label: { en: 'Send them to the village', de: 'Sie ins Dorf schicken' },
          hint: { en: 'Support without swelling the camp.', de: 'Unterstützung, ohne das Camp aufzublähen.' },
          effects: { villageSupport: 10, acceptance: 2, energy: 1, resources: { food: 2 } },
          result: { en: 'The group helps renovate the village hall. The village now has a better kitchen than the camp.', de: 'Die Gruppe hilft beim Renovieren des Dorfsaals. Das Dorf hat jetzt eine bessere Küche als das Camp.' }
        }
      ]
    },
    {
      id: 'mayor_talks', day: 21, once: false, weight: 4, tone: 'social',
      title: { en: 'The mayor wants to talk', de: 'Die Bürgermeisterin will reden' },
      text: {
        en: 'The mayor invites two of you to her office. There is cake. There is also a folder from the company on her desk, and she does not hide it. "I am caught between two fires," she says. "Help me choose."',
        de: 'Die Bürgermeisterin lädt zwei von euch in ihr Büro ein. Es gibt Kuchen. Auf ihrem Schreibtisch liegt auch eine Mappe des Konzerns, und sie versteckt sie nicht. "Ich stehe zwischen zwei Feuern", sagt sie. "Helft mir, zu wählen."'
      },
      options: [
        {
          label: { en: 'Offer a joint statement', de: 'Eine gemeinsame Erklärung anbieten' },
          hint: { en: 'Legitimacy for you, cover for her.', de: 'Legitimität für euch, Deckung für sie.' },
          effects: { acceptance: 3, heat: -4, villageSupport: 8, media: 3 },
          result: { en: 'The statement is bland, careful and surprisingly useful. The mayor now has a public reason to hesitate.', de: 'Die Erklärung ist nichtssagend, vorsichtig und überraschend nützlich. Die Bürgermeisterin hat jetzt einen öffentlichen Grund zu zögern.' }
        },
        {
          label: { en: 'Demand she oppose the mine', de: 'Verlangen, dass sie sich gegen den Tagebau stellt' },
          hint: { en: 'Put her on record. No more ambiguity.', de: 'Sie muss Farbe bekennen. Keine Zweideutigkeit mehr.' },
          effects: { acceptance: 2, heat: 3, size: 3, villageSupport: 3 },
          result: { en: 'She refuses to sign. But she also refuses to condemn you. The company notices both.', de: 'Sie weigert sich zu unterschreiben. Aber sie weigert sich auch, euch zu verurteilen. Der Konzern bemerkt beides.' }
        },
        {
          label: { en: 'Refuse to legitimise her', de: 'Sie nicht legitimieren' },
          hint: { en: 'No talks with the administration.', de: 'Keine Gespräche mit der Verwaltung.' },
          effects: { size: 3, acceptance: -2, energy: 3, heat: 2 },
          result: { en: 'Your base loves it. The village council cancels the hall rental for next week.', de: 'Eure Basis liebt es. Der Dorfrat kündigt die Saalmiete für nächste Woche.' }
        }
      ]
    },
    {
      id: 'winter', day: 23, once: false, weight: 4, tone: 'danger',
      title: { en: 'First frost', de: 'Erster Frost' },
      text: {
        en: 'The water bottles freeze overnight. The tarp is stiff as cardboard. Everyone is awake by four, huddled around a stove that eats wood faster than the camp can collect it.',
        de: 'Die Wasserflaschen frieren über Nacht. Die Plane ist steif wie Pappe. Alle sind um vier wach, zusammengekauert um einen Ofen, der Holz schneller frisst, als das Camp sammeln kann.'
      },
      options: [
        {
          label: { en: 'Insulate with everything you have', de: 'Mit allem isolieren, was ihr habt' },
          hint: { en: 'Burn wood, save bodies.', de: 'Holz verbrennen, Körper retten.' },
          effects: { resources: { wood: -4 }, energy: 5, acceptance: 1 },
          result: { en: 'The platforms are wrapped in old banners and wool. It looks ridiculous. It works.', de: 'Die Plattformen sind in alte Banner und Wolle gewickelt. Es sieht lächerlich aus. Es funktioniert.' }
        },
        {
          label: { en: 'Move into the village hall', de: 'In den Dorfsaal ziehen' },
          hint: { en: 'Warmth and trust, but less presence in the trees.', de: 'Wärme und Vertrauen, aber weniger Präsenz in den Bäumen.' },
          effects: { villageSupport: -4, energy: 8, resources: { food: 3 }, acceptance: 2, occupation: 0 },
          result: { en: 'The hall smells of wet wool and onion soup. The platforms stand empty for two nights. The forest feels further away.', de: 'Der Saal riecht nach nasser Wolle und Zwiebelsuppe. Die Plattformen stehen zwei Nächte leer. Der Wald fühlt sich weiter weg an.' }
        },
        {
          label: { en: 'Endure the cold', de: 'Die Kälte aushalten' },
          hint: { en: 'Hardship builds myth. Also resentment.', de: 'Härte schafft Mythos. Auch Groll.' },
          effects: { energy: -6, acceptance: 3, size: 2, heat: -2 },
          result: { en: 'Nobody leaves. Two people get sick. The story of the frozen night becomes part of camp lore.', de: 'Niemand geht. Zwei werden krank. Die Geschichte der Frostnacht wird Teil der Camp-Legende.' }
        }
      ]
    },
    {
      id: 'negotiation_offer', day: 32, once: true, tone: 'opportunity',
      title: { en: 'An offer from the ministry', de: 'Ein Angebot aus dem Ministerium' },
      text: {
        en: 'A state secretary calls. The ministry offers talks: a temporary halt to new clearing, a round table, and a photo opportunity. They want the camp to stand down during negotiations. They do not offer to stop the mine.',
        de: 'Eine Staatssekretärin ruft an. Das Ministerium bietet Gespräche an: einen vorübergehenden Stopp neuer Rodungen, einen runden Tisch und ein Foto. Sie wollen, dass das Camp während der Verhandlungen stillhält. Den Tagebau stellen sie nicht infrage.'
      },
      options: [
        {
          label: { en: 'Enter talks, keep the camp', de: 'Verhandeln, Camp behalten' },
          hint: { en: 'Buy time and legitimacy. Do not disarm.', de: 'Zeit und Legitimität gewinnen. Nicht abrüsten.' },
          effects: { acceptance: 4, heat: -6, funds: 3, size: 2, energy: 2, policy: 'negotiation' },
          result: { en: 'The first round table lasts six hours. The company sends a lawyer. You send a forest ecologist. The minutes are 40 pages long and contain one useful sentence.', de: 'Der erste runde Tisch dauert sechs Stunden. Der Konzern schickt einen Anwalt. Ihr schickt eine Waldökologin. Das Protokoll hat 40 Seiten und einen nützlichen Satz.' }
        },
        {
          label: { en: 'Refuse without a stop to the mine', de: 'Ohne Tagebau-Stopp ablehnen' },
          hint: { en: 'Keep the moral high ground and the pressure.', de: 'Moralische Klarheit und Druck behalten.' },
          effects: { size: 5, energy: 4, acceptance: 1, heat: 4, media: 2 },
          result: { en: 'Your refusal becomes a slogan. The ministry leaks that you are "unreasonable". Three new villages invite you to speak.', de: 'Eure Ablehnung wird zum Slogan. Das Ministerium lässt durchsickern, ihr seid "unvernünftig". Drei neue Dörfer laden euch zum Reden ein.' }
        },
        {
          label: { en: 'Hold a grassroots assembly first', de: 'Erst eine Basisversammlung abhalten' },
          hint: { en: 'Decide together. Slower, stronger.', de: 'Gemeinsam entscheiden. Langsamer, stärker.' },
          effects: { acceptance: 3, energy: 5, size: 3, heat: -2, villageSupport: 5 },
          result: { en: 'Eighty people argue for three hours and decide to talk — on their own terms, with the camp still standing. The ministry is confused by the lack of a single negotiator.', de: 'Achtzig Menschen streiten drei Stunden und entscheiden zu reden — zu eigenen Bedingungen, mit stehendem Camp. Das Ministerium ist irritiert, weil es keine einzelne Verhandlungsperson gibt.' }
        }
      ]
    },
    {
      id: 'company_bailout', day: 26, once: true, tone: 'danger',
      title: { en: 'A state bailout', de: 'Eine Staatsrettung' },
      text: {
        en: 'The regional government announces emergency support for the "energy security" of the company. The sum is not public. The minister says the forest is "not the only value at stake".',
        de: 'Die Landesregierung kündigt Nothilfe für die "Energiesicherheit" des Konzerns an. Die Summe ist nicht öffentlich. Der Minister sagt, der Wald sei "nicht der einzige Wert auf dem Spiel".'
      },
      options: [
        {
          label: { en: 'Expose the bailout', de: 'Die Staatsrettung aufdecken' },
          hint: { en: 'Follow the money into the headlines.', de: 'Dem Geld in die Schlagzeilen folgen.' },
          chance: 55, check: 'media',
          effects: { resources: { money: -6 } },
          success: { funds: -10, acceptance: 5, media: 6, heat: 1 },
          fail: { funds: 6, acceptance: -2, heat: 2 },
          successResult: { en: 'A leaked memo shows the money is for excavator leases. "Energy security" is a 90-tonne machine with a fresh coat of paint.', de: 'Ein geleaktes Memo zeigt: Das Geld ist für Baggerleasing. "Energiesicherheit" ist eine 90-Tonnen-Maschine mit frischem Lack.' },
          failResult: { en: 'The documents are sealed. The bailout passes. The company buys a new fleet.', de: 'Die Dokumente werden versiegelt. Die Staatsrettung wird beschlossen. Der Konzern kauft eine neue Flotte.' }
        },
        {
          label: { en: 'Blockade the ministry', de: 'Das Ministerium blockieren' },
          hint: { en: 'Make the decision physically expensive.', de: 'Die Entscheidung physisch teuer machen.' },
          effects: { heat: 8, funds: -6, size: 4, acceptance: 1, energy: 2 },
          result: { en: 'Fifty people sit in front of the ministry for a day. The bailout is delayed by two weeks. Two weeks is a lot of forest.', de: 'Fünfzig Menschen sitzen einen Tag vor dem Ministerium. Die Staatsrettung verzögert sich um zwei Wochen. Zwei Wochen sind viel Wald.' }
        },
        {
          label: { en: 'Let them waste the money', de: 'Sie das Geld verschwenden lassen' },
          hint: { en: 'Every euro to the company is a euro not spent on PR.', de: 'Jeder Euro beim Konzern ist ein Euro weniger für PR.' },
          effects: { acceptance: 1, energy: 1, heat: -1 },
          result: { en: 'The money disappears into consultants, lawyers and a rebranding. The new logo is a green leaf. Nobody is fooled.', de: 'Das Geld verschwindet in Beratung, Anwälten und einem Rebranding. Das neue Logo ist ein grünes Blatt. Niemand fällt darauf herein.' }
        }
      ]
    },
    {
      id: 'leak', day: 19, once: false, weight: 4, tone: 'paranoia',
      title: { en: 'The plan is on their desk', de: 'Der Plan liegt auf ihrem Schreibtisch' },
      text: {
        en: 'A sympathetic company employee sends a photo: your weekly plan, photographed on a security manager\'s desk. The meeting time, the route, the names. Only a handful of people knew all three.',
        de: 'Ein mitfühlender Konzernangestellter schickt ein Foto: Euer Wochenplan, fotografiert auf dem Schreibtisch eines Sicherheitsmanagers. Die Zeit, die Route, die Namen. Nur eine Handvoll Leute kannten alle drei.'
      },
      options: [
        {
          label: { en: 'Spread false details', de: 'Falsche Details streuen' },
          hint: { en: 'Catch the leak by giving them a map to nowhere.', de: 'Den Leak fangen, indem ihr eine Karte ins Nichts gebt.' },
          chance: 55, check: 'organize',
          effects: { energy: -2 },
          success: { exposeInf: true, funds: -3, heat: -2, acceptance: 1 },
          fail: { heat: 4, acceptance: -1, energy: -2 },
          successResult: { en: 'The company sends a security team to a bog. The leaker is the only person who could have known the false route. They leave before breakfast.', de: 'Der Konzern schickt ein Sicherheitsteam in ein Moor. Die undichte Stelle ist die einzige Person, die die falsche Route kennen konnte. Sie verschwindet vor dem Frühstück.' },
          failResult: { en: 'The false route is too obviously false. They wait for the real one and film the meeting.', de: 'Die falsche Route ist zu offensichtlich falsch. Sie warten auf die echte und filmen das Treffen.' }
        },
        {
          label: { en: 'Change everything now', de: 'Jetzt alles ändern' },
          hint: { en: 'Paranoia costs time and morale.', de: 'Paranoia kostet Zeit und Moral.' },
          effects: { energy: -5, acceptance: -1, heat: -3, geo: true },
          result: { en: 'Routes are changed, meetings moved, passwords rewritten. The camp feels like a spy film for a week. The leak goes quiet.', de: 'Routen werden geändert, Treffen verlegt, Passwörter neu geschrieben. Eine Woche lang fühlt sich das Camp wie ein Spionagefilm an. Die undichte Stelle wird still.' }
        },
        {
          label: { en: 'Ignore it and keep moving', de: 'Ignorieren und weitermachen' },
          hint: { en: 'Speed over safety. The enemy keeps the advantage.', de: 'Tempo statt Sicherheit. Der Feind behält den Vorteil.' },
          effects: { heat: 2, energy: 3, acceptance: 1 },
          result: { en: 'The camp keeps its rhythm. The next police visit knows exactly which platform has the good coffee.', de: 'Das Camp behält seinen Rhythmus. Der nächste Polizeibesuch weiß genau, auf welcher Plattform der gute Kaffee steht.' }
        }
      ]
    },

    /* ---------- new pool: everyday camp stories ---------- */
    {
      id: 'podcast_visit', day: 7, once: false, weight: 5, tone: 'media',
      title: { en: 'A podcast wants in', de: 'Ein Podcast will rein' },
      text: {
        en: 'Two people with microphones and a very small car arrive. Their podcast has 40,000 listeners and a soft spot for forest occupations. They ask for "the real story, not the press release".',
        de: 'Zwei Menschen mit Mikrofonen und einem sehr kleinen Auto kommen an. Ihr Podcast hat 40.000 Hörer*innen und eine Schwäche für Waldbesetzungen. Sie wollen "die echte Geschichte, nicht die Pressemitteilung".'
      },
      options: [
        {
          label: { en: 'Give them the full tour', de: 'Die volle Tour geben' },
          hint: { en: 'Long, honest, a little dangerous.', de: 'Lang, ehrlich, ein bisschen gefährlich.' },
          effects: { media: 5, acceptance: 3, heat: 3, energy: -2 },
          result: { en: 'They record the kitchen, the rope bridge, the argument about dish duty. The episode is called "The forest answers back". It trends for two days.', de: 'Sie nehmen die Küche auf, die Seilbrücke, den Streit über den Abwasch. Die Folge heißt "Der Wald antwortet". Zwei Tage lang in den Charts.' }
        },
        {
          label: { en: 'Keep it short and safe', de: 'Kurz und sicher halten' },
          hint: { en: 'Media without heat.', de: 'Medien ohne Hitze.' },
          effects: { media: 2, acceptance: 1, energy: 1 },
          result: { en: 'Twenty polite minutes by the gate. It is fine. It is forgettable. Somewhere a listener still looks up the camp.', de: 'Zwanzig höfliche Minuten am Tor. Es ist okay. Es ist vergesslich. Irgendwo googelt trotzdem jemand das Camp.' }
        },
        {
          label: { en: 'Point them at the company instead', de: 'Sie zum Konzern schicken' },
          hint: { en: 'Let the other side talk.', de: 'Die andere Seite reden lassen.' },
          effects: { media: 3, heat: -2, acceptance: 1 },
          result: { en: 'The company press office gives them a tour of a hole in the ground and calls it "reclamation". The episode writes itself.', de: 'Die Konzern-Pressestelle zeigt ihnen ein Loch im Boden und nennt es "Rekultivierung". Die Folge schreibt sich von selbst.' }
        }
      ]
    },
    {
      id: 'bakery_bread', day: 6, once: false, weight: 4, tone: 'social',
      title: { en: 'Day-old bread', de: 'Brot von gestern' },
      text: {
        en: 'The village bakery has a crate of yesterday\'s bread and a guilty conscience about the company contract. The baker\'s daughter is already loading it into a bike trailer.',
        de: 'Die Dorfbäckerei hat eine Kiste Brot von gestern und ein schlechtes Gewissen wegen des Konzernvertrags. Die Bäckerstochter lädt schon alles in einen Fahrradanhänger.'
      },
      options: [
        {
          label: { en: 'Take it and say thank you', de: 'Nehmen und danke sagen' },
          hint: { en: 'Free food, free goodwill.', de: 'Gratis Essen, gratis Wohlwollen.' },
          effects: { resources: { food: 5 }, acceptance: 1, villageSupport: 3 },
          result: { en: 'The camp eats bread for three days. The baker starts leaving the crate out on purpose.', de: 'Das Camp isst drei Tage Brot. Die Bäckerin stellt die Kiste jetzt absichtlich raus.' }
        },
        {
          label: { en: 'Pay for it properly', de: 'Anständig bezahlen' },
          hint: { en: 'Money is tight, dignity is not.', de: 'Geld ist knapp, Würde nicht.' },
          effects: { resources: { food: 6, money: -6 }, acceptance: 2, villageSupport: 5 },
          result: { en: 'The baker refuses at first, then takes the money and puts it in the "forest fund" tin. Word gets around the village by evening.', de: 'Die Bäckerin weigert sich erst, nimmt das Geld dann und steckt es in die "Waldkasse". Am Abend weiß es das ganze Dorf.' }
        },
        {
          label: { en: 'Ask for a weekly delivery', de: 'Wöchentliche Lieferung aushandeln' },
          hint: { en: 'A relationship, not a favour.', de: 'Eine Beziehung, kein Gefallen.' },
          chance: 70, check: 'organize',
          effects: { energy: -1 },
          success: { resources: { food: 4 }, acceptance: 2, villageSupport: 8, money: -4 },
          fail: { resources: { food: 2 }, acceptance: -1 },
          successResult: { en: 'Every Tuesday, bread arrives. It becomes the most reliable thing in the camp calendar.', de: 'Jeden Dienstag kommt Brot. Es wird das Verlässlichste im Campkalender.' },
          failResult: { en: 'The baker likes the idea but the accountant does not. You get one crate and a shrug.', de: 'Die Bäckerin mag die Idee, die Buchhaltung nicht. Es gibt eine Kiste und ein Schulterzucken.' }
        }
      ]
    },
    {
      id: 'school_visit', day: 9, once: false, weight: 4, tone: 'social',
      title: { en: 'A school class at the gate', de: 'Eine Schulklasse am Tor' },
      text: {
        en: 'Twenty-three teenagers, two exhausted teachers and a clipboard of permission slips. They are doing a project on "democracy in practice" and would like to see it.',
        de: 'Dreiundzwanzig Jugendliche, zwei erschöpfte Lehrkräfte und ein Klemmbrett voller Einverständniserklärungen. Sie machen ein Projekt über "Demokratie in der Praxis" und würden sie gern sehen.'
      },
      options: [
        {
          label: { en: 'Teach them everything', de: 'Ihnen alles beibringen' },
          hint: { en: 'Exhausting. Worth it.', de: 'Anstrengend. Es wert.' },
          effects: { acceptance: 3, energy: -4, media: 1 },
          result: { en: 'They learn how a rope bridge is built, how a consensus meeting works, and why the soup is always lentils. Two of them come back with their parents on Sunday.', de: 'Sie lernen, wie eine Seilbrücke gebaut wird, wie ein Konsens-Treffen funktioniert und warum die Suppe immer Linsen hat. Zwei kommen am Sonntag mit ihren Eltern wieder.' }
        },
        {
          label: { en: 'Let them paint banners', de: 'Sie Banner malen lassen' },
          hint: { en: 'Cheap, loud, adorable.', de: 'Günstig, laut, niedlich.' },
          effects: { acceptance: 2, media: 2, energy: 1, resources: { gear: 1 } },
          result: { en: 'The banners are terrible and perfect. One says "TREES HAVE FEELINGS" in glitter. It goes viral.', de: 'Die Banner sind furchtbar und perfekt. Auf einem steht "BÄUME HABEN GEFÜHLE" in Glitzer. Es geht viral.' }
        },
        {
          label: { en: 'Send them to the village', de: 'Sie ins Dorf schicken' },
          hint: { en: 'Safer for everyone.', de: 'Sicherer für alle.' },
          effects: { villageSupport: 5, acceptance: 1, heat: -1 },
          result: { en: 'The village museum does a better tour anyway. The class leaves with postcards and a new opinion about the mine.', de: 'Das Dorfmuseum macht ohnehin die bessere Führung. Die Klasse geht mit Postkarten und einer neuen Meinung über den Tagebau.' }
        }
      ]
    },
    {
      id: 'football_match', day: 12, once: false, weight: 3, tone: 'social',
      title: { en: 'The other team offers a match', de: 'Die andere Mannschaft bietet ein Spiel an' },
      text: {
        en: 'The village football club has a pitch, a grudge against the company and eleven players who would rather play than train. They propose a charity match: "Forest vs. Rest of the World".',
        de: 'Der Dorffußballverein hat einen Platz, einen Groll gegen den Konzern und elf Spieler*innen, die lieber spielen als trainieren. Sie schlagen ein Benefizspiel vor: "Wald gegen den Rest der Welt".'
      },
      options: [
        {
          label: { en: 'Play the match', de: 'Das Spiel austragen' },
          hint: { en: 'Fun, donations, twisted ankles.', de: 'Spaß, Spenden, verstauchte Knöchel.' },
          effects: { money: 10, acceptance: 2, energy: -3, size: 2 },
          result: { en: 'The camp loses 4:3 but wins the crowd. The collection tin raises more than the club\'s annual raffle.', de: 'Das Camp verliert 4:3, gewinnt aber die Zuschauer*innen. Die Spendendose bringt mehr als die Jahresverlosung des Vereins.' }
        },
        {
          label: { en: 'Ask for their old kit instead', de: 'Um ihre alte Ausrüstung bitten' },
          hint: { en: 'Gear beats glory.', de: 'Material schlägt Ruhm.' },
          effects: { resources: { gear: 3 }, acceptance: 1, villageSupport: 4 },
          result: { en: 'Three bags of boots, cones and a suspicious number of whistles. The camp now has enough rope for a second bridge.', de: 'Drei Tüten Stiefel, Hütchen und verdächtig viele Pfeifen. Das Camp hat jetzt genug Seil für eine zweite Brücke.' }
        },
        {
          label: { en: 'Decline politely', de: 'Höflich ablehnen' },
          hint: { en: 'No time for football.', de: 'Keine Zeit für Fußball.' },
          effects: { energy: 2, acceptance: -1 },
          result: { en: 'The team plays without you. Someone paints your logo on a corner flag anyway. It is a little sad.', de: 'Die Mannschaft spielt ohne euch. Trotzdem malt jemand euer Logo auf eine Eckfahne. Es ist ein bisschen traurig.' }
        }
      ]
    },
    {
      id: 'knitting_circle', day: 8, once: false, weight: 4, tone: 'social',
      title: { en: 'The knitting circle declares war', de: 'Der Stricktreff erklärt den Krieg' },
      text: {
        en: 'Six grandmothers, three thermoses and a wool stash that could insulate a small house. They have decided the camp looks cold and the company looks worse.',
        de: 'Sechs Großmütter, drei Thermoskannen und ein Wollvorrat, der ein kleines Haus dämmen könnte. Sie finden, das Camp sieht kalt aus, und der Konzern noch schlimmer.'
      },
      options: [
        {
          label: { en: 'Accept the blankets', de: 'Die Decken annehmen' },
          hint: { en: 'Warm people work better.', de: 'Warme Menschen arbeiten besser.' },
          effects: { energy: 5, acceptance: 1, villageSupport: 4 },
          result: { en: 'Everyone gets a blanket in a colour they did not choose. Nobody trades. The camp sleeps better than it has in weeks.', de: 'Alle bekommen eine Decke in einer Farbe, die sie nicht gewählt haben. Niemand tauscht. Das Camp schläft besser als seit Wochen.' }
        },
        {
          label: { en: 'Commission protest banners', de: 'Protestbanner in Auftrag geben' },
          hint: { en: 'Wool, but political.', de: 'Wolle, aber politisch.' },
          effects: { media: 3, acceptance: 2, energy: 2, resources: { gear: 1 } },
          result: { en: 'A twelve-metre banner appears above the road overnight. It says "KNIT THE FOREST TOGETHER". The police photograph it for the file.', de: 'Über Nacht erscheint ein zwölf Meter langes Banner über der Straße: "STRICKT DEN WALD ZUSAMMEN". Die Polizei fotografiert es für die Akte.' }
        },
        {
          label: { en: 'Ask them to cook instead', de: 'Sie sollen lieber kochen' },
          hint: { en: 'Food is warmth too.', de: 'Essen ist auch Wärme.' },
          effects: { resources: { food: 6 }, energy: 3, villageSupport: 3 },
          result: { en: 'The camp gets a week of casseroles and a lecture on salt. Both are appreciated.', de: 'Das Camp bekommt eine Woche Aufläufe und einen Vortrag über Salz. Beides wird geschätzt.' }
        }
      ]
    },
    {
      id: 'heavy_rain', day: 11, once: false, weight: 4, tone: 'danger',
      title: { en: 'The sky opens', de: 'Der Himmel öffnet sich' },
      text: {
        en: 'It rains for eleven hours. The path becomes a stream, the stream becomes a problem, and three platforms are now indoor pools. Someone\'s sleeping bag is floating.',
        de: 'Es regnet elf Stunden. Der Weg wird ein Bach, der Bach ein Problem, und drei Plattformen sind jetzt Innenpools. Jemandes Schlafsack schwimmt.'
      },
      options: [
        {
          label: { en: 'Repair everything today', de: 'Heute alles reparieren' },
          hint: { en: 'Wood and backs, spent now.', de: 'Holz und Rücken, jetzt investiert.' },
          effects: { resources: { wood: -3 }, energy: -4, acceptance: 1 },
          result: { en: 'New drainage, higher floors, a tarp cathedral. The camp smells of wet wood and stubbornness. Nobody gets sick.', de: 'Neue Drainage, höhere Böden, eine Planen-Kathedrale. Das Camp riecht nach nassem Holz und Sturheit. Niemand wird krank.' }
        },
        {
          label: { en: 'Move to the village hall', de: 'In die Dorfhalle ziehen' },
          hint: { en: 'Dry, cramped, political.', de: 'Trocken, eng, politisch.' },
          effects: { acceptance: 2, heat: -2, villageSupport: 3, energy: 2 },
          result: { en: 'The village opens its hall. The camp sleeps among folding tables and election posters. The company calls it "a hostile takeover of a community centre".', de: 'Das Dorf öffnet seine Halle. Das Camp schläft zwischen Klapptischen und Wahlplakaten. Der Konzern nennt es "feindliche Übernahme eines Bürgerhauses".' }
        },
        {
          label: { en: 'Dance in the rain', de: 'Im Regen tanzen' },
          hint: { en: 'Morale is a resource too.', de: 'Moral ist auch eine Ressource.' },
          effects: { energy: 3, acceptance: 3, media: 2, heat: -1 },
          result: { en: 'Somebody finds a speaker, somebody finds a tarp, everybody finds mud. A video of the camp dancing in the storm gets 80,000 views.', de: 'Jemand findet einen Lautsprecher, jemand eine Plane, alle finden Matsch. Ein Video vom tanzenden Camp im Sturm bekommt 80.000 Aufrufe.' }
        }
      ]
    },
    {
      id: 'heatwave', day: 18, once: false, weight: 4, tone: 'danger',
      title: { en: 'Three days of 38 degrees', de: 'Drei Tage mit 38 Grad' },
      text: {
        en: 'The forest becomes an oven. The water tank is warm, the creek is low, and the company chooses this week to run its loudest machinery. Tempers and temperatures rise together.',
        de: 'Der Wald wird zum Backofen. Der Wassertank ist warm, der Bach niedrig, und der Konzern wählt ausgerechnet diese Woche für seine lautesten Maschinen. Laune und Temperatur steigen gemeinsam.'
      },
      options: [
        {
          label: { en: 'Ration water and rest at noon', de: 'Wasser rationieren, mittags ruhen' },
          hint: { en: 'Boring, effective.', de: 'Langweilig, effektiv.' },
          effects: { energy: -2, acceptance: 1, resources: { food: -2 } },
          result: { en: 'The camp shifts to dawn and dusk work. Productivity drops, health does not. The kitchen serves cold soup and everyone pretends it is a delicacy.', de: 'Das Camp arbeitet in Morgendämmerung und Abenddämmerung. Produktivität sinkt, Gesundheit nicht. Die Küche serviert kalte Suppe, alle tun, als sei das eine Delikatesse.' }
        },
        {
          label: { en: 'Ask the village for water', de: 'Das Dorf um Wasser bitten' },
          hint: { en: 'Neighbours with hoses.', de: 'Nachbarschaft mit Schläuchen.' },
          effects: { villageSupport: 6, acceptance: 2, resources: { food: 2 }, money: -4 },
          result: { en: 'The fire brigade fills the tank "for a training exercise". Nobody asks what the exercise is. The camp drinks cold water and cheers.', de: 'Die Feuerwehr füllt den Tank "im Rahmen einer Übung". Niemand fragt, was geübt wird. Das Camp trinkt kaltes Wasser und jubelt.' }
        },
        {
          label: { en: 'Buy bottled water in town', de: 'In der Stadt Flaschenwasser kaufen' },
          hint: { en: 'Money for comfort.', de: 'Geld für Komfort.' },
          effects: { money: -10, energy: 4, acceptance: 1 },
          result: { en: 'Two pallets of water and a bag of ice. The ice is gone in an hour, but for that hour the camp is the happiest place in the forest.', de: 'Zwei Paletten Wasser und eine Tüte Eis. Das Eis ist nach einer Stunde weg, aber in dieser Stunde ist das Camp der glücklichste Ort im Wald.' }
        }
      ]
    },
    {
      id: 'drone_overhead', day: 14, once: false, weight: 4, tone: 'danger',
      when: function (s) { return s.stats.heat >= 30; },
      title: { en: 'Something hums above the canopy', de: 'Etwas summt über den Baumkronen' },
      text: {
        en: 'A drone circles the camp at the height of a bad decision. It has a camera, a spotlight and the unmistakable confidence of something bought with public money.',
        de: 'Eine Drohne kreist über dem Camp auf der Höhe einer schlechten Entscheidung. Sie hat eine Kamera, einen Scheinwerfer und die unverkennbare Arroganz von etwas, das mit öffentlichen Geldern gekauft wurde.'
      },
      options: [
        {
          label: { en: 'Stay out of sight', de: 'Außer Sichtweite bleiben' },
          hint: { en: 'Deny them the footage.', de: 'Ihnen das Material verweigern.' },
          effects: { energy: -2, heat: -3 },
          result: { en: 'For six hours nobody moves between the tarps. The drone films leaves, a squirrel and a very boring stump. The battery wins in the end.', de: 'Sechs Stunden lang bewegt sich niemand zwischen den Planen. Die Drohne filmt Blätter, ein Eichhörnchen und einen sehr langweiligen Stumpf. Am Ende gewinnt der Akku.' }
        },
        {
          label: { en: 'Film the drone filming you', de: 'Die Drohne beim Filmen filmen' },
          hint: { en: 'Turn surveillance into a story.', de: 'Überwachung zur Geschichte machen.' },
          effects: { media: 4, acceptance: 2, heat: 2 },
          result: { en: 'The clip is titled "They sent a robot to watch us cook soup". Even the local paper calls the police press office for comment. They decline.', de: 'Der Clip heißt "Sie schickten einen Roboter, um uns Suppe kochen zu sehen". Sogar die Lokalzeitung fragt bei der Polizeipressestelle nach. Die schweigt.' }
        },
        {
          label: { en: 'Bring it down', de: 'Sie runterholen' },
          hint: { en: 'Satisfying. Loud. Expensive.', de: 'Befriedigend. Laut. Teuer.' },
          chance: 55, check: 'climb',
          effects: { energy: -2, heat: 4 },
          success: { resources: { gear: 2 }, media: 2, acceptance: 1 },
          fail: { heat: 6, acceptance: -2, funds: -2 },
          successResult: { en: 'A well-aimed throw and a blanket. The drone lands in the ferns. Its memory card is now camp property and its owner is furious.', de: 'Ein gut gezielter Wurf und eine Decke. Die Drohne landet im Farn. Ihre Speicherkarte ist jetzt Campeigentum, ihr Besitzer wütend.' },
          failResult: { en: 'You miss, twice. The drone records both attempts and the police add "attempted destruction of official equipment" to the file.', de: 'Zweimal daneben. Die Drohne filmt beide Versuche und die Polizei ergänzt die Akte um "versuchte Zerstörung von Dienstgerät".' }
        }
      ]
    },
    {
      id: 'eviction_notice', day: 19, once: false, weight: 4, tone: 'danger',
      when: function (s) { return s.stats.heat >= 35; },
      title: { en: 'A notice nailed to a tree', de: 'Ein Bescheid an einem Baum' },
      text: {
        en: 'An official envelope is nailed to the oldest beech. It announces the "immediate clearance of unauthorised structures" and gives a phone number for questions. The phone number rings in an empty office.',
        de: 'Ein amtlicher Umschlag ist an die älteste Buche genagelt. Er kündigt die "unverzügliche Räumung nicht genehmigter Anlagen" an und nennt eine Nummer für Rückfragen. Die Nummer klingelt in einem leeren Büro.'
      },
      options: [
        {
          label: { en: 'Fight it legally', de: 'Rechtlich dagegen vorgehen' },
          hint: { en: 'Paper against chainsaws.', de: 'Papier gegen Kettensägen.' },
          chance: 58, check: 'organize',
          effects: { money: -8, energy: -2 },
          success: { court: true, acceptance: 3, heat: -4 },
          fail: { acceptance: -1, heat: 2 },
          successResult: { en: 'The injunction is filed before lunch. A judge schedules a hearing and the clearance is suspended. The camp celebrates with tea and a very long group hug.', de: 'Der Eilantrag ist vor Mittag eingereicht. Eine Richterin setzt einen Termin an und die Räumung wird ausgesetzt. Das Camp feiert mit Tee und einer sehr langen Gruppenumarmung.' },
          failResult: { en: 'The form was sent to the wrong office. It comes back with a stamp, a case number and a new deadline.', de: 'Das Formular ging an die falsche Stelle. Es kommt mit Stempel, Aktenzeichen und neuer Frist zurück.' }
        },
        {
          label: { en: 'Hold a public reading of the notice', de: 'Den Bescheid öffentlich vorlesen' },
          hint: { en: 'Make bureaucracy ridiculous.', de: 'Bürokratie lächerlich machen.' },
          effects: { acceptance: 3, media: 3, heat: 1 },
          result: { en: 'Forty people listen to the notice being read aloud by a nine-year-old. It takes four minutes. The applause takes longer. The notice is framed and hung in the kitchen.', de: 'Vierzig Menschen hören zu, wie ein neunjähriges Kind den Bescheid vorliest. Es dauert vier Minuten. Der Applaus länger. Der Bescheid wird gerahmt und in der Küche aufgehängt.' }
        },
        {
          label: { en: 'Take the notice down', de: 'Den Bescheid abhängen' },
          hint: { en: 'Direct action, direct consequences.', de: 'Direkte Aktion, direkte Folgen.' },
          effects: { heat: 5, acceptance: 2, energy: 1 },
          result: { en: 'The nail goes into the "wall of shame" beside the kitchen. The clearance date is now a rumour. The police write down who was holding the hammer.', de: 'Der Nagel wandert an die "Wand der Schande" neben der Küche. Der Räumungstermin ist jetzt ein Gerücht. Die Polizei notiert, wer den Hammer hielt.' }
        }
      ]
    },
    {
      id: 'kitchen_inspection', day: 16, once: false, weight: 3, tone: 'danger',
      when: function (s) { return s.stats.heat >= 30; },
      title: { en: 'The health inspector arrives', de: 'Die Lebensmittelkontrolle kommt' },
      text: {
        en: 'A man in a fleece jacket and a clipboard wants to inspect "the food preparation area". He has driven forty minutes to be here and clearly hopes to find something. The soup is, objectively, excellent.',
        de: 'Ein Mann in Fleecejacke und mit Klemmbrett möchte "den Bereich der Speisenzubereitung" prüfen. Er ist vierzig Minuten gefahren und hofft sichtlich, etwas zu finden. Die Suppe ist objektiv hervorragend.'
      },
      options: [
        {
          label: { en: 'Cooperate fully', de: 'Voll kooperieren' },
          hint: { en: 'Boring, but clean.', de: 'Langweilig, aber sauber.' },
          effects: { money: -5, acceptance: 1, heat: -2 },
          result: { en: 'He finds a missing label on a jar of pickles and a thermometer that is "not calibrated to his satisfaction". The camp passes. He seems disappointed.', de: 'Er findet ein fehlendes Etikett auf einem Gurkenglas und ein Thermometer, das "nicht zu seiner Zufriedenheit kalibriert" ist. Das Camp besteht. Er wirkt enttäuscht.' }
        },
        {
          label: { en: 'Invite the press to the inspection', de: 'Die Presse zur Kontrolle einladen' },
          hint: { en: 'Transparency as a weapon.', de: 'Transparenz als Waffe.' },
          chance: 65, check: 'media',
          effects: { heat: 2 },
          success: { media: 4, acceptance: 2, heat: -2 },
          fail: { heat: 4, acceptance: -2, money: -4 },
          successResult: { en: 'The inspector inspects a pot of soup while three cameras watch. He finds nothing. The headline writes itself: "State inspects soup, finds soup".', de: 'Der Kontrolleur prüft einen Suppentopf vor drei Kameras. Er findet nichts. Die Schlagzeile schreibt sich selbst: "Staat prüft Suppe, findet Suppe".' },
          failResult: { en: 'He does not like being filmed and writes up every minor thing. The camp spends the afternoon labeling jars.', de: 'Er mag es nicht, gefilmt zu werden, und notiert jede Kleinigkeit. Das Camp verbringt den Nachmittag mit Etikettieren.' }
        },
        {
          label: { en: 'Offer him lunch', de: 'Ihm Mittagessen anbieten' },
          hint: { en: 'Hospitality is hard to inspect.', de: 'Gastfreundschaft lässt sich schwer prüfen.' },
          effects: { resources: { food: -2 }, acceptance: 2, heat: -3, energy: 1 },
          result: { en: 'He eats two bowls and admits the lentils are better than the canteen at the district office. The report is three lines long. One of them is a recipe request.', de: 'Er isst zwei Schüsseln und gibt zu, dass die Linsen besser sind als in der Kantine des Landratsamts. Der Bericht ist drei Zeilen lang. Eine davon ist eine Rezeptanfrage.' }
        }
      ]
    },
    {
      id: 'greenwash_tour', day: 12, once: false, weight: 4, tone: 'company',
      title: { en: 'The company opens its gates', de: 'Der Konzern öffnet seine Tore' },
      text: {
        en: 'The company invites journalists, local politicians and — pointedly — the camp to a "transparency tour". There are new signs, a coffee machine and a model of the mine with tiny plastic trees glued on.',
        de: 'Der Konzern lädt Journalist*innen, Kommunalpolitik und — mit Betonung — das Camp zu einer "Transparenztour". Es gibt neue Schilder, eine Kaffeemaschine und ein Modell des Tagebaus mit aufgeklebten Plastikbäumchen.'
      },
      options: [
        {
          label: { en: 'Go and ask hard questions', de: 'Hingehen und kritisch fragen' },
          hint: { en: 'Use their stage.', de: 'Ihre Bühne nutzen.' },
          chance: 62, check: 'media',
          effects: { energy: -2 },
          success: { media: 4, acceptance: 2, heat: 2 },
          fail: { acceptance: -2, heat: 2 },
          successResult: { en: 'The camp delegate asks why the model forest has no roots. The room laughs. The PR manager does not. The clip is everywhere by evening.', de: 'Die Camp-Delegation fragt, warum der Modellwald keine Wurzeln hat. Der Saal lacht. Die PR-Managerin nicht. Der Clip ist am Abend überall.' },
          failResult: { en: 'The questions are answered with slides. The slides are answered with more slides. The camp delegate leaves with a branded pen and a headache.', de: 'Die Fragen werden mit Folien beantwortet. Die Folien mit weiteren Folien. Die Camp-Delegation geht mit einem Werbekuli und Kopfschmerzen.' }
        },
        {
          label: { en: 'Disrupt the tour', de: 'Die Tour stören' },
          hint: { en: 'Loud, visible, risky.', de: 'Laut, sichtbar, riskant.' },
          effects: { heat: 5, acceptance: 2, media: 2 },
          result: { en: 'A banner unrolls behind the coffee machine: "THIS IS NOT RECLAMATION". Security escorts the camp out. The photos are excellent.', de: 'Hinter der Kaffeemaschine rollt ein Banner aus: "DAS IST KEINE REKULTIVIERUNG". Security begleitet das Camp hinaus. Die Fotos sind hervorragend.' }
        },
        {
          label: { en: 'Ignore the invitation', de: 'Die Einladung ignorieren' },
          hint: { en: 'Starve the spectacle.', de: 'Das Spektakel aushungern.' },
          effects: { energy: 2, heat: -2, acceptance: -1 },
          result: { en: 'The tour happens without you. The photos show empty chairs where the camp should be. The company calls it "dialogue readiness". The local paper calls it "a room with no one in it".', de: 'Die Tour findet ohne euch statt. Die Fotos zeigen leere Stühle, wo das Camp sitzen sollte. Der Konzern nennt es "Dialogbereitschaft". Die Lokalzeitung nennt es "einen Raum ohne Menschen".' }
        }
      ]
    },
    {
      id: 'buyout_offer', day: 23, once: true, tone: 'company',
      title: { en: 'An offer with a number on it', de: 'Ein Angebot mit einer Zahl darauf' },
      text: {
        en: 'A lawyer in a very clean car brings a proposal: the camp leaves voluntarily, the company donates to a local youth club, and everyone signs a non-disclosure agreement. The number is larger than the camp\'s entire budget.',
        de: 'Ein Anwalt in einem sehr sauberen Auto bringt einen Vorschlag: Das Camp geht freiwillig, der Konzern spendet an einen Jugendclub, und alle unterschreiben eine Geheimhaltungsvereinbarung. Die Zahl ist größer als das gesamte Camp-Budget.'
      },
      options: [
        {
          label: { en: 'Refuse in public', de: 'Öffentlich ablehnen' },
          hint: { en: 'Principles, loudly.', de: 'Prinzipien, laut.' },
          effects: { acceptance: 5, media: 4, heat: 3, size: 3 },
          result: { en: 'The refusal is posted on the camp gate within the hour: "The forest is not for sale, but the lawyer can have a coffee." Support surges.', de: 'Die Ablehnung hängt binnen einer Stunde am Camp-Tor: "Der Wald steht nicht zum Verkauf, aber der Anwalt bekommt einen Kaffee." Der Rückhalt steigt.' }
        },
        {
          label: { en: 'Negotiate a better deal', de: 'Einen besseren Deal aushandeln' },
          hint: { en: 'Money for the movement.', de: 'Geld für die Bewegung.' },
          chance: 55, check: 'organize',
          effects: { energy: -2 },
          success: { money: 20, acceptance: 2, heat: -2 },
          fail: { money: 5, acceptance: -3, heat: 2 },
          successResult: { en: 'The camp negotiates the donation up, keeps the camp, and gets the NDA struck out. The lawyer needs a second coffee and a lie-down.', de: 'Das Camp handelt die Spende hoch, behält das Camp und streicht die Geheimhaltung. Der Anwalt braucht einen zweiten Kaffee und eine Pause.' },
          failResult: { en: 'The camp accepts a smaller sum and the story leaks anyway. Some supporters feel bought. The company feels clever. Nobody wins.', de: 'Das Camp nimmt eine kleinere Summe und die Geschichte leakt trotzdem. Manche Unterstützer*innen fühlen sich gekauft. Der Konzern fühlt sich clever. Niemand gewinnt.' }
        },
        {
          label: { en: 'Leak the offer', de: 'Das Angebot leaken' },
          hint: { en: 'Sunlight is the best disinfectant.', de: 'Sonnenlicht ist das beste Desinfektionsmittel.' },
          effects: { media: 5, acceptance: 3, heat: 2, money: 3 },
          result: { en: 'The offer letter appears online with the number highlighted. The company calls it "a draft, taken out of context". The context is very clear.', de: 'Der Angebotsbrief erscheint online, die Zahl markiert. Der Konzern nennt es "einen Entwurf, aus dem Zusammenhang gerissen". Der Zusammenhang ist sehr klar.' }
        }
      ]
    },
    {
      id: 'security_firm', day: 20, once: true, tone: 'danger',
      when: function (s) { return s.stats.heat >= 45; },
      title: { en: 'Private security in matching jackets', de: 'Privatsecurity in einheitlichen Jacken' },
      text: {
        en: 'Eight men in matching fleece jackets appear at the forest edge. They are not police, but they have radios, a van and a contract. They start "documenting" the camp from a respectful, legally ambiguous distance.',
        de: 'Acht Männer in einheitlichen Fleecejacken erscheinen am Waldrand. Sie sind keine Polizei, aber sie haben Funkgeräte, einen Van und einen Vertrag. Aus respektvoller, rechtlich unklarer Entfernung beginnen sie, das Camp zu "dokumentieren".'
      },
      options: [
        {
          label: { en: 'Confront them directly', de: 'Sie direkt konfrontieren' },
          hint: { en: 'Meet the eye. Raise the heat.', de: 'Blickkontakt. Hitze steigt.' },
          effects: { heat: 5, acceptance: 2, energy: -2, size: 1 },
          result: { en: 'Thirty people walk slowly toward the van. Nobody shouts. The security team retreats to the road and takes photos of the number plate. Their contract is public record; someone is already looking it up.', de: 'Dreißig Menschen gehen langsam auf den Van zu. Niemand schreit. Das Sicherheitsteam zieht sich zur Straße zurück und fotografiert das Kennzeichen. Der Vertrag ist öffentlich; jemand sucht ihn schon.' }
        },
        {
          label: { en: 'Document and expose the contract', de: 'Den Vertrag dokumentieren und veröffentlichen' },
          hint: { en: 'Paper beats muscle.', de: 'Papier schlägt Muskeln.' },
          chance: 60, check: 'media',
          effects: { energy: -1 },
          success: { media: 5, acceptance: 2, heat: -3, money: 4 },
          fail: { heat: 3, acceptance: -1 },
          successResult: { en: 'The contract is found in a public procurement portal. The camp publishes a map of every security post. The firm\'s other clients get nervous.', de: 'Der Vertrag findet sich in einem öffentlichen Vergabeportal. Das Camp veröffentlicht eine Karte aller Sicherheitsposten. Die anderen Kunden der Firma werden nervös.' }
        },
        {
          label: { en: 'Offer them soup', de: 'Ihnen Suppe anbieten' },
          hint: { en: 'Disarm with dinner.', de: 'Mit Abendessen entwaffnen.' },
          effects: { acceptance: 3, heat: -4, resources: { food: -2 }, energy: 1 },
          result: { en: 'Two of them take the soup. One asks, quietly, what the camp actually wants. By the end of the week he has quit the firm. He brings his cousin to the next demo.', de: 'Zwei nehmen die Suppe. Einer fragt leise, was das Camp eigentlich will. Ende der Woche hat er gekündigt. Er bringt seinen Cousin zur nächsten Demo mit.' }
        }
      ]
    },
    {
      id: 'court_hearing', day: 15, once: false, weight: 3, tone: 'opportunity',
      title: { en: 'A court date appears', de: 'Ein Gerichtstermin erscheint' },
      text: {
        en: 'The administrative court has scheduled a hearing on the mine\'s water permit. The camp is not a party, but the judge has allowed "affected citizens" to speak. The company\'s lawyers have brought three trolleys of paper.',
        de: 'Das Verwaltungsgericht hat eine mündliche Verhandlung zur Wassererlaubnis des Tagebaus angesetzt. Das Camp ist nicht Partei, aber die Richterin lässt "betroffene Bürger*innen" sprechen. Die Anwälte des Konzerns haben drei Rollwagen Papier mitgebracht.'
      },
      options: [
        {
          label: { en: 'Send the legal aid crew', de: 'Die Rechtshilfe schicken' },
          hint: { en: 'Slow, technical, powerful.', de: 'Langsam, technisch, wirksam.' },
          chance: 62, check: 'organize',
          effects: { money: -6, energy: -2 },
          success: { acceptance: 3, heat: -3, court: true },
          fail: { acceptance: -1, heat: 2, money: -4 },
          successResult: { en: 'The legal team finds a missing measurement in the water report. The hearing is adjourned and the permit is suspended. The company\'s trolleys leave with one fewer document.', de: 'Das Rechtsteam findet eine fehlende Messung im Wasserbericht. Die Verhandlung wird vertagt und die Erlaubnis ausgesetzt. Die Rollwagen des Konzerns fahren mit einem Dokument weniger davon.' },
          failResult: { en: 'The judge thanks the camp for its "passionate but legally creative" submission. The permit stands. The trolleys leave victorious.', de: 'Die Richterin dankt dem Camp für seinen "leidenschaftlichen, aber rechtlich kreativen" Vortrag. Die Erlaubnis bleibt. Die Rollwagen fahren siegreich davon.' }
        },
        {
          label: { en: 'Testify in person', de: 'Persönlich aussagen' },
          hint: { en: 'A story beats a paragraph.', de: 'Eine Geschichte schlägt einen Paragrafen.' },
          effects: { media: 3, acceptance: 2, heat: 1, energy: -2 },
          result: { en: 'A camp resident describes the creek before the mine came. The room goes quiet. The court reporter writes it down word for word.', de: 'Ein Camp-Bewohner beschreibt den Bach, bevor der Tagebau kam. Der Saal wird still. Die Gerichtsreporterin schreibt es Wort für Wort mit.' }
        },
        {
          label: { en: 'Skip it', de: 'Auslassen' },
          hint: { en: 'The forest needs hands today.', de: 'Der Wald braucht heute Hände.' },
          effects: { energy: 2, acceptance: -1 },
          result: { en: 'The hearing happens without the camp. The permit is extended by two years. Nobody notices until the next newsletter.', de: 'Die Verhandlung findet ohne das Camp statt. Die Erlaubnis wird um zwei Jahre verlängert. Niemand merkt es bis zum nächsten Newsletter.' }
        }
      ]
    },
    {
      id: 'forest_fire_watch', day: 21, once: false, weight: 3, tone: 'danger',
      title: { en: 'Dry grass, one match', de: 'Trockenes Gras, ein Streichholz' },
      text: {
        en: 'The forestry office issues the highest fire warning. The camp has candles, a kitchen, a generator and a lot of very dry needles. A single spark would end the occupation faster than any eviction.',
        de: 'Das Forstamt gibt die höchste Waldbrandwarnstufe aus. Das Camp hat Kerzen, eine Küche, einen Generator und sehr viele trockene Nadeln. Ein Funke würde die Besetzung schneller beenden als jede Räumung.'
      },
      options: [
        {
          label: { en: 'Set up a night fire watch', de: 'Eine Nachtfeuerwache aufstellen' },
          hint: { en: 'Tired eyes, safe forest.', de: 'Müde Augen, sicherer Wald.' },
          effects: { energy: -3, acceptance: 2, heat: -1 },
          result: { en: 'Two people per shift with a bucket, a radio and a lot of bad coffee. The forest stays quiet. The watch becomes a permanent institution.', de: 'Zwei Leute pro Schicht mit Eimer, Funkgerät und viel schlechtem Kaffee. Der Wald bleibt ruhig. Die Wache wird eine dauerhafte Einrichtung.' }
        },
        {
          label: { en: 'Ask the village fire brigade to train you', de: 'Die Dorffeuerwehr um Ausbildung bitten' },
          hint: { en: 'Skills and trust in one.', de: 'Fähigkeiten und Vertrauen in einem.' },
          effects: { villageSupport: 6, acceptance: 2, resources: { gear: 2 }, energy: -2 },
          result: { en: 'A volunteer firefighter spends a Sunday teaching hose handling and firebreaks. The camp gets a real extinguisher and a new ally.', de: 'Ein freiwilliger Feuerwehrmann verbringt einen Sonntag mit Schlauchkunde und Brandschneisen. Das Camp bekommt einen echten Feuerlöscher und eine neue Verbündete.' }
        },
        {
          label: { en: 'Ignore the warning', de: 'Die Warnung ignorieren' },
          hint: { en: 'What are the odds?', de: 'Wie hoch ist die Wahrscheinlichkeit?' },
          effects: { energy: 3, heat: 1 },
          result: { en: 'Nothing burns. The camp gets lucky. Somewhere in the forestry office, someone adds the camp to a list of "known risk factors".', de: 'Nichts brennt. Das Camp hat Glück. Irgendwo im Forstamt setzt jemand das Camp auf eine Liste "bekannter Risikofaktoren".' }
        }
      ]
    },
    {
      id: 'owl_nest', day: 8, once: false, weight: 3, tone: 'social',
      title: { en: 'A protected owl moves in', de: 'Eine geschützte Eule zieht ein' },
      text: {
        en: 'A forestry student finds a nest of a protected owl species in the exact tree the company planned to cut next. The nest is thirty metres up and the student is very excited.',
        de: 'Ein Forststudent findet ein Nest einer geschützten Eulenart genau in dem Baum, den der Konzern als nächstes fällen wollte. Das Nest ist dreißig Meter hoch und der Student sehr aufgeregt.'
      },
      options: [
        {
          label: { en: 'Document and report it', de: 'Dokumentieren und melden' },
          hint: { en: 'Law, feathers, paperwork.', de: 'Recht, Federn, Papierkram.' },
          effects: { acceptance: 2, media: 3, heat: -2 },
          result: { en: 'The report goes to the nature conservation authority. The tree gets a protection order. The company calls it "a nest-shaped delay".', de: 'Die Meldung geht an die Naturschutzbehörde. Der Baum bekommt eine Schutzanordnung. Der Konzern nennt es "eine nestförmige Verzögerung".' }
        },
        {
          label: { en: 'Guard the tree around the clock', de: 'Den Baum rund um die Uhr bewachen' },
          hint: { en: 'People and feathers.', de: 'Menschen und Federn.' },
          effects: { energy: -4, acceptance: 3, media: 2, heat: 2 },
          result: { en: 'A rotation of owl watchers with sleeping bags and a thermos. The harvester turns around at the sight of them. The owl, apparently, does not care.', de: 'Eine Rotation von Eulenwächter*innen mit Schlafsäcken und Thermoskanne. Der Harvester dreht beim Anblick um. Die Eule interessiert das offenbar nicht.' }
        },
        {
          label: { en: 'Keep it quiet', de: 'Es geheim halten' },
          hint: { en: 'No attention, no protection.', de: 'Keine Aufmerksamkeit, kein Schutz.' },
          effects: { energy: 1, heat: -1 },
          result: { en: 'The nest stays a camp secret. Two weeks later the tree is gone. The student does not speak to anyone for a day.', de: 'Das Nest bleibt ein Campgeheimnis. Zwei Wochen später ist der Baum weg. Der Student spricht einen Tag lang mit niemandem.' }
        }
      ]
    },
    {
      id: 'forest_rave', day: 17, once: false, weight: 3, tone: 'opportunity',
      title: { en: 'Someone suggests a rave', de: 'Jemand schlägt eine Rave vor' },
      text: {
        en: 'A sound system collective offers to throw a "solidarity rave" in the forest. They promise 300 people, a solar generator and "no trace except the memory". The police promise to notice.',
        de: 'Ein Soundsystem-Kollektiv bietet eine "Solidaritäts-Rave" im Wald an. Sie versprechen 300 Menschen, einen Solar-Generator und "keine Spuren außer der Erinnerung". Die Polizei verspricht, es zu bemerken.'
      },
      options: [
        {
          label: { en: 'Let them play', de: 'Sie spielen lassen' },
          hint: { en: 'Money, noise, heat.', de: 'Geld, Lärm, Hitze.' },
          effects: { money: 18, acceptance: 3, heat: 4, energy: -3, size: 3 },
          result: { en: 'Three hundred people dance between the trees until sunrise. The donation bucket fills twice. The police arrive at 2 a.m., look at the crowd, and leave.', de: 'Dreihundert Menschen tanzen bis Sonnenaufgang zwischen den Bäumen. Der Spendeneimer füllt sich zweimal. Die Polizei kommt um 2 Uhr, sieht die Menge und fährt wieder.' }
        },
        {
          label: { en: 'Keep it small and acoustic', de: 'Klein und akustisch halten' },
          hint: { en: 'Quiet money, quiet heat.', de: 'Leises Geld, leise Hitze.' },
          effects: { money: 8, acceptance: 2, media: 1, energy: 1 },
          result: { en: 'Sixty people, two guitars and a lot of tea. It is the least illegal party anyone can remember. The neighbours bring cake.', de: 'Sechzig Menschen, zwei Gitarren und viel Tee. Es ist die am wenigsten illegale Party, an die sich jemand erinnern kann. Die Nachbarschaft bringt Kuchen.' }
        },
        {
          label: { en: 'Decline the offer', de: 'Das Angebot ablehnen' },
          hint: { en: 'Protect the camp\'s image.', de: 'Das Image des Camps schützen.' },
          effects: { energy: 2, acceptance: 1, heat: -2 },
          result: { en: 'The collective plays in a city club instead and mentions the camp on stage. The camp sleeps well. Somebody is slightly disappointed.', de: 'Das Kollektiv spielt stattdessen in einem Stadtclub und erwähnt das Camp auf der Bühne. Das Camp schläft gut. Jemand ist ein bisschen enttäuscht.' }
        }
      ]
    },
    {
      id: 'prison_visit', day: 5, once: false, weight: 5, tone: 'danger',
      when: function (s) { return s.crews.some(function (c) { return c.arrested; }); },
      title: { en: 'Visiting hours at the police camp', de: 'Besuchszeit im Polizeicamp' },
      text: {
        en: 'A lawyer can get two people into the police compound for twenty minutes. Your comrades are behind a fence, in a container with a broken heater. They look tired but not broken. They have questions about the camp.',
        de: 'Ein Anwalt bekommt zwei Personen für zwanzig Minuten auf das Polizeigelände. Eure Genoss*innen sitzen hinter einem Zaun in einem Container mit kaputter Heizung. Sie sehen müde aus, aber nicht gebrochen. Sie haben Fragen zum Camp.'
      },
      options: [
        {
          label: { en: 'Send the lawyer with a habeas corpus filing', de: 'Den Anwalt mit einem Haftprüfungsantrag schicken' },
          hint: { en: 'Slow, but real.', de: 'Langsam, aber echt.' },
          chance: 55, check: 'organize',
          effects: { money: -8, energy: -1 },
          success: { freePrisoner: true, acceptance: 2, heat: -2 },
          fail: { acceptance: 1, heat: 1 },
          successResult: { en: 'The filing works. One comrade walks out through the gate before the hearing is even scheduled. The police call it "a procedural formality".', de: 'Der Antrag wirkt. Eine Genossin verlässt das Tor, bevor die Verhandlung überhaupt angesetzt ist. Die Polizei nennt es "eine Verfahrensformalität".' },
          failResult: { en: 'The judge refuses the filing and adds two days "for administrative reasons". The lawyer apologizes with a bag of pastries.', de: 'Der Richter lehnt den Antrag ab und hängt zwei Tage "aus verwaltungstechnischen Gründen" an. Der Anwalt entschuldigt sich mit einer Tüte Gebäck.' }
        },
        {
          label: { en: 'Smuggle in messages and morale', de: 'Nachrichten und Mut hineinschmuggeln' },
          hint: { en: 'Small things matter inside.', de: 'Kleine Dinge zählen drinnen.' },
          chance: 70, check: 'climb',
          effects: { energy: -2, heat: 1 },
          success: { acceptance: 3, energy: 2, media: 1 },
          fail: { heat: 3, acceptance: -1 },
          successResult: { en: 'Notes in a tobacco pouch, chocolate in a sock. The prisoners laugh for the first time in days. The guard notices nothing except the smell of chocolate.', de: 'Zettel im Tabakbeutel, Schokolade in einer Socke. Die Gefangenen lachen zum ersten Mal seit Tagen. Der Wärter merkt nichts außer dem Schokoladengeruch.' },
          failResult: { en: 'A guard searches the bag and finds the notes. Visiting rights are suspended for a week. The prisoners get the blame.', de: 'Ein Wärter durchsucht die Tasche und findet die Zettel. Das Besuchsrecht wird für eine Woche ausgesetzt. Die Schuld bekommen die Gefangenen.' }
        },
        {
          label: { en: 'Just be there', de: 'Einfach da sein' },
          hint: { en: 'Twenty minutes of being human.', de: 'Zwanzig Minuten Menschsein.' },
          effects: { acceptance: 2, energy: 1, heat: -1 },
          result: { en: 'Nobody talks about strategy. They talk about the camp cat, the soup, the noise of the harvester. Twenty minutes is not enough and exactly enough.', de: 'Niemand spricht über Strategie. Sie sprechen über die Campkatze, die Suppe, den Lärm des Harvesters. Zwanzig Minuten sind nicht genug und genau genug.' }
        }
      ]
    },
    {
      id: 'pipeline_leak', day: 18, once: false, weight: 3, tone: 'company',
      title: { en: 'Something is leaking', de: 'Etwas läuft aus' },
      text: {
        en: 'A walker reports an oily sheen on the creek below the mine. It smells like diesel and looks like evidence. The company says it is "naturally occurring seepage". The creek disagrees.',
        de: 'Eine Spaziergängerin meldet einen Ölfilm am Bach unterhalb des Tagebaus. Es riecht nach Diesel und sieht nach Beweismaterial aus. Der Konzern sagt, es sei "natürliche Sickerung". Der Bach widerspricht.'
      },
      options: [
        {
          label: { en: 'Take samples and document everything', de: 'Proben nehmen und alles dokumentieren' },
          hint: { en: 'Science as a weapon.', de: 'Wissenschaft als Waffe.' },
          chance: 68, check: 'media',
          effects: { energy: -2, resources: { gear: -1 } },
          success: { media: 4, acceptance: 3, heat: 2 },
          fail: { heat: 2, acceptance: -1 },
          successResult: { en: 'The samples go to a university lab. The results are worse than expected. The story runs with a map, a photo and a quote from a very angry chemist.', de: 'Die Proben gehen an ein Universitätslabor. Die Ergebnisse sind schlimmer als erwartet. Die Geschichte erscheint mit Karte, Foto und einem Zitat einer sehr wütenden Chemikerin.' },
          failResult: { en: 'The samples are taken, but the lab is busy and the company publishes its own "independent" report first. Yours arrives too late and smells of diesel.', de: 'Die Proben werden genommen, aber das Labor ist ausgelastet und der Konzern veröffentlicht zuerst seinen eigenen "unabhängigen" Bericht. Eurer kommt zu spät und riecht nach Diesel.' }
        },
        {
          label: { en: 'Block the pipe', de: 'Das Rohr blockieren' },
          hint: { en: 'Direct, dirty, effective.', de: 'Direkt, dreckig, wirksam.' },
          effects: { heat: 4, acceptance: 2, resources: { gear: -2 }, energy: -1 },
          result: { en: 'The flow stops. The company sends a repair crew and a security guard. The repair crew is polite. The guard takes photos of everyone.', de: 'Der Abfluss stoppt. Der Konzern schickt ein Reparaturteam und einen Wachmann. Das Team ist höflich. Der Wachmann fotografiert alle.' }
        },
        {
          label: { en: 'Report it to the authorities', de: 'Es den Behörden melden' },
          hint: { en: 'The correct, slow way.', de: 'Der korrekte, langsame Weg.' },
          effects: { acceptance: 1, heat: -1, energy: 1 },
          result: { en: 'The authority opens a file. The file will be reviewed in six to eight months. The creek will have moved on by then.', de: 'Die Behörde legt eine Akte an. Die Akte wird in sechs bis acht Monaten geprüft. Der Bach wird bis dahin weitergezogen sein.' }
        }
      ]
    },
    {
      id: 'mayor_debate', day: 24, once: false, weight: 3, tone: 'social',
      title: { en: 'The mayor wants a debate', de: 'Der Bürgermeister will eine Debatte' },
      text: {
        en: 'Election season. The mayor, who has so far avoided the forest like a puddle, invites the camp to a public debate in the village hall. The company has also been invited. The company has also been asked to bring a representative, not a lawyer.',
        de: 'Wahlkampf. Der Bürgermeister, der den Wald bisher wie eine Pfütze gemieden hat, lädt das Camp zu einer öffentlichen Debatte in die Dorfhalle. Der Konzern ist auch eingeladen. Der Konzern soll eine Vertretung schicken, keinen Anwalt.'
      },
      options: [
        {
          label: { en: 'Send your best speaker', de: 'Die beste Rednerin schicken' },
          hint: { en: 'A room, a microphone, a chance.', de: 'Ein Saal, ein Mikrofon, eine Chance.' },
          chance: 62, check: 'organize',
          effects: { energy: -2 },
          success: { acceptance: 4, media: 3, villageSupport: 5, heat: -2 },
          fail: { acceptance: -2, media: 1, heat: 1 },
          successResult: { en: 'The camp speaker answers every question with a name, a date and a fact. The company representative answers with a slide. The room decides.', de: 'Die Camp-Rednerin beantwortet jede Frage mit einem Namen, einem Datum und einer Tatsache. Der Konzernvertreter antwortet mit einer Folie. Der Saal entscheidet.' },
          failResult: { en: 'The camp speaker gets angry at the third question about "jobs". The company representative looks reasonable. The room is not convinced by either side, but the mayor sleeps better.', de: 'Die Camp-Rednerin wird bei der dritten Frage nach "Arbeitsplätzen" wütend. Der Konzernvertreter wirkt vernünftig. Der Saal ist von keiner Seite überzeugt, aber der Bürgermeister schläft besser.' }
        },
        {
          label: { en: 'Bring the whole camp', de: 'Das ganze Camp mitbringen' },
          hint: { en: 'Numbers are an argument.', de: 'Zahlen sind ein Argument.' },
          effects: { acceptance: 2, media: 2, heat: 3, size: 1 },
          result: { en: 'Forty people in work jackets fill the back rows. The debate becomes a hearing. The mayor promises a "round table". The company representative promises nothing and leaves early.', de: 'Vierzig Menschen in Arbeitsjacken füllen die hinteren Reihen. Die Debatte wird zur Anhörung. Der Bürgermeister verspricht einen "Runden Tisch". Der Konzernvertreter verspricht nichts und geht früh.' }
        },
        {
          label: { en: 'Skip the debate, hold a forest tour', de: 'Debatte auslassen, Waldtour anbieten' },
          hint: { en: 'Show, don\'t tell.', de: 'Zeigen statt erzählen.' },
          effects: { acceptance: 2, media: 1, heat: -1, energy: 1, villageSupport: 3 },
          result: { en: 'Twenty villagers come to the forest instead. They see the owl, the creek and the barrios. The mayor comes too, quietly, without a photographer.', de: 'Zwanzig Dorfbewohner*innen kommen stattdessen in den Wald. Sie sehen die Eule, den Bach und die Barrios. Der Bürgermeister kommt auch, leise, ohne Fotografen.' }
        }
      ]
    },
    {
      id: 'journalist_workshop', day: 10, once: false, weight: 3, tone: 'opportunity',
      title: { en: 'A journalism workshop', de: 'Ein Journalismus-Workshop' },
      text: {
        en: 'A freelance journalist offers a weekend workshop: how to write a press release, how to talk to a camera, how to check a claim before you share it. Six people sign up immediately. Three of them mostly want to argue.',
        de: 'Eine freiberufliche Journalistin bietet einen Wochenend-Workshop an: Wie schreibt man eine Pressemitteilung, wie spricht man mit einer Kamera, wie prüft man eine Behauptung, bevor man sie teilt. Sechs Leute melden sich sofort an. Drei wollen vor allem diskutieren.'
      },
      options: [
        {
          label: { en: 'Take the workshop seriously', de: 'Den Workshop ernst nehmen' },
          hint: { en: 'Skills that stay.', de: 'Fähigkeiten, die bleiben.' },
          effects: { media: 3, acceptance: 1, energy: -2 },
          result: { en: 'The camp produces its first proper press release. It is two pages, has a quote, a date and no exclamation marks. A regional paper runs it almost unchanged.', de: 'Das Camp produziert seine erste richtige Pressemitteilung. Zwei Seiten, ein Zitat, ein Datum und keine Ausrufezeichen. Eine Regionalzeitung druckt sie fast unverändert.' }
        },
        {
          label: { en: 'Invite villagers too', de: 'Dorfbewohner*innen einladen' },
          hint: { en: 'Media literacy is shared.', de: 'Medienkompetenz ist teilbar.' },
          effects: { media: 2, acceptance: 2, villageSupport: 4, energy: -2 },
          result: { en: 'The village hall fills with farmers, teenagers and two very skeptical pensioners. By Sunday, the village has its own newsletter. The first issue is about the mine.', de: 'Die Dorfhalle füllt sich mit Landwirt*innen, Jugendlichen und zwei sehr skeptischen Rentnern. Am Sonntag hat das Dorf seinen eigenen Newsletter. Die erste Ausgabe handelt vom Tagebau.' }
        },
        {
          label: { en: 'Politely decline', de: 'Höflich ablehnen' },
          hint: { en: 'Not now.', de: 'Jetzt nicht.' },
          effects: { energy: 2, media: -1 },
          result: { en: 'The journalist leaves a handout and her card. Somebody pins the handout to the kitchen wall. Nobody reads it for a week.', de: 'Die Journalistin lässt ein Handout und ihre Karte da. Jemand pinnt das Handout an die Küchenwand. Eine Woche lang liest es niemand.' }
        }
      ]
    },
    {
      id: 'lost_hiker', day: 9, once: false, weight: 3, tone: 'social',
      title: { en: 'A lost hiker at dusk', de: 'Eine verlorene Wanderin in der Dämmerung' },
      text: {
        en: 'A hiker with a dead phone and one very inadequate jacket stumbles into the camp. She took a wrong turn looking for the lake. The temperature is dropping and the path back is not obvious in the dark.',
        de: 'Eine Wanderin mit leerem Handy und einer sehr unzureichenden Jacke stolpert ins Camp. Sie hat sich auf dem Weg zum See verlaufen. Die Temperatur fällt und der Rückweg ist im Dunkeln nicht offensichtlich.'
      },
      options: [
        {
          label: { en: 'Guide her out tonight', de: 'Sie heute Nacht hinausbringen' },
          hint: { en: 'Tired legs, good deed.', de: 'Müde Beine, gute Tat.' },
          effects: { energy: -3, acceptance: 2, villageSupport: 3 },
          result: { en: 'Two people walk her to the village with headlamps. Her mother sends a thank-you card and a box of pastries. The card goes on the kitchen wall.', de: 'Zwei bringen sie mit Stirnlampen ins Dorf. Ihre Mutter schickt eine Dankeskarte und eine Schachtel Gebäck. Die Karte kommt an die Küchenwand.' }
        },
        {
          label: { en: 'Give her a bunk and breakfast', de: 'Ihr eine Koje und Frühstück geben' },
          hint: { en: 'Warm, fed, curious.', de: 'Warm, satt, neugierig.' },
          effects: { energy: 1, acceptance: 3, media: 2, resources: { food: -2 } },
          result: { en: 'She stays for breakfast and asks a hundred questions. Her blog post is titled "I got lost and found a movement". It is shared by people who have never been to a forest.', de: 'Sie bleibt zum Frühstück und stellt hundert Fragen. Ihr Blogpost heißt "Ich habe mich verlaufen und eine Bewegung gefunden". Geteilt von Menschen, die noch nie in einem Wald waren.' }
        },
        {
          label: { en: 'Point her toward the road', de: 'Ihr die Straße zeigen' },
          hint: { en: 'Fast and distant.', de: 'Schnell und distanziert.' },
          effects: { energy: 1, acceptance: -1 },
          result: { en: 'She finds the road and a taxi. Later she tells people the camp was "hard to find and not very welcoming". The story is not untrue.', de: 'Sie findet die Straße und ein Taxi. Später erzählt sie, das Camp sei "schwer zu finden und nicht sehr einladend". Die Geschichte ist nicht falsch.' }
        }
      ]
    },
    {
      id: 'mushroom_forage', day: 7, once: false, weight: 3, tone: 'opportunity',
      title: { en: 'The mushroom spot', de: 'Die Pilzstelle' },
      text: {
        en: 'The scouts have found a slope covered in chanterelles. It is early, the season is short, and the kitchen has a very large pan. There is also a forestry rule about gathering, which everyone interprets differently.',
        de: 'Die Waldläufer*innen haben einen Hang voller Pfifferlinge gefunden. Es ist früh, die Saison kurz und die Küche hat eine sehr große Pfanne. Außerdem gibt es eine Forstregel zum Sammeln, die alle unterschiedlich auslegen.'
      },
      options: [
        {
          label: { en: 'Harvest carefully', de: 'Vorsichtig ernten' },
          hint: { en: 'Food and forest knowledge.', de: 'Essen und Waldwissen.' },
          effects: { resources: { food: 6 }, acceptance: 1, energy: -1 },
          result: { en: 'Six baskets, one very good risotto and a new camp tradition. The slope is left with enough for next year. The kitchen smells like butter and garlic for days.', de: 'Sechs Körbe, ein sehr gutes Risotto und eine neue Camptradition. Am Hang bleibt genug für nächstes Jahr. Die Küche riecht tagelang nach Butter und Knoblauch.' }
        },
        {
          label: { en: 'Sell the surplus in town', de: 'Den Überschuss in der Stadt verkaufen' },
          hint: { en: 'Forest food, camp money.', de: 'Waldessen, Campgeld.' },
          effects: { resources: { food: 2, money: 9 }, acceptance: 1, energy: -2 },
          result: { en: 'A restaurant buys the lot and asks for a weekly delivery. The camp has found a small, delicious income stream. The forestry office has not been consulted.', de: 'Ein Restaurant kauft alles und fragt nach wöchentlicher Lieferung. Das Camp hat eine kleine, köstliche Einnahmequelle gefunden. Das Forstamt wurde nicht gefragt.' }
        },
        {
          label: { en: 'Leave them for the animals', de: 'Sie den Tieren lassen' },
          hint: { en: 'Patience is a resource.', de: 'Geduld ist eine Ressource.' },
          effects: { acceptance: 2, energy: 2, media: 1 },
          result: { en: 'The decision becomes a small story about restraint. A photographer takes a picture of the empty slope at sunset. It is, unexpectedly, beautiful.', de: 'Die Entscheidung wird eine kleine Geschichte über Zurückhaltung. Ein Fotograf macht bei Sonnenuntergang ein Bild vom leeren Hang. Es ist unerwartet schön.' }
        }
      ]
    },
    {
      id: 'anonymous_threat', day: 13, once: false, weight: 3, tone: 'paranoia',
      title: { en: 'A letter with no signature', de: 'Ein Brief ohne Unterschrift' },
      text: {
        en: 'A plain envelope arrives at the village post office. Inside: one photo of the camp gate at night, taken from the road, and a single line printed on office paper. "You have until the end of the month."',
        de: 'Ein schlichter Umschlag kommt in der Dorfpost an. Darin: ein Foto des Camptors bei Nacht, von der Straße aus aufgenommen, und eine einzige Zeile auf Büropapier. "Ihr habt bis Monatsende."'
      },
      options: [
        {
          label: { en: 'Publish it', de: 'Veröffentlichen' },
          hint: { en: 'Threats lose power in daylight.', de: 'Drohungen verlieren im Licht an Macht.' },
          effects: { media: 4, acceptance: 2, heat: 2 },
          result: { en: 'The photo and the line go online with the caption "We are still here." The post gets more engagement than anything the company has published all year.', de: 'Foto und Zeile gehen online mit der Überschrift "Wir sind noch hier." Der Beitrag bekommt mehr Reichweite als alles, was der Konzern dieses Jahr veröffentlicht hat.' }
        },
        {
          label: { en: 'Increase night watches', de: 'Nachtwachen verstärken' },
          hint: { en: 'Safety first.', de: 'Sicherheit zuerst.' },
          effects: { energy: -3, heat: -2, acceptance: 1 },
          result: { en: 'Two people per night, a whistle, a rota on the kitchen wall. Nothing happens. The letter goes into the "wall of shame" next to the eviction notice.', de: 'Zwei Leute pro Nacht, eine Pfeife, ein Plan an der Küchenwand. Nichts passiert. Der Brief kommt an die "Wand der Schande" neben den Räumungsbescheid.' }
        },
        {
          label: { en: 'Hand it to the police', de: 'Der Polizei übergeben' },
          hint: { en: 'Let them explain themselves.', de: 'Sie sollen sich erklären.' },
          effects: { acceptance: 1, heat: -3, energy: 1 },
          result: { en: 'The police take the letter, give you a case number and lose it within a week. The officer who takes it does not meet your eyes.', de: 'Die Polizei nimmt den Brief, gibt euch ein Aktenzeichen und verliert ihn innerhalb einer Woche. Der Beamte, der ihn annimmt, schaut euch nicht in die Augen.' }
        }
      ]
    }
  ];

  const EVENT_BY_ID = {};
  EVENTS.forEach(function (e) { EVENT_BY_ID[e.id] = e; });

  /* generic newspaper headlines (bilingual) */
  const HEADLINES = [
    { en: 'COMPANY: "WE ARE CREATING THE FUTURE" — Forest clears throat.', de: 'KONZERN: "WIR SCHAFFEN ZUKUNFT" — Der Wald räuspert sich.' },
    { en: 'LOCAL PAPER: Protesters "mostly peaceful, surprisingly organised".', de: 'LOKALZEITUNG: Protestierende "überwiegend friedlich, überraschend organisiert".' },
    { en: 'Police union demands more funding for "forest operations".', de: 'Polizeigewerkschaft fordert mehr Geld für "Wald-Einsätze".' },
    { en: 'Ministry insists the mine is "climate neutral by 2045".', de: 'Ministerium beteuert, der Tagebau sei "klimaneutral bis 2045".' },
    { en: 'Village bakery sells out of "treehouse bread".', de: 'Dorfbäckerei verkauft "Baumhausbrot" ausverkauft.' },
    { en: 'Company consultant: "The forest is an underused asset."', de: 'Konzernberater: "Der Wald ist ein ungenutztes Asset."' },
    { en: 'Lawyer reads 400 pages aloud. Court falls asleep, then postpones.', de: 'Anwalt liest 400 Seiten vor. Gericht schläft ein und vertagt.' },
    { en: 'Weather: rain, more rain, and one dramatic sunset.', de: 'Wetter: Regen, mehr Regen und ein dramatischer Sonnenuntergang.' },
    { en: 'Two hundred people attend forest walk. Three get lost. All found.', de: 'Zweihundert Menschen bei Waldwanderung. Drei verlaufen sich. Alle gefunden.' },
    { en: 'Company denies spying. Spy denies company. Both deny forest.', de: 'Konzern bestreitet Spionage. Spion bestreitet Konzern. Beide bestreiten Wald.' },
    { en: 'Coal price rises. So does everything else.', de: 'Kohlepreis steigt. Alles andere auch.' },
    { en: 'Anonymous donor pays for solar panels on the camp kitchen.', de: 'Anonyme Spende bezahlt Solarpanels für die Campküche.' },
    { en: 'Local council approves "consultation process" for road nobody can stop.', de: 'Kreisrat beschließt "Beteiligungsverfahren" für Straße, die niemand stoppen kann.' },
    { en: 'Forest radio: someone saw a deer. This is the best news all week.', de: 'Waldradio: Jemand hat ein Reh gesehen. Das sind die besten Nachrichten der Woche.' },
    { en: 'Company PR: "We planted 10,000 trees." Location: a parking lot.', de: 'Konzern-PR: "Wir pflanzten 10.000 Bäume." Ort: ein Parkplatz.' }
  ];

  window.FO = window.FO || {};
  FO.CONFIG = CONFIG;
  FO.ACTIONS = ACTIONS;
  FO.ACTION_BY_ID = ACTION_BY_ID;
  FO.DIFFICULTIES = DIFFICULTIES;
  FO.FOREST_NAMES = FOREST_NAMES;
  FO.GROUP_NAMES = GROUP_NAMES;
  FO.BARRIO_NAMES = BARRIO_NAMES;
  FO.CREW_NAMES = CREW_NAMES;
  FO.VILLAGES = VILLAGES;
  FO.EVENTS = EVENTS;
  FO.EVENT_BY_ID = EVENT_BY_ID;
  FO.HEADLINES = HEADLINES;
})();
