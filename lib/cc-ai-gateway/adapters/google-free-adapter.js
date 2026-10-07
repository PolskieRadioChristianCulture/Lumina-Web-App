import { BaseAiAdapter } from './base-adapter.js';
import { CcAiError } from '../response-normalizer.js';
export class GoogleFreeAdapter extends BaseAiAdapter {
  async generate(request, signal) {
    if (!this.env.CC_GOOGLE_AI_KEY) throw new CcAiError('AUTH_ERROR');
    const messages = this.messages(request);
    const raw = await this.post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model.id)}:generateContent`,
      { 'x-goog-api-key': this.env.CC_GOOGLE_AI_KEY }, {
        systemInstruction: { parts: [{ text: messages[0].content }] },
        contents: [{ parts: [{ text: messages[1].content }] }],
        generationConfig: { maxOutputTokens: this.model.maxOutputTokens },
      }, signal);
    if (raw.promptFeedback?.blockReason || raw.candidates?.[0]?.finishReason === 'SAFETY') throw new CcAiError('SAFETY_BLOCK', 403);
    return { text: raw.candidates?.[0]?.content?.parts?.map(p => p.text || '').join(''),
      usage: { inputTokens: raw.usageMetadata?.promptTokenCount, outputTokens: raw.usageMetadata?.candidatesTokenCount } };
  }
}
