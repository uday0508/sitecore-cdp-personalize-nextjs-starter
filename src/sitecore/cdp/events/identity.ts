import { engage } from '@sitecore-cloudsdk/events/browser';
import type { IdentityEventData, ExtensionData } from './types';

export async function sendIdentityEvent(
  data: IdentityEventData,
  extensionData?: ExtensionData
): Promise<void> {
  const payload = {
    channel: data.channel,
    currency: data.currency,
    pointOfSale: data.pointOfSale,
    language: data.language,
    page: data.page,
    ...(data.email && { email: data.email }),
    ...(data.firstname && { firstname: data.firstname }),
    ...(data.lastname && { lastname: data.lastname }),
    ...(data.identifiers && { identifiers: data.identifiers }),
  };

  await engage.identity(payload, extensionData);
}