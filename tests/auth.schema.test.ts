import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/schemas/auth.schema";

describe("loginSchema", () => {
  it("accepte un email et mot de passe valides", () => {
    const result = loginSchema.safeParse({
      email: "jean@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = loginSchema.safeParse({ email: "pas-un-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({ email: "jean@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    firstName: "Jean",
    lastName: "Mballa",
    phone: "690000000",
    email: "jean@example.com",
    password: "secret123",
  };

  it("accepte une inscription complète et valide", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    const result = signupSchema.safeParse({ ...valid, password: "123" });
    expect(result.success).toBe(false);
  });

  it("rejette un numéro de téléphone invalide", () => {
    const result = signupSchema.safeParse({ ...valid, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejette un prénom trop court", () => {
    const result = signupSchema.safeParse({ ...valid, firstName: "J" });
    expect(result.success).toBe(false);
  });
});
