/* THE BLACK CROWN · Settings chamber */
(() => {
  const SETTINGS_KEY = 'black-crown-settings';
  const defaults = { sound: 'on', volume: 50, reducedMotion: 'system', events: 'full', coordinates: true, confirmNewGame: false };
  const read = () => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
    catch { return { ...defaults }; }
  };
  const write = (next) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  const apply = (next) => {
    document.documentElement.dataset.events = next.events;
    document.documentElement.dataset.coordinates = next.coordinates ? 'on' : 'off';
    document.documentElement.dataset.motion = next.reducedMotion;
    const volume = Math.max(0, Math.min(100, Number(next.volume) || 0));
    localStorage.setItem('black-crown-sound-enabled', next.sound === 'on' ? 'on' : 'off');
    localStorage.setItem('black-crown-sound-volume', String(volume));
    const difficulty = localStorage.getItem('black-crown-difficulty') || 'crown';
    window.dispatchEvent(new CustomEvent('black-crown-settings-changed', { detail: { ...next, volume, difficulty } }));
  };

  let settings = read();
  apply(settings);

  const screen = document.getElementById('entranceScreen');
  if (!screen || document.getElementById('settingsOverlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'settings-shell';
  overlay.id = 'settingsOverlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="settings-page" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <header class="settings-head">
        <div><span class="landing-kicker">THE BLACK CROWN</span><h2 id="settingsTitle">SETTINGS</h2></div>
        <button class="settings-close" id="settingsClose" type="button" aria-label="Close settings">×</button>
      </header>
      <div class="settings-grid">
        <section class="settings-card"><span class="landing-kicker">AUDIO</span><h3>THE SOUND OF THE BATTLE</h3><p>Control the game's audible presence without changing the visual experience.</p>
          <div class="settings-row"><div class="settings-row-copy"><strong>Game sound</strong><span>Moves, captures, checks, special events and interface cues.</span></div><label class="settings-switch settings-control"><input id="settingsSound" type="checkbox"><span class="settings-switch-ui"></span></label></div>
          <div class="settings-row"><div class="settings-row-copy"><strong>Volume</strong><span>Controls the master game sound level.</span></div><input id="settingsVolume" class="settings-range settings-control" type="range" min="0" max="100" step="5"></div>
        </section>
        <section class="settings-card"><span class="landing-kicker">VISUALS</span><h3>THE ATMOSPHERE</h3><p>Fine-tune how intense the Crown feels while preserving the core identity.</p>
          <div class="settings-row"><div class="settings-row-copy"><strong>Motion</strong><span>System, full animation, or reduced motion.</span></div><select id="settingsMotion" class="settings-select settings-control"><option value="system">System</option><option value="full">Full</option><option value="reduced">Reduced</option></select></div>
          <div class="settings-row"><div class="settings-row-copy"><strong>Crown Event intensity</strong><span>Choose how strongly exceptional moments appear.</span></div><select id="settingsEvents" class="settings-select settings-control"><option value="full">Full</option><option value="reduced">Reduced</option><option value="minimal">Minimal</option></select></div>
          <div class="settings-row"><div class="settings-row-copy"><strong>Board coordinates</strong><span>Show file and rank labels around the board.</span></div><label class="settings-switch settings-control"><input id="settingsCoordinates" type="checkbox"><span class="settings-switch-ui"></span></label></div>
        </section>
        <section class="settings-card"><span class="landing-kicker">GAMEPLAY</span><h3>THE MATCH</h3><p>These preferences apply to future matches.</p>
          <div class="settings-row"><div class="settings-row-copy"><strong>Confirm new game</strong><span>Ask before replacing an active battle.</span></div><label class="settings-switch settings-control"><input id="settingsConfirm" type="checkbox"><span class="settings-switch-ui"></span></label></div>
          <div class="settings-row"><div class="settings-row-copy"><strong>Default Crown difficulty</strong><span>Preselect the level in Match Setup.</span></div><select id="settingsDifficulty" class="settings-select settings-control"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="hard">Hard</option><option value="crown">Crown</option></select></div>
        </section>
        <section class="settings-card settings-danger"><span class="landing-kicker">LOCAL DATA</span><h3>THE ARCHIVE</h3><p>Your games remain on this device. Clearing them cannot be undone.</p>
          <div class="settings-row"><div class="settings-row-copy"><strong>Clear Hall of Records</strong><span>Delete all completed battle records.</span></div><button class="action-button settings-control" id="clearRecords" type="button">CLEAR RECORDS</button></div>
          <div class="settings-row"><div class="settings-row-copy"><strong>Clear saved battle</strong><span>Remove the current in-progress save.</span></div><button class="action-button settings-control" id="clearSave" type="button">CLEAR SAVE</button></div>
        </section>
      </div>
      <footer class="settings-footer"><span>gODtECH · THE BLACK CROWN · SETTINGS</span><button class="action-button primary" id="settingsDone" type="button">DONE <span>↗</span></button></footer>
    </div>`;
  document.body.appendChild(overlay);

  const $ = (id) => overlay.querySelector(`#${id}`);
  const sync = () => {
    $('settingsSound').checked = settings.sound === 'on';
    $('settingsVolume').value = String(settings.volume);
    $('settingsMotion').value = settings.reducedMotion;
    $('settingsEvents').value = settings.events;
    $('settingsCoordinates').checked = Boolean(settings.coordinates);
    $('settingsConfirm').checked = Boolean(settings.confirmNewGame);
    $('settingsDifficulty').value = localStorage.getItem('black-crown-difficulty') || 'crown';
  };
  const save = () => { write(settings); apply(settings); };

  function open() { sync(); overlay.hidden = false; document.body.classList.add('settings-open'); }
  function close() { overlay.hidden = true; document.body.classList.remove('settings-open'); }

  $('settingsSound').addEventListener('change', (event) => { settings.sound = event.target.checked ? 'on' : 'off'; save(); });
  $('settingsVolume').addEventListener('input', (event) => { settings.volume = Number(event.target.value); save(); });
  $('settingsMotion').addEventListener('change', (event) => { settings.reducedMotion = event.target.value; save(); });
  $('settingsEvents').addEventListener('change', (event) => { settings.events = event.target.value; save(); });
  $('settingsCoordinates').addEventListener('change', (event) => { settings.coordinates = event.target.checked; save(); });
  $('settingsConfirm').addEventListener('change', (event) => { settings.confirmNewGame = event.target.checked; save(); });
  $('settingsDifficulty').addEventListener('change', (event) => {
    localStorage.setItem('black-crown-difficulty', event.target.value);
    apply(settings);
  });

  $('clearRecords').addEventListener('click', () => {
    if (!window.confirm('Clear every battle in the Hall of Records?')) return;
    localStorage.removeItem('black-crown-records');
    window.blackCrownRecords?.renderLandingRecords?.();
  });
  $('clearSave').addEventListener('click', () => {
    if (!window.confirm('Clear the saved battle on this device?')) return;
    localStorage.removeItem('black-crown-save');
  });

  $('settingsClose').addEventListener('click', close);
  $('settingsDone').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) close(); });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#newGameBtn');
    if (!button || !settings.confirmNewGame) return;
    if (document.getElementById('gameScreen')?.hidden) return;
    const rawSave = localStorage.getItem('black-crown-save');
    if (!rawSave) return;
    try {
      const saved = JSON.parse(rawSave);
      if (!Array.isArray(saved.moves) || !saved.moves.length) return;
      if (!window.confirm('Start a new battle? The current game will be replaced.')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    } catch {
      // Ignore invalid save data; the game engine handles cleanup.
    }
  }, true);

  document.getElementById('gameSettingsBtn')?.addEventListener('click', open, { once: true });

  window.addEventListener('black-crown-settings-changed', (event) => {
    const nextDifficulty = event.detail?.difficulty;
    if (nextDifficulty) document.documentElement.dataset.defaultDifficulty = nextDifficulty;
  });

  sync();
  window.blackCrownSettings = { open, close, read, save: () => { save(); sync(); } };
})();
