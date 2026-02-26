# Rewards / Hediye Sayfası Eksik Analizi (2026-02-26)

Bu doküman, `CLAUDE_CODE_REWARDS_BACKLOG.md` hedeflerine göre mevcut durum ve kalan eksikleri listeler.

## 1) Kısa Durum

Sistem kısmen tamamlanmış durumda:
- Rewards data modeli + RPC + temel API + Rewards UI + XP Market entegrasyonu var.
- Ancak güvenlik, tek kaynak (single source of truth), claim stratejisi ve test kapsamı tarafında kritik açıklar var.

Sonuç: **Henüz eksiksiz değil.**

## 2) Kritik Eksikler (P0)

### P0-1: Mission claim güvenlik açığı (Client XP enjekte edebiliyor)
- Kanıt: `src/app/api/rewards/claim/route.ts:14-20`
- Problem: API, `xpReward` değerini request body'den alıyor ve RPC'ye direkt iletiyor.
- Risk: Kullanıcı request'i manipüle ederek istediği XP'yi claim edebilir.
- Gereken düzeltme:
  - `xpReward` istemciden alınmamalı.
  - Sunucu tarafında mission ID -> reward XP map (tercihen DB) kullanılmalı.
  - RPC sadece `mission_id` ile hesaplayacak şekilde yeniden tasarlanmalı.

### P0-2: Mission stratejisi karışık (manual + otomatik birlikte)
- Kanıtlar:
  - Manual claim akışı: `src/app/(dashboard)/rewards/page.tsx:101-121`
  - Otomatik ödül akışı: `src/services/FocusService.ts:60-83` ve `src/lib/missionEngine.ts:89-143`
- Problem: Backlog “tek strateji” şartına aykırı.
- Risk: Çifte ödül / beklenmeyen davranış / ürün tutarsızlığı.
- Gereken düzeltme:
  - Tek model seç: ya tamamen manual claim ya tamamen automatic claim.
  - Seçilmeyen akışı tamamen kaldır.

### P0-3: Mission tanımları tek kaynak değil
- Kanıtlar:
  - Rewards service missions: `src/services/RewardsService.ts:121-125`
  - Mission engine rules: `src/lib/missionEngine.ts:30-61`
- Problem: ID, reward ve koşullar farklı; iki ayrı kaynak var.
- Risk: UI ile engine farklı mission gösterir/ödüllendirir.
- Gereken düzeltme:
  - Mission tanımını tek yere taşı (tercihen DB tablosu + service).
  - Hem rewards page hem dashboard mission component bu kaynaktan beslenmeli.

### P0-4: Purchase RPC yarış koşulu riski (tam atomiklik zayıf)
- Kanıt: `supabase/migrations/20260226110000_rewards_system.sql:84-117`
- Problem:
  - Balance check + profile update arasında kilitleme yok (`SELECT ... FOR UPDATE` yok).
  - Farklı idempotency key'lerle eşzamanlı isteklerde overspend ihtimali var.
- Gereken düzeltme:
  - Transaction içinde kullanıcı satırını kilitle.
  - `total_xp >= cost` koşullu update veya güvenli ledger-first yaklaşımı uygula.

## 3) Önemli Eksikler (P1)

### P1-1: Backlog’daki API sözleşmesi tam uymuyor
- Beklenen: `GET /api/rewards/missions`
- Mevcut: `POST /api/rewards/claim`, `GET /api/rewards/dashboard`, `POST /api/rewards/purchase`
- Kanıt: `src/app/api/rewards/*`
- Gereken düzeltme:
  - Ya `/missions` endpointini ekle,
  - Ya backlog dokümanını resmi olarak yeni sözleşmeye güncelle.

### P1-2: RewardsService hedef metotları eksik/ayrışmamış
- Backlog hedefleri: `getRewardsDashboard`, `purchaseReward`, `getBadgeProgress`, `getDailyMissions`
- Mevcut: `getRewardsDashboard`, `purchaseReward`, `claimMission`
- Kanıt: `src/services/RewardsService.ts`
- Gereken düzeltme:
  - Mission ve badge logic’i ayrı metotlara böl.
  - Daha testlenebilir ve sürdürülebilir hale getir.

### P1-3: i18n tamamlanmamış
- Kanıt: `src/components/xp-market/XPMarket.tsx:47,61,64,67,102-104,136,148,152`
- Problem: XP Market içinde hardcoded EN metinler var.
- Gereken düzeltme:
  - Tüm metinleri translation dosyasına taşı.

## 4) Kalite/Test Eksikleri (P2)

### P2-1: Test kapsamı acceptance kriterlerini tam karşılamıyor
- Mevcut test: `src/lib/__tests__/rewards.test.ts`
- Eksik senaryolar:
  - Insufficient XP (RPC davranışı gerçekçi seviyede)
  - Duplicate idempotency key ile double-charge engeli (entegrasyon)
  - Mission claim duplicate prevention (aynı gün)
  - Badge unlock progression edge-case’leri
- Gereken düzeltme:
  - Unit + integration testleri (özellikle RPC davranışı) genişlet.

### P2-2: Operability/Admin yönetimi yok
- Backlog’ta katalogu deploy’suz yönetme beklentisi var.
- Mevcutta admin panel/endpoint görünmüyor.

## 5) Güçlü Taraflar (Tamamlananlar)

- Rewards şema tabloları mevcut:
  - `reward_catalog`, `user_reward_purchases`, `badge_definitions`, `user_badges`, `daily_mission_claims`
  - Kanıt: `supabase/migrations/20260226110000_rewards_system.sql:2-57`
- Purchase RPC + idempotency iskeleti mevcut:
  - Kanıt: `...rewards_system.sql:74-130`
- Rewards page backend-driven çalışıyor:
  - Kanıt: `src/app/(dashboard)/rewards/page.tsx:36-42`
- XP Market aynı purchase flow’u kullanıyor:
  - Kanıt: `src/components/xp-market/XPMarket.tsx:23-26` ve `54-57`

## 6) Eksiksiz Hedef İçin Net Yol Haritası

1. Mission stratejisi seç ve tekleştir (manual vs auto).
2. Mission tanımlarını tek kaynakta topla (DB + service).
3. Claim güvenliğini düzelt (`xpReward` client’tan gelmeyecek).
4. Purchase RPC’ye concurrency-safe atomiklik ekle.
5. API sözleşmesini netleştir (`/missions` ekle veya backlog’u güncelle).
6. RewardsService’i görev bazlı metotlara ayır.
7. XP Market i18n hardcoded metinlerini temizle.
8. Acceptance kriterlerine göre testleri tamamla.

## 7) “Eksiksiz” Kabul Kontrolü

Aşağıdaki maddeler sağlanmadan “tamamlandı” denmemeli:
- [ ] Client request değiştirerek fazla XP claim edemiyor.
- [ ] Mission ödülleri tek strateji ile çalışıyor.
- [ ] Mission tanımı tek kaynak ve tüm ekranlarda aynı.
- [ ] Purchase flow eşzamanlı isteklerde double-spend üretmiyor.
- [ ] API + service sözleşmesi backlog ile uyumlu.
- [ ] Rewards ve XP Market metinleri tam i18n.
- [ ] Kritik reward akışları testlerle korunuyor.
