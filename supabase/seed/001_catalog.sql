-- Idempotent catalog seed for Tennis Tracker.
-- Auth users are created by scripts/seed-auth-users.mjs because Supabase Auth
-- user creation requires the service-role Admin API, not ordinary SQL.

with seed_drills (name, category, description) as (
  values
    ('Crosscourt Consistency', 'groundstrokes', 'Sustain controlled crosscourt forehand and backhand rallies.'),
    ('Down-the-Line Changeup', 'groundstrokes', 'Build control changing direction from crosscourt to down the line.'),
    ('Heavy Topspin Height', 'groundstrokes', 'Use margin and spin to push the opponent behind the baseline.'),
    ('Serve Targets', 'serve', 'Serve to wide, body, and T targets with repeatable rhythm.'),
    ('Second Serve Shape', 'serve', 'Develop a reliable spin second serve with net clearance.'),
    ('Serve Plus One', 'serve', 'Serve to a target and execute the planned first groundstroke.'),
    ('First Volley Placement', 'volley', 'Approach and place the first volley deep or angled.'),
    ('Reflex Volley Exchange', 'volley', 'Short-court quick hands and compact volley reactions.'),
    ('Return Crosscourt Depth', 'return', 'Neutralize serve returns with depth through the crosscourt lane.'),
    ('Block Return Reps', 'return', 'Practice compact blocked returns against pace.'),
    ('Split-Step Recovery', 'footwork', 'Time the split step and recover to an efficient base position.'),
    ('Wide Ball Recovery', 'footwork', 'Recover after defending wide balls on both sides.'),
    ('Ladder And Court Sprints', 'conditioning', 'Blend agility footwork with tennis-specific sprint patterns.'),
    ('Endurance Rally Blocks', 'conditioning', 'Maintain technique through longer controlled rally intervals.'),
    ('Pattern Play: Inside-Out', 'match play', 'Use inside-out forehands to build an attacking pattern.'),
    ('Pressure Points', 'match play', 'Play games from 30-all, deuce, and break-point scenarios.')
),
updated as (
  update public.drills as d
  set description = sd.description,
      is_system = true,
      player_id = null
  from seed_drills as sd
  where d.is_system
    and lower(d.name) = lower(sd.name)
    and lower(d.category) = lower(sd.category)
  returning d.id
)
insert into public.drills (name, category, description, is_system)
select sd.name, sd.category, sd.description, true
from seed_drills as sd
where not exists (
  select 1
  from public.drills as d
  where d.is_system
    and lower(d.name) = lower(sd.name)
    and lower(d.category) = lower(sd.category)
);

