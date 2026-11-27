# BatışOS

> Girişimini batmadan önce batır.

BatışOS, bir startup kurucusunun müşteri kazanmakla uygulamayı baştan yazmak arasında verdiği mücadeleyi konu alan, tur tabanlı ve mizahi bir girişim simülatörüdür.

Bir müşteri basit bir özellik ister. Sen genel amaçlı bir altyapı geliştirirsin. Rakibin satış yapar. Sen teknoloji yığınını değiştirirsin. Kasa erir ama kod tabanı her geçen gün daha güzel görünür.

Burada yanlış kararlar hata değil, oynanışın kendisidir.

> Proje durumu: 27 kartlık havuz, olay zincirleri, Türkçe ve İngilizce. Baştan sona oynanıyor, bütün testleri geçiyor.
>
> **Tarayıcıda oyna:** https://bymuratcoskun.github.io/BatisOS-oyun/
>
> **Oyun rehberi:** [Türkçe](REHBER.md) · [English](GUIDE.md)

### In English

BatışOS is a short, comic, turn-based startup game in your browser. You have 12 weeks, 100,000 TL and zero
customers. Every week an event card offers three decisions: build the small thing the customer asked for, or
write your own engine, framework, mail server or theme engine first. The engineering choices make morale
soar and the cash vanish. **Play in English:** https://bymuratcoskun.github.io/BatisOS-oyun/?lang=en · the full
guide is in [GUIDE.md](GUIDE.md). The rest of this README is the Turkish design document.

## İçindekiler

