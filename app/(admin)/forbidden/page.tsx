import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 rounded-full p-6">
        <ShieldX className="text-destructive size-12" />
      </div>
      <div>
        <h1 className="text-4xl font-bold">403</h1>
        <h2 className="mt-2 text-xl font-semibold">Akses Ditolak</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
