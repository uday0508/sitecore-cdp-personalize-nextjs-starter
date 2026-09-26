'use client';

const CONSENT_COOKIE = 'starter_consent';

export interface ConsentState {
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  personalization: false,
  marketing: false,
};

function parseConsent(value: string | undefined): ConsentState {
  if (!value) return DEFAULT_CONSENT;

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return {
      analytics: Boolean(parsed.analytics),
      personalization: Boolean(parsed.personalization),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function getConsent(): ConsentState {
  if (typeof document === 'undefined') return DEFAULT_CONSENT;

  const value = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.split('=')[1];

  return parseConsent(value);
}

export function setConsent(state: ConsentState): void {
  if (typeof document === 'undefined') return;

  const encoded = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent().analytics;
}

export function hasPersonalizationConsent(): boolean {
  return getConsent().personalization;
}