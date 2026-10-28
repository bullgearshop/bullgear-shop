import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { Banner } from '@/lib/types';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// GET all active or admin banners
export async function GET() {
  try {
    const client = getServiceSupabase() || supabase;
    if (isSupabaseConfigured && client) {
      const { data, error } = await client
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST create banner
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = getServiceSupabase() || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({
        success: true,
        data: { ...body, id: `ban-${Date.now()}` },
      });
    }

    const bannerId = isUUID(body.id) ? body.id : crypto.randomUUID();
    const payload = {
      id: bannerId,
      title: body.title || '',
      highlight_text: body.highlight_text || '',
      subtitle: body.subtitle || '',
      desktop_image_url: body.desktop_image_url || '',
      mobile_image_url: body.mobile_image_url || body.desktop_image_url || '',
      button_label: body.button_label || 'Shop Products',
      button_link: body.button_link || '/shop',
      display_order: Number(body.display_order) || 1,
      is_active: body.is_active !== undefined ? body.is_active : true,
      focal_position: body.focal_position || 'center',
    };

    const { data, error } = await client
      .from('banners')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase banner insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT update banner
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const client = getServiceSupabase() || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: true, data: body });
    }

    const payload: any = {
      title: body.title,
      highlight_text: body.highlight_text,
      subtitle: body.subtitle,
      desktop_image_url: body.desktop_image_url ?? '',
      mobile_image_url: body.mobile_image_url ?? '',
      button_label: body.button_label,
      button_link: body.button_link,
      display_order: Number(body.display_order) || 1,
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString(),
    };

    let query = client.from('banners');
    let res;
    if (isUUID(body.id)) {
      res = await query.update(payload).eq('id', body.id).select().single();
    } else {
      // Upsert by display order or create a new row
      res = await query.upsert({ ...payload, id: crypto.randomUUID() }).select().single();
    }

    if (res.error) {
      console.error('Supabase banner update error:', res.error);
      return NextResponse.json({ success: false, error: res.error.message }, { status: 500 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch {}

    return NextResponse.json({ success: true, data: res.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE banner
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const client = getServiceSupabase() || supabase;
    if (isSupabaseConfigured && client && isUUID(id)) {
      const { error } = await client.from('banners').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
