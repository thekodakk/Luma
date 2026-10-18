# Luma — ilk masaüstü paketi, 0.2

**Başlamak için `index.html` dosyasına çift tıkla.** İnternet, kurulum veya geliştirme sunucusu gerekmez. Klasörün tamamını birlikte tut; `assets` içindeki simgeler ve iki tasarım dosyası önizleme tarafından kullanılır.

Bu proje iki ayrı parçadan oluşuyor:

1. **Masaüstü önizlemesi:** Windows'ta veya başka bir sistemde tarayıcıda açılan, çalışan etkileşimleri olan tasarım. Linux oturumu veya ISO değildir.
2. **Linux başlangıç paketi:** `linux/` klasöründeki gerçek KDE renk şeması ve düz mor duvar kâğıdı. Kendi kurulum/kaldırma aracı ve ayrı kullanım belgesi bulunur. KDE üzerinde henüz denenmedi; önizlemedeki alt çubuğu, özel simgeleri ve uygulamaları otomatik kurmaz.

## Önizlemede neler var?

- Düz mor arka plan, koyu pencereler ve dört vurgu paleti.
- Bu proje için hazırlanmış renkli SVG simgeler ve iki kart illüstrasyonu.
- Sürüklenebilir, büyütülebilir, küçültülebilir pencereler.
- Pati düğmesinden açılan, arama yapılabilen uygulama başlatıcı.
- Çizim alanı: renk, fırça kalınlığı, geri alma ve PNG indirme. Çizimler yalnızca açık oturumda tutulur; sayfayı kapatmadan veya yenilemeden önce indir.
- Kod defteri: bu tarayıcıda otomatik metin kaydı ve dosya indirme. Kod çalıştırılmaz.
- Örnek dosya gezgini ve terminal. Bilgisayarındaki dosyalara erişmez, sistem komutlarını çalıştırmaz.

Üstteki ağ/ses/pil simgeleri cihaz ölçümü değildir. Saat gerçek yerel saati gösterir. Tarayıcı bölümü resmi proje sitelerine yeni sekmede bağlantı açar.

Tarayıcının depolama kısıtlamaları varsa tercihler ve metin kaydı yalnızca oturumda kalabilir; kod defterinin alt satırı bunu belirtir. Yerel dosya ve sunucu üzerinden açılan önizlemeler farklı kayıt alanları kullanabilir. Kalıcı kopya için dosyanı indir.

## Kontroller

- Pati: uygulama araması.
- Alt + Boşluk: başlatıcı; işletim sistemi bu kısayolu yakalarsa pati düğmesini kullan.
- Esc: açılır menüleri kapatır.
- Pencere başlığını sürükle: taşı.
- Pencere başlığına çift tıkla: büyüt/küçült.
- Karşılama → Masaüstü → Düzeni sıfırla: ilk pencere düzenine dön.

## Dosyalar

| Yol | İçerik |
|---|---|
| `index.html` | Önizlemeyi açan dosya |
| `desktop.css` | Tasarım ve ekran boyutlarına uyum |
| `desktop.js` | Etkileşimler, çizim ve yerel kayıt |
| `assets/` | Yedi simge ve iki illüstrasyon |
| `linux/` | KDE renk şeması, mor duvar kâğıdı ve kurulum aracı |

## Kontrol durumu

Önizleme tarayıcıda açılarak görsel yerleşim, palet değiştirme ve yeniden yükleme sonrası kalıcılık, kod defteri kaydı, uygulama araması, çizim/geri alma ve terminal yanıtı kontrol edildi. JavaScript sözdizimi kontrolünden geçti; kontrol sırasında tarayıcı hata kaydı boştu. Linux dosya kurulumu için yalıtılmış testler `linux/test_setup.py` içindedir. Gerçek Linux/KDE oturumu ve ISO testi henüz yapılmadı.

## Sonraki Linux aşaması

KDE Plasma 6 içeren bir sanal makinede renk şemasını ve duvar kâğıdını denemek; ardından simge teması, panel düzeni ve karşılama uygulamasını native Linux bileşenlerine uyarlamak. Bu aşama tamamlanmadan paketi bir işletim sistemi olarak dağıtmıyoruz.

Luma geçici proje adı. Çizilecek kişisel duvar kâğıdı için arka plan şimdilik düz mor bırakıldı.
