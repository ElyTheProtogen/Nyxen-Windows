'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { hashFile, groupCandidatesBySize, groupHashMatches } = require('../src/duplicate-utils');

test('hashFile produces the same SHA-256 for byte-identical files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nyxen-duplicate-test-'));
  try {
    const first = path.join(dir, 'first.mp3');
    const second = path.join(dir, 'copy.flac');
    fs.writeFileSync(first, Buffer.from('same audio bytes'));
    fs.writeFileSync(second, Buffer.from('same audio bytes'));
    assert.equal(await hashFile(first), await hashFile(second));
    assert.match(await hashFile(first), /^[a-f0-9]{64}$/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('size prefilter only returns groups with more than one candidate', () => {
  const groups = groupCandidatesBySize([
    { id: 'a', path: 'a.mp3', size: 10 },
    { id: 'b', path: 'b.flac', size: 10 },
    { id: 'c', path: 'c.ogg', size: 11 },
    { id: 'invalid', path: 'bad.wav', size: -1 }
  ]);
  assert.deepEqual(groups.map((group) => group.map((item) => item.id)), [['a', 'b']]);
});

test('empty files remain valid same-size candidates', () => {
  const groups = groupCandidatesBySize([
    { id: 'a', path: 'a.mp3', size: 0 },
    { id: 'b', path: 'b.mp3', size: 0 }
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].length, 2);
});

test('exact matches group by SHA-256, not metadata or size alone', () => {
  const a = 'a'.repeat(64);
  const b = 'b'.repeat(64);
  const groups = groupHashMatches([
    { id: 'one', size: 20, hash: a },
    { id: 'two', size: 20, hash: a },
    { id: 'three', size: 20, hash: b },
    { id: 'bad', size: 20, hash: 'not-a-hash' }
  ]);
  assert.deepEqual(groups, [{ hash: a, size: 20, ids: ['one', 'two'] }]);
});

test('single occurrences and malformed entries are not reported', () => {
  assert.deepEqual(groupHashMatches([
    { id: 'one', size: 1, hash: 'c'.repeat(64) },
    { id: '', size: 1, hash: 'c'.repeat(64) },
    { id: 'two', size: -1, hash: 'c'.repeat(64) }
  ]), []);
});
