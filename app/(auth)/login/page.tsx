import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Inicia sesión</h1>
      <LoginForm />
    </section>
  );
}
