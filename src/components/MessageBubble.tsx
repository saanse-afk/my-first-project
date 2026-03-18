import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
  accentColor?: string;
}

export default function MessageBubble({
  message,
  isStreaming = false,
  streamingContent = '',
  accentColor = '#f97316',
}: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const content = isStreaming ? streamingContent : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <motion.div
        className="flex justify-end mb-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div
          className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}10)`,
            border: `1px solid ${accentColor}40`,
            color: '#f1f5f9',
          }}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="message-bubble-wrapper flex justify-start mb-4 group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative max-w-[90%] w-full">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="copy-btn absolute top-2 right-2 z-10 p-1.5 rounded-lg transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check size={13} className="text-green-400" />
          ) : (
            <Copy size={13} className="text-slate-400" />
          )}
        </button>

        {/* Message content */}
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 pr-10 glass-panel card-depth"
          style={{
            background: 'rgba(18, 13, 46, 0.6)',
          }}
        >
          <pre
            className={`
              text-sm leading-relaxed text-slate-200 whitespace-pre-wrap break-words font-sans
              ${isStreaming && !streamingContent ? 'streaming-cursor' : ''}
              ${isStreaming && streamingContent ? 'streaming-cursor' : ''}
            `}
          >
            {content || (isStreaming ? '' : '')}
          </pre>
          {isStreaming && !streamingContent && (
            <span className="inline-block w-2 h-4 bg-orange-400 ml-0.5 animate-blink" />
          )}
        </div>

        {/* Timestamp */}
        {!isStreaming && (
          <div className="text-xs text-slate-600 mt-1 ml-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
