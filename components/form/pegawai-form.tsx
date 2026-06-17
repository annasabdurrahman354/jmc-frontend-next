"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { applyServerErrors, formatDateInput } from "@/lib/utils";
import { pegawaiSchema, type PegawaiInput } from "@/lib/schemas/pegawai";
import type { ApiResponse, MasterData, MasterWilayah, Pegawai } from "@/lib/api/types";
import {
  JENIS_KELAMIN,
  STATUS_KAWIN,
  STATUS_KONTRAK,
  STATUS_PEGAWAI,
} from "@/lib/types/common";

import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FotoUploader } from "@/components/form/foto-uploader";
import { PendidikanList } from "@/components/form/pendidikan-list";
// import { KecamatanAutocomplete } from "@/components/form/kecamatan-autocomplete"; // sementara nonaktif

type Props = {
  pegawai?: Pegawai; // if provided → edit mode
};

export function PegawaiForm({ pegawai }: Props) {
  const router = useRouter();
  const isEdit = !!pegawai;

  const { data: jabatanList } = useQuery<MasterData[], Error>({
    queryKey: ["masterData", "jabatan"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MasterData[]>>(ENDPOINTS.masterData.list("jabatan"));
      return res.data.data;
    },
  });
  const { data: departemenList } = useQuery<MasterData[], Error>({
    queryKey: ["masterData", "departemen"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MasterData[]>>(
        ENDPOINTS.masterData.list("departemen"),
      );
      return res.data.data;
    },
  });

  const { data: wilayahList } = useQuery<MasterWilayah[], Error>({
    queryKey: ["masterWilayah"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MasterWilayah[]>>(ENDPOINTS.masterWilayah.list());
      return res.data.data;
    },
  });

  const [selectedWilayah, setSelectedWilayah] = React.useState<MasterWilayah | null>(
    pegawai?.kecamatan ?? null,
  );
  const [submitting, setSubmitting] = React.useState(false);

  const methods = useForm<PegawaiInput>({
    resolver: zodResolver(pegawaiSchema),
      defaultValues: pegawai
      ? {
          nip: pegawai.nip,
          namaPegawai: pegawai.namaPegawai,
          email: pegawai.email,
          nomorHp: pegawai.nomorHp,
          tempatLahir: pegawai.tempatLahir,
          idKecamatan: pegawai.idKecamatan,
          alamatLengkap: pegawai.alamatLengkap,
          jarakRumahKantor: pegawai.jarakRumahKantor,
          tanggalLahir: formatDateInput(pegawai.tanggalLahir),
          statusKawin: pegawai.statusKawin,
          jumlahAnak: pegawai.jumlahAnak,
          tanggalMasuk: formatDateInput(pegawai.tanggalMasuk),
          idJabatan: pegawai.idJabatan,
          idDepartemen: pegawai.idDepartemen,
          jenisKelamin: pegawai.jenisKelamin,
          statusKontrak: pegawai.statusKontrak,
          status: pegawai.status,
          fotoPegawai: undefined,
          pendidikan: pegawai.pendidikan.map((p) => ({
            tingkatPendidikan: p.tingkatPendidikan,
            namaSekolah: p.namaSekolah,
            tahunLulus: p.tahunLulus,
          })),
        }
      : {
          pendidikan: [],
          statusKawin: "tidak_kawin",
          jenisKelamin: "L",
          statusKontrak: "PKWTT",
          status: "Aktif",
          jumlahAnak: 0,
          jarakRumahKantor: 0,
        },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = methods;

  // Auto-compute usia from tanggalLahir
  const tanggalLahir = watch("tanggalLahir");
  const usia = React.useMemo(() => {
    if (!tanggalLahir) return "";
    const birth = new Date(tanggalLahir);
    if (isNaN(birth.getTime())) return "";
    const years = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
    return years >= 0 ? `${years} tahun` : "";
  }, [tanggalLahir]);

  // Setelah list option (jabatan/departemen/kecamatan) selesai di-fetch,
  // paksa setValue agar <select> re-render dan menampilkan option yang cocok.
  // Tanpa ini, value sudah di-set oleh defaultValues tapi <option> belum ada
  // sehingga browser menampilkan placeholder kosong.
  React.useEffect(() => {
    if (jabatanList && jabatanList.length > 0 && pegawai?.idJabatan) {
      setValue("idJabatan", Number(pegawai.idJabatan), { shouldValidate: true });
    }
  }, [jabatanList, pegawai?.idJabatan, setValue]);

  React.useEffect(() => {
    if (departemenList && departemenList.length > 0 && pegawai?.idDepartemen) {
      setValue("idDepartemen", Number(pegawai.idDepartemen), { shouldValidate: true });
    }
  }, [departemenList, pegawai?.idDepartemen, setValue]);

  const idKecamatan = watch("idKecamatan");
  React.useEffect(() => {
    if (wilayahList && wilayahList.length > 0 && pegawai?.idKecamatan) {
      setValue("idKecamatan", Number(pegawai.idKecamatan), { shouldValidate: true });
      const w = wilayahList.find((x) => x.id === Number(pegawai.idKecamatan)) ?? null;
      setSelectedWilayah(w);
    }
  }, [wilayahList, pegawai?.idKecamatan, setValue]);

  const onSubmit = async (data: PegawaiInput) => {
    setSubmitting(true);
    try {
      const hasFile = data.fotoPegawai instanceof File;

      if (hasFile) {
        const fd = new FormData();
        Object.entries(data).forEach(([key, val]) => {
          if (key === "pendidikan") {
            fd.append("pendidikan", JSON.stringify(val));
          } else if (key === "fotoPegawai" && val instanceof File) {
            fd.append("fotoPegawai", val);
          } else if (val !== undefined && val !== null) {
            fd.append(key, String(val));
          }
        });

        if (isEdit) {
          await api.put(ENDPOINTS.pegawai.update(pegawai!.id), fd);
        } else {
          await api.post(ENDPOINTS.pegawai.create, fd);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fotoPegawai: _foto, ...body } = data;
        if (isEdit) {
          await api.put(ENDPOINTS.pegawai.update(pegawai!.id), body);
        } else {
          await api.post(ENDPOINTS.pegawai.create, body);
        }
      }

      toast.success(isEdit ? "Data pegawai berhasil diperbarui" : "Data pegawai berhasil ditambahkan");
      router.push("/pegawai");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: { message: string; errors?: Array<{field: string; message: string}> } } };
      if (axiosErr.response?.status === 422 && axiosErr.response.data.errors) {
        applyServerErrors(setError as Parameters<typeof applyServerErrors>[0], axiosErr.response.data.errors);
        toast.error("Perbaiki kesalahan pada form");
      } else if (axiosErr.response?.status === 409) {
        toast.error("NIP atau email sudah digunakan");
      } else {
        toast.error(axiosErr.response?.data?.message ?? "Terjadi kesalahan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PageHeader
          title={isEdit ? "Edit Data Pegawai" : "Tambah Data Pegawai"}
          actions={<BackButton fallback="/pegawai" />}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* ─── Data Diri ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Data Diri</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Foto */}
                <div className="flex justify-center pb-2">
                  <Controller
                    control={control}
                    name="fotoPegawai"
                    render={({ field, fieldState }) => (
                      <FotoUploader
                        onChange={(f) => field.onChange(f)}
                        currentPhotoUrl={
                          pegawai?.fotoPegawai
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/uploads/pegawai/${pegawai.fotoPegawai}`
                            : null
                        }
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="nip">NIP *</FieldLabel>
                    <Input
                      id="nip"
                      {...register("nip")}
                      placeholder="Min 8 digit angka"
                      aria-invalid={!!errors.nip}
                    />
                    {errors.nip && <FieldError errors={[{ message: errors.nip.message }]} />}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="namaPegawai">Nama Pegawai *</FieldLabel>
                    <Input
                      id="namaPegawai"
                      {...register("namaPegawai")}
                      aria-invalid={!!errors.namaPegawai}
                    />
                    {errors.namaPegawai && (
                      <FieldError errors={[{ message: errors.namaPegawai.message }]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email *</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <FieldError errors={[{ message: errors.email.message }]} />}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="nomorHp">Nomor HP *</FieldLabel>
                    <Input
                      id="nomorHp"
                      {...register("nomorHp")}
                      placeholder="+6282218458888"
                      aria-invalid={!!errors.nomorHp}
                    />
                    {errors.nomorHp && (
                      <FieldError errors={[{ message: errors.nomorHp.message }]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tempatLahir">Tempat Lahir *</FieldLabel>
                    <Input id="tempatLahir" {...register("tempatLahir")} aria-invalid={!!errors.tempatLahir} />
                    {errors.tempatLahir && (
                      <FieldError errors={[{ message: errors.tempatLahir.message }]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tanggalLahir">Tanggal Lahir *</FieldLabel>
                    <Input
                      id="tanggalLahir"
                      type="date"
                      {...register("tanggalLahir")}
                      aria-invalid={!!errors.tanggalLahir}
                    />
                    {errors.tanggalLahir && (
                      <FieldError errors={[{ message: errors.tanggalLahir.message }]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Usia</FieldLabel>
                    <Input value={usia} disabled readOnly placeholder="Otomatis terisi" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="jenisKelamin">Jenis Kelamin *</FieldLabel>
                    <select
                      id="jenisKelamin"
                      {...register("jenisKelamin")}
                      className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                      aria-invalid={!!errors.jenisKelamin}
                    >
                      {JENIS_KELAMIN.map((v) => (
                        <option key={v} value={v}>
                          {v === "L" ? "Laki-laki" : "Perempuan"}
                        </option>
                      ))}
                    </select>
                    {errors.jenisKelamin && (
                      <FieldError errors={[{ message: errors.jenisKelamin.message }]} />
                    )}
                  </Field>
                </div>

                {/* Status Kawin */}
                <Field>
                  <FieldLabel>Status Kawin *</FieldLabel>
                  <div className="flex gap-4">
                    {STATUS_KAWIN.map((v) => (
                      <label key={v} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          value={v}
                          {...register("statusKawin")}
                          className="accent-primary"
                        />
                        {v === "kawin" ? "Kawin" : "Tidak Kawin"}
                      </label>
                    ))}
                  </div>
                  {errors.statusKawin && (
                    <FieldError errors={[{ message: errors.statusKawin.message }]} />
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="jumlahAnak">Jumlah Anak *</FieldLabel>
                  <Input
                    id="jumlahAnak"
                    type="number"
                    min={0}
                    max={99}
                    {...register("jumlahAnak", { valueAsNumber: true })}
                    aria-invalid={!!errors.jumlahAnak}
                  />
                  {errors.jumlahAnak && (
                    <FieldError errors={[{ message: errors.jumlahAnak.message }]} />
                  )}
                </Field>

                {/* Alamat */}
                <Field>
                  <FieldLabel htmlFor="idKecamatan">Kecamatan *</FieldLabel>
                  <select
                    id="idKecamatan"
                    {...register("idKecamatan", { valueAsNumber: true })}
                    className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                    aria-invalid={!!errors.idKecamatan}
                  >
                    <option value="">Pilih kecamatan</option>
                    {(wilayahList ?? []).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.kecamatan} — {w.kabupaten}, {w.provinsi}
                      </option>
                    ))}
                  </select>
                  {errors.idKecamatan && (
                    <FieldError errors={[{ message: errors.idKecamatan.message }]} />
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Kabupaten</FieldLabel>
                    <Input
                      value={selectedWilayah?.kabupaten ?? ""}
                      disabled
                      readOnly
                      placeholder="Otomatis terisi"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Provinsi</FieldLabel>
                    <Input
                      value={selectedWilayah?.provinsi ?? ""}
                      disabled
                      readOnly
                      placeholder="Otomatis terisi"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="alamatLengkap">Alamat Lengkap *</FieldLabel>
                  <textarea
                    id="alamatLengkap"
                    rows={3}
                    {...register("alamatLengkap")}
                    className={`border-input bg-transparent w-full rounded-md border px-2.5 py-1.5 text-sm ${
                      errors.alamatLengkap ? "border-destructive" : ""
                    }`}
                  />
                  {errors.alamatLengkap && (
                    <FieldError errors={[{ message: errors.alamatLengkap.message }]} />
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="jarakRumahKantor">Jarak Rumah - Kantor (km) *</FieldLabel>
                  <Input
                    id="jarakRumahKantor"
                    type="number"
                    min={0}
                    max={99}
                    {...register("jarakRumahKantor", { valueAsNumber: true })}
                    aria-invalid={!!errors.jarakRumahKantor}
                  />
                  {errors.jarakRumahKantor && (
                    <FieldError errors={[{ message: errors.jarakRumahKantor.message }]} />
                  )}
                </Field>

                {/* Pendidikan */}
                <Field>
                  <FieldLabel>Riwayat Pendidikan *</FieldLabel>
                  <PendidikanList />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ─── Data Kepegawaian ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Data Kepegawaian</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="tanggalMasuk">Tanggal Masuk *</FieldLabel>
                  <Input
                    id="tanggalMasuk"
                    type="date"
                    {...register("tanggalMasuk")}
                    aria-invalid={!!errors.tanggalMasuk}
                  />
                  {errors.tanggalMasuk && (
                    <FieldError errors={[{ message: errors.tanggalMasuk.message }]} />
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="idJabatan">Jabatan *</FieldLabel>
                    <select
                      id="idJabatan"
                      {...register("idJabatan", { valueAsNumber: true })}
                      className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                      aria-invalid={!!errors.idJabatan}
                    >
                      <option value="">Pilih jabatan</option>
                      {(jabatanList ?? []).map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nama}
                        </option>
                      ))}
                    </select>
                    {errors.idJabatan && (
                      <FieldError errors={[{ message: errors.idJabatan.message }]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="idDepartemen">Departemen *</FieldLabel>
                    <select
                      id="idDepartemen"
                      {...register("idDepartemen", { valueAsNumber: true })}
                      className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                      aria-invalid={!!errors.idDepartemen}
                    >
                      <option value="">Pilih departemen</option>
                      {(departemenList ?? []).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama}
                        </option>
                      ))}
                    </select>
                    {errors.idDepartemen && (
                      <FieldError errors={[{ message: errors.idDepartemen.message }]} />
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="statusKontrak">Status Kontrak *</FieldLabel>
                  <select
                    id="statusKontrak"
                    {...register("statusKontrak")}
                    className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                    aria-invalid={!!errors.statusKontrak}
                  >
                    {STATUS_KONTRAK.map((v) => (
                      <option key={v} value={v}>
                        {v === "PKWTT" ? "PKWTT (Pegawai Tetap)" : v === "PKWT" ? "PKWT (Kontrak)" : "Magang"}
                      </option>
                    ))}
                  </select>
                  {errors.statusKontrak && (
                    <FieldError errors={[{ message: errors.statusKontrak.message }]} />
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">Status Pegawai *</FieldLabel>
                  <select
                    id="status"
                    {...register("status")}
                    className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                    aria-invalid={!!errors.status}
                  >
                    {STATUS_PEGAWAI.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <FieldError errors={[{ message: errors.status.message }]} />
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <BackButton fallback="/pegawai" />
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Perbarui" : "Simpan"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
