import { engage } from '@sitecore-cloudsdk/events/browser';
import type { BaseEventData, ExtensionData } from './types';

export async function sendCustomEvent(
  eventName: string,
  data: BaseEventData,
  extensionData?: ExtensionData
): Promise<void> {
  if (eventName.startsWith('SC_')) {
    throw new Error(
      `Custom event names must not start with "SC_". ` +
      `"SC_" is reserved by Sitecore CDP for internal events.`
    );
  }

  const payload = {
    channel: data.channel,
    currency: data.currency,
    pointOfSale: data.pointOfSale,
    language: data.language,
    page: data.page,
  };

  await engage.event(eventName, payload, extensionData);
}