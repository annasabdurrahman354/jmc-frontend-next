"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiResponse, Role } from "@/lib/api/types";

function PermissionBadge({ value }: { value: boolean | string }) {
  if (value === true || value === "All") {
    return (
      <span className="inline-flex items-center gap-1 text-green-600">
        <Check className="size-4" /> {value === "All" ? "All" : ""}
      </span>
    );
  }
  if (value === "Own") {
    return <span className="inline-flex items-center gap-1 text-yellow-600">Own</span>;
  }
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1">
      <X className="size-4" />
    </span>
  );
}

function AccessIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="text-green-600 inline size-4" />
  ) : (
    <X className="text-muted-foreground inline size-4" />
  );
}

export default function HakAksesPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = React.useState<string | null>(null);
  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading: loading, error } = useQuery<Role, Error>({
    queryKey: ["roles", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Role>>(ENDPOINTS.roles.detail(id!));
      return res.data.data;
    },
    enabled: !!id,
  });
  const errorMessage = error?.message || null;

  return (
    <>
      <PageHeader
        title="Hak Akses Role"
        actions={<BackButton fallback="/user/role" />}
      />

      {loading ? (
        <div className="text-muted-foreground p-8 text-center text-sm">Memuat data...</div>
      ) : errorMessage ? (
        <div className="text-destructive p-8 text-center text-sm">{errorMessage}</div>
      ) : !data ? (
        <div className="text-muted-foreground p-8 text-center text-sm">Data tidak ditemukan.</div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Role</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Nama Role</FieldLabel>
                  <Input value={data.namaRole} disabled readOnly />
                </Field>
                <Field>
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Textarea value={data.deskripsi || ""} disabled readOnly rows={3} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Hak Akses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modul / Fitur</TableHead>
                    <TableHead className="w-24 text-center">Akses</TableHead>
                    <TableHead className="w-24 text-center">Create</TableHead>
                    <TableHead className="w-24 text-center">Read</TableHead>
                    <TableHead className="w-24 text-center">Update</TableHead>
                    <TableHead className="w-24 text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.permissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground text-center text-sm">
                        Belum ada permission.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.permissions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.modulFitur}</TableCell>
                        <TableCell className="text-center">
                          <AccessIcon value={p.akses} />
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionBadge value={p.create} />
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionBadge value={p.read} />
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionBadge value={p.update} />
                        </TableCell>
                        <TableCell className="text-center">
                          <PermissionBadge value={p.delete} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
