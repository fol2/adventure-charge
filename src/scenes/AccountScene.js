import Phaser from 'phaser';
import { playStartSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { gameSettings } from '../data/gameSettings.js';
import { setSmokeStateReader } from '../data/smokeMode.js';
import {
  createAccount,
  getActiveAccountName,
  listAccountNames,
  switchAccount
} from '../data/shopState.js';
import { createSmallTextButton, createTextButton } from '../ui/textButton.js';

export class AccountScene extends Phaser.Scene {
  constructor() {
    super('AccountScene');
  }

  create() {
    createGameTextures(this);
    const centreX = gameSettings.gameWidth / 2;
    const centreY = gameSettings.gameHeight / 2;
    const activeAccountName = getActiveAccountName();
    const accountNames = listAccountNames();

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

    accountNames.slice(0, gameSettings.maxAccountCount).forEach((accountName, index) => {
      this.createAccountRow(accountName, index, activeAccountName);
    });

    if (accountNames.length < gameSettings.maxAccountCount) {
      createTextButton(this, centreX, gameSettings.accountNewButtonY, 'New Account', () => {
        const accountName = window.prompt('Account name');
        createAccount(accountName);
        playStartSound();
        this.scene.restart();
      });
    } else {
      this.add.text(centreX, gameSettings.accountNewButtonY, '4 local accounts saved', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '22px',
        color: '#bfdbfe'
      }).setOrigin(0.5);
    }

    createTextButton(this, centreX, gameSettings.accountBackButtonY, 'Back', () => {
      playStartSound();
      this.scene.start('MenuScene');
    });

    setSmokeStateReader(() => ({
      scene: 'AccountScene',
      activeAccountName: getActiveAccountName(),
      accountNames: listAccountNames()
    }));
  }

  createAccountRow(accountName, index, activeAccountName) {
    const y = gameSettings.accountRowTopY + index * gameSettings.accountRowGap;
    const centreX = gameSettings.gameWidth / 2;
    const selected = accountName === activeAccountName;

    this.add.rectangle(centreX, y, 420, 48, 0x1e3a8a, 0.75)
      .setStrokeStyle(2, selected ? 0xfacc15 : 0x93c5fd);
    this.add.text(centreX - 180, y, accountName, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    createSmallTextButton(this, centreX + 135, y, selected ? 'Active' : 'Use', () => {
      switchAccount(accountName);
      playStartSound();
      this.scene.restart();
    });
  }
}
