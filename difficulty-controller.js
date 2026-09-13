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
  const entranceButton = document.getElementById('enterGameBtn');
  const entranceScreen = document.getElementById('entranceScreen');
  const gameScreen = document.getElementById('gameScreen');
  const connectionLabel = document.getElementById('connectionLabel');

  if (!aiToggle || !board || !moveList || !entranceButton || !entranceScreen || !gameScreen) return;

  const difficultyKey = 'black-crown-difficulty';
  const levels = getDifficultyLevels();
  const savedDifficulty = localStorage.getItem(difficultyKey);
  const save = (() => {
    try { return JSON.parse(localStorage.getItem('black-crown-save') || 'null'); } catch { return null; }
  })();

  let difficulty = levels[savedDifficulty] ? savedDifficulty : levels[save?.difficulty] ? save.difficulty : 'crown';
  let matchMode = save?.ai === false ? 'two-player' : 'crown';
  let modeSetupOpen = false;
  let matchStarted = false;
  let aiTimer = 0;
  let busy = false;
  let lastMoveSignature = '';

  aiToggle.hidden = true;
  aiToggle.disabled = true;
  if (controlGroup) controlGroup.hidden = true;
  entranceButton.textContent = 'PLAY THE GAME';

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'difficulty-controller.css';
  document.head.appendChild(stylesheet);

  const modeShell = document.createElement('div');
  modeShell.className = 'mode-shell';
  modeShell.hidden = true;
  modeShell.innerHTML = `
    <div class="mode-card" role="dialog" aria-modal="true" aria-labelledby="modeTitle">
      <div class="mode-header">
        <div>
          <span class="section-kicker">CHOOSE YOUR BATTLE</span>
          <h2 id="modeTitle">HOW WILL YOU ENTER THE CROWN?</h2>
          <p class="mode-intro">Choose the kind of match before the first move. Your choice defines the battlefield.</p>
        </div>
        <button class="close-modal mode-close" id="closeModeBtn" type="button" aria-label="Close match setup">×</button>
      </div>

      <div class="mode-options" role="radiogroup" aria-label="Match type">
        <button class="mode-option" data-mode="two-player" type="button" role="radio" aria-checked="false">
          <span class="mode-glyph">♔♚</span>
          <span class="mode-option-copy">
            <strong>TWO PLAYER</strong>
            <small>LOCAL BATTLE · TWO MINDS · ONE BOARD</small>
          </span>
          <span class="mode-arrow">↗</span>
        </button>
        <button class="mode-option active" data-mode="crown" type="button" role="radio" aria-checked="true">
          <span class="mode-glyph">♛</span>
          <span class="mode-option-copy">
            <strong>PLAY WITH CROWN</strong>
            <small>FACE THE CROWN · SOLO BATTLE</small>
          </span>
          <span class="mode-arrow">↗</span>
        </button>
        <button class="mode-option mode-coming" type="button" disabled aria-disabled="true">
          <span class="mode-glyph">◈</span>
          <span class="mode-option-copy">
            <strong>ONLINE MULTIPLAYER</strong>
            <small>THE NETWORKED ARENA IS COMING</small>
          </span>
          <span class="mode-badge">SOON</span>
        </button>
      </div>

      <section class="difficulty-setup" id="difficultySetup" aria-label="Crown difficulty">
        <div class="difficulty-setup-heading">
          <div>
            <span class="section-kicker">THE CROWN</span>
            <h3>CHOOSE ITS STRENGTH</h3>
          </div>
          <span class="difficulty-lock-note">SET BEFORE THE BATTLE</span>
        </div>
        <div class="difficulty-level-grid" id="difficultyLevelGrid"></div>
      </section>

      <div class="mode-footer">
        <span id="modeSummary">PLAY WITH CROWN · CROWN</span>
        <button class="action-button primary mode-start" id="startMatchBtn" type="button">ENTER THE BATTLE <span>↗</span></button>
      </div>
    </div>
  `;
  document.body.appendChild(modeShell);

  const closeModeBtn = modeShell.querySelector('#closeModeBtn');
  const startMatchBtn = modeShell.querySelector('#startMatchBtn');
  const modeSummary = modeShell.querySelector('#modeSummary');
  const difficultySetup = modeShell.querySelector('#difficultySetup');
  const difficultyGrid = modeShell.querySelector('#difficultyLevelGrid');
  const modeOptions = [...modeShell.querySelectorAll('.mode-option[data-mode]')];

  for (const [key, level] of Object.entries(levels)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `difficulty-level${key === difficulty ? ' active' : ''}`;
    button.dataset.difficulty = key;
    button.innerHTML = `<strong>${level.label}</strong><small>${level.description}</small>`;
    difficultyGrid.appendChild(button);
  }

  function extractSans() {
    return [...moveList.querySelectorAll('.move-san')]
      .map((node) => node.textContent.trim())
      .filter(Boolean);
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
    busy = false;
  }

  function selectMode(nextMode) {
    matchMode = nextMode;
    modeOptions.forEach((option) => {
      const active = option.dataset.mode === matchMode;
      option.classList.toggle('active', active);
      option.setAttribute('aria-checked', String(active));
    });
    difficultySetup.hidden = matchMode !== 'crown';
    modeSummary.textContent = matchMode === 'crown'
      ? `PLAY WITH CROWN · ${levels[difficulty].label}`
      : 'TWO PLAYER · LOCAL BATTLE';
  }

  function selectDifficulty(nextDifficulty) {
    if (!levels[nextDifficulty]) return;
    difficulty = nextDifficulty;
    difficultyGrid.querySelectorAll('.difficulty-level').forEach((button) => {
      button.classList.toggle('active', button.dataset.difficulty === difficulty);
    });
    modeSummary.textContent = `PLAY WITH CROWN · ${levels[difficulty].label}`;
  }

  function persistSetup() {
    localStorage.setItem(difficultyKey, difficulty);
    const raw = localStorage.getItem('black-crown-save');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      saved.ai = matchMode === 'crown';
      saved.difficulty = difficulty;
      localStorage.setItem('black-crown-save', JSON.stringify(saved));
    } catch {
      // Invalid save data will be rebuilt by the main game.
    }
  }

  function dispatchModeState() {
    const nextAiState = matchMode === 'crown';
    aiToggle.disabled = false;
    aiToggle.checked = nextAiState;
    aiToggle.disabled = true;
    aiToggle.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function updateGameModeLabel() {
    if (!connectionLabel) return;
    connectionLabel.textContent = matchMode === 'crown'
      ? `CROWN · ${levels[difficulty].label}`
      : 'TWO PLAYER · LOCAL';
  }

  function openModeSetup(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (matchStarted && !gameScreen.hidden) return;
    modeSetupOpen = true;
    modeShell.hidden = false;
    selectMode(matchMode);
  }

  function closeModeSetup() {
    modeSetupOpen = false;
    modeShell.hidden = true;
  }

  function startMatch() {
    cancelTimer();
    persistSetup();
    closeModeSetup();
    matchStarted = true;
    aiToggle.disabled = false;
    aiToggle.checked = matchMode === 'crown';
    aiToggle.dispatchEvent(new Event('change', { bubbles: true }));
    aiToggle.disabled = true;
    updateGameModeLabel();

    entranceScreen.classList.add('leave');
    window.setTimeout(() => {
      entranceScreen.hidden = true;
      gameScreen.hidden = false;
      gameScreen.classList.add('enter');
      if (matchMode === 'crown') scheduleAi(560);
    }, 360);
  }

  function scheduleAi(delay = 760) {
    cancelTimer();
    if (matchMode !== 'crown' || gameScreen.hidden) return;

    const chess = rebuildGame();
    if (!chess || chess.turn() !== 'b' || chess.isGameOver()) return;

    busy = true;
    syncBlackStatus();
    const sessionSignature = extractSans().join('|');

    aiTimer = window.setTimeout(async () => {
      aiTimer = 0;
      const currentGame = rebuildGame();
      if (matchMode !== 'crown' || gameScreen.hidden || !currentGame || currentGame.turn() !== 'b' || currentGame.isGameOver()) {
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
    }, delay);
  }

  function syncBlackStatus() {
    if (!blackStatus) return;
    if (matchMode === 'crown') {
      blackStatus.textContent = busy ? 'CALCULATING' : `CROWN AI · ${levels[difficulty].label}`;
    } else {
      blackStatus.textContent = 'SECOND PLAYER';
    }
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

    aiToggle.disabled = false;
    aiToggle.checked = false;
    source.click();

    const target = board.querySelector(`.square[data-square="${move.to}"]`);
    if (!target) {
      aiToggle.checked = true;
      aiToggle.disabled = true;
      return false;
    }

    target.click();

    if (move.promotion) {
      const label = move.promotion === 'q' ? 'QUEEN' : move.promotion === 'r' ? 'ROOK' : move.promotion === 'b' ? 'BISHOP' : 'KNIGHT';
      const choice = await waitForPromotionChoice(label);
      choice?.click();
    }

    aiToggle.checked = true;
    aiToggle.disabled = true;
    return true;
  }

  function handleToggle(event) {
    event.stopImmediatePropagation();
    aiToggle.checked = matchMode === 'crown';
  }

  entranceButton.addEventListener('click', openModeSetup, true);
  closeModeBtn.addEventListener('click', closeModeSetup);
  startMatchBtn.addEventListener('click', startMatch);

  modeOptions.forEach((option) => {
    option.addEventListener('click', () => selectMode(option.dataset.mode));
  });

  difficultyGrid.querySelectorAll('.difficulty-level').forEach((button) => {
    button.addEventListener('click', () => selectDifficulty(button.dataset.difficulty));
  });

  aiToggle.addEventListener('change', handleToggle, true);

  const observer = new MutationObserver(() => {
    if (!matchStarted || gameScreen.hidden || matchMode !== 'crown') {
      syncBlackStatus();
      return;
    }
    const signature = extractSans().join('|');
    if (signature === lastMoveSignature) return;
    lastMoveSignature = signature;
    if (!busy) scheduleAi();
    syncBlackStatus();
  });
  observer.observe(moveList, { childList: true, subtree: true });

  modeShell.addEventListener('click', (event) => {
    if (event.target === modeShell) closeModeSetup();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modeSetupOpen) closeModeSetup();
  });

  selectMode(matchMode);
  syncBlackStatus();
})();