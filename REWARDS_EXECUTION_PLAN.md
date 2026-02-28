# Rewards Weekly Refresh + Badge Expansion Execution Plan (2026-02-28)

## Amaç
- Ödül sayfasındaki rozet dışı ürünlerin haftalık yenilenmesini sağlamak.
- Rozetlerin kalıcı (yenilenmeyen) olmasını garanti etmek.
- Rozet sayısını anlamlı şekilde artırmak.
- Kazanılan rozetleri profil sayfasında da göstermek.
- Tüm akışların gerçekten çalıştığını test/kanıt adımlarıyla doğrulamak.

## Kapsam
- Dahil:
  - `reward_catalog` ürünleri için haftalık yenileme davranışı.
  - `badge_definitions` genişletmesi ve `user_badges` ile profil entegrasyonu.
  - API/servis/UI güncellemeleri.
  - Migration + test + doğrulama checklisti.
- Hariç:
  - Yeni oyun modu geliştirme.
  - Rozet tasarım görsellerinin son grafik prodüksiyonu (placeholder URL kullanılacak).

## Kesin Ürün Kuralları
1. Rozetler asla haftalık resetlenmez.
2. Mağaza ürünleri (badge olmayan ürünler) haftalık döngüyle tekrar satın alınabilir hale gelir.
3. Haftalık döngü başlangıcı: Pazartesi 00:00 UTC (tek kaynak zaman standardı).
4. Kullanıcının önceki hafta satın alımları geçmiş olarak saklanır, sadece "aktif/purchasable" durumu yeni haftada sıfırlanır.

## Mimari Karar
- Badge verisi ayrı tabloda kalacak (`badge_definitions`, `user_badges`) ve haftalık reset mekanizmasına hiç dahil edilmeyecek.
- Mağaza ürünleri için haftalık erişim kontrolü purchase kaydında "week key" ile yapılacak.
- Haftalık reset için iki katmanlı güvence:
  - Ana: okuma/satın alma sırasında week-key tabanlı hesap (cron bağımsız, her zaman doğru).
  - Opsiyonel: `pg_cron` ile haftalık housekeeping (performans/raporlama optimizasyonu).

## Faz 1: Veri Modeli ve Migration
1. `reward_catalog` genişlet:
- `refresh_mode text not null default 'weekly'`
- Beklenen değerler: `weekly`, `permanent`
- Kural: badge olmayan ürünlerde varsayılan `weekly`.

2. `user_reward_purchases` genişlet:
- `week_key date null`
- Haftalık ürün satın alımında `week_key = week_start_utc`.
- Kalıcı ürünlerde `week_key = null`.

3. İndeks/unique:
- Haftalık ürünlerde aynı haftada tekrar satın alma engeli:
  - partial unique index: `(user_id, reward_id, week_key)` where `week_key is not null`
- Kalıcı ürünlerde tek seferlik sahiplik (iş kuralına göre):
  - unique `(user_id, reward_id)` where `week_key is null`

4. Yardımcı SQL fonksiyonu ekle:
- `get_week_start_utc(ts timestamptz) returns date`
- Tüm server hesaplarında tek week hesaplayıcı olarak kullanılacak.

## Faz 2: RPC ve Service Güncellemeleri
1. `purchase_reward` RPC güncelle:
- Ürünün `refresh_mode` değerini oku.
- `weekly` ise mevcut hafta için idempotent/duplicate kontrolü yap.
- `permanent` ise kullanıcı daha önce aldıysa tekrar alımı engelle.
- Return payload'a `week_key` ve `next_reset_at` ekle.

2. `RewardsService.getRewardsDashboard` güncelle:
- `isPurchased` hesabı ürün tipine göre yapılacak:
  - weekly: sadece current week purchase varsa `true`
  - permanent: herhangi bir historical purchase varsa `true`
- API response'a `refreshMode`, `nextResetAt` ekle.

3. `GET /api/rewards/dashboard` sözleşmesini güncelle:
- Frontend'in sayaç ve etiket gösterebilmesi için alanları expose et.

## Faz 3: Rozet Genişletme (Badge Pack)
1. `badge_definitions` içine en az 24 yeni rozet ekle (migration seed):
- Focus Milestones: 1h, 10h, 50h, 100h toplam odak.
- Streak: 3, 7, 14, 30, 60 gün streak.
- Morning Discipline: 5, 20, 50 erken seans.
- Task Mastery: 25, 100, 300 tamamlanan görev.
- Mission Hunter: 10, 50, 150 görev claim.
- League Progress: Bronze exit, Silver reach, Gold reach, Diamond reach.
- Social/Community (veri hazırsa): 5, 25 yardım aksiyonu.
- Consistency: son 7 günde 5 gün aktif, son 30 günde 20 gün aktif.

