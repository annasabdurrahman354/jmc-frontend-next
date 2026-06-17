"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Power,
  Download,
  Eye,
  Pencil,
  FileDown,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useDebounce } from "@/hooks/use-debounce";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/auth/store";
import { formatDateID } from "@/lib/utils";
import type { ApiResponse, MasterData, PaginatedResponse, Pegawai } from "@/lib/api/types";
import { STATUS_KONTRAK } from "@/lib/types/common";

import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoleGuard } from "@/components/auth/role-guard";

// ─── Pagination ─────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onPage,
  total,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  total: number;
}) {
  if (totalPages <= 1)
    return <div className="text-muted-foreground text-xs">Total {total} pegawai</div>;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground text-xs">
        Hal {page} dari {totalPages} ({total} data)
      </div>
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </li>
        {pages.map((p) => (
          <li key={p}>
            <Button
              variant={p === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          </li>
        ))}
        <li>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            aria-label="Berikutnya"
          >
            <ChevronRight className="size-4" />
          </Button>
        </li>
      </ul>
    </div>
  );
}

// ─── Sort Icon ───────────────────────────────────────────────────────────────
function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== field) return <ChevronsUpDown className="ml-1 inline size-3 opacity-40" />;
  return sortOrder === "asc" ? (
    <ChevronUp className="ml-1 inline size-3" />
  ) : (
    <ChevronDown className="ml-1 inline size-3" />
  );
}

