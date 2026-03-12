"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/actions/auth/signup-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GithubOAuthButton } from "./GithubOAuthButton";

const initialState = { error: null };


export function SignUpForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const { pending } = useFormStatus();



  return (
    <div>

      <form action={formAction} className="space-y-4">
        <Input name="email" type="email" placeholder="tu@email.com" required />
        <Input name="password" type="password" placeholder="******" required />
        <Input name="confirmPassword" type="password" placeholder="confirma contraseña" required />

        {state.error ? (
          <p className="text-sm text-red-500">{state.error}</p>
        ) : (
          <p className="text-sm text-zinc-500">Te enviaremos un correo de verificación.</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="block text-center my-4">Ó</p>
      <GithubOAuthButton isPending={pending} />
      <p className="mt-8 text-center">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-400 transition-colors ease-in-out font-bold">
          Inicia sesión aquí
        </Link>
      </p>
      <Link href="/" className="text-zinc-100 transition-all ease-in-out font-bold mt-4 text-center  px-4 py-2 border rounded-md bg-indigo-600  hover:bg-indigo-700 flex justify-center items-center gap-1">
        < ChevronLeft />
        Ir al home
      </Link>
    </div>
  );
}
