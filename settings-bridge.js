/* THE BLACK CROWN · Settings bridge */
(() => {
  window.addEventListener('black-crown-settings-changed', (event) => {
    const nextDifficulty = event.detail?.difficulty;
    const gameScreen = document.getElementById('gameScreen');
    if (!nextDifficulty || !gameScreen?.hidden) return;

    window.setTimeout(() => {
      const option = document.querySelector(`.difficulty-level[data-difficulty="${CSS.escape(nextDifficulty)}"]`);
      option?.click();
    }, 0);
  });
})();
