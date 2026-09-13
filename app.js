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
const entranceScreen = $('#entranceScreen');
const gameScreen = $('#gameScreen');
const resultOverlay = $('#resultOverlay');
const resultTitle = $('#resultTitle');
const resultCopy = $('#resultCopy');
const resultBadge = $('#resultBadge');
const resultCrown = $('#resultCrown');
const resultNewGame = $('#resultNewGame');
const promotionModal = $('#promotionModal');
const promotionOptionsHost = $('#promotionOptions');
const storyOverlay = $('#storyOverlay');
const storySummary = $('#storySummary');
const storyTimeline = $('#storyTimeline');
const eventFx = $('#eventFx');
const eventCaption = $('#eventCaption');
const eventCaptionKicker = $('#eventCaptionKicker');
const eventCaptionTitle = $('#eventCaptionTitle');
const eventCaptionCopy = $('#eventCaptionCopy');
const taunt = $('#taunt');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
const pieceGlyph = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
const pieceNames = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const promotionOptions = [
  ['q', 'QUEEN'],
  ['r', 'ROOK'],
  ['b', 'BISHOP'],
  ['n', 'KNIGHT'],
];
const taunts = [
  '“Do not confuse silence with mercy.”',
  '“The board has no sympathy for hesitation.”',
  '“A crown is only safe until the next move.”',
  '“Beautiful positions die quietly.”',
  '“There is always one square you forgot.”',
  '“The archive favors the patient.”',
];

let orientation = 'white';
let selectedSquare = null;
let dragSource = null;
let lastMove = null;
let movingSquare = null;
let aiThinking = false;
let pendingPromotion = null;
let checkEvents = 0;
let captureEvents = 0;
let matchEvents = [];
let matchHistory = [];
let savedGameId = 0;

function buildDust() {
  const dust = $('#dust');
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 54; i += 1) {
    const particle = document.createElement('i');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${9 + Math.random() * 18}s`;
    particle.style.animationDelay = `${-Math.random() * 20}s`;
    particle.style.opacity = `${0.12 + Math.random() * 0.5}`;
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

function isCapture(move) {
  return Boolean(move.captured || move.flags?.includes('e'));
}

function isPromotionMove(from, to) {
  const piece = game.get(from);
  return piece?.type === 'p' && (to[1] === '1' || to[1] === '8');
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
    square.dataset.square = squareName;
    square.setAttribute('role', 'gridcell');
    square.setAttribute('aria-label', `${squareName}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${pieceNames[piece.type].toLowerCase()}` : ''}`);

    if (squareName === selectedSquare) square.classList.add('selected');
    if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) square.classList.add('last-move');
    if (checkedKing === squareName) square.classList.add('in-check');
    if (legalMove) square.classList.add('legal');
    if (legalMove && isCapture(legalMove)) square.classList.add('capture');

    if (piece) {
      const node = document.createElement('span');
      node.className = `piece ${piece.color === 'w' ? 'white' : 'black'}${movingSquare === squareName ? ' moving' : ''}`;
      node.textContent = pieceGlyph[piece.color][piece.type];
      node.setAttribute('aria-hidden', 'true');
      node.draggable = true;
      node.dataset.square = squareName;
      node.addEventListener('dragstart', (event) => {
        if (aiThinking || game.isGameOver() || pendingPromotion || (aiToggle.checked && game.turn() === 'b')) {
          event.preventDefault();
          return;
        }
        dragSource = squareName;
        selectedSquare = squareName;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', squareName);
        renderBoard();
      });
      node.addEventListener('dragend', () => {
        dragSource = null;
        if (!pendingPromotion) {
          selectedSquare = null;
          renderBoard();
        }
      });
      square.appendChild(node);
    }

    square.addEventListener('dragover', (event) => {
      if (dragSource && legalTargets.has(squareName)) event.preventDefault();
    });
    square.addEventListener('drop', (event) => {
      event.preventDefault();
      const from = dragSource || event.dataTransfer.getData('text/plain');
      dragSource = null;
      attemptMove(from, squareName);
    });
    square.addEventListener('click', () => handleSquare(squareName));
    fragment.appendChild(square);
  }

  board.replaceChildren(fragment);
  checkAura.classList.toggle('visible', Boolean(checkedKing));
  board.classList.toggle('under-pressure', Boolean(checkedKing));
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
  if (aiThinking || game.isGameOver() || pendingPromotion) return;
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

  attemptMove(selectedSquare, squareName);
}

