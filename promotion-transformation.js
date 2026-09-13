/* THE BLACK CROWN · Pawn promotion transformation director */

(() => {
  const body = document.body;
  const caption = document.getElementById('eventCaption');
  const captionKicker = document.getElementById('eventCaptionKicker');
  const captionTitle = document.getElementById('eventCaptionTitle');
  const moveList = document.getElementById('moveList');
  const eventFx = document.getElementById('eventFx');

  if (!body || !caption || !captionKicker || !captionTitle || !moveList || !eventFx) return;

  const pieceGlyph = {
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
  };

  let active = false;
  let cleanupTimer = 0;
  let lastSignature = '';
  let hiddenPiece = null;

  function latestSan() {
    const latest = moveList.querySelectorAll('.move-san.latest');
    return [...latest].map((node) => node.textContent.trim()).filter(Boolean).pop() || '';
  }

  function readPromotion() {
    if (!caption.classList.contains('show')) return null;
    const kicker = captionKicker.textContent.trim().toUpperCase();
    if (kicker !== 'PROMOTION' && kicker !== 'UNDERPROMOTION') return null;

    const san = latestSan();
    const match = san.match(/([a-h][18])(?:=?([QRBN]))/i);
    if (!match) return null;

    const destination = match[1].toLowerCase();
    const type = (match[2] || 'Q').toLowerCase();
    const square = document.querySelector(`.square[data-square="${destination}"]`);
    if (!square) return null;

    const promotedPiece = square.querySelector('.piece');
    const isBlack = promotedPiece?.classList.contains('black') || /Black/i.test(caption.textContent);

    return {
      destination,
      type,
      isBlack,
      square,
      promotedPiece,
      piece: pieceGlyph[type]?.[isBlack ? 'b' : 'w'] || (isBlack ? '♛' : '♕'),
      underpromotion: kicker === 'UNDERPROMOTION',
    };
  }

  function restoreHiddenPiece() {
    if (hiddenPiece) {
      hiddenPiece.classList.remove('promotion-piece-hidden');
      hiddenPiece = null;
    }
  }

  function clear() {
    if (cleanupTimer) window.clearTimeout(cleanupTimer);
    eventFx.querySelectorAll('.promotion-transformation').forEach((node) => node.remove());
    restoreHiddenPiece();
    body.removeAttribute('data-promotion-transformation');
    active = false;
  }

  function buildTransformation(promotion) {
    clear();

    hiddenPiece = promotion.promotedPiece;
    hiddenPiece?.classList.add('promotion-piece-hidden');

    const rect = promotion.square.getBoundingClientRect();
    const scene = document.createElement('div');
    scene.className = 'promotion-transformation';
    scene.style.left = `${rect.left + rect.width / 2}px`;
    scene.style.top = `${rect.top + rect.height / 2}px`;
    scene.dataset.promotion = promotion.type;
    scene.dataset.underpromotion = String(promotion.underpromotion);
    scene.setAttribute('aria-hidden', 'true');

    const veil = document.createElement('div');
    veil.className = 'promotion-veil';

    const smoke = document.createElement('div');
    smoke.className = 'promotion-smoke';

    const ringOuter = document.createElement('div');
    ringOuter.className = 'promotion-ring promotion-ring-outer';

    const ringInner = document.createElement('div');
    ringInner.className = 'promotion-ring promotion-ring-inner';

    const sigil = document.createElement('div');
    sigil.className = 'promotion-sigil';
    sigil.textContent = '♛';

    const pawn = document.createElement('div');
    pawn.className = 'promotion-pawn';
    pawn.textContent = promotion.isBlack ? '♟' : '♙';

    const newPiece = document.createElement('div');
    newPiece.className = `promotion-piece ${promotion.underpromotion ? 'is-underpromotion' : ''}`;
    newPiece.textContent = promotion.piece;

    const slash = document.createElement('div');
    slash.className = 'promotion-slash';

    scene.append(veil, smoke, ringOuter, ringInner, sigil, pawn, slash, newPiece);

    for (let index = 0; index < 18; index += 1) {
      const shard = document.createElement('i');
      shard.className = 'promotion-shard';
      const angle = (360 / 18) * index + (Math.random() * 12 - 6);
      const distance = 42 + Math.random() * 82;
      shard.style.setProperty('--shard-angle', `${angle}deg`);
      shard.style.setProperty('--shard-distance', `${distance}px`);
      shard.style.setProperty('--shard-delay', `${360 + Math.random() * 260}ms`);
      scene.appendChild(shard);
    }

    eventFx.appendChild(scene);
    body.dataset.promotionTransformation = promotion.type;
    active = true;

    cleanupTimer = window.setTimeout(() => {
      if (active) clear();
    }, 1850);
  }

  function sync() {
    const promotion = readPromotion();
    if (!promotion) {
      if (active) clear();
      lastSignature = '';
      return;
    }

    const signature = `${promotion.destination}:${promotion.type}:${promotion.underpromotion}`;
    if (signature === lastSignature) return;
    lastSignature = signature;
    buildTransformation(promotion);
  }

  const observer = new MutationObserver(sync);
  observer.observe(caption, { attributes: true, childList: true, subtree: true });
  observer.observe(moveList, { childList: true, subtree: true });
  window.addEventListener('resize', () => {
    if (active) sync();
  }, { passive: true });

  sync();
})();
