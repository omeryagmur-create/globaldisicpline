# 🚀 Global Discipline Engine - Canlıya Alma Rehberi (Deployment Guide)

Bu rehber, uygulamanızı **Vercel** üzerinde nasıl canlıya alacağınızı adım adım açıklamaktadır.

## 📦 Ön Hazırlık

Canlıya almadan önce şu bilgilerin elinizde olduğundan emin olun (Bunlar `.env.local` dosyanızda mevcuttur):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🛠️ Vercel ile Canlıya Alma Adımları

### 1. GitHub'a Yükleme (Önerilen)
Uygulamanızı Vercel'e bağlamanın en kolay yolu kodlarınızı bir GitHub reposuna yüklemektir:
1. GitHub hesabınızda yeni bir repository oluşturun.
2. Kodlarınızı buraya push edin:
   ```bash
   git add .
   git commit -m "Final build for deployment"
   git push origin main
   ```

### 2. Vercel Projesi Oluşturma
1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin.
2. **"Add New"** -> **"Project"** butonuna tıklayın.
3. GitHub reponuzu seçin ve **"Import"** deyin.

### 3. Environment Variables (Ortam Değişkenleri) Ayarı
Vercel ekranında **"Environment Variables"** bölümüne gelin ve şu anahtarları ekleyin:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sizin Supabase URL'niz |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sizin Anon Public Key'iniz |
| `SUPABASE_SERVICE_ROLE_KEY` | Sizin Service Role Key'iniz |
| `NEXT_PUBLIC_APP_URL` | Uygulamanızın Vercel URL'si (örn: `https://my-app.vercel.app`) |

### 4. Deploy!
**"Deploy"** butonuna basın. Vercel uygulamanızı derleyecek ve birkaç dakika içinde canlıya alacaktır. 🎉

---

## 🔐 Supabase Ayarları (Önemli!)

Uygulamanız canlıya çıktıktan sonra Supabase tarafında şu ayarları yapmanız gerekir:

1. **Authentication Redirects**:
   - Supabase Dashboard -> **Authentication** -> **URL Configuration** -> **Site URL** kısmına Vercel URL'nizi yazın.
   - **Redirect URLs** kısmına `https://your-app.vercel.app/**` formatında URL'nizi ekleyin.

2. **CORS Ayarları**:
   - Supabase Dashboard -> **API** -> **Settings** -> **CORS** kısmına Vercel URL'nizi ekleyin.

---

## 🛠️ Hata Giderme

- **Build Fail**: Eğer derleme hatası alırsanız, Vercel loglarını kontrol edin. Genelde eksik bir Environment Variable veya TypeScript hatası buna sebep olur.
- **Auth Error**: Giriş yapılamıyorsa, Supabase Redirect URL ayarlarını kontrol edin.
- **Admin Access**: Canlı ortamda admin yetkisi vermek için `ADMIN_SETUP.md` dosyasındaki adımları (Supabase Table Editor üzerinden `is_admin = true` yapmak) tekrarlayın.

Başarılar! 🚀
