import { photos } from './photos.js';

// Textos, orden del álbum y música: todo lo personal se edita aquí.
export const card = {
  to: 'Anny', from: 'Luis', date: '16 de noviembre',
  title: 'Un regalito para Anny',
  music: { enabled: true, resetOnReplay: false, volume: 0.17 },
  photos,
  scenes: ['El sobre', 'Los deseos', 'Tu pastelito', 'Los recuerditos', 'Tres cositas', 'Las estrellas', 'Mi cartita', 'Para ti'],
  welcome: 'Tengo un regalito para ti, Anny 💌',
  intro: [
    'Holaaa, Annyyy. ¡Feliz cumple! 🥳',
    'Espero que hoy te la pases bien bonito y que te consientan mucho. Se me ocurrió hacerte algo diferente, así que te preparé unas sorpresitas. Espero que te gusten ❤️',
  ],
  wishes: [
    'Que este año te pasen un montón de cosas que te hagan feliz',
    'Que te vaya bien en todo lo que traes en mente',
    'Que tengas tiempo para descansar y hacer lo que te gusta',
    'Que siempre tengas cerquita a la gente que te quiere',
    'Que vengan muchos planes chidos y días de esos que quieres repetir',
  ],
  pets: { cat: 'Miauuu, feliz cumple, Anny', dog: 'Guau guau, que cumplas muchos más' },
  album: {
    title: 'Unos recuerditos bonitos 📸',
    captions: { 2: 'Me dio gusto volver a ver estas fotitos', 6: 'Esta parte tenía que estar en tu tarjeta' },
    note: 'Quería que tu tarjeta tuviera algo más personal, así que le puse estas fotitos. Espero que te hayan sacado una sonrisita. ❤️',
    empty: 'Aquí van nuestros recuerditos. Las otras sorpresitas te están esperando ♡',
  },
  gifts: [
    { title: 'Un abrazo', icon: 'hearts', text: 'Te mando un abrazote, Anny ❤️' },
    { title: 'Un recordatorio', icon: 'note', text: 'Acuérdate de consentirte tú también hoy, cumpleañera' },
    { title: 'Una sonrisita', icon: 'sparkle', text: 'Si sonreíste aunque sea tantito, ya valió la pena hacerlo jajaja' },
  ],
  stars: [
    'Que te vaya bien en lo que más te ilusiona',
    'Que nunca te falten motivos para reírte',
    'Que este año se te cumpla algo que traes en mente desde hace rato',
  ],
  specialStar: 'Esta te la guardé para el final ✨',
  finalLetter: [
    'Annyyy,',
    'Espero que te haya gustado el regalito. Quería felicitarte de una forma diferente y me dio gusto prepararte esto.',
    'De verdad espero que hoy te la pases muy bonito y que este año te traiga un montón de cosas que te hagan feliz. Que te vaya muy bien en todo lo que quieras hacer.',
    '¡Feliz cumpleaños otra vez! Te mando un abrazote, cumpleañera ❤️',
    '— Luis',
  ],
  lastStar: 'Espero haberte sacado una sonrisita. Disfruta mucho tu día ❤️',
};

export const ui = {
  open: 'Abrir mi carta', first: 'Ver mi primera sorpresa',
  gardenTitle: 'Que florezca lo bonito', gardenHint: 'Toca una flor 🌷',
  gardenEmpty: 'Hay un deseo para ti en cada una.', cakeNext: 'Ver mi pastelito',
  cakeTitle: 'Pide un deseo, Anny 🎂', cakeHint: 'Estos dos también vinieron a festejarte.',
  candleWish: 'Ya pedí mi deseo', candleBlow: 'Apagar las velitas',
  candleRelight: 'Volver a encender las velitas', cakeCelebration: '¡Feliz cumple, Anny! ❤️',
  albumNext: 'Ver tus fotitos', giftsNext: 'Todavía queda una sorpresa',
  giftsTitle: 'Todavía te guardé tres cositas', giftsHint: 'Toca el moñito. Lo de adentro es tuyo.',
  starsNext: 'Vamos a ver las estrellas', starsTitle: 'Un cielito de buenos deseos',
  starsHint: 'Toca las estrellas, hay algo para ti.', letterNext: 'Leer mi cartita',
  letterTitle: 'Una última cartita', farewellNext: 'Un último detallito',
  farewellTitle: '¡Feliz cumpleaños, Anny! 🎂', replay: 'Volver a ver la tarjeta',
};
