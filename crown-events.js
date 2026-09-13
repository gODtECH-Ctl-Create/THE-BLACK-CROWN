/* THE BLACK CROWN · Phase 2 Crown Event director */

(() => {
  const body = document.body;
  const caption = document.getElementById('eventCaption');
  const captionTitle = document.getElementById('eventCaptionTitle');
  const captionKicker = document.getElementById('eventCaptionKicker');
  const eventFx = document.getElementById('eventFx');

  if (!caption || !captionTitle || !captionKicker || !eventFx) return;

  const titleMap = [
    ['THE QUEEN FALLS', 'queen-hunt', '♛'],
    ['THE CROWN IS TAKEN', 'queen-capture', '♛'],
    ['THE ROOK FALLS', 'heavy-capture', '♜'],
    ['THE BISHOP FALLS', 'heavy-capture', '♗'],
    ['THE FORTRESS TURNS', 'castle', '♜'],
    ['THE SHADOW CAPTURE', 'en-passant', '♟'],
    ['THE PAWN BECOMES CROWN', 'promotion', '♛'],
    ['THE UNEXPECTED CROWN', 'underpromotion', '♞'],
    ['THE KING IS HUNTED', 'major-check', '♚'],
    ['THE FINAL BLOW', 'checkmate', '♛'],
    ['CHECK', 'check', '✦'],
  ];

  let lastEventKey = '';
  let clearTimer = 0;
  let audioContext = null;

  function detectEvent() {
    const title = captionTitle.textContent.trim().toUpperCase();
    const match = titleMap.find(([label]) => title === label);
    if (match) return { type: match[1], glyph: match[2], title };

    const kicker = captionKicker.textContent.trim().toUpperCase();
    if (kicker === 'PROMOTION') return { type: 'promotion', glyph: '♛', title };
    if (kicker === 'UNDERPROMOTION') return { type: 'underpromotion', glyph: '♞', title };
    if (kicker === 'CHECKMATE') return { type: 'checkmate', glyph: '♛', title };
    if (kicker === 'RARE MOVE') return { type: 'en-passant', glyph: '♟', title };
    if (kicker === 'SPECIAL MOVE') return { type: 'castle', glyph: '♜', title };
    if (kicker === 'MAJOR CAPTURE') return { type: 'queen-capture', glyph: '♛', title };
    return null;
  }

  function ensureAudio() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    audioContext ||= new Context();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playEventNote(type) {
    const context = ensureAudio();
    if (!context) return;

    const presets = {
      castle: [260, 0.16, 0.025],
      'en-passant': [235, 0.18, 0.022],
      promotion: [330, 0.24, 0.03],
      underpromotion: [290, 0.30, 0.028],
      'heavy-capture': [120, 0.20, 0.030],
      'queen-capture': [105, 0.27, 0.036],
      'queen-hunt': [85, 0.36, 0.045],
      check: [145, 0.24, 0.028],
      'major-check': [110, 0.32, 0.035],
      checkmate: [55, 0.58, 0.048],
    };

    const [frequency, duration, volume] = presets[type] || [170, 0.16, 0.02];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type === 'checkmate' || type === 'queen-hunt' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(42, frequency * 0.48), context.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.025);
  }

  function createCrest(glyph, type) {
    eventFx.querySelectorAll('.event-crest').forEach((node) => node.remove());
    const crest = document.createElement('div');
    crest.className = `event-crest event-crest-${type}`;
    crest.textContent = glyph;
    crest.setAttribute('aria-hidden', 'true');
    eventFx.appendChild(crest);
  }

  function clearDirector(type) {
    if (clearTimer) window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(() => {
      if (!caption.classList.contains('show')) {
        body.removeAttribute('data-crown-event');
        eventFx.querySelectorAll('.event-crest').forEach((node) => node.remove());
      }
    }, type === 'checkmate' ? 1800 : 950);
  }

  function directEvent() {
    if (!caption.classList.contains('show')) {
      clearDirector(body.dataset.crownEvent || 'event');
      return;
    }

    const event = detectEvent();
    if (!event) return;

    body.dataset.crownEvent = event.type;
    const eventKey = `${event.type}:${captionTitle.textContent}:${captionKicker.textContent}`;
    if (eventKey === lastEventKey) return;
    lastEventKey = eventKey;

    createCrest(event.glyph, event.type);
    playEventNote(event.type);
    clearDirector(event.type);
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === 'attributes' || mutation.type === 'childList')) directEvent();
  });

  observer.observe(caption, { attributes: true, childList: true, subtree: true });
  observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  directEvent();
})();
