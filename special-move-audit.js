/* THE BLACK CROWN · Special Move presentation audit */

(() => {
  const body = document.body;
  const caption = document.getElementById('eventCaption');
  const title = document.getElementById('eventCaptionTitle');
  const kicker = document.getElementById('eventCaptionKicker');
  const copy = document.getElementById('eventCaptionCopy');
  const moveList = document.getElementById('moveList');

  if (!body || !caption || !title || !kicker || !copy || !moveList) return;

  let syncing = false;
  let lastSignature = '';

  const promotionNames = {
    Q: 'Queen',
    R: 'Rook',
    B: 'Bishop',
    N: 'Knight',
  };

  function latestSan() {
    const latest = moveList.querySelectorAll('.move-san.latest');
    return [...latest].map((node) => node.textContent.trim()).filter(Boolean).pop() || '';
  }

  function detectSpecialMove() {
    const eventTitle = title.textContent.trim().toUpperCase();
    const eventKicker = kicker.textContent.trim().toUpperCase();
    const san = latestSan();

    if (eventTitle === 'THE FORTRESS TURNS' || eventKicker === 'SPECIAL MOVE') {
      if (san === 'O-O') return { key: 'castle-kingside', label: 'KINGSIDE CASTLING', copy: 'The King slips toward the kingside while the Rook takes its new post.' };
      if (san === 'O-O-O') return { key: 'castle-queenside', label: 'QUEENSIDE CASTLING', copy: 'The King retreats toward the queenside while the Rook seals the fortress.' };
      return { key: 'castle', label: 'CASTLING', copy: 'The King and Rook complete a coordinated defensive maneuver.' };
    }

    if (eventTitle === 'THE SHADOW CAPTURE' || eventKicker === 'RARE MOVE') {
      return { key: 'en-passant', label: 'EN PASSANT', copy: 'A pawn disappears from its path as the rare capture resolves in a single breath.' };
    }

    const promotionMatch = san.match(/=([QRBN])/);
    if (eventTitle === 'THE PAWN BECOMES CROWN' || eventKicker === 'PROMOTION') {
      const piece = promotionNames[promotionMatch?.[1] || 'Q'] || 'Queen';
      return { key: `promotion-${piece.toLowerCase()}`, label: `${piece.toUpperCase()} PROMOTION`, copy: `The pawn reaches the final rank and rises as a ${piece}.` };
    }

    if (eventTitle === 'THE UNEXPECTED CROWN' || eventKicker === 'UNDERPROMOTION') {
      const piece = promotionNames[promotionMatch?.[1] || 'N'] || 'Knight';
      return { key: `underpromotion-${piece.toLowerCase()}`, label: `${piece.toUpperCase()} UNDERPROMOTION`, copy: `The pawn refuses the obvious crown and becomes a ${piece} instead.` };
    }

    return null;
  }

  function sync() {
    if (syncing) return;
    if (!caption.classList.contains('show')) {
      body.removeAttribute('data-special-move');
      lastSignature = '';
      return;
    }

    const event = detectSpecialMove();
    if (!event) {
      body.removeAttribute('data-special-move');
      return;
    }

    body.dataset.specialMove = event.key;
    const signature = `${event.key}:${latestSan()}`;
    if (signature === lastSignature) return;
    lastSignature = signature;

    syncing = true;
    kicker.textContent = event.label;
    copy.textContent = event.copy;
    syncing = false;
  }

  const observer = new MutationObserver(() => sync());
  observer.observe(caption, { attributes: true, childList: true, subtree: true });
  observer.observe(moveList, { childList: true, subtree: true });
  sync();
})();
