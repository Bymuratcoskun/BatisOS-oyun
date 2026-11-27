// v1.4 oyun rehberi — Türkçe ve İngilizce, TEK kaynak. Oyunun içindeki "Nasıl oynanır?" ekranı ve depodaki
// REHBER.md / GUIDE.md bu dosyadan üretilir (tools/rehber-yaz). Kapı: dosyalar bu kaynaktan üretilenle
// birebir aynı olmalı (tests/content/rehber.test.ts) — elle düzenlenen ya da bayatlayan rehber kırmızıdır.
// Sayılar metne elle yazılmaz: kurallardan (RULES, CHAIN_RULES) ve kart havuzundan okunur.
import { CHAIN_RULES, fill } from '../core/chains.ts';
import { CHAIN_TEMPLATES } from '../content/chains.ts';
import { ZINCIR_EN } from './icerik-en.ts';
import { RULES } from '../core/new-game.ts';
import { CHAIN_IDS } from '../core/types.ts';
import { POOL } from '../content/pool.ts';
import { CARDS } from '../content/cards.ts';
import type { Dil } from './dil.ts';
import { KASA_UYARI, para, UI } from './ui.ts';

type L = Record<Dil, string>;
type Blok = L | L[];
interface BolumKaynak {
  id: string;
  baslik: L;
  bloklar: Blok[];
}

export interface Bolum {
  id: string;
  baslik: string;
  /** Metin = paragraf; dizi = madde listesi. */
  bloklar: (string | string[])[];
}
export interface Rehber {
  baslik: string;
  ozet: string;
  icindekiler: string;
  bolumler: Bolum[];
}

/** Örnek uyarı oyunun kendi uyarı metninden: rehber oyunla aynı cümleyi söylesin. */
const ornekUyari: L = {
  tr: fill(CHAIN_TEMPLATES.bakim.hintSlot, { gun: CHAIN_RULES.delay }),
  en: fill(ZINCIR_EN.bakim.hintSlot, { gun: CHAIN_RULES.delay }),
};
const T = RULES.turns;
const HEDEF = RULES.customerTarget;
const ds = RULES.deckShape;
const p = (n: number, d: Dil) => para(n, d);

