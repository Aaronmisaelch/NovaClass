"use client";

// A plain in-memory cache living outside React state, so it survives a
// view's unmount/remount across client-side navigation (it only resets on a
// full page reload). Each "*View" component seeds its initial state from
// here instead of null, so switching back to a module already visited this
// session renders instantly with the last-known data while a fresh fetch
// quietly updates it in the background — no loading flash on every visit.
const cache = new Map<string, unknown>();

export function getCachedView<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCachedView<T>(key: string, value: T): void {
  cache.set(key, value);
}