function attemptMove(from, to) {
  if (!from || aiThinking || game.isGameOver() || pendingPromotion) return;
  const legalMove = game.moves({ square: from, verbose: true }).find((move) => move.to === to);
  if (!legalMove) {
    const targetPiece = game.get(to);
    if (targetPiece?.color === game.turn()) {
      selectedSquare = to;
      renderBoard();
    }
    return;
  }

  if (isPromotionMove(from, to)) {
    openPromotion(from, to);
  } else {
    playMove(from, to);
  }
}

function persistGame() {
  const moveData = game.history({ verbose: true }).map((move) => ({
    from: move.from,
    to: move.to,
    promotion: move.promotion || undefined,
  }));
  localStorage.setItem('black-crown-save', JSON.stringify({
    moves: moveData,
    ai: aiToggle.checked,
    orientation,
    matchEvents,
    savedGameId,
  }));
}

function restoreSavedGame() {
  const raw = localStorage.getItem('black-crown-save');
  if (!raw) return;
  try {
    const save = JSON.parse(raw);
    game.reset();
    for (const move of save.moves || []) game.move(move);
    matchHistory = game.history({ verbose: true });
    matchEvents = Array.isArray(save.matchEvents) ? save.matchEvents : [];
    orientation = save.orientation === 'black' ? 'black' : 'white';
    aiToggle.checked = save.ai !== false;
    savedGameId = Number(save.savedGameId) || 0;
    checkEvents = matchHistory.filter((move) => move.san?.includes('+') || move.san?.includes('#')).length;
    captureEvents = matchHistory.filter((move) => move.captured).length;
  } catch (error) {
    console.warn('Black Crown could not restore the saved game.', error);
    localStorage.removeItem('black-crown-save');
    game.reset();
    matchEvents = [];
    matchHistory = [];
  }
}

function updateDocumentTitle() {
  if (game.isCheckmate()) document.title = 'CHECKMATE | THE BLACK CROWN';
  else if (game.isDraw()) document.title = 'DRAW | THE BLACK CROWN';
  else document.title = `THE BLACK CROWN | ${game.turn() === 'w' ? 'White' : 'Black'} to move`;
}

function openPromotion(from, to) {
  pendingPromotion = { from, to };
  promotionModal.hidden = false;
  promotionOptionsHost.replaceChildren();

  const color = game.turn();
  for (const [type, label] of promotionOptions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'promotion-choice';
    button.innerHTML = `<span class="promotion-glyph">${pieceGlyph[color][type]}</span><span>${label}</span>`;
    button.addEventListener('click', () => completePromotion(type), { once: true });
    promotionOptionsHost.appendChild(button);
  }
}

function closePromotion() {
  pendingPromotion = null;
  promotionModal.hidden = true;
  promotionOptionsHost.replaceChildren();
}

function completePromotion(pieceType) {
  const promotion = pendingPromotion;
  if (!promotion) return;
  closePromotion();
  playMove(promotion.from, promotion.to, pieceType);
}

