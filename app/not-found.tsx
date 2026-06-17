import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="bg-muted rounded-full p-6">
        <FileQuestion className="text-muted-foreground size-16" />
      </div>
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
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
