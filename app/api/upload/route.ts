import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { parseCSV, deduplicatePosts } from "@/lib/csv-parser"
import Anthropic from "@anthropic-ai/sdk"

const CLASSIFY_BATCH_SIZE = 10

async function classifyPosts(
  posts: Array<{ platform_post_id: string; title: string | null; full_caption: string | null }>
) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return {}

  const anthropic = new Anthropic({ apiKey })

  const results: Record<string, { topic: string; content_type: string; hook_type: string }> = {}

  // Process in batches to avoid rate limits
  for (let i = 0; i < posts.length; i += CLASSIFY_BATCH_SIZE) {
    const batch = posts.slice(i, i + CLASSIFY_BATCH_SIZE)
    const postsText = batch
      .map(
        (p, idx) =>
          `Post ${idx + 1} (ID: ${p.platform_post_id}):
Title: ${p.title || "N/A"}
Caption: ${p.full_caption || "N/A"}`
      )
      .join("\n\n---\n\n")

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Classify each Instagram post for the channel "Ancient India by SAANSE" (Hindu mythology content).

For each post, determine:
1. topic: one of [Krishna/Vishnu, Shiva, Ramayana, Devi/Shakti, Mahabharata, Vedas/Philosophy, Festival, General]
2. content_type: one of [concept, story, festival, narrative]
3. hook_type: one of [myth_buster, declarative, scene_setter, character_lead, common_belief, name_first, timely]

Definitions:
- myth_buster: opening challenges a common misconception ("X is not what you think")
- declarative: bold statement of fact ("The Vedas are not stories")
- scene_setter: sets a visual/atmospheric scene ("In the vast cosmic ocean...")
- character_lead: leads with a character action ("She does not arrive to ask")
- common_belief: references what most people believe ("Most people think...")
- name_first: starts with the deity/character name ("Krishna has always been...")
- timely: references a festival or current event ("Tonight is Mahashivratri")

Posts to classify:
${postsText}

Respond ONLY with a JSON array like:
[
  {"id": "POST_ID_1", "topic": "Krishna/Vishnu", "content_type": "story", "hook_type": "myth_buster"},
  ...
]`,
          },
        ],
      })

      const text = msg.content[0].type === "text" ? msg.content[0].text : ""
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const classified = JSON.parse(jsonMatch[0]) as Array<{
          id: string
          topic: string
          content_type: string
          hook_type: string
        }>
        for (const c of classified) {
          results[c.id] = {
            topic: c.topic,
            content_type: c.content_type,
            hook_type: c.hook_type,
          }
        }
      }
    } catch (err) {
      console.error("Classification batch error:", err)
    }
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const csvText = await file.text()
    const parsed = parseCSV(csvText)
    const unique = deduplicatePosts(parsed)

    if (unique.length === 0) {
      return NextResponse.json({ error: "No valid posts found in CSV" }, { status: 400 })
    }

    // Classify posts via Claude
    const classifications = await classifyPosts(
      unique.map((p) => ({
        platform_post_id: p.platform_post_id,
        title: p.title,
        full_caption: p.full_caption,
      }))
    )

    // Merge classifications
    const postsToInsert = unique.map((p) => ({
      ...p,
      topic: classifications[p.platform_post_id]?.topic || null,
      content_type: classifications[p.platform_post_id]?.content_type || null,
      hook_type: classifications[p.platform_post_id]?.hook_type || null,
    }))

    // Upsert to Supabase
    const supabase = createServiceClient()
    const { error, data: upsertedData } = await supabase
      .from("posts")
      .upsert(postsToInsert, {
        onConflict: "platform_post_id",
        ignoreDuplicates: false,
      })
      .select("id")
    const count = upsertedData?.length ?? null

    if (error) {
      console.error("Supabase upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      parsed: unique.length,
      upserted: count ?? unique.length,
      classified: Object.keys(classifications).length,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}
