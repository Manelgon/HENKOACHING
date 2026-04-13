import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-henko-white flex">
      {/* Panel izquierdo — logo + frase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-henko-turquoise/15 to-henko-purple/15 relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-henko-turquoise/5 via-white/50 to-henko-purple/10" />
        <span className="font-hey-gotcha text-[200px] text-henko-turquoise/5 absolute -bottom-10 -left-10 select-none">Henko</span>

        <div className="relative z-10 text-center">
          <Link href="/">
            <Image
              src="/henkologo.png"
              alt="Henkoaching"
              width={320}
              height={200}
              className="mx-auto mb-10 drop-shadow-sm"
            />
          </Link>
          <p className="font-raleway text-gray-500 text-lg font-light max-w-sm mx-auto">
            Porque cuando hay orden, todo funciona mejor.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image src="/henkologo.png" alt="Henkoaching" width={180} height={100} className="mx-auto" />
          </Link>
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
