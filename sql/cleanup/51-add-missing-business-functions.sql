-- Add missing business detail functions
-- These functions were referenced in the test but not created

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_business_details(uuid);
DROP FUNCTION IF EXISTS get_business_products(uuid);
DROP FUNCTION IF EXISTS get_business_sales(uuid);
DROP FUNCTION IF EXISTS get_business_inventory(uuid);
DROP FUNCTION IF EXISTS get_business_customers(uuid);
DROP FUNCTION IF EXISTS get_business_orders(uuid);
DROP FUNCTION IF EXISTS get_business_transactions(uuid);

-- Create get_business_details function
CREATE OR REPLACE FUNCTION get_business_details(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  name varchar,
  description text,
  business_type varchar,
  industry varchar,
  website varchar,
  phone varchar,
  email varchar,
  address varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  tax_id varchar,
  registration_number varchar,
  currency varchar,
  timezone varchar,
  logo_url text,
  status varchar,
  settings jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id,
    b.name,
    b.description,
    b.business_type,
    b.industry,
    b.website,
    b.phone,
    b.email,
    b.address,
    b.city,
    b.state,
    b.country,
    b.postal_code,
    b.tax_id,
    b.registration_number,
    b.currency,
    b.timezone,
    b.logo_url,
    b.status,
    b.settings,
    b.created_at,
    b.updated_at,
    b.created_by
  FROM businesses b
  WHERE b.id = business_id_param;
$$;

-- Create get_business_products function
CREATE OR REPLACE FUNCTION get_business_products(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  name varchar,
  description text,
  sku varchar,
  barcode varchar,
  category_id uuid,
  supplier_id uuid,
  purchase_price numeric,
  sale_price numeric,
  stock_quantity integer,
  reorder_level integer,
  unit_of_measure varchar,
  weight numeric,
  weight_unit varchar,
  dimensions jsonb,
  image_url text,
  status varchar,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.business_id,
    p.name,
    p.description,
    p.sku,
    p.barcode,
    p.category_id,
    p.supplier_id,
    p.purchase_price,
    p.sale_price,
    p.stock_quantity,
    p.reorder_level,
    p.unit_of_measure,
    p.weight,
    p.weight_unit,
    p.dimensions,
    p.image_url,
    p.status,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE p.business_id = business_id_param;
$$;

-- Create get_business_sales function
CREATE OR REPLACE FUNCTION get_business_sales(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  customer_id uuid,
  sale_date timestamp with time zone,
  total_amount numeric,
  discount_amount numeric,
  tax_amount numeric,
  net_amount numeric,
  payment_status varchar,
  sale_status varchar,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.business_id,
    s.customer_id,
    s.sale_date,
    s.total_amount,
    s.discount_amount,
    s.tax_amount,
    s.net_amount,
    s.payment_status,
    s.sale_status,
    s.notes,
    s.created_at,
    s.updated_at
  FROM sales s
  WHERE s.business_id = business_id_param;
$$;

-- Create get_business_inventory function
CREATE OR REPLACE FUNCTION get_business_inventory(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  product_id uuid,
  location varchar,
  quantity integer,
  last_restock_date timestamp with time zone,
  expiry_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.id,
    i.business_id,
    i.product_id,
    i.location,
    i.quantity,
    i.last_restock_date,
    i.expiry_date,
    i.created_at,
    i.updated_at
  FROM inventory i
  WHERE i.business_id = business_id_param;
$$;

-- Create get_business_customers function
CREATE OR REPLACE FUNCTION get_business_customers(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  full_name varchar,
  email varchar,
  phone varchar,
  address varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.business_id,
    c.full_name,
    c.email,
    c.phone,
    c.address,
    c.city,
    c.state,
    c.country,
    c.postal_code,
    c.created_at,
    c.updated_at
  FROM customers c
  WHERE c.business_id = business_id_param;
$$;

-- Create get_business_orders function
CREATE OR REPLACE FUNCTION get_business_orders(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  customer_id uuid,
  order_date timestamp with time zone,
  total_amount numeric,
  order_status varchar,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.business_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    o.order_status,
    o.shipping_address,
    o.billing_address,
    o.notes,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.business_id = business_id_param;
$$;

-- Create get_business_transactions function
CREATE OR REPLACE FUNCTION get_business_transactions(business_id_param uuid)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  transaction_date timestamp with time zone,
  transaction_type varchar,
  amount numeric,
  currency varchar,
  description text,
  reference_id uuid,
  status varchar,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.business_id,
    t.transaction_date,
    t.transaction_type,
    t.amount,
    t.currency,
    t.description,
    t.reference_id,
    t.status,
    t.created_at,
    t.updated_at
  FROM transactions t
  WHERE t.business_id = business_id_param;
$$;

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION get_business_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_products(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_sales(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_inventory(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_customers(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_orders(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_transactions(uuid) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Missing business functions created successfully' as status;
