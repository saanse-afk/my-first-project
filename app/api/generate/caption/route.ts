import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServiceClient } from "@/lib/supabase"

const SYSTEM_PROMPT = `You are a caption writer for "Ancient India by SAANSE" — an Instagram channel about Hindu mythology.

Voice: Quiet, reverent, bilingual Hindi-English. Never clickbait. Depth over hype.
Caption style: Short lines, white space, emotional punch. Ends with a question or reflection.
Hashtags: 8-12 relevant hashtags. Mix of specific (hinduism, krishna) and broad (spirituality, ancientindia).`

export async function POST(req: NextRequest) {
  try {
    const { topic, keyMessage } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Write 3 Instagram caption variations for:

Topic: ${topic}
Key message: ${keyMessage}

Each caption should:
- Open with a line that earns the read
- Use short paragraphs or single lines with line breaks
- Include 1-2 Hindi/Sanskrit words naturally
- End with a reflective question or single-line CTA
- Include 8-12 hashtags at the end

Format:
**Caption 1** — [style label e.g. "Contemplative"]
[caption text]

**Caption 2** — [style label]
[caption text]

**Caption 3** — [style label]
[caption text]`,
      }],
    })

    const output = msg.content[0].type === "text" ? msg.content[0].text : ""

    const supabase = createServiceClient()
    await supabase.from("ai_generations").insert({
      type: "caption",
      input: { topic, keyMessage },
      output,
    })

    return NextResponse.json({ output })
  } catch (err) {
    console.error("Caption generation error:", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
