import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { gameSettings } from '../src/data/gameSettings.js';
import { defaultShopItemId } from '../src/data/shopItems.js';
import { accountsStorageKey, defaultAccountName } from '../src/data/shopState.js';

const require = createRequire(import.meta.url);

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    throw new Error('Playwright is required for this smoke test. Run npm install before npm run smoke.');
  }
}

const { chromium } = loadPlaywright();

const localUrl = process.env.STAR_DASH_URL ?? 'http://127.0.0.1:5173/';
const evidencePath = process.env.STAR_DASH_EVIDENCE_PATH
  ?? 'docs/contracts/evidence/star-dash-localhost.png';
const centreX = gameSettings.gameWidth / 2;

mkdirSync('docs/contracts/evidence', { recursive: true });

async function launchBrowser() {
  if (process.env.CHROME_PATH) {
    return chromium.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH
    });
  }

  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const commonChromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    const browserPath = commonChromePaths.find((path) => existsSync(path));

    if (browserPath) {
      return chromium.launch({
        headless: true,
        executablePath: browserPath
      });
    }

    throw error;
  }
}

function withSmokeQuery(url) {
  const smokeUrl = new URL(url);
  smokeUrl.searchParams.set('smoke', '1');

  return smokeUrl.toString();
}

async function readState(page) {
  return page.evaluate(() => window.starDashSmoke?.readState());
}

async function movePlayerNear(page, targetX) {
  for (let attempt = 0; attempt < 35; attempt += 1) {
    const state = await readState(page);

    if (!state || state.scene !== 'GameScene') {
      return;
    }

    const distance = targetX - state.playerX;

    if (!Number.isFinite(distance) || Math.abs(distance) < 22) {
      return;
    }

    const key = distance > 0 ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(140, Math.max(35, Math.abs(distance) * 1.7)));
    await page.keyboard.up(key);
  }
}

async function waitForGameState(page, predicate, message, timeout = 7000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const state = await readState(page);

    if (state && predicate(state)) {
      return state;
    }

    await page.waitForTimeout(80);
  }

  throw new Error(message);
}

async function collectNaturalStar(page) {
  const startingScore = (await readState(page)).score;
  const startedAt = Date.now();

  while (Date.now() - startedAt < 8000) {
    const state = await readState(page);

    if (state.score > startingScore) {
      return state.score;
    }

    const star = state.stars.find((item) => item.y > -10 && item.y < gameSettings.gameHeight - 120)
      ?? state.stars[0];

    if (star) {
      await movePlayerNear(page, star.x);
    }

    await page.waitForTimeout(80);
  }

  throw new Error('A naturally falling star was not collected in time.');
}

async function hitNaturalRock(page) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 9000) {
    const state = await readState(page);

    if (state.scene === 'GameOverScene') {
      return state;
    }

    const rock = state.rocks.find((item) => item.y > -10 && item.y < gameSettings.gameHeight - 120)
      ?? state.rocks[0];

    if (rock) {
      await movePlayerNear(page, rock.x);
    }

    await page.waitForTimeout(80);
  }

  throw new Error('A naturally falling rock did not end the game in time.');
}

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
const smokeAccountsState = {
  activeAccountName: defaultAccountName,
  accounts: {
    [defaultAccountName]: {
      stars: 0,
      bestRoundStars: 0,
      ownedItemIds: [defaultShopItemId],
      selectedItemId: defaultShopItemId
    },
    Ace: {
      stars: 80,
      bestRoundStars: 60,
      ownedItemIds: [defaultShopItemId],
      selectedItemId: defaultShopItemId
    }
  }
};

await page.addInitScript(([key, state]) => {
  window.localStorage.setItem(key, JSON.stringify(state));
}, [accountsStorageKey, smokeAccountsState]);

