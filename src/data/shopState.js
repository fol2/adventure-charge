import {
  defaultShopItemId,
  describeUnlockRequirement,
  findShopItem,
  isShopItemUnlocked,
  shopItems
} from './shopItems.js';
import { gameSettings } from './gameSettings.js';

export const accountsStorageKey = 'star-dash-accounts';
export const defaultAccountName = 'Player';

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createStartingProfile() {
  return {
    stars: 0,
    bestRoundStars: 0,
    ownedItemIds: [defaultShopItemId],
    selectedItemId: defaultShopItemId
  };
}

export function createStartingAccountsState() {
  return {
    activeAccountName: defaultAccountName,
    accounts: {
      [defaultAccountName]: createStartingProfile()
    }
  };
}

export function loadAccountsState(storage = getBrowserStorage()) {
  if (!storage) {
    return createStartingAccountsState();
  }

  try {
    return cleanAccountsState(JSON.parse(storage.getItem(accountsStorageKey)));
  } catch {
    return createStartingAccountsState();
  }
}

export function saveAccountsState(state, storage = getBrowserStorage()) {
  const cleanState = cleanAccountsState(state);

  if (storage) {
    try {
      storage.setItem(accountsStorageKey, JSON.stringify(cleanState));
    } catch {
      return {
        state: loadAccountsState(storage),
        saved: false
      };
    }

    return {
      state: cleanState,
      saved: true
    };
  }

  return {
    state: loadAccountsState(storage),
    saved: false
  };
}

export function getActiveAccountName(storage = getBrowserStorage()) {
  return loadAccountsState(storage).activeAccountName;
}

export function listAccountNames(storage = getBrowserStorage()) {
  return Object.keys(loadAccountsState(storage).accounts);
}

export function createAccount(name, storage = getBrowserStorage()) {
  const accountName = cleanAccountName(name);

  if (!accountName) {
    return loadAccountsState(storage);
  }

  const state = loadAccountsState(storage);

  if (!state.accounts[accountName] && Object.keys(state.accounts).length >= gameSettings.maxAccountCount) {
    return state;
  }

  return saveAccountsState({
    activeAccountName: accountName,
    accounts: {
      ...state.accounts,
      [accountName]: state.accounts[accountName] ?? createStartingProfile()
    }
  }, storage).state;
}

export function switchAccount(name, storage = getBrowserStorage()) {
  const accountName = cleanAccountName(name);
  const state = loadAccountsState(storage);

  if (!accountName || !state.accounts[accountName]) {
    return state;
  }

  return saveAccountsState({
    ...state,
    activeAccountName: accountName
  }, storage).state;
}

export function loadShopState(storage = getBrowserStorage()) {
  const accountsState = loadAccountsState(storage);

  return accountsState.accounts[accountsState.activeAccountName] ?? createStartingProfile();
}

export function saveShopState(profile, storage = getBrowserStorage()) {
  const accountsState = loadAccountsState(storage);

  return saveAccountsState({
    ...accountsState,
    accounts: {
      ...accountsState.accounts,
      [accountsState.activeAccountName]: cleanProfileState(profile)
    }
  }, storage).state.accounts[accountsState.activeAccountName];
}

export function trySaveShopState(profile, storage = getBrowserStorage()) {
  const accountsState = loadAccountsState(storage);
  const result = saveAccountsState({
    ...accountsState,
    accounts: {
      ...accountsState.accounts,
      [accountsState.activeAccountName]: cleanProfileState(profile)
    }
  }, storage);

  return {
    state: result.state.accounts[accountsState.activeAccountName],
    saved: result.saved
  };
}

export function finishRound(score, storage = getBrowserStorage()) {
  const profile = loadShopState(storage);
  const earnedStars = Math.max(0, Math.floor(score));

  return saveShopState({
    ...profile,
    stars: profile.stars + earnedStars,
    bestRoundStars: Math.max(profile.bestRoundStars, earnedStars)
  }, storage);
}

export function buyShopItem(itemId, storage = getBrowserStorage()) {
  const item = findShopItem(itemId);
  const profile = loadShopState(storage);

  if (!isShopItemUnlocked(item, profile)) {
    return {
      state: profile,
      bought: false,
      message: describeUnlockRequirement(item)
    };
  }

  if (profile.ownedItemIds.includes(item.id)) {
    const saveResult = trySaveShopState({
      ...profile,
      selectedItemId: item.id
    }, storage);

    if (!saveResult.saved) {
      return {
        state: profile,
        bought: false,
        message: 'Could not save'
      };
    }

    return {
      state: saveResult.state,
      bought: false,
      message: `${item.name} selected`
    };
  }

  if (profile.stars < item.cost) {
    return {
      state: profile,
      bought: false,
      message: `Need ${item.cost} stars`
    };
  }

  const saveResult = trySaveShopState({
    ...profile,
    stars: profile.stars - item.cost,
    ownedItemIds: [...profile.ownedItemIds, item.id],
    selectedItemId: item.id
  }, storage);

  if (!saveResult.saved) {
    return {
      state: profile,
      bought: false,
      message: 'Could not save'
    };
  }

  return {
    state: saveResult.state,
    bought: true,
    message: `${item.name} bought`
  };
}

export function selectShopItem(itemId, storage = getBrowserStorage()) {
  const item = findShopItem(itemId);
  const profile = loadShopState(storage);

  if (!profile.ownedItemIds.includes(item.id)) {
    return profile;
  }

  return trySaveShopState({
    ...profile,
    selectedItemId: item.id
  }, storage).state;
}

export function cleanAccountsState(rawState) {
  const startingState = createStartingAccountsState();

  if (!rawState || typeof rawState !== 'object' || !rawState.accounts) {
    return startingState;
  }

  const accounts = {};

  Object.entries(rawState.accounts).forEach(([name, profile]) => {
    const accountName = cleanAccountName(name);

    if (accountName) {
      accounts[accountName] = cleanProfileState(profile);
    }
  });

  if (Object.keys(accounts).length === 0) {
    return startingState;
  }

  const activeAccountName = accounts[rawState.activeAccountName]
    ? rawState.activeAccountName
    : Object.keys(accounts)[0];

  return {
    activeAccountName,
    accounts
  };
}

export function cleanProfileState(rawProfile) {
  const startingProfile = createStartingProfile();

  if (!rawProfile || typeof rawProfile !== 'object') {
    return startingProfile;
  }

  const validItemIds = shopItems.map((item) => item.id);
  const ownedItemIds = Array.isArray(rawProfile.ownedItemIds)
    ? rawProfile.ownedItemIds.filter((itemId) => validItemIds.includes(itemId))
    : [];
  const uniqueOwnedItemIds = [...new Set([defaultShopItemId, ...ownedItemIds])];
  const selectedItemId = uniqueOwnedItemIds.includes(rawProfile.selectedItemId)
    ? rawProfile.selectedItemId
    : defaultShopItemId;
  const stars = Number.isFinite(rawProfile.stars)
    ? Math.max(0, Math.floor(rawProfile.stars))
    : 0;
  const bestRoundStars = Number.isFinite(rawProfile.bestRoundStars)
    ? Math.max(0, Math.floor(rawProfile.bestRoundStars))
    : 0;

  return {
    stars,
    bestRoundStars,
    ownedItemIds: uniqueOwnedItemIds,
    selectedItemId
  };
}

function cleanAccountName(name) {
  if (typeof name !== 'string') {
    return '';
  }

  return name.trim().slice(0, 18);
}
