"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDateID, formatRupiah } from "@/lib/utils";
import { settingTunjanganSchema, type SettingTunjanganInput } from "@/lib/schemas/setting-tunjangan";
import type { ApiResponse, SettingTunjangan } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
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

// ─── Form Dialog ─────────────────────────────────────────────────────────────
function SettingFormDialog({
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
  } = useForm<SettingTunjanganInput>({
    resolver: zodResolver(settingTunjanganSchema),
    defaultValues: { minKm: 5, maxKm: 25 },
  });

  const { mutate, isPending: loading } = useMutation<ApiResponse<SettingTunjangan>, any, SettingTunjanganInput>({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<SettingTunjangan>>(ENDPOINTS.settingTunjangan.create, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Setting tunjangan berhasil ditambahkan");
      reset();
      onSaved();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal menyimpan");
    }
  });

  const onSubmit = (data: SettingTunjanganInput) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Setting Tunjangan</DialogTitle>
          <DialogDescription>
            Tambahkan tarif dan parameter tunjangan transport baru.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="baseFare">Tarif per Km (Rp) *</FieldLabel>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  Rp
                </span>
                <Input
                  id="baseFare"
                  type="number"
                  min={1}
                  {...register("baseFare")}
                  className="pl-9"
                  aria-invalid={!!errors.baseFare}
                  placeholder="5000"
                />
              </div>
              {errors.baseFare && (
                <FieldError errors={[{ message: errors.baseFare.message }]} />
              )}
              <p className="text-muted-foreground text-xs">Contoh: masukkan 5000 untuk Rp 5.000/km</p>
            </Field>

            <Field>
              <FieldLabel htmlFor="berlakuMulai">Berlaku Mulai *</FieldLabel>
              <Input
                id="berlakuMulai"
                type="date"
                {...register("berlakuMulai")}
                aria-invalid={!!errors.berlakuMulai}
              />
              {errors.berlakuMulai && (
                <FieldError errors={[{ message: errors.berlakuMulai.message }]} />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="minKm">Minimum Km *</FieldLabel>
                <Input
                  id="minKm"
                  type="number"
                  min={0}
                  {...register("minKm")}
                  aria-invalid={!!errors.minKm}
                />
                {errors.minKm && (
                  <FieldError errors={[{ message: errors.minKm.message }]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="maxKm">Maksimum Km *</FieldLabel>
                <Input
                  id="maxKm"
                  type="number"
                  min={0}
                  {...register("maxKm")}
                  aria-invalid={!!errors.maxKm}
                />
                {errors.maxKm && (
                  <FieldError errors={[{ message: errors.maxKm.message }]} />
                )}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingTunjanganPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SettingTunjangan | null>(null);

  const { data, isLoading: loading, error } = useQuery<SettingTunjangan[], Error>({
    queryKey: ["settingTunjangan"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SettingTunjangan[]>>(ENDPOINTS.settingTunjangan.list);
      return res.data.data;
    },
  });

  const errorMessage = error?.message || null;

  const { mutate: doDelete } = useMutation<ApiResponse<any>, Error, void>({
    mutationFn: async () => {
      const res = await api.delete<ApiResponse<any>>(ENDPOINTS.settingTunjangan.delete(deleteTarget!.id));
      return res.data;
    },
    onSuccess: () => {
      toast.success("Setting berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["settingTunjangan"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal menghapus");
      setDeleteTarget(null);
    }
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    doDelete();
  };

  return (
    <>
      <PageHeader
        title="Setting Tunjangan Transport"
        actions={
          <RoleGuard modul="Setting Tunjangan Transport" action="create">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Tambah
            </Button>
          </RoleGuard>
        }
      />

      <Card>
        <CardHeader>
          <p className="text-muted-foreground text-sm">
            Daftar tarif dan parameter tunjangan transport. Tarif yang berlaku adalah yang memiliki
            tanggal berlaku terbaru ≤ hari ini.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Tarif / Km</TableHead>
                <TableHead>Berlaku Mulai</TableHead>
                <TableHead className="text-center">Min Km</TableHead>
                <TableHead className="text-center">Max Km</TableHead>
                <TableHead className="w-20 text-center">Aksi</TableHead>
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
                    Belum ada setting tunjangan.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell className="font-medium">{formatRupiah(s.baseFare)}/km</TableCell>
                    <TableCell>{formatDateID(s.berlakuMulai)}</TableCell>
                    <TableCell className="text-center">{s.minKm} km</TableCell>
                    <TableCell className="text-center">{s.maxKm} km</TableCell>
                    <RoleGuard modul="Setting Tunjangan Transport" action="delete">
                      <TableCell className="text-center">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                          title="Hapus"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </RoleGuard>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SettingFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["settingTunjangan"] })}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus setting tunjangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Setting tarif <strong>{deleteTarget ? formatRupiah(deleteTarget.baseFare) : ""} style</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
