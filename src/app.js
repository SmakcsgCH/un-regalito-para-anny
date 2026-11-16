import { card, ui } from './config.js';
import { icon, botanical, envelope, flower, cakeArt, giftBox } from './art.js';
import { freshState, nextCandles, swipeDirection } from './state.js';
import { music } from './music.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#photo-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const slugs = ['sobre', 'jardin', 'pastel', 'album', 'regalos', 'estrellas', 'carta', 'despedida'];
const photos = card.photos.filter(p => p.available !== false);
let state = freshState();
let opening = false, audioBusy = false, pointerStart = null, lastSwipeTime = 0, particleTimer;
let photoOpener = null;
const scrollPositions = Array(8).fill(0);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (text, action, style = 'primary', extra = '') => `<button type="button" class="button ${style}" data-action="${action}" ${extra}>${esc(text)}${style === 'primary' ? icon('arrow') : ''}</button>`;
const heading = (eyebrow, title, text = '') => `<div class="scene-heading"><p class="eyebrow">${esc(eyebrow)}</p><h1 tabindex="-1">${esc(title)}</h1>${text ? `<p class="scene-subtitle">${esc(text)}</p>` : ''}</div>`;
const back = () => `<button type="button" class="back-button" data-action="back">${icon('back')}Atrás</button>`;
const nav = next => `<nav class="scene-nav" aria-label="Navegación de la tarjeta">${back()}${next || ''}</nav>`;
const progress = () => `<div class="progress" aria-label="Paso ${state.scene + 1} de 8: ${esc(card.scenes[state.scene])}"><span class="progress-label">${String(state.scene + 1).padStart(2, '0')} <span>/ 08</span></span><div class="progress-dots" aria-hidden="true">${card.scenes.map((_, i) => `<span class="${i === state.scene ? 'current' : i < state.scene ? 'done' : ''}"></span>`).join('')}</div><span class="progress-scene">${esc(card.scenes[state.scene])}</span></div>`;
function announce(text) { document.querySelector('#announcer').textContent = text; }

function welcome() {
  if (state.envelope) return `<section class="scene intro-scene">${heading('Antes de empezar…', 'Holaaa, Annyyy ♡')}<article class="letter intro-letter"><span class="tape tape-top" aria-hidden="true"></span>${botanical('letter-botanical')}<p class="handwritten letter-greeting">${esc(card.intro[0])}</p><p>${esc(card.intro[1])}</p><p class="signature">— ${esc(card.from)}</p></article>${button(ui.first, 'next')}<button type="button" class="text-button" data-action="close-envelope">${icon('back')}Volver al sobre</button></section>`;
  const greeting = esc(card.welcome).replace(' para ti, ', '<br>para ti, ').replace(esc(card.to), `<em>${esc(card.to)}</em>`).replace(' 💌', '<b class="welcome-emoji">💌</b>');
  return `<section class="scene welcome-scene"><div class="date-label"><span aria-hidden="true">✧</span>${esc(card.date)}<span aria-hidden="true">✧</span></div><div class="welcome-heading"><p class="eyebrow">HOY TODO ESTO ES PARA TI</p><h1 tabindex="-1">${greeting}</h1><p>Una cartita y unas cuantas sorpresitas.</p></div><div class="envelope-composition">${botanical('envelope-branch left-branch')}${botanical('envelope-branch right-branch')}<button type="button" class="envelope-button" data-action="open-envelope" aria-label="Tocar el sobre para ${esc(card.to)} y abrir la carta">${envelope()}</button><span class="envelope-doodle" aria-hidden="true">hecho para ti <span>↗</span></span></div>${button(ui.open, 'open-envelope')}<p class="tiny-note">Toca el sobre y déjate sorprender <span aria-hidden="true">♡</span></p></section>`;
}

