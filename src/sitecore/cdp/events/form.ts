import { form } from '@sitecore-cloudsdk/events/browser';

export interface FormSubmitData {
  formId: string;
  interactionType: 'VIEWED' | 'SUBMITTED';
  componentInstanceId: string;
}

/**
 * Sends a FORM event using the dedicated `form` function.
 *
 * The form() function takes three arguments:
 * - formId: the Sitecore Forms form ID
 * - interactionType: "VIEWED" or "SUBMITTED"
 * - componentInstanceId: unique instance ID for this form on the page
 *
 * FORM events are captured automatically in JSS Next.js apps. Use this
 * function only when you need to send them manually from a custom app.
 */
export async function sendFormEvent(
  data: FormSubmitData
): Promise<void> {
  await form(
    data.formId,
    data.interactionType,
    data.componentInstanceId
  );
}