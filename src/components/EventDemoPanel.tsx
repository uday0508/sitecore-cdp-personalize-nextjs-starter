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
    <section style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
      <h2>Event Collection Demo</h2>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleViewEvent}>Send VIEW event</button>

        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem' }}
        />
        <button onClick={handleIdentityEvent}>Send IDENTITY event</button>

        <button onClick={handleCustomEvent}>Send Custom Event</button>
      </div>

      <pre
        style={{
          background: '#111',
          color: '#0f0',
          padding: '1rem',
          borderRadius: '4px',
          minHeight: '120px',
          overflow: 'auto',
          fontSize: '0.8rem',
        }}
      >
        {log.length ? log.join('\n') : 'Waiting for events...'}
      </pre>

      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        Open DevTools → Network, filter for{' '}
        <code>edge-platform.sitecorecloud.io/events</code> to verify event
        requests.
      </p>
    </section>
  );
}