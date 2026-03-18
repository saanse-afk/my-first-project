import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Anthropic from '@anthropic-ai/sdk';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

function claudeProxyPlugin(): Plugin {
  return {
    name: 'claude-proxy',
    configureServer(server) {
      const handler = async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.writeHead(405);
            res.end('Method Not Allowed');
            return;
          }

          // Read request body
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }

          let system: string;
          let messages: Array<{ role: 'user' | 'assistant'; content: string }>;

          try {
            ({ system, messages } = JSON.parse(body));
          } catch {
            res.writeHead(400);
            res.end('Bad Request');
            return;
          }

          // Set up SSE response
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });

          const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });

          try {
            const stream = client.messages.stream({
              model: 'claude-sonnet-4-6',
              max_tokens: 2048,
              system,
              messages,
            });

            stream.on('text', (text: string) => {
              const escaped = JSON.stringify(text);
              res.write(`event: chunk\ndata: ${escaped}\n\n`);
            });

            await stream.finalMessage();
            res.write('event: done\ndata: [DONE]\n\n');
            res.end();
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            res.write(`event: error\ndata: ${JSON.stringify(message)}\n\n`);
            res.end();
          }
      };
      server.middlewares.use('/api/stream', (req, res, next) => {
        handler(req as IncomingMessage, res as ServerResponse).catch(next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), claudeProxyPlugin()],
});
