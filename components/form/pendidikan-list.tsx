"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import type { PegawaiInput } from "@/lib/schemas/pegawai";
import { TINGKAT_PENDIDIKAN } from "@/lib/types/common";

export function PendidikanList() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PegawaiInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pendidikan",
  });

  const rootError = errors.pendidikan?.root ?? errors.pendidikan;

  return (
    <div className="space-y-2">
      <div className="border-input overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Jenjang</th>
              <th className="px-3 py-2 text-left font-medium">Nama Sekolah / PT</th>
              <th className="px-3 py-2 text-left font-medium">Tahun Lulus</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-muted-foreground px-3 py-4 text-center text-xs"
                >
                  Belum ada data pendidikan. Klik &quot;Tambah&quot; untuk menambahkan.
                </td>
              </tr>
            )}
            {fields.map((field, index) => {
              const rowErrors = errors.pendidikan?.[index];
              return (
                <tr key={field.id} className="border-t border-input">
                  <td className="p-2">
                    <select
                      {...register(`pendidikan.${index}.tingkatPendidikan`)}
                      className="border-input bg-transparent h-9 w-full rounded-md border px-2 text-sm"
                      aria-invalid={!!rowErrors?.tingkatPendidikan}
                    >
                      <option value="">Pilih</option>
                      {TINGKAT_PENDIDIKAN.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {rowErrors?.tingkatPendidikan && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {rowErrors.tingkatPendidikan.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <Input
                      {...register(`pendidikan.${index}.namaSekolah`)}
                      placeholder="Nama sekolah"
                      aria-invalid={!!rowErrors?.namaSekolah}
                    />
                    {rowErrors?.namaSekolah && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {rowErrors.namaSekolah.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      {...register(`pendidikan.${index}.tahunLulus`, { valueAsNumber: true })}
                      placeholder="Tahun"
                      min={1950}
                      max={new Date().getFullYear()}
                      aria-invalid={!!rowErrors?.tahunLulus}
                    />
                    {rowErrors?.tahunLulus && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {rowErrors.tahunLulus.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-destructive hover:opacity-70"
                      aria-label="Hapus baris pendidikan"
                    >
                      <X className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rootError && typeof rootError.message === "string" && (
        <FieldError errors={[{ message: rootError.message }]} />
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              tingkatPendidikan: "SD",
              namaSekolah: "",
              tahunLulus: new Date().getFullYear(),
            })
          }
        >
          <Plus className="size-4" />
          Tambah Pendidikan
        </Button>
      </div>
    </div>
  );
}
