const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nyxen', {
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (s) => ipcRenderer.invoke('state:save', s),
  pickFolder: () => ipcRenderer.invoke('dialog:folder'),
  pickFiles: () => ipcRenderer.invoke('dialog:files'),
  scan: (targets, known) => ipcRenderer.invoke('scan', targets, known),
  wipe: () => ipcRenderer.invoke('wipe'),
  importOfflinePack: () => ipcRenderer.invoke('offline:import'),
  pickFont: () => ipcRenderer.invoke('font:pick'),
  setKeepAwake: (enabled) => ipcRenderer.invoke('power:keep-awake', !!enabled),
  openExternal: (u) => ipcRenderer.invoke('open-external', u),
  onScanProgress: (cb) => ipcRenderer.on('scan:progress', (_e, p) => cb(p)),
  onCommand: (cb) => ipcRenderer.on('cmd', (_e, c) => cb(c))
});
