'use strict';
/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (sec) => { sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
const playsText = (n) => (n <= 0 ? 'Not played yet' : n === 1 ? 'Played 1 time' : `Played ${n} times`);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const b64url = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fileUrl = (p) => 'nyxen://file/' + b64url(p);

const I = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  lib: 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z',
  search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  list: 'M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z',
  eq: 'M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z',
  chart: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  play: 'M8 5v14l11-7z', pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z', prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  repeat1: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z',
  order: 'M16.01 11H4v2h12.01v3L20 12l-3.99-4z',
  fav: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  fav0: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  mute: 'M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', down: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  trend: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  up: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z', power: 'M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42A6.92 6.92 0 0 1 19 12c0 3.87-3.13 7-7 7A6.995 6.995 0 0 1 7.58 6.58L6.17 5.17A8.932 8.932 0 0 0 3 12a9 9 0 0 0 18 0c0-2.74-1.23-5.18-3.17-6.83z'
};
const svg = (n, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="${I[n]}"/></svg>`;

const THEMES = [
  { n: 'Monochrome', g: ['#000000', '#3a3a3a', '#bdbdbd'], s: 0.18, a: '#c4c4c4' },
  { n: 'Purple', g: ['#7b1fa2', '#3a0d52', '#000000'], s: 0, a: '#b14bff' },
  { n: 'Blue', g: ['#0d47a1', '#1e88e5', '#81d4fa'], s: 0.35, a: '#42a5f5' },
  { n: 'Green', g: ['#1b5e20', '#43a047', '#a5d6a7'], s: 0.38, a: '#4cd964' },
  { n: 'Dark red', g: ['#8b0000', '#3d0000', '#000000'], s: 0, a: '#ff3b3b' },
  { n: 'Midnight', g: ['#0b1026', '#151b4d', '#000000'], s: 0, a: '#5c7cff' },
  { n: 'Sunset', g: ['#ff7e5f', '#b33a6e', '#2b0b3f'], s: 0.3, a: '#ff8a5b' },
  { n: 'Ocean', g: ['#0f9b8e', '#0b4f6c', '#020b1a'], s: 0.15, a: '#1de9b6' },
  { n: 'Rose', g: ['#e91e63', '#7b1038', '#000000'], s: 0.1, a: '#ff4081' },
  { n: 'Neon', g: ['#006c7a', '#012a33', '#000000'], s: 0, a: '#00e5ff' },
  { n: 'Cyberpunk', g: ['#ff2e93', '#3b0a5e', '#020b1f'], s: 0.1, a: '#00f0ff' },
  { n: 'Mono Dark', g: ['#1a1a1a', '#0d0d0d', '#000000'], s: 0, a: '#ffffff' },
  { n: 'Aurora', g: ['#0f8f5f', '#3a1c71', '#08050f'], s: 0.10, a: '#7cffcb' },
  { n: 'Gold', g: ['#7a5c00', '#3a2a00', '#000000'], s: 0, a: '#ffc53d' },
  { n: 'Mint', g: ['#2bb39a', '#0b3d3a', '#000000'], s: 0.12, a: '#6cffd9' },
  { n: 'Lavender', g: ['#8e7cc3', '#3b2a5f', '#0b0814'], s: 0.20, a: '#c4b5fd' },
  { n: 'Ice', g: ['#5bc0eb', '#1b4965', '#0b132b'], s: 0.25, a: '#9ae6ff' },
  { n: 'Lava', g: ['#ff512f', '#8b1a00', '#000000'], s: 0.10, a: '#ff7a3d' },
  { n: 'Forest', g: ['#2d6a4f', '#081c15', '#000000'], s: 0.05, a: '#74c69d' },
  { n: 'Peach', g: ['#ff9a8b', '#b5476b', '#2b0b2b'], s: 0.30, a: '#ffb199' },
  { n: 'Slate', g: ['#475569', '#1e293b', '#020617'], s: 0.05, a: '#94a3b8' },
  { n: 'Candy', g: ['#ff6fd8', '#7c3aed', '#0b0b2b'], s: 0.15, a: '#ff9ce8' },
  { n: 'Emerald', g: ['#00b09b', '#004e3f', '#000000'], s: 0.10, a: '#2ee6a6' },
  { n: 'Amber', g: ['#ffb347', '#7a3e00', '#000000'], s: 0.30, a: '#ffc266' },
  { n: 'Ruby', g: ['#9b111e', '#3a0610', '#000000'], s: 0, a: '#ff4d5e' },
  { n: 'Sky', g: ['#87ceeb', '#2f6db5', '#0a1a3a'], s: 0.35, a: '#7cc8ff' },
];
const BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0], 'Treble Boost': [0, 0, 0, 0, 0, 1, 2, 4, 5, 6],
  Vocal: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1], Rock: [5, 4, 2, 0, -1, -1, 1, 3, 4, 5], Pop: [-1, 2, 4, 4, 2, 0, -1, -1, -1, -1],
  Jazz: [3, 2, 1, 2, -2, -2, 0, 1, 2, 3], Classical: [4, 3, 2, 2, -1, -1, 0, 2, 3, 4], Electronic: [5, 4, 1, 0, -2, 2, 1, 1, 4, 5]
};
const REVERBS = [{ n: 'Off', s: 0.1, d: 8 }, { n: 'Small room', s: 0.6, d: 3 }, { n: 'Studio', s: 1.2, d: 2.6 }, { n: 'Hall', s: 2.5, d: 2.2 }, { n: 'Cathedral', s: 4, d: 1.8 }];

/* ================= state ================= */
const DEFAULT = () => ({
  v: 2, tracks: [], videos: [], videoFolders: [], playlists: [], folders: [], nextPl: 1, lastScan: 0, lastVideoScan: 0, firstDone: false, lyrics: {}, customThemes: [], customEq: {}, recentSearches: [],
  settings: { theme: 1, wallpaper: 0, cover: true, eqOn: true, gains: Array(10).fill(0), pre: 0, bass: 0, preset: 'Flat', rvPreset: 0, rvMix: 0.3, volume: 0.8, speed: 1, autoResume: false, rememberQueue: true, autoplaySimilar: false, buttonSounds: true, sleepFade: true, autoImport: true, keepAwake: false, mode: 'all', sort: 'title', asc: true, cat: 'tracks' },
  last: { id: null, pos: 0 }, savedQueue: [], savedQueueIndex: 0
});
function normalizeState(saved) {
  const d = DEFAULT();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return d;
  const source = { ...saved };
  delete source.googleAccount;
  delete source.account;
  delete source.guest;
  delete source.profile;
  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const baseName = (value) => { const p = String(value || ''); return p.slice(Math.max(p.lastIndexOf('/'), p.lastIndexOf(String.fromCharCode(92))) + 1); };
  const finite = (value, fallback, min = -Infinity, max = Infinity) => {
    const n = Number(value);
    return Number.isFinite(n) ? clamp(n, min, max) : fallback;
  };
  const cleanTrack = (item) => {
    if (!isObject(item) || typeof item.id !== 'string' || item.id.length !== 12 || ![...item.id].every((ch) => '0123456789abcdef'.includes(ch.toLowerCase())) || typeof item.path !== 'string' || !item.path.length) return null;
    return {
      ...item,
      title: String(item.title || baseName(item.path) || 'Untitled'),
      artist: String(item.artist || 'Unknown artist'),
      album: String(item.album || 'Unknown album'),
      genre: String(item.genre || 'Unknown genre'),
      duration: finite(item.duration, 0, 0),
      plays: Math.floor(finite(item.plays, 0, 0)),
      last: finite(item.last, 0, 0),
      added: finite(item.added, Date.now(), 0),
      fav: !!item.fav,
      cover: !!item.cover
    };
  };
  const tracks = (Array.isArray(saved.tracks) ? saved.tracks : []).map(cleanTrack).filter(Boolean);
  const videos = (Array.isArray(saved.videos) ? saved.videos : []).filter((item) => isObject(item) && typeof item.id === 'string' && item.id.length === 12 && [...item.id].every((ch) => '0123456789abcdef'.includes(ch.toLowerCase())) && typeof item.path === 'string' && item.path.length > 0).map((item) => ({
    ...item,
    title: String(item.title || item.path.split(/[\\\\/]/).pop() || 'Untitled video'),
    added: finite(item.added, Date.now(), 0),
    plays: Math.floor(finite(item.plays, 0, 0)),
    last: finite(item.last, 0, 0),
    fav: !!item.fav,
    type: 'video'
  }));
  const playlists = (Array.isArray(saved.playlists) ? saved.playlists : []).filter((item) => isObject(item) && typeof item.id === 'string' && item.id.startsWith('p') && Number.isInteger(Number(item.id.slice(1))) && Number(item.id.slice(1)) > 0).map((item) => ({
    id: item.id,
    name: String(item.name || 'Untitled playlist'),
    ids: Array.isArray(item.ids) ? item.ids.filter((id) => typeof id === 'string') : []
  }));
  const settings = { ...d.settings, ...(isObject(saved.settings) ? saved.settings : {}) };
  settings.gains = Array.isArray(settings.gains) && settings.gains.length === 10
    ? settings.gains.map((value) => finite(value, 0, -12, 12))
    : d.settings.gains.slice();
  const customThemeCount = Array.isArray(saved.customThemes) ? saved.customThemes.length : 0;
  settings.theme = Math.floor(finite(settings.theme, d.settings.theme, 0, 25 + customThemeCount));
  settings.wallpaper = Math.floor(finite(settings.wallpaper, 0, 0, 8));
  settings.customWallpaper = typeof settings.customWallpaper === 'string' && /^[a-f0-9]{16}$/.test(settings.customWallpaper) ? settings.customWallpaper : '';
  settings.volume = finite(settings.volume, d.settings.volume, 0, 1);
  settings.speed = finite(settings.speed, 1, 0.5, 2);
  settings.pre = finite(settings.pre, 0, -12, 12);
  settings.bass = finite(settings.bass, 0, 0, 12);
  settings.rvMix = finite(settings.rvMix, 0.3, 0, 1);
  settings.rvPreset = Math.floor(finite(settings.rvPreset, 0, 0, REVERBS.length - 1));
  settings.mode = ['all', 'one', 'order', 'shuffle'].includes(settings.mode) ? settings.mode : 'all';
  settings.sort = ['title', 'artist', 'album', 'duration', 'added', 'plays'].includes(settings.sort) ? settings.sort : 'title';
  settings.cat = ['tracks', 'albums', 'artists', 'genres', 'favorites'].includes(settings.cat) ? settings.cat : 'tracks';
  for (const key of ['cover', 'eqOn', 'autoResume', 'rememberQueue', 'autoplaySimilar', 'buttonSounds', 'sleepFade', 'autoImport', 'keepAwake', 'asc']) {
    settings[key] = !!settings[key];
  }
  settings.preset = typeof settings.preset === 'string' ? settings.preset.slice(0, 30) : 'Flat';
  settings.customFontName = typeof settings.customFontName === 'string' ? settings.customFontName.slice(0, 80) : '';
  settings.customFontFile = typeof settings.customFontFile === 'string' && /^[A-Za-z0-9_-]{1,60}\.(ttf|otf)$/i.test(settings.customFontFile) ? settings.customFontFile : '';
  const customEq = {};
  if (isObject(saved.customEq)) {
    for (const [name, values] of Object.entries(saved.customEq)) {
      if (!['__proto__', 'prototype', 'constructor'].includes(name) && Array.isArray(values) && values.length === 10 && values.every((v) => Number.isFinite(Number(v)))) {
        customEq[name.slice(0, 30)] = values.map((v) => finite(v, 0, -12, 12));
      }
    }
  }
  return {
    ...d,
    ...source,
    tracks,
    videos,
    videoFolders: Array.isArray(saved.videoFolders) ? saved.videoFolders.filter((item) => typeof item === 'string') : [],
    playlists,
    folders: Array.isArray(saved.folders) ? saved.folders.filter((item) => typeof item === 'string') : [],
    nextPl: Math.max(1, Math.floor(finite(saved.nextPl, 1, 1))),
    lastScan: finite(saved.lastScan, 0, 0),
    lastVideoScan: finite(saved.lastVideoScan, 0, 0),
    firstDone: !!saved.firstDone,
    lyrics: isObject(saved.lyrics) ? Object.fromEntries(Object.entries(saved.lyrics).filter(([id, value]) => typeof id === 'string' && typeof value === 'string')) : {},
    customThemes: Array.isArray(saved.customThemes) ? saved.customThemes.filter((theme) => isObject(theme) && typeof theme.n === 'string' && typeof theme.a === 'string' && /^#[0-9a-f]{6}$/i.test(theme.a) && Array.isArray(theme.g) && theme.g.length === 3 && theme.g.every((color) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))).map((theme) => ({ ...theme, n: theme.n.slice(0, 24) })) : [],
    customWallpapers: Array.isArray(saved.customWallpapers) ? saved.customWallpapers.filter((item) => isObject(item) && typeof item.id === 'string' && /^[a-f0-9]{16}$/.test(item.id)).map((item) => ({ id: item.id, name: String(item.name || 'Photo wallpaper').slice(0, 60) })) : [],
    customEq,
    recentSearches: Array.isArray(saved.recentSearches) ? saved.recentSearches.filter((item) => typeof item === 'string').slice(0, 50) : [],
    settings,
    last: {
      id: typeof saved.last?.id === 'string' ? saved.last.id : null,
      pos: finite(saved.last?.pos, 0, 0)
    },
    savedQueue: Array.isArray(saved.savedQueue) ? saved.savedQueue.filter((id) => typeof id === 'string') : [],
    savedQueueIndex: Math.max(0, Math.floor(finite(saved.savedQueueIndex, 0, 0)))
  };
}
let S = DEFAULT();
let byId = new Map();
const reindex = () => { byId = new Map(S.tracks.map((t) => [t.id, t])); };
const track = (id) => byId.get(id);
let saveTimer = 0;
const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => { Promise.resolve(window.nyxen.saveState(S)).catch(() => toast('Could not save NyxenPlayer data')); }, 500); };
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
document.addEventListener('error', (e) => { if (e.target && e.target.tagName === 'IMG') e.target.remove(); }, true);

/* ================= audio engine (real Web Audio effects) ================= */
const audio = new Audio();
audio.crossOrigin = 'anonymous';
audio.preload = 'auto';
let ac = null; const nodes = {}; let muted = false;

function initAudio() {
  ac = new AudioContext();
  const src = ac.createMediaElementSource(audio);
  nodes.pre = ac.createGain();
  nodes.eq = BANDS.map((f) => { const b = ac.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = f; b.Q.value = 1.1; return b; });
  nodes.bass = ac.createBiquadFilter(); nodes.bass.type = 'lowshelf'; nodes.bass.frequency.value = 120;
  nodes.dry = ac.createGain(); nodes.wet = ac.createGain(); nodes.conv = ac.createConvolver();
  nodes.master = ac.createGain(); nodes.an = ac.createAnalyser(); nodes.an.fftSize = 512; nodes.an.smoothingTimeConstant = 0.8;
  let n = nodes.pre; src.connect(n);
  for (const b of nodes.eq) { n.connect(b); n = b; }
  n.connect(nodes.bass);
  nodes.bass.connect(nodes.dry); nodes.bass.connect(nodes.conv); nodes.conv.connect(nodes.wet);
  nodes.dry.connect(nodes.master); nodes.wet.connect(nodes.master);
  nodes.master.connect(nodes.an); nodes.an.connect(ac.destination);
  setReverb(); applyFx();
}
function impulse(sec, decay) {
  const len = Math.floor(ac.sampleRate * sec); const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}
function setReverb() { if (!ac) return; const r = REVERBS[S.settings.rvPreset] || REVERBS[0]; nodes.conv.buffer = impulse(r.s, r.d); }
function applyFx() {
  if (!ac) return;
  const s = S.settings, on = s.eqOn;
  nodes.pre.gain.value = on ? Math.pow(10, s.pre / 20) : 1;
  nodes.eq.forEach((b, i) => { b.gain.value = on ? s.gains[i] : 0; });
  nodes.bass.gain.value = on ? s.bass : 0;
  const mix = on && s.rvPreset > 0 ? s.rvMix : 0;
  nodes.dry.gain.value = 1 - mix * 0.4; nodes.wet.gain.value = mix;
  nodes.master.gain.value = muted ? 0 : s.volume;
}

/* ================= queue & playback ================= */
let Q = { ids: [], i: -1, orig: null };
let cur = null, counted = false, touched = false, seeking = false, resumePos = 0, lastPosSave = 0, errorSkipTimer = 0;

function shuffleQueue() {
  const c = Q.ids[Q.i]; Q.orig = Q.ids.slice();
  const rest = Q.ids.filter((_, k) => k !== Q.i);
  for (let k = rest.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [rest[k], rest[j]] = [rest[j], rest[k]]; }
  Q.ids = [c, ...rest]; Q.i = 0;
}
function unshuffleQueue() { if (!Q.orig) return; const c = Q.ids[Q.i]; Q.ids = Q.orig; Q.orig = null; Q.i = Math.max(0, Q.ids.indexOf(c)); }
function playIds(list, i = 0) {
  if (!list.length) return;
  Q = { ids: list.slice(), i, orig: null };
  if (S.settings.mode === 'shuffle') shuffleQueue();
  loadCurrent(true);
}
function loadCurrent(autoplay) {
  const t = track(Q.ids[Q.i]); if (!t) return;
  clearTimeout(errorSkipTimer); errorSkipTimer = 0;
  cur = t; counted = touched = false;
  audio.playbackRate = S.settings.speed || 1;
  audio.src = fileUrl(t.path);
  S.last.id = t.id; S.last.pos = 0; S.savedQueue = Q.ids.slice(); S.savedQueueIndex = Q.i; save();
  applyCoverAccent(); updatePlayerUI(); renderQueue();
  if (autoplay) play();
}
async function play() {
  if (!cur) return;
  const video = $('#nyxen-video');
  if (video && !video.paused) video.pause();
  try { await ac.resume(); await audio.play(); } catch { toast('This file cannot be played. It may have moved or use an unsupported format.'); }
}
function toggle() { if (!cur) return; if (audio.paused) play(); else audio.pause(); }
function syncKeepAwake() {
  if (window.nyxen?.setKeepAwake) window.nyxen.setKeepAwake(!!S.settings.keepAwake && !audio.paused && !audio.ended).catch(() => {});
}
function next(manual = true) {
  if (!Q.ids.length) return;
  let i = Q.i + 1;
  if (i >= Q.ids.length) {
    if (S.settings.mode === 'order') {
      if (S.settings.autoplaySimilar && cur) {
        const current = cur;
        const candidates = S.tracks
          .filter((t) => t.id !== current.id && !Q.ids.includes(t.id) &&
            ((current.artist && t.artist === current.artist) || (current.genre && t.genre === current.genre)))
          .sort((a, b) => {
            const score = (t) => (t.artist === current.artist ? 2 : 0) + (t.genre === current.genre ? 1 : 0);
            return score(b) - score(a) || (a.plays || 0) - (b.plays || 0);
          });
        if (candidates.length) {
          Q.ids.push(candidates[0].id);
          Q.i++;
          loadCurrent(true);
          return;
        }
      }
      audio.pause(); audio.currentTime = 0; return;
    }
    if (S.settings.mode === 'shuffle') { const all = (Q.orig || Q.ids).slice(); Q = { ids: all, i: Math.floor(Math.random() * all.length), orig: null }; shuffleQueue(); i = 0; }
    else i = 0;
  }
  Q.i = i; loadCurrent(true);
}
function prev() {
  if (!Q.ids.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  Q.i = Q.i - 1 < 0 ? (S.settings.mode === 'order' ? 0 : Q.ids.length - 1) : Q.i - 1; loadCurrent(true);
}
function setMode(m) {
  const was = S.settings.mode; S.settings.mode = m;
  if (m === 'shuffle' && was !== 'shuffle' && Q.ids.length) shuffleQueue();
  if (was === 'shuffle' && m !== 'shuffle') unshuffleQueue();
  save(); updatePlayerUI(); renderQueue();
}
const MODES = ['all', 'one', 'order', 'shuffle'];
const MODE_ICON = { all: 'repeat', one: 'repeat1', order: 'order', shuffle: 'shuffle' };
const MODE_NAME = { all: 'Repeat all', one: 'Repeat one', order: 'In order', shuffle: 'Shuffle' };

audio.addEventListener('play', () => { document.body.classList.add('playing'); syncKeepAwake(); updatePlayerUI(); });
audio.addEventListener('pause', () => { document.body.classList.remove('playing'); syncKeepAwake(); if (cur) { S.last.pos = audio.currentTime; save(); } updatePlayerUI(); });
audio.addEventListener('ended', () => {
  syncKeepAwake();
  if(sleepTrack){sleepTrack=false;audio.pause();toast('Sleep timer finished');if(V.page==='settings')render();return;}
  if (S.settings.mode === 'one') { audio.currentTime = 0; counted = touched = false; play(); } else next(false);
});
const mediaDuration = () => {
  const nativeDuration = Number(audio.duration);
  if (Number.isFinite(nativeDuration) && nativeDuration > 0) return nativeDuration;
  const storedDuration = Number(cur && cur.duration);
  return Number.isFinite(storedDuration) && storedDuration > 0 ? storedDuration : 0;
};
audio.addEventListener('loadedmetadata', () => {
  if (resumePos > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = clamp(resumePos, 0, Math.max(0, audio.duration - 0.05));
    resumePos = 0;
  }
  updateProgress();
});
audio.addEventListener('durationchange', updateProgress);
audio.addEventListener('seeking', updateProgress);
audio.addEventListener('seeked', updateProgress);
audio.addEventListener('error', () => {
  if (!cur) return;
  const failedId = cur.id;
  toast('Cannot play "' + cur.title + '". Skipping.');
  clearTimeout(errorSkipTimer);
  if (Q.ids.length > 1) errorSkipTimer = setTimeout(() => {
    if (cur && cur.id === failedId && audio.error) next(true);
  }, 600);
});
audio.addEventListener('timeupdate', () => {
  if (!cur) return;
  const t = audio.currentTime, d = mediaDuration();
  if (!touched && t >= 3) { touched = true; cur.last = Date.now(); save(); }
  if (!counted && t >= Math.min(d / 2 || 30, 30)) {
    counted = true; cur.plays++; cur.last = Date.now(); save();
    $$(`.trow[data-id="${cur.id}"] .pc`).forEach((el) => { el.textContent = playsText(cur.plays); });
  }
  if (Date.now() - lastPosSave > 5000) { lastPosSave = Date.now(); S.last.pos = t; save(); }
  updateProgress();
});

/* ================= cover-matched accent ================= */
function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx ? d / mx : 0, mx];
}
function hsv2hex(h, s, v) {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
function applyTheme() {
  const th = THEMES[S.settings.theme] || THEMES[0]; const r = document.documentElement.style;
  r.setProperty('--g0', th.g[0]); r.setProperty('--g1', th.g[1]); r.setProperty('--g2', th.g[2]); r.setProperty('--scrim', th.s); r.setProperty('--accent', th.a);
  applyCoverAccent();
}
async function applyCoverAccent() {
  const th = THEMES[S.settings.theme] || THEMES[0]; const root = document.documentElement.style;
  if (!S.settings.cover || !cur || !cur.cover) { root.setProperty('--accent', th.a); return; }
  const id = cur.id;
  try {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = 'nyxen://cover/' + id; await img.decode();
    if (!cur || cur.id !== id) return;
    const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 24, 24);
    const d = g.getImageData(0, 0, 24, 24).data; let best = 0, pick = null;
    for (let i = 0; i < d.length; i += 4) { const [h, s, v] = rgb2hsv(d[i], d[i + 1], d[i + 2]); if (v > 0.25 && s > 0.25 && s * v > best) { best = s * v; pick = [h, s, v]; } }
    root.setProperty('--accent', pick ? hsv2hex(pick[0], clamp(pick[1], 0.5, 1), Math.max(pick[2], 0.85)) : th.a);
  } catch { root.setProperty('--accent', th.a); }
}

/* ================= UI helpers ================= */
const V = { page: 'home', arg: null, group: null, q: '', sf: 'all', selected: [] };
let ctn = 0; const CTX = new Map();
const reg = (list) => { const k = ++ctn; CTX.set(k, list); if (CTX.size > 40) CTX.delete(CTX.keys().next().value); return k; };
const ids = (list) => list.map((t) => t.id);
const art = (t, size = 'md') => `<div class="art ${size}"><span class="ph">&#9834;</span>${t && t.cover ? `<img src="nyxen://cover/${t.id}" alt="">` : ''}</div>`;
const collage = (ts, cls = '') => `<div class="collage ${cls}">${[0, 1, 2, 3].map((i) => art(ts[i], '')).join('')}</div>`;
const trow = (t, ctx, i, extra) => `<div class="trow ${cur && cur.id === t.id ? 'cur' : ''}" data-act="play" data-ctx="${ctx}" data-i="${i}" data-id="${t.id}">${art(t, 'sm')}<div class="tmeta"><b>${esc(t.title)}</b><span>${esc(t.artist)} · ${esc(t.album)}</span><em class="pc">${playsText(t.plays)}</em></div>${t.fav ? `<span class="favmark">${svg('fav', 16)}</span>` : ''}<span class="dur">${fmt(t.duration)}</span>${extra || `<button class="icon" data-act="menu" data-id="${t.id}">${svg('more', 20)}</button>`}</div>`;
const card = (t, ctx, i) => `<div class="card" data-act="play" data-id="${t.id}" data-ctx="${ctx}" data-i="${i}">${art(t, 'lg')}<b>${esc(t.title)}</b><span>${esc(t.artist)}</span><em>${playsText(t.plays)}</em></div>`;
const emptyState = (title, text, btn, act) => `<div class="empty"><div class="art"><span class="ph">&#9834;</span></div><h2 style="margin:0 0 6px">${esc(title)}</h2><div class="sub">${esc(text)}</div>${btn ? `<div style="margin-top:18px"><button class="btn" data-act="${act}">${esc(btn)}</button></div>` : ''}</div>`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const tile = (icon, label, act, extra = '') => `<button class="tile" data-act="${act}" ${extra}><i>${svg(icon, 24)}</i>${label}</button>`;

const SMART = [
  { id: 's:most', n: 'Most replayed', f: (ts) => ts.filter((t) => t.plays > 0).sort((a, b) => b.plays - a.plays).slice(0, 50) },
  { id: 's:recent', n: 'Recently played', f: (ts) => ts.filter((t) => t.last > 0).sort((a, b) => b.last - a.last).slice(0, 50) },
  { id: 's:week', n: 'Added this week', f: (ts) => ts.filter((t) => t.added > Date.now() - 6048e5).sort((a, b) => b.added - a.added) },
  { id: 's:long', n: 'Long songs', f: (ts) => ts.filter((t) => t.duration >= 300).sort((a, b) => b.duration - a.duration).slice(0, 100) },
  { id: 's:never', n: 'Never played', f: (ts) => ts.filter((t) => !t.plays).slice(0, 100) },
  { id: 's:short', n: 'Short listens', f: (ts) => ts.filter((t) => t.duration > 0 && t.duration < 180).sort((a, b) => a.duration - b.duration) },
  { id: 's:epic', n: 'Long-form tracks', f: (ts) => ts.filter((t) => t.duration >= 600).sort((a, b) => b.duration - a.duration) },
  { id: 's:quick', n: 'Under four minutes', f: (ts) => ts.filter((t) => t.duration > 0 && t.duration < 240).sort((a, b) => a.duration - b.duration) },
  { id: 's:deep', n: 'Favorite deep cuts', f: (ts) => ts.filter((t) => t.fav && t.plays > 0 && t.plays <= 3).sort((a, b) => b.last - a.last) },
  { id: 's:heavy', n: 'Heavy rotation', f: (ts) => ts.filter((t) => t.plays >= 10).sort((a, b) => b.plays - a.plays) },
  { id: 's:unheard', n: 'Unheard favorites', f: (ts) => ts.filter((t) => t.fav && !t.plays).sort((a, b) => b.added - a.added) },
  { id: 's:forgotten', n: 'Forgotten favorites', f: (ts) => ts.filter((t) => t.fav && t.last > 0 && t.last < Date.now() - 30 * 864e5).sort((a, b) => a.last - b.last) },
  { id: 's:new30', n: 'Added in 30 days', f: (ts) => ts.filter((t) => t.added > Date.now() - 30 * 864e5).sort((a, b) => b.added - a.added) },
  { id: 's:new90', n: 'Added in 90 days', f: (ts) => ts.filter((t) => t.added > Date.now() - 90 * 864e5).sort((a, b) => b.added - a.added) },
  { id: 's:played7', n: 'Played this week', f: (ts) => ts.filter((t) => t.last > Date.now() - 7 * 864e5).sort((a, b) => b.last - a.last) },
  { id: 's:played30', n: 'Played this month', f: (ts) => ts.filter((t) => t.last > Date.now() - 30 * 864e5).sort((a, b) => b.last - a.last) },
  { id: 's:stale30', n: 'Not heard in 30 days', f: (ts) => ts.filter((t) => t.plays > 0 && t.last > 0 && t.last < Date.now() - 30 * 864e5).sort((a, b) => a.last - b.last) },
  { id: 's:stale90', n: 'Not heard in 90 days', f: (ts) => ts.filter((t) => t.plays > 0 && t.last > 0 && t.last < Date.now() - 90 * 864e5).sort((a, b) => a.last - b.last) },
  { id: 's:favshort', n: 'Short favorites', f: (ts) => ts.filter((t) => t.fav && t.duration > 0 && t.duration < 240).sort((a, b) => a.duration - b.duration) },
  { id: 's:favlong', n: 'Long favorites', f: (ts) => ts.filter((t) => t.fav && t.duration >= 360).sort((a, b) => b.duration - a.duration) },
  { id: 's:unfav', n: 'Not in favorites', f: (ts) => ts.filter((t) => !t.fav).sort((a, b) => b.added - a.added) },
  { id: 's:singles', n: 'Artist discoveries', f: (ts) => { const counts = new Map(); ts.forEach((t) => counts.set(t.artist, (counts.get(t.artist) || 0) + 1)); return ts.filter((t) => counts.get(t.artist) === 1).sort((a, b) => a.artist.localeCompare(b.artist)); } },
  { id: 's:lowplay', n: 'Underrated tracks', f: (ts) => ts.filter((t) => t.plays > 0 && t.plays <= 2).sort((a, b) => b.last - a.last) },
  { id: 's:mid', n: 'Three to six minutes', f: (ts) => ts.filter((t) => t.duration >= 180 && t.duration < 360).sort((a, b) => a.duration - b.duration) },
  { id: 's:high', n: 'Six minutes and up', f: (ts) => ts.filter((t) => t.duration >= 360).sort((a, b) => b.duration - a.duration) },
  { id: 's:recentfav', n: 'Recently loved', f: (ts) => ts.filter((t) => t.fav).sort((a, b) => b.last - a.last || b.added - a.added).slice(0, 100) }
];
const plTracks = (id) => (id.startsWith('s:') ? SMART.find((s) => s.id === id).f(S.tracks) : ((S.playlists.find((p) => p.id === id) || { ids: [] }).ids).map(track).filter(Boolean));
const SORTS = { title: 'Title', artist: 'Artist', album: 'Album', duration: 'Duration', added: 'Date added', plays: 'Play count' };
function sortTracks(list) {
  const dir = S.settings.asc ? 1 : -1;
  const key = { title: (t) => t.title.toLowerCase(), artist: (t) => t.artist.toLowerCase(), album: (t) => t.album.toLowerCase(), duration: (t) => t.duration, added: (t) => t.added, plays: (t) => t.plays }[S.settings.sort];
  return [...list].sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * dir; });
}
function groupTracks() { const f = { albums: 'album', artists: 'artist', genres: 'genre' }[V.group.cat]; return sortTracks(S.tracks.filter((t) => t[f] === V.group.name)); }

