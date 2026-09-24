// src/sitecore/cdp/events/types.ts

// VERIFIED: https://doc.sitecore.com/sdk/en/developers/006/cloud-sdk/cloud-sdk-events-identitydata.html
export interface Identifier {
  id: string;
  provider: string;
  expiryDate?: string;
}

export interface EventAttributesInput {
  language?: string;
  page?: string;
  channel?: string;
  currency?: string;
}

export interface IdentityData extends EventAttributesInput {
  identifiers: Identifier[];
  email?: string;
  firstName?: string;
  lastName?: string;
  extensionData?: ExtensionData;
}

export type ExtensionData = Record<string, string | number | boolean>;