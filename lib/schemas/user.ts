import { z } from "zod";
import { passwordSchema, usernameSchema } from "./auth";

export const userCreateSchema = z.object({
  idPegawai: z.number().int().positive("Pilih pegawai"),
  username: usernameSchema,
  password: passwordSchema,
  idRole: z.number().int().positive("Pilih role"),
  disabled: z.boolean(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z
  .object({
    idRole: z.number().int().positive().optional(),
    nama: z.string().min(1).optional(),
    email: z.string().email().optional().or(z.literal("")),
    disabled: z.boolean().optional(),
  })
  .strict();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
