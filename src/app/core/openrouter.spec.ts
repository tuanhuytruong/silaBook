import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCustomModels, normalizeNineRouterBaseUrl, OpenRouterClient } from './openrouter';

describe('model provider configuration', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('migrates saved models without a provider to OpenRouter', () => {
    localStorage.setItem('user_openrouter_models', JSON.stringify([
      { id: 'legacy/model', name: 'Legacy model' },
    ]));

    expect(getCustomModels()).toEqual([
      { id: 'legacy/model', name: 'Legacy model', provider: 'openrouter' },
    ]);
  });

  it('normalizes a 9router chat-completions URL to its API root', () => {
    expect(normalizeNineRouterBaseUrl('https://router.example/v1/chat/completions/'))
      .toBe('https://router.example/v1');
  });

  it('routes a 9router model to its configured endpoint and API key', async () => {
    localStorage.setItem('user_openrouter_models', JSON.stringify([
      { id: 'nine/model', name: 'Nine model', provider: '9router' },
    ]));
    localStorage.setItem('user_9router_base_url', 'https://router.example/v1');
    localStorage.setItem('user_9router_api_key', 'nine-key');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new OpenRouterClient();
    const callChatCompletions = (client as unknown as {
      callChatCompletions: (model: string, messages: { role: 'user'; content: string }[]) => Promise<string>;
    }).callChatCompletions.bind(client);

    await expect(callChatCompletions('nine/model', [{ role: 'user', content: 'hello' }])).resolves.toBe('OK');
    expect(fetchMock).toHaveBeenCalledWith('https://router.example/v1/chat/completions', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer nine-key' }),
    }));
  });
});
