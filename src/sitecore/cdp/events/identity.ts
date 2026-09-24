import { identity } from '@sitecore-cloudsdk/events/browser';
import type { IdentityEventData, ExtensionData } from './types';

/**
 * Sends an IDENTITY event using the official identity function.
 * The identifiers array is required and triggers identity resolution in CDP.
 */
export async function sendIdentityEvent(
  data: IdentityEventData,
  extensionData?: ExtensionData
): Promise<void> {
  await identity({
    ...data,
    ...(extensionData && { extensionData }),
  });
}