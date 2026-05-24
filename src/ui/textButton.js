export function createTextButton(scene, x, y, label, onClick) {
  const button = scene.add.text(x, y, label, {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '28px',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    padding: {
      x: 22,
      y: 12
    }
  });

  button.setOrigin(0.5);
  button.setInteractive({ useHandCursor: true });
  button.on('pointerdown', onClick);
  button.on('pointerover', () => button.setStyle({ backgroundColor: '#0ea5e9' }));
  button.on('pointerout', () => button.setStyle({ backgroundColor: '#2563eb' }));

  return button;
}
