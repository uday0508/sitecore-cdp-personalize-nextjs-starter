import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    if (!request.nextUrl.pathname.startsWith('/server-personalization')) {
        return NextResponse.next();
    }

    if (request.headers.get('x-middleware-prefetch') === '1') {
        return NextResponse.next();
    }

    const response = NextResponse.next();

    const browserId = request.cookies.get('sc_cid')?.value;

    if (!browserId) {
        response.headers.set(
            'x-personalize-result',
            JSON.stringify({ error: 'no-browser-id' })
        );
        return response;
    }

    const payload = {
        clientKey: process.env.SITECORE_CDP_CLIENT_KEY!,
        channel: 'WEB',
        language: 'en',
        currencyCode: 'USD',
        pointOfSale: process.env.SITECORE_CDP_POINTOFSALE!,
        browserId,
        friendlyId: 'demo_interactive',
    };

    try {
        const personalizeResponse = await fetch('https://api.boxever.com/v2/callFlows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await personalizeResponse.json();
        response.headers.set('x-personalize-result', JSON.stringify(result));
    } catch (error) {
        console.error('Server-side personalization failed:', error);
        response.headers.set(
            'x-personalize-result',
            JSON.stringify({ error: 'personalization-failed' })
        );
    }

    return response;
}

export const config = {
    matcher: ['/server-personalization'],
};