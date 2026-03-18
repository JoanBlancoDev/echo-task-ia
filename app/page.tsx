import { ModeToggle } from "@/components/dark-mode/ModeToggle";
import { AppSideBar, SideBarItem } from "@/components/ui/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getSupabaseAccessTokenFromCookies } from "@/lib/auth/cookie";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
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

              <h1 className="text-3xl font-bold"><span className="text-indigo-600">E</span>cho <span className="text-indigo-600">T</span>ask <span className="text-indigo-600">AI</span></h1>
            </div>



            {
              !accessToken ? (
                <>
                  <div className="gap-12 items-center hidden md:flex flex-1 justify-end">
                    <ModeToggle />
                    <Link className="px-4 py-2 rounded-md outline-2 outline-zinc-900 dark:outline-zinc-300 font-semibold text-zinc-700 dark:text-zinc-100 lg:hover:opacity-80 transition-opacity ease-in-out cursor-pointer" href={'/login'}>Login</Link>
                    <Link className="px-4 py-2 rounded-md bg-indigo-600 font-semibold text-zinc-100" href={'/signup'}>Signup</Link>
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
        <section className="w-full flex-1 flex justify-center items-center">
          <article className="flex justify-between items-center w-full max-w-7xl mx-auto p-8 gap-16">

            <div className="flex flex-1 flex-col gap-8">
              <p className="text-4xl text-zinc-400 text-center lg:text-left">
                Graba tu voz, obtén un ticket técnico listo. EchoTask AI convierte tus ideas en tareas claras y accionables usando IA.
              </p>
              <Link className="inline px-6 py-3 rounded-md font-semibold text-zinc-100 bg-indigo-600   text-center w-full max-w-80 mx-auto lg:mx-0" href={'/signup'}>Get Started</Link>
            </div>
            <div className="hidden lg:flex flex-1 justify-end items-center">
              <Image
                className="animate-bounce-vertical"
                src="/assets/echo-task-ai.svg"
                alt="Echo Task AI"
                width={500}
                height={500}
              />
            </div>
          </article>
        </section>

        <footer>
          <div className="w-full max-w-7xl mx-auto px-8 py-6">
            <p className="text-center text-gray-500">© 2026 Echo Task AI. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main >
    </>

  );
}
