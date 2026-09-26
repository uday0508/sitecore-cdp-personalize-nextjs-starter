import { headers } from 'next/headers';
import Link from 'next/link';

interface DecisionResponse {
  persona?: string;
  message?: string;
  mostViewedCategory?: string;
  error?: string;
  [key: string]: unknown;
}

export default async function ServerPersonalizationPage() {
  const headersList = await headers();
  const header = headersList.get('x-personalize-result');

  let result: DecisionResponse | null = null;

  if (header) {
    try {
      result = JSON.parse(header) as DecisionResponse;
    } catch {
      result = null;
    }
  }

  if (result?.error) {
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
            Server-Side Personalization
          </h1>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Server-side personalization failed. Check the terminal for details.
          </div>
        </div>
      </main>
    );
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
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Server-Side Personalization
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This page is personalized in Next.js Middleware before rendering.
          The decision is resolved on the server, so the correct variant is
          present on the first paint. No client-side flicker.
        </p>

        {result?.mostViewedCategory && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-4">
            <span className="text-sm font-medium uppercase tracking-wide text-indigo-600">
              Most Viewed Category
            </span>
            <p className="text-2xl font-bold text-indigo-900">
              {result.mostViewedCategory}
            </p>
          </div>
        )}

        {result?.persona && (
          <div className={`p-4 border rounded-lg mb-4 ${getPersonaColor(result.persona)}`}>
            <span className="text-sm font-medium uppercase tracking-wide opacity-70">
              Persona
            </span>
            <p className="text-2xl font-bold">{result.persona}</p>
          </div>
        )}

        {result?.message && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <span className="text-sm font-medium uppercase tracking-wide text-blue-600">
              Message
            </span>
            <p className="text-xl text-blue-900">{result.message}</p>
          </div>
        )}

        {result && (
          <details className="bg-white border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
              Raw Response JSON
            </summary>
            <pre className="p-4 bg-gray-900 text-green-400 text-sm overflow-auto rounded-b-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}