// ─── Masa Kerja helper ───────────────────────────────────────────────────────
function masaKerjaLabel(years: number) {
  if (years < 1) return "< 1 tahun";
  return `${years} tahun`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PegawaiPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [jabatanFilter, setJabatanFilter] = useState("");
  const [statusKontrakFilter, setStatusKontrakFilter] = useState("");
  const [masaKerjaMin, setMasaKerjaMin] = useState("");
  const [masaKerjaMax, setMasaKerjaMax] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nama: string } | null>(null);
  const [confirmBulkStatus, setConfirmBulkStatus] = useState<"Aktif" | "Nonaktif" | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [sortBy, setSortBy] = useState("namaPegawai");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = useAuthStore((s) => s.token);

  // Fetch jabatan list
  const { data: jabatanList } = useQuery<MasterData[], Error>({
    queryKey: ["masterData", "jabatan"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MasterData[]>>(ENDPOINTS.masterData.list("jabatan"));
      return res.data.data;
    },
  });

  // Fetch pegawai list
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: debouncedSearch,
    jabatan: jabatanFilter,
    statusKontrak: statusKontrakFilter,
    masaKerjaMin,
    masaKerjaMax,
    sortBy,
    sortOrder,
  });
  const url = `${ENDPOINTS.pegawai.list}?${params.toString()}`;

  const { data, isLoading: loading, error } = useQuery<PaginatedResponse<Pegawai>, Error>({
    queryKey: [
      "pegawai",
      page,
      limit,
      debouncedSearch,
      jabatanFilter,
      statusKontrakFilter,
      masaKerjaMin,
      masaKerjaMax,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Pegawai>>(url);
      return res.data;
    },
  });

  const errorMessage = error?.message || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, jabatanFilter, statusKontrakFilter, masaKerjaMin, masaKerjaMax, sortBy, sortOrder]);

  const deleteOneMutation = useMutation<ApiResponse<any>, Error, number>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<any>>(ENDPOINTS.pegawai.delete(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pegawai"] });
    }
  });

  const patchStatusMutation = useMutation<ApiResponse<any>, Error, { ids: number[]; status: "Aktif" | "Nonaktif" }>({
    mutationFn: async (payload) => {
      const res = await api.patch<ApiResponse<any>>(ENDPOINTS.pegawai.bulkStatus, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pegawai"] });
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const doDelete = async (id: number) => {
    try {
      await deleteOneMutation.mutateAsync(id);
      toast.success("Data pegawai berhasil dihapus");
      setSelected((s) => s.filter((x) => x !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal menghapus");
    }
    setConfirmDelete(null);
  };

  const doBulkStatus = async (status: "Aktif" | "Nonaktif") => {
    try {
      await patchStatusMutation.mutateAsync({ ids: selected, status });
      toast.success(`Status pegawai berhasil diubah ke ${status}`);
      setSelected([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengubah status");
    }
    setConfirmBulkStatus(null);
  };

  const doBulkDelete = async () => {
    let ok = 0;
    let fail = 0;
    for (const id of selected) {
      try {
        await deleteOneMutation.mutateAsync(id);
        ok++;
      } catch (err) {
        fail++;
      }
    }
    toast.success(`${ok} pegawai dihapus${fail ? `, ${fail} gagal` : ""}`);
    setSelected([]);
    setConfirmBulkDelete(false);
  };

  const downloadExcel = () => {
    const downloadParams = new URLSearchParams({
      search: debouncedSearch,
      jabatan: jabatanFilter,
      statusKontrak: statusKontrakFilter,
    }).toString();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    fetch(`${apiBase}${ENDPOINTS.pegawai.export}?${downloadParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Download gagal");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `data-pegawai-${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Gagal mendownload data"));
  };

  const pegawaiDataList: Pegawai[] = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const allChecked =
    pegawaiDataList.length > 0 && pegawaiDataList.every((p) => selected.includes(p.id));
  const someChecked = pegawaiDataList.some((p) => selected.includes(p.id)) && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      setSelected((s) => s.filter((id) => !pegawaiDataList.find((p) => p.id === id)));
    } else {
      setSelected((s) => Array.from(new Set([...s, ...pegawaiDataList.map((p) => p.id)])));
    }
  };

  const toggleOne = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <PageHeader
        title="Data Pegawai"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadExcel} size="sm">
              <FileDown className="size-4" />
              Export Excel
            </Button>
            <RoleGuard modul="Modul Data Pegawai" action="create">
              <LinkButton href="/pegawai/form">
                <Plus className="size-4" />
                Data Baru
              </LinkButton>
            </RoleGuard>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {/* Masa Kerja filter */}
            <div className="flex items-center gap-1">
              <span className="text-sm whitespace-nowrap">Masa Kerja</span>
              <Input
                type="number"
                min={0}
                className="w-16"
                placeholder="Min"
                value={masaKerjaMin}
                onChange={(e) => setMasaKerjaMin(e.target.value)}
                aria-label="Masa kerja minimum (tahun)"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="number"
                min={0}
                className="w-16"
                placeholder="Max"
                value={masaKerjaMax}
                onChange={(e) => setMasaKerjaMax(e.target.value)}
                aria-label="Masa kerja maksimum (tahun)"
              />
              <span className="text-muted-foreground text-xs">thn</span>
            </div>

            {/* Jabatan filter */}
            <select
              className="border-input bg-transparent h-9 rounded-md border px-2 text-sm"
              value={jabatanFilter}
              onChange={(e) => setJabatanFilter(e.target.value)}
            >
              <option value="">Semua Jabatan</option>
              {(jabatanList ?? []).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                </option>
              ))}
            </select>

            {/* Status Kontrak filter */}
            <select
              className="border-input bg-transparent h-9 rounded-md border px-2 text-sm"
              value={statusKontrakFilter}
              onChange={(e) => setStatusKontrakFilter(e.target.value)}
            >
              <option value="">Semua Kontrak</option>
              {STATUS_KONTRAK.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="ml-auto flex w-64 items-center">
              <Input
                placeholder="Cari nama / NIP / jabatan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button variant="ghost" size="icon" aria-label="Cari" tabIndex={-1}>
                <Search className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-2 text-sm">
              <div>{selected.length} dipilih</div>
              <div className="flex gap-2">
                <RoleGuard modul="Modul Data Pegawai" action="update">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmBulkStatus("Aktif")}
                  >
                    <Power className="size-4" /> Aktifkan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmBulkStatus("Nonaktif")}
                  >
                    <Power className="size-4" /> Nonaktifkan
                  </Button>
                </RoleGuard>
                <RoleGuard modul="Modul Data Pegawai" action="delete">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    <Trash2 className="size-4" /> Hapus
                  </Button>
                </RoleGuard>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={toggleAll}
                    aria-label="Pilih semua"
                  />
                </TableHead>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("nip")}
                >
                  NIP <SortIcon field="nip" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("namaPegawai")}
                >
                  Nama <SortIcon field="namaPegawai" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("jabatan")}
                >
                  Jabatan <SortIcon field="jabatan" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("tanggalMasuk")}
                >
                  Tgl Masuk <SortIcon field="tanggalMasuk" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("masaKerja")}
                >
                  Masa Kerja <SortIcon field="masaKerja" sortBy={sortBy} sortOrder={sortOrder} />
                </TableHead>
                <TableHead className="w-36 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-destructive text-center">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : pegawaiDataList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground text-center">
                    Belum ada data pegawai.
                  </TableCell>
                </TableRow>
              ) : (
                pegawaiDataList.map((p: Pegawai, i: number) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="accent-primary size-4"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleOne(p.id)}
                        aria-label={`Pilih ${p.namaPegawai}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {(meta.page - 1) * meta.limit + i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.nip}</TableCell>
                    <TableCell className="font-medium">{p.namaPegawai}</TableCell>
                    <TableCell>{p.jabatan?.nama ?? "-"}</TableCell>
                    <TableCell>{formatDateID(p.tanggalMasuk)}</TableCell>
                    <TableCell>{masaKerjaLabel(p.masaKerja)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <LinkButton
                          href={`/pegawai/${p.id}`}
                          size="icon-sm"
                          variant="ghost"
                          title="Detail"
                        >
                          <Eye className="size-4" />
                        </LinkButton>
                        <RoleGuard modul="Modul Data Pegawai" action="update">
                          <LinkButton
                            href={`/pegawai/form/${p.id}`}
                            size="icon-sm"
                            variant="ghost"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </LinkButton>
                        </RoleGuard>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Download PDF"
                          onClick={() =>
                            window.open(`/print-pages/pegawai/${p.id}`, "_blank")
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                        <RoleGuard modul="Modul Data Pegawai" action="delete">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            title="Hapus"
                            onClick={() =>
                              setConfirmDelete({ id: p.id, nama: p.namaPegawai })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </RoleGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t p-3">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPage={setPage}
            total={meta.total}
          />
        </div>
      </Card>

      {/* Confirm single delete */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{confirmDelete?.nama}</strong> akan dihapus permanen. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && doDelete(confirmDelete.id)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm bulk status */}
      <AlertDialog
        open={!!confirmBulkStatus}
        onOpenChange={(o) => !o && setConfirmBulkStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Ubah status {selected.length} pegawai ke {confirmBulkStatus}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Status pegawai terpilih akan diubah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmBulkStatus && doBulkStatus(confirmBulkStatus)}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm bulk delete */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selected.length} pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={doBulkDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