/* ================= pages ================= */
function pageHome() {
  const recent = SMART[1].f(S.tracks).slice(0, 14), most = SMART[0].f(S.tracks).slice(0, 14);
  const favs = S.tracks.filter((t) => t.fav).slice(0, 20), added = [...S.tracks].sort((a, b) => b.added - a.added).slice(0, 14);
  let h = `<div class="page"><div class="hello"><div class="grow"><div class="sub">${greeting()}</div><h1>${'Listener'}</h1><div class="sub">${S.tracks.length} songs in your library</div></div></div>`;
  if (!S.tracks.length) return h + emptyState('Your library is empty', 'Add a folder with your music to get started.', 'Import a folder', 'import-folder') + '</div>';
  h += `<div class="tiles">${tile('shuffle', 'Shuffle all', 'shuffle-all')}${tile('fav', 'Favorites', 'go-fav')}${tile('trend', 'Most replayed', 'open-pl', 'data-pl="s:most"')}${tile('history', 'Recently played', 'open-pl', 'data-pl="s:recent"')}</div>`;
  const car = (title, list) => { if (!list.length) return ''; const k = reg(ids(list)); return `<h2>${title}</h2><div class="row">${list.map((t, i) => card(t, k, i)).join('')}</div>`; };
  return h + car('Recently played', recent) + car('Most played', most) + car('Favorites', favs) + car('Recently added', added) + '</div>';
}
function pageLibrary() {
  const cats = [['tracks', 'Tracks'], ['albums', 'Albums'], ['artists', 'Artists'], ['genres', 'Genres'], ['favorites', 'Favorites'], ['duplicates', 'Duplicates']];
  const cat = S.settings.cat;
  let h = `<div class="page"><div class="split"><div class="grow"><h1>Library</h1><div class="sub">${S.tracks.length} songs · ${new Set(S.tracks.map((t) => t.album)).size} albums</div></div><button class="btn" data-act="import-folder">${svg('add', 18)} Import folder</button><button class="btn ghost" data-act="import-files">Import files</button></div>`;
  h += `<div class="toolbar">${cats.map(([k, n]) => `<button class="chip ${cat === k ? 'on' : ''}" data-act="cat" data-cat="${k}">${n}</button>`).join('')}`;
  if (cat === 'tracks' && !V.group) h += `<span class="grow"></span><select id="sortsel">${Object.entries(SORTS).map(([k, n]) => `<option value="${k}" ${S.settings.sort === k ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="icon" data-act="sort-dir" title="Sort direction">${S.settings.asc ? '&#9650;' : '&#9660;'}</button><button class="btn ghost" data-act="shuffle-all">${svg('shuffle', 18)} Shuffle all</button>`;
  if (['tracks','favorites','duplicates'].includes(cat)) h += `<span class="sub">${V.selected.length} selected</span>${V.selected.length ? `<button class="chip" data-act="bulk-fav">Toggle favorites</button><button class="chip" data-act="bulk-pl">Add to playlist</button><button class="chip" data-act="bulk-rm">Remove selected</button><button class="chip" data-act="clear-sel">Clear</button>` : ''}`;
  h += '</div>';
  if (!S.tracks.length) return h + emptyState('Your library is empty', 'Add a folder with your music to get started.', 'Import a folder', 'import-folder') + '</div>';
  if (V.group) {
    const ts = groupTracks(), k = reg(ids(ts));
    return h + `<div class="split" style="margin:12px 0"><button class="chip" data-act="back">&larr; Back</button><div class="grow"><h2 style="margin:0">${esc(V.group.name)}</h2><div class="sub">${ts.length} songs</div></div><button class="btn" data-act="play-group">${svg('play', 18)} Play</button><button class="btn ghost" data-act="shuffle-group">${svg('shuffle', 18)} Shuffle</button></div>${ts.map((t, i) => trow(t, k, i)).join('')}</div>`;
  }
  if (cat === 'tracks' || cat === 'favorites' || cat === 'duplicates') {
    const ts = cat === 'tracks' ? sortTracks(S.tracks) : cat === 'favorites' ? sortTracks(S.tracks.filter(t=>t.fav)) : sortTracks(duplicateTracks()); const k = reg(ids(ts));
    return h + (ts.length ? ts.map((t, i) => trow(t, k, i, `<button class="icon ${V.selected.includes(t.id) ? 'on' : ''}" data-act="select-track" data-id="${t.id}" title="Select">${V.selected.includes(t.id) ? '✓' : '＋'}</button>`)).join('') : emptyState(cat === 'duplicates' ? 'No duplicates found' : 'No tracks here yet', cat === 'duplicates' ? 'Matching title and artist appear here. Original files are never deleted automatically.' : 'Add music or change your filters.')) + '</div>';
  }
  const field = { albums: 'album', artists: 'artist', genres: 'genre' }[cat]; const map = new Map();
  S.tracks.forEach((t) => { if (!map.has(t[field])) map.set(t[field], []); map.get(t[field]).push(t); });
  const groups = [...map.entries()].sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));
  return h + `<div class="grid">${groups.map(([name, ts]) => `<div class="card" data-act="group" data-name="${esc(name)}">${art(ts.find((t) => t.cover) || ts[0], 'lg')}<b>${esc(name)}</b><span>${ts.length} songs</span></div>`).join('')}</div></div>`;
}
function pageVideos() {
  const videos = [...(S.videos || [])].sort((a, b) => (b.added || 0) - (a.added || 0));
  let h = '<div class="page"><div class="split"><div class="grow"><h1>Videos</h1><div class="sub">' + videos.length + ' videos in your library</div></div><button class="btn" data-act="import-video-files">Import videos</button><button class="btn ghost" data-act="import-video-folder">Import folder</button></div>';
  if (!videos.length) return h + emptyState('No videos yet', 'Import MP4, M4V, WebM or MOV files to watch them in NyxenPlayer.', 'Import videos', 'import-video-files') + '</div>';
  h += videos.map(v => '<div class="video-row" data-video-id="' + esc(v.id) + '"><div class="video-mark">▶</div><div class="tmeta"><b>' + esc(v.title) + '</b><span>' + esc(v.path.split(/[\\/]/).pop()) + '</span><em>' + playsText(v.plays || 0) + '</em></div><button class="btn" data-act="play-video" data-id="' + esc(v.id) + '">Play</button><button class="icon" data-act="remove-video" data-id="' + esc(v.id) + '" title="Remove from library">' + svg('del', 19) + '</button></div>').join('');
  return h + '</div>';
}
function duplicateTracks() {
  const key = t => [t.title,t.artist].map(x=>String(x||'').toLowerCase().replace(/\\.[^.]+$/,'').replace(/[^a-z0-9]+/g,' ').trim()).join('|');
  const counts=new Map(); S.tracks.forEach(t=>counts.set(key(t),(counts.get(key(t))||0)+1));
  return S.tracks.filter(t=>counts.get(key(t))>1);
}
function searchResults() {
  const q = (V.q || '').trim().toLowerCase();
  if (!q) return S.recentSearches?.length ? `<div class="sub" style="margin:14px 0">Recent searches</div><div class="toolbar">${S.recentSearches.slice(0,8).map(x=>`<button class="chip" data-act="search-recent" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : `<div class="empty"><div class="art"><span class="ph">&#9834;</span></div>Find anything in your library</div>`;
  const tokens = q.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const fields = V.sf === 'all' ? ['title','artist','album','genre','path'] : [V.sf];
  const parsed = tokens.map(raw => { const negative=raw.startsWith('-'), token=negative?raw.slice(1):raw, m=token.match(/^(title|artist|album|genre|file|path):(.+)$/); return {negative,field:m?(m[1]==='file'?'path':m[1]):null,value:(m?m[2]:token).replace(/^"|"$/g,'').toLowerCase()}; });
  const res = S.tracks.filter(t=>parsed.every(x=>{const hay=(x.field?[t[x.field]||'']:fields.map(f=>t[f]||'')).join(' ').toLowerCase(),hit=hay.includes(x.value);return x.negative?!hit:hit;}));
  if (!res.length) return `<div class="empty">No results for &ldquo;${esc(q)}&rdquo;</div>`;
  const k = reg(ids(res));
  return `<div class="sub">${res.length} results</div>` + res.slice(0, 300).map((t, i) => trow(t, k, i)).join('');
}
function pageSearch() {
  return `<div class="page"><h1>Search</h1><div class="toolbar"><input id="q" class="field" style="flex:1;min-width:260px" placeholder="artist:name, album:name, -term, or plain words" value="${esc(V.q)}" autocomplete="off">${['all', 'title', 'artist', 'album', 'genre'].map((f) => `<button class="chip ${V.sf === f ? 'on' : ''}" data-act="sf" data-f="${f}">${f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1) + 's'}</button>`).join('')}</div><div id="results">${searchResults()}</div></div>`;
}
function pagePlaylists() {
  const smart = SMART.map((s) => { const ts = s.f(S.tracks); return `<div class="trow" data-act="open-pl" data-pl="${s.id}">${collage(ts.slice(0, 4))}<div class="tmeta"><b>${s.n}</b><span>${ts.length ? ts.length + ' songs · Auto playlist' : 'Play a few songs to fill this'}</span></div><button class="icon" data-act="play-pl" data-pl="${s.id}">${svg('play', 22)}</button></div>`; }).join('');
  const mine = S.playlists.map((p) => { const ts = plTracks(p.id); return `<div class="trow" data-act="open-pl" data-pl="${p.id}">${collage(ts.slice(0, 4))}<div class="tmeta"><b>${esc(p.name)}</b><span>${ts.length} songs</span></div><button class="icon" data-act="play-pl" data-pl="${p.id}">${svg('play', 22)}</button><button class="icon" data-act="del-pl" data-pl="${p.id}">${svg('del', 20)}</button></div>`; }).join('');
  return `<div class="page"><div class="split"><div class="grow"><h1>Playlists</h1></div><button class="btn" data-act="new-pl">${svg('add', 18)} New playlist</button></div><h2>Automatic</h2>${smart}<h2>Yours</h2>${mine || '<div class="sub">No custom playlists yet. Create one with &ldquo;New playlist&rdquo;.</div>'}</div>`;
}
function pagePlaylist() {
  const id = V.arg, smart = id.startsWith('s:'), sm = smart ? SMART.find((s) => s.id === id) : null, p = smart ? null : S.playlists.find((x) => x.id === id);
  if (!sm && !p) { V.page = 'playlists'; return pagePlaylists(); }
  const ts = plTracks(id), k = reg(ids(ts));
  const rows = ts.map((t, i) => (smart ? trow(t, k, i) : trow(t, k, i, `<button class="icon" data-act="pl-up" data-pl="${id}" data-i="${i}">${svg('up', 20)}</button><button class="icon" data-act="pl-down" data-pl="${id}" data-i="${i}">${svg('down', 20)}</button><button class="icon" data-act="pl-rm" data-pl="${id}" data-i="${i}">${svg('close', 18)}</button>`))).join('');
  return `<div class="page"><button class="chip" data-act="nav" data-page="playlists">&larr; Playlists</button><div class="split" style="margin-top:16px">${collage(ts.slice(0, 4), 'big')}<div class="grow"><h1>${esc(sm ? sm.n : p.name)}</h1><div class="sub">${ts.length} songs · ${Math.floor(ts.reduce((a, t) => a + t.duration, 0) / 60)} min${smart ? ' · Auto playlist' : ''}</div><div class="toolbar"><button class="btn" data-act="play-pl" data-pl="${id}">${svg('play', 18)} Play</button><button class="btn ghost" data-act="shuffle-pl" data-pl="${id}">${svg('shuffle', 18)} Shuffle</button>${smart ? '' : `<button class="btn ghost" data-act="rename-pl" data-pl="${id}">Rename</button><button class="btn danger" data-act="del-pl" data-pl="${id}">Delete</button>`}</div></div></div><div style="margin-top:16px">${rows || emptyState(smart ? 'Nothing here yet' : 'This playlist is empty', smart ? 'Play some songs and they will show up here.' : 'Use the ... menu on any song to add it.')}</div></div>`;
}
const slider = (id, label, min, max, step, val, unit) => `<div class="split" style="margin:6px 0"><span style="width:110px">${label}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><span id="${id}-v" style="width:60px;text-align:right">${val}${unit}</span></div>`;
function pageStudio() {
  const s = S.settings;
  return `<div class="page"><div class="split"><div class="grow"><h1>Audio Studio</h1><div class="sub">${s.eqOn ? 'Effects on · ' + esc(s.preset) : 'Effects off'}</div></div><button class="btn ${s.eqOn ? '' : 'ghost'}" data-act="eq-toggle">${svg('power', 18)} ${s.eqOn ? 'On' : 'Off'}</button></div>
<div class="toolbar">${Object.keys(EQ_PRESETS).map((n) => `<button class="chip ${s.preset === n ? 'on' : ''}" data-act="eq-preset" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
<div class="glass"><canvas class="viz" id="viz2"></canvas><div class="eq">${BANDS.map((f, i) => `<div><span>${s.gains[i] > 0 ? '+' : ''}${s.gains[i]}</span><input class="v" type="range" min="-12" max="12" step="0.5" value="${s.gains[i]}" data-band="${i}"><span>${f >= 1000 ? f / 1000 + 'k' : f}</span></div>`).join('')}</div></div>
<div class="glass"><h3>Tone</h3>${slider('pre', 'Preamp', -12, 12, 0.5, s.pre, ' dB')}${slider('bass', 'Bass boost', 0, 12, 0.5, s.bass, ' dB')}</div>
<div class="glass"><h3>Reverb</h3><div class="toolbar">${REVERBS.map((r, i) => `<button class="chip ${s.rvPreset === i ? 'on' : ''}" data-act="rv" data-i="${i}">${r.n}</button>`).join('')}</div>${slider('rvmix', 'Wet / dry mix', 0, 1, 0.05, s.rvMix, '')}</div>
<div class="toolbar"><button class="btn ghost" data-act="save-eq-preset">Save current preset</button><button class="btn ghost" data-act="eq-reset">Reset all</button></div></div>`;
}
function pageStats() {
  const total = S.tracks.reduce((a, t) => a + t.plays, 0), mins = Math.floor(S.tracks.reduce((a, t) => a + t.plays * t.duration, 0) / 60);
  const topS = S.tracks.filter((t) => t.plays > 0).sort((a, b) => b.plays - a.plays).slice(0, 5).map((t) => [t.title, t.plays]);
  const am = new Map(); S.tracks.forEach((t) => { if (t.plays) am.set(t.artist, (am.get(t.artist) || 0) + t.plays); });
  const topA = [...am.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const gm = new Map(); S.tracks.forEach((t) => { if(t.plays) gm.set(t.genre||'Unknown genre',(gm.get(t.genre||'Unknown genre')||0)+t.plays); });
  const topG = [...gm.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const hours = (mins/60).toFixed(1);
  const bars = (rows) => rows.map(([n, c]) => `<div class="bar-row"><span class="t">${esc(n)}</span><div class="track"><div class="fill" style="width:${rows[0][1] ? (c / rows[0][1]) * 100 : 0}%"></div></div><span>${c}&times;</span></div>`).join('');
  return `<div class="page"><h1>Listening stats</h1><div class="glass split"><div class="stat"><b>${total}</b>plays</div><div class="stat"><b>${mins}</b>minutes</div><div class="stat"><b>${hours}</b>hours listened</div><div class="stat"><b>${S.tracks.length}</b>songs</div></div>${total ? `<div class="glass"><h3>Top songs</h3>${bars(topS)}</div><div class="glass"><h3>Top artists</h3>${bars(topA)}</div><div class="glass"><h3>Top genres</h3>${bars(topG)}</div>` : '<div class="sub" style="margin-top:14px">Play some songs and your stats will appear here.</div>'}</div>`;
}
const ABOUT = 'NyxenPlayer is a music player built around one simple idea: your music, your way. It plays the songs you already own, whether they are MP3, M4A, OGG, WAV or FLAC files stored on your computer, and wraps them in a fast, dark and animated design with gradient themes and a real sound studio.\n\nYour music never leaves your computer. There are no ads, no tracking and no servers. Your playlists, favorites, play counts and settings are stored only on this device, and you can delete everything at any time in Settings.\n\nMade by: [your name]    Contact: your-email@gmail.com';
let sleepMin = 0, sleepEnd = 0, sleepTimer = 0, sleepTrack = false;
function pageSettings() {
  const key = V.arg || 'overview';
  const toggle = (name,label,desc) => '<div class="setting-row"><div><b>'+label+'</b><small>'+desc+'</small></div><button class="chip '+(S.settings[name]?'on':'')+'" data-act="setting-toggle" data-key="'+name+'">'+(S.settings[name]?'On':'Off')+'</button></div>';
  const header = (title,desc) => '<div class="settings-heading"><button class="chip" data-act="settings-page" data-key="overview">← All settings</button><h1>'+title+'</h1><p class="sub">'+desc+'</p></div>';
  const cards = [
    ['library','Library & import','Music folders, video files and scanning','▤'],
    ['appearance','Appearance','Themes, accent colors and wallpapers','◐'],
    ['fonts','Fonts','Choose a custom font for Nyxen','Aa'],
    ['playback','Playback','Resume, queue, speed and playback behavior','▶'],
    ['sleep','Sleep timer','Timer presets and fade-out behavior','◷'],
    ['shortcuts','Keyboard shortcuts','Keys and media controls','⌘'],
    ['about','About','Version, credits and app information','ⓘ']
  ];
  if (key === 'overview') return '<div class="page settings-home"><div class="settings-heading"><h1>Settings</h1><p class="sub">Choose a section to customize NyxenPlayer.</p></div><div class="settings-card-grid">'+cards.map(c=>'<button class="settings-card" data-act="settings-page" data-key="'+c[0]+'"><span class="settings-card-icon">'+c[3]+'</span><span class="settings-card-copy"><b>'+c[1]+'</b><small>'+c[2]+'</small></span><span class="settings-card-arrow">›</span></button>').join('')+'</div></div>';
  if (key === 'library') return '<div class="page">'+header('Library & import','Manage the folders and media Nyxen scans.')+'<div class="glass"><h3>Music library</h3><p>'+S.folders.length+' watched folders · '+S.tracks.length+' songs</p><div class="toolbar"><button class="btn" data-act="import-folder">Import a folder</button><button class="btn ghost" data-act="import-files">Import files</button><button class="btn ghost" data-act="rescan">Rescan folders</button></div></div><div class="glass"><h3>Video library</h3><p>'+(S.videoFolders||[]).length+' watched folders · '+(S.videos||[]).length+' videos</p><div class="toolbar"><button class="btn ghost" data-act="import-video-folder">Import video folder</button><button class="btn ghost" data-act="import-video-files">Import videos</button></div></div><div class="glass"><h3>Offline soundscapes</h3><p>Import the optional Nyxen offline soundscape collection when its audio assets are included in this build.</p><button class="btn ghost" data-act="offline-pack">Add offline soundscapes</button></div><div class="glass"><h3>Backup & restore</h3><p>Export your library metadata, playlists, lyrics, listening history and settings to a JSON backup. Your original media files are never copied.</p><div class="toolbar"><button class="btn" data-act="export-backup">Export backup</button><button class="btn ghost" data-act="import-backup">Restore backup</button></div></div><div class="glass"><h3>Automatic scanning</h3>'+toggle('autoImport','Auto-import watched folders','Rescan watched music and video folders when Nyxen opens.')+'</div></div>';
  if (key === 'appearance') {
    const th = THEMES.map((t,i)=>'<button class="sw '+(S.settings.theme===i?'on':'')+'" data-act="theme" data-i="'+i+'" aria-label="Use '+esc(t.n)+' theme"><i style="background:linear-gradient(180deg,'+t.g.join(',')+')"></i>'+esc(t.n)+'</button>').join('');
    const wallpapers = Array.from({length:8},(_,i)=>'<button class="wallpaper '+(!S.settings.customWallpaper && S.settings.wallpaper===i+1?'on':'')+'" data-act="wallpaper" data-i="'+(i+1)+'"><img loading="lazy" src="nyxen://wallpaper/nyxen_wallpaper_'+String(i+1).padStart(2,'0')+'.png" alt=""><span>Wallpaper '+(i+1)+'</span></button>').join('');
    const photos = (S.customWallpapers||[]).map((item)=>'<button class="wallpaper '+(S.settings.customWallpaper===item.id?'on':'')+'" data-act="photo-wallpaper" data-id="'+item.id+'"><img loading="lazy" src="nyxen://wallpaper/custom/'+item.id+'.jpg" alt=""><span>'+esc(item.name)+'</span></button>').join('');
    return '<div class="page">'+header('Appearance','Change Nyxen’s colors, theme and background.')+'<div class="glass"><div class="split"><div class="grow"><h3>Album color matching</h3><p>Use the current song’s cover art to tint the player accent.</p></div><button class="chip '+(S.settings.cover?'on':'')+'" data-act="cover-toggle">'+(S.settings.cover?'On':'Off')+'</button></div></div><div class="glass"><h3>Built-in & custom themes</h3><p>Choose a complete gradient and accent palette. Your selection is saved automatically.</p><div class="swatches">'+th+'</div><h3 style="margin-top:22px">Create a custom theme</h3><div class="toolbar"><input class="field" id="custom-theme-name" placeholder="Theme name" maxlength="24"><input type="color" id="custom-theme-color" value="#b14bff" title="Accent color"><button class="btn ghost" data-act="save-custom-theme">Save palette</button></div></div><div class="glass"><div class="split"><div class="grow"><h3>Wallpaper collection</h3><p>Choose one of the eight built-in backgrounds or add your own photo.</p></div><button class="chip '+(!S.settings.wallpaper && !S.settings.customWallpaper?'on':'')+'" data-act="wallpaper" data-i="0">No wallpaper</button></div><div class="wallpaper-grid">'+wallpapers+photos+'</div><div class="toolbar" style="margin-top:14px"><button class="btn" data-act="import-photo-wallpaper">＋ Add photo wallpaper</button><span class="sub">JPG, PNG, WEBP, BMP or GIF · saved on this PC</span></div></div></div>';
  }
  if (key === 'fonts') return '<div class="page">'+header('Fonts','Set the typeface used throughout the desktop player.')+'<div class="glass"><h3>Current font</h3><p>'+esc(S.settings.customFontName||'System default')+'</p><div class="toolbar"><button class="btn" data-act="import-font">Import .TTF / .OTF font</button><button class="btn ghost" data-act="reset-font">Use system font</button></div><p class="sub">The font file is copied into Nyxen’s local app data, so the setting remains available after restarting.</p></div></div>';
  if (key === 'playback') return '<div class="page">'+header('Playback','Control how Nyxen starts and continues playing music.')+'<div class="glass">'+toggle('autoResume','Resume playback on launch','Continue playing automatically when Nyxen opens.')+toggle('rememberQueue','Save playback queue','Restore the same songs and playback position next time.')+toggle('autoplaySimilar','Auto-play similar tracks','Continue with an unqueued artist or genre match when the queue ends.')+toggle('keepAwake','Keep display awake','Prevent the display from sleeping while music is playing.')+'<div class="setting-row"><div><b>Playback speed</b><small>Adjust the playback rate from 0.5× to 2×.</small></div><select id="speed" class="field compact">'+[0.5,0.75,0.9,1,1.1,1.25,1.5,1.75,2].map(v=>'<option value="'+v+'" '+(Number(S.settings.speed||1)===v?'selected':'')+'>'+v+'×</option>').join('')+'</select></div></div><div class="glass"><h3>Interface behavior</h3>'+toggle('buttonSounds','Button sounds','Play a subtle UI sound when supported.')+'</div></div>';
  if (key === 'sleep') return '<div class="page">'+header('Sleep timer','Set a timer to stop playback automatically.')+'<div class="glass"><h3>Timer duration</h3><p>Choose how long Nyxen should continue playing.</p><div class="toolbar">'+[0,15,30,45,60].map(m=>'<button class="chip '+(sleepMin===m?'on':'')+'" data-act="sleep" data-m="'+m+'">'+(m?m+' min':'Off')+'</button>').join('')+'<button class="chip '+(sleepTrack?'on':'')+'" data-act="sleep-track">End of track</button></div><p class="sub">'+(sleepMin?'Timer active · '+Math.max(0,Math.ceil((sleepEnd-Date.now())/60000))+' minutes remaining':sleepTrack?'Will stop at the end of this track':'No timer is active')+'</p></div><div class="glass"><h3>Fade out</h3>'+toggle('sleepFade','Fade out before stopping','Gradually lower the volume during the final 20 seconds of the sleep timer.')+'</div></div>';
  if (key === 'shortcuts') return '<div class="page">'+header('Keyboard shortcuts','Use these shortcuts while the Nyxen window is active.')+'<div class="glass"><div class="shortcut-row"><kbd>Space</kbd><span>Play or pause</span></div><div class="shortcut-row"><kbd>← / →</kbd><span>Seek backward or forward 5 seconds</span></div><div class="shortcut-row"><kbd>Ctrl + ← / →</kbd><span>Previous or next song</span></div><div class="shortcut-row"><kbd>↑ / ↓</kbd><span>Increase or decrease volume</span></div><div class="shortcut-row"><kbd>M</kbd><span>Mute or unmute</span></div><div class="shortcut-row"><kbd>Media keys</kbd><span>Play/pause, next, previous and stop</span></div></div></div>';
  if (key === 'about') return '<div class="page">'+header('About NyxenPlayer','A local-first music player.')+'<div class="glass"><h3>NyxenPlayer</h3><p>'+esc(ABOUT)+'</p></div></div>';
  return '<div class="page">'+header('Settings','Choose a settings section.')+'</div>';
}
const PAGES = { home: pageHome, library: pageLibrary, videos: pageVideos, search: pageSearch, playlists: pagePlaylists, playlist: pagePlaylist, studio: pageStudio, stats: pageStats, settings: pageSettings };
const NAV = [['home', 'Home', 'home'], ['library', 'Library', 'lib'], ['videos', 'Videos', 'play'], ['search', 'Search', 'search'], ['playlists', 'Playlists', 'list'], ['studio', 'Audio Studio', 'eq'], ['stats', 'Stats', 'chart'], ['settings', 'Settings', 'gear']];
function go(page, arg = null) { V.page = page; V.arg = arg; V.group = null; render(); }
function render() {
  const m = $('#main'); m.innerHTML = PAGES[V.page](); m.scrollTop = 0;
  const on = V.page === 'playlist' ? 'playlists' : V.page;
  $$('#nav [data-page]').forEach((b) => b.classList.toggle('on', b.dataset.page === on));
  $$('input[type=range]:not(.v)', m).forEach((r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'));
  if (V.page === 'search') { const q = $('#q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
}

/* ================= player bar, now playing, queue ================= */
function updateProgress() {
  const d = mediaDuration();
  const t = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const safeTime = d ? clamp(t, 0, d) : 0;
  $$('.tcur').forEach((el) => { el.textContent = fmt(safeTime); });
  $$('.tdur').forEach((el) => { el.textContent = fmt(d); });
  if (!seeking) {
    $$('.seekin').forEach((el) => {
      const p = d ? clamp(safeTime / d, 0, 1) * 100 : 0;
      el.value = String(Math.round(p * 10));
      el.style.setProperty('--p', p + '%');
    });
  }
  updateLyricsProgress();
}
function commitSeek(input) {
  if (!input) return;
  const d = mediaDuration();
  if (d > 0) {
    const fraction = clamp(Number(input.value) / 1000, 0, 1);
    try { audio.currentTime = clamp(fraction * d, 0, Math.max(0, d - 0.05)); } catch {}
  }
  seeking = false;
  updateProgress();
}
function controls() {
  const m = S.settings.mode, playing = !audio.paused;
  return `<button class="icon ${m !== 'all' ? 'on' : ''}" data-act="mode" title="${MODE_NAME[m]}">${svg(MODE_ICON[m], 22)}</button><button class="icon" data-act="prev" title="Previous">${svg('prev', 24)}</button><button class="icon play" data-act="toggle" title="Play / pause">${svg(playing ? 'pause' : 'play', 28)}</button><button class="icon" data-act="next" title="Next">${svg('next', 24)}</button><button class="icon ${cur && cur.fav ? 'on' : ''}" data-act="fav" title="Favorite">${svg(cur && cur.fav ? 'fav' : 'fav0', 22)}</button>`;
}
function renderBar() {
  const v = Math.round(S.settings.volume * 100);
  $('#bar').innerHTML = `<div class="b-left" data-act="np-open">${cur ? art(cur, 'sm') : '<div class="art sm"><span class="ph">&#9834;</span></div>'}<div class="tmeta"><b>${cur ? esc(cur.title) : 'Nothing playing'}</b><span>${cur ? esc(cur.artist) : 'Pick a song to start'}</span></div></div>
<div class="b-mid"><div class="ctl">${controls()}</div><div class="seekrow"><span class="tcur">0:00</span><input class="seekin" type="range" min="0" max="1000" value="0"><span class="tdur">0:00</span></div></div>
<div class="b-right"><button class="icon" data-act="queue-toggle" title="Queue">${svg('list', 22)}</button><button class="icon" data-act="mute" title="Mute">${svg(muted || v === 0 ? 'mute' : 'vol', 22)}</button><input id="vol" type="range" min="0" max="100" value="${v}" style="--p:${v}%"><button class="icon" data-act="np-open" title="Now playing">${svg('up', 22)}</button></div>`;
}
function renderNP() {
  const np = $('#np'); if (!cur) { np.innerHTML = `<button class="icon close big" data-act="np-close">${svg('down', 28)}</button>`; return; }
  np.innerHTML = `<div class="bgimg" style="${cur.cover ? `background-image:url(nyxen://cover/${cur.id})` : ''}"></div><div class="wrap"><button class="icon close big" data-act="np-close">${svg('down', 28)}</button><div class="npart">${art(cur, 'xl')}</div><h1>${esc(cur.title)}</h1><div class="sub">${esc(cur.artist)} &middot; ${esc(cur.album)}</div><div class="sub" style="color:var(--accent)">${playsText(cur.plays)}</div><canvas class="viz" id="viz1" style="max-width:640px"></canvas><div class="seekrow"><span class="tcur">0:00</span><input class="seekin" type="range" min="0" max="1000" value="0"><span class="tdur">0:00</span></div><div class="npctl">${controls()}<button class="icon" data-act="lyrics" title="Lyrics">LYR</button><button class="icon" data-act="edit-track" title="Edit song info">${svg('more', 22)}</button><button class="icon" data-act="queue-toggle">${svg('list', 22)}</button></div></div>`;
}
function updatePlayerUI() {
  renderBar(); if (!$('#np').classList.contains('off')) renderNP();
  document.title = cur ? `${cur.title} · NyxenPlayer` : 'NyxenPlayer'; updateProgress();
}
function renderQueue() {
  const q = $('#queue'); if (q.classList.contains('off')) return;
  q.innerHTML = `<div class="split"><h2 class="grow" style="margin:0">Queue</h2><button class="icon" data-act="queue-toggle">${svg('close', 22)}</button></div><div class="sub" style="margin-bottom:10px">${Q.ids.length} songs &middot; ${MODE_NAME[S.settings.mode]}</div>` +
    Q.ids.map((id, i) => { const t = track(id); return t ? `<div class="trow ${i === Q.i ? 'cur' : ''}" data-act="q-jump" data-id="${t.id}" data-i="${i}">${art(t, 'sm')}<div class="tmeta"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div><button class="icon" data-act="q-rm" data-i="${i}">${svg('close', 18)}</button></div>` : ''; }).join('');
}
let idle = 0, vizAccent = '#b14bff', vizAccentT = 0; const vdata = new Uint8Array(256);
function vizLoop() {
  requestAnimationFrame(vizLoop);
  if (document.hidden || !ac) return;
  const c = !$('#np').classList.contains('off') ? $('#viz1') : $('#viz2'); if (!c) return;
  if (audio.paused) { if (idle++ > 90) return; } else idle = 0;
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  nodes.an.getByteFrequencyData(vdata);
  if (Date.now() - vizAccentT > 500) { vizAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || vizAccent; vizAccentT = Date.now(); }
  const n = 48, gap = 4, bw = (w - gap * (n - 1)) / n; g.fillStyle = vizAccent;
  for (let i = 0; i < n; i++) { const v = vdata[1 + Math.floor(Math.pow(i / n, 1.5) * 120)] / 255, bh = Math.max(3, v * h); g.globalAlpha = 0.55 + v * 0.45; g.beginPath(); g.roundRect(i * (bw + gap), h - bh, bw, bh, bw / 2); g.fill(); }
  g.globalAlpha = 1;
}

/* ================= dialogs ================= */
function closeModal() { const m = $('#modal'); m.classList.add('hidden'); m.innerHTML = ''; }
function askName(title, initial, label) {
  return new Promise((resolve) => {
    const m = $('#modal'), ideas = ['Road trip', 'Workout', 'Chill', 'Focus', 'Party', 'Late night', 'Study'];
    m.innerHTML = `<div class="dialog"><h2>${esc(title)}</h2><div class="sub">Give it a name you will recognise</div><div class="preview" id="pv">${esc(initial || 'Your playlist')}</div><input class="field" id="nm" maxlength="30" value="${esc(initial)}" placeholder="Playlist name"><div class="toolbar">${ideas.map((i) => `<button class="chip" data-idea="${esc(i)}">${esc(i)}</button>`).join('')}</div><div class="actions"><button class="btn ghost" id="nmc">Cancel</button><button class="btn" id="nmo">${esc(label)}</button></div></div>`;
    m.classList.remove('hidden');
    const inp = $('#nm'), pv = $('#pv'); inp.focus(); inp.select();
    const done = (v) => { closeModal(); resolve(v); };
    inp.addEventListener('input', () => { pv.textContent = inp.value || 'Your playlist'; });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.value.trim()) done(inp.value.trim()); if (e.key === 'Escape') done(null); });
    $$('[data-idea]', m).forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.idea; pv.textContent = inp.value; inp.focus(); }));
    $('#nmc').addEventListener('click', () => done(null));
    $('#nmo').addEventListener('click', () => { if (inp.value.trim()) done(inp.value.trim()); });
  });
}
function confirmBox(title, text, ok) {
  return new Promise((resolve) => {
    const m = $('#modal');
    m.innerHTML = `<div class="dialog"><h2>${esc(title)}</h2><p class="sub" style="font-size:14px;margin-top:8px">${esc(text)}</p><div class="actions"><button class="btn ghost" id="c-no">Cancel</button><button class="btn danger" id="c-yes">${esc(ok)}</button></div></div>`;
    m.classList.remove('hidden');
    const done = (v) => { closeModal(); resolve(v); };
    $('#c-no').addEventListener('click', () => done(false)); $('#c-yes').addEventListener('click', () => done(true));
  });
}
function pickPlaylist(toAdd) {
  const m = $('#modal');
  m.innerHTML = `<div class="dialog"><h2>Add to playlist</h2>${S.playlists.map((p) => `<button class="trow" style="width:100%;text-align:left" data-pick="${p.id}"><div class="tmeta"><b>${esc(p.name)}</b><span>${p.ids.length} songs</span></div></button>`).join('') || '<div class="sub">No playlists yet.</div>'}<div class="actions"><button class="btn ghost" id="pk-new">New playlist</button><button class="btn ghost" id="pk-x">Cancel</button></div></div>`;
  m.classList.remove('hidden');
  $$('[data-pick]', m).forEach((b) => b.addEventListener('click', () => { const p = S.playlists.find((x) => x.id === b.dataset.pick); toAdd.forEach((i) => { if (!p.ids.includes(i)) p.ids.push(i); }); save(); closeModal(); toast('Added to ' + p.name); if (V.page === 'playlists') render(); }));
  $('#pk-x').addEventListener('click', closeModal);
  $('#pk-new').addEventListener('click', async () => { closeModal(); const n = await askName('New playlist', '', 'Create'); if (n) { S.playlists.push({ id: 'p' + S.nextPl++, name: n, ids: [...toAdd] }); save(); toast('Created ' + n); if (V.page === 'playlists') render(); } });
}
function greet(first) { toast(first || !S.firstDone ? 'Welcome to NyxenPlayer!' : greeting() + ' to NyxenPlayer'); S.firstDone = true; save(); }
/* ================= library actions ================= */
let importing = false;
let videoImporting = false;
let currentVideo = null;
let videoCounted = false;
let lastVideoSave = 0;
let appBooted = false;
let queuedOpenVideo = null;

window.nyxen.onOpenVideo((filePath) => {
  queuedOpenVideo = filePath;
  if (appBooted) {
    const nextPath = queuedOpenVideo;
    queuedOpenVideo = null;
    openExternalVideo(nextPath);
  }
});

async function openExternalVideo(filePath) {
  const item = await window.nyxen.openVideoPath(filePath);
  if (!item) { toast('This video file could not be opened.'); return; }
  S.videos = S.videos || [];
  let existing = S.videos.find((video) => video.id === item.id);
  if (!existing) {
    S.videos.push(item);
    existing = item;
  }
  save();
  playVideo(existing.id);
}
async function importTargets(targets, folders, silent) {
  if (importing || !targets.length) return; importing = true; $('#sidefoot').textContent = 'Scanning...';
  try {
    const r = await window.nyxen.scan(targets, S.tracks.map((t) => t.id));
    r.added.forEach((t) => S.tracks.push(t));
    folders.forEach((f) => { if (!S.folders.includes(f)) S.folders.push(f); });
    S.lastScan = Date.now(); reindex(); save();
    if (!silent) { if (r.added.length) toast(`Added ${r.added.length} new songs`); else toast('No new songs found'); }
    render();
  } catch { toast('Import failed'); }
  importing = false; $('#sidefoot').textContent = '';
}
async function importVideoTargets(targets, folders = [], silent = false) {
  if (videoImporting || !targets.length) return;
  videoImporting = true;
  $('#sidefoot').textContent = 'Scanning videos...';
  try {
    const r = await window.nyxen.scanVideos(targets, (S.videos || []).map(v => v.id));
    S.videos = S.videos || [];
    r.added.forEach(v => S.videos.push(v));
    S.videoFolders = S.videoFolders || [];
    folders.forEach(f => { if (!S.videoFolders.includes(f)) S.videoFolders.push(f); });
    S.lastVideoScan = Date.now();
    save();
    render();
    if (!silent) toast(r.added.length ? 'Added ' + r.added.length + ' videos' : 'No new videos found');
  } catch {
    toast('Video import failed');
  } finally {
    videoImporting = false;
    $('#sidefoot').textContent = '';
  }
}
function playVideo(id) {
  const item = (S.videos || []).find(v => v.id === id);
  if (!item) return;
  audio.pause();
  const player = $('#nyxen-video');
  currentVideo = item;
  videoCounted = false;
  $('#video-title').textContent = item.title;
  $('#video-player').classList.remove('off');
  player.src = fileUrl(item.path);
  player.load();
  player.play().catch(() => toast('This video could not be played. Check its format or file location.'));
}
function getVideoAudioTracks() {
  const list = $('#nyxen-video')?.audioTracks;
  if (!list || typeof list.length !== 'number') return null;
  return Array.from({length:list.length}, (_, i) => list[i]);
}
function videoAudioTrackLabel(track, index) {
  return track.label || track.language || track.id || 'Audio track ' + (index + 1);
}
function updateVideoAudioButton() {
  const button = $('#video-audio-track');
  if (!button) return;
  const tracks = getVideoAudioTracks();
  button.disabled = false;
  button.title = !tracks ? 'Audio track selection is not supported by this video runtime' : tracks.length < 2 ? 'No alternate audio tracks detected' : 'Choose audio track';
  button.textContent = tracks && tracks.length > 1 ? 'Audio · ' + (tracks.findIndex(t => t.enabled) + 1) : 'Audio';
}
function selectVideoAudioTrack(index) {
  const tracks = getVideoAudioTracks();
  if (!tracks || !tracks[index]) { toast('This video runtime does not expose selectable audio tracks for this file.'); return; }
  tracks.forEach((track, i) => { track.enabled = i === index; });
  updateVideoAudioButton();
  toast('Audio track: ' + videoAudioTrackLabel(tracks[index], index));
}
function showVideoAudioMenu(x, y) {
  const tracks = getVideoAudioTracks();
  if (!tracks) {
    showContextMenu([{label:'Audio track selection unavailable', cmd:'noop', disabled:true}], x, y);
    return;
  }
  if (!tracks.length) {
    showContextMenu([{label:'No audio tracks detected', cmd:'noop', disabled:true}], x, y);
    return;
  }
  showContextMenu(tracks.map((track, i) => ({label:(track.enabled ? '✓ ' : '') + videoAudioTrackLabel(track, i), cmd:'video-audio', value:String(i)})), x, y);
}
function closeVideoPlayer() {
  const player = $('#nyxen-video');
  player.pause();
  player.removeAttribute('src');
  player.load();
  currentVideo = null;
  $('#video-player').classList.add('off');
}
function initVideoPlayer() {
  const player = $('#nyxen-video');
  player.addEventListener('play', () => { if (!audio.paused) audio.pause(); });
  player.addEventListener('loadedmetadata', updateVideoAudioButton);
  if (player.audioTracks) {
    player.audioTracks.addEventListener?.('addtrack', updateVideoAudioButton);
    player.audioTracks.addEventListener?.('removetrack', updateVideoAudioButton);
    player.audioTracks.addEventListener?.('change', updateVideoAudioButton);
  }
  $('#video-audio-track').addEventListener('click', (e) => showVideoAudioMenu(e.clientX || innerWidth - 220, e.clientY || 80));
  $('#video-back').addEventListener('click', closeVideoPlayer);
  $('#video-fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $('.video-screen').requestFullscreen();
    } catch { toast('Fullscreen is unavailable'); }
  });
  player.addEventListener('timeupdate', () => {
    if (!currentVideo) return;
    if (player.currentTime >= 3) {
      const now = Date.now();
      currentVideo.last = now;
      if (!videoCounted && player.currentTime >= Math.min((player.duration || 0) / 2 || 30, 30)) {
        currentVideo.plays = (currentVideo.plays || 0) + 1;
        videoCounted = true;
      }
      if (now - lastVideoSave >= 5000) { lastVideoSave = now; save(); }
    }
  });
  player.addEventListener('error', () => {
    if (currentVideo) toast('Cannot play "' + currentVideo.title + '". The file may have moved or use an unsupported codec.');
  });
}
function enqueue(id, afterCurrent) {
  if (!Q.ids.length) { playIds([id], 0); return; }
  if (afterCurrent) Q.ids.splice(Q.i + 1, 0, id); else Q.ids.push(id);
  if (Q.orig) {
    const currentIndex = Q.orig.indexOf(Q.ids[Q.i]);
    Q.orig.splice(afterCurrent && currentIndex >= 0 ? currentIndex + 1 : Q.orig.length, 0, id);
  }
  S.savedQueue=Q.ids.slice();S.savedQueueIndex=Q.i;save();
  toast(afterCurrent ? 'Will play next' : 'Added to queue'); renderQueue();
}
function removeTrack(id) {
  S.tracks = S.tracks.filter((t) => t.id !== id);
  S.playlists.forEach((p) => { p.ids = p.ids.filter((x) => x !== id); });
  const wasCur = !!(cur && cur.id === id);
  const removedBeforeCurrent = Q.ids.slice(0, Math.max(0, Q.i)).filter((queuedId) => queuedId === id).length;
  Q.ids = Q.ids.filter((queuedId) => queuedId !== id);
  if (Q.orig) Q.orig = Q.orig.filter((queuedId) => queuedId !== id);
  Q.i = Math.max(-1, Q.i - removedBeforeCurrent);
  if (wasCur) {
    clearTimeout(errorSkipTimer); errorSkipTimer = 0;
    cur = null;
    counted = touched = false;
    resumePos = 0;
    S.last = { id: null, pos: 0 };
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    Q.i = Q.ids.length ? clamp(Q.i, 0, Q.ids.length - 1) : -1;
  }
  S.savedQueue = Q.ids.slice();
  S.savedQueueIndex = Q.i;
  reindex();
  save();
  updatePlayerUI();
  render();
  renderQueue();
}
function movePl(pid, i, d) { const p = S.playlists.find((x) => x.id === pid); const j = i + d; if (!p || j < 0 || j >= p.ids.length) return; [p.ids[i], p.ids[j]] = [p.ids[j], p.ids[i]]; save(); render(); }
function setVolume(v) { S.settings.volume = clamp(v, 0, 1); muted = false; applyFx(); save(); renderBar(); updateProgress(); }
function setSleep(m) {
  clearInterval(sleepTimer); sleepTrack=false; sleepMin = m; sleepEnd = m ? Date.now() + m * 60000 : 0; applyFx();
  if (m) {
    sleepTimer = setInterval(() => {
      const left = sleepEnd - Date.now();
      if (left <= 0) { clearInterval(sleepTimer); audio.pause(); sleepMin = 0; sleepEnd = 0; applyFx(); toast('Sleep timer finished'); if (V.page === 'settings') render(); }
      else if (left < 20000 && nodes.master) nodes.master.gain.value = muted ? 0 : S.settings.volume * (S.settings.sleepFade ? left / 20000 : 1);
    }, 500);
    toast(`Sleep timer: ${m} min`);
  } else toast('Sleep timer off');
}
function setSleepEndTrack() { clearInterval(sleepTimer); sleepMin=0; sleepEnd=0; sleepTrack=true; applyFx(); toast('Sleep timer set for end of track'); if(V.page==='settings')render(); }
function applyCustomFont() {
  const file=S.settings.customFontFile;
  let style=$('#nyxen-font-style');
  if(!file){if(style)style.remove();document.documentElement.style.removeProperty('--custom-font');return;}
  if(!style){style=document.createElement('style');style.id='nyxen-font-style';document.head.appendChild(style);}
  style.textContent=`@font-face{font-family:NyxenCustom;src:url("nyxen://font/${encodeURIComponent(file)}");font-display:swap}`;
  document.documentElement.style.setProperty('--custom-font','NyxenCustom');
}
function applyWallpaper() {
  const n = clamp(Math.floor(Number(S.settings.wallpaper) || 0), 0, 8), bg = $('#bg');
  if (!bg) return;
  const custom = typeof S.settings.customWallpaper === 'string' && /^[a-f0-9]{16}$/.test(S.settings.customWallpaper);
  const image = custom ? `url("nyxen://wallpaper/custom/${S.settings.customWallpaper}.jpg")` : n ? `url("nyxen://wallpaper/nyxen_wallpaper_${String(n).padStart(2,'0')}.png")` : 'none';
  bg.style.backgroundImage = n || custom ? `linear-gradient(90deg,rgba(0,0,0,.68),rgba(0,0,0,.58)),${image}` : '';
  bg.style.backgroundSize = n ? 'cover' : ''; bg.style.backgroundPosition = 'center'; bg.style.backgroundRepeat = 'no-repeat';
}
function editTrack(t) {
  if(!t) return;
  const m=$('#modal');
  m.innerHTML=`<div class="dialog"><h2>Edit song info</h2><label>Title<input class="field" id="edit-title" value="${esc(t.title)}"></label><label>Artist<input class="field" id="edit-artist" value="${esc(t.artist)}"></label><label>Album<input class="field" id="edit-album" value="${esc(t.album)}"></label><label>Genre<input class="field" id="edit-genre" value="${esc(t.genre)}"></label><div class="actions"><button class="btn ghost" id="edit-cancel">Cancel</button><button class="btn" id="edit-save">Save changes</button></div></div>`;
  m.classList.remove('hidden'); $('#edit-cancel').onclick=closeModal;
  $('#edit-save').onclick=()=>{t.title=$('#edit-title').value.trim()||t.title;t.artist=$('#edit-artist').value.trim()||'Unknown artist';t.album=$('#edit-album').value.trim()||'Unknown album';t.genre=$('#edit-genre').value.trim()||'Unknown genre';save();closeModal();render();updatePlayerUI();toast('Song information updated');};
}
function renderLyrics(text) {
  if(!text) return 'No lyrics yet. Add a timed .lrc or plain .txt file for this song.';
  const lines=[];
  for(const raw of text.split(/\r?\n/)){
    const matches=[...raw.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const lyric=raw.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g,'').trim();
    if(matches.length){for(const m of matches){const fractionMs=m[3]?Number(m[3].padEnd(3,'0').slice(0,3)):0;const ms=(Number(m[1])*60+Number(m[2]))*1000+fractionMs;lines.push({ms,text:lyric});}}
    else if(raw.trim()) lines.push({ms:null,text:raw});
  }
  if(!lines.some(x=>x.ms!==null)) return lines.map(x=>`<span class="lyrics-line">${esc(x.text)}</span>`).join('');
  lines.sort((a,b)=>(a.ms??0)-(b.ms??0));
  return lines.map(x=>`<span class="lyrics-line" ${x.ms!==null?`data-ms="${x.ms}"`:''}>${esc(x.text||'·')}</span>`).join('');
}
function updateLyricsProgress() {
  const c=$('#lyrics-content'); if(!c || !$('#modal').dataset.lyricsId) return;
  const rows=$$('.lyrics-line[data-ms]',c); if(!rows.length) return;
  const now=(audio.currentTime||0)*1000; let active=null;
  rows.forEach(el=>{const ms=Number(el.dataset.ms);if(ms<=now)active=el;el.classList.toggle('active',false);});
  if(active){active.classList.add('active');if(c.dataset.activeLine !== active.dataset.ms){c.dataset.activeLine=active.dataset.ms;active.scrollIntoView({block:'center',behavior:'smooth'});}}
}
function openLyrics(t) {
  if(!t) return;
  const m=$('#modal'), lyric=S.lyrics[t.id]||''; m.dataset.lyricsId=t.id;
  m.innerHTML=`<div class="dialog lyrics-dialog"><div class="split"><h2 class="grow">Lyrics</h2><button class="icon" id="lyrics-close">${svg('close',20)}</button></div><div class="sub">${esc(t.title)} · ${esc(t.artist)}</div><div id="lyrics-content" class="lyrics-content">${renderLyrics(lyric)}</div><input id="lyrics-file" type="file" accept=".lrc,.txt,text/plain" hidden><div class="actions"><button class="btn ghost" id="lyrics-remove">Remove</button><button class="btn" id="lyrics-add">Add / replace lyrics</button></div></div>`;
  m.classList.remove('hidden'); $('#lyrics-close').onclick=closeModal;
  $('#lyrics-add').onclick=()=>$('#lyrics-file').click();
  $('#lyrics-file').onchange=async(e)=>{const f=e.target.files[0];if(!f)return;const text=(await f.text()).slice(0,200000);S.lyrics[t.id]=text;save();$('#lyrics-content').innerHTML=renderLyrics(text);updateLyricsProgress();toast('Lyrics added');};
  $('#lyrics-remove').onclick=()=>{delete S.lyrics[t.id];save();$('#lyrics-content').textContent='No lyrics yet.';};
}
function closeOverlays() { $('#np').classList.add('off'); $('#queue').classList.add('off'); $('#menu').classList.add('hidden'); }

/* ================= actions (click delegation) ================= */
const ACT = {
  nav: (d) => go(d.page),
  'settings-page': (d) => { V.arg = d.key || 'overview'; render(); },
  play: (d) => { const l = CTX.get(+d.ctx); if (l) playIds(l, +d.i); },
  menu: (d, e) => { const t = track(d.id); if (!t) return; const m = $('#menu'); m.dataset.id = d.id; m.innerHTML = `<button data-m="next">Play next</button><button data-m="queue">Add to queue</button><button data-m="fav">${t.fav ? 'Remove from favorites' : 'Add to favorites'}</button><button data-m="pl">Add to playlist...</button><button data-m="edit">Edit song info</button><button data-m="lyrics">Add / edit lyrics</button><button data-m="rm">Remove from library</button>`; m.classList.remove('hidden'); m.style.left = Math.min(e.clientX, innerWidth - 230) + 'px'; m.style.top = Math.min(e.clientY, innerHeight - 260) + 'px'; },
  group: (d) => { V.group = { cat: S.settings.cat, name: d.name }; render(); },
  back: () => { V.group = null; render(); },
  'play-group': () => playIds(ids(groupTracks()), 0),
  'shuffle-group': () => { const l = ids(groupTracks()); if (l.length) { setMode('shuffle'); playIds(l, Math.floor(Math.random() * l.length)); } },
  cat: (d) => { S.settings.cat = d.cat; V.group = null; save(); render(); },
  'sort-dir': () => { S.settings.asc = !S.settings.asc; save(); render(); },
  'shuffle-all': () => { if (!S.tracks.length) { toast('Import some music first'); return; } const l = ids(S.tracks); setMode('shuffle'); playIds(l, Math.floor(Math.random() * l.length)); },
  'go-fav': () => { S.settings.cat = 'favorites'; go('library'); },
  'import-folder': async () => { const f = await window.nyxen.pickFolder(); if (f) importTargets([f], [f]); },
  'import-files': async () => { const f = await window.nyxen.pickFiles(); if (f.length) importTargets(f, []); },
  'import-video-files': async () => { const f = await window.nyxen.pickVideoFiles(); if (f.length) importVideoTargets(f); },
  'import-video-folder': async () => { const f = await window.nyxen.pickFolder(); if (f) importVideoTargets([f], [f]); },
  'play-video': (d) => playVideo(d.id),
  'remove-video': async (d) => {
    const v = (S.videos || []).find(x => x.id === d.id);
    if (!v || !await confirmBox('Remove video?', '"' + v.title + '" will be removed from NyxenPlayer. The file stays on your computer.', 'Remove')) return;
    if (currentVideo && currentVideo.id === v.id) closeVideoPlayer();
    S.videos = S.videos.filter(x => x.id !== v.id);
    save(); render();
  },
  rescan: () => { if (!S.folders.length) toast('No folders yet. Import a folder first.'); else importTargets(S.folders, [], false); },
  'export-backup': () => {
    try {
      const payload = JSON.stringify({ format: 'nyxen-backup', version: 1, exportedAt: new Date().toISOString(), state: S }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'nyxen-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Backup exported');
    } catch { toast('Could not export backup'); }
  },
  'import-backup': () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files && input.files[0]; if (!file) return;
      try {
        if (file.size > 25 * 1024 * 1024) { toast('Backup is too large (25 MB maximum)'); return; }
        const parsed = JSON.parse(await file.text());
        const raw = parsed && parsed.format === 'nyxen-backup' ? parsed.state : parsed;
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || (!Array.isArray(raw.tracks) && !Array.isArray(raw.playlists))) throw new Error('Invalid backup');
        if (!await confirmBox('Restore backup?', 'This replaces the current Nyxen library, playlists, lyrics and settings. Your original media files will not be changed.', 'Restore')) return;
        S = normalizeState(raw); reindex(); save(); applyTheme(); applyFx(); setReverb(); applyCustomFont(); applyWallpaper(); updatePlayerUI(); render();
        toast('Backup restored. Re-import folders if any file paths have changed.');
      } catch { toast('That backup file is invalid or could not be read'); }
    };
    input.click();
  },
  sf: (d) => { V.sf = d.f; render(); },
  'search-recent': (d) => { V.q=d.q||'';render(); },

  'open-pl': (d) => go('playlist', d.pl),
  'select-track': (d,e) => { e.stopPropagation(); V.selected=V.selected.includes(d.id)?V.selected.filter(id=>id!==d.id):[...V.selected,d.id]; render(); },
  'clear-sel': () => { V.selected=[]; render(); },
  'bulk-fav': () => { const list=S.tracks.filter(t=>V.selected.includes(t.id)), all=list.length>0&&list.every(t=>t.fav); list.forEach(t=>t.fav=!all); V.selected=[]; save(); render(); toast(all?'Favorites removed':'Added to favorites'); },
  'bulk-pl': () => { const list=V.selected.filter(id=>track(id)); if(list.length)pickPlaylist(list); },
  'bulk-rm': async () => { const list=V.selected.slice(); if(!list.length)return; if(!await confirmBox('Remove selected tracks?',list.length+' tracks will be removed from Nyxen. The original files stay on your computer.','Remove'))return; list.forEach(id=>removeTrack(id)); V.selected=[]; save(); render(); toast('Selected tracks removed from library'); },
  'play-pl': (d) => { const l = ids(plTracks(d.pl)); if (l.length) playIds(l, 0); else toast('Nothing here yet'); },
  'shuffle-pl': (d) => { const l = ids(plTracks(d.pl)); if (l.length) { setMode('shuffle'); playIds(l, Math.floor(Math.random() * l.length)); } else toast('Nothing here yet'); },
  'new-pl': async () => { const n = await askName('New playlist', '', 'Create'); if (n) { S.playlists.push({ id: 'p' + S.nextPl++, name: n, ids: [] }); save(); toast('Created ' + n); render(); } },
  'rename-pl': async (d) => { const p = S.playlists.find((x) => x.id === d.pl); if (!p) return; const n = await askName('Rename playlist', p.name, 'Save'); if (n) { p.name = n; save(); render(); } },
  'del-pl': async (d) => { const p = S.playlists.find((x) => x.id === d.pl); if (p && await confirmBox('Delete playlist?', `"${p.name}" will be deleted. Your songs stay in the library.`, 'Delete')) { S.playlists = S.playlists.filter((x) => x.id !== d.pl); if (V.page === 'playlist') V.page = 'playlists'; save(); render(); } },
  'pl-up': (d) => movePl(d.pl, +d.i, -1), 'pl-down': (d) => movePl(d.pl, +d.i, 1),
  'pl-rm': (d) => { const p = S.playlists.find((x) => x.id === d.pl); if (p) { p.ids.splice(+d.i, 1); save(); render(); } },
  toggle: () => toggle(), next: () => next(true), prev: () => prev(),
  mode: () => setMode(MODES[(MODES.indexOf(S.settings.mode) + 1) % MODES.length]),
  fav: (d) => { const t = track(d.id || (cur && cur.id)); if (!t) return; t.fav = !t.fav; save(); updatePlayerUI(); render(); },
  mute: () => { muted = !muted; applyFx(); renderBar(); updateProgress(); },
  'np-open': () => { if (!cur) return; $('#np').classList.remove('off'); renderNP(); updateProgress(); },
  'np-close': () => $('#np').classList.add('off'),
  'queue-toggle': () => { const q = $('#queue'); q.classList.toggle('off'); renderQueue(); },
  'q-jump': (d) => { Q.i = +d.i; loadCurrent(true); },
  'q-rm': (d, e) => {
    e.stopPropagation();
    const i = +d.i;
    if (!Number.isInteger(i) || i < 0 || i >= Q.ids.length) return;
    const [removedId] = Q.ids.splice(i, 1);
    if (Q.orig) { const oi = Q.orig.indexOf(removedId); if (oi >= 0) Q.orig.splice(oi, 1); }
    if (i < Q.i) Q.i--;
    else if (i === Q.i) {
      if (Q.ids.length) { Q.i = Math.min(Q.i, Q.ids.length - 1); loadCurrent(true); }
      else {
        Q.i = -1; cur = null; counted = touched = false; resumePos = 0;
        S.last = { id: null, pos: 0 };
        audio.pause(); audio.removeAttribute('src'); audio.load(); updatePlayerUI();
      }
    }
    S.savedQueue = Q.ids.slice(); S.savedQueueIndex = Q.i;
    save(); renderQueue();
  },
  'eq-toggle': () => { S.settings.eqOn = !S.settings.eqOn; applyFx(); save(); render(); },
  'eq-preset': (d) => { S.settings.preset = d.n; S.settings.gains = EQ_PRESETS[d.n].slice(); applyFx(); save(); render(); },
  rv: (d) => { S.settings.rvPreset = +d.i; setReverb(); applyFx(); save(); render(); },
  'eq-reset': () => { Object.assign(S.settings, { gains: Array(10).fill(0), pre: 0, bass: 0, preset: 'Flat', rvPreset: 0, rvMix: 0.3, eqOn: true }); setReverb(); applyFx(); save(); render(); },
  theme: (d) => { const index = Number(d.i); if (!Number.isInteger(index) || !THEMES[index]) return; S.settings.theme = index; applyTheme(); save(); render(); },
  'cover-toggle': () => { S.settings.cover = !S.settings.cover; applyCoverAccent(); save(); render(); },
  wallpaper: (d) => { const index = Number(d.i); if (!Number.isInteger(index) || index < 0 || index > 8) return; S.settings.wallpaper = index; S.settings.customWallpaper = ''; applyWallpaper(); save(); render(); },
  'photo-wallpaper': (d) => { const id = String(d.id || ''); if (!(S.customWallpapers||[]).some((item) => item.id === id)) return; S.settings.wallpaper = 0; S.settings.customWallpaper = id; applyWallpaper(); save(); render(); },
  'import-photo-wallpaper': async () => {
    try {
      const item = await window.nyxen.pickWallpaper();
      if (!item) return;
      S.customWallpapers = S.customWallpapers || [];
      if (!S.customWallpapers.some((saved) => saved.id === item.id)) S.customWallpapers.push(item);
      S.settings.wallpaper = 0; S.settings.customWallpaper = item.id;
      applyWallpaper(); save(); render(); toast('Photo wallpaper added and applied');
    } catch { toast('Could not import that photo'); }
  },
  'save-custom-theme': () => {
    const name=$('#custom-theme-name')?.value.trim(), accent=$('#custom-theme-color')?.value;
    if(!name||!accent){toast('Enter a theme name and accent color');return;}
    const dark=(h)=>{const n=parseInt(h.slice(1),16);return `#${[16,8,0].map(s=>Math.round(((n>>s)&255)*.28).toString(16).padStart(2,'0')).join('')}`;};
    const theme={n:name,g:[accent,dark(accent),'#050509'],s:.12,a:accent};
    S.customThemes=S.customThemes||[];S.customThemes.push(theme);THEMES.push(theme);S.settings.theme=THEMES.length-1;applyTheme();save();render();toast('Custom theme saved');
  },
  'import-font': async () => {
    try { const font=await window.nyxen.pickFont(); if(!font)return; S.settings.customFontName=font.name;S.settings.customFontFile=font.fileName;applyCustomFont();save();render();toast('Custom font applied'); }
    catch { toast('Could not import that font'); }
  },
  'reset-font': () => { delete S.settings.customFontName;delete S.settings.customFontFile;applyCustomFont();save();render();toast('System font restored'); },
  'save-eq-preset': async () => {
    const name=await askName('Save EQ preset','','Save preset');
    if(!name)return;
    S.customEq=S.customEq||{};S.customEq[name]=S.settings.gains.slice();EQ_PRESETS[name]=S.settings.gains.slice();
    S.settings.preset=name;save();render();toast('Equalizer preset saved');
  },
  'setting-toggle': (d) => { const k=d.key; S.settings[k]=!S.settings[k]; if(k==='rememberQueue'&&!S.settings[k]){S.savedQueue=[];S.savedQueueIndex=0;} if(k==='keepAwake')syncKeepAwake(); save(); render(); },
  'offline-pack': async () => {
    try {
      const items = await window.nyxen.importOfflinePack();
      if (!Array.isArray(items)) {
        toast('Offline soundscapes are unavailable: required audio or cover files are missing from this build.');
        return;
      }
      const known = new Set(S.tracks.map(t=>t.id));
      const fresh = items.filter(x=>!known.has(x.id));
      if(!fresh.length){toast('Offline soundscapes are already in your library');return;}
      const r = await window.nyxen.scan(fresh.map(x=>x.path), S.tracks.map(t=>t.id));
      const names = [['Aurora Sleep','Nyxen','Offline Soundscapes','Ambient'],['Blue Hour','Nyxen','Offline Soundscapes','Electronic'],['Afterglow','Nyxen','Offline Soundscapes','Ambient']];
      r.added.forEach(t=>{const i=fresh.findIndex(x=>x.id===t.id);const n=names[i]||names[0];t.title=n[0];t.artist=n[1];t.album=n[2];t.genre=n[3];t.cover=true;S.tracks.push(t);});
      reindex();save();render();toast(`${r.added.length} offline soundscapes added`);
    }catch(err){toast('Could not import the offline soundscapes');}
  },
  lyrics: () => openLyrics(cur),
  'edit-track': () => editTrack(cur),
  sleep: (d) => { setSleep(+d.m); render(); },
  'sleep-track': () => setSleepEndTrack(),
  wipe: async () => {
    if (!await confirmBox('Delete all data?', 'This removes your library, playlists, favorites, play counts, settings and profile from NyxenPlayer. Your music files are not touched.', 'Delete')) return;
    clearTimeout(saveTimer); saveTimer = 0;
    cur = null; Q = { ids: [], i: -1, orig: null }; counted = touched = false; resumePos = 0;
    audio.pause(); audio.removeAttribute('src'); audio.load();
    await window.nyxen.wipe();
    clearTimeout(saveTimer); saveTimer = 0;
    S = DEFAULT(); reindex(); applyTheme(); applyFx(); setReverb(); updatePlayerUI(); render();
  }
};
const MENU = {
  play: (id) => playIds([id], 0),
  next: (id) => enqueue(id, true), queue: (id) => enqueue(id, false),
  fav: (id) => { const t = track(id); if (t) { t.fav = !t.fav; save(); updatePlayerUI(); render(); } },
  pl: (id) => pickPlaylist([id]), edit: (id) => editTrack(track(id)), lyrics: (id) => openLyrics(track(id)),
  rm: async (id) => { const t = track(id); if (t && await confirmBox('Remove from library?', `"${t.title}" will be removed from NyxenPlayer. The file stays on your computer.`, 'Remove')) removeTrack(id); }
};
function showContextMenu(items, x, y) {
  const menu = $('#menu');
  menu.dataset.contextMenu = '1';
  menu.innerHTML = items.map(item => `<button type="button" data-context-cmd="${esc(item.cmd)}" ${item.value !== undefined ? `data-context-value="${esc(item.value)}"` : ''} ${item.id ? `data-context-id="${esc(item.id)}"` : ''} ${item.disabled ? 'disabled' : ''}>${esc(item.label)}</button>`).join('');
  menu.classList.remove('hidden');
  const width = 248, height = Math.min(items.length * 42 + 12, innerHeight - 24);
  menu.style.left = Math.max(8, Math.min(x, innerWidth - width - 8)) + 'px';
  menu.style.top = Math.max(8, Math.min(y, innerHeight - height - 8)) + 'px';
}
function runContextCommand(button) {
  const cmd = button.dataset.contextCmd, id = button.dataset.contextId, value = button.dataset.contextValue;
  if (cmd.startsWith('track-')) { const action = cmd.slice(6); if (MENU[action]) MENU[action](id); }
  else if (cmd === 'video-play') ACT['play-video']({id});
  else if (cmd === 'video-remove') ACT['remove-video']({id});
  else if (cmd === 'playlist-open') go('playlist', id);
  else if (cmd === 'playlist-play') ACT['play-pl']({pl:id});
  else if (cmd === 'playlist-shuffle') ACT['shuffle-pl']({pl:id});
  else if (cmd === 'playlist-rename') ACT['rename-pl']({pl:id});
  else if (cmd === 'playlist-delete') ACT['del-pl']({pl:id});
  else if (cmd === 'group-open') { const el = button.dataset.contextGroup; V.group={cat:S.settings.cat,name:el}; render(); }
  else if (cmd === 'group-play') { const field={albums:'album',artists:'artist',genres:'genre'}[S.settings.cat], list=sortTracks(S.tracks.filter(t=>t[field]===button.dataset.contextGroup)); if(list.length)playIds(ids(list),0); }
  else if (cmd === 'group-shuffle') { const field={albums:'album',artists:'artist',genres:'genre'}[S.settings.cat], list=ids(sortTracks(S.tracks.filter(t=>t[field]===button.dataset.contextGroup))); if(list.length){setMode('shuffle');playIds(list,Math.floor(Math.random()*list.length));} }
  else if (cmd === 'video-audio') selectVideoAudioTrack(Number(value));
}
function uiClick() {
  if (!S.settings.buttonSounds || !ac) return;
  try {
    ac.resume().catch(() => {});
    const osc = ac.createOscillator(), gain = ac.createGain();
    osc.type = 'sine'; osc.frequency.value = 760;
    gain.gain.setValueAtTime(.018, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .035);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(); osc.stop(ac.currentTime + .04);
  } catch {}
}
document.addEventListener('contextmenu', (e) => {
  const videoPlayer = e.target.closest('#video-player:not(.off) .video-screen, #video-player:not(.off) .video-player-header');
  if (videoPlayer) { e.preventDefault(); showVideoAudioMenu(e.clientX, e.clientY); return; }
  const trackEl = e.target.closest('.trow[data-id], .card[data-id]');
  if (trackEl) {
    e.preventDefault();
    const id = trackEl.dataset.id, t = track(id); if (!t) return;
    showContextMenu([
      {label:'Play now',cmd:'track-play',id},
      {label:'Play next',cmd:'track-next',id},
      {label:'Add to queue',cmd:'track-queue',id},
      {label:t.fav?'Remove from favorites':'Add to favorites',cmd:'track-fav',id},
      {label:'Add to playlist…',cmd:'track-pl',id},
      {label:'Edit song info',cmd:'track-edit',id},
      {label:'Edit lyrics',cmd:'track-lyrics',id},
      {label:'Remove from Nyxen',cmd:'track-rm',id}
    ],e.clientX,e.clientY); return;
  }
  const videoEl = e.target.closest('.video-row[data-video-id]');
  if (videoEl) {
    e.preventDefault(); const id=videoEl.dataset.videoId;
    showContextMenu([{label:'Play video',cmd:'video-play',id},{label:'Remove from library',cmd:'video-remove',id}],e.clientX,e.clientY); return;
  }
  const playlistEl = e.target.closest('.trow[data-pl]');
  if (playlistEl) {
    e.preventDefault(); const id=playlistEl.dataset.pl, custom=S.playlists.some(p=>p.id===id);
    const items=[{label:'Open playlist',cmd:'playlist-open',id},{label:'Play playlist',cmd:'playlist-play',id},{label:'Shuffle playlist',cmd:'playlist-shuffle',id}];
    if(custom)items.push({label:'Rename playlist',cmd:'playlist-rename',id},{label:'Delete playlist',cmd:'playlist-delete',id});
    showContextMenu(items,e.clientX,e.clientY); return;
  }
  const groupEl = e.target.closest('.card[data-act="group"]');
  if (groupEl) {
    e.preventDefault(); const name=groupEl.dataset.name;
    showContextMenu([{label:'Open',cmd:'group-open',value:name},{label:'Play all',cmd:'group-play',value:name},{label:'Shuffle',cmd:'group-shuffle',value:name}],e.clientX,e.clientY);
    const buttons=$$('#menu [data-context-cmd]'); buttons.forEach(b=>b.dataset.contextGroup=name); return;
  }
});
document.addEventListener('click', (e) => {
  if (e.target.closest('button')) uiClick();
  const contextButton = e.target.closest('#menu [data-context-cmd]');
  if (contextButton) { if (!contextButton.disabled) runContextCommand(contextButton); $('#menu').classList.add('hidden'); return; }
  const mb = e.target.closest('#menu [data-m]');
  if (mb) { const id = $('#menu').dataset.id; $('#menu').classList.add('hidden'); MENU[mb.dataset.m](id); return; }
  if (!e.target.closest('#menu')) { $('#menu').classList.add('hidden'); delete $('#menu').dataset.contextMenu; }
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el.dataset, e);
});
const setP = (el) => {
  if (!el.classList.contains('v')) {
    const min = Number(el.min) || 0, max = Number(el.max) || 100;
    const p = max > min ? clamp((Number(el.value) - min) / (max - min), 0, 1) * 100 : 0;
    el.style.setProperty('--p', p + '%');
  }
};
let activeSeek = null;
document.addEventListener('pointerdown', (e) => {
  const input = e.target.closest && e.target.closest('.seekin');
  if (input) { activeSeek = input; seeking = true; }
});
document.addEventListener('input', (e) => {
  const t = e.target; if (t.type === 'range') setP(t);
  if (t.id === 'q') { V.q = t.value; $('#results').innerHTML = searchResults(); }
  else if (t.id === 'sortsel') { S.settings.sort = t.value; save(); render(); }
  else if (t.dataset && t.dataset.band !== undefined) { const i = +t.dataset.band; S.settings.gains[i] = +t.value; S.settings.preset = 'Custom'; t.previousElementSibling.textContent = (+t.value > 0 ? '+' : '') + t.value; applyFx(); save(); }
  else if (t.id === 'pre') { S.settings.pre = +t.value; $('#pre-v').textContent = t.value + ' dB'; applyFx(); save(); }
  else if (t.id === 'bass') { S.settings.bass = +t.value; $('#bass-v').textContent = t.value + ' dB'; applyFx(); save(); }
  else if (t.id === 'rvmix') { S.settings.rvMix = +t.value; $('#rvmix-v').textContent = t.value; applyFx(); save(); }
  else if (t.id === 'speed') { S.settings.speed = +t.value; audio.playbackRate = +t.value; save(); }
  else if (t.id === 'vol') { S.settings.volume = +t.value / 100; muted = false; applyFx(); save(); }
  else if (t.classList && t.classList.contains('seekin')) {
    seeking = true;
    const d = mediaDuration();
    if (d > 0) $$('.tcur').forEach((el) => { el.textContent = fmt((clamp(Number(t.value) / 1000, 0, 1)) * d); });
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.classList && t.classList.contains('seekin')) { commitSeek(t); activeSeek = null; }
});
document.addEventListener('pointerup', (e) => {
  if (activeSeek) { commitSeek(activeSeek); activeSeek = null; }
});
document.addEventListener('pointercancel', () => {
  if (activeSeek) { seeking = false; activeSeek = null; updateProgress(); }
});
window.addEventListener('blur', () => {
  if (activeSeek) { commitSeek(activeSeek); activeSeek = null; }
});
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (e.key === 'Escape') { if (!$('#video-player').classList.contains('off')) closeVideoPlayer(); closeOverlays(); return; }
  if (e.target.closest && e.target.closest('button, a, #nyxen-video, [contenteditable="true"]')) return;
  if (tag === 'input' || tag === 'select' || tag === 'textarea') { if(e.key==='Enter' && e.target.id==='q') rememberSearch(); return; }
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight') { if (e.ctrlKey) next(true); else audio.currentTime += 5; }
  else if (e.key === 'ArrowLeft') { if (e.ctrlKey) prev(); else audio.currentTime -= 5; }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setVolume(S.settings.volume + 0.05); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); setVolume(S.settings.volume - 0.05); }
  else if (e.key.toLowerCase() === 'm') ACT.mute();
});

