# Sitecore CDP + Personalize Next.js Starter

A community reference implementation showing how to integrate **Sitecore CDP** and **Sitecore Personalize** with a **Next.js App Router + TypeScript** application using the current Sitecore Cloud SDK.

This starter kit is intentionally focused. It demonstrates the documented integration boundaries between CDP and Personalize — nothing more, nothing less.

---

## Table of Contents

- [What This Starter Demonstrates](#what-this-starter-demonstrates)
- [What This Starter Does NOT Do](#what-this-starter-does-not-do)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [CDP Event Collection](#cdp-event-collection)
- [Consent Management](#consent-management)
- [Sitecore Personalize](#sitecore-personalize)
- [Decision Model Integration](#decision-model-integration)
- [Web Experience Integration](#web-experience-integration)
- [Server-Side Personalization](#server-side-personalization)
- [CDP REST API Integration](#cdp-rest-api-integration)
- [Triggered Experience Integration](#triggered-experience-integration)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)
- [Official Documentation References](#official-documentation-references)
- [Production Considerations](#production-considerations)

---

## What This Starter Demonstrates

### Sitecore CDP

- **Cloud SDK initialization** with `events` and `personalize` packages
- **VIEW event** using the documented `pageView()` function
- **IDENTITY event** using the documented `identity()` function
- **FORM event** using the dedicated `form(formId, interactionType, componentInstanceId)` function
- **ORDER_CHECKOUT event** using the `event()` function with a reserved event type
- **Custom events** with reserved-name guard for the `SC_` prefix
- **Event queue** for batching non-critical events
- **Extension data** attached to events (max 50 attributes)
- **Session Traits** read from the guest profile via `guest.traits.session.<friendlyId>.value`
- **CDP Guest REST API v2.1** with Basic Auth for server-side guest profile lookups

### Sitecore Personalize

- **Interactive Experience** execution via the browser-side `personalize()` function
- **Decision Model integration** returning computed persona values to Next.js
- **Programmable Decision** logic that runs inside Personalize (not in Next.js)
- **FreeMarker API Response** with `getDecisionModelResultNode()` for surfacing decision output
- **Web Experience** rendering via `webPersonalization: true` and the `hero-section` target
- **Triggered Experience** webhook destination via a Next.js API route
- **Server-side personalization** via the Personalize REST API and Next.js Middleware

### Next.js App Router

- Client-side SDK initialization via a single `<CloudSDKProvider />`
- Server-side personalization via Next.js Middleware
- Clean separation between browser code and server code
- Tailwind CSS v4 for UI
- Strict TypeScript with path aliases
- Flicker-free Web Experience target using a skeleton rendered once inside the target element
- Consent management with a banner and consent-gated event collection

---

## What This Starter Does NOT Do

- **Does not fake decisioning.** Decision Models and Programmable Decisions execute inside Sitecore Personalize. This starter does not reimplement them in Next.js.
- **Does not manage consent policy.** A consent mechanism is provided as a pattern, but the policy is yours.
- **Does not use the Engage SDK.** The Cloud SDK requires SitecoreAI. If your organization does not have SitecoreAI, use the Engage SDK instead.
- **Does not use the deprecated Boxever JavaScript library.** All Boxever Library templates in Personalize must be avoided.
- **Does not include a Decision Table example.** It is documented but not shipped as runnable code, because the table is configured in Personalize UI.

---

## Architecture

```
+------------------------------------------------------------+
| Browser                                                    |
|                                                            |
| 1. Cloud SDK initializes with Context ID + Site Name       |
| 2. Events (VIEW / IDENTITY / FORM / ORDER / custom) to CDP |
| 3. personalize() call sent to Sitecore Personalize         |
| 4. Web Experiences injected into .hero-section             |
|                                                            |
+-------------+--------------------------+-------------------+
              |                          |
              v                          v
    +-----------------+      +----------------------+
    | Sitecore CDP    |      | Sitecore Personalize |
    |                 |      |                      |
    | * Guest profile |      | * Interactive Exp.   |
    | * Identity      |<-----+ * Web Experience     |
    | * Events        |      | * Decision Model     |
    | * Segments      |      | * Programmable Dec.  |
    | * Session Traits|      | * Triggered Exp.     |
    +-----------------+      +----------+-----------+
              ^                         |
              |                         v
              |              +----------------------+
              |              | Next.js Middleware   |
              |              | / Server Routes      |
              +--------------| / Webhook Receiver   |
                             +----------------------+
```

### Responsibility Boundaries

| Layer | Runs Where | Responsibility |
|---|---|---|
| Cloud SDK | Browser | Event collection, cookies, client-side `personalize()` calls, Web Experience injection |
| Sitecore CDP | Sitecore Cloud | Guest profiles, identity resolution, segmentation, session traits |
| Sitecore Personalize | Sitecore Cloud | Decisioning, Interactive Experiences, Web Experiences, Triggered Experiences |
| Next.js Middleware | Server | Server-side personalization via REST API, cookie passthrough |
| Next.js API Routes | Server | CDP REST API proxy, webhook receiver |
| Next.js UI | Browser + Server | Rendering, integration boundaries |

---

## Prerequisites

- **Node.js 18+**
- **A Sitecore CDP tenant** with a valid Context ID
- **A Sitecore Personalize tenant** with at least one Interactive Experience, one Web Experience, and one Triggered Experience
- **SitecoreAI access** — the Cloud SDK only works for JSS Next.js apps hosted on SitecoreAI
- A browser with DevTools for validation

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sitecore-cdp-personalize-nextjs-starter
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values (see [Environment Variables](#environment-variables)).

### 3. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

The starter uses both browser-safe and server-only variables. Anything without the `NEXT_PUBLIC_` prefix stays on the server.

| Variable | Scope | Where to Find It |
|---|---|---|
| `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` | Browser | Sitecore CDP → Settings → API Access → Context ID |
| `NEXT_PUBLIC_SITECORE_SITE_NAME` | Browser | Sitecore CDP → Settings → Your configured site name |
| `NEXT_PUBLIC_CDP_POINTOFSALE` | Browser | Sitecore CDP → Settings → Points of Sale → Name |
| `SITECORE_CDP_CLIENT_KEY` | Server-only | Sitecore CDP → API Access → Client Key |
| `SITECORE_CDP_API_TOKEN` | Server-only | Sitecore CDP → API Access → API Token |

### Why Two Sets of Credentials?

The **Cloud SDK** uses the Context ID for browser-side initialization. It does not use a Client Key or Secret.

The **CDP Guest REST API** uses HTTP Basic Auth, where the username is the Client Key and the password is the API Token. These are server-only and must never be exposed to the browser.

If you add server-side personalization, you will also need the Personalize `clientKey`, but the starter calls the Personalize Flow Execution REST API directly, so no additional SDK configuration is required.

---

## CDP Event Collection

All event functions live in `src/sitecore/cdp/events/`.

### VIEW Events

```typescript
import { sendViewEvent } from '@/src/sitecore/cdp/events/view';

await sendViewEvent({
  channel: 'WEB',
  currency: 'USD',
  language: 'EN',
  page: 'home',
});
```

The `page` value is used by Personalize goals to attribute page views.

### IDENTITY Events

```typescript
import { sendIdentityEvent } from '@/src/sitecore/cdp/events/identity';

await sendIdentityEvent({
  channel: 'WEB',
  currency: 'USD',
  language: 'EN',
  page: 'home',
  email: 'user@example.com',
  identifiers: [{ id: 'user@example.com', provider: 'email' }],
});
```

The `identifiers` array is **required**. The `provider` value must exactly match an identity provider configured in Sitecore CDP.

### Custom Events

```typescript
import { sendCustomEvent } from '@/src/sitecore/cdp/events/custom';

await sendCustomEvent({
  type: 'starter:PRODUCT_INTERACTION',
  channel: 'WEB',
  currency: 'USD',
  language: 'EN',
  page: 'product',
  extensionData: { productId: 'demo-001', interactionType: 'view' },
});
```

Custom event types must not start with `SC_` — that prefix is reserved.

### FORM Events

```typescript
import { sendFormEvent } from '@/src/sitecore/cdp/events/form';

await sendFormEvent({
  formId: 'newsletter-signup',
  interactionType: 'SUBMITTED', // or 'VIEWED'
  componentInstanceId: 'demo-form-instance-001',
});
```

The `form()` function takes three positional arguments. It is not the same shape as `event()`.

### ORDER Events

```typescript
import { sendOrderCheckoutEvent } from '@/src/sitecore/cdp/events/order';

await sendOrderCheckoutEvent({
  channel: 'WEB',
  currency: 'USD',
  language: 'EN',
  page: 'checkout',
  orderId: 'ORD-DEMO-001',
  total: 249.99,
  lineItems: [
    { productId: 'demo-001', name: 'Demo Product', quantity: 1, price: 249.99, currency: 'USD' },
  ],
});
```

### Event Queue

```typescript
import { queueEvent, processQueue, discardQueue } from '@/src/sitecore/cdp/events/queue';

// Queue without sending
await queueEvent({ type: 'starter:ANALYTICS_PING', channel: 'WEB', /* ... */ });

// Send all queued events in order
await processQueue();

// Discard without sending (e.g., consent withdrawn)
await discardQueue();
```

Use the queue for non-critical events so they do not compete with primary events for network priority.

### Extension Data

Attach it as a property of the event data object:

```typescript
{
  type: 'starter:PRODUCT_INTERACTION',
  channel: 'WEB',
  extensionData: { productId: 'demo-001' },
}
```

Rules: maximum 50 custom attributes, flat values only.

---

## Consent Management

Consent is stored in a cookie and read before any event is sent. See `src/sitecore/consent/index.ts`.

```typescript
import { getConsent, setConsent, hasAnalyticsConsent } from '@/src/sitecore/consent';

if (hasAnalyticsConsent()) {
  await sendViewEvent(eventContext);
}
```

The `<ConsentBanner />` component in `src/components/ConsentBanner.tsx` is rendered in the root layout. It lets visitors accept, reject, or customize consent.

This is a **pattern demonstration**, not a full CMP. In production, replace it with your organization's consent management platform and sync the consent state to CDP as a guest data extension.

---

## Sitecore Personalize

### Interactive Experience

```typescript
import { runInteractiveExperience } from '@/src/sitecore/personalize/interactive';

const response = await runInteractiveExperience({
  friendlyId: 'demo_interactive',
  channel: 'WEB',
  currency: 'USD',
  pointOfSale: 'honda-mideast',
});
```

The `friendlyId` is found in the Interactive Experience UI under **Details → Friendly ID**. The `pointOfSale` must match a Point of Sale configured in your CDP tenant.

### Web Experience

Web Experiences are enabled via `webPersonalization: true` during SDK initialization. They run automatically. To rerun after route changes:

```typescript
window.scCloudSDK.personalize.triggerExperiences();
```

The `triggerExperiences` function is not exported from `@sitecore-cloudsdk/personalize`. It is injected onto `window.scCloudSDK.personalize` after the SDK initializes.

### Web vs Interactive vs Triggered

| Feature | Web Experience | Interactive Experience | Triggered Experience |
|---|---|---|---|
| Configured by | Marketers | Developers | Marketers / Developers |
| Delivery | Injected `<script>` + DOM | JSON API response | HTTP webhook |
| Rendering | Client-side DOM | Your React components | External system |
| Flicker risk | Yes | No | Not applicable |
| Best for | Overlays, banners | Primary content | Email, SMS, push |

---

## Decision Model Integration

**CDP collects events → Personalize evaluates guest data → Decision Model returns a value → API Response surfaces it as JSON → Next.js renders.**

### Step 1: Create a Programmable Decision

In Sitecore Personalize → Decisioning → **Create Decision Model**. Add a Programmable Decision with an output reference (no spaces).

```javascript
(function () {
    var viewCount = 0;
    if (guest.sessions && guest.sessions.length > 0) {
        var session = guest.sessions[0];
        if (session.events) {
            for (var j = 0; j < session.events.length; j++) {
                if (session.events[j].type === 'VIEW') viewCount++;
            }
        }
    }
    if (viewCount >= 5) return 'VIP';
    if (viewCount >= 2) return 'Engaged';
    return 'New Visitor';
})();
```

### Step 2: Publish to Production

In the Decision Model's **Build** view, drag the variant from **Draft** to **Production**. Only Production variants execute.

### Step 3: Attach to the Experience

In the Interactive Experience, scroll to **Decisioning** and attach the model.

### Step 4: Write the API Response

The verified FreeMarker pattern:

```freemarker
<#assign personaNode = getDecisionModelResultNode("Calculate Persona")>
{
  <#if (personaNode)??>
  "persona": "${personaNode.outputs[0].CalculatePersona}",
  "message": "<#if personaNode.outputs[0].CalculatePersona == "VIP">Welcome back, valued customer!<#elseif personaNode.outputs[0].CalculatePersona == "Engaged">Great to see you again!<#else>Welcome to our site!</#if>"
  <#else>
  "persona": "New Visitor",
  "message": "Welcome to our site!"
  </#if>
}
```

**Key rules:**

- `getDecisionModelResultNode("...")` uses the node **name** (may contain spaces)
- The output is accessed via `.outputs[0].<OutputReference>` using the output reference (no spaces)
- Wrap the node access in `<#if (node)??>` to avoid null errors
- Use `<#if>` blocks, not nested ternaries with quotes
- The correct closing tag is `</#if>` — slash before hash

### Step 5: Save Before Previewing

If the yellow banner says **"Your variant has changes, make sure to save before testing"**, Preview will test the saved version. Click **Save** first.

### Step 6: Start the Experience

Click **Start**. The status must be **LIVE**.

---

## Web Experience Integration

### The Flicker Problem

Web Experiences inject content **after** the browser paints the page. In a React app, this causes a visible swap from default to personalized content.

### The Flicker-Free Pattern

Render the skeleton **once, inside** the target element. Do not use `useState`, `useEffect`, or conditional rendering on this component. React mounts it once and never touches it again.

### `src/components/HeroSection.tsx`

```tsx
export function HeroSection() {
  return (
    <section
      id="hero-skeleton"
      className="hero-section bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 min-h-[200px]"
    >
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </section>
  );
}
```

### Personalize Variant Configuration

**HTML tab:**
```html
<section class="hero-section bg-yellow-50 rounded-xl border border-yellow-200 p-8 mb-8">
  <h2 class="text-3xl font-bold text-yellow-800 mb-2">Welcome, {{persona}}!</h2>
  <p class="text-yellow-700">{{message}}</p>
</section>
```

**JavaScript tab:**
```javascript
replaceHTMLExact('.hero-section');
```

Use the **selector string**, not a DOM element.

---

## Server-Side Personalization

Server-side personalization resolves the decision **before** the page renders, so there is no flicker and no client-side fetch.

### Approach: Next.js Middleware + Personalize REST API

The Cloud SDK's server-side `personalize()` function does not accept a configurable `pointOfSale` in the `ServerSettings` type, and it strips the value from the request. The reliable path is to call the Personalize Flow Execution REST API directly.

### `middleware.ts`

```typescript
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
    response.headers.set('x-personalize-result', JSON.stringify({ error: 'no-browser-id' }));
    return response;
  }

  const payload = {
    clientKey: process.env.SITECORE_CDP_CLIENT_KEY!,
    channel: 'WEB',
    language: 'en',
    currencyCode: 'USD',
    pointOfSale: process.env.NEXT_PUBLIC_CDP_POINTOFSALE!,
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
    response.headers.set('x-personalize-result', JSON.stringify({ error: 'personalization-failed' }));
  }

  return response;
}

export const config = {
  matcher: ['/server-personalization'],
};
```

The page reads the result from the response header. See `app/server-personalization/page.tsx`.

---

## CDP REST API Integration

Server-side guest profile lookup via the CDP Guest REST API v2.1.

### Authentication

CDP uses HTTP Basic Auth:
- Username = `SITECORE_CDP_CLIENT_KEY`
- Password = `SITECORE_CDP_API_TOKEN`

### Browser ID → Guest Ref → Guest Profile

The Guest REST API does **not** accept `browserRef` as a query parameter. Two steps are required:

1. Look up the guest reference via `GET /v2/guestContexts?browserRef=<id>`
2. Retrieve the full profile via `GET /v2.1/guests/<ref>`

See `src/sitecore/cdp/rest/client.ts` for the implementation.

### API Route

`app/api/cdp/guest/route.ts` wraps the client and accepts `?browserId=<value>`. The UI page at `/guest-profile` reads the `sc_cid` cookie and calls the route.

---

## Triggered Experience Integration

Triggered Experiences send personalized content to external destinations via HTTP webhooks. The only code contribution from Next.js is:

1. A **custom event** that fires the trigger (already in `src/sitecore/cdp/events/custom.ts`).
2. A **webhook receiver** to inspect the outgoing payload.

### The Test Webhook Endpoint

`app/api/personalize/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  console.log('Raw body:', raw);

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Connection test sends literal FreeMarker — not valid JSON
  }

  return NextResponse.json({ status: 'received' }, { status: 200 });
}
```

### Why the Endpoint Accepts Non-JSON

The **Connection test** in Sitecore Personalize sends the request body **without resolving FreeMarker**. The body contains literal `${guest.ref}` syntax. Using `request.text()` instead of `request.json()` lets the test pass and still logs the resolved payload when a real experience runs.

### Sample Webhook Payload

```json
{
  "guestId": "${guest.ref}",
  "email": "${guest.email!}",
  "persona": "${getDecisionModelResultNode("Calculate Persona").outputs[0].CalculatePersona!\"Visitor\"}",
  "message": "<#if getDecisionModelResultNode("Calculate Persona").outputs[0].CalculatePersona == "VIP">Welcome back, valued customer!<#else>Welcome to our site!</#if>",
  "eventType": "${event.type!}",
  "timestamp": "${.now?string('yyyy-MM-dd HH:mm:ss')}"
}
```

Keep every FreeMarker expression on one line. Do not let the editor wrap a string across lines.

### The Connection vs the Webhook Composer

| Where | What Goes There |
|---|---|
| **Connection** | Only HTTP plumbing: URL, method, headers, auth. No personalized payload. |
| **Triggered Experience Webhook Composer** | The full FreeMarker payload with `${guest.ref}`, `getDecisionModelResultNode(...)`, etc. |

The Connection test only verifies the HTTP config. It does not run the decision model.

---

## Validation

### Verify CDP Event Collection

1. Open DevTools → **Network**
2. Filter for `edge-platform.sitecorecloud.io/events`
3. Click a button in the Event Demo Panel
4. You should see a `POST` request with status `200 OK`

**Cookies to check:**

| Cookie | Purpose |
|---|---|
| `sc_cid` | Browser ID — used by CDP |
| `sc_cid_personalize` | Personalize guest ID |

### Verify Personalize Decisioning

1. Navigate to `/personalization`
2. Click **Run Experience**
3. The persona badge and message should appear

### Verify Web Experience

1. Start the Web Experience in Personalize
2. Open the home page
3. `.hero-section` should show the skeleton, then the personalized content

### Verify Server-Side Personalization

1. Navigate to `/server-personalization`
2. The result is present on first paint — view source to confirm

### Verify CDP REST API

1. Navigate to `/guest-profile`
2. Click **Load Guest Profile**
3. The guest type, email, and segments should appear

### Verify Triggered Experience

1. Start the Triggered Experience in Personalize
2. Fire the custom event from the app
3. Check Vercel function logs for the parsed payload

---

## Troubleshooting

### Event not appearing in CDP

- Verify `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` matches the CDP instance
- Check the Network tab for failed requests
- Confirm the `sc_cid` cookie exists
- Ensure the SDK initialized (no console errors)

### `Could not find browser with ref <uuid> for client <key>`

Browser ID and client key belong to **different CDP instances**. Clear `sc_cid` and `sc_cid_personalize` cookies, restart the app, and reload.

### `The request contains invalid point of sale ""`

The `pointOfSale` is missing from the `personalizeData` object. Add it:

```typescript
await runInteractiveExperience({
  friendlyId: 'demo_interactive',
  channel: 'WEB',
  currency: 'USD',
  pointOfSale: process.env.NEXT_PUBLIC_CDP_POINTOFSALE || 'honda-mideast',
});
```

Valid values are configured in your CDP tenant. Check the error message for the list.

### `segmentMemberships` is undefined

Segments populate via the **nightly processing service at 00:00 UTC**. For testing without segments, use session-based logic.

### Session Traits not showing on guest profile

Three conditions must all be met:

1. Guest is `customer`, not `visitor`
2. Session status is `Closed` — traits run at session end
3. Session trait is `Active`, not Draft

Check the **Activity tab** of the session trait in CDP to see execution status.

### `traits` not showing in Decision Table input picker

The picker only shows attributes that **exist on the current guest context**. The `traits.session` node appears only after a session trait has been calculated and stored. Until then, use a Script input that reads `guest.traits.session.<friendlyId>.value` with a fallback.

### `Templating transformation failed`

FreeMarker could not compile the API Response. Common causes:

- Referencing a field that does not exist
- **Unclosed `#if`** — the correct closing tag is `</#if>` (slash before hash)
- Missing closing quotes in JSON strings
- **Unsaved variant** — click Save before Preview

### `getDecisionModelResultNode(...) evaluated to null or missing`

| Cause | Fix |
|---|---|
| Experience is Paused or Draft | Click Start |
| Decision model variant is not in Production | Drag variant to Production |
| Decision model not attached | Attach in Decisioning section |
| Wrong node name | Use the **node name**, not the output reference |
| Wrong output access | Use `.outputs[0].CalculatePersona` |
| Wrong session trait case | Use the **friendlyId** (lowercase), not the display name |

### `[object HTMLElement] is not a valid selector`

`replaceHTMLExact` expects a CSS selector string, not a DOM element:

```javascript
replaceHTMLExact('.hero-section');
```

### Webhook returns 400 during Connection test

The Connection test sends the body without resolving FreeMarker. Use `request.text()` instead of `request.json()`, and always return 200.

### `SyntaxError: Expected property name or '}' in JSON at position N`

Same cause as above. See the webhook fix.

### Web Experience flickers

The skeleton must be rendered **inside** the target element, and the component must not re-render. See [Web Experience Integration](#web-experience-integration).

---

## Official Documentation References

| Topic | Source |
|---|---|
| Cloud SDK overview | `doc.sitecore.com/sdk/` |
| `@sitecore-cloudsdk/core` | `doc.sitecore.com/sdk/.../cloud-sdk-core.html` |
| `@sitecore-cloudsdk/events` | `doc.sitecore.com/sdk/.../cloud-sdk-events.html` |
| `@sitecore-cloudsdk/personalize` | `doc.sitecore.com/sdk/.../cloud-sdk-personalize.html` |
| Event data interfaces | `doc.sitecore.com/sdk/.../cloud-sdk-events-eventdata.html` |
| Page view data interface | `doc.sitecore.com/sdk/.../cloud-sdk-events-pageviewdata.html` |
| Identity data interface | `doc.sitecore.com/sdk/.../cloud-sdk-events-identitydata.html` |
| Interactive personalization setup | `doc.sitecore.com/sdk/.../set-up-interactive-personalization.html` |
| Web personalization setup | `doc.sitecore.com/sdk/.../set-up-web-personalization.html` |
| Rerunning web personalizations | `doc.sitecore.com/sdk/.../web-personalization.html#rerunning-web-personalizations` |
| Decision models | `doc.sitecore.com/personalize/.../decision-models.html` |
| Programmable decisions | `doc.sitecore.com/personalize/.../programmable-decisions.html` |
| FreeMarker in API responses | `doc.sitecore.com/personalize/.../freemarker.html` |
| Using dynamic decision model data | `doc.sitecore.com/personalize/.../use-dynamic-decision-model-data.html` |
| Web Experience rendering APIs | `doc.sitecore.com/personalize/.../web-experience-apis.html` |
| Triggered Experiences | `doc.sitecore.com/personalize/.../triggered-experiences.html` |
| Connections and destinations | `doc.sitecore.com/personalize/.../connections.html` |
| Session traits | `doc.sitecore.com/personalize/.../defining-storing-and-accessing-session-traits.html` |
| Decision tables | `doc.sitecore.com/personalize/.../decision-tables.html` |
| CDP Guest REST API | `doc.sitecore.com/cdp/.../guest-api.html` |
| CDP identity resolution | `doc.sitecore.com/cdp/.../identity-resolution.html` |
| CDP segments | `doc.sitecore.com/cdp/.../segments.html` |

---

## Production Considerations

This is a **reference implementation**, not a production-ready application.

### Configuration

- Move away from `.env.local`. Use a platform secret manager.
- Separate environments. Use different Context IDs per environment.
- Never commit `.env.local`.

### Consent

- The consent banner is a pattern. Replace it with your organization's CMP.
- Sync consent state to CDP as a guest data extension.

### Identity Strategy

- Decide when IDENTITY events fire (login, checkout, signup).
- Map internal user IDs to CDP `provider` values.
- Test identity resolution against the sandbox before production.

### Error Handling

- Wrap event functions and REST calls in `try/catch` at the call site.
- Do not let CDP failures break the user experience.

### Observability

- Log CDP event failures with `type` and browser ID.
- Monitor Personalize flow execution latency.
- Alert on repeated `No flow executed` responses.
- Monitor webhook endpoints for 4xx and 5xx.

### Performance

- The Cloud SDK loads asynchronously. Ensure critical UI renders independently.
- Web Experiences flicker because the DOM is mutated after paint. Use the skeleton pattern documented above.
- Interactive Experiences do not flicker — prefer them for primary content.
- Server-side personalization via middleware adds latency to every matched route. Scope the matcher carefully.

### Security

- The Context ID is public by design.
- Never expose `SITECORE_CDP_CLIENT_KEY` or `SITECORE_CDP_API_TOKEN` in `NEXT_PUBLIC_*` variables.
- Webhook endpoints must verify incoming requests in production. The test endpoint in this starter is unauthenticated for local development.

### Sitecore Environment Configuration

Configured in Sitecore, not in this repo:

- Identity rules (CDP → Settings → Identity Rules)
- Segments (CDP → Batch segments)
- Session Traits (CDP → Developer center → Session traits)
- Decision Models, Programmable Decisions, Decision Tables (Personalize → Decisioning)
- Interactive Experiences and their API Responses (Personalize → Experiences)
- Web Experiences and their variants (Personalize → Experiences)
- Triggered Experiences, Connections, Triggers (Personalize → Experiences, Developer Center → Connections)
- Goals for each experience

---

## License

MIT

---

## Contributing

Issues and pull requests are welcome. If you find an inaccuracy against the current Sitecore documentation, please open an issue with a link to the relevant `doc.sitecore.com` page.
