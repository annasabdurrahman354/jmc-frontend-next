"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useDebounce } from "@/hooks/use-debounce";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDateTimeID } from "@/lib/utils";
import type { LogItem, PaginatedResponse } from "@/lib/api/types";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Pagination({
  page,
  totalPages,
  onPage,
  total,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  total: number;
}) {
  if (totalPages <= 1)
    return <div className="text-muted-foreground text-xs">Total {total} log</div>;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground text-xs">
        Hal {page} dari {totalPages} ({total} data)
      </div>
      <ul className="flex items-center gap-1">
        <li>
          <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
        </li>
        {pages.map((p) => (
          <li key={p}>
            <Button variant={p === page ? "default" : "outline"} size="icon-sm" onClick={() => onPage(p)}>
              {p}
            </Button>
          </li>
        ))}
        <li>
          <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </li>
      </ul>
    </div>
  );
}

const MODULE_OPTIONS = [
  "Auth", "Dashboard", "Kelola Role", "Kelola User", "My Profile",
  "Modul Data Pegawai", "Setting Tunjangan Transport", "Modul Tunjangan Transport", "Modul Log",
];

const ACTION_OPTIONS = ["login", "logout", "read", "create", "update", "delete"];

export default function LogPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: debouncedSearch,
    module: moduleFilter,
    action: actionFilter,
    from: dateFrom,
    to: dateTo,
  });
  const url = `${ENDPOINTS.log}?${params.toString()}`;

  const { data, isLoading: loading, error } = useQuery<PaginatedResponse<LogItem>, Error>({
    queryKey: ["log", page, limit, debouncedSearch, moduleFilter, actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<LogItem>>(url);
      return res.data;
    },
  });

  const errorMessage = error?.message || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, moduleFilter, actionFilter, dateFrom, dateTo]);

  const actionBadge = (action: string) => {
    const colors: Record<string, string> = {
      login: "bg-green-100 text-green-700",
      logout: "bg-gray-100 text-gray-700",
      create: "bg-blue-100 text-blue-700",
      read: "bg-sky-100 text-sky-700",
      update: "bg-amber-100 text-amber-700",
      delete: "bg-red-100 text-red-700",
    };
    const cls = colors[action.toLowerCase()] ?? "bg-muted text-muted-foreground";
    return (
      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
        {action}
      </span>
    );
  };

  const logDataList: LogItem[] = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  return (
    <>
      <PageHeader title="Log Aktivitas" />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {/* Module filter */}
            <select
              className="border-input bg-transparent h-9 rounded-md border px-2 text-sm"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">Semua Modul</option>
              {MODULE_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Action filter */}
            <select
              className="border-input bg-transparent h-9 rounded-md border px-2 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">Semua Aksi</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Dari:</span>
              <Input
                type="date"
                className="h-9 w-36"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Tanggal dari"
              />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Sampai:</span>
              <Input
                type="date"
                className="h-9 w-36"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Tanggal sampai"
              />
            </div>

            {/* Search */}
            <div className="ml-auto flex w-56 items-center">
              <Input
                placeholder="Cari user / aksi..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Browser / Platform</TableHead>
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
              ) : logDataList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Tidak ada log aktivitas.
                  </TableCell>
                </TableRow>
              ) : (
                logDataList.map((item: LogItem, i: number) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      {(meta.page - 1) * meta.limit + i + 1}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDateTimeID(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {item.creator?.nama ?? "System"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {item.creator?.username ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{item.module}</TableCell>
                    <TableCell>{actionBadge(item.action)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.browser ?? "-"}
                      {item.platform ? ` / ${item.platform}` : ""}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="border-t p-3">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPage={setPage}
            total={meta.total}
          />
        </div>
      </Card>
    </>
  );
}
