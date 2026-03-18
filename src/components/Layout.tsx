import { AnimatePresence, motion } from 'framer-motion';
import type { ChatState, SectionConfig, SectionId } from '../types';
import { SECTION_CONFIGS } from '../lib/sectionConfigs';
import Background3D from './Background3D';
import SectionNav from './SectionNav';
import ChatSection from './ChatSection';

interface Props {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  activeConfig: SectionConfig;
  chatState: ChatState;
  onSendMessage: (input: string) => void;
  onClearMemory: () => void;
}

export default function Layout({
  activeSection,
  onSectionChange,
  activeConfig,
  chatState,
  onSendMessage,
  onClearMemory,
}: Props) {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#0a0518' }}>
      {/* 3D background layer */}
      <Background3D />

      {/* App shell */}
      <div className="relative z-10 flex flex-col" style={{ height: '100vh' }}>
        {/* Header */}
        <header className="glass-panel gradient-border-bottom flex-shrink-0">
          <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-3d font-black text-sm"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #a855f7)',
                  boxShadow: '0 0 20px rgba(249,115,22,0.4), 0 4px 12px rgba(0,0,0,0.4)',
                  color: '#fff',
                }}
              >
                PSE
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100 tracking-wide">
                  Punjab Script Engine
                </div>
                <div className="text-xs text-slate-500 leading-none">
                  MMSY Campaign Studio · White Rivers Media
                </div>
              </div>
            </div>

            {/* Active section indicator */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: `${activeConfig.gradientFrom}`,
                border: `1px solid ${activeConfig.borderColor}`,
                color: '#f1f5f9',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: activeConfig.glowColor }}
              />
              {activeConfig.label}
            </div>
          </div>
        </header>

        {/* Section Nav */}
        <SectionNav
          sections={SECTION_CONFIGS}
          activeSection={activeSection}
          onSelect={onSectionChange}
        />

        {/* Main content */}
        <main className="flex-1 min-h-0 px-4 pb-2">
          <div
            className="max-w-5xl mx-auto h-full card-depth rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(18, 13, 46, 0.55)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="section-perspective-wrapper h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  className="h-full"
                  initial={{
                    opacity: 0,
                    rotateX: -12,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    rotateX: 0,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    rotateX: 12,
                    y: -16,
                  }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  style={{ transformOrigin: 'top center' }}
                >
                  <ChatSection
                    sectionId={activeSection}
                    config={activeConfig}
                    chatState={chatState}
                    onSendMessage={onSendMessage}
                    onClearMemory={onClearMemory}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
