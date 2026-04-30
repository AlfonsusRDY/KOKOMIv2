import { NextResponse } from "next/server";
import { getPustaka } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const data = await getPustaka(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch pustaka:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
