-- Create english and french languages
INSERT INTO "Language" ("id", "iso", "name") VALUES (gen_random_uuid(), 'fra', 'Français');
INSERT INTO "Language" ("id", "iso", "name") VALUES (gen_random_uuid(), 'eng', 'English');
