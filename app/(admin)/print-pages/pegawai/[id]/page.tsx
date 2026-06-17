"use client";

import * as React from "react";
import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDateID } from "@/lib/utils";
import type { ApiResponse, Pegawai } from "@/lib/api/types";

export default function PrintPegawaiPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading: loading, error } = useQuery<Pegawai, Error>({
    queryKey: ["pegawai", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Pegawai>>(ENDPOINTS.pegawai.detail(id!));
      return res.data.data;
    },
    enabled: !!id,
  });
  const errorMessage = error?.message || null;

  React.useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!id || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm">
        Menyiapkan dokumen...
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-red-600">
        {errorMessage ?? "Data tidak ditemukan."}
      </div>
    );
  }

  const fotoUrl = data.fotoPegawai
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/uploads/pegawai/${data.fotoPegawai}`
    : null;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { font-family: Arial, sans-serif; font-size: 12pt; color: #000; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; max-width: 794px; margin: 0 auto; padding: 40px; }
      `}</style>

      {/* Header / Kop Surat */}
      <div className="mb-6 flex items-center gap-4 border-b-2 border-black pb-4">
        <div className="shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black text-xl font-bold">
            JMC
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold">JMC IT Consultant</h1>
          <p className="text-sm text-gray-600">Sistem Informasi Kepegawaian</p>
        </div>
        <div className="ml-auto text-right text-xs text-gray-500">
          <p>Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <h2 className="mb-6 text-center text-lg font-bold uppercase">
        Data Detail Pegawai
      </h2>

      {/* Foto + Info dasar */}
      <div className="mb-6 flex gap-6">
        <div className="shrink-0">
          <div className="relative h-28 w-24 overflow-hidden border border-gray-400">
            {fotoUrl ? (
              <Image src={fotoUrl} alt={data.namaPegawai} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                Foto
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <table className="w-full text-sm">
            <tbody>
              <Row label="NIP" value={data.nip} />
              <Row label="Nama" value={data.namaPegawai} />
              <Row label="Jabatan" value={data.jabatan?.nama} />
              <Row label="Departemen" value={data.departemen?.nama} />
              <Row label="Status Kontrak" value={data.statusKontrak} />
              <Row label="Status" value={data.status} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Diri */}
      <Section title="Data Diri">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Email" value={data.email} />
            <Row label="Nomor HP" value={data.nomorHp} />
            <Row label="Jenis Kelamin" value={data.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
            <Row label="Tempat, Tanggal Lahir" value={`${data.tempatLahir}, ${formatDateID(data.tanggalLahir)}`} />
            <Row label="Usia" value={`${data.usia} tahun`} />
            <Row label="Status Kawin" value={data.statusKawin === "kawin" ? "Kawin" : "Tidak Kawin"} />
            <Row label="Jumlah Anak" value={String(data.jumlahAnak)} />
          </tbody>
        </table>
      </Section>

      {/* Alamat */}
      <Section title="Alamat">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Kecamatan" value={data.kecamatan?.kecamatan} />
            <Row label="Kabupaten" value={data.kecamatan?.kabupaten} />
            <Row label="Provinsi" value={data.kecamatan?.provinsi} />
            <Row label="Alamat Lengkap" value={data.alamatLengkap} />
            <Row label="Jarak Rumah-Kantor" value={`${data.jarakRumahKantor} km`} />
          </tbody>
        </table>
      </Section>

      {/* Kepegawaian */}
      <Section title="Data Kepegawaian">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Tanggal Masuk" value={formatDateID(data.tanggalMasuk)} />
            <Row label="Masa Kerja" value={`${data.masaKerja} tahun`} />
          </tbody>
        </table>
      </Section>

      {/* Pendidikan */}
      <Section title="Riwayat Pendidikan">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border border-gray-400 bg-gray-100">
              <th className="border border-gray-400 px-3 py-1.5 text-left">Jenjang</th>
              <th className="border border-gray-400 px-3 py-1.5 text-left">Sekolah / PT</th>
              <th className="border border-gray-400 px-3 py-1.5 text-left">Tahun Lulus</th>
            </tr>
          </thead>
          <tbody>
            {data.pendidikan.length === 0 ? (
              <tr>
                <td colSpan={3} className="border border-gray-400 px-3 py-1.5 text-center text-gray-400 italic">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              data.pendidikan.map((p, i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-1.5">{p.tingkatPendidikan}</td>
                  <td className="border border-gray-400 px-3 py-1.5">{p.namaSekolah}</td>
                  <td className="border border-gray-400 px-3 py-1.5">{p.tahunLulus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
        <div className="text-center">
          <p>Mengetahui,</p>
          <div className="mt-16 border-t border-black pt-1">
            <p className="font-medium">Manager HRD</p>
          </div>
        </div>
        <div className="text-center">
          <p>Yang bersangkutan,</p>
          <div className="mt-16 border-t border-black pt-1">
            <p className="font-medium">{data.namaPegawai}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null | number }) {
  return (
    <tr>
      <td className="py-1 pr-2 font-medium text-gray-700 align-top w-44">{label}</td>
      <td className="py-1 px-2">:</td>
      <td className="py-1">{value ?? "-"}</td>
    </tr>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase text-gray-700">
        {title}
      </h3>
      {children}
    </div>
  );
}
