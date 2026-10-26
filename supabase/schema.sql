-- ========================================================
-- BULL GEAR - COMPLETE SUPABASE DATABASE SCHEMA & SEED DATA
-- ========================================================
-- Copy and paste this ENTIRE file into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (admin & customer profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
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

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    alt_text TEXT,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Banners Table (Hero & Promotional banners)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    highlight_text TEXT,
    subtitle TEXT,
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    button_label TEXT DEFAULT 'Shop Products',
    button_link TEXT DEFAULT '/shop',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    focal_position TEXT DEFAULT 'center',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders Table (WhatsApp & Direct Requests)
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

-- 7. Order Items Table
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

-- 8. Inventory Movements Table (Stock Audit Log)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('order_reservation', 'order_cancellation', 'restock', 'manual_adjustment', 'damage_loss')),
    quantity_change INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories RLS
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin has full access to categories" ON public.categories;
CREATE POLICY "Admin has full access to categories" 
ON public.categories FOR ALL USING (public.is_admin());

-- Products RLS
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone" 
ON public.products FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin has full access to products" ON public.products;
CREATE POLICY "Admin has full access to products" 
ON public.products FOR ALL USING (public.is_admin());

-- Product Images RLS
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" 
ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin has full access to product images" ON public.product_images;
CREATE POLICY "Admin has full access to product images" 
ON public.product_images FOR ALL USING (public.is_admin());

-- Banners RLS
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" 
ON public.banners FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin has full access to banners" ON public.banners;
CREATE POLICY "Admin has full access to banners" 
ON public.banners FOR ALL USING (public.is_admin());

-- Orders RLS
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" 
ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to orders" ON public.orders;
CREATE POLICY "Admin has full access to orders" 
ON public.orders FOR ALL USING (public.is_admin());

-- Order Items RLS
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
CREATE POLICY "Public can create order items" 
ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin has full access to order items" ON public.order_items;
CREATE POLICY "Admin has full access to order items" 
ON public.order_items FOR ALL USING (public.is_admin());

-- Inventory Movements RLS
DROP POLICY IF EXISTS "Admin can view and manage inventory movements" ON public.inventory_movements;
CREATE POLICY "Admin can view and manage inventory movements" 
ON public.inventory_movements FOR ALL USING (public.is_admin());

-- Site Settings RLS
DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;
CREATE POLICY "Public can view settings" 
ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;
CREATE POLICY "Admin can manage site settings" 
ON public.site_settings FOR ALL USING (public.is_admin());

