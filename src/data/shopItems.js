export const defaultShopItemId = 'blue-ship';

export const shopItems = [
  {
    id: 'blue-ship',
    name: 'Blue Ship',
    type: 'skin',
    textureKey: 'player-blue',
    cost: 0
  },
  {
    id: 'ruby-ship',
    name: 'Ruby Ship',
    type: 'skin',
    textureKey: 'player-ruby',
    cost: 12
  },
  {
    id: 'mint-ship',
    name: 'Mint Ship',
    type: 'skin',
    textureKey: 'player-mint',
    cost: 18
  },
  {
    id: 'moon-cart',
    name: 'Moon Cart',
    type: 'cart',
    textureKey: 'cart-moon',
    cost: 15
  },
  {
    id: 'comet-cart',
    name: 'Comet Cart',
    type: 'cart',
    textureKey: 'cart-comet',
    cost: 25
  },
  {
    id: 'gold-ship',
    name: 'Gold Ship',
    type: 'skin',
    textureKey: 'player-gold',
    cost: 35,
    unlockRequirement: {
      type: 'roundStars',
      amount: 50
    }
  },
  {
    id: 'neon-ship',
    name: 'Neon Ship',
    type: 'skin',
    textureKey: 'player-neon',
    cost: 45,
    unlockRequirement: {
      type: 'roundStars',
      amount: 75
    }
  },
  {
    id: 'rocket-cart',
    name: 'Rocket Cart',
    type: 'cart',
    textureKey: 'cart-rocket',
    cost: 30
  },
  {
    id: 'star-cart',
    name: 'Star Cart',
    type: 'cart',
    textureKey: 'cart-star',
    cost: 40,
    unlockRequirement: {
      type: 'roundStars',
      amount: 50
    }
  }
];

export function findShopItem(itemId) {
  return shopItems.find((item) => item.id === itemId)
    ?? shopItems.find((item) => item.id === defaultShopItemId);
}

export function isShopItemUnlocked(item, state) {
  if (!item.unlockRequirement) {
    return true;
  }

  if (item.unlockRequirement.type === 'roundStars') {
    return state.bestRoundStars >= item.unlockRequirement.amount;
  }

  return false;
}

export function describeUnlockRequirement(item) {
  if (!item.unlockRequirement) {
    return '';
  }

  if (item.unlockRequirement.type === 'roundStars') {
    return `Unlock: ${item.unlockRequirement.amount} in one round`;
  }

  return 'Locked';
}
