# 👥 Personel Devam ve Devamsızlık Yönetim Sistemi

<p align="center">
  <a href="README.md">English</a> | <b>Türkçe</b>
</p>

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Templates-B4CA65)
![ExcelJS](https://img.shields.io/badge/ExcelJS-Raporlama-217346)
![PDFKit](https://img.shields.io/badge/PDFKit-PDF%20Rapor-red)
![Status](https://img.shields.io/badge/Durum-Portf%C3%B6y%20Projesi-success)

**Node.js, Express ve EJS** ile geliştirilmiş rol tabanlı bir **personel devam/devamsızlık, çalışma saati, fazla mesai ve operasyonel raporlama sistemi**dir. Proje, veritabanı sunucusuna ihtiyaç duymadan çalışabilen hafif bir iş uygulaması olarak tasarlanmış ve operasyonel veriler yapılandırılmış JSON dosyalarında saklanmıştır.

Uygulama; çalışan yönetimi, günlük devam kaydı, giriş/çıkış takibi, geç kalma tespiti, fazla mesai hesaplama, vardiyalar, tatiller, raporlar, Excel/PDF çıktıları, audit log ve yedekleme/geri yükleme süreçlerini tek sistemde birleştirir.

## 🖥️ Ekran Görüntüleri

Portföy sunumu için proje ekran görüntüleri bu bölüme eklenecektir.

## ✨ Temel Özellikler

### Çalışan Yönetimi
- Yeni çalışan ekleme
- Çalışan bilgilerini düzenleme
- Ad, soyad veya kimlik numarasıyla arama
- Çalışanı aktif / pasif yapma
- Devam geçmişi olmayan çalışanı silme
- Aylık devam özeti içeren çalışan profil sayfası
- Çalışana vardiya atama
- Çalışana devam kaydı sorumlusu süpervizör atama
- `.xlsx` dosyasından çalışan içe aktarma

### Devam / Devamsızlık
- Günlük devam kayıt ekranı
- Desteklenen durumlar: **Geldi**, **Gelmedi**, **İzinli**, **Raporlu**
- Giriş ve çıkış saati takibi
- Aynı çalışan + aynı tarih için mükerrer kayıt engelleme
- Daha önce kaydedilmiş devam kaydını düzenleme
- Açıklama, devamsızlık sebebi ve sağlık raporu bilgileri
- Süpervizör yetkisine göre sınırlı devam kayıt akışı

### Çalışma Saati, Fazla Mesai ve Geç Kalma
- Otomatik çalışma saati hesaplama
- Fazla mesai başlangıç/bitiş ve toplam fazla mesai hesaplama
- Genel çalışma saati veya atanmış vardiyaya göre geç kalma tespiti
- Ayarlanabilir geç kalma toleransı
- Cumartesi için ayrı vardiya saatleri
- Toplam gecikme dakikaları ve çalışan özetleriyle geç kalma raporları

### Vardiyalar, Tatiller ve Ayarlar
- Çalışma programı / vardiya tanımlama
- Hafta içi ve cumartesi çalışma saatleri
- Vardiya bazlı geç kalma toleransı
- Tatil tarihi tanımlama
- Genel çalışma başlangıç/bitiş ayarları
- Genel fazla mesai başlangıç saati ayarı

### Raporlama
- Çalışan bazlı aylık devam raporu
- Tüm çalışanlar için aylık genel özet
- Geldi / Gelmedi / İzinli / Raporlu toplamları
- Toplam çalışma saati
- Toplam fazla mesai saati
- Geç kalma raporu
- **ExcelJS** ile Excel çıktısı
- **PDFKit** ile PDF çıktısı
- Türkçe karakterlerin doğru görüntülenmesi için platformlar arası Unicode font bulma desteği

### Yedekleme ve Audit Log
- Önemli çalışan ve devam değişikliklerinden önce otomatik yedek
- Manuel yedek oluşturma
- Seçili yedekten geri yükleme
- Geri yükleme öncesi güvenlik yedeği
- Çalışanlar, devam kayıtları, audit log, vardiyalar, ayarlar ve tatiller için yedekleme
- Önemli sistem işlemlerinin audit log kayıtları

## 👤 Roller ve Yetkiler

### Admin
Admin, sistemin tüm yönetim bölümlerine erişebilir:

- Dashboard
- Çalışan yönetimi
- Excelden çalışan içe aktarma
- Devam kayıtları
- Raporlar ve dışa aktarma
- Geç kalma analizi
- Yedekleme / geri yükleme
- Ayarlar
- Vardiyalar
- Tatiller

### Supervisor
Süpervizör rolü operasyonel devam akışıyla sınırlandırılmıştır:

- Dashboard erişimi
- Devam kayıt ekranı
- Kendisine görünür olan çalışanların devam kayıtlarını işleme

Çalışan yönetimi, raporlar, yedekler, ayarlar, vardiyalar ve tatiller gibi admin bölümleri süpervizör için **403 Forbidden** döndürür.

## 🧰 Kullanılan Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| Node.js | Sunucu tarafı çalışma ortamı |
| Express | Routing ve HTTP uygulama katmanı |
| EJS | Sunucu tarafında oluşturulan arayüzler |
| express-ejs-layouts | Ortak sayfa düzeni |
| express-session | Session tabanlı kimlik doğrulama |
| JSON dosyaları | Hafif veri saklama |
| ExcelJS | Excel içe aktarma ve rapor üretimi |
| PDFKit | PDF rapor üretimi |
| Multer | Geçici Excel dosyası yükleme |
| Bootstrap / özel CSS | Responsive arayüz |
| Vanilla JavaScript | Ön yüz etkileşimleri |

## 🏗️ Uygulama Mimarisi

```text
├── server.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── attendance.js
│   ├── reports.js
│   ├── backups.js
│   ├── import.js
│   ├── late.js
│   ├── settings.js
│   ├── shifts.js
│   └── holidays.js
├── storage/
│   ├── fileStorage.js
│   └── backup.js
├── utils/
│   ├── auditLog.js
│   ├── calculationUtils.js
│   ├── dateUtils.js
│   ├── exportExcel.js
│   ├── exportPdf.js
│   ├── fontUtils.js
│   └── lateUtils.js
├── views/
│   ├── attendance/
│   ├── backups/
│   ├── employees/
│   ├── holidays/
│   ├── late/
│   ├── reports/
│   ├── settings/
│   └── shifts/
├── public/
│   ├── css/
│   └── js/
└── data/
    ├── employees.json
    ├── attendance.json
    ├── audit_logs.json
    ├── shifts.json
    ├── settings.json
    ├── holidays.json
    ├── users.json
    └── backups/
```

## 💾 Veri Saklama Modeli

Proje bilinçli olarak **MySQL, PostgreSQL, MongoDB veya SQLite gerektirmez**. Hafif bir iş uygulaması mimarisini göstermek için yerel JSON dosyaları kullanır.

Veri saklama katmanı şu özelliklere sahiptir:

- Eksik veri dosyalarını otomatik oluşturma
- Güvenli JSON okuma
- Geçici dosya + rename ile atomik yazma
- Benzersiz ID üretimi
- Bozuk veri dosyasını sessizce ezmeden hata verme
- Zaman damgalı yedek klasörleri

Bu yapı yerel / dahili kullanım ve portföy demonstrasyonu için pratiktir. Çok kullanıcılı büyük bir üretim ortamında transactional bir veritabanına geçmek önerilir.

## 🔐 Kimlik Doğrulama ve Güvenlik

Açık repository portföy için güvenli hale getirilmiştir.

- Gerçek `.env` dosyası Git'e dahil edilmez
- Gerçek parola veya production credential repository içinde tutulmaz
- Giriş bilgileri environment variable üzerinden alınır
- `SESSION_SECRET` zorunludur
- `data/users.json` parola içermez
- Yedek dosyaları Git'e dahil edilmez
- Excel yüklemeleri geçicidir ve `.xlsx` ile sınırlandırılmıştır
- Geçici yükleme dosyaları işlem sonunda temizlenir
- Rol tabanlı yetkilendirme admin route'larını korur

Production kullanımında parola hashleme, kalıcı session store, CSRF koruması, rate limiting, HTTPS üzerinde secure cookie ve veritabanı tabanlı kullanıcı modeli eklenmesi önerilir.

## 🌐 Environment Variables

`.env.example` dosyasını `.env` olarak kopyalayıp kendi yerel değerlerinizi girin:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guvenli_admin_parolasi

SUPERVISOR_USERNAME=supervisor
SUPERVISOR_PASSWORD=guvenli_supervisor_parolasi

SESSION_SECRET=uzun_rastgele_session_secret
PORT=3000
```

İsteğe bağlı PDF font ayarları:

```env
PDF_FONT_PATH=/unicode/font/dosyasinin/tam/yolu.ttf
PDF_FONT_BOLD_PATH=/unicode/bold/font/dosyasinin/tam/yolu.ttf
```

Sistem ayrıca Windows, Linux ve macOS üzerindeki yaygın Unicode font konumlarını otomatik arar; böylece Türkçe PDF karakterleri tipik ortamlarda doğru görünür.

## 🚀 Kurulum ve Çalıştırma

```bash
git clone https://github.com/safialajati2-creator/employee-attendance-management-system.git
cd employee-attendance-management-system
npm install
```

Environment dosyasını oluşturun.

macOS / Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

`.env` değerlerini düzenledikten sonra:

```bash
npm start
```

Tarayıcıdan:

```text
http://localhost:3000
```

## 📥 Excelden Çalışan İçe Aktarma Formatı

İlk çalışma sayfası okunur ve ilk satır başlık kabul edilir. Beklenen sütunlar:

| Sütun | Değer |
|---|---|
| A | 11 haneli kimlik numarası |
| B | Ad |
| C | Soyad |
| D | Departman |
| E | İşe başlangıç tarihi |
| F | Not |

Geçersiz, eksik veya tekrar eden satırlar atlanır ve sonuç ekranında raporlanır.

## 📊 Raporlama Detayları

### Çalışan Aylık Excel / PDF
Günlük kayıtlar ve aylık toplamlar bulunur:

- Tarih ve gün
- Devam durumu
- Giriş / çıkış
- Çalışma saati
- Fazla mesai
- Devamsızlık sebebi
- Sağlık raporu bilgisi
- Açıklama / not

### Genel Aylık Excel
Seçilen ay ve yıl için çalışan bazlı toplamları gösterir.

### Geç Kalma Excel / PDF
Çalışan, departman, tarih, gerçek giriş saati, planlanan başlangıç ve gecikme dakikasını içerir.

## ✅ Yapılan Kontroller

Portföy sürümünde ana akışlar smoke test ile kontrol edilmiştir:

- Doğru ve hatalı giriş
- Giriş yapılmadan ana sayfaya erişimde login yönlendirmesi
- Admin dashboard ve tüm admin sayfaları
- Supervisor dashboard ve devam kayıt ekranı
- Supervisor için admin bölümlerinde `403` kontrolü
- Çalışan ekleme / görüntüleme / güncelleme / aktif / pasif işlemleri
- Günlük devam kaydı oluşturma ve düzenleme
- Çalışan aylık Excel çıktısı
- Türkçe karakter destekli çalışan aylık PDF çıktısı
- Genel aylık Excel raporu
- Geç kalma Excel raporu
- Türkçe karakter destekli geç kalma PDF raporu
- Ayar güncelleme
- Vardiya oluşturma
- Tatil oluşturma
- Manuel yedek oluşturma
- Excelden çalışan içe aktarma
- 404 sayfası
- JavaScript syntax kontrolü
- EJS template compile kontrolü

## ⚠️ Portföy / Production Kapsamı

Bu repository, gerçek iş süreçlerinin ve uygulama mimarisinin nasıl tasarlandığını göstermek amacıyla hazırlanmıştır. Portföy ve yerel/dahili demonstrasyon için uygundur; yukarıdaki production güvenlik geliştirmeleri yapılmadan tamamlanmış enterprise HR platformu olarak değerlendirilmemelidir.

## 🎯 Proje Amacı

Bu proje; **Node.js backend geliştirme, Express routing, EJS arayüz geliştirme, kimlik doğrulama ve yetkilendirme, iş kuralları, dosya tabanlı veri saklama, devam hesaplamaları, Excel/PDF raporlama, veri içe aktarma, audit log, yedekleme/geri yükleme ve operasyonel iş sistemi tasarımı** becerilerini göstermeyi amaçlar.
