/* THE BLACK CROWN · Obvious game soundscape */
(() => {
  const SOUND_KEY = 'black-crown-sound-enabled';
  let context = null;
  let master = null;
  let muted = localStorage.getItem(SOUND_KEY) === 'off';
  let lastMoveSignature = '';
  let observerTimer = 0;

  const $ = (selector) => document.querySelector(selector);

  function ensureAudio() {
    if (muted) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0.5;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone({ frequency, duration, type = 'sine', gain = 0.12, when = 0, endFrequency }) {
    const audio = ensureAudio();
    if (!audio || !master) return;
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    const start = audio.currentTime + when;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, endFrequency), start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.014, duration * 0.14));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function noise({ duration = 0.09, gain = 0.08, when = 0, filter = 1600 }) {
    const audio = ensureAudio();
    if (!audio || !master) return;
    const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * duration)), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = audio.createBufferSource();
    const filterNode = audio.createBiquadFilter();
    const envelope = audio.createGain();
    const start = audio.currentTime + when;
    source.buffer = buffer;
    filterNode.type = 'lowpass';
    filterNode.frequency.value = filter;
    envelope.gain.setValueAtTime(gain, start);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filterNode).connect(envelope).connect(master);
    source.start(start);
  }

  function play(kind) {
    if (muted) return;
    switch (kind) {
      case 'ui':
        tone({ frequency: 520, duration: 0.055, type: 'square', gain: 0.05, endFrequency: 630 });
        break;
      case 'move':
        tone({ frequency: 165, duration: 0.09, type: 'triangle', gain: 0.16, endFrequency: 98 });
        tone({ frequency: 690, duration: 0.045, type: 'sine', gain: 0.045, when: 0.01, endFrequency: 510 });
        break;
      case 'capture':
        noise({ duration: 0.1, gain: 0.12, filter: 1200 });
        tone({ frequency: 105, duration: 0.2, type: 'triangle', gain: 0.22, endFrequency: 48 });
        break;
      case 'check':
        tone({ frequency: 280, duration: 0.16, type: 'square', gain: 0.12, endFrequency: 360 });
        tone({ frequency: 445, duration: 0.2, type: 'sine', gain: 0.1, when: 0.12, endFrequency: 535 });
        break;
      case 'special':
        tone({ frequency: 210, duration: 0.24, type: 'triangle', gain: 0.11, endFrequency: 340 });
        tone({ frequency: 470, duration: 0.3, type: 'sine', gain: 0.08, when: 0.1, endFrequency: 650 });
        break;
      case 'queen':
        noise({ duration: 0.15, gain: 0.16, filter: 900 });
        tone({ frequency: 305, duration: 0.24, type: 'sawtooth', gain: 0.15, endFrequency: 68 });
        tone({ frequency: 620, duration: 0.32, type: 'sine', gain: 0.1, when: 0.04, endFrequency: 235 });
        tone({ frequency: 88, duration: 0.46, type: 'triangle', gain: 0.14, when: 0.14, endFrequency: 40 });
        break;
      case 'promotion':
        tone({ frequency: 145, duration: 0.42, type: 'sine', gain: 0.08, endFrequency: 380 });
        tone({ frequency: 315, duration: 0.48, type: 'triangle', gain: 0.1, when: 0.15, endFrequency: 760 });
        tone({ frequency: 770, duration: 0.54, type: 'sine', gain: 0.075, when: 0.3, endFrequency: 1000 });
        noise({ duration: 0.11, gain: 0.05, when: 0.54, filter: 2600 });
        break;
      case 'mate':
        tone({ frequency: 128, duration: 0.88, type: 'sawtooth', gain: 0.17, endFrequency: 45 });
        tone({ frequency: 192, duration: 1.0, type: 'sine', gain: 0.11, when: 0.04, endFrequency: 56 });
        tone({ frequency: 288, duration: 0.76, type: 'triangle', gain: 0.085, when: 0.1, endFrequency: 78 });
        noise({ duration: 0.2, gain: 0.1, filter: 520, when: 0.02 });
        break;
      case 'reset':
        tone({ frequency: 360, duration: 0.075, type: 'square', gain: 0.06, endFrequency: 260 });
        tone({ frequency: 215, duration: 0.1, type: 'triangle', gain: 0.065, when: 0.08, endFrequency: 145 });
        break;
      default:
        break;
    }
  }

  function currentMoveSignature() {
    const moveList = $('#moveList');
    if (!moveList) return '';
    const latest = [...moveList.querySelectorAll('.move-san.latest')].map((node) => node.textContent.trim()).join('|');
    return `${moveList.querySelectorAll('.move-san').length}:${latest}`;
  }

  function detectAndPlayMove() {
    const moveList = $('#moveList');
    const statusNode = $('#gameStatus');
    if (!moveList || !statusNode) return;
    const signature = currentMoveSignature();
    if (!signature || signature === lastMoveSignature) return;
    lastMoveSignature = signature;

    const latest = [...moveList.querySelectorAll('.move-san.latest')].map((node) => node.textContent.trim()).filter(Boolean).pop() || '';
    const kicker = $('#eventCaptionKicker')?.textContent.trim() || '';
    const title = $('#eventCaptionTitle')?.textContent.trim() || '';
    const status = statusNode.textContent.trim();

    if (status.includes('CHECKMATE') || latest.includes('#')) return play('mate');
    if (title === 'THE QUEEN FALLS' || title === 'THE CROWN IS TAKEN') return play('queen');
    if (kicker === 'PROMOTION' || kicker === 'UNDERPROMOTION' || latest.includes('=')) return play('promotion');
    if (kicker === 'SPECIAL MOVE' || kicker === 'RARE MOVE' || /^O-O/.test(latest)) return play('special');
    if (status === 'DRAW') return play('special');
    if (latest.includes('+')) return play('check');
    if (latest.includes('x')) return play('capture');
    play('move');
  }

  function installToggle() {
    if ($('#soundControl')) return;
    const host = $('.game-topbar');
    if (!host) return;
    const button = document.createElement('button');
    button.id = 'soundControl';
    button.type = 'button';
    button.className = 'sound-control';
    button.setAttribute('aria-pressed', String(!muted));
    button.title = muted ? 'Turn sound on' : 'Mute game sounds';
    button.innerHTML = `<span class="sound-icon">${muted ? '◌' : '◉'}</span><span class="sound-copy">${muted ? 'SOUND OFF' : 'SOUND ON'}</span>`;
    button.addEventListener('click', () => {
      muted = !muted;
      localStorage.setItem(SOUND_KEY, muted ? 'off' : 'on');
      button.setAttribute('aria-pressed', String(!muted));
      button.title = muted ? 'Turn sound on' : 'Mute game sounds';
      button.querySelector('.sound-icon').textContent = muted ? '◌' : '◉';
      button.querySelector('.sound-copy').textContent = muted ? 'SOUND OFF' : 'SOUND ON';
      if (!muted) play('ui');
    });
    host.appendChild(button);
  }

  function installInteractions() {
    document.addEventListener('pointerdown', (event) => {
      const target = event.target.closest('button, a');
      if (target && target.id !== 'soundControl') {
        ensureAudio();
        play('ui');
      }
    }, { passive: true });
  }

  function boot() {
    installInteractions();
    installToggle();
    const observer = new MutationObserver(() => {
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(detectAndPlayMove, 35);
      installToggle();
    });
    const moveList = $('#moveList');
    const status = $('#gameStatus');
    if (moveList) observer.observe(moveList, { childList: true, subtree: true, characterData: true });
    if (status) observer.observe(status, { childList: true, subtree: true, characterData: true });
    window.setInterval(installToggle, 300);
    window.addEventListener('beforeunload', () => {
      if (context && context.state !== 'closed') context.close();
    }, { once: true });
  }

  boot();
})();
