// Ortak belirlenimci sözde rastgele üreteç: seçenek sırası (v1.1) ve deste (v1.2) aynı tohumdan türer.

/** mulberry32 — küçük, belirlenimci sözde rastgele üreteç. Kriptografik değildir; gerek de yok. */
export function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates, verilen üreteçle; girdiyi değiştirmez. */
export function shuffled<T>(items: readonly T[], rnd: () => number): T[] {
  const o = [...items];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [o[i], o[j]] = [o[j]!, o[i]!];
  }
  return o;
}
