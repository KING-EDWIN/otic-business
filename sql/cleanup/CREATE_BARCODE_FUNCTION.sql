-- CREATE: Barcode generation function
-- Run this in Supabase SQL Editor to create the barcode generation function

-- 1. Create the barcode generation function
CREATE OR REPLACE FUNCTION generate_product_barcode(
    business_name_param TEXT,
    product_name_param TEXT,
    manufacturer_param TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    business_prefix TEXT;
    product_prefix TEXT;
    manufacturer_prefix TEXT;
    timestamp_suffix TEXT;
    generated_barcode TEXT;
BEGIN
    -- Extract first 2 letters from business name
    business_prefix := UPPER(LEFT(REGEXP_REPLACE(business_name_param, '[^a-zA-Z]', '', 'g'), 2));
    
    -- Extract first 2 letters from product name
    product_prefix := UPPER(LEFT(REGEXP_REPLACE(product_name_param, '[^a-zA-Z]', '', 'g'), 2));
    
    -- Extract first 2 letters from manufacturer if provided
    IF manufacturer_param IS NOT NULL AND manufacturer_param != '' THEN
        manufacturer_prefix := UPPER(LEFT(REGEXP_REPLACE(manufacturer_param, '[^a-zA-Z]', '', 'g'), 2));
    ELSE
        manufacturer_prefix := 'XX';
    END IF;
    
    -- Generate timestamp suffix (last 6 digits)
    timestamp_suffix := RIGHT(EXTRACT(EPOCH FROM NOW())::TEXT, 6);
    
    -- Combine all parts
    generated_barcode := business_prefix || product_prefix || manufacturer_prefix || timestamp_suffix;
    
    -- Ensure barcode is exactly 12 digits (pad with zeros if needed)
    generated_barcode := LPAD(generated_barcode, 12, '0');
    
    -- Check if barcode already exists
    WHILE EXISTS (SELECT 1 FROM products WHERE barcode = generated_barcode) LOOP
        -- If exists, add a random number and try again
        generated_barcode := business_prefix || product_prefix || manufacturer_prefix || 
                           RIGHT(EXTRACT(EPOCH FROM NOW())::TEXT, 4) || 
                           LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0');
        generated_barcode := LPAD(generated_barcode, 12, '0');
    END LOOP;
    
    RETURN generated_barcode;
END;
$$;

-- 2. Test the function
SELECT generate_product_barcode('Demo Business', 'Test Product', 'Test Manufacturer') as test_barcode;

SELECT 'Barcode generation function created successfully!' as status;
