/* THE BLACK CROWN · Hall of Records */
(() => {
  const RECORDS_KEY = 'black-crown-records';
  const screen = document.getElementById('entranceScreen');
  const resultOverlay = document.getElementById('resultOverlay');
  const storyOverlay = document.getElementById('storyOverlay');
  const moveList = document.getElementById('moveList');
  if (!screen || !resultOverlay || !storyOverlay || !moveList) return;

  const readRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  };

  const saveRecords = (records) => localStorage.setItem(RECORDS_KEY, JSON.stringify(records.slice(0, 50)));

  const state = { selectedId: null };

  function getCurrentMatchData() {
    const moveNodes = [...moveList.querySelectorAll('.move-san')];
    const sans = moveNodes.map((node) => node.textContent.trim()).filter(Boolean);
    if (!sans.length) return null;
    return sans;
  }

  function makeRecord({ result = 'completed', reason = '', mode = 'local', difficulty = 'standard', winner = null, quality = 'A BATTLE', qualityCopy = '', title = 'THE BATTLE', matchEvents = [], moves = [] }) {
    const now = new Date();
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: now.toISOString(),
      result,
      reason,
      mode,
      difficulty,
      winner,
      quality,
      qualityCopy,
      title,
      moves: moves.map((move) => ({
        ply: move.ply,
        san: move.san,
        from: move.from,
        to: move.to,
        fen: move.fen,
        captured: move.captured || null,
        promotion: move.promotion || null,
        type: move.type || 'move',
        severity: move.severity || 1,
        kicker: move.kicker || 'MOVE',
        eventTitle: move.eventTitle || 'THE PIECES SHIFT',
        narration: move.narration || '',
      })),
      events: matchEvents,
    };
  }

  function recordCompletedBattle(data) {
    const moves = getCurrentMatchData();
    if (!moves?.length) return null;
    const records = readRecords();
    const latestExisting = records[0];
    if (latestExisting?.moves?.length === moves.length && latestExisting?.moves?.at(-1)?.san === moves.at(-1)) return latestExisting;
    const record = makeRecord(data);
    records.unshift(record);
    saveRecords(records);
    return record;
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch {
      return 'UNKNOWN DATE';
    }
  }

  function injectLandingSection() {
    if (screen.querySelector('#records')) return;
    const navLinks = screen.querySelector('.landing-nav-links');
    navLinks?.querySelector('.landing-nav-play')?.insertAdjacentHTML('beforebegin', '<a href="#records">HALL OF RECORDS</a>');

    const footer = screen.querySelector('.landing-final');
    if (!footer) return;
    const section = document.createElement('section');
    section.className = 'landing-section records-section';
    section.id = 'records';
    section.innerHTML = `
      <div class="landing-section-heading">
        <span class="landing-kicker">THE ARCHIVE</span>
        <h2>THE HALL OF RECORDS.</h2>
        <p>Every completed battle leaves evidence. Your best games, closest finishes and decisive moments live here on this device.</p>
      </div>
      <div class="records-summary" id="recordsSummary"></div>
      <div class="records-list" id="recordsList"></div>
    `;
    footer.parentNode.insertBefore(section, footer);
    renderLandingRecords();
  }

  function renderLandingRecords() {
    const summary = screen.querySelector('#recordsSummary');
    const list = screen.querySelector('#recordsList');
    if (!summary || !list) return;
    const records = readRecords();
    const wins = records.filter((record) => record.result === 'win').length;
    const losses = records.filter((record) => record.result === 'loss').length;
    const draws = records.filter((record) => record.result === 'draw').length;
    const longest = records.reduce((best, record) => Math.max(best, record.moves?.length || 0), 0);

    summary.innerHTML = `
      <div class="record-stat"><span>BATTLES</span><strong>${records.length}</strong></div>
      <div class="record-stat"><span>VICTORIES</span><strong>${wins}</strong></div>
      <div class="record-stat"><span>DEFEATS</span><strong>${losses}</strong></div>
      <div class="record-stat"><span>DRAWS</span><strong>${draws}</strong></div>
      <div class="record-stat"><span>LONGEST</span><strong>${longest}</strong><small>PLIES</small></div>`;

    list.replaceChildren();
    if (!records.length) {
      const empty = document.createElement('div');
      empty.className = 'records-empty';
      empty.innerHTML = '<span>THE HALL IS SILENT.</span><p>Finish your first battle and the archive will remember it.</p>';
      list.appendChild(empty);
      return;
    }

    records.slice(0, 12).forEach((record, index) => {
      const article = document.createElement('article');
      article.className = `record-card record-${record.result}`;
      article.innerHTML = `
        <div class="record-rank">${String(index + 1).padStart(2, '0')}</div>
        <div class="record-main">
          <span class="record-kicker">${record.mode === 'crown' ? `PLAY WITH CROWN · ${String(record.difficulty).toUpperCase()}` : 'TWO PLAYER · LOCAL'}</span>
          <h3>${record.title || 'THE BATTLE'}</h3>
          <p>${record.qualityCopy || 'The archive preserves this battle.'}</p>
          <div class="record-meta"><span>${formatDate(record.createdAt)}</span><span>${record.moves?.length || 0} PLY</span><span>${record.reason ? record.reason.toUpperCase() : (record.result || 'COMPLETE').toUpperCase()}</span></div>
        </div>
        <button class="action-button record-open" type="button" data-record-id="${record.id}">VIEW RECORD <span>↗</span></button>`;
      list.appendChild(article);
    });

    list.querySelectorAll('.record-open').forEach((button) => button.addEventListener('click', () => openRecord(button.dataset.recordId)));
  }

  function buildRecordModal() {
    if (document.getElementById('recordViewer')) return;
    const shell = document.createElement('div');
    shell.className = 'modal-shell record-viewer-shell';
    shell.id = 'recordViewer';
    shell.hidden = true;
    shell.innerHTML = `
      <div class="record-viewer" role="dialog" aria-modal="true" aria-labelledby="recordViewerTitle">
        <header class="record-viewer-head"><div><span class="section-kicker">THE HALL OF RECORDS</span><h2 id="recordViewerTitle">BATTLE RECORD</h2></div><button class="close-modal" id="recordViewerClose" type="button">×</button></header>
        <div class="record-detail-summary" id="recordDetailSummary"></div>
        <div class="record-detail-grid"><div><span class="record-detail-label">MOVE HISTORY</span><div class="record-detail-moves" id="recordDetailMoves"></div></div><div><span class="record-detail-label">KEY MOMENTS</span><div class="record-detail-events" id="recordDetailEvents"></div></div></div>
      </div>`;
    document.body.appendChild(shell);
    shell.querySelector('#recordViewerClose').addEventListener('click', () => { shell.hidden = true; });
    shell.addEventListener('click', (event) => { if (event.target === shell) shell.hidden = true; });
  }

  function openRecord(id) {
    const record = readRecords().find((item) => item.id === id);
    if (!record) return;
    buildRecordModal();
    const shell = document.getElementById('recordViewer');
    const summary = document.getElementById('recordDetailSummary');
    const movesHost = document.getElementById('recordDetailMoves');
    const eventsHost = document.getElementById('recordDetailEvents');
    summary.innerHTML = `
      <div><span>RESULT</span><strong>${record.result.toUpperCase()}</strong></div>
      <div><span>MODE</span><strong>${record.mode === 'crown' ? `CROWN · ${String(record.difficulty).toUpperCase()}` : 'TWO PLAYER'}</strong></div>
      <div><span>LENGTH</span><strong>${record.moves?.length || 0} PLY</strong></div>
      <div><span>DATE</span><strong>${formatDate(record.createdAt)}</strong></div>`;
    movesHost.replaceChildren();
    const moves = record.moves || [];
    for (let i = 0; i < moves.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'record-move-row';
      row.innerHTML = `<span>${String(Math.floor(i / 2) + 1).padStart(2, '0')}</span><b>${moves[i]?.san || ''}</b><b>${moves[i + 1]?.san || ''}</b>`;
      movesHost.appendChild(row);
    }
    eventsHost.replaceChildren();
    (record.events || []).filter((event) => event.severity >= 3).forEach((event) => {
      const item = document.createElement('article');
      item.className = 'record-event';
      item.innerHTML = `<span>${String(event.ply).padStart(2, '0')}</span><div><small>${event.kicker}</small><strong>${event.title}</strong><p>${event.narration || event.copy || ''}</p></div>`;
      eventsHost.appendChild(item);
    });
    if (!(record.events || []).some((event) => event.severity >= 3)) eventsHost.innerHTML = '<p class="records-empty-copy">No major Crown events were recorded.</p>';
    shell.hidden = false;
    state.selectedId = id;
  }

  function watchResult() {
    if (!resultOverlay) return;
    const observer = new MutationObserver(() => {
      if (!resultOverlay.hidden && !resultOverlay.dataset.recorded) {
        resultOverlay.dataset.recorded = '1';
        const title = document.getElementById('resultTitle')?.textContent.trim() || 'THE BATTLE';
        const badge = document.getElementById('resultBadge')?.textContent.trim() || '';
        const copy = document.getElementById('resultCopy')?.textContent.trim() || '';
        const result = badge.startsWith('WHITE') ? 'win' : badge.startsWith('BLACK') ? 'loss' : 'draw';
        let events = [];
        try { events = JSON.parse(localStorage.getItem('black-crown-current-events') || '[]'); } catch {}
        recordCompletedBattle({
          result,
          reason: badge.includes('DRAW') ? badge.replace(/^DRAW\s*·\s*/i, '') : 'Finished',
          mode: localStorage.getItem('black-crown-match-mode') || 'crown',
          difficulty: localStorage.getItem('black-crown-difficulty') || 'crown',
          winner: result === 'win' ? 'WHITE' : result === 'loss' ? 'BLACK' : null,
          quality: title,
          qualityCopy: copy,
          title,
          matchEvents: events,
          moves: []
        });
        renderLandingRecords();
      }
    });
    observer.observe(resultOverlay, { attributes: true, attributeFilter: ['hidden'] });
  }

  injectLandingSection();
  buildRecordModal();
  watchResult();
  window.addEventListener('storage', renderLandingRecords);
  window.blackCrownRecords = { readRecords, saveRecords, recordCompletedBattle, renderLandingRecords, openRecord };
})();
