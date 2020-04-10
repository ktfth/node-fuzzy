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

  p = opts.caseSensitive && p || p.toLowerCase();

  c.split('').forEach((v, i) => {
    if (cs[i] === p[pIdx]) {
      v = pre + v + pos;
      pIdx += 1;
      score.curr += 1 + score.curr;
    } else {
      score.curr = 0;
    }

    score.total += score.curr;
    o[o.length] = v;
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

function searchHandler(pattern, arr, options={}) {
  return arr
           .map(v => fuzzy.match(pattern, v, options))
           .filter(v => v !== null)
           .sort((a, b) => b.score - a.score);
}
fuzzy.search = searchHandler;

function finderHandler(term, chunk, options='gi') {
  let out = {
    presence: 0,
    matches: [],
    occurrence: term,
  };
  out.presence = Math.max(chunk.length / term.length, 100) -
                 Math.min(chunk.length / term.length, 100);
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
