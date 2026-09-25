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
- [Sitecore Personalize](#sitecore-personalize)
- [Decision Model Integration](#decision-model-integration)
- [Web Experience Integration](#web-experience-integration)
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
- **Custom events** using the documented `event()` function with reserved-name guard
- **Extension data** attached to events (max 50 attributes)

### Sitecore Personalize

- **Interactive Experience** execution via the browser-side `personalize()` function
- **Decision Model integration** returning computed persona values to Next.js
- **Programmable Decision** logic that runs inside Personalize (not in Next.js)
- **FreeMarker API Response** with `getDecisionModelResultNode()` for surfacing decision output
- **Web Experience** rendering via `webPersonalization: true` and the `hero-section` target
- **Triggered Experience** webhook destination via a Next.js API route

### Next.js App Router

- Client-side SDK initialization via a single `<CloudSDKProvider />`
- Clean separation between browser code and server code
- Tailwind CSS v4 for UI
- Strict TypeScript with path aliases
- Flicker-free Web Experience target using a skeleton rendered once inside the target element
- A test webhook endpoint for inspecting Triggered Experience payloads

---

## What This Starter Does NOT Do

- **Does not fake decisioning.** Decision Models and Programmable Decisions execute inside Sitecore Personalize. This starter does not reimplement them in Next.js.
- **Does not cover server-side event tracking.** The Cloud SDK supports it, but this starter is browser-only to keep the secret boundary simple.
- **Does not manage consent.** Consent handling is your application's responsibility.
- **Does not use the Engage SDK.** The Cloud SDK requires SitecoreAI. If your organization does not have SitecoreAI, use the Engage SDK instead.
- **Does not use the deprecated Boxever JavaScript library.** All Boxever Library templates in Personalize must be avoided.

---

## Architecture

```
+------------------------------------------------------------+
| Browser                                                    |
|                                                            |
| 1. Cloud SDK initializes with Context ID + Site Name       |
| 2. Events (VIEW / IDENTITY / custom) sent to CDP           |
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
    +-----------------+      | * Triggered Exp.     |
              ^              +----------+-----------+
              |                         |
              |                         v
              |              +----------------------+
              |              | Next.js Webhook      |
              +--------------| /api/personalize/    |
                             | webhook              |
                             +----------------------+
```

### Responsibility Boundaries

| Layer | Runs Where | Responsibility |
|---|---|---|
| Cloud SDK | Browser | Event collection, cookies, `personalize()` calls, Web Experience injection |
| Sitecore CDP | Sitecore Cloud | Guest profiles, identity resolution, segmentation |
| Sitecore Personalize | Sitecore Cloud | Decisioning, Interactive Experiences, Web Experiences, Triggered Experiences |
| Next.js | Browser + Server | UI rendering, integration boundaries, route handlers, webhook receiver |

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

This starter requires only **two** environment variables. Both are browser-safe because the Cloud SDK does not use secrets for browser-side event collection.

| Variable | Scope | Where to Find It |
|---|---|---|
| `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` | Browser | Sitecore CDP → Settings → API Access → Context ID |
| `NEXT_PUBLIC_SITECORE_SITE_NAME` | Browser | Sitecore CDP → Settings → Your configured site name |

### Why No Client Key or Secret?

The **Cloud SDK uses only the Context ID** for browser-side initialization. Client Keys and Secrets are used by the **Stream API** (direct HTTP integration) or **server-side APIs** — those are different integration paths.

If you later add server-side personalization, you will need a Personalize Client Key, but that is out of scope for this starter.

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

The `page` value is used by Personalize goals to attribute page views. Keep it consistent.

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

The `identifiers` array is **required** for identity resolution. The `provider` value must exactly match an identity provider configured in Sitecore CDP (Settings → Identity Rules).

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

Custom event types must **not** start with `SC_` — that prefix is reserved by Sitecore CDP.

### Extension Data

Extension data is attached as a property of the event data object:

```typescript
{
  type: 'starter:PRODUCT_INTERACTION',
  channel: 'WEB',
  // ...
  extensionData: { productId: 'demo-001' },
}
```

Rules:
- **Maximum 50 custom attributes** per event
- Values must be flat (no nested objects)
- Available in Personalize after the event is stored

---

## Sitecore Personalize

### Interactive Experience

This starter calls an Interactive Experience via the browser-side `personalize()` function:

```typescript
import { runInteractiveExperience } from '@/src/sitecore/personalize/interactive';

const response = await runInteractiveExperience({
  friendlyId: 'demo_interactive',
  channel: 'WEB',
  currency: 'USD',
});
```

The `friendlyId` is found in the Interactive Experience UI under **Details → Friendly ID**.

### Web Experience

Web Experiences are enabled automatically via `webPersonalization: true` during SDK initialization. You do not call a function for them.

To rerun web personalizations after a client-side route change in the Next.js App Router:

```typescript
window.scCloudSDK.personalize.triggerExperiences();
```

**Note:** `triggerExperiences` is not exported from `@sitecore-cloudsdk/personalize`. It is injected onto `window.scCloudSDK.personalize` after the Cloud SDK initializes. Access it via `window`, not via import.

### Triggered Experience

Triggered Experiences send personalized content to **external destinations** (ESP, SMS, Push provider) via HTTP webhooks. They are configured entirely in Sitecore Personalize — no rendering happens in the browser.

The flow:

1. Create a **Connection** in Personalize pointing to an external endpoint.
2. Create a **Triggered Experience** with the webhook body composed via FreeMarker.
3. Add a **Trigger** — a Standard event (Guest Created, Order Created, Session Closed) or a Custom event that matches a `type` you send from your application.
4. Set the experience to **Live**.

Your Next.js application does not render the Triggered Experience. It only fires the custom event that triggers it. The payload is delivered to the external endpoint.

### Web Experience vs Interactive Experience vs Triggered Experience

| Feature | Web Experience | Interactive Experience | Triggered Experience |
|---|---|---|---|
| Configured by | Marketers | Developers | Marketers / Developers |
| Delivery | Injected `<script>` + DOM replacement | JSON API response | HTTP webhook to external destination |
| Rendering | Client-side DOM injection | Your React components | External system |
| Flicker risk | Yes — architectural | No | Not applicable |
| Best for | Marketing overlays, banners, popups | Structured personalization, primary content | Email, SMS, push, external systems |

---

## Decision Model Integration

**CDP collects events → Personalize evaluates guest data → Decision Model returns a value → API Response surfaces it as JSON → Next.js renders based on the result.**

### Step 1: Create a Decision Model in Personalize

In Sitecore Personalize → Decisioning → **Create Decision Model**.

Add a **Programmable Decision** with an output reference (e.g., `CalculatePersona`). The output reference **must not contain spaces**.

Example programmable decision:

```javascript
(function () {
    var viewCount = 0;
    if (guest.sessions && guest.sessions.length > 0) {
        var session = guest.sessions[0];
        if (session.events) {
            for (var j = 0; j < session.events.length; j++) {
                if (session.events[j].type === 'VIEW') {
                    viewCount++;
                }
            }
        }
    }

    if (viewCount >= 5) return 'VIP';
    if (viewCount >= 2) return 'Engaged';
    return 'New Visitor';
})();
```

### Step 2: Publish the Variant to Production

In the Decision Model's **Build** view, drag the variant from **Draft** to the **Production** column. Only Production variants execute at runtime.

> Draft, Test, and Paused variants do not execute. This is the single most common cause of `null` decision outputs.

### Step 3: Connect the Decision Model to the Experience

In your Interactive Experience, scroll to **Decisioning** and attach the Decision Model. Confirm the green checkmark appears.

### Step 4: Write the API Response

Use the verified FreeMarker pattern. The function `getDecisionModelResultNode()` takes the **node name**, and the output value is accessed via `.outputs[0].<OutputReference>`:

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

- `getDecisionModelResultNode("...")` uses the **node name** (may contain spaces)
- The output is accessed via `.outputs[0].CalculatePersona` using the **output reference** (no spaces)
- Always wrap the node access in `<#if (node)??>` to avoid null errors
- Use `<#if>` blocks instead of nested ternaries with quotes

### Step 5: Save the Variant Before Previewing

The API Response editor has its own save action. If the yellow banner says **"Your variant has changes, make sure to save before testing"**, Preview API will test the **saved** version, not the version you typed. Click **Save** first, then Preview.

### Step 6: Make the Experience Live

Click **Start** in the top right. The status must be **LIVE**. Paused or Draft experiences will not execute.

---

## Web Experience Integration

### The Flicker Problem

Web Experiences inject content **after** the browser has painted the page. In a Next.js App Router app, this causes a visible swap: default content → personalized content.

The cause is that React re-renders the target element, overwriting whatever Personalize injected.

### The Flicker-Free Pattern

Render the skeleton **once, inside** the target element. Do not use `useState`, `useEffect`, or conditional rendering on this component. React mounts it once and never touches it again. Personalize replaces the inner content via `replaceHTMLExact`.

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

### Why This Works

- **No state, no `useEffect`, no conditional render.** React cannot wipe Personalize's injected content because React never touches the element again after mount.
- **The skeleton lives inside `.hero-section`.** Personalize replaces the skeleton in place.
- **No default text is ever rendered.** The user sees the skeleton, then the personalized content. There is no third state.
- **If Personalize does not run**, the skeleton remains. That is a deliberate choice — visible feedback that the section is a personalization target.

### Personalize Variant Configuration

**HTML tab:**

```html
<section class="hero-section bg-yellow-50 rounded-xl border border-yellow-200 p-8 mb-8">
  <h2 class="text-3xl font-bold text-yellow-800 mb-2">
    Welcome, {{persona}}!
  </h2>
  <p class="text-yellow-700">{{message}}</p>
</section>
```

**JavaScript tab:**

```javascript
replaceHTMLExact('.hero-section');
```

Use the **selector string**, not a DOM element. The method signature is `replaceHTMLExact(selector, htmlContent?)` — the first argument must be a string.

**API tab:**

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

### Rerunning Web Personalizations on Route Changes

Add `src/components/WebPersonalizationTrigger.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function WebPersonalizationTrigger() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.scCloudSDK?.personalize?.triggerExperiences
    ) {
      window.scCloudSDK.personalize.triggerExperiences();
    }
  }, [pathname]);

  return null;
}
```

Include it in `app/layout.tsx` inside `<CloudSDKProvider>`.

---

## Triggered Experience Integration

Triggered Experiences are configured entirely in Sitecore Personalize. The only code contribution from your Next.js application is:

1. A **custom event** that fires the trigger (already implemented in `src/sitecore/cdp/events/custom.ts`).
2. A **webhook receiver** endpoint to inspect the outgoing payload during development.

### The Test Webhook Endpoint

Add `app/api/personalize/webhook/route.ts`:

```typescript
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
```

### Why the Endpoint Accepts Non-JSON

When you test the **Connection** in the Sitecore Personalize editor, the request body is sent **without FreeMarker resolution**. The body contains literal template syntax like `${guest.ref}` which is not valid JSON.

`request.json()` would throw and cause the test to fail. Using `request.text()` and attempting to parse inside a `try/catch` allows the connection test to succeed while still logging the resolved payload when a real experience runs.

### Connecting the Webhook to Personalize

1. **Deploy the Next.js app** so the endpoint is publicly reachable (Vercel, or `npx localtunnel --port 3000` for local).
2. In Sitecore Personalize, go to **Developer Center > Connections** and create a **Destination**.
3. Set **Request URL** to your endpoint (e.g., `https://your-app.vercel.app/api/personalize/webhook`).
4. Set **Content-Type** to `application/json`.
5. In the **Request** body, compose the FreeMarker payload (see below).
6. Click **Test Request** — the connection test sends the raw template and expects a 2xx response.

### Sample Webhook Payload

```json
{
  "guestId": "${guest.ref}",
  "email": "${guest.email!}",
  "firstName": "${guest.firstName!}",
  "persona": "${getDecisionModelResultNode("Calculate Persona").outputs[0].CalculatePersona!\"Visitor\"}",
  "message": "<#if getDecisionModelResultNode("Calculate Persona").outputs[0].CalculatePersona == "VIP">Welcome back, valued customer!<#else>Welcome to our site!</#if>",
  "eventType": "${event.type!}",
  "timestamp": "${.now?string('yyyy-MM-dd HH:mm:ss')}"
}
```

Keep every FreeMarker expression on a single line. If the editor wraps a string across lines, the JSON will be invalid and the connection test will fail.

### Adding the Trigger

In the Triggered Experience:

1. Click **Add trigger**.
2. Choose **Custom**.
3. Set **Event Name** to the exact `type` your app sends — for example, `starter:PRODUCT_INTERACTION`.
4. Set **Event Identifier** to `Equals` with the same value.
5. Save and set the experience to **Live**.

### Testing the Triggered Experience End-to-End

1. Start the Next.js app.
2. Click **Send Custom Event** in the Event Demo Panel.
3. The custom event reaches CDP, which fires the trigger.
4. Personalize resolves the FreeMarker and sends the real JSON to your webhook.
5. Check your Next.js terminal or Vercel function logs to inspect the payload.

The Connection test shows literal template strings; the live trigger shows resolved values. That difference is expected.

---

## Validation

### Verify CDP Event Collection

1. Open DevTools → **Network** tab
2. Filter for `edge-platform.sitecorecloud.io/events`
3. Click a button in the Event Demo Panel
4. You should see a `POST` request with status `200 OK`

**Verify the browser ID cookie:**

Open DevTools → **Application** → **Cookies**:

| Cookie | Purpose |
|---|---|
| `sc_cid` | Browser ID — used by CDP |
| `sc_cid_personalize` | Personalize guest ID |

If both cookies exist, the Cloud SDK initialized successfully.

**Verify in CDP:**

Open Sitecore CDP → Guests → search by **Browser ID** (the value of `sc_cid`). The guest profile should show the events you sent.

### Verify Personalize Decisioning

1. Navigate to `/personalization`
2. Click **Run Experience**
3. You should see the persona badge and personalized message

If you see `{"message":"No flow executed"}`, the experience is not Live.
If you see `{"message":"Templating transformation failed"}`, there is a FreeMarker error.
If `persona` is null, the decision model variant is not in Production.

### Verify Web Experience

1. Start the Web Experience in Personalize
2. Open `http://localhost:3000`
3. The `.hero-section` should show the skeleton, then the personalized content

If the section stays as the skeleton, check:
- The Web Experience is **Live**
- The variant's JavaScript tab uses `replaceHTMLExact('.hero-section')`
- Page targeting includes `/`

### Verify Triggered Experience

1. Start the Triggered Experience in Personalize
2. Fire the custom event from the app
3. Check the Next.js terminal logs or the Vercel function logs
4. The webhook should log a parsed JSON payload with resolved values

---

## Troubleshooting

### Event not appearing in CDP

- Verify `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` matches the CDP instance you are checking
- Check the Network tab for failed requests
- Confirm the `sc_cid` cookie exists in DevTools
- Ensure the SDK initialized (no console errors from `CloudSDKProvider`)

### `Could not find browser with ref <uuid> for client <key>`

This error means the browser ID and client key belong to **different CDP instances**. Clear the `sc_cid` and `sc_cid_personalize` cookies, restart the app, and reload. A new browser ID will be issued for the current Context ID.

### `segmentMemberships` is undefined

Segments must be created in Sitecore CDP (Batch segments) and are populated by the **nightly processing service at 00:00 UTC**. For testing without segments, use session-based logic (e.g., count VIEW events).

### `Templating transformation failed`

FreeMarker could not compile the API Response. Common causes:

- Referencing a field that doesn't exist
- Unbalanced `<#if>` / `</#if>` blocks
- Missing closing quotes in JSON strings
- **Unsaved variant** — click Save before Preview

### `getDecisionModelResultNode(...) evaluated to null or missing`

| Cause | Fix |
|---|---|
| Experience is Paused or Draft | Click Start to make it Live |
| Decision model variant is not in Production | Drag variant to Production |
| Decision model is not connected to the experience | Attach it in the Decisioning section |
| Wrong node name | Use the **node name**, not the output reference |
| Wrong output access | Use `.outputs[0].CalculatePersona` |

### `[object HTMLElement] is not a valid selector`

`replaceHTMLExact` expects a **CSS selector string**, not a DOM element:

```javascript
replaceHTMLExact('.hero-section');
```

### Webhook returns 400 during Connection test

The Connection test sends the request body **without resolving FreeMarker**. The body contains literal `${...}` syntax, which is not valid JSON.

**Fix:** Change the webhook handler to use `request.text()` instead of `request.json()`, and wrap the parse in `try/catch`. Always return 200 so the test passes.

### `SyntaxError: Expected property name or '}' in JSON at position N`

This is the same issue — literal FreeMarker being parsed as JSON. See the fix above.

### Web Experience flickers

The flicker is caused by React re-rendering the target element. See [Web Experience Integration](#web-experience-integration) for the flicker-free pattern: render the skeleton inside the target element once, and never re-render that component.

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
| Triggers | `doc.sitecore.com/personalize/.../triggers.html` |
| CDP identity resolution | `doc.sitecore.com/cdp/.../identity-resolution.html` |
| CDP segments | `doc.sitecore.com/cdp/.../segments.html` |

---

## Production Considerations

This starter kit is a **reference implementation**, not a production-ready application.

### Configuration

- Move away from `.env.local`. Use your platform's secret manager.
- Separate environments. Use different Context IDs for development, staging, and production.
- Never commit `.env.local`.

### Consent

- Consent management is **not** included. Implement it in your application layer.
- Coordinate with your CDP administrator to configure consent flags in guest profiles.

### Identity Strategy

- Decide when to fire IDENTITY events (login, checkout, newsletter signup).
- Map your internal user IDs to CDP `provider` values.
- Test identity resolution against the CDP sandbox before production.

### Error Handling

- Wrap `sendViewEvent`, `sendIdentityEvent`, `sendCustomEvent`, and `runInteractiveExperience` in try/catch at the call site.
- Do not let event collection failures break the user experience.

### Observability

- Log CDP event failures with the `type` and browser ID.
- Monitor Personalize flow execution latency.
- Alert on repeated `No flow executed` responses.
- Monitor webhook endpoints for 4xx and 5xx responses.

### Performance

- The Cloud SDK loads asynchronously. Ensure critical UI renders independently.
- Web Experiences cause a flicker because the DOM is mutated after paint. Use the flicker-free skeleton pattern documented above.
- Interactive Experiences do not flicker — prefer them for primary content.

### Security

- The Context ID is public by design.
- Never expose server-side Client Keys or API Tokens in `NEXT_PUBLIC_*` variables.
- **Webhook endpoints must verify incoming requests.** The test endpoint in this starter is unauthenticated for local development. In production, add a shared secret, IP allowlist, or signature verification.

### Sitecore Environment Configuration

These are configured in Sitecore, not in this repo:

- Identity rules (CDP → Settings → Identity Rules)
- Segments (CDP → Batch segments)
- Decision Models and Programmable Decisions (Personalize → Decisioning)
- Interactive Experiences and their API Responses (Personalize → Experiences)
- Web Experiences and their variants (Personalize → Experiences)
- Triggered Experiences, Connections, and Triggers (Personalize → Experiences, Developer Center → Connections)
- Goals for each experience

---

## License

MIT

---

## Contributing

Issues and pull requests are welcome. If you find an inaccuracy against the current Sitecore documentation, please open an issue with a link to the relevant `doc.sitecore.com` page.