function createEvent(move) {
  const mover = move.color === 'w' ? 'White' : 'Black';
  const piece = pieceNames[move.piece];
  const captured = move.captured ? pieceNames[move.captured] : null;
  let type = 'move';
  let severity = 1;
  let title = 'THE PIECES SHIFT';
  let kicker = `MOVE ${game.history().length}`;
  let copy = `${mover} moves the ${piece} to ${move.to}.`;

  if (move.flags?.includes('k') || move.flags?.includes('q')) {
    type = 'castle';
    severity = 3;
    title = 'THE FORTRESS TURNS';
    kicker = 'SPECIAL MOVE';
    copy = `${mover} castles. The King retreats behind a fresh line of defense.`;
  } else if (move.flags?.includes('e')) {
    type = 'en-passant';
    severity = 3;
    title = 'THE SHADOW CAPTURE';
    kicker = 'RARE MOVE';
    copy = `${mover} executes en passant. A pawn vanishes from the square where it thought it was safe.`;
  } else if (move.promotion) {
    type = move.promotion === 'q' ? 'promotion' : 'underpromotion';
    severity = move.promotion === 'q' ? 5 : 6;
    const promoted = pieceNames[move.promotion];
    title = move.promotion === 'q' ? 'THE PAWN BECOMES CROWN' : 'THE UNEXPECTED CROWN';
    kicker = move.promotion === 'q' ? 'PROMOTION' : 'UNDERPROMOTION';
    copy = `${mover} transforms a pawn into a ${promoted}. The battlefield gains a new power.`;
  } else if (captured === 'Queen' && move.piece === 'n') {
    type = 'queen-hunt';
    severity = 7;
    title = 'THE QUEEN FALLS';
    kicker = 'MAJOR CAPTURE';
    copy = `The Knight takes the Queen. The balance of the kingdom shifts in a single strike.`;
  } else if (captured === 'Queen') {
    type = 'queen-capture';
    severity = 6;
    title = 'THE CROWN IS TAKEN';
    kicker = 'MAJOR CAPTURE';
    copy = `${mover}'s ${piece} removes the Queen. The position will not be the same.`;
  } else if (captured && pieceValue[move.captured] >= 5) {
    type = 'heavy-capture';
    severity = 5;
    title = `THE ${captured.toUpperCase()} FALLS`;
    kicker = 'SIGNIFICANT CAPTURE';
    copy = `${mover}'s ${piece} takes the ${captured}. A heavy piece has left the board.`;
  } else if (move.captured) {
    type = 'capture';
    severity = 2;
    title = 'THE FIRST WOUND';
    kicker = 'CAPTURE';
    copy = `${mover}'s ${piece} takes a ${captured}. The archive marks the exchange.`;
  }

  if (game.isCheckmate()) {
    type = 'checkmate';
    severity = 10;
    title = 'THE FINAL BLOW';
    kicker = 'CHECKMATE';
    copy = `${mover} delivers checkmate. The opposing King has no surviving square.`;
  } else if (game.isCheck()) {
    type = severity >= 5 ? 'major-check' : 'check';
    severity = Math.max(severity, 4);
    title = severity >= 5 ? 'THE KING IS HUNTED' : 'CHECK';
    kicker = 'KING UNDER THREAT';
    copy = `${mover}'s move gives check. The King is forced to answer.`;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ply: game.history().length,
    color: move.color,
    san: move.san,
    from: move.from,
    to: move.to,
    fen: game.fen(),
    type,
    severity,
    kicker,
    title,
    copy,
    narration: moveNarration(move),
  };
}

function moveNarration(move) {
  const mover = move.color === 'w' ? 'White' : 'Black';
  const piece = pieceNames[move.piece];
  if (move.flags?.includes('k') || move.flags?.includes('q')) return `${mover} castles, moving the King toward shelter while the Rook joins the defense.`;
  if (move.flags?.includes('e')) return `${mover} finds a narrow passage and removes a pawn through en passant.`;
  if (move.promotion) return `${mover}'s pawn reaches ${move.to} and becomes a ${pieceNames[move.promotion]}.`;
  if (move.captured) return `${mover}'s ${piece} captures a ${pieceNames[move.captured]} on ${move.to}.`;
  return `${mover} moves the ${piece} from ${move.from} to ${move.to}.`;
}

function playMove(from, to, promotion = 'q') {
  if (aiThinking || game.isGameOver()) return;
  try {
    const move = game.move({ from, to, promotion });
    if (!move) return;

    movingSquare = to;
    lastMove = { from, to };
    selectedSquare = null;
    matchHistory = game.history({ verbose: true });
    const event = createEvent(move);
    matchEvents.push(event);
    checkEvents = matchHistory.filter((item) => item.san?.includes('+') || item.san?.includes('#')).length;
    captureEvents = matchHistory.filter((item) => item.captured).length;
    persistGame();

    if (event.severity >= 4) triggerCrownEvent(event);
    playSound(event.type === 'checkmate' ? 'mate' : isCapture(move) ? 'capture' : 'move');

    renderBoard();
    updateDocumentTitle();

    window.setTimeout(() => {
      movingSquare = null;
      renderBoard();
    }, 460);

    if (game.isGameOver()) {
      window.setTimeout(showResult, 650);
      return;
    }

    if (aiToggle.checked && game.turn() === 'b') {
      aiThinking = true;
      updatePanels();
      window.setTimeout(() => {
        makeAiMove();
        aiThinking = false;
        renderBoard();
      }, 760);
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
    if (move.captured) score += pieceValue[move.captured] * 11;
    if (move.promotion) score += 80;
    if (move.san?.includes('#')) score += 10000;
    else if (move.san?.includes('+')) score += 85;
    if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) score += 6;
    if (move.piece === 'n' && move.captured === 'q') score += 35;
    score += Math.random() * 1.5;
    return { move, score };
  }).sort((a, b) => b.score - a.score);

  const pool = scored.slice(0, Math.min(3, scored.length));
  const choice = pool[Math.floor(Math.random() * pool.length)].move;
  playMove(choice.from, choice.to, choice.promotion || 'q');
}

