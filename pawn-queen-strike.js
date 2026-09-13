/* THE BLACK CROWN · Pawn takes Queen cinematic strike */

(() => {
  const body = document.body;
  const caption = document.getElementById('eventCaption');
  const captionTitle = document.getElementById('eventCaptionTitle');
  const captionCopy = document.getElementById('eventCaptionCopy');
  const eventFx = document.getElementById('eventFx');

  if (!body || !caption || !captionTitle || !captionCopy || !eventFx) return;

  let active = false;
  let timer = 0;

  function isPawnTakingQueen() {
    if (!caption.classList.contains('show')) return false;
    const title = captionTitle.textContent.trim().toUpperCase();
    const copy = captionCopy.textContent.trim();
    return (
      (title === 'THE CROWN IS TAKEN' || title === 'THE PAWN STRIKES THE QUEEN') &&
      /\bPawn\b/.test(copy) &&
      /\bQueen\b/.test(copy)
    );
  }

  function clear() {
    if (timer) window.clearTimeout(timer);
    eventFx.querySelectorAll('.pawn-queen-assault').forEach((node) => node.remove());
    body.removeAttribute('data-pawn-queen-strike');
    active = false;
  }

  function buildAssault() {
    clear();

    const scene = document.createElement('div');
    scene.className = 'pawn-queen-assault';
    scene.setAttribute('aria-hidden', 'true');

    const pawn = document.createElement('div');
    pawn.className = 'strike-pawn';
    pawn.textContent = /^Black/i.test(captionCopy.textContent.trim()) ? '♟' : '♙';

    const queen = document.createElement('div');
    queen.className = 'strike-queen';
    queen.textContent = '♛';

    const impact = document.createElement('div');
    impact.className = 'strike-impact';

    const ring = document.createElement('div');
    ring.className = 'strike-ring';

    scene.append(pawn, queen, impact, ring);

    for (let index = 0; index < 14; index += 1) {
      const spark = document.createElement('i');
      spark.className = 'strike-spark';
      const angle = Math.round((360 / 14) * index + (Math.random() * 14 - 7));
      const distance = 35 + Math.random() * 75;
      spark.style.setProperty('--spark-angle', `${angle}deg`);
      spark.style.setProperty('--spark-distance', `${distance}px`);
      spark.style.setProperty('--spark-delay', `${420 + Math.random() * 100}ms`);
      scene.appendChild(spark);
    }

    eventFx.appendChild(scene);
    body.dataset.pawnQueenStrike = 'active';
    active = true;

    timer = window.setTimeout(() => {
      if (active) clear();
    }, 1250);
  }

  function sync() {
    if (isPawnTakingQueen()) {
      if (!active) buildAssault();
      return;
    }
    if (active) clear();
  }

  const observer = new MutationObserver(sync);
  observer.observe(caption, { attributes: true, childList: true, subtree: true });
  sync();
})();
