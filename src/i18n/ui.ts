// v1.4 arayüz metinleri. Türkçe metinler v1.3'tekiyle birebir (testler aynı metni arar). İngilizce aynı
// anahtarları taşımak ZORUNDA: `Metin` arayüzü eksik anahtarı derlemede kırmızı verir.
// Sayılar (hafta, kasa, hedef) metne yazılmaz; RULES'tan gelir.
import { RULES } from '../core/new-game.ts';
import type { Dil } from './dil.ts';

const MINUS = '−';
const NF: Record<Dil, Intl.NumberFormat> = { tr: new Intl.NumberFormat('tr-TR'), en: new Intl.NumberFormat('en-US') };

/** Kasa göstergesi bu değerin altında ⚠ ile kırmızı yanar (render ve rehber aynı değeri kullanır). */
export const KASA_UYARI = 20_000;

export const sayi =(n: number, dil: Dil): string => `${n < 0 ? MINUS : ''}${NF[dil].format(Math.abs(n))}`;
export const para = (n: number, dil: Dil): string => `${sayi(n, dil)} TL`;

export interface Metin {
  dilDugmesi: string; // öteki dile geçen düğme, o dilin kendi adıyla
  dilDugmesiEtiket: string;
  hafta: (n: number, toplam: number) => string;
  haftaKisa: (n: number) => string;
  gostergeler: string;
  kasa: string;
  odeyenMusteri: string;
  kurucuMorali: string;
  musteri: string;
  moral: string;
  gunlukEtiket: string;
  gunlukBaslik: string;
  gunlukBos: string;
  slogan: string;
  giris: string;
  kurallar: string[];
  sirketiKur: string;
  acilisNotu: string;
  rehberAc: string;
  kararlar: string;
  degismedi: string;
  sinir: (n: number) => string;
  kararBaslik: (t: string) => string;
  kasaBittiAlarm: string;
  sonHaftaAlarm: string;
  sonuclariGor: string;
  sonrakiHafta: string;
  ayakta: string;
  kapandi: string;
  nedenKazandi: string;
  nedenKasa: (hafta: number) => string;
  nedenMusteri: (musteri: number, hedef: number) => string;
  paylasOzet: (kasa: string, musteri: number, hedef: number, moral: string, altyapi: number) => string;
  paylasUnvanlar: (unvanlar: string) => string;
  paylasUnvanYok: string;
  paylasBaglanti: (url: string) => string;
  kopyalaDugme: string;
  kopyalandi: string;
  kopyalanamadi: string;
  sonucMetni: string;
  dayanilan: string;
  haftaSayisi: (n: number) => string;
  kalanKasa: string;
  altyapiKarari: string;
  sonImza: string;
  sonHarcama: string;
  harcamaYok: string;
  yatirimciYorumu: string;
  karne: string;
  unvanYok: string;
  geridekalanlar: string;
  kararOzeti: string;
  ozetBasliklar: [string, string, string, string];
  baslangic: string;
  yenidenDene: string;
  sucuAt: string;
  kayitYok: string;
  kayitSatir: (oynanan: number, kazanilan: number, iyi: string | null) => string;
  altSatir: string;
  tohum: (n: number) => string;
  icerikHatasi: string;
  icerikHatasiAyrinti: (n: number) => string;
  tohumGecersiz: (raw: string) => string;
  rehberBaslik: string;
  rehberGeri: string;
}

