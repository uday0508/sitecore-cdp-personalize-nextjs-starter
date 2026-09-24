'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Web personalizations run once on initial page load but do NOT rerun
 * automatically on client-side route changes in a Next.js SPA.
 *
 * This component triggers a rerun on every route change.
 * Documented API: window.scCloudSDK.personalize.triggerExperiences()
 * @see https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/web-personalization.html#rerunning-web-personalizations
 */
export function WebPersonalizationTrigger() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Ensure the global Sitecore object is attached to the window
    const cloudSDK = (window as any).scCloudSDK;

    if (cloudSDK?.personalize?.triggerExperiences) {
        console.log("triggerd");
      // 2. Trigger the web experiences for the new route
      cloudSDK.personalize.triggerExperiences();
    }
  }, [pathname]);

  return null;
}
