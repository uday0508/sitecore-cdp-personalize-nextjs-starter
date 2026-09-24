'use client';

import { useState } from 'react';
import { sendViewEvent } from '@/src/sitecore/cdp/events/view';
import { sendIdentityEvent } from '@/src/sitecore/cdp/events/identity';
import { sendCustomEvent } from '@/src/sitecore/cdp/events/custom';

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
    try {
      await sendViewEvent(eventContext);
      appendLog('VIEW event sent');
    } catch (error) {
      appendLog(`VIEW error: ${error instanceof Error ? error.message : error}`);
    }
  }

  async function handleIdentityEvent() {
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

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Event Collection Demo</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleViewEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send VIEW event
        </button>

        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          onClick={handleIdentityEvent}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Send IDENTITY event
        </button>

        <button
          onClick={handleCustomEvent}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Send Custom Event
        </button>
      </div>

      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg min-h-[120px] overflow-auto text-sm font-mono">
        {log.length ? log.join('\n') : 'Waiting for events...'}
      </pre>

      <p className="text-sm text-gray-500 mt-4">
        Open DevTools → Network, filter for{' '}
        <code className="bg-gray-100 px-1 rounded">
          edge-platform.sitecorecloud.io/events
        </code>{' '}
        to verify event requests.
      </p>
    </section>
  );
}