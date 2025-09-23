-- Add missing notes column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
