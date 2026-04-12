import { ModeToggle } from "@/components/dark-mode/ModeToggle";
import { AppSideBar, SideBarItem } from "@/components/ui/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getSupabaseAccessTokenFromCookies } from "@/lib/auth/cookie";
import { cookies } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Mic, Zap, Github } from "lucide-react";
const sidebarItems: SideBarItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
  { label: 'Signup', href: '/signup' },
]
const sidebarItemsAuthenticated: SideBarItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
]


export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = getSupabaseAccessTokenFromCookies(cookieStore.getAll());
  return (

    <>
      <AppSideBar items={accessToken ? sidebarItemsAuthenticated : sidebarItems} mobileOnly />
      <main className="flex min-h-screen flex-col">
        <header className="w-full">
          <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center mx-auto flex-wrap gap-4">
            <div className="flex-1">

              <h1 className="text-4xl font-bold"><span className="text-indigo-600">E</span>cho <span className="text-indigo-600">T</span>ask <span className="text-indigo-600">AI</span></h1>
            </div>



            {
              !accessToken ? (
                <>
                  <div className="gap-12 items-center hidden md:flex flex-1 justify-end">
                    <ModeToggle />
                    <Link className="px-4 py-2 rounded-md outline-2 outline-zinc-900 dark:outline-zinc-300 font-semibold text-zinc-700 dark:text-zinc-100 lg:hover:opacity-80 transition-opacity ease-in-out cursor-pointer" href={'/login'}>Ingresar</Link>
                    <Link className="px-4 py-2 rounded-md bg-indigo-600 font-semibold text-zinc-100" href={'/signup'}>Registrarse</Link>
                  </div>

                  <div className="flex justify-end items-center gap-12 md:hidden flex-1 ">
                    <ModeToggle />
                    <SidebarTrigger className="flex md:hidden" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex md:hidden items-center justify-end gap-12 flex-1">
                    <ModeToggle />
                    <SidebarTrigger className="flex md:hidden" />
                  </div>
                  <div className="hidden md:flex gap-12 items-center flex-1 justify-end">
                    <ModeToggle />
                    <Link className="px-4 py-2 rounded-md outline-2 outline-zinc-900 dark:outline-zinc-300 font-semibold text-zinc-700 dark:text-zinc-100 lg:hover:opacity-80 transition-opacity ease-in-out cursor-pointer" href={'/dashboard'}>Dashboard</Link>
                  </div>
                </>
              )
            }

          </nav>
        </header>
        {/* HERO SECTION */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-8 flex flex-col lg:flex-row items-center gap-12 max-w-7xl">

            <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left gap-6">
              <Badge variant="secondary" className="px-3 py-1 text-indigo-600 dark:text-indigo-400">
                Propulsado por IA ⚡
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
                De voz a <span className="text-indigo-600">Ticket</span> <br />
                en segundos.
              </h1>

              <p className="text-xl text-muted-foreground max-w-150">
                Deja de escribir reportes de bugs manualmente. Graba tu voz y deja que nuestra IA genere tickets técnicos estructurados listos para GitHub y Jira.
              </p>

              <div>
                <Link className="px-4 py-2 rounded-md bg-indigo-600 text-zinc-100" href={accessToken ? "/dashboard" : "/signup"}>
                  Empieza Gratis
                </Link>
              </div>

            </div>

            {/* PRODUCT MOCKUP (Esto le da el look de SaaS) */}
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-card border rounded-xl shadow-2xl overflow-hidden">
                {/* Aquí puedes simular una tarjeta de tu dashboard */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div className="h-2 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-[80%] bg-muted rounded" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="destructive">P0 - Urgente</Badge>
                    <Badge variant="outline">Bug</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (Añade esto para dar profundidad) */}
        <section className="w-full py-20 bg-zinc-50 dark:bg-zinc-950">
          <div className="container mx-auto px-8 max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-16 text-zinc-800 dark:text-zinc-200">
              Diseñado para el flujo de trabajo moderno
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Mic className="text-indigo-600" />}
                title="Captura Multimodal"
                description="Graba audios desde cualquier dispositivo. Gemini procesa el contexto técnico con precisión quirúrgica."
              />
              <FeatureCard
                icon={<Github className="text-indigo-600" />}
                title="Sincronización Nativa"
                description="Conecta tus repositorios y exporta tus tickets directamente a GitHub Issues o Jira."
              />
              <FeatureCard
                icon={<Zap className="text-indigo-600" />}
                title="Priorización Inteligente"
                description="Nuestra IA clasifica la urgencia y categoría basándose en tu tono y descripción."
              />
            </div>
          </div>
        </section>

        {/* FOOTER (Actualizado) */}
        {/* ... */}
      </main>
    </>
  );
}

// Componente auxiliar para las features
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-background border rounded-2xl hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}