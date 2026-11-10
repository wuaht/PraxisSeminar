const WERKE = [
  { src: '1.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Dachzimmer mit gestreifter Tapete, offenem Spitzbogenfenster, Schreibtisch, Stuhl und Bett' },
  { src: '2.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Kind mit braunen Haaren und blauem T-Shirt sitzt vor einem Fenster mit orangen Vorhängen' },
  { src: '3.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Esszimmer mit gedecktem Tisch, zwei Holzstühlen, Bücherschrank, Teppich und sonnigem Fenster' },
  { src: '4.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Nahaufnahme des Kindes, das mit halb geschlossenen Augen auf dem Holzboden liegt' },
  { src: '5.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Das Kind liegt ausgestreckt auf dem Holzboden und schaut nach oben' },
  { src: '6.webp', artist: 'La. A.', alt: 'Digitale Zeichnung: Kleines efeubewachsenes Haus mit rotem Dach auf einer Wiese unter blauem Himmel' },
  { src: '7.webp', artist: 'C. Z.', alt: '„Das Gestern“, Interpretation nach Marcel van Eeden. Kohlezeichnungen in vier Panels: Dachkante von unten, Auto auf einer Straße, grasendes Pferd und Blick auf ein Rad' },
  { src: '8.webp', artist: 'Y. T.', alt: 'Comicseite in Buntstift: Frau sitzt im Flur, eine Silhouette steht in der Tür; darunter Nahaufnahme mit Sprechblase „Wo ist Bond?!“' },
  { src: '10.webp', artist: 'Le. A.', alt: 'Buntstiftzeichnungen in Pappe-Rahmen mit Flaggenfarben: sechs Panels mit Alltagsszenen aus verschiedenen Kulturen, umrankt von Efeu' },
  { src: '11.webp', artist: 'D. D.', alt: 'Bleistift-Comicseite mit gerissenen Panels: Tiermasken vor einer Silhouette, Sprechblasen „Auch wenn uns das Leben Rollen zuweist …“ und „… müssen wir die nicht spielen.“; daneben Frau im Licht, Titel „Menschen sind mehr als Kategorien“' },
];
const BREAKOUT_INDEX = 4;

const carousel = document.getElementById('carousel');
const img = document.getElementById('carousel-img');
const artistEl = document.getElementById('carousel-artist');
const countEl = document.getElementById('carousel-count');
const tablist = document.getElementById('artist-tabs');
const panels = document.getElementById('artist-panels');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const artists = [...new Set(WERKE.map(w => w.artist))];
const byArtist = a => WERKE.map((w, i) => ({ ...w, i })).filter(w => w.artist === a);
const path = src => `bilder/${src}`;
let current = 0;

const tabs = artists.map((a, t) => {
  const id = `artist-${t}`;
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'artist-tab';
  tab.id = `${id}-tab`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `${id}-panel`);
  tab.innerHTML = `${a} <span class="artist-tab-count">${byArtist(a).length}</span>`;
  tab.addEventListener('click', () => show(byArtist(a)[0].i));
  tablist.append(tab);

  const panel = document.createElement('div');
  panel.className = 'artist-panel';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  byArtist(a).forEach((w, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.dataset.index = w.i;
    b.setAttribute('aria-label', `Werk ${n + 1} von ${a} anzeigen`);
    b.innerHTML = `<img src="${path(w.src)}" alt="" loading="lazy" />`;
    b.addEventListener('click', () => show(w.i));
    panel.append(b);
  });
  panels.append(panel);
  return tab;
});

function show(i, dir = Math.sign(i - current)) {
  current = (i + WERKE.length) % WERKE.length;
  const w = WERKE[current];
  const own = byArtist(w.artist);

  img.src = path(w.src);
  img.alt = w.alt;
  artistEl.textContent = w.artist;
  countEl.textContent = `${own.findIndex(o => o.i === current) + 1} / ${own.length}`;

  if (dir && !reduceMotion.matches) {
    img.classList.remove('wipe-left', 'wipe-right');
    void img.offsetWidth;
    img.classList.add(dir > 0 ? 'wipe-right' : 'wipe-left');
  }

  const active = artists.indexOf(w.artist);
  tabs.forEach((tab, t) => {
    tab.setAttribute('aria-selected', t === active);
    tab.tabIndex = t === active ? 0 : -1;
    panels.children[t].hidden = t !== active;
  });
  panels.querySelectorAll('.thumb').forEach(b => {
    const on = Number(b.dataset.index) === current;
    b.classList.toggle('is-active', on);
    b.toggleAttribute('aria-current', on);
  });
  carousel.classList.toggle('breakout-home', current === BREAKOUT_INDEX);

  new Image().src = path(WERKE[(current + 1) % WERKE.length].src);
}

carousel.querySelector('.carousel-prev').addEventListener('click', () => show(current - 1, -1));
carousel.querySelector('.carousel-next').addEventListener('click', () => show(current + 1, 1));

carousel.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const step = e.key === 'ArrowRight' ? 1 : -1;
  e.preventDefault();
  if (tablist.contains(e.target)) {
    const t = (artists.indexOf(WERKE[current].artist) + step + artists.length) % artists.length;
    show(byArtist(artists[t])[0].i, step);
    tabs[t].focus();
  } else {
    show(current + step, step);
  }
});

let touchX = null;
img.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
img.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
});

show(0, 0);
