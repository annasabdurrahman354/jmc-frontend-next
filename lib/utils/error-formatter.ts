import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import type { ApiError } from "@/lib/api/types";

export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors: ApiError["errors"],
) {
  if (!errors) return;
  errors.forEach((err) => {
    const key = err.field as Path<T>;
    setError(key, { type: "server", message: err.message }, { shouldFocus: false });
  });
}
