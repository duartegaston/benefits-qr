"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function DeleteBeneficioButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/beneficios/${id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setConfirming(true)} variant="danger" size="sm">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Eliminar cupón</span>
      </Button>

      <Modal open={confirming} onClose={() => !loading && setConfirming(false)} title="Eliminar cupón">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esta acción eliminará el cupón y no se puede deshacer. ¿Querés continuar?
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={() => setConfirming(false)}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Cancelar
            </Button>
            <Button onClick={handleDelete} variant="danger" size="sm" loading={loading} disabled={loading}>
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
