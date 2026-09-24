# Sitecore CDP + Personalize Next.js Starter

A community reference implementation demonstrating how to integrate
Sitecore CDP and Sitecore Personalize with a Next.js App Router
application using the current Sitecore Cloud SDK.

## What This Starter Demonstrates

- Browser-side Cloud SDK initialization [citation:1][citation:15]
- VIEW event collection
- IDENTITY event for guest identity resolution [citation:6]
- Custom event with extension data [citation:7][citation:19]
- Server-side Personalize Flow Execution API call [citation:18]

## What This Starter Does NOT Do

- It does not fake decisioning APIs. Decision models and programmable
  decisions are configured inside Sitecore Personalize, not in Next.js.
- It does not provide a production-ready authentication or consent
  management layer.

## Architecture

Browser
→ Sitecore Cloud SDK (@sitecore-cloudsdk/*)
→ Sitecore CDP (event collection, identity)
→ Sitecore Personalize (decisioning)
→ Next.js API route (server-side flow execution)
→ Next.js UI


**Browser responsibility**: SDK initialization, VIEW/IDENTITY/custom
event collection.

**Next.js server responsibility**: Server-side Personalize flow
execution (client key must not be exposed to browser).

**Sitecore Personalize responsibility**: Interactive Experiences,
decision models, programmable decisions, web experiences.

## Prerequisites

- Node.js 18+
- A Sitecore CDP tenant with API access
- A Sitecore Personalize tenant with an Interactive Experience
- Context ID and site name from Sitecore CDP

## Setup

```bash
git clone <repo-url>
cd sitecore-cdp-personalize-nextjs-starter
npm install
cp .env.example .env.local
# Fill in .env.local with your Sitecore values
npm run dev
