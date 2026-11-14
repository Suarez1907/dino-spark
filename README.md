# Dino Kazı: İstanbul (3D Gerçekçi Android & Web Oyunu)

İstanbul Boğazı kıyısında (Sarıyer / Rumeli Feneri yamaçları) geçen, **Three.js (WebGL PBR)** tabanlı yüksek grafikli 3D dinozor kazı ve keşif oyunu. **Capacitor** ile otomatik olarak Android APK'ya derlenir.

## Özellikler
- **Gerçekçi PBR Grafik Motoru:** `ACESFilmicToneMapping`, yumuşak dinamik gölgeler (`PCFSoftShadowMap`), Sobel normal haritaları (`normalMap`), pürüzlülük haritaları (`roughnessMap`) ve atmosferik Boğaz sisi (`FogExp2`).
- **İstanbul Topografyası & Boğaz Suyu:** Kireçtaşı falezleri, özel GLSL su gölgelendiricili İstanbul Boğazı, karşı kıyı tepeleri, asma köprü silüeti ve taş gözetleme kulesi.
- **Nano Banana Varlıkları:** Gerçekçi toprak/kaya ve dinozor derisi dokuları ile her keşif sonrası açılan yüksek çözünürlüklü *Saha Rehberi* kartları (T-Rex, Triceratops, Spinosaurus).
- **Dokunmatik & Masaüstü Kontrolleri:** Android için sanal joystick, kamera sürükleme ve kazı butonu; masaüstü için `WASD` + fare desteği.

## GitHub'a Yükleme ve Otomatik Android APK Alma
1. GitHub hesabınızda (`Suarez1907`) yeni bir depo oluşturun (ör. `dino-istanbul`).
2. Bu klasörün tüm içeriğini (gizli `.github` klasörü dahil) depoya yükleyin veya `git push` ile gönderin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dino Kazi Istanbul"
   git branch -M main
   git remote add origin https://github.com/Suarez1907/dino-istanbul.git
   git push -u origin main
   ```
3. Depodaki **Actions** sekmesine girin. **Android Debug APK** iş akışı otomatik olarak çalışacaktır.
4. İşlem tamamlandığında **Artifacts** bölümünden `dino-kazi-istanbul-debug-apk` dosyasını indirip Android cihazınıza kurabilirsiniz.
