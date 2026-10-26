import { Order } from './types';

/**
 * Normalizes phone number to international format with digits only (no +, spaces, dashes)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  // Default to India country code 91 if 10-digit number without country code
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Formats a currency amount into Indian Rupee format (e.g. ₹24,999)
 */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates the official Bull Gear WhatsApp prefilled message matching the specification
 */
export function generateWhatsAppOrderMessage(order: Order): string {
  const primaryItem = order.items && order.items[0];
  const isMultiple = order.items && order.items.length > 1;

  if (!isMultiple && primaryItem) {
    return [
      'Hello Bull Gear,',
      '',
      'I would like to place an order.',
      '',
      `Order ID: ${order.order_number}`,
      `Customer: ${order.customer_name}`,
      `Phone: ${order.phone_number}`,
      `Product: ${primaryItem.product_name}`,
      order.vehicle_model ? `Vehicle Model: ${order.vehicle_model}` : null,
      primaryItem.product_sku ? `SKU: ${primaryItem.product_sku}` : null,
      `Quantity: ${primaryItem.quantity}`,
      `Unit Price: ${formatRupees(primaryItem.unit_price)}`,
      `Total: ${formatRupees(order.total_amount)}`,
      `Delivery Address: ${order.delivery_address}`,
      order.customer_notes ? `Notes: ${order.customer_notes}` : null,
      '',
      'Please confirm product availability and delivery details.',
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  // Multi-item cart order
  const itemLines = (order.items || [])
    .map(
      (item, index) =>
        `${index + 1}. ${item.product_name} x${item.quantity} (${formatRupees(item.unit_price)}) = ${formatRupees(item.subtotal)}`
    )
    .join('\n');

  return [
    'Hello Bull Gear,',
    '',
    'I would like to place an order.',
    '',
    `Order ID: ${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Phone: ${order.phone_number}`,
    order.vehicle_model ? `Vehicle Model: ${order.vehicle_model}` : null,
    'Items Ordered:',
    itemLines,
    '',
    `Total Amount: ${formatRupees(order.total_amount)}`,
    `Delivery Address: ${order.delivery_address}`,
    order.customer_notes ? `Notes: ${order.customer_notes}` : null,
    '',
    'Please confirm product availability and delivery details.',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Creates the complete Click-to-Chat URL
 */
export function createWhatsAppChatUrl(businessNumber: string, message: string): string {
  const cleanNumber = normalizeWhatsAppNumber(businessNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
