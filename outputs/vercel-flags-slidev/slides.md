---
theme: slidev-theme-vercel
title: Feature Flags on Vercel
aspectRatio: 16/9
canvasWidth: 980
footerLogo: wordmark
footerTitle: true
layout: 1-title
variant: title
subtitle1Icon: code
subtitle2Icon: settings
subtitle3Icon: search
subtitle4Icon: shirt
---

::title::

# Feature Flags on Vercel

::subtitle-1::
Flags SDK: open source app contract

::subtitle-2::
Vercel Flags: runtime policy and rollout control

::subtitle-3::
Flags Explorer: inspect and override a browser session

::subtitle-4::
Live demo: `examples/shirt-shop`

<!--
Talk track: this deck is the shared model before the live demo. The customer should leave understanding which part solves which job and why the pieces work better together.
-->

---
layout: 1-title
variant: agenda
badge: Demo foundation
---

::item-1::
The three-part model

::item-2::
What each feature owns

::item-3::
Standalone SDK flow

::item-4::
Vercel Flags provider flow

::item-5::
Flags Explorer workflow

::item-6::
shirt-shop demo map

::item-7::
Business value and caveats

<!--
Keep this short. The deck is intentionally structured so the same narrative supports technical questions and business-level questions.
-->

---
layout: 2-statement
variant: large
---

::title::

# Feature flags separate deploy from release.

::subtitle::
The Vercel flags stack also separates code ownership, rollout policy, and browser-side validation.

<!--
Core framing: deploy is still engineering controlled, release can be product controlled, and validation can happen in an isolated session.
-->

---
layout: 5-open
variant: title-space
---

::title::

# The three surfaces are complementary

::content::

<div class="model-grid">
  <div class="model-card blue">
    <div class="eyebrow">APP LAYER</div>
    <h2>Flags SDK</h2>
    <p>Keys, defaults, options, evaluation logic, adapters, overrides, and exposure hooks.</p>
  </div>
  <div class="model-link">works with</div>
  <div class="model-card green">
    <div class="eyebrow">PROVIDER LAYER</div>
    <h2>Vercel Flags</h2>
    <p>Runtime values, environments, targeting rules, segments, and gradual rollout policy.</p>
  </div>
  <div class="model-link">debugged by</div>
  <div class="model-card purple">
    <div class="eyebrow">BROWSER LAYER</div>
    <h2>Flags Explorer</h2>
    <p>Toolbar workflow for resolved values, local overrides, QA, PM review, and debugging.</p>
  </div>
</div>

<!--
Do not describe these as three competing feature flag systems. The SDK is the integration and evaluation API, Vercel Flags is a provider, and Explorer is a developer/product workflow.
-->

---
layout: 5-open
variant: title-space
---

::title::

# What each feature owns

::content::

<div class="compare-stack">
<table class="compare">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Primary job</th>
      <th>Who changes it</th>
      <th>Runtime impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Flags SDK</strong></td>
      <td>App contract and evaluation</td>
      <td>Engineers in code</td>
      <td>Render path</td>
    </tr>
    <tr>
      <td><strong>Vercel Flags</strong></td>
      <td>Values, targeting, rollouts</td>
      <td>PMs and engineers in dashboard</td>
      <td>No redeploy</td>
    </tr>
    <tr>
      <td><strong>Flags Explorer</strong></td>
      <td>Inspect and override a session</td>
      <td>QA, PMs, developers</td>
      <td>Local browser only</td>
    </tr>
  </tbody>
</table>

<p class="takeaway">Runtime policy changes quickly. New UI still requires shipped code.</p>
</div>

<!--
This slide answers the "where do I define the flag?" question: define the app contract in code; optionally attach runtime policy in Vercel Flags.
-->

---
layout: 2-statement
variant: cols-3
---

::title::

# Why this matters to the business

::s1-title::
Release deliberately

