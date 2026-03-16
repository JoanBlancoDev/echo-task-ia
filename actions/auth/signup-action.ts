"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/actions/auth/login-action";
import { PASSWORD_MIN_LENGTH, emailSchema, passwordSchema } from "@/lib/auth/password-policy";

const signupSchema = z
  .object({
    email: emailSchema(),
    password: passwordSchema(),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

// Server Action para registro
export async function signupAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
