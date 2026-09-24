import { personalize } from '@sitecore-cloudsdk/personalize/browser';

export interface PersonalizeData {
  friendlyId: string;
  channel: string;
  currency: string;
  language?: string;
  params?: Record<string, string>;
}

export async function runInteractiveExperience(
  data: PersonalizeData
): Promise<unknown> {
  return personalize(data);
}