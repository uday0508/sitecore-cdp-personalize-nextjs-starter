import Link from 'next/link';
import { EventDemoPanel } from '@/src/components/EventDemoPanel';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Sitecore CDP + Personalize Starter</h1>
      <p>
        This starter demonstrates browser-side event collection via the
        Sitecore Cloud SDK.
      </p>
      <nav style={{ marginBottom: '2rem' }}>
        <Link href="/personalization">Personalization Demo →</Link>
      </nav>
      <EventDemoPanel />
    </main>
  );
}