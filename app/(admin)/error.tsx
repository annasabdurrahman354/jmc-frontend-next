"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 rounded-full p-4">
        <AlertTriangle className="text-destructive size-8" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {error.message || "Halaman tidak dapat dimuat. Silakan coba lagi."}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="size-4" />
        Coba Lagi
      </Button>
    </div>
  );
}
