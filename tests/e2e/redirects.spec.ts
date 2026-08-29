import { expect, test } from "./fixtures";

const cases: [string, string][] = [
  ["/sample-page", "/"],
  ["/2026/06/11/hello-world", "/"],
  ["/category/uncategorized", "/members"],
  ["/tag/anything", "/members"],
  ["/feed", "/"],
  ["/wp-sitemap.xml", "/sitemap.xml"],
  ["/post-sitemap1.xml", "/sitemap.xml"],
  ["/sitemap_index.xml", "/sitemap.xml"],
  ["/wp-admin", "/admin"],
  ["/wp-admin/options.php", "/admin"],
  ["/wp-login.php", "/admin"],
];

for (const [from, to] of cases) {
  test(`301 ${from} -> ${to}`, async ({ request }) => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers()["location"], "http://localhost").pathname).toBe(to);
  });
}

test("/pelanggaran is a real page, not a redirect", async ({ page }) => {
  const res = await page.goto("/pelanggaran");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /gak usah panik/i })).toBeVisible();
});

test("/wp-content paths are not caught by redirects", async ({ request }) => {
  // No LEGACY_MEDIA_ORIGIN in tests, so this 404s - but it must NOT 301.
  const res = await request.get("/wp-content/uploads/x.jpg", { maxRedirects: 0 });
  expect(res.status()).not.toBe(301);
});