export const UI: Record<Dil, Metin> = {
  tr: {
    dilDugmesi: 'English',
    dilDugmesiEtiket: 'Switch to English',
    hafta: (n, t) => `Hafta ${n} / ${t}`,
    haftaKisa: (n) => `H${n}`,
    gostergeler: 'Göstergeler',
    kasa: 'Kasa',
    odeyenMusteri: 'Ödeme yapan müşteri',
    kurucuMorali: 'Kurucu morali',
    musteri: 'Müşteri',
    moral: 'Moral',
    gunlukEtiket: 'Faaliyet günlüğü',
    gunlukBaslik: 'FAALİYET GÜNLÜĞÜ',
    gunlukBos: 'Henüz bir şey yapılmadı. Bu, şirket tarihimizin en kârlı dönemi.',
    slogan: 'Girişimini batmadan önce batır.',
    giris: `${RULES.turns} hafta. ${para(RULES.startCash, 'tr')}. Sıfır müşteri. Bir de “bunu baştan yazsak daha temiz olur” diye fısıldayan iç sesin.`,
    kurallar: [
      'Her hafta bir olay kartı açılır; üç karardan birini seçersin.',
      `Kazanmak için ${RULES.turns}. haftanın sonunda kasan 0 TL’nin üzerinde ve en az ${RULES.customerTarget} ödeme yapan müşterin olmalı.`,
      'Kasa 0 TL’ye ya da altına düşerse şirket o anda kapanır.',
      'Moral yüksek olabilir. Bu, şirketin iyi olduğu anlamına gelmez.',
    ],
    sirketiKur: 'Şirketi kur',
    acilisNotu: 'Açılış animasyonu yatırım turundan sonra.',
    rehberAc: 'Nasıl oynanır?',
    kararlar: 'Kararlar',
    degismedi: 'Değişmedi',
    sinir: (n) => ` (sınır ${n})`,
    kararBaslik: (t) => `KARAR: ${t}`,
    kasaBittiAlarm: 'Kasada para kalmadı. Muhasebeci telefonu açmıyor.',
    sonHaftaAlarm: 'Son hafta bitti. Hesaplar kapanıyor…',
    sonuclariGor: 'Sonuçları gör',
    sonrakiHafta: 'Sonraki hafta',
    ayakta: 'ŞİRKET AYAKTA',
    kapandi: 'ŞİRKET KAPANDI',
    nedenKazandi: 'Kasa pozitif, müşteri hedefi tuttu. Kimse buna hazırlıklı değildi.',
    nedenKasa: (h) => `Şirketiniz ${h}. haftada kapandı: kasa tükendi.`,
    nedenMusteri: (m, t) => `${RULES.turns} hafta dayandınız ama yalnız ${m} ödeme yapan müşteriniz var; hedef ${t}.`,
    paylasOzet: (k, m, t, mo, a) => `Kasa ${k} · Müşteri ${m} / ${t} · Moral ${mo} · Altyapı kararı ${a}`,
    paylasUnvanlar: (u) => `Unvanlar: ${u}`,
    paylasUnvanYok: 'Unvan yok. Vasatlık da bir başarıdır.',
    paylasBaglanti: (u) => `Sen de batır: ${u}`,
    kopyalaDugme: 'Sonucu kopyala',
    kopyalandi: 'Sonuç panoya kopyalandı.',
    kopyalanamadi: 'Kopyalanamadı (tarayıcı izin vermedi). Metni aşağıdan seçip kopyalayabilirsiniz.',
    sonucMetni: 'Sonuç metni',
    dayanilan: 'Dayanılan süre',
    haftaSayisi: (n) => `${n} hafta`,
    kalanKasa: 'Kalan kasa',
    altyapiKarari: 'Alınan altyapı kararı',
    sonImza: 'Son imza',
    sonHarcama: 'Son harcama',
    harcamaYok: 'Hiç harcama yapılmadı. Şüpheli.',
    yatirimciYorumu: 'Yatırımcı yorumu: ',
    karne: 'KURUCU KARNESİ',
    unvanYok: 'Bu oyunda özel bir unvan kazanılmadı. Vasatlık da bir başarıdır; sadece ödülü yoktur.',
    geridekalanlar: 'GERİDE KALANLAR',
    kararOzeti: 'KARAR ÖZETİ',
    ozetBasliklar: ['Hafta', 'Karar', 'Kasaya etkisi', 'Kalan kasa'],
    baslangic: 'Başlangıç',
    yenidenDene: 'Yeniden dene',
    sucuAt: 'Suçu teknoloji yığınına at',
    kayitYok: 'Bu tarayıcı sonuç saklamıyor (özel pencere ya da engellenmiş site verisi).',
    kayitSatir: (o, k, iyi) => `Bu tarayıcıda: ${o} oyun, ${k} kazanma · ${iyi === null ? 'henüz kazanılmış oyun yok' : `en iyi kasa ${iyi}`}.`,
    altSatir: 'BatışOS · eklenti sistemi yoktur ve olmayacaktır. · ',
    tohum: (n) => ` · tohum ${n}`,
    icerikHatasi: 'Şirket henüz kurulamadı. Bu kez sorun gerçekten bizde.',
    icerikHatasiAyrinti: (n) => `Geliştirici için: ${n} içerik hatası`,
    tohumGecersiz: (r) => `Bağlantıdaki tohum geçersiz ("${r}"); rastgele bir deste açıldı.`,
    rehberBaslik: 'Oyun rehberi',
    rehberGeri: 'Oyuna dön',
  },
  en: {
    dilDugmesi: 'Türkçe',
    dilDugmesiEtiket: 'Türkçeye geç',
    hafta: (n, t) => `Week ${n} / ${t}`,
    haftaKisa: (n) => `W${n}`,
    gostergeler: 'Indicators',
    kasa: 'Cash',
    odeyenMusteri: 'Paying customers',
    kurucuMorali: 'Founder morale',
    musteri: 'Customers',
    moral: 'Morale',
    gunlukEtiket: 'Activity log',
    gunlukBaslik: 'ACTIVITY LOG',
    gunlukBos: 'Nothing has happened yet. This is the most profitable period in company history.',
    slogan: 'Sink your startup before it sinks.',
    giris: `${RULES.turns} weeks. ${para(RULES.startCash, 'en')}. Zero customers. And that inner voice whispering “it would be cleaner if we rewrote this from scratch.”`,
    kurallar: [
      'Each week an event card turns up; you pick one of three decisions.',
      `To win, at the end of week ${RULES.turns} your cash must be above 0 TL and you need at least ${RULES.customerTarget} paying customers.`,
      'If cash drops to 0 TL or below, the company closes on the spot.',
      'Morale can be high. That does not mean the company is doing well.',
    ],
    sirketiKur: 'Found the company',
    acilisNotu: 'Intro animation coming after the funding round.',
    rehberAc: 'How to play',
    kararlar: 'Decisions',
    degismedi: 'No change',
    sinir: (n) => ` (limit ${n})`,
    kararBaslik: (t) => `DECISION: ${t}`,
    kasaBittiAlarm: 'The cash is gone. The accountant is not picking up.',
    sonHaftaAlarm: 'The last week is over. Closing the books…',
    sonuclariGor: 'See the results',
    sonrakiHafta: 'Next week',
    ayakta: 'COMPANY STILL STANDING',
    kapandi: 'COMPANY CLOSED',
    nedenKazandi: 'Cash positive, customer target met. Nobody was prepared for this.',
    nedenKasa: (h) => `Your company closed in week ${h}: the cash ran out.`,
    nedenMusteri: (m, t) => `You lasted ${RULES.turns} weeks, but you only have ${m} paying customers; the target was ${t}.`,
    paylasOzet: (k, m, t, mo, a) => `Cash ${k} · Customers ${m} / ${t} · Morale ${mo} · Infrastructure decisions ${a}`,
    paylasUnvanlar: (u) => `Titles: ${u}`,
    paylasUnvanYok: 'No titles. Mediocrity is an achievement too.',
    paylasBaglanti: (u) => `Sink yours too: ${u}`,
    kopyalaDugme: 'Copy result',
    kopyalandi: 'Result copied to the clipboard.',
    kopyalanamadi: 'Could not copy (the browser did not allow it). You can select and copy the text below.',
    sonucMetni: 'Result text',
    dayanilan: 'Weeks survived',
    haftaSayisi: (n) => `${n} ${n === 1 ? 'week' : 'weeks'}`,
    kalanKasa: 'Cash left',
    altyapiKarari: 'Infrastructure decisions taken',
    sonImza: 'Last signature',
    sonHarcama: 'Last spend',
    harcamaYok: 'Not a single expense. Suspicious.',
    yatirimciYorumu: 'Investor comment: ',
    karne: 'FOUNDER REPORT CARD',
    unvanYok: 'No special title earned this game. Mediocrity is an achievement too; it just has no trophy.',
    geridekalanlar: 'LEFT BEHIND',
    kararOzeti: 'DECISION SUMMARY',
    ozetBasliklar: ['Week', 'Decision', 'Effect on cash', 'Cash left'],
    baslangic: 'Start',
    yenidenDene: 'Try again',
    sucuAt: 'Blame the tech stack',
    kayitYok: 'This browser does not store results (private window or blocked site data).',
    kayitSatir: (o, k, iyi) =>
      `In this browser: ${o} ${o === 1 ? 'game' : 'games'}, ${k} ${k === 1 ? 'win' : 'wins'} · ${iyi === null ? 'no game won yet' : `best cash ${iyi}`}.`,
    altSatir: 'BatışOS · there is no plugin system and there never will be. · ',
    tohum: (n) => ` · seed ${n}`,
    icerikHatasi: 'The company could not be founded yet. This time it really is our fault.',
    icerikHatasiAyrinti: (n) => `For developers: ${n} content ${n === 1 ? 'error' : 'errors'}`,
    tohumGecersiz: (r) => `The seed in the link is invalid ("${r}"); a random deck was opened.`,
    rehberBaslik: 'Game guide',
    rehberGeri: 'Back to the game',
  },
};
