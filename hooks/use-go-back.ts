"use client";

import * as React from "react";

export function useGoBack() {
  const goBack = React.useCallback((fallback: string = "/") => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = fallback;
    }
  }, []);

  return { goBack };
}
