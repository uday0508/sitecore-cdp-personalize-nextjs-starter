export interface BaseEventData {
  channel: string;
  currency: string;
  pointOfSale: string;
  language: string;
  page: string;
}

export interface ViewEventData extends BaseEventData {
  // VIEW events can carry page-level context
  pageVariant?: string;
}

export interface IdentityEventData extends BaseEventData {
  email?: string;
  firstname?: string;
  lastname?: string;
  identifiers?: Array<{
    id: string;
    provider: string;
  }>;
}

export type ExtensionData = Record<string, string | number | boolean>;