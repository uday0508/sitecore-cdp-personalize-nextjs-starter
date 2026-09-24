'use client';

import { useState } from 'react';

interface DecisionResult {
  content?: string;
  offer?: string;
  [key: string]: unknown;
}

export default function PersonalizationPage() {
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchDecision() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/personalize/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Replace with the friendlyId of your Interactive Experience
          friendlyId: 'your_interactive_experience_friendly_id',
          // browserId is read from the sc_ cookie set by the Cloud SDK.
          // In a real app, read it via a shared utility.
          browserId: document.cookie
            .split('; ')
            .find((c) => c.startsWith('sc_' + 'browser_id='))
            ?.split('=')[1],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Unknown error');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Personalize Decision Demo</h1>
      <p>
        This page calls a Next.js API route that executes a Sitecore
        Personalize Interactive Experience flow.
      </p>

      <button onClick={fetchDecision} disabled={loading}>
        {loading ? 'Loading…' : 'Fetch Decision'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {result && (
        <pre
          style={{
            background: '#f4f4f4',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}