// Pequeña melodía original. Se sintetiza localmente: no hay audio externo ni autoplay.
import { card } from './config.js';
const notes = [72, 76, 79, 76, 74, 77, 81, 79, 76, 79, 84, 83, 81, 79, 76, 74,
  72, 76, 79, 84, 83, 79, 77, 74, 76, 79, 81, 77, 74, 76, 72, null];
let context, master, interval, nextTime = 0, step = 0;
let wanted = false;
const beat = 0.47;

function note(midi, at, length, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  oscillator.connect(gain).connect(master);
  oscillator.start(at);
  oscillator.stop(at + length + 0.05);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function schedule() {
  if (!context || context.state !== 'running' || !wanted) return;
  while (nextTime < context.currentTime + 0.2) {
    const melody = notes[step % notes.length];
    if (melody !== null) note(melody, nextTime, 1.4, 0.45);
    if (step % 4 === 0) {
      const root = [48, 53, 57, 55][Math.floor(step / 4) % 4];
      [root, root + 7, root + 12].forEach((n, i) => note(n, nextTime + i * 0.04, 2.1, 0.10));
    }
    step++; nextTime += beat;
  }
}

export const music = {
  get active() { return wanted; },
  async toggle() {
    if (!card.music.enabled) return false;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Audio no disponible');
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = Math.min(Math.max(card.music.volume, 0), 0.35);
      master.connect(context.destination);
    }
    wanted = !wanted;
    if (wanted) {
      try {
        await context.resume(); nextTime = context.currentTime + 0.05;
        schedule(); interval = setInterval(schedule, 100);
      } catch (error) { wanted = false; throw error; }
    } else { clearInterval(interval); await context.suspend(); }
    return wanted;
  },
  async off() {
    wanted = false; clearInterval(interval);
    if (context?.state === 'running') await context.suspend();
  },
  async visibility() {
    if (!context || !wanted) return;
    if (document.hidden) { clearInterval(interval); await context.suspend(); }
    else {
      await context.resume(); nextTime = context.currentTime + 0.05;
      clearInterval(interval); schedule(); interval = setInterval(schedule, 100);
    }
  },
};
