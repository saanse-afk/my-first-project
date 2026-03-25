import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServiceClient } from "@/lib/supabase"

const SYSTEM_PROMPT = `You are a content writer for "Ancient India by SAANSE" — an Instagram channel about Hindu mythology and ancient Indian wisdom.

Channel voice:
- Quiet, reverent, contemplative
- Bilingual Hindi-English (use Hindi words naturally: dharma, karma, leela, moksha, etc.)
- Never clickbait. Never sensational. Never "you won't believe..."
- Emotional depth over information dump
- Visual storytelling — paint scenes, not bullet points
- Short, impactful sentences

Key data insights from the channel:
- Myth-buster hooks get the highest engagement
- Carousels work for complex concepts; reels work for emotional stories
- Monday-Tuesday posts perform 2.4x better than Friday posts
- Krishna/Vishnu and Mahabharata content outperform
- Scene-setter and character-lead hooks also perform well`

export async function POST(req: NextRequest) {
  try {
    const { topic, subTopic, duration, format } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const durationMap = { "30s": "30 seconds (max 80 words spoken)", "60s": "60 seconds (max 160 words spoken)", "90s": "90 seconds (max 240 words spoken)" }
    const durationText = durationMap[duration as keyof typeof durationMap] || duration

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Write a ${format === "reel" ? "Reel script" : "Carousel script"} for this post:

Topic: ${topic}
Sub-topic / Specific angle: ${subTopic}
Duration: ${durationText}

Structure your response exactly like this:

**HOOK (First 3 seconds)**
[The exact opening words — must stop the scroll]

**BODY**
[The main content, broken into visual beats]

**CTA (Call to Action)**
[Closing line that prompts save/share/comment]

**MUSIC MOOD**
[One line describing the ideal background track energy]`,
      }],
    })

    const output = msg.content[0].type === "text" ? msg.content[0].text : ""

    // Log to database
    const supabase = createServiceClient()
    await supabase.from("ai_generations").insert({
      type: "script",
      input: { topic, subTopic, duration, format },
      output,
    })

    return NextResponse.json({ output })
  } catch (err) {
    console.error("Script generation error:", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
