-- Badge Expansion Migration
-- Date: 2026-02-28

-- 1. Standardize and expanded Badge Definitions
-- Cleanup old seeds if you want a fresh start, or just add new ones.
-- Here we'll satisfy the "24 badges" requirement.

INSERT INTO badge_definitions (title, description, requirement_type, requirement_value, category, image_url) VALUES
-- Focus Milestones (Total Minutes)
('Focus Initiate', 'Total focus time reached 1 hour.', 'total_focus_minutes', 60, 'milestone', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus1'),
('Focus Scholar', 'Total focus time reached 10 hours.', 'total_focus_minutes', 600, 'milestone', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus10'),
('Focus Knight', 'Total focus time reached 50 hours.', 'total_focus_minutes', 3000, 'milestone', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus50'),
('Focus Grandmaster', 'Total focus time reached 100 hours.', 'total_focus_minutes', 6000, 'milestone', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus100'),

-- Streak Milestones
('Consistency Core', 'Maintain a 3-day streak.', 'streak_days', 3, 'streak', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak3'),
('Week Warrior', 'Maintain a 14-day streak.', 'streak_days', 14, 'streak', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak14'),
('Monthly Monk', 'Maintain a 30-day streak.', 'streak_days', 30, 'streak', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak30'),
('Undefeated', 'Maintain a 60-day streak.', 'streak_days', 60, 'streak', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak60'),

-- Morning Discipline
('Early Riser', 'Complete 5 focus sessions before 08:00 AM.', 'early_sessions', 5, 'discipline', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning5'),
('Dawn Apostle', 'Complete 20 focus sessions before 08:00 AM.', 'early_sessions', 20, 'discipline', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning20'),
('Sun Chaser', 'Complete 50 focus sessions before 08:00 AM.', 'early_sessions', 50, 'discipline', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning50'),

-- Task Mastery
('Task Apprentice', 'Complete 25 total tasks.', 'total_tasks', 25, 'mastery', 'https://api.dicebear.com/7.x/shapes/svg?seed=task25'),
('Task Specialist', 'Complete 100 total tasks.', 'total_tasks', 100, 'mastery', 'https://api.dicebear.com/7.x/shapes/svg?seed=task100'),
('Task Legend', 'Complete 300 total tasks.', 'total_tasks', 300, 'mastery', 'https://api.dicebear.com/7.x/shapes/svg?seed=task300'),

-- Mission Hunter
('Scout', 'Claim 10 mission rewards.', 'mission_claims', 10, 'hunter', 'https://api.dicebear.com/7.x/shapes/svg?seed=hunt10'),
('Ranger', 'Claim 50 mission rewards.', 'mission_claims', 50, 'hunter', 'https://api.dicebear.com/7.x/shapes/svg?seed=hunt50'),
('Bounty King', 'Claim 150 mission rewards.', 'mission_claims', 150, 'hunter', 'https://api.dicebear.com/7.x/shapes/svg?seed=hunt150'),

-- League Progress (Mocked by requirement_type for now if real league data complex to reach here)
('Out of Bronze', 'Reach Silver League.', 'league_rank', 2, 'league', 'https://api.dicebear.com/7.x/shapes/svg?seed=silver'),
('Gold Bound', 'Reach Gold League.', 'league_rank', 3, 'league', 'https://api.dicebear.com/7.x/shapes/svg?seed=gold'),
('Diamond Soul', 'Reach Diamond League.', 'league_rank', 4, 'league', 'https://api.dicebear.com/7.x/shapes/svg?seed=diamond'),

-- Social/Community
('Helper', 'Help 5 people (Social actions).', 'helpful_actions', 5, 'social', 'https://api.dicebear.com/7.x/shapes/svg?seed=help5'),
('Community Pillar', 'Help 25 people (Social actions).', 'helpful_actions', 25, 'social', 'https://api.dicebear.com/7.x/shapes/svg?seed=help25'),

-- Consistency (Active days)
('Weekly Active', 'Active in 5 out of last 7 days.', 'active_days_7', 5, 'consistency', 'https://api.dicebear.com/7.x/shapes/svg?seed=active7'),
('Monthly Active', 'Active in 20 out of last 30 days.', 'active_days_30', 20, 'consistency', 'https://api.dicebear.com/7.x/shapes/svg?seed=active30');
