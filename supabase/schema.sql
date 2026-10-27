-- ========================================================
-- BULL GEAR - SUPABASE DATABASE SCHEMA & ADMIN READY SETUP
-- ========================================================
-- Copy and paste this ENTIRE script into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE,
    short_description TEXT,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'limited_stock', 'out_of_stock')),
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    compatibility_models TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}'::jsonb,
    installation_info TEXT,
    features TEXT[] DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Images Table (Images added via Admin Dashboard)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL DEFAULT '',
    cloudinary_public_id TEXT,
    alt_text TEXT,
    display_order INT DEFAULT 1,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Banners Table (Hero Desktop 16:9 & Mobile 9:16)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    highlight_text TEXT,
    subtitle TEXT,
    desktop_image_url TEXT NOT NULL DEFAULT '',
    mobile_image_url TEXT DEFAULT '',
    button_label TEXT DEFAULT 'Shop Products',
    button_link TEXT DEFAULT '/shop',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    focal_position TEXT DEFAULT 'center',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table (WhatsApp & Checkout Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    whatsapp_number TEXT,
    delivery_address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    customer_notes TEXT,
    vehicle_model TEXT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'INR',
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- INDEXES FOR MAXIMUM SPEED & EFFICIENCY
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_banners_order ON public.banners(display_order);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- ========================================================
-- EXPLICIT GRANTS & ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
-- Grant access to Supabase Data API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 100% Safe Idempotent Reset: Drop ALL pre-existing policies on these tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('categories', 'products', 'product_images', 'banners', 'orders', 'order_items', 'site_settings', 'profiles', 'inventory_movements')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Categories Policies
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Full access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Products Policies
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access to products" ON public.products;
CREATE POLICY "Full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Product Images Policies
DROP POLICY IF EXISTS "Public can read product images" ON public.product_images;
CREATE POLICY "Public can read product images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access to product images" ON public.product_images;
CREATE POLICY "Full access to product images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Banners Policies
DROP POLICY IF EXISTS "Public can read banners" ON public.banners;
CREATE POLICY "Public can read banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access to banners" ON public.banners;
CREATE POLICY "Full access to banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Full access to orders" ON public.orders;
CREATE POLICY "Full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items Policies
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Full access to order items" ON public.order_items;
CREATE POLICY "Full access to order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access to site settings" ON public.site_settings;
CREATE POLICY "Full access to site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- INITIAL CORE CATEGORIES (Ready for your images from Admin)
-- ========================================================
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_featured, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Snorkels', 'snorkels', 'Engine protection for extreme conditions', '', 1, true, true),
  ('11111111-1111-1111-1111-111111111102', 'Roof Racks', 'roof-racks', 'Carry more for bigger adventures', '', 2, true, true),
  ('11111111-1111-1111-1111-111111111103', 'LED Light Bars', 'led-light-bars', 'Light up every trail', '', 3, true, true),
  ('11111111-1111-1111-1111-111111111104', 'Bumpers', 'bumpers', 'Built for strength and protection', '', 4, true, true),
  ('11111111-1111-1111-1111-111111111105', 'Bull Bars', 'bull-bars', 'Heavy-duty tubular front protection', '', 5, false, true),
  ('11111111-1111-1111-1111-111111111106', 'Recovery Gear', 'recovery-gear', 'Self-recovery and trail rescue essentials', '', 6, false, true),
  ('11111111-1111-1111-1111-111111111107', 'Off-Road Tyres', 'off-road-tyres', 'Maximum traction across any terrain', '', 7, false, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_featured = EXCLUDED.is_featured;

-- ========================================================
-- INITIAL HERO BANNERS (Ready for your 16:9 & 9:16 images)
-- ========================================================
INSERT INTO public.banners (id, title, highlight_text, subtitle, desktop_image_url, mobile_image_url, button_label, button_link, display_order, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'ENGINEERED FOR', 'REAL ADVENTURES', 'Premium 4x4 accessories designed for offroaders, travellers, and overland expeditions.', '', '', 'Shop Products', '/shop', 1, true),
  ('22222222-2222-2222-2222-222222222202', 'EXPLORE', 'BEYOND LIMITS', 'Heavy-duty vehicle armor and lighting systems built to withstand the toughest terrains.', '', '', 'Explore Catalog', '/shop', 2, true),
  ('22222222-2222-2222-2222-222222222203', 'GEAR UP', 'YOUR DRIVE', 'Aerospace-grade overland expedition equipment tested across India.', '', '', 'View Accessories', '/shop', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  highlight_text = EXCLUDED.highlight_text,
  subtitle = EXCLUDED.subtitle,
  button_label = EXCLUDED.button_label,
  button_link = EXCLUDED.button_link;

-- ========================================================
-- INITIAL PRODUCTS (Ready for your photos from Admin)
-- ========================================================
INSERT INTO public.products (
  id, category_id, name, slug, sku, short_description, description, price, sale_price,
  stock_quantity, low_stock_threshold, stock_status, is_featured, is_best_seller, is_published,
  compatibility_models, features
)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    'Premium Snorkel Kit',
    'premium-snorkel-kit',
    'BG-SNK-001',
    'High-grade UV-resistant LLDPE snorkel for extreme off-road conditions and water crossings.',
    'Our premium snorkel kit keeps engine air intake high and dry away from dust, mud, and water while providing optimum airflow for better performance.',
    24999.00,
    NULL,
    18,
    5,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha'],
    ARRAY['Engine protection during deep water crossings', 'Ram head with built-in moisture separators', 'Precision molded from virgin UV-stabilized LLDPE']
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111102',
    'Heavy Duty Roof Rack',
    'heavy-duty-roof-rack',
    'BG-RCK-002',
    'Full-length aluminium platform carrier engineered for rooftop tents, Jerry cans, and expedition cargo.',
    'Engineered from aircraft-grade structural extruded aluminium with reinforced internal ribs. Supports over 300 kg static load with aerodynamic wind deflector slats.',
    38499.00,
    34999.00,
    12,
    3,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha'],
    ARRAY['Lightweight extruded 6063 T6 aluminium construction', 'Dual T-slot channels for universal mounting', 'Integrated front air dam eliminates whistling', '300kg static load capacity']
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111103',
    'Ultra-Bright LED Light Bar',
    'ultra-bright-led-light-bar',
    'BG-LGT-003',
    'Curved 42-inch dual-row 240W Osram LED light bar with 22,000 lumens combo flood/spot optic.',
    'Cut through black trails and dense mountain fog with 240W Osram chips producing over 22,000 raw lumens. IP68 submersible rated.',
    16999.00,
    NULL,
    25,
    5,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha', 'Universal 4x4'],
    ARRAY['High-intensity Osram 5W LEDs delivering 22,000 lumens', 'Hybrid Combo optic pattern (spot + flood)', 'IP68 certified submersible up to 3 meters']
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    '11111111-1111-1111-1111-111111111104',
    'Armor Steel Front Bumper',
    'armor-steel-front-bumper',
    'BG-BMP-004',
    'Aggressive high-clearance 4mm cold-rolled steel bumper with integrated 12,000lb winch cradle.',
    'Laser cut from 4mm heavy-gauge cold rolled steel with robotic welds. Offers enhanced approach angle for steep rocky inclines and winch recovery readiness.',
    42999.00,
    NULL,
    4,
    4,
    'limited_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Force Gurkha'],
    ARRAY['Increases front approach angle by 14 degrees', 'Heavy-duty internal winch cradle tested up to 12,500 lbs', 'Dual 4.75T rated recovery tow points']
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    '11111111-1111-1111-1111-111111111105',
    'Heavy-Duty Bull Bar',
    'heavy-duty-bull-bar',
    'BG-BLB-005',
    'Tubular steel front protection with spotlight tabs and chassis-mounted brackets.',
    'Engineered for maximum frontal protection during wildlife encounters and bush bashing. Features 63mm cold-drawn steel tubes and direct chassis mounting points.',
    28999.00,
    NULL,
    7,
    3,
    'in_stock',
    false,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Force Gurkha'],
    ARRAY['Mandrel-bent 63mm cold drawn seamless steel tubing', 'Twin auxiliary spotlight mounting tabs', 'Direct chassis mounting kit']
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    '11111111-1111-1111-1111-111111111106',
    'Kinetic Recovery Gear Kit',
    'kinetic-recovery-gear-kit',
    'BG-REC-006',
    'Complete trail rescue kit including 9m kinetic snatch rope, synthetic soft shackles, and carry bag.',
    'Essential equipment for sand dunes, slush, and snow trail rescue. The kinetic snatch rope stretches up to 30% to use kinetic energy to smoothly pull stuck vehicles out without shock load.',
    12499.00,
    NULL,
    30,
    8,
    'in_stock',
    false,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha', 'Universal 4x4'],
    ARRAY['30% kinetic stretch absorbs peak shock load', '11,000 kg (24,000 lbs) breaking strength', 'Dual synthetic soft shackles with protective sleeves']
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity,
  is_featured = EXCLUDED.is_featured,
  is_best_seller = EXCLUDED.is_best_seller;

-- ========================================================
-- DEFAULT SITE SETTINGS
-- ========================================================
INSERT INTO public.site_settings (key, value)
VALUES
  ('general', '{"site_name": "Bull Gear", "currency_symbol": "₹", "whatsapp_number": "919876543210", "free_shipping_threshold": 4999}'::jsonb),
  ('announcement_bar', '{"enabled": true, "text": "🔥 Free Express Shipping Across India on all orders above ₹4,999!"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
