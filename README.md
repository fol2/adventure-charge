# Star Dash

Star Dash is a small beginner-friendly Phaser and Vite browser game.

## Run The Game

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, usually `http://127.0.0.1:5173/`.

## Check The Project

```bash
npm run check
```

This checks JavaScript syntax, runs the small automated tests, and builds the game.

When the dev server is running, this command runs a browser smoke test against localhost:

```bash
npm run smoke
```

The smoke test targets `http://127.0.0.1:5173/` by default. If Vite prints a different port because `5173` is busy, set `STAR_DASH_URL` first:

```powershell
$env:STAR_DASH_URL = 'http://127.0.0.1:5174/'
npm run smoke
```

## How To Play

Use the left and right arrow keys to move the spaceship. Collect falling stars to gain points. Avoid falling rocks. If a rock touches the player, the game ends and you can restart.
