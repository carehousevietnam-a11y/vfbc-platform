export function guidePath(
  slug: string,
  options?: { intent?: string; q?: string }
): string {
  const base = `/guide/${slug}`;
  if (!options) return base;
  const params = new URLSearchParams();
  if (options.intent) params.set("intent", options.intent);
  if (options.q?.trim()) params.set("q", options.q.trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
