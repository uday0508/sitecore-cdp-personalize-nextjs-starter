import type { Metadata } from 'next';
import './globals.css';
import { CloudSDKProvider } from '@/src/sitecore/cdp/client/CloudSDKProvider';
import { WebPersonalizationTrigger } from '@/src/components/WebPersonalizationTrigger';
import { ConsentBanner } from '@/src/components/ConsentBanner';

export const metadata: Metadata = {
  title: 'Sitecore CDP + Personalize Starter',
  description: 'Next.js App Router starter for Sitecore CDP and Personalize',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CloudSDKProvider>
          <WebPersonalizationTrigger />
          {children}
          <ConsentBanner />
        </CloudSDKProvider>
      </body>
    </html>
  );
}