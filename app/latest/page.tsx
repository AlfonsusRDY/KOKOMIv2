import * as React from "react";
import { getPustaka } from "@/lib/api";
import LatestClient from "./LatestClient";

export const metadata = {
  title: "Latest Updates - TMKOKOMI",
  description: "Read the latest manga, manhwa, and manhua updates.",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function LatestPage() {
  const [data1, data2] = await Promise.all([
    getPustaka(1).catch(() => null),
    getPustaka(2).catch(() => null)
  ]);
  const initialData = [...(data1?.results || []), ...(data2?.results || [])];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <LatestClient initialData={initialData} />
    </div>
  );
}
