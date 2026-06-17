"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, Pegawai } from "@/lib/api/types";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type Props = {
  /** idPegawai terpilih */
  value?: number | null;
  onChange: (pegawai: Pegawai | null) => void;
  /** Hanya tampilkan pegawai yang belum punya akun user */
  excludeWithUser?: boolean;
  defaultLabel?: string;
  error?: string;
  placeholder?: string;
};

export function PegawaiSelect({
  value,
  onChange,
  excludeWithUser = false,
  defaultLabel,
  error,
  placeholder = "Ketik min. 2 karakter nama / NIP...",
}: Props) {
  const [inputValue, setInputValue] = useState(defaultLabel ?? "");
  const debounced = useDebounce(inputValue, 300);

  const { data: results = [], isFetching } = useQuery<Pegawai[]>({
    queryKey: ["pegawai-search", debounced],
    queryFn: async () => {
      const q = debounced.trim();
      if (q.length < 2) return [];
      const res = await api.get<PaginatedResponse<Pegawai>>(
        `/pegawai?search=${encodeURIComponent(q)}&limit=20`,
      );
      const data = res.data.data ?? [];
      return excludeWithUser ? data.filter((p) => !p.user) : data;
    },
    enabled: debounced.trim().length >= 2,
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const handleValueChange = (val: string | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const found = results.find((p) => String(p.id) === val);
    if (found) {
      onChange(found);
      setInputValue(`${found.nip} - ${found.namaPegawai}`);
    }
  };

  const handleInputValueChange = (val: string) => {
    setInputValue(val);
    if (!val) onChange(null);
  };

  return (
    <Combobox
      value={value ? String(value) : null}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={handleInputValueChange}
      filter={null}
      aria-invalid={!!error}
      itemToStringLabel={(val) => {
        const found = results.find((p) => String(p.id) === val);
        return found ? `${found.nip} - ${found.namaPegawai}` : "";
      }}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={!!value}
        className="w-full"
        aria-label="Cari pegawai"
      />

      <ComboboxContent>
        {isFetching && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Mencari...
          </div>
        )}

        {!isFetching && debounced.trim().length < 2 && (
          <div className="py-3 text-center text-xs text-muted-foreground">
            Ketik minimal 2 karakter untuk mencari pegawai
          </div>
        )}

        {!isFetching && debounced.trim().length >= 2 && results.length === 0 && (
          <ComboboxEmpty>
            {excludeWithUser
              ? "Pegawai tidak ditemukan atau sudah memiliki akun user."
              : "Pegawai tidak ditemukan."}
          </ComboboxEmpty>
        )}

        {!isFetching && results.length > 0 && (
          <ComboboxList>
            {results.map((p) => (
              <ComboboxItem
                key={p.id}
                value={String(p.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{p.namaPegawai}</span>
                  <span className="text-xs text-muted-foreground">
                    NIP: {p.nip}
                    {p.jabatan?.nama ? ` · ${p.jabatan.nama}` : ""}
                  </span>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
