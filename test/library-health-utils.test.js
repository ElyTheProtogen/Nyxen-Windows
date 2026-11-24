'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize, filterMetadata } = require('../src/library-health-utils');

test('counts verified, missing, inaccessible and unverified tracks separately', () => {
  const tracks = [
    { id: 'a', title: 'One', artist: 'A', album: 'Album', genre: 'Rock' },
    { id: 'b', title: 'Two', artist: 'B', album: 'Album', genre: 'Rock' },
    { id: 'c', title: 'Three', artist: 'C', album: 'Album', genre: 'Rock' },
    { id: 'd', title: 'Four', artist: 'D', album: 'Album', genre: 'Rock' }
  ];
  assert.deepEqual(summarize(tracks, ['b', 'b', 'not-in-library'], { checked: 3, inaccessible: 1, unverified: 1 }), {
    total: 4, available: 1, missing: 1, inaccessible: 1, unverified: 1,
    metadataIncomplete: 0, metadataGaps: { title: 0, artist: 0, album: 0, genre: 0 }
  });
});

test('identifies empty and placeholder metadata without mutating tracks', () => {
  const tracks = [
    { id: 'a', title: 'Untitled', artist: 'Unknown Artist', album: '', genre: 'Rock' },
    { id: 'b', title: 'Song', artist: 'Artist', album: 'Album', genre: 'Unknown Genre' }
  ];
  const before = structuredClone(tracks);
  const result = summarize(tracks, [], { checked: 2 });
  assert.equal(result.metadataIncomplete, 2);
  assert.deepEqual(result.metadataGaps, { title: 1, artist: 1, album: 1, genre: 1 });
  assert.deepEqual(tracks, before);
});

test('handles invalid or stale scan counts safely', () => {
  const result = summarize([{ id: 'a' }], ['a'], { checked: 900, inaccessible: 50, unverified: 30 });
  assert.equal(result.available, 0);
  assert.equal(result.missing, 1);
  assert.equal(result.inaccessible, 0);
  assert.equal(result.unverified, 0);
});

test('metadata filters preserve order and do not mutate the library', () => {
  const tracks = [{ id: 'a', title: 'Song', artist: 'Unknown Artist', album: 'Album', genre: 'Rock' }, { id: 'b', title: 'Song', artist: 'Artist', album: 'Album', genre: '' }, { id: 'c', title: 'Song', artist: 'Artist', album: 'Album', genre: 'Rock' }];
  const before = structuredClone(tracks);
  assert.deepEqual(filterMetadata(tracks, 'any').map(t => t.id), ['a', 'b']);
  assert.deepEqual(filterMetadata(tracks, 'artist').map(t => t.id), ['a']);
  assert.deepEqual(filterMetadata(tracks, 'genre').map(t => t.id), ['b']);
  assert.deepEqual(filterMetadata(tracks, 'all'), tracks);
  assert.deepEqual(filterMetadata(tracks, 'invalid'), []);
  assert.deepEqual(tracks, before);
});