- [Oyun fikri](#oyun-fikri)
- [Nasıl oynanır?](#nasıl-oynanır)
- [Örnek kararlar](#örnek-kararlar)
- [Kazanma ve kaybetme](#kazanma-ve-kaybetme)
- [Kurucu karnesi](#kurucu-karnesi)
- [İlk sürüm kapsamı](#ilk-sürüm-kapsamı)
- [Kapsam dışı](#kapsam-dışı)
- [Oyun mantığı](#oyun-mantığı)
- [Teknik durum ve kurulum](#teknik-durum-ve-kurulum)
- [Geliştirme planı](#geliştirme-planı)
- [Kabul ölçütleri](#kabul-ölçütleri)
- [Katkıda bulunma](#katkıda-bulunma)
- [Lisans](#lisans)
- [Emin olunamayanlar](#emin-olunamayanlar)

## Oyun fikri

Oyuncu, sınırlı bütçeyle kurulan bir startup’ı 12 tur boyunca yönetir. Her turda bir olay kartı açılır ve oyuncuya üç karar sunulur.

Kararlar şu alanları etkiler:

- Şirketin kasası.
- Ödeme yapan müşteri sayısı.
- Kurucu morali.
- Oyun sonunda verilecek kurucu unvanları.

Oyun, teknik mükemmeliyetçiliği, kapsamın sürekli büyümesini ve müşteriyle konuşmak yerine altyapı geliştirmeyi hicveder.

Teknolojiler düşman değildir. Sorun, ödeme ekranı çalışmazken üçüncü tema motorunu yazmaktır.

## Nasıl oynanır?

1. Yeni bir şirket kur.
2. Başlangıç göstergelerini kontrol et.
3. Turun olay kartını oku.
4. Üç seçenekten birini seç.
5. Kararının sonuçlarını göstergelerde ve faaliyet günlüğünde gör.
6. Şirket batmadıysa sonraki tura geç.
7. Son turda kurucu karnenle yüzleş.

### Başlangıç değerleri

| Gösterge | Değer |
|---|---:|
| Kasa | 100.000 TL |
| Süre | 12 tur |
| Ödeme yapan müşteri | 0 |
| Kurucu morali | 80/100 |

Bir tur, oyun içinde bir girişim haftasını temsil eder.

Tutarlar, müşteri değişimleri ve eşikler oyun tasarımı içindir. Gerçek şirket maliyetlerini veya finansal sonuçları temsil etmez.

### Kurucu morali

Moral, ilk sürümde mizahi bir durum göstergesidir.

- 0–100 arasında tutulur.
- Tek başına kazanma veya kaybetme nedeni değildir.
- Bazı kötü ticari kararlar morali yükseltebilir.
- Yüksek moral, şirketin iyi durumda olduğu anlamına gelmez.

Kısacası, kasa boşalırken kendini harika hissedebilirsin.

## Örnek kararlar

### İlk müşteri kapıda

> “CSV dışa aktarma eklerseniz satın alırım.”

| Seçenek | Kasaya etkisi | Müşteri etkisi | Moral etkisi |
|---|---:|---:|---:|
| Sadece istenen CSV özelliğini yap | −5.000 TL | +3 | 0 |
| Genel amaçlı dışa aktarma motoru yaz | −20.000 TL | 0 | 0 |
| Kendi dosya biçimimizi tasarla | −30.000 TL | 0 | +15 |

Son seçeneğin faaliyet kaydı:

> Müşteri bekledi, sonra vazgeçti. Ama artık açamadığı dosyanın standardı bize ait.

### Ücretli API faturası geldi

> “Entegrasyon hizmeti ayda 300 TL istiyor.”

| Seçenek | Kasaya etkisi | Müşteri etkisi | Moral etkisi |
|---|---:|---:|---:|
| Bu turun hizmet ücretini öde, ürüne devam et | −300 TL | 0 | 0 |
| Entegrasyonu şimdilik kaldır | 0 TL | −2 | 0 |
| Alternatifini kendimiz yazalım | −15.000 TL | 0 | +10 |

Son seçeneğin faaliyet kaydı:

> 300 TL’lik bağımlılıktan kurtulmak için 15.000 TL harcadık. Bağımsızlığın bedeli olmaz.

İlk sürümde bu kartın ücreti tek seferlik uygulanır; sonraki turlara otomatik abonelik borcu eklenmez.

### Rakip benzer özelliği çıkardı

> “Üstelik insanlar kullanıyor.”

| Seçenek | Kasaya etkisi | Müşteri etkisi | Moral etkisi |
|---|---:|---:|---:|
| Müşterilerle konuş | −2.000 TL | +2 | 0 |
| Ürünün farkını anlatan kısa demo hazırla | −3.000 TL | +1 | 0 |
| Rust’a geç | −25.000 TL | 0 | +20 |

Son seçeneğin faaliyet kaydı:

> Pazar payımız değişmedi. Derleyici artık bizi daha iyi anlıyor.

## Kazanma ve kaybetme

### Kazanma

12. turun sonunda şu iki koşul birlikte sağlanmalıdır:

- Kasa 0 TL’nin üzerinde olmalı.
- En az 10 ödeme yapan müşteri bulunmalı.

### Kaybetme

Aşağıdaki durumlardan biri gerçekleşirse oyun kaybedilir:

- Herhangi bir turda kasa 0 TL’ye veya altına düşer.
- 12. tur tamamlandığında ödeme yapan müşteri sayısı 10’un altında kalır.

Kasa tükenirse sonraki tur açılmaz. Yüksek moral veya temiz mimari, şirketi otomatik kurtarmaz.

### Örnek batış raporu

```text
ŞİRKET KAPANDI

Dayanılan süre: 9 tur
Kalan kasa: -2.300 TL
Ödeme yapan müşteri: 0
Alınan altyapı kararı: 6

Son harcama:
Ödeme ekranını yeniden yazmak.

Yatırımcı yorumu:
“Keşke bir kere para almayı deneseydiniz.”
```

Oyun sonunda iki düğme bulunur:

- `Yeniden dene`
- `Suçu teknoloji yığınına at`

İki düğme de yeni oyun başlatır. İkincisi, yeni faaliyet günlüğüne şu kaydı ekler:

> Sorumluluk devredildi.

## Kurucu karnesi

Oyun sonunda karar geçmişine göre bir veya daha fazla unvan verilir.

| Unvan | Koşul |
|---|---|
| Mimar Sinan, Gelir Sıfır | En az 4 altyapı kararı almak ve oyunu 0 müşteriyle bitirmek |
| Açık Kaynak Fedaisi | API alternatifini kendin yazma seçeneğini seçmek ve oyunu kaybetmek |
| Sunum Unicorn’u | En az 3 tanıtım kararı almak ve oyunu 3’ten az müşteriyle bitirmek |
| İstemeden CEO | Kazanma koşullarını sağlamak |

Kararlar `altyapı`, `tanıtım` ve `kendi_entegrasyonun` gibi etiketlerle işaretlenir. Karne, seçilen kararların etiketlerinden üretilir.

Hiçbir özel koşul sağlanmazsa sonuç özeti gösterilir; zorunlu bir unvan verilmez.

## İlk sürüm kapsamı

Hackathon sürümünün hedefi, baştan sona oynanabilen tek bir oyun döngüsüdür.

- [x] Tek ekranlı oyun arayüzü.
- [x] Kasa, tur, müşteri ve moral göstergeleri.
- [x] Her biri üç seçenek içeren 12 olay kartı.
- [x] Karar etkilerinin uygulanması.
- [x] Faaliyet günlüğü.
- [x] Kazanma ve kaybetme denetimi.
- [x] Kurucu karnesi.
- [x] Yeniden başlatma.
- [ ] Baştan sona denenmiş bir demo akışı. *(Akış otomatik testte her koşuda oynanıyor; sesli sunum provası henüz yapılmadı.)*

İlk sürümde (v1.0–v1.1) kartlar sabit sırayla gösterilir. v1.2'den beri her oyunda 27 kartlık bir havuzdan 12 kartlık bir deste kurulur: 4 başlangıç, 7 gelişme, 1 final; benzer kartlar aynı destede çıkmaz. Eski 12 kart eski sırasıyla için adresin sonuna `#klasik`, aynı deste için `#tohum-…` (kopyalanan sonucun bağlantısı bunu taşır).

v1.3'ten beri havuz oyununda kararlar geri döner (üç olay zinciri): ilk altyapı kararı 3 hafta sonra bakım ister, ilk tanıtım sözü 3 hafta sonra hatırlatılır, 6 müşteriye ulaşınca 3 hafta sonra teslim sırası sorulur. Takip kartı o haftanın kartının yerini alır ve oyuncunun kararını alıntılar; ne olacağı seçeneğin altında önceden yazar. Oyun yine 12 hafta, son hafta değişmez. Takip kartına yer kalmazsa sonuç ekranında "GERİDE KALANLAR" satırı olur. `#klasik` zincirsizdir.

## Kapsam dışı

Aşağıdaki özellikler hackathon sürümüne dahil değildir:

- Kullanıcı hesabı ve oturum açma.
- Gerçek ödeme veya finansal işlem.
- Sunucu ve çevrim içi veritabanı.
- Yapay zekâ entegrasyonu.
- Çok oyunculu mod.
- Bulut kaydı ve cihazlar arası senkronizasyon.
- Eklenti sistemi.
- Tema motoru.
- Gerçek piyasa veya şirket verileri.
- Oyun motoru geliştirme.
- Kalıcı kayıt ve kaldığı yerden devam etme.

Yeni özellik önerisi, mevcut oyunun tamamlanmasının önüne geçmemelidir.

## Oyun mantığı

### Olay kartı

Her kart şu bilgileri taşır:

| Alan | Açıklama |
|---|---|
| Kimlik | Kartın benzersiz tanımlayıcısı |
| Başlık | Olayın kısa adı |
| Açıklama | Oyuncuya sunulan durum |
| Seçenekler | Tam olarak üç karar |
| Etkiler | Kasa, müşteri ve moral değişimleri |
| Etiketler | Karne hesabında kullanılan karar kategorileri |
| Günlük metni | Karardan sonra gösterilecek sonuç |

### Tur işleyişi

```text
Kartı göster
    ↓
Oyuncunun seçimini al
    ↓
Seçimi kilitle
    ↓
Kararın etkilerini bir kez uygula
    ↓
Müşteriyi en az 0, morali en çok 100'de tut
    ↓
Kararı ve sonucu faaliyet günlüğüne ekle
    ↓
Kasa tükendi mi?
    ├── Evet → Batış raporunu göster
    └── Hayır → Son tur mu?
                    ├── Evet → Kazanma koşullarını değerlendir
                    └── Hayır → Sonraki kartı aç
```

### İlk sürümün ekonomi kuralları

- Etkiler yalnızca seçilen karardan gelir.
- Otomatik haftalık gider uygulanmaz.
- Müşteri sayısından otomatik gelir hesaplanmaz.
- Kartta açıkça yazılmayan gizli maliyet uygulanmaz.
- Moral, karar seçeneklerini kilitlemez.
- Aynı karar birden fazla kez işlenemez.

Bunlar gerçekçi bir şirket ekonomisi kurmak için değil, ilk oynanabilir sürümün kurallarını açık tutmak için seçilmiştir.

## Teknik durum ve kurulum

Bu bölümdeki her komut 2026-11-20'de bu depoda çalıştırılıp doğrulandı. Seçimin gerekçesi
geliştirme belgelerinde; burada yalnız ölçülen sürümler var.

| Alan | Seçim (ölçülen sürüm) |
|---|---|
| Dil ve arayüz | TypeScript 7.0.2 · HTML + CSS, arayüz çatısı yok |
| Geliştirme ve derleme | Vite 8.3.8 (resmî `vanilla-ts` şablonu, create-vite 9.3.4) |
| Çekirdek testleri | Vitest 5.1.1 |
| Tam oyun testleri | Playwright 1.65.1 · Chromium ve Firefox, headless |
| Çalışma ortamı | Node 26.8.2 · npm 12.0.2 |
| Denenen işletim sistemi | Fedora Linux 44 (çekirdek 7.3.3) — yalnız bu |

```bash
npm install                                  # bağımlılıklar (package-lock.json depoda)
npx playwright install chromium firefox      # yalnız tam oyun testleri için
npm run dev                                  # geliştirme: http://localhost:5173
npm test                                     # çekirdek + içerik + denge testleri
npm run e2e                                  # tarayıcıda tam oyun testleri
tools/kapilar                                # bütün kapılar; beklenen: KAPILAR yesil=5 kirmizi=0
npm run build && npm run preview             # dağıtılabilir sürüm: dist/
```

Denendi: `dist/` dış ağ istekleri kesilerek baştan sona oynandı (`tests/e2e/kararlilik.spec.ts`).
Denenmedi: başka işletim sistemi, WebKit/Safari, temiz bir makinede kurulum.

Teknik kapsam: yerel oyun durumu ve tek ekranlı arayüz. Harici hizmet gereksinimi yok.

## Geliştirme planı

> Durum: Aşama 1–4 tamamlandı; oyun yayında. Bu bölüm ilk planı olduğu gibi gösteriyor. Ayrıntılı
> uygulama izi (kararlar, ölçümler, raporlar) geliştirme deposunda tutuluyor.

### Aşama 1 — Şirket batabiliyor

- Oyun durumunu tanımla.
- Tek olay kartını ekle.
- Seçeneklerin etkilerini uygula.
- Kasa tükenince oyunu bitir.
- Yeniden başlatmayı ekle.

Tamamlanma ölçütü: Oyuncu bir seçim yaparak kasayı değiştirebiliyor ve şirketi batırabiliyor.

### Aşama 2 — Baştan sona oynanabiliyor

- Kart sayısını 12’ye çıkar.
- Tur geçişlerini tamamla.
- Faaliyet günlüğünü ekle.
- Kazanma koşullarını uygula.

Tamamlanma ölçütü: Yeni oyun başlatılıp 12. tur sonuna kadar kesintisiz oynanabiliyor.

### Aşama 3 — Batışın bir karakteri var

- Kurucu unvanlarını ekle.
- Sonuç ekranını tamamla.
- Mizahi günlük metinlerini gözden geçir.
- Gösterge ve düğmelerin okunabilirliğini düzenle.

Tamamlanma ölçütü: Sonuç ekranı, oyuncunun verdiği kararları yansıtıyor.

### Aşama 4 — Demo hazır

- Kazanan bir karar dizisini dene.
- Erken batış senaryosunu dene.
- Sınır değerleri kontrol et.
- Kurulum ve çalıştırma adımlarını doğrula.
- Sunum akışını prova et.

Tamamlanma ölçütü: Demo, açıklama veya elle müdahale gerektirmeden tamamlanabiliyor.

## Kabul ölçütleri

| Senaryo | Beklenen sonuç |
|---|---|
| Yeni oyun başlatılır | Başlangıç değerleri doğru görünür |
| Bir seçenek seçilir | Etkileri yalnızca bir kez uygulanır |
| Aynı düğmeye tekrar basılır | İkinci bir etki oluşmaz |
| Müşteri kaybı mevcut müşteriden fazladır | Müşteri sayısı 0’da kalır |
| Moral 100’ü aşacak şekilde artar | Moral 100’de kalır |
| Moral 0’ın altına inecek şekilde azalır | Moral negatif görünür (kasa gibi); oyunu bitirmez *(v1.1'den beri; v1.0'da 0'da kalıyordu)* |
| Kasa tam 0 TL olur | Oyun kaybedilir |
| Son turda kasa pozitif ve müşteri 10’dur | Oyun kazanılır |
| Son turda kasa pozitif ve müşteri 9’dur | Oyun kaybedilir |
| Oyun biter | Yeni karar alınamaz |
| Yeniden başlatılır | Önceki oyunun durumu temizlenir |
| Aynı seçim dizisi tekrar oynanır | Aynı sonuç elde edilir |

Denge kontrolünde en az bir kazanan karar dizisi ve bir erken batış dizisi doğrulanmalıdır. Bunlar doğrulanana kadar oyun dengesi tamamlanmış sayılmaz.

## Katkıda bulunma

Katkılar şu alanlara odaklanabilir:

- Yeni olay kartı önerileri.
- Daha iyi karar ve sonuç metinleri.
- Hata düzeltmeleri.
- Erişilebilirlik ve okunabilirlik.
- Oyun dengesi testleri.

Bir olay kartı önerirken şu şablonu kullan:

```text
Başlık:

Oyuncuya gösterilen durum:

Seçenek 1:
- Metin:
- Kasa etkisi:
- Müşteri etkisi:
- Moral etkisi:
- Etiketler:
- Günlük kaydı:

Seçenek 2:
- Metin:
- Kasa etkisi:
- Müşteri etkisi:
- Moral etkisi:
- Etiketler:
- Günlük kaydı:

Seçenek 3:
- Metin:
- Kasa etkisi:
- Müşteri etkisi:
- Moral etkisi:
- Etiketler:
- Günlük kaydı:
```

Mizah, kurucu davranışlarını ve kararlarını hedeflemelidir; gerçek kişilere yönelik aşağılama içermemelidir.

Büyük altyapı değişiklikleri önermeden önce şu soruyu cevapla:

> Bu değişiklik oyunu tamamlamamızı mı sağlıyor, yoksa oyunun dalga geçtiği şeyi mi yapıyoruz?

## Arayüz durumları

İlk sürüm dört temel görünümden oluşur:

| Durum | Gösterilenler | Yapılabilecek işlem |
|---|---|---|
| Başlangıç | Oyun açıklaması, başlangıç değerleri, kısa kurallar | Yeni oyun başlatma |
| Karar | Göstergeler, olay kartı, üç seçenek, faaliyet günlüğü | Bir seçenek seçme |
| Karar sonucu | Değişen değerler, sonuç metni | Sonraki haftaya geçme |
| Oyun sonu | Kazanma veya kaybetme nedeni, karne, karar özeti (v1.1: her kararın kasaya etkisi ve kalan kasa), sonucu kopyala | Yeniden başlatma |

Seçim yapıldığı anda seçenekler kilitlenir. Sonuç metni oyuncu tarafından okunmadan yeni karta otomatik geçilmez.

### Karar sonucunun gösterimi

Her karardan sonra yalnızca yeni toplamlar değil, değişimler de gösterilir:

```text
KARAR: Kendi dosya biçimimizi tasarlayalım.

Kasa:      80.000 TL → 50.000 TL   (-30.000 TL)
Müşteri:   3 → 3                  (Değişmedi)
Moral:     80 → 95                (+15)

Müşteri bekledi, sonra vazgeçti. Ama artık açamadığı dosyanın standardı bize ait.

[Sonraki hafta]
```

Buradaki günlük metni mizah içindir. Gösterge değişimlerinde esas alınacak bilgi, kartın sayısal etkileridir. Metin ile sayılar birbiriyle çelişmemelidir.

## Oyun durumu ve veri sınırları

İlk sürümde aşağıdaki bilgilerin tutulması yeterlidir:

| Alan | Amaç |
|---|---|
| Oyun durumu | Başlangıç, karar, sonuç veya bitiş görünümünü belirlemek |
| Güncel tur | Oyuncunun hangi turda olduğunu izlemek |
| Kasa | Kalan bütçeyi tutmak |
| Müşteri sayısı | Ödeme yapan müşteri sayısını tutmak |
| Moral | Kurucu moralini tutmak |
| Karar geçmişi | Seçilen kartları ve seçenekleri kaydetmek |
| Faaliyet günlüğü | Oyuncuya sonuçları göstermek |
| Bitiş nedeni | Başarı, kasa tükenmesi veya müşteri hedefinin kaçırılması |
| Kazanılan unvanlar | Oyun sonunda kurucu karnesini oluşturmak |

Karne hesapları karar geçmişinden üretilir. Aynı bilgiyi farklı yerlerde bağımsız olarak değiştiren ek sayaçlar, ihtiyaç gösterilmedikçe eklenmez.

### Veri yaşam süresi

- Oyun durumu yalnızca mevcut oturumda tutulur.
- Uygulama kapatıldığında veya sayfa tabanlı bir uygulama seçilirse sayfa yenilendiğinde ilerleme korunmaz.
- Yeni oyun, önceki oyunun kararlarını ve göstergelerini temizler.
- Gerçek şirket, müşteri veya ödeme bilgisi istenmez.
- İlk sürüm tasarımında analitik ve telemetri bulunmaz.

Bunlar hedeflenen davranışlardır; uygulama tamamlandığında doğrulanmalıdır.

## Kart yazım kuralları

Her kart, anlaşılır bir durum ile üç farklı tepki sunmalıdır.

### İçerik ölçütleri

- Başlık tek bir olayı anlatmalı.
- Açıklama, karar vermek için gereken bağlamı içermeli.
- Seçenekler birbirinin farklı yazılmış kopyaları olmamalı.
- Sayısal etkiler seçenek seçilmeden önce görünmeli.
- Sonuç metni verilen karara karşılık gelmeli.
- Karne için kullanılan etiketler tutarlı olmalı.
- Gerçek kişi veya şirketler hakkında doğrulanmamış iddialar kullanılmamalı.

İlk sürümün mizahı gizli cezadan değil, oyuncunun sonuçlarını gördüğü hâlde cazip bulduğu yanlış kararlardan doğar.

### Sayısal kurallar

- Para değerleri tam TL olarak tutulur.
- Müşteri değişimleri tam sayıdır.
- Moral değişimleri tam sayıdır.
- Müşteri sayısı negatif olamaz.
- Moral en çok 100'dür; alt sınırı yoktur, sıfırın altına inebilir ve oyunu bitirmez.
- Kasa negatif olabilir; bu durumda oyun hemen sona erer.
- Bir seçeneğin etkileri tek işlem olarak uygulanır.

Örneğin seçilen karar hem kasayı tüketiyor hem müşteri kazandırıyorsa iki etki de kayda geçer. Ardından kasa kontrol edilir ve oyun kaybedilir.

Yeni müşteri, aynı turda tükenen kasayı kendiliğinden kurtarmaz; ilk sürümde otomatik müşteri geliri yoktur.

## İçerik doğrulama

Oyun başlamadan önce kart verilerinde şu koşullar denetlenmelidir:

- Tam olarak 12 kart bulunması.
- Kart kimliklerinin benzersiz olması.
- Her kartta tam olarak üç seçenek bulunması.
- Her seçeneğin kart içinde benzersiz bir kimliğe sahip olması.
- Başlık, açıklama ve seçenek metinlerinin boş olmaması.
- Sayısal etkilerin beklenen türde olması.
- Kullanılan etiketlerin tanımlı etiket listesinde bulunması.
- Her seçeneğin bir günlük metnine sahip olması.

Geçersiz kart verisiyle oyun başlatılmamalıdır. Eksik alanları sessizce sıfır kabul etmek yerine, geliştiriciye hangi kartın hatalı olduğu gösterilmelidir.

Oyuncuya gösterilecek kısa hata metni:

> Şirket henüz kurulamadı. Bu kez sorun gerçekten bizde.

## Test senaryoları

Önceki kabul ölçütlerine ek olarak aşağıdaki geçişler de kontrol edilmelidir.

### Son turda kasa tükenmesi

```text
Başlangıç:
Tur: 12
Kasa: 5.000 TL
Müşteri: 9

Seçimin etkisi:
Kasa: -5.000 TL
Müşteri: +3

Beklenen:
Kasa: 0 TL
Müşteri: 12
Sonuç: Kaybetme
Neden: Kasa tükendi
```

Müşteri hedefi sağlansa bile pozitif kasa koşulu sağlanmamıştır.

### Aynı seçeneğin tekrar işlenmesi

```text
Başlangıç:
Kasa: 20.000 TL

Seçimin etkisi:
Kasa: -5.000 TL

İşlem:
Aynı seçeneği art arda iki kez etkinleştir.

Beklenen:
Kasa: 15.000 TL
Geçmişe eklenen karar sayısı: 1
```

### Sınırda moral artışı

```text
Başlangıç:
Moral: 95

Seçimin etkisi:
Moral: +20

Beklenen:
Moral: 100
Gösterilen gerçek değişim: +5
```

Seçenek üzerinde tanımlı etki `+20` olarak gösterilebilir. Sonuç ekranı ise üst sınır uygulandıktan sonra gerçekleşen değişimi göstermelidir.

### Yeniden başlatma

```text
Başlangıç:
Bitmiş oyun, dolu faaliyet günlüğü ve kazanılmış unvanlar.

İşlem:
Yeniden dene.

Beklenen:
Tur: 1
Kasa: 100.000 TL
Müşteri: 0
Moral: 80
Karar geçmişi: Boş
Unvanlar: Boş
```

“Suçu teknoloji yığınına at” ile yeniden başlatıldığında aynı sıfırlama yapılır; yalnızca yeni günlüğe “Sorumluluk devredildi” kaydı eklenir.

## Erişilebilirlik hedefleri

İlk sürümde aşağıdaki davranışlar hedeflenir:

- Tüm kararlar klavyeyle seçilebilir.
- Odaklanan düğme görünür biçimde ayırt edilir.
- Artış ve azalışlar yalnızca renkle anlatılmaz; işaret ve metin de kullanılır.
- Düğmelerin açıklayıcı adları bulunur.
- Uzun metinler seçenekleri veya temel göstergeleri erişilemez hâle getirmez.
- Karar vermek için geri sayım uygulanmaz.
- Animasyon, sonucu anlamanın zorunlu bir parçası olmaz.

Ölçülen durum (`tests/e2e/erisilebilirlik.spec.ts`, Chromium + Firefox): yukarıdaki maddeler sınanıyor;
axe-core WCAG 2.0/2.1 A ve AA taramasında ihlal 0; 360×640'tan 1920×1080'e beş ekran boyutunda taşma 0.

%200 büyütme (v1.1) sınanıyor: sayfa yakınlaştırma (640×360) ve yalnız metin büyütme, ikisinde de taşma 0. Ekran okuyucuyla **denenmedi**. Test edilmeden erişilebilirlik uyumluluğu iddia edilmez.

## Hackathon demo senaryosu

Sunum, oynanabilir ürün üzerinden ilerler. Özellik listesi anlatmak yerine karar ve sonuç ilişkisi gösterilir.

### Önerilen 90 saniyelik akış

| Süre | Gösterim |
|---|---|
| 0–15 saniye | Oyun fikrini ve dört göstergeyi anlat |
| 15–50 saniye | Önceden denenmiş kötü karar dizisini oyna |
| 50–70 saniye | Batış raporunu ve kurucu karnesini göster |
| 70–90 saniye | Yeniden başlat, farklı bir kararın etkisini göster |

Sunum için ayrı ve gizli oyun kuralları kullanılmaz. Demo, normal oyun akışıyla çalışmalıdır.

### Açılış cümlesi

> BatışOS, müşterinin istediği küçük özelliği yapmak yerine bütün altyapıyı yeniden yazmanın ne kadar pahalıya patlayabileceğini oynatan bir girişim simülatörü.

### Kapanış cümlesi

> Şirketi kurtarmak için doğru teknolojiyi değil, bazen sadece müşterinin istediği özelliği seçmek gerekiyor.

### Demo öncesi kontrol listesi

- [x] Oyun temiz başlangıç durumunda. *(art arda 5 oyun testi)*
- [x] Kullanılacak karar dizisi baştan sona denendi. *(5 altyapı kararı, her test koşusunda)*
- [x] Batış ekranına hangi turda ulaşılacağı biliniyor. *(5. hafta, kasa −10.000 TL)*
- [x] Kurucu karnesi beklenen sonucu veriyor.
- [x] Yeniden başlatma çalışıyor.
- [x] Sunum yapılan ekranda metinler okunuyor. *(demo bilgisayarında, paketlenmiş sürümle oynandı)*
- [x] Harici bağlantı gereksinimi olup olmadığı doğrulandı. *(yok: dış istekler kesilince de oynanıyor)*
- [x] Kurulum adımları başka bir temiz ortamda denendi veya denenmediği açıkça belirtildi. *(**denenmedi**: açık depo kopyasında `npm ci` + bütün testler geçti, ama aynı makinede)*

## Proje riskleri

Aşağıdaki tablo proje planlama değerlendirmesidir; gerçekleşmiş sorunların listesi değildir.

| Risk | Olası sonuç | Kapsam kararı |
|---|---|---|
| Teknoloji seçimini uzatmak | Oynanabilir sürümün gecikmesi | İlk çalışan dikey dilimden sonra zorunlu olmadıkça yığın değiştirme |
| Kart sayısını erken artırmak | Metin ve denge işlerinin büyümesi | İlk sürümü 12 kartla sınırla |
| Gizli ekonomi kuralları eklemek | Sonuçların anlaşılmasının zorlaşması | Etkileri seçeneklerde açıkça göster |
| Yalnızca kötü kararları test etmek | Kazanmanın mümkün olduğunun doğrulanmaması | En az bir kazanan diziyi baştan sona dene |
| Görsel cilaya erken başlamak | Temel döngünün yarım kalması | Önce oynanış ve bitiş koşullarını tamamla |
| Mizahı açıklamanın önüne geçirmek | Oyuncunun seçeneği anlayamaması | Önce anlaşılır karar, sonra espri |

## Sık sorulan sorular

### Bu bir finans veya girişimcilik eğitim aracı mı?

Bu README’nin tanımladığı hâliyle öncelikle mizahi bir oyundur. Kuralları gerçek şirket ekonomisini modellemek üzere doğrulanmamıştır.

### Rust, Linux veya açık kaynakla mı dalga geçiyoruz?

Hayır. Hicvin hedefi belirli bir teknoloji değil, ihtiyacı değerlendirmeden her soruna aynı teknik çözümle yaklaşmaktır.

“Rust’a geç” seçeneğinin kötü olması dil hakkında bir performans veya kalite iddiası değildir; o karttaki müşteri sorununu çözmemesiyle ilgilidir.

### En teknik seçeneği seçmek her zaman kaybettirecek mi?

Bu kart setinde evet: her kartta en teknik (ve en pahalı) seçeneği seçen oyuncu 5. haftada batıyor.

v1.0'da bilinen sorun: en pahalı seçenek 12 kartın 12'sinde üçüncü sıradaydı ve her kartta ilk
seçeneği seçen oyuncu metni okumadan kazanıyordu (74.700 TL, 21 müşteri).

v1.1'den beri seçeneklerin sırası her oyunda karışır (oyun başında seçilen tohumdan; oyun içinde yer
değiştirmez). 1000 tohumda ölçüldü: "hep 1" %17,7, "hep 2" %15,8, "hep 3" %17,1 kazanıyor; rastgele
oyun %16,85. Yani düğmenin yeri artık bilgi taşımıyor; metni okumak gerekiyor.

### Neden müşteriler otomatik gelir üretmiyor?

İlk sürüm, müşteri sayısını ayrı bir başarı hedefi olarak kullanıyor. Abonelik dönemi, fiyatlandırma, tahsilat ve müşteri kaybı gibi ek kurallar bu kapsama dahil değil.

### Kazanılabilir olduğu kanıtlandı mı?

Evet. Klasik destede (`kart-seti-1.2`) kazanan bir dizi baştan sona testte oynanıyor, ayrıca 3¹² = 531.441 dizinin %16,85’i kazanıyor (`tools/kapilar birim`). v1.2 havuzunda 100 deste tam sayıldı: her destede kazanma mümkün, rastgele oyunun kazanma oranı en az %19,68, ortanca %31,32, en çok %45,50. v1.3'te zincirlerle aynı ölçüm: en az %14,24, ortanca %29,14, en çok %39,24. Havuz oyunu klasik desteden hâlâ kolay. Bu, rastgele basan birinin kazanma oranıdır, insanların değil. İnsan oyunları: geliştirici birkaç oyun, iki dış oyuncu (ikisi de kazandı ve nedenini anlattı).

### Oyun kaydı neden yok?

Kaldığın yerden devam etme yok: bir oyun birkaç dakika sürüyor. v1.2'den beri tarayıcı yalnız şunu hatırlıyor: kaç oyun oynandı, kaçı kazanıldı, en iyi kasa. Hesap yok, sunucuya bir şey gitmiyor.

### Yeni bir özellik ekleyebilir miyiz?

Önce şu üç soruyu cevaplayalım:

1. İlk oyunun tamamlanmasını sağlıyor mu?
2. Kabul ölçütlerinden birini karşılıyor mu?
3. Mevcut kapsamdan ne çıkaracağız?

Üçüne de cevap veremiyorsak öneriyi sonraki sürüm listesine alalım. Oyunun konusu hâline gelmeyelim.

## Lisans

MIT. Ayrıntı: `LICENSE`. Kodu kullanabilir, değiştirebilir, dağıtabilirsin; şirketini batırmak için de.

## Emin olunamayanlar

- Yalnız Fedora Linux 44'te, Chromium ve Firefox ile denendi. Safari/WebKit, Windows, macOS ve
  mobil tarayıcılar denenmedi.
- Ekran okuyucuyla denenmedi.
- Denge geliştiricinin oyunları ve iki dış oyuncuyla denendi; cevap verenler anlayanlardı, oynamayanların
  neyi anlamadığı bilinmiyor. Zincirleri yalnız geliştirici oynadı.
- Seçenek sırasını karıştırmak, sayıları okuyan oyuncunun ikilemini çözmüyor: etkiler düğmede yazdığı
  için müşteri getireni seçen yine rahat kazanıyor. v1.3 zincirleri bunu yalnız biraz azaltıyor; gerçek
  tercihler sonraki sürümün işi.
- Temiz bir makinede kurulum denenmedi.
- İngilizce metinler (v1.4) yapay zekâ çevirisidir; anadili İngilizce olan biri okumadı. Esprilerin
  İngilizcede de güldürdüğü ölçülmedi; İngilizce oyunu henüz bir oyuncu oynamadı.

***

> İlk günün sonunda şirket batabiliyor olacak.
> Bizimki değil. Oyundaki.
