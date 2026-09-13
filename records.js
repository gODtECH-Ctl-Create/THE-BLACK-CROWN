/* THE BLACK CROWN · Hall of Records */
(() => {
  const RECORDS_KEY = 'black-crown-records';
  const screen = document.getElementById('entranceScreen');
  const resultOverlay = document.getElementById('resultOverlay');
  if (!screen || !resultOverlay) return;

  const readRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  };

  const saveRecords = (records) => localStorage.setItem(RECORDS_KEY, JSON.stringify(records.slice(0, 50)));

  const formatDate = (iso) => {
    try {
      return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch {
      return 'UNKNOWN DATE';
    }
  };

  function getSavedBattle() {
    try { return JSON.parse(localStorage.getItem('black-crown-save') || 'null'); } catch { return null; }
  }

  function recordCompletedBattle() {
    const save = getSavedBattle();
    if (!save?.moves?.length) return;
    const existing = readRecords();
    const last = existing[0];
    const finalMove = save.moves.at(-1);
    if (last?.moves?.length === save.moves.length && last?.moves?.at(-1)?.from === finalMove?.from && last?.moves?.at(-1)?.to === finalMove?.to) return;

    const badge = document.getElementById('resultBadge')?.textContent.trim() || '';
    const title = document.getElementById('resultTitle')?.textContent.trim() || 'THE BATTLE';
    const copy = document.getElementById('resultCopy')?.textContent.trim() || 'The archive preserves this battle.';
    const events = Array.isArray(save.matchEvents) ? save.matchEvents : [];
    const result = badge.startsWith('WHITE') ? 'win' : badge.startsWith('BLACK') ? 'loss' : 'draw';
    const record = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      result,
      reason: badge.includes('DRAW') ? badge.replace(/^DRAW\s*·\s*/i, '') : result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw',
      mode: save.ai === false ? 'two-player' : 'crown',
      difficulty: save.difficulty || localStorage.getItem('black-crown-difficulty') || 'crown',
      title,
      qualityCopy: copy,
      moves: save.moves,
      events,
    };
    existing.unshift(record);
    saveRecords(existing);
    renderLandingRecords();
  }

  function injectLandingSection() {
    if (screen.querySelector('#records')) return;
    const nav = screen.querySelector('.landing-nav-links');
    const playLink = nav?.querySelector('.landing-nav-play');
    playLink?.insertAdjacentHTML('beforebegin', '<a href="#records">HALL OF RECORDS</a>');
    const footer = screen.querySelector('.landing-final');
    if (!footer) return;

    const section = document.createElement('section');
    section.className = 'landing-section records-section';
    section.id = 'records';
    section.innerHTML = `
      <div class="landing-section-heading">
        <span class="landing-kicker">THE ARCHIVE</span>
        <h2>THE HALL OF RECORDS.</h2>
        <p>Every finished battle leaves evidence. Your victories, defeats, draws and decisive moments remain here on this device.</p>
      </div>
      <div class="records-summary" id="recordsSummary"></div>
      <div class="records-list" id="recordsList"></div>`;
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
          <div class="record-meta"><span>${formatDate(record.createdAt)}</span><span>${record.moves?.length || 0} PLY</span><span>${record.reason.toUpperCase()}</span></div>
        </div>
        <button class="action-button record-open" type="button" data-record-id="${record.id}">VIEW RECORD <span>↗</span></button>`;
      list.appendChild(article);
    });

    list.querySelectorAll('.record-open').forEach((button) => button.addEventListener('click', () => openRecord(button.dataset.recordId)));
  }

  function buildViewer() {
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
    buildViewer();
    document.getElementById('recordDetailSummary').innerHTML = `
      <div><span>RESULT</span><strong>${record.result.toUpperCase()}</strong></div>
      <div><span>MODE</span><strong>${record.mode === 'crown' ? `CROWN · ${String(record.difficulty).toUpperCase()}` : 'TWO PLAYER'}</strong></div>
      <div><span>LENGTH</span><strong>${record.moves?.length || 0} PLY</strong></div>
      <div><span>DATE</span><strong>${formatDate(record.createdAt)}</strong></div>`;
    const movesHost = document.getElementById('recordDetailMoves');
    movesHost.replaceChildren();
    for (let i = 0; i < (record.moves?.length || 0); i += 2) {
      const white = record.moves[i];
      const black = record.moves[i + 1];
      const move = document.createElement('div');
      move.className = 'record-move-row';
      move.innerHTML = `<span>${String(Math.floor(i / 2) + 1).padStart(2, '0')}</span><b>${white?.san || `${white?.from || ''}-${white?.to || ''}`}</b><b>${black?.san || `${black?.from || ''}-${black?.to || ''}`}</b>`;
      movesHost.appendChild(move);
    }
    const eventsHost = document.getElementById('recordDetailEvents');
    eventsHost.replaceChildren();
    (record.events || []).filter((event) => event.severity >= 3).forEach((event) => {
      const item = document.createElement('article');
      item.className = 'record-event';
      item.innerHTML = `<span>${String(event.ply).padStart(2, '0')}</span><div><small>${event.kicker}</small><strong>${event.title}</strong><p>${event.narration || event.copy || ''}</p></div>`;
      eventsHost.appendChild(item);
    });
    if (!(record.events || []).some((event) => event.severity >= 3)) eventsHost.innerHTML = '<p class="records-empty-copy">No major Crown events were recorded.</p>';
    document.getElementById('recordViewer').hidden = false;
  }

  function watchResult() {
    let lastHidden = resultOverlay.hidden;
    const check = () => {
      const current = resultOverlay.hidden;
      if (lastHidden && !current) recordCompletedBattle();
      lastHidden = current;
      window.requestAnimationFrame(check);
    };
    check();
  }

  injectLandingSection();
  buildViewer();
  watchResult();
  window.addEventListener('storage', renderLandingRecords);
  window.blackCrownRecords = { readRecords, saveRecords, renderLandingRecords, openRecord };
})();
