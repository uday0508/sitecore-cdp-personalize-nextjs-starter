import { identity } from '@sitecore-cloudsdk/events/browser';
import type { IdentityData } from './types';

// VERIFIED: identity(identityData: IdentityData)
// VERIFIED: identifiers is required
export async function sendIdentityEvent(data: IdentityData): Promise<void> {
  await identity(data);
}