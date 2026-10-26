import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customer_name,
      phone_number,
      delivery_address,
      items,
      total_amount,
      vehicle_model,
      customer_notes,
    } = body;

    if (!customer_name || !phone_number || !delivery_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer contact details.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // Server-side order creation & inventory check
    const newOrder = await createOrder({
      customer_name: customer_name.trim(),
      phone_number: phone_number.trim(),
      whatsapp_number: phone_number.trim(),
      delivery_address: delivery_address.trim(),
      vehicle_model: vehicle_model || '',
      customer_notes: customer_notes || '',
      total_amount: Number(total_amount),
      currency: 'INR',
      order_status: 'pending',
      payment_status: 'pending',
      items: items.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku || '',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        subtotal: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
      })),
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    console.error('API Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
