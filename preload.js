
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nyxen', {
  // Application state
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (s) => ipcRenderer.invoke('state:save', s),

  // Audio file management
  pickFolder: () => ipcRenderer.invoke('dialog:folder'),
  pickFiles: () => ipcRenderer.invoke('dialog:files'),
  scan: (targets, known) =>
    ipcRenderer.invoke('scan', targets, known),
  findExactDuplicates: (tracks) => ipcRenderer.invoke('library:find-exact-duplicates', tracks),

  // Video file management
  pickVideoFiles: () =>
    ipcRenderer.invoke('dialog:video-files'),

  scanVideos: (targets, known) =>
    ipcRenderer.invoke('scan:videos', targets, known),
  openVideoPath: (filePath) => ipcRenderer.invoke('video:open-external', filePath),
  takePendingVideo: () => ipcRenderer.invoke('video:take-pending-open'),
  onOpenVideo: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const listener = (_e, filePath) => cb(filePath);
    ipcRenderer.on('app:open-video', listener);
    return () => ipcRenderer.removeListener('app:open-video', listener);
  },

  // Application utilities
  wipe: () => ipcRenderer.invoke('wipe'),
  importOfflinePack: () => ipcRenderer.invoke('offline:import'),
  pickFont: () => ipcRenderer.invoke('font:pick'),
  pickWallpaper: () => ipcRenderer.invoke('wallpaper:pick'),

  // Power management
  setKeepAwake: (enabled) =>
    ipcRenderer.invoke('power:keep-awake', !!enabled),


  // External links
  openExternal: (u) =>
    ipcRenderer.invoke('open-external', u),

  // Events
  onScanProgress: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const listener = (_e, progress) => cb(progress);
    ipcRenderer.on('scan:progress', listener);
    return () => ipcRenderer.removeListener('scan:progress', listener);
  },

  onDuplicateProgress: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const listener = (_e, progress) => cb(progress);
    ipcRenderer.on('duplicates:progress', listener);
    return () => ipcRenderer.removeListener('duplicates:progress', listener);
  },

  onCommand: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const listener = (_e, command) => cb(command);
    ipcRenderer.on('cmd', listener);
    return () => ipcRenderer.removeListener('cmd', listener);
  }
});
