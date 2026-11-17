
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  protocol,
  net,
  globalShortcut,
  Menu,
  nativeImage,
  shell,
  powerSaveBlocker
} = require('electron');

// Expose Chromium's AudioTrackList API so the video player can switch embedded audio tracks.
app.commandLine.appendSwitch('enable-blink-features', 'AudioVideoTracks');

const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { Readable } = require('stream');
const { hashFile, groupCandidatesBySize, groupHashMatches } = require('./src/duplicate-utils');

// nyxen:// serves covers, audio and video files with CORS headers.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'nyxen',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true
    }
  }
]);

const AUDIO_EXT = new Set([
  '.mp3', '.m4a', '.aac', '.wav',
  '.ogg', '.opus', '.flac'
]);

const VIDEO_EXT = new Set([
  '.mp4', '.m4v', '.webm', '.mov'
]);

let win = null;
const allowedMediaPaths = new Set();
const mediaPathKey = (value) => path.resolve(value).toLowerCase();
function rememberStateMedia(state) {
  for (const item of [...(Array.isArray(state?.tracks) ? state.tracks : []), ...(Array.isArray(state?.videos) ? state.videos : [])]) {
    if (item && typeof item.path === 'string' && (AUDIO_EXT.has(path.extname(item.path).toLowerCase()) || VIDEO_EXT.has(path.extname(item.path).toLowerCase()))) allowedMediaPaths.add(mediaPathKey(item.path));
  }
}

const userData = () => app.getPath('userData');
const stateFile = () => path.join(userData(), 'nyxen-state.json');
const coverDir = () => path.join(userData(), 'covers');
const fontDir = () => path.join(userData(), 'fonts');
const wallpaperDir = () => path.join(userData(), 'wallpapers');

const idFor = (p) =>
  crypto.createHash('sha1')
    .update(p.toLowerCase())
    .digest('hex')
    .slice(0, 12);

if (!app.requestSingleInstanceLock()) app.quit();

let pendingVideoPath = null;

function isSupportedVideoPath(value) {
  return typeof value === 'string' && VIDEO_EXT.has(path.extname(value).toLowerCase());
}

function queueVideoOpen(value) {
  if (!isSupportedVideoPath(value)) return;
  pendingVideoPath = path.resolve(value);
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.webContents.send('app:open-video', pendingVideoPath);
  }
}

app.on('second-instance', (_event, commandLine) => {
  const videoPath = commandLine.find((value) => isSupportedVideoPath(value));
  if (videoPath) queueVideoOpen(videoPath);
  else if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  queueVideoOpen(filePath);
});

function withCors(res) {
  const headers = Object.fromEntries(res.headers);
  headers['Access-Control-Allow-Origin'] = '*';

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers
  });
}

