import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (isSupabaseConfigured && supabase) {
      if (key) {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('key', key)
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({ success: true, key: data.key, value: data.value });
        }
        return NextResponse.json({ success: true, key, value: null });
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (!error && data) {
        const settingsMap: Record<string, any> = {};
        for (const item of data) {
          settingsMap[item.key] = item.value;
        }
        return NextResponse.json({ success: true, data: settingsMap });
      }
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
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
