import type { NextConfig } from "next";

/**
 * 옛 화면 → 새 /verify 화면. 한 곳에서 12개를 같이 관리한다(쿼리스트링은 그대로 전달됨).
 * 옛 페이지 파일은 지우지 않는다. 일괄 폐기는 새 화면 완료 후 따로 한다.
 */
const LEGACY_TO_VERIFY: ReadonlyArray<readonly [string, string]> = [
  ["/check/trc", "/verify/trc"],
  ["/check/wp", "/verify/wp"],
  ["/check/tamtru", "/verify/tamtru"],
  ["/check/driving-license", "/verify/license"],
  ["/register/company", "/verify/company"],
  ["/register/restaurant", "/verify/restaurant"],
  ["/register/fire-safety", "/verify/fire"],
  ["/register/hygiene", "/verify/hygiene"],
  ["/register/environment", "/verify/environment"],
  ["/register/cosmetics", "/verify/cosmetics"],
  ["/register/medical-device", "/verify/medical"],
  ["/register/franchise", "/verify/franchise"],
];

const FIRST_SCREEN_REWRITES = [
  { source: "/", destination: "/lp/check/index.html" },
  { source: "/biz", destination: "/lp/biz/index.html" },
  { source: "/styles.css", destination: "/lp/check/styles.css" },
  { source: "/main.js", destination: "/lp/check/main.js" },
  {
    source: "/assets/my_viet_check_cinematic_hero.mp4",
    destination: "/lp/check/assets/my_viet_check_cinematic_hero.mp4",
  },
  { source: "/bis.css", destination: "/lp/biz/bis.css" },
  { source: "/bis.js", destination: "/lp/biz/bis.js" },
  { source: "/assets/bis-hero.mp4", destination: "/lp/biz/assets/bis-hero.mp4" },
];

const nextConfig: NextConfig = {
  /** Dev-only: allow HMR / _next dev assets when the page is opened at 127.0.0.1 (embedded browsers). */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return { beforeFiles: FIRST_SCREEN_REWRITES, afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [
      { source: "/MY%20VIET%20BIZ.html", destination: "/biz", permanent: false },
      { source: "/MY%20VIET%20CHECK.html", destination: "/", permanent: false },
      ...LEGACY_TO_VERIFY.map(([source, destination]) => ({
        source,
        destination,
        permanent: false,
      })),
      {
        source: "/answers/:slug",
        destination: "/guide/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
