import { describe, expect, it } from "vitest";
import { guessLinkType, linkTypeMeta, LINK_TYPES } from "@/lib/link-types";

describe("guessLinkType", () => {
  it("recognises common platforms from the URL", () => {
    expect(guessLinkType("https://www.tiktok.com/@daniel")).toBe("tiktok");
    expect(guessLinkType("https://instagram.com/daniel")).toBe("instagram");
    expect(guessLinkType("https://youtu.be/abc")).toBe("youtube");
    expect(guessLinkType("https://wa.me/62812")).toBe("whatsapp");
    expect(guessLinkType("https://shopee.co.id/product/1/2")).toBe("shop");
  });

  it("falls back to link for anything else", () => {
    expect(guessLinkType("https://example.com")).toBe("link");
  });
});

describe("linkTypeMeta", () => {
  it("returns a known type or the default", () => {
    expect(linkTypeMeta("instagram").icon).toBe("instagram");
    expect(linkTypeMeta("nope")).toBe(LINK_TYPES[0]);
  });
});
