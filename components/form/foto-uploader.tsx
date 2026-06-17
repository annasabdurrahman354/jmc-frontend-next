"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, User2 } from "lucide-react";

type Props = {
  onChange: (file: File | null) => void;
  currentPhotoUrl?: string | null;
  error?: string;
};

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export function FotoUploader({ onChange, currentPhotoUrl, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (currentPhotoUrl) {
      setPreview(currentPhotoUrl);
    }
  }, [currentPhotoUrl]);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setLocalError(null);
      onChange(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Format file harus PNG, JPEG, atau JPG");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError("Ukuran file maksimal 2MB");
      return;
    }

    setLocalError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = error ?? localError;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative flex size-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors ${
          displayError
            ? "border-destructive bg-destructive/5"
            : "border-input hover:border-primary bg-muted/30"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload foto pegawai"
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview foto"
              fill
              className="object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="bg-destructive/80 text-destructive-foreground absolute right-1 top-1 rounded-full p-0.5 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
              aria-label="Hapus foto"
            >
              <X className="size-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 p-2 text-center">
            <User2 className="text-muted-foreground size-8" />
            <Upload className="text-muted-foreground size-4" />
          </div>
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-destructive text-xs hover:underline"
        >
          Hapus Foto
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div className="text-center">
        <p className="text-muted-foreground text-xs">PNG, JPEG, JPG. Maks 2MB.</p>
        {displayError && (
          <p className="text-destructive mt-1 text-xs">{displayError}</p>
        )}
      </div>
    </div>
  );
}
