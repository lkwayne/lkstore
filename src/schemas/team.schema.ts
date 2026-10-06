import { z } from "zod";
import { STAFF_ROLES } from "@/config/enums";

export const teamMemberSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis"),
  lastName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  phone: z.string().trim().optional(),
  role: z.enum(STAFF_ROLES as [string, ...string[]]),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
