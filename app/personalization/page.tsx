'use client';

import { useState } from 'react';
import Link from 'next/link';
import { runInteractiveExperience } from '@/src/sitecore/personalize/interactive';

interface DecisionResponse {
  persona?: string;
  message?: string;
  viewCount?: number;
  [key: string]: unknown;
}

export default function PersonalizationPage() {
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchExperience() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runInteractiveExperience({
        friendlyId: 'demo_interactive',
        channel: 'WEB',
        currency: 'USD',
      });
      setResult(response as DecisionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const getPersonaColor = (persona?: string) => {
    switch (persona) {
      case 'VIP':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Engaged':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Personalize Interactive Experience
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Runs a Sitecore Personalize Interactive Experience with Decision Model and displays the result.
        </p>

        <button
          onClick={fetchExperience}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Running Experience…' : 'Run Experience'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            {result.persona && (
              <div className={`p-4 border rounded-lg ${getPersonaColor(result.persona)}`}>
                <span className="text-sm font-medium uppercase tracking-wide opacity-70">
                  Persona
                </span>
                <p className="text-2xl font-bold">{result.persona}</p>
              </div>
            )}

            {result.message && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-blue-600">
                  Message
                </span>
                <p className="text-xl text-blue-900">{result.message}</p>
              </div>
            )}

            <details className="bg-white border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
                Raw Response JSON
              </summary>
              <pre className="p-4 bg-gray-900 text-green-400 text-sm overflow-auto rounded-b-lg">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}