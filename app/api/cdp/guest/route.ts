import { NextRequest, NextResponse } from 'next/server';
import { getGuestByBrowserId } from '@/src/sitecore/cdp/rest/client';

export async function GET(request: NextRequest) {
  const browserId = request.nextUrl.searchParams.get('browserId');

  if (!browserId) {
    return NextResponse.json(
      { error: 'browserId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const guest = await getGuestByBrowserId(browserId);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}