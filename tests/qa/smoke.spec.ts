/**
 * Infrastructure smoke only — proves storageState login works.
 * Not a product regression suite.
 */
import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";

const defaultState = path.join(
  __dirname,
  ".auth",
  "tamtru-reentry-qa-tamtru-existing-20260903.json"
);
const storageStatePath = process.env.QA_STORAGE_STATE ?? defaultState;

test.beforeAll(() => {
  if (!fs.existsSync(storageStatePath)) {
    throw new Error(
      `storageState missing: ${storageStatePath}\n` +
        `Generate once with:\n` +
        `  npx playwright test tests/qa/generate-storage-state.ts --project=desktop`
    );
  }
});

test.use({ storageState: storageStatePath });

test("home header shows logged-in user name", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Desktop header (sm+) shows "…님" on the user menu button
  const userMenu = page.getByRole("button", { name: /님/ });
  await expect(userMenu).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("link", { name: "로그인" })).toHaveCount(0);
});
