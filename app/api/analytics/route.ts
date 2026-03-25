import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import {
  computeKPIs,
  computeWeeklyData,
  computeDayData,
  computeFormatData,
  computeTopicStats,
  computeHookData,
  computeContentMatrix,
  generateInsights,
  generateRecommendations,
} from "@/lib/analytics"

export async function GET() {
  const supabase = createServiceClient()
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const safePostsForClassification = posts || []

  return NextResponse.json({
    kpis: computeKPIs(safePostsForClassification),
    weekly: computeWeeklyData(safePostsForClassification),
    byDay: computeDayData(safePostsForClassification),
    byFormat: computeFormatData(safePostsForClassification),
    byTopic: computeTopicStats(safePostsForClassification),
    byHook: computeHookData(safePostsForClassification),
    contentMatrix: computeContentMatrix(safePostsForClassification),
    insights: generateInsights(safePostsForClassification),
    recommendations: generateRecommendations(safePostsForClassification),
  })
}
