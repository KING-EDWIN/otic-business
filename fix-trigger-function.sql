-- Fix Database Trigger Function
-- The update_product_stock() function is trying to update a "stock" column that doesn't exist
-- It should update "current_stock" instead

-- First, let's drop the existing trigger and function
DROP TRIGGER IF EXISTS update_stock_trigger ON sale_items;
DROP TRIGGER IF EXISTS trigger_update_stock ON sale_items;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

-- Create the corrected function
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_stock (not stock) when a sale item is created
  -- Only update if product_id is not null
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_stock_trigger
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Verify the fix
SELECT 'Trigger function fixed to use current_stock instead of stock!' as status;
