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

THE BLACK CROWN is structured like a game, not a utility.

```text
ENTRANCE → THE CROWN AWAKENS → GAME CHAMBER → PLAY → CROWN EVENTS → RESULT → THE CHRONICLE
```

The opening screen establishes the world first. The game chamber is a separate space for the board and controls. When the match ends, the archive can tell the story of the battle from the recorded moves.

---

## What is alive

| System | Experience |
| --- | --- |
| ♟ **Real chess rules** | Legal movement, check, checkmate, draws, castling, en passant, promotion and move history through Chess.js. |
| ♛ **Crown AI** | Lightweight Black opponent using material, tactical, central-control and check signals. |
| ◈ **Drag or click play** | Move pieces by selecting squares or dragging pieces into legal targets. |
| ⚔ **Crown Events** | Important moments trigger differentiated effects instead of every move receiving the same animation. |
| ✦ **Special moves** | Castling, en passant, promotion and underpromotion receive their own event treatment. |
| ☠ **Major captures** | Queen captures and other material swings can trigger stronger events. |
| 👑 **Promotion Chamber** | A pawn reaching the final rank pauses the match and asks for Queen, Rook, Bishop or Knight. |
| ◌ **The Chronicle** | Every move becomes a narrative entry, with stronger writing around important moments. |
| ⌂ **Local memory** | Current game, event history, board orientation and opponent setting survive refresh. |
| ◒ **Atmosphere** | Fog, grain, dust, engraved UI, responsive typography and Web Audio cues shape the world. |

**AI** means **Artificial Intelligence**.

---

## Crown Events

```text
NORMAL MOVE → CAPTURE → SPECIAL MOVE → SIGNIFICANT CAPTURE → CHECK → CHECKMATE
```

Examples: **THE QUEEN FALLS**, **THE CROWN IS TAKEN**, **THE FORTRESS TURNS**, **THE SHADOW CAPTURE**, **THE PAWN BECOMES CROWN**, **THE UNEXPECTED CROWN**, **THE KING IS HUNTED**, and **THE FINAL BLOW**.

Visual intensity scales with importance. The goal is contrast, so rare chess moments feel rare.

---

## The Crown Chronicle

At the end of a match, **The Crown Chronicle** turns the recorded move history into a narrative timeline containing every move, special-move descriptions, major capture moments, check and checkmate moments, a battle-quality summary, and match statistics.

The current narrator is intentionally dependency-light and deterministic. It uses chess state and event classification rather than an external language model, leaving a clean seam for richer Artificial Intelligence narration later.

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
                 │                    ┌────────┴────────┐
                 │                    │                 │
                 │                  BOARD           CONTROLS
                 │                    │
                 │                 Chess.js
                 │                    │
                 │             moves + position
                 │                    │
                 │             ┌──────┴──────┐
                 │             │             │
                 │        EVENT ENGINE   LOCAL SAVE
                 │             │
                 │        ┌────┼────┬────┐
                 │        ↓    ↓    ↓    ↓
                 │       FX  AUDIO STORY STATS
                 │                 │
                 └─────────────────┴───────────────┐
                                                   ↓
                                            END-OF-GAME STORY
```

The foundation remains static and dependency-light. Chess.js is loaded as a pinned ECMAScript Module (ESM). Game state is saved locally and can be restored by replaying the recorded moves.

---

## Run locally

```bash
git clone https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN.git
cd THE-BLACK-CROWN
python3 -m http.server 4173
```

Open `http://localhost:4173`.

---

## Status

**Act II build · playable · actively developing**

The current branch contains the entrance/game-chamber split, gODtECH engraving, drag-and-drop play, promotion choice, Crown Events, special-move treatment and the end-of-game Chronicle. The next major slice is pressure-aware clocks, cinematic replay and a stronger Crown AI.

> **Built for experimentation. Designed to grow teeth.**
