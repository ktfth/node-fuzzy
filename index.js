'use strict';

const assert = require('assert');

const fuzzy = this;

function matchHandler(pattern, chunk, options={}) {
  let patternIdx = 0;
  let out = [];
  let len = chunk.length;
  let totalScore = 0;
  let currScore = 0;
  let pre = options.pre || '';
  let pos = options.pos || '';
  let compareString = options.caseSensitive && chunk || chunk.toLowerCase();
  let ch;

  pattern = options.caseSensitive && pattern || pattern.toLowerCase();

  for (let i = 0; i < len; i += 1) {
    ch = chunk[i];
    if (compareString[i] === pattern[patternIdx]) {
      ch = pre + ch + pos;
      patternIdx += 1;
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }

    totalScore += currScore;
    out[out.length] = ch;
  }

  if (patternIdx === pattern.length) {
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return { rendered: out.join(''), score: totalScore };
  }

  return null;
}
fuzzy.match = matchHandler;

function testHandler(pattern, chunk, options={}) {
  return fuzzy.match(pattern, chunk, options) !== null;
}
fuzzy.test = testHandler;
assert.ok(fuzzy.test('apple', 'pineapple'));

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