/* ================= boot ================= */
async function boot() {
  const saved = await window.nyxen.loadState();
  S = normalizeState(saved);
  reindex();
  (S.customThemes||[]).forEach(t=>{if(t&&t.n&&t.a&&Array.isArray(t.g)&&!THEMES.some(x=>x.n===t.n&&x.a===t.a))THEMES.push(t);});
  Object.assign(EQ_PRESETS,S.customEq||{});
  initAudio(); audio.playbackRate = S.settings.speed || 1; initVideoPlayer(); applyTheme(); applyWallpaper(); applyCustomFont(); syncKeepAwake();
  $('#nav').innerHTML = NAV.map(([p, n, ic]) => `<button class="navb" data-act="nav" data-page="${p}">${svg(ic, 22)}<span>${n}</span></button>`).join('');
  window.nyxen.onScanProgress((p) => { $('#sidefoot').textContent = `Scanning ${p.done} / ${p.total}...`; });
  window.nyxen.onCommand((c) => { if (c === 'toggle') toggle(); else if (c === 'next') next(true); else if (c === 'prev') prev(); else if (c === 'stop') audio.pause(); });
  const lt = S.last.id && track(S.last.id);
  if (lt) {
    const restored = S.settings.rememberQueue && Array.isArray(S.savedQueue) ? S.savedQueue.filter(id=>track(id)) : [];
    Q = { ids: restored.length ? restored : ids(sortTracks(S.tracks)), i: 0, orig: null };
    Q.i = restored.length ? clamp(Number(S.savedQueueIndex||0),0,Q.ids.length-1) : Math.max(0,Q.ids.indexOf(lt.id));
    cur = track(Q.ids[Q.i]) || lt; resumePos = S.last.pos || 0; audio.src = fileUrl(cur.path); audio.playbackRate=Number(S.settings.speed||1); applyCoverAccent();
  }
  updatePlayerUI(); render(); vizLoop();
  appBooted = true;
  const startupVideo = await window.nyxen.takePendingVideo();
  if (startupVideo) queuedOpenVideo = startupVideo;
  if (queuedOpenVideo) {
    const nextPath = queuedOpenVideo;
    queuedOpenVideo = null;
    await openExternalVideo(nextPath);
  }
  greet(false);
  if (S.settings.autoResume && cur) play();
  if (S.settings.autoImport && S.folders.length && Date.now() - S.lastScan > 300000) importTargets(S.folders, [], true);
  if (S.settings.autoImport && Array.isArray(S.videoFolders) && S.videoFolders.length && Date.now() - (S.lastVideoScan || 0) > 300000) importVideoTargets(S.videoFolders, [], true);
}
boot();
