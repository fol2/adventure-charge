export function createScoreText(scene) {
  return scene.add.text(24, 22, 'Score: 0', {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '28px',
    color: '#ffffff',
    stroke: '#172554',
    strokeThickness: 5
  });
}

export function updateScoreText(scoreText, score) {
  scoreText.setText(`Score: ${score}`);
}
