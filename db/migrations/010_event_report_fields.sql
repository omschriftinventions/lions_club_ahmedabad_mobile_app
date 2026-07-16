-- Service Activity Report fields on events.
ALTER TABLE events ADD COLUMN IF NOT EXISTS code_no VARCHAR(40) NULL AFTER type;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_in VARCHAR(8) NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_out VARCHAR(8) NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS member_ids JSON NULL;         -- members present (ids)
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_members INT NULL;       -- auto = count(member_ids)
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_hours DECIMAL(6,2) NULL; -- auto = time_out - time_in
ALTER TABLE events ADD COLUMN IF NOT EXISTS no_of_man_hours DECIMAL(9,2) NULL; -- auto = hours * members
ALTER TABLE events ADD COLUMN IF NOT EXISTS expenses DECIMAL(12,2) NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS beneficiaries INT NULL;
