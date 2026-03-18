"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/auth/password-policy";
import { checkRateLimit, getRateLimitErrorMessage, getRequestIp } from "@/lib/rate-limit";

export type AuthActionState = {
  error: string | null;
};

const loginSchema = z.object({
  email: emailSchema(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Server Action para login
export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const requestIp = await getRequestIp();
  const loginRateLimit = await checkRateLimit({
    bucket: "auth-login",
    limit: 10,
    window: "10 m",
    identifier: `${parsed.data.email.toLowerCase()}:${requestIp}`,
  });

  if (!loginRateLimit.success) {
    return { error: getRateLimitErrorMessage(loginRateLimit.reset) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
