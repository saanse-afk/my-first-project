import Anthropic from '@anthropic-ai/sdk'
import type {
  TopicPerformance,
  FormatPerformance,
  HookPerformance,
  PostWithMetrics,
  Festival,
  GenerateScriptInput,
  GenerateScriptOutput,
  GenerateCaptionInput,
  CaptionVariation,
  GenerateHooksInput,
  HookVariation,
  ContentRecommendation,
  Topic,
  ContentType,
  HookType,
} from '@/types'
import { truncate } from './utils'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-20250514'

const SYSTEM_PROMPT = `You are a content strategist for "Ancient India by SAANSE", an Instagram channel that tells stories of Hindu mythology in 60-second AI videos and carousel posts.

Channel voice: Quiet, reverent, never preachy. Stories told as if sitting beside a river at dusk. Bilingual Hindi-English capability. Never uses "Did you know?" or clickbait. The hook creates tension or challenges a common belief, then the story unfolds naturally.

Key data insights from the channel:
- Myth-buster hooks ("X is not what you think") drive 6/8 viral posts (100K+ views)
- Carousels work best for concept explainers (avg score 38.1 vs video 7.6)
- Videos/Reels work best for emotional stories and festival content
- Krishna/Vishnu content outperforms at 1.4x baseline engagement
- Shiva content underperforms (0.7x) unless using myth-buster hooks
- Monday-Tuesday are the strongest posting days (2.4x vs Friday)
- Common belief openers ("Most people think...") are underused but score 21.9
- Character-lead hooks score well for devotion/relationship stories

When generating content, always specify: topic, format (reel/carousel), hook type, and the data reasoning behind your recommendation.`

/**
 * Classify a post's topic, content_type, and hook_type from its caption.
 */
export async function classifyPost(caption: string): Promise<{
  topic: Topic
  content_type: ContentType
  hook_type: HookType
}> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Classify this Instagram post caption into:
1. topic: one of [Krishna/Vishnu, Shiva, Ramayana, Devi/Shakti, Mahabharata, Vedas/Philosophy, Festival, General]
2. content_type: one of [concept, story, festival, narrative]
3. hook_type: one of [myth_buster, declarative, scene_setter, character_lead, common_belief, name_first, timely_intro, question]

Caption: ${truncate(caption, 500)}

Return JSON only: {"topic": "...", "content_type": "...", "hook_type": "..."}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  try {
    return JSON.parse(text.trim())
  } catch {
    return { topic: 'General', content_type: 'story', hook_type: 'declarative' }
  }
}

/**
 * Generate a video/reel script using channel data context.
 */
export async function generateScript(
  input: GenerateScriptInput,
  topPosts: PostWithMetrics[],
  hookPerformance: HookPerformance[],
  upcomingFestivals: Festival[]
): Promise<GenerateScriptOutput> {
  const topPostsContext = topPosts.slice(0, 5).map((p) => ({
    title: truncate(p.title, 80),
    hook_type: p.hook_type,
    score: p.latest_metrics?.engagement_score,
  }))

  const bestHook = hookPerformance[0]
  const festivalContext = upcomingFestivals.length > 0
    ? `Upcoming festivals: ${upcomingFestivals.map((f) => `${f.name} (${f.date})`).join(', ')}`
    : 'No major festivals in the next 21 days.'

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a ${input.duration}-second ${input.format} script about "${input.topic}"${input.subTopic ? ` — specifically: ${input.subTopic}` : ''}.

Top-performing posts for this topic:
${JSON.stringify(topPostsContext, null, 2)}

Best hook type for this content: ${bestHook?.hook_type || 'myth_buster'} (avg score: ${bestHook?.avg_engagement_score || 'N/A'})
Tone: ${input.tone || 'reverent and quiet'}
${festivalContext}

Return a JSON object with exactly these keys:
{
  "hook": "First 3 seconds — the opening line",
  "body": "Main story beats (paragraph form)",
  "cta": "Closing call to action",
  "music_mood": "Suggested music mood/style",
  "reasoning": "Why this approach works based on the data"
}

Return JSON only.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  try {
    return JSON.parse(text.trim())
  } catch {
    return {
      hook: 'Unable to parse response.',
      body: text,
      cta: '',
      music_mood: '',
      reasoning: '',
    }
  }
}

/**
 * Generate 3 caption variations for a post.
 */
