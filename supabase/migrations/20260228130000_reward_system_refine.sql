-- Reward System Refinement and Functional Expansion
-- 1. Remove game items
DELETE FROM reward_catalog WHERE category = 'game';

-- 2. Add new functional reward items
INSERT INTO reward_catalog (title, description, cost_xp, category, refresh_mode) VALUES
('Streak Freeze / Seri Dondurucu', 'Protects your streak for 24 hours even if you miss a day.', 1500, 'feature', 'weekly'),
('Neon Glow Profile Border', 'A vibrant neon border for your profile avatar.', 2500, 'cosmetic', 'permanent'),
('Deep Focus Theme', 'A minimalist high-contrast theme for maximum concentration.', 4000, 'cosmetic', 'permanent'),
('Emergency Break', 'A one-time exemption for interrupting a focus session.', 1000, 'feature', 'weekly');

-- 3. Extend profiles with customization columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_theme TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_border TEXT;
