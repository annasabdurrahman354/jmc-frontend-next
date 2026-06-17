"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/auth/store";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import type { ApiResponse, LoginResponse, Role, ApiError } from "@/lib/api/types";

const CAPTCHA_LENGTH = 6;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const token = useAuthStore((s) => s.token);
  const captchaInputRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      toast.warning("Sesi Anda telah berakhir. Silakan login kembali.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      const from = searchParams.get("from") || "/";
      router.replace(from);
    }
  }, [token, router, searchParams]);

  useEffect(() => {
    loadCaptchaEnginge(CAPTCHA_LENGTH);
  }, []);

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setCaptchaError(null);

    const captchaValue = captchaInputRef.current?.value ?? "";
    if (!captchaValue) {
      setCaptchaError("Captcha wajib diisi");
      return;
    }
    if (!validateCaptcha(captchaValue)) {
      setCaptchaError("Captcha tidak valid. Silakan coba lagi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<LoginResponse>>(ENDPOINTS.auth.login, {
        identifier: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const { token: jwt, user } = res.data.data;

      // Decode JWT token to get the actual roleId
      let roleId = 0;
      try {
        const payloadBase64 = jwt.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          roleId = decoded.roleId || 0;
        }
      } catch (e) {
        console.error("Gagal men-decode token", e);
      }

      setSession({
        token: jwt,
        user: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          role: { id: roleId, namaRole: user.role }
        }
      }, data.rememberMe);

      try {
        if (roleId) {
          const roleRes = await api.get<ApiResponse<Role>>(
            ENDPOINTS.roles.detail(roleId),
            {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            }
          );
          setPermissions(roleRes.data.data.permissions || []);
        }
      } catch (err) {
        console.error("Gagal memuat permissions", err);
      }

      toast.success(`Selamat datang, ${user.nama}`);
      const from = searchParams.get("from") || "/";
      router.replace(from);
    } catch (err) {
      const ax = err as { response?: { data?: ApiError; status?: number } };
      const status = ax.response?.status;
      const message = ax.response?.data?.message;

      if (status === 429) {
        setServerError("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
      } else if (status === 403) {
        setServerError("Akun Anda dinonaktifkan. Hubungi administrator.");
      } else if (status === 401) {
        setServerError("Username/email/HP atau password salah.");
      } else {
        setServerError(message || "Login gagal. Coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <Image
          src="/images/logo/logo_jmc_black.png"
          alt="Logo JMC"
          width={90}
          height={30}
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/images/logo/logo_jmc.png"
          alt="Logo JMC"
          width={90}
          height={30}
          className="hidden h-7 w-auto dark:block"
        />
        <div className="leading-tight">
          <div className="text-primary text-lg font-bold">Admin JMC</div>
          <div className="text-muted-foreground text-xs">JMC IT Consultant</div>
        </div>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Selamat Datang, silahkan masukkan username/email/nomor HP dan password Anda!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">Username / Email / Nomor HP</FieldLabel>
                <Input
                  id="identifier"
                  autoComplete="username"
                  aria-invalid={!!errors.identifier}
                  {...register("identifier")}
                />
                {errors.identifier && <FieldError errors={[{ message: errors.identifier.message }]} />}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <FieldError errors={[{ message: errors.password.message }]} />}
              </Field>
              <Field>
                <FieldLabel>Captcha</FieldLabel>
                <div className="flex flex-col gap-2">
                  <LoadCanvasTemplate />
                  <Input
                    ref={captchaInputRef}
                    id="user_captcha_input"
                    type="text"
                    placeholder="Masukkan kode captcha"
                    autoComplete="off"
                    aria-invalid={!!captchaError}
                  />
                </div>
                {captchaError && (
                  <p className="text-destructive mt-1 text-xs">{captchaError}</p>
                )}
              </Field>
              <Field orientation="horizontal">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-primary size-4"
                    {...register("rememberMe")}
                  />
                  Ingat Saya
                </label>
              </Field>
              {serverError && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {serverError}
                </div>
              )}
            </FieldGroup>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Memproses...
                </>
              ) : (
                "MASUK"
              )}
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Dengan masuk, Anda menyetujui ketentuan penggunaan aplikasi.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground p-8 text-center text-sm">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
