import test from 'node:test';
import assert from 'node:assert/strict';
import { gameSettings } from '../src/data/gameSettings.js';
import { defaultShopItemId } from '../src/data/shopItems.js';
import {
  accountsStorageKey,
  buyShopItem,
  createAccount,
  createStartingAccountsState,
  createStartingProfile,
  defaultAccountName,
  finishRound,
  loadAccountsState,
  loadShopState,
  saveShopState,
  selectShopItem,
  switchAccount
} from '../src/data/shopState.js';

function createStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

function createWriteBlockedStorage(state) {
  return {
    getItem(key) {
      return key === accountsStorageKey ? JSON.stringify(state) : null;
    },
    setItem() {
      throw new Error('blocked storage write');
    }
  };
}

test('new account state starts with the default profile', () => {
  const state = createStartingAccountsState();

  assert.equal(state.activeAccountName, defaultAccountName);
  assert.deepEqual(state.accounts[defaultAccountName], createStartingProfile());
});

test('createAccount creates and activates a local profile', () => {
  const storage = createStorage();
  const state = createAccount('Ace', storage);

  assert.equal(state.activeAccountName, 'Ace');
  assert.deepEqual(Object.keys(state.accounts), [defaultAccountName, 'Ace']);
});

test('createAccount keeps the local account list within the visible limit', () => {
  const storage = createStorage();

  createAccount('Ace', storage);
  createAccount('Bea', storage);
  createAccount('Cal', storage);
  const state = createAccount('Dee', storage);

  assert.equal(Object.keys(state.accounts).length, gameSettings.maxAccountCount);
  assert.equal(state.accounts.Dee, undefined);
  assert.equal(state.activeAccountName, 'Cal');
});

test('switchAccount changes which profile the shop uses', () => {
  const storage = createStorage();

  createAccount('Ace', storage);
  switchAccount(defaultAccountName, storage);
  assert.equal(loadAccountsState(storage).activeAccountName, defaultAccountName);
  switchAccount('Ace', storage);
  assert.equal(loadAccountsState(storage).activeAccountName, 'Ace');
});

test('finishRound saves stars and best one-round score to the active account', () => {
  const storage = createStorage();

  assert.equal(finishRound(3, storage).stars, 3);
  assert.equal(finishRound(2, storage).stars, 5);
  assert.equal(loadShopState(storage).bestRoundStars, 3);
});

test('buyShopItem deducts stars, owns the item, and selects it', () => {
  const storage = createStorage();
  saveShopState({
    stars: 30,
    bestRoundStars: 0,
    ownedItemIds: [defaultShopItemId],
    selectedItemId: defaultShopItemId
  }, storage);

  const result = buyShopItem('ruby-ship', storage);

  assert.equal(result.bought, true);
  assert.equal(result.state.stars, 18);
  assert.equal(result.state.selectedItemId, 'ruby-ship');
  assert.equal(result.state.ownedItemIds.includes('ruby-ship'), true);
});

test('buyShopItem does not buy when there are not enough stars', () => {
  const storage = createStorage();

  const result = buyShopItem('comet-cart', storage);

  assert.equal(result.bought, false);
  assert.equal(result.state.ownedItemIds.includes('comet-cart'), false);
});

test('locked items need the required one-round score before buying', () => {
  const storage = createStorage();
  saveShopState({
    stars: 80,
    bestRoundStars: 49,
    ownedItemIds: [defaultShopItemId],
    selectedItemId: defaultShopItemId
  }, storage);

  assert.equal(buyShopItem('gold-ship', storage).bought, false);
  finishRound(50, storage);
  assert.equal(buyShopItem('gold-ship', storage).bought, true);
});

test('selectShopItem only selects owned items', () => {
  const storage = createStorage();

  assert.equal(selectShopItem('mint-ship', storage).selectedItemId, defaultShopItemId);
});

test('loadAccountsState repairs invalid saved data', () => {
  const storage = createStorage();
  storage.setItem(accountsStorageKey, JSON.stringify({
    activeAccountName: 'Unknown',
    accounts: {
      Bad: {
        stars: -10,
        bestRoundStars: -4,
        ownedItemIds: ['unknown-item'],
        selectedItemId: 'unknown-item'
      }
    }
  }));

  assert.deepEqual(loadAccountsState(storage), {
    activeAccountName: 'Bad',
    accounts: {
      Bad: createStartingProfile()
    }
  });
});

test('blocked browser storage falls back to the starting account state', () => {
  const originalWindow = globalThis.window;

  globalThis.window = {};
  Object.defineProperty(globalThis.window, 'localStorage', {
    get() {
      throw new Error('blocked storage');
    }
  });

  try {
    assert.deepEqual(loadAccountsState(), createStartingAccountsState());
  } finally {
    globalThis.window = originalWindow;
  }
});

test('write-blocked storage does not pretend a new account was saved', () => {
  const storage = createWriteBlockedStorage(createStartingAccountsState());
  const state = createAccount('Nova', storage);

  assert.equal(state.activeAccountName, defaultAccountName);
  assert.equal(state.accounts.Nova, undefined);
});

test('unavailable storage does not pretend a new account was saved', () => {
  const state = createAccount('Nova', null);

  assert.equal(state.activeAccountName, defaultAccountName);
  assert.equal(state.accounts.Nova, undefined);
});

test('write-blocked storage does not pretend round stars were saved', () => {
  const storage = createWriteBlockedStorage(createStartingAccountsState());

  assert.equal(finishRound(12, storage).stars, 0);
  assert.equal(loadShopState(storage).stars, 0);
});

test('unavailable storage does not pretend round stars were saved', () => {
  assert.equal(finishRound(12, null).stars, 0);
  assert.equal(loadShopState(null).stars, 0);
});

test('write-blocked storage does not pretend a shop item was bought or selected', () => {
  const storage = createWriteBlockedStorage({
    activeAccountName: defaultAccountName,
    accounts: {
      [defaultAccountName]: {
        stars: 30,
        bestRoundStars: 0,
        ownedItemIds: [defaultShopItemId],
        selectedItemId: defaultShopItemId
      }
    }
  });

  const result = buyShopItem('ruby-ship', storage);

  assert.equal(result.bought, false);
  assert.equal(result.message, 'Could not save');
  assert.equal(result.state.selectedItemId, defaultShopItemId);
  assert.equal(loadShopState(storage).selectedItemId, defaultShopItemId);
});

test('write-blocked storage does not pretend an owned shop item was selected', () => {
  const storage = createWriteBlockedStorage({
    activeAccountName: defaultAccountName,
    accounts: {
      [defaultAccountName]: {
        stars: 30,
        bestRoundStars: 0,
        ownedItemIds: [defaultShopItemId, 'ruby-ship'],
        selectedItemId: defaultShopItemId
      }
    }
  });

  const result = buyShopItem('ruby-ship', storage);

  assert.equal(result.bought, false);
  assert.equal(result.message, 'Could not save');
  assert.equal(result.state.selectedItemId, defaultShopItemId);
  assert.equal(loadShopState(storage).selectedItemId, defaultShopItemId);
});
