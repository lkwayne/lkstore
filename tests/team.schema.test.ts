import { describe, expect, it } from "vitest";
import { teamMemberSchema } from "@/schemas/team.schema";

const base = { firstName: "Awa", lastName: "Ngono", email: "AWA@Example.com", role: "MANAGER" };

describe("teamMemberSchema", () => {
  it("accepte un membre valide et normalise l'email", () => {
    const r = teamMemberSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("awa@example.com");
  });
  it("permet de nommer un autre super administrateur", () => {
    expect(teamMemberSchema.safeParse({ ...base, role: "SUPER_ADMIN" }).success).toBe(true);
  });
  it("refuse le rôle CUSTOMER et les rôles inconnus", () => {
    expect(teamMemberSchema.safeParse({ ...base, role: "CUSTOMER" }).success).toBe(false);
    expect(teamMemberSchema.safeParse({ ...base, role: "ROOT" }).success).toBe(false);
  });
  it("refuse un email invalide", () => {
    expect(teamMemberSchema.safeParse({ ...base, email: "pas-un-email" }).success).toBe(false);
  });
});
