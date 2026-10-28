-- Migration 0004: Add is_full_day to priest_availability_exceptions and label to addresses
ALTER TABLE priest_availability_exceptions 
ADD COLUMN IF NOT EXISTS is_full_day BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS label VARCHAR(100);
