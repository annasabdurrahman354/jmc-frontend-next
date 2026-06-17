import { z } from "zod";

export const settingTunjanganSchema = z
  .object({
    baseFare: z.coerce
      .number()
      .int("Tarif harus berupa bilangan bulat")
      .positive("Tarif harus lebih dari 0"),
    berlakuMulai: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
    minKm: z.coerce
      .number()
      .int("Minimal Km harus berupa bilangan bulat")
      .min(0, "Minimal 0"),
    maxKm: z.coerce
      .number()
      .int("Maksimum Km harus berupa bilangan bulat")
      .min(0, "Minimal 0"),
  })
  .refine((data) => data.minKm < data.maxKm, {
    message: "Minimum Km harus kurang dari Maksimum Km",
    path: ["maxKm"],
  });

export type SettingTunjanganInput = z.infer<typeof settingTunjanganSchema>;