page.on('console', (message) => {
  if (message.type() === 'error') {
    errors.push(message.text());
  }
});
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(withSmokeQuery(localUrl), { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');

const canvasBox = await page.locator('canvas').boundingBox();
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.menuAccountButtonY);
await page.waitForFunction(() => Boolean(window.starDashSmoke));
await waitForGameState(page, (state) => state.scene === 'AccountScene', 'The account scene did not open.');

page.once('dialog', (dialog) => dialog.accept('Nova'));
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.accountNewButtonY);
const accountCreatedState = await waitForGameState(
  page,
  (state) => state.scene === 'AccountScene' && state.activeAccountName === 'Nova',
  'Creating a local account failed.'
);
await page.mouse.click(
  canvasBox.x + centreX + 135,
  canvasBox.y + gameSettings.accountRowTopY + gameSettings.accountRowGap
);
const accountState = await waitForGameState(
  page,
  (state) => state.scene === 'AccountScene' && state.activeAccountName === 'Ace',
  'Switching local accounts failed.'
);
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.accountBackButtonY);
await page.waitForTimeout(250);
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.menuShopButtonY);
await page.waitForFunction(() => Boolean(window.starDashSmoke));
await waitForGameState(page, (state) => state.scene === 'ShopScene', 'The shop scene did not open.');
await page.mouse.click(
  canvasBox.x + gameSettings.shopRightX + 52,
  canvasBox.y + gameSettings.shopItemTopY + gameSettings.shopButtonGapY
);
const shopState = await waitForGameState(
  page,
  (state) => state.scene === 'ShopScene' && state.selectedItemId === 'ruby-ship',
  'Buying and selecting a shop item failed.'
);
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.shopBackButtonY);
await page.waitForTimeout(250);
await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.menuStartButtonY);
await waitForGameState(page, (state) => state.scene === 'GameScene', 'The game scene did not start.');

const startState = await waitForGameState(
  page,
  (state) => state.scene === 'GameScene' && state.selectedItemId === 'ruby-ship',
  'The selected shop item was not used in the game.'
);
const startX = startState.playerX;
const startY = startState.playerY;
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(350);
await page.keyboard.up('ArrowRight');
const movedX = (await readState(page)).playerX;
await page.keyboard.down('ArrowUp');
await page.waitForTimeout(350);
await page.keyboard.up('ArrowUp');
const movedUpY = (await readState(page)).playerY;
await page.keyboard.down('ArrowDown');
await page.waitForTimeout(350);
await page.keyboard.up('ArrowDown');
const movedDownY = (await readState(page)).playerY;

await waitForGameState(page, (state) => state.stars.length > 0, 'No naturally falling star spawned.');
const scoreAfterStar = await collectNaturalStar(page);

await page.screenshot({ path: evidencePath, fullPage: false });

await waitForGameState(page, (state) => state.rocks.length > 0, 'No naturally falling rock spawned.');
const gameOverState = await hitNaturalRock(page);

await page.mouse.click(canvasBox.x + centreX, canvasBox.y + gameSettings.gameOverRestartButtonY);
const restartedState = await waitForGameState(
  page,
  (state) => state.scene === 'GameScene' && state.score === 0,
  'Restart did not return to a fresh game.'
);

await browser.close();

const result = {
  url: localUrl,
  createdAccountName: accountCreatedState.activeAccountName,
  activeAccountName: accountState.activeAccountName,
  shopSelectedItemId: shopState.selectedItemId,
  movedRightBy: movedX - startX,
  movedUpBy: startY - movedUpY,
  movedDownBy: movedDownY - movedUpY,
  scoreAfterStar,
  gameOverScore: gameOverState.score,
  restartedScore: restartedState.score,
  screenshot: evidencePath,
  errors
};

console.log(JSON.stringify(result, null, 2));

if (result.movedRightBy < 70) {
  throw new Error('The player did not move far enough to the right.');
}

if (result.shopSelectedItemId !== 'ruby-ship') {
  throw new Error('The shop did not buy and select the Ruby Ship.');
}

if (result.createdAccountName !== 'Nova') {
  throw new Error('The local account was not created from the Accounts screen.');
}

if (result.activeAccountName !== 'Ace') {
  throw new Error('The local account did not switch to Ace.');
}

if (result.movedUpBy < 70) {
  throw new Error('The player did not move up when ArrowUp was held.');
}

if (result.movedDownBy < 35) {
  throw new Error('The player did not move down when ArrowDown was held.');
}

if (result.movedDownBy >= result.movedUpBy) {
  throw new Error('ArrowDown should move more slowly than ArrowUp.');
}

if (scoreAfterStar < 1) {
  throw new Error('Collecting a star did not increase the score.');
}

if (result.restartedScore !== 0) {
  throw new Error('Restart did not reset the score.');
}

if (errors.length > 0) {
  throw new Error(`Browser errors were logged: ${errors.join(', ')}`);
}
