"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tmkokomi-onboarding-notice-dismissed";

export default function OnboardingNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close onboarding notice"
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(0,0,0,0.68)" }}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative w-full max-w-md rounded-lg p-6 shadow-float"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--accent-border)",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase" style={{ color: "var(--accent)" }}>
              TMKOKOMI Beta
            </p>
            <h2 id="onboarding-title" className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
              Welcome
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold"
            style={{ background: "var(--bg-raised)", color: "var(--text-secondary)" }}
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="space-y-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          <p>People can use Email or Username with Password to sign in to your account.</p>
          <p>This site is Beta, so it may have bugs. Please report anything you find.</p>
          <p>Help us share the site to more people if you like it.</p>
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-md text-sm font-black uppercase"
          style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          Start reading
        </button>
      </div>
    </div>
  );
}
