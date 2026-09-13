# Phase 1: Core Game Stability

Phase 1 locks the single-player game loop before difficulty levels are introduced.

## Included

- Click-to-move and drag-and-drop remain supported.
- Crown Artificial Intelligence (AI) responds through the shared move pipeline without the previous deadlock.
- AI timers are cancellable and tied to a game-session token so reset/new-game actions cannot be mutated by stale callbacks.
- Reloading a saved position can resume an outstanding Crown turn.
- Disabling the Crown AI cancels a pending AI response safely.
- Promotion, castling, en passant, captures, checks, checkmate, and draw states continue through the existing chess rules engine.
- Undo, reset, board flip, local persistence, result state, and Chronicle state remain synchronized.
- `gODtECH` remains a deliberately faint maker signature rather than the visual headline.

## Deliberately deferred

Difficulty levels, Beginner / Intermediate / Hard AI tuning, achievements, progression, and multiplayer remain outside Phase 1.

## Validation

GitHub Actions runs `node --check app.js` after the stability patch. Browser-level manual testing remains the final acceptance step for the deployed game.