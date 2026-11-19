'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenMissingFileUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const validId = (value) => typeof value === 'string' && /^[a-f0-9]{12}$/i.test(value);

  function applyRelink(state, oldId, newId, newPath) {
    if (!state || !Array.isArray(state.tracks) || !validId(oldId) ||
        !validId(newId) || typeof newPath !== 'string' || !newPath.trim()) return null;

    const item = state.tracks.find((track) => track && track.id === oldId);
    if (!item || state.tracks.some((track) => track && track !== item && track.id === newId)) return null;

    item.id = newId;
    item.path = newPath;

    if (Array.isArray(state.playlists)) {
      state.playlists.forEach((playlist) => {
        if (playlist && Array.isArray(playlist.ids)) {
          playlist.ids = playlist.ids.map((id) => id === oldId ? newId : id);
        }
      });
    }
    if (Array.isArray(state.savedQueue)) {
      state.savedQueue = state.savedQueue.map((id) => id === oldId ? newId : id);
    }
    if (state.last && state.last.id === oldId) state.last.id = newId;

    if (state.lyrics && typeof state.lyrics === 'object' &&
        Object.prototype.hasOwnProperty.call(state.lyrics, oldId) &&
        !Object.prototype.hasOwnProperty.call(state.lyrics, newId)) {
      state.lyrics[newId] = state.lyrics[oldId];
      delete state.lyrics[oldId];
    }

    return item;
  }

  return { applyRelink, validId };
});