function undoMove() {
  if (aiThinking || pendingPromotion || game.history().length === 0) return;

  game.undo();
  if (aiToggle.checked && game.turn() === 'b' && game.history().length > 0) game.undo();

  selectedSquare = null;
  lastMove = null;
  matchHistory = game.history({ verbose: true });
  matchEvents = matchEvents.slice(0, matchHistory.length);
  checkEvents = matchHistory.filter((move) => move.san?.includes('+') || move.san?.includes('#')).length;
  captureEvents = matchHistory.filter((move) => move.captured).length;
  resultOverlay.hidden = true;
  persistGame();
  renderBoard();
  updateDocumentTitle();
}

function resetGame() {
  game.reset();
  selectedSquare = null;
  dragSource = null;
  lastMove = null;
  movingSquare = null;
  aiThinking = false;
  pendingPromotion = null;
  matchEvents = [];
  matchHistory = [];
  checkEvents = 0;
  captureEvents = 0;
  savedGameId += 1;
  resultOverlay.hidden = true;
  storyOverlay.hidden = true;
  promotionModal.hidden = true;
  localStorage.removeItem('black-crown-save');
  playSound('reset');
  renderBoard();
  updateDocumentTitle();
}

function flipBoard() {
  orientation = orientation === 'white' ? 'black' : 'white';
  selectedSquare = null;
  persistGame();
  renderBoard();
}

function showResult() {
  const checkmate = game.isCheckmate();
  const draw = game.isDraw();
  const winner = checkmate ? (game.turn() === 'w' ? 'BLACK' : 'WHITE') : null;
  const quality = getGameQuality();

  resultCrown.textContent = winner === 'WHITE' ? '♔' : winner === 'BLACK' ? '♚' : '♛';
  resultBadge.textContent = checkmate ? `${winner} CLAIMS THE CROWN` : draw ? 'DRAWN BATTLE' : 'GAME COMPLETE';
  resultTitle.textContent = quality.title;
  resultCopy.textContent = quality.copy;
  resultNewGame.hidden = false;
  resultOverlay.hidden = false;
  persistGame();
}

function getGameQuality() {
  const moves = game.history({ verbose: true });
  const maxSeverity = Math.max(0, ...matchEvents.map((event) => event.severity));
  const majorEvents = matchEvents.filter((event) => event.severity >= 5).length;
  const checks = moves.filter((move) => move.san?.includes('+') || move.san?.includes('#')).length;
  const captures = moves.filter((move) => move.captured).length;
  let score = Math.min(100, Math.round(moves.length * 1.15 + captures * 2.2 + checks * 6 + majorEvents * 11 + Math.max(0, moves.length - 20) * 0.55));
  if (maxSeverity >= 10) score = Math.max(score, 86);

  if (score >= 86) return { title: 'A LEGENDARY BATTLE', copy: `The archive found ${majorEvents || 'several'} decisive moments. ${moves.length} plies became a game worth remembering.` };
  if (score >= 64) return { title: 'A GREAT BATTLE', copy: `The position kept changing shape, with ${majorEvents || 'several'} moments that altered the story.` };
  if (score >= 38) return { title: 'A HARD-FOUGHT BATTLE', copy: `${moves.length} plies, ${captures} captures, and a position that refused to stay quiet.` };
  return { title: 'A QUIET SKIRMISH', copy: 'The battle ended early. The archive records the moves, even when the battlefield stayed restrained.' };
}

function buildStory() {
  const moves = game.history({ verbose: true });
  const quality = getGameQuality();
  const winner = game.isCheckmate() ? (game.turn() === 'w' ? 'Black' : 'White') : null;
  const titleEvent = [...matchEvents].reverse().find((event) => event.severity >= 6);
  const storyTitle = titleEvent?.title || (winner ? `${winner.toUpperCase()} TAKES THE CROWN` : 'THE BATTLE WITHOUT A FINAL KING');

  storySummary.innerHTML = `
    <div class="story-quality"><span class="section-kicker">${quality.title}</span><strong>${storyTitle}</strong><p>${quality.copy}</p></div>
    <div class="story-stats">
      <span class="story-stat"><b>${moves.length}</b><small>PLIES</small></span>
      <span class="story-stat"><b>${moves.filter((move) => move.captured).length}</b><small>CAPTURES</small></span>
      <span class="story-stat"><b>${moves.filter((move) => move.san?.includes('+') || move.san?.includes('#')).length}</b><small>CHECKS</small></span>
      <span class="story-stat"><b>${matchEvents.filter((event) => event.severity >= 5).length}</b><small>CROWN EVENTS</small></span>
    </div>`;

  storyTimeline.replaceChildren();
  matchEvents.forEach((event) => {
    const article = document.createElement('article');
    article.className = `story-entry severity-${Math.min(10, event.severity)}`;
    article.innerHTML = `
      <div class="story-marker"><span>${String(event.ply).padStart(2, '0')}</span></div>
      <div class="story-entry-body">
        <div class="story-entry-head"><span>${event.kicker}</span><b>${event.san}</b></div>
        <h3>${event.title}</h3>
        <p>${event.narration}</p>
        ${event.severity >= 3 ? `<div class="story-event-copy">${event.copy}</div>` : ''}
      </div>`;
    storyTimeline.appendChild(article);
  });

  if (!matchEvents.length) {
    const empty = document.createElement('p');
    empty.className = 'story-empty';
    empty.textContent = 'The archive has no moves yet. Enter the chamber and give it a story.';
    storyTimeline.appendChild(empty);
  }
}

