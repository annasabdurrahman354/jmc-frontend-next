import { z } from "zod";

export const tunjanganBulanSchema = z.object({
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2000).max(2100),
});

export type TunjanganBulanInput = z.infer<typeof tunjanganBulanSchema>;
