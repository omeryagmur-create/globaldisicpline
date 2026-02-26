# Rewards System Backlog (For Claude Code)

## Objective
Convert the current static rewards/gifts experience into a real, secure, and testable system with a single source of truth.

## Scope
- Rewards page (`/rewards`)
- XP Market integration
- Mission reward claim flow
- Supabase schema + RPC + API + service layer
- Tests for core reward flows

## P0 (Critical)

### 1) Create Rewards Data Model
Add migrations for:
- `reward_catalog`
- `user_reward_purchases`
- `badge_definitions`
- `user_badges`
- `daily_mission_claims`

Requirements:
- Proper foreign keys to `profiles`
- Timestamps (`created_at`, optional `updated_at`)
- Status/active fields where relevant
- Indexes for read-heavy queries (user_id, reward_id, created_at)

### 2) Implement Secure Purchase RPC
Create RPC:
- `purchase_reward(p_user_id uuid, p_reward_id uuid, p_idempotency_key text)`

Must handle:
- XP balance check
- Atomic XP deduction + purchase record insert
- Idempotency (same key cannot charge twice)
- Clear success/failure return contract

### 3) Unify Mission Claim Strategy
Choose one strategy and apply globally:
- Manual claim (`claim_mission_reward` RPC), or
- Fully automatic claim (no claim button)

Non-negotiable:
- Do not keep mixed behavior in different screens.

### 4) Make Rewards Page Dynamic
Replace all static reward data in `/rewards` with backend-driven data:
- Available XP
- Badge list + progress
- Shop catalog + prices + availability
- Daily missions + claim state

### 5) Remove UI/Engine Mismatch
Mission rewards and mission definitions must come from one source of truth.
- No duplicated hardcoded mission values in UI.

### P0 Acceptance Criteria
- Purchase button executes real purchase flow.
- XP is deducted correctly and exactly once.
- Retried request with same idempotency key does not double-charge.
- Rewards page values match backend values exactly.
- Mission claim behavior is consistent across app.

---

## P1 (High Priority)

### 1) Refactor Rewards Service
Split into clear methods:
- `getRewardsDashboard`
- `purchaseReward`
- `getBadgeProgress`
- `getDailyMissions`

### 2) Merge XPMarket and Rewards Shop Logic
Use one catalog and one purchase flow.
- No separate pricing/business logic copies.

### 3) i18n Cleanup
Move all hardcoded Rewards texts to translation files (TR/EN).

### 4) Add API Layer
Add endpoints:
- `GET /api/rewards/dashboard`
- `POST /api/rewards/purchase`
- `GET /api/rewards/missions`

### P1 Acceptance Criteria
- Catalog and prices are consistent everywhere.
- Rewards UI is fully localizable.
- Client calls rewards through unified service/API.

---

## P2 (Quality and Ops)

### 1) Tests
Add tests for:
- Purchase success
- Insufficient XP
- Duplicate idempotency key
- Mission claim duplicate prevention
- Badge unlock progression

### 2) Ledger Reason Standardization
Standardize `xp_ledger.reason` values:
- `reward_purchase:*`
- `mission_claim:*`

### 3) Admin Operability
Allow reward catalog management without code deploy:
- Activate/deactivate item
- Update price
- Availability window

### P2 Acceptance Criteria
- Core reward flows protected by tests.
- Reward-related XP movements are auditable.
- Catalog can be operated safely.

---

## Delivery Requirements (for Claude Code)
1. Implement P0 end-to-end first.
2. Include migration + RPC + API + frontend integration in same delivery.
3. Enforce idempotency for financial-like XP spend operations.
4. Provide a short changelog with touched files.
5. Provide run/test commands and expected outputs.

## Suggested Execution Order
1. Schema migrations
2. RPC functions
3. Service layer
4. API routes
5. Frontend wiring
6. Tests
7. Final verification

## Definition of Done
- P0 acceptance criteria all pass.
- No static reward source remains in production flow.
- No duplicate charge/claim possible under retries.
- CI tests for rewards pass.
