"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function WelcomeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
    router.replace("/mis-beneficios");
  }

  return (
    <Modal open={open} onClose={handleClose} title="¡Bienvenido a Qupon!">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <PartyPopper className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-text-muted">
            En esta sección vas a encontrar todos los cupones que reclames y
            canjees. ¡Mostrales el QR al local cuando quieras usarlos!
          </p>
        </div>

        <Button type="button" className="w-full" onClick={handleClose}>
          Ver mis cupones
        </Button>
      </div>
    </Modal>
  );
}
