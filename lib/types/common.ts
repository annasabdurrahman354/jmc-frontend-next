export const STATUS_KAWIN = ['kawin', 'tidak_kawin'] as const;
export type StatusKawin = (typeof STATUS_KAWIN)[number];

export const STATUS_PEGAWAI = ['Aktif', 'Nonaktif'] as const;
export type StatusPegawai = (typeof STATUS_PEGAWAI)[number];

export const STATUS_KONTRAK = ['PKWTT', 'PKWT', 'Magang'] as const;
export type StatusKontrak = (typeof STATUS_KONTRAK)[number];

export const JENIS_KELAMIN = ['L', 'P'] as const;
export type JenisKelamin = (typeof JENIS_KELAMIN)[number];

export const TINGKAT_PENDIDIKAN = [
  'SD',
  'SMP',
  'SMA',
  'D1',
  'D2',
  'D3',
  'S1',
  'S2',
  'S3',
] as const;
export type TingkatPendidikan = (typeof TINGKAT_PENDIDIKAN)[number];

export const READ_LEVEL = ['All', 'Own', 'No'] as const;
export type ReadLevel = (typeof READ_LEVEL)[number];
