import GoogleButtonBase from "@/components/ui/GoogleButton";

interface GoogleButtonProps {
  beneficioId?: string;
  redirect?: string;
  flow?: string;
  label?: string;
  className?: string;
}

function buildHref(beneficioId?: string, redirect?: string, flow?: string): string {
  const params = new URLSearchParams();
  if (beneficioId) params.set("beneficioId", beneficioId);
  if (redirect) params.set("redirect", redirect);
  if (flow) params.set("flow", flow);
  const query = params.toString();
  return `/api/auth/cliente/google${query ? `?${query}` : ""}`;
}

export default function GoogleButton({
  beneficioId,
  redirect,
  flow,
  label,
  className,
}: GoogleButtonProps) {
  return (
    <GoogleButtonBase
      href={buildHref(beneficioId, redirect, flow)}
      label={label}
      className={className}
    />
  );
}
