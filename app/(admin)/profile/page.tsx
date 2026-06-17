"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/auth/store";
import { useQuery } from "@tanstack/react-query";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas/auth";
import type { ApiResponse, User } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/utils";

import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatDateTimeID } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  const { data: me, isLoading: loading, refetch } = useQuery<User, Error>({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User>>(ENDPOINTS.users.me);
      return res.data.data;
    },
  });
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");

  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const startEdit = () => {
    if (me) {
      setNama(me.nama);
      setEmail(me.email);
      setEditing(true);
    }
  };

  const saveProfile = async () => {
    if (!me) return;
    setSavingProfile(true);
    try {
      const res = await api.put<ApiResponse<User>>(ENDPOINTS.users.updateMe, { nama, email });
      const updated = res.data.data;
      setSession(
        {
          token: useAuthStore.getState().token!,
          user: { id: updated.id, nama: updated.nama, username: updated.username, role: updated.role },
        },
        useAuthStore.getState().rememberMe,
      );
      toast.success("Profil berhasil diperbarui");
      setEditing(false);
      refetch();
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } } };
      const errors = ax.response?.data?.errors;
      if (errors) {
        const localSetError = (field: "nama" | "email", message: string) =>
          setError(field as keyof ChangePasswordInput as never, { type: "server", message } as never, { shouldFocus: false });
        errors.forEach((e) => {
          if (e.field === "nama" || e.field === "email") {
            localSetError(e.field, e.message);
          } else {
            toast.error(`${e.field}: ${e.message}`);
          }
        });
      } else {
        toast.error(ax.response?.data?.message || "Gagal memperbarui profil");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordInput) => {
    setSavingPw(true);
    try {
      await api.put(ENDPOINTS.users.changePassword, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password berhasil diubah. Silakan login kembali.");
      reset();
      clear();
      setTimeout(() => router.replace("/login"), 800);
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } } };
      const errors = ax.response?.data?.errors;
      if (errors) {
        applyServerErrors(setError, errors);
      } else {
        toast.error(ax.response?.data?.message || "Gagal mengubah password");
      }
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Memuat profil...</div>
    );
  }

  if (!me) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Profil tidak tersedia.</div>
    );
  }

  return (
    <>
      <PageHeader title="Profil Saya" actions={<BackButton />} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Diri</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Nama</FieldLabel>
                {editing ? (
                  <Input value={nama} onChange={(e) => setNama(e.target.value)} />
                ) : (
                  <div className="rounded-md border px-3 py-2 text-sm">{me.nama}</div>
                )}
              </Field>
              <Field>
                <FieldLabel>Username</FieldLabel>
                <div className="bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
                  {me.username}
                </div>
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                {editing ? (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <div className="rounded-md border px-3 py-2 text-sm">{me.email || "-"}</div>
                )}
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <div className="bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
                  {me.role?.namaRole || "-"}
                </div>
              </Field>
              <Field>
                <FieldLabel>Login Terakhir</FieldLabel>
                <div className="bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
                  {me.lastLogin ? formatDateTimeID(me.lastLogin) : "-"}
                </div>
              </Field>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} disabled={savingProfile}>
                      Batal
                    </Button>
                  </>
                ) : (
                  <Button onClick={startEdit}>Edit Profil</Button>
                )}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4" noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Password Lama</FieldLabel>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurr ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-10"
                      {...register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurr((v) => !v)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                      tabIndex={-1}
                    >
                      {showCurr ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <FieldError errors={[{ message: errors.currentPassword.message }]} />}
                </Field>
                <Field>
                  <FieldLabel htmlFor="newPassword">Password Baru</FieldLabel>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-10"
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <FieldError errors={[{ message: errors.newPassword.message }]} />}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Konfirmasi Password Baru</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && <FieldError errors={[{ message: errors.confirmPassword.message }]} />}
                </Field>
                <div className="text-muted-foreground text-xs">
                  Password baru: minimal 8 karakter, tanpa spasi, 1 huruf besar, 1 huruf kecil, 1 karakter khusus.
                </div>
                <Button type="submit" disabled={savingPw}>
                  {savingPw ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Ganti Password
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
