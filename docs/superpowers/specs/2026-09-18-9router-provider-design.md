# 9router OpenAI-compatible Provider Design

## Goal

Add 9router as a second AI provider alongside OpenRouter. Users can configure
9router's base URL and API key, then assign either provider to every configured
quality or economy model. Existing OpenRouter users and saved model lists must
continue to work unchanged.

## Chosen approach

Each saved model gains a `provider` field with one of two values:

- `openrouter` for the existing OpenRouter service.
- `9router` for the new OpenAI-compatible service.

The existing quality and economy model lists remain shared. This allows a user
to mix providers without duplicate lists or a global provider switch. Models
created before this feature omit `provider`; reads treat that value as
`openrouter` and saves persist the explicit default.

## Configuration and storage

The API settings dialog will retain the OpenRouter API key controls and add a
9router section containing:

- Base URL (for example, the provider's OpenAI-compatible API root).
- API key.

The 9router API key uses the same Web Crypto encryption and in-memory cache
strategy as the OpenRouter key, but has a distinct storage key. The base URL is
stored separately as normal local browser configuration. Saving an empty
9router configuration clears only the corresponding 9router values; it must
not affect OpenRouter credentials.

## Request routing

The model's `provider` determines the credential and endpoint for every AI
request:

| Provider | Endpoint | Authentication |
| --- | --- | --- |
| OpenRouter | existing `https://openrouter.ai/api/v1/chat/completions` | existing OpenRouter key |
| 9router | normalized `{baseUrl}/chat/completions` | `Authorization: Bearer {9routerKey}` |

The 9router request body follows the existing OpenAI-compatible chat-completions
shape. Base-URL normalization removes trailing slashes and avoids adding a
second `/chat/completions` path when users supply the endpoint itself.

## Validation and failure behaviour

The settings dialog validates that a 9router base URL is an HTTP(S) URL. Before
a request using a 9router model, the app requires both 9router base URL and API
key and returns a provider-specific actionable error if either is missing.
OpenRouter validation and error messages remain unchanged for OpenRouter
models. Network and HTTP errors identify the selected provider rather than
mislabeling every failure as OpenRouter.

## UI and compatibility

Every editable model row gains a provider selector, defaulting to OpenRouter.
All existing model pickers continue to show the shared lists and their selected
model IDs; no changes are needed to project configuration formats that store a
model ID. The provider is resolved from the current matching model entry at
request time.

When a model ID is no longer present in the configured lists, it uses the
OpenRouter fallback to preserve historical behavior.

## Tests

Automated coverage will verify:

- migrated model entries without `provider` resolve to OpenRouter;
- model-list save/load retains the selected provider;
- 9router URL normalization and missing-config errors;
- request routing uses the appropriate URL and API key for both providers.

The project build/test command will be run after implementation, along with
searches confirming that all model configuration UI paths create and preserve
the provider field.

## Out of scope

This change does not fetch a remote model catalogue, add per-provider pricing,
or alter existing translation workflows beyond provider-aware routing.
