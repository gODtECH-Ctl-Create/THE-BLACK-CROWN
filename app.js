import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const game = new Chess();
const board = document.querySelector('#board');
const fileCoords = document.querySelector('#fileCoords');
const rankCoords = document.querySelector('#rankCoords');
const gameStatus = document.querySelector('#gameStatus');
const moveCounter = document.querySelector('#moveCounter');
const moveList = document.querySelector('#moveList');
const moveTotal = document.querySelector('#moveTotal');
const fenLabel = document.querySelector('#fenLabel');
const checkCount = document.querySelector('#checkCount');
const captureCount = document.querySelector('#captureCount');
const halfClock = document.querySelector('#halfClock');
const whiteCaptures = document.querySelector('#whiteCaptures');
const blackCaptures = document.querySelector('#blackCaptures');
const whiteCaptureCount = document.querySelector('#whiteCaptureCount');
const blackCaptureCount = document.querySelector('#blackCaptureCount');
const whiteCard = document.querySelector('#whiteCard');
const blackCard = document.querySelector('#blackCard');
const whiteStatus = document.querySelector('#whiteStatus');
const blackStatus = document.querySelector('#blackStatus');
const aiToggle = document.querySelector('#aiToggle');
const checkAura = document.querySelector('#checkAura');
const resultOverlay = document.querySelector('#resultOverlay');
const resultTitle = document.querySelector('#resultTitle');
const resultCopy = document.querySelector('#resultCopy');
const taunt = document.querySelector('#taunt');

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];
const pieceGlyph = {
  w: { k:'♔', q:'♕', r:'♖', b:'♗', n:'♘', p:'♙' },
  b: { k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' },
};

let orientation = 'white';
let selectedSquare = null;
let lastMove = null;
let checkEvents = 0;
let captureEvents = 0;
let movingSquare = null;
let aiThinking = false;

const taunts = [
  '“Do not confuse silence with mercy.”',
  '“The board has no sympathy for hesitation.”',
  '“A crown is only safe until the next move.”',
  '“Beautiful positions die quietly.”',
  '“There is always one square you forgot.”',
];

function makeDust() {
  const dust = document.querySelector('#dust');
  for (let i = 0; i < 34; i += 1) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${9 + Math.random() * 16}s`;
    p.style.animationDelay = `${-Math.random() * 18}s`;
    p.style.opacity = `${0.15 + Math.random() * 0.45}`;
    dust.appendChild(p);
  }
}

function syncCoordinates() {
  fileCoords.replaceChildren(...(orientation === 'white' ? files : [...files].reverse()).map((x) => {
    const s = document.createElement('span'); s.textContent = x; return s;
  }));
  rankCoords.replaceChildren(...(orientation === 'white' ? ranks : [...ranks].reverse()).map((x) => {
    const s = document.createElement('span'); s.textContent = x; return s;
  }));
}

function visibleSquares() {
  const out = [];
  const fileOrder = orientation === 'white' ? files : [...files].reverse();
  const rankOrder = orientation === 'white' ? ranks : [...ranks].reverse();
  for (const rank of rankOrder) for (const file of fileOrder) out.push(`${file}${rank}`);
  return out;
}

function render() {
  syncCoordinates();
  const legalMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : [];
  const legalTargets = new Map(legalMoves.map((move) => [move.to, move]));
  const checkedKing = game.isCheck() ? findKing(game.turn()) : null;
  const squares = visibleSquares();
  board.replaceChildren();

  squares.forEach((squareName, index) => {
    const fileIndex = files.indexOf(squareName[0]);
    const rankNumber = Number(squareName[1]);
    const square = document.createElement('button');
    const piece = game.get(squareName);
    const isLight = (fileIndex + rankNumber) % 2 === 1;
    const legal = legalTargets.get(squareName);
    square.type = 'button';
    square.className = `square ${isLight ? 'light' : 'dark'}`;
    square.setAttribute('role', 'gridcell');
    square.setAttribute('aria-label', `${squareName}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`);

    if (squareName === selectedSquare) square.classList.add('selected');
    if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) square.classList.add('last-move');
    if (checkedKing === squareName) square.classList.add('in-check');
    if (legal) square.classList.add('legal');
    if (legal?.captured || (legal?.flags && legal.flags.includes('e'))) square.classList.add('capture');

    if (piece) {
      const glyph = document.createElement('span');
      glyph.className = `piece ${piece.color === 'w' ? 'white' : 'black'}${movingSquare === squareName ? ' moving' : ''}`;
      glyph.textContent = pieceGlyph[piece.color][piece.type];
      glyph.setAttribute('aria-hidden', 'true');
      square.appendChild(glyph);
    }

    square.addEventListener('click', () => handleSquare(squareName));
    board.appendChild(square);
  });

  checkAura.classList.toggle('visible', Boolean(checkedKing));
  updatePanels();
}

function findKing(color) {
  for (const squareName of files.flatMap((f) => ranks.map((r) => `${f}${r}`))) {
    const p = game.get(squareName);
    if (p?.color === color && p.type === 'k') return squareName;
  }
  return null;
}

function handleSquare(squareName) {
  if (aiThinking || game.isGameOver()) return;
  if (aiToggle.checked && game.turn() === 'b') return;

  const piece = game.get(squareName);
  const isOwnPiece = piece?.color === game.turn();

  if (!selectedSquare) {
    if (isOwnPiece) {
      selectedSquare = squareName;
      taunt.textContent = taunts[Math.floor(Math.random() * taunts.length)];
      render();
    }
    return;
  }

  if (squareName === selectedSquare) {
    selectedSquare = null;
    render();
    return;
  }

  const legal = game.moves({ square: selectedSquare, verbose: true }).find((m) => m.to === squareName);
  if (legal) {
    playMove(selectedSquare, squareName);
    return;
  }

  if (isOwnPiece) {
    selectedSquare = squareName;
    render();
  }
}

function playMove(from, to, promotion = 'q') {
  try {
    const before = game.fen();
    const move = game.move({ from, to, promotion });
    if (!move) return;
    movingSquare = to;
    lastMove = { from, to };
    selectedSquare = null;
    if (move.captured) captureEvents += 1;
    if (game.isCheck()) checkEvents += 1;
    playSound(move.captured ? 'capture' : 'move');
    localStorage.setItem('black-crown-fen', game.fen());
    localStorage.setItem('black-crown-history', JSON.stringify(game.history()));
    render();
    setTimeout(() => { movingSquare = null; render(); }, 460);
    if (game.isGameOver()) {
      setTimeout(showResult, 420);
      return;
    }
    if (aiToggle.checked && game.turn() === 'b') {
      aiThinking = true;
      gameStatus.textContent = 'THE CROWN IS THINKING…';
      blackStatus.textContent = 'CALCULATING';
      setTimeout(() => {
        makeAiMove();
        aiThinking = false;
      }, 650);
    }
  } catch (error) {
    console.warn('Move rejected', error, before);
  }
}

function makeAiMove() {
  if (game.isGameOver() || game.turn() !== 'b') return;
  const moves = game.moves({ verbose: true });
  if (!moves.length) return;

  const scored = moves.map((move) => {
    let score = (move.captured ? pieceValue(move.captured) * 10 : 0) + (move.promotion ? 80 : 0);
    const givesCheck = move.san?.includes('+') || move.san?.includes('#');
    if (givesCheck) score += move.san.includes('#') ? 10000 : 80;
    score += centerBonus(move.to);
    score += Math.random() * 1.25;
    return { move, score };
  }).sort((a, b) => b.score - a.score);

  const choice = scored[Math.floor(Math.random() * Math.min(3, scored.length))].move;
  playMove(choice.from, choice.to, choice.promotion || 'q');
}

function centerBonus(square) {
  return ['d4','e4','d5','e5'].includes(square) ? 6 : 0;
}

function pieceValue(type) {
  return ({ p:1, n:3, b:3, r:5, q:9, k:100 })[type] || 0;
}

function updatePanels() {
  const turn = game.turn();
  gameStatus.textContent = game.isCheckmate() ? 'CHECKMATE' : game.isDraw() ? 'DRAW' : turn === 'w' ? 'WHITE TO MOVE' : 'BLACK TO MOVE';
  moveCounter.textContent = `MOVE ${String(Math.ceil(game.history().length / 2)).padStart(2, '0')}`;
  moveTotal.textContent = `${game.history().length} PLY`;
  halfClock.textContent = String(game.getComment ? 0 : game.fen().split(' ')[4]);
  fenLabel.textContent = game.fen().split(' ')[0];
  checkCount.textContent = String(checkEvents);
  captureCount.textContent = String(captureEvents);

  whiteCard.classList.toggle('active-player', turn === 'w' && !game.isGameOver());
  blackCard.classList.toggle('active-player', turn === 'b' && !game.isGameOver());
  whiteStatus.textContent = turn === 'w' && !game.isGameOver() ? 'YOUR MOVE' : game.isCheckmate() && turn === 'b' ? 'VICTOR' : 'WAITING';
  blackStatus.textContent = game.isCheckmate() && turn === 'w' ? 'VICTOR' : turn === 'b' && !game.isGameOver() ? (aiToggle.checked ? 'CROWN AI' : 'YOUR MOVE') : 'WAITING';

  const verbose = game.history({ verbose: true });
  const whiteTaken = verbose.filter((m) => m.color === 'w' && m.captured).map((m) => pieceGlyph.b[m.captured]);
  const blackTaken = verbose.filter((m) => m.color === 'b' && m.captured).map((m) => pieceGlyph.w[m.captured]);
  whiteCaptureCount.textContent = String(whiteTaken.length);
  blackCaptureCount.textContent = String(blackTaken.length);
  whiteCaptures.textContent = whiteTaken.length ? whiteTaken.join(' ') : '—';
  blackCaptures.textContent = blackTaken.length ? blackTaken.join(' ') : '—';

  moveList.replaceChildren();
  for (let i = 0; i < verbose.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'move-row';
    row.innerHTML = `<span class="move-number">${String(i / 2 + 1).padStart(2, '0')}</span><span class="move-san ${i === verbose.length - 1 ? 'latest' : ''}">${verbose[i]?.san || ''}</span><span class="move-san ${i + 1 === verbose.length - 1 ? 'latest' : ''}">${verbose[i + 1]?.san || ''}</span>`;
    moveList.appendChild(row);
  }
  moveList.scrollTop = moveList.scrollHeight;
}

function undoMove() {
  if (aiThinking || game.history().length === 0) return;
  game.undo();
  if (aiToggle.checked && game.turn() === 'b' && game.history().length > 0) game.undo();
  selectedSquare = null;
  lastMove = null;
  checkEvents = 0;
  captureEvents = game.history({ verbose: true }).filter((m) => m.captured).length;
  localStorage.setItem('black-crown-fen', game.fen());
  localStorage.setItem('black-crown-history', JSON.stringify(game.history()));
  resultOverlay.hidden = true;
  render();
}

function resetGame() {
  game.reset();
  selectedSquare = null;
  lastMove = null;
  movingSquare = null;
  checkEvents = 0;
  captureEvents = 0;
  aiThinking = false;
  resultOverlay.hidden = true;
  localStorage.removeItem('black-crown-fen');
  localStorage.removeItem('black-crown-history');
  playSound('reset');
  render();
}

function flipBoard() {
  orientation = orientation === 'white' ? 'black' : 'white';
  selectedSquare = null;
  render();
}

function showResult() {
  const checkmate = game.isCheckmate();
  resultTitle.textContent = checkmate ? 'CHECKMATE' : 'THE BOARD IS DRAWN';
  const winner = checkmate ? (game.turn() === 'w' ? 'BLACK' : 'WHITE') : null;
  resultCopy.textContent = checkmate ? `${winner} takes the crown. The archive records everything.` : 'Neither side earned the final word this time.';
  resultOverlay.hidden = false;
  playSound(checkmate ? 'mate' : 'reset');
}

function playSound(kind) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = playSound.ctx || (playSound.ctx = new AudioCtx());
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const settings = {
    move: [180, .055, 'sine'],
    capture: [95, .09, 'triangle'],
    mate: [62, .35, 'sawtooth'],
    reset: [280, .07, 'sine'],
  }[kind] || [160, .05, 'sine'];
  osc.type = settings[2];
  osc.frequency.setValueAtTime(settings[0], ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(38, settings[0] * .55), ctx.currentTime + settings[1]);
  gain.gain.setValueAtTime(.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.06, ctx.currentTime + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + settings[1]);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + settings[1] + .02);
}

function restoreSavedGame() {
  const saved = localStorage.getItem('black-crown-fen');
  if (!saved) return;
  try {
    game.load(saved);
    captureEvents = game.history({ verbose: true }).filter((m) => m.captured).length;
  } catch {
    localStorage.removeItem('black-crown-fen');
  }
}

new MutationObserver(() => {
  document.title = game.isCheckmate() ? 'CHECKMATE | THE BLACK CROWN' : `THE BLACK CROWN | ${game.turn() === 'w' ? 'White' : 'Black'} to move`;
}).observe(document.body, { subtree: true, childList: true });

document.querySelector('#newGameBtn').addEventListener('click', resetGame);
document.querySelector('#resultNewGame').addEventListener('click', resetGame);
document.querySelector('#undoBtn').addEventListener('click', undoMove);
document.querySelector('#flipBtn').addEventListener('click', flipBoard);
aiToggle.addEventListener('change', () => { selectedSquare = null; render(); });

makeDust();
restoreSavedGame();
render();
