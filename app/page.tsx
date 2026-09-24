import Link from 'next/link';
import { EventDemoPanel } from '@/src/components/EventDemoPanel';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sitecore CDP + Personalize Starter
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Browser-side event collection and Personalize decisioning via the Sitecore Cloud SDK.
        </p>

        <nav className="mb-8">
          <Link
            href="/personalization"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Personalization Demo →
          </Link>
        </nav>

        <EventDemoPanel />
      </div>
    </main>
  );
}