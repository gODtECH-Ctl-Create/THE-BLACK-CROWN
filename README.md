# ♛ THE BLACK CROWN

> **Every square is a throne. Every move leaves evidence.**
>
> A gothic chess experience by **gODtECH** where the board is the protagonist, important moves leave a mark, and every finished game becomes a story.

## The experience

THE BLACK CROWN is structured like a game, not a utility:

`ENTRANCE → GAME CHAMBER → PLAY → CROWN EVENTS → RESULT → THE CHRONICLE`

## What is alive

- Real chess rules through Chess.js
- Crown Artificial Intelligence (AI)
- Click and drag movement
- Promotion choice for Queen, Rook, Bishop or Knight
- Crown Events for important captures, checks and special moves
- Custom gODtECH engraving across the interface and board frame
- End-of-game Chronicle with a narrative entry for every move
- Local game persistence
- Fog, grain, dust, sound cues and responsive gothic presentation

## Crown Events

Normal movement stays restrained. More consequential moments escalate visually.

**THE QUEEN FALLS** for a Knight taking a Queen.

**THE CROWN IS TAKEN** for other Queen captures.

**THE FORTRESS TURNS** for castling.

**THE SHADOW CAPTURE** for en passant.

**THE PAWN BECOMES CROWN** for promotion.

**THE UNEXPECTED CROWN** for underpromotion.

**THE KING IS HUNTED** for major checks.

**THE FINAL BLOW** for checkmate.

## The Crown Chronicle

At the end of a match, the recorded moves become a narrative timeline with match statistics and stronger prose around consequential moments.

The narrator is currently deterministic and dependency-light. It does not call an external language model. This keeps the game fully browser-first while leaving room for a future richer AI narrator.

## Architecture

```text
ENTRANCE
   ↓
GAME CHAMBER
   ↓
Chess.js → MOVE STATE
   ↓
CROWN EVENT ENGINE
   ├── VISUAL EFFECTS
   ├── SOUND CUES
   └── STORY EVENTS
   ↓
RESULT
   ↓
CROWN CHRONICLE
```

## Run locally

```bash
git clone https://github.com/gODtECH-Ctl-Create/THE-BLACK-CROWN.git
cd THE-BLACK-CROWN
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Status

**Act II build · playable · actively developing**

Current branch: entrance/game-chamber split, gODtECH engraving, drag-and-drop play, promotion choice, Crown Events, special-move treatment, and end-of-game Chronicle.

> **Built for experimentation. Designed to grow teeth.**