-- ========================================================
-- SEED DATA (CATEGORIES)
-- ========================================================
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_featured, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Snorkels', 'snorkels', 'Engine protection for extreme conditions', '/images/product-snorkel.jpg', 1, true, true),
  ('11111111-1111-1111-1111-111111111102', 'Roof Racks', 'roof-racks', 'Carry more for bigger adventures', '/images/product-roof-rack.jpg', 2, true, true),
  ('11111111-1111-1111-1111-111111111103', 'LED Light Bars', 'led-light-bars', 'Light up every trail', '/images/product-light-bar.jpg', 3, true, true),
  ('11111111-1111-1111-1111-111111111104', 'Bumpers', 'bumpers', 'Built for strength and protection', '/images/product-bumper.jpg', 4, true, true),
  ('11111111-1111-1111-1111-111111111105', 'Bull Bars', 'bull-bars', 'Heavy-duty tubular front protection', '/images/product-bull-bar.jpg', 5, false, true),
  ('11111111-1111-1111-1111-111111111106', 'Recovery Gear', 'recovery-gear', 'Self-recovery and trail rescue essentials', '/images/product-recovery.jpg', 6, false, true),
  ('11111111-1111-1111-1111-111111111107', 'Off-Road Tyres', 'off-road-tyres', 'Maximum traction across any terrain', '/images/product-tyres.jpg', 7, false, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  is_featured = EXCLUDED.is_featured;

-- ========================================================
-- SEED DATA (BANNERS)
-- ========================================================
INSERT INTO public.banners (id, title, highlight_text, subtitle, desktop_image_url, button_label, button_link, display_order, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'BUILT FOR THE', 'UNEXPLORED', 'Engineered heavy-duty accessories tested in extreme terrains across India', '/images/hero-suv.jpg', 'Shop Products', '/shop', 1, true),
  ('22222222-2222-2222-2222-222222222202', 'EXPEDITION READY', 'ARMORY', 'Premium modular roof carriers, snorkel systems and steel bumpers', '/images/adventure-banner.jpg', 'Explore Categories', '/shop', 2, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  highlight_text = EXCLUDED.highlight_text,
  subtitle = EXCLUDED.subtitle,
  desktop_image_url = EXCLUDED.desktop_image_url;

-- ========================================================
-- SEED DATA (PRODUCTS)
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
    'Our premium snorkel kit is built for extreme off-road conditions. Keeps engine air intake high and dry away from dust, mud and water while providing optimum airflow for better engine performance.',
    24999.00,
    NULL,
    18,
    5,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha'],
    ARRAY['Engine protection during deep water crossings', 'Prevents dust ingestion on desert and dirt trails', 'Ram head with built-in moisture separators', 'Precision moulded from virgin UV-stabilised LLDPE']
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111102',
    'Heavy Duty Roof Rack',
    'heavy-duty-roof-rack',
    'BG-RCK-002',
    'Full-length aluminium platform carrier engineered for rooftop tents, Jerry cans and recovery tracks.',
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
    ARRAY['Lightweight extruded 6063 T6 aluminium construction', 'Dual T-slot channels on every cross slat for universal mounting', 'Integrated front air dam eliminates highway whistling', '300kg static load capacity']
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111103',
    'Ultra-Bright LED Light Bar',
    'ultra-bright-led-light-bar',
    'BG-LGT-003',
    'Curved 42-inch dual-row 240W Osram LED light bar with 22,000 lumens combo flood/spot optic.',
    'Cut through black trails and dense mountain fog with 240W Osram chips producing over 22,000 raw lumens. IP68 submersible rated with pressure equalization military breather.',
    16999.00,
    NULL,
    25,
    5,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha', 'Universal 4x4'],
    ARRAY['High-intensity Osram 5W LEDs delivering 22,000 lumens', 'Hybrid Combo optic pattern (8° spot center + 90° flood shoulders)', 'IP68 certified submersible up to 3 meters', 'Integrated Deutsch waterproof connector plug']
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
    false,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Force Gurkha'],
    ARRAY['Increases front approach angle by 14 degrees', 'Heavy-duty 5mm internal winch cradle tested up to 12,500 lbs', 'Dual 4.75T rated recovery tow points', 'Tough textured matte black multi-stage powder coat']
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
    true,
    false,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Force Gurkha'],
    ARRAY['Mandrel-bent 63mm cold drawn seamless steel tubing', 'Twin auxiliary spotlight mounting tabs on upper loop', 'Direct high-tensile 10.9 grade chassis mounting kit', 'Corrosion-resistant dual electrostatic e-coating']
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    '11111111-1111-1111-1111-111111111106',
    'Kinetic Recovery Gear Kit',
    'kinetic-recovery-gear-kit',
    'BG-REC-006',
    'Complete trail rescue kit including 9m kinetic snatch rope, synthetic soft shackles and carry bag.',
    'Essential equipment for sand dunes, slush, and snow trail rescue. The kinetic snatch rope stretches up to 30% to use kinetic energy to smoothly pull stuck vehicles out without shock load.',
    12499.00,
    NULL,
    30,
    8,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha', 'Universal 4x4'],
    ARRAY['30% kinetic stretch absorbs peak shock load on recovery points', '11,000 kg (24,000 lbs) Minimum Breaking Strength', 'Dual high-molecular-polyethylene soft shackles with protective sleeves', 'Ventilated heavy-duty ballistic canvas carry bag']
  ),
  (
    '33333333-3333-3333-3333-333333333307',
    '11111111-1111-1111-1111-111111111107',
    'Mud-Terrain All-Season Tyres',
    'mud-terrain-all-season-tyres',
    'BG-TYR-007',
    'High-ply aggressive tread off-road tyres engineered for rock crawling and mud ejection.',
    'Built with 3-ply puncture-resistant sidewalls, stone ejector ribs, and stepped tread blocks for unrelenting bite through deep ruts, rocks, and mud.',
    18999.00,
    NULL,
    20,
    6,
    'in_stock',
    true,
    true,
    true,
    ARRAY['Mahindra Thar (2020+)', 'Toyota Fortuner', 'Toyota Hilux', 'Isuzu D-Max', 'Suzuki Jimny', 'Force Gurkha'],
    ARRAY['3-ply reinforced polyester sidewall construction', 'Stepped shoulder lugs for off-camber traction', 'Self-cleaning stone ejector grooves between tread blocks', 'Silica-infused cut and chip resistant rubber compound']
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity,
  stock_status = EXCLUDED.stock_status,
  is_featured = EXCLUDED.is_featured,
  is_best_seller = EXCLUDED.is_best_seller;

-- ========================================================
-- SEED DATA (PRODUCT IMAGES)
-- ========================================================
INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
  ('33333333-3333-3333-3333-333333333301', '/images/product-snorkel.jpg', 'Premium Snorkel Kit', 1, true),
  ('33333333-3333-3333-3333-333333333302', '/images/product-roof-rack.jpg', 'Heavy Duty Roof Rack', 1, true),
  ('33333333-3333-3333-3333-333333333303', '/images/product-light-bar.jpg', 'Ultra-Bright LED Light Bar', 1, true),
  ('33333333-3333-3333-3333-333333333304', '/images/product-bumper.jpg', 'Armor Steel Front Bumper', 1, true),
  ('33333333-3333-3333-3333-333333333305', '/images/product-bull-bar.jpg', 'Heavy-Duty Bull Bar', 1, true),
  ('33333333-3333-3333-3333-333333333306', '/images/product-recovery.jpg', 'Kinetic Recovery Gear Kit', 1, true),
  ('33333333-3333-3333-3333-333333333307', '/images/product-tyres.jpg', 'Mud-Terrain All-Season Tyres', 1, true)
ON CONFLICT DO NOTHING;
