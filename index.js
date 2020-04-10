'use strict';

const assert = require('assert');

const fuzzy = this;

function matchHandler(p, c, opts={}) {
  let out = { rendered: '', score: 0 };
  let pIdx = 0;
  let o = [];
  let len = c.length;
  let score = { total: 0, curr: 0 };
  let pre = opts.pre || '';
  let pos = opts.pos || '';
  let cs = opts.caseSensitive && c || c.toLowerCase();
  let ch;

  p = opts.caseSensitive && p || p.toLowerCase();

  c.split('').forEach((v, i) => {
    ch = c[i];
    if (cs[i] === p[pIdx]) {
      ch = pre + ch + pos;
      pIdx += 1;
      score.curr += 1 + score.curr;
    } else {
      score.curr = 0;
    }

    score.total += score.curr;
    o[o.length] = ch;
  });

  if (pIdx === p.length) {
    score.total = (cs === p) ? Infinity : score.total;
    out.rendered = o.join('');
    out.score = score.total;
    return out;
  }

  return null;
}
fuzzy.match = matchHandler;

function testHandler(pattern, chunk, options={}) {
  return fuzzy.match(pattern, chunk, options) !== null;
}
fuzzy.test = testHandler;
assert.ok(fuzzy.test('apple', 'pineapple'));

function searchHandler(pattern, arr, options={}) {
  return arr
           .map(v => fuzzy.match(pattern, v, options))
           .filter(v => v !== null)
           .sort((a, b) => b.score - a.score);
}
fuzzy.search = searchHandler;
assert.deepEqual(fuzzy.search('apple', ['pineapple', 'orange', 'apple']), [
  fuzzy.match('apple', 'apple'),
  fuzzy.match('apple', 'pineapple'),
]);

function finderHandler(term, chunk, options='gi') {
  let out = {
    presence: 0,
    matches: [],
    occurrence: term,
  };
  out.presence = Math.max(chunk.length / term.length, 100) - Math.min(chunk.length / term.length, 100);
  let rTerm = new RegExp(term, options);
  let matches = chunk.match(rTerm);
  if (matches) {
    matches.forEach(v => out.matches.push(v));
  } else if (!matches) {
    out.matches.push(fuzzy.match(term, chunk));
  }
  return out;
}
fuzzy.finder = finderHandler;

assert.deepEqual(fuzzy.finder('term', 'any term'), {
  presence: 100 - (8 / 4),
  matches: [
    'term'
  ],
  occurrence: 'term'
});

assert.deepEqual(fuzzy.finder('term', 'any TERM'), {
  presence: 100 - (8 / 4),
  matches: [
    'TERM',
  ],
  occurrence: 'term'
});

assert.deepEqual(fuzzy.finder('term', 'term any TERM'), {
  presence: 100 - (13 / 4),
  matches: [
    'term',
    'TERM'
  ],
  occurrence: 'term'
});

assert.ok(fuzzy.finder('ac', 'abca fghij').matches.length > 0);
assert.deepEqual(fuzzy.finder('ac', 'abca fghij').matches, [
  { rendered: 'abca fghij', score: 2 }
]);
