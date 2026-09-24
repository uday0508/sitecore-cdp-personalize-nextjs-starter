'use client';

import { useEffect, useRef } from 'react';
import { CloudSDK } from '@sitecore-cloudsdk/core/browser';
import '@sitecore-cloudsdk/events/browser';
import '@sitecore-cloudsdk/personalize/browser';

export function CloudSDKProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    CloudSDK({
      sitecoreEdgeContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID!,
      siteName: process.env.NEXT_PUBLIC_SITECORE_SITE_NAME!,
      enableBrowserCookie: true,
    })
      .addEvents()
      .addPersonalize({
        enablePersonalizeCookie: true,
        webPersonalization: true,
      })
      .initialize();
  }, []);

  return <>{children}</>;
}