::s1-body::
Ship code once, then control exposure by environment, segment, percentage, or specific users.

::s2-title::
Reduce coordination cost

::s2-body::
Product and QA can validate behavior without asking engineering for a new build every time.

::s3-title::
Lower launch risk

::s3-body::
Roll out gradually, observe impact, and revert policy faster than a code rollback.

<!--
Connect technical architecture to customer value. Less redeploy pressure, less risk, better experimentation hygiene.
-->

---
layout: 10-code
variant: right-list
filename: examples/shirt-shop/flags.ts
codeSize: xs
---

::title::

# Flags SDK standalone

::item-1::
Open source package: `flags`

::item-2::
Works without Vercel Flags

::item-3::
Evaluation can be pure code

::item-4::
Can still expose metadata to tools

::code::

```ts
export const showSummerBannerFlag = flag<boolean, EvaluationContext>({
  key: 'summer-sale',
  description: 'Shows a bright yellow banner for a 20% discount',
  defaultValue: false,
  identify,
  decide({ entities }) {
    if (!entities || !entities.stableId) return this.defaultValue!;
    return bucket(`${this.key}/${entities.stableId}`) === 1;
  },
});
```

<!--
Important point: the SDK is not Vercel Flags. It can be used standalone with deterministic application logic or with another provider.
-->

---
layout: 10-code
variant: left-list
filename: examples/shirt-shop/proxy.ts
codeSize: xs
---

::title::

# The browser does not choose the variant

::item-1::
Request gets a stable ID

::item-2::
SDK precomputes flag combo

::item-3::
Proxy rewrites to a static variant URL

::item-4::
Visitor receives the matching UI

::code::

```ts
export async function proxy(request: NextRequest) {
  const stableId = await getStableId();
  const cartId = await getCartId();
  const code = await precompute(productFlags);

  const nextUrl = new URL(
    `/${code}${request.nextUrl.pathname}${request.nextUrl.search}`,
    request.url,
  );

  return NextResponse.rewrite(nextUrl, { request, headers });
}
```

<!--
This answers "how does the browser know?" It does not. The server/request path evaluates and rewrites before render. Client code may render parts too, but this demo uses precomputed static variants.
-->

---
layout: 5-open
variant: title-space
---

::title::

# Request flow in the shirt-shop demo

::content::

<div class="flow-stack">
<div class="flow">
  <div class="flow-step">Visitor<br><span>opens `/`</span></div>
  <div class="flow-arrow">-&gt;</div>
  <div class="flow-step">Stable ID<br><span>cookie</span></div>
  <div class="flow-arrow">-&gt;</div>
  <div class="flow-step">`precompute()`<br><span>product flags</span></div>
  <div class="flow-arrow">-&gt;</div>
  <div class="flow-step">`/[code]`<br><span>variant route</span></div>
  <div class="flow-arrow">-&gt;</div>
  <div class="flow-step">Page<br><span>renders UI</span></div>
</div>

<div class="callout">
  Result: fast cacheable variants, deterministic per visitor, with the flag values still visible to Vercel Toolbar.
</div>
</div>

<!--
Narrate this as the live request lifecycle. If the customer cares about performance, point out that precomputed variants avoid making every page fully dynamic.
-->

---
layout: 2-statement
variant: title-3
---

::title::

# Vercel Flags is the first-party provider

::s1-title::
It competes with providers

::s1-body::
Yes, Vercel Flags is Vercel's own runtime flag provider. It can cover the same provider role as LaunchDarkly, Statsig, or similar tools.

::s2-title::
It does not replace app code

::s2-body::
The dashboard can change values, targeting, and rollout policy, but the app still needs a shipped flag key and UI branch.

::s3-title::
It uses the SDK contract

::s3-body::
The SDK describes and evaluates the flag; the Vercel adapter delegates runtime policy to Vercel Flags.

<!--
This is the direct answer to "is Vercel Flags a provider?" Yes, with the nuance that the SDK remains the app integration layer.
-->

