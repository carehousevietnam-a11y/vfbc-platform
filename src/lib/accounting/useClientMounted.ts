"use client";

import { useSyncExternalStore } from "react";

/** Client-only mount gate without setState in useEffect (hydration-safe). */
export function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
