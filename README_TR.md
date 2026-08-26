# 👥 Personel Devam ve Devamsızlık Yönetim Sistemi

<p align="center"><a href="README.md">English</a> | <b>Türkçe</b></p>

**Node.js, Express, EJS ve JSON dosya tabanlı veri saklama** kullanılarak geliştirilmiş rol tabanlı personel devam/devamsızlık yönetim sistemidir.

## ✨ Temel Özellikler

- Admin ve supervisor için rol tabanlı yetkilendirme
- Çalışan ekleme, düzenleme ve durum yönetimi
- Günlük devam/devamsızlık kayıtları
- Giriş/çıkış, çalışma saati ve fazla mesai hesaplama
- Geç kalma analizi
- Vardiya ve tatil yönetimi
- Excel ve PDF raporları
- Audit log
- Yedek alma ve geri yükleme
- JSON tabanlı veri saklama

## 🔐 Güvenlik

Bu açık repository portföy için güvenli hale getirilmiştir. Gerçek `.env` dosyası, parolalar ve yedekler Git'e dahil edilmez. Giriş bilgileri environment variables üzerinden tanımlanır.

## 🚀 Kurulum

```bash
git clone https://github.com/safialajati2-creator/employee-attendance-management-system.git
cd employee-attendance-management-system
npm install
cp .env.example .env
npm start
```

Windows PowerShell için `.env` oluşturma:

```powershell
Copy-Item .env.example .env
```

Ardından tarayıcıda `http://localhost:3000` adresini açın.

## 🎯 Proje Amacı

Proje; **Node.js backend geliştirme, Express routing, EJS arayüzleri, kimlik doğrulama ve rol yetkilendirme, iş kuralları, raporlama, dosya tabanlı veri saklama ve operasyonel sistem tasarımı** becerilerini göstermeyi amaçlar.
