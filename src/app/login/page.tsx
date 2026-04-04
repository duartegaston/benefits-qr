import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSessionFromCookies();
  if (session?.userType === "LOCAL") redirect("/dashboard");

  return <LoginForm />;
}
