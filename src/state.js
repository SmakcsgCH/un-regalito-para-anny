export function freshState() {
  return { scene: 0, envelope: false, wishes: [], flower: -1, candles: 'lit', photo: 0,
    box: false, gifts: [], gift: -1, stars: [], star: -1, special: false, lastStar: false };
}

export function nextCandles(value) {
  return value === 'lit' ? 'wished' : value === 'wished' ? 'out' : 'out';
}

export function swipeDirection(dx, dy) {
  return Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.35 ? (dx < 0 ? 1 : -1) : 0;
}
