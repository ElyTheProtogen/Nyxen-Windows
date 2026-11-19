'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyRelink, validId } = require('../src/missing-file-utils');

const oldId = '111111111111';
const newId = '222222222222';

function state() {
  return {
    tracks: [{ id: oldId, path: 'C:/old/song.mp3', title: 'Song', artist: 'Artist', fav: true }],
    playlists: [{ id: 'p1', ids: [oldId, '333333333333'] }],
    savedQueue: [oldId, oldId],
    last: { id: oldId, pos: 42 },
    lyrics: { [oldId]: '[00:01]lyrics' }
  };
}

test('relink updates the track path and all persistent track references', () => {
  const saved = state();
  const track = applyRelink(saved, oldId, newId, 'D:/Music/song.mp3');

  assert.equal(track, saved.tracks[0]);
  assert.equal(track.id, newId);
  assert.equal(track.path, 'D:/Music/song.mp3');
  assert.deepEqual(saved.playlists[0].ids, [newId, '333333333333']);
  assert.deepEqual(saved.savedQueue, [newId, newId]);
  assert.deepEqual(saved.last, { id: newId, pos: 42 });
  assert.deepEqual(saved.lyrics, { [newId]: '[00:01]lyrics' });
  assert.equal(track.title, 'Song');
  assert.equal(track.fav, true);
});

test('relink refuses to collide with another library track without mutating state', () => {
  const saved = state();
  saved.tracks.push({ id: newId, path: 'D:/Music/other.mp3' });
  const before = structuredClone(saved);

  assert.equal(applyRelink(saved, oldId, newId, 'D:/Music/song.mp3'), null);
  assert.deepEqual(saved, before);
});

test('relink preserves both lyric entries if the destination ID already has lyrics', () => {
  const saved = state();
  saved.lyrics[newId] = '[00:02]existing';
  applyRelink(saved, oldId, newId, 'D:/Music/song.mp3');

  assert.equal(saved.lyrics[oldId], '[00:01]lyrics');
  assert.equal(saved.lyrics[newId], '[00:02]existing');
});

test('relink rejects invalid IDs and empty paths', () => {
  const saved = state();
  const before = structuredClone(saved);

  assert.equal(validId(oldId), true);
  assert.equal(validId('not-an-id'), false);
  assert.equal(applyRelink(saved, 'bad', newId, 'D:/Music/song.mp3'), null);
  assert.equal(applyRelink(saved, oldId, 'bad', 'D:/Music/song.mp3'), null);
  assert.equal(applyRelink(saved, oldId, newId, '  '), null);
  assert.deepEqual(saved, before);
});
