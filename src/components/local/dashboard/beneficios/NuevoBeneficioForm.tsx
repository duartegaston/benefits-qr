import BeneficioForm from "@/components/local/dashboard/beneficios/BeneficioForm";

export default function NuevoBeneficioForm() {
  return (
    <BeneficioForm
      mode="create"
      submitConfig={{
        endpoint: "/api/beneficios",
        method: "POST",
        submitLabel: "Crear cupón",
        cancelHref: "/dashboard",
        successRedirect: "/dashboard",
      }}
    />
  );
}