---
layout: 10-code
variant: right-list
filename: examples/shirt-shop/flags.ts
codeSize: xs
---

::title::

# Vercel-backed flag

::item-1::
Flag key is declared in code

::item-2::
Default value is safe

::item-3::
`identify()` supplies targeting context

::item-4::
Adapter reads Vercel runtime policy

::code::

```ts
export const marketingBannerFlag = flag<boolean, EvaluationContext>({
  key: 'marketing-banner',
  description:
    'Dashboard-controlled banner for demonstrating Vercel Flags targeting and rollouts',
  defaultValue: false,
  identify,
  adapter: vercelAdapter,
});
```

<!--
Use Sweden as an example carefully: country targeting only works if the app provides a country or geo entity that the provider can evaluate.
-->

---
layout: 10-code
variant: left-2
filename: examples/shirt-shop/app/marketing-banner-slot.tsx
codeSize: xs
---

::s1-title::
Runtime policy

::s1-body::
Vercel Flags decides whether `marketing-banner` is on for this request, environment, and visitor context.

::s2-title::
Shipped UI

::s2-body::
The banner component must already exist in the app. Runtime flags choose a path; they do not generate code.

::code::

```tsx
export async function MarketingBannerSlot() {
  const showMarketingBanner = await marketingBannerFlag();

  return <MarketingBanner show={showMarketingBanner} />;
}
```

<!--
This slide reinforces the boundary: code defines capability, dashboard defines policy.
-->

---
layout: 5-open
variant: title-space
---

::title::

# Flags Explorer is the human debugging surface

::content::

<div class="content-stack">
<div class="explorer-grid">
  <div>
    <h3>1. Discover</h3>
    <p>Toolbar reads `/.well-known/vercel/flags` to understand available flags.</p>
  </div>
  <div>
    <h3>2. Inspect</h3>
    <p>`FlagValues` exposes the values that resolved for the current page.</p>
  </div>
  <div>
    <h3>3. Override</h3>
    <p>Explorer writes an override cookie, so only this browser sees the test value.</p>
  </div>
</div>

<div class="takeaway">Explorer is ideal for QA, PM review, debugging, and previewing UI states before changing rollout policy.</div>
</div>

<!--
Stress scope: Explorer overrides do not change the global rollout. It is a browser-session tool.
-->

---
layout: 10-code
variant: right-list
filename: examples/shirt-shop/app/.well-known/vercel/flags/route.ts
codeSize: xs
---

::title::

# How Explorer learns the flags

::item-1::
Discovery endpoint exposes flag metadata

::item-2::
SDK provider data covers code-defined flags

::item-3::
Vercel provider data covers dashboard-backed flags

::item-4::
Merged data powers Toolbar UI

::code::

```ts
export const GET = createFlagsDiscoveryEndpoint(async () => {
  return mergeProviderData([
    getProviderData(flags),
    getVercelProviderData(flags),
  ]);
}) as any;
```

<!--
This is one of the most important demo files. It connects app metadata to the browser-side Explorer experience.
-->

---
layout: 10-code
variant: left-list
filename: examples/shirt-shop/app/[code]/layout.tsx
codeSize: xs
---

::title::

# How Explorer sees resolved values

::item-1::
`deserialize()` reads the variant code

::item-2::
Flags resolve for the route

::item-3::
`FlagValues` makes them available to Toolbar

::item-4::
`VercelToolbar` renders the Explorer surface

::code::

```tsx
const values = await deserialize(productFlags, params.code);

return (
  <div className="bg-white">
    <FreeDelivery show={showFreeDeliveryBanner} />
    <Navigation />
    {props.children}
    <FlagValues values={values} />
    <Footer />
    <DevTools />
  </div>
);
```

<!--
Mention that Toolbar is wired in root layout and next.config. The values bridge makes the session understandable in the browser.
-->

