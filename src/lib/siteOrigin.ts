/** Production canonical origin. Never use vercel.app as the public SEO URL. */
export const PRODUCTION_ORIGIN = "https://vfbcai.com";

export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return PRODUCTION_ORIGIN;
  const cleaned = raw.replace(/\/+$/, "");
  if (cleaned.includes("vercel.app")) return PRODUCTION_ORIGIN;
  return cleaned;
}
