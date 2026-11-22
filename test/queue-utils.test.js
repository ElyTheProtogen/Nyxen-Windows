'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { moveItem, parseTrackQuery, matchesTrack, filterTracks, filterEntries } = require('../src/queue-utils');

test('moves an item down while keeping the current track selected', () => {
  const result = moveItem(['a', 'b', 'c', 'd'], 1, 0, 3);
  assert.deepEqual(result, { ids: ['b', 'c', 'd', 'a'], index: 0, moved: true });
});

test('moves an item up and shifts the current index', () => {
  const result = moveItem(['a', 'b', 'c', 'd'], 1, 3, 0);
  assert.deepEqual(result, { ids: ['d', 'a', 'b', 'c'], index: 2, moved: true });
});

test('keeps the moved current track selected', () => {
  const result = moveItem(['a', 'b', 'c'], 1, 1, 2);
  assert.deepEqual(result, { ids: ['a', 'c', 'b'], index: 2, moved: true });
});

test('preserves the correct current occurrence when queue IDs repeat', () => {
  const result = moveItem(['a', 'b', 'a', 'c'], 2, 0, 3);
  assert.deepEqual(result, { ids: ['b', 'a', 'c', 'a'], index: 1, moved: true });
});

test('ignores invalid and no-op moves without mutating the queue', () => {
  const queue = ['a', 'b'];
  assert.deepEqual(moveItem(queue, 1, 1, 2), { ids: ['a', 'b'], index: 1, moved: false });
  assert.deepEqual(moveItem(queue, 1, 1, 1), { ids: ['a', 'b'], index: 1, moved: false });
  assert.deepEqual(queue, ['a', 'b']);
});

const tracks = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', albumArtist: 'M83', genre: 'Electronic', path: 'D:/Music/M83/Midnight City.flac' },
  { id: '2', title: 'Midnight', artist: 'Alone', album: 'Night Drive', albumArtist: 'Various Artists', genre: 'Ambient', path: 'D:/Music/Alone/Midnight.ogg' },
  { id: '3', title: 'Dreams', artist: 'Fleetwood Mac', album: 'Rumours', genre: 'Rock', path: 'D:/Music/Fleetwood Mac/Dreams.mp3' }
];

test('parses quoted phrases, field prefixes and negative terms', () => {
  assert.deepEqual(parseTrackQuery('artist:"Fleetwood Mac" -genre:pop'), [
    { negative: false, field: 'artist', value: 'fleetwood mac' },
    { negative: true, field: 'genre', value: 'pop' }
  ]);
});

test('matches all positive terms across track fields', () => {
  assert.equal(matchesTrack(tracks[0], 'midnight electronic'), true);
  assert.equal(matchesTrack(tracks[0], 'midnight acoustic'), false);
});

test('supports quoted exact phrases and field-specific searches', () => {
  assert.equal(matchesTrack(tracks[0], 'album:"Hurry Up, We\'re Dreaming"'), true);
  assert.equal(matchesTrack(tracks[0], 'artist:"We\'re Dreaming"'), false);
  assert.equal(matchesTrack(tracks[2], 'artist:"Fleetwood Mac"'), true);
});

test('supports negative terms and file/path aliases', () => {
  assert.equal(matchesTrack(tracks[0], 'genre:electronic -artist:m83'), false);
  assert.equal(matchesTrack(tracks[0], 'file:"Midnight City.flac"'), true);
  assert.equal(matchesTrack(tracks[0], 'path:music/m83'), true);
});

test('supports album-artist aliases and safely handles missing metadata', () => {
  assert.equal(matchesTrack(tracks[1], 'albumartist:"Various Artists"'), true);
  assert.equal(matchesTrack({ title: 'Untitled' }, 'artist:unknown'), false);
  assert.equal(matchesTrack({ title: 'Untitled' }, 'untitled'), true);
});

test('filtering preserves queue order and repeated track occurrences', () => {
  const queue = [tracks[0], tracks[1], tracks[0], tracks[2]];
  const filtered = filterTracks(queue, 'artist:m83');
  assert.deepEqual(filtered, [tracks[0], tracks[0]]);
  assert.deepEqual(queue, [tracks[0], tracks[1], tracks[0], tracks[2]]);
});

test('empty and whitespace-only searches return all tracks', () => {
  assert.deepEqual(filterTracks(tracks, ''), tracks);
  assert.deepEqual(filterTracks(tracks, '   '), tracks);
  assert.deepEqual(filterTracks(null, 'anything'), []);
});

test('unknown field prefixes remain searchable as ordinary text', () => {
  assert.equal(matchesTrack(tracks[0], 'composer:bach'), false);
  assert.equal(matchesTrack({ title: 'Composer:bach' }, 'composer:bach'), true);
});


test('filterEntries preserves original indexes for filtered playlist actions', () => {
  const entries = filterEntries(tracks, 'artist:alone');
  assert.deepEqual(entries.map((entry) => entry.index), [1]);
  assert.deepEqual(entries.map((entry) => entry.track), [tracks[1]]);
});

test('filterEntries keeps repeated occurrences distinct with their source indexes', () => {
  const queue = [tracks[0], tracks[1], tracks[0], tracks[2]];
  const entries = filterEntries(queue, 'artist:m83');
  assert.deepEqual(entries.map((entry) => entry.index), [0, 2]);
  assert.deepEqual(entries.map((entry) => entry.track.id), ['1', '1']);
});

test('filterEntries returns every source entry for an empty query', () => {
  assert.deepEqual(filterEntries(tracks, '').map((entry) => entry.index), [0, 1, 2]);
});

test('filterEntries safely handles non-array input', () => {
  assert.deepEqual(filterEntries(null, 'anything'), []);
});