async function mediaResponse(req, filePath) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, If-Range, Content-Type',
    'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Length, Content-Range',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff'
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (!['GET', 'HEAD'].includes(req.method)) return new Response('method not allowed', { status: 405, headers: corsHeaders });
  if (!allowedMediaPaths.has(mediaPathKey(filePath))) return new Response('forbidden', { status: 403, headers: corsHeaders });

  let stat;
  try { stat = await fsp.stat(filePath); } catch { return new Response('not found', { status: 404, headers: corsHeaders }); }
  if (!stat.isFile()) return new Response('not found', { status: 404, headers: corsHeaders });

  const mime = {
    '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
    '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.opus': 'audio/ogg',
    '.flac': 'audio/flac', '.mp4': 'video/mp4', '.m4v': 'video/mp4',
    '.webm': 'video/webm', '.mov': 'video/quicktime'
  }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const headers = { ...corsHeaders, 'Content-Type': mime, 'Content-Length': String(stat.size) };
  const range = req.headers.get('range');
  let start = 0;
  let end = Math.max(0, stat.size - 1);
  let status = 200;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match || (!match[1] && !match[2]) || stat.size === 0) {
      return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${stat.size}`, 'Content-Length': '0' } });
    }
    if (!match[1]) {
      const suffix = Number(match[2]);
      if (!Number.isSafeInteger(suffix) || suffix <= 0) {
        return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${stat.size}`, 'Content-Length': '0' } });
      }
      start = Math.max(0, stat.size - suffix);
      end = stat.size - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : stat.size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || end < start) {
        return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${stat.size}`, 'Content-Length': '0' } });
      }
      end = Math.min(end, stat.size - 1);
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    headers['Content-Length'] = String(end - start + 1);
  }

  if (req.method === 'HEAD') return new Response(null, { status, headers });
  const stream = stat.size === 0 ? fs.createReadStream(filePath) : fs.createReadStream(filePath, { start, end });
  return new Response(Readable.toWeb(stream), { status, headers });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#000000',
    title: 'NyxenPlayer',
    icon: path.join(__dirname, 'build', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    const appUrl = pathToFileURL(path.join(__dirname, 'src', 'index.html')).toString();
    if (url !== appUrl) event.preventDefault();
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  win.on('closed', () => {
    win = null;
  });
}

// AUDIO FILE SCANNING

async function walk(dir, out) {
  let ents;

  try {
    ents = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const e of ents) {
    const p = path.join(dir, e.name);

    if (e.isDirectory()) {
      await walk(p, out);
    } else if (AUDIO_EXT.has(path.extname(e.name).toLowerCase())) {
      out.push(p);
    }
  }
}

async function scan(targets, known) {
  const mm = await import('music-metadata');
  const files = [];

  for (const t of targets) {
    const st = await fsp.stat(t).catch(() => null);
    if (!st) continue;

    if (st.isDirectory()) {
      await walk(t, files);
    } else if (AUDIO_EXT.has(path.extname(t).toLowerCase())) {
      files.push(t);
    }
  }

  const uniqueFiles = [...new Map(files.map((file) => [path.resolve(file).toLowerCase(), file])).values()];
  const knownIds = known instanceof Set ? known : new Set(Array.isArray(known) ? known : []);
  const fresh = uniqueFiles.filter((file) => !knownIds.has(idFor(file)));

  await fsp.mkdir(coverDir(), { recursive: true });

  const added = [];
  let done = 0;

  for (const f of fresh) {
    const id = idFor(f);

    try {
      const meta = await mm.parseFile(f);
      const c = meta.common;
      const pic = c.picture && c.picture[0];

      let hasCover = false;

      if (pic) {
        try {
          const img = nativeImage.createFromBuffer(Buffer.from(pic.data));
          if (!img.isEmpty()) {
            const small = img.getSize().width > 400
              ? img.resize({ width: 400, quality: 'good' })
              : img;
            await fsp.writeFile(path.join(coverDir(), id + '.jpg'), small.toJPEG(82));
            hasCover = true;
          }
        } catch {
          // Invalid or unsupported artwork must not prevent importing the audio.
        }
      }

      allowedMediaPaths.add(mediaPathKey(f));
      added.push({
        id,
        path: f,
        title: c.title || path.basename(f, path.extname(f)),
        artist: c.artist || 'Unknown artist',
        album: c.album || 'Unknown album',
        genre: (c.genre && c.genre[0]) || 'Unknown genre',
        duration: meta.format.duration || 0,
        added: Date.now(),
        plays: 0,
        last: 0,
        fav: false,
        cover: hasCover
      });
    } catch {
      // Unreadable audio file: skip it.
    }

    done++;

    if (win && (done % 5 === 0 || done === fresh.length)) {
      win.webContents.send('scan:progress', {
        done,
        total: fresh.length
      });
    }
  }

  return {
    added,
    found: uniqueFiles.length
  };
}

async function findExactDuplicates(entries) {
  if (!Array.isArray(entries)) throw new Error('A track list is required for duplicate detection.');
  if (entries.length > 20000) throw new Error('Library is too large for one duplicate scan (20,000 tracks maximum).');

  const unique = new Map();
  let unavailableFiles = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.id !== 'string' || !/^[a-f0-9]{12}$/i.test(entry.id) ||
        typeof entry.path !== 'string' || !entry.path) {
      unavailableFiles++;
      continue;
    }

    let filePath;
    try { filePath = path.resolve(entry.path); } catch { unavailableFiles++; continue; }
    const key = mediaPathKey(filePath);
    if (!allowedMediaPaths.has(key) || idFor(filePath) !== entry.id) {
      unavailableFiles++;
      continue;
    }
    if (unique.has(key)) continue;

    const stat = await fsp.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      unavailableFiles++;
      continue;
    }
    unique.set(key, { id: entry.id, path: filePath, size: stat.size, mtimeMs: stat.mtimeMs });
  }

  // Files with different byte lengths cannot be identical. Hash only same-size
  // candidates to avoid reading every song in a large library unnecessarily.
  const candidates = groupCandidatesBySize([...unique.values()]).flat();
  const hashed = [];
  let cursor = 0;
  let done = 0;
  const worker = async () => {
    while (cursor < candidates.length) {
      const item = candidates[cursor++];
      try {
        const hash = await hashFile(item.path);
        const after = await fsp.stat(item.path);
        // Ignore a file that changed while it was being read.
        if (after.isFile() && after.size === item.size && after.mtimeMs === item.mtimeMs) {
          hashed.push({ id: item.id, size: item.size, hash });
        } else {
          unavailableFiles++;
        }
      } catch {
        unavailableFiles++;
      } finally {
        done++;
        if (win && !win.isDestroyed()) {
          win.webContents.send('duplicates:progress', { done, total: candidates.length });
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, candidates.length) }, worker));

  return {
    groups: groupHashMatches(hashed),
    libraryTracks: entries.length,
    candidateFiles: candidates.length,
    checkedFiles: hashed.length,
    unavailableFiles
  };
}

// VIDEO FILE SCANNING

async function walkVideos(dir, out) {
  let ents;

  try {
    ents = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const e of ents) {
    const p = path.join(dir, e.name);

    if (e.isDirectory()) {
      await walkVideos(p, out);
    } else if (VIDEO_EXT.has(path.extname(e.name).toLowerCase())) {
      out.push(p);
    }
  }
}

async function scanVideos(targets, known) {
  const files = [];

  for (const target of targets) {
    const st = await fsp.stat(target).catch(() => null);
    if (!st) continue;

    if (st.isDirectory()) {
      await walkVideos(target, files);
    } else if (VIDEO_EXT.has(path.extname(target).toLowerCase())) {
      files.push(target);
    }
  }

  const uniqueFiles = [...new Map(files.map((file) => [path.resolve(file).toLowerCase(), file])).values()];
  const knownIds = new Set(Array.isArray(known) ? known : []);

  uniqueFiles.forEach((file) => allowedMediaPaths.add(mediaPathKey(file)));
  const added = uniqueFiles
    .filter((file) => !knownIds.has(idFor(file)))
    .map((file) => ({
      id: idFor(file),
      path: file,
      title: path.basename(file, path.extname(file)),
      added: Date.now(),
      plays: 0,
      last: 0,
      fav: false,
      type: 'video'
    }));

  return {
    added,
    found: uniqueFiles.length
  };
}

// APPLICATION STATE

let stateWriteChain = Promise.resolve();
let isWiping = false;

ipcMain.handle('state:load', async () => {
  try {
    await stateWriteChain.catch(() => {});
    const state = JSON.parse(await fsp.readFile(stateFile(), 'utf8'));
    rememberStateMedia(state);
    return state;
  } catch {
    return null;
  }
});

ipcMain.handle('state:save', async (_e, data) => {
  if (isWiping) return false;
  const serialized = JSON.stringify(data);
  const write = stateWriteChain.catch(() => {}).then(async () => {
    await fsp.mkdir(userData(), { recursive: true });
    const tmp = stateFile() + '.tmp';
    await fsp.writeFile(tmp, serialized);
    await fsp.rename(tmp, stateFile());
  });
  stateWriteChain = write;
  await write;
  rememberStateMedia(data);
  return true;
});

// FILE PICKERS

ipcMain.handle('dialog:folder', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('dialog:files', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: 'Audio',
      extensions: [
        'mp3', 'm4a', 'aac', 'wav',
        'ogg', 'opus', 'flac'
      ]
    }]
  });

  return r.canceled ? [] : r.filePaths;
});

ipcMain.handle('video:take-pending-open', () => {
  const value = pendingVideoPath;
  pendingVideoPath = null;
  return value;
});

ipcMain.handle('video:open-external', async (_event, value) => {
  if (!isSupportedVideoPath(value)) return null;
  const filePath = path.resolve(value);
  const stat = await fsp.stat(filePath).catch(() => null);
  if (!stat || !stat.isFile()) return null;
  allowedMediaPaths.add(mediaPathKey(filePath));
  return {
    id: idFor(filePath),
    path: filePath,
    title: path.basename(filePath, path.extname(filePath)),
    added: Date.now(),
    plays: 0,
    last: 0,
    fav: false,
    type: 'video'
  };
});

ipcMain.handle('dialog:video-files', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: 'Videos',
      extensions: ['mp4', 'm4v', 'webm', 'mov']
    }]
  });

  return r.canceled ? [] : r.filePaths;
});

// AUDIO AND VIDEO SCAN HANDLERS

ipcMain.handle('scan', (_e, targets, known) => {
  const safeTargets = Array.isArray(targets) ? targets.filter((item) => typeof item === 'string' && item.length) : [];
  const safeKnown = Array.isArray(known) ? known.filter((item) => typeof item === 'string') : [];
  return scan(safeTargets, new Set(safeKnown));
});

ipcMain.handle('scan:videos', (_e, targets, known) => {
  const safeTargets = Array.isArray(targets) ? targets.filter((item) => typeof item === 'string' && item.length) : [];
  const safeKnown = Array.isArray(known) ? known.filter((item) => typeof item === 'string') : [];
  return scanVideos(safeTargets, safeKnown);
});

ipcMain.handle('library:find-exact-duplicates', (_e, entries) => findExactDuplicates(entries));

// OFFLINE AUDIO IMPORT

ipcMain.handle('offline:import', async () => {
  const audioDir = path.join(__dirname, 'resources', 'offline', 'audio');
  const coverSource = path.join(__dirname, 'resources', 'offline', 'covers');
  const targetDir = path.join(userData(), 'offline');

  const names = [
    'nyxen_sample_01.wav',
    'nyxen_sample_02.wav',
    'nyxen_sample_03.wav'
  ];
  const required = [
    ...names.map((name) => path.join(audioDir, name)),
    ...names.map((_, i) => path.join(coverSource, `nyxen_cover_0${i + 1}.png`))
  ];
  const missing = [];
  for (const file of required) {
    try { await fsp.access(file); } catch { missing.push(path.basename(file)); }
  }
  if (missing.length) return { available: false, missing };

  await fsp.mkdir(targetDir, { recursive: true });
  await fsp.mkdir(coverDir(), { recursive: true });
  const added = [];

  for (let i = 0; i < names.length; i++) {
    const source = path.join(audioDir, names[i]);
    const target = path.join(targetDir, names[i]);

    await fsp.writeFile(target, await fsp.readFile(source));

    const id = idFor(target);

    const cover = path.join(
      coverSource,
      `nyxen_cover_0${i + 1}.png`
    );

    const img = nativeImage.createFromBuffer(
      await fsp.readFile(cover)
    );

    if (!img.isEmpty()) {
      await fsp.writeFile(
        path.join(coverDir(), id + '.jpg'),
        img.toJPEG(88)
      );
    }

    added.push({
      path: target,
      id,
      cover: true,
      index: i
    });
  }

  return added;
});

// CUSTOM FONT IMPORT

ipcMain.handle('font:pick', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{
      name: 'Font files',
      extensions: ['ttf', 'otf']
    }]
  });

  if (result.canceled || !result.filePaths[0]) return null;

  const source = result.filePaths[0];
  const ext = path.extname(source).toLowerCase();

  const safeName = path.basename(source, ext)
    .replace(/[^a-z0-9_-]/gi, '_')
    .slice(0, 48) || 'custom-font';

  const fileName =
    `${safeName}-${crypto.randomBytes(4).toString('hex')}${ext}`;

  await fsp.mkdir(fontDir(), { recursive: true });

  await fsp.copyFile(
    source,
    path.join(fontDir(), fileName)
  );

  return {
    name: path.basename(source, ext),
    fileName
  };
});

// PHOTO WALLPAPER IMPORT

ipcMain.handle('wallpaper:pick', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const source = result.filePaths[0];
  const image = nativeImage.createFromPath(source);
  if (image.isEmpty()) throw new Error('Unsupported or invalid image');
  const size = image.getSize();
  if (!size.width || !size.height) throw new Error('Invalid image dimensions');
  const normalized = size.width > 2560 ? image.resize({ width: 2560, quality: 'good' }) : image;
  const id = crypto.randomBytes(8).toString('hex');
  await fsp.mkdir(wallpaperDir(), { recursive: true });
  await fsp.writeFile(path.join(wallpaperDir(), id + '.jpg'), normalized.toJPEG(90));
  return { id, name: path.basename(source, path.extname(source)).slice(0, 60) || 'Photo wallpaper' };
});

// KEEP DISPLAY AWAKE

let keepAwakeId = null;

ipcMain.handle('power:keep-awake', (_e, enabled) => {
  if (enabled && keepAwakeId === null) {
    keepAwakeId = powerSaveBlocker.start('prevent-display-sleep');
  } else if (!enabled && keepAwakeId !== null) {
    powerSaveBlocker.stop(keepAwakeId);
    keepAwakeId = null;
  }

  return true;
});

// WIPE APPLICATION DATA

ipcMain.handle('wipe', async () => {
  isWiping = true;
  try {
    await stateWriteChain.catch(() => {});
    if (keepAwakeId !== null) { powerSaveBlocker.stop(keepAwakeId); keepAwakeId = null; }
    allowedMediaPaths.clear();
    await fsp.rm(stateFile(), { force: true });
    await fsp.rm(stateFile() + '.tmp', { force: true });
    await fsp.rm(coverDir(), { recursive: true, force: true });
    await fsp.rm(path.join(userData(), 'offline'), { recursive: true, force: true });
    await fsp.rm(fontDir(), { recursive: true, force: true });
    await fsp.rm(wallpaperDir(), { recursive: true, force: true });
    return true;
  } finally {
    isWiping = false;
  }
});

// EXTERNAL LINKS

ipcMain.handle('open-external', async (_e, value) => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    await shell.openExternal(url.toString());
    return true;
  } catch {
    return false;
  }
});

// APPLICATION STARTUP

app.whenReady().then(() => {
  protocol.handle('nyxen', async (req) => {
    try {
      const u = new URL(req.url);

      if (u.hostname === 'cover') {
        const f = path.join(
          coverDir(),
          path.basename(u.pathname) + '.jpg'
        );

        return withCors(
          await net.fetch(pathToFileURL(f).toString())
        );
      }

      if (u.hostname === 'font') {
        const f = path.join(
          fontDir(),
          path.basename(u.pathname)
        );

        return withCors(
          await net.fetch(pathToFileURL(f).toString())
        );
      }

      if (u.hostname === 'wallpaper') {
        const custom = /^\/custom\/([a-f0-9]{16})\.jpg$/.exec(decodeURIComponent(u.pathname));
        if (custom) {
          const data = await fsp.readFile(path.join(wallpaperDir(), custom[1] + '.jpg'));
          return withCors(new Response(data, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000' } }));
        }
        const name = path.basename(decodeURIComponent(u.pathname));
        if (!/^nyxen_wallpaper_0[1-8]\.png$/.test(name)) {
          return new Response('not found', { status: 404 });
        }
        const f = path.join(__dirname, 'resources', 'offline', 'wallpapers', name);
        const data = await fsp.readFile(f);
        return withCors(new Response(data, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000'
          }
        }));
      }

      if (u.hostname === 'file') {
        const p = Buffer.from(
          u.pathname.slice(1),
          'base64url'
        ).toString('utf8');
        return mediaResponse(req, p);
      }
    } catch {
      // Invalid or inaccessible resource.
    }

    return new Response('not found', { status: 404 });
  });

  const startupVideo = process.argv.find((value) => isSupportedVideoPath(value));
  if (startupVideo) pendingVideoPath = path.resolve(startupVideo);
  createWindow();

  const send = (c) => () => {
    if (win) win.webContents.send('cmd', c);
  };

  globalShortcut.register('MediaPlayPause', send('toggle'));
  globalShortcut.register('MediaNextTrack', send('next'));
  globalShortcut.register('MediaPreviousTrack', send('prev'));
  globalShortcut.register('MediaStop', send('stop'));
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();

  if (keepAwakeId !== null) {
    powerSaveBlocker.stop(keepAwakeId);
  }
});

app.on('window-all-closed', () => app.quit());
