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
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemPrompt, messages }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep incomplete last line

      let event = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          event = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (event === 'chunk') {
            try {
              const text: string = JSON.parse(data);
              accumulated += text;
              onChunk(text);
            } catch {
              // skip malformed
            }
          } else if (event === 'done') {
            onComplete(accumulated);
            return;
          } else if (event === 'error') {
            try {
              const msg: string = JSON.parse(data);
              throw new Error(msg);
            } catch {
              throw new Error('Streaming error from server');
            }
          }
          event = '';
        }
      }
    }

    // Stream ended without explicit done event
    onComplete(accumulated);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
