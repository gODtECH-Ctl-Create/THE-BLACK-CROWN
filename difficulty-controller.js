import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';
import { chooseCrownMove, getDifficultyLevels, replayFromSan } from './crown-difficulty.js';

(() => {
  const aiToggle = document.getElementById('aiToggle');
  const controlGroup = document.querySelector('.control-group');
  const board = document.getElementById('board');
  const moveList = document.getElementById('moveList');
  const promotionModal = document.getElementById('promotionModal');
  const promotionOptions = document.getElementById('promotionOptions');
  const blackStatus = document.getElementById('blackStatus');

  if (!aiToggle || !controlGroup || !board || !moveList) return;

  const difficultyKey = 'black-crown-difficulty';
  const savedDifficulty = localStorage.getItem(difficultyKey);
  const levels = getDifficultyLevels();
  let difficulty = levels[savedDifficulty] ? savedDifficulty : 'crown';
  let aiTimer = 0;
  let busy = false;
  let allowNativeChange = false;
  let lastMoveSignature = '';
  let aiLockedForMatch = false;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'difficulty-controller.css';
  document.head.appendChild(stylesheet);

  const panel = document.createElement('div');
  panel.className = 'difficulty-control';
  panel.innerHTML = `
    <label for="difficultySelect">
      <span>CROWN DIFFICULTY</span>
      <select id="difficultySelect" aria-describedby="difficultyHint"></select>
    </label>
    <div class="difficulty-hint" id="difficultyHint"></div>
  `;
  const select = panel.querySelector('#difficultySelect');
  const hint = panel.querySelector('#difficultyHint');

  for (const [key, level] of Object.entries(levels)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = level.label;
    select.appendChild(option);
  }
  select.value = difficulty;
  controlGroup.appendChild(panel);

  function extractSans() {
    return [...moveList.querySelectorAll('.move-san')]
      .map((node) => node.textContent.trim())
      .filter(Boolean);
  }

  function syncMatchLock() {
    const movesExist = extractSans().length > 0;
    if (!movesExist) {
      aiLockedForMatch = false;
    } else if (aiToggle.checked) {
      aiLockedForMatch = true;
    }

    aiToggle.disabled = aiLockedForMatch;
    select.disabled = !aiToggle.checked || aiLockedForMatch;

    if (aiLockedForMatch) {
      hint.textContent = `${levels[difficulty]?.description || ''} · LOCKED FOR THIS MATCH`;
      aiToggle.setAttribute('aria-label', 'Crown AI is locked for this match');
      aiToggle.title = 'Crown AI cannot be disabled after the match begins';
    } else {
      hint.textContent = levels[difficulty]?.description || '';
      aiToggle.removeAttribute('aria-label');
      aiToggle.removeAttribute('title');
    }
  }

  function syncDifficultyUi() {
    const level = levels[difficulty];
    select.value = difficulty;
    syncMatchLock();
    if (!aiLockedForMatch) hint.textContent = level ? level.description : '';
  }

  function persistDifficulty() {
    localStorage.setItem(difficultyKey, difficulty);
    const raw = localStorage.getItem('black-crown-save');
    if (!raw) return;
    try {
      const save = JSON.parse(raw);
      save.ai = aiToggle.checked;
      save.difficulty = difficulty;
      localStorage.setItem('black-crown-save', JSON.stringify(save));
    } catch {
      // The game will rebuild its save if the stored payload is invalid.
    }
  }

  function restoreDifficultyFromSave() {
    const raw = localStorage.getItem('black-crown-save');
    if (!raw) return;
    try {
      const save = JSON.parse(raw);
      if (levels[save.difficulty]) difficulty = save.difficulty;
    } catch {
      // Ignore malformed save data and keep the selected default.
    }
    select.value = difficulty;
  }

  function rebuildGame() {
    try {
      return replayFromSan(extractSans(), Chess);
    } catch (error) {
      console.warn('Crown difficulty could not reconstruct the current game.', error);
      return null;
    }
  }

  function cancelTimer() {
    if (aiTimer) window.clearTimeout(aiTimer);
    aiTimer = 0;
  }

  function cancelNativeAiTimer() {
    if (!aiToggle.checked) return;
    aiToggle.checked = false;
    allowNativeChange = true;
    aiToggle.dispatchEvent(new Event('change', { bubbles: true }));
    allowNativeChange = false;
    aiToggle.checked = true;
    persistDifficulty();
    syncDifficultyUi();
  }

  function waitForPromotionChoice(label, timeout = 900) {
    return new Promise((resolve) => {
      const start = performance.now();
      const check = () => {
        const choices = [...(promotionOptions?.querySelectorAll('.promotion-choice') || [])];
        const choice = choices.find((node) => node.textContent.trim().toUpperCase().includes(label));
        if (choice) return resolve(choice);
        if (performance.now() - start >= timeout) return resolve(null);
        window.requestAnimationFrame(check);
      };
      check();
    });
  }

  async function playAiMove(move) {
    const source = board.querySelector(`.square[data-square="${move.from}"]`);
    if (!source) return false;

    const wasChecked = aiToggle.checked;
    aiToggle.checked = false;
    source.click();

    const target = board.querySelector(`.square[data-square="${move.to}"]`);
    if (!target) {
      aiToggle.checked = wasChecked;
      return false;
    }

    target.click();

    if (move.promotion) {
      const label = move.promotion === 'q' ? 'QUEEN' : move.promotion === 'r' ? 'ROOK' : move.promotion === 'b' ? 'BISHOP' : 'KNIGHT';
      const choice = await waitForPromotionChoice(label);
      choice?.click();
    }

    aiToggle.checked = wasChecked;
    return true;
  }

  function syncBlackStatus() {
    if (!blackStatus || !aiToggle.checked) return;
    const level = levels[difficulty];
    if (level) blackStatus.textContent = busy ? 'CALCULATING' : `CROWN AI · ${level.label}`;
  }

  function scheduleAi() {
    cancelTimer();
    if (!aiToggle.checked || busy) return;

    const chess = rebuildGame();
    if (!chess || chess.turn() !== 'b' || chess.isGameOver()) return;

    busy = true;
    syncBlackStatus();
    cancelNativeAiTimer();

    const sessionSignature = extractSans().join('|');
    aiTimer = window.setTimeout(async () => {
      aiTimer = 0;
      const currentGame = rebuildGame();
      if (!currentGame || currentGame.turn() !== 'b' || currentGame.isGameOver()) {
        busy = false;
        syncBlackStatus();
        return;
      }

      const move = chooseCrownMove(currentGame, difficulty);
      if (!move || sessionSignature !== extractSans().join('|')) {
        busy = false;
        syncBlackStatus();
        return;
      }

      await playAiMove(move);
      busy = false;
      lastMoveSignature = extractSans().join('|');
      syncBlackStatus();
      syncMatchLock();
    }, difficulty === 'beginner' ? 420 : difficulty === 'intermediate' ? 620 : difficulty === 'hard' ? 850 : 1080);
  }

  function handleToggle(event) {
    if (allowNativeChange) return;
    if (aiLockedForMatch) {
      event.stopImmediatePropagation();
      aiToggle.checked = true;
      syncDifficultyUi();
      return;
    }

    event.stopImmediatePropagation();
    cancelTimer();
    busy = false;
    if (aiToggle.checked) {
      persistDifficulty();
      syncDifficultyUi();
      scheduleAi();
    } else {
      persistDifficulty();
      syncDifficultyUi();
    }
    syncBlackStatus();
  }

  aiToggle.addEventListener('change', handleToggle, true);

  select.addEventListener('change', () => {
    if (aiLockedForMatch) {
      syncDifficultyUi();
      return;
    }
    difficulty = select.value;
    persistDifficulty();
    cancelTimer();
    busy = false;
    syncDifficultyUi();
    syncBlackStatus();
    if (aiToggle.checked) scheduleAi();
  });

  const observer = new MutationObserver(() => {
    syncMatchLock();
    if (busy) return;
    const signature = extractSans().join('|');
    if (signature === lastMoveSignature) return;
    lastMoveSignature = signature;

    if (aiToggle.checked) scheduleAi();
    syncBlackStatus();
  });
  observer.observe(moveList, { childList: true, subtree: true });

  restoreDifficultyFromSave();
  lastMoveSignature = extractSans().join('|');
  syncDifficultyUi();

  if (aiToggle.checked) scheduleAi();
})();
