import Link from 'next/link';
import { HeroSection } from '@/src/components/HeroSection';
import { EventDemoPanel } from '@/src/components/EventDemoPanel';

const demos = [
  {
    href: '/personalization',
    title: 'Client-Side Personalization',
    description: 'Interactive Experience from the browser.',
    tag: 'Interactive',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/server-personalization',
    title: 'Server-Side Personalization',
    description: 'Resolved in middleware before render.',
    tag: 'Middleware',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    href: '/session-traits',
    title: 'Session Traits',
    description: 'Reads a value calculated at session end.',
    tag: 'CDP Traits',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    href: '/guest-profile',
    title: 'CDP Guest Profile',
    description: 'Fetches guest profile from CDP REST API.',
    tag: 'CDP REST',
    tagColor: 'bg-orange-100 text-orange-700',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Sitecore CDP + Personalize Starter
            </h1>
            <p className="text-xs text-gray-500">
              Next.js App Router reference implementation
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">Cloud SDK</span>
            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">CDP</span>
            <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">Personalize</span>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Left column — demos + web experience */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Demos</h2>
            <div className="grid grid-cols-2 gap-2">
              {demos.map((demo) => (
                <Link
                  key={demo.href}
                  href={demo.href}
                  className="group relative flex flex-col bg-white rounded-md border border-gray-200 p-3 cursor-pointer hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span
                    className={`inline-block self-start text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-2 ${demo.tagColor}`}
                  >
                    {demo.tag}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-snug mb-3">
                    {demo.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-70 group-hover:opacity-100">
                    Open
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Web Experience Target
            </h2>
            <HeroSection />
          </section>
        </div>

        {/* Right column — events */}
        <div className="col-span-12 lg:col-span-7">
          <section className="bg-white rounded-lg border border-gray-200 p-4 h-full">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              CDP Event Collection
            </h2>
            <EventDemoPanel />
          </section>
        </div>
      </div>
    </div>
  );
}