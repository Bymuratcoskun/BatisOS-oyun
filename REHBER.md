# BatışOS oyun rehberi

[English](GUIDE.md) · **Oyna:** https://bymuratcoskun.github.io/BatisOS-oyun/

> Girişimini batmadan önce batır.

<!-- Bu dosya `src/i18n/rehber.ts` dosyasından üretilir (`tools/rehber-yaz`); elle düzenleme. -->

## İçindekiler

1. [Oyun nedir?](#nedir)
2. [Hızlı başlangıç](#baslangic)
3. [Ekranda ne var?](#ekran)
4. [Bir hafta nasıl geçer?](#hafta)
5. [Kazanmak ve kaybetmek](#bitis)
6. [Karar türleri](#kararlar)
7. [Olay zincirleri: kararlar geri döner](#zincirler)
8. [Deste, klasik deste ve tohum](#deste)
9. [Sonuç ekranı ve kurucu karnesi](#sonuc)
10. [Paylaşmak ve yeniden oynamak](#paylas)
11. [Klavye, dil ve erişilebilirlik](#kullanim)
12. [Kayıt ve gizlilik](#gizlilik)
13. [İpuçları](#ipuclari)
14. [Sık sorulan sorular](#sss)
15. [Hakkında](#hakkinda)

<a id="nedir"></a>

## Oyun nedir?

BatışOS, yeni kurulmuş bir yazılım şirketinin 12 haftasını oynatan kısa, esprili bir karar oyunudur. Bir oyun birkaç dakika sürer. Her hafta bir olay olur ve üç karardan birini seçersin.

Oyunun derdi şu: mühendisler çoğu zaman müşterinin istediği küçük şey yerine "doğrusunu" kurmak ister. Kendi motorumuzu yazalım, önce altyapıyı sağlam kuralım, baştan yazarsak daha temiz olur… Bu kararlar ekipte morali yükseltir ama kasayı boşaltır. Müşteriyle konuşup istediğini yapmak sıkıcı görünür ama şirketi ayakta tutar.

Şirket yönetimi bilmen gerekmez. Bütün sayılar ekranda yazar; oyun sana ne olacağını önceden söyler. Gerisi kartları okuyup gülmek.

<a id="baslangic"></a>

## Hızlı başlangıç

- "Şirketi kur" düğmesine bas.
- Kartı oku, üç karardan birini seç. Her kararın altında kasaya, müşteriye ve morale etkisi yazar.
- Sonucu oku, "Sonraki hafta" ile devam et.
- 12. haftanın sonunda kasan 0 TL’nin üzerindeyse ve en az 10 ödeme yapan müşterin varsa kazanırsın.

<a id="ekran"></a>

## Ekranda ne var?

- Üst çubuk: kaçıncı haftada olduğun ve dil düğmesi.
- Kasa: şirketin parası. 100.000 TL ile başlar. 20.000 TL’nin altına inince ⚠ işaretiyle kırmızı yanar.
- Ödeme yapan müşteri: 0 ile başlar, hedef 10.
- Kurucu morali: 80 ile başlar, en çok 100 olur. Sıfırın altına da inebilir. Moral oyunu bitirmez; yalnız ne kadar keyifli battığını gösterir.
- Faaliyet günlüğü: her haftanın sonucu, en yenisi üstte.
- Alt satır: oyunun sürümü, kart setinin adı ve bu destenin tohumu (hata bildirirken işe yarar).

<a id="hafta"></a>

## Bir hafta nasıl geçer?

Her hafta bir olay kartı açılır: başlık, kısa bir durum ve üç karar. Kararların altında etkileri sayıyla yazar, örneğin "Kasa −5.000 TL · Müşteri +3 · Moral 0". Gizli bir etki yoktur: yazan ne ise o olur.

Karar verince sonuç ekranı gelir: göstergelerin öncesi, sonrası ve ne olduğunu anlatan kısa bir metin. Müşteri 0’ın altına, moral 100’ün üstüne çıkamaz; böyle bir kesinti olursa yanında "(sınır 100)" gibi bir not yazar.

Seçeneklerin sırası her oyunda karışır. Düğmenin yeri bir şey anlatmaz; metni okumak gerekir.

<a id="bitis"></a>

## Kazanmak ve kaybetmek

- Kasa 0 TL’ye ya da altına düşerse şirket o anda kapanır. Aynı kararla gelen müşteri seni kurtarmaz.
- 12 haftayı bitirdiğinde kasa pozitif ve en az 10 ödeme yapan müşteri varsa: şirket ayakta, kazandın.
- 12 haftayı bitirdin ama müşteri 10’dan azsa: kaybettin. Yatırımcı buna "kumbara" der.
- Moral ne olursa olsun oyunu bitirmez.

Müşteriler bu oyunda kendiliğinden para getirmez. Kasa yalnız kararlarla değişir, müşteri sayısı ayrı bir hedeftir.

<a id="kararlar"></a>

## Karar türleri

Kartlarda üç tür karar sık görülür. Ekranda etiket yazmaz, ama sonuç ekranındaki unvanlar ve olay zincirleri bunlara bakar:

- Müşteriye dönük karar: ucuzdur, müşteri getirir, moral biraz düşer. Sıkıcıdır. İşe yarar.
- Tanıtım kararı: duyuru, rozet, sunum, video. Moral yükselir, müşteri pek gelmez.
- Altyapı kararı: "kendimiz yazalım", "önce motoru kuralım". Pahalıdır, morali en çok yükselten odur, müşteri getirmez. Sonuç ekranında kaç tane aldığın sayılır.

<a id="zincirler"></a>

## Olay zincirleri: kararlar geri döner

Normal oyunda bazı kararlar 3 hafta sonra geri gelir. 3 zincir var ve her biri bir oyunda en fazla bir kez açılır:

- Bakım: ilk altyapı kararın 3 hafta sonra bakım ister ("O Şey Hâlâ Çalışıyor").
- Söz: ilk tanıtım sözün 3 hafta sonra hatırlatılır ("Hani?").
- Teslim: 6 müşteriye ulaştığında 3 hafta sonra herkes aynı soruyu sorar ("Bizimki Ne Zaman Hazır?").

Zinciri açacak kararın altında ne olacağı önceden, turuncu bir satırla yazar; örneğin "3 hafta sonra bakım ister." Söylediği aynen olur.

Takip kartı o haftanın kartının yerini alır ve senin kararını alıntılar. Oyun yine 12 hafta sürer; son hafta hiç değişmez. Takip kartına yer kalmazsa (geç açılan zincir) ya da şirket erken batarsa, sonuç ekranında "GERİDE KALANLAR" başlığı altında bir satır olur.

<a id="deste"></a>

## Deste, klasik deste ve tohum

Her oyunda 27 kartlık bir havuzdan 12 kartlık bir deste kurulur: 4 başlangıç, 7 gelişme, 1 final kartı. Birbirine çok benzeyen kartlar aynı destede çıkmaz. Böylece her oyun biraz farklıdır.

- Klasik deste: adresin sonuna #klasik yaz. İlk sürümün 12 kartı, ilk sırasıyla gelir; olay zinciri yoktur.
- Tohum: her destenin bir numarası vardır (alt satırda "tohum …"). #tohum-NUMARA adresi aynı desteyi ve aynı seçenek sırasını açar. Kararların farklıysa oyun yine farklı gider.

<a id="sonuc"></a>

## Sonuç ekranı ve kurucu karnesi

Oyun bitince şunları görürsün: kaç hafta dayandığın, kalan kasa, müşteri, moral, aldığın altyapı kararı sayısı, son harcaman (kazandıysan son imzan) ve bir yatırımcı yorumu. Karar özeti tablosu her kararın kasaya etkisini ve kalan kasayı hafta hafta gösterir.

Kurucu karnesindeki unvanlar:

- İstemeden CEO: kazandın.
- Mimar Sinan, Gelir Sıfır: en az 4 altyapı kararı aldın ve oyunu 0 müşteriyle bitirdin.
- Sunum Unicorn’u: en az 3 tanıtım kararı aldın ve 3’ten az müşteriyle bitirdin.
- Açık Kaynak Fedaisi: 300 TL’lik API faturasına karşı "kendimiz yazalım" dedin ve kaybettin.

Birden fazla unvan aynı anda gelebilir. Hiç unvan yoksa: vasatlık da bir başarıdır.

<a id="paylas"></a>

## Paylaşmak ve yeniden oynamak

- "Sonucu kopyala" sonucu ve bu destenin bağlantısını panoya kopyalar. Bağlantıyı alan arkadaşın aynı desteyle oynar. Tarayıcı izin vermezse metin seçilebilir bir kutuda çıkar.
- İngilizce oynarken kopyalanan bağlantı oyunu İngilizce açar.
- "Yeniden dene" yeni bir desteyle baştan başlar.
- "Suçu teknoloji yığınına at" da baştan başlar; tek farkı günlüğe "Sorumluluk devredildi." yazmasıdır.

<a id="kullanim"></a>

## Klavye, dil ve erişilebilirlik

- 1, 2 ve 3 tuşları ekrandaki sıraya göre kararı seçer. Bütün düğmeler Tab ve Enter ile de kullanılır.
- Artış ve azalış yalnız renkle değil, ▲ ▼ işareti ve metinle de gösterilir.
- Yazıyı büyütmek (%200’e kadar) ve dar telefon ekranı desteklenir.
- Dil: üst çubuktaki düğme Türkçe ile İngilizce arasında geçer; oyunun ortasında da çalışır ve bu tarayıcıda hatırlanır. Adresin sonuna ?lang=en ya da ?lang=tr de yazılabilir.
- Oyun bir ekran okuyucuyla henüz denenmedi.

<a id="gizlilik"></a>

## Kayıt ve gizlilik

Hesap yok, sunucu yok, izleme yok. Oyun hiçbir yere veri göndermez. Bu tarayıcı yalnız şunları hatırlar: kaç oyun oynadığın, kaçını kazandığın, en iyi kasan ve dil seçimin. Özel pencerede bunlar saklanmaz; ekranda öyle yazar. Yarım kalan oyun kaydedilmez, zaten birkaç dakika sürüyor.

<a id="ipuclari"></a>

## İpuçları

- Müşteriyle konuşmak neredeyse her zaman işe yarar. Bunu kimseye söyleme.
- Morali yüksek tutmak kasayı korumaz. 100 moralle batmak mümkündür; denendi.
- Turuncu uyarıyı oku: bugün parlak görünen karar 3 hafta sonra faturasını getirir.
- Batmak da eğlencelidir. Unvanların çoğu batanlara verilir.

<a id="sss"></a>

## Sık sorulan sorular

- Gerçek bir şirket simülasyonu mu? Hayır. Sayılar oyun ayarıdır, piyasa verisi değildir.
- Kartlarda gerçek şirket ya da ürün var mı? Hayır; yalnız herkesin bildiği teknik adlar (CSV, Rust, Kubernetes, JavaScript) geçer.
- Para birimi neden TL? Oyun Türkiye’de kurulan bir girişimi anlatır; İngilizcede de TL kalır.
- Simit nedir? Susamlı, halka biçiminde bir Türk simidi. Kurulumu simitle yapmak gelenektir.
- Mimar Sinan kim? Yapıları yüzyıllardır ayakta duran ünlü Osmanlı mimarı. Şirketin onun kadar dayanıklı değil.
- Eklenti sistemi gelecek mi? Hayır. Alt satırda da yazıyor.

<a id="hakkinda"></a>

## Hakkında

BatışOS açık kaynaklıdır (MIT lisansı). Tarayıcıda çalışır, kurulum istemez. Chromium ve Firefox ile denendi.
