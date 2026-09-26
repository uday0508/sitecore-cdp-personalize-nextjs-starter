import Link from 'next/link';
import { HeroSection } from '@/src/components/HeroSection';
import { EventDemoPanel } from '@/src/components/EventDemoPanel';

const demos = [
  {
    href: '/personalization',
    title: 'Client-Side Personalization',
    description:
      'Runs an Interactive Experience from the browser and renders the decision result in React.',
    tag: 'Interactive Experience',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/server-personalization',
    title: 'Server-Side Personalization',
    description:
      'Resolves the decision in Next.js Middleware before the page renders. No flicker.',
    tag: 'Middleware + SSR',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    href: '/session-traits',
    title: 'Session Traits',
    description:
      'Reads a value calculated at session end and stored on the guest profile.',
    tag: 'CDP Traits',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    href: '/guest-profile',
    title: 'CDP Guest Profile',
    description:
      'Fetches the full guest profile from the CDP Guest REST API using the browser ID.',
    tag: 'CDP REST API',
    tagColor: 'bg-orange-100 text-orange-700',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Sitecore CDP + Personalize Starter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            A Next.js App Router reference implementation for Sitecore CDP and
            Personalize, built on the Sitecore Cloud SDK.
          </p>
        </header>

        {/* Demo cards */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personalization Demos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 ${demo.tagColor}`}
                >
                  {demo.tag}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {demo.description}
                </p>
                <span className="inline-block mt-3 text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Web Experience target */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Web Experience Target
          </h2>
          <p className="text-sm text-gray-600 mb-4 max-w-2xl">
            This section is replaced in place by a live Web Experience. It
            renders a skeleton until Personalize injects the personalized HTML.
          </p>
          <HeroSection />
        </section>

        {/* Event collection */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            CDP Event Collection
          </h2>
          <EventDemoPanel />
        </section>
      </div>
    </main>
  );
}