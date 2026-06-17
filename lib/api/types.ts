export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
};

export type RoleSummary = {
  id: number;
  namaRole: string;
  deskripsi: string;
};

export type Permission = {
  id: number;
  modulFitur: string;
  akses: boolean;
  create: boolean;
  read: "All" | "Own" | "No";
  update: "All" | "Own" | "No";
  delete: "All" | "Own" | "No";
};

export type Role = RoleSummary & {
  createdAt: string;
  permissions: Permission[];
};

export type User = {
  id: number;
  idPegawai: number | null;
  username: string;
  nama: string;
  email: string;
  disabled: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  role: { id: number; namaRole: string };
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    nama: string;
    username: string;
    role: string;
  };
};

export type MasterData = {
  id: number;
  nama: string;
  tipe: "jabatan" | "departemen";
};

export type MasterWilayah = {
  id: number;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
};

export type Pendidikan = {
  id?: number;
  tingkatPendidikan:
    | "SD"
    | "SMP"
    | "SMA"
    | "D1"
    | "D2"
    | "D3"
    | "S1"
    | "S2"
    | "S3";
  namaSekolah: string;
  tahunLulus: number;
};

export type Pegawai = {
  id: number;
  fotoPegawai: string | null;
  nip: string;
  namaPegawai: string;
  email: string;
  nomorHp: string;
  tempatLahir: string;
  idKecamatan: number;
  alamatLengkap: string;
  jarakRumahKantor: number;
  tanggalLahir: string;
  statusKawin: "kawin" | "tidak_kawin";
  jumlahAnak: number;
  tanggalMasuk: string;
  idJabatan: number;
  idDepartemen: number;
  usia: number;
  jenisKelamin: "L" | "P";
  statusKontrak: "PKWTT" | "PKWT" | "Magang";
  status: "Aktif" | "Nonaktif";
  masaKerja: number;
  jabatan: { id: number; nama: string };
  departemen: { id: number; nama: string };
  kecamatan: MasterWilayah;
  pendidikan: Pendidikan[];
  user: { id: number; username: string; disabled: boolean } | null;
};

export type SettingTunjangan = {
  id: number;
  baseFare: number;
  berlakuMulai: string;
  minKm: number;
  maxKm: number;
  createdAt: string;
  updatedAt: string;
};

export type TunjanganBulan = {
  id: number;
  bulan: number;
  tahun: number;
  totalPenerima: number;
  totalNominal: number;
  dihitungPada: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TunjanganDetail = {
  id: number;
  km: number;
  hariMasuk: number;
  baseFareUsed: number;
  nominal: number;
  pegawai: {
    id: number;
    namaPegawai: string;
    nip: string;
    jarakRumahKantor: number;
    jabatan: { id: number; nama: string };
    departemen: { id: number; nama: string };
  };
};

export type TunjanganBulanDetail = TunjanganBulan & {
  detail: TunjanganDetail[];
};

export type HitungTunjanganResult = {
  totalPenerima: number;
  totalNominal: number;
  hariKerjaBulan: number;
};

export type LogItem = {
  id: string;
  module: string;
  action: string;
  content: string | null;
  ua: string | null;
  ip: string | null;
  url: string | null;
  browser: string | null;
  platform: string | null;
  createdAt: string;
  creator: { id: number; nama: string; username: string } | null;
};

export type DashboardManagerHrd = {
  role: "manager_hrd";
  message: string;
  widgets: {
    total: number;
    pkwt: number;
    pkwtt: number;
    magang: number;
    laki: number;
    perempuan: number;
  };
  charts: {
    statusKontrak: Array<{ label: string; value: number }>;
    gender: Array<{ label: string; value: number }>;
  };
  pegawaiBaru: Array<{
    id: number;
    namaPegawai: string;
    tanggalMasuk: string;
    statusKontrak: "PKWTT" | "PKWT" | "Magang";
    jabatan: { id: number; nama: string } | null;
    action: { label: string; href: string };
  }>;
};

export type DashboardSimple = {
  role: "superadmin" | "admin_hrd" | "pegawai";
  message: string;
  user?: { id: number; nama: string; username: string };
};

export type DashboardData = DashboardSimple | DashboardManagerHrd;
