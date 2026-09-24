import { pageView } from '@sitecore-cloudsdk/events/browser';
import type { ViewEventData, ExtensionData } from './types';

/**
 * Sends a VIEW event using the official pageView function.
 * @see https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/cloud-sdk-events-browser.html
 */
export async function sendViewEvent(
  data: ViewEventData,
  extensionData?: ExtensionData
): Promise<void> {
  await pageView({
    ...data,
    ...(extensionData && { extensionData }),
  });
}