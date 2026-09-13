import assert from 'node:assert/strict';
import { Chess } from 'chess.js';

function findMove(chess, from, to) {
  const move = chess.moves({ square: from, verbose: true }).find((candidate) => candidate.to === to);
  assert.ok(move, `Expected legal move ${from}-${to}`);
  return move;
}

function testCastling() {
  for (const [fen, expectedSan, helper] of [
    ['r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'O-O', 'isKingsideCastle'],
    ['r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'O-O-O', 'isQueensideCastle'],
    ['r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1', 'O-O', 'isKingsideCastle'],
    ['r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1', 'O-O-O', 'isQueensideCastle'],
  ]) {
    const chess = new Chess(fen);
    const to = expectedSan === 'O-O' ? 'g1' : 'c1';
    const from = 'e1';
    const normalized = chess.turn() === 'b' ? { from: 'e8', to: to.replace('1', '8') } : { from, to };
    const move = findMove(chess, normalized.from, normalized.to);
    assert.equal(move.san, expectedSan);
    assert.equal(move[helper](), true);
  }
}

function testEnPassant() {
  const chess = new Chess('8/8/8/3pP3/8/8/8/4K2k w - d6 0 1');
  const move = findMove(chess, 'e5', 'd6');
  assert.equal(move.san, 'exd6');
  assert.equal(move.isEnPassant(), true);
  chess.move(move);
  assert.equal(chess.get('d5'), undefined);
  assert.equal(chess.get('d6')?.type, 'p');
}

function testPromotionChoices() {
  for (const promotion of ['q', 'r', 'b', 'n']) {
    const chess = new Chess('7k/P7/8/8/8/8/8/K7 w - - 0 1');
    const move = { from: 'a7', to: 'a8', promotion };
    const result = chess.move(move);
    assert.equal(result.isPromotion(), true);
    assert.equal(result.promotion, promotion);
    assert.equal(chess.get('a8')?.type, promotion);
  }
}

function testIllegalSpecialMovesRemainIllegal() {
  const castleThroughCheck = new Chess('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');
  assert.equal(castleThroughCheck.moves().includes('O-O'), false);

  const delayedEnPassant = new Chess('8/8/8/3pP3/8/8/8/4K2k w - - 0 1');
  assert.equal(delayedEnPassant.moves({ square: 'e5' }).includes('exd6'), false);
}

testCastling();
testEnPassant();
testPromotionChoices();
testIllegalSpecialMovesRemainIllegal();

console.log('Special move audit passed: castling, en passant, promotion, underpromotion, and illegal-edge safeguards.');
