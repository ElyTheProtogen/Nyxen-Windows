'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenNearDuplicateUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizeMetadataText(value) {
    return String(value == null ? '' : value)
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/\.[a-z0-9]{2,5}$/i, '')
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function durationTolerance(seconds) {
    return Math.max(2, Math.min(6, seconds * 0.01));
  }

  function findNearDuplicateGroups(entries) {
    const buckets = new Map();
    for (const item of Array.isArray(entries) ? entries : []) {
      if (!item || typeof item.id !== 'string' || !item.id) continue;
      const title = normalizeMetadataText(item.title);
      const artist = normalizeMetadataText(item.artist);
      const duration = Number(item.duration);
      if (!title || !artist || !Number.isFinite(duration) || duration <= 0) continue;

      const key = title + '\u0000' + artist;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({
        id: item.id,
        title: String(item.title || ''),
        artist: String(item.artist || ''),
        duration
      });
    }

    const groups = [];
    for (const bucket of buckets.values()) {
      bucket.sort((a, b) => a.duration - b.duration || a.id.localeCompare(b.id));
      const seen = new Set();
      const unique = bucket.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      let cluster = [];
      const flush = () => {
        if (cluster.length > 1) {
          const minDuration = cluster[0].duration;
          const maxDuration = cluster[cluster.length - 1].duration;
          groups.push({
            title: cluster[0].title,
            artist: cluster[0].artist,
            ids: cluster.map((item) => item.id),
            minDuration,
            maxDuration,
            durationSpread: Number((maxDuration - minDuration).toFixed(3))
          });
        }
        cluster = [];
      };

      for (const item of unique) {
        if (cluster.length && item.duration - cluster[0].duration > durationTolerance(cluster[0].duration)) flush();
        cluster.push(item);
      }
      flush();
    }

    return groups.sort((a, b) =>
      a.title.localeCompare(b.title) ||
      a.artist.localeCompare(b.artist) ||
      a.minDuration - b.minDuration
    );
  }

  return { normalizeMetadataText, findNearDuplicateGroups };
});
