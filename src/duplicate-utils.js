'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

function groupCandidatesBySize(entries) {
  const groups = new Map();
  for (const item of Array.isArray(entries) ? entries : []) {
    if (!item || typeof item.id !== 'string' || !item.id ||
        typeof item.path !== 'string' || !item.path ||
        !Number.isSafeInteger(item.size) || item.size < 0) continue;
    const key = String(item.size);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

function groupHashMatches(entries) {
  const groups = new Map();
  for (const item of Array.isArray(entries) ? entries : []) {
    if (!item || typeof item.id !== 'string' || !item.id ||
        typeof item.hash !== 'string' || !/^[a-f0-9]{64}$/i.test(item.hash) ||
        !Number.isSafeInteger(item.size) || item.size < 0) continue;
    const hash = item.hash.toLowerCase();
    if (!groups.has(hash)) groups.set(hash, []);
    groups.get(hash).push(item);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([hash, group]) => ({
      hash,
      size: group[0].size,
      ids: group.map((item) => item.id)
    }))
    .sort((a, b) => b.size - a.size || a.hash.localeCompare(b.hash));
}

module.exports = { hashFile, groupCandidatesBySize, groupHashMatches };
