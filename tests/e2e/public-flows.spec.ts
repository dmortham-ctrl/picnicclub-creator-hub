import { expect, test } from "./fixtures";

test("homepage shows the hero and routes creators to their minisite", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /join as creator/i }).first()).toBeVisible();

  // Founders section links to a minisite
  const firstCreator = page.locator("a.creator-card").first();
  await expect(firstCreator).toHaveAttribute("href", /^\/@/);
});

test("footer legal links resolve", async ({ page }) => {
  await page.goto("/");
  for (const path of ["/privacy", "/terms", "/affiliate-disclosure", "/report"]) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
  }
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /kebijakan privasi/i })).toBeVisible();
});

test("members directory filters by search and shows an empty state", async ({ page }) => {
  await page.goto("/members");
  const cards = page.locator("a.creator-card");
  const initial = await cards.count();
  expect(initial).toBeGreaterThan(0);

  await page.getByLabel("Search creator").fill("zzz-not-a-real-creator");
  await expect(page.getByText(/tidak ada creator/i)).toBeVisible();

  await page.getByRole("button", { name: /reset pencarian/i }).click();
  await expect(cards.first()).toBeVisible();
});

test("minisite renders and unknown / reserved handles 404", async ({ page }) => {
  await page.goto("/members");
  const href = await page.locator("a.creator-card").first().getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!);
  await expect(page.locator(".bio-card h1")).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

  expect((await page.request.get("/@definitely-not-here-123")).status()).toBe(404);
  expect((await page.request.get("/@admin")).status()).toBe(404);
});

test("outbound link redirect bounces an unknown id home", async ({ page }) => {
  const response = await page.goto("/l/00000000-0000-0000-0000-000000000000");
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/");
});

test("private areas redirect to login", async ({ page }) => {
  await page.goto("/userpanel");
  await expect(page).toHaveURL(/\/admin/);
  await page.goto("/superadmin");
  await expect(page).toHaveURL(/\/admin/);
});
