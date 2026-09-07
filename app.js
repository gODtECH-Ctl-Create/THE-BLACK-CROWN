import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';

const game = new Chess();

const $ = (selector) => document.querySelector(selector);
const board = $('#board');
const fileCoords = $('#fileCoords');
const rankCoords = $('#rankCoords');
const gameStatus = $('#gameStatus');
const moveCounter = $('#moveCounter');
const moveList = $('#moveList');
const moveTotal = $('#moveTotal');
const fenLabel = $('#fenLabel');
const checkCount = $('#checkCount');
const captureCount = $('#captureCount');
const halfClock = $('#halfClock');
const whiteCaptures = $('#whiteCaptures');
const blackCaptures = $('#blackCaptures');
const whiteCaptureCount = $('#whiteCaptureCount');
const blackCaptureCount = $('#blackCaptureCount');
const whiteCard = $('#whiteCard');
const blackCard = $('#blackCard');
const whiteStatus = $('#whiteStatus');
const blackStatus = $('#blackStatus');
const aiToggle = $('#aiToggle');
const checkAura = $('#checkAura');
const resultOverlay = $('#resultOverlay');
const resultTitle = $('#resultTitle');
const resultCopy = $('#resultCopy');
const taunt = $('#taunt');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
const pieceGlyph = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const taunts = [
  '“Do not confuse silence with mercy.”',
  '“The board has no sympathy for hesitation.”',
  '“A crown is only safe until the next move.”',
  '“Beautiful positions die quietly.”',
  '“There is always one square you forgot.”',
];

let orientation = 'white';
let selectedSquare = null;
let lastMove = null;
let movingSquare = null;
let aiThinking = false;
let checkEvents = 0;
let captureEvents = 0;

