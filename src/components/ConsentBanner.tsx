'use client';

import { useEffect, useState } from 'react';
import { getConsent, setConsent, type ConsentState } from '@/src/sitecore/consent';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ConsentState>({
    analytics: false,
    personalization: false,
    marketing: false,
  });

  useEffect(() => {
    const current = getConsent();
    const isUnset =
      !current.analytics && !current.personalization && !current.marketing;
    setVisible(isUnset);
    setState(current);
  }, []);

  function handleAccept() {
    const next = { analytics: true, personalization: true, marketing: true };
    setConsent(next);
    setState(next);
    setVisible(false);
  }

  function handleReject() {
    const next = { analytics: false, personalization: false, marketing: false };
    setConsent(next);
    setState(next);
    setVisible(false);
  }

  function handleCustom() {
    setConsent(state);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-5xl mx-auto p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <p className="text-sm text-gray-900 font-medium mb-1">
            We use cookies and personalization
          </p>
          <p className="text-xs text-gray-600">
            Sitecore CDP collects events to personalize your experience. Choose
            what you allow.
          </p>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={state.analytics}
                onChange={(e) =>
                  setState({ ...state, analytics: e.target.checked })
                }
              />
              Analytics
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={state.personalization}
                onChange={(e) =>
                  setState({ ...state, personalization: e.target.checked })
                }
              />
              Personalization
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={state.marketing}
                onChange={(e) =>
                  setState({ ...state, marketing: e.target.checked })
                }
              />
              Marketing
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reject all
          </button>
          <button
            onClick={handleCustom}
            className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
          >
            Save preferences
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}