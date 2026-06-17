import { z } from "zod";
import {
  TINGKAT_PENDIDIKAN,
  STATUS_KAWIN,
  JENIS_KELAMIN,
  STATUS_KONTRAK,
  STATUS_PEGAWAI,
} from "@/lib/types/common";

const CURRENT_YEAR = new Date().getFullYear();

export const pendidikanSchema = z.object({
  tingkatPendidikan: z.enum(TINGKAT_PENDIDIKAN, {
    message: "Jenjang pendidikan wajib dipilih",
  }),
  namaSekolah: z.string().min(1, "Nama sekolah wajib diisi"),
  tahunLulus: z
    .number()
    .int()
    .min(1950, "Tahun lulus minimal 1950")
    .max(CURRENT_YEAR, `Tahun lulus maksimal ${CURRENT_YEAR}`),
});

export type PendidikanInput = z.infer<typeof pendidikanSchema>;

export const pegawaiSchema = z.object({
  nip: z
    .string()
    .min(8, "NIP minimal 8 karakter")
    .regex(/^\d+$/, "NIP hanya boleh berisi angka"),
  namaPegawai: z
    .string()
    .min(1, "Nama pegawai wajib diisi")
    .regex(/^[A-Za-z0-9' ]+$/, "Hanya huruf, angka, spasi, dan apostrof"),
  email: z.string().email("Format email tidak valid"),
  nomorHp: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Format E.164, contoh: +6282218458888"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  idKecamatan: z.number().int().positive("Pilih kecamatan"),
  alamatLengkap: z.string().min(1, "Alamat lengkap wajib diisi"),
  jarakRumahKantor: z
    .number()
    .int()
    .min(0, "Jarak minimal 0")
    .max(99, "Jarak maksimal 99 km"),
  tanggalLahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  statusKawin: z.enum(STATUS_KAWIN, {
    message: "Status kawin wajib dipilih",
  }),
  jumlahAnak: z
    .number()
    .int()
    .min(0, "Minimal 0")
    .max(99, "Maksimal 99"),
  tanggalMasuk: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  idJabatan: z.number().int().positive("Pilih jabatan"),
  idDepartemen: z.number().int().positive("Pilih departemen"),
  jenisKelamin: z.enum(JENIS_KELAMIN, {
    message: "Jenis kelamin wajib dipilih",
  }),
  statusKontrak: z.enum(STATUS_KONTRAK, {
    message: "Status kontrak wajib dipilih",
  }),
  status: z.enum(STATUS_PEGAWAI, {
    message: "Status wajib dipilih",
  }),
  fotoPegawai: z.instanceof(File).optional().nullable(),
  pendidikan: z
    .array(pendidikanSchema)
    .min(1, "Minimal 1 riwayat pendidikan"),
});

export type PegawaiInput = z.infer<typeof pegawaiSchema>;
