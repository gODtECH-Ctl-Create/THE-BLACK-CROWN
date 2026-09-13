/* THE BLACK CROWN · Chronicle battle replay */
(() => {
  const overlay = document.getElementById('storyOverlay');
  const card = overlay?.querySelector('.story-card');
  const timeline = document.getElementById('storyTimeline');
  if (!overlay || !card || !timeline) return;

  const pieceGlyph = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  };
  const replay = {
    index: -1,
    timer: 0,
    playing: false,
    events: [],
  };

  const mount = document.createElement('section');
  mount.className = 'chronicle-replay';
  mount.innerHTML = `
    <div class="replay-grid">
      <div class="replay-stage">
        <div class="replay-label">BATTLE REPLAY</div>
        <div class="replay-board" id="replayBoard" aria-label="Chronicle replay board"></div>
        <div class="replay-moment">
          <span class="replay-moment-kicker" id="replayKicker">THE OPENING</span>
          <strong class="replay-moment-title" id="replayMomentTitle">The battle has not begun.</strong>
          <span class="replay-moment-copy" id="replayMomentCopy">Move through the Chronicle to revisit the battlefield.</span>
        </div>
        <div class="replay-controls" aria-label="Replay controls">
          <button class="replay-control" id="replayPrev" type="button" aria-label="Previous move">‹</button>
          <button class="replay-control play" id="replayPlay" type="button">PLAY</button>
          <button class="replay-control" id="replayNext" type="button" aria-label="Next move">›</button>
          <input class="replay-progress" id="replayProgress" type="range" min="0" max="0" value="0" aria-label="Replay position" />
        </div>
      </div>
      <div class="replay-side">
        <div class="replay-side-head">
          <span>EVERY MOVE LEAVES EVIDENCE</span>
          <b class="replay-position" id="replayPosition">START</b>
        </div>
        <div class="replay-timeline" id="replayTimeline"></div>
      </div>
    </div>
  `;

  const replayBoard = mount.querySelector('#replayBoard');
  const replayTimeline = mount.querySelector('#replayTimeline');
  const replayKicker = mount.querySelector('#replayKicker');
  const replayTitle = mount.querySelector('#replayMomentTitle');
  const replayCopy = mount.querySelector('#replayMomentCopy');
  const replayPosition = mount.querySelector('#replayPosition');
  const replayPlay = mount.querySelector('#replayPlay');
  const replayProgress = mount.querySelector('#replayProgress');
  const replayPrev = mount.querySelector('#replayPrev');
  const replayNext = mount.querySelector('#replayNext');

  const header = card.querySelector('.story-header');
  if (header) header.insertAdjacentElement('afterend', mount);
  else card.prepend(mount);

  const initialPlacement = 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = ['8','7','6','5','4','3','2','1'];
  const pieceTypes = 'rnbqkp';

  function parseFen(fen) {
    const placement = (fen || '').split(' ')[0];
    const cells = [];
    for (const rank of placement.split('/')) {
      for (const char of rank) {
        if (/\d/.test(char)) cells.push(...Array(Number(char)).fill(null));
        else cells.push(char);
      }
    }
    return cells.length === 64 ? cells : initialPlacement.split('').map((char) => (char === '.' ? null : char));
  }

  function boardFromEvent(event) {
    return event?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  function renderBoard(fen, event) {
    const cells = parseFen(fen);
    replayBoard.replaceChildren();
    cells.forEach((char, index) => {
      const rankIndex = Math.floor(index / 8);
      const fileIndex = index % 8;
      const square = document.createElement('div');
      const name = `${files[fileIndex]}${ranks[rankIndex]}`;
      square.className = `replay-square ${((fileIndex + rankIndex) % 2 === 1) ? 'light' : 'dark'}`;
      if (event?.from === name || event?.to === name) square.classList.add('highlight');
      if (event?.to === name && event?.captured) square.classList.add('capture-highlight');
      if (char) {
        const lower = char.toLowerCase();
        const color = char === char.toUpperCase() ? 'w' : 'b';
        if (pieceTypes.includes(lower)) {
          const piece = document.createElement('span');
          piece.className = `replay-piece ${color === 'w' ? 'white' : 'black'}`;
          piece.textContent = pieceGlyph[color][lower];
          square.appendChild(piece);
        }
      }
      replayBoard.appendChild(square);
    });
  }

  function readEvents() {
    return [...timeline.querySelectorAll('.story-entry')]
      .map((node) => ({
        node,
        ply: Number(node.dataset.ply) || 0,
        fen: node.dataset.fen || '',
        from: node.dataset.from || '',
        to: node.dataset.to || '',
        san: node.querySelector('.story-entry-head b')?.textContent.trim() || '',
        kicker: node.querySelector('.story-entry-head span')?.textContent.trim() || 'MOVE',
        title: node.querySelector('h3')?.textContent.trim() || 'THE PIECES SHIFT',
        narration: node.querySelector('p')?.textContent.trim() || '',
        severity: Number(node.dataset.severity) || 1,
      }))
      .filter((event) => event.fen);
  }

  function renderTimeline() {
    replayTimeline.replaceChildren();
    replay.events.forEach((event, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `replay-step${index === replay.index ? ' active' : ''}${event.severity >= 5 ? ' replay-step-major' : ''}`;
      button.innerHTML = `
        <span class="replay-step-ply">${String(event.ply).padStart(2, '0')}</span>
        <span><strong class="replay-step-title">${event.title}</strong><small class="replay-step-meta">${event.kicker}</small></span>
        <b class="replay-step-san">${event.san}</b>`;
      button.addEventListener('click', () => show(index));
      replayTimeline.appendChild(button);
    });
  }

  function show(index) {
    stop();
    replay.index = Math.max(-1, Math.min(index, replay.events.length - 1));
    const event = replay.index >= 0 ? replay.events[replay.index] : null;
    renderBoard(event ? boardFromEvent(event) : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', event);
    if (event) {
      replayKicker.textContent = event.kicker;
      replayTitle.textContent = event.title;
      replayCopy.textContent = event.narration;
      replayPosition.textContent = `MOVE ${String(event.ply).padStart(2,'0')}`;
    } else {
      replayKicker.textContent = 'THE OPENING';
      replayTitle.textContent = 'The battlefield waits.';
      replayCopy.textContent = 'The first move is still only a possibility.';
      replayPosition.textContent = 'START';
    }
    replayProgress.value = String(Math.max(0, replay.index + 1));
    replayTimeline.querySelectorAll('.replay-step').forEach((button, stepIndex) => button.classList.toggle('active', stepIndex === replay.index));
    const activeStep = replayTimeline.querySelector('.replay-step.active');
    activeStep?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function sync() {
    replay.events = readEvents();
    replayProgress.max = String(replay.events.length);
    if (replay.index >= replay.events.length) replay.index = replay.events.length - 1;
    renderTimeline();
    show(replay.index);
  }

  function play() {
    if (!replay.events.length) return;
    if (replay.index >= replay.events.length - 1) replay.index = -1;
    replay.playing = true;
    replayPlay.textContent = 'PAUSE';
    const tick = () => {
      if (!replay.playing) return;
      if (replay.index >= replay.events.length - 1) {
        stop();
        return;
      }
      replay.index += 1;
      const event = replay.events[replay.index];
      renderBoard(boardFromEvent(event), event);
      replayKicker.textContent = event.kicker;
      replayTitle.textContent = event.title;
      replayCopy.textContent = event.narration;
      replayPosition.textContent = `MOVE ${String(event.ply).padStart(2,'0')}`;
      replayProgress.value = String(replay.index + 1);
      replayTimeline.querySelectorAll('.replay-step').forEach((button, stepIndex) => button.classList.toggle('active', stepIndex === replay.index));
      replayTimeline.querySelector('.replay-step.active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      replay.timer = window.setTimeout(tick, 950);
    };
    tick();
  }

  function stop() {
    replay.playing = false;
    if (replay.timer) window.clearTimeout(replay.timer);
    replay.timer = 0;
    replayPlay.textContent = 'PLAY';
  }

  replayPrev.addEventListener('click', () => show(replay.index <= -1 ? -1 : replay.index - 1));
  replayNext.addEventListener('click', () => show(replay.index + 1));
  replayPlay.addEventListener('click', () => replay.playing ? stop() : play());
  replayProgress.addEventListener('input', () => show(Number(replayProgress.value) - 1));

  const observer = new MutationObserver(sync);
  observer.observe(timeline, { childList: true, subtree: true });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) stop();
  });
  window.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'ArrowLeft') show(replay.index - 1);
    if (event.key === 'ArrowRight') show(replay.index + 1);
    if (event.key === ' ') {
      event.preventDefault();
      replay.playing ? stop() : play();
    }
  });

  sync();
})();
