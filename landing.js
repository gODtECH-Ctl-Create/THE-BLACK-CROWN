/* THE BLACK CROWN · Cinematic landing content */

(() => {
  const screen = document.getElementById('entranceScreen');
  if (!screen) return;

  const heroSquares = Array.from({ length: 64 }, () => '<span class="hero-square"></span>').join('');

  screen.innerHTML = `
    <nav class="landing-nav" aria-label="Main navigation">
      <a class="landing-brand" href="#top" aria-label="The Black Crown home">
        <span class="landing-brand-mark">♛</span>
        <span class="landing-brand-copy">
          <span>gODtECH</span>
          <strong>THE BLACK CROWN</strong>
        </span>
      </a>
      <div class="landing-nav-links">
        <a href="#the-world">THE WORLD</a>
        <a href="#events">CROWN EVENTS</a>
        <a href="#chronicle">THE CHRONICLE</a>
        <a href="#creator">CREATOR</a>
        <a class="landing-nav-play" href="#play">PLAY</a>
      </div>
    </nav>

    <div id="top" class="landing-hero">
      <div class="landing-hero-grid">
        <div>
          <span class="landing-kicker">A CHESS EXPERIENCE FROM THE DARK</span>
          <h1 class="landing-title">THE BLACK<em>CROWN</em></h1>
          <p class="landing-lead">Chess is familiar. This is what happens when the board becomes a world, important moves become events, and every completed battle leaves behind a story.</p>
          <div class="landing-actions" id="play">
            <button class="landing-primary enter-button" id="enterGameBtn" type="button"><span>PLAY THE GAME</span><span>↗</span></button>
            <a class="landing-secondary" href="#the-world">DISCOVER THE WORLD</a>
          </div>
          <div class="landing-facts" aria-label="Game highlights">
            <div class="landing-fact"><strong>STANDARD CHESS</strong><span>REAL LEGAL RULES</span></div>
            <div class="landing-fact"><strong>CROWN EVENTS</strong><span>SPECIAL MOMENTS REACT</span></div>
            <div class="landing-fact"><strong>THE CHRONICLE</strong><span>YOUR GAME BECOMES A STORY</span></div>
          </div>
        </div>

        <div class="hero-visual" aria-label="Animated Black Crown chess board preview">
          <div class="hero-aura"></div>
          <div class="hero-board-card">
            <div class="hero-board">
              ${heroSquares}
              <span class="hero-piece dark p1">♛</span>
              <span class="hero-piece p2">♞</span>
              <span class="hero-piece dark p3">♜</span>
              <span class="hero-piece p4">♙</span>
              <span class="hero-scan"></span>
              <span class="hero-label">THE BOARD REMEMBERS</span>
            </div>
          </div>
          <div class="hero-stamp">LIVE VISUAL PREVIEW<br />EVERY MOVE LEAVES A MARK</div>
        </div>
      </div>
    </div>

    <section class="landing-section" id="the-world">
      <div class="landing-section-heading">
        <span class="landing-kicker">WHY THIS GAME EXISTS</span>
        <h2>Not another chessboard.</h2>
        <p>The rules stay sacred. The experience does not have to stay ordinary. THE BLACK CROWN is built around the feeling that a chess game is a small war: every position carries tension, every sacrifice changes the story, and the ending deserves to be remembered.</p>
      </div>
      <div class="why-grid">
        <article class="why-card" data-index="01">
          <span>THE WORLD REACTS</span>
          <div class="why-glyph">✦</div>
          <h3>Important moves have weight.</h3>
          <p>Checks, checkmates, special moves and major captures can trigger visual and audio reactions instead of disappearing into a move list.</p>
        </article>
        <article class="why-card" data-index="02">
          <span>THE MOMENT MATTERS</span>
          <div class="why-glyph">♛</div>
          <h3>The Crown notices.</h3>
          <p>A queen falling to a pawn is not treated like an ordinary capture. Rare moves and turning points are given their own visual language.</p>
        </article>
        <article class="why-card" data-index="03">
          <span>THE GAME REMEMBERS</span>
          <div class="why-glyph">◒</div>
          <h3>Every battle leaves a chronicle.</h3>
          <p>At the end, the move history can become a narrative of the battle, from its opening pressure to its final consequence.</p>
        </article>
      </div>
    </section>

    <section class="landing-section" id="events">
      <div class="landing-section-heading">
        <span class="landing-kicker">CROWN EVENTS</span>
        <h2>When something happens, the board reacts.</h2>
        <p>Ordinary moves stay restrained. Exceptional moments earn spectacle. The visual system is designed to make the difference feel immediately obvious.</p>
      </div>
      <div class="event-showcase">
        <div class="event-stage-card" aria-label="Animated pawn captures queen preview">
          <div class="event-mini-board">
            <span class="event-pawn">♙</span>
            <span class="event-queen">♛</span>
            <span class="event-burst"></span>
            <span class="event-impact"></span>
          </div>
        </div>
        <div class="event-copy">
          <h3>PAWN TAKES QUEEN.</h3>
          <p>The pawn rises into the strike, the queen braces, the collision lands, and the capture bursts across the board. The effect is not there to explain the rules. It is there to make the moment <em>felt</em>.</p>
          <div class="event-list">
            <span>CHECK</span><span>CHECKMATE</span><span>QUEEN CAPTURE</span><span>CASTLING</span><span>EN PASSANT</span><span>PROMOTION</span>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-section" id="chronicle">
      <div class="landing-section-heading">
        <span class="landing-kicker">THE STORY BEHIND THE GAME</span>
        <h2>Every game starts the same. No two endings do.</h2>
      </div>
      <div class="story-grid">
        <div class="story-quote">
          <span>THE IDEA</span>
          <p>What if chess did not simply finish, but left behind evidence of how the battle was fought?</p>
        </div>
        <div class="story-steps">
          <div class="story-step"><b>01</b><div><h4>ENTER THE WORLD</h4><p>You begin in a dark archive rather than a plain game menu. The Crown is introduced before the first move.</p></div></div>
          <div class="story-step"><b>02</b><div><h4>CHOOSE YOUR BATTLE</h4><p>Play locally with two players, or face the Crown with a chosen level of strength.</p></div></div>
          <div class="story-step"><b>03</b><div><h4>MAKE YOUR MARK</h4><p>Move, capture, sacrifice, threaten, defend. Important moments can awaken the Crown Event system.</p></div></div>
          <div class="story-step"><b>04</b><div><h4>READ WHAT REMAINS</h4><p>When the battle ends, the Chronicle turns the completed match into a record of what mattered.</p></div></div>
        </div>
      </div>
    </section>

    <section class="landing-section" id="creator">
      <div class="landing-section-heading">
        <span class="landing-kicker">MEET THE CREATOR</span>
        <h2>A game built as an experiment in product, code and atmosphere.</h2>
      </div>
      <div class="creator-panel">
        <div class="creator-seal" aria-hidden="true"></div>
        <div class="creator-copy">
          <span class="creator-kicker">AYO RICHARD ABE</span>
          <h3>Product-minded builder · Software developer · Tech innovator</h3>
          <p>THE BLACK CROWN is an exploration of what happens when software engineering, product thinking and visual storytelling are pushed into the same small experience.</p>
          <div class="creator-signature">A SMALL BOARD. A LARGER WORLD.</div>
        </div>
        <a class="creator-link" href="https://github.com/gODtECH-Ctl-Create" target="_blank" rel="noreferrer">VISIT GITHUB PROFILE ↗</a>
      </div>
    </section>

    <section class="landing-final">
      <span class="landing-kicker">THE BOARD IS WAITING</span>
      <h2>Enter the Crown.</h2>
      <p>Choose your battle. Make your first move. Give the archive something worth remembering.</p>
      <button class="landing-primary enter-button" id="landingFinalPlay" type="button"><span>PLAY THE GAME</span><span>↗</span></button>
    </section>

    <footer class="landing-footer">
      <span>THE BLACK CROWN · STANDARD CHESS · LOCAL ARENA</span>
      <a href="https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN" target="_blank" rel="noreferrer">SOURCE ↗</a>
    </footer>
  `;

  const primaryPlay = screen.querySelector('#enterGameBtn');
  const finalPlay = screen.querySelector('#landingFinalPlay');
  finalPlay?.addEventListener('click', () => primaryPlay?.click());

  screen.querySelectorAll('.landing-nav-play').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      primaryPlay?.click();
    });
  });
})();
