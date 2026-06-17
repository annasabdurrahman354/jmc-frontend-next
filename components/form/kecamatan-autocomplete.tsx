"use client";

// ─────────────────────────────────────────────────────────────────────────────
// KECAMATAN AUTOCOMPLETE — DINONAKTIFKAN SEMENTARA
// Untuk saat ini halaman form pegawai menggunakan <select> biasa yang
// mengambil data dari endpoint GET /master-wilayah. Komponen autocomplete
// di bawah ini dipertahankan (di-comment) untuk aktivasi kembali di kemudian
// hari. Jangan hapus file ini.
// ─────────────────────────────────────────────────────────────────────────────

/*
import { useState, useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import type { MasterWilayah } from "@/lib/api/types";

type Props = {
  onSelect: (wilayah: MasterWilayah) => void;
  defaultValue?: string;
  error?: string;
};

export function KecamatanAutocomplete({ onSelect, defaultValue = "", error }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<MasterWilayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastFetchedRef = useRef<string>(defaultValue);

  useEffect(() => {
    if (defaultValue) {
      setQuery(defaultValue);
      lastFetchedRef.current = defaultValue;
    }
  }, [defaultValue]);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (q === lastFetchedRef.current) return;

    let cancelled = false;
    setLoading(true);
    setOpen(true);

    api
      .get<{ success: boolean; data: MasterWilayah[] }>(
        ENDPOINTS.masterWilayah.search(q),
      )
      .then((res) => {
        if (cancelled) return;
        const data = (res.data?.data ?? []) as MasterWilayah[];
        setResults(data);
        setOpen(true);
        lastFetchedRef.current = q;
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[kecamatan-autocomplete] fetch failed:", err);
        setResults([]);
        setOpen(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: MasterWilayah) => {
    setQuery(item.kecamatan);
    lastFetchedRef.current = item.kecamatan;
    setOpen(false);
    setResults([]);
    onSelect(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Ketik min 3 karakter..."
          aria-invalid={!!error}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-md">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            >
              <Check className="text-primary size-3 shrink-0 opacity-0" />
              <div>
                <div className="font-medium">{item.kecamatan}</div>
                <div className="text-muted-foreground text-xs">
                  {item.kabupaten}, {item.provinsi}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && debounced.trim().length >= 3 && (
        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-md border p-3 text-sm shadow-md">
          <span className="text-muted-foreground">Kecamatan tidak ditemukan.</span>
        </div>
      )}
    </div>
  );
}
*/

// Placeholder export agar import lama tidak broken. Akan dihapus bila komponen
// diaktifkan kembali atau bila seluruh referensi di form sudah dibersihkan.
export function KecamatanAutocomplete(_props: unknown) {
  return null;
}
