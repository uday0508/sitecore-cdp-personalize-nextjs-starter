import { event } from '@sitecore-cloudsdk/events/browser';
import type { EventData } from '@sitecore-cloudsdk/events/browser';

export interface OrderLineItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface CheckoutData {
  channel: string;
  currency: string;
  language: string;
  page: string;
  orderId: string;
  total: number;
  lineItems: OrderLineItem[];
}

/**
 * Sends an ORDER_CHECKOUT event.
 *
 * ORDER_CHECKOUT is a reserved Sitecore CDP event type.
 */
export async function sendOrderCheckoutEvent(
  data: CheckoutData
): Promise<void> {
  const payload = {
    type: 'ORDER_CHECKOUT',
    channel: data.channel,
    currency: data.currency,
    language: data.language,
    page: data.page,
    extensionData: {
      orderId: data.orderId,
      total: data.total,
      lineItemCount: data.lineItems.length,
    },
  } as EventData;

  await event(payload);
}

/**
 * Sends an ORDER_CONFIRMED event after payment is captured.
 */
export async function sendOrderConfirmedEvent(
  data: CheckoutData
): Promise<void> {
  const payload = {
    type: 'ORDER_CONFIRMED',
    channel: data.channel,
    currency: data.currency,
    language: data.language,
    page: data.page,
    extensionData: {
      orderId: data.orderId,
      total: data.total,
    },
  } as EventData;

  await event(payload);
}