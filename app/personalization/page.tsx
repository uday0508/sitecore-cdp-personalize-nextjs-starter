'use client';

import { useState } from 'react';
import { runInteractiveExperience } from '@/src/sitecore/personalize/interactive';

export default function PersonalizationPage() {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchExperience() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runInteractiveExperience({
        // Replace with your Interactive Experience friendly ID from Sitecore Personalize
        friendlyId: 'demo_interactive',
        channel: 'WEB',
        currency: 'USD',
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Personalize Interactive Experience</h1>
      <p>
        Runs a Sitecore Personalize Interactive Experience and displays the API response.
      </p>

      <button onClick={fetchExperience} disabled={loading}>
        {loading ? 'Loading…' : 'Run Experience'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {result !== null && (
        <pre
          style={{
            background: '#f4f4f4',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}