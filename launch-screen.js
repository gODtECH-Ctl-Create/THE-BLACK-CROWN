/* THE BLACK CROWN · app launch sequence */
(() => {
  const launch = document.createElement('div');
  launch.className = 'launch-shell';
  launch.hidden = true;
  launch.setAttribute('aria-hidden', 'true');
  launch.innerHTML = `
    <div class="launch-noise" aria-hidden="true"></div>
    <div class="launch-card" role="status" aria-live="polite">
      <div class="launch-mark">♛</div>
      <span class="launch-kicker">THE BLACK CROWN</span>
      <h1 class="launch-title">ENTERING <em>THE CHAMBER</em></h1>
      <div class="launch-status" id="launchStatus">AWAKENING THE BOARD</div>
      <div class="launch-progress" aria-hidden="true"><i></i></div>
      <div class="launch-lines" aria-hidden="true"><span class="launch-line active">BOARD</span><span class="launch-line">CROWN</span><span class="launch-line">CHRONICLE</span></div>
    </div>`;
  document.body.appendChild(launch);

  const status = launch.querySelector('#launchStatus');
  const lines = [...launch.querySelectorAll('.launch-line')];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function open() {
    if (!launch.hidden) return;
    launch.hidden = false;
    launch.classList.remove('leaving');
    launch.setAttribute('aria-hidden', 'false');
    document.body.classList.add('launch-open');
    const messages = ['AWAKENING THE BOARD', 'CALLING THE CROWN', 'OPENING THE CHRONICLE'];
    let index = 0;
    status.textContent = messages[0];
    lines.forEach((line, lineIndex) => line.classList.toggle('active', lineIndex === 0));
    const interval = window.setInterval(() => {
      index += 1;
      if (index >= messages.length) return window.clearInterval(interval);
      status.textContent = messages[index];
      lines.forEach((line, lineIndex) => line.classList.toggle('active', lineIndex === index));
    }, 420);
  }

  function close() {
    launch.classList.add('leaving');
    const delay = prefersReduced.matches ? 60 : 450;
    window.setTimeout(() => {
      launch.hidden = true;
      launch.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('launch-open');
    }, delay);
  }

  window.blackCrownLaunch = { open, close };
})();
