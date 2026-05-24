let audioContext;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playTone(frequency, duration, type, volume) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(context.destination);
  context.resume();
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

export function playStartSound() {
  playTone(520, 0.08, 'sine', 0.03);
}

export function playCollectSound() {
  playTone(760, 0.09, 'triangle', 0.04);
}

export function playHitSound() {
  playTone(140, 0.16, 'sawtooth', 0.035);
}
