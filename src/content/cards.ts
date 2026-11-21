import type { Card } from '../core/types.ts';

/**
 * BatışOS kart seti — sabit sıra, 12 kart × 3 seçenek.
 *
 * Kart 1–3: metinler ve sayılar docs/kaynak/ReadMe.md "Örnek kararlar" tablolarından BİREBİR.
 * Kart 4–12: Claude Code taslağı (öneri) — README ekran taslağındaki öneriler
 * ("eklenti mimarisi", "logoya animasyon", "Discord kuruldu" — BatisOS_Projesi.md:89 alıntısı; kartta marka adı yerine "topluluk sunucusu" (K17), "ödeme ekranını yeniden yazmak")
 * temel alındı. Sayılar oyun ayarıdır, piyasa verisi değildir; denge tests/content/denge.test.ts
 * ile 3^12 dizinin tamamı üzerinden ölçülür.
 *
 * Yazım kuralı (README "Kart yazım kuralları"): günlük metni sayılarla çelişmez.
 * Müşteri kaybettiren seçeneklerde metin kesin sayı söylemez, çünkü müşteri 0'da kırpılabilir.
 */
export const CARD_SET_VERSION = 'kart-seti-1.2'; // 1.2: marka adları kalktı — kart 1 "csv" (Excel), kart 6 "discord" (K16, K17). 1.1: kart 1 "bicim" metni (K11). Sayılar aynı

