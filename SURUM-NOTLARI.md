# Sürüm notları

## v1.3.0

**Eklenen**
- Kararlar geri dönüyor: üç olay zinciri. İlk altyapı kararın 3 hafta sonra bakım ister, ilk tanıtım sözün
  3 hafta sonra hatırlatılır, 6 müşteriye ulaşınca 3 hafta sonra teslim sırası sorulur. Takip kartı o haftanın
  kartının yerini alır ve senin kararını alıntılar. Oyun yine 12 hafta; son hafta değişmez.
- Zinciri açacak seçeneğin altında ne olacağı kesin yazar. Takip kartına yer kalmazsa sonuç ekranında
  "GERİDE KALANLAR" satırı olur.
- `#klasik` deste zincirsiz, eskisi gibi.

**Değişen**
- Havuz biraz zorlaştı: rastgele oyunun kazanma ortancası %31,32 → %29,14 (100 deste).
- Aynı `#tohum-…` bağlantısı aynı desteyle başlar; zincir açılınca oyun kararlara göre ayrılır.

**Bilinen sorunlar**
- Zincirleri yalnız geliştirici oynadı (bir oyun). Gecikme, eşik ve takip kartı sayıları tahmin.
- Havuz klasik desteden hâlâ kolay (rastgele oyunda ortanca %29, klasik %17).
- Ekran okuyucuyla denenmedi. Yalnız Fedora Linux'ta, Chromium ve Firefox ile denendi.

## v1.2.0

**Eklenen**
- Kart havuzu: 27 kart. Her oyunda bundan 12 kartlık bir deste kurulur (4 başlangıç, 7 gelişme, 1 final); benzer kartlar aynı destede çıkmaz. Eski 12 kart eski sırasıyla: adresin sonuna `#klasik`.
- 15 yeni kart; üçünde müşteri kazanmanın moral bedeli var, moral ilk kez sıfırın altına inebiliyor.
- Sınırda kesilen etki nedeniyle gösterilir: "▲ +5 (sınır 100)". Kopyalanan sonuçta altyapı kararı sayısı var.
- Bağlantıyla aynı deste: kopyalanan sonucun bağlantısı (`#tohum-…`) arkadaşına aynı 12 kartı ve aynı seçenek sırasını açar.
- Bu tarayıcıda oynanan oyun sayısı, kazanma sayısı ve en iyi kasa (yalnız bu cihazda; hesap yok).

**Değişen**
- Kart seti `kart-seti-1.2`: kartlardaki gerçek marka adları (tablo programı, topluluk sunucusu) kaldırıldı. Marka adı
  artık bir testle denetleniyor.
- "Tur" yerine her yerde "hafta" ("Sonraki hafta"). Kazanılan oyunda "Son harcama" yerine "Son imza".

**Bilinen sorunlar**
- Havuz oyunu kolaylaştırıyor: rastgele oyunun kazanma oranı klasik destede %16,85, havuzda (100 deste) ortanca %31,32. Oyuncuların gerçek oyunlarıyla ayarlanacak.
- Etkiler düğmelerde yazdığı için sayıları okuyan oyuncu müşteri getireni seçip rahat kazanır.
- Ekran okuyucuyla denenmedi. Yalnız Fedora Linux'ta, Chromium ve Firefox ile denendi.

## v1.1.0

**Eklenen**
- Seçeneklerin sırası her oyunda karışır (oyun başında seçilen tohumdan; oyun içinde yer değiştirmez).
  v1.0'da her kartta ilk seçeneği seçen oyuncu metni okumadan kazanıyordu. 1000 oyunda ölçüldü:
  "hep 1" %17,7, "hep 2" %15,8, "hep 3" %17,1; rastgele oyun %16,85.
- Karar özeti tablosu: her kararın kasaya etkisi ve kalan kasa.
- "Sonucu kopyala": sonucu ve oyunun adresini panoya kopyalar. Tarayıcı izin vermezse metni
  seçilebilir gösterir.
- Ekranın altında sürüm ve kart seti.

**Değişen**
- Moral sıfırın altına inebilir (kasa gibi gösterilir), 100'ü geçmez, oyunu bitirmez.
  Bugünkü kartlarla moral 40'ın altına inmiyor; bu değişiklik ileride gelecek kartlar için.

**Düzeltilen**
- Tarayıcıda yalnız yazı büyütüldüğünde gövde ve seçenek metinleri büyümüyordu (sabit piksel yazı).

**Bilinen sorunlar**
- Etkiler düğmelerde yazdığı için sayıları okuyan oyuncu müşteri getireni seçip rahat kazanır.
- Ekran okuyucuyla denenmedi. Yalnız Fedora Linux'ta, Chromium ve Firefox ile denendi.

## v1.0.0

İlk sürüm: 12 kart, dört gösterge, kurucu karnesi, yeniden başlatma. Kart seti `kart-seti-1.1`.
