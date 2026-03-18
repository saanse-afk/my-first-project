import { useState, useRef, useEffect } from 'react';
import type { ChatState, Message, SectionChatStates, SectionId } from '../types';
import { SECTION_IDS } from '../lib/sectionConfigs';
import { streamMessage } from '../lib/claudeClient';

const makeInitialState = (): ChatState => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  error: null,
});

const makeInitialAllStates = (): SectionChatStates =>
  Object.fromEntries(SECTION_IDS.map((id) => [id, makeInitialState()])) as SectionChatStates;

export function useChat() {
  const [sectionStates, setSectionStates] = useState<SectionChatStates>(makeInitialAllStates);

  // Ref mirror to avoid stale closures inside async callbacks
  const sectionStatesRef = useRef(sectionStates);
  useEffect(() => {
    sectionStatesRef.current = sectionStates;
  }, [sectionStates]);

  const getChatState = (sectionId: SectionId): ChatState => sectionStates[sectionId];

  const sendMessage = async (
    sectionId: SectionId,
    userInput: string,
    systemPrompt: string
  ) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
    };

    // Add user message + set streaming
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        messages: [...prev[sectionId].messages, userMessage],
        isStreaming: true,
        streamingContent: '',
        error: null,
      },
    }));

    // Build API messages from current history + new user message
    const currentMessages = sectionStatesRef.current[sectionId].messages;
    const apiMessages = [...currentMessages, userMessage].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    await streamMessage(
      systemPrompt,
      apiMessages,
      // onChunk
      (chunk) => {
        setSectionStates((prev) => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            streamingContent: prev[sectionId].streamingContent + chunk,
          },
        }));
      },
      // onComplete
      (fullText) => {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullText,
          timestamp: new Date(),
        };
        setSectionStates((prev) => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            messages: [...prev[sectionId].messages, assistantMessage],
            isStreaming: false,
            streamingContent: '',
          },
        }));
      },
      // onError
      (error) => {
        setSectionStates((prev) => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            isStreaming: false,
            streamingContent: '',
            error: error.message,
          },
        }));
      }
    );
  };

  const clearMemory = (sectionId: SectionId) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: makeInitialState(),
    }));
  };

  return { getChatState, sendMessage, clearMemory };
}