export const CARDS: readonly Card[] = [
  {
    id: 'ilk-musteri',
    title: 'İlk müşteri kapıda',
    description: '“CSV dışa aktarma eklerseniz satın alırım.”',
    options: [
      {
        id: 'csv',
        text: 'Sadece istenen CSV özelliğini yap',
        effects: { cash: -5_000, customers: 3, morale: 0 },
        tags: [],
        log: 'CSV yapıldı. Müşteri tablo programında açtı, ödedi, iki arkadaşını da getirdi. Ekip biraz hayal kırıklığında: bu kadar kolay olmamalıydı.',
      },
      {
        id: 'motor',
        text: 'Genel amaçlı dışa aktarma motoru yaz',
        effects: { cash: -20_000, customers: 0, morale: 0 },
        tags: ['altyapı'],
        log: 'Motor 14 biçimi destekliyor. CSV henüz aralarında yok ama mimarisi çok hazır.',
      },
      {
        id: 'bicim',
        text: 'Kendi dosya biçimimizi tasarla',
        effects: { cash: -30_000, customers: 0, morale: 15 },
        tags: ['altyapı'],
        log: 'Müşteri bekledi, sonra vazgeçti. Ama artık açamadığı dosyanın standardı bize ait.',
      },
    ],
  },
  {
    id: 'api-faturasi',
    title: 'Ücretli API faturası geldi',
    description: '“Entegrasyon hizmeti ayda 300 TL istiyor.”',
    options: [
      {
        id: 'ode',
        text: 'Bu turun hizmet ücretini öde, ürüne devam et',
        effects: { cash: -300, customers: 0, morale: 0 },
        tags: [],
        log: '300 TL ödendi. Hiçbir şey patlamadı. Ekipte bu kadar sıkıcı bir haftayı kimse hatırlamıyor.',
      },
      {
        id: 'kaldir',
        text: 'Entegrasyonu şimdilik kaldır',
        effects: { cash: 0, customers: -2, morale: 0 },
        tags: [],
        log: 'Entegrasyon kaldırıldı. Ona güvenen müşteriler de kendilerini kaldırdı.',
      },
      {
        id: 'kendimiz',
        text: 'Alternatifini kendimiz yazalım',
        effects: { cash: -15_000, customers: 0, morale: 10 },
        tags: ['altyapı', 'kendi_entegrasyonun'],
        log: '300 TL’lik bağımlılıktan kurtulmak için 15.000 TL harcadık. Bağımsızlığın bedeli olmaz.',
      },
    ],
  },
  {
    id: 'rakip',
    title: 'Rakip benzer özelliği çıkardı',
    description: '“Üstelik insanlar kullanıyor.”',
    options: [
      {
        id: 'konus',
        text: 'Müşterilerle konuş',
        effects: { cash: -2_000, customers: 2, morale: 0 },
        tags: [],
        log: 'Müşterilerle konuşuldu. Rakibin özelliğini kimse kullanmıyormuş, yalnız reklamını görmüşler. İki kişi bize geçti.',
      },
      {
        id: 'demo',
        text: 'Ürünün farkını anlatan kısa demo hazırla',
        effects: { cash: -3_000, customers: 1, morale: 0 },
        tags: ['tanıtım'],
        log: 'Demo 90 saniye sürdü; 85 saniyesi açılış animasyonuydu. Bir kişi yine de ikna oldu.',
      },
      {
        id: 'rust',
        text: 'Rust’a geç',
        effects: { cash: -25_000, customers: 0, morale: 20 },
        tags: ['altyapı'],
        log: 'Pazar payımız değişmedi. Derleyici artık bizi daha iyi anlıyor.',
      },
    ],
  },
  {
    id: 'eklenti',
    title: 'Ekipten öneri',
    description: '“Uygulamayı eklenti mimarisine taşıyalım. Henüz eklenti isteyen olmadı ama olabilir.”',
    options: [
      {
        id: 'ertele',
        text: 'Ertele',
        effects: { cash: 0, customers: 0, morale: -5 },
        tags: [],
        log: 'Eklenti mimarisi ertelendi. Ekipte yasın beş evresinden ilki başladı: inkâr.',
      },
      {
        id: 'sor',
        text: 'Müşteriye sor',
        effects: { cash: -1_000, customers: 1, morale: 0 },
        tags: [],
        log: 'Müşteri eklenti istemiyormuş; fatura kesebilmek istiyormuş. Fatura özelliği bir öğleden sonrada yapıldı, bir lisans daha satıldı.',
      },
      {
        id: 'cekirdek',
        text: 'Çekirdeği ayır',
        effects: { cash: -22_000, customers: 0, morale: 15 },
        tags: ['altyapı'],
        log: 'Çekirdek ayrıldı. Artık bir değil iki ayrı şeyimiz var ve ikisi de para kazanmıyor.',
      },
    ],
  },
  {
    id: 'logo',
    title: 'Tasarımcı arkadaş uğradı',
    description: '“Logonuz biraz eski duruyor. Bir el atayım mı?”',
    options: [
      {
        id: 'odeme-sayfasi',
        text: 'Logoyu bırak, ödeme sayfasını bitir',
        effects: { cash: -4_000, customers: 2, morale: -5 },
        tags: [],
        log: 'Ödeme sayfası çalıştı, iki kişi hemen ödedi. Logo hâlâ eski. Para yeni.',
      },
      {
        id: 'animasyon',
        text: 'Logoya animasyon ekle',
        effects: { cash: -6_000, customers: 0, morale: 10 },
        tags: ['tanıtım'],
        log: 'Logoya animasyon eklendi. Gelire eklenmedi.',
      },
      {
        id: 'tasarim-sistemi',
        text: 'Önce bir tasarım sistemi kuralım',
        effects: { cash: -18_000, customers: 0, morale: 12 },
        tags: ['altyapı'],
        log: 'Tasarım sistemi hazır: 48 ton gri, 112 düğme bileşeni. Üründe toplam 3 düğme var.',
      },
    ],
  },
  {
    id: 'destek',
    title: 'İlk destek talebi',
    description: '“Şifremi unuttum, yardım eder misiniz?”',
    options: [
      {
        id: 'yardim',
        text: 'Telefonu aç, yardım et',
        effects: { cash: -1_000, customers: 1, morale: 0 },
        tags: [],
        log: 'Beş dakikalık bir telefon. Müşteri o kadar şaşırdı ki bir arkadaşına anlattı; arkadaşı da abone oldu.',
      },
      {
        id: 'discord',
        text: 'Topluluk sunucusu kur',
        effects: { cash: -2_000, customers: 0, morale: 5 },
        tags: ['tanıtım'],
        log: 'Topluluk sunucusu kuruldu: 14 kanal, 6 rol, 1 bot, 1 üye. Üye de bot. Şifre hâlâ unutulmuş durumda.',
      },
      {
        id: 'kimlik',
        text: 'Kendi kimlik doğrulama sistemimizi yazalım',
        effects: { cash: -20_000, customers: 0, morale: 10 },
        tags: ['altyapı'],
        log: 'Kimlik doğrulama sıfırdan yazıldı. Müşteri hâlâ giriş yapamıyor, ama artık çok daha güvenli biçimde yapamıyor.',
      },
    ],
  },
  {
    id: 'yatirimci',
    title: 'Yatırımcıyla kahve',
    description: '“Rakamlarınızı görebilir miyim?”',
    options: [
      {
        id: 'durust',
        text: 'Gerçek rakamları göster',
        effects: { cash: -500, customers: 1, morale: -10 },
        tags: [],
        log: 'Rakamlar küçüktü. Yatırımcı yatırım yapmadı ama kendi şirketi için bir lisans aldı. Kahveleri biz ödedik.',
      },
      {
        id: 'sunum',
        text: '70 sayfalık sunum hazırla',
        effects: { cash: -8_000, customers: 0, morale: 10 },
        tags: ['tanıtım'],
        log: 'Yatırımcı 41. sayfada uyudu. Geçiş animasyonları çok beğenildi; uyumadan önce.',
      },
      {
        id: 'kubernetes',
        text: 'Ölçeklenmeye hazır görünmek için Kubernetes kur',
        effects: { cash: -24_000, customers: 0, morale: 15 },
        tags: ['altyapı'],
        log: 'Sistem artık 10 milyon kullanıcıya ölçeklenebiliyor. Hedefe yalnızca birkaç milyon kişi kaldı.',
      },
    ],
  },
  {
    id: 'yapay-zeka',
    title: 'Rakip “yapay zekâ destekli” oldu',
    description: 'Ne yaptığı belli değil ama sitesinde çok parlıyor.',
    options: [
      {
        id: 'rapor',
        text: 'Müşterilerin istediği raporu ekle',
        effects: { cash: -6_000, customers: 2, morale: 0 },
        tags: [],
        log: 'Rapor eklendi. İçinde yapay zekâ yok, doğal zekâ var. Müşteriler farkı anlamadı, iki yeni lisans geldi.',
      },
      {
        id: 'etiket',
        text: 'Sitene “yapay zekâ destekli” yaz',
        effects: { cash: -1_000, customers: 1, morale: 5 },
        tags: ['tanıtım'],
        log: 'Sitede artık “yapay zekâ destekli” yazıyor. Neyi desteklediğini kimse sormadı. Bir kişi kaydoldu.',
      },
      {
        id: 'model',
        text: 'Kendi dil modelimizi sıfırdan eğitelim',
        effects: { cash: -35_000, customers: 0, morale: 20 },
        tags: ['altyapı'],
        log: 'Model üç hafta eğitildi. İlk cümlesi: “Müşteri nerede?” Cevap veremedik.',
      },
    ],
  },
  {
    id: 'odeme-hatasi',
    title: 'Cuma akşamı hata',
    description: '“Ödeme ekranı bazen iki kez çekiyor.”',
    options: [
      {
        id: 'duzelt',
        text: 'Hatayı düzelt, parayı iade et',
        effects: { cash: -3_000, customers: 1, morale: -5 },
        tags: [],
        log: 'Hata düzeltildi, para iade edildi. Müşteri dürüstlüğümüze o kadar şaşırdı ki eşini de abone yaptı. Cuma akşamı feda edildi.',
      },
      {
        id: 'duyur',
        text: 'Sosyal medyada “büyük güncelleme geliyor” de',
        effects: { cash: -500, customers: -1, morale: 5 },
        tags: ['tanıtım'],
        log: 'Büyük güncelleme duyuruldu. Ödeme ekranı çift çekmeye devam etti. Sabrı tükenen gitti; giderken kapıyı iki kez çarptı.',
      },
      {
        id: 'yeniden',
        text: 'Ödeme ekranını yeniden yaz',
        effects: { cash: -25_000, customers: 0, morale: 10 },
        tags: ['altyapı'],
        log: 'Ödeme ekranı yeniden yazılıyor. Bu sürede kimse ödeme yapamıyor, dolayısıyla kimseden iki kez de çekilmiyor. Sorun çözüldü.',
      },
    ],
  },
  {
    id: 'konferans',
    title: 'Konferans daveti',
    description: 'Sahnede 20 dakika konuşma fırsatı. Katılım ücreti 7.500 TL.',
    options: [
      {
        id: 'gitme',
        text: 'Gitme, o gün müşteri adaylarıyla görüş',
        effects: { cash: -1_500, customers: 2, morale: -5 },
        tags: [],
        log: 'Konferansa gidilmedi. Üç adayla kahve içildi: ikisi lisans aldı, üçüncüsü kahveleri ödedi.',
      },
      {
        id: 'konusma',
        text: 'Git, “Neden batmayacağız” konuşmasını yap',
        effects: { cash: -7_500, customers: 1, morale: 10 },
        tags: ['tanıtım'],
        log: 'Konuşma çok alkışlandı. Alkış dışında bir şey de elde ettik: bir kartvizit. Sahibi müşteri oldu.',
      },
      {
        id: 'cati',
        text: 'Konuşmayı kendi JavaScript çatımız üzerine yap',
        effects: { cash: -9_000, customers: 0, morale: 15 },
        tags: ['altyapı', 'tanıtım'],
        log: 'Çatımızı tanıttık. Salondaki 300 kişiden ikisi depoya yıldız verdi. İkisi de bizim ekipten.',
      },
    ],
  },
  {
    id: 'stajyer',
    title: 'Stajyerin sorusu',
    description: '“Bu kodu neden üç kez baştan yazdık?”',
    options: [
      {
        id: 'haklisin',
        text: 'Haklısın, müşteri listesine dönelim',
        effects: { cash: 0, customers: 2, morale: -10 },
        tags: [],
        log: 'Soru toplantıyı on dakikada bitirdi. Kalan sürede iki satış yapıldı. Stajyerin terfisi konuşuluyor; kurucunun değil.',
      },
      {
        id: 'belge',
        text: 'Ona mimari belgelerini okut',
        effects: { cash: -2_000, customers: 0, morale: 5 },
        tags: [],
        log: 'Stajyer 400 sayfalık mimari belgesini okudu ve sorusunu geri aldı. İstifa etmedi ama yüzünde bir şey vardı.',
      },
      {
        id: 'dorduncu',
        text: 'Dördüncü kez baştan yaz; bu sefer temiz olacak',
        effects: { cash: -30_000, customers: 0, morale: 20 },
        tags: ['altyapı'],
        log: 'Dördüncü sürüm tertemiz. O kadar temiz ki içinde henüz hiçbir özellik yok.',
      },
    ],
  },
  {
    id: 'kurumsal',
    title: 'Son hafta: kurumsal müşteri',
    description: '“Beş lisans alırız. Yalnız sözleşmede ‘tema desteği’ maddesi var.”',
    options: [
      {
        id: 'imzala',
        text: 'Varsayılan temayla imzala',
        effects: { cash: -2_000, customers: 5, morale: 0 },
        tags: [],
        log: 'Sözleşme imzalandı, beş lisans satıldı. Firma varsayılan temayı “kurumsal mavi” sandı. Kimse düzeltmedi.',
      },
      {
        id: 'video',
        text: 'Önce tanıtım videosu çekelim',
        effects: { cash: -6_000, customers: 1, morale: 5 },
        tags: ['tanıtım'],
        log: 'Video harika oldu. Firma videoyu o kadar beğendi ki beş lisans yerine bir lisans aldı.',
      },
      {
        id: 'tema',
        text: 'Tema motoru yaz, sonra imzalarız',
        effects: { cash: -28_000, customers: 0, morale: 15 },
        tags: ['altyapı'],
        log: 'Üçüncü tema motorumuz tamamlandı. Firma imzayı rakiple attı; rakibin tek bir teması var.',
      },
    ],
  },
];
