"use client";

import * as React from "react";

import { useGoBack } from "@/hooks/use-go-back";
import { Button } from "@/components/ui/button";

export function BackButton({
  children,
  fallback = "/",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Button> & { fallback?: string }) {
  const { goBack } = useGoBack();
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => goBack(fallback)}
      {...props}
    >
      {children ?? "Kembali"}
    </Button>
  );
}
