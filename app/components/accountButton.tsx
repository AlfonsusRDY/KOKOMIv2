"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "./authProvider";

type Mode = "signin" | "signup";

export default function AccountButton() {
  const { user, loading, configured, signIn, signUp, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || "TM";
    return source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TM";
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      setOpen(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke akun.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border text-sm font-black transition-opacity hover:opacity-80"
        style={{
          background: user ? "var(--accent-subtle)" : "var(--bg-raised)",
          borderColor: user ? "var(--accent-border)" : "var(--border-strong)",
          color: user ? "var(--accent)" : "var(--text-primary)",
        }}
        aria-label="Account"
      >
        {loading ? "..." : initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] rounded-lg p-4 shadow-float"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          {user ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {user.displayName || "Reader"}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="w-full rounded-md px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-1 rounded-md p-1" style={{ background: "var(--bg-raised)" }}>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="rounded px-3 py-2 text-xs font-semibold"
                  style={{
                    background: mode === "signin" ? "var(--bg-surface)" : "transparent",
                    color: mode === "signin" ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="rounded px-3 py-2 text-xs font-semibold"
                  style={{
                    background: mode === "signup" ? "var(--bg-surface)" : "transparent",
                    color: mode === "signup" ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  Register
                </button>
              </div>

              {!configured && (
                <p className="rounded-md px-3 py-2 text-xs" style={{ background: "var(--warning)", color: "#111113" }}>
                  Isi env Firebase dulu untuk mengaktifkan akun.
                </p>
              )}

              {mode === "signup" && (
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Display name"
                />
              )}
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Email"
                type="email"
                required
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Password"
                type="password"
                minLength={6}
                required
              />
              {error && (
                <p className="text-xs" style={{ color: "var(--danger)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={!configured || busy}
                className="w-full rounded-md px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
              >
                {busy ? "Loading..." : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
