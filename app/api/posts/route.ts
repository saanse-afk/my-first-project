import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") // all | video | carousel
  const sort = searchParams.get("sort") || "published_at"
  const order = searchParams.get("order") || "desc"
  const limit = parseInt(searchParams.get("limit") || "500", 10)

  const supabase = createServiceClient()
  let query = supabase
    .from("posts")
    .select("*")
    .order(sort, { ascending: order === "asc" })
    .limit(limit)

  if (format === "video") {
    query = query.eq("post_type", "VIDEO")
  } else if (format === "carousel") {
    query = query.eq("post_type", "CAROUSEL_ALBUM")
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
