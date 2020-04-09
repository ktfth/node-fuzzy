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
  let matches = chunk.match(rTerm);
  if (matches) {
    matches.forEach(v => out.matches.push(v));
  } else if (!matches) {
    let c = chunk.split(' ');

    c.forEach(v => {
      let t = term.split('');

      t.forEach(w => {
        if (v.indexOf(w) > -1 && out.matches.indexOf(v) === -1) {
          out.matches.push(v);
        }
      });
    });
  }
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

assert.deepEqual(fuzzy.finder('term', 'term any TERM'), {
  score: 100 - (13 / 4),
  matches: [
    'term',
    'TERM'
  ],
  occurrence: 'term'
});

assert.deepEqual(fuzzy.finder('acd', 'abca fghij').matches, [
  'abca'
]);
