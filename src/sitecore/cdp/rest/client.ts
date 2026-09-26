const CDP_API_BASE_URL = 'https://api-engage-eu.sitecorecloud.io';

function getAuthHeader(): string {
  const clientKey = process.env.SITECORE_CDP_CLIENT_KEY;
  const apiToken = process.env.SITECORE_CDP_API_TOKEN;

  if (!clientKey || !apiToken) {
    throw new Error(
      'Missing SITECORE_CDP_CLIENT_KEY or SITECORE_CDP_API_TOKEN environment variables.'
    );
  }

  const credentials = Buffer.from(`${clientKey}:${apiToken}`).toString('base64');
  return `Basic ${credentials}`;
}

export interface GuestProfile {
  ref: string;
  guestType: 'visitor' | 'customer' | 'traveller';
  firstName?: string;
  lastName?: string;
  email?: string;
  identifiers?: Array<{ provider: string; id: string }>;
  segmentMemberships?: Array<{ name: string }>;
  traits?: {
    session?: Record<string, { name: string; value: unknown }>;
    profile?: Record<string, { name: string; value: unknown }>;
  };
  [key: string]: unknown;
}

async function getGuestRefByBrowserId(browserId: string): Promise<string | null> {
  const response = await fetch(
    `${CDP_API_BASE_URL}/v2/guestContexts?browserRef=${encodeURIComponent(browserId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(),
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CDP guest context lookup failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.ref ?? data.items?.[0]?.ref ?? null;
}

export async function getGuestByBrowserId(
  browserId: string
): Promise<GuestProfile | null> {
  const guestRef = await getGuestRefByBrowserId(browserId);

  if (!guestRef) {
    return null;
  }

  const response = await fetch(
    `${CDP_API_BASE_URL}/v2.1/guests/${guestRef}`,
    {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(),
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CDP guest lookup failed (${response.status}): ${text}`);
  }

  return (await response.json()) as GuestProfile;
}