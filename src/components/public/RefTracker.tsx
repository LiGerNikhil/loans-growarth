"use client";

import { useEffect } from "react";

const REF_PATTERN = /^GCC-CNR-\d{4}$/;
const COOKIE_NAME = "gcc_ref";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function setCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function RefTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim();
    if (ref && REF_PATTERN.test(ref)) {
      setCookie(ref);
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  return null;
}
