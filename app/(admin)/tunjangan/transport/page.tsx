"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatRupiah } from "@/lib/utils";
import { tunjanganBulanSchema, type TunjanganBulanInput } from "@/lib/schemas/tunjangan";
import type { ApiResponse, TunjanganBulan } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleGuard } from "@/components/auth/role-guard";

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── Form Dialog ──────────────────────────────────────────────────────────────
function BulanFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TunjanganBulanInput>({
    resolver: zodResolver(tunjanganBulanSchema),
    defaultValues: {
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
    },
  });

  const { mutate, isPending: loading } = useMutation<ApiResponse<TunjanganBulan>, any, TunjanganBulanInput>({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<TunjanganBulan>>(ENDPOINTS.tunjangan.create, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Periode tunjangan berhasil dibuat");
      reset();
      onSaved();
      onOpenChange(false);
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        toast.error("Periode bulan dan tahun tersebut sudah ada");
      } else {
        toast.error(err.response?.data?.message || err.message || "Gagal menyimpan");
      }
    }
  });

  const onSubmit = (data: TunjanganBulanInput) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Buat Periode Tunjangan Baru</DialogTitle>
          <DialogDescription>Pilih bulan dan tahun periode tunjangan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bulan">Bulan *</FieldLabel>
              <select
                id="bulan"
                {...register("bulan", { valueAsNumber: true })}
                className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                aria-invalid={!!errors.bulan}
              >
                {BULAN_NAMES.map((b, i) => (
                  <option key={i} value={i + 1}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.bulan && <FieldError errors={[{ message: errors.bulan.message }]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="tahun">Tahun *</FieldLabel>
              <Input
                id="tahun"
                type="number"
                min={2000}
                max={2100}
                {...register("tahun", { valueAsNumber: true })}
                aria-invalid={!!errors.tahun}
              />
              {errors.tahun && <FieldError errors={[{ message: errors.tahun.message }]} />}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Buat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TunjanganTransportPage() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [tahunFilter, setTahunFilter] = useState(String(currentYear));
  const [addOpen, setAddOpen] = useState(false);

  const url = tahunFilter
    ? `${ENDPOINTS.tunjangan.list}?tahun=${tahunFilter}`
    : ENDPOINTS.tunjangan.list;

  const { data, isLoading: loading, error } = useQuery<TunjanganBulan[], Error>({
    queryKey: ["tunjanganBulan", tahunFilter],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TunjanganBulan[]>>(url);
      return res.data.data;
    },
  });

  const errorMessage = error?.message || null;

  // Generate year options
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

  return (
    <>
      <PageHeader
        title="Tunjangan Transport"
        actions={
          <RoleGuard modul="Setting Tunjangan Transport" action="create">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Buat Bulan Baru
            </Button>
          </RoleGuard>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <label htmlFor="tahun-filter" className="text-sm">
              Filter Tahun:
            </label>
            <select
              id="tahun-filter"
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
              className="border-input bg-transparent h-9 rounded-md border px-2 text-sm"
            >
              <option value="">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Nama Bulan</TableHead>
                <TableHead className="text-center">Tahun</TableHead>
                <TableHead className="text-center">Total Penerima</TableHead>
                <TableHead className="text-right">Total Tunjangan</TableHead>
                <TableHead className="w-24 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-destructive text-center">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Belum ada data tunjangan untuk tahun ini.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      {BULAN_NAMES[(item.bulan ?? 1) - 1] ?? `Bulan ${item.bulan}`}
                    </TableCell>
                    <TableCell className="text-center">{item.tahun}</TableCell>
                    <TableCell className="text-center">
                      {item.totalPenerima ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(item.totalNominal ?? 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <LinkButton
                        size="sm"
                        variant="outline"
                        href={`/tunjangan/transport/detail/${item.id}`}
                      >
                        Detail
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulanFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["tunjanganBulan"] })}
      />
    </>
  );
}
