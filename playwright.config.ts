import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

/**
 * Minimal QA infrastructure only.
 * - desktop / mobile viewport projects
 * - baseURL via env (default localhost:3010)
 * Not a full regression suite.
 */
export default defineConfig({
  testDir: "./tests/qa",
  // smoke specs + one-shot auth generator (manual path)
  testMatch: [/.*\.spec\.ts/, /generate-storage-state\.ts/],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "desktop",
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
