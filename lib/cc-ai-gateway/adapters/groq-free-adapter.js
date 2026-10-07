import { BaseAiAdapter } from './base-adapter.js';
import { CcAiError } from '../response-normalizer.js';
export class GroqFreeAdapter extends BaseAiAdapter {
  async generate(request, signal) {
    if (!this.env.CC_GROQ_AI_KEY) throw new CcAiError('AUTH_ERROR');
    const raw = await this.post('https://api.groq.com/openai/v1/chat/completions',
      { Authorization: `Bearer ${this.env.CC_GROQ_AI_KEY}` },
      { model: this.model.id, messages: this.messages(request), max_tokens: this.model.maxOutputTokens, stream: false }, signal);
    return { text: raw.choices?.[0]?.message?.content,
      usage: { inputTokens: raw.usage?.prompt_tokens, outputTokens: raw.usage?.completion_tokens } };
  }
}
