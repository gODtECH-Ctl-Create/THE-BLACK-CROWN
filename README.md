# ♛ THE BLACK CROWN

> **Every square is a throne. Take one.**
>
> A gothic chess arena where the board is the protagonist and every move leaves evidence.

<p align="center">
  <img src="assets/black-crown-gameplay.gif" alt="Animated gameplay of The Black Crown: pieces moving across the board while the match chronicle updates" width="100%" />
</p>

<div align="center">

**[PLAY THE ARENA](https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN)** · **[OPEN THE SOURCE](https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN/tree/main)** · **[VIEW THE BUILD](https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN/pull/1)**

</div>

---

## Watch the game happen

This README is built like a **visual documentary**, not a plain project description.

The animation above is a real gameplay sequence. Pieces move through an opening, the position changes from scene to scene, and the chronicle records the match beside the board.

The README uses a **Graphics Interchange Format (GIF)** for the live gameplay showcase because GitHub renders animated GIFs in Markdown. The Scalable Vector Graphics (SVG) files remain available for static visual scenes and design documentation.

### Scene I · The board awakens

<p align="center"><img src="assets/black-crown-gameplay.gif" alt="The board awakening as a chess game is played" width="82%" /></p>

Select a piece. Consequences appear before commitment. A move lands. The next position becomes the next scene.

### Scene II · The chronicle remembers

The move list is treated as evidence rather than a dashboard widget. Captures, checks, position state and the latest action remain close to the board.

### Scene III · The Crown thinks

The optional Black opponent evaluates legal moves using a lightweight heuristic. The same visual contract can later sit on top of a stronger chess engine.

**AI** means **Artificial Intelligence**.

---

## What is alive

| System | Experience |
| --- | --- |
| ♟ **Real chess rules** | Legal moves, check, checkmate, draws, castling, promotion, en passant and history through Chess.js. |
| ♛ **Crown AI** | Optional Black opponent with tactical, material and central-control heuristics. |
| ◈ **Move theatre** | Selection, legal targets, landing motion, captures and check state are visually distinct. |
| ◌ **The Chronicle** | Move log, captures, checks and board state stay visible. |
| ↻ **Board flip** | Reverse orientation without restarting the match. |
| ⌂ **Local memory** | The current position survives refresh in browser storage. |
| ◒ **Atmosphere** | Grain, dust, layered shadows, archival typography and Web Audio cues. |
| 📱 **Responsive UI** | The composition adapts to small screens without becoming a compressed desktop dashboard. |

---

## Architecture

```text
                         THE BLACK CROWN
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
        PRESENTATION                           GAME CORE
     index.html + CSS                            app.js
             │                                     │
      ┌──────┼──────┐                 ┌───────────┼───────────┐
      ▼      ▼      ▼                 ▼           ▼           ▼
   layout  motion  mood            Chess.js   local state   audio
                                        │
                                        ▼
                               legal position state
```

The current foundation is deliberately static and dependency-light. The chess rules engine is loaded as a pinned ECMAScript Module (ESM), and the position is saved as Forsyth-Edwards Notation (FEN).

---

## Run it locally

```bash
git clone https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN.git
cd THE-BLACK-CROWN
python3 -m http.server 4173
```

Open `http://localhost:4173`.

---

## Project map

```text
THE-BLACK-CROWN/
├── index.html
├── styles.css
├── app.js
├── favicon.svg
├── assets/
│   ├── black-crown-gameplay.gif   ← live gameplay showcase
│   ├── black-crown-demo.svg       ← static visual identity artwork
│   ├── 01-board-awakens.svg       ← static scene artwork
│   ├── 02-chronicle.svg           ← static scene artwork
│   └── 03-crown-ai.svg            ← static scene artwork
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

---

## Design doctrine

**The board wins.** The surrounding interface frames decisions instead of competing with them.

**Motion has meaning.** Hover, selection, movement, capture, check and checkmate should never feel identical.

**Information feels discovered.** The move log is a chronicle. Captures are evidence. Player state is ritual.

**Darkness has texture.** Warm paper tones, muted metal, restrained red and deep shadows create the material world.

**The interface is a stage.** Desktop, mobile, local play and future multiplayer should all feel like different rooms inside the same universe.

---

## Roadmap

### Act II · Make the game dangerous

- proper drag-and-drop movement
- promotion choice chamber
- chess clocks with pressure states
- stronger Crown AI with personality levels
- opening recognition
- cinematic replay mode
- named local game saves

### Act III · Build the arena

- online rooms
- private match links
- friend invites
- spectator mode
- reconnect and resume
- persistent player profiles
- server-authoritative move validation

### Act IV · Build the mythology

- themed boards and piece sets
- reactive soundscape
- achievements and match history
- opening repertoire
- cinematic checkmate sequences
- shareable match stories
- richer README and social replay exports

---

## Status

**Foundation build · playable · under active development**

The repository began as a one-line README. It now contains the first playable Black Crown arena, a responsive gothic interface, local game persistence, an optional Artificial Intelligence opponent, deployment wiring, and a live animated gameplay showcase designed specifically for GitHub.

> **Built for experimentation. Designed to grow teeth.**
