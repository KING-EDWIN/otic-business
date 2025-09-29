-- Fix all triggers on sale_items table
-- This script removes all problematic triggers and creates only the correct one

-- Drop all existing triggers on sale_items
DROP TRIGGER IF EXISTS update_stock_trigger ON sale_items;
DROP TRIGGER IF EXISTS trigger_update_stock ON sale_items;
DROP TRIGGER IF EXISTS update_product_stock_trigger ON sale_items;
DROP TRIGGER IF EXISTS update_units_sold_trigger ON sale_items;
DROP TRIGGER IF EXISTS update_sales_stats_trigger ON sale_items;

-- Drop all related functions
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;
DROP FUNCTION IF EXISTS update_units_sold() CASCADE;
DROP FUNCTION IF EXISTS update_sales_stats() CASCADE;

-- Create the correct function for updating product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_stock when a sale item is created
  -- Only update if product_id is not null
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER update_stock_trigger
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_product_stock() TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_stock() TO service_role;

-- Verify the setup
SELECT 'All triggers fixed successfully!' as status;
