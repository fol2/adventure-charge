import Phaser from 'phaser';
import { playStartSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { gameSettings } from '../data/gameSettings.js';
import { setSmokeStateReader } from '../data/smokeMode.js';
import {
  createAccount,
  getActiveAccountName,
  listAccountNames,
  loadAccountsState,
  switchAccount
} from '../data/shopState.js';
import { createSmallTextButton, createTextButton } from '../ui/textButton.js';

export class AccountScene extends Phaser.Scene {
  constructor() {
    super('AccountScene');
  }

  create(data = {}) {
    createGameTextures(this);
    const centreX = gameSettings.gameWidth / 2;
    const centreY = gameSettings.gameHeight / 2;
    const activeAccountName = getActiveAccountName();
    const accountsState = loadAccountsState();
    const accountNames = listAccountNames();
    const activeProfile = accountsState.accounts[activeAccountName] ?? { bestRoundStars: 0 };
    this.page = Math.max(0, Math.min(data.page ?? 0, this.maxPage(accountNames)));

    this.add.image(centreX, centreY, 'spaceBackground');
    this.add.text(centreX, gameSettings.accountTitleY, 'Accounts', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '48px',
      color: '#fef3c7',
      stroke: '#172554',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(centreX, gameSettings.accountActiveY, `Current: ${activeAccountName}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(centreX, gameSettings.accountHighScoreY, `High Score: ${activeProfile.bestRoundStars}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      color: '#fef3c7'
    }).setOrigin(0.5);

    this.visibleAccountNames(accountNames).forEach((accountName, index) => {
      this.createAccountRow(accountName, index, activeAccountName, accountsState.accounts[accountName]);
    });

    this.createPageButtons(centreX, accountNames);

    createTextButton(this, centreX, gameSettings.accountNewButtonY, 'New Account', () => {
      const accountName = window.prompt('Account name');
      const nextState = createAccount(accountName);
      const nextAccountNames = Object.keys(nextState.accounts);
      const nextPage = this.accountPage(nextState.activeAccountName, nextAccountNames);

      playStartSound();
      this.scene.restart({ page: nextPage });
    });

    createTextButton(this, centreX, gameSettings.accountBackButtonY, 'Back', () => {
      playStartSound();
      this.scene.start('MenuScene');
    });

    setSmokeStateReader(() => ({
      scene: 'AccountScene',
      activeAccountName: getActiveAccountName(),
      accountNames: listAccountNames(),
      page: this.page,
      highScore: loadAccountsState().accounts[getActiveAccountName()].bestRoundStars
    }));
  }

  createAccountRow(accountName, index, activeAccountName, profile) {
    const y = gameSettings.accountRowTopY + index * gameSettings.accountRowGap;
    const centreX = gameSettings.gameWidth / 2;
    const selected = accountName === activeAccountName;

    this.add.rectangle(centreX, y, 440, 52, 0x1e3a8a, 0.75)
      .setStrokeStyle(2, selected ? 0xfacc15 : 0x93c5fd);
    this.add.text(centreX - 190, y - 9, accountName, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.add.text(centreX - 190, y + 14, `High: ${profile.bestRoundStars}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '15px',
      color: '#bfdbfe'
    }).setOrigin(0, 0.5);

    createSmallTextButton(this, centreX + 135, y, selected ? 'Active' : 'Use', () => {
      switchAccount(accountName);
      playStartSound();
      this.scene.restart({ page: this.page });
    });
  }

  createPageButtons(centreX, accountNames) {
    const maxPage = this.maxPage(accountNames);

    this.add.text(centreX, gameSettings.accountPageButtonY, `Page ${this.page + 1} of ${maxPage + 1}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (this.page > 0) {
      createSmallTextButton(this, centreX - 120, gameSettings.accountPageButtonY, 'Prev', () => {
        this.scene.restart({ page: this.page - 1 });
      });
    }

    if (this.page < maxPage) {
      createSmallTextButton(this, centreX + 120, gameSettings.accountPageButtonY, 'Next', () => {
        this.scene.restart({ page: this.page + 1 });
      });
    }
  }

  visibleAccountNames(accountNames) {
    const startIndex = this.page * gameSettings.accountRowsPerPage;

    return accountNames.slice(startIndex, startIndex + gameSettings.accountRowsPerPage);
  }

  maxPage(accountNames) {
    return Math.max(0, Math.ceil(accountNames.length / gameSettings.accountRowsPerPage) - 1);
  }

  accountPage(accountName, accountNames) {
    const accountIndex = accountNames.indexOf(accountName);

    if (accountIndex < 0) {
      return 0;
    }

    return Math.floor(accountIndex / gameSettings.accountRowsPerPage);
  }
}
