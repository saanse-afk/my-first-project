import Anthropic from '@anthropic-ai/sdk'
import { query } from './db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SentimentResult {
  positive_pct: number
  neutral_pct: number
  negative_pct: number
  summary: string
  sample_size: number
  from_cache: boolean
}

export async function analyseSentiment(
  videoId: string,
  comments: string[]
): Promise<SentimentResult> {
  // Check cache — valid if analysed within last 7 days
  const cached = await query<{
    positive_pct: number
    neutral_pct: number
    negative_pct: number
    summary: string
    sample_size: number
  }>(
    `SELECT positive_pct, neutral_pct, negative_pct, summary, sample_size
     FROM comment_sentiment
     WHERE video_id = $1 AND analysed_at > NOW() - INTERVAL '7 days'`,
    [videoId]
  )

  if (cached.rows.length > 0) {
    const row = cached.rows[0]
    return { ...row, from_cache: true }
  }

  const sample = comments.slice(0, 100)
  const prompt = `Analyse the sentiment of these YouTube comments. Return ONLY a valid JSON object — no markdown, no explanation, nothing else.

{
  "positive_pct": number between 0-100,
  "neutral_pct": number between 0-100,
  "negative_pct": number between 0-100,
  "summary": "one sentence describing the overall tone"
}

The three percentages must sum to 100.

Comments:
${sample.join('\n')}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text) as {
    positive_pct: number
    neutral_pct: number
    negative_pct: number
    summary: string
  }

  await query(
    `INSERT INTO comment_sentiment (video_id, positive_pct, neutral_pct, negative_pct, summary, sample_size, analysed_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (video_id) DO UPDATE SET
       positive_pct = EXCLUDED.positive_pct,
       neutral_pct = EXCLUDED.neutral_pct,
       negative_pct = EXCLUDED.negative_pct,
       summary = EXCLUDED.summary,
       sample_size = EXCLUDED.sample_size,
       analysed_at = NOW()`,
    [videoId, parsed.positive_pct, parsed.neutral_pct, parsed.negative_pct, parsed.summary, sample.length]
  )

  return { ...parsed, sample_size: sample.length, from_cache: false }
}
