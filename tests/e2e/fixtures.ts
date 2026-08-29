import { test as base } from "@playwright/test";

// Emulate reduced motion for every test: entrance animations start at
// opacity 0, and without this axe can measure colours mid-fade and report
// false contrast failures. It also exercises the reduced-motion CSS path.
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await runTest(page);
  },
});

export { expect } from "@playwright/test";
