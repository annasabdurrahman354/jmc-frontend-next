"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  msLeft: number;
  onExtend: () => void;
  onLogout: () => void;
};

export function SessionWarningDialog({ open, msLeft, onExtend, onLogout }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(Math.max(0, Math.ceil(msLeft / 1000)));
    if (!open) return;
    const id = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [msLeft, open]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onExtend();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sesi akan berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Sesi Anda akan berakhir dalam <strong>{seconds}</strong> detik karena tidak ada aktivitas. Perpanjang sesi untuk tetap login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout}>Logout Sekarang</AlertDialogCancel>
          <AlertDialogAction onClick={onExtend}>Perpanjang Sesi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
