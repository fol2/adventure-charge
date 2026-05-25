import Phaser from 'phaser';
import { playCollectSound, playStartSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { gameSettings } from '../data/gameSettings.js';
import { setSmokeStateReader } from '../data/smokeMode.js';
import { buyShopItem, getActiveAccountName, loadShopState } from '../data/shopState.js';
import { describeUnlockRequirement, isShopItemUnlocked, shopItems } from '../data/shopItems.js';
import { createSmallTextButton, createTextButton } from '../ui/textButton.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(data = {}) {
    createGameTextures(this);
    this.returnScene = data.returnScene ?? 'MenuScene';
    this.page = data.page ?? 0;
    this.shopState = loadShopState();
    this.messageText = null;

    const centreX = gameSettings.gameWidth / 2;
    const centreY = gameSettings.gameHeight / 2;

    this.add.image(centreX, centreY, 'spaceBackground');
    this.add.text(centreX, gameSettings.shopTitleY, 'Shop', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '48px',
      color: '#fef3c7',
      stroke: '#172554',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(centreX, gameSettings.shopStarsY, `Account: ${getActiveAccountName()}  Stars: ${this.shopState.stars}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.messageText = this.add.text(centreX, 154, '', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
      color: '#bfdbfe'
    }).setOrigin(0.5);

    this.visibleItems().forEach((item, index) => this.createShopItem(item, index));
    this.createPageButtons(centreX);
    createTextButton(this, centreX, gameSettings.shopBackButtonY, 'Back', () => {
      playStartSound();
      this.scene.start(this.returnScene);
    });

    setSmokeStateReader(() => this.readSmokeState());
  }

  createShopItem(item, index) {
    const columnX = index % 2 === 0 ? gameSettings.shopLeftX : gameSettings.shopRightX;
    const rowY = gameSettings.shopItemTopY + Math.floor(index / 2) * gameSettings.shopItemRowGap;
    const owned = this.shopState.ownedItemIds.includes(item.id);
    const selected = this.shopState.selectedItemId === item.id;
    const unlocked = isShopItemUnlocked(item, this.shopState);
    const label = selected
      ? 'Selected'
      : owned
        ? 'Select'
        : unlocked
          ? `Buy ${item.cost}`
          : 'Locked';

    this.add.rectangle(columnX, rowY, 250, 118, 0x1e3a8a, 0.72)
      .setStrokeStyle(2, selected ? 0xfacc15 : 0x93c5fd);
    this.add.image(columnX - 84, rowY - 4, item.textureKey).setScale(0.72);
    this.add.text(columnX - 38, rowY - 36, item.name, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(columnX - 38, rowY - 12, item.type === 'cart' ? 'Cart' : 'Skin', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '15px',
      color: '#bfdbfe'
    });
    this.add.text(columnX - 38, rowY + 12, this.itemStatusText(item, owned, unlocked), {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      color: owned ? '#bbf7d0' : unlocked ? '#fde68a' : '#fecaca'
    });

    createSmallTextButton(this, columnX + 52, rowY + gameSettings.shopButtonGapY, label, () => {
      if (selected) {
        return;
      }

      const result = buyShopItem(item.id);
      this.shopState = result.state;
      this.messageText.setText(result.message);

      if (result.state.selectedItemId === item.id) {
        playCollectSound();
        this.scene.restart({
          returnScene: this.returnScene,
          page: this.page
        });
      }
    });
  }

  createPageButtons(centreX) {
    const maxPage = this.maxPage();

    this.add.text(centreX, gameSettings.shopPageButtonY, `Page ${this.page + 1} of ${maxPage + 1}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (this.page > 0) {
      createSmallTextButton(this, centreX - 120, gameSettings.shopPageButtonY, 'Prev', () => {
        this.scene.restart({
          returnScene: this.returnScene,
          page: this.page - 1
        });
      });
    }

    if (this.page < maxPage) {
      createSmallTextButton(this, centreX + 120, gameSettings.shopPageButtonY, 'Next', () => {
        this.scene.restart({
          returnScene: this.returnScene,
          page: this.page + 1
        });
      });
    }
  }

  visibleItems() {
    const startIndex = this.page * gameSettings.shopItemsPerPage;

    return shopItems.slice(startIndex, startIndex + gameSettings.shopItemsPerPage);
  }

  maxPage() {
    return Math.max(0, Math.ceil(shopItems.length / gameSettings.shopItemsPerPage) - 1);
  }

  itemStatusText(item, owned, unlocked) {
    if (owned) {
      return 'Owned';
    }

    if (!unlocked) {
      return describeUnlockRequirement(item);
    }

    return `${item.cost} stars`;
  }

  readSmokeState() {
    return {
      scene: 'ShopScene',
      stars: this.shopState.stars,
      bestRoundStars: this.shopState.bestRoundStars,
      ownedItemIds: this.shopState.ownedItemIds,
      selectedItemId: this.shopState.selectedItemId,
      page: this.page,
      accountName: getActiveAccountName()
    };
  }
}
