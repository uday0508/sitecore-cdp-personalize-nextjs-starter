import {
  addToEventQueue,
  processEventQueue,
  clearEventQueue,
} from '@sitecore-cloudsdk/events/browser';
import type { EventData } from '@sitecore-cloudsdk/events/browser';

/**
 * Queues an event locally. It is not sent to Sitecore CDP until
 * processQueue() is called.
 *
 * Use this for non-critical events so they do not compete with
 * primary events for network priority.
 */
export async function queueEvent(data: EventData): Promise<void> {
  await addToEventQueue(data);
}

/**
 * Sends every queued event to Sitecore CDP in order, then clears
 * the queue.
 */
export async function processQueue(): Promise<void> {
  await processEventQueue();
}

/**
 * Discards the queue without sending. Use only when the user has
 * withdrawn consent or the session is being discarded.
 */
export async function discardQueue(): Promise<void> {
  await clearEventQueue();
}