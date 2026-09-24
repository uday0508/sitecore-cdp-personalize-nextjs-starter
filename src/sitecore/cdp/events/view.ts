import { engage } from '@sitecore-cloudsdk/events/browser';
import type { ViewEventData, ExtensionData } from './types';

export async function sendViewEvent(
  data: ViewEventData,
  extensionData?: ExtensionData
): Promise<void> {
  const payload = {
    channel: data.channel,
    currency: data.currency,
    pointOfSale: data.pointOfSale,
    language: data.language,
    page: data.page,
    ...(data.pageVariant && { pageVariant: data.pageVariant }),
  };

  await engage.event('VIEW', payload, extensionData);
}