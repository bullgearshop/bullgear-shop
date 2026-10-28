export type StockStatus = 'in_stock' | 'limited_stock' | 'out_of_stock';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  cloudinary_public_id?: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: StockStatus;
  is_featured: boolean;
  is_best_seller: boolean;
  is_published: boolean;
  compatibility_models: string[];
  specifications: Record<string, string>;
  installation_info?: string;
  delivery_returns_info?: string;
  features: string[];
  images: ProductImage[];
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  highlight_text: string;
  subtitle: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  button_label: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
  focal_position?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_model?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  whatsapp_number?: string;
  delivery_address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  customer_notes?: string;
  vehicle_model?: string;
  total_amount: number;
  currency: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface SiteSettings {
  whatsapp_number: string;
  site_name: string;
  currency_symbol: string;
  free_shipping_threshold: number;
  enable_intro_video: boolean;
  intro_video_url?: string;
  announcement_bar?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}
