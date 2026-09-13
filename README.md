# ♛ THE BLACK CROWN

> **Every square is a throne. Every move leaves evidence.**
>
> A gothic chess experience by **gODtECH** where the board is the protagonist, important moves leave a mark, and every finished game becomes a story.

## Current experience

`LANDING → MATCH SETUP → GAME CHAMBER → CROWN EVENTS → RESULT → CHRONICLE REPLAY`

## Current build

- Real chess rules through Chess.js
- Local Two Player and Play With Crown match modes
- Crown difficulty: Beginner, Intermediate, Hard and Crown
- Click and drag movement
- Promotion choice for Queen, Rook, Bishop or Knight
- Crown Events for important captures, checks, checkmate and special moves
- Dedicated pawn-versus-Queen strike effect
- Dark pawn promotion transformation effect
- gODtECH engraving kept deliberately subtle
- Compact active-game interface for mobile-first play
- End-of-game Chronicle with a narrative entry for every move
- Chronicle replay board with previous/next/play controls and move timeline
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

The Chronicle is generated from recorded chess state and deterministic event classification. Every move is preserved with its move number, notation, position and narration.

The replay layer reconstructs the recorded positions inside the Chronicle without mutating the live game board. Players can step backward and forward, jump to any move, or play the battle from the opening to the final position.

A richer Artificial Intelligence narrator can be added later without replacing the game engine.

## Architecture

```text
LANDING
   ↓
MATCH SETUP
   ├── TWO PLAYER
   └── PLAY WITH CROWN → DIFFICULTY
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
   └── REPLAY ENGINE → RECORDED POSITIONS
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
