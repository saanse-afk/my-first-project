import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Send,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { ChatState, SectionConfig, SectionId } from '../types';
import MessageBubble from './MessageBubble';

interface Props {
  sectionId: SectionId;
  config: SectionConfig;
  chatState: ChatState;
  onSendMessage: (input: string) => void;
  onClearMemory: () => void;
}

const ACCENT_HEX: Record<string, string> = {
  orange: '#f97316',
  purple: '#a855f7',
  blue: '#3b82f6',
  green: '#22c55e',
  pink: '#ec4899',
};

export default function ChatSection({
  sectionId,
  config,
  chatState,
  onSendMessage,
  onClearMemory,
}: Props) {
  const [input, setInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const accent = ACCENT_HEX[config.color] ?? '#f97316';

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages.length, chatState.streamingContent]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatState.isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearConfirm = () => {
    onClearMemory();
    setConfirmClear(false);
  };

  const hasMessages = chatState.messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-3 gradient-border-bottom"
        style={{ background: 'rgba(10,5,24,0.4)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span className="text-sm font-semibold text-slate-200">{config.label}</span>
          {hasMessages && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: `${accent}18`,
                border: `1px solid ${accent}30`,
                color: accent,
              }}
            >
              {chatState.messages.length} msg{chatState.messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Clear memory control */}
        <AnimatePresence>
          {confirmClear ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="text-slate-400">Clear memory?</span>
              <button
                onClick={handleClearConfirm}
                className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1 rounded-md glass-panel text-slate-400 hover:text-slate-200 transition-colors"
              >
                No
              </button>
            </motion.div>
          ) : (
            hasMessages && (
              <motion.button
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <Trash2 size={12} />
                <span>Clear memory</span>
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {!hasMessages && !chatState.isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 select-none">
            <div className="empty-state-icon mb-4 opacity-30">
              <Sparkles size={48} style={{ color: accent }} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">
              {config.label} Studio
            </p>
            <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
              Describe your brief and I'll write copy that feels real, rooted in Punjab.
            </p>
            <div
              className="mt-4 text-xs px-3 py-1.5 rounded-full"
              style={{
                background: `${accent}10`,
                border: `1px solid ${accent}20`,
                color: `${accent}`,
              }}
            >
              ⌘ + Enter to send
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                accentColor={accent}
              />
            ))}
            {chatState.isStreaming && (
              <MessageBubble
                key={`streaming-${sectionId}`}
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: chatState.streamingContent,
                  timestamp: new Date(),
                }}
                isStreaming
                streamingContent={chatState.streamingContent}
                accentColor={accent}
              />
            )}
          </>
        )}

        {/* Error */}
        {chatState.error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4"
          >
            <AlertCircle size={13} />
            <span>{chatState.error}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ background: 'rgba(10,5,24,0.5)' }}
      >
        <div
          className="glass-panel rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            border: `1px solid ${input.trim() ? `${accent}35` : 'rgba(255,255,255,0.08)'}`,
            boxShadow: input.trim() ? `0 0 0 1px ${accent}20` : 'none',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            rows={3}
            disabled={chatState.isStreaming}
            className="w-full px-4 pt-3 pb-1 text-sm text-slate-200 bg-transparent resize-none placeholder-slate-600 disabled:opacity-50"
            style={{ lineHeight: '1.6' }}
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <span className="text-xs text-slate-600">⌘ + Enter to send</span>
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || chatState.isStreaming}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                boxShadow: input.trim() && !chatState.isStreaming ? `0 0 16px ${accent}50` : 'none',
                color: '#fff',
              }}
              whileHover={{ scale: input.trim() && !chatState.isStreaming ? 1.03 : 1 }}
              whileTap={{ scale: 0.97 }}
            >
              {chatState.isStreaming ? (
                <>
                  <div
                    className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  />
                  <span>Writing...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
