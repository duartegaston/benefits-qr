import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (session?.userType === "LOCAL") redirect("/dashboard");

  const { status, error } = await searchParams;

  const initialError =
    error === "invalid"
      ? "No pudimos completar el ingreso con Google. Probá de nuevo o usá tu email."
      : undefined;

  return (
    <LoginForm
      initialPending={status === "pending"}
      initialError={initialError}
    />
  );
}
