import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignupPage() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
      <SignUpForm />
    </section>
  );
}
