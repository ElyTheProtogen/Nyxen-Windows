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

  return { moveItem };
});
