import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the incoming payload so you can inspect it in your terminal
    console.log('=== Personalize Webhook Received ===');
    console.log(JSON.stringify(body, null, 2));
    console.log('=====================================');
    
    // Return a success response so Personalize knows the call worked
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('Webhook parse error:', error);
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }
}