import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-henko-paper text-henko-ink min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
