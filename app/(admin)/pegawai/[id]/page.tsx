"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDateID } from "@/lib/utils";
import type { ApiResponse, Pegawai } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Pencil, Download, User2 } from "lucide-react";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="col-span-2">{value || "-"}</dd>
    </div>
  );
}

export default function PegawaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!id || loading) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Memuat data...</div>
    );
  }

  if (errorMessage) {
    return <div className="text-destructive p-8 text-center text-sm">{errorMessage}</div>;
  }

  if (!data) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Data tidak ditemukan.</div>
    );
  }

  const fotoUrl = data.fotoPegawai
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/uploads/pegawai/${data.fotoPegawai}`
    : null;

  return (
    <>
      <PageHeader
        title="Detail Pegawai"
        actions={
          <div className="flex gap-2">
            <BackButton fallback="/pegawai" />
            <RoleGuard modul="Modul Data Pegawai" action="update">
              <LinkButton href={`/pegawai/form/${id}`} variant="outline">
                <Pencil className="size-4" />
                Edit
              </LinkButton>
            </RoleGuard>
            <Button
              variant="outline"
              onClick={() => window.open(`/print-pages/pegawai/${id}`, "_blank")}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Data Diri */}
        <Card>
          <CardHeader>
            <CardTitle>Data Diri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-center">
              <div className="relative size-28 overflow-hidden rounded-full border">
                {fotoUrl ? (
                  <Image src={fotoUrl} alt={data.namaPegawai} fill className="object-cover" sizes="112px" unoptimized/>
                ) : (
                  <div className="bg-muted flex size-full items-center justify-center">
                    <User2 className="text-muted-foreground size-12" />
                  </div>
                )}
              </div>
            </div>
            <dl className="divide-y">
              <DetailRow label="NIP" value={<span className="font-mono">{data.nip}</span>} />
              <DetailRow label="Nama" value={data.namaPegawai} />
              <DetailRow label="Email" value={data.email} />
              <DetailRow label="Nomor HP" value={data.nomorHp} />
              <DetailRow label="Jenis Kelamin" value={data.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
              <DetailRow label="Tempat Lahir" value={data.tempatLahir} />
              <DetailRow label="Tanggal Lahir" value={formatDateID(data.tanggalLahir)} />
              <DetailRow label="Usia" value={`${data.usia} tahun`} />
              <DetailRow label="Status Kawin" value={data.statusKawin === "kawin" ? "Kawin" : "Tidak Kawin"} />
              <DetailRow label="Jumlah Anak" value={data.jumlahAnak} />
            </dl>
          </CardContent>
        </Card>

        {/* Data Kepegawaian + Alamat */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Kepegawaian</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <DetailRow label="Jabatan" value={data.jabatan?.nama} />
                <DetailRow label="Departemen" value={data.departemen?.nama} />
                <DetailRow label="Tanggal Masuk" value={formatDateID(data.tanggalMasuk)} />
                <DetailRow
                  label="Masa Kerja"
                  value={`${data.masaKerja} tahun`}
                />
                <DetailRow label="Status Kontrak" value={data.statusKontrak} />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={
                        data.status === "Aktif"
                          ? "text-green-600 font-medium"
                          : "text-destructive font-medium"
                      }
                    >
                      {data.status}
                    </span>
                  }
                />
                <DetailRow label="Jarak Rumah-Kantor" value={`${data.jarakRumahKantor} km`} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alamat</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <DetailRow label="Kecamatan" value={data.kecamatan?.kecamatan} />
                <DetailRow label="Kabupaten" value={data.kecamatan?.kabupaten} />
                <DetailRow label="Provinsi" value={data.kecamatan?.provinsi} />
                <DetailRow label="Alamat Lengkap" value={data.alamatLengkap} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pendidikan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">Jenjang</th>
                    <th className="px-4 py-2 text-left">Sekolah / PT</th>
                    <th className="px-4 py-2 text-left">Tahun Lulus</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pendidikan.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-muted-foreground px-4 py-4 text-center text-xs">
                        Tidak ada data pendidikan.
                      </td>
                    </tr>
                  ) : (
                    data.pendidikan.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{p.tingkatPendidikan}</td>
                        <td className="px-4 py-2">{p.namaSekolah}</td>
                        <td className="px-4 py-2">{p.tahunLulus}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
