-- Create priest_slots table
CREATE TABLE IF NOT EXISTS priest_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priest_id UUID NOT NULL REFERENCES priest_profiles(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for priest date lookups
CREATE INDEX IF NOT EXISTS idx_priest_slots_priest_date 
ON priest_slots (priest_id, slot_date);

-- Link bookings(slot_id) foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'slot_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_slot_id_priest_slots_id_fk'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_slot_id_priest_slots_id_fk 
    FOREIGN KEY (slot_id) REFERENCES priest_slots(id) ON DELETE SET NULL;
  END IF;
END $$;
