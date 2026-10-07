import { BaseAiAdapter } from './base-adapter.js';
import { CcAiError } from '../response-normalizer.js';
export class CloudflareAiAdapter extends BaseAiAdapter {
  async generate(request, signal) {
    if (!this.env.AI) throw new CcAiError('PROVIDER_UNAVAILABLE');
    // AI.run has no guaranteed cancellation; gateway reserves the full maximum unit cost first.
    if (signal.aborted) throw new CcAiError('TIMEOUT');
    const raw = await this.env.AI.run(this.model.id, { messages: this.messages(request), max_tokens: this.model.maxOutputTokens });
    return { text: raw.response, usage: { inputTokens: raw.usage?.prompt_tokens, outputTokens: raw.usage?.completion_tokens } };
  }
}
