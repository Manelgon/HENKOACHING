import IdleTimeout from '@/shared/components/IdleTimeout'

export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleTimeout />
      {children}
    </>
  )
}
