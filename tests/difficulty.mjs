import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { chooseCrownMove, getDifficultyLevels } from '../crown-difficulty.js';

const expected = ['beginner', 'intermediate', 'hard', 'crown'];
const levels = getDifficultyLevels();
assert.deepEqual(Object.keys(levels), expected);

const position = new Chess();
const before = position.fen();
for (const level of expected) {
  const move = chooseCrownMove(position, level);
  assert.ok(move, `${level} should choose a move from the starting position`);
  assert.ok(position.moves({ verbose: true }).some((candidate) => candidate.from === move.from && candidate.to === move.to), `${level} must return a legal move`);
  assert.equal(position.fen(), before, `${level} must not mutate the root position`);
}

const tactical = new Chess('6k1/5ppp/8/8/8/4Q3/5PPP/6K1 b - - 0 1');
const tacticalBefore = tactical.fen();
const hardMove = chooseCrownMove(tactical, 'hard');
const crownMove = chooseCrownMove(tactical, 'crown');
assert.ok(hardMove && crownMove, 'Hard and Crown should return moves in a tactical position');
assert.equal(tactical.fen(), tacticalBefore, 'search must preserve the tactical root position');

console.log('Crown difficulty tests passed: Beginner, Intermediate, Hard, and Crown return legal, non-mutating moves.');
