import { supabase, isSupabaseConfigured, getServiceSupabase } from './supabase';
import { Product, Category, Banner, Order, SiteSettings, StockStatus } from './types';

// Default initial categories matching the reference design
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Snorkels',
    slug: 'snorkels',
    description: 'Engine protection for extreme conditions',
    image_url: '/images/product-snorkel.jpg',
    display_order: 1,
    is_featured: true,
    is_active: true,
    seo_title: 'Off-Road 4x4 Snorkels | Bull Gear',
    seo_description: 'Protect your engine in deep water and dusty trails with Bull Gear premium UV-resistant snorkels.',
    product_count: 3,
  },
  {
    id: 'cat-2',
    name: 'Roof Racks',
    slug: 'roof-racks',
    description: 'Carry more for bigger adventures',
    image_url: '/images/product-roof-rack.jpg',
    display_order: 2,
    is_featured: true,
    is_active: true,
    seo_title: 'Expedition Roof Racks & Carriers | Bull Gear',
    seo_description: 'Heavy duty modular roof racks engineered for overlanding, camping, and rugged gear transportation.',
    product_count: 4,
  },
  {
    id: 'cat-3',
    name: 'LED Light Bars',
    slug: 'led-light-bars',
    description: 'Light up every trail',
    image_url: '/images/product-light-bar.jpg',
    display_order: 3,
    is_featured: true,
    is_active: true,
    seo_title: 'High-Power LED Light Bars | Bull Gear',
    seo_description: 'Ultra-bright IP68 waterproof off-road LED light bars and auxiliary spotlights for maximum night visibility.',
    product_count: 5,
  },
  {
    id: 'cat-4',
    name: 'Bumpers',
    slug: 'bumpers',
    description: 'Built for strength and protection',
    image_url: '/images/product-bumper.jpg',
    display_order: 4,
    is_featured: true,
    is_active: true,
    seo_title: 'Steel Off-Road Bumpers | Bull Gear',
    seo_description: 'High-clearance winch-compatible steel off-road bumpers for rock crawling and extreme trail defence.',
    product_count: 4,
  },
  {
    id: 'cat-5',
    name: 'Bull Bars',
    slug: 'bull-bars',
    description: 'Heavy-duty tubular front protection',
    image_url: '/images/product-bull-bar.jpg',
    display_order: 5,
    is_featured: false,
    is_active: true,
    seo_title: 'Tubular Steel Bull Bars | Bull Gear',
    seo_description: 'Collision-resistant steel bull bars with integrated spotlight brackets and chassis mounts.',
    product_count: 3,
  },
  {
    id: 'cat-6',
    name: 'Recovery Gear',
    slug: 'recovery-gear',
    description: 'Self-recovery and trail rescue essentials',
    image_url: '/images/product-recovery.jpg',
    display_order: 6,
    is_featured: false,
    is_active: true,
    seo_title: '4x4 Kinetic Recovery Gear & Winches | Bull Gear',
    seo_description: 'High-strength kinetic ropes, soft shackles, traction boards, and snatch blocks for overland rescue.',
    product_count: 6,
  },
  {
    id: 'cat-7',
    name: 'Off-Road Tyres',
    slug: 'off-road-tyres',
    description: 'Maximum traction across any terrain',
    image_url: '/images/product-tyres.jpg',
    display_order: 7,
    is_featured: false,
    is_active: true,
    seo_title: 'All-Terrain & Mud-Terrain Tyres | Bull Gear',
    seo_description: 'Puncture-resistant 3-ply sidewall off-road tyres with aggressive self-cleaning tread patterns.',
    product_count: 4,
  },
];

