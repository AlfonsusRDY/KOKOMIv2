import { NextResponse } from "next/server";
import { getAggregatedLatestItems } from "@/lib/aggregator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const results = await getAggregatedLatestItems(page);
    return NextResponse.json({
      page,
      type: "aggregated",
      results,
      source: "multi",
    });
  } catch (error) {
    console.error("Failed to fetch pustaka:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
