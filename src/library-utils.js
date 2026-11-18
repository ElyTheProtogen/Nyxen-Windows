'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenLibraryUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function applyBulkMetadata(tracks, selectedIds, updates) {
    if (!Array.isArray(tracks) || !Array.isArray(selectedIds) || !updates || typeof updates !== 'object') return 0;
    const selected = new Set(selectedIds.filter((id) => typeof id === 'string' && id));
    const genre = typeof updates.genre === 'string' ? updates.genre.trim().slice(0, 80) : '';
    const albumArtist = typeof updates.albumArtist === 'string' ? updates.albumArtist.trim().slice(0, 120) : '';
    if (!selected.size || (!genre && !albumArtist)) return 0;

    let changed = 0;
    for (const track of tracks) {
      if (!track || !selected.has(track.id)) continue;
      let didChange = false;
      if (genre && track.genre !== genre) {
        track.genre = genre;
        didChange = true;
      }
      if (albumArtist && track.albumArtist !== albumArtist) {
        track.albumArtist = albumArtist;
        didChange = true;
      }
      if (didChange) changed++;
    }
    return changed;
  }

  return { applyBulkMetadata };
});
