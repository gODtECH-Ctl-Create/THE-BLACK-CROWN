# ♛ THE BLACK CROWN

> **Every square is a throne. Every move leaves evidence.**
>
> A gothic chess experience by **gODtECH** where the board is the protagonist, important moves leave a mark, and every finished game becomes a story.

## Current experience

`ENTRANCE → GAME CHAMBER → PLAY → CROWN EVENTS → RESULT → THE CHRONICLE`

## Current build

- Real chess rules through Chess.js
- Crown Artificial Intelligence (AI)
- Click and drag movement
- Promotion choice for Queen, Rook, Bishop or Knight
- Crown Events for important captures, checks, checkmate and special moves
- gODtECH engraving in the interface and board frame
- End-of-game Chronicle with a narrative entry for every move
- Local persistence
- Fog, grain, dust, sound cues and responsive gothic presentation

## Event language

**THE QUEEN FALLS** · Knight takes Queen

**THE CROWN IS TAKEN** · other Queen captures

**THE FORTRESS TURNS** · castling

**THE SHADOW CAPTURE** · en passant

**THE PAWN BECOMES CROWN** · promotion

**THE UNEXPECTED CROWN** · underpromotion

**THE KING IS HUNTED** · major check

**THE FINAL BLOW** · checkmate

## Chronicle

The current story system is deterministic and dependency-light. It uses the recorded chess state and event classification rather than an external language model. A richer Artificial Intelligence narrator can be added later without replacing the game engine.

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

> **Built for experimentation. Designed to grow teeth.**
