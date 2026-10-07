import { BaseAiAdapter } from './base-adapter.js';
import { CcAiError } from '../response-normalizer.js';
import { boundedJson } from '../security-guard.js';
export class LocalWorkstationAdapter extends BaseAiAdapter {
  async generate(request, signal) {
    let raw;
    const body = { model: this.model.id, messages: this.messages(request), stream: false,
      options: { num_predict: this.model.maxOutputTokens } };
    if (this.env.CC_LOCAL_AI) {
      const response = await this.env.CC_LOCAL_AI.fetch(new Request('https://cc-local.internal/api/chat', {
        method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal,
      }));
      if (!response.ok) { await response.body?.cancel(); throw new CcAiError('PROVIDER_UNAVAILABLE'); }
      try { raw = await boundedJson(response, 262144); }
      catch { throw new CcAiError('UNKNOWN_PROVIDER_ERROR'); }
    } else if (this.env.CC_AI_RUNTIME === 'local') {
      // Only a process on the workstation may use loopback. Never take a URL from a client or KV.
      raw = await this.post('http://127.0.0.1:11434/api/chat', {}, body, signal);
    } else throw new CcAiError('PROVIDER_UNAVAILABLE');
    return { text: raw.message?.content, usage: { inputTokens: raw.prompt_eval_count, outputTokens: raw.eval_count } };
  }
}
