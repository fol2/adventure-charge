# Star Dash Shop, Accounts, Unlocks, And Controls Completion Report

## Task

The original contract in `docs/contracts/1.md` built Star Dash as a beginner-friendly Phaser and Vite browser game. The latest user request expanded the project with:

- A shop where players can buy and select skins or carts.
- Higher skin and cart costs than the first shop pass.
- More skins and carts.
- Unlock requirements for some items, including a 50-stars-in-one-round target.
- Local accounts so different players on the same device can keep separate progress.
- Up and Down arrow movement, where Up moves upward quicker and Down moves downward more slowly.

The implementation keeps this as a local browser game. There is no backend server, database, online login, payment system, multiplayer, level system, boss system, or mission system.

## Status

Implemented:

- Accounts menu accessible from the main menu.
- Up to four local browser profiles on the same device.
- Each local profile has its own saved stars, best one-round star score, owned items, and selected item.
- Shop scene accessible from the menu and game over screen.
- Stars earned in a run are added to the active profile when the player hits a rock.
- Nine shop items:
  - Blue Ship, owned by default.
  - Ruby Ship, 12 stars.
  - Mint Ship, 18 stars.
  - Moon Cart, 15 stars.
  - Comet Cart, 25 stars.
  - Gold Ship, 35 stars, unlocks after 50 stars in one round.
  - Neon Ship, 45 stars, unlocks after 75 stars in one round.
  - Rocket Cart, 30 stars.
  - Star Cart, 40 stars, unlocks after 50 stars in one round.
- Bought items stay owned in browser local storage for the active local profile.
- Selecting a bought item changes the player sprite in the menu and game.
- Left and right movement still works.
- Up arrow moves the player upward quickly.
- Down arrow moves the player downward more gently.
- Smoke test switches accounts, buys and selects a shop item, verifies the selected item is used, checks right/up/down movement, confirms Down is slower than Up, collects a naturally falling star, hits a naturally falling rock, and restarts.
- Smoke test also creates a local account through the Accounts screen.

## Files Created Or Changed

- `README.md`
- `scripts/smoke-test-localhost.js`
- `src/data/createGameTextures.js`
- `src/data/gameSettings.js`
- `src/data/shopItems.js`
- `src/data/shopState.js`
- `src/main.js`
- `src/objects/Player.js`
- `src/scenes/AccountScene.js`
- `src/scenes/GameOverScene.js`
- `src/scenes/GameScene.js`
- `src/scenes/MenuScene.js`
- `src/scenes/ShopScene.js`
- `src/ui/scoreText.js`
- `src/ui/textButton.js`
- `test/shopState.test.js`
- `docs/contracts/2-shop-controls-completion-report.md`
- `docs/contracts/evidence/star-dash-accounts-shop-localhost.png`
- `docs/contracts/evidence/star-dash-accounts-shop-preview.png`

## How To Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The default is:

```text
http://127.0.0.1:5173/
```

In this workspace, `5173` was already used by another project, so Star Dash was verified at:

```text
http://127.0.0.1:5174/
```

The production build was verified through Vite preview at:

```text
http://127.0.0.1:4174/
```

## Verification

Automated project check:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\npm.cmd' run check
```

Result:

- JavaScript syntax check passed for 21 files.
- Node test suite passed: 20 tests.
- Vite production build passed.

Dev-server smoke test:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
$env:STAR_DASH_URL = 'http://127.0.0.1:5174/'
$env:STAR_DASH_EVIDENCE_PATH = 'docs/contracts/evidence/star-dash-accounts-shop-localhost.png'
& 'C:\Program Files\nodejs\npm.cmd' run smoke
```

Result:

```json
{
  "url": "http://127.0.0.1:5174/",
  "createdAccountName": "Nova",
  "activeAccountName": "Ace",
  "shopSelectedItemId": "ruby-ship",
  "movedRightBy": 126.5,
  "movedUpBy": 105,
  "movedDownBy": 69.66666666666708,
  "scoreAfterStar": 1,
  "gameOverScore": 2,
  "restartedScore": 0,
  "screenshot": "docs/contracts/evidence/star-dash-accounts-shop-localhost.png",
  "errors": []
}
```

Production-preview smoke test:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
$env:STAR_DASH_URL = 'http://127.0.0.1:4174/'
$env:STAR_DASH_EVIDENCE_PATH = 'docs/contracts/evidence/star-dash-accounts-shop-preview.png'
& 'C:\Program Files\nodejs\npm.cmd' run smoke
```

Result:

```json
{
  "url": "http://127.0.0.1:4174/",
  "createdAccountName": "Nova",
  "activeAccountName": "Ace",
  "shopSelectedItemId": "ruby-ship",
  "movedRightBy": 115.5,
  "movedUpBy": 110,
  "movedDownBy": 66.5000000000004,
  "scoreAfterStar": 1,
  "gameOverScore": 1,
  "restartedScore": 0,
  "screenshot": "docs/contracts/evidence/star-dash-accounts-shop-preview.png",
  "errors": []
}
```

## Evidence

- `docs/contracts/evidence/star-dash-accounts-shop-localhost.png`
- `docs/contracts/evidence/star-dash-accounts-shop-preview.png`

## Manual Test Checklist

- Open the game.
- Open Accounts from the menu.
- Create a local account.
- Switch between local accounts.
- Open Shop from the menu.
- Buy a skin or cart when enough stars are available.
- Confirm locked items require the stated one-round star target.
- Select an owned item.
- Press Back, then Start.
- Confirm the player uses the selected item.
- Use Left and Right to move sideways.
- Use Up to move upward quickly.
- Use Down to move downward more slowly.
- Collect stars.
- Hit a rock.
- Confirm earned stars are added to the active local account.
- Restart or return to the shop.

## Review Status

Independent code review and contract audit both passed against the expanded user request.

- Code reviewer verdict: GREEN.
- Contract auditor verdict: GREEN.
