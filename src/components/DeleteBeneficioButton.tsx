"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";

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
      <AlertDialog open={confirming} onOpenChange={(nextOpen) => !loading && setConfirming(nextOpen)}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => setConfirming(true)} variant="danger" size="sm">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Eliminar cupón</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cupón</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el cupón y no se puede deshacer. ¿Querés continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button disabled={loading} variant="secondary" size="sm">
                Cancelar
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleDelete} variant="danger" size="sm" loading={loading} disabled={loading}>
                Sí, eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
