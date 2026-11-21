# Sürüm notları

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
