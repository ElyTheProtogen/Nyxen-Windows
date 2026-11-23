'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenLibraryHealthUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const fields = ['title', 'artist', 'album', 'genre'];
  const missingValue = (value) => typeof value !== 'string' || !value.trim() ||
    ['unknown', 'unknown artist', 'unknown album', 'unknown genre', 'untitled'].includes(value.trim().toLowerCase());

  function summarize(tracks, missingIds, scan) {
    const entries = Array.isArray(tracks) ? tracks : [];
    const ids = new Set(entries.filter((track) => track && typeof track.id === 'string').map((track) => track.id));
    const missing = new Set((Array.isArray(missingIds) ? missingIds : []).filter((id) => ids.has(id))).size;
    const checked = Math.max(0, Math.min(entries.length, Number.isFinite(scan?.checked) ? Math.floor(scan.checked) : 0));
    const inaccessible = Math.max(0, Math.min(checked - missing, Number.isFinite(scan?.inaccessible) ? Math.floor(scan.inaccessible) : 0));
    const unverified = Math.max(0, Math.min(entries.length - checked, Number.isFinite(scan?.unverified) ? Math.floor(scan.unverified) : 0));
    const metadataGaps = Object.fromEntries(fields.map((field) => [field, 0]));
    let metadataIncomplete = 0;
    for (const track of entries) {
      const gaps = fields.filter((field) => missingValue(track?.[field]));
      if (gaps.length) metadataIncomplete++;
      for (const field of gaps) metadataGaps[field]++;
    }
    return {
      total: entries.length, available: checked - missing - inaccessible,
      missing, inaccessible, unverified, metadataIncomplete, metadataGaps
    };
  }

  return { summarize };
});
