import { NextRequest, NextResponse } from 'next/server';
import {
  executePersonalizeFlow,
  type FlowExecutionRequest,
} from '@/src/sitecore/personalize/decisioning/flow-execution';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FlowExecutionRequest;

    if (!body.friendlyId) {
      return NextResponse.json(
        { error: 'friendlyId is required' },
        { status: 400 }
      );
    }

    const result = await executePersonalizeFlow(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}