
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

  // Video file management
  pickVideoFiles: () =>
    ipcRenderer.invoke('dialog:video-files'),

  scanVideos: (targets, known) =>
    ipcRenderer.invoke('scan:videos', targets, known),

  // Application utilities
  wipe: () => ipcRenderer.invoke('wipe'),
  importOfflinePack: () => ipcRenderer.invoke('offline:import'),
  pickFont: () => ipcRenderer.invoke('font:pick'),

  // Power management
  setKeepAwake: (enabled) =>
    ipcRenderer.invoke('power:keep-awake', !!enabled),

  // External links
  openExternal: (u) =>
    ipcRenderer.invoke('open-external', u),

  // Events
  onScanProgress: (cb) =>
    ipcRenderer.on('scan:progress', (_e, p) => cb(p)),

  onCommand: (cb) =>
    ipcRenderer.on('cmd', (_e, c) => cb(c))
});
