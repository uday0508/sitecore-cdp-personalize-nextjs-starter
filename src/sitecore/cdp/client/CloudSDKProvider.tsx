'use client';

import { useEffect, useRef } from 'react';
import { CloudSDK } from '@sitecore-cloudsdk/core/browser';
import '@sitecore-cloudsdk/events/browser';
import '@sitecore-cloudsdk/personalize/browser';
import { publicEnv } from '@/src/config/env';

export function CloudSDKProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    CloudSDK({
      sitecoreEdgeContextId: publicEnv.sitecoreEdgeContextId,
      siteName: publicEnv.sitecoreSiteName,
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