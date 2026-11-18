'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { applyBulkMetadata } = require('../src/library-utils');

test('applies genre and album artist only to selected tracks', () => {
  const tracks = [
    { id: 'a', genre: 'Rock', albumArtist: 'One' },
    { id: 'b', genre: 'Pop', albumArtist: 'Two' },
    { id: 'c', genre: 'Jazz', albumArtist: 'Three' }
  ];
  const changed = applyBulkMetadata(tracks, ['a', 'c'], { genre: ' Ambient ', albumArtist: ' Various Artists ' });
  assert.equal(changed, 2);
  assert.deepEqual(tracks, [
    { id: 'a', genre: 'Ambient', albumArtist: 'Various Artists' },
    { id: 'b', genre: 'Pop', albumArtist: 'Two' },
    { id: 'c', genre: 'Ambient', albumArtist: 'Various Artists' }
  ]);
});

test('blank fields leave existing metadata unchanged', () => {
  const tracks = [{ id: 'a', genre: 'Rock', albumArtist: 'One' }];
  assert.equal(applyBulkMetadata(tracks, ['a'], { genre: ' ', albumArtist: '' }), 0);
  assert.deepEqual(tracks, [{ id: 'a', genre: 'Rock', albumArtist: 'One' }]);
});

test('ignores unselected and unknown IDs and reports only actual changes', () => {
  const tracks = [{ id: 'a', genre: 'Rock' }, { id: 'b', genre: 'Jazz' }];
  assert.equal(applyBulkMetadata(tracks, ['b', 'missing'], { genre: 'Jazz' }), 0);
  assert.equal(applyBulkMetadata(tracks, ['a', 'missing'], { genre: 'Metal' }), 1);
  assert.equal(tracks[0].genre, 'Metal');
  assert.equal(tracks[1].genre, 'Jazz');
});

test('trims and bounds bulk metadata values', () => {
  const tracks = [{ id: 'a', genre: '', albumArtist: '' }];
  applyBulkMetadata(tracks, ['a'], { genre: 'G'.repeat(90), albumArtist: 'A'.repeat(130) });
  assert.equal(tracks[0].genre.length, 80);
  assert.equal(tracks[0].albumArtist.length, 120);
});
