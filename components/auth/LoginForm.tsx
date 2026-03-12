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

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    <div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("email")}
          type="email"
          placeholder="tu@email.com"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}

        <Input
          {...register("password")}
          type="password"
          placeholder="******"
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}

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
