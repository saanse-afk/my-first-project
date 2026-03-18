import { motion } from 'framer-motion';
import {
  Image,
  Film,
  MessageCircle,
  MapPin,
  Newspaper,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionConfig, SectionId } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Image,
  Film,
  MessageCircle,
  MapPin,
  Newspaper,
};

interface Props {
  sections: SectionConfig[];
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
}

const COLOR_ACTIVE: Record<string, { text: string; border: string; bg: string; shadow: string }> = {
  orange: {
    text: 'text-orange-400',
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    shadow: '0 0 20px rgba(249,115,22,0.35), 0 4px 16px rgba(0,0,0,0.5)',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    shadow: '0 0 20px rgba(168,85,247,0.35), 0 4px 16px rgba(0,0,0,0.5)',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    shadow: '0 0 20px rgba(59,130,246,0.35), 0 4px 16px rgba(0,0,0,0.5)',
  },
  green: {
    text: 'text-green-400',
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    shadow: '0 0 20px rgba(34,197,94,0.35), 0 4px 16px rgba(0,0,0,0.5)',
  },
  pink: {
    text: 'text-pink-400',
    border: 'border-pink-500/50',
    bg: 'bg-pink-500/10',
    shadow: '0 0 20px rgba(236,72,153,0.35), 0 4px 16px rgba(0,0,0,0.5)',
  },
};

const ACTIVE_BAR_COLOR: Record<string, string> = {
  orange: '#f97316',
  purple: '#a855f7',
  blue: '#3b82f6',
  green: '#22c55e',
  pink: '#ec4899',
};

export default function SectionNav({ sections, activeSection, onSelect }: Props) {
  return (
    <div
      className="relative z-20 px-4 py-3"
      style={{ perspective: '800px', perspectiveOrigin: '50% 150%' }}
    >
      <div className="flex gap-2 max-w-5xl mx-auto">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          const Icon = ICON_MAP[section.icon] || Image;
          const colors = COLOR_ACTIVE[section.color];

          return (
            <motion.button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                rounded-xl text-sm font-medium transition-colors duration-200
                preserve-3d cursor-pointer border
                ${isActive
                  ? `${colors.text} ${colors.border} ${colors.bg} glass-panel`
                  : 'text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/10'
                }
              `}
              style={{
                boxShadow: isActive ? colors.shadow : '0 2px 8px rgba(0,0,0,0.3)',
              }}
              animate={{
                rotateX: isActive ? 0 : 5,
                translateZ: isActive ? 8 : 0,
                y: isActive ? -2 : 0,
              }}
              whileHover={{
                rotateX: 0,
                translateZ: isActive ? 8 : 4,
                y: -1,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.shortLabel}</span>

              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
                  style={{
                    width: '60%',
                    transform: 'translateX(-50%)',
                    background: ACTIVE_BAR_COLOR[section.color],
                    boxShadow: `0 0 8px ${ACTIVE_BAR_COLOR[section.color]}`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
