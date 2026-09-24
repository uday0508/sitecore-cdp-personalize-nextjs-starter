// Matches official PageViewData interface from Cloud SDK docs
export interface ViewEventData {
  channel: string;
  currency: string;
  language: string;
  page: string;
  pageVariantId?: string;
  pointOfSale?: string;
}

// Matches official IdentityData interface
export interface IdentityEventData {
  channel?: string;
  currency?: string;
  language?: string;
  page?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  identifiers: Array<{
    id: string;
    provider: string;
  }>;
}

// Extension data: max 50 custom attributes
export type ExtensionData = Record<string, string | number | boolean>;