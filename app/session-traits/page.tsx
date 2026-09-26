'use client';

import { useState } from 'react';
import Link from 'next/link';
import { runInteractiveExperience } from '@/src/sitecore/personalize/interactive';

interface SessionTraitsResponse {
  mostViewedCategory?: string;
  persona?: string;
  message?: string;
  [key: string]: unknown;
}

export default function SessionTraitsPage() {
  const [result, setResult] = useState<SessionTraitsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchTraits() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runInteractiveExperience({
        friendlyId: 'session_traits_demo',
        channel: 'WEB',
        currency: 'USD',
      });
      setResult(response as SessionTraitsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

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
          Session Traits Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Session Traits aggregate events from a web session, calculate a value
          at session end, and store it on the guest profile. This demo reads
          the stored trait value from an Interactive Experience.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Prerequisite:</strong> A Session Trait named{' '}
            <code className="bg-blue-100 px-1 rounded">MostViewedCategory</code>{' '}
            must be configured and activated in Sitecore CDP under{' '}
            <strong>Developer center → Session traits</strong>. The guest must
            be identified (a customer, not an anonymous visitor) for the trait
            to be calculated.
          </p>
        </div>

        <button
          onClick={fetchTraits}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Loading Traits…' : 'Load Session Traits'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            {result.mostViewedCategory && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-indigo-600">
                  Most Viewed Category
                </span>
                <p className="text-2xl font-bold text-indigo-900">
                  {result.mostViewedCategory}
                </p>
              </div>
            )}

            {result.persona && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-yellow-700">
                  Persona
                </span>
                <p className="text-2xl font-bold text-yellow-900">
                  {result.persona}
                </p>
              </div>
            )}

            {result.message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-green-700">
                  Message
                </span>
                <p className="text-xl text-green-900">{result.message}</p>
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