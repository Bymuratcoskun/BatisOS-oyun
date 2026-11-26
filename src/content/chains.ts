// v1.3 olay zincirlerinin takip kartları (docs/raporlar/TASARIM-v1.3-zincirler.md; metinler ve kurallar
// operatör onayı 2026-11-26: "Onay verildi üstadım."). Etki sayıları TAHMİN; oynandıktan sonra ayarlanır.
// Yer tutucular oyunun kendisinden doldurulur: {hafta} tetikleyen hafta, {karar} tetikleyen seçeneğin metni,
// {musteri} kartın açıldığı andaki müşteri sayısı. Tanımsız yer tutucu içerik doğrulamasında kırmızıdır.
import type { Card, ChainId } from '../core/types.ts';

export const ZINCIR_VERSION = 'zincir-1';

export interface ChainTemplate {
  card: Card;
  /** Takip kartına yer kalmadığında ya da oyun erken bittiğinde sonuç ekranına yazılan satır. */
  epilogue: string;
  /** Seçim ekranındaki uyarı; {gun} = kaç hafta sonra. */
  hintSlot: string;
  /** Uyarı, takip kartına yer kalmayacaksa. */
  hintEnd: string;
}

export const CHAIN_TEMPLATES: Readonly<Record<ChainId, ChainTemplate>> = {
  bakim: {
    card: {
      id: 'zincir-bakim',
      title: 'O Şey Hâlâ Çalışıyor',
      description: '{hafta}. hafta: “{karar}”. O şey hâlâ çalışıyor. Ve her gece saat üçte bir şey istiyor.',
      options: [
        {
          id: 'hazir-servis',
          text: 'Kapat, müşterinin kullandığı kısmı hazır bir servisle yap',
          effects: { cash: -1_500, customers: 1, morale: -8 },
          tags: [],
          log: 'Üç haftalık emek tek bir silme komutuyla gitti. Müşteri farkı fark etmedi; ekip fark etti.',
        },
        {
          id: 'acik-kaynak',
          text: 'Açık kaynak yap, bakımına topluluk baksın',
          effects: { cash: -1_000, customers: 0, morale: 8 },
          tags: ['tanıtım'],
          log: 'Depoya ilk yıldızı kendimiz verdik. İlk hata kaydını da.',
        },
        {
          id: 'bakim-araci',
          text: 'Bakımını yapacak bir iç araç yazalım',
          effects: { cash: -18_000, customers: 0, morale: 14 },
          tags: ['altyapı'],
          log: 'Artık iki şeyin bakımı var. Biri ötekinin bakımını yapıyor; ona kimin bakacağı ayrı toplantı konusu.',
        },
      ],
    },
    epilogue: '“{karar}” kararının bakım faturası bir sonraki kurucuya kaldı.',
    hintSlot: '{gun} hafta sonra bakım ister.',
    hintEnd: 'Bakım faturası sonuç ekranına yazılır.',
  },
  soz: {
    card: {
      id: 'zincir-soz',
      title: 'Hani?',
      description: '{hafta}. haftada “{karar}” demiştik. İnternet unutmadı. Biri ekran görüntüsünü paylaştı: “Hani?”',
      options: [
        {
          id: 'ozur',
          text: 'Özür dile, söz verdiğin müşterileri tek tek ara',
          effects: { cash: -1_000, customers: 2, morale: -10 },
          tags: [],
          log: 'Altı kişiyi aradık. İkisi “Aslında ben de unutmuştum” dedi ve hesap açtı.',
        },
        {
          id: 'geri-sayim',
          text: '“Çok yakında” yazısının yanına geri sayım ekle',
          effects: { cash: -800, customers: 0, morale: 6 },
          tags: ['tanıtım'],
          log: 'Geri sayım sıfıra indi, yerine yeni bir geri sayım başladı. Ekip buna “yinelemeli yol haritası” diyor.',
        },
        {
          id: 'soz-takip',
          text: 'Hangi sözü ne zaman verdiğimizi izleyen bir sistem kur',
          effects: { cash: -16_000, customers: 0, morale: 13 },
          tags: ['altyapı'],
          log: 'Sistem ilk hafta 47 açık söz buldu. Kırk sekizinci söz: “Bu sistemi de bitireceğiz.”',
        },
      ],
    },
    epilogue: '“{karar}” sözü hâlâ internette duruyor. Ekran görüntüsü de.',
    hintSlot: '{gun} hafta sonra bu söz hatırlatılır.',
    hintEnd: 'Bu söz sonuç ekranında hatırlatılır.',
  },
  teslim: {
    card: {
      id: 'zincir-teslim',
      title: 'Bizimki Ne Zaman Hazır?',
      description: 'Artık {musteri} müşteriniz var. Hepsi aynı sabah aynı soruyu sordu: “Bizimki ne zaman hazır?”',
      options: [
        {
          id: 'en-cok-odeyen',
          text: 'En çok ödeyenden başla, ötekilere dürüstçe tarih ver',
          effects: { cash: -1_500, customers: 1, morale: -8 },
          tags: [],
          log: 'Tarih verilen müşterilerden biri “İlk kez biri bana gerçek bir tarih verdi” diye yorum yazdı.',
        },
        {
          id: 'oncelikli-mail',
          text: 'Herkese “Öncelikli müşterimizsiniz” maili at',
          effects: { cash: -500, customers: -1, morale: 5 },
          tags: ['tanıtım'],
          log: '{musteri} müşteriye {musteri} ayrı “öncelikli” maili gitti. İkisi aynı şirkette çalışıyormuş.',
        },
        {
          id: 'oncelik-motoru',
          text: 'Önce bir talep önceliklendirme motoru yazalım',
          effects: { cash: -20_000, customers: 0, morale: 14 },
          tags: ['altyapı'],
          log: 'Motor bütün talepleri inceledi ve en öncelikli işin motorun kendisi olduğuna karar verdi.',
        },
      ],
    },
    epilogue: '{musteri} müşteri hâlâ “Bizimki ne zaman hazır?” diye soruyor. Cevap bir sonraki sürümde.',
    hintSlot: '{esik} müşteriye ulaşılır: {gun} hafta sonra teslim sırası sorulur.',
    hintEnd: '{esik} müşteriye ulaşılır: teslim sırası sonuç ekranında sorulur.',
  },
};
