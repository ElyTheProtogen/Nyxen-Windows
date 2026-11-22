'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NyxenQueueUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function moveItem(queue, currentIndex, fromIndex, toIndex) {
    const ids = Array.isArray(queue) ? queue.slice() : [];
    const valid = Number.isInteger(fromIndex) && Number.isInteger(toIndex) &&
      fromIndex >= 0 && fromIndex < ids.length && toIndex >= 0 && toIndex < ids.length;
    if (!valid || fromIndex === toIndex) {
      return { ids, index: Number.isInteger(currentIndex) ? currentIndex : -1, moved: false };
    }

    const [item] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, item);

    let index = Number.isInteger(currentIndex) ? currentIndex : -1;
    if (index === fromIndex) index = toIndex;
    else if (fromIndex < index && toIndex >= index) index -= 1;
    else if (fromIndex > index && toIndex <= index) index += 1;

    return { ids, index, moved: true };
  }

  const SEARCH_FIELDS = {
    title: 'title',
    artist: 'artist',
    album: 'album',
    albumartist: 'albumArtist',
    'album-artist': 'albumArtist',
    genre: 'genre',
    path: 'path',
    file: 'path',
    filename: 'path'
  };

  function parseTrackQuery(query) {
    const source = String(query ?? '').trim();
    const tokens = source.match(/(?:-)?[a-z][a-z0-9_-]*:"[^"]*"|(?:-)?[a-z][a-z0-9_-]*:\S+|-"[^"]*"|-[^\s]+|"[^"]*"|\S+/gi) || [];
    return tokens.map((raw) => {
      const negative = raw.startsWith('-');
      const body = negative ? raw.slice(1) : raw;
      const match = body.match(/^([a-z][a-z0-9_-]*):/i);
      const fieldName = match ? match[1].toLowerCase() : '';
      const field = SEARCH_FIELDS[fieldName] || null;
      const rawValue = field ? body.slice(match[0].length) : body;
      const value = rawValue.replace(/^"|"$/g, '').trim().toLowerCase();
      return value ? { negative, field, value } : null;
    }).filter(Boolean);
  }

  function matchesTrack(track, query) {
    if (!track || typeof track !== 'object') return false;
    const tokens = parseTrackQuery(query);
    if (!tokens.length) return true;
    const values = {
      title: track.title,
      artist: track.artist,
      album: track.album,
      albumArtist: track.albumArtist || track.albumartist || track.artist,
      genre: track.genre,
      path: track.path
    };
    const allFields = Object.values(values).filter((value) => value !== undefined && value !== null).join(' ').toLowerCase();
    return tokens.every(({ negative, field, value }) => {
      const haystack = field
        ? String(values[field] ?? '').toLowerCase()
        : allFields;
      const found = haystack.includes(value);
      return negative ? !found : found;
    });
  }

  function filterEntries(tracks, query) {
    return Array.isArray(tracks)
      ? tracks.map((track, index) => ({ track, index })).filter((entry) => matchesTrack(entry.track, query))
      : [];
  }

  function filterTracks(tracks, query) {
    return filterEntries(tracks, query).map((entry) => entry.track);
  }

  return { moveItem, parseTrackQuery, matchesTrack, filterTracks, filterEntries };
});