function garden() {
  return `<section class="scene garden-scene">${heading('Un jardincito de deseos', ui.gardenTitle, ui.gardenHint)}<div class="garden-illustration"><span class="butterfly butterfly-one" aria-hidden="true">ʚɞ</span><span class="butterfly butterfly-two" aria-hidden="true">ʚɞ</span><div class="flowers">${card.wishes.map((text, i) => `<button type="button" data-flower="${i}" class="flower-button flower-${i} ${state.wishes.includes(i) ? 'discovered' : ''} ${state.flower === i ? 'selected' : ''}" aria-label="Abrir deseo de la flor ${i + 1}" aria-pressed="${state.flower === i}">${flower(i)}<span class="flower-number">${state.wishes.includes(i) ? '♡' : String(i + 1).padStart(2, '0')}</span></button>`).join('')}</div><div class="garden-soil" aria-hidden="true"></div></div><div class="wish-note" id="wish-note"><span class="note-decoration" aria-hidden="true">✿</span><p>${esc(state.flower >= 0 ? card.wishes[state.flower] : ui.gardenEmpty)}</p></div><p class="discovery-count" id="flower-count">${state.wishes.length} de 5 deseos descubiertos</p>${nav(button(ui.cakeNext, 'next'))}</section>`;
}

function cake() {
  return `<section class="scene cake-scene" data-candles="${state.candles}">${heading('Una fiestita para la cumpleañera', ui.cakeTitle, ui.cakeHint)}<div class="party-stage"><span class="party-star star-left" aria-hidden="true">✧</span><span class="party-star star-right" aria-hidden="true">✦</span>${cakeArt()}</div><div class="pet-messages"><p class="pet-speech" id="cat-message"></p><p class="pet-speech" id="dog-message"></p></div><p class="party-tap-hint">Toca a los animalitos y los globos <span aria-hidden="true">♡</span></p><div id="candle-controls" class="candle-controls">${candleControls()}</div>${nav('')}</section>`;
}
function candleControls() {
  if (state.candles === 'out') return `<p class="celebration-message" role="status">${esc(ui.cakeCelebration)}</p>${button(ui.albumNext, 'next')}${button(ui.candleRelight, 'relight', 'text-button')}`;
  return `<p class="candle-status">${state.candles === 'wished' ? 'Listo… ahora toca apagarlas ✨' : 'Tómate un momentito. Este deseo es tuyo.'}</p>${button(state.candles === 'lit' ? ui.candleWish : ui.candleBlow, 'candles')}`;
}

function album() {
  const current = photos[state.photo];
  return `<section class="scene album-scene">${heading('Un álbum hecho para ti', card.album.title)}<div class="album-scrapbook"><span class="album-doodle" aria-hidden="true">para guardar cerquita ♡</span><span class="album-flower" aria-hidden="true">✿</span><div class="photo-swipe" id="photo-swipe">${current ? `<button class="polaroid" id="zoom-photo" type="button" data-action="zoom" aria-label="Ampliar foto ${state.photo + 1} de ${photos.length}"><span class="tape tape-photo" aria-hidden="true"></span><span class="photo-image-wrap"><img id="album-image" src="${esc(current.src)}" alt="${esc(current.alt)}" decoding="async" fetchpriority="high" draggable="false" /></span><span class="polaroid-caption" aria-hidden="true">${esc(card.to)} <span>♡</span></span><span class="zoom-hint">${icon('camera')}Toca para verla grande</span></button>` : `<div class="polaroid empty-album"><span class="tape tape-photo" aria-hidden="true"></span>${icon('camera')}<p>${esc(card.album.empty)}</p></div>`}</div></div>${current ? `<div class="album-controls"><button type="button" class="icon-button" data-action="photo-prev" aria-label="Foto anterior" ${state.photo === 0 ? 'disabled' : ''}>${icon('back')}</button><span class="photo-counter" aria-live="polite">${state.photo + 1} de ${photos.length}</span><button type="button" class="icon-button" data-action="photo-next" aria-label="Foto siguiente" ${state.photo === photos.length - 1 ? 'disabled' : ''}>${icon('arrow')}</button></div><p class="album-swipe-hint">Desliza o usa las flechitas</p><p class="album-caption">${esc(card.album.captions[state.photo] || ' ')}</p>` : ''}${!current || state.photo === photos.length - 1 ? `<div class="album-final-note"><p>${esc(card.album.note)}</p>${button(ui.giftsNext, 'next')}</div>` : ''}${nav('')}</section>`;
}

