import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export type ApiMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function streamMessage(
  systemPrompt: string,
  messages: ApiMessage[],
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  let accumulated = '';

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    stream.on('text', (text) => {
      accumulated += text;
      onChunk(text);
    });

    await stream.finalMessage();
    onComplete(accumulated);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
