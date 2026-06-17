"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PegawaiForm } from "@/components/form/pegawai-form";
import type { ApiResponse, Pegawai } from "@/lib/api/types";

export default function PegawaiEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading: loading, error } = useQuery<Pegawai, Error>({
    queryKey: ["pegawai", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Pegawai>>(ENDPOINTS.pegawai.detail(id!));
      return res.data.data;
    },
    enabled: !!id,
  });

  const errorMessage = error?.message || null;

  if (!id || loading) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Memuat data pegawai...</div>
    );
  }

  if (errorMessage) {
    return <div className="text-destructive p-8 text-center text-sm">{errorMessage}</div>;
  }

  if (!data) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Data tidak ditemukan.</div>
    );
  }

  return <PegawaiForm pegawai={data} />;
}
