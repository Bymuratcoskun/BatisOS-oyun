// Seçeneklerin ekrandaki sırası (v1.1). Oyun başında seçilen tohum + tur numarasından türetilir:
// aynı oyunda yeniden çizimde yer değiştirmez, seçenek kimlikleri değişmez, çekirdek kuralları etkilenmez.
// Neden: v1.0'da en pahalı seçenek 12/12 kartta üçüncü sıradaydı ve "hep 1" metin okunmadan kazanıyordu.

/** mulberry32 — küçük, belirlenimci sözde rastgele üreteç. Kriptografik değildir; gerek de yok. */
function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tur `turnIndex` için ekran sırası: [ilk düğmedeki seçeneğin dizini, ikinci, üçüncü]. */
export function optionOrder(seed: number, turnIndex: number): [number, number, number] {
  const rnd = mulberry32((seed ^ Math.imul(turnIndex + 1, 0x9e3779b9)) | 0);
  const o: [number, number, number] = [0, 1, 2];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [o[i], o[j]] = [o[j]!, o[i]!];
  }
  return o;
}

/** Yeni oyun tohumu (32 bit, işaretsiz). Tarayıcıda ve Node'da `crypto` var. */
export function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]!;
}
