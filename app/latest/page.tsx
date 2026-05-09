import * as React from "react";
import { getAggregatedLatestItems } from "@/lib/aggregator";
import LatestClient from "./LatestClient";

export const metadata = {
  title: "Latest Updates - TMKOKOMI",
  description: "Read the latest manga, manhwa, and manhua updates.",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function LatestPage() {
  const [data1, data2] = await Promise.all([
    getAggregatedLatestItems(1).catch(() => []),
    getAggregatedLatestItems(2).catch(() => []),
  ]);
  const initialData = [...data1, ...data2];

  return (
    <div className="min-h-screen">
      <LatestClient initialData={initialData} />
    </div>
  );
}
