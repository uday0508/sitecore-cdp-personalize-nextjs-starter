import { event } from '@sitecore-cloudsdk/events/browser';
import type { EventData } from '@sitecore-cloudsdk/events/browser';

export async function sendCustomEvent(data: EventData): Promise<void> {
  if (data.type.startsWith('SC_')) {
    throw new Error(
      `Custom event type must not start with "SC_". ` +
        `"SC_" is reserved by Sitecore CDP.`
    );
  }

  const reserved = ['VIEW', 'IDENTITY', 'ORDER_CHECKOUT', 'CHECKOUT'];
  if (reserved.includes(data.type)) {
    throw new Error(
      `Use the dedicated function for standard event "${data.type}".`
    );
  }

  await event(data);
}