# Luma — KDE Plasma başlangıç paketi

Bu paket **renk şeması ve düz mor duvar kâğıdı** içerir. Linux dağıtımı, ISO, masaüstü oturumu veya tam Plasma teması değildir. HTML prototipindeki özel pencere düzeni ve simgeler bu paketle otomatik olarak Plasma'ya aktarılmaz.

Hedef: KDE Plasma 6, Python 3.8 veya üzeri. Windows'ta dosya işlemleri yalıtılmış test klasörlerinde doğrulandı; **KDE üzerinde görsel/çalışma doğrulaması henüz yapılmadı.**

## Kurulum

Linux'ta terminali bu klasörde açın:

```sh
python3 setup.py install
```

`sudo` kullanmayın. Paket yüklenmez ve masaüstü ayarları değiştirilmez. Yalnızca mevcut kullanıcının veri dizinine iki dosya kopyalanır:

- `~/.local/share/color-schemes/Luma.colors`
- `~/.local/share/wallpapers/Luma/luma-purple.svg`

`XDG_DATA_HOME` tanımlıysa bu dizin `~/.local/share` yerine kullanılır. Kurulum kaynak dosyalarının SHA-256 değerlerini `checksums.json` ile doğrular. Aynı isimde dosya varsa önce `luma-starter-kit/backups/` altında yedeklenir; konumu terminalde bildirilir. Tekrar kurulum için önce kaldırma yapılmalıdır.

## Görünümü seçme

1. Sistem Ayarları içinde **Renkler** sayfasını arayın ve **Luma** şemasını uygulayın. Görünmezse ayar penceresini kapatıp yeniden açın.
2. Masaüstüne sağ tıklayın, masaüstü/duvar kâğıdı ayarını açın ve **Resim ekle** ile yukarıdaki `luma-purple.svg` dosyasını seçin. Dil/sürüm nedeniyle etiketler değişebilir.

Palet: pencere `#1e1b29`, düz duvar kâğıdı `#352447`, mint vurgu `#8cdecf`, lavanta `#bca4f1`. Mevcut pencere dekorasyonu ve Plasma stili renkleri kendi destekleri ölçüsünde kullanır. Sonradan çizdiğiniz duvar kâğıdını aynı ayar ekranından seçebilirsiniz.

## Güvenli kaldırma

Önce Plasma ayarlarından başka bir renk şeması ve duvar kâğıdı seçin. Ardından:

```sh
python3 setup.py uninstall
```

Yalnızca kayıtlı kurulumla aynı SHA-256 değerine sahip dosyalar kaldırılır. Önceki dosyalar yedeklerinden geri yüklenir. Sonradan değiştirdiğiniz dosyalar, değiştirilmiş/eksik yedekler ve ilgili kayıt korunur; bu durumda çıkış kodu `2` olur. Boş dizinler bırakılır. Ayarlar otomatik geri alınmaz çünkü kurulum ayarları değiştirmez.

Değişmiş bir dosya kaldırmayı engelliyorsa kendi değişikliğinizi başka yere kaydedin; bildirilen hedef dosyayı elle kaldırıp `uninstall` komutunu yeniden çalıştırın. Yedeği bozulmuş bir dosyada önce yedeği kurtarın; kurulum kaydını gelişigüzel silmeyin.

İşlem zorla kapatılırsa `luma-starter-kit/install.lock` kalabilir. Başka bir kurulum/kaldırma çalışmadığından emin olduktan sonra yalnızca bu kilidi silin ve `uninstall` çalıştırın. Günlük `luma-starter-kit/state.json` içindedir.

## Yalıtılmış doğrulama

```sh
python3 test_setup.py
python3 setup.py install --data-dir "/tmp/luma isolated test"
python3 setup.py uninstall --data-dir "/tmp/luma isolated test"
```

`--data-dir` normal veri diziniyle aynı işlemleri belirtilen dizinde yapar; test için boş/geçici bir klasör verin. Bu seçenek olmadan Linux dışındaki sistemlerde kurulum/kaldırma reddedilir. Sembolik bağlantılı hedef yollar reddedilir. Birim testleri geçici klasör kullanır; mevcut masaüstüne dokunmaz.

## Teknik kaynaklar

- [KDE Plasma geliştirme belgeleri](https://develop.kde.org/docs/plasma/)
- [KDE Breeze Dark renk şeması: resmi alan/grup örneği](https://raw.githubusercontent.com/KDE/breeze/master/colors/BreezeDark.colors)

Şema bu örneğin renk gruplarını kullanır; Luma paleti özgündür. Duvar kâğıdı doğrudan seçilen bağımsız bir SVG'dir; Plasma duvar kâğıdı paketi veya eklentisi değildir.
