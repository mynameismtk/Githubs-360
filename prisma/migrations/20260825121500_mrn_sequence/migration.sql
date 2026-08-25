-- Medical record numbers must be unique, gapless-enough, and safe to allocate under
-- concurrent registrations at the front desk. Counting rows in application code races;
-- a Postgres sequence does not. The unique constraint on (clinicId, mrn) remains the
-- backstop. See docs/04.
CREATE SEQUENCE IF NOT EXISTS mrn_seq START WITH 1001 INCREMENT BY 1;