// Initial products matching the reference UI
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    category_name: 'Snorkels',
    category_slug: 'snorkels',
    name: 'Premium Snorkel Kit',
    slug: 'premium-snorkel-kit',
    sku: 'BG-SNK-001',
    short_description: 'High-grade UV-resistant LLDPE snorkel for extreme off-road conditions and water crossings.',
    description: 'Our premium snorkel kit is built for extreme off-road conditions. Keeps engine air intake high and dry away from dust, mud and water while providing optimum airflow for better engine performance.',
    price: 24999,
    sale_price: null,
    stock_quantity: 18,
    low_stock_threshold: 5,
    stock_status: 'in_stock',
    is_featured: true,
    is_best_seller: true,
    is_published: true,
    compatibility_models: [
      'Mahindra Thar (2020+)',
      'Mahindra Thar CRDe',
      'Toyota Fortuner (2016+)',
      'Toyota Hilux',
      'Isuzu D-Max V-Cross',
      'Suzuki Jimny (5-Door & 3-Door)',
      'Force Gurkha (2021+)',
      'Universal 4x4',
    ],
    specifications: {
      'Material': 'Virgin UV-Stabilized LLDPE (Linear Low Density Polyethylene)',
      'Intake Diameter': '3.5 inches (89mm)',
      'Air Ram Type': 'Removable Grid Ram Head with Water Separator',
      'Hardware': 'Stainless Steel 304 Mounting Clamps & Bolts',
      'Operating Temp': '-40°C to +105°C',
      'Finish': 'Textured Satin Black',
      'Warranty': '3 Years Manufacturer Warranty',
    },
    installation_info: 'Includes 1:1 scale cutting & drilling template, flexible ducting hose, stainless hose clamps, mounting bracket, and detailed instructions. Professional fitment recommended.',
    features: [
      'Engine protection during deep water crossings',
      'Ram intake separates rain and heavy particulate matter',
      'Delivers cooler, cleaner, and denser air to engine',
      'Precision molded to match A-pillar body lines seamlessly',
      'Heavy-duty stainless steel vibration-damping mounts',
    ],
    images: [
      {
        id: 'img-1-1',
        product_id: 'prod-1',
        image_url: '/images/product-snorkel.jpg',
        alt_text: 'Bull Gear Premium Snorkel Kit Components',
        display_order: 1,
        is_primary: true,
      },
      {
        id: 'img-1-2',
        product_id: 'prod-1',
        image_url: '/images/hero-suv.jpg',
        alt_text: 'Snorkel fitted on 4x4 vehicle',
        display_order: 2,
        is_primary: false,
      },
      {
        id: 'img-1-3',
        product_id: 'prod-1',
        image_url: '/images/gallery-1.jpg',
        alt_text: 'Snorkel in water crossing action',
        display_order: 3,
        is_primary: false,
      },
      {
        id: 'img-1-4',
        product_id: 'prod-1',
        image_url: '/images/gallery-2.jpg',
        alt_text: 'Close up fitment on A-pillar',
        display_order: 4,
        is_primary: false,
      },
    ],
    seo_title: 'Premium Snorkel Kit for 4x4 SUVs | Bull Gear',
    seo_description: 'Buy premium heavy-duty UV-resistant snorkel kit for Thar, Fortuner, Hilux, Jimny. Water crossing protection & improved airflow. Fast India shipping.',
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    category_name: 'Roof Racks',
    category_slug: 'roof-racks',
    name: 'Roof Rack',
    slug: 'heavy-duty-roof-rack',
    sku: 'BG-RR-002',
    short_description: 'Expedition heavy-duty powder-coated roof rack basket for rooftop tents and expedition cargo.',
    description: 'Engineered for overlanders who demand maximum cargo security. Features high-tensile steel construction, integrated front wind fairing, and multiple tie-down anchors.',
    price: 18995,
    sale_price: null,
    stock_quantity: 12,
    low_stock_threshold: 4,
    stock_status: 'in_stock',
    is_featured: true,
    is_best_seller: true,
    is_published: true,
    compatibility_models: [
      'Mahindra Thar (2020+ Hardtop)',
      'Toyota Fortuner',
      'Isuzu D-Max V-Cross',
      'Suzuki Jimny (2023+)',
      'Force Gurkha',
    ],
    specifications: {
      'Material': 'Cold-Rolled High Tensile Steel',
      'Load Capacity': 'Dynamic 150 kg / Static 300 kg',
      'Coating': 'Dual-layer E-coat + Textured Black Powder Coat',
      'Dimensions': '135cm x 120cm x 15cm',
      'Mounting': 'Direct Gutter Mount Clamps (No Drilling Required)',
    },
    features: [
      'Integrated aerodynamic wind fairing reduces cabin wind noise',
      'Direct gutter mounts require zero body drilling on compatible models',
      'Pre-drilled mounting slots for spotlights, awning, and jerry cans',
      'Static rating tested for 2-person rooftop tents',
    ],
    images: [
      {
        id: 'img-2-1',
        product_id: 'prod-2',
        image_url: '/images/product-roof-rack.jpg',
        alt_text: 'Bull Gear Heavy Duty Expedition Roof Rack',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-3',
    category_id: 'cat-3',
    category_name: 'LED Light Bars',
    category_slug: 'led-light-bars',
    name: 'LED Light Bar',
    slug: 'ultra-bright-led-light-bar',
    sku: 'BG-LED-003',
    short_description: '50-inch dual-row combo beam LED light bar with Osram chips and IP68 waterproof rating.',
    description: 'Transform night into daylight. Features 180W high-output Osram LEDs with dual spot/flood optics, heavy-duty aluminum housing, and military-grade breather valve.',
    price: 12999,
    sale_price: null,
    stock_quantity: 24,
    low_stock_threshold: 6,
    stock_status: 'in_stock',
    is_featured: true,
    is_best_seller: true,
    is_published: true,
    compatibility_models: [
      'Universal Roof Mount',
      'Mahindra Thar',
      'Toyota Fortuner',
      'Toyota Hilux',
      'Suzuki Jimny',
    ],
    specifications: {
      'Power Output': '280W / 26,000 Lumens',
      'LED Chip': 'Osram 5W OSLON High Output',
      'Beam Pattern': 'Spot (30°) + Flood (60°) Combo',
      'Waterproof Rating': 'IP68 & IP69K Pressure-wash safe',
      'Operating Voltage': '9V - 32V DC',
    },
    features: [
      'Combo beam provides ultra-wide peripheral flood and 600m forward spot beam',
      'Unbreakable Lexan polycarbonate front lens',
      'Aviation-grade 6063 aluminum housing with oversized cooling fins',
      'Includes relay wiring harness and waterproof DT connectors',
    ],
    images: [
      {
        id: 'img-3-1',
        product_id: 'prod-3',
        image_url: '/images/product-light-bar.jpg',
        alt_text: 'Ultra Bright LED Light Bar',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-4',
    category_id: 'cat-5',
    category_name: 'Bull Bars',
    category_slug: 'bull-bars',
    name: 'Bull Bar',
    slug: 'steel-reinforced-bull-bar',
    sku: 'BG-BB-004',
    short_description: 'Heavy duty steel tubular front bull bar with integrated winch plate and skid guard.',
    description: 'Maximum frontal collision and brush protection. Engineered with mandrel-bent seamless steel tubing and direct chassis mounting plates.',
    price: 16995,
    sale_price: null,
    stock_quantity: 9,
    low_stock_threshold: 3,
    stock_status: 'in_stock',
    is_featured: true,
    is_best_seller: false,
    is_published: true,
    compatibility_models: [
      'Mahindra Thar (2020+)',
      'Toyota Hilux',
      'Isuzu D-Max V-Cross',
      'Force Gurkha',
    ],
    specifications: {
      'Tube Diameter': '60mm Cold Drawn Seamless Steel',
      'Coating': 'Corrosion Inhibiting Zinc Phosphate + Satin Black Powder',
      'Compatibility': 'Airbag Deployment & Crush Zone Tested',
    },
    features: [
      'Full frontal grille, radiator, and headlamp protection',
      'Integrated heavy-duty dual recovery tow points',
      'Pre-drilled mounting brackets for driving lights & UHF antenna',
    ],
    images: [
      {
        id: 'img-4-1',
        product_id: 'prod-4',
        image_url: '/images/product-bull-bar.jpg',
        alt_text: 'Bull Gear Steel Reinforced Bull Bar',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-5',
    category_id: 'cat-4',
    category_name: 'Bumpers',
    category_slug: 'bumpers',
    name: 'Off-road Bumper',
    slug: 'heavy-duty-off-road-bumper',
    sku: 'BG-BMP-005',
    short_description: 'High-clearance rock crawling steel front bumper with winch cradle.',
    description: 'Aggressive styling and extreme approach angles. Replaces factory plastic bumpers with thick CNC laser-cut 4mm steel armor.',
    price: 28955,
    sale_price: null,
    stock_quantity: 6,
    low_stock_threshold: 2,
    stock_status: 'limited_stock',
    is_featured: false,
    is_best_seller: true,
    is_published: true,
    compatibility_models: [
      'Mahindra Thar (2020+)',
      'Toyota Fortuner',
      'Toyota Hilux',
      'Suzuki Jimny',
    ],
    specifications: {
      'Plate Thickness': '4mm Steel Shell with 6mm Winch Mounting Cradle',
      'Winch Capacity': 'Supports up to 12,500 lbs electric winches',
      'Lighting': 'Integrated cutouts for factory OEM fog lamps',
    },
    features: [
      'Massive approach angle increase for rock crawling and steep ledges',
      'Heavy-duty recovery tabs rated for 4.75T D-shackles',
      'Front skid plate protects steering linkage and radiator base',
    ],
    images: [
      {
        id: 'img-5-1',
        product_id: 'prod-5',
        image_url: '/images/product-bumper.jpg',
        alt_text: 'Heavy Duty Off-road Bumper',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-6',
    category_id: 'cat-6',
    category_name: 'Recovery Gear',
    category_slug: 'recovery-gear',
    name: 'Recovery Gear Kit',
    slug: 'heavy-duty-recovery-gear-kit',
    sku: 'BG-REC-006',
    short_description: 'Complete 4x4 overland kinetic recovery kit with 9m rope, soft shackles, and carry bag.',
    description: 'Never get stranded on the trails. Kinetic energy snatch rope stretches up to 30% to smoothly yank vehicles out of deep mud, snow, and sand without chassis shock.',
    price: 8995,
    sale_price: null,
    stock_quantity: 28,
    low_stock_threshold: 5,
    stock_status: 'in_stock',
    is_featured: false,
    is_best_seller: true,
    is_published: true,
    compatibility_models: ['Universal for all 4x4 & SUV vehicles'],
    specifications: {
      'Rope Breaking Strength': '11,000 kg (24,000 lbs)',
      'Rope Dimensions': '22mm diameter x 9 meters length',
      'Soft Shackles': '2x UHMWPE Synthetic Soft Shackles (14,000 kg breaking strain)',
      'Bag': 'Heavy duty weatherproof ripstop ballistic nylon duffle',
    },
    features: [
      'Double-braided high-tenacity nylon 66 with polyurethane coating',
      '30% elongation absorbs peak kinetic snatch shocks',
      'Ultra-safe synthetic soft shackles eliminate lethal metal flying projectiles',
    ],
    images: [
      {
        id: 'img-6-1',
        product_id: 'prod-6',
        image_url: '/images/product-recovery.jpg',
        alt_text: 'Bull Gear Heavy Duty Recovery Gear Kit',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-7',
    category_id: 'cat-7',
    category_name: 'Off-Road Tyres',
    category_slug: 'off-road-tyres',
    name: 'Off-road Tyres',
    slug: 'mud-terrain-off-road-tyres',
    sku: 'BG-TYR-007',
    short_description: 'Extreme mud-terrain 4x4 tyres with 3-ply sidewall puncture shield.',
    description: 'Engineered for untamed terrain. Features aggressive shoulder lugs, stone ejectors, and high silica compound for uncompromised wet and dry rock grip.',
    price: 15999,
    sale_price: null,
    stock_quantity: 16,
    low_stock_threshold: 4,
    stock_status: 'in_stock',
    is_featured: false,
    is_best_seller: true,
    is_published: true,
    compatibility_models: [
      'Thar 16" & 18" Wheels',
      'Fortuner 17" & 18" Wheels',
      'Jimny 15" Wheels',
      'Hilux 17" & 18" Wheels',
    ],
    specifications: {
      'Size Options': '265/75 R16, 285/70 R17, 215/75 R15',
      'Ply Rating': '10-Ply E-load rating with 3-ply polyester sidewall',
      'Tread Depth': '15mm deep void grooves',
    },
    features: [
      'Self-cleaning tread voids rapidly evacuate thick clay and mud',
      'Reinforced sidewall biter blocks for lateral hill traction',
      'Puncture-resistant Kevlar belt layer protects against sharp jagged rocks',
    ],
    images: [
      {
        id: 'img-7-1',
        product_id: 'prod-7',
        image_url: '/images/product-tyres.jpg',
        alt_text: 'Bull Gear Mud Terrain Off Road Tyres',
        display_order: 1,
        is_primary: true,
      },
    ],
  },
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'ENGINEERED FOR',
    highlight_text: 'REAL ADVENTURES',
    subtitle: 'Premium 4x4 accessories designed for offroaders, travellers, overland and adventure seekers.',
    desktop_image_url: '',
    mobile_image_url: '',
    button_label: 'Shop Products',
    button_link: '/shop',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'ban-2',
    title: 'EXPLORE',
    highlight_text: 'BEYOND LIMITS',
    subtitle: 'High performance automotive armor, lighting, and recovery systems built to withstand the toughest expeditions.',
    desktop_image_url: '',
    mobile_image_url: '',
    button_label: 'Explore Catalog',
    button_link: '/shop',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'ban-3',
    title: 'GEAR UP',
    highlight_text: 'YOUR DRIVE',
    subtitle: 'Heavy duty accessories manufactured with aerospace-grade materials for ultimate durability.',
    desktop_image_url: '',
    mobile_image_url: '',
    button_label: 'View Accessories',
    button_link: '/shop',
    display_order: 3,
    is_active: true,
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '919876543210',
  phone_number: '+91 98765 43210',
  contact_email: 'Bullgearshope@gmail.com',
  address: 'Bull Gear Automotive Labs, Industrial Corridor, Gurgaon, Haryana 122002, India',
  site_name: 'Bull Gear',
  currency_symbol: '₹',
  free_shipping_threshold: 4999,
  enable_intro_video: true,
  intro_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  announcement_bar: {
    enabled: true,
    text: '🔥 Free Express Shipping Across India on all orders above ₹4,999!',
  },
  privacy_policy: `Welcome to Bull Gear. Your privacy and trust are our top priorities.

1. Information We Collect
When you browse our catalog, submit an inquiry, or initiate a WhatsApp order, we collect essential details such as your name, contact phone number, delivery address, and vehicle make/model to ensure proper component compatibility.

2. Order Processing & WhatsApp Fulfillment
Bull Gear conducts streamlined order confirmation and technical fitment advisory via WhatsApp. Your details are used strictly to coordinate dispatch, generate waybills, and provide direct tracking updates.

3. Payment & Security
We do not store payment card credentials. Pre-order tokens and invoices are verified directly via secure UPI and registered banking channels.

4. Warranty & Support
All Bull Gear armor and fabricated gear carry our lifetime structural warranty. For inquiries, warranty claims, or data questions, contact our support team directly.

Official Email: Bullgearshope@gmail.com`,
};

// In-memory runtime cache for seamless operation and modifications
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };
let memoryProducts = [...DEFAULT_PRODUCTS];
let memoryCategories = [...DEFAULT_CATEGORIES];
const memoryBanners = [...DEFAULT_BANNERS];
const memoryOrders: Order[] = [
  {
    id: 'ord-1',
    order_number: 'BG-2026-0001',
    customer_name: 'Vikram Singh Rathore',
    phone_number: '+91 98765 43210',
    whatsapp_number: '+91 98765 43210',
    delivery_address: 'Plot 42, Overland Ridge, DLF Phase 5, Gurgaon, Haryana 122002',
    vehicle_model: 'Mahindra Thar (2020+)',
    total_amount: 24999,
    currency: 'INR',
    order_status: 'confirmed',
    payment_status: 'pending',
    created_at: '2026-10-26T08:00:00.000Z',
    updated_at: '2026-10-26T10:00:00.000Z',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        product_name: 'Premium Snorkel Kit',
        product_sku: 'BG-SNK-001',
        quantity: 1,
        unit_price: 24999,
        subtotal: 24999,
      },
    ],
  },
  {
    id: 'ord-2',
    order_number: 'BG-2026-0002',
    customer_name: 'Rahul Sharma',
    phone_number: '+91 99887 76655',
    whatsapp_number: '+91 99887 76655',
    delivery_address: 'Flat 304, Green Heights, Indiranagar, Bangalore, Karnataka 560038',
    vehicle_model: 'Toyota Fortuner (2016+)',
    total_amount: 18995,
    order_status: 'processing',
    payment_status: 'paid',
    currency: 'INR',
    created_at: '2026-10-25T14:00:00.000Z',
    updated_at: '2026-10-26T02:00:00.000Z',
    items: [
      {
        id: 'item-2',
        product_id: 'prod-2',
        product_name: 'Roof Rack',
        product_sku: 'BG-RR-002',
        quantity: 1,
        unit_price: 18995,
        subtotal: 18995,
      },
    ],
  },
  {
    id: 'ord-3',
    order_number: 'BG-2026-0003',
    customer_name: 'Karan Mehra',
    phone_number: '+91 91234 56789',
    whatsapp_number: '+91 91234 56789',
    delivery_address: 'House No 18, Sector 15, Chandigarh 160015',
    vehicle_model: 'Suzuki Jimny (5-Door)',
    total_amount: 12999,
    order_status: 'pending',
    payment_status: 'pending',
    currency: 'INR',
    created_at: '2026-10-26T09:30:00.000Z',
    updated_at: '2026-10-26T09:30:00.000Z',
    items: [
      {
        id: 'item-3',
        product_id: 'prod-3',
        product_name: 'LED Light Bar',
        product_sku: 'BG-LED-003',
        quantity: 1,
        unit_price: 12999,
        subtotal: 12999,
      },
    ],
  },
];

// Data Access Methods
export async function getProducts(options?: {
  categorySlug?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const client = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && client) {
    try {
      let query = client
        .from('products')
        .select(`
          *,
          categories:category_id (name, slug),
          images:product_images (*)
        `)
        .eq('is_published', true);

      if (options?.isFeatured) query = query.eq('is_featured', true);
      if (options?.isBestSeller) query = query.eq('is_best_seller', true);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let mapped = data.map((item: any) => {
          const specs = item.specifications || {};
          const featuredOrder = specs._featured_order !== undefined ? Number(specs._featured_order) : (item.featured_order || 99);
          const bestSellerOrder = specs._best_seller_order !== undefined ? Number(specs._best_seller_order) : (item.best_seller_order || 99);
          const cleanSpecs: Record<string, string> = {};
          for (const [k, v] of Object.entries(specs)) {
            if (!k.startsWith('_')) cleanSpecs[k] = String(v);
          }
          const qty = typeof item.stock_quantity === 'number' ? item.stock_quantity : parseInt(item.stock_quantity || '0', 10);
          const threshold = item.low_stock_threshold || 5;
          const status: StockStatus = qty <= 0 ? 'out_of_stock' : qty <= threshold ? 'limited_stock' : (item.stock_status || 'in_stock');

          return {
            ...item,
            specifications: cleanSpecs,
            stock_status: status,
            featured_order: featuredOrder,
            best_seller_order: bestSellerOrder,
            category_name: item.categories?.name,
            category_slug: item.categories?.slug,
            images: (item.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
          };
        });

        if (options?.categorySlug) {
          mapped = mapped.filter((p: any) => p.category_slug === options.categorySlug || p.categories?.slug === options.categorySlug);
        }

        return mapped;
      }
    } catch {
      // Fall through to memory
    }
  }

  let results = [...memoryProducts].filter((p) => p.is_published);
  if (options?.categorySlug) {
    results = results.filter((p) => p.category_slug === options.categorySlug);
  }
  if (options?.isFeatured) {
    results = results.filter((p) => p.is_featured);
  }
  if (options?.isBestSeller) {
    results = results.filter((p) => p.is_best_seller);
  }
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }
  return results;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from('products')
        .select(`
          *,
          categories:category_id (name, slug),
          images:product_images (*)
        `)
        .eq('slug', slug)
        .single();

      if (!error && data) {
        const specs = data.specifications || {};
        const featuredOrder = specs._featured_order !== undefined ? Number(specs._featured_order) : (data.featured_order || 99);
        const bestSellerOrder = specs._best_seller_order !== undefined ? Number(specs._best_seller_order) : (data.best_seller_order || 99);
        const cleanSpecs: Record<string, string> = {};
        for (const [k, v] of Object.entries(specs)) {
          if (!k.startsWith('_')) cleanSpecs[k] = String(v);
        }

        return {
          ...data,
          featured_order: featuredOrder,
          best_seller_order: bestSellerOrder,
          specifications: cleanSpecs,
          category_name: data.categories?.name,
          category_slug: data.categories?.slug,
          images: (data.images || []).sort((a: any, b: any) => a.display_order - b.display_order),
        };
      }
    } catch {
      // Fall through
    }
  }
  return memoryProducts.find((p) => p.slug === slug) || null;
}

export async function getCategories(): Promise<Category[]> {
  const client = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fall through
    }
  }
  return memoryCategories.filter((c) => c.is_active);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const client = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) return data;
    } catch {
      // Fall through
    }
  }
  return memoryCategories.find((c) => c.slug === slug) || null;
}