insert into public.characters (
  id,
  name,
  rarity,
  archetype,
  signature_line,
  unlock_condition_text,
  unlock_condition_type,
  pixel_art_path,
  display_order
)
values
  ('rookie', 'Rookie', 'default', 'Starter', 'Every rally starts with one clean swing.', 'Default character', 'default', '/characters/rookie.png', 1),
  ('baseline-spark', 'Baseline Spark', 'common', 'Baseliner', 'Win the next neutral ball.', 'Open Standard or Better packs', 'pack_drop', '/characters/baseline-spark.png', 2),
  ('topspin-tinkerer', 'Topspin Tinkerer', 'common', 'Spin Artist', 'Shape buys time.', 'Open Standard or Better packs', 'pack_drop', '/characters/topspin-tinkerer.png', 3),
  ('net-navigator', 'Net Navigator', 'common', 'Volleyer', 'Close with purpose.', 'Open Standard or Better packs', 'pack_drop', '/characters/net-navigator.png', 4),
  ('serve-scout', 'Serve Scout', 'common', 'Server', 'Pick the target before the toss.', 'Open Standard or Better packs', 'pack_drop', '/characters/serve-scout.png', 5),
  ('return-ranger', 'Return Ranger', 'common', 'Returner', 'Make the server play one more ball.', 'Open Standard or Better packs', 'pack_drop', '/characters/return-ranger.png', 6),
  ('footwork-flare', 'Footwork Flare', 'common', 'Mover', 'Recover before admiring the shot.', 'Open Standard or Better packs', 'pack_drop', '/characters/footwork-flare.png', 7),
  ('rally-riser', 'Rally Riser', 'common', 'Counterpuncher', 'Five more balls changes everything.', 'Open Standard or Better packs', 'pack_drop', '/characters/rally-riser.png', 8),
  ('slice-scribe', 'Slice Scribe', 'common', 'Touch Player', 'Low and skidding is a plan.', 'Open Standard or Better packs', 'pack_drop', '/characters/slice-scribe.png', 9),
  ('lob-lantern', 'Lob Lantern', 'common', 'Defender', 'Lift the point back into your hands.', 'Open Standard or Better packs', 'pack_drop', '/characters/lob-lantern.png', 10),
  ('drop-shot-dash', 'Drop Shot Dash', 'common', 'All-Courter', 'Soft hands, fast feet.', 'Open Standard or Better packs', 'pack_drop', '/characters/drop-shot-dash.png', 11),
  ('mini-court-maven', 'Mini Court Maven', 'common', 'Technician', 'Small court, sharp habits.', 'Open Standard or Better packs', 'pack_drop', '/characters/mini-court-maven.png', 12),
  ('first-win-firebrand', 'First Win Firebrand', 'rare', 'Competitor', 'Now make winning familiar.', 'Win your first match', 'achievement', '/characters/first-win-firebrand.png', 13),
  ('streak-sprinter', 'Streak Sprinter', 'rare', 'Mover', 'Stack the days and the legs follow.', 'Complete sessions on a 7-day streak', 'achievement', '/characters/streak-sprinter.png', 14),
  ('the-eight-point-engine', 'The 8-Point Engine', 'rare', 'Technician', 'Eight is not the ceiling.', 'Hit 8.0 on any skill', 'achievement', '/characters/the-eight-point-engine.png', 15),
  ('confidence-captain', 'Confidence Captain', 'rare', 'Mental Game', 'Back your read, then prove it.', 'Beat coach rating by 1+ point on any skill', 'achievement', '/characters/confidence-captain.png', 16),
  ('victory-veteran', 'Victory Veteran', 'rare', 'Match Player', 'Patterns become records.', 'Log 20 match wins', 'achievement', '/characters/victory-veteran.png', 17),
  ('calendar-crusher', 'Calendar Crusher', 'rare', 'Workhorse', 'Competition rewards repetition.', 'Log 5 matches in one month', 'achievement', '/characters/calendar-crusher.png', 18),
  ('court-strategist', 'Court Strategist', 'epic', 'Tactician', 'Win with the next two shots in mind.', 'Complete 25 coaching sessions', 'session_milestone', '/characters/court-strategist.png', 19),
  ('tie-break-titan', 'Tie-Break Titan', 'epic', 'Closer', 'Breathe, choose, execute.', 'Complete 50 coaching sessions', 'session_milestone', '/characters/tie-break-titan.png', 20),
  ('angle-alchemist', 'Angle Alchemist', 'epic', 'Shotmaker', 'Geometry can do the running.', 'Open Better packs after rare pool is owned', 'pack_drop', '/characters/angle-alchemist.png', 21),
  ('tempo-commander', 'Tempo Commander', 'epic', 'All-Courter', 'Change speed before they settle.', 'Open Better packs after rare pool is owned', 'pack_drop', '/characters/tempo-commander.png', 22),
  ('grand-slam-guardian', 'Grand Slam Guardian', 'legendary', 'Champion', 'Your standard travels with you.', 'Complete 100 coaching sessions', 'session_milestone', '/characters/grand-slam-guardian.png', 23),
  ('legend-of-the-lines', 'Legend of the Lines', 'legendary', 'Legend', 'Pressure is just another court line.', 'Complete 250 coaching sessions', 'session_milestone', '/characters/legend-of-the-lines.png', 24)
on conflict (id) do update
set name = excluded.name,
    rarity = excluded.rarity,
    archetype = excluded.archetype,
    signature_line = excluded.signature_line,
    unlock_condition_text = excluded.unlock_condition_text,
    unlock_condition_type = excluded.unlock_condition_type,
    pixel_art_path = excluded.pixel_art_path,
    display_order = excluded.display_order;
