import { identity } from '@sitecore-cloudsdk/events/browser';
import type { IdentityData } from './types';

export async function sendIdentityEvent(data: IdentityData): Promise<void> {
  await identity(data);
}