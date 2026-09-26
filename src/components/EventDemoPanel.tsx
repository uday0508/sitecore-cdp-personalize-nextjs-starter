'use client';

import { useState } from 'react';
import { sendViewEvent } from '@/src/sitecore/cdp/events/view';
import { sendIdentityEvent } from '@/src/sitecore/cdp/events/identity';
import { sendCustomEvent } from '@/src/sitecore/cdp/events/custom';
import { sendFormEvent } from '@/src/sitecore/cdp/events/form';
import { sendOrderCheckoutEvent } from '@/src/sitecore/cdp/events/order';
import { queueEvent, processQueue } from '@/src/sitecore/cdp/events/queue';
import { hasAnalyticsConsent } from '@/src/sitecore/consent';

const eventContext = {
  channel: 'WEB',
  currency: 'USD',
  language: 'EN',
  page: 'home',
};

export function EventDemoPanel() {
  const [log, setLog] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  function appendLog(message: string) {
    setLog((prev) => [...prev, `${new Date().toISOString()} — ${message}`]);
  }

  async function handleViewEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('VIEW blocked — analytics consent not granted');
      return;
    }
    try {
      await sendViewEvent(eventContext);
      appendLog('VIEW event sent');
    } catch (error) {
      appendLog(`VIEW error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleIdentityEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('IDENTITY blocked — analytics consent not granted');
      return;
    }
    if (!email) {
      appendLog('Enter an email first');
      return;
    }
    try {
      await sendIdentityEvent({
        ...eventContext,
        email,
        identifiers: [{ id: email, provider: 'email' }],
      });
      appendLog(`IDENTITY event sent for ${email}`);
    } catch (error) {
      appendLog(`IDENTITY error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleCustomEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('Custom event blocked — analytics consent not granted');
      return;
    }
    try {
      await sendCustomEvent({
        type: 'starter:PRODUCT_INTERACTION',
        ...eventContext,
        extensionData: { productId: 'demo-001', interactionType: 'view' },
      });
      appendLog('Custom event sent');
    } catch (error) {
      appendLog(`Custom error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleFormEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('FORM blocked — analytics consent not granted');
      return;
    }
    try {
      await sendFormEvent({
        formId: 'newsletter-signup',
        interactionType: 'SUBMITTED',
        componentInstanceId: 'demo-form-instance-001',
      });
      appendLog('FORM event sent');
    } catch (error) {
      appendLog(`FORM error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleOrderEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('ORDER blocked — analytics consent not granted');
      return;
    }
    try {
      await sendOrderCheckoutEvent({
        ...eventContext,
        orderId: 'ORD-DEMO-001',
        total: 249.99,
        lineItems: [
          {
            productId: 'demo-001',
            name: 'Demo Product',
            quantity: 1,
            price: 249.99,
            currency: 'USD',
          },
        ],
      });
      appendLog('ORDER_CHECKOUT event sent');
    } catch (error) {
      appendLog(`Order error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleQueuedEvent() {
    if (!hasAnalyticsConsent()) {
      appendLog('Queue blocked — analytics consent not granted');
      return;
    }
    try {
      await queueEvent({
        type: 'starter:QUEUED_ANALYTICS_PING',
        ...eventContext,
        extensionData: { source: 'queue-demo' },
      });
      appendLog('Event queued (not yet sent)');
    } catch (error) {
      appendLog(`Queue error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleFlushQueue() {
    if (!hasAnalyticsConsent()) {
      appendLog('Flush blocked — analytics consent not granted');
      return;
    }
    try {
      await processQueue();
      appendLog('Queue flushed to CDP');
    } catch (error) {
      appendLog(`Flush error: ${error instanceof Error ? error.message : error}`);
    }
  }

  const groups = [
    {
      label: 'Standard events',
      buttons: [
        { label: 'VIEW', onClick: handleViewEvent, color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Custom', onClick: handleCustomEvent, color: 'bg-purple-600 hover:bg-purple-700' },
        { label: 'FORM', onClick: handleFormEvent, color: 'bg-pink-600 hover:bg-pink-700' },
        { label: 'ORDER', onClick: handleOrderEvent, color: 'bg-indigo-600 hover:bg-indigo-700' },
      ],
    },
    {
      label: 'Event queue',
      buttons: [
        { label: 'Queue event', onClick: handleQueuedEvent, color: 'bg-amber-600 hover:bg-amber-700' },
        { label: 'Flush queue', onClick: handleFlushQueue, color: 'bg-teal-600 hover:bg-teal-700' },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.buttons.map((button) => (
                <button
                  key={button.label}
                  onClick={button.onClick}
                  className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${button.color}`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
            Identity
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleIdentityEvent}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Send IDENTITY
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
            Event log
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg min-h-[120px] max-h-[240px] overflow-auto text-xs font-mono">
            {log.length ? log.join('\n') : 'Waiting for events...'}
          </pre>
        </div>

        <p className="text-xs text-gray-500">
          Open DevTools → Network, filter for{' '}
          <code className="bg-gray-100 px-1 rounded">
            edge-platform.sitecorecloud.io/events
          </code>{' '}
          to verify event requests.
        </p>
      </div>
    </div>
  );
}