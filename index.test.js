'use strict';

const fuzzy = require('./');
const assert = require('assert');

describe('Ratio', () => {
  it('shoudl have a ratio aspect in relation of the content', () => {
    assert.equal(fuzzy.ratio('apple', 'pineapple'), 57);
  });
});

describe('Match', () => {
  it('should have a mounted properties', () => {
    assert.deepEqual(fuzzy.match('apple', 'pineapple'), {
      rendered: 'pineapple', score: 57
    });
  });

  it('should have tags arround, on context pressure', () => {
    assert.deepEqual(fuzzy.match('apple', 'pineapple', {
      pre: '<b>', pos: '</b>'
    }), {
      rendered: 'pine<b>a</b><b>p</b><b>p</b><b>l</b><b>e</b>', score: 57
    });
  });
});

describe('Test', () => {
  it('should have a specified pattern', () => {
    assert.ok(fuzzy.test('apple', 'pineapple'));
  });
});

describe('Search', () => {
  it('should have a multi behavior', () => {
    assert.deepEqual(fuzzy.search('apple', ['pineapple', 'orange', 'apple']), [
      fuzzy.match('apple', 'apple'),
      fuzzy.match('apple', 'pineapple'),
    ]);
  })
});

describe('Finder', () => {
  it('should have term present on the content', () => {
    assert.deepEqual(fuzzy.finder('term', 'any term'), {
      presence: 100 - (8 / 4),
      matches: [
        'term'
      ],
      occurrence: 'term'
    });
  });

  it('should have term case insensitive', () => {
    assert.deepEqual(fuzzy.finder('term', 'any TERM'), {
      presence: 100 - (8 / 4),
      matches: [
        'TERM',
      ],
      occurrence: 'term'
    });
  });

  it('should have occurrences of term on content', () => {
    assert.deepEqual(fuzzy.finder('term', 'term any TERM'), {
      presence: 100 - (13 / 4),
      matches: [
        'term',
        'TERM'
      ],
      occurrence: 'term'
    });
  });

  it('should have length more than zero', () => {
    assert.ok(fuzzy.finder('ac', 'abca fghij').matches.length > 0);
  });

  it('should have pattern instead of term', () => {
    assert.deepEqual(fuzzy.finder('ac', 'abca fghij').matches, [
      { rendered: 'abca fghij', score: 2 }
    ]);
  });
});