export async function getBanners(): Promise<Banner[]> {
  const client = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch {
      // Fall through
    }
  }
  return memoryBanners.filter((b) => b.is_active);
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbIds = new Set(data.map((o: any) => o.id));
        const dbOrderNumbers = new Set(data.map((o: any) => o.order_number));
        const uncommitted = memoryOrders.filter(
          (m) => !dbIds.has(m.id) && !dbOrderNumbers.has(m.order_number)
        );
        return [...data, ...uncommitted];
      }
    } catch (err) {
      console.error('Error in getOrders from Supabase:', err);
    }
  }
  return memoryOrders;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
  let highestNum = 0;
  const adminClient = getServiceSupabase() || supabase;
  if (isSupabaseConfigured && adminClient) {
    try {
      const { data: latestOrders } = await adminClient
        .from('orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(30);
      if (latestOrders && latestOrders.length > 0) {
        for (const o of latestOrders) {
          const match = o.order_number?.match(/BG-\d{4}-(\d+)/);
          if (match) {
            const val = parseInt(match[1], 10);
            if (val > highestNum) highestNum = val;
          }
        }
      }
    } catch {}
  }
  for (const o of memoryOrders) {
    const match = o.order_number?.match(/BG-\d{4}-(\d+)/);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val > highestNum) highestNum = val;
    }
  }
  const nextNum = Math.max(highestNum + 1, 1);
  let orderNumber = `BG-2026-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && adminClient) {
    try {
      let { data: orderRow, error: orderErr } = await adminClient
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          phone_number: orderData.phone_number,
          whatsapp_number: orderData.whatsapp_number || orderData.phone_number,
          delivery_address: orderData.delivery_address,
          vehicle_model: orderData.vehicle_model,
          customer_notes: orderData.customer_notes,
          total_amount: orderData.total_amount,
          currency: orderData.currency || 'INR',
          order_status: orderData.order_status || 'pending',
          payment_status: orderData.payment_status || 'pending',
        })
        .select()
        .single();

      if (orderErr && (orderErr as any).code === '23505') {
        const uniqueOrderNumber = `${orderNumber}-${Date.now().toString().slice(-4)}`;
        const retry = await adminClient
          .from('orders')
          .insert({
            order_number: uniqueOrderNumber,
            customer_name: orderData.customer_name,
            phone_number: orderData.phone_number,
            whatsapp_number: orderData.whatsapp_number || orderData.phone_number,
            delivery_address: orderData.delivery_address,
            vehicle_model: orderData.vehicle_model,
            customer_notes: orderData.customer_notes,
            total_amount: orderData.total_amount,
            currency: orderData.currency || 'INR',
            order_status: orderData.order_status || 'pending',
            payment_status: orderData.payment_status || 'pending',
          })
          .select()
          .single();
        orderRow = retry.data;
        orderErr = retry.error;
        if (!orderErr && orderRow) {
          newOrder.order_number = uniqueOrderNumber;
        }
      }

      if (!orderErr && orderRow && orderData.items) {
        const itemsToInsert = orderData.items.map((item) => ({
          order_id: orderRow.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }));
        await adminClient.from('order_items').insert(itemsToInsert);
        newOrder.id = orderRow.id;
      }
    } catch (err) {
      console.error('Supabase order creation fallback:', err);
    }
  }

  // Deduct inventory
  if (orderData.items) {
    for (const item of orderData.items) {
      if (item.product_id) {
        const prod = memoryProducts.find((p) => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
          if (prod.stock_quantity === 0) {
            prod.stock_status = 'out_of_stock';
          } else if (prod.stock_quantity <= prod.low_stock_threshold) {
            prod.stock_status = 'limited_stock';
          }
        }
      }
    }
  }

  memoryOrders.unshift(newOrder);
  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<boolean> {
  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.order_status = status;
    order.updated_at = new Date().toISOString();
  }
  if (isSupabaseConfigured) {
    const adminClient = getServiceSupabase();
    if (adminClient) {
      try {
        await adminClient.from('orders').update({ order_status: status, updated_at: new Date().toISOString() }).eq('id', orderId);
      } catch {
        // Fallback
      }
    }
  }
  return true;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryProducts.push(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const index = memoryProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  memoryProducts[index] = {
    ...memoryProducts[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return memoryProducts[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  return true;
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = {
    ...category,
    id: `cat-${Date.now()}`,
  };
  memoryCategories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const index = memoryCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  memoryCategories[index] = { ...memoryCategories[index], ...updates };
  return memoryCategories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').update({ category_id: null }).eq('category_id', id);
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase category deletion error:', err);
    }
  }
  memoryCategories = memoryCategories.filter((c) => c.id !== id);
  return true;
}

export async function getSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (!error && data && data.length > 0) {
        const generalRow = data.find((row: any) => row.key === 'general');
        const policyRow = data.find((row: any) => row.key === 'privacy_policy');

        const merged: SiteSettings = {
          ...DEFAULT_SETTINGS,
          ...(generalRow?.value || {}),
        };
        if (policyRow?.value?.content) {
          merged.privacy_policy = policyRow.value.content;
        } else if (generalRow?.value?.privacy_policy) {
          merged.privacy_policy = generalRow.value.privacy_policy;
        }
        memorySettings = merged;
        return merged;
      }
    } catch (err) {
      console.error('Failed to load settings from Supabase:', err);
    }
  }
  return memorySettings;
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySettings = { ...memorySettings, ...settings };
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'general',
        value: memorySettings,
        updated_at: new Date().toISOString(),
      });
      if (settings.privacy_policy) {
        await supabase.from('site_settings').upsert({
          key: 'privacy_policy',
          value: { content: settings.privacy_policy },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to update settings in Supabase:', err);
    }
  }
  return memorySettings;
}
