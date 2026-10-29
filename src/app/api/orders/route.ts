import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrderStatus } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('API Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, order_status, payment_status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    if (order_status) {
      await updateOrderStatus(id, order_status as OrderStatus);
    }

    if (payment_status && isSupabaseConfigured) {
      const client = getServiceSupabase() || supabase;
      if (client) {
        await client
          .from('orders')
          .update({ payment_status, updated_at: new Date().toISOString() })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true, id, order_status, payment_status });
  } catch (error: any) {
    console.error('API Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

