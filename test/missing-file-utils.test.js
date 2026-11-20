'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyRelink, applyRelinks, validId } = require('../src/missing-file-utils');

const oldId = '111111111111';
const secondOldId = '333333333333';
const newId = '222222222222';
const secondNewId = '444444444444';

function state() {
  return {
    tracks: [
      { id: oldId, path: 'C:/old/Artist/one.mp3', title: 'One', artist: 'Artist', fav: true },
      { id: secondOldId, path: 'C:/old/Artist/two.mp3', title: 'Two', artist: 'Artist', fav: false }
    ],
    playlists: [{ id: 'p1', ids: [oldId, secondOldId] }],
    savedQueue: [oldId, secondOldId, oldId],
    last: { id: oldId, pos: 42 },
    lyrics: { [oldId]: '[00:01]one', [secondOldId]: '[00:02]two' }
  };
}

test('relink updates the track path and all persistent track references', () => {
  const saved = state();
  const track = applyRelink(saved, oldId, newId, 'D:/Music/Artist/one.mp3');

  assert.equal(track, saved.tracks[0]);
  assert.equal(track.id, newId);
  assert.equal(track.path, 'D:/Music/Artist/one.mp3');
  assert.deepEqual(saved.playlists[0].ids, [newId, secondOldId]);
  assert.deepEqual(saved.savedQueue, [newId, secondOldId, newId]);
  assert.deepEqual(saved.last, { id: newId, pos: 42 });
  assert.deepEqual(saved.lyrics, { [newId]: '[00:01]one', [secondOldId]: '[00:02]two' });
  assert.equal(track.title, 'One');
  assert.equal(track.fav, true);
});

test('batch relink migrates several tracks and every persistent reference atomically', () => {
  const saved = state();
  const changed = applyRelinks(saved, [
    { oldId, newId, path: 'D:/Music/Artist/one.mp3', coverAvailable: true },
    { oldId: secondOldId, newId: secondNewId, path: 'D:/Music/Artist/two.mp3', coverAvailable: false }
  ]);

  assert.equal(changed.length, 2);
  assert.deepEqual(saved.tracks.map((item) => [item.id, item.path, item.cover]), [
    [newId, 'D:/Music/Artist/one.mp3', true],
    [secondNewId, 'D:/Music/Artist/two.mp3', false]
  ]);
  assert.deepEqual(saved.playlists[0].ids, [newId, secondNewId]);
  assert.deepEqual(saved.savedQueue, [newId, secondNewId, newId]);
  assert.deepEqual(saved.last, { id: newId, pos: 42 });
  assert.deepEqual(saved.lyrics, { [newId]: '[00:01]one', [secondNewId]: '[00:02]two' });
});

test('batch relink rejects a destination collision without partially mutating state', () => {
  const saved = state();
  saved.tracks.push({ id: '555555555555', path: 'D:/Music/existing.mp3' });
  const before = structuredClone(saved);

  assert.equal(applyRelinks(saved, [
    { oldId, newId, path: 'D:/Music/one.mp3' },
    { oldId: secondOldId, newId: '555555555555', path: 'D:/Music/existing.mp3' }
  ]), null);
  assert.deepEqual(saved, before);
});

test('batch relink rejects duplicate destinations and duplicate source IDs', () => {
  const saved = state();
  const before = structuredClone(saved);

  assert.equal(applyRelinks(saved, [
    { oldId, newId, path: 'D:/Music/one.mp3' },
    { oldId: secondOldId, newId, path: 'D:/Music/two.mp3' }
  ]), null);
  assert.equal(applyRelinks(saved, [
    { oldId, newId, path: 'D:/Music/one.mp3' },
    { oldId, newId: secondNewId, path: 'D:/Music/two.mp3' }
  ]), null);
  assert.deepEqual(saved, before);
});

test('relink preserves both lyric entries if the destination ID already has lyrics', () => {
  const saved = state();
  saved.lyrics[newId] = '[00:03]existing';
  applyRelink(saved, oldId, newId, 'D:/Music/one.mp3');

  assert.equal(saved.lyrics[oldId], '[00:01]one');
  assert.equal(saved.lyrics[newId], '[00:03]existing');
});

test('relink rejects invalid IDs and empty paths', () => {
  const saved = state();
  const before = structuredClone(saved);

  assert.equal(validId(oldId), true);
  assert.equal(validId('not-an-id'), false);
  assert.equal(applyRelink(saved, 'bad', newId, 'D:/Music/one.mp3'), null);
  assert.equal(applyRelink(saved, oldId, 'bad', 'D:/Music/one.mp3'), null);
  assert.equal(applyRelink(saved, oldId, newId, '  '), null);
  assert.deepEqual(saved, before);
});
