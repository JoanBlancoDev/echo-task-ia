import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="w-full">
        <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center mx-auto">
          <h1 className="text-2xl font-bold"><span className="text-indigo-600">E</span>cho <span className="text-indigo-600">T</span>ask <span className="text-indigo-600">AI</span></h1>
          <div className="gap-12 items-center hidden md:flex">
            <Link className="px-4 py-2 rounded-md outline-2 outline-zinc-900 font-semibold text-zinc-700 lg:hover:opacity-80 transition-opacity ease-in-out cursor-pointer" href={'/login'}>Login</Link>
            <Link className="px-4 py-2 rounded-md bg-indigo-600 font-semibold text-zinc-100" href={'/signup'}>Signup</Link>
          </div>
        </nav>
      </header>
      <section className="w-full flex-1 flex justify-center items-center ">
        <article className="flex justify-between items-center w-full max-w-7xl mx-auto p-8 ">

          <div className="flex flex-2 flex-col gap-8">
            <p className="text-4xl  text-zinc-400">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quidem natus distinctio iure sint obcaecati consectetur maiores, eaque quos eos! Alias recusandae reprehenderit temporibus corporis nemo dicta voluptatum veniam ipsa assumenda!</p>
            <Link className="inline px-6 py-3 rounded-md font-semibold text-zinc-100 bg-indigo-600   text-center max-w-62.5" href={'/signup'}>Get Started</Link>
          </div>
          <div className="flex flex-1 justify-center items-center p-8">
            <Image src="/placeholder.svg" alt="Echo Task AI" width={400} height={300} />
          </div>
        </article>
      </section>

      <footer>
        <div className="w-full max-w-7xl mx-auto px-8 py-6">
          <p className="text-center text-gray-500">© 2026 Echo Task AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
