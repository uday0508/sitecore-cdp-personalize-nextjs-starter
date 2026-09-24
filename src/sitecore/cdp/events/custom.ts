import { event } from '@sitecore-cloudsdk/events/browser';
import type { ExtensionData } from './types';

/**
 * Sends a custom event using the official event function.
 * Reserved event names (starting with "SC_") are blocked.
 * @see https://doc.sitecore.com/sdk/en/developers/005/cloud-sdk/cloud-sdk-events-eventdata.html
 */
export async function sendCustomEvent(
  type: string,
  data: {
    channel?: string;
    currency?: string;
    language?: string;
    page?: string;
  } = {},
  extensionData?: ExtensionData
): Promise<void> {
  if (type.startsWith('SC_')) {
    throw new Error(
      `Custom event type must not start with "SC_". ` +
      `"SC_" is reserved by Sitecore CDP.`
    );
  }

  await event({
    type,
    ...data,
    ...(extensionData && { extensionData }),
  });
}