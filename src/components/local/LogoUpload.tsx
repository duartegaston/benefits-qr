"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Button from "@/components/ui/Button";

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  nombre: string;
  onUploaded?: (url: string) => void;
}

export default function LogoUpload({ currentLogoUrl, nombre, onUploaded }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    const form = new FormData();
    form.append("logo", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: form });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      onUploaded?.(data.url ?? "");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Error al subir la imagen");
      setPreview(currentLogoUrl ?? null);
    }
  }

  const initials = nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative group">
      <Button
        type="button"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        title="Cambiar logo"
        aria-label="Cambiar logo"
        disabled={loading}
        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft p-0 focus-visible:ring-primary-soft focus-visible:ring-offset-surface disabled:cursor-not-allowed active:scale-100"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-primary">{initials}</span>
        )}

        {/* Overlay al hacer hover */}
        <div className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-primary-foreground border-t-accent rounded-full animate-spin" />
          ) : (
            <Camera aria-hidden="true" className="w-7 h-7 text-primary-foreground" />
          )}
        </div>
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
