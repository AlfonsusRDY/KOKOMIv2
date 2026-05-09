import { NextResponse } from "next/server";
import { getAggregatedSearch } from "@/lib/aggregator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!q) {
    return NextResponse.json({
      status: false,
      message: "Missing query",
      keyword: "",
      url: "/search",
      total: 0,
      data: [],
    });
  }

  try {
    return NextResponse.json(await getAggregatedSearch(q, page));
  } catch (error) {
    console.error("Failed to fetch aggregated search:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Search failed",
        keyword: q,
        url: `/search?q=${encodeURIComponent(q)}`,
        total: 0,
        data: [],
      },
      { status: 500 }
    );
  }
}
