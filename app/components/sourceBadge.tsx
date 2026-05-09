"use client";

import { SOURCE_META, type SourceId } from "@/types/source.types";

interface SourceBadgeProps {
  sourceId: SourceId;
  /** Show full name vs short name */
  short?: boolean;
  /** Append extra info like views or date */
  meta?: string;
}

export default function SourceBadge({ sourceId, short, meta }: SourceBadgeProps) {
  const s = SOURCE_META[sourceId];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
      style={{ background: s.bgColor, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color }}
      />
      {short ? s.shortName : s.name}
      {meta && (
        <span className="opacity-70 font-normal">{meta}</span>
      )}
    </span>
  );
}
