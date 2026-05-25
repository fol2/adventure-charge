export function createScoreText(scene) {
  const scoreBacking = scene.add.rectangle(101, 42, 154, 46, 0x0f172a, 0.78);
  scoreBacking.setDepth(19);

  const scoreText = scene.add.text(24, 22, 'Score: 0', {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '28px',
    color: '#ffffff',
    stroke: '#172554',
    strokeThickness: 5
  });

  scoreText.setDepth(20);

  return scoreText;
}

export function updateScoreText(scoreText, score) {
  scoreText.setText(`Score: ${score}`);
}
