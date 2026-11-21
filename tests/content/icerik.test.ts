// README "İçerik doğrulama" — gerçek kart seti temiz, bozuk setin her kusuru adıyla yakalanır.
import { describe, expect, it } from 'vitest';
import { CARDS } from '../../src/content/cards.ts';
import { validateCards } from '../../src/content/validate-cards.ts';

const clone = () => JSON.parse(JSON.stringify(CARDS)) as any[];

describe('Gerçek kart seti', () => {
  it('doğrulamadan geçer: 12 kart, 36 seçenek, hata yok', () => {
    expect(validateCards(CARDS)).toEqual([]);
    expect(CARDS).toHaveLength(12);
    expect(CARDS.flatMap((c) => c.options)).toHaveLength(36);
  });

  it('belgedeki üç örnek kart README tablolarıyla birebir', () => {
    const fx = (cid: string) => CARDS.find((c) => c.id === cid)!.options.map((o) => [o.text, o.effects.cash, o.effects.customers, o.effects.morale]);
    expect(fx('ilk-musteri')).toEqual([
      ['Sadece istenen CSV özelliğini yap', -5000, 3, 0],
      ['Genel amaçlı dışa aktarma motoru yaz', -20000, 0, 0],
      ['Kendi dosya biçimimizi tasarla', -30000, 0, 15],
    ]);
    expect(fx('api-faturasi')).toEqual([
      ['Bu turun hizmet ücretini öde, ürüne devam et', -300, 0, 0],
      ['Entegrasyonu şimdilik kaldır', 0, -2, 0],
      ['Alternatifini kendimiz yazalım', -15000, 0, 10],
    ]);
    expect(fx('rakip')).toEqual([
      ['Müşterilerle konuş', -2000, 2, 0],
      ['Ürünün farkını anlatan kısa demo hazırla', -3000, 1, 0],
      ['Rust’a geç', -25000, 0, 20],
    ]);
  });

  it('günlük metni müşteri kaybını söylüyorsa sayı da kayıp göstermeli (ve tersi değil)', () => {
    // README içerik kontrolü: "Gerçekte müşteri kaybı yokken metin müşteri sayısının azaldığını mı söylüyor?"
    // İstisna yok: kart 1 "bicim" metni Ö1-A ile düzeltildi (K11), kapı 36 seçeneğin hepsini denetler.
    const suspects = CARDS.flatMap((c) =>
      c.options
        // "Çekirdek ayrıldı" gibi müşteri dışı fiiller yanlış alarm verdiği için yalın "ayrıldı" desende yok.
        .filter((o) => /gitti|kaybett|müşteri\S* ayrıldı|kendilerini kaldırdı/i.test(o.log) && o.effects.customers >= 0)
        .map((o) => `${c.id}/${o.id}`),
    );
    expect(suspects).toEqual([]);
  });
});

describe('Negatif kontrol: bozuk set reddedilir ve nedeni söylenir', () => {
  it('11 kart', () => {
    expect(validateCards(clone().slice(0, 11))).toContain('Kart sayısı 11; tam olarak 12 olmalı');
  });
  it('tekrar eden kart kimliği', () => {
    const c = clone();
    c[5].id = c[0].id;
    expect(validateCards(c).some((e) => e.includes('kart[6]') && e.includes('kimlik tekrar ediyor'))).toBe(true);
  });
  it('iki seçenekli kart', () => {
    const c = clone();
    c[2].options.pop();
    expect(validateCards(c).some((e) => e.includes('"rakip"') && e.includes('2 seçenek var'))).toBe(true);
  });
  it('kart içinde tekrar eden seçenek kimliği', () => {
    const c = clone();
    c[0].options[1].id = 'csv';
    expect(validateCards(c).some((e) => e.includes('kart içinde tekrar ediyor'))).toBe(true);
  });
  it('boş başlık, boş günlük metni', () => {
    const c = clone();
    c[3].title = '   ';
    c[4].options[0].log = '';
    const e = validateCards(c);
    expect(e.some((x) => x.includes('"eklenti"') && x.includes('başlık boş'))).toBe(true);
    expect(e.some((x) => x.includes('"logo"') && x.includes('günlük metni boş'))).toBe(true);
  });
  it('eksik ya da ondalık etki sessizce sıfır sayılmaz', () => {
    const c = clone();
    delete c[6].options[0].effects.cash;
    c[7].options[1].effects.morale = 2.5;
    const e = validateCards(c);
    expect(e.some((x) => x.includes('etkiler.cash tam sayı değil (undefined)'))).toBe(true);
    expect(e.some((x) => x.includes('etkiler.morale tam sayı değil (2.5)'))).toBe(true);
  });
  it('tanımsız etiket', () => {
    const c = clone();
    c[8].options[2].tags = ['altyapi'];
    expect(validateCards(c).some((x) => x.includes('tanımsız etiket "altyapi"'))).toBe(true);
  });
  it('dizi olmayan girdi', () => {
    expect(validateCards({})).toEqual(['Kart seti bir dizi değil']);
  });
});