function gifts() {
  return `<section class="scene gifts-scene ${state.box ? 'box-open' : ''}">${heading('Los regalos que no se envuelven', ui.giftsTitle, state.box ? 'Ábrelos en el orden que quieras.' : ui.giftsHint)}<div class="giftbox-composition"><button type="button" class="giftbox-button" data-action="open-box" aria-label="Abrir el moño de la caja de regalos" aria-expanded="${state.box}">${giftBox()}</button><span class="gift-sparkle" aria-hidden="true">✧</span></div>${state.box ? `<div class="gift-options">${card.gifts.map((gift, i) => `<button type="button" class="gift-option ${state.gifts.includes(i) ? 'discovered' : ''}" data-gift="${i}" aria-pressed="${state.gift === i}" style="--i:${i}">${icon(gift.icon)}<span>${esc(gift.title)}</span><span class="gift-check" aria-hidden="true">${state.gifts.includes(i) ? '♡' : '+'}</span></button>`).join('')}</div><div class="gift-message ${state.gift === 0 ? 'hugging' : state.gift === 2 ? 'smiling' : ''}" id="gift-message"><div class="gift-animation" aria-hidden="true">${state.gift === 0 ? '<span>♡</span><span>♡</span>' : state.gift === 2 ? '<span>✧</span><span>✦</span><span>✧</span>' : '<span>♡</span>'}</div><p>${esc(state.gift >= 0 ? card.gifts[state.gift].text : 'Hay un poquito de cariño en cada uno.')}</p></div>` : ''}${nav(button(ui.starsNext, 'next'))}</section>`;
}

function stars() {
  return `<section class="scene stars-scene">${heading('Y si miras un poquito más arriba…', ui.starsTitle, ui.starsHint)}<div class="starry-sky"><span class="moon" aria-hidden="true"></span>${Array.from({ length: 20 }, (_, i) => `<i class="sky-speck" style="--x:${(i * 37 + 9) % 96}%;--y:${(i * 23 + 7) % 92}%;--delay:-${i * .3}s" aria-hidden="true"></i>`).join('')}<svg class="constellation" viewBox="0 0 400 360" aria-hidden="true"><path d="m80 110 225-45-105 217L80 110l-10 138 130 34 131-64-26-153" fill="none" stroke="#edcfb1" stroke-dasharray="2 8" opacity=".25"/></svg>${card.stars.map((text, i) => `<button type="button" class="wish-star wish-star-${i} ${state.stars.includes(i) ? 'discovered' : ''}" data-star="${i}" aria-label="Descubrir deseo de la estrella ${i + 1}" aria-pressed="${state.star === i}"><span aria-hidden="true">✧</span><i aria-hidden="true">${i + 1}</i></button>`).join('')}<button type="button" class="big-star ${state.special ? 'discovered' : ''}" data-action="special-star" aria-label="Abrir la estrella más grande, el último deseo" aria-pressed="${state.special}"><span aria-hidden="true">✦</span><i aria-hidden="true">la tuya</i></button></div><div class="star-message" id="star-message"><span aria-hidden="true">✧</span><p>${esc(state.special && state.star === -1 ? card.specialStar : state.star >= 0 ? card.stars[state.star] : 'Hay deseos que brillan más de noche.')}</p></div>${nav(button(ui.letterNext, 'next', state.special ? 'primary' : 'secondary'))}</section>`;
}

function letter() {
  return `<section class="scene letter-scene">${heading('De mí, para ti', ui.letterTitle)}<article class="letter final-letter"><span class="tape tape-top" aria-hidden="true"></span>${botanical('letter-botanical')}<div class="letter-content">${card.finalLetter.map((p, i) => `<p class="${i === 0 ? 'letter-greeting handwritten' : i === card.finalLetter.length - 1 ? 'signature' : ''}">${esc(p)}</p>`).join('')}</div><span class="letter-heart" aria-hidden="true">♡</span></article>${nav(button(ui.farewellNext, 'next'))}</section>`;
}
function farewell() {
  return `<section class="scene farewell-scene"><div class="farewell-wreath">${botanical('wreath-left')}${botanical('wreath-right')}<span aria-hidden="true">♡</span></div>${heading('Que hoy te pase de todo lo bonito', ui.farewellTitle)}<p class="farewell-signature">Con cariño,<br><span>${esc(card.from)}</span></p><button type="button" class="last-star ${state.lastStar ? 'discovered' : ''}" data-action="last-star" aria-label="Abrir la última estrella" aria-pressed="${state.lastStar}"><span aria-hidden="true">✧</span></button><p class="last-message" id="last-message">${esc(state.lastStar ? card.lastStar : 'Psst… todavía puedes tocar esta estrellita.')}</p>${button(ui.replay, 'replay')}${nav('')}</section>`;
}