const BOLUMLER: BolumKaynak[] = [
  {
    id: 'nedir',
    baslik: { tr: 'Oyun nedir?', en: 'What is this game?' },
    bloklar: [
      {
        tr: `BatışOS, yeni kurulmuş bir yazılım şirketinin ${T} haftasını oynatan kısa, esprili bir karar oyunudur. Bir oyun birkaç dakika sürer. Her hafta bir olay olur ve üç karardan birini seçersin.`,
        en: `BatışOS is a short, comic decision game about the first ${T} weeks of a brand-new software startup. A game takes a few minutes. Each week something happens and you pick one of three decisions.`,
      },
      {
        tr: 'Oyunun derdi şu: mühendisler çoğu zaman müşterinin istediği küçük şey yerine "doğrusunu" kurmak ister. Kendi motorumuzu yazalım, önce altyapıyı sağlam kuralım, baştan yazarsak daha temiz olur… Bu kararlar ekipte morali yükseltir ama kasayı boşaltır. Müşteriyle konuşup istediğini yapmak sıkıcı görünür ama şirketi ayakta tutar.',
        en: 'The point: engineers often want to build "the right thing" instead of the small thing the customer asked for. Let’s write our own engine, get the infrastructure solid first, it would be cleaner if we rewrote it… These choices lift team morale but drain the cash. Talking to the customer and building what they asked for looks boring, but it keeps the company alive.',
      },
      {
        tr: 'Şirket yönetimi bilmen gerekmez. Bütün sayılar ekranda yazar; oyun sana ne olacağını önceden söyler. Gerisi kartları okuyup gülmek.',
        en: 'You don’t need to know anything about running a company. Every number is on screen and the game tells you what will happen before you choose. The rest is reading the cards and laughing.',
      },
    ],
  },
  {
    id: 'baslangic',
    baslik: { tr: 'Hızlı başlangıç', en: 'Quick start' },
    bloklar: [
      [
        { tr: '"Şirketi kur" düğmesine bas.', en: 'Press "Found the company".' },
        { tr: 'Kartı oku, üç karardan birini seç. Her kararın altında kasaya, müşteriye ve morale etkisi yazar.', en: 'Read the card and pick one of the three decisions. Under each decision you see its effect on cash, customers and morale.' },
        { tr: 'Sonucu oku, "Sonraki hafta" ile devam et.', en: 'Read the outcome and continue with "Next week".' },
        {
          tr: `${T}. haftanın sonunda kasan 0 TL’nin üzerindeyse ve en az ${HEDEF} ödeme yapan müşterin varsa kazanırsın.`,
          en: `If at the end of week ${T} your cash is above 0 TL and you have at least ${HEDEF} paying customers, you win.`,
        },
      ],
    ],
  },
  {
    id: 'ekran',
    baslik: { tr: 'Ekranda ne var?', en: 'What is on the screen?' },
    bloklar: [
      [
        { tr: 'Üst çubuk: kaçıncı haftada olduğun ve dil düğmesi.', en: 'Top bar: which week you are in, and the language button.' },
        {
          tr: `Kasa: şirketin parası. ${p(RULES.startCash, 'tr')} ile başlar. ${p(KASA_UYARI, 'tr')}’nin altına inince ⚠ işaretiyle kırmızı yanar.`,
          en: `Cash: the company’s money. It starts at ${p(RULES.startCash, 'en')}. Below ${p(KASA_UYARI, 'en')} it turns red with a ⚠ sign.`,
        },
        { tr: `Ödeme yapan müşteri: ${RULES.startCustomers} ile başlar, hedef ${HEDEF}.`, en: `Paying customers: starts at ${RULES.startCustomers}, the target is ${HEDEF}.` },
        {
          tr: `Kurucu morali: ${RULES.startMorale} ile başlar, en çok ${RULES.moraleMax} olur. Sıfırın altına da inebilir. Moral oyunu bitirmez; yalnız ne kadar keyifli battığını gösterir.`,
          en: `Founder morale: starts at ${RULES.startMorale}, maxes out at ${RULES.moraleMax}. It can also go below zero. Morale never ends the game; it only shows how much fun you are having while sinking.`,
        },
        { tr: 'Faaliyet günlüğü: her haftanın sonucu, en yenisi üstte.', en: 'Activity log: the outcome of every week, newest on top.' },
        {
          tr: 'Alt satır: oyunun sürümü, kart setinin adı ve bu destenin tohumu (hata bildirirken işe yarar).',
          en: 'Bottom line: the game version, the card set name and this deck’s seed (handy when reporting a bug).',
        },
      ],
    ],
  },
  {
    id: 'hafta',
    baslik: { tr: 'Bir hafta nasıl geçer?', en: 'How does a week work?' },
    bloklar: [
      {
        tr: 'Her hafta bir olay kartı açılır: başlık, kısa bir durum ve üç karar. Kararların altında etkileri sayıyla yazar, örneğin "Kasa −5.000 TL · Müşteri +3 · Moral 0". Gizli bir etki yoktur: yazan ne ise o olur.',
        en: 'Each week an event card opens: a title, a short situation and three decisions. Under each decision its effects are written as numbers, for example "Cash −5,000 TL · Customers +3 · Morale 0". There are no hidden effects: what is written is what happens.',
      },
      {
        tr: `Karar verince sonuç ekranı gelir: göstergelerin öncesi, sonrası ve ne olduğunu anlatan kısa bir metin. Müşteri 0’ın altına, moral ${RULES.moraleMax}’ün üstüne çıkamaz; böyle bir kesinti olursa yanında "${UI.tr.sinir(RULES.moraleMax).trim()}" gibi bir not yazar.`,
        en: `After you decide, the outcome screen shows each indicator before and after, plus a short text about what happened. Customers can’t go below 0 and morale can’t go above ${RULES.moraleMax}; if a number is cut off, a note like "${UI.en.sinir(RULES.moraleMax).trim()}" says so.`,
      },
      {
        tr: 'Seçeneklerin sırası her oyunda karışır. Düğmenin yeri bir şey anlatmaz; metni okumak gerekir.',
        en: 'The order of the options is shuffled in every game. A button’s position tells you nothing; you have to read the text.',
      },
    ],
  },
  {
    id: 'bitis',
    baslik: { tr: 'Kazanmak ve kaybetmek', en: 'Winning and losing' },
    bloklar: [
      [
        { tr: 'Kasa 0 TL’ye ya da altına düşerse şirket o anda kapanır. Aynı kararla gelen müşteri seni kurtarmaz.', en: 'If cash drops to 0 TL or below, the company closes on the spot. Customers gained by the same decision don’t save you.' },
        {
          tr: `${T} haftayı bitirdiğinde kasa pozitif ve en az ${HEDEF} ödeme yapan müşteri varsa: şirket ayakta, kazandın.`,
          en: `If you finish all ${T} weeks with positive cash and at least ${HEDEF} paying customers: the company is still standing and you win.`,
        },
        {
          tr: `${T} haftayı bitirdin ama müşteri ${HEDEF}’dan azsa: kaybettin. Yatırımcı buna "kumbara" der.`,
          en: `If you finish all ${T} weeks but have fewer than ${HEDEF} customers: you lose. The investor calls that a "piggy bank".`,
        },
        { tr: 'Moral ne olursa olsun oyunu bitirmez.', en: 'Morale never ends the game, whatever it is.' },
      ],
      {
        tr: 'Müşteriler bu oyunda kendiliğinden para getirmez. Kasa yalnız kararlarla değişir, müşteri sayısı ayrı bir hedeftir.',
        en: 'In this game customers don’t bring in money on their own. Cash changes only through your decisions; the customer count is a separate goal.',
      },
    ],
  },
  {
    id: 'kararlar',
    baslik: { tr: 'Karar türleri', en: 'Kinds of decisions' },
    bloklar: [
      {
        tr: 'Kartlarda üç tür karar sık görülür. Ekranda etiket yazmaz, ama sonuç ekranındaki unvanlar ve olay zincirleri bunlara bakar:',
        en: 'Three kinds of decisions show up again and again. They are not labelled on screen, but the titles on the results screen and the event chains look at them:',
      },
      [
        { tr: 'Müşteriye dönük karar: ucuzdur, müşteri getirir, moral biraz düşer. Sıkıcıdır. İşe yarar.', en: 'Customer-facing decision: cheap, brings customers, morale dips a little. Boring. It works.' },
        { tr: 'Tanıtım kararı: duyuru, rozet, sunum, video. Moral yükselir, müşteri pek gelmez.', en: 'Promotion decision: announcements, badges, pitch decks, videos. Morale goes up, customers mostly don’t come.' },
        {
          tr: 'Altyapı kararı: "kendimiz yazalım", "önce motoru kuralım". Pahalıdır, morali en çok yükselten odur, müşteri getirmez. Sonuç ekranında kaç tane aldığın sayılır.',
          en: 'Infrastructure decision: "let’s write our own", "let’s build the engine first". Expensive, the biggest morale boost of all, brings no customers. The results screen counts how many you took.',
        },
      ],
    ],
  },
  {
    id: 'zincirler',
    baslik: { tr: 'Olay zincirleri: kararlar geri döner', en: 'Event chains: decisions come back' },
    bloklar: [
      {
        tr: `Normal oyunda bazı kararlar ${CHAIN_RULES.delay} hafta sonra geri gelir. ${CHAIN_IDS.length} zincir var ve her biri bir oyunda en fazla bir kez açılır:`,
        en: `In a normal game some decisions come back ${CHAIN_RULES.delay} weeks later. There are ${CHAIN_IDS.length} chains and each one opens at most once per game:`,
      },
      [
        { tr: `Bakım: ilk altyapı kararın ${CHAIN_RULES.delay} hafta sonra bakım ister ("O Şey Hâlâ Çalışıyor").`, en: `Maintenance: your first infrastructure decision needs maintenance ${CHAIN_RULES.delay} weeks later ("That Thing Is Still Running").` },
        { tr: `Söz: ilk tanıtım sözün ${CHAIN_RULES.delay} hafta sonra hatırlatılır ("Hani?").`, en: `Promise: your first promotional promise is brought up ${CHAIN_RULES.delay} weeks later ("So Where Is It?").` },
        {
          tr: `Teslim: ${CHAIN_RULES.teslimEsigi} müşteriye ulaştığında ${CHAIN_RULES.delay} hafta sonra herkes aynı soruyu sorar ("Bizimki Ne Zaman Hazır?").`,
          en: `Delivery: when you reach ${CHAIN_RULES.teslimEsigi} customers, ${CHAIN_RULES.delay} weeks later they all ask the same question ("When Is Ours Ready?").`,
        },
      ],
      {
        tr: `Zinciri açacak kararın altında ne olacağı önceden, turuncu bir satırla yazar; örneğin "${ornekUyari.tr}" Söylediği aynen olur.`,
        en: `Under a decision that will open a chain, an orange line tells you in advance what will happen, for example "${ornekUyari.en}" It always comes true.`,
      },
      {
        tr: `Takip kartı o haftanın kartının yerini alır ve senin kararını alıntılar. Oyun yine ${T} hafta sürer; son hafta hiç değişmez. Takip kartına yer kalmazsa (geç açılan zincir) ya da şirket erken batarsa, sonuç ekranında "GERİDE KALANLAR" başlığı altında bir satır olur.`,
        en: `The follow-up card replaces that week’s card and quotes your own decision. The game still lasts ${T} weeks; the final week never changes. If there is no room left for the follow-up (a chain opened late) or the company sinks early, a line appears under "LEFT BEHIND" on the results screen.`,
      },
    ],
  },
  {
    id: 'deste',
    baslik: { tr: 'Deste, klasik deste ve tohum', en: 'Deck, classic deck and seed' },
    bloklar: [
      {
        tr: `Her oyunda ${POOL.length} kartlık bir havuzdan ${T} kartlık bir deste kurulur: ${ds.baslangic} başlangıç, ${ds.gelisme} gelişme, ${ds.final} final kartı. Birbirine çok benzeyen kartlar aynı destede çıkmaz. Böylece her oyun biraz farklıdır.`,
        en: `Each game builds a ${T}-card deck from a pool of ${POOL.length} cards: ${ds.baslangic} early, ${ds.gelisme} middle and ${ds.final} final card. Cards that are too similar never appear in the same deck, so every game is a little different.`,
      },
      [
        {
          tr: `Klasik deste: adresin sonuna #klasik yaz. İlk sürümün ${CARDS.length} kartı, ilk sırasıyla gelir; olay zinciri yoktur.`,
          en: `Classic deck: add #klasik to the end of the address. You get the first version’s ${CARDS.length} cards in their original order, with no event chains.`,
        },
        {
          tr: 'Tohum: her destenin bir numarası vardır (alt satırda "tohum …"). #tohum-NUMARA adresi aynı desteyi ve aynı seçenek sırasını açar. Kararların farklıysa oyun yine farklı gider.',
          en: 'Seed: every deck has a number (shown as "seed …" on the bottom line). The #tohum-NUMBER address opens the same deck with the same option order. If your decisions differ, the game still goes differently.',
        },
      ],
    ],
  },
  {
    id: 'sonuc',
    baslik: { tr: 'Sonuç ekranı ve kurucu karnesi', en: 'Results screen and founder report card' },
    bloklar: [
      {
        tr: 'Oyun bitince şunları görürsün: kaç hafta dayandığın, kalan kasa, müşteri, moral, aldığın altyapı kararı sayısı, son harcaman (kazandıysan son imzan) ve bir yatırımcı yorumu. Karar özeti tablosu her kararın kasaya etkisini ve kalan kasayı hafta hafta gösterir.',
        en: 'When the game ends you see: how many weeks you lasted, cash left, customers, morale, the number of infrastructure decisions, your last spend (your last signature if you won) and an investor comment. The decision summary table shows each decision’s effect on cash and the cash left, week by week.',
      },
      { tr: 'Kurucu karnesindeki unvanlar:', en: 'Titles on the founder report card:' },
      [
        { tr: 'İstemeden CEO: kazandın.', en: 'Accidental CEO: you won.' },
        { tr: 'Mimar Sinan, Gelir Sıfır: en az 4 altyapı kararı aldın ve oyunu 0 müşteriyle bitirdin.', en: 'Mimar Sinan, Zero Revenue: you took at least 4 infrastructure decisions and finished with 0 customers.' },
        { tr: 'Sunum Unicorn’u: en az 3 tanıtım kararı aldın ve 3’ten az müşteriyle bitirdin.', en: 'Pitch Deck Unicorn: you took at least 3 promotion decisions and finished with fewer than 3 customers.' },
        { tr: 'Açık Kaynak Fedaisi: 300 TL’lik API faturasına karşı "kendimiz yazalım" dedin ve kaybettin.', en: 'Open Source Martyr: you answered the 300 TL API bill with "let’s write our own" and lost.' },
      ],
      { tr: 'Birden fazla unvan aynı anda gelebilir. Hiç unvan yoksa: vasatlık da bir başarıdır.', en: 'You can earn several titles at once. No title at all? Mediocrity is an achievement too.' },
    ],
  },
  {
    id: 'paylas',
    baslik: { tr: 'Paylaşmak ve yeniden oynamak', en: 'Sharing and playing again' },
    bloklar: [
      [
        {
          tr: '"Sonucu kopyala" sonucu ve bu destenin bağlantısını panoya kopyalar. Bağlantıyı alan arkadaşın aynı desteyle oynar. Tarayıcı izin vermezse metin seçilebilir bir kutuda çıkar.',
          en: '"Copy result" copies your result and a link to this deck. A friend who opens the link plays the same deck. If the browser does not allow copying, the text appears in a box you can select.',
        },
        { tr: 'İngilizce oynarken kopyalanan bağlantı oyunu İngilizce açar.', en: 'When you play in English, the copied link opens the game in English.' },
        { tr: '"Yeniden dene" yeni bir desteyle baştan başlar.', en: '"Try again" starts over with a new deck.' },
        {
          tr: '"Suçu teknoloji yığınına at" da baştan başlar; tek farkı günlüğe "Sorumluluk devredildi." yazmasıdır.',
          en: '"Blame the tech stack" also starts over; the only difference is that the log says "Responsibility delegated."',
        },
      ],
    ],
  },
  {
    id: 'kullanim',
    baslik: { tr: 'Klavye, dil ve erişilebilirlik', en: 'Keyboard, language and accessibility' },
    bloklar: [
      [
        { tr: '1, 2 ve 3 tuşları ekrandaki sıraya göre kararı seçer. Bütün düğmeler Tab ve Enter ile de kullanılır.', en: 'Keys 1, 2 and 3 pick the decision in its on-screen position. Every button also works with Tab and Enter.' },
        { tr: 'Artış ve azalış yalnız renkle değil, ▲ ▼ işareti ve metinle de gösterilir.', en: 'Increases and decreases are shown not only with colour but also with ▲ ▼ signs and text.' },
        { tr: 'Yazıyı büyütmek (%200’e kadar) ve dar telefon ekranı desteklenir.', en: 'Text zoom (up to 200%) and narrow phone screens are supported.' },
        {
          tr: 'Dil: üst çubuktaki düğme Türkçe ile İngilizce arasında geçer; oyunun ortasında da çalışır ve bu tarayıcıda hatırlanır. Adresin sonuna ?lang=en ya da ?lang=tr de yazılabilir.',
          en: 'Language: the button in the top bar switches between Turkish and English; it works mid-game too and is remembered in this browser. You can also add ?lang=en or ?lang=tr to the address.',
        },
        { tr: 'Oyun bir ekran okuyucuyla henüz denenmedi.', en: 'The game has not been tested with a screen reader yet.' },
      ],
    ],
  },
  {
    id: 'gizlilik',
    baslik: { tr: 'Kayıt ve gizlilik', en: 'Saving and privacy' },
    bloklar: [
      {
        tr: 'Hesap yok, sunucu yok, izleme yok. Oyun hiçbir yere veri göndermez. Bu tarayıcı yalnız şunları hatırlar: kaç oyun oynadığın, kaçını kazandığın, en iyi kasan ve dil seçimin. Özel pencerede bunlar saklanmaz; ekranda öyle yazar. Yarım kalan oyun kaydedilmez, zaten birkaç dakika sürüyor.',
        en: 'No account, no server, no tracking. The game sends data nowhere. This browser only remembers how many games you played, how many you won, your best cash and your language choice. In a private window nothing is stored, and the screen says so. An unfinished game is not saved; it only takes a few minutes anyway.',
      },
    ],
  },
  {
    id: 'ipuclari',
    baslik: { tr: 'İpuçları', en: 'Tips' },
    bloklar: [
      [
        { tr: 'Müşteriyle konuşmak neredeyse her zaman işe yarar. Bunu kimseye söyleme.', en: 'Talking to customers almost always works. Don’t tell anyone.' },
        {
          tr: `Morali yüksek tutmak kasayı korumaz. ${RULES.moraleMax} moralle batmak mümkündür; denendi.`,
          en: `High morale does not protect the cash. Going bust at ${RULES.moraleMax} morale is possible; it has been tried.`,
        },
        {
          tr: `Turuncu uyarıyı oku: bugün parlak görünen karar ${CHAIN_RULES.delay} hafta sonra faturasını getirir.`,
          en: `Read the orange warning: a decision that looks shiny today brings its bill ${CHAIN_RULES.delay} weeks later.`,
        },
        { tr: 'Batmak da eğlencelidir. Unvanların çoğu batanlara verilir.', en: 'Sinking is fun too. Most titles go to founders who sink.' },
      ],
    ],
  },
  {
    id: 'sss',
    baslik: { tr: 'Sık sorulan sorular', en: 'Frequently asked questions' },
    bloklar: [
      [
        { tr: 'Gerçek bir şirket simülasyonu mu? Hayır. Sayılar oyun ayarıdır, piyasa verisi değildir.', en: 'Is this a real business simulation? No. The numbers are game tuning, not market data.' },
        {
          tr: 'Kartlarda gerçek şirket ya da ürün var mı? Hayır; yalnız herkesin bildiği teknik adlar (CSV, Rust, Kubernetes, JavaScript) geçer.',
          en: 'Do the cards mention real companies or products? No; only well-known technical names (CSV, Rust, Kubernetes, JavaScript) appear.',
        },
        { tr: 'Para birimi neden TL? Oyun Türkiye’de kurulan bir girişimi anlatır; İngilizcede de TL kalır.', en: 'Why is the currency TL? The game is about a startup founded in Turkey, so it stays TL in English too.' },
        { tr: 'Simit nedir? Susamlı, halka biçiminde bir Türk simidi. Kurulumu simitle yapmak gelenektir.', en: 'What is simit? A ring-shaped Turkish bread covered in sesame. Doing an installation over simit and tea is a tradition.' },
        { tr: 'Mimar Sinan kim? Yapıları yüzyıllardır ayakta duran ünlü Osmanlı mimarı. Şirketin onun kadar dayanıklı değil.', en: 'Who is Mimar Sinan? The famous Ottoman architect whose buildings have stood for centuries. Your company is not that durable.' },
        { tr: 'Eklenti sistemi gelecek mi? Hayır. Alt satırda da yazıyor.', en: 'Will there be a plugin system? No. It says so on the bottom line too.' },
      ],
    ],
  },
  {
    id: 'hakkinda',
    baslik: { tr: 'Hakkında', en: 'About' },
    bloklar: [
      {
        tr: 'BatışOS açık kaynaklıdır (MIT lisansı). Tarayıcıda çalışır, kurulum istemez. Chromium ve Firefox ile denendi.',
        en: 'BatışOS is open source (MIT licence). It runs in the browser and needs no installation. It has been tested with Chromium and Firefox.',
      },
    ],
  },
];

