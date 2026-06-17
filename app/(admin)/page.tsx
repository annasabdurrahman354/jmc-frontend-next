"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/store";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatDateID } from "@/lib/utils";
import type { DashboardData, DashboardManagerHrd, ApiResponse } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/layout/page-header";

const DONUT_PALETTE_PRIMARY = ["#549CE3", "#2B508E", "#FE7E00"];
const DONUT_PALETTE_GENDER = ["#2B508E", "#FE7E00"];

function DonutChart({
  data,
  colors,
  size = 160,
}: {
  data: { label: string; value: number }[];
  colors: string[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 60;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<{
    items: { color: string; dashArray: string; offset: number }[];
    cursor: number;
  }>(
    (acc, slice) => {
      const fraction = total === 0 ? 0 : slice.value / total;
      const length = circumference * fraction;
      acc.items.push({
        color: colors[acc.items.length % colors.length],
        dashArray: `${length} ${circumference - length}`,
        offset: acc.cursor,
      });
      acc.cursor += length;
      return acc;
    },
    { items: [], cursor: 0 },
  );

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <svg width={size} height={size} viewBox="0 0 160 160">
        <g transform="translate(80 80) rotate(-90)">
          {segments.items.map((s, i) => (
            <circle
              key={i}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dashArray}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
        <text
          x="80"
          y="78"
          textAnchor="middle"
          className="fill-foreground text-2xl font-semibold"
        >
          {total}
        </text>
        <text
          x="80"
          y="96"
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          Total
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block size-3 rounded-sm"
              style={{ background: colors[i % colors.length] }}
            />
            <span>
              {d.label}{" "}
              <span className="text-muted-foreground">({d.value})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type StatItem = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  backgroundColor: string;
};

function ManagerDashboard({ data }: { data: DashboardManagerHrd }) {
  const stats: StatItem[] = [
    { title: "Total Pegawai", value: data.widgets.total, icon: Users, backgroundColor: "#2B508E" },
    { title: "Pegawai Kontrak (PKWT)", value: data.widgets.pkwt, icon: Briefcase, backgroundColor: "#549CE3" },
    { title: "Pegawai Tetap (PKWTT)", value: data.widgets.pkwtt, icon: UserCheck, backgroundColor: "#2B508E" },
    { title: "Peserta Magang", value: data.widgets.magang, icon: GraduationCap, backgroundColor: "#FE7E00" },
  ];

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">{data.message}</h2>

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="bg-foreground text-background border-0 md:col-span-3">
          <CardContent className="flex flex-col items-center text-center">
            <Image
              src="/images/greeting-img.svg"
              alt=""
              width={180}
              height={140}
              className="mb-4"
            />
            <h3 className="text-lg leading-snug font-semibold">
              Fokuskan tujuan yang ingin didapat
            </h3>
            <p className="mt-2 text-xs italic text-white/70">
              &ldquo;Jangan biarkan faktor lain menghalangi tujuan Anda&rdquo;
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-9">
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full text-white"
                        style={{ width: 56, height: 56, background: item.backgroundColor }}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-semibold">{item.value}</div>
                        <div className="text-muted-foreground text-xs">{item.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Pegawai Berdasarkan Status Kontrak</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={data.charts.statusKontrak} colors={DONUT_PALETTE_PRIMARY} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Pegawai Berdasarkan Gender</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={data.charts.gender} colors={DONUT_PALETTE_GENDER} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Data Pegawai Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Status Kepegawaian</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead className="w-32 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pegawaiBaru.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center text-sm">
                    Belum ada data pegawai.
                  </TableCell>
                </TableRow>
              ) : (
                data.pegawaiBaru.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell>{p.namaPegawai}</TableCell>
                    <TableCell>{formatDateID(p.tanggalMasuk)}</TableCell>
                    <TableCell>{p.statusKontrak}</TableCell>
                    <TableCell>{p.jabatan?.nama || "-"}</TableCell>
                    <TableCell className="text-center">
                      <LinkButton size="sm" href={p.action.href}>
                        {p.action.label}
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

function SimpleWelcome({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <Image
          src="/images/greeting-img.svg"
          alt=""
          width={200}
          height={160}
          className="mb-6"
        />
        <h2 className="text-2xl font-semibold">{message}</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Silakan pilih menu di samping untuk memulai.
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading: loading, error } = useQuery<DashboardData, Error>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardData>>(ENDPOINTS.dashboard);
      return res.data.data;
    },
  });

  const errorMessage = error ? (error as any).response?.data?.message || error.message : null;

  const greetingName = user?.nama || "Pengguna";
  const roleName = user?.role?.namaRole || "User";
  const fallbackMessage = `Selamat Datang ${greetingName} - ${roleName}`;

  return (
    <>
      <PageHeader title="Dashboard" />
      {loading ? (
        <div className="text-muted-foreground p-8 text-center text-sm">Memuat dashboard...</div>
      ) : errorMessage ? (
        <div className="text-destructive p-8 text-center text-sm">{errorMessage}</div>
      ) : data?.role === "manager_hrd" ? (
        <ManagerDashboard data={data} />
      ) : (
        <SimpleWelcome message={data?.message || fallbackMessage} />
      )}
    </>
  );
}
