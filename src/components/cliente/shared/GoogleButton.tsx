import GoogleButtonBase from "@/components/ui/GoogleButton";

interface GoogleButtonProps {
  beneficioId?: string;
  redirect?: string;
  label?: string;
  className?: string;
}

function buildHref(beneficioId?: string, redirect?: string): string {
  const params = new URLSearchParams();
  if (beneficioId) params.set("beneficioId", beneficioId);
  if (redirect) params.set("redirect", redirect);
  const query = params.toString();
  return `/api/auth/cliente/google${query ? `?${query}` : ""}`;
}

export default function GoogleButton({
  beneficioId,
  redirect,
  label,
  className,
}: GoogleButtonProps) {
  return (
    <GoogleButtonBase
      href={buildHref(beneficioId, redirect)}
      label={label}
      className={className}
    />
  );
}