---
layout: 5-open
variant: title-space
---

::title::

# What the live demo should show

::content::

<div class="content-stack">
<div class="demo-map">
  <div class="demo-card blue">
    <h3>SDK-only</h3>
    <p>`summer-sale`, `free-delivery`, and `proceed-to-checkout-color` are defined and evaluated in code.</p>
  </div>
  <div class="demo-card green">
    <h3>Vercel-backed</h3>
    <p>`marketing-banner` is declared in code but controlled by Vercel Flags runtime policy.</p>
  </div>
  <div class="demo-card purple">
    <h3>Explorer</h3>
    <p>Toolbar inspects values and overrides individual flags for the current browser session.</p>
  </div>
</div>

<div class="runline">
  Demo sequence: reset stable ID -> show code bucket changes -> toggle dashboard flag -> override locally in Explorer.
</div>
</div>

<!--
This slide is the clean transition into the live application. Keep it visible while you switch windows if needed.
-->

---
layout: 5-open
variant: list-space
---

::title::

# Suggested live runbook

::item-1::
Open shirt-shop: banners and cart button color.

::item-2::
Reset Stable ID to show SDK-only bucketing.

::item-3::
Toggle `marketing-banner` in Vercel Flags.

::item-4::
Use Flags Explorer to override one value locally.

::item-5::
Open the discovery endpoint.

::space::

<div class="terminal">
<div class="terminal-title">local setup</div>

```bash
vercel link
vercel env pull
pnpm -F shirt-shop dev
```

</div>

<!--
The demo message is: deploy independently, release deliberately, preview safely.
-->

---
layout: 2-statement
variant: grid-4
---

::title::

# Common misconceptions to handle

::s1-title::
"Can I use the SDK alone?"

::s1-body::
Yes. The Flags SDK is open source and can evaluate flags entirely in app code or with custom providers.

::s2-title::
"Does Vercel Flags create UI at runtime?"

::s2-body::
No. It changes values and targeting for code paths that already exist in the deployed app.

::s3-title::
"Does the browser pick variants?"

::s3-body::
Not in this demo. Request-time code evaluates flags and rewrites to a variant route.

::s4-title::
"Does Explorer change production?"

::s4-body::
No. Overrides are scoped to the current browser session for validation and debugging.

<!--
These four questions came up in preparation and are likely to come up again.
-->

---
layout: 5-open
variant: title-space
---

::title::

# Decision tree

::content::

<div class="tree">
  <div class="tree-node">Need deterministic flags in code only?<br><strong>Use Flags SDK standalone.</strong></div>
  <div class="tree-node">Need runtime rollout, targeting, or segments?<br><strong>Add Vercel Flags provider.</strong></div>
  <div class="tree-node">Need preview, QA, or debugging?<br><strong>Use Flags Explorer.</strong></div>
  <div class="tree-node final">Most production demos use all three together.</div>
</div>

<!--
Use this slide if the conversation becomes a tooling comparison. It gives a simple selection rule.
-->

---
layout: 2-statement
variant: large
---

::title::

# App code defines what is possible. Runtime policy defines who sees it.

::subtitle::
Flags Explorer lets humans inspect and validate that relationship before changing a real rollout.

<!--
Final synthesis. Repeat this exact line before Q&A if the audience includes mixed technical and non-technical stakeholders.
-->

---
layout: 8-special
variant: qa
badge: Q&A
item1Icon: book-open
item2Icon: github
item3Icon: shirt
item4Icon: terminal
---

::item-1::
Docs: vercel.com/docs/flags

::item-2::
Repo: github.com/vercel/flags

::item-3::
Demo: examples/shirt-shop

::item-4::
Run: npm run dev

<!--
Sources used: Vercel Flags docs, Vercel Flags quickstart, Flags Explorer getting started, Flags SDK reference, flags-sdk.dev, github.com/vercel/flags, and github.com/vercel/slidev-theme-vercel.
-->
