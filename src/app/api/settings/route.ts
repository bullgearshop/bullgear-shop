import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSettings, updateSettings } from '@/lib/db';
import { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const fullSettings = await getSettings();

    if (key) {
      if (key === 'general') {
        return NextResponse.json({ success: true, key, value: fullSettings });
      }
      if (key === 'privacy_policy') {
        return NextResponse.json({ success: true, key, value: { content: fullSettings.privacy_policy } });
      }
      // Check Supabase directly for other custom keys
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('key', key)
          .maybeSingle();

        if (data) {
          return NextResponse.json({ success: true, key: data.key, value: data.value });
        }
      }
      return NextResponse.json({ success: true, key, value: null });
    }

    // Return structured full settings and data map
    return NextResponse.json({
      success: true,
      settings: fullSettings,
      data: {
        general: fullSettings,
        privacy_policy: { content: fullSettings.privacy_policy },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // If whole settings object is provided
    if (body.settings && typeof body.settings === 'object') {
      const updated = await updateSettings(body.settings);
      return NextResponse.json({ success: true, settings: updated });
    }

    // If direct fields are provided (whatsapp_number, contact_email, address, etc.)
    if (body.whatsapp_number !== undefined || body.contact_email !== undefined || body.address !== undefined || body.privacy_policy !== undefined) {
      const updateData: Partial<SiteSettings> = { ...body };
      delete (updateData as any).key;
      const updated = await updateSettings(updateData);
      return NextResponse.json({ success: true, settings: updated });
    }

    // Support legacy { key, value } format
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ success: false, error: 'Settings payload or key is required' }, { status: 400 });
    }

    if (key === 'general' && typeof value === 'object') {
      const updated = await updateSettings(value);
      return NextResponse.json({ success: true, settings: updated, key, value });
    }

    if (key === 'privacy_policy') {
      const content = typeof value === 'string' ? value : value?.content;
      const updated = await updateSettings({ privacy_policy: content });
      return NextResponse.json({ success: true, settings: updated, key, value });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, key, value });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
