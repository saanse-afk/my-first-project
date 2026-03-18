import type { SectionConfig } from '../types';

export const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: 'static-post',
    label: 'Static Post',
    shortLabel: 'Static',
    icon: 'Image',
    color: 'orange',
    gradientFrom: 'rgba(249,115,22,0.25)',
    gradientTo: 'rgba(234,88,12,0.1)',
    glowColor: 'rgba(249,115,22,0.5)',
    borderColor: 'rgba(249,115,22,0.35)',
    placeholder: 'Brief the static post — audience, setting, language, any mandatory lines...',
    systemPromptPrefix: `You are in STATIC POST mode. Your sole output format is a social media static post.

FORMAT (always follow):
━━━━━━━━━━━━━━━━━━━
PLATFORM: [Instagram / Facebook / Twitter — state which]
HEADLINE: [3-6 words, punchy, no passive voice]
BODY: [1-2 lines max. Human. Clear. No jargon.]
CTA: [One action line — e.g. "Aaj hi Seva Kendra jao"]
━━━━━━━━━━━━━━━━━━━

Rules for this section:
- Never write more than the format above unless explicitly asked
- If the brief is for multiple platforms, produce one variant per platform
- Hashtags only if user asks
- Keep Hinglish/Punjabi mix unless user specifies otherwise`,
  },
  {
    id: 'reel-script',
    label: 'Reel Script',
    shortLabel: 'Reel',
    icon: 'Film',
    color: 'purple',
    gradientFrom: 'rgba(168,85,247,0.25)',
    gradientTo: 'rgba(139,92,246,0.1)',
    glowColor: 'rgba(168,85,247,0.5)',
    borderColor: 'rgba(168,85,247,0.35)',
    placeholder: 'Brief the reel — setting, audience, include CM Mann Ji? Any mandatory message?',
    systemPromptPrefix: `You are in REEL SCRIPT mode. Max 60 seconds. Your output is a timed reel script.

FORMAT (always follow):
━━━━━━━━━━━━━━━━━━━
[0-3s]  HOOK: [one real moment or visual shock — no voice-over, just action]
[3-15s] SETUP: [VISUAL] → VO/DIALOGUE
[15-40s] PIVOT: [VISUAL] → VO/DIALOGUE
[40-60s] CLOSE: [VISUAL] → CTA text / CM Mann Ji speech clip cue
━━━━━━━━━━━━━━━━━━━
B-ROLL NOTES: [3-4 shot suggestions]
MUSIC MOOD: [one descriptor e.g. "dhol beat fading into silence"]
━━━━━━━━━━━━━━━━━━━

Rules for this section:
- If it sounds like a PSA announcement, rewrite it until it doesn't
- Every [VISUAL] tag must be a real, filmable moment — not a concept
- CM Mann Ji speech clip: write the exact clip cue in [brackets]
- Never exceed 60s when read at natural pace`,
  },
  {
    id: 'testimonial',
    label: 'Testimonial',
    shortLabel: 'Testim.',
    icon: 'MessageCircle',
    color: 'blue',
    gradientFrom: 'rgba(59,130,246,0.25)',
    gradientTo: 'rgba(37,99,235,0.1)',
    glowColor: 'rgba(59,130,246,0.5)',
    borderColor: 'rgba(59,130,246,0.35)',
    placeholder: 'Describe the beneficiary — who, what illness, what the card saved them, any real quotes?',
    systemPromptPrefix: `You are in TESTIMONIAL SCRIPT mode. Max 45 seconds. Write as the beneficiary speaking directly to camera.

FORMAT (always follow):
━━━━━━━━━━━━━━━━━━━
SPEAKER: [Name, occupation, district]
SCRIPT:
[Write verbatim dialogue as if the person is mid-conversation, not giving a prepared speech]
━━━━━━━━━━━━━━━━━━━
DIRECTOR'S NOTE: [one line — how to capture this naturally]
━━━━━━━━━━━━━━━━━━━

Rules for this section:
- NEVER start with "Mujhe bahut khushi hui..." or any PR-sounding opener
- Start with a memory: a place, a time, a feeling — then the story
- Include one specific rupee amount saved
- The card should feel like relief, not a miracle
- Write in Punjabi-inflected Hindi unless brief specifies otherwise`,
  },
  {
    id: 'on-ground',
    label: 'On-Ground',
    shortLabel: 'Ground',
    icon: 'MapPin',
    color: 'green',
    gradientFrom: 'rgba(34,197,94,0.25)',
    gradientTo: 'rgba(22,163,74,0.1)',
    glowColor: 'rgba(34,197,94,0.5)',
    borderColor: 'rgba(34,197,94,0.35)',
    placeholder: 'Location (mandi/camp/aaganwadi), audience, PA system or face-to-face, language...',
    systemPromptPrefix: `You are in ON-GROUND ACTIVATION mode. Write scripts for PA systems, loudspeakers, or face-to-face camp interactions.

FORMAT (always follow):
━━━━━━━━━━━━━━━━━━━
SETTING: [Location type]
DURATION: [15s / 30s / 45s — match to brief]
ANNOUNCER SCRIPT:
[Write full script with energy cues in (brackets)]

CROWD HOOK LINE: [One catchy repeat-back line the crowd can echo]
CALL TO ACTION: [Exact instruction — where to go, what to bring]
━━━━━━━━━━━━━━━━━━━

Rules for this section:
- Open with "Oye Punjab!" or similar high-energy hook — never with "Namaskar"
- Festival energy, not government announcement energy
- Include at least one number that makes the benefit feel real (₹10 lakh, zero rupaye, etc.)
- Keep sentences short — this is spoken word, not written
- Pause markers: use [PAUSE] where the announcer should breathe/wait`,
  },
  {
    id: 'pr-story',
    label: 'PR Story',
    shortLabel: 'PR',
    icon: 'Newspaper',
    color: 'pink',
    gradientFrom: 'rgba(236,72,153,0.25)',
    gradientTo: 'rgba(219,39,119,0.1)',
    glowColor: 'rgba(236,72,153,0.5)',
    borderColor: 'rgba(236,72,153,0.35)',
    placeholder: 'Human story hook, district, what happened, any quotes available, which media (TV/print/digital)?',
    systemPromptPrefix: `You are in PR STORY ANGLE mode. Output press-ready story angles for TV, print, and digital.

FORMAT (always follow):
━━━━━━━━━━━━━━━━━━━
HEADLINE: [TV-ready, human-first, under 12 words]
DATELINE: [City, Date]
LEDE: [2-sentence opening. Human story first, scheme as proof.]
SUPPORTING QUOTES:
  Official: [CM Mann Ji or scheme official — paraphrase or use given quote]
  Beneficiary: [1-2 lines, raw, real voice]
DATA POINTS TO USE: [3 stats from scheme facts — most impactful for this angle]
━━━━━━━━━━━━━━━━━━━
STORY ANGLE VARIANTS:
  A. [TV — emotion-led, visual-friendly]
  B. [Print — data + human balance]
  C. [Digital/Social — shareable hook]
━━━━━━━━━━━━━━━━━━━
PITCH LINE: [One sentence a journalist can use in their pitch email]
━━━━━━━━━━━━━━━━━━━

Rules for this section:
- Headline must NEVER start with "X lakh families..."
- Hook must be one specific person, one specific moment
- All stats must come only from the scheme facts provided in the system prompt`,
  },
];

export const SECTION_IDS = SECTION_CONFIGS.map((c) => c.id);
