# ♛ THE BLACK CROWN

> **Every square is a throne. Every move leaves evidence.**
>
> A gothic chess experience by **gODtECH** where the board is the protagonist, important moves leave a mark, and every finished game becomes a story.

<p align="center">
  <img src="assets/black-crown-gameplay.gif" alt="Animated gameplay of The Black Crown" width="100%" />
</p>

<div align="center">

**[ENTER THE REPOSITORY](https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN)** · **[OPEN THE SOURCE](https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN/tree/main)**

</div>

---

## The experience

THE BLACK CROWN is intentionally structured like a game instead of a utility.

```text
ENTRANCE
   ↓
THE CROWN AWAKENS
   ↓
GAME CHAMBER
   ↓
PLAY / THINK / ATTACK
   ↓
CROWN EVENTS
   ↓
CHECKMATE / DRAW
   ↓
THE CHRONICLE
```

The opening screen establishes the world first. The game chamber is a separate space for the board and controls. When the match ends, the archive can tell the story of the battle from the recorded moves.

---

## What is alive

| System | Experience |
| --- | --- |
| ♟ **Real chess rules** | Legal movement, check, checkmate, draws, castling, en passant, promotion and move history through Chess.js. |
| ♛ **Crown AI** | Lightweight Black opponent using material, tactical, central-control and check signals. |
| ◈ **Drag or click play** | Move pieces by selecting squares or dragging pieces into legal targets. |
| ⚔ **Crown Events** | Important chess moments trigger differentiated visual effects instead of every move getting the same animation. |
| ✦ **Special moves** | Castling, en passant, promotion and underpromotion receive their own narrative treatment. |
| ☠ **Major captures** | Queen captures, heavy-piece captures and other material swings can trigger stronger events. |
| 👑 **Promotion Chamber** | A pawn reaching the final rank pauses the match and asks for Queen, Rook, Bishop or Knight. |
| ◌ **The Chronicle** | Every move gets a readable narrative entry, while important moments receive additional story text. |
| ⌂ **Local memory** | The current game, event history, board orientation and opponent setting survive refresh in browser storage. |
| ◒ **Atmosphere** | Fog, grain, dust, layered shadows, engraved UI, responsive typography and Web Audio cues create the material world. |
| 📱 **Responsive chamber** | Desktop and mobile layouts preserve the board as the visual center instead of shrinking it into a dashboard. |

**AI** means **Artificial Intelligence**.

---

## The Crown Event system

The game now treats chess moments as different levels of importance.

```text
NORMAL MOVE
    ↓
CAPTURE
    ↓
SPECIAL MOVE
    ↓
SIGNIFICANT CAPTURE
    ↓
MAJOR TACTICAL MOMENT
    ↓
CHECK
    ↓
CHECKMATE
```

Examples include:

- **Knight takes Queen** → **THE QUEEN FALLS**
- **Queen is captured** → **THE CROWN IS TAKEN**
- **Rook or other heavy piece falls** → significant capture event
- **Castling** → **THE FORTRESS TURNS**
- **En passant** → **THE SHADOW CAPTURE**
- **Promotion** → **THE PAWN BECOMES CROWN**
- **Underpromotion** → **THE UNEXPECTED CROWN**
- **Check** → **THE KING IS HUNTED** or **CHECK**
- **Checkmate** → **THE FINAL BLOW**

The visual intensity scales with the importance of the event. The goal is contrast: not every move should explode, because the rare moments need room to matter.

---

## The game story

At the end of a match, the game can open **The Crown Chronicle**.

The chronicle is generated from the actual move history. It includes:

- every move as a narrative entry
- Special move descriptions
- major capture moments
- check and checkmate moments
- a battle-quality summary
- move, capture, check and Crown Event counts

The current narrator is intentionally dependency-light and deterministic. It uses the recorded chess state and event classification rather than calling an external language model. That leaves a clean seam for a richer Artificial Intelligence narrator later.

Example tone:

> **MOVE 17 · THE QUEEN FALLS**
>
> The Knight takes the Queen. The balance of the kingdom shifts in a single strike.
>
> **MOVE 24 · THE KING IS HUNTED**
>
> Black's move gives check. The King is forced to answer.
>
> **MOVE 27 · THE FINAL BLOW**
>
> Checkmate. The Crown has spoken.

---

## Architecture

```text
                         THE BLACK CROWN
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
             ENTRANCE                     GAME CHAMBER
                 │                             │
                 │                       ┌─────┴─────┐
                 │                       │           │
                 │                    BOARD       CONTROLS
                 │                       │
                 │                    Chess.js
                 │                       │
                 │                  move + position
                 │                       │
                 │                ┌──────┴──────┐
                 │                │             │
                 │           EVENT ENGINE   LOCAL SAVE
                 │                │
                 │        ┌───────┼────────┐
                 │        ↓       ↓        ↓
                 │      FX     CHRONICLE  AUDIO
                 │                │
                 └────────────────┴──────────────┐
                                                  ↓
                                           END-OF-GAME STORY
```

The foundation remains static and dependency-light. The chess rules engine is loaded as a pinned ECMAScript Module (ESM). Game state is saved locally and can be restored by replaying the recorded moves.

---

## Run locally

```bash
git clone https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN.git
cd THE-BLACK-CROWN
python3 -m http.server 4173
```

Open `http://localhost:4173`.

A local static server is recommended because the browser loads Chess.js as an ECMAScript Module.

---

## Project map

```text
THE-BLACK-CROWN/
├── index.html
├── styles.css
├── app.js
├── favicon.svg
├── manifest.json
├── sw.js
├── assets/
│   ├── black-crown-gameplay.gif
│   ├── black-crown-demo.svg
│   ├── 01-board-awakens.svg
│   ├── 02-chronicle.svg
│   └── 03-crown-ai.svg
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

---

## Design doctrine

**The board wins.** Everything around it frames the decision.

**Motion has meaning.** Hover, movement, capture, check, special moves and checkmate should not feel interchangeable.

**Darkness has texture.** Obsidian, aged paper, muted metal, restrained blood-red and engraved gold create the visual language.

**gODtECH is part of the artifact.** The name appears as an intentional signature through the entrance, board frame, inscriptions and chronicle.

**The archive remembers.** A finished game should leave more behind than a result. It should leave a story.

---

## Roadmap

### Act II · Make the game dangerous

- [x] separate entrance and game chamber
- [x] drag-and-drop movement
- [x] promotion choice chamber
- [x] Crown Event system
- [x] special-move effects and narration
- [x] end-of-game Chronicle
- [ ] pressure-aware chess clocks
- [ ] stronger Crown AI with personality levels
- [ ] opening recognition
- [ ] cinematic replay mode
- [ ] named local game saves

### Act III · Build the arena

- [ ] online rooms
- [ ] private match links
- [ ] friend invites
- [ ] spectator mode
- [ ] reconnect and resume
- [ ] persistent player profiles
- [ ] server-authoritative move validation

### Act IV · Build the mythology

- [ ] themed boards and piece sets
- [ ] reactive soundscape
- [ ] achievements and match history
- [ ] opening repertoire
- [ ] cinematic checkmate sequences
- [ ] shareable match stories
- [ ] richer social replay exports
- [ ] optional Artificial Intelligence narration

---

## Status

**Act II build · playable · actively developing**

THE BLACK CROWN now has an entrance experience, a dedicated game chamber, custom gODtECH engraving, drag-and-drop play, a promotion choice chamber, Crown Events for high-impact moves, and a deterministic end-of-game story system built from the actual match history.

> **Built for experimentation. Designed to grow teeth.**
