
interface VerifyPageProps {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
  }>;
};

export default async function AuthVerifyPage({ searchParams }: VerifyPageProps) {
  const { code, error, error_description } = await searchParams;
  console.log({ code, error, error_description })
  if (error) {
    return <p>Verificación fallida: {error_description ?? error}</p>;
  }
  return (
    <h1>Verify Email {code}</h1>
  )
}