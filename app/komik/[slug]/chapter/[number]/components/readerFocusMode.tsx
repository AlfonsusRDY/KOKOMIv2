"use client";

import { useEffect, useRef } from "react";

const FOCUS_IDLE_DELAY = 1100;

export default function ReaderFocusMode() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const showChrome = () => {
      root.dataset.readerFocus = "false";
    };

    const enterFocus = () => {
      root.dataset.readerFocus = "true";

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(showChrome, FOCUS_IDLE_DELAY);
    };

    root.dataset.readerRoute = "true";
    showChrome();

    window.addEventListener("scroll", enterFocus, { passive: true });
    window.addEventListener("wheel", enterFocus, { passive: true });
    window.addEventListener("touchmove", enterFocus, { passive: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        enterFocus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      window.removeEventListener("scroll", enterFocus);
      window.removeEventListener("wheel", enterFocus);
      window.removeEventListener("touchmove", enterFocus);
      window.removeEventListener("keydown", onKeyDown);
      delete root.dataset.readerRoute;
      delete root.dataset.readerFocus;
    };
  }, []);

  return null;
}
