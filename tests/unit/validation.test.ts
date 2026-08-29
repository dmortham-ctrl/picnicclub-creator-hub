import { describe, expect, it } from "vitest";
import {
  isReservedUsername,
  linkSchema,
  linkUrlSchema,
  profileSchema,
  usernameSchema,
} from "@/lib/validation";

describe("usernameSchema", () => {
  it("accepts a normal handle and lowercases it", () => {
    expect(usernameSchema.parse("Nama.Creator")).toBe("nama.creator");
  });

  it("rejects too-short, bad chars, and reserved names", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("has space").success).toBe(false);
    expect(usernameSchema.safeParse("admin").success).toBe(false);
    expect(usernameSchema.safeParse("privacy").success).toBe(false);
  });
});

describe("isReservedUsername", () => {
  it("is case-insensitive", () => {
    expect(isReservedUsername("ADMIN")).toBe(true);
    expect(isReservedUsername("danielhtiktok")).toBe(false);
  });
});

describe("linkUrlSchema", () => {
  it("allows http(s) only", () => {
    expect(linkUrlSchema.safeParse("https://tiktok.com/@x").success).toBe(true);
    expect(linkUrlSchema.safeParse("http://example.com").success).toBe(true);
  });

  it("blocks javascript:, data:, mailto: and junk", () => {
    expect(linkUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
    expect(linkUrlSchema.safeParse("data:text/html,<script>").success).toBe(false);
    expect(linkUrlSchema.safeParse("mailto:a@b.com").success).toBe(false);
    expect(linkUrlSchema.safeParse("not a url").success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("strips unknown keys and applies defaults", () => {
    const parsed = profileSchema.parse({
      username: "creatorx",
      display_name: "Creator X",
      status: "published", // unknown to the schema
    });
    expect(parsed).not.toHaveProperty("status");
    expect(parsed.category).toBe("Lifestyle");
    expect(parsed.bio).toBe("");
  });
});

describe("linkSchema", () => {
  it("defaults link_type to link and validates the url", () => {
    const parsed = linkSchema.parse({ label: "Shop", url: "https://shopee.co.id/x" });
    expect(parsed.link_type).toBe("link");
    expect(parsed.affiliate_disclosure).toBe(false);
  });

  it("rejects an unknown link_type", () => {
    expect(
      linkSchema.safeParse({ label: "x", url: "https://a.com", link_type: "myspace" }).success,
    ).toBe(false);
  });
});
