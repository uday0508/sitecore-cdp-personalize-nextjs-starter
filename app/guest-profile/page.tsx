'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GuestProfile {
  ref: string;
  guestType: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  identifiers?: Array<{ provider: string; id: string }>;
  segmentMemberships?: Array<{ name: string }>;
  traits?: {
    session?: Record<string, { name: string; value: unknown }>;
  };
  [key: string]: unknown;
}

export default function GuestProfilePage() {
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchGuest() {
    setLoading(true);
    setError(null);
    setGuest(null);

    try {
      // Read the browser ID from the sc_cid cookie set by the Cloud SDK
      const browserId = document.cookie
        .split('; ')
        .find((c) => c.startsWith('sc_cid='))
        ?.split('=')[1];

      if (!browserId) {
        throw new Error(
          'No sc_cid cookie found. Ensure the Cloud SDK has initialized.'
        );
      }

      const response = await fetch(
        `/api/cdp/guest?browserId=${encodeURIComponent(browserId)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Unknown error');
      }

      setGuest(data);
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
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          CDP Guest Profile
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Fetches the full guest profile from the CDP Guest REST API v2.1 using
          the browser ID from the <code className="bg-gray-100 px-1 rounded">sc_cid</code> cookie.
        </p>

        <button
          onClick={fetchGuest}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Loading…' : 'Load Guest Profile'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        {guest && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Guest Type
              </span>
              <p className="text-2xl font-bold text-gray-900">{guest.guestType}</p>
            </div>

            {guest.email && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Email
                </span>
                <p className="text-lg text-gray-900">{guest.email}</p>
              </div>
            )}

            {guest.segmentMemberships && guest.segmentMemberships.length > 0 && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Segments
                </span>
                <ul className="mt-2 space-y-1">
                  {guest.segmentMemberships.map((segment, i) => (
                    <li key={i} className="text-gray-900">
                      {segment.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <details className="bg-white border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
                Raw Guest JSON
              </summary>
              <pre className="p-4 bg-gray-900 text-green-400 text-sm overflow-auto rounded-b-lg max-h-[400px]">
                {JSON.stringify(guest, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}