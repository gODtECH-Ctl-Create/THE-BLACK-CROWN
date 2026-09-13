# ♛ THE BLACK CROWN

> **Every square is a throne. Every move leaves evidence.**
>
> A gothic chess experience by **gODtECH** where the board is the protagonist, important moves leave a mark, and every finished game becomes a story.

<p align="center">
  <img src="assets/black-crown-gameplay.gif" alt="Animated gameplay of The Black Crown" width="100%" />
</p>

## The experience

THE BLACK CROWN is structured like a game, not a utility:

`ENTRANCE → GAME CHAMBER → PLAY → CROWN EVENTS → RESULT → THE CHRONICLE`

The entrance establishes the world first. The game chamber is a dedicated space for the board and controls. At the end of a match, the archive turns the actual move history into a narrative timeline.

## What is alive

| System | Experience |
| --- | --- |
| ♟ **Real chess rules** | Legal movement, check, checkmate, draws, castling, en passant, promotion and move history through Chess.js. |
| ♛ **Crown AI** | Lightweight Black opponent using material, tactical, central-control and check signals. |
| ◈ **Drag or click play** | Move pieces by selecting squares or dragging them into legal targets. |
| ⚔ **Crown Events** | Important moments trigger differentiated effects instead of every move receiving the same animation. |
| ✦ **Special moves** | Castling, en passant, promotion and underpromotion receive their own event treatment. |
| ☠ **Major captures** | Queen captures and other material swings can trigger stronger events. |
| 👑 **Promotion Chamber** | A pawn reaching the final rank pauses the match and asks for Queen, Rook, Bishop or Knight. |
| ◌ **The Chronicle** | Every move becomes a narrative entry, with stronger writing around important moments. |
| ⌂ **Local memory** | Current game, event history, board orientation and opponent setting survive refresh. |
| ◒ **Atmosphere** | Fog, grain, dust, engraved UI, responsive typography and Web Audio cues shape the world. |

**AI** means **Artificial Intelligence**.

## Crown Events

`NORMAL MOVE → CAPTURE → SPECIAL MOVE → SIGNIFICANT CAPTURE → CHECK → CHECKMATE`

Examples include **THE QUEEN FALLS**, **THE CROWN IS TAKEN**, **THE FORTRESS TURNS**, **THE SHADOW CAPTURE**, **THE PAWN BECOMES CROWN**, **THE UNEXPECTED CROWN**, **THE KING IS HUNTED**, and **THE FINAL BLOW**.

Visual intensity scales with importance. Rare chess moments are allowed to feel rare.

## The Crown Chronicle

At the end of a match, **The Crown Chronicle** turns recorded move history into a story containing every move, special-move descriptions, major captures, checks and checkmate, a battle-quality summary, and match statistics.

The current narrator is dependency-light and deterministic. It uses chess state and event classification rather than an external language model, leaving a clean seam for richer Artificial Intelligence narration later.

## Architecture

```text
ENTRANCE
   ↓
GAME CHAMBER
   ↓
Chess.js → MOVE STATE
   ↓
CROWN EVENT ENGINE
   ├── visual effects
   ├── sound cues
   └── narrative events
   ↓
RESULT
   ↓
CROWN CHRONICLE
```

The project remains a static browser application with Chess.js loaded as a pinned ECMAScript Module (ESM). Game state is saved locally and restored by replaying recorded moves.

## Run locally

```bash
git clone https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN.git
cd THE-BLACK-CROWN
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Status

**Act II build · playable · actively developing**

This branch contains the entrance/game-chamber split, gODtECH engraving, drag-and-drop movement, promotion choice, Crown Events, special-move treatment, and the end-of-game Chronicle.

> **Built for experimentation. Designed to grow teeth.**
