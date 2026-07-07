"use client";

const KEY = "tb-recent-v1";
const MAX = 12;

export function recordRecentlyViewed(productId: string) {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const next = [productId, ...ids.filter((i) => i !== productId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
