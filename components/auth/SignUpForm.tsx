"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupAction } from "@/actions/auth/signup-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GithubOAuthButton } from "./GithubOAuthButton";
import { Label } from "../ui/label";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
  emailSchema,
  passwordSchema,
} from "@/lib/auth/password-policy";

const schema = z
  .object({
    email: emailSchema(),
    password: passwordSchema(),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type FormValues = z.infer<typeof schema>;


export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const emailField = register("email");
  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");

  const onSubmit = (data: FormValues) => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await signupAction({ error: null }, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccessMessage("Te enviamos un correo de verificación.");
      reset();
    });
  };


  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            {...emailField}
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            onFocus={() => {
              setError(null);
              setSuccessMessage(null);
            }}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            {...passwordField}
            id="password"
            type="password"
            placeholder="******"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-invalid={!!errors.password}
            onFocus={() => {
              setError(null);
              setSuccessMessage(null);
              setShowPasswordInfo(true);
            }}
            onBlur={(e) => {
              passwordField.onBlur(e);
              setShowPasswordInfo(false);
            }}
            onChange={(e) => {
              passwordField.onChange(e);
              setShowPasswordInfo(true);
            }}
          />
          {showPasswordInfo && (
            <div className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded p-2 mt-1">
              <p>La contraseña debe tener:</p>
              <ul className="list-disc ml-5">
                {PASSWORD_REQUIREMENTS.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="confirmPassword">Confirma tu contraseña</Label>
          <Input
            {...confirmPasswordField}
            id="confirmPassword"
            type="password"
            placeholder="confirma contraseña"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-invalid={!!errors.confirmPassword}
            onFocus={() => {
              setError(null);
              setSuccessMessage(null);
            }}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMessage && <p className="text-sm text-zinc-500">{successMessage}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="block text-center my-4">Ó</p>
      <GithubOAuthButton isPending={isPending} />
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
