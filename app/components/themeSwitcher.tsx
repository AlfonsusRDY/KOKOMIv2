"use client";

import { useEffect, useRef, useState } from "react";

type ThemeMode = "original" | "light" | "dark";

const themes: Array<{ id: ThemeMode; label: string; mark: string }> = [
  { id: "original", label: "Original", mark: "O" },
  { id: "light", label: "Light", mark: "L" },
  { id: "dark", label: "Dark", mark: "D" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeMode>("original");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tmkokomi-theme") as ThemeMode | null;
    const next = stored && themes.some((item) => item.id === stored) ? stored : "original";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const setMode = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("tmkokomi-theme", mode);
    document.documentElement.dataset.theme = mode;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md text-lg font-black transition-colors"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Theme"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 7h16M4 17h16" />
          <path d="M8 4v6M16 14v6" />
          <path d="M6.5 4h3M14.5 14h3" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-50 w-72 rounded-lg p-4 shadow-float"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-3 gap-2 rounded-md p-2" style={{ background: 'var(--bg-primary)' }}>
            {themes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className="flex h-12 items-center justify-center rounded-md text-sm font-black transition-colors"
                style={{
                  background: theme === item.id ? 'var(--accent)' : 'transparent',
                  color: theme === item.id ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                }}
                aria-label={`${item.label} theme`}
                title={item.label}
              >
                {item.mark}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
