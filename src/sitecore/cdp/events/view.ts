import { pageView } from '@sitecore-cloudsdk/events/browser';
import type { EventAttributesInput, ExtensionData } from './types';

export interface PageViewData extends EventAttributesInput {
  pageVariantId?: string;
  referrer?: string;
  includeUTMParameters?: boolean;
  extensionData?: ExtensionData;
}

export async function sendViewEvent(data: PageViewData): Promise<void> {
  await pageView(data);
}