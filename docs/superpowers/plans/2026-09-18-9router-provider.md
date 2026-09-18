# 9router Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9router as a configurable OpenAI-compatible provider that can be selected per saved model.

**Architecture:** Extend the model record with a provider identifier and preserve `openrouter` as the migration default. Keep 9router credentials separate from OpenRouter and have the existing client resolve endpoint and authentication from the selected model before sending its existing chat-completions payload.

**Tech Stack:** Angular 21, TypeScript, browser Web Crypto/localStorage, Vitest via Angular unit test builder.

---

### Task 1: Model provider data and 9router configuration helpers

**Files:**
- Modify: `src/app/core/openrouter.ts`
- Modify: `src/app/core/crypto-storage.util.ts`
- Test: `src/app/core/openrouter.spec.ts`

- [ ] **Step 1: Write failing tests for legacy model migration and 9router URL normalization**

```ts
expect(normalizeNineRouterBaseUrl('https://router.example/v1/')).toBe('https://router.example/v1');
expect(normalizeNineRouterBaseUrl('https://router.example/v1/chat/completions'))
  .toBe('https://router.example/v1');
expect(getCustomModels()[0].provider).toBe('openrouter');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cmd /c npm test -- --watch=false`

Expected: FAIL because the normalizer and `provider` property do not exist.

- [ ] **Step 3: Add provider-aware model normalization and isolated 9router storage functions**

```ts
export type ModelProvider = 'openrouter' | '9router';
export interface CustomModel { id: string; name: string; provider: ModelProvider; }
export function normalizeNineRouterBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '').replace(/\/chat\/completions$/, '');
}
export function getNineRouterBaseUrl(): string {
  return normalizeNineRouterBaseUrl(localStorage.getItem('user_9router_base_url') || '');
}
export async function saveNineRouterApiKey(key: string): Promise<void> {
  localStorage.setItem('user_9router_api_key', await encryptApiKey(key.trim()));
}
```

All parsed models without a known provider become `openrouter`; saved models always persist a valid provider.

- [ ] **Step 4: Run tests to verify the helpers pass**

Run: `cmd /c npm test -- --watch=false`

Expected: PASS.

### Task 2: Provider-aware request routing

**Files:**
- Modify: `src/app/core/openrouter.ts`
- Test: `src/app/core/openrouter.spec.ts`

- [ ] **Step 1: Write failing request-routing tests**

```ts
expect(fetch).toHaveBeenCalledWith('https://nine.example/v1/chat/completions', expect.objectContaining({
  headers: expect.objectContaining({ Authorization: 'Bearer nine-key' }),
}));
```

The companion case asserts the existing OpenRouter endpoint and key remain selected for an OpenRouter model.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cmd /c npm test -- --watch=false`

Expected: FAIL because all calls use the hard-coded OpenRouter endpoint.

- [ ] **Step 3: Resolve provider configuration before `callChatCompletions` fetches**

```ts
const provider = getProviderForModel(model);
const config = await this.getProviderRequestConfig(provider);
const res = await fetch(`${config.baseUrl}/chat/completions`, { headers: config.headers, body: JSON.stringify(payload) });
```

Require the 9router URL and API key only when the selected model uses 9router. Retain OpenRouter's referer/title headers only for OpenRouter, and report missing configuration and HTTP/response failures with the selected provider name.

- [ ] **Step 4: Run tests to verify routing passes**

Run: `cmd /c npm test -- --watch=false`

Expected: PASS.

### Task 3: Settings UI and persistence

**Files:**
- Modify: `src/app/shared/components/api-key-modal.ts`
- Test: `src/app/shared/components/api-key-modal.spec.ts`

- [ ] **Step 1: Write failing component tests for the 9router fields and provider selectors**

```ts
expect(fixture.nativeElement.querySelector('#nineRouterBaseUrl')).toBeTruthy();
expect(fixture.nativeElement.querySelector('select[aria-label="Nhà cung cấp model"]')).toBeTruthy();
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cmd /c npm test -- --watch=false`

Expected: FAIL because those controls are not rendered.

- [ ] **Step 3: Add 9router URL/key fields and a provider selector to both model lists**

```html
<input id="nineRouterBaseUrl" [(ngModel)]="nineRouterBaseUrl" />
<select aria-label="Nhà cung cấp model" [(ngModel)]="model.provider">
  <option value="openrouter">OpenRouter</option>
  <option value="9router">9router</option>
</select>
```

Load and save the new fields through the helpers, validate a supplied URL, permit saving when either provider is configured, and let the delete action clear both providers' credentials.

- [ ] **Step 4: Run tests to verify the component passes**

Run: `cmd /c npm test -- --watch=false`

Expected: PASS.

### Task 4: Full verification

**Files:**
- Verify: `src/app/core/openrouter.ts`
- Verify: `src/app/core/crypto-storage.util.ts`
- Verify: `src/app/shared/components/api-key-modal.ts`
- Verify: `src/app/core/openrouter.spec.ts`
- Verify: `src/app/shared/components/api-key-modal.spec.ts`

- [ ] **Step 1: Run lint and unit tests**

Run: `cmd /c npm run lint && npm test -- --watch=false`

Expected: both commands exit 0.

- [ ] **Step 2: Build the production application**

Run: `cmd /c npm run build`

Expected: Angular build exits 0.

- [ ] **Step 3: Check provider migration and routing anchors**

Run: `rg -n "ModelProvider|9router|nineRouterBaseUrl|getProviderForModel" src`

Expected: configuration, UI, and client routing paths all contain the new provider-aware implementation.
