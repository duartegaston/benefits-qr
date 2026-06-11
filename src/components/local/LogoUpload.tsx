"use client";
import { useId, useRef, useState } from "react";
import { Camera } from "lucide-react";
import Button from "@/components/ui/Button";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_INPUT_LOGO_BYTES = 10 * 1024 * 1024;

export type LogoUploadStatus = "idle" | "selected" | "error";

export type LogoFieldState = {
  src: string | null;
  persistedSrc: string | null;
  status: LogoUploadStatus;
  message: string | null;
  file: File | null;
};

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  nombre: string;
  value?: LogoFieldState;
  onChange?: (state: LogoFieldState) => void;
}

function createLogoFieldState(src: string | null | undefined): LogoFieldState {
  return {
    src: src ?? null,
    persistedSrc: src ?? null,
    status: "idle",
    message: null,
    file: null,
  };
}

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function validateLogoFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Solo se permiten imágenes JPG, PNG, WebP o GIF";
  }

  if (file.size > MAX_INPUT_LOGO_BYTES) {
    return "La imagen no puede superar 10MB";
  }

  return null;
}

export default function LogoUpload({
  currentLogoUrl,
  nombre,
  value,
  onChange,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useId();
  const hintId = useId();
  const [internalState, setInternalState] = useState<LogoFieldState>(() => createLogoFieldState(currentLogoUrl));
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const fieldState = value ?? internalState;

  function commitState(nextState: LogoFieldState) {
    if (nextState.src !== failedSrc) {
      setFailedSrc(null);
    }

    if (!value) {
      setInternalState(nextState);
    }

    onChange?.(nextState);

    return nextState;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";

    if (!file) return;

    const validationError = validateLogoFile(file);

    if (validationError) {
      commitState({
        src: fieldState.persistedSrc,
        persistedSrc: fieldState.persistedSrc,
        status: "error",
        message: validationError,
        file: null,
      });
      return;
    }

    const reader = new FileReader();
    const localPreview = await new Promise<string | null>((resolve) => {
      reader.onload = (event) => resolve(typeof event.target?.result === "string" ? event.target.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

    commitState({
      src: localPreview ?? fieldState.persistedSrc,
      persistedSrc: fieldState.persistedSrc,
      status: "selected",
      message: "",
      file,
    });
  }

  const initials = getInitials(nombre);
  const statusToneClass =
    fieldState.status === "error"
      ? "text-danger"
      : fieldState.status === "selected"
        ? "text-success"
        : "text-text-muted";

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={() => inputRef.current?.click()}
        title="Cambiar logo"
        aria-label="Cambiar logo"
        aria-describedby={`${hintId} ${messageId}`}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft p-0 focus-visible:ring-primary-soft focus-visible:ring-offset-surface disabled:cursor-not-allowed active:scale-100"
      >
        {fieldState.src && fieldState.src !== failedSrc ? (
          <span className="h-full w-full overflow-hidden rounded-[inherit]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fieldState.src}
              alt="Logo del local"
              className="h-full w-full rounded-[inherit] object-cover"
              onError={() => setFailedSrc(fieldState.src)}
            />
          </span>
        ) : (
          <span className="text-3xl font-bold text-primary">{initials}</span>
        )}

        <span className="absolute right-2 bottom-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary-foreground shadow-sm ring-2 ring-surface">
          <Camera aria-hidden="true" className="h-4 w-4" />
        </span>

      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <p id={hintId} className="text-center text-xs text-text-muted">
        JPG, PNG, WebP o GIF. Máximo 10MB.
      </p>

      <p id={messageId} aria-live="polite" className={`min-h-5 text-center text-xs font-medium ${statusToneClass}`}>
        {fieldState.message ?? ""}
      </p>
    </div>
  );
}
