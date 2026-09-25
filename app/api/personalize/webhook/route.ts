// app/api/personalize/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const raw = await request.text();

  console.log('=== Personalize Webhook Received ===');
  console.log('Content-Type:', request.headers.get('content-type'));
  console.log('Raw body:', raw);
  console.log('=====================================');

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
  } catch {
    // FreeMarker was not resolved — this is expected during
    // the Connection test in Sitecore Personalize.
    console.log('Body is not JSON (expected during Connection test).');
  }

  return NextResponse.json({ status: 'received' }, { status: 200 });
}