"use client";

import * as React from "react";
import dayjs from "dayjs";
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatRupiah } from "@/lib/utils";
import { formatDateID } from "@/lib/utils";
import type { ApiResponse, SettingTunjangan, TunjanganBulanDetail } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type SortField = "namaPegawai" | "km" | "hariMasuk" | "nominal";

function SortIcon({ field, sortBy, sortOrder }: { field: SortField; sortBy: SortField; sortOrder: "asc" | "desc" }) {
  if (sortBy !== field) return <ChevronsUpDown className="ml-1 inline size-3 opacity-40" />;
  return sortOrder === "asc" ? (
    <ChevronUp className="ml-1 inline size-3" />
  ) : (
    <ChevronDown className="ml-1 inline size-3" />
  );
}

// ─── Hitung Dialog ──────────────────────────────────────────────────────────
function HitungTunjanganDialog({
  open,
  onOpenChange,
  bulan,
  tahun,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bulan: number;
  tahun: number;
  onConfirm: () => void;
  loading: boolean;
}) {
  const bulanName = BULAN_NAMES[(bulan ?? 1) - 1] ?? `Bulan ${bulan}`;

  const { data: settings, isLoading: loadingSetting } = useQuery<SettingTunjangan[], Error>({
    queryKey: ["settingTunjangan"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SettingTunjangan[]>>(ENDPOINTS.settingTunjangan.list);
      return res.data.data;
    },
    enabled: open,
  });

  const activeSetting = React.useMemo(() => {
    if (!settings || settings.length === 0) return null;
    const periodStart = dayjs(`${tahun}-${String(bulan).padStart(2, "0")}-01`);
    return (
      settings
        .filter((s) => {
          const dateOnly = dayjs(s.berlakuMulai.split(/[T ]/)[0]);
          return dateOnly.isSame(periodStart) || dateOnly.isBefore(periodStart);
        })
        .sort((a, b) => {
          const dateA = dayjs(a.berlakuMulai.split(/[T ]/)[0]);
          const dateB = dayjs(b.berlakuMulai.split(/[T ]/)[0]);
          return dateB.valueOf() - dateA.valueOf();
        })[0] ?? null
    );
  }, [settings, tahun, bulan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hitung Tunjangan Transport</DialogTitle>
          <DialogDescription>
            Sistem akan menghitung ulang tunjangan transport untuk periode{" "}
            <strong>{bulanName} {tahun}</strong>. Hasil perhitungan sebelumnya akan ditimpa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Active setting tunjangan */}
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
              Tarif Berlaku
            </p>
            <div className="bg-muted/40 rounded-md border p-3 text-sm">
              {loadingSetting ? (
                <p className="text-muted-foreground">Memuat setting tunjangan...</p>
              ) : activeSetting ? (
                <dl className="grid grid-cols-2 gap-y-1 gap-x-3">
                  <dt className="text-muted-foreground">Base Fare / km</dt>
                  <dd className="text-right font-medium">{formatRupiah(activeSetting.baseFare)}</dd>
                  <dt className="text-muted-foreground">Min Kilometer</dt>
                  <dd className="text-right font-medium">{activeSetting.minKm} km</dd>
                  <dt className="text-muted-foreground">Max Kilometer</dt>
                  <dd className="text-right font-medium">{activeSetting.maxKm} km</dd>
                  <dt className="text-muted-foreground">Berlaku Mulai</dt>
                  <dd className="text-right font-medium">{formatDateID(activeSetting.berlakuMulai)}</dd>
                </dl>
              ) : (
                <p className="text-destructive text-xs">
                  Setting tunjangan belum dikonfigurasi untuk periode ini.
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Calculation rules */}
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
              Aturan Perhitungan
            </p>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>
                Formula: <code className="bg-muted rounded px-1 text-xs">baseFare × km × hariMasuk</code>
              </li>
              <li>Pembulatan km: desimal &lt; 0,5 ke bawah, ≥ 0,5 ke atas.</li>
              <li>Jarak di bawah min km atau di atas max km tidak dihitung.</li>
              <li>Hari masuk minimum 19 hari kerja untuk mendapat tunjangan.</li>
              <li>Hanya pegawai tetap (PKWTT) & aktif yang dihitung.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading || !activeSetting}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Hitung Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TunjanganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const [id, setId] = React.useState<string | null>(null);
  const [confirmHitung, setConfirmHitung] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortField>("namaPegawai");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading: loading, error } = useQuery<TunjanganBulanDetail, Error>({
    queryKey: ["tunjanganBulanDetail", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TunjanganBulanDetail>>(ENDPOINTS.tunjangan.detail(id!));
      return res.data.data;
    },
    enabled: !!id,
  });

  const errorMessage = error?.message || null;

  const { mutate: doHitung, isPending: menghitung } = useMutation<ApiResponse<any>, Error, void>({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<any>>(ENDPOINTS.tunjangan.hitung(id!));
      return res.data;
    },
    onSuccess: () => {
      toast.success("Tunjangan berhasil dihitung");
      queryClient.invalidateQueries({ queryKey: ["tunjanganBulanDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["tunjanganBulan"] });
      setConfirmHitung(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal menghitung tunjangan");
      setConfirmHitung(false);
    }
  });

  const handleHitung = () => {
    if (!id) return;
    doHitung();
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Client-side sort of detail list
  const sortedDetail = React.useMemo(() => {
    if (!data?.detail) return [];
    return [...data.detail].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortBy === "namaPegawai") {
        av = a.pegawai.namaPegawai.toLowerCase();
        bv = b.pegawai.namaPegawai.toLowerCase();
      } else if (sortBy === "km") {
        av = a.km;
        bv = b.km;
      } else if (sortBy === "hariMasuk") {
        av = a.hariMasuk;
        bv = b.hariMasuk;
      } else {
        av = a.nominal;
        bv = b.nominal;
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.detail, sortBy, sortOrder]);

  const bulanName = data ? BULAN_NAMES[(data.bulan ?? 1) - 1] ?? `Bulan ${data.bulan}` : "";

  return (
    <>
      <PageHeader
        title={`Detail Tunjangan — ${bulanName} ${data?.tahun ?? ""}`}
        actions={
          <div className="flex gap-2">
            <BackButton fallback="/tunjangan/transport" />
            <RoleGuard modul="Setting Tunjangan Transport" action="create">
              <Button
                onClick={() => setConfirmHitung(true)}
                disabled={menghitung}
              >
                {menghitung && <Loader2 className="size-4 animate-spin" />}
                Hitung Tunjangan
              </Button>
            </RoleGuard>
          </div>
        }
      />

      {/* Summary header */}
      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs">Total Penerima</p>
              <p className="text-2xl font-bold">{data.totalPenerima ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs">Total Nominal</p>
              <p className="text-lg font-bold">{formatRupiah(data.totalNominal ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs">Dihitung Pada</p>
              <p className="text-sm font-medium">
                {data.dihitungPada ? formatDateID(data.dihitungPada) : (
                  <span className="text-muted-foreground italic">Belum dihitung</span>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs">Periode</p>
              <p className="text-sm font-medium">{bulanName} {data.tahun}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          {data && !data.dihitungPada && (
            <div className="bg-muted/50 rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">
                Tunjangan bulan ini belum dihitung. Klik <strong>Hitung Tunjangan</strong> untuk
                menghitung tunjangan seluruh pegawai tetap (PKWTT) yang memenuhi syarat.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("namaPegawai")}
                >
                  Nama Penerima
                  <SortIcon field="namaPegawai" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort("km")}
                >
                  Km
                  <SortIcon field="km" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort("hariMasuk")}
                >
                  Hari Masuk
                  <SortIcon field="hariMasuk" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort("nominal")}
                >
                  Nominal
                  <SortIcon field="nominal" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-destructive text-center">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : sortedDetail.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-8">
                    {data?.dihitungPada
                      ? "Tidak ada pegawai yang memenuhi syarat."
                      : "Klik Hitung Tunjangan untuk melihat hasil perhitungan."}
                  </TableCell>
                </TableRow>
              ) : (
                sortedDetail.map((d, i) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell className="font-medium">{d.pegawai.namaPegawai}</TableCell>
                    <TableCell className="text-center">{d.km} km</TableCell>
                    <TableCell className="text-center">{d.hariMasuk} hari</TableCell>
                    <TableCell className="text-right">{formatRupiah(d.nominal)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <HitungTunjanganDialog
        open={confirmHitung}
        onOpenChange={setConfirmHitung}
        bulan={data?.bulan ?? new Date().getMonth() + 1}
        tahun={data?.tahun ?? new Date().getFullYear()}
        onConfirm={handleHitung}
        loading={menghitung}
      />
    </>
  );
}
