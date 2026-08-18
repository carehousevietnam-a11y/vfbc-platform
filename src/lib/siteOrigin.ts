const DEFAULT_SITE_ORIGIN = "https://vfbc-platform.vercel.app";

function normalizeOrigin(value: string | undefined): string | null {
  const cleaned = value?.trim().replace(/\/+$/, "") ?? "";
  return cleaned || null;
}

export function getSiteOrigin(): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_ORIGIN;
}
