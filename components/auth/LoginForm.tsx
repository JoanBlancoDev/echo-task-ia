"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth/login-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GithubOAuthButton } from "./GithubOAuthButton";
import { Label } from "../ui/label";
import {
  emailSchema,
} from "@/lib/auth/password-policy";

const schema = z.object({
  email: emailSchema(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emailField = register("email");
  const passwordField = register("password");

  const onSubmit = (data: FormValues) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      const result = await loginAction({ error: null }, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            {...emailField}
            type="email"
            placeholder="tu@email.com"
            id="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="w-full"
            onFocus={() => setError(null)}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            {...passwordField}
            type="password"
            placeholder="******"
            id="password"
            autoComplete="current-password"
            required
            aria-invalid={!!errors.password}
            className="w-full"
            onFocus={() => setError(null)}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
      <p className="block text-center my-4">Ó</p>
      <GithubOAuthButton isPending={isPending} />

      <p className="mt-8 text-center">
        No tienes cuenta?{" "}
        <Link href="/signup" className="text-indigo-600 hover:text-indigo-400 transition-colors ease-in-out font-bold">
          Regístrate aquí
        </Link>
      </p>
      <Link href="/" className="text-zinc-100 transition-all ease-in-out font-bold mt-4 text-center  px-4 py-2 border rounded-md bg-indigo-600  hover:bg-indigo-700 flex justify-center items-center gap-1">
        < ChevronLeft />
        Ir al home
      </Link>
    </div>
  );
}
