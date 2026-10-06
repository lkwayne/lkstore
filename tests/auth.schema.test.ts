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

import { forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth.schema";

describe("forgotPasswordSchema", () => {
  it("accepte un email valide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.cm" }).success).toBe(true);
  });
  it("refuse un email invalide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "pas-un-email" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepte deux mots de passe identiques de 8 caractères ou plus", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "motdepasse1", confirmPassword: "motdepasse1" }).success
    ).toBe(true);
  });
  it("refuse un mot de passe trop court", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "court", confirmPassword: "court" }).success
    ).toBe(false);
  });
  it("refuse deux mots de passe différents", () => {
    const r = resetPasswordSchema.safeParse({ password: "motdepasse1", confirmPassword: "motdepasse2" });
    expect(r.success).toBe(false);
  });
});
