import Link from "next/link"

interface VerifyPageProps {
  searchParams: Promise<{
    code?: string
    error?: string
    error_description?: string
  }>
}

export default async function AuthVerifyPage({ searchParams }: VerifyPageProps) {
  const { error, error_description } = await searchParams

  if (error) {
    return (
      <section className="mx-auto w-full max-w-md space-y-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-red-500">Verificación fallida</h1>
        <p className="text-sm text-muted-foreground">
          {error_description ?? "El enlace de verificación expiró o es inválido."}
        </p>
        <Link
          href="/signup"
          className="inline-block mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Volver al registro
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-md space-y-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">¡Email verificado!</h1>
      <p className="text-sm text-muted-foreground">
        Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión.
      </p>
      <Link
        href="/login"
        className="inline-block mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
      >
        Iniciar sesión
      </Link>
    </section>
  )
}