'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { moveItem } = require('../src/queue-utils');

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
