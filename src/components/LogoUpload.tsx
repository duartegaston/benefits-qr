"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-24 h-24 rounded-2xl overflow-hidden bg-violet-100 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed"
        title="Cambiar logo"
        aria-label="Cambiar logo"
        disabled={loading}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <span className="text-violet-600 font-bold text-3xl">{initials}</span>
        )}

        {/* Overlay al hacer hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera aria-hidden="true" className="w-7 h-7 text-white" />
          )}
        </div>
      </button>

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
