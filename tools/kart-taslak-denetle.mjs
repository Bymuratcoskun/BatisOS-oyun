// Kart taslağı denetimi (docs/raporlar/KARTLAR-*.md): seçenek metni ≤ 60 karakter, sayılar G1 aralıklarında, etiket doğru.
// Kullanım: node tools/kart-taslak-denetle.mjs <taslak.md>. Aralık dışı her değer adıyla yazılır.
import { readFileSync } from 'node:fs';
const md = readFileSync(process.argv[2], 'utf8');
const num = (s) => Number(s.replace(/[−–]/g, '-').replace(/\./g, '').replace(/\+/g, ''));
const R = { 1: { c: [-9000, -500], m: [1, 5], o: [-10, 0], t: '—' }, 2: { c: [-8000, -500], m: [-1, 1], o: [0, 10], t: 'tanıtım' }, 3: { c: [-35000, -9000], m: [0, 0], o: [10, 20], t: 'altyapı' } };
let kart = '', n = 0, hata = [];
for (const line of md.split('\n')) {
  const h = line.match(/^### (Y\d+)/); if (h) { kart = h[1]; continue; }
  const m = line.match(/^(\d)\. \*\*(.+?)\*\* · ([−\-\d.]+) TL · ([+−\-]?\d+) · (?:moral )?\**(?:moral )?([+−\-]?\d+)\** · (\S+)/);
  if (!m || !kart) continue;
  n++;
  const [, i, text, c, mu, mo, tag] = m; const r = R[i];
  const [cv, mv, ov] = [num(c), num(mu), num(mo)];
  if ([...text].length > 60) hata.push(`${kart}/${i} metin ${[...text].length} karakter`);
  if (cv < r.c[0] || cv > r.c[1]) hata.push(`${kart}/${i} kasa ${cv}`);
  if (mv < r.m[0] || mv > r.m[1]) hata.push(`${kart}/${i} müşteri ${mv}`);
  if (ov < r.o[0] || ov > r.o[1]) hata.push(`${kart}/${i} moral ${ov}`);
  if (tag !== r.t) hata.push(`${kart}/${i} etiket ${tag}`);
}
console.log(`KART-DENETIM secenek=${n} aralik_disi=${hata.length}`); hata.forEach((x) => console.log('  ' + x));