const BASLIK: L = { tr: 'BatışOS oyun rehberi', en: 'BatışOS game guide' };
const OZET: L = { tr: 'Girişimini batmadan önce batır.', en: 'Sink your startup before it sinks.' };
const ICINDEKILER: L = { tr: 'İçindekiler', en: 'Contents' };

export function rehber(dil: Dil): Rehber {
  const s = (x: L) => x[dil];
  return {
    baslik: s(BASLIK),
    ozet: s(OZET),
    icindekiler: s(ICINDEKILER),
    bolumler: BOLUMLER.map((b) => ({ id: b.id, baslik: s(b.baslik), bloklar: b.bloklar.map((k) => (Array.isArray(k) ? k.map(s) : s(k))) })),
  };
}

/** Depodaki rehber dosyaları (depo kökünde: açık depoya da gider; docs/ gitmez). */
export const REHBER_DOSYALARI: Record<Dil, string> = { tr: 'REHBER.md', en: 'GUIDE.md' };

/** Rehberin Markdown hâli (REHBER.md / GUIDE.md). `adres`: oyunun yayın adresi. */
export function rehberMarkdown(dil: Dil, adres: string): string {
  const g = rehber(dil);
  const oteki = dil === 'tr' ? '[English](GUIDE.md)' : '[Türkçe](REHBER.md)';
  const oyna = dil === 'tr' ? `**Oyna:** ${adres}` : `**Play:** ${dil === 'en' ? `${adres}?lang=en` : adres}`;
  const not = dil === 'tr' ? 'Bu dosya `src/i18n/rehber.ts` dosyasından üretilir (`tools/rehber-yaz`); elle düzenleme.' : 'Generated from `src/i18n/rehber.ts` (`tools/rehber-yaz`); do not edit by hand.';
  const out: string[] = [`# ${g.baslik}`, '', `${oteki} · ${oyna}`, '', `> ${g.ozet}`, '', `<!-- ${not} -->`, '', `## ${g.icindekiler}`, ''];
  g.bolumler.forEach((b, i) => out.push(`${i + 1}. [${b.baslik}](#${b.id})`));
  for (const b of g.bolumler) {
    out.push('', `<a id="${b.id}"></a>`, '', `## ${b.baslik}`, '');
    for (const k of b.bloklar) {
      if (typeof k === 'string') out.push(k, '');
      else out.push(...k.map((x) => `- ${x}`), '');
    }
    if (out.at(-1) === '') out.pop();
  }
  return out.join('\n') + '\n';
}
