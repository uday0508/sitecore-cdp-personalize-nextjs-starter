import { serverEnv } from '@/src/config/env';

export interface FlowExecutionRequest {
  friendlyId: string;
  browserId?: string;
  email?: string;
  identifiers?: Array<{ provider: string; id: string }>;
  params?: Record<string, string>;
}

export interface FlowExecutionResponse {
  // The response shape depends on the Personalize configuration.
  // Extract only the values your decision model returns.
  [key: string]: unknown;
}

export async function executePersonalizeFlow(
  request: FlowExecutionRequest
): Promise<FlowExecutionResponse> {
  const clientKey = serverEnv.personalizeClientKey();
  const pointOfSale = serverEnv.cdpPointOfSale();

  const identityPayload = request.browserId
    ? { browserId: request.browserId }
    : request.email
      ? { email: request.email }
      : request.identifiers
        ? { identifiers: request.identifiers }
        : {};

  const body = {
    clientKey,
    friendlyId: request.friendlyId,
    channel: 'WEB',
    language: 'EN',
    currencyCode: 'USD',
    pointOfSale,
    ...identityPayload,
    ...(request.params && { params: request.params }),
  };

  const response = await fetch('https://api.boxever.com/v2/callFlows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Personalize flow execution failed (${response.status}): ${text}`
    );
  }

  return response.json() as Promise<FlowExecutionResponse>;
}