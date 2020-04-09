'use strict';

const assert = require('assert');

const fuzzy = this;

function finderHandler(term, chunk, options='gi') {
  let out = {
    score: 0,
    matches: [],
    occurrence: term,
  };
  out.score = Math.max(chunk.length / term.length, 100) - Math.min(chunk.length / term.length, 100);
  let rTerm = new RegExp(term, options);
  chunk.match(rTerm).forEach(v => out.matches.push(v));
  return out;
}
fuzzy.finder = finderHandler;

assert.deepEqual(fuzzy.finder('term', 'any term'), {
  score: 100 - (8 / 4),
  matches: [
    'term'
  ],
  occurrence: 'term'
});

assert.deepEqual(fuzzy.finder('term', 'any TERM'), {
  score: 100 - (8 / 4),
  matches: [
    'TERM',
  ],
  occurrence: 'term'
});
