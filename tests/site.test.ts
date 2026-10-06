import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl, toJsonLd } from "@/config/site";

const original = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = original;
});

describe("getSiteUrl", () => {
  it("retire le slash final", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://senduu.cm///";
    expect(getSiteUrl()).toBe("https://senduu.cm");
  });
  it("retombe sur l'adresse actuelle sans variable", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(getSiteUrl()).toBe("https://lkstore-ten.vercel.app");
  });
});

describe("toJsonLd", () => {
  it("neutralise les balises pour éviter toute injection", () => {
    const out = toJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toContain("script");
  });
});