export async function generateCaptions(
  input: GenerateCaptionInput
): Promise<CaptionVariation[]> {
  const hashtagCount = input.hashtag_density === 'low' ? 5 : input.hashtag_density === 'medium' ? 15 : 25

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate 3 caption variations for an Instagram post about "${input.topic}".
Key message: ${input.key_message}
Hashtag count: ~${hashtagCount} per caption

Return a JSON array with exactly 3 objects:
[
  {
    "caption": "Full caption text",
    "hashtags": ["tag1", "tag2"],
    "optimized_for": "shares|saves|comments",
    "tone": "Brief tone description"
  }
]

Variation 1: Optimized for shares (provocative, myth-buster angle)
Variation 2: Optimized for saves (informative, carousel-style, educational)
Variation 3: Optimized for comments (emotional, community-building, question at end)

Return JSON only.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  try {
    return JSON.parse(text.trim())
  } catch {
    return []
  }
}

/**
 * Generate 5 hook variations for a topic + angle.
 */
export async function generateHooks(
  input: GenerateHooksInput,
  hookPerformance: HookPerformance[]
): Promise<HookVariation[]> {
  const hookScores = hookPerformance.reduce(
    (acc, h) => ({ ...acc, [h.hook_type]: h.avg_engagement_score }),
    {} as Record<string, number>
  )

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate 5 hook variations for a post about "${input.topic}" with this angle: "${input.angle}".

Channel hook performance data (avg engagement scores):
${JSON.stringify(hookScores, null, 2)}

Generate one hook for each type: myth_buster, common_belief, scene_setter, character_lead, declarative.

Return a JSON array:
[
  {
    "hook": "The opening line (1-2 sentences, max 15 words)",
    "hook_type": "myth_buster|common_belief|scene_setter|character_lead|declarative",
    "avg_score": <number from the performance data>,
    "reasoning": "Why this works for this topic"
  }
]

Return JSON only.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  try {
    return JSON.parse(text.trim())
  } catch {
    return []
  }
}

/**
 * Generate weekly content recommendations based on full channel analytics.
 */
export async function generateRecommendations(params: {
  topicPerformance: TopicPerformance[]
  formatPerformance: FormatPerformance[]
  hookPerformance: HookPerformance[]
  recentPosts: PostWithMetrics[]
  upcomingFestivals: Festival[]
  overallAvgScore: number
}): Promise<ContentRecommendation[]> {
  const recentPostsSummary = params.recentPosts.slice(0, 10).map((p) => ({
    title: truncate(p.title, 60),
    topic: p.topic,
    format: p.post_type,
    hook: p.hook_type,
    score: p.latest_metrics?.engagement_score,
    published_at: p.published_at?.slice(0, 10),
  }))

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Based on this channel's performance data, generate 5 specific content recommendations for this week.

CHANNEL DATA:
Topic performance (sorted by engagement score):
${JSON.stringify(params.topicPerformance, null, 2)}

Format performance:
${JSON.stringify(params.formatPerformance, null, 2)}

Hook performance:
${JSON.stringify(params.hookPerformance, null, 2)}

Last 10 posts:
${JSON.stringify(recentPostsSummary, null, 2)}

Upcoming festivals (next 21 days):
${JSON.stringify(params.upcomingFestivals.map((f) => ({ name: f.name, date: f.date, deity: f.deity, suggestions: f.content_suggestions })), null, 2)}

Overall avg engagement score: ${params.overallAvgScore}
Best posting days: Monday, Tuesday
Current weakness: Shiva content underperforms (use myth-buster hook to fix)

For each recommendation, be SPECIFIC — don't say "post about Krishna", say "Sudama visiting Dwaraka, the friendship that needed no words".

Return a JSON array of 5 objects:
[
  {
    "rank": 1,
    "topic": "Specific topic name",
    "story_angle": "The specific story or angle to explore",
    "format": "reel|carousel",
    "hook_type": "myth_buster|declarative|scene_setter|character_lead|common_belief|name_first|timely_intro|question",
    "suggested_opening": "The exact first line of the post",
    "best_day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
    "best_time": "e.g. 7-9 PM IST",
    "predicted_engagement": "e.g. 2.1x baseline",
    "festival_connection": "Festival name or null",
    "data_reasoning": "Specific data points supporting this recommendation"
  }
]

Return JSON only.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  try {
    return JSON.parse(text.trim())
  } catch {
    return []
  }
}
