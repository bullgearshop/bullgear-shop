import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { Product, ProductImage, StockStatus } from '@/lib/types';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// GET all products from Supabase
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const isFeatured = searchParams.get('featured') === 'true';
    const isBestSeller = searchParams.get('best_seller') === 'true';

    const client = getServiceSupabase() || supabase;

    if (isSupabaseConfigured && client) {
      let query = client
        .from('products')
        .select(`
          *,
          categories:category_id (name, slug),
          images:product_images (*)
        `)
        .eq('is_published', true);

      if (isFeatured) query = query.eq('is_featured', true);
      if (isBestSeller) query = query.eq('is_best_seller', true);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        let results: Product[] = data.map((item: any) => {
          const specs = item.specifications || {};
          const featuredOrder = specs._featured_order !== undefined ? Number(specs._featured_order) : 99;
          const bestSellerOrder = specs._best_seller_order !== undefined ? Number(specs._best_seller_order) : 99;
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

        if (categorySlug) {
          results = results.filter((p) => p.category_slug === categorySlug);
        }

        return NextResponse.json({ success: true, data: results });
      }
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ success: false, error: err.message, data: [] });
  }
}

// POST: Add new product to Supabase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      sku,
      price,
      sale_price,
      category_id,
      stock_quantity,
      low_stock_threshold,
      stock_status,
      is_featured,
      is_best_seller,
      is_published,
      description,
      short_description,
      compatibility_models,
      specifications,
      installation_info,
      delivery_returns_info,
      features,
      images,
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const client = getServiceSupabase() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: 'Database is not configured' }, { status: 500 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newId = isUUID(body.id) ? body.id : crypto.randomUUID();

    const parsedStock = parseInt(stock_quantity, 10) || 0;
    const threshold = low_stock_threshold ? parseInt(low_stock_threshold, 10) : 5;
    const autoStatus: StockStatus = parsedStock <= 0 ? 'out_of_stock' : parsedStock <= threshold ? 'limited_stock' : (stock_status || 'in_stock');

    const specsObj: any = typeof specifications === 'object' && specifications !== null ? { ...specifications } : {};
    if (body.featured_order !== undefined) specsObj._featured_order = Number(body.featured_order);
    if (body.best_seller_order !== undefined) specsObj._best_seller_order = Number(body.best_seller_order);

    const insertData: any = {
      id: newId,
      name,
      slug: cleanSlug,
      sku: sku || `BG-${Date.now().toString().slice(-4)}`,
      price: parseFloat(price) || 0,
      sale_price: sale_price ? parseFloat(sale_price) : null,
      stock_quantity: parsedStock,
      low_stock_threshold: threshold,
      stock_status: autoStatus,
      is_featured: Boolean(is_featured),
      is_best_seller: Boolean(is_best_seller),
      is_published: is_published !== false,
      description: description || '',
      short_description: short_description || (description ? description.slice(0, 160) : ''),
      compatibility_models: Array.isArray(compatibility_models) ? compatibility_models : [],
      specifications: specsObj,
      installation_info: installation_info || null,
      features: Array.isArray(features) ? features : [],
    };

    if (category_id && isUUID(category_id)) {
      insertData.category_id = category_id;
    }

    const { data: insertedProduct, error: prodError } = await client
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (prodError) {
      console.error('Insert product error:', prodError);
      return NextResponse.json({ success: false, error: prodError.message }, { status: 400 });
    }

    // Insert Product Images
    if (Array.isArray(images) && images.length > 0) {
      const imgRows = images.map((img: ProductImage, idx: number) => ({
        id: crypto.randomUUID(),
        product_id: insertedProduct.id,
        image_url: img.image_url,
        alt_text: img.alt_text || name,
        display_order: idx + 1,
        is_primary: idx === 0,
      }));

      await client.from('product_images').insert(imgRows);
    }

    // Trigger revalidations
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      revalidatePath(`/products/${cleanSlug}`);
    } catch {}

    return NextResponse.json({ success: true, data: insertedProduct });
  } catch (err: any) {
    console.error('POST /api/products error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update existing product in Supabase
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      slug,
      sku,
      price,
      sale_price,
      category_id,
      stock_quantity,
      low_stock_threshold,
      stock_status,
      is_featured,
      is_best_seller,
      is_published,
      description,
      short_description,
      compatibility_models,
      specifications,
      installation_info,
      features,
      images,
    } = body;

    const client = getServiceSupabase() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: 'Database is not configured' }, { status: 500 });
    }

    const cleanSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);

    const parsedStock = stock_quantity !== undefined ? (parseInt(stock_quantity, 10) || 0) : undefined;
    const threshold = low_stock_threshold !== undefined ? (parseInt(low_stock_threshold, 10) || 5) : 5;
    
    // Auto calculate stock status if quantity is supplied
    let autoStatus = stock_status;
    if (parsedStock !== undefined) {
      autoStatus = parsedStock <= 0 ? 'out_of_stock' : parsedStock <= threshold ? 'limited_stock' : (stock_status || 'in_stock');
    }

    let specsObj: any = null;
    if (specifications !== undefined) {
      specsObj = typeof specifications === 'object' && specifications !== null ? { ...specifications } : {};
    } else if (body.featured_order !== undefined || body.best_seller_order !== undefined) {
      // Order sync: fetch existing product specifications so we preserve them!
      try {
        const { data: existingProd } = await client
          .from('products')
          .select('specifications')
          .eq(id && isUUID(id) ? 'id' : 'slug', id && isUUID(id) ? id : cleanSlug)
          .maybeSingle();
        specsObj = (existingProd?.specifications && typeof existingProd.specifications === 'object')
          ? { ...existingProd.specifications }
          : {};
      } catch {
        specsObj = {};
      }
    }

    if (specsObj !== null) {
      if (body.featured_order !== undefined) specsObj._featured_order = Number(body.featured_order);
      if (body.best_seller_order !== undefined) specsObj._best_seller_order = Number(body.best_seller_order);
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (cleanSlug) updateData.slug = cleanSlug;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = parseFloat(price) || 0;
    if (sale_price !== undefined) updateData.sale_price = sale_price ? parseFloat(sale_price) : null;
    if (parsedStock !== undefined) updateData.stock_quantity = parsedStock;
    if (low_stock_threshold !== undefined) updateData.low_stock_threshold = threshold;
    if (autoStatus !== undefined) updateData.stock_status = autoStatus;
    if (is_featured !== undefined) updateData.is_featured = Boolean(is_featured);
    if (is_best_seller !== undefined) updateData.is_best_seller = Boolean(is_best_seller);
    if (is_published !== undefined) updateData.is_published = is_published !== false;
    if (description !== undefined) updateData.description = description;
    if (short_description !== undefined || description !== undefined) {
      updateData.short_description = short_description || (description ? description.slice(0, 160) : '');
    }
    if (compatibility_models !== undefined) {
      updateData.compatibility_models = Array.isArray(compatibility_models) ? compatibility_models : [];
    }
    if (specsObj !== null) {
      updateData.specifications = specsObj;
    }
    if (installation_info !== undefined) updateData.installation_info = installation_info;
    if (features !== undefined) updateData.features = Array.isArray(features) ? features : [];

    if (category_id && isUUID(category_id)) {
      updateData.category_id = category_id;
    } else if (category_id === null || category_id === '') {
      updateData.category_id = null;
    }

    // Match by UUID id or by slug
    let query = client.from('products').update(updateData);
    if (id && isUUID(id)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', cleanSlug);
    }

    const { data: updatedProd, error: updateError } = await query.select().single();

    if (updateError) {
      console.error('Update product error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
    }

    const resolvedProductId = updatedProd?.id || id;

    // Update Product Images: Delete existing images and insert new ones
    if (resolvedProductId && Array.isArray(images)) {
      await client.from('product_images').delete().eq('product_id', resolvedProductId);

      if (images.length > 0) {
        const imgRows = images.map((img: ProductImage, idx: number) => ({
          id: crypto.randomUUID(),
          product_id: resolvedProductId,
          image_url: img.image_url,
          alt_text: img.alt_text || name,
          display_order: idx + 1,
          is_primary: idx === 0,
        }));

        await client.from('product_images').insert(imgRows);
      }
    }

    // Trigger revalidations
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
      revalidatePath(`/products/${cleanSlug}`);
    } catch {}

    return NextResponse.json({ success: true, data: updatedProd });
  } catch (err: any) {
    console.error('PUT /api/products error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove product from Supabase
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Product id or slug is required' }, { status: 400 });
    }

    const client = getServiceSupabase() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: 'Database is not configured' }, { status: 500 });
    }

    // Find product id if only slug was provided
    let productId = id;
    if (!productId && slug) {
      const { data: found } = await client.from('products').select('id').eq('slug', slug).single();
      productId = found?.id;
    }

    if (productId) {
      await client.from('product_images').delete().eq('product_id', productId);
      await client.from('products').delete().eq('id', productId);
    } else if (slug) {
      await client.from('products').delete().eq('slug', slug);
    }

    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
    } catch {}

    return NextResponse.json({ success: true, message: 'Product deleted permanently' });
  } catch (err: any) {
    console.error('DELETE /api/products error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