function openStory() {
  buildStory();
  storyOverlay.hidden = false;
}

function closeStory() {
  storyOverlay.hidden = true;
}

function triggerCrownEvent(event) {
  document.body.classList.remove('event-major', 'event-check', 'event-mate', 'event-special');
  const bodyClass = event.type === 'checkmate' ? 'event-mate' : event.severity >= 6 ? 'event-major' : event.type === 'check' || event.type === 'major-check' ? 'event-check' : 'event-special';
  document.body.classList.add(bodyClass);

  eventCaptionKicker.textContent = event.kicker;
  eventCaptionTitle.textContent = event.title;
  eventCaptionCopy.textContent = event.copy;
  eventCaption.classList.remove('show');
  requestAnimationFrame(() => eventCaption.classList.add('show'));

  eventFx.replaceChildren();
  const particleCount = event.severity >= 7 ? 34 : event.severity >= 5 ? 22 : 12;
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement('i');
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 40 + Math.random() * 190;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--delay', `${Math.random() * 80}ms`);
    eventFx.appendChild(particle);
  }

  window.setTimeout(() => {
    document.body.classList.remove(bodyClass);
    eventCaption.classList.remove('show');
  }, event.type === 'checkmate' ? 2000 : event.severity >= 6 ? 1350 : 900);
}

function playSound(kind) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = playSound.context || (playSound.context = new AudioContextClass());
  const settings = {
    move: [180, 0.055, 'sine', 0.04],
    capture: [95, 0.09, 'triangle', 0.055],
    mate: [58, 0.42, 'sawtooth', 0.075],
    reset: [280, 0.07, 'sine', 0.045],
  }[kind] || [160, 0.05, 'sine', 0.04];

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = settings[2];
  oscillator.frequency.setValueAtTime(settings[0], context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(38, settings[0] * 0.52), context.currentTime + settings[1]);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(settings[3], context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + settings[1]);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + settings[1] + 0.02);
}

function enterGame() {
  entranceScreen.classList.add('leave');
  window.setTimeout(() => {
    entranceScreen.hidden = true;
    gameScreen.hidden = false;
    gameScreen.classList.add('enter');
    renderBoard();
    updateDocumentTitle();
  }, 650);
}

function backToEntrance() {
  gameScreen.classList.remove('enter');
  entranceScreen.hidden = false;
  entranceScreen.classList.remove('leave');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#enterGameBtn').addEventListener('click', enterGame);
$('#backToEntranceBtn').addEventListener('click', backToEntrance);
$('#newGameBtn').addEventListener('click', resetGame);
$('#undoBtn').addEventListener('click', undoMove);
$('#flipBtn').addEventListener('click', flipBoard);
$('#storyBtn').addEventListener('click', openStory);
$('#resultNewGame').addEventListener('click', resetGame);
$('#openStoryBtn').addEventListener('click', () => {
  resultOverlay.hidden = true;
  openStory();
});
$('#closeStoryBtn').addEventListener('click', closeStory);
$('#storyNewGame').addEventListener('click', () => {
  closeStory();
  resetGame();
});
aiToggle.addEventListener('change', () => {
  selectedSquare = null;
  persistGame();
  renderBoard();
});

storyOverlay.addEventListener('click', (event) => {
  if (event.target === storyOverlay) closeStory();
});
promotionModal.addEventListener('click', (event) => {
  if (event.target === promotionModal && pendingPromotion) closePromotion();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!storyOverlay.hidden) closeStory();
    else if (!promotionModal.hidden) closePromotion();
    else if (!resultOverlay.hidden) resultOverlay.hidden = true;
  }
});

buildDust();
restoreSavedGame();
renderBoard();
updateDocumentTitle();