import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_CATEGORIES } from '@/lib/db';
import { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && categories && categories.length > 0) {
        // Also fetch product counts per category
        const { data: products } = await supabase
          .from('products')
          .select('id, category_id, is_published');

        const counts: Record<string, number> = {};
        if (products) {
          for (const p of products) {
            if (p.category_id) {
              counts[p.category_id] = (counts[p.category_id] || 0) + 1;
            }
          }
        }

        const enriched = categories.map((c: any) => ({
          ...c,
          product_count: counts[c.id] || 0,
        }));

        return NextResponse.json({ success: true, data: enriched });
      }
    }

    return NextResponse.json({ success: true, data: DEFAULT_CATEGORIES });
  } catch (err: any) {
    console.error('GET categories error:', err);
    return NextResponse.json({ success: false, error: err.message, data: DEFAULT_CATEGORIES });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, image_url, display_order, is_featured, is_active } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          slug: cleanSlug,
          description: description || '',
          image_url: image_url || '/images/product-snorkel.jpg',
          display_order: display_order || 99,
          is_featured: Boolean(is_featured),
          is_active: is_active !== false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: cleanSlug,
      description: description || '',
      image_url: image_url || '/images/product-snorkel.jpg',
      display_order: display_order || 99,
      is_featured: Boolean(is_featured),
      is_active: true,
      product_count: 0,
    };
    return NextResponse.json({ success: true, data: newCat });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, description, image_url, display_order, is_featured, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const updates: any = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug;
      if (description !== undefined) updates.description = description;
      if (image_url !== undefined) updates.image_url = image_url;
      if (display_order !== undefined) updates.display_order = display_order;
      if (is_featured !== undefined) updates.is_featured = is_featured;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      // First dissociate any products referencing this category so foreign keys never fail
      await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', id);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Category removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
