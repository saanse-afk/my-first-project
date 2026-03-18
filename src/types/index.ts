export type SectionId =
  | 'static-post'
  | 'reel-script'
  | 'testimonial'
  | 'on-ground'
  | 'pr-story';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  shortLabel: string;
  icon: string;
  systemPromptPrefix: string;
  placeholder: string;
  color: 'orange' | 'purple' | 'blue' | 'green' | 'pink';
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  borderColor: string;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

export type SectionChatStates = Record<SectionId, ChatState>;
