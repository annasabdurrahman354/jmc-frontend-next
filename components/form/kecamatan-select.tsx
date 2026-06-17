"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, MasterWilayah } from "@/lib/api/types";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type Props = {
  value?: number | null;
  onChange: (wilayah: MasterWilayah | null) => void;
  defaultLabel?: string;
  error?: string;
};

export function KecamatanSelect({ value, onChange, defaultLabel, error }: Props) {
  const [inputValue, setInputValue] = useState(defaultLabel ?? "");
  const debounced = useDebounce(inputValue, 300);

  const { data: results = [], isFetching } = useQuery<MasterWilayah[]>({
    queryKey: ["wilayah-search", debounced],
    queryFn: async () => {
      const q = debounced.trim();
      if (q.length < 3) return [];
      const res = await api.get<ApiResponse<MasterWilayah[]>>(
        ENDPOINTS.masterWilayah.search(q),
      );
      return res.data.data ?? [];
    },
    enabled: debounced.trim().length >= 3,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const handleValueChange = (val: string | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const found = results.find((r) => String(r.id) === val);
    if (found) {
      onChange(found);
      setInputValue(`${found.kecamatan} — ${found.kabupaten}`);
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
        const found = results.find((r) => String(r.id) === val);
        return found ? `${found.kecamatan} — ${found.kabupaten}` : "";
      }}
    >
      <ComboboxInput
        placeholder="Ketik min. 3 karakter..."
        showClear={!!value}
        className="w-full"
        aria-label="Cari kecamatan"
      />

      <ComboboxContent>
        {isFetching && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Mencari...
          </div>
        )}

        {!isFetching && debounced.trim().length < 3 && (
          <div className="py-3 text-center text-xs text-muted-foreground">
            Ketik minimal 3 karakter untuk mencari kecamatan
          </div>
        )}

        {!isFetching && debounced.trim().length >= 3 && results.length === 0 && (
          <ComboboxEmpty>Kecamatan tidak ditemukan.</ComboboxEmpty>
        )}

        {!isFetching && results.length > 0 && (
          <ComboboxList>
            {results.map((item) => (
              <ComboboxItem
                key={item.id}
                value={String(item.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.kecamatan}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.kabupaten}, {item.provinsi}
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
