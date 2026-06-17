"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Power,
  Trash2,
  X,
  Loader2,
  Check,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useDebounce } from "@/hooks/use-debounce";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/auth/store";
import { userCreateSchema, type UserCreateInput } from "@/lib/schemas/user";
import { generatePassword } from "@/lib/utils/password-generator";
import { applyServerErrors } from "@/lib/utils";
import type { ApiResponse, PaginatedResponse, RoleSummary, User } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PegawaiSelect } from "@/components/form/pegawai-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RoleGuard } from "@/components/auth/role-guard";
import { TablePagination } from "@/components/ui/table-pagination";

function UserFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const { data: roles } = useQuery<RoleSummary[], Error>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RoleSummary[]>>(ENDPOINTS.roles.list);
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { disabled: false, password: "" },
  });

  const { mutate: createUser, isPending: submittingUser } = useMutation<ApiResponse<User>, Error, UserCreateInput>({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<User>>(ENDPOINTS.users.create, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      reset();
      onSaved();
      onOpenChange(false);
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) {
        applyServerErrors(setError, err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || err.message || "Gagal menyimpan");
      }
    }
  });

  const idPegawai = watch("idPegawai");
  const usernameVal = watch("username");
  const passwordVal = watch("password");

  const onSubmit = (data: UserCreateInput) => {
    createUser(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah User Baru</DialogTitle>
          <DialogDescription>
            Pilih pegawai, tentukan username dan role. Password akan di-generate otomatis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel>Nama Pegawai</FieldLabel>
              <PegawaiSelect
                value={idPegawai ?? null}
                onChange={(p) => setValue("idPegawai", p ? p.id : 0, { shouldValidate: true })}
                excludeWithUser
                error={errors.idPegawai?.message}
              />
              {errors.idPegawai && (
                <FieldError errors={[{ message: errors.idPegawai.message }]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                {...register("username")}
                aria-invalid={!!errors.username}
                onKeyUp={(e) => setValue("username", (e.target as HTMLInputElement).value, { shouldValidate: true })}
              />
              {errors.username && (
                <FieldError errors={[{ message: errors.username.message }]} />
              )}
              <p className="text-muted-foreground text-xs">
                Min 6, huruf kecil + angka saja, tanpa spasi.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  onKeyUp={(e) => setValue("password", (e.target as HTMLInputElement).value, { shouldValidate: true })}
                  value={passwordVal || ""}
                />
              </div>
              {errors.password && (
                <FieldError errors={[{ message: errors.password.message }]} />
              )}
              <p className="text-muted-foreground text-xs">
                Min 8, tanpa spasi, 1 besar, 1 kecil, 1 khusus.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setValue("password", generatePassword(12), { shouldValidate: true })
                }
              >
                Generate
              </Button>
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select onValueChange={(v) => setValue("idRole", Number(v), { shouldValidate: true })}>
                <SelectTrigger aria-invalid={!!errors.idRole}>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles || []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.namaRole}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idRole && (
                <FieldError errors={[{ message: errors.idRole.message }]} />
              )}
            </Field>

            <Field orientation="horizontal">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-primary size-4"
                  {...register("disabled")}
                />
                Nonaktifkan user (tidak bisa login)
              </label>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submittingUser}>
              {submittingUser && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManagePage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<"delete" | "disable" | "enable" | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: debouncedSearch,
  });
  const url = `${ENDPOINTS.users.list}?${params.toString()}`;

  const { data, isLoading: loading, error } = useQuery<PaginatedResponse<User>, Error>({
    queryKey: ["users", page, limit, debouncedSearch],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>(url);
      return res.data;
    },
  });

  const errorMessage = error?.message || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const deleteUserMutation = useMutation<ApiResponse<any>, Error, number>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<any>>(ENDPOINTS.users.delete(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["pegawai"] });
    }
  });

  const patchStatusMutation = useMutation<ApiResponse<any>, Error, { id: number; disabled: boolean }>({
    mutationFn: async ({ id, disabled }) => {
      const res = await api.patch<ApiResponse<any>>(ENDPOINTS.users.status(id), { disabled });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const doDelete = async (id: number) => {
    try {
      await deleteUserMutation.mutateAsync(id);
      toast.success("User berhasil dihapus");
      setSelected((s) => s.filter((x) => x !== id));
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error("Tidak dapat menghapus akun sendiri");
      } else if (err.response?.status === 403) {
        toast.error("Tidak dapat menghapus user Superadmin");
      } else {
        toast.error(err.response?.data?.message || err.message || "Gagal menghapus");
      }
    }
    setConfirmDelete(null);
  };

  const doPatchStatus = async (id: number, disabled: boolean) => {
    try {
      await patchStatusMutation.mutateAsync({ id, disabled });
      toast.success(`User berhasil ${disabled ? "dinonaktifkan" : "diaktifkan"}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Gagal mengubah status");
    }
  };

  const doBulkStatus = async (disabled: boolean) => {
    let okCount = 0;
    for (const id of selected) {
      try {
        await patchStatusMutation.mutateAsync({ id, disabled });
        okCount++;
      } catch (err) {
        // ignore
      }
    }
    toast.success(`${okCount} user berhasil diupdate`);
    setSelected([]);
    setConfirmBulk(null);
  };

  const doBulkDelete = async () => {
    let okCount = 0;
    let fail = 0;
    for (const id of selected) {
      try {
        await deleteUserMutation.mutateAsync(id);
        okCount++;
      } catch (err) {
        fail++;
      }
    }
    toast.success(`${okCount} user dihapus${fail ? `, ${fail} gagal` : ""}`);
    setSelected([]);
    setConfirmBulk(null);
  };

  const userDataList: User[] = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const allChecked =
    userDataList.length > 0 && userDataList.every((u) => selected.includes(u.id));
  const someChecked = userDataList.some((u) => selected.includes(u.id)) && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      setSelected((s) => s.filter((id) => !userDataList.find((u) => u.id === id)));
    } else {
      setSelected((s) => Array.from(new Set([...s, ...userDataList.map((u) => u.id)])));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const isSuperadminRole = (namaRole: string) =>
    namaRole.toLowerCase() === "superadmin";

  return (
    <>
      <PageHeader
        title="Manajemen User"
        actions={
          <RoleGuard modul="Kelola User" action="create">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Tambah
            </Button>
          </RoleGuard>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex w-64 items-center">
              <Input
                placeholder="Cari nama / username / email..."
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
          {selected.length > 0 && (
            <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-2 text-sm">
              <div>{selected.length} dipilih</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmBulk("enable")}
                >
                  <Check className="size-4" /> Aktifkan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmBulk("disable")}
                >
                  <Power className="size-4" /> Nonaktifkan
                </Button>
                <RoleGuard modul="Kelola User" action="delete">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmBulk("delete")}
                  >
                    <Trash2 className="size-4" /> Hapus
                  </Button>
                </RoleGuard>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                  <X className="size-4" /> Batal
                </Button>
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
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center text-sm">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-destructive text-center text-sm">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : userDataList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center text-sm">
                    Belum ada data user.
                  </TableCell>
                </TableRow>
              ) : (
                userDataList.map((u: User, i: number) => {
                  const isSelf = u.id === currentUser?.id;
                  const isSA = isSuperadminRole(u.role?.namaRole || "");
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          className="accent-primary size-4"
                          checked={selected.includes(u.id)}
                          onChange={() => toggleOne(u.id)}
                          aria-label={`Pilih ${u.nama}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {(meta.page - 1) * meta.limit + i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{u.nama}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.role?.namaRole || "-"}</TableCell>
                      <TableCell>
                        {u.disabled ? (
                          <span className="text-destructive inline-flex items-center gap-1 text-sm">
                            <XCircle className="size-4" /> Nonaktif
                          </span>
                        ) : (
                          <span className="text-green-600 inline-flex items-center gap-1 text-sm">
                            <Check className="size-4" /> Aktif
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <RoleGuard
                            modul="Kelola User"
                            action="update"
                            fallback={
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                disabled
                                title="Tidak punya akses"
                              >
                                <Power className="size-4" />
                              </Button>
                            }
                          >
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              disabled={isSelf}
                              title={isSelf ? "Tidak bisa ubah status diri sendiri" : "Ubah status"}
                              onClick={() => doPatchStatus(u.id, !u.disabled)}
                            >
                              <Power className="size-4" />
                            </Button>
                          </RoleGuard>
                          <RoleGuard
                            modul="Kelola User"
                            action="delete"
                            fallback={null}
                          >
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              disabled={isSelf || isSA}
                              title={
                                isSelf
                                  ? "Tidak bisa hapus diri sendiri"
                                  : isSA
                                    ? "Tidak bisa hapus Superadmin"
                                    : "Hapus user"
                              }
                              onClick={() => setConfirmDelete({ id: u.id, name: u.nama })}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </RoleGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="border-t p-3">
          <TablePagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPage={setPage}
            total={meta.total}
            label="user"
          />
        </div>
      </Card>

      <UserFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              User <strong>{confirmDelete?.name}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && doDelete(confirmDelete.id)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmBulk}
        onOpenChange={(o) => !o && setConfirmBulk(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBulk === "delete"
                ? `Hapus ${selected.length} user?`
                : confirmBulk === "disable"
                  ? `Nonaktifkan ${selected.length} user?`
                  : `Aktifkan ${selected.length} user?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBulk === "delete"
                ? "User yang dihapus tidak dapat dikembalikan. User Superadmin dan akun sendiri akan dilewati."
                : "Status user akan diperbarui."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmBulk === "delete") doBulkDelete();
                else if (confirmBulk === "disable") doBulkStatus(true);
                else if (confirmBulk === "enable") doBulkStatus(false);
              }}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
