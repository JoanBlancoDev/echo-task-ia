"use client"

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '../ui/button'
import { Github } from 'lucide-react'
interface Props {
  isPending: boolean
}
export const GithubOAuthButton = ({ isPending }: Props) => {
  const handleGithubLogin = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  return (
    <Button onClick={handleGithubLogin} variant={'outline'} className="flex justify-center items-center w-full" disabled={isPending}>
      <Github />
      Iniciar con Github</Button>
  )
}
