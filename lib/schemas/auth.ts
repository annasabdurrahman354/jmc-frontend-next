import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username/email/HP wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/^\S+$/, "Password tidak boleh mengandung spasi")
  .regex(/[A-Z]/, "Password harus ada minimal 1 huruf besar")
  .regex(/[a-z]/, "Password harus ada minimal 1 huruf kecil")
  .regex(/[^A-Za-z0-9]/, "Password harus ada minimal 1 karakter khusus");

export const usernameSchema = z
  .string()
  .min(6, "Username minimal 6 karakter")
  .regex(/^[a-z0-9]+$/, "Username hanya boleh huruf kecil dan angka, tanpa spasi")
  .max(50, "Username maksimal 50 karakter");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