function buildDust() {
  const dust = $('#dust');
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 34; i += 1) {
    const particle = document.createElement('i');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${9 + Math.random() * 16}s`;
    particle.style.animationDelay = `${-Math.random() * 18}s`;
    particle.style.opacity = `${0.15 + Math.random() * 0.45}`;
    fragment.appendChild(particle);
  }
  dust.appendChild(fragment);
}

function orderedFiles() {
  return orientation === 'white' ? files : [...files].reverse();
}

function orderedRanks() {
  return orientation === 'white' ? ranks : [...ranks].reverse();
}

function syncCoordinates() {
  fileCoords.replaceChildren(...orderedFiles().map((value) => {
    const node = document.createElement('span');
    node.textContent = value;
    return node;
  }));
  rankCoords.replaceChildren(...orderedRanks().map((value) => {
    const node = document.createElement('span');
    node.textContent = value;
    return node;
  }));
}

function visibleSquares() {
  return orderedRanks().flatMap((rank) => orderedFiles().map((file) => `${file}${rank}`));
}

function findKing(color) {
  for (const square of visibleSquares()) {
    const piece = game.get(square);
    if (piece?.color === color && piece.type === 'k') return square;
  }
  return null;
}

function squareIsCapture(move) {
  return Boolean(move.captured || move.flags?.includes('e'));
}

function renderBoard() {
  syncCoordinates();
  const legalMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : [];
  const legalTargets = new Map(legalMoves.map((move) => [move.to, move]));
  const checkedKing = game.isCheck() ? findKing(game.turn()) : null;
  const fragment = document.createDocumentFragment();

  for (const squareName of visibleSquares()) {
    const fileIndex = files.indexOf(squareName[0]);
    const rankNumber = Number(squareName[1]);
    const piece = game.get(squareName);
    const legalMove = legalTargets.get(squareName);
    const square = document.createElement('button');
    const light = (fileIndex + rankNumber) % 2 === 1;

    square.type = 'button';
    square.className = `square ${light ? 'light' : 'dark'}`;
    square.setAttribute('role', 'gridcell');
    square.setAttribute('aria-label', `${squareName}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`);

    if (squareName === selectedSquare) square.classList.add('selected');
    if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) square.classList.add('last-move');
    if (checkedKing === squareName) square.classList.add('in-check');
    if (legalMove) square.classList.add('legal');
    if (legalMove && squareIsCapture(legalMove)) square.classList.add('capture');

    if (piece) {
      const node = document.createElement('span');
      node.className = `piece ${piece.color === 'w' ? 'white' : 'black'}${movingSquare === squareName ? ' moving' : ''}`;
      node.textContent = pieceGlyph[piece.color][piece.type];
      node.setAttribute('aria-hidden', 'true');
      square.appendChild(node);
    }

    square.addEventListener('click', () => handleSquare(squareName));
    fragment.appendChild(square);
  }

  board.replaceChildren(fragment);
  checkAura.classList.toggle('visible', Boolean(checkedKing));
  updatePanels();
}

function updatePanels() {
  const history = game.history({ verbose: true });
  const turn = game.turn();
  const fen = game.fen().split(' ');
  const gameOver = game.isGameOver();

  gameStatus.textContent = game.isCheckmate() ? 'CHECKMATE' : game.isDraw() ? 'DRAW' : turn === 'w' ? 'WHITE TO MOVE' : 'BLACK TO MOVE';
  moveCounter.textContent = `MOVE ${String(Math.floor(history.length / 2) + 1).padStart(2, '0')}`;
  moveTotal.textContent = `${history.length} PLY`;
  halfClock.textContent = fen[4] || '0';
  fenLabel.textContent = fen[0];
  checkCount.textContent = String(checkEvents);
  captureCount.textContent = String(captureEvents);

  whiteCard.classList.toggle('active-player', turn === 'w' && !gameOver);
  blackCard.classList.toggle('active-player', turn === 'b' && !gameOver);
  whiteStatus.textContent = turn === 'w' && !gameOver ? 'YOUR MOVE' : game.isCheckmate() && turn === 'b' ? 'VICTOR' : 'WAITING';
  blackStatus.textContent = game.isCheckmate() && turn === 'w'
    ? 'VICTOR'
    : turn === 'b' && !gameOver
      ? (aiToggle.checked ? (aiThinking ? 'CALCULATING' : 'CROWN AI') : 'YOUR MOVE')
      : 'WAITING';

  const whiteTaken = history.filter((move) => move.color === 'w' && move.captured).map((move) => pieceGlyph.b[move.captured]);
  const blackTaken = history.filter((move) => move.color === 'b' && move.captured).map((move) => pieceGlyph.w[move.captured]);
  whiteCaptureCount.textContent = String(whiteTaken.length);
  blackCaptureCount.textContent = String(blackTaken.length);
  whiteCaptures.textContent = whiteTaken.length ? whiteTaken.join(' ') : '—';
  blackCaptures.textContent = blackTaken.length ? blackTaken.join(' ') : '—';

  moveList.replaceChildren();
  for (let index = 0; index < history.length; index += 2) {
    const row = document.createElement('div');
    row.className = 'move-row';
    row.innerHTML = [
      `<span class="move-number">${String(index / 2 + 1).padStart(2, '0')}</span>`,
      `<span class="move-san ${index === history.length - 1 ? 'latest' : ''}">${history[index]?.san || ''}</span>`,
      `<span class="move-san ${index + 1 === history.length - 1 ? 'latest' : ''}">${history[index + 1]?.san || ''}</span>`,
    ].join('');
    moveList.appendChild(row);
  }
  moveList.scrollTop = moveList.scrollHeight;
}

function handleSquare(squareName) {
  if (aiThinking || game.isGameOver()) return;
  if (aiToggle.checked && game.turn() === 'b') return;

  const piece = game.get(squareName);
  const ownPiece = piece?.color === game.turn();

  if (!selectedSquare) {
    if (ownPiece) {
      selectedSquare = squareName;
      taunt.textContent = taunts[Math.floor(Math.random() * taunts.length)];
      renderBoard();
    }
    return;
  }

  if (squareName === selectedSquare) {
    selectedSquare = null;
    renderBoard();
    return;
  }

  const legalMove = game.moves({ square: selectedSquare, verbose: true }).find((move) => move.to === squareName);
  if (legalMove) {
    playMove(selectedSquare, squareName);
    return;
  }

  if (ownPiece) {
    selectedSquare = squareName;
    renderBoard();
  }
}

function persistGame() {
  localStorage.setItem('black-crown-fen', game.fen());
}

function updateDocumentTitle() {
  if (game.isCheckmate()) document.title = 'CHECKMATE | THE BLACK CROWN';
  else if (game.isDraw()) document.title = 'DRAW | THE BLACK CROWN';
  else document.title = `THE BLACK CROWN | ${game.turn() === 'w' ? 'White' : 'Black'} to move`;
}

function playMove(from, to, promotion = 'q') {
  try {
    const move = game.move({ from, to, promotion });
    if (!move) return;

    movingSquare = to;
    lastMove = { from, to };
    selectedSquare = null;
    if (move.captured) captureEvents += 1;
    if (game.isCheck()) checkEvents += 1;

    persistGame();
    playSound(move.captured ? 'capture' : 'move');
    renderBoard();
    updateDocumentTitle();

    window.setTimeout(() => {
      movingSquare = null;
      renderBoard();
    }, 460);

    if (game.isGameOver()) {
      window.setTimeout(showResult, 420);
      return;
    }

    if (aiToggle.checked && game.turn() === 'b') {
      aiThinking = true;
      updatePanels();
      window.setTimeout(() => {
        makeAiMove();
        aiThinking = false;
        renderBoard();
      }, 650);
    }
  } catch (error) {
    console.warn('Black Crown rejected a move.', error);
    selectedSquare = null;
    renderBoard();
  }
}

function makeAiMove() {
  if (game.isGameOver() || game.turn() !== 'b') return;
  const moves = game.moves({ verbose: true });
  if (!moves.length) return;

  const scored = moves.map((move) => {
    let score = 0;
    if (move.captured) score += pieceValue[move.captured] * 10;
    if (move.promotion) score += 80;
    if (move.san?.includes('#')) score += 10000;
    else if (move.san?.includes('+')) score += 80;
    if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) score += 6;
    score += Math.random() * 1.25;
    return { move, score };
  }).sort((a, b) => b.score - a.score);

  const pool = scored.slice(0, Math.min(3, scored.length));
  const choice = pool[Math.floor(Math.random() * pool.length)].move;
  playMove(choice.from, choice.to, choice.promotion || 'q');
}

function undoMove() {
  if (aiThinking || game.history().length === 0) return;

  game.undo();
  if (aiToggle.checked && game.turn() === 'b' && game.history().length > 0) game.undo();

  selectedSquare = null;
  lastMove = null;
  checkEvents = game.history({ verbose: true }).filter((move) => {
    const previous = game.history({ verbose: true });
    return move.san?.includes('+') || move.san?.includes('#') || previous.length === 0;
  }).length;
  captureEvents = game.history({ verbose: true }).filter((move) => move.captured).length;
  resultOverlay.hidden = true;
  persistGame();
  renderBoard();
  updateDocumentTitle();
}

function resetGame() {
  game.reset();
  selectedSquare = null;
  lastMove = null;
  movingSquare = null;
  aiThinking = false;
  checkEvents = 0;
  captureEvents = 0;
  resultOverlay.hidden = true;
  localStorage.removeItem('black-crown-fen');
  playSound('reset');
  renderBoard();
  updateDocumentTitle();
}

function flipBoard() {
  orientation = orientation === 'white' ? 'black' : 'white';
  selectedSquare = null;
  renderBoard();
}

function showResult() {
  const checkmate = game.isCheckmate();
  resultTitle.textContent = checkmate ? 'CHECKMATE' : 'THE BOARD IS DRAWN';
  if (checkmate) {
    const winner = game.turn() === 'w' ? 'BLACK' : 'WHITE';
    resultCopy.textContent = `${winner} takes the crown. The archive records everything.`;
  } else {
    resultCopy.textContent = 'Neither side earned the final word this time.';
  }
  resultOverlay.hidden = false;
  playSound(checkmate ? 'mate' : 'reset');
}

function playSound(kind) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = playSound.context || (playSound.context = new AudioContextClass());
  const settings = {
    move: [180, 0.055, 'sine'],
    capture: [95, 0.09, 'triangle'],
    mate: [62, 0.35, 'sawtooth'],
    reset: [280, 0.07, 'sine'],
  }[kind] || [160, 0.05, 'sine'];

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = settings[2];
  oscillator.frequency.setValueAtTime(settings[0], context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(38, settings[0] * 0.55), context.currentTime + settings[1]);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + settings[1]);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + settings[1] + 0.02);
}

function restoreSavedGame() {
  const savedFen = localStorage.getItem('black-crown-fen');
  if (!savedFen) return;
  try {
    game.load(savedFen);
    const history = game.history({ verbose: true });
    captureEvents = history.filter((move) => move.captured).length;
  } catch {
    localStorage.removeItem('black-crown-fen');
  }
}

$('#newGameBtn').addEventListener('click', resetGame);
$('#resultNewGame').addEventListener('click', resetGame);
$('#undoBtn').addEventListener('click', undoMove);
$('#flipBtn').addEventListener('click', flipBoard);
aiToggle.addEventListener('change', () => {
  selectedSquare = null;
  renderBoard();
});

buildDust();
restoreSavedGame();
renderBoard();
updateDocumentTitle();
