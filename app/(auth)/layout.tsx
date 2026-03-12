interface Props {
  children: React.ReactNode
}
export default function AuthLayout({ children }: Props) {
  return (
    <section className='h-screen flex items-center justify-center'>
      {children}
    </section>
  )
}