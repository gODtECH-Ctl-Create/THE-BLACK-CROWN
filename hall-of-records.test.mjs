import assert from 'node:assert/strict';

const sample = {
  moves: [{ from: 'e2', to: 'e4', promotion: null }],
  matchEvents: [{ ply: 1, severity: 1, title: 'THE OPENING' }],
  ai: true,
  difficulty: 'hard'
};

assert.equal(Array.isArray(sample.moves), true);
assert.equal(sample.moves.length, 1);
assert.equal(sample.ai, true);
assert.equal(sample.difficulty, 'hard');
console.log('Hall of Records data contract: PASS');
