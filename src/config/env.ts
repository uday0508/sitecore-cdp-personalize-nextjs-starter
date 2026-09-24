function requirePublicEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required public environment variable: ${key}. ` +
      `Copy .env.example to .env.local and fill in the values.`
    );
  }
  return value;
}

function requireServerEnv(key: string, value: string | undefined): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      `Server-only environment variable "${key}" was accessed in browser code. ` +
      `This is a security violation.`
    );
  }
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}.`);
  }
  return value;
}

export const publicEnv = {
  sitecoreEdgeContextId: requirePublicEnv(
    'NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID',
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID
  ),
  sitecoreSiteName: requirePublicEnv(
    'NEXT_PUBLIC_SITECORE_SITE_NAME',
    process.env.NEXT_PUBLIC_SITECORE_SITE_NAME
  ),
} as const;

export const serverEnv = {
  personalizeClientKey: () =>
    requireServerEnv(
      'SITECORE_PERSONALIZE_CLIENT_KEY',
      process.env.SITECORE_PERSONALIZE_CLIENT_KEY
    ),

  cdpPointOfSale: () =>
    requireServerEnv(
      'SITECORE_CDP_POINT_OF_SALE',
      process.env.SITECORE_CDP_POINT_OF_SALE
    ),
} as const;