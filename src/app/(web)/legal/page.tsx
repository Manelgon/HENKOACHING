import Link from 'next/link'

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link href="/" className="inline-flex items-center text-henko-greenblue hover:text-henko-greenblue/80 text-sm font-raleway font-semibold mb-6 transition-colors">
            ← Volver
          </Link>
          <h1 className="font-raleway text-4xl md:text-5xl font-bold text-gray-900 mb-4">Legal</h1>
          <p className="text-gray-600 font-raleway text-lg">Información legal, privacidad y políticas de Henkoaching</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-20">
        {/* Navigation */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'aviso-legal', label: 'Aviso Legal' },
            { id: 'privacidad', label: 'Política de Privacidad' },
            { id: 'cookies', label: 'Política de Cookies' },
            { id: 'accesibilidad', label: 'Declaración de Accesibilidad' },
          ].map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-3 rounded-lg border border-gray-200 hover:border-henko-greenblue hover:bg-henko-greenblue/5 text-gray-700 hover:text-henko-greenblue font-raleway text-sm font-semibold transition-all duration-300 text-center"
            >
              {section.label}
            </a>
          ))}
        </div>

        {/* Aviso Legal */}
        <section id="aviso-legal" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Aviso Legal
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              <strong>Titular del sitio web:</strong> Jennifer Cervera
            </p>
            <p>
              <strong>Domicilio:</strong> Mallorca, España
            </p>
            <p>
              Este sitio web es operado por Henkoaching y sus contenidos están protegidos por las leyes de propiedad intelectual aplicables.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Uso del sitio</h3>
            <p>
              El usuario se compromete a utilizar este sitio web de manera legal y respetando los derechos de terceros. Queda prohibido:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Reproducir, distribuir o transmitir contenidos sin autorización</li>
              <li>Realizar actividades ilícitas o que violen derechos de terceros</li>
              <li>Interferir con el funcionamiento normal del sitio web</li>
              <li>Acceder a información no pública o restringida</li>
              <li>Realizar ataques de seguridad o hackeo</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Limitación de responsabilidad</h3>
            <p>
              Henkoaching no se responsabiliza por:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Interrupciones o fallos en el servicio</li>
              <li>Errores u omisiones en los contenidos</li>
              <li>Daños directos o indirectos derivados del uso de este sitio</li>
              <li>Contenidos de terceros enlazados desde nuestro sitio</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Modificaciones</h3>
            <p>
              Henkoaching se reserva el derecho de modificar este aviso legal en cualquier momento sin previo aviso. Te recomendamos revisar esta página regularmente.
            </p>
          </div>
        </section>

        {/* Política de Privacidad */}
        <section id="privacidad" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Política de Privacidad
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Responsable de datos</h3>
            <p>
              Jennifer Cervera es el responsable del tratamiento de datos personales recabados a través de este sitio web, de conformidad con el Reglamento General de Protección de Datos (RGPD).
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Datos que recabamos</h3>
            <p>Recopilamos datos personales cuando:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Completas un formulario de contacto o suscripción</li>
              <li>Navegas por el sitio web (datos de navegación)</li>
              <li>Te registras para acceder a servicios</li>
              <li>Participas en programas o eventos</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Finalidad del tratamiento</h3>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Responder a tus consultas y mensajes</li>
              <li>Prestar servicios de coaching</li>
              <li>Enviar información sobre servicios (si consientes)</li>
              <li>Mejorar la experiencia del sitio web</li>
              <li>Cumplir obligaciones legales</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Base legal</h3>
            <p>
              El tratamiento de tus datos se basa en: el consentimiento que otorgas, el cumplimiento de obligaciones legales, o la ejecución de un contrato.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Derechos del usuario</h3>
            <p>Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos o incompletos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al tratamiento de tus datos</li>
              <li>Solicitar la portabilidad de tus datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>
            <p className="mt-4">
              Para ejercer estos derechos, puedes contactar con nosotros a través del formulario de contacto en el sitio web o enviando un correo a manelgon92@gmail.com.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Retención de datos</h3>
            <p>
              Conservaremos tus datos personales durante el tiempo necesario para cumplir la finalidad para la que se han recabado, o mientras sea requerido por ley.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Seguridad</h3>
            <p>
              Hemos implementado medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, alteración, pérdida o divulgación.
            </p>
          </div>
        </section>

        {/* Política de Cookies */}
        <section id="cookies" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Política de Cookies
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              Este sitio web utiliza cookies para mejorar la experiencia del usuario y proporcionar funcionalidades necesarias.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">¿Qué son las cookies?</h3>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar información sobre ti y mejorar tu experiencia de navegación.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Tipos de cookies que utilizamos</h3>
            <p><strong>Cookies técnicas/funcionales:</strong> Necesarias para el funcionamiento del sitio (autenticación, preferencias).</p>
            <p><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo los usuarios interactúan con el sitio para mejorar el contenido y la experiencia.</p>
            <p><strong>Cookies de marketing:</strong> Utilizadas para personalizar el contenido y mostrar anuncios relevantes (solo con consentimiento).</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Tu control sobre cookies</h3>
            <p>
              Puedes controlar y eliminar cookies a través de la configuración de tu navegador. La mayoría de navegadores te permiten:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Ver qué cookies están almacenadas</li>
              <li>Eliminar cookies almacenadas</li>
              <li>Bloquear cookies futuras</li>
              <li>Configurar restricciones por sitio web</li>
            </ul>
            <p className="mt-4">
              Tenga en cuenta que desactivar cookies puede afectar la funcionalidad de este sitio web.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Consentimiento</h3>
            <p>
              Al continuar navegando en este sitio, consientes el uso de cookies conforme a esta política. Puedes cambiar tu consentimiento en cualquier momento ajustando tus preferencias.
            </p>
          </div>
        </section>

        {/* Declaración de Accesibilidad */}
        <section id="accesibilidad" className="mb-16 scroll-mt-20">
          <h2 className="font-raleway text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-henko-greenblue">
            Declaración de Accesibilidad
          </h2>
          <div className="space-y-4 text-gray-700 font-raleway">
            <p>
              Henkoaching se compromete a garantizar la accesibilidad digital para todas las personas, incluidas aquellas con discapacidades.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Estándares de accesibilidad</h3>
            <p>
              Nuestro sitio web ha sido diseñado y desarrollado siguiendo las pautas de Accesibilidad al Contenido Web (WCAG) 2.1 nivel AA del W3C.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Características de accesibilidad</h3>
            <p>El sitio incluye:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Navegación por teclado</li>
              <li>Contraste de colores adecuado</li>
              <li>Textos alternativos en imágenes</li>
              <li>Estructura semántica del HTML</li>
              <li>Información de formularios claramente etiquetada</li>
              <li>Compatibilidad con lectores de pantalla</li>
              <li>Tamaño de fuente escalable</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Problemas de accesibilidad</h3>
            <p>
              Si encuentras problemas de accesibilidad mientras navegas este sitio web, por favor contacta con nosotros. Nos esforzaremos por resolver el problema lo antes posible.
            </p>
            <p>
              Puedes reportar problemas de accesibilidad a través del <Link href="/contacto" className="text-henko-greenblue hover:text-henko-greenblue/80 font-semibold transition-colors">formulario de contacto</Link> o enviando un correo a manelgon92@gmail.com.
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Mejoras continuas</h3>
            <p>
              Continuamente evaluamos y mejoramos la accesibilidad de nuestro sitio web. Realizamos pruebas regulares y buscamos feedback de usuarios para garantizar una experiencia inclusiva.
            </p>
          </div>
        </section>

        {/* Back to top */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link
            href="#aviso-legal"
            className="inline-flex items-center justify-center border border-gray-300 hover:border-henko-greenblue bg-white hover:bg-henko-greenblue/5 rounded-full text-gray-900 hover:text-henko-greenblue text-xs font-bold tracking-widest uppercase px-6 py-3 transition-all duration-300"
          >
            ↑ Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