2. Badge requirement type standardizasyonu:
- `requirement_type` değerleri için tek whitelist oluştur.
- `MissionEngine`/`RewardsService.getBadgeProgress` ile birebir eşle.

3. Backfill stratejisi:
- Mevcut kullanıcılar için rozet ilerlemesi runtime hesaplanacak.
- Kazanılmış koşullarda `user_badges` insert idempotent job ile çalıştırılacak.

## Faz 4: Profilde Rozet Görünürlüğü
1. Profil API katmanı:
- Yeni endpoint: `GET /api/profile/badges` (veya mevcut profile query genişletme).
- Dönen alanlar: `badgeId`, `title`, `imageUrl`, `category`, `unlockedAt`.

2. Profil UI (`src/app/(dashboard)/profile/page.tsx`):
- "Achievements / Rozetler" kartı ekle.
- İlk aşama: son kazanılan 6 rozet + "Tümünü Gör".
- Unlock olmayan rozetler profile'da gösterilmeyecek (yalnızca kazanılanlar).

3. Rewards UI ile uyum:
- Rewards sayfasındaki rozet kartlarıyla aynı ikon/renk kategorisi kullanılacak.

## Faz 5: Haftalık Yenilenme UI/UX
1. Rewards sayfasında ürün etiketleri:
- `weekly` ürünlerde "Haftalık" badge.
- `permanent` ürünlerde "Kalıcı" badge.

2. Sayaç:
- Günlük görev sayacından ayrı "Haftalık yenilenme" sayacı ekle.
- `nextResetAt` alanına göre hesaplama.

3. Satın alım butonu davranışı:
- weekly ürün: bu hafta alındıysa disabled + "Bu hafta alındı".
- reset sonrası otomatik tekrar aktif.

## Faz 6: Test ve Doğrulama (Çalıştığından Emin Olma)
1. Unit testler (`src/lib/__tests__/rewards.test.ts`):
- `get_week_start_utc` boundary testleri (Pazar->Pazartesi geçişi).
- weekly ürün aynı hafta 2. satın alım reddi.
- weekly ürün yeni haftada tekrar satın alım başarısı.
- permanent ürün tekrar satın alım reddi.

2. Service/API testleri:
- `RewardsService.getRewardsDashboard` `isPurchased` doğruluğu.
- `/api/rewards/purchase` response contract (`week_key`, `next_reset_at`).

3. Entegrasyon testleri:
- Rewards page: reset öncesi/sonrası buton state.
- Profile page: kazanılan rozetlerin render edilmesi.

4. Manuel QA checklist:
- Aynı kullanıcıyla haftalık ürün satın al, aynı hafta tekrar dene (bloklanmalı).
- Sistem saatini/fixture tarihini sonraki haftaya taşı, tekrar satın al (izin verilmeli).
- Rozet unlock et, hafta değiştir, profilde rozetin kaldığını doğrula.

## Uygulama Sırası
1. DB migration (schema + function + index)
2. RPC güncelleme
3. Service/API contract update
4. Badge seed expansion
5. Rewards UI weekly states
6. Profile badges UI
7. Testler + QA + dokümantasyon

## Riskler ve Önlemler
- Risk: UTC haftası ile kullanıcı lokal hafta beklentisi farklı olabilir.
- Önlem: Ürün metninde açıkça "UTC haftalık yenilenme" belirt.

- Risk: Eski purchase kayıtlarında `week_key` null kalması.
- Önlem: backfill script ile historical weekly ürünlere week_key hesapla.

- Risk: Yeni rozet türleri için metriklerin DB'de henüz olmaması.
- Önlem: Faz 1'de ölçülebilir türleri aktif et, diğerlerini feature-flag ile pasif başlat.

## Definition of Done
- Rozetler haftalık resetten etkilenmiyor.
- Tüm badge olmayan mağaza ürünleri haftalık yenileniyor.
- En az 24 yeni rozet prod veritabanında tanımlı.
- Profil sayfası kazanılmış rozetleri listeliyor.
- İlgili unit + API + entegrasyon testleri yeşil.
- QA checklist maddeleri tamamen doğrulandı.
