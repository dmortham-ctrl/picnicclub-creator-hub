import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const pages = ["/", "/members", "/privacy", "/admin"];

for (const path of pages) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    const detail = serious.flatMap((v) =>
      v.nodes.map((n) => `${v.id} @ ${n.target.join(" ")} :: ${n.failureSummary?.split("\n").pop()}`),
    );
    expect(detail, detail.join("\n")).toEqual([]);
  });
}

test("minisite has no serious accessibility violations", async ({ page }) => {
  await page.goto("/members");
  const href = await page.locator("a.creator-card").first().getAttribute("href");
  await page.goto(href!);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
