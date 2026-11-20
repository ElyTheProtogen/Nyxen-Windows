'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenMissingFileUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const validId = (value) => typeof value === 'string' && /^[a-f0-9]{12}$/i.test(value);

  function applyRelinks(state, matches) {
    if (!state || !Array.isArray(state.tracks) || !Array.isArray(matches) || !matches.length) return null;

    const oldIds = new Set();
    const newIds = new Set();
    const paths = new Set();
    const prepared = [];

    for (const match of matches) {
      if (!match || !validId(match.oldId) || !validId(match.newId) ||
          typeof match.path !== 'string' || !match.path.trim()) return null;
      const pathKey = match.path.replace(/\//g, '\\').toLowerCase();
      if (oldIds.has(match.oldId) || newIds.has(match.newId) || paths.has(pathKey)) return null;

      const found = state.tracks.filter((item) => item && item.id === match.oldId);
      if (found.length !== 1) return null;
      const item = found[0];
      const target = state.tracks.find((candidate) => candidate && candidate.id === match.newId);
      if (target && target !== item) return null;

      oldIds.add(match.oldId);
      newIds.add(match.newId);
      paths.add(pathKey);
      prepared.push({ match, item });
    }

    // A batch cannot reuse another selected track's old ID as a destination ID.
    if (prepared.some(({ match }) => oldIds.has(match.newId) && match.newId !== match.oldId)) return null;

    const mapping = new Map(prepared.map(({ match }) => [match.oldId, match.newId]));
    for (const { match, item } of prepared) {
      item.id = match.newId;
      item.path = match.path;
      if (typeof match.coverAvailable === 'boolean') item.cover = match.coverAvailable;
    }

    if (Array.isArray(state.playlists)) {
      state.playlists.forEach((playlist) => {
        if (playlist && Array.isArray(playlist.ids)) {
          playlist.ids = playlist.ids.map((id) => mapping.get(id) || id);
        }
      });
    }
    if (Array.isArray(state.savedQueue)) {
      state.savedQueue = state.savedQueue.map((id) => mapping.get(id) || id);
    }
    if (state.last && mapping.has(state.last.id)) state.last.id = mapping.get(state.last.id);

    if (state.lyrics && typeof state.lyrics === 'object') {
      for (const [oldId, newId] of mapping) {
        if (oldId !== newId &&
            Object.prototype.hasOwnProperty.call(state.lyrics, oldId) &&
            !Object.prototype.hasOwnProperty.call(state.lyrics, newId)) {
          state.lyrics[newId] = state.lyrics[oldId];
          delete state.lyrics[oldId];
        }
      }
    }

    return prepared.map(({ item }) => item);
  }

  function applyRelink(state, oldId, newId, newPath) {
    const changed = applyRelinks(state, [{ oldId, newId, path: newPath }]);
    return changed ? changed[0] : null;
  }

  return { applyRelink, applyRelinks, validId };
});
