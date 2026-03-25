import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServiceClient } from "@/lib/supabase"

const SYSTEM_PROMPT = `You are a hook writer for "Ancient India by SAANSE" — an Instagram channel about Hindu mythology.

Hook rules:
- Max 15 words for the opening line
- Must create immediate tension, curiosity, or emotion
- Never start with "Did you know" or "In this video"
- Channel voice: quiet, reverent, depth-first. Never clickbait.
- Bilingual OK — use Hindi words when they add texture`

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Write 5 hooks for a post about: ${topic}

Write one hook of each style:

1. **Myth-buster** — challenges a common misconception about ${topic}
2. **Declarative** — bold, confident statement about ${topic}
3. **Scene-setter** — opens with a vivid visual scene from ${topic}
4. **Character-lead** — opens with a character's action or state from ${topic}
5. **Common-belief** — opens with what most people (wrongly) believe about ${topic}

Format each as:
**[Style]**
"[Hook text]"
Why it works: [1 line explanation]`,
      }],
    })

    const output = msg.content[0].type === "text" ? msg.content[0].text : ""

    const supabase = createServiceClient()
    await supabase.from("ai_generations").insert({
      type: "hooks",
      input: { topic },
      output,
    })

    return NextResponse.json({ output })
  } catch (err) {
    console.error("Hooks generation error:", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