const scenes = [welcome, garden, cake, album, gifts, stars, letter, farewell];
function render({ focus = false, restore = false } = {}) {
  app.innerHTML = scenes[state.scene]() + progress();
  document.body.dataset.scene = state.scene;
  if (state.scene === 3) preloadNext();
  if (focus) app.querySelector('h1')?.focus({ preventScroll: true });
  if (focus) window.scrollTo({ top: restore ? scrollPositions[state.scene] : 0, behavior: 'instant' });
}
function goScene(index, { push = true, restore = false } = {}) {
  if (index < 0 || index >= scenes.length) return;
  scrollPositions[state.scene] = window.scrollY;
  if (dialog.open) closePhoto();
  state.scene = index;
  document.querySelector('#particles').replaceChildren();
  if (push) history.pushState({ annyScene: index }, '', `#${slugs[index]}`);
  render({ focus: true, restore });
  if (index === 7) burst('confetti');
}
function openEnvelope() {
  if (opening || state.envelope) return;
  opening = true;
  app.querySelector('.envelope-composition').classList.add('opening');
  app.querySelectorAll('[data-action="open-envelope"]').forEach(b => b.disabled = true);
  setTimeout(() => {
    opening = false; state.envelope = true;
    if (state.scene === 0) render({ focus: true });
  }, reducedMotion.matches ? 80 : 900);
}
function setFlower(index) {
  state.flower = index;
  if (!state.wishes.includes(index)) state.wishes.push(index);
  app.querySelectorAll('[data-flower]').forEach((b, i) => {
    b.classList.toggle('selected', i === index);
    b.classList.toggle('discovered', state.wishes.includes(i));
    b.setAttribute('aria-pressed', String(i === index));
    b.querySelector('.flower-number').textContent = state.wishes.includes(i) ? '♡' : String(i + 1).padStart(2, '0');
  });
  const note = app.querySelector('#wish-note');
  note.querySelector('p').textContent = card.wishes[index];
  pop(note);
  app.querySelector('#flower-count').textContent = `${state.wishes.length} de 5 deseos descubiertos`;
  announce(card.wishes[index]);
}
function pop(element) {
  if (!element || reducedMotion.matches) return;
  element.animate?.([{ opacity: .5, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
}
function changeCandles() {
  if (state.candles === 'out') return;
  state.candles = nextCandles(state.candles);
  app.querySelector('.cake-scene').dataset.candles = state.candles;
  app.querySelector('#candle-controls').innerHTML = candleControls();
  if (state.candles === 'out') {
    app.querySelector('.party-stage').classList.add('celebrating');
    burst('confetti'); announce(ui.cakeCelebration);
    app.querySelector('[data-action="next"]')?.focus({ preventScroll: true });
  } else { announce('Deseo pedido. Ya puedes apagar las velitas.'); app.querySelector('[data-action="candles"]')?.focus({ preventScroll: true }); }
}
function relight() {
  if (state.candles !== 'out') return;
  state.candles = 'lit';
  app.querySelector('.cake-scene').dataset.candles = 'lit';
  app.querySelector('.party-stage').classList.remove('celebrating');
  app.querySelector('#candle-controls').innerHTML = candleControls();
  document.querySelector('#particles').replaceChildren();
  announce('Las velitas están encendidas otra vez.');
  app.querySelector('[data-action="candles"]')?.focus({ preventScroll: true });
}
function touchPet(which) {
  const message = app.querySelector(`#${which}-message`);
  message.textContent = card.pets[which]; message.classList.add('visible'); pop(message);
  const pet = app.querySelector(`.${which}-reaction`);
  pet?.getAnimations().forEach(a => a.cancel());
  if (!reducedMotion.matches) pet?.animate?.([
    { transform: 'translateY(0) scale(1)' }, { transform: 'translateY(3px) scale(1.04,.95)', offset: .15 },
    { transform: 'translateY(-23px) scale(.97,1.03)', offset: .5 }, { transform: 'translateY(0) scale(1)' },
  ], { duration: 650, easing: 'ease-in-out' });
  announce(card.pets[which]);
}
function touchBalloon(element) {
  if (!reducedMotion.matches) element.animate?.([{ transform: 'translateY(0)' }, { transform: 'translateY(-16px) rotate(5deg)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 600, easing: 'ease-out' });
  const box = element.getBoundingClientRect();
  const sparkle = document.createElement('span');
  sparkle.className = 'balloon-spark'; sparkle.textContent = '♡';
  sparkle.style.left = `${box.x + box.width / 2}px`; sparkle.style.top = `${box.y + 12}px`;
  document.querySelector('#particles').append(sparkle);
  setTimeout(() => sparkle.remove(), reducedMotion.matches ? 300 : 1000);
}
function burst(type) {
  clearTimeout(particleTimer);
  const layer = document.querySelector('#particles'); layer.replaceChildren();
  const count = reducedMotion.matches ? 6 : 52;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('i');
    particle.className = type;
    particle.style.cssText = `--x:${Math.random() * 100}%;--drift:${Math.random() * 140 - 70}px;--spin:${Math.random() * 720 - 360}deg;--delay:${Math.random() * .4}s;--color:${['#d79bad', '#c2b0d4', '#d4b66c', '#f0cfb1', '#aebd9c'][i % 5]}`;
    layer.append(particle);
  }
  particleTimer = setTimeout(() => layer.replaceChildren(), reducedMotion.matches ? 500 : 3600);
}
function preloadNext() {
  if (photos[state.photo + 1]) { const image = new Image(); image.src = photos[state.photo + 1].src; }
}
function changePhoto(direction) {
  const next = state.photo + direction;
  if (next < 0 || next >= photos.length) return;
  state.photo = next;
  const top = window.scrollY;
  render(); window.scrollTo({ top, behavior: 'instant' });
  announce(`Foto ${next + 1} de ${photos.length}`);
}
function zoomPhoto() {
  const current = photos[state.photo];
  if (!current || performance.now() - lastSwipeTime < 400) return;
  photoOpener = document.activeElement;
  document.querySelector('#large-photo').src = current.full || current.src;
  document.querySelector('#large-photo').alt = current.alt;
  document.querySelector('#lightbox-count').textContent = `${state.photo + 1} de ${photos.length}`;
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  document.body.classList.add('modal-open');
  document.querySelector('#close-photo').focus();
}
function closePhoto() {
  if (dialog.close) dialog.close(); else { dialog.removeAttribute('open'); afterClose(); }
}
function afterClose() {
  document.body.classList.remove('modal-open');
  document.querySelector('#large-photo').removeAttribute('src');
  (photoOpener?.isConnected ? photoOpener : app.querySelector('#zoom-photo'))?.focus({ preventScroll: true });
}
function openGift(index) {
  state.gift = index;
  if (!state.gifts.includes(index)) state.gifts.push(index);
  render(); app.querySelector(`[data-gift="${index}"]`)?.focus({ preventScroll: true });
  announce(card.gifts[index].text);
}
function selectStar(index) {
  state.star = index;
  if (!state.stars.includes(index)) state.stars.push(index);
  app.querySelectorAll('[data-star]').forEach((b, i) => {
    b.classList.toggle('discovered', state.stars.includes(i)); b.setAttribute('aria-pressed', String(i === index));
  });
  app.querySelector('#star-message p').textContent = card.stars[index];
  pop(app.querySelector('#star-message')); announce(card.stars[index]);
}
async function replay() {
  state = freshState(); scrollPositions.fill(0);
  opening = false;
  if (card.music.resetOnReplay) { await music.off(); updateMusic(); }
  history.replaceState({ annyScene: 0 }, '', '#sobre');
  clearTimeout(particleTimer); document.querySelector('#particles').replaceChildren();
  render({ focus: true });
}
function updateMusic() {
  const active = music.active;
  const control = document.querySelector('#music');
  control.setAttribute('aria-pressed', String(active));
  control.setAttribute('aria-label', active ? 'Pausar música' : 'Activar música');
  document.querySelector('#music-label').textContent = active ? 'Música encendida' : 'Música apagada';
  document.querySelector('#music-icon').textContent = active ? '♫' : '♪';
}

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action], [data-flower], [data-pet], [data-balloon], [data-gift], [data-star]');
  if (!target || target.disabled) return;
  if (target.hasAttribute('data-flower')) return setFlower(Number(target.dataset.flower));
  if (target.hasAttribute('data-pet')) return touchPet(target.dataset.pet);
  if (target.hasAttribute('data-balloon')) return touchBalloon(target);
  if (target.hasAttribute('data-gift')) return openGift(Number(target.dataset.gift));
  if (target.hasAttribute('data-star')) return selectStar(Number(target.dataset.star));
  switch (target.dataset.action) {
    case 'open-envelope': openEnvelope(); break;
    case 'close-envelope': state.envelope = false; render({ focus: true }); break;
    case 'next': goScene(state.scene + 1); break;
    case 'back': goScene(state.scene - 1, { restore: true }); break;
    case 'candles': changeCandles(); break;
    case 'relight': relight(); break;
    case 'photo-prev': changePhoto(-1); break;
    case 'photo-next': changePhoto(1); break;
    case 'zoom': zoomPhoto(); break;
    case 'open-box':
      if (!state.box) { state.box = true; render(); app.querySelector('[data-gift="0"]')?.focus({ preventScroll: true }); }
      break;
    case 'special-star':
      state.special = true; state.star = -1; render();
      app.querySelector('[data-action="special-star"]')?.focus({ preventScroll: true }); announce(card.specialStar); break;
    case 'last-star':
      state.lastStar = true; target.classList.add('discovered'); target.setAttribute('aria-pressed', 'true');
      app.querySelector('#last-message').textContent = card.lastStar; announce(card.lastStar); break;
    case 'replay': void replay(); break;
  }
});
app.addEventListener('keydown', event => {
  const svgButton = event.target.closest('g[role="button"]');
  if (svgButton && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault(); svgButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  if (state.scene === 3 && !dialog.open && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); changePhoto(event.key === 'ArrowRight' ? 1 : -1);
  }
});
app.addEventListener('pointerdown', event => {
  if (event.target.closest('.photo-swipe') && event.isPrimary) pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
app.addEventListener('pointerup', event => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const direction = swipeDirection(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (direction) { lastSwipeTime = performance.now(); changePhoto(direction); }
});
app.addEventListener('pointercancel', () => { pointerStart = null; });
app.addEventListener('error', event => {
  if (event.target.id === 'album-image') {
    const wrap = event.target.closest('.photo-image-wrap');
    wrap.innerHTML = '<p class="photo-error">Esta fotito no pudo cargar. Puedes pasar a la siguiente.</p>';
    announce('No se pudo cargar esta foto. Puedes continuar con las flechitas.');
  }
}, true);
document.querySelector('#music').addEventListener('click', async () => {
  if (audioBusy) return;
  audioBusy = true;
  try { await music.toggle(); updateMusic(); }
  catch { announce('La música no se pudo activar. Puedes seguir abriendo todas las sorpresas.'); }
  finally { audioBusy = false; }
});
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); goScene(0, { restore: true }); });
document.querySelector('#close-photo').addEventListener('click', closePhoto);
dialog.addEventListener('click', event => { if (event.target === dialog) closePhoto(); });
dialog.addEventListener('close', afterClose);
dialog.addEventListener('cancel', () => document.body.classList.remove('modal-open'));
document.addEventListener('keydown', event => {
  if (dialog.open && event.key === 'Escape' && !dialog.showModal) closePhoto();
  if (dialog.open && event.key === 'Tab') { event.preventDefault(); document.querySelector('#close-photo').focus(); }
});
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  music.visibility().catch(() => announce('Toca el control para volver a activar la música.'));
});
window.addEventListener('popstate', event => {
  if (Number.isInteger(event.state?.annyScene)) goScene(event.state.annyScene, { push: false, restore: true });
});
history.replaceState({ annyScene: 0 }, '', '#sobre');
document.title = `${card.title} 💌`;
document.querySelector('.brand i').textContent = `para ${card.to}`;
document.querySelector('.brand').setAttribute('aria-label', `${card.title}, volver al sobre`);
document.querySelector('.footer>span:nth-child(2)').firstChild.textContent = `De ${card.from}, con cariño `;
if (!card.music.enabled) document.querySelector('#music').hidden = true;
render();
