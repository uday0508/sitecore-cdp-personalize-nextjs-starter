import { personalize } from '@sitecore-cloudsdk/personalize/browser';

export interface InteractiveExperienceOptions {
  friendlyId: string;
  channel?: string;
  currency?: string;
  language?: string;
  params?: Record<string, string>;
}

/**
 * Runs a Sitecore Personalize Interactive Experience.
 * Returns the API response from the experience.
 * @see https://doc.sitecore.com/sdk/en/developers/004/cloud-sdk/set-up-interactive-personalization.html
 */
export async function runInteractiveExperience(
  options: InteractiveExperienceOptions
): Promise<unknown> {
  return personalize({
    channel: options.channel ?? 'WEB',
    currency: options.currency ?? 'USD',
    friendlyId: options.friendlyId,
    ...(options.language && { language: options.language }),
    ...(options.params && { params: options.params }),
  });
}