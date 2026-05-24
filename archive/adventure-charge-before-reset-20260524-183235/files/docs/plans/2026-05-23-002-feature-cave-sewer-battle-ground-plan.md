---
title: Cave Sewer Battle Ground
date: 2026-05-23
status: completed
depth: lightweight
origin: user request
---

# Cave Sewer Battle Ground Plan

## Problem Frame

Battles currently happen on top of the route map scene, so the game does not have the requested battle ground. Add a dedicated 3D battle arena that looks like a cave but is dirty like a sewer, while keeping the existing route map for non-battle phases.

## Requirements

- R1: Battle phase should show a distinct cave/sewer battle ground.
- R2: The arena should feel dirty and damp, with cave walls, grimy floor, sewer pipe details, sludge or dirty water, and puddles.
- R3: Player and enemy models/fallbacks should appear inside the battle ground facing each other.
- R4: Map route nodes should remain visible in map phase and should not clutter battle phase.
- R5: Existing `.glb` and `.spz` optional asset support should keep working.

## Scope

In scope:

- Add a procedural React Three Fiber battle arena component.
- Switch the scene composition based on `state.phase === "battle"`.
- Adjust battle player/enemy positions for the arena.
- Verify tests, build, and browser battle rendering.

Out of scope:

- New authored `.glb` cave assets.
- New combat mechanics or balance changes.
- Audio, particle systems, or post-processing effects.

## Implementation Units

### U1: Battle Arena Scene

Files:

- `src/components/BattleGround.tsx`
- `src/components/AdventureScene.tsx`

Work:

- Create a procedural cave/sewer arena using primitives: rough back wall, side walls, arch/tunnel shapes, dirty floor, pipe outlets, sludge stream, puddles, rocks, and hanging cave shapes.
- Render the battle arena only during battle phase.
- Hide route node/path rendering while in battle phase.
- Place player and enemy on fixed arena positions.

Test scenarios:

- Starting a battle shows the battle arena instead of the route node map.
- Player and enemy fallback models remain visible in the arena when `.glb` files are absent.
- Map phase still shows route nodes and paths.

### U2: Verification

Files:

- `README.md` only if a note is needed.

Work:

- Run rule tests and production build.
- Browser-smoke the battle route and confirm the canvas renders without page errors.

Test scenarios:

- `npm run test` passes.
- `npm run build` passes.
- Browser smoke enters a battle and confirms the canvas is non-blank and the battle UI remains usable.

## Verification Plan

- `npm run test`
- `npm run build`
- Browser smoke on `http://127.0.0.1:5174`:
  - Start run.
  - Choose Bramble Track.
  - Confirm battle UI appears.
  - Confirm canvas is non-blank with no page errors.
  - Play a card and end turn.
