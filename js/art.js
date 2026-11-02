/* ============================================================
   art.js — hand-drawn SVG primitives & icon set
   ============================================================ */
(function () {
  const INK = '#17120f';
  const PAPER = '#f2e7d0';

  const ICONS = {
    energy: '<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z" fill="currentColor" stroke="currentColor" stroke-width="1.2"/>',
    acceptance: '<path d="M12 21s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.6-8 11-8 11z" fill="currentColor"/>',
    heat: '<path d="M6 17v-4a6 6 0 0 1 12 0v4"/><rect x="3" y="17" width="18" height="3" rx="1"/><path d="M12 2.5v2M5.5 5l1.4 1.4M18.5 5l-1.4 1.4"/>',
    forest: '<path d="M8 3 3 11h3l-2 4h8l-2-4h3L8 3z"/><path d="M8 15v6"/><path d="M17 8l-3 5h2l-1.5 3h7L20 13h2l-5-5z"/>',
    company: '<path d="M3 21V10l5 3V10l5 3V6h5v15z"/><path d="M6.5 17h2M11.5 17h2M16.5 17h2M6.5 13h2M16.5 12h2"/><path d="M2 21h20"/>',
    supporters: '<circle cx="9" cy="7.5" r="2.5"/><circle cx="17" cy="8.5" r="2"/><path d="M4 20c0-3 2-5 5-5s5 2 5 5"/><path d="M14 20c0-2.4 1.5-4 3.5-4S21 17.6 21 20"/>',
    media: '<path d="M3 10v4h4l6 4V6L7 10H3z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8 8 0 0 1 0 13"/>',
    wood: '<path d="M3 7h14v4H3zM5 12h14v4H5z"/><circle cx="3" cy="9" r="2.2"/><circle cx="5" cy="14" r="2.2"/><path d="M18 9h2M20 14h2"/>',
    food: '<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 8c0-2 1-3 1-5M12 8c0-2 1-3 1-5M16 8c0-2 1-3 1-5"/>',
    gear: '<path d="M14.5 6.5a4.5 4.5 0 0 0-5.8 5.8L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 5.8-5.8L14 13l-2-2 2.5-4.5z"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M15.5 7a5 5 0 1 0 0 10M8 11h6M8 14h6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    x: '<path d="M5 5l14 14M19 5L5 19"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    saw: '<path d="M3 14h17l-2-4H5l-2 4z"/><path d="M7 10V7M11 10V7M15 10V7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    pylon: '<path d="M4 21 12 3l8 18M7 14h10M9 8h6M8 17h8"/><path d="M2 8h20"/>',
    rail: '<path d="M6 3v18M18 3v18M4 7h16M4 12h16M4 17h16"/>',
    road: '<path d="M8 21 10 3M16 21 14 3M12 6v3M12 12v3M12 18v2"/>',
    camp: '<path d="M12 4 3 20h18L12 4z"/><path d="M12 12v8"/>',
    build: '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L4 14v6h6l7-7"/><path d="M3 21h8"/>',
    scout: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/><path d="M8 9h4M8 12h3"/>',
    kitchen: '<path d="M4 10h16v5a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-5z"/><path d="M2 10h20"/><path d="M8 6c0-1.5 1-2 1-3M12 6c0-1.5 1-2 1-3M16 6c0-1.5 1-2 1-3"/>',
    demo: '<path d="M4 9v6h4l7 4V5L8 9H4z"/><path d="M18 8a5 5 0 0 1 0 8M20.5 5.5a8 8 0 0 1 0 13"/><path d="M7 15v4h3"/>',
    blockade: '<path d="M3 9h18v4H3zM3 9l3-4h4L7 9M15 9l3-4h4l-3 4"/><path d="M6 13v7M18 13v7M3 17h18"/>',
    sabotage: '<path d="M13 2 6 12h5l-1 9 8-11h-5l1-8z"/><path d="M3 3l18 18" stroke-width="2.6"/>',
    workshop: '<path d="M4 4h7v16H4zM11 4h9v16h-9z"/><path d="M6 8h3M6 12h3M14 8h3M14 12h3M14 16h3"/>',
    network: '<path d="M3 5h11v8H8l-4 3v-3H3z"/><path d="M14 9h7v7h-3v3l-3-3h-1z"/>',
    trust: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    rest: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    fundraise: '<path d="M4 15h16v5H4z"/><path d="M7 15V9a5 5 0 0 1 10 0v6"/><circle cx="12" cy="6" r="2.5"/><path d="M4 20h16"/>',
    reforest: '<path d="M12 21v-7"/><path d="M12 14c-5 0-7-3-7-7 4 0 7 2 7 7z" fill="currentColor"/><path d="M12 14c5 0 7-3 7-7-4 0-7 2-7 7z" fill="currentColor"/><path d="M8 21h8"/>',
    fist: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10m0-3.5v-2a1.5 1.5 0 0 1 3 0V10m0-3a1.5 1.5 0 0 1 3 0v3m0-1a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-2-3a1.7 1.7 0 0 1 2.8-1.8L7 13"/>',
    eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    treehouse: '<path d="M4 21V8h5v13M15 21V8h5v13"/><path d="M2 8h20"/><path d="M6 8V5h12v3"/><path d="M12 5V2"/><path d="M8 13h2M8 17h2M14 13h2M14 17h2"/>',
    spark: '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="currentColor"/>',
    skull: '<path d="M5 10a7 7 0 0 1 14 0v4l-2 2v3h-3v2h-4v-2H7v-3l-2-2v-4z"/><circle cx="9.5" cy="11" r="1.5" fill="currentColor"/><circle cx="14.5" cy="11" r="1.5" fill="currentColor"/>',
    scale: '<path d="M12 3v18M7 21h10"/><path d="M4 7h16M6 7l-3 6h6L6 7zM18 7l-3 6h6l-3-6z"/>',
    flag: '<path d="M5 21V3"/><path d="M5 4h11l2 4-2 4H5z" fill="currentColor"/>',
    music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>'
  };

  function icon(name, cls) {
    const path = ICONS[name] || ICONS.info;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || '') + '" aria-hidden="true">' + path + '</svg>';
  }

  const LOGOS = {
    fist: '<g fill="' + INK + '"><path d="M14 38V21c0-2 1-3 2.6-3S19 19 19 21v8h1.4V19c0-2 1.2-3.2 2.8-3.2s2.8 1.2 2.8 3.2v10h1.2v-7.5c0-2 1.2-3.2 2.8-3.2S33 19.5 33 21.5V32c0 7-4.5 12-11 12h-2c-4 0-6.5-1.6-8.4-4.6l-2.8-4.4c-1.2-1.9-.2-4 1.8-4.6 1.4-.4 2.7.1 3.6 1.3L14 33V38z"/><path d="M22 13c0-4 2.4-7.2 5.8-8.6-.6 2.8-.2 5 1.4 6.8-2.4-.4-4.4.2-6 1.8z" fill="#3d7a4a"/><rect x="15" y="39" width="17" height="4" fill="' + INK + '"/></g>',
    tree: '<g fill="' + INK + '"><path d="M24 4 11 24h7l-4 8h20l-4-8h7L24 4z"/><rect x="21.5" y="32" width="5" height="12"/><path d="M24 8l-7 12h14L24 8z" fill="#3d7a4a"/><path d="M8 37l4-3M40 37l-4-3M8 30l4 2M40 30l-4 2" stroke="' + INK + '" stroke-width="2" fill="none"/></g>',
    mask: '<g><path d="M8 20c0-6 7-11 16-11s16 5 16 11-7 13-16 13S8 26 8 20z" fill="' + INK + '"/><path d="M13 18h9M26 18h9" stroke="' + PAPER + '" stroke-width="4" stroke-linecap="round"/><path d="M17 28c4 2 10 2 14 0" stroke="' + PAPER + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M9 14l6 3M39 14l-6 3" stroke="#ff3d7f" stroke-width="3"/></g>',
    bird: '<g fill="' + INK + '"><path d="M6 26c8-2 13-8 15-16 4 6 8 8 14 7-4 3-7 8-12 11-3 2-6 3-10 3l3 6-5-5-7-1 5-3-3-2z"/><circle cx="28" cy="14" r="1.2" fill="' + PAPER + '"/><path d="M8 34c4 2 9 2 13 0" stroke="#c9f24b" stroke-width="3" fill="none"/></g>',
    ant: '<g fill="' + INK + '"><ellipse cx="24" cy="14" rx="5" ry="4"/><ellipse cx="24" cy="24" rx="6" ry="5"/><ellipse cx="24" cy="35" rx="8" ry="6"/><path d="M20 12 12 5M28 12l8-7M18 22 8 18M30 22l10-4M18 32 9 32M30 32h9M18 36l-7 7M30 36l7 7" stroke="' + INK + '" stroke-width="2.5" fill="none"/><path d="M18 11 14 6M30 11l4-5" stroke="#ff3d7f" stroke-width="2.5"/></g>',
    sun: '<g><circle cx="24" cy="24" r="10" fill="' + INK + '"/><path d="M24 4v7M24 37v7M4 24h7M37 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M20 25c0-4 4-6 7-4-1 4-3 6-7 6z" fill="#c9f24b"/></g>'
  };

  const LOGO_KEYS = ['fist', 'tree', 'mask', 'bird', 'ant', 'sun'];

  function logo(key) {
    const body = LOGOS[key] || LOGOS.fist;
    return '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + '</svg>';
  }

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ------ terrain primitives ------ */
  function conifer(x, y, s, color, dark) {
    const c = color || '#3f8a4a';
    const d = dark || '#2c6236';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-1.2" y="-2" width="2.4" height="8" fill="#4a3220" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<path d="M0 -20 L-7.5 -6 L-2.8 -6 L-9 3 L9 3 L2.8 -6 L7.5 -6 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M0 -14 L-4 -5 L0 -5 Z" fill="' + d + '" opacity="0.8"/>' +
      '<path d="M0 -4 L-1.4 2" stroke="' + INK + '" stroke-width="0.6" opacity="0.4"/>' +
      '</g>';
  }

  function broadleaf(x, y, s, color, dark) {
    const c = color || '#5a9d5c';
    const d = dark || '#3d7a4a';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-1" y="-7" width="2.2" height="9" fill="#4a3220" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<circle cx="-4" cy="-9" r="6" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<circle cx="4" cy="-10" r="6.5" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<circle cx="0" cy="-15" r="6" fill="' + c + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<circle cx="-2" cy="-11" r="3" fill="' + d + '" opacity="0.55"/>' +
      '</g>';
  }

  function ancientTree(x, y, s, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-2.2" y="-4" width="4.4" height="11" fill="#4a3220" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M0 -25 L-9 -7 L-4 -7 L-11 4 L11 4 L4 -7 L9 -7 Z" fill="' + (color || '#245c3a') + '" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M0 -17 L-5 -5 L0 -5 Z" fill="#173f27"/>' +
      '<path d="M-7 7 q-4 1 -6 4 M7 7 q4 1 6 4" stroke="' + INK + '" stroke-width="1" fill="none"/>' +
      '</g>';
  }

  function stump(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-3 2 L-2 -3 L2 -3 L3 2 Z" fill="#a07f52" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<ellipse cx="0" cy="-3" rx="2" ry="0.9" fill="#d9b77d" stroke="' + INK + '" stroke-width="0.6"/>' +
      '</g>';
  }

  function house(x, y, s, wall, roof) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-7" y="-5" width="14" height="10" fill="' + (wall || '#e7c98c') + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M-9 -5 L0 -12 L9 -5 Z" fill="' + (roof || '#c05038') + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<rect x="-2" y="0" width="4" height="5" fill="' + INK + '"/>' +
      '<rect x="-5.5" y="-2" width="2.6" height="2.6" fill="#9edbe8" stroke="' + INK + '" stroke-width="0.5"/>' +
      '<rect x="3" y="-2" width="2.6" height="2.6" fill="#9edbe8" stroke="' + INK + '" stroke-width="0.5"/>' +
      '</g>';
  }

  function church(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-8" y="-4" width="16" height="9" fill="#e7c98c" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M-10 -4 L0 -10 L10 -4 Z" fill="#8f4b3b" stroke="' + INK + '" stroke-width="1"/>' +
      '<rect x="-2.5" y="-17" width="6" height="13" fill="#dcb97c" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M-4.5 -17 L0.5 -23 L5.5 -17 Z" fill="#8f4b3b" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M0.5 -25v-4M-1.5 -27h4" stroke="' + INK + '" stroke-width="1"/>' +
      '<rect x="-1" y="-14" width="2.5" height="3" fill="#9edbe8" stroke="' + INK + '" stroke-width="0.5"/>' +
      '<rect x="-1.2" y="0" width="2.8" height="5" fill="' + INK + '"/>' +
      '</g>';
  }

  function treehouse(x, y, s, level, accent) {
    const lv = level || 1;
    const ac = accent || '#ff3d7f';
    let out = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    out += '<rect x="-2.3" y="-14" width="5" height="24" fill="#5b3d24" stroke="' + INK + '" stroke-width="1.1"/>';
    out += '<path d="M-9 10 q-4 2 -5 6 M9 10 q4 2 5 6" stroke="' + INK + '" stroke-width="1" fill="none"/>';
    /* branches */
    out += '<path d="M-2 -8 q-8 -2 -10 -8 M2 -5 q8 -3 10 -10" stroke="#5b3d24" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    /* platform */
    out += '<path d="M-14 -6 L14 -6 L12 -3 L-12 -3 Z" fill="#a87a45" stroke="' + INK + '" stroke-width="1"/>';
    /* hut */
    out += '<rect x="-7" y="-17" width="13" height="11" fill="#d9a75e" stroke="' + INK + '" stroke-width="1.1"/>';
    out += '<path d="M-9 -17 L-0.5 -23 L8 -17 Z" fill="' + ac + '" stroke="' + INK + '" stroke-width="1.1"/>';
    out += '<rect x="-1.5" y="-12" width="4" height="6" fill="' + INK + '"/>';
    out += '<rect x="3" y="-14" width="2.5" height="2.5" fill="#ffe9a8" stroke="' + INK + '" stroke-width="0.5"/>';
    /* ladder */
    out += '<path d="M8 4 L12 13 M11 4 L15 13 M8.5 7 h5.5 M9.5 10 h5.5" stroke="' + INK + '" stroke-width="1.1" fill="none"/>';
    /* banner */
    out += '<path d="M-7 -23 L-7 -35" stroke="' + INK + '" stroke-width="1.4"/>';
    out += '<path d="M-7 -35 L3 -32 L-7 -28 Z" fill="' + ac + '" stroke="' + INK + '" stroke-width="0.9"/>';
    if (lv >= 2) {
      out += '<path d="M-17 2 L17 2 L15 5 L-15 5 Z" fill="#a87a45" stroke="' + INK + '" stroke-width="1"/>';
      out += '<rect x="7" y="-6" width="9" height="8" fill="#d9a75e" stroke="' + INK + '" stroke-width="1"/>';
      out += '<path d="M6 -6 L11.5 -10 L17 -6 Z" fill="#45c7e8" stroke="' + INK + '" stroke-width="1"/>';
      out += '<path d="M16 -6 L16 -14 M16 -14 L22 -12 L16 -10" stroke="' + INK + '" stroke-width="1.2" fill="#45c7e8"/>';
    }
    if (lv >= 3) {
      out += '<path d="M-20 10 L20 10 L18 13 L-18 13 Z" fill="#a87a45" stroke="' + INK + '" stroke-width="1"/>';
      out += '<rect x="-19" y="-2" width="7" height="12" fill="#d9a75e" stroke="' + INK + '" stroke-width="1"/>';
      out += '<path d="M-20 -2 L-15.5 -6 L-11 -2 Z" fill="#c9f24b" stroke="' + INK + '" stroke-width="1"/>';
      out += '<path d="M17 13 L17 2 L24 4 L17 7" stroke="' + INK + '" stroke-width="1.3" fill="#c9f24b"/>';
    }
    out += '</g>';
    return out;
  }

  function tent(x, y, s, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M0 -12 L-11 5 L11 5 Z" fill="' + (color || '#c9f24b') + '" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M0 -12 L0 5" stroke="' + INK + '" stroke-width="0.9"/>' +
      '<path d="M-4 3 L0 -4 L4 3 Z" fill="' + INK + '"/>' +
      '</g>';
  }

  function barricade(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-9 -6 L9 2 M9 -6 L-9 2" stroke="#b5482f" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M-9 -6 L9 2 M9 -6 L-9 2" stroke="' + INK + '" stroke-width="0.8" stroke-linecap="round"/>' +
      '<path d="M-10 -7 L-10 6 M10 -7 L10 6" stroke="' + INK + '" stroke-width="1.4"/>' +
      '</g>';
  }

  function pylon(x, y, s, down) {
    const rot = down ? ' rotate(' + (down === 2 ? -18 : 14) + ')' : '';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')' + rot + '">' +
      '<path d="M0 0 L-7 -22 M0 0 L7 -22 M-9 -22 L9 -22 M-7 -16 L7 -16 M-5 -10 L5 -10 M-3 -4 L3 -4" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' +
      '<path d="M-11 -20 L11 -20 M-9 -13 L9 -13 M-12 -20 L-12 -16 M12 -20 L12 -16" stroke="' + INK + '" stroke-width="1.1" fill="none"/>' +
      '</g>';
  }

  function excavator(x, y, s, small) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-14 6 L14 6 L16 10 L-16 10 Z" fill="#2a1e18" stroke="' + INK + '" stroke-width="1"/>' +
      '<circle cx="-9" cy="11" r="2.8" fill="#4d3a2c" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<circle cx="0" cy="11" r="2.8" fill="#4d3a2c" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<circle cx="9" cy="11" r="2.8" fill="#4d3a2c" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<path d="M-9 6 L-9 -6 L4 -8 L5 6 Z" fill="#d9a227" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M2 -7 L13 -12 L15 -7 L4 -2 Z" fill="#c08c1e" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M13 -10 L24 -3 L22 0 L11 -6 Z" fill="#c08c1e" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M22 -3 L28 4 L24 7 L19 0 Z" fill="#3a2a21" stroke="' + INK + '" stroke-width="1"/>' +
      '<rect x="-6" y="-4" width="7" height="4" fill="#9edbe8" opacity="0.65"/>' +
      '</g>';
  }

  function powerPlant(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-22 12 L-22 -8 L-14 -8 L-16 -2 L-8 -2 L-10 12 Z" fill="#6d7074" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M-2 12 L-2 -14 L6 -14 L6 12 Z" fill="#585c60" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M10 12 L10 -4 L20 -4 L20 12 Z" fill="#6d7074" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path d="M-19 -8 L-14 -8 M-3 -14 L5 -14" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<path d="M-19 2h4M-19 6h4M-3 0h5M-3 4h5M13 2h4M13 6h4" stroke="#f2e7d0" stroke-width="1" opacity="0.55"/>' +
      '<g class="smoke" opacity="0.5" fill="#e8dcc4"><circle cx="-15" cy="-16" r="4"/><circle cx="-9" cy="-22" r="5"/><circle cx="-17" cy="-27" r="3.5"/></g>' +
      '</g>';
  }

  function companyHQ(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-18" y="-10" width="36" height="22" fill="#8f3e32" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<rect x="-14" y="-17" width="15" height="7" fill="#a54a3a" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M-18 -10 L18 -10" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<g fill="#f2e7d0" opacity="0.75">' +
      '<rect x="-14" y="-6" width="4" height="4"/><rect x="-7" y="-6" width="4" height="4"/><rect x="0" y="-6" width="4" height="4"/><rect x="7" y="-6" width="4" height="4"/>' +
      '<rect x="-14" y="2" width="4" height="4"/><rect x="-7" y="2" width="4" height="4"/><rect x="0" y="2" width="4" height="4"/><rect x="7" y="2" width="4" height="4"/>' +
      '</g>' +
      '<rect x="-4" y="7" width="8" height="5" fill="' + INK + '"/>' +
      '<path d="M-17 -17 v-8 M-17 -25 h8" stroke="' + INK + '" stroke-width="1.2"/>' +
      '<path d="M-9 -25 l6 3 -6 3z" fill="#ffd23f" stroke="' + INK + '" stroke-width="0.7"/>' +
      '</g>';
  }

  function policeFig(x, y, s, shieldUp) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-4 2 L-4 -5 L4 -5 L4 2 Z" fill="#2b3a67" stroke="' + INK + '" stroke-width="0.9"/>' +
      '<circle cx="0" cy="-8" r="3.2" fill="#e0b48a" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<path d="M-4 -8 Q0 -13 4 -8 Z" fill="#2b3a67" stroke="' + INK + '" stroke-width="0.9"/>' +
      '<path d="M-4 -8 L4 -8" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<path d="M4 -3 L8 -1 L8 4 L4 5 Z" fill="#9edbe8" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<path d="M-4 -2 L-7 2" stroke="' + INK + '" stroke-width="1.4"/>' +
      '</g>';
  }

  function activistFig(x, y, s, kind) {
    const k = kind || 'masked';
    const body = k === 'hippie' ? '#ff7a1a' : (k === 'reader' ? '#45c7e8' : (k === 'worker' ? '#c9a24b' : '#26201c'));
    const hood = k === 'hippie' ? '#ffd23f' : body;
    let out = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    out += '<path d="M-3.5 3 L-3 -5 L3 -5 L3.5 3 Z" fill="' + body + '" stroke="' + INK + '" stroke-width="0.8"/>';
    out += '<circle cx="0" cy="-7" r="2.8" fill="#e0b48a" stroke="' + INK + '" stroke-width="0.7"/>';
    if (k === 'hippie') {
      out += '<path d="M-3 -8 Q0 -12 3 -8 Q4 -5 3 -6 L-3 -6 Z" fill="' + hood + '" stroke="' + INK + '" stroke-width="0.7"/>';
      out += '<path d="M-4 -6 L-6 0 M4 -6 L6 0" stroke="' + INK + '" stroke-width="0.8"/>';
    } else if (k === 'reader') {
      out += '<path d="M-3 -8 Q0 -10 3 -8 L3 -6 L-3 -6 Z" fill="#3b302a" stroke="' + INK + '" stroke-width="0.6"/>';
      out += '<path d="M2 0 L6 1 L6 4 L2 3 Z" fill="#f2e7d0" stroke="' + INK + '" stroke-width="0.6"/>';
    } else {
      out += '<path d="M-3 -8 Q0 -11 3 -8 L3 -5 L-3 -5 Z" fill="' + hood + '" stroke="' + INK + '" stroke-width="0.7"/>';
      out += '<path d="M-2.5 -7 L2.5 -7" stroke="#c9f24b" stroke-width="1"/>';
    }
    out += '<path d="M-3 3 L-4 7 M3 3 L4 7" stroke="' + INK + '" stroke-width="0.9"/>';
    out += '</g>';
    return out;
  }

  function woodworkerFig(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-3 3 L-3 -5 L3 -5 L3 3 Z" fill="#c9a24b" stroke="' + INK + '" stroke-width="0.8"/>' +
      '<circle cx="0" cy="-7.5" r="2.6" fill="#e0b48a" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<path d="M-3 -8 Q0 -11 3 -8 Z" fill="#e8452c" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<path d="M2 -2 L8 -4 M8 -4 L10 -2 M8 -4 L10 -6" stroke="' + INK + '" stroke-width="1"/>' +
      '<rect x="8" y="-6" width="3" height="3" fill="#ff7a1a" stroke="' + INK + '" stroke-width="0.5"/>' +
      '</g>';
  }

  function crowd(x, y, s, colors) {
    const cols = colors || ['#ff3d7f', '#c9f24b', '#45c7e8', '#ff7a1a'];
    let out = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    const positions = [-10, -3, 4, 10, -6, 8];
    positions.forEach(function (px, i) {
      const c = cols[i % cols.length];
      out += '<g transform="translate(' + px + ' ' + ((i % 2) * 1.5) + ')">' +
        '<circle cx="0" cy="-4" r="2" fill="#e0b48a" stroke="' + INK + '" stroke-width="0.5"/>' +
        '<path d="M-2 2 L-2 -2 L2 -2 L2 2 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="0.5"/>' +
        '</g>';
    });
    out += '</g>';
    return out;
  }

  function flag(x, y, s, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M0 0 L0 -16" stroke="' + INK + '" stroke-width="1.4"/>' +
      '<path d="M0 -16 L11 -13 L0 -9 Z" fill="' + (color || '#ff3d7f') + '" stroke="' + INK + '" stroke-width="0.8"/>' +
      '</g>';
  }

  function logPile(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-8" y="-1" width="16" height="3.4" rx="1" fill="#a07f52" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<rect x="-6" y="-4.5" width="13" height="3.4" rx="1" fill="#c09a63" stroke="' + INK + '" stroke-width="0.7"/>' +
      '<circle cx="-8" cy="0.7" r="1.7" fill="#e0bd80" stroke="' + INK + '" stroke-width="0.5"/>' +
      '<circle cx="-6" cy="-2.8" r="1.7" fill="#e0bd80" stroke="' + INK + '" stroke-width="0.5"/>' +
      '</g>';
  }

  function spark(x, y, s, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" class="spark-burst">' +
      '<path d="M0 -6 L1.5 -2 L6 -1 L2 1.5 L2.5 6 L0 3 L-3 5.5 L-2 1.5 L-5.5 -0.5 L-2 -2 Z" fill="' + (color || '#ffd23f') + '" stroke="' + INK + '" stroke-width="0.6"/>' +
      '</g>';
  }

  function smoke(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" class="smoke" fill="#e8dcc4" opacity="0.45">' +
      '<circle cx="0" cy="0" r="4"/><circle cx="5" cy="-5" r="5"/><circle cx="-4" cy="-8" r="3.5"/>' +
      '</g>';
  }

  function hexPoints(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    return pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
  }

  window.FO = window.FO || {};
  FO.art = {
    icon: icon,
    logo: logo,
    logoKeys: LOGO_KEYS,
    rng: rng,
    hash: hash,
    conifer: conifer,
    broadleaf: broadleaf,
    ancientTree: ancientTree,
    stump: stump,
    house: house,
    church: church,
    treehouse: treehouse,
    tent: tent,
    barricade: barricade,
    pylon: pylon,
    excavator: excavator,
    powerPlant: powerPlant,
    companyHQ: companyHQ,
    policeFig: policeFig,
    activistFig: activistFig,
    woodworkerFig: woodworkerFig,
    crowd: crowd,
    flag: flag,
    logPile: logPile,
    spark: spark,
    smoke: smoke,
    hexPoints: hexPoints,
    INK: INK,
    PAPER: PAPER
  };
})();
