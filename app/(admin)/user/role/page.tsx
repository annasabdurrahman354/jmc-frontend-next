"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiResponse, RoleSummary } from "@/lib/api/types";

export default function RoleListPage() {
  const { data, isLoading: loading, error } = useQuery<RoleSummary[], Error>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RoleSummary[]>>(ENDPOINTS.roles.list);
      return res.data.data;
    },
  });
  const errorMessage = error?.message || null;

  return (
    <>
      <PageHeader title="Manajemen Role" />

      <Card>
        <CardHeader>
          <p className="text-muted-foreground text-sm">
            Daftar role yang tersedia. Klik &quot;Hak Akses&quot; untuk melihat detail permission tiap role.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-32 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center text-sm">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : errorMessage ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-destructive text-center text-sm">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center text-sm">
                    Belum ada data role.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((role, i) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell className="font-medium">{role.namaRole}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.deskripsi || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <LinkButton size="sm" href={`/user/role/hak-akses/${role.id}`}>
                        <Eye className="size-4" />
                        Hak Akses
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
