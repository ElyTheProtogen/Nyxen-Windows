'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMetadataText, findNearDuplicateGroups } = require('../src/near-duplicate-utils');

test('normalizes Unicode accents, punctuation, case and filename extensions', () => {
  assert.equal(normalizeMetadataText('Beyoncé — Déjà Vu.MP3'), 'beyonce deja vu');
});

test('groups matching title and artist when durations are close', () => {
  const groups = findNearDuplicateGroups([
    { id: 'a', title: 'Déjà Vu', artist: 'Beyoncé', duration: 210 },
    { id: 'b', title: 'deja-vu', artist: 'BEYONCE', duration: 212 },
    { id: 'c', title: 'Déjà Vu', artist: 'Another artist', duration: 211 }
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].ids, ['a', 'b']);
  assert.equal(groups[0].durationSpread, 2);
});

test('does not group tracks whose durations exceed the tolerance', () => {
  assert.deepEqual(findNearDuplicateGroups([
    { id: 'a', title: 'Song', artist: 'Artist', duration: 200 },
    { id: 'b', title: 'Song', artist: 'Artist', duration: 210 }
  ]), []);
});

test('ignores missing, zero and invalid durations or empty metadata', () => {
  assert.deepEqual(findNearDuplicateGroups([
    { id: 'a', title: 'Song', artist: 'Artist', duration: 0 },
    { id: 'b', title: 'Song', artist: 'Artist', duration: NaN },
    { id: 'c', title: '', artist: 'Artist', duration: 120 },
    { id: 'd', title: 'Song', artist: '', duration: 120 }
  ]), []);
});

test('clusters against the first duration instead of chaining distant versions', () => {
  const groups = findNearDuplicateGroups([
    { id: 'a', title: 'Song', artist: 'Artist', duration: 300 },
    { id: 'b', title: 'Song', artist: 'Artist', duration: 302 },
    { id: 'c', title: 'Song', artist: 'Artist', duration: 304.1 }
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].ids, ['a', 'b']);
});

test('does not report duplicate IDs twice inside a candidate group', () => {
  const groups = findNearDuplicateGroups([
    { id: 'same', title: 'Song', artist: 'Artist', duration: 100 },
    { id: 'same', title: 'Song', artist: 'Artist', duration: 101 },
    { id: 'other', title: 'Song', artist: 'Artist', duration: 102 }
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].ids, ['same', 'other']);
});
