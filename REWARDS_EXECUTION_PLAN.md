# Rewards System Step-by-Step Plan (2026-02-26)

## Goal
Make the rewards/gifts system fully complete against `CLAUDE_CODE_REWARDS_BACKLOG.md`: secure claim flow, single source of truth, consistent API, and passing tests/CI.

## Phase 1: P0 Security and Logic Fixes
1. Add completion eligibility validation to `claim_mission_reward` RPC.
- File: `supabase/migrations/20260226183122_refine_rewards_system.sql`
- Outcome: Claim succeeds only when mission requirements are met.

2. Fix incorrect mission threshold for `morning_monk`.
- File: `supabase/migrations/20260226183122_refine_rewards_system.sql`
- Outcome: Morning mission progress/claim behaves correctly.

3. Disable claim button in UI when `progress < 100`.
- File: `src/app/(dashboard)/rewards/page.tsx`
- Outcome: Prevent premature claim from normal UI flow.

4. Add server-side eligibility guard before claim RPC call (defense in depth).
- File: `src/services/RewardsService.ts`
- Outcome: UI bypass still cannot claim invalid mission.

## Phase 2: Single Source and Contract Stabilization
1. Finalize mission logic around one source: `mission_definitions` + one progress calculator.
- Files: `src/services/RewardsService.ts`, `src/lib/missionEngine.ts`
- Outcome: Rewards + dashboard always show identical mission state.

2. Refactor `RewardsService` to backlog target methods.
- Target methods: `getRewardsDashboard`, `purchaseReward`, `getBadgeProgress`, `getDailyMissions`
- File: `src/services/RewardsService.ts`
- Outcome: Cleaner structure, easier testing, clearer ownership.

3. Make `/api/rewards/missions` a first-class route (not a thin dashboard slice).
### Phase 1: P0 Security and Logic Fixes [DONE]
1. [x] Implement server-side verification in `claim_mission_reward` RPC.
2. [x] Fixed `morning_monk` requirement (threshold 9 -> 1).
3. [x] Disable "Claim" button if mission is not meeting requirements.
4. [x] Defense-in-depth: Add service-layer guard in `RewardsService.claimMission`.

### Phase 2: Single Source and Contract Stabilization [DONE]
1. [x] Refactor `RewardsService` into modular methods (`getDailyMissions`, `getBadgeProgress`).
2. [x] Use single source of truth for mission definitions (DB `mission_definitions`).
3. [x] Add `GET /api/rewards/missions` API endpoint.
4. [x] Sync UI progress bar with centralized logic.

### Phase 3: Test Debt Closure [DONE]
1. [x] Update `missionEngine.test.ts` to match new centralization.
2. [x] Update `rewards.test.ts` to include P0 security/concurrency scenarios.
3. [x] Ensure 100% pass rate on all reward-related tests.

### Phase 4: Final Closure and Documentation [DONE]
1. [x] Update backlog status with done/remaining checkboxes.
2. [x] Update gap analysis document with latest findings and closed items.
3. [x] Add final verification matrix.

---

## Final Verification Matrix

| Feature | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Security** | No client-injected XP | Server logs / Code audit of RPC | ✅ PASS |
| **Integrity** | Single source of mission data | `RewardsService` fetches from `mission_definitions` | ✅ PASS |
| **Atomicity** | No double-spend on retry | Idempotency tests in `rewards.test.ts` | ✅ PASS |
| **UI/UX** | Disable claim for <100% | Manual UI check / Page.tsx logic | ✅ PASS |
| **i18n** | Full TR/EN support | `translations.ts` audit | ✅ PASS |
| **Coverage** | Core flows tested | `npm run test` (12 passes) | ✅ PASS |

## Recommended Execution Order
1. SQL migration fixes
2. Service/API guards
3. UI claim-state fix
4. Test refactor + new tests
5. Typecheck + full tests
6. Documentation updates

## Definition of Ready-to-Ship
- Incomplete missions cannot be claimed.
- Mission logic is single source-of-truth across app.
- `tsc` and `vitest` pass completely.
- P0 acceptance criteria in backlog are fully met.
