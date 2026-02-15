# Admin Paneli Erişim Kurulumu

## 🔐 Admin Yetkisi Nasıl Verilir?

Admin paneli (`/admin`) korunmaktadır ve yalnızca veri tabanında `is_admin` bayrağı `true` olarak ayarlanmış kullanıcılar tarafından erişilebilir.

### 1. Adım: Kullanıcı Kaydı Yapın

1. `http://localhost:3200/signup` adresine gidin.
2. İstediğiniz e-posta adresiyle bir hesap oluşturun (örneğin: `admin@example.com`).
3. Kayıt işlemini tamamlayın.

### 2. Adım: Supabase üzerinden Admin Bayrağını Ayarlayın

1. [Supabase Dashboard](https://app.supabase.com) hesabınızı açın.
2. Projenize gidin.
3. **Table Editor** → **profiles** tablosuna gidin.
4. Yeni oluşturduğunuz kullanıcıyı bulun.
5. Satırı düzenleyin ve `is_admin` değerini `true` yapın.

**VEYA SQL Editörünü Kullanın:**

```sql
-- 'admin@example.com' yerine kendi e-postanızı yazın
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### 3. Adım: Admin Paneline Erişin

1. Admin hesabınızla `http://localhost:3200/login` adresinden giriş yapın.
2. `http://localhost:3200/admin` adresine gidin.
3. Artık admin dashboard'unu görebiliyor olmalısınız!

---

## 🛡️ Güvenlik Notları

- **Admin erişimi, `profiles` tablosundaki `is_admin` sütunu ile kontrol edilir.**
- Sadece `is_admin = true` olan kullanıcılar `/admin` rotalarına erişebilir.
- Tüm admin API rotaları ayrıca admin durumunu kontrol etmelidir.
- Production ortamındaki kodlarda asla admin kimlik bilgilerini veya bypass (atlatma) mekanizmalarını açık bırakmayın.

---

## 📊 Admin Paneli Özellikleri

Admin erişimine sahip olduğunuzda şunları yapabilirsiniz:

- **Dashboard**: Platform istatistiklerini ve son aktiviteleri görüntüleyin.
- **Kullanıcı Yönetimi**: Kullanıcıları arayın, filtreleyin ve yönetin.
- **Sınav Sistemleri**: Sınav müfredatlarını ekleyin ve yönetin.
- **Kısıtlamalar**: Adaptif kısıtlamaları (ARE) uygulayın ve izleyin.

---

## 🚨 Canlı Ortam (Production) İçin Önemli

Canlıya çıkmadan önce:

1. ✅ Admin bypass kodunun kaldırıldığından emin olun (şu an yapıldı).
2. ✅ Tüm admin rotalarının `is_admin` bayrağını kontrol ettiğini doğrulayın.
3. ✅ Supabase'de Satır Düzeyinde Güvenlik (RLS) politikalarını ayarlayın.
4. ✅ Admin API rotalarını middleware ile koruyun.
5. ✅ Admin kimlik bilgilerini asla versiyon kontrol sistemine (git) eklemeyin.

---

## Sorun Giderme

**Sorun**: `/admin` adresine gittiğimde `/dashboard`'a yönlendiriliyorum.
- **Çözüm**: Kullanıcınız için Supabase'de `is_admin` değerinin `true` olduğundan emin olun.

**Sorun**: `/login` sayfasına yönlendiriliyorum.
- **Çözüm**: Giriş yapmamışsınız. Önce giriş yapın.

**Sorun**: Sayfa sonsuza kadar yükleniyor.
- **Çözüm**: Tarayıcı konsolundaki hataları kontrol edin ve Supabase bağlantınızı doğrulayın.
