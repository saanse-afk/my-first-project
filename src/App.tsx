import { useState } from 'react';
import type { SectionId } from './types';
import { SECTION_CONFIGS } from './lib/sectionConfigs';
import { PUNJAB_SCRIPT_ENGINE_SYSTEM } from './lib/systemPrompt';
import { useChat } from './hooks/useChat';
import Layout from './components/Layout';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('static-post');
  const { getChatState, sendMessage, clearMemory } = useChat();

  const activeConfig = SECTION_CONFIGS.find((c) => c.id === activeSection)!;

  // Combine section-specific format prefix + base system prompt
  const fullSystemPrompt = `${activeConfig.systemPromptPrefix}\n\n${PUNJAB_SCRIPT_ENGINE_SYSTEM}`;

  const handleSend = (input: string) => {
    sendMessage(activeSection, input, fullSystemPrompt);
  };

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      activeConfig={activeConfig}
      chatState={getChatState(activeSection)}
      onSendMessage={handleSend}
      onClearMemory={() => clearMemory(activeSection)}
    />
  );
}
