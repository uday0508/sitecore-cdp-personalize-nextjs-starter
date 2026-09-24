import { personalize } from '@sitecore-cloudsdk/personalize/browser';

// VERIFIED: personalize({ channel, currency, friendlyId, ... })
export interface PersonalizeData {
  friendlyId: string;
  channel: string;
  currency: string;
  language?: string;
}

export async function runInteractiveExperience(
  data: PersonalizeData
): Promise<unknown> {
  return personalize(data);
}