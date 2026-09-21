# Koyu ve aydınlık tema

`src/app/themes.css`, kullanıcının verdiği iki radial-gradient tanımını değiştirmeden içerir. Aydınlık zeminde 10, koyu zeminde 4 katman vardır. Gövde arka planı sabitlenmiştir; kartlar ve form alanları kontrastı koruyan ayrı yüzeyler kullanır.

Tema `html[data-theme="light" | "dark"]` ile uygulanır. İlk ziyarette sistem tercihi kullanılır. Menüdeki güneş/ay düğmesi seçimi `alfa-theme` anahtarıyla localStorage'a kaydeder. Root layout içindeki küçük başlangıç betiği tercihi ilk çizimden önce uygular; React hydration sırasında tema farkına izin yalnızca html öğesinde verilir. Depolama erişimi kapalıysa düğme mevcut sayfada çalışmaya devam eder.

Renkler ortak nötr tonlardan ve `--surface`, `--muted`, `--line`, `--white` gibi anlamsal değişkenlerden gelir. Buradaki `--white` tarihsel olarak ana yazı renginin adıdır; aydınlık temada koyu renk olur. Video ve fotoğraf üzerindeki metinler iki temada da sabit kontrastlı tutulur. Yönetim panelinin tema düğmesi sağ alt köşededir.

Tarayıcı kontrolü:

```sh
node scripts/verify-themes.mjs
```

`agent-browser` kurulu olmalıdır. Gerekirse `AGENT_BROWSER_BIN` ile çalıştırılabilir dosyanın yolunu, `THEME_TEST_URL` ile test adresini ve `THEME_TEST_SESSION` ile açık tarayıcı oturumunu belirtin. Komut iki temada sekiz sayfayı, gradient katmanlarını, tercih kalıcılığını, sistem tercihini, yatay taşmayı, mobil menüyü ve Escape sonrası odak dönüşünü kontrol eder. Form göndermez.
