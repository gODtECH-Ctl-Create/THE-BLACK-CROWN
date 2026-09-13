const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const LEVELS = {
  beginner: { label: 'BEGINNER', description: 'Learning the battlefield', mode: 'random' },
  intermediate: { label: 'INTERMEDIATE', description: 'A watchful opponent', mode: 'heuristic' },
  hard: { label: 'HARD', description: 'Tactical pressure', mode: 'minimax', depth: 2 },
  crown: { label: 'CROWN', description: 'The full hunt', mode: 'minimax', depth: 3 },
};

function terminalScore(chess, ply = 0) {
  if (!chess.isCheckmate()) return null;
  return chess.turn() === 'b' ? -100000 + ply : 100000 - ply;
}

function evaluate(chess) {
  const terminal = terminalScore(chess);
  if (terminal !== null) return terminal;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  for (const rank of ['1', '2', '3', '4', '5', '6', '7', '8']) {
    for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const piece = chess.get(`${file}${rank}`);
      if (!piece) continue;
      const value = VALUES[piece.type];
      score += piece.color === 'b' ? value : -value;
      if (['d4', 'e4', 'd5', 'e5'].includes(`${file}${rank}`)) {
        score += piece.color === 'b' ? 14 : -14;
      }
    }
  }

  const mobility = chess.moves().length;
  score += chess.turn() === 'b' ? mobility * 1.5 : -mobility * 1.5;
  return score;
}

function moveScore(move) {
  let score = 0;
  if (move.captured) score += VALUES[move.captured] * 1.7;
  if (move.promotion) score += VALUES[move.promotion] * 1.5;
  if (move.san?.includes('#')) score += 50000;
  else if (move.san?.includes('+')) score += 130;
  if (move.flags?.includes('k') || move.flags?.includes('q')) score += 18;
  if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) score += 15;
  return score;
}

function orderedMoves(chess) {
  return chess.moves({ verbose: true }).sort((a, b) => moveScore(b) - moveScore(a));
}

function minimax(chess, depth, alpha, beta, maximizing) {
  const terminal = terminalScore(chess, depth);
  if (terminal !== null || depth === 0) return evaluate(chess);

  const moves = orderedMoves(chess);
  if (!moves.length) return evaluate(chess);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    chess.move(move);
    best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
    chess.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function randomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

function heuristicMove(moves) {
  const scored = moves.map((move) => ({ move, score: moveScore(move) + Math.random() * 55 }));
  scored.sort((a, b) => b.score - a.score);
  return randomMove(scored.slice(0, Math.min(5, scored.length)).map(({ move }) => move));
}

function minimaxMove(chess, moves, depth) {
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, false);
    chess.undo();
    const adjusted = score + moveScore(move) * 0.03;
    if (adjusted > bestScore) {
      bestScore = adjusted;
      bestMove = move;
    }
  }

  return bestMove;
}

export function chooseCrownMove(chess, difficulty = 'crown') {
  const level = LEVELS[difficulty] || LEVELS.crown;
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;
  if (level.mode === 'random') return randomMove(moves);
  if (level.mode === 'heuristic') return heuristicMove(moves);
  return minimaxMove(chess, moves, level.depth);
}

export function getDifficultyLevels() {
  return Object.fromEntries(Object.entries(LEVELS).map(([key, value]) => [key, { label: value.label, description: value.description }]));
}

export function replayFromSan(sans, ChessCtor) {
  const chess = new ChessCtor();
  for (const san of sans) chess.move(san);
  return chess;
}
