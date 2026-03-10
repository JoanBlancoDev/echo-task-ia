"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/actions/auth/signup-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="email" type="email" placeholder="tu@email.com" required />
      <Input name="password" type="password" placeholder="******" required />
      <Input name="confirmPassword" type="password" placeholder="confirma contraseña" required />

      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : (
        <p className="text-sm text-zinc-500">Te enviaremos un correo de verificación.</p>
      )}

      <SubmitButton />
    </form>
  );
}
